import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { sendOTPEmail, generateOTP, hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  console.log('[v0] Request OTP API - Received request')
  try {
    const { fullName, email, password, country, currency, phoneNumber, referralSource, promoCode } = await request.json()
    console.log('[v0] Request body:', { fullName, email, country, currency, referralSource, promoCode, passwordLength: password?.length })

    if (!fullName || !email || !password) {
      console.log('[v0] Validation failed: Missing required fields')
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      console.log('[v0] Validation failed: Password too short')
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const emailLower = email.toLowerCase().trim()
    console.log('[v0] Checking if developer exists:', emailLower)

    // Check if developer already exists
    const existing = await sql`
      SELECT id FROM developers WHERE email = ${emailLower}
    `
    console.log('[v0] Existing developer check result:', existing.length > 0 ? 'Found' : 'Not found')
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 400 })
    }

    // Generate OTP
    const otp = generateOTP()
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    console.log('[v0] Generated OTP, expires at:', otpExpiry)

    // Hash password
    const hashedPassword = hashPassword(password)
    console.log('[v0] Password hashed successfully')

    // Store in otp_verification table (matches verify-otp expectations)
    console.log('[v0] Storing OTP in database...')
    try {
      await sql`
        INSERT INTO otp_verification (
          email, full_name, password_hash, country_code, currency, phone,
          referral_source, promo_code, otp_code, expires_at, verified
        ) VALUES (
          ${emailLower}, ${fullName}, ${hashedPassword}, ${country || 'US'},
          ${currency || 'USD'}, ${phoneNumber || null}, ${referralSource || null},
          ${promoCode ? promoCode.toUpperCase() : null}, ${otp}, ${otpExpiry}, false
        )
        ON CONFLICT (email) DO UPDATE SET
          full_name = ${fullName},
          password_hash = ${hashedPassword},
          country_code = ${country || 'US'},
          currency = ${currency || 'USD'},
          phone = ${phoneNumber || null},
          referral_source = ${referralSource || null},
          promo_code = ${promoCode ? promoCode.toUpperCase() : null},
          otp_code = ${otp},
          expires_at = ${otpExpiry},
          verified = false
      `
      console.log('[v0] OTP stored in database successfully')
    } catch (dbError) {
      console.error('[v0] Database error storing OTP:', dbError)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // Send OTP email
    console.log('[v0] Sending OTP email to:', emailLower)
    const emailResult = await sendOTPEmail(emailLower, fullName.split(' ')[0], otp)
    console.log('[v0] Email send result:', emailResult)
    
    if (!emailResult.success) {
      console.error('[v0] Failed to send OTP email:', emailResult.error)
      return NextResponse.json({ error: 'Failed to send verification email. Please try again.' }, { status: 500 })
    }

    console.log('[v0] Request OTP completed successfully')
    return NextResponse.json({ success: true, message: 'Verification code sent to your email' })
  } catch (error) {
    console.error('Request OTP error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
