import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, generateToken } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    // Find developer
    const developers = await sql`
      SELECT id, email, password_hash, full_name, name, credits_balance, currency
      FROM developers
      WHERE email = ${email.toLowerCase()}
    `

    if (developers.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const developer = developers[0]

    // Verify password
    const passwordMatch = verifyPassword(password, developer.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate session token
    const token = generateToken(32)
    console.log('[v0] Login - Generated token for developer:', developer.id, 'token prefix:', token.substring(0, 8))
    
    // Store session token with expiry (30 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    console.log('[v0] Login - Storing session, expires:', expiresAt.toISOString())
    await sql`
      INSERT INTO developer_sessions (developer_id, session_token, expires_at)
      VALUES (${developer.id}, ${token}, ${expiresAt.toISOString()})
    `
    console.log('[v0] Login - Session stored successfully')

    // Update last login
    await sql`UPDATE developers SET last_login = NOW() WHERE id = ${developer.id}`

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      token,
      developer: {
        id: developer.id,
        email: developer.email,
        name: developer.full_name || developer.name,
        creditsBalance: parseFloat(developer.credits_balance) || 0,
        currency: developer.currency || 'USD',
      },
    })

    // Set HTTP-only cookie for persistent auth (30 days)
    response.cookies.set('pictura_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
