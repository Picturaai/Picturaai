'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FORMAT_OPTIONS, convertImageFormat, downloadFile, formatFileSize } from '@/lib/image-formats'
import { toast } from 'sonner'

interface DownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageUrl: string
  imageName?: string
}

export function DownloadModal({
  open,
  onOpenChange,
  imageUrl,
  imageName = 'pictura-image',
}: DownloadModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [downloadedFormats, setDownloadedFormats] = useState<Set<string>>(new Set())

  const handleDownload = async (formatId: string) => {
    setDownloading(formatId)
    try {
      const format = FORMAT_OPTIONS.find((f) => f.id === formatId)
      if (!format) throw new Error('Format not found')

      if (formatId === 'svg') {
        // For SVG, create a wrapper
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          const svg = `
            <svg width="${img.width}" height="${img.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
              <image width="${img.width}" height="${img.height}" xlink:href="${imageUrl}" />
            </svg>
          `.trim()
          const blob = new Blob([svg], { type: 'image/svg+xml' })
          downloadFile(blob, `${imageName}.${format.ext}`)
          setDownloadedFormats((prev) => new Set(prev).add(formatId))
          toast.success(`Downloaded as ${format.label}`)
        }
        img.src = imageUrl
      } else {
        // For raster formats, use Canvas conversion
        const quality = format.quality || 90
        const blob = await convertImageFormat(imageUrl, formatId, quality)
        downloadFile(blob, `${imageName}.${format.ext}`)
        setDownloadedFormats((prev) => new Set(prev).add(formatId))
        toast.success(`Downloaded as ${format.label} (${formatFileSize(blob.size)})`)
      }
    } catch (error) {
      console.error('[v0] Download error:', error)
      toast.error(`Failed to download ${formatId.toUpperCase()}`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Download Image Assets</DialogTitle>
          <DialogDescription>
            Choose your preferred format. Each option is optimized for different use cases.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FORMAT_OPTIONS.map((format) => {
            const isDownloading = downloading === format.id
            const isDownloaded = downloadedFormats.has(format.id)

            return (
              <button
                key={format.id}
                onClick={() => handleDownload(format.id)}
                disabled={downloading !== null}
                className="group relative flex flex-col gap-2 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                    {format.label}
                  </span>
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  ) : isDownloaded ? (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  ) : (
                    <Download className="h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                  )}
                </div>

                {/* Description */}
                <p className="text-left text-[11px] leading-relaxed text-muted-foreground">
                  {format.description}
                </p>

                {/* Use case */}
                <div className="mt-1 flex flex-wrap gap-1">
                  {format.useCase.split(', ').map((use, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary/70"
                    >
                      {use}
                    </span>
                  ))}
                </div>

                {/* Status */}
                {isDownloading && (
                  <p className="text-[10px] text-muted-foreground">Downloading...</p>
                )}
                {isDownloaded && !isDownloading && (
                  <p className="text-[10px] text-primary/70">Downloaded</p>
                )}
              </button>
            )
          })}
        </div>

        {/* Info box */}
        <div className="mt-4 flex items-start gap-3 rounded-lg bg-muted/50 p-3">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground/60 mt-0.5" />
          <p className="text-[12px] text-muted-foreground/70 leading-relaxed">
            <strong>Pro tip:</strong> Use PNG for transparent backgrounds, SVG for infinite scalability, JPEG for print, and WebP for modern web optimization.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
