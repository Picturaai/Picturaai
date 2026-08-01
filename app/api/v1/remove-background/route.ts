import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, insufficientCredits, recordApiUsage } from '@/lib/api-key-auth'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { persistImageUrl } from '@/lib/image-data'
import { firstSuccessful } from '@/lib/provider-fallback'
import { runReplicatePrediction } from '@/lib/replicate'

// Remove.bg API
async function removeWithRemoveBg(imageUrl: string): Promise<string> {
  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) throw new Error('Remove.bg not configured')

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      size: 'auto',
      format: 'png',
    }),
  })

  if (!response.ok) throw new Error('Remove.bg failed')
  
  const imageBuffer = await response.arrayBuffer()
  return `data:image/png;base64,${Buffer.from(imageBuffer).toString('base64')}`
}

// Replicate rembg model
function removeWithReplicate(imageUrl: string): Promise<string> {
  return runReplicatePrediction(
    'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    { image: imageUrl }
  )
}

// Fal AI background removal
async function removeWithFal(imageUrl: string): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal not configured')

  const response = await fetch('https://fal.run/fal-ai/birefnet', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ image_url: imageUrl }),
  })

  if (!response.ok) throw new Error('Fal failed')
  const data = await response.json()
  if (data.image?.url) return data.image.url
  throw new Error('No result from Fal')
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth.ok) return auth.response

    const creditCost = 0.5 // Half credit for background removal
    const noCredits = insufficientCredits(auth.context, creditCost)
    if (noCredits) return noCredits

    const body = await request.json()
    const { image_url } = body

    if (!image_url) {
      return errorResponse('image_url is required', 400)
    }

    const startTime = Date.now()
    const resultUrl = await firstSuccessful(
      [
        () => removeWithFal(image_url),
        () => removeWithReplicate(image_url),
        () => removeWithRemoveBg(image_url),
      ],
      'Background removal'
    )

    if (!resultUrl) {
      return errorResponse('All providers failed', 500)
    }

    const finalUrl = await persistImageUrl(resultUrl, 'pictura/bg-removed')
    const generationTime = Date.now() - startTime

    await recordApiUsage({
      developerId: auth.context.developerId,
      endpoint: '/v1/remove-background',
      creditsUsed: creditCost,
      generationTimeMs: generationTime,
    })

    return NextResponse.json({
      success: true,
      url: finalUrl,
      credits_used: creditCost,
      generation_time_ms: generationTime
    })

  } catch (error) {
    return serverErrorResponse('Background removal error', error)
  }
}
