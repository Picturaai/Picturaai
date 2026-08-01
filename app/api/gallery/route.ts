import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { readJsonObject } from '@/lib/storage'
import { appendMediaToGallery } from '@/lib/gallery'
import type { GeneratedMedia } from '@/lib/types'

// GET - Load user's saved gallery media (images + videos)
export async function GET(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request)
    const galleryPath = `pictura/galleries/${sessionId}.json`

    const media = await readJsonObject<GeneratedMedia[]>(galleryPath)
    if (!media) return NextResponse.json({ images: [] })
    return NextResponse.json({ images: media })
  } catch (error) {
    // Reporting an empty gallery here would look like "you have no images";
    // fail loudly so the client can distinguish an outage from an empty gallery.
    console.error('Gallery load error:', error)
    return NextResponse.json({ error: 'Failed to load gallery' }, { status: 503 })
  }
}

// POST - Save media to user's gallery
export async function POST(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request)
    const mediaItem: GeneratedMedia = await request.json()

    if (!mediaItem.url || !mediaItem.prompt) {
      return NextResponse.json({ error: 'Invalid media data' }, { status: 400 })
    }

    await appendMediaToGallery(sessionId, mediaItem)

    const galleryPath = `pictura/galleries/${sessionId}.json`
    const media = (await readJsonObject<GeneratedMedia[]>(galleryPath)) || []

    return NextResponse.json({ success: true, count: media.length })
  } catch (error) {
    console.error('Gallery save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
