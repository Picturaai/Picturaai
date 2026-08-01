import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { sql } from '@/lib/db'
import { requireDeveloperSession } from '@/lib/developer-auth'
import { hashPassword } from '@/lib/email'

function generateApiKey(): string {
  return 'pic_' + crypto.randomBytes(32).toString('hex')
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireDeveloperSession(req)
    if (!session.ok) return session.response

    const { name } = await req.json()

    if (!name) {
      return errorResponse('Name is required', 400)
    }

    // Generate API key
    const apiKey = generateApiKey()
    const keyPrefix = apiKey.slice(0, 12)
    const keyHash = hashPassword(apiKey)

    // Store the full key (secret_key) in database for display
    const keys = await sql`
      INSERT INTO api_keys (developer_id, name, key_prefix, key_hash, secret_key, is_active)
      VALUES (${session.developerId}, ${name}, ${keyPrefix}, ${keyHash}, ${apiKey}, true)
      RETURNING id, name, created_at
    `

    if (keys.length === 0) {
      return errorResponse('Failed to create API key', 500)
    }

    const key = keys[0]

    // Return the full API key only once - it cannot be retrieved later
    return NextResponse.json({
      success: true,
      id: key.id,
      name: key.name,
      key: apiKey, // Full key - only shown once!
      keyPreview: keyPrefix + '••••••••••••••••',
      createdAt: key.created_at,
      message: 'Save this key securely - it will not be shown again'
    })
  } catch (error) {
    return serverErrorResponse('API key creation error', error)
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireDeveloperSession(req)
    if (!session.ok) return session.response

    const keys = await sql`
      SELECT id, name, key_prefix, created_at, last_used_at, requests_count, is_active
      FROM api_keys
      WHERE developer_id = ${session.developerId}
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      keys: keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPreview: k.key_prefix + '••••••••••••••••',
        createdAt: k.created_at,
        lastUsed: k.last_used_at,
        requestsCount: k.requests_count || 0,
        isActive: k.is_active !== false,
      }))
    })
  } catch (error) {
    return serverErrorResponse('API keys list error', error)
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireDeveloperSession(req)
    if (!session.ok) return session.response

    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')

    if (!keyId) {
      return errorResponse('Key ID is required', 400)
    }

    // Actually delete the key (not just deactivate)
    const result = await sql`
      DELETE FROM api_keys 
      WHERE id = ${keyId} AND developer_id = ${session.developerId}
      RETURNING id
    `

    if (result.length === 0) {
      return errorResponse('Key not found', 404)
    }

    return NextResponse.json({ success: true, message: 'API key deleted' })
  } catch (error) {
    return serverErrorResponse('API key deletion error', error)
  }
}
