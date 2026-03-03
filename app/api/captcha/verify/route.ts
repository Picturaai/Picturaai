import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(req: NextRequest) {
  try {
    const { token, secret } = await req.json()

    if (!token || !secret) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token and secret are required' 
      }, { status: 400 })
    }

    // Verify secret key exists
    const site = await sql`
      SELECT id, domain FROM captcha_sites 
      WHERE secret_key = ${secret}
    `

    if (site.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid secret key' 
      }, { status: 401 })
    }

    // Decode and verify token
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      
      // Check token age (max 5 minutes)
      const tokenAge = Date.now() - decoded.t
      if (tokenAge > 5 * 60 * 1000) {
        // Track failed verification
        await sql`
          UPDATE captcha_sites 
          SET challenges_failed = COALESCE(challenges_failed, 0) + 1
          WHERE id = ${site[0].id}
        `
        return NextResponse.json({ 
          success: false, 
          error: 'Token expired' 
        }, { status: 400 })
      }

      // Check if verification passed
      if (!decoded.v) {
        await sql`
          UPDATE captcha_sites 
          SET challenges_failed = COALESCE(challenges_failed, 0) + 1
          WHERE id = ${site[0].id}
        `
        return NextResponse.json({ 
          success: false, 
          error: 'Verification not completed' 
        }, { status: 400 })
      }

      // Log successful verification
      await sql`
        UPDATE captcha_sites 
        SET challenges_solved = COALESCE(challenges_solved, 0) + 1
        WHERE id = ${site[0].id}
      `

      return NextResponse.json({
        success: true,
        hostname: site[0].domain,
        challenge_ts: new Date(decoded.t).toISOString()
      })
    } catch {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid token format' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('CAPTCHA verification error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Verification failed' 
    }, { status: 500 })
  }
}
