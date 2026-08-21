import { NextRequest, NextResponse } from 'next/server'

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://picturaai.sbs'
const REDIRECT_URI = `${APP_URL}/api/developers/auth/github/callback`

/**
 * GitHub OAuth - Redirect to GitHub authorization page
 * The redirect URI must match exactly what's configured in your GitHub OAuth App settings
 */
export function GET(request: NextRequest) {
  if (!GITHUB_CLIENT_ID) {
    return NextResponse.json(
      { error: 'GitHub OAuth is not configured. Please set GITHUB_CLIENT_ID environment variable.' },
      { status: 500 }
    )
  }

  const state = Buffer.from(JSON.stringify({ nonce: crypto.randomUUID() })).toString('base64url')

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize')
  githubAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID)
  githubAuthUrl.searchParams.set('redirect_uri', REDIRECT_URI)
  githubAuthUrl.searchParams.set('scope', 'read:user user:email')
  githubAuthUrl.searchParams.set('state', state)

  return NextResponse.redirect(githubAuthUrl.toString())
}
