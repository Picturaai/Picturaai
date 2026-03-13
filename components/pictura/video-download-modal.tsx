'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Clapperboard, X, Check, Loader2, Film, Image as ImageIcon, FileVideo } from 'lucide-react'
import { toast } from 'sonner'

interface VideoDownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoUrl: string
  videoName?: string
}

type DownloadFormat = {
  id: string
  label: string
  description: string
  extension: string
  icon: typeof Film
  quality?: string
}

const DOWNLOAD_FORMATS: DownloadFormat[] = [
  {
    id: 'mp4-hd',
    label: 'MP4 (HD)',
    description: 'Best quality for all devices',
    extension: 'mp4',
    icon: Film,
    quality: '1080p'
  },
  {
    id: 'mp4-sd',
    label: 'MP4 (SD)',
    description: 'Smaller file size, faster loading',
    extension: 'mp4',
    icon: FileVideo,
    quality: '720p'
  },
  {
    id: 'webm',
    label: 'WebM',
    description: 'Optimized for web browsers',
    extension: 'webm',
    icon: FileVideo,
  },
  {
    id: 'gif',
    label: 'GIF',
    description: 'Animated image for social media',
    extension: 'gif',
    icon: ImageIcon,
  },
]

export function VideoDownloadModal({
  open,
  onOpenChange,
  videoUrl,
  videoName = `pictura-video-${Date.now()}`,
}: VideoDownloadModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('mp4-hd')
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    const format = DOWNLOAD_FORMATS.find(f => f.id === selectedFormat)
    if (!format) return

    setDownloading(true)
    
    try {
      const response = await fetch(videoUrl)
      if (!response.ok) throw new Error('Failed to fetch video')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `${videoName}.${format.extension}`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)

      toast.success(`Video downloaded as ${format.label}`)
      onOpenChange(false)
    } catch {
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
      toast('Opened video in a new tab. Use Save As to download if needed.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 backdrop-blur-sm sm:items-center"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-0 w-full overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:mx-4 sm:max-w-lg sm:rounded-3xl"
          >
            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-secondary/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground z-10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              {/* Header */}
              <div className="mb-5 flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Clapperboard className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Download Video</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Choose your preferred format and quality</p>
                </div>
              </div>

              {/* Video Preview */}
              <div className="overflow-hidden rounded-2xl border border-border/50 bg-card mb-5">
                <video src={videoUrl} controls className="w-full aspect-video object-cover" />
              </div>

              {/* Format Selection */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select Format</p>
                <div className="grid grid-cols-2 gap-2">
                  {DOWNLOAD_FORMATS.map((format) => {
                    const Icon = format.icon
                    const isSelected = selectedFormat === format.id
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`relative flex flex-col items-start p-3.5 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border/60 hover:border-primary/40 hover:bg-secondary/50'
                        }`}
                      >
                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                        
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                          isSelected ? 'bg-primary/15 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {format.label}
                          </span>
                          {format.quality && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                              isSelected ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                            }`}>
                              {format.quality}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                          {format.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Preparing Download...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    Download {DOWNLOAD_FORMATS.find(f => f.id === selectedFormat)?.label}
                  </>
                )}
              </button>

              {/* Footer Note */}
              <p className="text-center text-[11px] text-muted-foreground mt-4">
                Videos are generated by Pictura AI and watermarked for attribution
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
