import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    // Try cookie first
    const cookieStore = await cookies()
    let sessionToken = cookieStore.get('pictura_session')?.value
    
    // Fallback to Authorization header
    if (!sessionToken) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7)
      }
    }

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify session token and get developer info
    const sessions = await sql`
      SELECT s.developer_id, d.id, d.name, d.email, d.full_name, d.credits_balance, d.currency
      FROM developer_sessions s
      JOIN developers d ON s.developer_id = d.id
      WHERE s.session_token = ${sessionToken} 
      AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    const dev = sessions[0]

    return NextResponse.json({
      developer: {
        id: dev.id,
        name: dev.name || dev.full_name,
        email: dev.email,
        credits: dev.credits_balance,
        currency: dev.currency
      }
    })

  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
