import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

function generateSiteKey() {
  return 'pk_live_' + crypto.randomBytes(16).toString('hex')
}

function generateSecretKey() {
  return 'sk_live_' + crypto.randomBytes(24).toString('hex')
}

async function getDevFromSession(request?: NextRequest) {
  const cookieStore = await cookies()
  let sessionToken = cookieStore.get('pictura_session')?.value
  
  // Fallback to Authorization header
  if (!sessionToken && request) {
    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7)
    }
  }
  
  if (!sessionToken) return null
  
  const sessions = await sql`
    SELECT d.id, d.name, d.email 
    FROM developer_sessions s
    JOIN developers d ON d.id = s.developer_id
    WHERE s.session_token = ${sessionToken}
    AND s.expires_at > NOW()
  `
  
  return sessions[0] || null
}

// GET - List all sites for the developer
export async function GET(request: NextRequest) {
  try {
    const dev = await getDevFromSession(request)
    if (!dev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure captcha_sites table exists
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS captcha_sites (
          id SERIAL PRIMARY KEY,
          developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
          email VARCHAR(255),
          site_name VARCHAR(255) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          site_key VARCHAR(64) UNIQUE NOT NULL,
          secret_hash VARCHAR(64) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          challenges_solved INTEGER DEFAULT 0,
          challenges_failed INTEGER DEFAULT 0
        )
      `
    } catch (tableError) {
      // Table might already exist
      console.log('Table check:', tableError)
    }

    const sites = await sql`
      SELECT 
        id, domain, site_name, site_key, is_active, created_at,
        COALESCE(challenges_solved, 0) as challenges_solved,
        COALESCE(challenges_failed, 0) as challenges_failed
      FROM captcha_sites 
      WHERE developer_id = ${dev.id}
      ORDER BY created_at DESC
    `

    return NextResponse.json({ sites })
  } catch (error) {
    console.error('Failed to fetch sites:', error)
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 })
  }
}

// POST - Add a new site
export async function POST(req: NextRequest) {
  try {
    const dev = await getDevFromSession(req)
    if (!dev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { domain, siteName } = await req.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Ensure captcha_sites table exists with all required columns
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS captcha_sites (
          id SERIAL PRIMARY KEY,
          developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE,
          email VARCHAR(255),
          site_name VARCHAR(255) NOT NULL,
          domain VARCHAR(255) NOT NULL,
          site_key VARCHAR(64) UNIQUE NOT NULL,
          secret_hash VARCHAR(64) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          challenges_solved INTEGER DEFAULT 0,
          challenges_failed INTEGER DEFAULT 0
        )
      `
    } catch (tableError) {
      console.log('Table creation check:', tableError)
    }

    // Ensure developer_id column exists (for backwards compatibility)
    try {
      await sql`ALTER TABLE captcha_sites ADD COLUMN IF NOT EXISTS developer_id INTEGER REFERENCES developers(id) ON DELETE CASCADE`
    } catch (colError) {
      // Column might already exist - continue
      console.log('Column check:', colError)
    }

    // Check if domain already exists for this developer
    const existing = await sql`
      SELECT id FROM captcha_sites 
      WHERE developer_id = ${dev.id} AND domain = ${domain.toLowerCase()}
    `
    
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Domain already registered' }, { status: 400 })
    }

    const siteKey = generateSiteKey()
    const secretKey = generateSecretKey()
    const secretHash = crypto.createHash('sha256').update(secretKey).digest('hex')
    const name = siteName || domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('.')[0]

    const result = await sql`
      INSERT INTO captcha_sites (developer_id, email, site_name, domain, site_key, secret_hash, is_active)
      VALUES (${dev.id}, ${dev.email}, ${name}, ${domain.toLowerCase()}, ${siteKey}, ${secretHash}, true)
      RETURNING id, domain, site_name, site_key, is_active, created_at, 0 as challenges_solved, 0 as challenges_failed
    `

    // Return the plain secret key only on creation (won't be stored)
    return NextResponse.json({ 
      site: result[0],
      secretKey: secretKey // Only shown once on creation
    })
  } catch (error) {
    console.error('Failed to add site:', error)
    return NextResponse.json({ error: 'Failed to add site' }, { status: 500 })
  }
}
