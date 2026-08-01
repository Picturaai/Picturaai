import { NextRequest, NextResponse } from 'next/server'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { sql } from '@/lib/db'
import { requireDeveloperSession } from '@/lib/developer-auth'

async function getDeveloperById(developerId: string) {
  try {
    return await sql`
      SELECT id, email, full_name, name, credits_balance, currency, created_at, last_login,
             tier, phone, country_code, referral_source, email_verified, is_active, signup_method
      FROM developers
      WHERE id = ${developerId}
    `
  } catch {
    return await sql`
      SELECT id, email, full_name, null::text as name, credits_balance, currency, created_at,
             null::timestamp as last_login, null::text as tier, phone_number as phone,
             country as country_code, null::text as referral_source, is_verified as email_verified,
             is_active, null::text as signup_method
      FROM developers
      WHERE id = ${developerId}
    `
  }
}

async function getApiKeysForDeveloper(developerId: string) {
  try {
    return await sql`
      SELECT id, name, key_prefix, secret_key, created_at, last_used_at, requests_count, is_active
      FROM api_keys
      WHERE developer_id = ${developerId}
      ORDER BY created_at DESC
    `
  } catch {
    return await sql`
      SELECT id, name, key_prefix, null::text as secret_key, created_at, last_used_at,
             0::integer as requests_count, is_active
      FROM api_keys
      WHERE developer_id = ${developerId}
      ORDER BY created_at DESC
    `
  }
}

async function getRecentTransactions(developerId: string) {
  try {
    return await sql`
      SELECT id, type, amount, description, balance_after, created_at
      FROM credit_transactions
      WHERE developer_id = ${developerId}
      ORDER BY created_at DESC
      LIMIT 10
    `
  } catch {
    return await sql`
      SELECT id, type, amount, description, amount as balance_after, created_at
      FROM credit_transactions
      WHERE developer_id = ${developerId}
      ORDER BY created_at DESC
      LIMIT 10
    `
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireDeveloperSession(req)
    if (!session.ok) return session.response

    // Get developer data
    const developers = await getDeveloperById(session.developerId)

    if (developers.length === 0) {
      return errorResponse('Developer not found', 404)
    }

    const developer = developers[0]

    // Get API keys (including secret_key for display when available)
    const apiKeys = await getApiKeysForDeveloper(developer.id)

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
    const transactions = await getRecentTransactions(developer.id)

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
      signupMethod: developer.signup_method || 'pictura',
      apiKeys: apiKeys.map((k) => ({
        id: k.id,
        name: k.name,
        keyPreview: k.key_prefix + '••••••••••••••••',
        secret_key: k.secret_key || null,
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
    return serverErrorResponse('Dashboard error', error)
  }
}
