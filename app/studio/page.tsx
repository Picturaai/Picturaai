import type { Metadata } from 'next'
import { StudioChat } from '@/components/pictura/studio-chat'

export const metadata: Metadata = {
  title: 'Pictura Studio - Create AI Images',
  description: 'Generate stunning images with Pictura AI Studio by Imoogle. Text-to-image and image-to-image generation.',
}

export default function StudioPage() {
  return <StudioChat />
}
