'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'loading' | 'scanning' | 'found' | 'done' | 'no-match' | 'error'

interface Props {
  personaId: string
  personaName: string
  onSuccess: () => void
  onClose: () => void
}

const MODEL_URLS = [
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights',
  'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js/weights',
]
const MATCH_THRESHOLD = 0.55 // euclidean distance — lower = stricter
const ENROLL_FRAMES  = 15   // frames held before capturing (~4.5s @ 300ms)

function storageKey(id: string) { return `ss-face-${id}` }

function loadFaceAPI(): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).faceapi) { resolve(); return }
    const existing = document.querySelector('script[data-faceapi]')
    if (existing) { existing.addEventListener('load', () => resolve()); return }
    const s = document.createElement('script')
    s.setAttribute('data-faceapi', '1')
    s.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
    s.onload  = () => resolve()
    s.onerror = () => reject(new Error('Could not load face-api.js from CDN'))
    document.head.appendChild(s)
  })
}

async function loadModelsWithFallback(fa: {
  loadTinyFaceDetectorModel: (url: string) => Promise<void>
  loadFaceLandmarkModel: (url: string) => Promise<void>
  loadFaceRecognitionModel: (url: string) => Promise<void>
}) {
  let lastError: unknown = null
  for (const url of MODEL_URLS) {
    try {
      await Promise.all([
        fa.loadTinyFaceDetectorModel(url),
        fa.loadFaceLandmarkModel(url),
        fa.loadFaceRecognitionModel(url),
      ])
      return
    } catch (error) {
      lastError = error
    }
  }

  const message = lastError instanceof Error ? lastError.message : 'Unknown model load error'
  throw new Error(`Could not load face models from fallback URLs. ${message}`)
}

export default function FaceCam({ personaId, personaName, onSuccess, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const loopRef   = useRef<ReturnType<typeof setInterval> | null>(null)
  const framesRef = useRef(0)
  const doneRef   = useRef(false)

  // Stable refs for callbacks (avoid stale closure in useEffect)
  const onSuccessRef = useRef(onSuccess)
  const onCloseRef   = useRef(onClose)
  useEffect(() => { onSuccessRef.current = onSuccess }, [onSuccess])
  useEffect(() => { onCloseRef.current   = onClose   }, [onClose])

  const [status,     setStatus]     = useState<Status>('loading')
  const [message,    setMessage]    = useState('Loading face detection models…')
  const [progress,   setProgress]   = useState(0)
  const [enrollMode, setEnrollMode] = useState(false)

  function stopAll() {
    if (loopRef.current)  { clearInterval(loopRef.current); loopRef.current = null }
    if (streamRef.current){ streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null }
  }

  useEffect(() => {
    let alive = true
    const key = storageKey(personaId)

    async function boot() {
      try {
        // 1. Load face-api.js from CDN
        await loadFaceAPI()
        if (!alive) return

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fa = (window as any).faceapi

        // 2. Load models (tiny_face_detector + landmarks + recognition)
        setMessage('Loading models — first run takes ~5 seconds…')
        await loadModelsWithFallback(fa)
        if (!alive) return

        // 3. Determine enroll vs login
        const isEnroll = !localStorage.getItem(key)
        setEnrollMode(isEnroll)

        // 4. Open webcam
        setMessage('Starting camera…')
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 320, height: 240 },
        })
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }

        setStatus('scanning')
        setMessage(isEnroll
          ? `Hold still to enroll your face for ${personaName}…`
          : `Looking for ${personaName}…`)

        // 5. Detection loop — runs every 300ms
        loopRef.current = setInterval(async () => {
          if (!alive || doneRef.current || !videoRef.current) return

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const fa2 = (window as any).faceapi
          try {
            const det = await fa2
              .detectSingleFace(videoRef.current,
                new fa2.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
              .withFaceLandmarks()
              .withFaceDescriptor()

            if (!det) {
              framesRef.current = 0
              setProgress(0)
              setStatus('scanning')
              setMessage(isEnroll ? 'Position your face in the frame…' : 'No face found — look at the camera…')
              return
            }

            // ── ENROLL MODE ──────────────────────────────────────────────
            if (isEnroll) {
              framesRef.current++
              const pct = Math.min(100, (framesRef.current / ENROLL_FRAMES) * 100)
              setProgress(pct)
              setStatus('found')
              const secsLeft = Math.max(0, Math.ceil(((ENROLL_FRAMES - framesRef.current) * 300) / 1000))
              setMessage(secsLeft > 0 ? `Hold still… ${secsLeft}s` : 'Capturing…')

              if (framesRef.current >= ENROLL_FRAMES) {
                doneRef.current = true
                clearInterval(loopRef.current!)
                loopRef.current = null
                localStorage.setItem(key, JSON.stringify(Array.from(det.descriptor)))
                setStatus('done')
                setProgress(100)
                setMessage(`Face enrolled for ${personaName} ✓`)
                setTimeout(() => { if (alive) { stopAll(); onSuccessRef.current() } }, 1400)
              }
              return
            }

            // ── LOGIN MODE ───────────────────────────────────────────────
            doneRef.current = true
            clearInterval(loopRef.current!)
            loopRef.current = null
            setStatus('found')
            setMessage('Comparing…')

            const stored = JSON.parse(localStorage.getItem(key)!)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dist = (window as any).faceapi.euclideanDistance(
              new Float32Array(stored), det.descriptor
            )

            if (dist < MATCH_THRESHOLD) {
              setStatus('done')
              setMessage(`Welcome back, ${personaName} ✓`)
              setTimeout(() => { if (alive) { stopAll(); onSuccessRef.current() } }, 1200)
            } else {
              setStatus('no-match')
              setMessage('Face not recognized. Use your password or try again.')
            }

          } catch {
            // transient detection error — skip this frame
          }
        }, 300)

      } catch (err) {
        if (!alive) return
        const msg = err instanceof Error ? err.message : String(err)
        setStatus('error')
        setMessage(
          msg.toLowerCase().includes('denied') || msg.toLowerCase().includes('permission')
            ? 'Camera access denied. Enable camera in browser settings and try again.'
            : `Error: ${msg}`
        )
      }
    }

    boot()
    return () => { alive = false; stopAll() }
  }, [personaId, personaName]) // stable — callbacks via refs

  // ── Colour per status ─────────────────────────────────────────────────────
  const col = {
    loading: '#666', scanning: '#666',
    found: '#f97316', done: '#4ade80',
    'no-match': '#ef4444', error: '#ef4444',
  }[status] ?? '#666'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{
        background: '#0d0d0d',
        border: `1px solid ${status === 'done' ? 'rgba(74,222,128,0.3)' : status === 'no-match' || status === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20, padding: 24,
        width: '100%', maxWidth: 360,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        transition: 'border-color 0.4s',
      }}>

        {/* Header */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>
              {enrollMode ? '📸' : '👁️'}
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: '#f0f0f0' }}>
              {enrollMode ? 'Enroll Face ID' : 'Face Login'}
            </span>
            {enrollMode && (
              <span style={{
                fontSize: 10, fontWeight: 600, color: '#f97316',
                background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)',
                borderRadius: 4, padding: '1px 6px',
              }}>First time</span>
            )}
          </div>
          <button
            onClick={() => { stopAll(); onCloseRef.current() }}
            style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: 22, lineHeight: 1, padding: '0 2px' }}
          >×</button>
        </div>

        {/* Camera frame */}
        <div style={{
          position: 'relative', width: 260, height: 195,
          borderRadius: 14, overflow: 'hidden',
          background: '#111',
          boxShadow: `0 0 0 1.5px ${col}`,
          transition: 'box-shadow 0.4s',
        }}>
          <video
            ref={videoRef}
            autoPlay muted playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
          />

          {/* Corner brackets */}
          {(['tl','tr','bl','br'] as const).map(pos => (
            <div key={pos} style={{
              position: 'absolute',
              top:    pos[0] === 't' ? 10 : 'auto',
              bottom: pos[0] === 'b' ? 10 : 'auto',
              left:   pos[1] === 'l' ? 10 : 'auto',
              right:  pos[1] === 'r' ? 10 : 'auto',
              width: 18, height: 18,
              borderStyle: 'solid', borderColor: col,
              borderTopWidth:    pos[0] === 't' ? 2.5 : 0,
              borderBottomWidth: pos[0] === 'b' ? 2.5 : 0,
              borderLeftWidth:   pos[1] === 'l' ? 2.5 : 0,
              borderRightWidth:  pos[1] === 'r' ? 2.5 : 0,
              borderRadius: 3,
              transition: 'border-color 0.4s',
            }} />
          ))}

          {/* Scanning sweep line */}
          {(status === 'scanning' || status === 'loading') && (
            <div style={{
              position: 'absolute', left: 12, right: 12, height: 1.5,
              background: `linear-gradient(90deg, transparent, ${col}88, ${col}, ${col}88, transparent)`,
              animation: 'facecam-scan 2.2s ease-in-out infinite',
              borderRadius: 1,
            }} />
          )}

          {/* Loading spinner overlay */}
          {status === 'loading' && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                border: '3px solid rgba(255,255,255,0.07)',
                borderTopColor: '#ef4444',
                animation: 'facecam-spin 0.8s linear infinite',
              }} />
            </div>
          )}

          {/* Result overlay */}
          {(status === 'done' || status === 'no-match') && (
            <div style={{
              position: 'absolute', inset: 0,
              background: status === 'done' ? 'rgba(74,222,128,0.12)' : 'rgba(239,68,68,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 52,
            }}>
              {status === 'done' ? '✓' : '✗'}
            </div>
          )}
        </div>

        {/* Enrollment progress bar */}
        {enrollMode && (status === 'found' || status === 'done') && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: status === 'done' ? '#4ade80' : '#f97316',
                width: `${progress}%`, transition: 'width 0.35s ease',
              }} />
            </div>
          </div>
        )}

        {/* Status message */}
        <p style={{
          fontSize: 13, color: col, textAlign: 'center',
          lineHeight: 1.6, margin: 0, transition: 'color 0.3s',
          minHeight: 20,
        }}>
          {message}
        </p>

        {/* No-match actions */}
        {status === 'no-match' && (
          <div style={{ display: 'flex', gap: 8, width: '100%' }}>
            <button
              onClick={() => { stopAll(); onCloseRef.current() }}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                color: '#888', fontSize: 13,
              }}
            >Use Password</button>
            <button
              onClick={() => window.location.reload()}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 9, cursor: 'pointer',
                background: '#dc2626', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600,
              }}
            >Try Again</button>
          </div>
        )}

        {/* Error dismiss */}
        {status === 'error' && (
          <button
            onClick={() => { stopAll(); onCloseRef.current() }}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 9, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#888', fontSize: 13,
            }}
          >Close</button>
        )}

        {/* Reset enrollment link (login mode only) */}
        {!enrollMode && status !== 'done' && (
          <button
            onClick={() => {
              localStorage.removeItem(storageKey(personaId))
              stopAll()
              onCloseRef.current()
            }}
            style={{ background: 'none', border: 'none', color: '#333', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}
          >Reset face enrollment</button>
        )}

      </div>

      <style>{`
        @keyframes facecam-scan {
          0%   { top: 10px; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: calc(100% - 12px); opacity: 0; }
        }
        @keyframes facecam-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
