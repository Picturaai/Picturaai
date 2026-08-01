import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getDailyLimits,
  getRateLimitInfo,
  getTourPreference,
  getVideoRateLimitInfo,
  incrementUsage,
  incrementVideoUsage,
  listSessionsForAdmin,
  setTourPreference,
  updateSessionCreditsForAdmin,
} from '@/lib/rate-limit'

type Row = Record<string, unknown>

/**
 * Records every tagged-template query and replies to SELECTs with queued rows.
 * DDL from ensureTable and write statements always resolve to an empty result.
 */
const queries: { text: string; params: unknown[] }[] = []
let responses: Row[][] = []

const sql = vi.fn((strings: TemplateStringsArray, ...params: unknown[]) => {
  const text = strings.join('?').replace(/\s+/g, ' ').trim()
  queries.push({ text, params })
  return Promise.resolve(text.startsWith('SELECT') ? (responses.shift() ?? []) : [])
})

vi.mock('@neondatabase/serverless', () => ({
  neon: () => sql,
}))

function selectQueries() {
  return queries.filter((q) => q.text.startsWith('SELECT'))
}

function findQuery(fragment: string) {
  return queries.find((q) => q.text.includes(fragment))
}

function queueSelect(rows: Row[]) {
  responses.push(rows)
}

const future = () => new Date(Date.now() + 3_600_000).toISOString()
const past = () => new Date(Date.now() - 3_600_000).toISOString()

describe('rate-limit', () => {
  beforeEach(() => {
    queries.length = 0
    responses = []
    sql.mockClear()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  describe('getDailyLimits', () => {
    it('reports the video limit of 2 alongside the image limit', () => {
      const limits = getDailyLimits()
      expect(limits.video).toBe(2)
      expect(limits.image).toBeGreaterThan(limits.video)
    })
  })

  describe('getRateLimitInfo', () => {
    it('creates the session row on first use and returns a full allowance', async () => {
      queueSelect([])
      const info = await getRateLimitInfo('sess-1')

      expect(info.used).toBe(0)
      expect(info.remaining).toBe(info.limit)
      expect(new Date(info.resetAt).getTime()).toBeGreaterThan(Date.now())
      expect(findQuery('INSERT INTO user_sessions')).toBeDefined()
    })

    it('subtracts used credits from the limit for an active window', async () => {
      queueSelect([{ credits_used: 5, credits_reset_at: future() }])
      const info = await getRateLimitInfo('sess-1')

      expect(info.used).toBe(5)
      expect(info.remaining).toBe(info.limit - 5)
    })

    it('resets usage once the window has elapsed', async () => {
      queueSelect([{ credits_used: 42, credits_reset_at: past() }])
      const info = await getRateLimitInfo('sess-1')

      expect(info.used).toBe(0)
      expect(findQuery('SET credits_used = 0')).toBeDefined()
    })

    it('reports zero usage for admins', async () => {
      queueSelect([{ credits_used: 9, credits_reset_at: future() }])
      const info = await getRateLimitInfo('sess-1', { role: 'admin' })

      expect(info.used).toBe(0)
      expect(info.remaining).toBe(info.limit)
    })

    it('persists request metadata when a context is supplied', async () => {
      queueSelect([{ credits_used: 1, credits_reset_at: future() }])
      await getRateLimitInfo('sess-1', { ip: '1.2.3.4', country: 'US', deviceType: 'mobile' })

      const touch = findQuery('SET last_ip')
      expect(touch).toBeDefined()
      expect(touch!.params).toContain('1.2.3.4')
    })

    it('skips the metadata update when no context is supplied', async () => {
      queueSelect([{ credits_used: 1, credits_reset_at: future() }])
      await getRateLimitInfo('sess-1')
      expect(findQuery('SET last_ip')).toBeUndefined()
    })

    it('falls back to a permissive allowance when the database fails', async () => {
      sql.mockImplementationOnce(() => Promise.reject(new Error('db down')))
      const info = await getRateLimitInfo('sess-1')

      expect(info).toMatchObject({ used: 0, remaining: info.limit })
    })
  })

  describe('getVideoRateLimitInfo', () => {
    it('returns the daily video allowance for a new session', async () => {
      queueSelect([])
      expect(await getVideoRateLimitInfo('sess-1')).toMatchObject({ limit: 2, remaining: 2, used: 0 })
    })

    it('never reports negative remaining video credits', async () => {
      queueSelect([{ video_used: 5, video_reset_at: future() }])
      expect(await getVideoRateLimitInfo('sess-1')).toMatchObject({ used: 5, remaining: 0 })
    })

    it('resets video usage after the window and when the reset timestamp is missing', async () => {
      queueSelect([{ video_used: 2, video_reset_at: past() }])
      expect((await getVideoRateLimitInfo('sess-1')).used).toBe(0)

      queries.length = 0
      queueSelect([{ video_used: 2, video_reset_at: null }])
      expect((await getVideoRateLimitInfo('sess-1')).used).toBe(2)
    })

    it('gives admins an unlimited video allowance', async () => {
      queueSelect([{ video_used: 2, video_reset_at: future() }])
      const info = await getVideoRateLimitInfo('sess-1', { role: 'admin' })
      expect(info.used).toBe(0)
      expect(info.limit).toBeGreaterThan(2)
    })

    it('falls back to the default allowance when the database fails', async () => {
      sql.mockImplementationOnce(() => Promise.reject(new Error('db down')))
      expect(await getVideoRateLimitInfo('sess-1')).toMatchObject({ limit: 2, remaining: 2, used: 0 })
    })
  })

  describe('incrementUsage', () => {
    it('inserts a row with one credit used for an unknown session', async () => {
      queueSelect([])
      await incrementUsage('sess-1')
      expect(findQuery('INSERT INTO user_sessions')!.params).toContain('sess-1')
    })

    it('increments within the window and restarts the window once expired', async () => {
      queueSelect([{ credits_used: 3, credits_reset_at: future() }])
      await incrementUsage('sess-1')
      expect(findQuery('SET credits_used = credits_used + 1')).toBeDefined()

      queries.length = 0
      queueSelect([{ credits_used: 3, credits_reset_at: past() }])
      await incrementUsage('sess-1')
      expect(findQuery('SET credits_used = 1')).toBeDefined()
    })

    it('is a no-op for admins', async () => {
      await incrementUsage('sess-1', { role: 'admin' })
      expect(sql).not.toHaveBeenCalled()
    })

    it('swallows database errors', async () => {
      sql.mockImplementationOnce(() => Promise.reject(new Error('db down')))
      await expect(incrementUsage('sess-1')).resolves.toBeUndefined()
    })
  })

  describe('incrementVideoUsage', () => {
    it('inserts, increments and restarts the window like image usage', async () => {
      queueSelect([])
      await incrementVideoUsage('sess-1')
      expect(findQuery('INSERT INTO user_sessions')).toBeDefined()

      queries.length = 0
      queueSelect([{ video_used: 1, video_reset_at: future() }])
      await incrementVideoUsage('sess-1')
      expect(findQuery('SET video_used = COALESCE(video_used, 0) + 1')).toBeDefined()

      queries.length = 0
      queueSelect([{ video_used: 1, video_reset_at: past() }])
      await incrementVideoUsage('sess-1')
      expect(findQuery('SET video_used = 1')).toBeDefined()
    })

    it('is a no-op for admins and swallows database errors', async () => {
      await incrementVideoUsage('sess-1', { role: 'admin' })
      expect(sql).not.toHaveBeenCalled()

      sql.mockImplementationOnce(() => Promise.reject(new Error('db down')))
      await expect(incrementVideoUsage('sess-1')).resolves.toBeUndefined()
    })
  })

  describe('tour preference', () => {
    it('creates the row and reports the tour as incomplete for a new session', async () => {
      queueSelect([])
      expect(await getTourPreference('sess-1')).toEqual({ completed: false })
      expect(findQuery('INSERT INTO user_sessions')).toBeDefined()
    })

    it('coerces the stored flag to a boolean', async () => {
      queueSelect([{ tour_completed: true }])
      expect(await getTourPreference('sess-1')).toEqual({ completed: true })
    })

    it('defaults to incomplete when the database fails', async () => {
      sql.mockImplementationOnce(() => Promise.reject(new Error('db down')))
      expect(await getTourPreference('sess-1')).toEqual({ completed: false })
    })

    it('upserts the flag on write and swallows errors', async () => {
      await setTourPreference('sess-1', true)
      const upsert = findQuery('ON CONFLICT (session_id)')
      expect(upsert).toBeDefined()
      expect(upsert!.params).toContain(true)

      sql.mockImplementationOnce(() => Promise.reject(new Error('db down')))
      await expect(setTourPreference('sess-1', false)).resolves.toBeUndefined()
    })
  })

  describe('listSessionsForAdmin', () => {
    it('lists recent sessions when no search is given', async () => {
      queueSelect([{ session_id: 'sess-1' }])
      expect(await listSessionsForAdmin()).toEqual([{ session_id: 'sess-1' }])
      expect(selectQueries()[0].text).not.toContain('ILIKE')
    })

    it('prefix-matches a trimmed search term', async () => {
      queueSelect([])
      await listSessionsForAdmin('  sess ')
      const search = findQuery('ILIKE')
      expect(search).toBeDefined()
      expect(search!.params).toContain('sess%')
    })
  })

  describe('updateSessionCreditsForAdmin', () => {
    it('returns null for a blank session id without touching credits', async () => {
      expect(await updateSessionCreditsForAdmin({ sessionId: '  ' })).toBeNull()
      expect(findQuery('INSERT INTO user_sessions')).toBeUndefined()
    })

    it('ensures the row exists and returns the refreshed record', async () => {
      queueSelect([{ session_id: 'sess-1' }])
      expect(await updateSessionCreditsForAdmin({ sessionId: 'sess-1' })).toEqual({ session_id: 'sess-1' })
      expect(findQuery('ON CONFLICT (session_id) DO NOTHING')).toBeDefined()
    })

    it('returns null when the row cannot be read back', async () => {
      queueSelect([])
      expect(await updateSessionCreditsForAdmin({ sessionId: 'sess-1' })).toBeNull()
    })

    it('zeroes both counters on reset', async () => {
      queueSelect([{ session_id: 'sess-1' }])
      await updateSessionCreditsForAdmin({ sessionId: 'sess-1', reset: true })
      expect(findQuery('SET credits_used = 0, video_used = 0')).toBeDefined()
    })

    it('applies truncated deltas and ignores zero or non-finite ones', async () => {
      queueSelect([{ session_id: 'sess-1' }])
      await updateSessionCreditsForAdmin({ sessionId: 'sess-1', imageDelta: 2.7, videoDelta: -1 })
      expect(findQuery('SET credits_used = COALESCE(credits_used, 0) -')!.params).toContain(2)
      expect(findQuery('SET video_used = COALESCE(video_used, 0) -')!.params).toContain(-1)

      queries.length = 0
      queueSelect([{ session_id: 'sess-1' }])
      await updateSessionCreditsForAdmin({ sessionId: 'sess-1', imageDelta: 0, videoDelta: Number.NaN })
      expect(findQuery('COALESCE(credits_used, 0) -')).toBeUndefined()
      expect(findQuery('COALESCE(video_used, 0) -')).toBeUndefined()
    })

    it('converts a requested remaining balance into a used count, clamped at zero', async () => {
      queueSelect([{ session_id: 'sess-1' }])
      await updateSessionCreditsForAdmin({ sessionId: 'sess-1', imageRemaining: 10, videoRemaining: -5 })

      const image = findQuery('SET credits_used = ? WHERE')
      const video = findQuery('SET video_used = ? WHERE')
      expect(image!.params[0]).toBe(getDailyLimits().image - 10)
      expect(video!.params[0]).toBe(getDailyLimits().video)
    })
  })
})
