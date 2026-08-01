import { createHmac } from 'crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cookieStore = {
  get: vi.fn((_name: string): { value: string } | undefined => undefined),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}))

const SECRET = 'test-secret'
const COOKIE = 'pictura_admin_session'

function makeToken(
  role: string,
  email: string,
  expiresAt: number = Date.now() + 60_000,
  secret: string = SECRET,
): string {
  const payload = `${role}|${email}|${Date.now()}|${expiresAt}`
  return `${payload}|${createHmac('sha256', secret).update(payload).digest('hex')}`
}

function requestWithCookie(value: string): Request {
  return new Request('https://pictura.ai/api/admin', {
    headers: { cookie: `${COOKIE}=${encodeURIComponent(value)}` },
  })
}

async function loadModule() {
  vi.resetModules()
  return await import('@/lib/admin-auth')
}

describe('admin-auth', () => {
  beforeEach(() => {
    cookieStore.get.mockReset()
    cookieStore.set.mockReset()
    cookieStore.delete.mockReset()
    vi.stubEnv('ADMIN_AUTH_SECRET', SECRET)
    vi.stubEnv('ADMIN_LOGIN_EMAIL', 'Admin@Pictura.ai')
    vi.stubEnv('ADMIN_LOGIN_PASSWORD', 'admin-pass')
    vi.stubEnv('STAFF_LOGIN_EMAIL', 'staff@pictura.ai')
    vi.stubEnv('STAFF_LOGIN_PASSWORD', 'staff-pass')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('authenticateAdminUser', () => {
    it('accepts admin credentials case-insensitively on the email', async () => {
      const { authenticateAdminUser } = await loadModule()
      expect(authenticateAdminUser('  ADMIN@pictura.ai ', 'admin-pass')).toEqual({
        role: 'admin',
        email: 'admin@pictura.ai',
      })
    })

    it('accepts staff credentials', async () => {
      const { authenticateAdminUser } = await loadModule()
      expect(authenticateAdminUser('staff@pictura.ai', 'staff-pass')).toEqual({
        role: 'staff',
        email: 'staff@pictura.ai',
      })
    })

    it('rejects a wrong password and an unknown email', async () => {
      const { authenticateAdminUser } = await loadModule()
      expect(authenticateAdminUser('admin@pictura.ai', 'nope')).toBeNull()
      expect(authenticateAdminUser('someone@else.com', 'admin-pass')).toBeNull()
    })

    it('rejects everything when no credentials are configured', async () => {
      vi.stubEnv('ADMIN_LOGIN_EMAIL', '')
      vi.stubEnv('ADMIN_LOGIN_PASSWORD', '')
      vi.stubEnv('STAFF_LOGIN_EMAIL', '')
      vi.stubEnv('STAFF_LOGIN_PASSWORD', '')
      const { authenticateAdminUser } = await loadModule()
      expect(authenticateAdminUser('', '')).toBeNull()
    })
  })

  describe('isAdminAuthConfigured', () => {
    it('is true only when secret and admin credentials exist', async () => {
      const { isAdminAuthConfigured } = await loadModule()
      expect(isAdminAuthConfigured()).toBe(true)

      vi.stubEnv('ADMIN_AUTH_SECRET', '')
      vi.stubEnv('ADMIN_DASHBOARD_TOKEN', '')
      const reloaded = await loadModule()
      expect(reloaded.isAdminAuthConfigured()).toBe(false)
    })
  })

  describe('createAdminSession / clearAdminSession', () => {
    it('writes a signed httpOnly cookie that verifies', async () => {
      const { createAdminSession, getAdminSession } = await loadModule()
      await createAdminSession('admin', 'admin@pictura.ai')

      const [name, token, options] = cookieStore.set.mock.calls[0]
      expect(name).toBe(COOKIE)
      expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/' })

      cookieStore.get.mockReturnValue({ value: token })
      expect(await getAdminSession()).toEqual({ role: 'admin', email: 'admin@pictura.ai' })
    })

    it('deletes the cookie on clear', async () => {
      const { clearAdminSession } = await loadModule()
      await clearAdminSession()
      expect(cookieStore.delete).toHaveBeenCalledWith(COOKIE)
    })
  })

  describe('getAdminSession', () => {
    it('returns null without a secret or without a cookie', async () => {
      cookieStore.get.mockReturnValue(undefined)
      expect(await (await loadModule()).getAdminSession()).toBeNull()

      vi.stubEnv('ADMIN_AUTH_SECRET', '')
      vi.stubEnv('ADMIN_DASHBOARD_TOKEN', '')
      cookieStore.get.mockReturnValue({ value: makeToken('admin', 'a@b.c') })
      expect(await (await loadModule()).getAdminSession()).toBeNull()
    })

    it.each([
      ['a malformed token', 'admin|a@b.c|1'],
      ['an unknown role', makeToken('superuser', 'a@b.c')],
      ['a token signed with another secret', makeToken('admin', 'a@b.c', Date.now() + 60_000, 'other')],
      ['an expired token', makeToken('admin', 'a@b.c', Date.now() - 1)],
    ])('rejects %s', async (_label, token) => {
      cookieStore.get.mockReturnValue({ value: token })
      expect(await (await loadModule()).getAdminSession()).toBeNull()
    })

    it('rejects a tampered payload with a valid-length signature', async () => {
      const token = makeToken('admin', 'a@b.c')
      const parts = token.split('|')
      parts[1] = 'attacker@evil.com'
      cookieStore.get.mockReturnValue({ value: parts.join('|') })
      expect(await (await loadModule()).getAdminSession()).toBeNull()
    })
  })

  describe('requireAdminSession', () => {
    it('allows staff for the default minimum role but not for admin-only', async () => {
      cookieStore.get.mockReturnValue({ value: makeToken('staff', 'staff@pictura.ai') })
      const { requireAdminSession } = await loadModule()
      expect(await requireAdminSession()).toEqual({ role: 'staff', email: 'staff@pictura.ai' })
      expect(await requireAdminSession('admin')).toBeNull()
    })

    it('allows admin for admin-only', async () => {
      cookieStore.get.mockReturnValue({ value: makeToken('admin', 'admin@pictura.ai') })
      const { requireAdminSession } = await loadModule()
      expect(await requireAdminSession('admin')).toEqual({ role: 'admin', email: 'admin@pictura.ai' })
    })

    it('returns null when there is no session', async () => {
      cookieStore.get.mockReturnValue(undefined)
      expect(await (await loadModule()).requireAdminSession()).toBeNull()
    })
  })

  describe('getAdminSessionFromRequest', () => {
    it('reads and verifies the cookie from the request header', async () => {
      const { getAdminSessionFromRequest } = await loadModule()
      expect(getAdminSessionFromRequest(requestWithCookie(makeToken('admin', 'admin@pictura.ai')))).toEqual({
        role: 'admin',
        email: 'admin@pictura.ai',
      })
    })

    it('returns null without the cookie, with a bad signature or when expired', async () => {
      const { getAdminSessionFromRequest } = await loadModule()
      expect(getAdminSessionFromRequest(new Request('https://pictura.ai/api/admin'))).toBeNull()
      expect(
        getAdminSessionFromRequest(requestWithCookie(makeToken('admin', 'a@b.c', Date.now() + 60_000, 'other'))),
      ).toBeNull()
      expect(getAdminSessionFromRequest(requestWithCookie(makeToken('admin', 'a@b.c', Date.now() - 1)))).toBeNull()
      expect(getAdminSessionFromRequest(requestWithCookie('admin|a@b.c|1'))).toBeNull()
    })

    it('returns null when auth is not configured', async () => {
      vi.stubEnv('ADMIN_AUTH_SECRET', '')
      vi.stubEnv('ADMIN_DASHBOARD_TOKEN', '')
      const { getAdminSessionFromRequest } = await loadModule()
      expect(getAdminSessionFromRequest(requestWithCookie(makeToken('admin', 'a@b.c')))).toBeNull()
    })
  })
})
