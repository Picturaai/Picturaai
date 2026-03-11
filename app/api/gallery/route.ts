import { NextResponse } from 'next/server'
import { getOrCreateSessionId } from '@/lib/session'
import { readJsonObject, uploadObject } from '@/lib/storage'
import type { GeneratedImage } from '@/lib/types'

// GET - Load user's saved gallery
export async function GET(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request)
    const galleryPath = `pictura/galleries/${sessionId}.json`

    const images = await readJsonObject<GeneratedImage[]>(galleryPath)
    if (!images) return NextResponse.json({ images: [] })
    return NextResponse.json({ images })
  } catch (error) {
    console.error('Gallery load error:', error)
    return NextResponse.json({ images: [] })
  }
}

// POST - Save image to user's gallery
export async function POST(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId(request)
    const image: GeneratedImage = await request.json()

    if (!image.url || !image.prompt) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const galleryPath = `pictura/galleries/${sessionId}.json`

    // Load existing gallery
    let images: GeneratedImage[] = []
    try {
      const existing = await readJsonObject<GeneratedImage[]>(galleryPath)
      if (existing) images = existing
    } catch { /* start fresh */ }

    // Add new image to the front (no cap - stored forever)
    images = [image, ...images]

    // Save updated gallery
    await uploadObject(galleryPath, JSON.stringify(images), 'application/json')

    return NextResponse.json({ success: true, count: images.length })
  } catch (error) {
    console.error('Gallery save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
