import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { sendOTPEmail, generateOTP, hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, country, phoneNumber, currency } = await req.json()

    if (!fullName || !email || !password || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM developers WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    const passwordHash = hashPassword(password)

    // Delete any existing OTP for this email first
    await sql`DELETE FROM otp_verification WHERE email = ${email.toLowerCase()}`

    // Store OTP in database
    await sql`
      INSERT INTO otp_verification (
        email, otp_code, full_name, phone, country_code, currency, password_hash, expires_at
      ) VALUES (
        ${email.toLowerCase()}, 
        ${otp}, 
        ${fullName}, 
        ${phoneNumber || ''}, 
        ${country}, 
        ${currency || 'USD'},
        ${passwordHash},
        ${otpExpires}
      )
    `

    // Send OTP email
    const emailResult = await sendOTPEmail(email.toLowerCase(), fullName, otp)

    if (!emailResult.success) {
      console.error('[v0] Email send failed:', emailResult.error)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
    })
  } catch (error) {
    console.error('[v0] OTP request error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
