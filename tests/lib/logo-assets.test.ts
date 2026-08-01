import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGO_FORMATS, PICTURA_SVG_LOGO, downloadFile, generateLogoBlob } from '@/lib/logo-assets'

function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(blob)
  })
}

describe('PICTURA_SVG_LOGO', () => {
  it('defaults to 256px and keeps the 64 unit viewBox', () => {
    const svg = PICTURA_SVG_LOGO()
    expect(svg).toContain('width="256"')
    expect(svg).toContain('height="256"')
    expect(svg).toContain('viewBox="0 0 64 64"')
  })

  it('renders at the requested size', () => {
    expect(PICTURA_SVG_LOGO(1024)).toContain('width="1024"')
  })
})

describe('LOGO_FORMATS', () => {
  it('names each download after its format and size', () => {
    for (const format of LOGO_FORMATS) {
      expect(format.name).toBe(`pictura-logo-${format.size}.${format.format}`)
      expect(format.description).toBeTruthy()
    }
  })

  it('lists unique file names', () => {
    expect(new Set(LOGO_FORMATS.map((f) => f.name)).size).toBe(LOGO_FORMATS.length)
  })
})

describe('generateLogoBlob', () => {
  it('returns the raw svg without touching canvas', async () => {
    const blob = await generateLogoBlob('svg', 512)
    expect(blob.type).toBe('image/svg+xml')
    expect(await readBlobText(blob)).toContain('width="512"')
  })

  it('rejects a raster format when no canvas context is available', async () => {
    vi.stubGlobal('URL', Object.assign(Object.create(URL), URL, {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: vi.fn(),
    }))
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)

    await expect(generateLogoBlob('png', 512)).rejects.toThrow('Could not get canvas context')

    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
})

describe('downloadFile', () => {
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('URL', Object.assign(Object.create(URL), URL, {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL,
    }))
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    revokeObjectURL.mockClear()
  })

  it('clicks an anchor carrying the filename and revokes the object url', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})

    downloadFile(new Blob(['x']), 'pictura-logo-512.png')

    const link = click.mock.instances[0] as unknown as HTMLAnchorElement
    expect(link.download).toBe('pictura-logo-512.png')
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:mock')

    click.mockRestore()
  })
})
