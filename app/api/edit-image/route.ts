import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

// Download image and convert to base64
async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

// Mistral AI - Image-to-image using Pixtral
async function editWithMistral(imageBase64: string, instruction: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('Mistral API not configured')

  // Just generate an image based on the instruction - Pixtral doesn't do image-to-image directly
  // So we use the instruction as a text prompt
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'pixtral-large-latest',
      messages: [{ role: 'user', content: `Generate an image: ${instruction}` }],
      tools: [{ type: 'image_generation' }],
      tool_choice: 'auto',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Mistral API error:', response.status, errorText)
    throw new Error(`Mistral editing failed: ${response.status}`)
  }

  const data = await response.json()
  console.log('[Mistral] Response:', JSON.stringify(data).substring(0, 500))
  
  // Extract image from tool call
  const toolCalls = data.choices?.[0]?.message?.tool_calls
  if (toolCalls && toolCalls[0]?.function?.output) {
    return toolCalls[0].function.output
  }
  // Check function.arguments
  if (toolCalls && toolCalls[0]?.function?.arguments) {
    const args = typeof toolCalls[0].function.arguments === 'string' 
      ? JSON.parse(toolCalls[0].function.arguments)
      : toolCalls[0].function.arguments
    if (args.image) return args.image
    if (args.url) return args.url
  }
  
  throw new Error('Could not extract image from Mistral response')
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

// Replicate image editing (uses various models)
async function editWithReplicate(imageBase64: string, instruction: string): Promise<string> {
  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) throw new Error('Replicate not configured')

  const imageDataUrl = `data:image/png;base64,${imageBase64}`

  // Use Stability AI via Replicate
  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: 'stability-ai/stable-diffusion-img2img',
      input: {
        prompt: instruction,
        image: imageDataUrl,
        prompt_strength: 0.35,
        num_inference_steps: 30,
        guidance_scale: 7.5,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Replicate API error:', response.status, error)
    throw new Error(`Replicate failed: ${response.status}`)
  }

  const prediction = await response.json()
  
  // Poll for result
  let result = prediction
  let attempts = 0
  while ((result.status === 'starting' || result.status === 'processing') && attempts < 30) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    const statusResponse = await fetch(prediction.urls.status, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    result = await statusResponse.json()
    attempts++
  }

  if (result.status === 'failed') {
    throw new Error(`Replicate failed: ${result.error}`)
  }

  if (result.output && result.output[0]) {
    return result.output[0]
  }
  throw new Error('No edited image from Replicate')
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

    // Try Mistral first (Pixtral)
    try {
      editedImageUrl = await editWithMistral(imageBase64, instruction)
    } catch (err) {
      errors.push(`Mistral: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }

    // Fallback to Replicate
    if (!editedImageUrl) {
      try {
        editedImageUrl = await editWithReplicate(imageBase64, instruction)
      } catch (err) {
        errors.push(`Replicate: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    // Fallback to Stability (paid)
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
        mistral: !!process.env.MISTRAL_API_KEY,
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
