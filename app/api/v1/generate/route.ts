import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

// Generate image using Mistral Pixtral API
async function generateWithMistral(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral API key not configured')

  const response = await fetch('https://api.mistral.ai/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'pixtral-large-latest',
      prompt: prompt.trim(),
      size: `${width}x${height}`,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[API v1] Mistral error:', response.status, errorText)
    throw new Error('Mistral generation failed')
  }

  const data = await response.json()
  
  if (data.data && data.data[0]) {
    const imageData = data.data[0]
    if (imageData.b64_json) {
      return `data:image/png;base64,${imageData.b64_json}`
    }
    if (imageData.url) {
      return imageData.url
    }
  }
  
  throw new Error('Could not extract image from Mistral response')
}

// Cost per image in USD - very affordable!
const COST_PER_IMAGE_USD = 0.01

// Currency conversion rates (approximate)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1600,  // $0.01 = ~16 NGN, but we charge 5 NGN to be competitive
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.35,
  AUD: 1.53,
  ZAR: 19,
  KES: 129,
  GHS: 12.4,
  INR: 84,
  JPY: 150,
  BRL: 5,
}

// Price per image in local currency (keeping it affordable)
const LOCAL_PRICES: Record<string, number> = {
  USD: 0.01,
  NGN: 5,      // Very affordable - 5 naira per image
  GBP: 0.008,
  EUR: 0.009,
  CAD: 0.013,
  AUD: 0.015,
  ZAR: 0.19,
  KES: 1.29,
  GHS: 0.12,
  INR: 0.84,
  JPY: 1.5,
  BRL: 0.05,
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid API key',
        code: 'unauthorized' 
      }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    const keyPrefix = apiKey.slice(0, 12)
    const keyHash = hashPassword(apiKey)
    
    // Find developer by API key
    const keyRecords = await sql`
      SELECT ak.id as key_id, ak.name as key_name, d.id as developer_id, d.full_name, d.credits_balance, d.currency
      FROM api_keys ak
      JOIN developers d ON ak.developer_id = d.id
      WHERE ak.key_prefix = ${keyPrefix} AND ak.key_hash = ${keyHash} AND ak.is_active = true
    `
    
    if (keyRecords.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid API key',
        code: 'invalid_key' 
      }, { status: 401 })
    }

    const { developer_id, full_name, credits_balance, currency } = keyRecords[0]

    // Parse request body
    const body = await request.json()
    const { prompt, model = 'pi-1.5-turbo', size = '1024x1024', negative_prompt } = body

    if (!prompt) {
      return NextResponse.json({ 
        error: 'Missing prompt parameter',
        code: 'missing_prompt' 
      }, { status: 400 })
    }

    // Calculate cost in user's currency
    const costInLocalCurrency = LOCAL_PRICES[currency] || COST_PER_IMAGE_USD
    
    if (credits_balance < costInLocalCurrency) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        code: 'insufficient_credits',
        required: costInLocalCurrency,
        available: credits_balance,
        currency: currency
      }, { status: 402 })
    }

    // Parse size
    const [width, height] = size.split('x').map(Number)

    // Generate image using Mistral (Pixtral) API directly
    let imageUrl: string
    try {
      imageUrl = await generateWithMistral(prompt, width || 1024, height || 1024)
    } catch (err) {
      console.error('[API v1] Mistral generation failed:', err)
      return NextResponse.json({ 
        error: 'Image generation failed',
        code: 'generation_failed'
      }, { status: 500 })
    }

    const imageData = { url: imageUrl, id: `img_${Date.now()}` }

    // Deduct credits
    await sql`
      UPDATE developers 
      SET credits_balance = credits_balance - ${costInLocalCurrency},
          updated_at = NOW()
      WHERE id = ${developer_id}
    `

    // Log the API usage
    await sql`
      INSERT INTO api_usage (developer_id, endpoint, model, credits_used, request_data, response_status)
      VALUES (${developer_id}, '/v1/generate', ${model}, ${costInLocalCurrency}, ${JSON.stringify({ prompt, model, size })}, 'success')
    `

    // Get updated balance
    const updatedDev = await sql`SELECT credits_balance FROM developers WHERE id = ${developer_id}`
    const newBalance = updatedDev[0]?.credits_balance || 0

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (developer_id, type, amount, usd_equivalent, description)
      VALUES (${developer_id}, 'api_usage', ${-costInLocalCurrency}, ${-COST_PER_IMAGE_USD}, ${'API generation: ' + prompt.slice(0, 50)})
    `

    return NextResponse.json({
      success: true,
      data: {
        id: imageData.id || `img_${Date.now()}`,
        url: imageData.imageUrl || imageData.url,
        prompt: prompt,
        model: model,
        size: size,
        created_at: new Date().toISOString(),
      },
      usage: {
        credits_used: costInLocalCurrency,
        credits_remaining: newBalance,
        currency: currency,
      }
    })

  } catch (error) {
    console.error('[v0] API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      code: 'internal_error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Also support GET for checking API status
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    version: 'v1',
    endpoints: [
      { method: 'POST', path: '/v1/generate', description: 'Generate an image from text' },
    ],
    pricing: {
      per_image_usd: COST_PER_IMAGE_USD,
      local_prices: LOCAL_PRICES,
    }
  })
}
