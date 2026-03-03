import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

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
    const passwordMatch = await bcrypt.compare(password, developer.password_hash)

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        developerId: developer.id,
        email: developer.email,
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    )

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
    console.error('[v0] Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
