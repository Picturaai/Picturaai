'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Loader2, CheckCircle, X, FileImage, FileCode, Sparkles } from 'lucide-react'
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
        const img = new window.Image()
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
        const quality = format.quality || 90
        const blob = await convertImageFormat(imageUrl, formatId, quality)
        downloadFile(blob, `${imageName}.${format.ext}`)
        setDownloadedFormats((prev) => new Set(prev).add(formatId))
        toast.success(`Downloaded as ${format.label} (${formatFileSize(blob.size)})`)
      }
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download ${formatId.toUpperCase()}`)
    } finally {
      setDownloading(null)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-background border border-border shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col lg:flex-row">
              {/* Image Preview */}
              <div className="relative w-full lg:w-1/2 aspect-square lg:aspect-auto bg-muted/30 flex items-center justify-center p-6 lg:p-8">
                <div className="relative w-full h-full max-h-[300px] lg:max-h-none rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Download Options */}
              <div className="flex-1 p-6 lg:p-8 overflow-y-auto max-h-[50vh] lg:max-h-[80vh]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Download Image</h2>
                    <p className="text-xs text-muted-foreground">Choose your preferred format</p>
                  </div>
                </div>

                {/* Format Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {FORMAT_OPTIONS.map((format) => {
                    const isDownloading = downloading === format.id
                    const isDownloaded = downloadedFormats.has(format.id)
                    const Icon = format.id === 'svg' ? FileCode : FileImage

                    return (
                      <motion.button
                        key={format.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(format.id)}
                        disabled={downloading !== null}
                        className={`relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-all ${
                          isDownloaded
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border/50 bg-card hover:border-primary/30 hover:bg-primary/5'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {/* Format badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                              {format.label}
                            </span>
                          </div>
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : isDownloaded ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <Download className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                          {format.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {format.useCase.split(', ').slice(0, 2).map((use, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-medium text-muted-foreground"
                            >
                              {use}
                            </span>
                          ))}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Pro tip */}
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
                  <Sparkles className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">Pro tip</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Use PNG for transparent backgrounds, JPEG for photos, WebP for web optimization, and SVG for infinite scalability.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
