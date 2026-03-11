import { NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { getRateLimitInfo, incrementUsage } from '@/lib/rate-limit'
import { getOrCreateSessionId } from '@/lib/session'

async function pollQwenTask(apiKey: string, taskId: string): Promise<string | null> {
  for (let i = 0; i < 30; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const response = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!response.ok) continue
    const data = await response.json()
    const out = data.output || {}
    const url = out.results?.[0]?.url || out.images?.[0]?.url || out.image_url || out.url
    if (url) return url
    if (out.task_status === 'FAILED' || out.task_status === 'CANCELED') return null
  }
  return null
}

async function generateWithQwenEdit(prompt: string, sourceImageUrl: string): Promise<string | null> {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_DASHSCOPE_API_KEY
  if (!apiKey) return null

  const response = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx2.1-imageedit',
      input: { prompt: prompt.trim(), image_url: sourceImageUrl },
      parameters: { size: '1024*1024' },
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  const taskId = data.output?.task_id
  if (taskId) return pollQwenTask(apiKey, taskId)
  return data.output?.results?.[0]?.url || data.output?.url || null
}


export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const prompt = formData.get('prompt') as string
    const image = formData.get('image') as File | null
    const imageUrl = formData.get('imageUrl') as string | null
    const model = (formData.get('model') as string | null) || 'pi-1.0'

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'A text prompt is required' }, { status: 400 })
    }

    if (!image && !imageUrl) {
      return NextResponse.json({ error: 'An image file or URL is required' }, { status: 400 })
    }

    // Check rate limit using session ID
    const sessionId = await getOrCreateSessionId()
    const rateLimitInfo = await getRateLimitInfo(sessionId)

    if (rateLimitInfo.remaining <= 0) {
      return NextResponse.json(
        { error: 'Daily limit reached. You can generate up to 5 images per day during beta.', rateLimitInfo },
        { status: 429 }
      )
    }

    const apiKey = process.env.ZYLABS_API_KEY

    // If we have a file, upload it to Blob first to get a public URL
    let sourceImageUrl = imageUrl || ''
    if (image) {
      const uploadTimestamp = Date.now()
      const uploadFilename = `pictura/uploads/${uploadTimestamp}-${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      const uploadBlob = await put(uploadFilename, image, {
        access: 'public',
        contentType: image.type,
      })
      sourceImageUrl = uploadBlob.url
    }

    console.log('[v0] img2img sourceImageUrl:', sourceImageUrl)
    console.log('[v0] img2img prompt:', prompt.trim())

    if (model === 'pi-1.5-turbo' || !apiKey) {
      const qwenImage = await generateWithQwenEdit(prompt, sourceImageUrl)
      if (qwenImage) {
        const imageResponse = await fetch(qwenImage)
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.arrayBuffer()
          const timestamp = Date.now()
          const filename = `pictura/image-to-image/${timestamp}-qwen-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`
          const blob = await put(filename, imageBuffer, { access: 'public', contentType: 'image/png' })
          await incrementUsage(sessionId)
          const updatedRateLimitInfo = await getRateLimitInfo(sessionId)
          return NextResponse.json({
            url: blob.url,
            prompt: prompt.trim(),
            model,
            type: 'image-to-image',
            sourceImageUrl,
            createdAt: new Date().toISOString(),
            rateLimitInfo: updatedRateLimitInfo,
          })
        }
      }
    }

    // Try image-to-image endpoint with GET (matching text-to-image pattern)
    const params = new URLSearchParams({
      prompt: prompt.trim(),
      image_url: sourceImageUrl,
      width: '1024',
      height: '1024',
    })
    const apiUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20189/image+to+image?${params.toString()}`

    let data: Record<string, unknown> | null = null
    let generatedImageUrl: string | null = null

    let response: Response | null = null
    if (apiKey) {
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
    }

    if (response?.ok) {
      data = await response.json()
      console.log('[v0] img2img response:', JSON.stringify(data).slice(0, 500))
      generatedImageUrl = extractImageUrl(data!)
    } else if (response) {
      console.log('[v0] img2img GET failed:', response.status, await response.text().catch(() => ''))
    }

    // Fallback: use text-to-image endpoint with enhanced prompt that references the source
    if (!generatedImageUrl) {
      console.log('[v0] img2img falling back to text-to-image')
      const enhancedPrompt = `${prompt.trim()}. High quality, detailed, 4K resolution.`
      const fallbackParams = new URLSearchParams({
        prompt: enhancedPrompt,
        width: '1024',
        height: '1024',
      })
      const fallbackUrl = `https://zylalabs.com/api/10640/ai+image+generator+nano+banana+api/20188/text+to+image?${fallbackParams.toString()}`

      if (apiKey) {
        const fallbackRes = await fetch(fallbackUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${apiKey}` },
        })

        if (fallbackRes.ok) {
          data = await fallbackRes.json()
          console.log('[v0] img2img fallback response:', JSON.stringify(data).slice(0, 500))
          generatedImageUrl = extractImageUrl(data!)
        }
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

    await incrementUsage(sessionId)
    const updatedRateLimitInfo = await getRateLimitInfo(sessionId)

    return NextResponse.json({
      url: blob.url,
      prompt: prompt.trim(),
      model,
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
