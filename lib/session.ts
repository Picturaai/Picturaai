import { cookies } from 'next/headers'
import { createHash, randomBytes } from 'crypto'

const SESSION_ID_LENGTH = 32
const SESSION_EPOCH = 'v2'
const SESSION_COOKIE_NAME = `pictura_session_id_${SESSION_EPOCH}`
const STABLE_COOKIE_NAME = `pictura_stable_id_${SESSION_EPOCH}`
const LEGACY_SESSION_COOKIE_NAME = 'pictura_session_id'
const LEGACY_STABLE_COOKIE_NAME = 'pictura_stable_id'
const SESSION_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

type RequestLike = Request | { headers: Headers }

export function generateSessionId(): string {
  return `${SESSION_EPOCH}_${randomBytes(SESSION_ID_LENGTH).toString('hex')}`
}

function applySessionEpoch(value: string): string {
  return value.startsWith(`${SESSION_EPOCH}_`) ? value : `${SESSION_EPOCH}_${value}`
}

function getStableFingerprint(request?: RequestLike): string | null {
  if (!request) return null

  const explicitFingerprint = request.headers.get('x-client-fingerprint')
  if (explicitFingerprint && explicitFingerprint.trim()) {
    return createHash('sha256').update(explicitFingerprint.trim()).digest('hex')
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || request.headers.get('cf-connecting-ip')
    || 'unknown-ip'
  const ua = request.headers.get('user-agent') || 'unknown-ua'
  const acceptLanguage = request.headers.get('accept-language') || 'unknown-lang'
  const secChUa = request.headers.get('sec-ch-ua') || 'unknown-ch-ua'
  const secChPlatform = request.headers.get('sec-ch-ua-platform') || 'unknown-platform'
  const raw = `${ip}|${ua}|${acceptLanguage}|${secChUa}|${secChPlatform}`
  return createHash('sha256').update(raw).digest('hex')
}

export async function getOrCreateSessionId(request?: RequestLike): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!sessionId) {
    const stableCookie = cookieStore.get(STABLE_COOKIE_NAME)?.value
    const fingerprint = getStableFingerprint(request)

    const baseSessionId = stableCookie || fingerprint || generateSessionId()
    sessionId = applySessionEpoch(baseSessionId)

    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    })

    cookieStore.set(STABLE_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: '/',
    })

    console.log('[Session] Creating stable session:', sessionId)
  } else {
    console.log('[Session] Using existing session:', sessionId)
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
  cookieStore.delete(STABLE_COOKIE_NAME)
  cookieStore.delete(LEGACY_SESSION_COOKIE_NAME)
  cookieStore.delete(LEGACY_STABLE_COOKIE_NAME)
}
