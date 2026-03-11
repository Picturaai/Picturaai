import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { getVideoRateLimitInfo, incrementVideoUsage } from '@/lib/rate-limit'

type AlibabaTaskResponse = {
  output?: {
    task_id?: string
    video_url?: string
    video?: string
    results?: Array<{ url?: string; video_url?: string }>
    task_status?: string
  }
}

async function pollVideoTask(apiKey: string, taskId: string): Promise<string> {
  for (let i = 0; i < 40; i++) {
    await new Promise((resolve) => setTimeout(resolve, 2500))
    const res = await fetch(`https://dashscope-intl.aliyuncs.com/api/v1/tasks/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) continue
    const data = (await res.json()) as AlibabaTaskResponse
    const out = data.output
    if (!out) continue

    const url = out.video_url || out.video || out.results?.[0]?.video_url || out.results?.[0]?.url
    if (url) return url

    if (out.task_status === 'FAILED' || out.task_status === 'CANCELED') {
      throw new Error('Video generation failed')
    }
  }
  throw new Error('Video generation timed out')
}

async function generateWithAlibabaVideo(prompt: string): Promise<string> {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('Alibaba API not configured')

  const res = await fetch('https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'wanx2.1-t2v-turbo',
      input: { text: prompt.trim() },
      parameters: { resolution: '720P' },
    }),
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Video generation request failed: ${res.status} ${errorText}`)
  }

  const data = (await res.json()) as AlibabaTaskResponse
  const taskId = data.output?.task_id
  if (!taskId) throw new Error('No video task id returned')

  return pollVideoTask(apiKey, taskId)
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const sessionId = await getOrCreateSessionId()
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
    console.error('Video generation error:', error)
    return NextResponse.json({ error: 'Video generation failed. Check Alibaba API configuration.' }, { status: 500 })
  }
}
