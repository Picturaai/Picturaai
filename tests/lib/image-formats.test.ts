import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FORMAT_OPTIONS, createSVGWrapper, downloadFile, formatFileSize } from '@/lib/image-formats'

describe('FORMAT_OPTIONS', () => {
  it('exposes unique ids for the supported formats', () => {
    expect(FORMAT_OPTIONS.map((f) => f.id)).toEqual(['png', 'jpeg', 'svg', 'webp'])
  })

  it('gives every option a label, extension and copy', () => {
    for (const option of FORMAT_OPTIONS) {
      expect(option.label).toBeTruthy()
      expect(option.ext).toBeTruthy()
      expect(option.description).toBeTruthy()
      expect(option.useCase).toBeTruthy()
    }
  })

  it('only sets quality on raster formats, within 1-100', () => {
    for (const option of FORMAT_OPTIONS) {
      if (option.id === 'svg') expect(option.quality).toBeUndefined()
      else expect(option.quality).toBeGreaterThan(0)
    }
  })
})

describe('formatFileSize', () => {
  it.each([
    [0, '0 Bytes'],
    [512, '512 Bytes'],
    [1024, '1 KB'],
    [1536, '1.5 KB'],
    [1024 * 1024, '1 MB'],
    [1024 * 1024 * 2.25, '2.25 MB'],
  ])('formats %i as %s', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected)
  })

  it('rounds to two decimals', () => {
    expect(formatFileSize(1234)).toBe('1.21 KB')
  })
})

describe('createSVGWrapper', () => {
  it('returns a base64 svg data uri embedding the image url and dimensions', () => {
    const uri = createSVGWrapper('https://cdn.test/a.png', 300, 200)
    expect(uri.startsWith('data:image/svg+xml;base64,')).toBe(true)

    const svg = atob(uri.slice('data:image/svg+xml;base64,'.length))
    expect(svg).toContain('width="300"')
    expect(svg).toContain('height="200"')
    expect(svg).toContain('xlink:href="https://cdn.test/a.png"')
  })
})

describe('downloadFile', () => {
  const createObjectURL = vi.fn(() => 'blob:mock')
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('URL', Object.assign(Object.create(URL), URL, { createObjectURL, revokeObjectURL }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
  })

  it('clicks a temporary anchor and cleans it up', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadFile(new Blob(['x']), 'logo.png')

    expect(click).toHaveBeenCalledOnce()
    const link = click.mock.instances[0] as unknown as HTMLAnchorElement
    expect(link.download).toBe('logo.png')
    expect(link.href).toContain('blob:mock')
    expect(document.querySelector('a')).toBeNull()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')

    click.mockRestore()
  })
})
