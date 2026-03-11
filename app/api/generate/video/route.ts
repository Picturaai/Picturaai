import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { getVideoRateLimitInfo, incrementVideoUsage } from '@/lib/rate-limit'

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

async function generateWithAlibabaVideo(prompt: string): Promise<string> {
  const apiKey = getAlibabaApiKey()
  if (!apiKey) throw new Error('Alibaba API not configured')

  const candidateModels = [
    process.env.ALIBABA_VIDEO_MODEL,
    'wan2.6-t2v',
    'wanx2.1-t2v-turbo',
  ].filter((m): m is string => Boolean(m))

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
        },
        parameters: {
          size: '1280*720',
          duration: 5,
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
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const sessionId = await getOrCreateSessionId(request)
    const videoLimit = await getVideoRateLimitInfo(sessionId)
    if (videoLimit.remaining <= 0) {
      return NextResponse.json({ error: 'Daily video limit reached (3/day).', rateLimitInfo: videoLimit }, { status: 429 })
    }

    const videoUrl = await generateWithAlibabaVideo(prompt)
    await incrementVideoUsage(sessionId)
    const updatedLimit = await getVideoRateLimitInfo(sessionId)

    return NextResponse.json({
      url: videoUrl,
      prompt: prompt.trim(),
      type: 'text-to-video',
      createdAt: new Date().toISOString(),
      rateLimitInfo: updatedLimit,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Video generation failed'
    console.error('Video generation error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
