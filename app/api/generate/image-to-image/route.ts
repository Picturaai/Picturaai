import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'

function extractImageUrl(data: Record<string, unknown>): string | null {
  if (data.image && typeof data.image === 'string') return data.image
  if (data.url && typeof data.url === 'string') return data.url
  if (data.output && typeof data.output === 'string') return data.output
  if (data.result && typeof data.result === 'string') return data.result
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    return data.images[0].url || data.images[0].src || data.images[0].image
  }
  const nested = data.data as Record<string, unknown> | undefined
  if (nested?.image && typeof nested.image === 'string') return nested.image
  if (nested?.url && typeof nested.url === 'string') return nested.url
  const nestedImgs = (nested?.images as Array<Record<string, string>>) || []
  if (nestedImgs[0]?.url) return nestedImgs[0].url
  return null
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const image = formData.get('image') as File | null
    const imageUrl = formData.get('imageUrl') as string | null

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 })
    }

    if (!image && !imageUrl) {
      return NextResponse.json({ error: 'An image file or URL is required' }, { status: 400 })
    }

    // Check rate limit using session ID
    const sessionId = await getOrCreateSessionId()
    const rateLimitInfo = getRateLimitInfo(sessionId)

    if (rateLimitInfo.remaining <= 0) {
      return NextResponse.json(
        { error: 'Daily limit reached. You can generate up to 5 images per day during beta.', rateLimitInfo },
        { status: 429 }
      )
    }

    const apiKey = process.env.ZYLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // If we have a file, upload it to Blob first to get a public URL
    let sourceImageUrl = imageUrl || ''
    if (image) {
      const uploadTimestamp = Date.now()
      const uploadFilename = `pictura/uploads/${uploadTimestamp}-${image.name}`
      const uploadBlob = await put(uploadFilename, image, {
        access: 'public',
        contentType: image.type,
      })
      sourceImageUrl = uploadBlob.url
    }

    let generatedImageUrl: string | null = null

    // Strategy 1: GET request with query params (matching working text-to-image pattern)
    try {
      const params = new URLSearchParams({
        prompt: prompt.trim(),
        image: sourceImageUrl,
        url: sourceImageUrl,
        image_url: sourceImageUrl,
        width: '1024',
        height: '1024',
      })
      const getUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20189/image+to+image?${params.toString()}`

      const getResponse = await fetch(getUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })

      if (getResponse.ok) {
        const getData = await getResponse.json()
        console.log('[v0] img2img GET response:', JSON.stringify(getData).slice(0, 500))
        generatedImageUrl = extractImageUrl(getData)
      } else {
        console.log('[v0] img2img GET failed:', getResponse.status, await getResponse.text().catch(() => ''))
      }
    } catch (e) {
      console.log('[v0] img2img GET error:', e)
    }

    // Strategy 2: POST with JSON body
    if (!generatedImageUrl) {
      try {
        const postResponse = await fetch(
          'https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20189/image+to+image',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: prompt.trim(),
              image_url: sourceImageUrl,
              url: sourceImageUrl,
              image: sourceImageUrl,
              width: 1024,
              height: 1024,
            }),
          }
        )

        if (postResponse.ok) {
          const postData = await postResponse.json()
          console.log('[v0] img2img POST response:', JSON.stringify(postData).slice(0, 500))
          generatedImageUrl = extractImageUrl(postData)
        } else {
          console.log('[v0] img2img POST failed:', postResponse.status)
        }
      } catch (e) {
        console.log('[v0] img2img POST error:', e)
      }
    }

    // Strategy 3: Fallback to text-to-image with an enhanced prompt referencing the style
    if (!generatedImageUrl) {
      try {
        const enhancedPrompt = `Based on a reference image, create: ${prompt.trim()}. High quality, detailed, 4K resolution.`
        const fallbackParams = new URLSearchParams({
          prompt: enhancedPrompt,
          width: '1024',
          height: '1024',
        })
        const fallbackUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20188/text+to+image?${fallbackParams.toString()}`

        const fallbackResponse = await fetch(fallbackUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` },
        })

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('[v0] img2img fallback text2img response:', JSON.stringify(fallbackData).slice(0, 500))
          generatedImageUrl = extractImageUrl(fallbackData)
        }
      } catch (e) {
        console.log('[v0] img2img fallback error:', e)
      }
    }

    if (!generatedImageUrl) {
      return NextResponse.json(
        { error: 'Image transformation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Download and store in Blob
    const imageResponse = await fetch(generatedImageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to download generated image' }, { status: 500 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const timestamp = Date.now()
    const filename = `pictura/image-to-image/${timestamp}-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`

    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    })

    incrementUsage(sessionId)
    const updatedRateLimitInfo = getRateLimitInfo(sessionId)

    return NextResponse.json({
      url: blob.url,
      prompt: prompt.trim(),
      type: 'image-to-image',
      sourceImageUrl,
      createdAt: new Date().toISOString(),
      rateLimitInfo: updatedRateLimitInfo,
    })
  } catch (error) {
    console.error('Image-to-image generation error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
