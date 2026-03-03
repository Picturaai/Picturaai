import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, sendWelcomeEmail, generateToken } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

// Credits worth $5 USD in local currency - very affordable pricing
const CURRENCY_CREDITS: Record<string, { usd: number; local: number }> = {
  NG: { usd: 5, local: 4000 },  // ~800 images at 5 NGN each
  US: { usd: 5, local: 5 },     // 500 images at $0.01 each
  GB: { usd: 5, local: 4 },
  CA: { usd: 5, local: 6.5 },
  AU: { usd: 5, local: 7.5 },
  ZA: { usd: 5, local: 95 },
  KE: { usd: 5, local: 645 },
  GH: { usd: 5, local: 62 },
  IN: { usd: 5, local: 420 },
  DE: { usd: 5, local: 4.5 },
  FR: { usd: 5, local: 4.5 },
  JP: { usd: 5, local: 750 },
  BR: { usd: 5, local: 25 },
}

const CURRENCY_MAP: Record<string, string> = {
  NG: 'NGN', US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD',
  ZA: 'ZAR', KE: 'KES', GH: 'GHS', IN: 'INR', DE: 'EUR',
  FR: 'EUR', JP: 'JPY', BR: 'BRL',
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, fullName, password, country, phoneNumber } = await req.json()

    if (!email || !otp || !fullName || !password || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify OTP
    const otpRecord = await sql`
      SELECT * FROM otp_verification 
      WHERE email = ${email.toLowerCase()} 
      AND otp = ${otp} 
      AND expires_at > NOW()
    `

    if (otpRecord.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Check if email already registered
    const existing = await sql`SELECT id FROM developers WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = hashPassword(password)

    // Get credits for country
    const credits = CURRENCY_CREDITS[country] || CURRENCY_CREDITS['US']
    const currency = CURRENCY_MAP[country] || 'USD'

    // Create developer account
    const developer = await sql`
      INSERT INTO developers (
        full_name,
        email,
        password_hash,
        phone_number,
        country,
        currency,
        credits_balance,
        credits_usd_equivalent
      )
      VALUES (
        ${fullName},
        ${email.toLowerCase()},
        ${hashedPassword},
        ${phoneNumber || ''},
        ${country},
        ${currency},
        ${credits.local},
        ${credits.usd}
      )
      RETURNING id, email, full_name, credits_balance, currency
    `

    if (developer.length === 0) {
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    const dev = developer[0]

    // Generate first API key automatically
    const apiKey = `pk_live_${generateToken(24)}`
    await sql`
      INSERT INTO api_keys (developer_id, key_hash, key_prefix, name)
      VALUES (${dev.id}, ${hashPassword(apiKey)}, ${apiKey.slice(0, 12)}, 'Default Key')
    `

    // Log credit transaction
    await sql`
      INSERT INTO credit_transactions (
        developer_id,
        type,
        amount,
        usd_equivalent,
        description
      )
      VALUES (
        ${dev.id},
        'signup_bonus',
        ${credits.local},
        ${credits.usd},
        'Welcome bonus - enjoy your free credits!'
      )
    `

    // Delete OTP record
    await sql`DELETE FROM otp_verification WHERE email = ${email.toLowerCase()}`

    // Send welcome email
    await sendWelcomeEmail(email.toLowerCase(), fullName, credits.local, currency)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      developerId: dev.id,
      apiKey: apiKey, // Return the API key once (won't be shown again)
    })
  } catch (error) {
    console.error('[v0] OTP verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
