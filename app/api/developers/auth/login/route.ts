import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { verifyPassword, generateToken } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    
    console.log('[v0] Login API - Attempting login for:', email?.toLowerCase())

    if (!email || !password) {
      return NextResponse.json({ error: 'Please enter both email and password' }, { status: 400 })
    }

    // Find developer
    const developers = await sql`
      SELECT id, email, password_hash, full_name, name, credits_balance, currency
      FROM developers
      WHERE email = ${email.toLowerCase()}
    `
    
    console.log('[v0] Login API - Found developers:', developers.length)

    if (developers.length === 0) {
      return NextResponse.json({ error: 'No account found with this email. Please sign up first.' }, { status: 401 })
    }

    const developer = developers[0]
    
    console.log('[v0] Login API - Developer found:', developer.id)
    console.log('[v0] Login API - Password hash exists:', !!developer.password_hash)
    console.log('[v0] Login API - Password hash length:', developer.password_hash?.length)

    // Check if password hash exists (account might be created via OTP only)
    if (!developer.password_hash) {
      console.log('[v0] Login API - No password hash stored for this account')
      return NextResponse.json({ error: 'Please complete your registration first' }, { status: 401 })
    }

    // Verify password
    const inputPasswordHash = verifyPassword(password, developer.password_hash)
    console.log('[v0] Login API - Password verification result:', inputPasswordHash)
    
    const passwordMatch = inputPasswordHash

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Incorrect password. Please try again.' }, { status: 401 })
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
