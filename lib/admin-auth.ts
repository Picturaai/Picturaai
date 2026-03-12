import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'

export type AdminRole = 'admin' | 'staff'

const ADMIN_COOKIE_NAME = 'pictura_admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 12

type ParsedAdminSession = { role: AdminRole; email: string } | null

function getSecret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.ADMIN_DASHBOARD_TOKEN || ''
}

function getCredentials() {
  return {
    admin: {
      email: (process.env.ADMIN_LOGIN_EMAIL || '').toLowerCase().trim(),
      password: process.env.ADMIN_LOGIN_PASSWORD || '',
    },
    staff: {
      email: (process.env.STAFF_LOGIN_EMAIL || '').toLowerCase().trim(),
      password: process.env.STAFF_LOGIN_PASSWORD || '',
    },
  }
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
    const [key, ...rest] = part.trim().split('=')
    if (!key) return acc
    acc[key] = decodeURIComponent(rest.join('='))
    return acc
  }, {})
}

function parseAdminToken(raw: string | undefined): ParsedAdminSession {
  const secret = getSecret()
  if (!secret || !raw) return null

  const parts = raw.split('|')
  if (parts.length !== 5) return null

  const [role, email, issuedAt, expiresAt, sig] = parts
  if (role !== 'admin' && role !== 'staff') return null

  const payload = `${role}|${email}|${issuedAt}|${expiresAt}`
  const expectedSig = sign(payload)

  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expectedSig)
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  } catch {
    return null
  }

  if (Number(expiresAt) < Date.now()) return null
  return { role, email }
}

export function authenticateAdminUser(email: string, password: string): { role: AdminRole; email: string } | null {
  const normalized = email.toLowerCase().trim()
  const creds = getCredentials()

  if (creds.admin.email && creds.admin.password && normalized === creds.admin.email && password === creds.admin.password) {
    return { role: 'admin', email: creds.admin.email }
  }

  if (creds.staff.email && creds.staff.password && normalized === creds.staff.email && password === creds.staff.password) {
    return { role: 'staff', email: creds.staff.email }
  }

  return null
}

export async function createAdminSession(role: AdminRole, email: string) {
  const issuedAt = Date.now()
  const expiresAt = issuedAt + MAX_AGE_SECONDS * 1000
  const payload = `${role}|${email}|${issuedAt}|${expiresAt}`
  const token = `${payload}|${sign(payload)}`

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  })
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

export async function getAdminSession(): Promise<{ role: AdminRole; email: string } | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(ADMIN_COOKIE_NAME)?.value
  return parseAdminToken(raw)
}

export function getAdminSessionFromRequest(request: Request): ParsedAdminSession {
  const cookieHeader = request.headers.get('cookie')
  const cookiesMap = parseCookieHeader(cookieHeader)
  return parseAdminToken(cookiesMap[ADMIN_COOKIE_NAME])
}

export async function requireAdminSession(minRole: AdminRole = 'staff') {
  const session = await getAdminSession()
  if (!session) return null
  if (minRole === 'admin' && session.role !== 'admin') return null
  return session
}

export function isAdminAuthConfigured() {
  const secret = getSecret()
  const creds = getCredentials()
  return Boolean(secret && creds.admin.email && creds.admin.password)
}
