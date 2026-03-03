import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { hashPassword } from '@/lib/email'

const sql = neon(process.env.DATABASE_URL!)

// Pictura AI Image Generation Engine (Internal)
// Uses multiple providers with automatic failover
async function generateWithPicturaEngine(prompt: string, width: number, height: number): Promise<string> {
  const providers = [
    generateWithStability,
    generateWithLeonardo,
    generateWithZyLabs,
  ]
  
  for (const provider of providers) {
    try {
      return await provider(prompt, width, height)
    } catch (err) {
      console.error('Provider failed, trying next:', err)
      continue
    }
  }
  
  throw new Error('All generation providers failed')
}

// Stability AI
async function generateWithStability(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability not configured')

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt, weight: 1 }],
      cfg_scale: 7,
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      samples: 1,
      steps: 30,
    }),
  })

  if (!response.ok) throw new Error('Stability generation failed')

  const data = await response.json()
  if (data.artifacts?.[0]?.base64) {
    return `data:image/png;base64,${data.artifacts[0].base64}`
  }
  throw new Error('No image from Stability')
}

// Leonardo AI
async function generateWithLeonardo(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('Leonardo not configured')

  const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042',
      width: Math.min(width, 1024),
      height: Math.min(height, 1024),
      num_images: 1,
    }),
  })

  if (!createResponse.ok) throw new Error('Leonardo creation failed')

  const createData = await createResponse.json()
  const generationId = createData.sdGenerationJob?.generationId
  if (!generationId) throw new Error('No generation ID')

  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (!statusResponse.ok) continue
    const statusData = await statusResponse.json()
    const images = statusData.generations_by_pk?.generated_images
    if (images?.[0]?.url) return images[0].url
  }
  throw new Error('Leonardo timed out')
}

// ZyLabs
async function generateWithZyLabs(prompt: string, width: number, height: number): Promise<string> {
  const apiKey = process.env.ZYLABS_API_KEY
  if (!apiKey) throw new Error('ZyLabs not configured')

  const response = await fetch('https://api.zylabs.io/v1/image/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      width,
      height,
      model: 'stable-diffusion-xl',
    }),
  })

  if (!response.ok) throw new Error('ZyLabs generation failed')

  const data = await response.json()
  if (data.url || data.image_url) return data.url || data.image_url
  if (data.base64) return `data:image/png;base64,${data.base64}`
  throw new Error('No image from ZyLabs')
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

    // Generate image using Pictura AI Engine
    let imageUrl: string
    try {
      imageUrl = await generateWithPicturaEngine(prompt, width || 1024, height || 1024)
    } catch {
      return NextResponse.json({ 
        error: 'Image generation failed. Please try again.',
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
        id: imageData.id,
        url: imageUrl,
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
    service: 'Pictura AI',
    version: 'v1',
    engine: 'Pictura Image Engine 1.5',
    endpoints: [
      { method: 'POST', path: '/v1/generate', description: 'Generate an image using Pictura AI' },
    ],
    models: [
      { id: 'pi-1.5-turbo', name: 'Pictura 1.5 Turbo', description: 'Fast, high-quality image generation' },
      { id: 'pi-1.0', name: 'Pictura 1.0', description: 'Balanced quality and speed' },
    ],
    pricing: {
      per_image_usd: COST_PER_IMAGE_USD,
      local_prices: LOCAL_PRICES,
    }
  })
}
