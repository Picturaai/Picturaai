import { NextResponse } from 'next/server'
import { getRateLimitInfo } from '@/lib/rate-limit'

export async function GET(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for') || 'anonymous'
  const rateLimitInfo = getRateLimitInfo(clientIp)
  return NextResponse.json(rateLimitInfo)
}
