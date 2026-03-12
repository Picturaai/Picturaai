import { NextResponse } from 'next/server'
import { getRateLimitInfo } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'

export async function GET(request: Request) {
  console.log('[RateLimit API] GET /api/rate-limit')
  const sessionId = await getOrCreateSessionId(request)
  console.log('[RateLimit API] Session ID:', sessionId)
  const rateLimitInfo = await getRateLimitInfo(sessionId)
  console.log('[RateLimit API] Returning:', rateLimitInfo)
  return NextResponse.json(rateLimitInfo)
}
