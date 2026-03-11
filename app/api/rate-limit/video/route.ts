import { NextResponse } from 'next/server'
import { getVideoRateLimitInfo } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'

export async function GET() {
  const sessionId = await getOrCreateSessionId()
  const rateLimitInfo = await getVideoRateLimitInfo(sessionId)
  return NextResponse.json(rateLimitInfo)
}
