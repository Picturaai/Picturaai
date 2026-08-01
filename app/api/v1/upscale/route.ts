import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, insufficientCredits, recordApiUsage } from '@/lib/api-key-auth'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { persistImageUrl } from '@/lib/image-data'
import { firstSuccessful } from '@/lib/provider-fallback'
import { runReplicatePrediction } from '@/lib/replicate'

// Replicate Real-ESRGAN
function upscaleWithReplicate(imageUrl: string, scale: number): Promise<string> {
  return runReplicatePrediction(
    'nightmareai/real-esrgan:42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    { image: imageUrl, scale: Math.min(scale, 4), face_enhance: true },
    { maxAttempts: 120 }
  )
}

// Fal AI upscaler
async function upscaleWithFal(imageUrl: string, scale: number): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal not configured')

  const response = await fetch('https://fal.run/fal-ai/clarity-upscaler', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      scale: Math.min(scale, 4),
    }),
  })

  if (!response.ok) throw new Error('Fal failed')
  const data = await response.json()
  if (data.image?.url) return data.image.url
  throw new Error('No result from Fal')
}

// DeepAI Super Resolution
async function upscaleWithDeepAI(imageUrl: string): Promise<string> {
  const apiKey = process.env.DEEPAI_API_KEY
  if (!apiKey) throw new Error('DeepAI not configured')

  const response = await fetch('https://api.deepai.org/api/torch-srgan', {
    method: 'POST',
    headers: { 'api-key': apiKey },
    body: new URLSearchParams({ image: imageUrl }),
  })

  if (!response.ok) throw new Error('DeepAI failed')
  const data = await response.json()
  if (data.output_url) return data.output_url
  throw new Error('No result from DeepAI')
}

// Stability AI upscaler
async function upscaleWithStability(imageUrl: string): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability not configured')

  // Download image first
  const imageResponse = await fetch(imageUrl)
  const imageBuffer = await imageResponse.arrayBuffer()

  const formData = new FormData()
  formData.append('image', new Blob([imageBuffer]), 'image.png')
  formData.append('width', '2048')

  const response = await fetch('https://api.stability.ai/v1/generation/esrgan-v1-x2plus/image-to-image/upscale', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  })

  if (!response.ok) throw new Error('Stability failed')
  const data = await response.json()
  if (data.artifacts?.[0]?.base64) {
    return `data:image/png;base64,${data.artifacts[0].base64}`
  }
  throw new Error('No result from Stability')
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth.ok) return auth.response

    const creditCost = 0.5
    const noCredits = insufficientCredits(auth.context, creditCost)
    if (noCredits) return noCredits

    const body = await request.json()
    const { image_url, scale = 2 } = body

    if (!image_url) {
      return errorResponse('image_url is required', 400)
    }

    if (scale < 2 || scale > 4) {
      return errorResponse('Scale must be between 2 and 4', 400)
    }

    const startTime = Date.now()
    const resultUrl = await firstSuccessful(
      [
        () => upscaleWithFal(image_url, scale),
        () => upscaleWithReplicate(image_url, scale),
        () => upscaleWithStability(image_url),
        () => upscaleWithDeepAI(image_url),
      ],
      'Upscale'
    )

    if (!resultUrl) {
      return errorResponse('All providers failed', 500)
    }

    const finalUrl = await persistImageUrl(resultUrl, 'pictura/upscaled')
    const generationTime = Date.now() - startTime

    await recordApiUsage({
      developerId: auth.context.developerId,
      endpoint: '/v1/upscale',
      creditsUsed: creditCost,
      generationTimeMs: generationTime,
    })

    return NextResponse.json({
      success: true,
      url: finalUrl,
      scale,
      credits_used: creditCost,
      generation_time_ms: generationTime
    })

  } catch (error) {
    return serverErrorResponse('Upscale error', error)
  }
}
