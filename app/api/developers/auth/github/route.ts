import { NextRequest, NextResponse } from 'next/server'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/developers/auth/github/callback`

export function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') || 'login'

  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID environment variable.' },
      { status: 500 }
    )
  }

  const state = Buffer.from(JSON.stringify({ action, nonce: crypto.randomUUID() })).toString('base64url')

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
  githubAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  githubAuthUrl.searchParams.set('scope', 'read:user user:email')
  githubAuthUrl.searchParams.set('state', state)

  return NextResponse.redirect(githubAuthUrl.toString())
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json()

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 })
    }

    if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'GitHub OAuth is not configured' },
        { status: 500 }
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.json({ error: tokenData.error_description || 'Failed to get access token' }, { status: 400 })
    }

    const accessToken = tokenData.access_token

    // Get user info from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const userData = await userResponse.json()

    // Get user emails (may be private)
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })

    const emailsData = await emailsResponse.json()
    const primaryEmail = Array.isArray(emailsData)
      ? emailsData.find((e: { primary: boolean }) => e.primary)?.email || emailsData[0]?.email
      : userData.email

    return NextResponse.json({
      success: true,
      user: {
        githubId: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        email: primaryEmail,
        avatarUrl: userData.avatar_url,
        profileUrl: userData.html_url,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to authenticate with GitHub' }, { status: 500 })
  }
}
