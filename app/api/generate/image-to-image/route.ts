import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'

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

    // Call ZyLabs Image-to-Image API
    const apiUrl = 'https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20189/image+to+image'
    
    const response = await fetch(apiUrl, {
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
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ZyLabs Image-to-Image API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Image transformation failed. Please try again.' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract image URL from response
    const generatedImageUrl = data.image || data.url || data.output || data.result
    if (!generatedImageUrl) {
      console.error('Unexpected API response format:', JSON.stringify(data))
      return NextResponse.json(
        { error: 'Unexpected response from image generation service' },
        { status: 500 }
      )
    }

    // Download and store in Blob
    const imageResponse = await fetch(generatedImageUrl)
    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to download generated image' },
        { status: 500 }
      )
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const timestamp = Date.now()
    const filename = `pictura/image-to-image/${timestamp}-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`

    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: 'image/png',
    })

    // Increment usage
    incrementUsage(clientIp)
    const updatedRateLimitInfo = getRateLimitInfo(clientIp)

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
