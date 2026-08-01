export type ChatProvider = 'mistral' | 'openai' | 'groq'

const PROVIDERS: Record<ChatProvider, { label: string; url: string; envVar: string }> = {
  mistral: {
    label: 'Mistral',
    url: 'https://api.mistral.ai/v1/chat/completions',
    envVar: 'MISTRAL_API_KEY',
  },
  openai: {
    label: 'OpenAI',
    url: 'https://api.openai.com/v1/chat/completions',
    envVar: 'OPENAI_API_KEY',
  },
  groq: {
    label: 'Groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    envVar: 'GROQ_API_KEY',
  },
}

export type ChatCompletionOptions = {
  model: string
  systemPrompt: string
  userPrompt: string
  maxTokens?: number
  temperature?: number
}

/**
 * Single system+user turn against an OpenAI-compatible chat endpoint.
 * Throws `<Provider> not configured` / `<Provider> failed` so callers can
 * fall back to another provider.
 */
export async function chatCompletion(
  provider: ChatProvider,
  { model, systemPrompt, userPrompt, maxTokens = 500, temperature = 0.7 }: ChatCompletionOptions
): Promise<string | null> {
  const { label, url, envVar } = PROVIDERS[provider]
  const apiKey = process.env[envVar]
  if (!apiKey) throw new Error(`${label} not configured`)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) throw new Error(`${label} failed`)
  const data = await response.json()
  return data.choices?.[0]?.message?.content?.trim() || null
}
