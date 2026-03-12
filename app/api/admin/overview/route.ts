import { NextResponse } from 'next/server'
import { requireAdminSession } from '@/lib/admin-auth'
import { getAdminOverview } from '@/lib/admin-data'
import { getSessionIdFromRequest } from '@/lib/session'

export async function GET(request: Request) {
  const session = await requireAdminSession('staff')
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const currentSessionId = getSessionIdFromRequest({ headers: request.headers })
    const overview = await getAdminOverview(currentSessionId)
    return NextResponse.json({ overview, session })
  } catch (error) {
    console.error('[AdminOverview] GET error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 })
  }
}
