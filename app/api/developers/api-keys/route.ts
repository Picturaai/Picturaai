import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import crypto from 'crypto'
import { hashPassword } from '@/lib/email'

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
  return 'pk_live_' + crypto.randomBytes(32).toString('hex')
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

    // Generate API key
    const apiKey = generateApiKey()
    const keyPrefix = apiKey.slice(0, 12)
    const keyHash = hashPassword(apiKey)

    const keys = await sql`
      INSERT INTO api_keys (developer_id, name, key_prefix, key_hash)
      VALUES (${session.developerId}, ${name}, ${keyPrefix}, ${keyHash})
      RETURNING id, name, created_at
    `

    if (keys.length === 0) {
      return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    const key = keys[0]

    // Return the full API key only once - it cannot be retrieved later
    return NextResponse.json({
      id: key.id,
      name: key.name,
      key: apiKey, // Full key - only shown once!
      key_prefix: keyPrefix,
      created_at: key.created_at,
      message: 'Save this key securely - it will not be shown again'
    })
  } catch (error) {
    console.error('API key creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
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

    const keys = await sql`
      SELECT id, name, key_prefix, created_at, last_used, is_active
      FROM api_keys
      WHERE developer_id = ${session.developerId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      keys: keys.map(k => ({
        id: k.id,
        name: k.name,
        key_preview: k.key_prefix + '...',
        created_at: k.created_at,
        last_used: k.last_used,
        is_active: k.is_active,
      }))
    })
  } catch (error) {
    console.error('API keys list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
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

    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Key ID is required' }, { status: 400 })
    }

    await sql`
      UPDATE api_keys SET is_active = false
      WHERE id = ${id} AND developer_id = ${session.developerId}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API key deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
