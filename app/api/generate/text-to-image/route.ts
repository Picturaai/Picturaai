import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'

// Provider-specific generation functions
async function generateWithZyLabs(prompt: string): Promise<string> {
  const apiKey = process.env.ZYLABS_API_KEY
  if (!apiKey) throw new Error('ZyLabs API key not configured')

  const params = new URLSearchParams({
    prompt: prompt.trim(),
    width: '1024',
    height: '1024',
  })
  const apiUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20188/text+to+image?${params.toString()}`
  
  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${apiKey}` },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('ZyLabs API error:', response.status, errorText)
    throw new Error('ZyLabs generation failed')
  }

  const data = await response.json()
  return extractImageUrl(data)
}

async function generateWithStability(prompt: string): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability API key not configured')

  // Stability AI SD3 requires multipart/form-data
  const formData = new FormData()
  formData.append('prompt', prompt.trim())
  formData.append('output_format', 'png')
  formData.append('aspect_ratio', '1:1')
  formData.append('model', 'sd3-large')

  const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'image/*',
    },
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[v0] Stability API error:', response.status, errorText)
    throw new Error(`Stability generation failed: ${response.status}`)
  }

  // SD3 returns raw image bytes when Accept: image/*
  const imageBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(imageBuffer).toString('base64')
  return `data:image/png;base64,${base64}`
}

async function generateWithLeonardo(prompt: string): Promise<string> {
  const apiKey = process.env.LEONARDO_API_KEY
  if (!apiKey) throw new Error('Leonardo API key not configured')

  // First, create a generation
  const createResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      modelId: '6b645e3a-d64f-4341-a6d8-7a3690fbf042', // Leonardo Phoenix
      width: 1024,
      height: 1024,
      num_images: 1,
    }),
  })

  if (!createResponse.ok) {
    const errorText = await createResponse.text()
    console.error('Leonardo API error:', createResponse.status, errorText)
    throw new Error('Leonardo generation failed')
  }

  const createData = await createResponse.json()
  const generationId = createData.sdGenerationJob?.generationId

  if (!generationId) throw new Error('No generation ID from Leonardo')

  // Poll for completion
  for (let i = 0; i < 30; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const statusResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (!statusResponse.ok) continue

    const statusData = await statusResponse.json()
    const images = statusData.generations_by_pk?.generated_images

    if (images && images.length > 0) {
      return images[0].url
    }
  }

  throw new Error('Leonardo generation timed out')
}

async function generateWithMistral(prompt: string): Promise<string> {
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
      size: '1024x1024',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[v0] Mistral API error:', response.status, errorText)
    throw new Error('Mistral generation failed')
  }

  const data = await response.json()
  
  // Mistral returns base64 encoded image
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

function extractImageUrl(data: Record<string, unknown>): string {
  // Try all known fields
  if (data.image && typeof data.image === 'string') return data.image
  if (data.url && typeof data.url === 'string') return data.url
  if (data.output && typeof data.output === 'string') return data.output
  if (data.result && typeof data.result === 'string') return data.result
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    const img = data.images[0] as Record<string, unknown>
    return (img.url || img.src || img.image) as string
  }
  if (data.data && typeof data.data === 'object') {
    const d = data.data as Record<string, unknown>
    if (d.image) return d.image as string
    if (d.url) return d.url as string
    if (d.images && Array.isArray(d.images) && d.images.length > 0) {
      return (d.images[0] as Record<string, unknown>).url as string
    }
  }
  throw new Error('Could not extract image URL from response')
}

export async function POST(request: Request) {
  try {
    const { prompt, model = 'pi-1.0' } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 })
    }

    // Check rate limit using session ID
    const sessionId = await getOrCreateSessionId()
    const rateLimitInfo = await getRateLimitInfo(sessionId)

    if (rateLimitInfo.remaining <= 0) {
      return NextResponse.json(
        {
          error: 'Daily limit reached. You can generate up to 5 images per day during beta.',
          rateLimitInfo,
        },
        { status: 429 }
      )
    }

    // Generate based on selected model with automatic fallback
    let imageUrl: string
    const providers = model === 'pi-1.5-turbo' 
      ? [generateWithStability, generateWithLeonardo, generateWithMistral, generateWithZyLabs]
      : [generateWithZyLabs, generateWithMistral, generateWithStability, generateWithLeonardo]
    
    let lastError: Error | null = null
    for (const provider of providers) {
      try {
        imageUrl = await provider(prompt)
        break // Success, exit loop
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.log(`[v0] Provider failed, trying next: ${lastError.message}`)
        continue // Try next provider
      }
    }

    if (!imageUrl!) {
      console.error('All providers failed:', lastError)
      return NextResponse.json(
        { error: 'Image generation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Handle base64 images (from Stability)
    let imageBuffer: ArrayBuffer
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1]
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // Download the generated image
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to download generated image' },
          { status: 500 }
        )
      }
      imageBuffer = await imageResponse.arrayBuffer()
    }

    const timestamp = Date.now()
    const filename = `pictura/text-to-image/${timestamp}-${model}-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`

    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    })

    // Increment usage after successful generation
    await incrementUsage(sessionId)
    const updatedRateLimitInfo = await getRateLimitInfo(sessionId)

    return NextResponse.json({
      url: blob.url,
      prompt: prompt.trim(),
      model,
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
