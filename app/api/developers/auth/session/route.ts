import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('pictura_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ 
        authenticated: false, 
        developer: null 
      })
    }

    // Verify session token and get developer info
    const sessions = await sql`
      SELECT s.*, d.id as developer_id, d.name, d.email, d.credits_balance, d.currency
      FROM developer_sessions s
      JOIN developers d ON s.developer_id = d.id
      WHERE s.token = ${sessionToken} 
      AND s.expires_at > NOW()
    `

    if (sessions.length === 0) {
      // Invalid or expired session
      return NextResponse.json({ 
        authenticated: false, 
        developer: null 
      })
    }

    const session = sessions[0]

    return NextResponse.json({
      authenticated: true,
      developer: {
        id: session.developer_id,
        name: session.name,
        email: session.email,
        credits: session.credits_balance,
        currency: session.currency
      }
    })

  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      developer: null,
      error: 'Failed to verify session'
    })
  }
}
