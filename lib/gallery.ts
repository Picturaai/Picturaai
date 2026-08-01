import { readJsonObject, uploadObject } from '@/lib/storage'
import type { GeneratedMedia } from '@/lib/types'

function isSameMediaEntry(a: GeneratedMedia, b: GeneratedMedia): boolean {
  const sameUrl = a.url === b.url
  const sameType = a.type === b.type
  const samePrompt = a.prompt.trim() === b.prompt.trim()
  return sameUrl && sameType && samePrompt
}

export async function appendMediaToGallery(sessionId: string, mediaItem: GeneratedMedia): Promise<void> {
  const galleryPath = `pictura/galleries/${sessionId}.json`

  // A failed read must propagate: treating it as an empty gallery would
  // overwrite the stored history with just this one entry.
  const existing = await readJsonObject<GeneratedMedia[]>(galleryPath)
  let media: GeneratedMedia[] = Array.isArray(existing) ? existing : []

  const normalizedMedia: GeneratedMedia = {
    ...mediaItem,
    mediaKind: mediaItem.mediaKind ?? (mediaItem.type === 'text-to-video' ? 'video' : 'image'),
  }

  const alreadyExists = media.some((item) => isSameMediaEntry(item, normalizedMedia))
  media = alreadyExists ? media : [normalizedMedia, ...media]
  await uploadObject(galleryPath, JSON.stringify(media), 'application/json')
}

/**
 * Appends media and reports whether the write succeeded instead of throwing, so
 * a generation that already produced a URL is still returned to the caller.
 * The caller is responsible for telling the user the item was not persisted.
 */
export async function tryAppendMediaToGallery(sessionId: string, mediaItem: GeneratedMedia): Promise<boolean> {
  try {
    await appendMediaToGallery(sessionId, mediaItem)
    return true
  } catch (error) {
    console.error(`[Gallery] Failed to persist media for session ${sessionId}:`, error)
    return false
  }
}

