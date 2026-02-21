import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const SESSION_ID_LENGTH = 32
const SESSION_COOKIE_NAME = 'pictura_session_id'
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

export function generateSessionId(): string {
  return randomBytes(SESSION_ID_LENGTH).toString('hex')
}

export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    sessionId = generateSessionId()
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    })
  }

  return sessionId
}

export async function getSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}

export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
