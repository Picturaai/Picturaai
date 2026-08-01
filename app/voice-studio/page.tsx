import type { Metadata } from 'next'
import { VoiceStudio } from '@/components/pictura/voice-studio'

export const metadata: Metadata = {
  title: 'Voice Studio - Pictura AI',
  description: 'Transform text into natural-sounding speech with our AI-powered voice synthesis technology. Create voiceovers, narrations, and more.',
  openGraph: {
    title: 'Voice Studio - Pictura AI',
    description: 'Transform text into natural-sounding speech with our AI-powered voice synthesis technology.',
  },
}

export default function VoiceStudioPage() {
  return <VoiceStudio />
}
