// Generates icon16.png, icon48.png, icon128.png — no dependencies, pure Node.js
// Run: node generate-icons.js
const zlib = require('zlib')
const fs   = require('fs')
const path = require('path')

// CRC32 table
const crcTable = (() => {
  const t = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[i] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xFF]
  return (c ^ 0xFFFFFFFF) >>> 0
}

function pngChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const lenBuf  = Buffer.allocUnsafe(4); lenBuf.writeUInt32BE(data.length)
  const crcBuf  = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])))
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf])
}

function makePNG(size, drawFn) {
  // IHDR
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // RGB
  ihdr[10] = ihdr[11] = ihdr[12] = 0

  // Raw pixels: each row = [filter byte 0] [R G B] * width
  const stride = 1 + size * 3
  const raw = Buffer.alloc(stride * size, 0)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0 // filter: None
    for (let x = 0; x < size; x++) {
      const [r, g, b] = drawFn(x, y, size)
      raw[y * stride + 1 + x * 3]     = r
      raw[y * stride + 1 + x * 3 + 1] = g
      raw[y * stride + 1 + x * 3 + 2] = b
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), // PNG signature
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// Draw a red shield shape: dark bg + red filled pentagon-ish shield
function drawShield(x, y, size) {
  const cx = size / 2, cy = size / 2
  const s = size

  // Normalize to [-1, 1]
  const nx = (x - cx) / (s * 0.5)
  const ny = (y - cy) / (s * 0.5)

  // Background: near-black
  const BG = [15, 15, 15]
  // Shield red fill
  const RED = [220, 38, 38]
  // Lighter red for inner glow
  const LIGHT = [239, 68, 68]

  // Shield path: top half = rounded top, bottom = point
  // Shield defined by: top from -0.75 to 0.75 wide, narrowing to point at bottom
  const shieldTop    = -0.85
  const shieldBottom = 0.95
  const shieldHalf   = 0.78 // half-width at top

  // Width at a given normalised y
  function halfWidthAt(yy) {
    if (yy < shieldTop) return 0
    if (yy > shieldBottom) return 0
    // narrows linearly from top to bottom point
    const t = (yy - shieldTop) / (shieldBottom - shieldTop) // 0 → 1
    return shieldHalf * (1 - t * t * 0.8) * (1 - Math.max(0, (t - 0.6) / 0.4) * 0.99)
  }

  const hw = halfWidthAt(ny)
  if (Math.abs(nx) < hw && ny > shieldTop && ny < shieldBottom) {
    // Inner glow centre
    const dist = Math.sqrt(nx * nx + ny * ny)
    const glow = Math.max(0, 1 - dist * 1.3)
    const r = Math.round(RED[0] + (LIGHT[0] - RED[0]) * glow * 0.5)
    const g = Math.round(RED[1] + (LIGHT[1] - RED[1]) * glow * 0.5)
    const b = Math.round(RED[2] + (LIGHT[2] - RED[2]) * glow * 0.5)
    return [r, g, b]
  }

  return BG
}

const outDir = path.join(__dirname, 'icons')
fs.mkdirSync(outDir, { recursive: true })

for (const size of [16, 48, 128]) {
  const buf = makePNG(size, drawShield)
  fs.writeFileSync(path.join(outDir, `icon${size}.png`), buf)
  console.log(`✓ icons/icon${size}.png`)
}

console.log('Done.')
