import { NextResponse } from 'next/server'
import { getRateLimitInfo } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'

export async function GET(request: Request) {
  const sessionId = await getOrCreateSessionId()
  const rateLimitInfo = getRateLimitInfo(sessionId)
  return NextResponse.json(rateLimitInfo)
}
