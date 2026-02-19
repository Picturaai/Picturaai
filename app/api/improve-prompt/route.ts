export async function POST(req: Request) {
  try {
    const { prompt, mode } = await req.json()

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey = process.env.MISTRAL_API_KEY
    if (!apiKey) {
      return Response.json({ error: 'Mistral API key not configured' }, { status: 500 })
    }

    const systemPrompt =
      mode === 'image'
        ? `You are an expert at writing image-to-image transformation prompts. The user has an image and wants to transform it. Take their rough idea and rewrite it into a detailed, vivid transformation prompt that will produce the best results. Keep it to 1-2 sentences. Return ONLY the improved prompt text, nothing else.`
        : `You are an expert at writing text-to-image generation prompts. Take the user's rough idea and rewrite it into a detailed, vivid, and descriptive prompt that will produce a stunning image. Add specific details about lighting, style, composition, mood, and atmosphere where appropriate. Keep it to 1-3 sentences. Return ONLY the improved prompt text, nothing else.`

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt.trim() },
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Mistral API error:', err)
      return Response.json({ error: 'Mistral API request failed' }, { status: 502 })
    }

    const data = await res.json()
    const improved = data.choices?.[0]?.message?.content?.trim()

    if (!improved) {
      return Response.json({ error: 'No response from Mistral' }, { status: 502 })
    }

    return Response.json({ improved })
  } catch (error) {
    console.error('Improve prompt error:', error)
    return Response.json({ error: 'Failed to improve prompt' }, { status: 500 })
  }
}
