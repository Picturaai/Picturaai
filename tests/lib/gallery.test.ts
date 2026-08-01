import { beforeEach, describe, expect, it, vi } from 'vitest'
import { appendMediaToGallery } from '@/lib/gallery'
import { readJsonObject, uploadObject } from '@/lib/storage'
import type { GeneratedMedia } from '@/lib/types'

vi.mock('@/lib/storage', () => ({
  readJsonObject: vi.fn(),
  uploadObject: vi.fn(),
}))

const readJson = vi.mocked(readJsonObject)
const upload = vi.mocked(uploadObject)

function media(overrides: Partial<GeneratedMedia> = {}): GeneratedMedia {
  return {
    url: 'https://cdn.test/a.png',
    prompt: 'a cat',
    type: 'text-to-image',
    ...overrides,
  } as GeneratedMedia
}

function uploadedMedia(): GeneratedMedia[] {
  return JSON.parse(upload.mock.calls.at(-1)![1] as string)
}

describe('appendMediaToGallery', () => {
  beforeEach(() => {
    readJson.mockReset()
    upload.mockReset()
    upload.mockResolvedValue(undefined as never)
  })

  it('writes the gallery for the session as json', async () => {
    readJson.mockResolvedValue(null as never)
    await appendMediaToGallery('sess-1', media())

    expect(readJson).toHaveBeenCalledWith('pictura/galleries/sess-1.json')
    expect(upload.mock.calls[0][0]).toBe('pictura/galleries/sess-1.json')
    expect(upload.mock.calls[0][2]).toBe('application/json')
  })

  it('prepends new media to the existing gallery', async () => {
    readJson.mockResolvedValue([media({ url: 'https://cdn.test/old.png' })] as never)
    await appendMediaToGallery('sess-1', media({ url: 'https://cdn.test/new.png' }))

    expect(uploadedMedia().map((item) => item.url)).toEqual(['https://cdn.test/new.png', 'https://cdn.test/old.png'])
  })

  it('starts from an empty gallery when reading fails', async () => {
    readJson.mockRejectedValue(new Error('boom') as never)
    await appendMediaToGallery('sess-1', media())
    expect(uploadedMedia()).toHaveLength(1)
  })

  it('skips duplicates that differ only by prompt whitespace', async () => {
    readJson.mockResolvedValue([media({ mediaKind: 'image' })] as never)
    await appendMediaToGallery('sess-1', media({ prompt: '  a cat  ' }))
    expect(uploadedMedia()).toHaveLength(1)
  })

  it('keeps entries that share a url but differ in type or prompt', async () => {
    readJson.mockResolvedValue([media({ mediaKind: 'image' })] as never)
    await appendMediaToGallery('sess-1', media({ prompt: 'a dog' }))
    expect(uploadedMedia()).toHaveLength(2)
  })

  it('infers mediaKind from the generation type when missing', async () => {
    readJson.mockResolvedValue([] as never)
    await appendMediaToGallery('sess-1', media({ type: 'text-to-video' }))
    expect(uploadedMedia()[0].mediaKind).toBe('video')

    await appendMediaToGallery('sess-1', media())
    expect(uploadedMedia()[0].mediaKind).toBe('image')
  })

  it('preserves an explicit mediaKind', async () => {
    readJson.mockResolvedValue([] as never)
    await appendMediaToGallery('sess-1', media({ type: 'text-to-video', mediaKind: 'image' }))
    expect(uploadedMedia()[0].mediaKind).toBe('image')
  })
})
