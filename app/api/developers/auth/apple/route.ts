import { NextRequest, NextResponse } from 'next/server'

const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID
const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET
const APPLE_REDIRECT_URI = process.env.APPLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/developers/auth/apple/callback`

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'login'

  if (!APPLE_CLIENT_ID) {
    return NextResponse.json(
      { error: 'Apple OAuth is not configured. Please set APPLE_CLIENT_ID environment variable.' },
      { status: 500 }
    )
  }

  const state = Buffer.from(JSON.stringify({ action, nonce: crypto.randomUUID() })).toString('base64url')

  const appleAuthUrl = new URL('https://appleid.apple.com/auth/authorize')
  appleAuthUrl.searchParams.set('client_id', APPLE_CLIENT_ID)
  appleAuthUrl.searchParams.set('redirect_uri', APPLE_REDIRECT_URI)
  appleAuthUrl.searchParams.set('response_type', 'code id_token')
  appleAuthUrl.searchParams.set('scope', 'name email')
  appleAuthUrl.searchParams.set('state', state)
  appleAuthUrl.searchParams.set('response_mode', 'form_post')

  return NextResponse.redirect(appleAuthUrl.toString())
}

function generateAppleClientSecret(): string {
  // Apple requires a JWT as the client secret
  // This is a simplified version - in production you should use a proper JWT library
  const header = {
    alg: 'ES256',
    kid: process.env.APPLE_KEY_ID,
  }

  const now = Math.floor(Date.now() / 1000)
  const payload = {
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 86400 * 180, // 6 months
    aud: 'https://appleid.apple.com',
    sub: APPLE_CLIENT_ID,
  }

  // Note: In production, you need to sign this with your Apple private key
  // This is a placeholder - use a library like 'jsonwebtoken' with your private key
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = 'SIGN_WITH_YOUR_APPLE_PRIVATE_KEY'

  return `${encodedHeader}.${encodedPayload}.${signature}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const code = formData.get('code') as string
    const idToken = formData.get('id_token') as string

    if (!code && !idToken) {
      return NextResponse.json({ error: 'Authorization code or id_token is required' }, { status: 400 })
    }

    if (!APPLE_CLIENT_ID || !APPLE_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Apple OAuth is not configured' },
        { status: 500 }
      )
    }

    let userData: { sub: string; email?: string; name?: string } | null = null

    if (idToken) {
      // Parse the ID token (JWT) to get user info
      const parts = idToken.split('.')
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
        userData = {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
        }
      }
    }

    if (!userData) {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://appleid.apple.com/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: APPLE_CLIENT_ID,
          client_secret: generateAppleClientSecret(),
          code,
          grant_type: 'authorization_code',
          redirect_uri: APPLE_REDIRECT_URI,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        return NextResponse.json({ error: tokenData.error || 'Failed to get tokens' }, { status: 400 })
      }

      // Parse the ID token from the response
      if (tokenData.id_token) {
        const parts = tokenData.id_token.split('.')
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
          userData = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
          }
        }
      }
    }

    if (!userData) {
      return NextResponse.json({ error: 'Failed to get user info from Apple' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      user: {
        appleId: userData.sub,
        email: userData.email,
        name: userData.name,
        verified: true,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to authenticate with Apple' }, { status: 500 })
  }
}
