import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, verifyPassword, generateToken } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })
    }

    // Find developer
    const developers = await sql`
      SELECT id, email, password_hash, full_name, credits_balance
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
    
    // Store session token with expiry (30 days)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)
    
    await sql`
      INSERT INTO developer_sessions (developer_id, session_token, expires_at)
      VALUES (${developer.id}, ${token}, ${expiresAt.toISOString()})
    `

    return NextResponse.json({
      success: true,
      token,
      developer: {
        id: developer.id,
        email: developer.email,
        name: developer.full_name,
        creditsBalance: developer.credits_balance,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
