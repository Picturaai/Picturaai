import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid API key' }, { status: 401 })
    }

    const apiKey = authHeader.substring(7)
    
    // Verify API key and get developer
    const [keyRecord] = await sql`
      SELECT ak.*, d.id as developer_id, d.credits, d.currency
      FROM api_keys ak
      JOIN developers d ON ak.developer_id = d.id
      WHERE ak.key = $1 AND ak.status = 'active'
    `
    
    if (!keyRecord) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { developer_id, credits, currency } = keyRecord
    const body = await request.json()
    const { prompt, model = 'pi-1.5-turbo', width = 1024, height = 1024 } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt parameter' }, { status: 400 })
    }

    // Calculate cost (0.02 per generation for demo)
    const costUSD = 0.02
    const costInUserCurrency = currency === 'NGN' ? costUSD * 1550 : costUSD // Simple exchange rate
    
    if (credits < costInUserCurrency) {
      return NextResponse.json({ 
        error: 'Insufficient credits', 
        required_credits: costInUserCurrency,
        available_credits: credits 
      }, { status: 402 })
    }

    // Call third-party API (placeholder - would be actual AI service)
    const externalApiResponse = await fetch('https://api.example.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.THIRD_PARTY_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        model,
        width,
        height,
      }),
    })

    if (!externalApiResponse.ok) {
      const error = await externalApiResponse.text()
      return NextResponse.json({ 
        error: 'Failed to generate image',
        details: error 
      }, { status: 500 })
    }

    const imageData = await externalApiResponse.json()

    // Deduct credits
    await sql`
      UPDATE developers 
      SET credits = credits - $1 
      WHERE id = $2
    `(costInUserCurrency, developer_id)

    // Log usage
    await sql`
      INSERT INTO api_usage (developer_id, endpoint, model, cost, credits_deducted, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `(developer_id, '/v1/generate', model, costUSD, costInUserCurrency, 'success')

    // Check if credits are low and send alert
    const [updatedDev] = await sql`SELECT credits FROM developers WHERE id = $1`(developer_id)
    if (updatedDev.credits < costInUserCurrency * 5) { // Alert if less than 5 generations worth
      // Send low credit alert email (will implement in email task)
    }

    return NextResponse.json({
      success: true,
      image_url: imageData.url,
      credits_used: costInUserCurrency,
      credits_remaining: updatedDev.credits,
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
