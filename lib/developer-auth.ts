import type { NextRequest, NextResponse } from 'next/server'
import { errorResponse } from '@/lib/api-response'
import { sql } from '@/lib/db'

export const DEVELOPER_SESSION_COOKIE = 'pictura_session'

export type DeveloperSession = { developerId: string }

/** Reads the developer session token from the session cookie or a bearer header. */
export function getTokenFromRequest(req: NextRequest): string | null {
  const cookieToken = req.cookies.get(DEVELOPER_SESSION_COOKIE)?.value
  if (cookieToken) return cookieToken

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.substring(7)

  return null
}

/** Resolves a developer session token, returning null when missing or expired. */
export async function verifyDeveloperSession(token: string): Promise<DeveloperSession | null> {
  try {
    const sessions = await sql`
      SELECT developer_id, expires_at FROM developer_sessions
      WHERE session_token = ${token}
    `

    if (sessions.length === 0) return null

    const session = sessions[0]
    if (new Date(session.expires_at) <= new Date()) return null

    return { developerId: session.developer_id }
  } catch (error) {
    console.error('Session lookup failed:', error)
    return null
  }
}

/** Convenience wrapper: token extraction plus session verification. */
export async function getAuthenticatedDeveloperId(req: NextRequest): Promise<string | null> {
  const token = getTokenFromRequest(req)
  if (!token) return null

  const session = await verifyDeveloperSession(token)
  return session?.developerId ?? null
}

export type DeveloperSessionResult =
  | { ok: true; developerId: string }
  | { ok: false; response: NextResponse }

/**
 * Same as {@link getAuthenticatedDeveloperId} but distinguishes a missing token
 * (401 Unauthorized) from an invalid/expired one (401 Session expired).
 */
export async function requireDeveloperSession(req: NextRequest): Promise<DeveloperSessionResult> {
  const token = getTokenFromRequest(req)
  if (!token) return { ok: false, response: errorResponse('Unauthorized', 401) }

  const session = await verifyDeveloperSession(token)
  if (!session) return { ok: false, response: errorResponse('Session expired', 401) }

  return { ok: true, developerId: session.developerId }
}
