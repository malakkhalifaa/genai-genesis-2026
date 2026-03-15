import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/ip
 * Returns the client's public IP address from request headers.
 * The frontend calls this on mount so it can attach the IP to scan records.
 */
export async function GET(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1'
  return NextResponse.json({ ip })
}
