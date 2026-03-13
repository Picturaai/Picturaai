'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Download, Clapperboard, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { BrandedVideoPlayer } from './branded-video-player'

interface VideoDownloadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  videoUrl: string
  videoName?: string
}

export function VideoDownloadModal({
  open,
  onOpenChange,
  videoUrl,
  videoName = `pictura-video-${Date.now()}`,
}: VideoDownloadModalProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(videoUrl)
      if (!response.ok) throw new Error('Failed to fetch video')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = `${videoName}.mp4`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)

      toast.success('Video download started')
    } catch {
      window.open(videoUrl, '_blank', 'noopener,noreferrer')
      toast('Opened video in a new tab. Use Save As to download if needed.')
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-[radial-gradient(circle_at_top,_hsl(262_83%_58%/_0.25),_transparent_40%),rgba(0,0,0,0.72)] backdrop-blur-sm sm:items-center"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            onClick={(e) => e.stopPropagation()}
            className="relative mx-0 w-full overflow-hidden rounded-t-2xl border border-primary/20 bg-background shadow-2xl sm:mx-4 sm:max-w-2xl sm:rounded-2xl"
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 text-primary">
                  <Clapperboard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Download video</h2>
                  <div className="mt-1 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"><Sparkles className="h-3 w-3" /> Pictura quality preview</div>
                  <p className="mt-1 text-xs text-muted-foreground">Your latest generated video is ready to save.</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-primary/20 bg-card">
                <div className="aspect-video">
                  <BrandedVideoPlayer src={videoUrl} badgeLabel="Pictura Download Preview" />
                </div>
              </div>

              <button
                onClick={handleDownload}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Download MP4
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
