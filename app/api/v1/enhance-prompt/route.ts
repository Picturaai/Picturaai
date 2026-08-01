import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey, insufficientCredits, recordApiUsage } from '@/lib/api-key-auth'
import { errorResponse, serverErrorResponse } from '@/lib/api-response'
import { chatCompletion, type ChatProvider } from '@/lib/llm'
import { firstSuccessful } from '@/lib/provider-fallback'

const MISTRAL_SYSTEM_PROMPT = `You are an expert at enhancing image generation prompts. Your task is to take a simple prompt and expand it into a detailed, high-quality prompt that will produce amazing images.

Rules:
- Keep the original intent and subject
- Add specific details about lighting, composition, style, and quality
- Include technical terms that improve image quality (8k, detailed, professional, etc.)
- If a style is specified, incorporate it naturally
- Keep the enhanced prompt under 200 words
- Return ONLY the enhanced prompt, no explanations`

const OPENAI_SYSTEM_PROMPT = `You are an expert at enhancing image generation prompts. Take simple prompts and expand them into detailed, high-quality prompts. Add specific details about lighting, composition, style, and quality. Keep enhanced prompts under 200 words. Return ONLY the enhanced prompt.`

const GROQ_SYSTEM_PROMPT = `You are an expert at enhancing image generation prompts. Expand simple prompts into detailed, high-quality prompts with specific details about lighting, composition, and style. Keep it under 200 words. Return ONLY the enhanced prompt.`

type EnhanceProvider = {
  provider: ChatProvider
  model: string
  systemPrompt: string
  userPrompt: (prompt: string, style?: string) => string
}

const ENHANCE_PROVIDERS: EnhanceProvider[] = [
  {
    provider: 'mistral',
    model: 'mistral-small-latest',
    systemPrompt: MISTRAL_SYSTEM_PROMPT,
    userPrompt: (prompt, style) =>
      style ? `Enhance this prompt for ${style} style: "${prompt}"` : `Enhance this prompt: "${prompt}"`,
  },
  {
    provider: 'groq',
    model: 'llama-3.1-8b-instant',
    systemPrompt: GROQ_SYSTEM_PROMPT,
    userPrompt: (prompt, style) =>
      style ? `Enhance for ${style} style: "${prompt}"` : `Enhance: "${prompt}"`,
  },
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt: OPENAI_SYSTEM_PROMPT,
    userPrompt: (prompt, style) =>
      style ? `Enhance this prompt for ${style} style: "${prompt}"` : `Enhance this prompt: "${prompt}"`,
  },
]

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateApiKey(request)
    if (!auth.ok) return auth.response

    const creditCost = 0.1 // Small cost for prompt enhancement
    const noCredits = insufficientCredits(auth.context, creditCost)
    if (noCredits) return noCredits

    const body = await request.json()
    const { prompt, style } = body

    if (!prompt) {
      return errorResponse('prompt is required', 400)
    }

    const startTime = Date.now()
    const enhancedPrompt = await firstSuccessful(
      ENHANCE_PROVIDERS.map((config) => () =>
        chatCompletion(config.provider, {
          model: config.model,
          systemPrompt: config.systemPrompt,
          userPrompt: config.userPrompt(prompt, style),
        })
      ),
      'Prompt enhancement'
    )

    if (!enhancedPrompt) {
      return errorResponse('All providers failed', 500)
    }

    const generationTime = Date.now() - startTime

    await recordApiUsage({
      developerId: auth.context.developerId,
      endpoint: '/v1/enhance-prompt',
      creditsUsed: creditCost,
      generationTimeMs: generationTime,
      promptLength: prompt.length,
    })

    return NextResponse.json({
      success: true,
      original_prompt: prompt,
      enhanced_prompt: enhancedPrompt,
      style: style || null,
      credits_used: creditCost,
      generation_time_ms: generationTime
    })

  } catch (error) {
    return serverErrorResponse('Prompt enhancement error', error)
  }
}
