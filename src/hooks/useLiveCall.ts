'use client'

import { useState, useRef, useCallback } from 'react'

export interface LiveAlert {
  id: number
  timestamp: number
  snippet: string
  riskLevel: string
  reason: string
}

interface LiveCallState {
  isListening: boolean
  transcript: string
  interimTranscript: string
  alerts: LiveAlert[]
  error: string | null
}

// Played client-side — no network request needed
function playAlert(riskLevel: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = riskLevel === 'critical' ? 880 : 520
    osc.type = riskLevel === 'critical' ? 'square' : 'sine'
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.6)
  } catch { /* AudioContext unavailable in some environments */ }
}

export function useLiveCall(
  personaId: string,
  speechLang: string = 'en-US',
  userId?: string,
  ipAddress?: string,
) {
  const timezone = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined
  const [state, setState] = useState<LiveCallState>({
    isListening: false,
    transcript: '',
    interimTranscript: '',
    alerts: [],
    error: null,
  })

  // Refs hold the always-current values so the setInterval callback
  // never captures a stale closure over state.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef     = useRef<any>(null)
  const intervalRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const restartTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const shouldContinueRef  = useRef(false)
  const finalTextRef       = useRef('')   // accumulated final transcript
  const interimTextRef     = useRef('')   // latest interim chunk
  const lastAnalyzedLen    = useRef(0)
  const alertCounterRef    = useRef(0)
  const isAnalyzingRef     = useRef(false) // prevent overlapping requests
  const pendingTextRef     = useRef('')
  const lastAlertSigRef    = useRef('')
  const lastAlertAtRef     = useRef(0)

  const analyzeChunk = useCallback(async (text: string) => {
    const cleaned = text.trim()
    if (!cleaned) return

    pendingTextRef.current = `${pendingTextRef.current} ${cleaned}`.trim()
    if (isAnalyzingRef.current) return

    while (pendingTextRef.current) {
      const batchText = pendingTextRef.current
      pendingTextRef.current = ''
      isAnalyzingRef.current = true
      try {
        const res = await fetch('/api/analyze-live', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: batchText, personaId }),
        })
        if (!res.ok) continue
        const result = await res.json()

        if (['medium', 'high', 'critical'].includes(result.riskLevel)) {
          const reason = result.reasons?.[0] ?? result.explanation ?? 'Suspicious content detected'
          const sig = `${result.riskLevel}:${reason}`
          const now = Date.now()
          const isDuplicate = sig === lastAlertSigRef.current && now - lastAlertAtRef.current < 4000

          if (!isDuplicate) {
            const snippet = batchText.slice(0, 90) + (batchText.length > 90 ? '…' : '')
            const alert: LiveAlert = {
              id: ++alertCounterRef.current,
              timestamp: now,
              snippet,
              riskLevel: result.riskLevel,
              reason,
            }
            setState(s => ({ ...s, alerts: [...s.alerts, alert] }))
            playAlert(result.riskLevel)
            lastAlertSigRef.current = sig
            lastAlertAtRef.current = now

            // Persist alert to DB (fire-and-forget)
            fetch('/api/live-alerts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId:    userId    ?? null,
                riskLevel: result.riskLevel,
                reason,
                snippet,
                ipAddress: ipAddress ?? null,
                timezone,
              }),
            }).catch(() => {})
          }
        }
      } catch {
        // non-fatal — live analysis failure should never break the UI
      } finally {
        isAnalyzingRef.current = false
      }
    }
  }, [personaId])

  const startCall = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setState(s => ({
        ...s,
        error: 'Speech recognition is not supported. Please use Chrome or Edge.',
      }))
      return
    }

    const rec = new SR()
    rec.continuous     = true
    rec.interimResults = true
    rec.lang           = speechLang
    recognitionRef.current = rec

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (event: any) => {
      let addedFinal = ''
      let interim    = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) addedFinal += t
        else interim += t
      }
      if (addedFinal) {
        const next = `${finalTextRef.current} ${addedFinal}`.trim()
        finalTextRef.current = next
        // Trigger immediately on sentence boundary — don't wait for the interval
        const newText = next.slice(lastAnalyzedLen.current).trim()
        if (newText.length > 6) {
          lastAnalyzedLen.current = next.length
          analyzeChunk(newText)
        }
      }
      interimTextRef.current = interim
      setState(s => ({
        ...s,
        transcript: finalTextRef.current,
        interimTranscript: interim,
      }))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onerror = (event: any) => {
      if (event.error === 'not-allowed') {
        shouldContinueRef.current = false
        setState(s => ({
          ...s,
          error: 'Microphone access denied. Enable it in browser settings and try again.',
        }))
      }
    }

    // Auto-restart on natural end (e.g. silence timeout) so monitoring stays live
    rec.onend = () => {
      if (recognitionRef.current === rec && shouldContinueRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            rec.start()
          } catch {
            // non-fatal: browser may still be transitioning states
          }
        }, 200)
      }
    }

    shouldContinueRef.current = true
    rec.start()

    // Fallback: catch any unanalyzed text every 3 s (e.g. long pauses with no final result)
    intervalRef.current = setInterval(() => {
      const full    = finalTextRef.current
      const newText = full.slice(lastAnalyzedLen.current).trim()
      if (newText.length > 6) {
        lastAnalyzedLen.current = full.length
        analyzeChunk(newText)
      }
    }, 3_000)

    setState(s => ({ ...s, isListening: true, error: null }))
  }, [analyzeChunk])

  const stopCall = useCallback(() => {
    shouldContinueRef.current = false
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current)
      restartTimeoutRef.current = null
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null  // prevent auto-restart
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    interimTextRef.current = ''
    pendingTextRef.current = ''
    setState(s => ({ ...s, isListening: false, interimTranscript: '' }))
  }, [])

  const resetCall = useCallback(() => {
    stopCall()
    finalTextRef.current  = ''
    interimTextRef.current = ''
    lastAnalyzedLen.current = 0
    alertCounterRef.current = 0
    setState({ isListening: false, transcript: '', interimTranscript: '', alerts: [], error: null })
  }, [stopCall])

  return { ...state, startCall, stopCall, resetCall }
}
