import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { sendWelcomeEmail, generateToken, hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

// Free credits for developers to start building
const CURRENCY_CREDITS: Record<string, number> = {
  NGN: 1000,   // ₦1,000 free credits
  USD: 2,      // $2 free credits
  GBP: 1.60,   // £1.60 free credits
  EUR: 1.80,   // €1.80 free credits
  CAD: 2.60,   // C$2.60 free credits
  AUD: 3,      // A$3 free credits
  INR: 168,    // ₹168 free credits
  ZAR: 38,     // R38 free credits
  KES: 258,    // KSh258 free credits
  GHS: 24,     // GH₵24 free credits
  JPY: 300,    // ¥300 free credits
  BRL: 10,     // R$10 free credits
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and verification code are required' }, { status: 400 })
    }

    // Verify OTP and get stored data
    const otpRecord = await sql`
      SELECT * FROM otp_verification 
      WHERE email = ${email.toLowerCase()} 
      AND otp_code = ${otp} 
      AND expires_at > NOW()
      AND verified = false
    `

    if (otpRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired verification code' }, { status: 400 })
    }

    const record = otpRecord[0]

    // Check if email already registered
    const existing = await sql`SELECT id FROM developers WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Get credits for currency (100 free images equivalent)
    const currency = record.currency || 'USD'
    const credits = CURRENCY_CREDITS[currency] || CURRENCY_CREDITS['USD']

    // Create developer account
    const developer = await sql`
      INSERT INTO developers (
        name,
        email,
        password_hash,
        phone,
        country_code,
        currency,
        credits_balance,
        email_verified
      )
      VALUES (
        ${record.full_name},
        ${email.toLowerCase()},
        ${record.password_hash},
        ${record.phone || ''},
        ${record.country_code || 'US'},
        ${currency},
        ${credits},
        true
      )
      RETURNING id, email, name, credits_balance, currency
    `

    if (developer.length === 0) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const dev = developer[0]

    // Generate first API key automatically
    const apiKey = `pk_live_${generateToken(24)}`
    const keyHash = hashPassword(apiKey)
    
    await sql`
      INSERT INTO api_keys (developer_id, key_hash, key_prefix, name)
      VALUES (${dev.id}, ${keyHash}, ${apiKey.slice(0, 12)}, 'Default Key')
    `

    // Log credit transaction
    await sql`
      INSERT INTO credit_transactions (
        developer_id,
        type,
        amount,
        description,
        balance_after
      )
      VALUES (
        ${dev.id},
        'signup_bonus',
        ${credits},
        'Welcome bonus - 100 free images to get started',
        ${credits}
      )
    `

    // Mark OTP as verified and delete
    await sql`DELETE FROM otp_verification WHERE email = ${email.toLowerCase()}`

    // Send welcome email
    await sendWelcomeEmail(email.toLowerCase(), record.full_name, credits, currency)

    // Create session token
    const sessionToken = generateToken(32)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

    await sql`
      INSERT INTO developer_sessions (developer_id, session_token, expires_at)
      VALUES (${dev.id}, ${sessionToken}, ${expiresAt})
    `

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Welcome to Pictura.',
      sessionToken,
      apiKey, // Shown once - won't be displayed again
      developer: {
        id: dev.id,
        name: dev.name,
        email: dev.email,
        credits: dev.credits_balance,
        currency: dev.currency,
      },
    })
  } catch (error) {
    console.error('OTP verification error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
