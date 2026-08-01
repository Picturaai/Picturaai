import { uploadObject } from '@/lib/storage'

/** Decodes the payload of a `data:` URL, or returns null for regular URLs. */
export function decodeDataUrl(url: string): Buffer | null {
  if (!url.startsWith('data:')) return null
  return Buffer.from(url.split(',')[1], 'base64')
}

/** Downloads image bytes, returning null when the request fails. */
export async function fetchImageBytes(url: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`[ImageData] Failed to fetch image: ${response.status} ${response.statusText} from ${url}`)
      return null
    }
    return response.arrayBuffer()
  } catch (error) {
    console.error(`[ImageData] Error fetching image from ${url}:`, error)
    return null
  }
}

/**
 * Providers return either a hosted URL or an inline `data:` URL. This keeps
 * hosted URLs as-is and persists inline images under `${keyPrefix}/<ts>.png`.
 */
export async function persistImageUrl(url: string, keyPrefix: string): Promise<string> {
  const buffer = decodeDataUrl(url)
  if (!buffer) return url

  const { url: uploadedUrl } = await uploadObject(
    `${keyPrefix}/${Date.now()}.png`,
    buffer,
    'image/png'
  )
  return uploadedUrl
}
