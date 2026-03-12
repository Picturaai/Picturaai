import { readJsonObject, uploadObject } from '@/lib/storage'
import type { GeneratedMedia } from '@/lib/types'

export async function appendMediaToGallery(sessionId: string, mediaItem: GeneratedMedia): Promise<void> {
  const galleryPath = `pictura/galleries/${sessionId}.json`

  let media: GeneratedMedia[] = []
  try {
    const existing = await readJsonObject<GeneratedMedia[]>(galleryPath)
    if (existing) media = existing
  } catch {
    media = []
  }

  const normalizedMedia: GeneratedMedia = {
    ...mediaItem,
    mediaKind: mediaItem.mediaKind ?? (mediaItem.type === 'text-to-video' ? 'video' : 'image'),
  }

  media = [normalizedMedia, ...media]
  await uploadObject(galleryPath, JSON.stringify(media), 'application/json')
}

