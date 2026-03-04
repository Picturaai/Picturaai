import { neon } from '@neondatabase/serverless'

const DAILY_LIMIT = 5

// Get database connection
function getDb() {
  const sql = neon(process.env.DATABASE_URL!)
  return sql
}

function getResetTime(): Date {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setUTCHours(24, 0, 0, 0)
  return tomorrow
}

// Initialize the rate limit table if it doesn't exist
async function ensureTable() {
  const sql = getDb()
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limits (
      identifier TEXT PRIMARY KEY,
      count INTEGER NOT NULL DEFAULT 0,
      reset_at TIMESTAMPTZ NOT NULL
    )
  `
}

export async function getRateLimitInfo(identifier: string): Promise<{
  limit: number
  remaining: number
  used: number
  resetAt: string
}> {
  try {
    const sql = getDb()
    
    // Ensure table exists
    await ensureTable()
    
    const now = new Date()
    
    // Get current rate limit entry
    const result = await sql`
      SELECT count, reset_at FROM rate_limits 
      WHERE identifier = ${identifier}
    `
    
    console.log('[RateLimit] getRateLimitInfo:', identifier, 'result:', result.length)
    
    if (result.length === 0 || new Date(result[0].reset_at) <= now) {
      // No entry or expired - return fresh limits
      console.log('[RateLimit] Returning fresh limits')
      return {
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT,
        used: 0,
        resetAt: getResetTime().toISOString(),
      }
    }
    
    const entry = result[0]
    const info = {
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - entry.count),
      used: entry.count,
      resetAt: new Date(entry.reset_at).toISOString(),
    }
    console.log('[RateLimit] Returning existing limits:', info)
    return info
  } catch (error) {
    console.error('[RateLimit] Error:', error)
    // On error, allow the request (fail open)
    return {
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT,
      used: 0,
      resetAt: getResetTime().toISOString(),
    }
  }
}

export async function incrementUsage(identifier: string): Promise<void> {
  try {
    const sql = getDb()
    
    // Ensure table exists
    await ensureTable()
    
    const now = new Date()
    const resetAt = getResetTime()
    
    console.log('[RateLimit] incrementUsage:', identifier, 'resetAt:', resetAt.toISOString())
    
    // Get current entry
    const result = await sql`
      SELECT count, reset_at FROM rate_limits 
      WHERE identifier = ${identifier}
    `
    
    if (result.length === 0 || new Date(result[0].reset_at) <= now) {
      // Insert new entry or reset expired one
      console.log('[RateLimit] Inserting new entry with count 1')
      await sql`
        INSERT INTO rate_limits (identifier, count, reset_at)
        VALUES (${identifier}, 1, ${resetAt.toISOString()})
        ON CONFLICT (identifier) 
        DO UPDATE SET count = 1, reset_at = ${resetAt.toISOString()}
      `
    } else {
      // Increment existing entry
      console.log('[RateLimit] Incrementing existing entry')
      await sql`
        UPDATE rate_limits 
        SET count = count + 1 
        WHERE identifier = ${identifier}
      `
    }
  } catch (error) {
    console.error('[RateLimit] Increment error:', error)
    // Don't throw - continue even if rate limiting fails
  }
}
