import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const cookieStore = {
  get: vi.fn((_name: string): { value: string } | undefined => undefined),
  set: vi.fn(),
  delete: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: async () => cookieStore,
}))

const SESSION_COOKIE = 'pictura_session_id'
const STABLE_COOKIE = 'pictura_stable_id'

async function loadModule() {
  vi.resetModules()
  return await import('@/lib/session')
}

describe('session', () => {
  beforeEach(() => {
    cookieStore.get.mockReset()
    cookieStore.set.mockReset()
    cookieStore.delete.mockReset()
    cookieStore.get.mockReturnValue(undefined)
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  describe('generateSessionId', () => {
    it('returns a unique 64 char hex id by default', async () => {
      const { generateSessionId } = await loadModule()
      const id = generateSessionId()
      expect(id).toMatch(/^[0-9a-f]{64}$/)
      expect(generateSessionId()).not.toBe(id)
    })

    it('prefixes the id with a non-v1 session epoch', async () => {
      vi.stubEnv('SESSION_EPOCH', 'v2')
      const { generateSessionId } = await loadModule()
      expect(generateSessionId()).toMatch(/^v2_[0-9a-f]{64}$/)
    })
  })

  describe('getSessionIdFromRequest', () => {
    it('parses the session cookie out of the cookie header', async () => {
      const { getSessionIdFromRequest } = await loadModule()
      const request = new Request('https://pictura.ai/api/generate', {
        headers: { cookie: `theme=dark; ${SESSION_COOKIE}=abc123; other=1` },
      })
      expect(getSessionIdFromRequest(request)).toBe('abc123')
    })

    it('url-decodes the value and tolerates whitespace', async () => {
      const { getSessionIdFromRequest } = await loadModule()
      const request = new Request('https://pictura.ai/api/generate', {
        headers: { cookie: ` ${SESSION_COOKIE}=a%20b ` },
      })
      expect(getSessionIdFromRequest(request)).toBe('a b')
    })

    it('falls back to the legacy cookie under a new epoch', async () => {
      vi.stubEnv('SESSION_EPOCH', 'v2')
      const { getSessionIdFromRequest } = await loadModule()
      const request = new Request('https://pictura.ai/api/generate', {
        headers: { cookie: `${SESSION_COOKIE}=legacy-id` },
      })
      expect(getSessionIdFromRequest(request)).toBe('legacy-id')
    })

    it('returns undefined when there is no cookie header or no match', async () => {
      const { getSessionIdFromRequest } = await loadModule()
      expect(getSessionIdFromRequest(new Request('https://pictura.ai/'))).toBeUndefined()
      expect(
        getSessionIdFromRequest(new Request('https://pictura.ai/', { headers: { cookie: 'theme=dark' } })),
      ).toBeUndefined()
    })
  })

  describe('getOrCreateSessionId', () => {
    it('returns the existing session id without writing cookies', async () => {
      cookieStore.get.mockImplementation((name) => (name === SESSION_COOKIE ? { value: 'existing' } : undefined))
      const { getOrCreateSessionId } = await loadModule()
      expect(await getOrCreateSessionId()).toBe('existing')
      expect(cookieStore.set).not.toHaveBeenCalled()
    })

    it('creates a fresh id and persists both cookies', async () => {
      const { getOrCreateSessionId } = await loadModule()
      const id = await getOrCreateSessionId()

      expect(id).toMatch(/^[0-9a-f]{64}$/)
      expect(cookieStore.set.mock.calls.map((call) => call[0])).toEqual([SESSION_COOKIE, STABLE_COOKIE])
      for (const [, value, options] of cookieStore.set.mock.calls) {
        expect(value).toBe(id)
        expect(options).toMatchObject({ httpOnly: true, sameSite: 'lax', path: '/', maxAge: 30 * 24 * 60 * 60 })
      }
    })

    it('reuses the stable cookie when only the session cookie was wiped', async () => {
      cookieStore.get.mockImplementation((name) => (name === STABLE_COOKIE ? { value: 'stable-id' } : undefined))
      const { getOrCreateSessionId } = await loadModule()
      expect(await getOrCreateSessionId()).toBe('stable-id')
    })

    it('applies the epoch prefix to a legacy stable id', async () => {
      vi.stubEnv('SESSION_EPOCH', 'v2')
      cookieStore.get.mockImplementation((name) =>
        name === 'pictura_stable_id_v2' ? { value: 'stable-id' } : undefined,
      )
      const { getOrCreateSessionId } = await loadModule()
      expect(await getOrCreateSessionId()).toBe('v2_stable-id')
    })

    it('marks cookies secure in production', async () => {
      vi.stubEnv('NODE_ENV', 'production')
      const { getOrCreateSessionId } = await loadModule()
      await getOrCreateSessionId()
      expect(cookieStore.set.mock.calls[0][2]).toMatchObject({ secure: true })
    })
  })

  describe('getSessionId', () => {
    it('reads the cookie value, or undefined when unset', async () => {
      const { getSessionId } = await loadModule()
      expect(await getSessionId()).toBeUndefined()

      cookieStore.get.mockReturnValue({ value: 'abc' })
      expect(await getSessionId()).toBe('abc')
    })
  })

  describe('clearSessionId', () => {
    it('deletes current and legacy cookies', async () => {
      const { clearSessionId } = await loadModule()
      await clearSessionId()
      expect(cookieStore.delete.mock.calls.flat()).toEqual([
        SESSION_COOKIE,
        STABLE_COOKIE,
        SESSION_COOKIE,
        STABLE_COOKIE,
      ])
    })

    it('deletes epoch-scoped and legacy cookies under a new epoch', async () => {
      vi.stubEnv('SESSION_EPOCH', 'v2')
      const { clearSessionId } = await loadModule()
      await clearSessionId()
      expect(cookieStore.delete.mock.calls.flat()).toEqual([
        'pictura_session_id_v2',
        'pictura_stable_id_v2',
        SESSION_COOKIE,
        STABLE_COOKIE,
      ])
    })
  })
})
