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

// Initialize the rate limit table if it doesn't exist and auto-migrate
async function ensureTable() {
  const sql = getDb()
  
  try {
    // Try to create with full schema
    await sql`
      CREATE TABLE IF NOT EXISTS rate_limits (
        identifier TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        reset_at TIMESTAMPTZ NOT NULL
      )
    `
    console.log('[RateLimit] Table created or already exists')
  } catch (e) {
    // Table might already exist with different columns - try to add them
    console.log('[RateLimit] Table creation result:', e)
    try {
      await sql`ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS identifier TEXT`
    } catch {}
    try {
      await sql`ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS count INTEGER DEFAULT 0`
    } catch {}
    try {
      await sql`ALTER TABLE rate_limits ADD COLUMN IF NOT EXISTS reset_at TIMESTAMPTZ`
    } catch {}
  }
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
    
    // Try with reset_at first, fallback to reset_date
    let result
    try {
      result = await sql`
        SELECT count, reset_at FROM rate_limits 
        WHERE identifier = ${identifier}
      `
    } catch {
      // Fallback to old column name
      result = await sql`
        SELECT count, reset_date FROM rate_limits 
        WHERE identifier = ${identifier}
      `
    }
    
    console.log('[RateLimit] getRateLimitInfo:', identifier, 'result:', result.length)
    
    // Check both possible column names for reset time
    const resetTime = result[0]?.reset_at || result[0]?.reset_date
    
    if (result.length === 0 || !resetTime || new Date(resetTime) <= now) {
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
      resetAt: new Date(resetTime).toISOString(),
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
    
    // Try with reset_at first, fallback to reset_date
    let result
    try {
      result = await sql`
        SELECT count, reset_at FROM rate_limits 
        WHERE identifier = ${identifier}
      `
    } catch {
      result = await sql`
        SELECT count, reset_date FROM rate_limits 
        WHERE identifier = ${identifier}
      `
    }
    
    const resetTime = result[0]?.reset_at || result[0]?.reset_date
    
    if (result.length === 0 || !resetTime || new Date(resetTime) <= now) {
      // Insert new entry or reset expired one
      console.log('[RateLimit] Inserting new entry with count 1')
      try {
        await sql`
          INSERT INTO rate_limits (identifier, count, reset_at)
          VALUES (${identifier}, 1, ${resetAt.toISOString()})
          ON CONFLICT (identifier) 
          DO UPDATE SET count = 1, reset_at = ${resetAt.toISOString()}
        `
      } catch {
        // Try with reset_date
        await sql`
          INSERT INTO rate_limits (identifier, count, reset_date)
          VALUES (${identifier}, 1, ${resetAt.toISOString()})
          ON CONFLICT (identifier) 
          DO UPDATE SET count = 1, reset_date = ${resetAt.toISOString()}
        `
      }
    } else {
      // Increment existing entry
      console.log('[RateLimit] Incrementing existing entry')
      try {
        await sql`
          UPDATE rate_limits 
          SET count = count + 1 
          WHERE identifier = ${identifier}
        `
      } catch {
        // Try with reset_date - might need different syntax
        await sql`
          UPDATE rate_limits 
          SET count = count + 1, reset_date = ${resetAt.toISOString()}
          WHERE identifier = ${identifier}
        `
      }
    }
  } catch (error) {
    console.error('[RateLimit] Increment error:', error)
    // Don't throw - continue even if rate limiting fails
  }
}
