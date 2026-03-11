import { neon } from '@neondatabase/serverless'

const DAILY_LIMIT = 5
const DAILY_VIDEO_LIMIT = 2

// Persistent rate limit storage using database
// Uses a separate table to avoid schema conflicts

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

// Ensure the rate limit table exists
async function ensureTable() {
  const sql = getDb()
  // Create table with sessions column to store session ID as primary key
  await sql`
    CREATE TABLE IF NOT EXISTS user_sessions (
      session_id TEXT PRIMARY KEY,
      credits_used INTEGER DEFAULT 0,
      credits_reset_at TIMESTAMPTZ,
      video_used INTEGER DEFAULT 0,
      video_reset_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS video_used INTEGER DEFAULT 0`
  await sql`ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS video_reset_at TIMESTAMPTZ`
}

export async function getRateLimitInfo(identifier: string): Promise<{
  limit: number
  remaining: number
  used: number
  resetAt: string
}> {
  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    
    // Get session info
    const result = await sql`
      SELECT credits_used, credits_reset_at FROM user_sessions 
      WHERE session_id = ${identifier}
    `
    
    if (result.length === 0) {
      // New session - return fresh limits
      const resetAt = getResetTime()
      await sql`
        INSERT INTO user_sessions (session_id, credits_used, credits_reset_at)
        VALUES (${identifier}, 0, ${resetAt.toISOString()})
      `
      return {
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT,
        used: 0,
        resetAt: resetAt.toISOString(),
      }
    }
    
    const session = result[0]
    const resetAt = new Date(session.credits_reset_at)
    
    // Check if expired
    if (resetAt <= now) {
      const newResetAt = getResetTime()
      await sql`
        UPDATE user_sessions 
        SET credits_used = 0, credits_reset_at = ${newResetAt.toISOString()}
        WHERE session_id = ${identifier}
      `
      return {
        limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT,
        used: 0,
        resetAt: newResetAt.toISOString(),
      }
    }
    
    return {
      limit: DAILY_LIMIT,
      remaining: Math.max(0, DAILY_LIMIT - session.credits_used),
      used: session.credits_used,
      resetAt: resetAt.toISOString(),
    }
  } catch (error) {
    console.error('[RateLimit] Error:', error)
    // Fail open
    return {
      limit: DAILY_LIMIT,
      remaining: DAILY_LIMIT,
      used: 0,
      resetAt: getResetTime().toISOString(),
    }
  }
}


export async function getVideoRateLimitInfo(identifier: string): Promise<{
  limit: number
  remaining: number
  used: number
  resetAt: string
}> {
  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()

    const result = await sql`
      SELECT video_used, video_reset_at FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      const resetAt = getResetTime()
      await sql`
        INSERT INTO user_sessions (session_id, video_used, video_reset_at)
        VALUES (${identifier}, 0, ${resetAt.toISOString()})
      `
      return { limit: DAILY_VIDEO_LIMIT, remaining: DAILY_VIDEO_LIMIT, used: 0, resetAt: resetAt.toISOString() }
    }

    const session = result[0]
    const resetAt = session.video_reset_at ? new Date(session.video_reset_at) : getResetTime()

    if (resetAt <= now) {
      const newResetAt = getResetTime()
      await sql`
        UPDATE user_sessions
        SET video_used = 0, video_reset_at = ${newResetAt.toISOString()}
        WHERE session_id = ${identifier}
      `
      return { limit: DAILY_VIDEO_LIMIT, remaining: DAILY_VIDEO_LIMIT, used: 0, resetAt: newResetAt.toISOString() }
    }

    return {
      limit: DAILY_VIDEO_LIMIT,
      remaining: Math.max(0, DAILY_VIDEO_LIMIT - (session.video_used || 0)),
      used: session.video_used || 0,
      resetAt: resetAt.toISOString(),
    }
  } catch (error) {
    console.error('[VideoRateLimit] Error:', error)
    return { limit: DAILY_VIDEO_LIMIT, remaining: DAILY_VIDEO_LIMIT, used: 0, resetAt: getResetTime().toISOString() }
  }
}

export async function incrementVideoUsage(identifier: string): Promise<void> {
  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    const resetAt = getResetTime()

    const result = await sql`
      SELECT video_used, video_reset_at FROM user_sessions
      WHERE session_id = ${identifier}
    `

    if (result.length === 0) {
      await sql`
        INSERT INTO user_sessions (session_id, video_used, video_reset_at)
        VALUES (${identifier}, 1, ${resetAt.toISOString()})
      `
    } else {
      const session = result[0]
      const sessionResetAt = session.video_reset_at ? new Date(session.video_reset_at) : now
      if (sessionResetAt <= now) {
        await sql`
          UPDATE user_sessions
          SET video_used = 1, video_reset_at = ${resetAt.toISOString()}
          WHERE session_id = ${identifier}
        `
      } else {
        await sql`
          UPDATE user_sessions
          SET video_used = COALESCE(video_used, 0) + 1
          WHERE session_id = ${identifier}
        `
      }
    }
  } catch (error) {
    console.error('[VideoRateLimit] Increment error:', error)
  }
}

export async function incrementUsage(identifier: string): Promise<void> {
  try {
    await ensureTable()
    const sql = getDb()
    const now = new Date()
    const resetAt = getResetTime()
    
    // Get current
    const result = await sql`
      SELECT credits_used, credits_reset_at FROM user_sessions 
      WHERE session_id = ${identifier}
    `
    
    if (result.length === 0) {
      // New session
      await sql`
        INSERT INTO user_sessions (session_id, credits_used, credits_reset_at)
        VALUES (${identifier}, 1, ${resetAt.toISOString()})
      `
    } else {
      const session = result[0]
      const sessionResetAt = new Date(session.credits_reset_at)
      
      if (sessionResetAt <= now) {
        // Expired - reset
        await sql`
          UPDATE user_sessions 
          SET credits_used = 1, credits_reset_at = ${resetAt.toISOString()}
          WHERE session_id = ${identifier}
        `
      } else {
        // Increment
        await sql`
          UPDATE user_sessions 
          SET credits_used = credits_used + 1
          WHERE session_id = ${identifier}
        `
      }
    }
  } catch (error) {
    console.error('[RateLimit] Increment error:', error)
  }
}
