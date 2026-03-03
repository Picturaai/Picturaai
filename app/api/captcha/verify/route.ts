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

    // Decode and verify token - supports both base64 JSON and legacy string format
    try {
      let decoded: { t: number; s?: string; v: boolean; i?: number; steps?: number; r?: string }
      
      // Try base64 JSON first (new format)
      try {
        decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      } catch {
        // Legacy format: pictura_timestamp_sitekey_random_verified
        if (token.startsWith('pictura_') && token.endsWith('_verified')) {
          const parts = token.split('_')
          decoded = {
            t: parseInt(parts[1], 10),
            s: parts[2],
            v: true
          }
        } else {
          throw new Error('Invalid token format')
        }
      }
      
      // Check token age (max 5 minutes)
      const tokenAge = Date.now() - decoded.t
      if (tokenAge > 5 * 60 * 1000) {
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
        challenge_ts: new Date(decoded.t).toISOString(),
        interactions: decoded.i || 0,
        steps_completed: decoded.steps || 1
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
