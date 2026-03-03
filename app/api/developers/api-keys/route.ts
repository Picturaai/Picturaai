import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'

const sql = neon(process.env.DATABASE_URL!)

async function verifySession(token: string): Promise<{ developerId: string } | null> {
  try {
    const sessions = await sql`
      SELECT developer_id FROM developer_sessions
      WHERE session_token = ${token} AND expires_at > now()
    `
    if (sessions.length === 0) return null
    return { developerId: sessions[0].developer_id }
  } catch {
    return null
  }
}

function generateApiKey(): string {
  return 'pk_' + crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const session = await verifySession(token)

    if (!session) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const apiKey = generateApiKey()

    const keys = await sql`
      INSERT INTO api_keys (developer_id, name, api_key)
      VALUES (${session.developerId}, ${name}, ${apiKey})
      RETURNING id, name, api_key, created_at
    `

    if (keys.length === 0) {
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    const key = keys[0]

    return NextResponse.json({
      id: key.id,
      name: key.name,
      key: key.api_key,
      created_at: key.created_at,
      last_used: null,
      requests_count: 0,
    })
  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
