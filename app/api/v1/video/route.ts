import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

// Rate limit: 2 videos per day for beta
const DAILY_VIDEO_LIMIT = 2

// Check user's daily video usage
async function checkVideoLimit(userId: string): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const usage = await sql`
    SELECT COUNT(*) as count 
    FROM video_generations 
    WHERE developer_id = ${userId} 
    AND created_at >= ${today.toISOString()}
  `
  
  const used = Number(usage[0]?.count) || 0
  const remaining = Math.max(0, DAILY_VIDEO_LIMIT - used)
  
  return {
    allowed: used < DAILY_VIDEO_LIMIT,
    used,
    remaining
  }
}

// Record video generation
async function recordVideoGeneration(userId: string, prompt: string, videoUrl: string, model: string) {
  await sql`
    INSERT INTO video_generations (developer_id, prompt, video_url, model)
    VALUES (${userId}, ${prompt}, ${videoUrl}, ${model})
  `
}

// Generate video with Replicate (using Kling or similar)
async function generateWithReplicate(prompt: string): Promise<string> {
  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) throw new Error('Replicate not configured')

  // Use Kling video model
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'kling-video-v1-5', // Kling video model version
      input: {
        prompt: prompt.trim(),
        duration: 5, // 5 seconds
        fps: 24,
        resolution: '720p',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Replicate video failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  // Wait for async completion
  if (data.status === 'starting' || data.status === 'processing') {
    let prediction = data
    while (prediction.status === 'starting' || prediction.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 3000))
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${data.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      })
      prediction = await pollResponse.json()
    }
    
    if (prediction.status === 'succeeded' && prediction.output?.[0]) {
      return prediction.output[0]
    }
    throw new Error('Video generation failed')
  }

  if (data.status === 'succeeded' && data.output?.[0]) {
    return data.output[0]
  }
  
  throw new Error('No video generated')
}

// Generate video with Alibaba Cloud Model Studio (Qwen)
async function generateWithAlibabaVideo(prompt: string): Promise<string> {
  const apiKey = process.env.ALIBABA_API_KEY || process.env.DASHSCOPE_API_KEY
  if (!apiKey) throw new Error('Alibaba API not configured')

  // Use Alibaba's video generation (I2V generation)
  const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: 'video-generation',
      input: {
        prompt: prompt.trim(),
      },
      parameters: {
        duration: 5,
        fps: 24,
        resolution: '720p',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Alibaba video failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  // Handle async response
  if (data.request_id) {
    return await pollAlibabaVideo(apiKey, data.request_id)
  }

  // Handle sync response
  if (data.output?.video_url) {
    return data.output.video_url
  }
  
  throw new Error('No video from Alibaba')
}

async function pollAlibabaVideo(apiKey: string, requestId: string): Promise<string> {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const response = await fetch(
      `https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/generation/${requestId}`,
      { headers: { 'Authorization': `Bearer ${apiKey}` } }
    )
    
    const data = await response.json()
    
    if (data.output?.video_url) {
      return data.output.video_url
    }
    
    if (data.code === 'Failed' || data.output?.status === 'failed') {
      throw new Error('Alibaba video generation failed')
    }
  }
  
  throw new Error('Alibaba video generation timeout')
}

// Generate video with Runway ML (alternative)
async function generateWithRunway(prompt: string): Promise<string> {
  const apiKey = process.env.RUNWAY_API_KEY
  if (!apiKey) throw new Error('Runway not configured')

  const response = await fetch('https://api.runwayml.com/v1/video generation', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      duration: 5,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Runway video failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  if (data.video_url) {
    return data.video_url
  }
  
  throw new Error('No video from Runway')
}

// Generate video with Luma Dream Machine
async function generateWithLuma(prompt: string): Promise<string> {
  const apiKey = process.env.LUMA_API_KEY
  if (!apiKey) throw new Error('Luma not configured')

  const response = await fetch('https://api.lumalabs.ai/dream-machine/v1/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      duration: 5,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Luma video failed: ${response.status} - ${error}`)
  }

  const data = await response.json()
  
  if (data.generation?.id) {
    // Poll for completion
    return await pollLumaGeneration(apiKey, data.generation.id)
  }
  
  throw new Error('No video from Luma')
}

async function pollLumaGeneration(apiKey: string, generationId: string): Promise<string> {
  const maxAttempts = 60
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const response = await fetch(`https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    
    const data = await response.json()
    
    if (data.generation?.video_url) {
      return data.generation.video_url
    }
    
    if (data.generation?.status === 'failed') {
      throw new Error('Luma generation failed')
    }
  }
  
  throw new Error('Luma generation timeout')
}

// Get developer from session
async function getDevFromSession(req: NextRequest) {
  // Try cookie first
  const sessionToken = req.cookies.get('dev_session')?.value
  
  if (!sessionToken) {
    // Try Authorization header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const apiKey = authHeader.substring(7)
      return await verifyApiKey(apiKey)
    }
    return null
  }

  const sessions = await sql`
    SELECT d.* FROM developers d
    JOIN developer_sessions ds ON d.id = ds.developer_id
    WHERE ds.session_token = ${sessionToken}
    AND ds.expires_at > NOW()
  `
  
  return sessions[0] || null
}

async function verifyApiKey(apiKey: string) {
  const crypto = require('crypto')
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')
  
  const keys = await sql`
    SELECT d.* FROM developers d
    JOIN api_keys k ON d.id = k.developer_id
    WHERE k.key_hash = ${keyHash}
    AND k.is_active = true
  `
  
  return keys[0] || null
}

export async function POST(req: NextRequest) {
  try {
    const dev = await getDevFromSession(req)
    if (!dev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    const limit = await checkVideoLimit(dev.id)
    if (!limit.allowed) {
      return NextResponse.json({ 
        error: 'Daily limit reached',
        used: limit.used,
        limit: DAILY_VIDEO_LIMIT,
        message: `You have reached your daily limit of ${DAILY_VIDEO_LIMIT} videos. Try again tomorrow!`
      }, { status: 429 })
    }

    const body = await req.json()
    const { prompt } = body

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json({ error: 'Please provide a prompt (min 3 characters)' }, { status: 400 })
    }

    // Try multiple providers - Alibaba/Qwen first, then Replicate, then Luma
    let videoUrl: string | null = null
    const errors: string[] = []

    // Try Alibaba (Qwen) first
    try {
      videoUrl = await generateWithAlibabaVideo(prompt)
    } catch (err) {
      errors.push(`Alibaba (Qwen): ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Try Replicate as fallback
    if (!videoUrl) {
      try {
        videoUrl = await generateWithReplicate(prompt)
      } catch (err) {
        errors.push(`Replicate: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Try Luma as last fallback
    if (!videoUrl) {
      try {
        videoUrl = await generateWithLuma(prompt)
      } catch (err) {
        errors.push(`Luma: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    if (!videoUrl) {
      return NextResponse.json({
        error: 'Video generation failed',
        details: errors,
        message: 'All video providers failed. Please try again later.'
      }, { status: 500 })
    }

    // Record the generation
    const model = videoUrl.includes('dashscope') ? 'alibaba' : videoUrl.includes('replicate') ? 'replicate' : 'luma'
    await recordVideoGeneration(dev.id, prompt, videoUrl, model)

    return NextResponse.json({
      success: true,
      videoUrl,
      prompt,
      remaining: limit.remaining - 1,
      limit: DAILY_VIDEO_LIMIT
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate video',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Check user's video usage
export async function GET(req: NextRequest) {
  try {
    const dev = await getDevFromSession(req)
    if (!dev) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = await checkVideoLimit(dev.id)
    
    return NextResponse.json({
      used: limit.used,
      remaining: limit.remaining,
      limit: DAILY_VIDEO_LIMIT,
      isBeta: true
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check usage' }, { status: 500 })
  }
}
