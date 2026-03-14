/**
 * POST /api/analyze
 * Body: { contentType: "text"|"url"|"image", text?, url?, imageBase64?, userContext? }
 * Response: { riskLevel, riskScore, reasons, explanation, recommendedAction }
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithLLM } from '@/lib/ai'
import { getBehavioralHints } from '@/lib/behavioral'
import { getPhishingHintLines } from '@/lib/phishing'

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
    const contentType = body.contentType ?? 'text'
    const text        = body.text         ?? ''
    const url         = body.url          ?? ''
    const imageBase64 = body.imageBase64
    const userContext = body.userContext  ?? null

    if (contentType === 'text' && !text && !url) {
      return NextResponse.json({ error: 'Missing text or url' }, { status: 400, headers: CORS_HEADERS })
    }
    if (contentType === 'url' && !url) {
      return NextResponse.json({ error: 'Missing url for contentType url' }, { status: 400, headers: CORS_HEADERS })
    }
    if (contentType === 'image' && !imageBase64) {
      return NextResponse.json({ error: 'Missing imageBase64' }, { status: 400, headers: CORS_HEADERS })
    }

    const input = {
      contentType: contentType as 'text' | 'url' | 'image',
      text:        text        || undefined,
      url:         url         || undefined,
      imageBase64: imageBase64 || undefined,
      userContext: userContext || undefined,
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
