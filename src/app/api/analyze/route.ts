/**
 * POST /api/analyze
 * Body: { contentType: "text"|"url"|"image", text?, url?, imageBase64?, userContext? }
 * Response: { riskLevel, riskScore, reasons, explanation, recommendedAction }
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithLLM } from '@/lib/ai'
import { getBehavioralHints } from '@/lib/behavioral'
import { getPhishingHintLines } from '@/lib/phishing'
import { fetchUrlContent } from '@/lib/fetchUrl'
import { supabase } from '@/lib/db'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// CORS preflight — required for Chrome extension requests
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const contentType    = body.contentType    ?? 'text'
    const text           = body.text           ?? ''
    const url            = body.url            ?? ''
    const imageBase64    = body.imageBase64
    const documentBase64 = body.documentBase64
    const documentMimeType = body.documentMimeType ?? 'application/pdf'
    const userId         = body.userId         ?? null
    let   userContext    = body.userContext    ?? null

    // If a logged-in userId is provided, fetch the real profile from DB and override userContext
    if (userId && supabase) {
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (profile) {
        userContext = {
          name:               profile.name,
          neverUsedCrypto:    profile.never_used_crypto,
          neverSentGiftCards: profile.never_sent_giftcards,
          knownDomains:       profile.known_domains ?? [],
          typicalContacts:    profile.trusted_contacts ?? [],
          locale:             userContext?.locale ?? 'en',
        }
      }
    }

    if (contentType === 'text' && !text && !url) {
      return NextResponse.json({ error: 'Missing text or url' }, { status: 400, headers: CORS_HEADERS })
    }
    if (contentType === 'url' && !url) {
      return NextResponse.json({ error: 'Missing url for contentType url' }, { status: 400, headers: CORS_HEADERS })
    }
    if (contentType === 'image' && !imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400, headers: CORS_HEADERS })
    }
    if (contentType === 'document' && !documentBase64) {
      return NextResponse.json({ error: 'Missing documentBase64' }, { status: 400, headers: CORS_HEADERS })
    }

    // For URL mode: fetch the actual page content so the LLM can inspect it
    let fetchedPageText:  string | undefined
    let fetchedPageTitle: string | undefined
    let finalUrl:         string | undefined
    let urlRedirected:    boolean | undefined

    if (contentType === 'url' && url) {
      try {
        const fetched = await fetchUrlContent(url)
        if (fetched) {
          fetchedPageText  = fetched.text  || undefined
          fetchedPageTitle = fetched.title || undefined
          finalUrl         = fetched.finalUrl !== url ? fetched.finalUrl : undefined
          urlRedirected    = fetched.redirected || undefined
        }
      } catch {
        // fetch failure is non-fatal — LLM still analyzes the URL itself
      }
    }

    const input = {
      contentType:    contentType    as 'text' | 'url' | 'image' | 'document',
      text:           text           || undefined,
      url:            url            || undefined,
      imageBase64:    imageBase64    || undefined,
      documentBase64: documentBase64 || undefined,
      documentMimeType: documentMimeType || undefined,
      userContext:    userContext    || undefined,
      fetchedPageText,
      fetchedPageTitle,
      finalUrl,
      urlRedirected,
    }

    const behavioralHints = getBehavioralHints({ contentType, text, url }, userContext)
    const phishingHints   = (url && getPhishingHintLines(url)) || []
    const allHints        = [...behavioralHints, ...phishingHints]

    const result = await analyzeWithLLM(input, allHints)
    return NextResponse.json(result, { headers: CORS_HEADERS })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed'
    console.error('[/api/analyze]', message)
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS })
  }
}
