import type { NextRequest } from 'next/server'
import type { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { errorResponse } from '@/lib/api-response'

export type ApiKeyContext = {
  keyId: string
  developerId: string
  credits: number
  tier: string | null
}

export type ApiKeyAuthResult =
  | { ok: true; context: ApiKeyContext }
  | { ok: false; response: NextResponse }

/** Validates the `Authorization: Bearer <api key>` header for public /v1 routes. */
export async function authenticateApiKey(request: NextRequest): Promise<ApiKeyAuthResult> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, response: errorResponse('Missing API key', 401) }
  }

  const apiKey = authHeader.substring(7)
  const keyResult = await sql`
    SELECT ak.id, ak.developer_id, d.credits, d.tier
    FROM api_keys ak
    JOIN developers d ON ak.developer_id = d.id
    WHERE ak.key = ${apiKey} AND ak.is_active = true
  `

  if (keyResult.length === 0) {
    return { ok: false, response: errorResponse('Invalid API key', 401) }
  }

  const row = keyResult[0]
  return {
    ok: true,
    context: {
      keyId: row.id,
      developerId: row.developer_id,
      credits: row.credits,
      tier: row.tier ?? null,
    },
  }
}

/** Returns a 402 response when the developer cannot cover `cost`. */
export function insufficientCredits(
  context: ApiKeyContext,
  cost: number,
  includeAmounts = false
): NextResponse | null {
  if (context.credits >= cost) return null
  return errorResponse(
    'Insufficient credits',
    402,
    includeAmounts ? { required: cost, available: context.credits } : undefined
  )
}

export type UsageRecord = {
  developerId: string
  endpoint: string
  creditsUsed: number
  generationTimeMs: number
  promptLength?: number
  status?: string
}

/** Deducts credits and writes the usage_analytics row for a successful call. */
export async function recordApiUsage({
  developerId,
  endpoint,
  creditsUsed,
  generationTimeMs,
  promptLength,
  status = 'success',
}: UsageRecord): Promise<void> {
  await sql`UPDATE developers SET credits = credits - ${creditsUsed} WHERE id = ${developerId}`

  if (promptLength === undefined) {
    await sql`
      INSERT INTO usage_analytics (developer_id, endpoint, generation_time_ms, credits_used, status)
      VALUES (${developerId}, ${endpoint}, ${generationTimeMs}, ${creditsUsed}, ${status})
    `
    return
  }

  await sql`
    INSERT INTO usage_analytics (developer_id, endpoint, prompt_length, generation_time_ms, credits_used, status)
    VALUES (${developerId}, ${endpoint}, ${promptLength}, ${generationTimeMs}, ${creditsUsed}, ${status})
  `
}
