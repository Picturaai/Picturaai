import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

async function verifySession(token: string): Promise<{ developerId: string } | null> {
  try {
    console.log('[v0] verifySession - Looking up token prefix:', token.substring(0, 8))
    const sessions = await sql`
      SELECT developer_id, expires_at FROM developer_sessions
      WHERE session_token = ${token}
    `
    console.log('[v0] verifySession - Found sessions:', sessions.length)
    
    if (sessions.length === 0) {
      console.log('[v0] verifySession - No session found for token')
      return null
    }
    
    const session = sessions[0]
    const expiresAt = new Date(session.expires_at)
    const now = new Date()
    
    console.log('[v0] verifySession - Session expires:', expiresAt, 'now:', now, 'expired:', expiresAt <= now)
    
    if (expiresAt <= now) {
      console.log('[v0] verifySession - Session expired')
      return null
    }
    
    console.log('[v0] verifySession - Valid session for developer:', session.developer_id)
    return { developerId: session.developer_id }
  } catch (err) {
    console.error('[v0] verifySession - Error:', err)
    return null
  }
}

function getTokenFromRequest(req: NextRequest): string | null {
  // First try cookie
  const cookieToken = req.cookies.get('pictura_session')?.value
  if (cookieToken) return cookieToken
  
  // Then try Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    console.log('[v0] Dashboard API - token found:', token ? 'yes' : 'no')
    
    if (!token) {
      console.log('[v0] Dashboard API - No token, returning 401')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await verifySession(token)
    console.log('[v0] Dashboard API - session verification result:', session ? 'valid' : 'invalid')
    
    if (!session) {
      console.log('[v0] Dashboard API - Invalid/expired session')
      return NextResponse.json({ error: 'Session expired' }, { status: 401 })
    }

    // Get developer data
    const developers = await sql`
      SELECT id, email, full_name, name, credits_balance, currency, created_at, last_login, 
             tier, phone, country_code, referral_source, email_verified, is_active
      FROM developers
      WHERE id = ${session.developerId}
    `

    if (developers.length === 0) {
      return NextResponse.json({ error: 'Developer not found' }, { status: 404 })
    }

    const developer = developers[0]

    // Get API keys (including active status)
    const apiKeys = await sql`
      SELECT id, name, key_prefix, created_at, last_used_at, requests_count, is_active
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
      FROM api_usage
      WHERE developer_id = ${developer.id}
    `

    const usageData = usage[0] || { this_month: 0, last_month: 0, total: 0 }

    // Get recent transactions
    const transactions = await sql`
      SELECT id, type, amount, description, balance_after, created_at
      FROM credit_transactions
      WHERE developer_id = ${developer.id}
      ORDER BY created_at DESC
      LIMIT 10
    `

    return NextResponse.json({
      id: developer.id,
      email: developer.email,
      name: developer.full_name || developer.name,
      creditsBalance: parseFloat(developer.credits_balance) || 0,
      currency: developer.currency || 'USD',
      tier: developer.tier || 'free',
      phone: developer.phone || '',
      countryCode: developer.country_code || 'US',
      emailVerified: developer.email_verified,
      isActive: developer.is_active,
      createdAt: developer.created_at,
      lastLogin: developer.last_login,
      apiKeys: apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPreview: k.key_prefix + '••••••••••••••••',
        createdAt: k.created_at,
        lastUsed: k.last_used_at,
        requestsCount: k.requests_count || 0,
        isActive: k.is_active !== false,
      })),
      usage: {
        thisMonth: Number(usageData.this_month) || 0,
        lastMonth: Number(usageData.last_month) || 0,
        totalRequests: Number(usageData.total) || 0,
      },
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount) || 0,
        description: t.description,
        balanceAfter: parseFloat(t.balance_after) || 0,
        createdAt: t.created_at,
      })),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
