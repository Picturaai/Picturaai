'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUp, ImageIcon, X, Download, ZoomIn, ChevronLeft,
  Sparkles, Flame, Upload, Loader2, RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'
import { PicturaIcon } from './pictura-logo'
import type { GeneratedImage, RateLimitInfo } from '@/lib/types'

type Mode = 'text' | 'image'

export function Studio() {
  const [mode, setMode] = useState<Mode>('text')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>({ limit: 5, remaining: 5, used: 0, resetAt: '' })
  const [lightbox, setLightbox] = useState<GeneratedImage | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  const fetchRateLimit = useCallback(async () => {
    try {
      const res = await fetch('/api/rate-limit')
      if (res.ok) setRateLimit(await res.json())
    } catch { /* silent */ }
  }, [])

  useEffect(() => { setMounted(true); fetchRateLimit() }, [fetchRateLimit])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [prompt])

  const handleFileChange = (file: File | null) => {
    if (!file) { setUploadedFile(null); setUploadPreview(null); return }
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('Image must be under 10MB.'); return }
    setUploadedFile(file)
    setUploadPreview(URL.createObjectURL(file))
    setMode('image')
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (rateLimit.remaining <= 0) {
      toast.error('Daily limit reached. You have 5 free generations per day during beta.')
      return
    }
    if (mode === 'image' && !uploadedFile) {
      toast.error('Upload an image first for image-to-image mode.')
      return
    }

    setLoading(true)
    try {
      let res: Response
      if (mode === 'text') {
        res = await fetch('/api/generate/text-to-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: prompt.trim() }),
        })
      } else {
        const formData = new FormData()
        formData.append('prompt', prompt.trim())
        if (uploadedFile) formData.append('image', uploadedFile)
        res = await fetch('/api/generate/image-to-image', { method: 'POST', body: formData })
      }

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Generation failed. Please try again.')
        if (data.rateLimitInfo) setRateLimit(data.rateLimitInfo)
        return
      }

      setImages((prev) => [data, ...prev])
      if (data.rateLimitInfo) setRateLimit(data.rateLimitInfo)
      setPrompt('')
      toast.success('Image generated!')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() }
  }

  const handleDownload = async (img: GeneratedImage) => {
    try {
      const res = await fetch(img.url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pictura-${Date.now()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Download failed.') }
  }

  const creditsUsed = rateLimit.used
  const creditsTotal = rateLimit.limit
  const creditsFraction = creditsTotal > 0 ? creditsUsed / creditsTotal : 0

  if (!mounted) return null

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-70">
            <PicturaIcon size={28} />
            <span className="text-lg font-bold tracking-tight text-foreground">Pictura</span>
          </Link>
          <span className="hidden rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary sm:inline-block">
            BETA
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Credits indicator */}
          <div className="flex items-center gap-2.5 rounded-full border border-border/60 bg-card px-3.5 py-1.5">
            <div className="relative h-5 w-5">
              <svg viewBox="0 0 36 36" className="h-5 w-5 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                <circle
                  cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                  stroke="currentColor"
                  strokeDasharray={`${(1 - creditsFraction) * 87.96} 87.96`}
                  strokeLinecap="round"
                  className={creditsFraction >= 1 ? 'text-destructive' : 'text-primary'}
                />
              </svg>
              <Flame className="absolute inset-0 m-auto h-2.5 w-2.5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground">
              {rateLimit.remaining}<span className="text-muted-foreground">/{creditsTotal}</span>
            </span>
          </div>

          <Link
            href="/about"
            className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60 sm:inline-block"
          >
            About
          </Link>
        </div>
      </header>

      {/* Canvas / Gallery area */}
      <div ref={galleryRef} className="flex-1 overflow-y-auto">
        {images.length === 0 ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-foreground">What will you create?</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Describe an image below and Pictura will generate it for you. You have {rateLimit.remaining} generation{rateLimit.remaining !== 1 ? 's' : ''} remaining today.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  'A serene Japanese garden at dawn',
                  'An astronaut riding a horse on Mars',
                  'Oil painting of Lagos skyline',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    className="rounded-full border border-border/60 bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Gallery grid */
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((img, i) => (
                <motion.div
                  key={img.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group mb-4 break-inside-avoid"
                >
                  <div className="relative overflow-hidden rounded-xl border border-border/40 bg-card">
                    <button onClick={() => setLightbox(img)} className="block w-full text-left">
                      <Image
                        src={img.url}
                        alt={img.prompt}
                        width={1024}
                        height={1024}
                        className="w-full object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </button>
                    {/* Overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 transition-transform duration-200 group-hover:translate-y-0">
                      <p className="line-clamp-2 text-xs text-white/90">{img.prompt}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(img) }}
                          className="rounded-lg bg-white/10 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                          aria-label="Download image"
                        >
                          <Download className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => setLightbox(img)}
                          className="rounded-lg bg-white/10 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/20"
                          aria-label="View full size"
                        >
                          <ZoomIn className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                    {/* Watermark */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-md bg-black/20 px-2 py-0.5 backdrop-blur-sm">
                      <PicturaIcon size={12} />
                      <span className="text-[9px] font-medium text-white/60">PICTURA</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input dock */}
      <div className="border-t border-border/40 bg-background px-4 pb-4 pt-3 md:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Uploaded image preview */}
          <AnimatePresence>
            {uploadPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2.5">
                  <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={uploadPreview} alt="Upload preview" fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{uploadedFile?.name}</p>
                    <p className="text-[11px] text-muted-foreground">Reference image for transformation</p>
                  </div>
                  <button
                    onClick={() => { handleFileChange(null); setMode('text') }}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt bar */}
          <div className="flex items-end gap-2 rounded-2xl border border-border/60 bg-card p-2 transition-colors focus-within:border-primary/40">
            {/* Mode & upload buttons */}
            <div className="flex items-center gap-1 pb-0.5">
              <button
                onClick={() => { setMode(mode === 'text' ? 'image' : 'text'); if (mode === 'text') fileInputRef.current?.click() }}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                  mode === 'image' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={mode === 'text' ? 'Switch to image-to-image' : 'Upload reference image'}
                aria-label="Toggle image-to-image mode"
              >
                {mode === 'image' ? <ImageIcon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'text' ? 'Describe the image you want to create...' : 'Describe how to transform this image...'}
              rows={1}
              disabled={loading}
              className="flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || rateLimit.remaining <= 0}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
              aria-label="Generate image"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Status bar */}
          <div className="mt-2.5 flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {mode === 'text' ? (
                  <><Sparkles className="h-3 w-3" /> Text to Image</>
                ) : (
                  <><RefreshCw className="h-3 w-3" /> Image to Image</>
                )}
              </span>
              {rateLimit.remaining <= 2 && rateLimit.remaining > 0 && (
                <span className="text-[11px] text-amber-600">
                  {rateLimit.remaining} generation{rateLimit.remaining !== 1 ? 's' : ''} left today
                </span>
              )}
              {rateLimit.remaining <= 0 && (
                <span className="text-[11px] text-destructive">
                  Daily limit reached &middot; Resets at midnight UTC
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground/50">
              Pictura Beta &middot; 1024x1024
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative max-h-[85vh] max-w-4xl overflow-hidden rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={lightbox.url}
                alt={lightbox.prompt}
                width={1024}
                height={1024}
                className="h-auto max-h-[85vh] w-auto rounded-2xl object-contain"
              />
              {/* Top controls */}
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <button
                  onClick={() => handleDownload(lightbox)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {/* Bottom info */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <p className="text-sm text-white/90">{lightbox.prompt}</p>
                <div className="mt-2 flex items-center gap-2">
                  <PicturaIcon size={14} />
                  <span className="text-[11px] text-white/50">Generated by Pictura &middot; {lightbox.type === 'text' ? 'Text to Image' : 'Image to Image'}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
