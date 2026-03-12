import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { getVideoRateLimitInfo, incrementVideoUsage } from '@/lib/rate-limit'
import { appendMediaToGallery } from '@/lib/gallery'
import { getAdminSessionFromRequest } from '@/lib/admin-auth'
import { getRequestContext } from '@/lib/request-context'
import { uploadObject } from '@/lib/storage'

type AlibabaTaskResponse = {
  output?: {
    task_id?: string
    video_url?: string
    video?: string
    url?: string
    results?: Array<{ url?: string; video_url?: string }>
    task_status?: string
  }
  message?: string
  code?: string
}

const API_BASE = 'https://dashscope-intl.aliyuncs.com/api/v1'

function getAlibabaApiKey() {
  return process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY || process.env.ALIBABA_DASHSCOPE_API_KEY
}

async function pollVideoTask(apiKey: string, taskId: string): Promise<string> {
  for (let i = 0; i < 40; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) continue
    const data = (await res.json()) as AlibabaTaskResponse
    const out = data.output
    if (!out) continue

    const url = out.video_url || out.video || out.url || out.results?.[0]?.video_url || out.results?.[0]?.url
    if (url) return url

    if (out.task_status === 'FAILED' || out.task_status === 'CANCELED') {
      throw new Error('Video generation task failed on Alibaba')
    }
  }
  throw new Error('Video generation timed out')
}

async function generateWithAlibabaVideo(prompt: string, imageUrl?: string | null, preferredModel?: string | null): Promise<string> {
  const apiKey = getAlibabaApiKey()
  if (!apiKey) throw new Error('Alibaba API not configured')

  const candidateModels = [
    preferredModel,
    process.env.ALIBABA_VIDEO_MODEL,
    imageUrl ? process.env.ALIBABA_VIDEO_I2V_MODEL : undefined,
    imageUrl ? 'wan2.6-i2v-flash' : undefined,
    imageUrl ? 'wanx2.1-i2v-turbo' : undefined,
    'wan2.6-t2v-flash',
    'wan2.6-t2v',
    'wanx2.1-t2v-turbo',
  ].filter((m, index, arr): m is string => Boolean(m) && arr.indexOf(m) === index)

  let lastError = 'Unknown video provider error'

  for (const model of candidateModels) {
    const res = await fetch(`${API_BASE}/services/aigc/video-generation/video-synthesis`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify({
        model,
        input: {
          prompt: prompt.trim(),
          text: prompt.trim(),
          ...(imageUrl ? { img_url: imageUrl, image_url: imageUrl } : {}),
        },
        parameters: {
          size: '1280*720',
          duration: 15,
          prompt_extend: true,
        },
      }),
    })

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      lastError = `model=${model} status=${res.status} body=${errorText}`
      continue
    }

    const data = (await res.json()) as AlibabaTaskResponse
    const taskId = data.output?.task_id
    if (taskId) return pollVideoTask(apiKey, taskId)

    const directUrl = data.output?.video_url || data.output?.video || data.output?.url || data.output?.results?.[0]?.video_url || data.output?.results?.[0]?.url
    if (directUrl) return directUrl

    lastError = `model=${model} returned no task_id/video_url`
  }

  throw new Error(lastError)
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let prompt = ''
    let requestId: string | null = null
    let imageUrl: string | null = null
    let model: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      prompt = String(formData.get('prompt') || '')
      requestId = formData.get('requestId') ? String(formData.get('requestId')) : null
      model = formData.get('model') ? String(formData.get('model')) : null
      imageUrl = formData.get('imageUrl') ? String(formData.get('imageUrl')) : null

      const image = formData.get('image') as File | null
      if (image && image.size > 0) {
        const uploadTimestamp = Date.now()
        const uploadFilename = `pictura/video-uploads/${uploadTimestamp}-${image.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
        const uploadBlob = await uploadObject(uploadFilename, image, image.type || 'application/octet-stream')
        imageUrl = uploadBlob.url
      }
    } else {
      const body = await request.json()
      prompt = typeof body.prompt === 'string' ? body.prompt : ''
      requestId = typeof body.requestId === 'string' ? body.requestId : null
      imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : null
      model = typeof body.model === 'string' ? body.model : null
    }

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const sessionId = await getOrCreateSessionId(request)
    const adminSession = getAdminSessionFromRequest(request)
    const requestContext = getRequestContext(request)
    const videoLimit = await getVideoRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })
    if (videoLimit.remaining <= 0) {
      return NextResponse.json({ error: `Daily video limit reached (${videoLimit.limit}/day).`, rateLimitInfo: videoLimit }, { status: 429 })
    }

    const videoUrl = await generateWithAlibabaVideo(prompt, imageUrl, model)
    const createdAt = new Date().toISOString()

    await appendMediaToGallery(sessionId, {
      url: videoUrl,
      prompt: prompt.trim(),
      type: 'text-to-video',
      mediaKind: 'video',
      requestId: requestId || undefined,
      createdAt,
    })

    await incrementVideoUsage(sessionId, { role: adminSession?.role, ...requestContext })
    const updatedLimit = await getVideoRateLimitInfo(sessionId, { role: adminSession?.role, ...requestContext })

    return NextResponse.json({
      url: videoUrl,
      prompt: prompt.trim(),
      type: 'text-to-video',
      requestId: requestId || undefined,
      createdAt,
      rateLimitInfo: updatedLimit,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Video generation failed'
    console.error('Video generation error:', error)
    
    // Provide user-friendly error messages based on error type
    let userMessage = message
    
    if (message.includes('API not configured') || message.includes('API key') || message.includes('not set')) {
      userMessage = 'We are under maintenance. Please check back later.'
    } else if (message.includes('rate limit') || message.includes('quota') || message.includes('limit')) {
      userMessage = 'Daily video limit reached. Please try again tomorrow.'
    } else if (message.includes('timeout') || message.includes('timed out')) {
      userMessage = 'Video generation is taking longer than expected. Please try again.'
    } else if (message.includes('failed') || message.includes('error') || message.includes('Error')) {
      userMessage = 'We are under maintenance. Please check back later.'
    }
    
    return NextResponse.json({ error: userMessage }, { status: 500 })
  }
}
