const DAILY_LIMIT = 5

// In-memory rate limiting store (resets on server restart)
// For production, use Redis or a database
// Uses session IDs as identifiers to prevent manipulation
const usageStore = new Map<string, { count: number; resetAt: number }>()

function getResetTime(): number {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCHours(24, 0, 0, 0)
  return tomorrow.getTime()
}

function cleanupExpired() {
  const now = Date.now()
  for (const [key, value] of usageStore.entries()) {
    if (now >= value.resetAt) {
      usageStore.delete(key)
    }
  }
}

export function getRateLimitInfo(identifier: string): {
  limit: number
  remaining: number
  used: number
  resetAt: string
} {
  cleanupExpired()

  const now = Date.now()
  const entry = usageStore.get(identifier)

  if (!entry || now >= entry.resetAt) {
    return {
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT,
      used: 0,
      resetAt: new Date(getResetTime()).toISOString(),
    }
  }

  return {
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - entry.count),
    used: entry.count,
    resetAt: new Date(entry.resetAt).toISOString(),
  }
}

export function incrementUsage(identifier: string): void {
  cleanupExpired()

  const now = Date.now()
  const entry = usageStore.get(identifier)

  if (!entry || now >= entry.resetAt) {
    usageStore.set(identifier, {
      count: 1,
      resetAt: getResetTime(),
    })
  } else {
    entry.count += 1
  }
}
