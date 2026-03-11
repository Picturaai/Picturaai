import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function verifySession(token: string): Promise<{ developerId: string } | null> {
  try {
    const sessions = await sql`
      SELECT developer_id, expires_at FROM developer_sessions
      WHERE session_token = ${token}
    `

    if (sessions.length === 0) return null
    const session = sessions[0]
    if (new Date(session.expires_at) <= new Date()) return null
    return { developerId: session.developer_id }
  } catch {
    return null
  }
}

function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('pictura_session')?.value
  if (cookieToken) return cookieToken

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7)

  return null
}

export async function PATCH(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const session = await verifySession(token)
    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

    const { name } = await req.json()
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const safeName = name.trim().slice(0, 80)

    await sql`
      UPDATE developers
      SET name = ${safeName}, full_name = ${safeName}
      WHERE id = ${session.developerId}
    `

    return NextResponse.json({ success: true, name: safeName })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
