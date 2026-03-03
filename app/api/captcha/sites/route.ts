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

    const sites = await sql`
      SELECT 
        id, domain, site_key, secret_key, verified, created_at,
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

    const { domain } = await req.json()

    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
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

    const result = await sql`
      INSERT INTO captcha_sites (developer_id, domain, site_key, secret_key, verified)
      VALUES (${dev.id}, ${domain.toLowerCase()}, ${siteKey}, ${secretKey}, true)
      RETURNING id, domain, site_key, secret_key, verified, created_at, 0 as challenges_solved, 0 as challenges_failed
    `

    return NextResponse.json({ site: result[0] })
  } catch (error) {
    console.error('Failed to add site:', error)
    return NextResponse.json({ error: 'Failed to add site' }, { status: 500 })
  }
}
