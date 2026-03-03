import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword, sendWelcomeEmail } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

const CURRENCY_CREDITS: Record<string, { usd: number; local: number }> = {
  NG: { usd: 5, local: 4000 },
  US: { usd: 5, local: 5 },
  GB: { usd: 5, local: 4 },
  CA: { usd: 5, local: 6.5 },
  AU: { usd: 5, local: 7.5 },
  ZA: { usd: 5, local: 95 },
  KE: { usd: 5, local: 645 },
  GH: { usd: 5, local: 31 },
}

const CURRENCY_MAP: Record<string, string> = {
  NG: 'NGN',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  ZA: 'ZAR',
  KE: 'KES',
  GH: 'GHS',
}

export async function POST(req: NextRequest) {
  try {
    const { email, otp, fullName, password, country } = await req.json()

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
        country,
        currency,
        credits_balance,
        credits_usd_equivalent
      )
      VALUES (
        ${fullName},
        ${email.toLowerCase()},
        ${hashedPassword},
        ${country},
        ${currency},
        ${credits.local},
        ${credits.usd}
      )
      RETURNING id, email, full_name, credits_balance, currency
    `

    if (developer.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    const dev = developer[0]

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
        'Welcome bonus'
      )
    `

    // Delete OTP record
    await sql`DELETE FROM otp_verification WHERE email = ${email.toLowerCase()}`

    // Send welcome email
    await sendEmail({
      to: email.toLowerCase(),
      subject: 'Welcome to Pictura API!',
      html: getWelcomeEmailTemplate(fullName, credits.local, currency),
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      developerId: dev.id,
    })
  } catch (error) {
    console.error('[v0] OTP verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
