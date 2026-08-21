import { NextRequest, NextResponse } from 'next/server'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth errors
  if (error) {
    const errorDescription = searchParams.get('error_description') || 'Authentication failed'
    return NextResponse.redirect(`${APP_URL}/developers/login?error=${encodeURIComponent(errorDescription)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/developers/login?error=missing_code`)
  }

  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(`${APP_URL}/developers/login?error=oauth_not_configured`)
  }

  try {
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
        redirect_uri: `${APP_URL}/api/developers/auth/github/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error) {
      return NextResponse.redirect(`${APP_URL}/developers/login?error=${encodeURIComponent(tokenData.error_description || 'token_exchange_failed')}`)
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

    if (!primaryEmail) {
      return NextResponse.redirect(`${APP_URL}/developers/login?error=email_required`)
    }

    // Create or authenticate the developer in your system
    const authResponse = await fetch(`${APP_URL}/api/developers/auth/github/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubId: userData.id,
        login: userData.login,
        name: userData.name || userData.login,
        email: primaryEmail,
        avatarUrl: userData.avatar_url,
        profileUrl: userData.html_url,
        accessToken,
      }),
    })

    const authData = await authResponse.json()

    if (authData.token) {
      // Redirect to dashboard with session token
      const redirectUrl = new URL(`${APP_URL}/developers/dashboard`)
      redirectUrl.searchParams.set('token', authData.token)

      const response = NextResponse.redirect(redirectUrl.toString())
      
      // Set session cookie
      response.cookies.set('pictura_session', authData.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      })

      return response
    }

    return NextResponse.redirect(`${APP_URL}/developers/login?error=auth_failed`)
  } catch {
    return NextResponse.redirect(`${APP_URL}/developers/login?error=server_error`)
  }
}
