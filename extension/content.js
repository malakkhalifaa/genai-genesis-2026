// ── ScamShield content script ─────────────────────────────────────────────────
// Runs on every page. Highlights known-risky URL shorteners and suspicious patterns.
// Kept minimal to avoid impacting page performance.

const SUSPICIOUS_DOMAINS = ['bit.ly', 't.co', 'tinyurl.com', 'ow.ly', 'rb.gy', 'is.gd', 'shorturl.at']

const PHISHING_PATTERNS = [
  /verify.*account/i, /confirm.*identity/i, /suspended.*account/i,
  /unusual.*activity/i, /click.*here.*immediately/i,
]

function flagShortenedLinks() {
  const links = document.querySelectorAll('a[href]')
  links.forEach(link => {
    try {
      const url = new URL(link.href)
      if (SUSPICIOUS_DOMAINS.some(d => url.hostname.includes(d))) {
        link.style.outline = '2px dashed #dc2626'
        link.title = '⚠️ ScamShield: Shortened URL — verify before clicking'
      }
    } catch { /* ignore */ }
  })
}

// Only run on non-extension, non-internal pages
if (document.location.protocol === 'https:' || document.location.protocol === 'http:') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', flagShortenedLinks)
  } else {
    flagShortenedLinks()
  }
}
