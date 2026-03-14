import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json(
    { status: 'ok', service: 'scamshield-api' },
    { headers: { 'Access-Control-Allow-Origin': '*' } }
  )
}
