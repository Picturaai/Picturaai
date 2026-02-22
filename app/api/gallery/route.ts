import { NextResponse } from 'next/server'
import { put, list } from '@vercel/blob'
import { getOrCreateSessionId } from '@/lib/session'
import type { GeneratedImage } from '@/lib/types'

// GET - Load user's saved gallery
export async function GET() {
  try {
    const sessionId = await getOrCreateSessionId()
    const galleryPath = `pictura/galleries/${sessionId}.json`

    // List blobs to find this user's gallery file
    const { blobs } = await list({ prefix: galleryPath })

    if (blobs.length === 0) {
      return NextResponse.json({ images: [] })
    }

    // Fetch the gallery JSON
    const res = await fetch(blobs[0].url)
    if (!res.ok) {
      return NextResponse.json({ images: [] })
    }

    const images: GeneratedImage[] = await res.json()
    return NextResponse.json({ images })
  } catch (error) {
    console.error('Gallery load error:', error)
    return NextResponse.json({ images: [] })
  }
}

// POST - Save image to user's gallery
export async function POST(request: Request) {
  try {
    const sessionId = await getOrCreateSessionId()
    const image: GeneratedImage = await request.json()

    if (!image.url || !image.prompt) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    const galleryPath = `pictura/galleries/${sessionId}.json`

    // Load existing gallery
    let images: GeneratedImage[] = []
    try {
      const { blobs } = await list({ prefix: galleryPath })
      if (blobs.length > 0) {
        const res = await fetch(blobs[0].url)
        if (res.ok) {
          images = await res.json()
        }
      }
    } catch { /* start fresh */ }

    // Add new image to the front, cap at 50
    images = [image, ...images].slice(0, 50)

    // Save updated gallery
    await put(galleryPath, JSON.stringify(images), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    })

    return NextResponse.json({ success: true, count: images.length })
  } catch (error) {
    console.error('Gallery save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
