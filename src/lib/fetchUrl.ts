/**
 * Server-side URL content fetcher for ScamShield URL analysis.
 * Fetches the page HTML and extracts readable text for LLM analysis.
 */

const TIMEOUT_MS = 8_000
const MAX_CHARS = 10_000

const BLOCKED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

function isSafeUrl(raw: string): boolean {
  try {
    const u = new URL(raw)
    if (!['http:', 'https:'].includes(u.protocol)) return false
    const host = u.hostname.toLowerCase()
    if (BLOCKED_HOSTS.some(b => host === b || host.endsWith('.' + b))) return false
    // Block private IP ranges
    if (/^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(host)) return false
    return true
  } catch {
    return false
  }
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|li|tr|td|th|section|article|header|footer)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim()
}

export interface FetchResult {
  text: string
  title: string | null
  finalUrl: string
  redirected: boolean
}

export async function fetchUrlContent(rawUrl: string): Promise<FetchResult | null> {
  if (!isSafeUrl(rawUrl)) return null

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(rawUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ScamShieldBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
        'Accept-Language': 'en',
      },
    })
    clearTimeout(timer)

    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      // Not a readable page — still return URL metadata for analysis
      return { text: '', title: null, finalUrl: res.url, redirected: res.redirected }
    }

    const html = await res.text()
    const text = htmlToText(html).slice(0, MAX_CHARS)

    // Extract <title>
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim().slice(0, 200) : null

    return { text, title, finalUrl: res.url, redirected: res.redirected }
  } catch {
    clearTimeout(timer)
    return null
  }
}
