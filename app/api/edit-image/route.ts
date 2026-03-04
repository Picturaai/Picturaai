import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Download image and convert to base64
async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

// Replicate Stable Diffusion XL image-to-image
async function editWithReplicate(imageBase64: string, instruction: string): Promise<string> {
  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) throw new Error('Replicate not configured')

  const imageDataUrl = `data:image/png;base64,${imageBase64}`

  // Start the prediction
  const startResponse = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: '005e8e93b2a7c4da9b96b0c4e6a8b5a5e8e93b2a7c4da9b96b0c4e6a8b5a5',
      input: {
        prompt: instruction,
        image: imageDataUrl,
        prompt_strength: 0.35,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
  })

  if (!startResponse.ok) {
    const error = await startResponse.text()
    console.error('Replicate start error:', startResponse.status, error)
    throw new Error(`Replicate failed: ${startResponse.status}`)
  }

  const prediction = await startResponse.json()
  
  // Poll for result
  let result = prediction
  while (result.status === 'starting' || result.status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    const statusResponse = await fetch(prediction.urls.status, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    result = await statusResponse.json()
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate failed: ${result.error}`)
  }

  if (result.output && result.output[0]) {
    return result.output[0]
  }
  throw new Error('No edited image from Replicate')
}

// Stability AI image-to-image editing
async function editWithStability(imageBase64: string, instruction: string): Promise<string> {
  const apiKey = process.env.STABILITY_API_KEY
  if (!apiKey) throw new Error('Stability API not configured')

  const formData = new FormData()
  
  // Convert base64 to blob
  const imageBuffer = Buffer.from(imageBase64, 'base64')
  const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
  formData.append('init_image', imageBlob, 'image.png')
  formData.append('init_image_mode', 'IMAGE_STRENGTH')
  formData.append('image_strength', '0.35')
  formData.append('text_prompts[0][text]', instruction)
  formData.append('text_prompts[0][weight]', '1')
  formData.append('cfg_scale', '7')
  formData.append('samples', '1')
  formData.append('steps', '30')

  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/image-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Stability API error:', error)
    throw new Error('Stability editing failed')
  }

  const data = await response.json()
  if (data.artifacts?.[0]?.base64) {
    return `data:image/png;base64,${data.artifacts[0].base64}`
  }
  throw new Error('No edited image from Stability')
}

// Fal AI image editing with Flux
async function editWithFal(imageUrl: string, instruction: string): Promise<string> {
  const apiKey = process.env.FAL_KEY
  if (!apiKey) throw new Error('Fal not configured')

  const response = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt: instruction,
      strength: 0.85,
      num_images: 1,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Fal API error:', error)
    throw new Error('Fal editing failed')
  }

  const data = await response.json()
  if (data.images?.[0]?.url) return data.images[0].url
  throw new Error('No edited image from Fal')
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, instruction } = await request.json()

    if (!imageUrl || !instruction) {
      return NextResponse.json(
        { error: 'Image URL and instruction are required' },
        { status: 400 }
      )
    }

    // Try multiple providers with fallback
    let editedImageUrl: string | null = null
    const errors: string[] = []

    // Convert image to base64 for providers that need it
    const imageBase64 = await imageUrlToBase64(imageUrl)

    // Try Replicate first (Stable Diffusion XL)
    try {
      editedImageUrl = await editWithReplicate(imageBase64, instruction)
    } catch (err) {
      errors.push(`Replicate: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Fallback to Stability
    if (!editedImageUrl) {
      try {
        editedImageUrl = await editWithStability(imageBase64, instruction)
      } catch (err) {
        errors.push(`Stability: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Last fallback to Fal
    if (!editedImageUrl) {
      try {
        editedImageUrl = await editWithFal(imageUrl, instruction)
      } catch (err) {
        errors.push(`Fal: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    if (!editedImageUrl) {
      console.error('All edit providers failed:', errors.join('; '))
      console.log('Configured API keys:', {
        replicate: !!process.env.REPLICATE_API_KEY,
        stability: !!process.env.STABILITY_API_KEY,
        fal: !!process.env.FAL_KEY,
      })
      return NextResponse.json(
        { error: 'Image editing failed. Please try again later.' },
        { status: 500 }
      )
    }

    // If result is base64, upload to blob storage
    let finalUrl = editedImageUrl
    if (editedImageUrl.startsWith('data:')) {
      const base64Data = editedImageUrl.split(',')[1]
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const timestamp = Date.now()
      const filename = `pictura/edited/${timestamp}-${instruction.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.png`
      
      const blob = await put(filename, imageBuffer, {
        access: 'public',
        contentType: 'image/png',
      })
      finalUrl = blob.url
    }

    return NextResponse.json({
      success: true,
      url: finalUrl,
      instruction,
      message: 'Edit applied successfully',
    })
  } catch (error) {
    console.error('Edit image error:', error)
    return NextResponse.json(
      { error: 'Failed to edit image' },
      { status: 500 }
    )
  }
}
