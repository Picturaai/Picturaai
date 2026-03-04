import { neon } from '@neondatabase/serverless'

const DAILY_LIMIT = 5

// In-memory rate limit storage (works reliably in serverless)
// Note: This resets on each function cold start, but provides rate limiting within a session
const rateLimitStore = new Map<string, { count: number; resetAt: Date }>()

function getResetTime(): Date {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCHours(24, 0, 0, 0)
  return tomorrow
}

export async function getRateLimitInfo(identifier: string): Promise<{
  limit: number
  remaining: number
  used: number
  resetAt: string
}> {
  const now = new Date()
  const stored = rateLimitStore.get(identifier)
  
  if (!stored || stored.resetAt <= now) {
    // No entry or expired - return fresh limits
    const resetAt = getResetTime()
    rateLimitStore.set(identifier, { count: 0, resetAt })
    return {
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT,
      used: 0,
      resetAt: resetAt.toISOString(),
    }
  }
  
  return {
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - stored.count),
    used: stored.count,
    resetAt: stored.resetAt.toISOString(),
  }
}

export async function incrementUsage(identifier: string): Promise<void> {
  const now = new Date()
  const resetAt = getResetTime()
  
  let stored = rateLimitStore.get(identifier)
  
  if (!stored || stored.resetAt <= now) {
    // New or expired - start fresh
    rateLimitStore.set(identifier, { count: 1, resetAt })
  } else {
    // Increment existing
    stored.count++
    rateLimitStore.set(identifier, stored)
  }
}
