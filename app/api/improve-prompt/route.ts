import { generateText } from 'ai'

export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const systemPrompt =
      mode === 'image'
        ? `You are an expert at writing image-to-image transformation prompts. The user has an image and wants to transform it. Take their rough idea and rewrite it into a detailed, vivid transformation prompt that will produce the best results. Keep it to 1-2 sentences. Return ONLY the improved prompt text, nothing else.`
        : `You are an expert at writing text-to-image generation prompts. Take the user's rough idea and rewrite it into a detailed, vivid, and descriptive prompt that will produce a stunning image. Add specific details about lighting, style, composition, mood, and atmosphere where appropriate. Keep it to 1-3 sentences. Return ONLY the improved prompt text, nothing else.`

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      system: systemPrompt,
      prompt: prompt.trim(),
    })

    return Response.json({ improved: result.text.trim() })
  } catch (error) {
    console.error('Improve prompt error:', error)
    return Response.json({ error: 'Failed to improve prompt' }, { status: 500 })
  }
}
