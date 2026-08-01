import { NextRequest, NextResponse } from 'next/server'
import { uploadObject } from '@/lib/storage'
import { firstSuccessful } from '@/lib/provider-fallback'

console.log('[Voice] Module loaded')

// Fish Audio API - Primary TTS provider
async function generateWithFishAudio(text: string, voiceId?: string): Promise<string> {
  const apiKey = process.env.FISH_AUDIO_API_KEY
  if (!apiKey) throw new Error('Fish Audio API key not configured')

  const modelId = voiceId || process.env.FISH_AUDIO_MODEL_ID || 'default'
  
  const response = await fetch(`https://api.fish.audio/v1/tts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      text: text.trim(),
      format: 'mp3',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Voice] Fish Audio API error:', response.status, errorText)
    throw new Error(`Fish Audio generation failed: ${response.status}`)
  }

  // Fish Audio returns audio as binary MP3
  const audioBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(audioBuffer).toString('base64')
  return `data:audio/mp3;base64,${base64}`
}

// OpenAI TTS - Fallback provider
async function generateWithOpenAITTS(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OpenAI API key not configured')

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text.trim(),
      voice: 'alloy',
      response_format: 'mp3',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Voice] OpenAI TTS API error:', response.status, errorText)
    throw new Error(`OpenAI TTS failed: ${response.status}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(audioBuffer).toString('base64')
  return `data:audio/mp3;base64,${base64}`
}

// ElevenLabs TTS - Another fallback
async function generateWithElevenLabs(text: string, voiceId?: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ElevenLabs API key not configured')

  const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00tcm4Hl02LMvy9FA'
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.trim(),
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[Voice] ElevenLabs API error:', response.status, errorText)
    throw new Error(`ElevenLabs TTS failed: ${response.status}`)
  }

  const audioBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(audioBuffer).toString('base64')
  return `data:audio/mp3;base64,${base64}`
}

// Available voices with their IDs
export const VOICE_OPTIONS = [
  { id: 'default', name: 'Default', description: 'Default Fish Audio voice' },
  { id: 'female-young', name: 'Young Female', description: 'Young female voice' },
  { id: 'male-deep', name: 'Deep Male', description: 'Deep male voice' },
  { id: 'narrator', name: 'Narrator', description: 'Professional narrator style' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and friendly tone' },
]

export async function POST(request: NextRequest) {
  console.log('[Voice] POST request received')
  
  try {
    const body = await request.json()
    const text = typeof body.text === 'string' ? body.text : ''
    const voiceId = typeof body.voiceId === 'string' ? body.voiceId : 'default'

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: 'Text must be 5000 characters or less' }, { status: 400 })
    }

    console.log('[Voice] Generating speech for text:', text.slice(0, 50), 'Voice:', voiceId)

    // Try providers in order
    const providers = [
      () => generateWithFishAudio(text, voiceId),
      () => generateWithOpenAITTS(text),
      () => generateWithElevenLabs(text, voiceId),
    ]

    const audioDataUrl = await firstSuccessful(providers, '[Voice] Text-to-speech')

    if (!audioDataUrl) {
      return NextResponse.json(
        { error: 'Voice generation failed. Please try again.' },
        { status: 500 }
      )
    }

    // Extract base64 and upload to storage
    if (audioDataUrl.startsWith('data:')) {
      const base64Data = audioDataUrl.split(',')[1]
      const audioBuffer = Buffer.from(base64Data, 'base64')
      
      const timestamp = Date.now()
      const filename = `pictura/voice/${timestamp}-${voiceId}.mp3`
      
      const blob = await uploadObject(filename, audioBuffer, 'audio/mpeg')
      
      console.log('[Voice] Audio uploaded to:', blob.url)
      
      return NextResponse.json({
        url: blob.url,
        text: text.trim(),
        voiceId,
        createdAt: new Date().toISOString(),
      })
    }

    // If provider returned a URL directly
    return NextResponse.json({
      url: audioDataUrl,
      text: text.trim(),
      voiceId,
      createdAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[Voice] Generation error:', error)
    return NextResponse.json(
      { error: 'Voice generation failed. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Return available voices
export async function GET() {
  return NextResponse.json({
    voices: VOICE_OPTIONS,
    message: 'Voice Studio API - Use POST to generate speech',
  })
}
