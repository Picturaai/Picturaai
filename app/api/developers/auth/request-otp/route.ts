import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { sendEmail, generateOTP, getOTPEmailTemplate } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, country, phoneNumber } = await req.json()

    if (!fullName || !email || !password || !country || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if email already exists
    const existing = await sql`SELECT id FROM developers WHERE email = ${email.toLowerCase()}`
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const otp = generateOTP()
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store OTP in database
    await sql`
      INSERT INTO otp_verification (email, otp, expires_at, metadata)
      VALUES (${email.toLowerCase()}, ${otp}, ${otpExpires}, ${JSON.stringify({
        fullName,
        country,
        phoneNumber,
        password, // In production, this should be hashed
      })})
      ON CONFLICT (email) DO UPDATE SET
        otp = ${otp},
        expires_at = ${otpExpires},
        metadata = ${JSON.stringify({ fullName, country, phoneNumber, password })}
    `

    // Send OTP email
    const emailResult = await sendEmail({
      to: email.toLowerCase(),
      subject: 'Verify your Pictura API Developer Account',
      html: getOTPEmailTemplate(otp, fullName),
    })

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent to email',
    })
  } catch (error) {
    console.error('[v0] OTP request error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
