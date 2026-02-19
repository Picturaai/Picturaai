import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 })
    }

    // Check rate limit
    const clientIp = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitInfo = getRateLimitInfo(clientIp)

    if (rateLimitInfo.remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Daily limit reached. You can generate up to 5 images per day during beta.',
          rateLimitInfo,
        },
        { status: 429 }
      )
    }

    const apiKey = process.env.ZYLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Call ZyLabs Text-to-Image API (requires width & height params)
    const params = new URLSearchParams({
      prompt: prompt.trim(),
      width: '1024',
      height: '1024',
    })
    const apiUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20188/text+to+image?${params.toString()}`
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ZyLabs API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Image generation failed. Please try again.' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[v0] ZyLabs text-to-image response:', JSON.stringify(data).slice(0, 500))

    // The API may return the image in various formats - try all known fields
    let imageUrl: string | null = null

    // Direct URL fields
    if (data.image && typeof data.image === 'string') imageUrl = data.image
    else if (data.url && typeof data.url === 'string') imageUrl = data.url
    else if (data.output && typeof data.output === 'string') imageUrl = data.output
    else if (data.result && typeof data.result === 'string') imageUrl = data.result
    // Nested in images array (fal.ai style)
    else if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      imageUrl = data.images[0].url || data.images[0].src || data.images[0].image
    }
    // Nested in data field
    else if (data.data?.image) imageUrl = data.data.image
    else if (data.data?.url) imageUrl = data.data.url
    else if (data.data?.images?.[0]?.url) imageUrl = data.data.images[0].url

    if (!imageUrl) {
      console.error('[v0] Unexpected API response format:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Unexpected response from image generation service' },
        { status: 500 }
      )
    }

    // Download the generated image
    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download generated image' },
        { status: 500 }
      )
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const timestamp = Date.now()
    const filename = `pictura/text-to-image/${timestamp}-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`

    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    })

    // Increment usage after successful generation
    incrementUsage(clientIp)
    const updatedRateLimitInfo = getRateLimitInfo(clientIp)

    return NextResponse.json({
      url: blob.url,
      prompt: prompt.trim(),
      type: 'text-to-image',
      createdAt: new Date().toISOString(),
      rateLimitInfo: updatedRateLimitInfo,
    })
  } catch (error) {
    console.error('Text-to-image generation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
