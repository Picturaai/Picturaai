import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import jwt from 'jsonwebtoken'

const sql = neon(process.env.DATABASE_URL!)

function verifyToken(token: string): { developerId: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      developerId: string
    }
    return decoded
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get developer data
    const developers = await sql`
      SELECT id, email, full_name, credits_balance, currency
      FROM developers
      WHERE id = ${decoded.developerId}
    `

    if (developers.length === 0) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    const developer = developers[0]

    // Get API keys
    const apiKeys = await sql`
      SELECT id, name, api_key, created_at, last_used_at, requests_count
      FROM api_keys
      WHERE developer_id = ${developer.id}
      ORDER BY created_at DESC
    `

    // Get usage stats
    const thisMonth = new Date()
    const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1, 1)

    const usage = await sql`
      SELECT
        SUM(CASE WHEN created_at >= date_trunc('month', now()) THEN 1 ELSE 0 END) as this_month,
        SUM(CASE WHEN created_at >= ${lastMonth} AND created_at < date_trunc('month', now()) THEN 1 ELSE 0 END) as last_month,
        COUNT(*) as total
      FROM api_requests
      WHERE developer_id = ${developer.id}
    `

    const usageData = usage[0] || { this_month: 0, last_month: 0, total: 0 }

    return NextResponse.json({
      id: developer.id,
      email: developer.email,
      name: developer.full_name,
      creditsBalance: developer.credits_balance,
      currency: developer.currency,
      apiKeys: apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        key: k.api_key,
        created_at: k.created_at,
        last_used: k.last_used_at,
        requests_count: k.requests_count || 0,
      })),
      usage: {
        thisMonth: Number(usageData.this_month) || 0,
        lastMonth: Number(usageData.last_month) || 0,
        totalRequests: Number(usageData.total) || 0,
      },
    })
  } catch (error) {
    console.error('[v0] Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
