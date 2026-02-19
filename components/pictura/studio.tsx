'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImageIcon, X, Download, ZoomIn,
  Upload, Loader2, ArrowRight, Info,
} from 'lucide-react'
import { toast } from 'sonner'
import { PicturaIcon, PicturaLogo } from './pictura-logo'
import type { GeneratedImage, RateLimitInfo } from '@/lib/types'

type Mode = 'text' | 'image'

/* Custom Send Icon - clean arrow in circle */
function SendIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 12h12M13 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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
      toast.error('Upload a reference image first.')
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
      setTimeout(() => galleryRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)
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
      <header className="flex items-center justify-between border-b border-border/40 px-4 py-2.5 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="transition-opacity hover:opacity-70">
            <PicturaLogo size="sm" />
          </Link>
          <span className="rounded-md bg-primary/8 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary">
            BETA
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Credits display */}
          <div className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-3 py-1.5">
            <div className="relative h-[18px] w-[18px]">
              <svg viewBox="0 0 36 36" className="h-[18px] w-[18px] -rotate-90" aria-hidden="true">
                <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary" />
                <circle
                  cx="18" cy="18" r="15" fill="none" strokeWidth="3"
                  stroke="currentColor"
                  strokeDasharray={`${(1 - creditsFraction) * 94.25} 94.25`}
                  strokeLinecap="round"
                  className={creditsFraction >= 1 ? 'text-destructive' : 'text-primary'}
                  style={{ transition: 'stroke-dasharray 0.4s ease' }}
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-foreground">
              {rateLimit.remaining}
            </span>
            <span className="text-[10px] text-muted-foreground">left today</span>
          </div>

          <Link
            href="/about"
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60 sm:flex"
          >
            <Info className="h-3 w-3" />
            About
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <div ref={galleryRef} className="flex-1 overflow-y-auto">
        {loading && images.length === 0 ? (
          /* First-time loading state */
          <div className="flex h-full flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-primary/10 animate-pulse" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <PicturaIcon size={36} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Generating your image...</p>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">This may take a few seconds</p>
            </motion.div>
          </div>
        ) : images.length === 0 && !loading ? (
          /* Empty state */
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <PicturaIcon size={56} />
              <h2 className="mt-5 text-xl font-semibold text-foreground">What will you create?</h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Type a description below and Pictura will generate an image for you.
                You have <strong className="text-foreground">{rateLimit.remaining} generation{rateLimit.remaining !== 1 ? 's' : ''}</strong> remaining today.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  'A serene Japanese garden at dawn',
                  'Astronaut riding a horse on Mars',
                  'Oil painting of a coastal sunset',
                  'Macro photo of morning dew on a leaf',
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPrompt(s)}
                    className="rounded-full border border-border/50 bg-card px-4 py-2 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground hover:bg-card/80"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          /* Gallery */
          <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
            {/* Loading card at top when generating */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex-shrink-0">
                        <div className="absolute inset-0 rounded-xl bg-primary/10 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <PicturaIcon size={28} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                          <p className="text-sm font-semibold text-foreground">Generating image...</p>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{prompt || 'Processing your request'}</p>
                        <div className="mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-primary/10">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: '0%' }}
                            animate={{ width: '85%' }}
                            transition={{ duration: 12, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((img, i) => (
                <motion.div
                  key={img.url}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.03 }}
                  className="group mb-4 break-inside-avoid"
                >
                  <div className="relative overflow-hidden rounded-xl border border-border/30 bg-card">
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
                    {/* Hover overlay */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 transition-transform duration-200 group-hover:translate-y-0">
                      <p className="line-clamp-2 text-xs text-white/90">{img.prompt}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(img) }}
                          className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/25"
                          aria-label="Download image"
                        >
                          <Download className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button
                          onClick={() => setLightbox(img)}
                          className="rounded-lg bg-white/15 p-1.5 backdrop-blur-sm transition-colors hover:bg-white/25"
                          aria-label="View full size"
                        >
                          <ZoomIn className="h-3.5 w-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                    {/* Logo-only watermark */}
                    <div className="absolute top-2.5 right-2.5 rounded-md bg-black/20 p-1 backdrop-blur-sm">
                      <PicturaIcon size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input dock */}
      <div className="border-t border-border/30 bg-card/50 backdrop-blur-sm px-4 pb-4 pt-3 md:px-6">
        <div className="mx-auto max-w-3xl">
          {/* Upload preview */}
          <AnimatePresence>
            {uploadPreview && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-background p-2.5">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image src={uploadPreview} alt="Upload preview" fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-foreground">{uploadedFile?.name}</p>
                    <p className="text-[11px] text-muted-foreground">Reference for transformation</p>
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
          <div className="flex items-end gap-2 rounded-2xl border border-border/50 bg-background p-2 transition-colors focus-within:border-primary/30">
            <div className="flex items-center gap-1 pb-0.5">
              <button
                onClick={() => { if (mode === 'text') { fileInputRef.current?.click() } else { setMode('text'); handleFileChange(null) } }}
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                  mode === 'image' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
                title={mode === 'text' ? 'Upload reference image' : 'Remove reference'}
                aria-label="Toggle image mode"
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
              className="flex-1 resize-none bg-transparent py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-50"
            />

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim() || rateLimit.remaining <= 0}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
              aria-label="Generate image"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Mode switcher + status */}
          <div className="mt-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1 rounded-lg bg-secondary/50 p-0.5">
              <button
                onClick={() => { setMode('text'); handleFileChange(null) }}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  mode === 'text'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Text to Image
              </button>
              <button
                onClick={() => { setMode('image'); if (!uploadedFile) fileInputRef.current?.click() }}
                className={`rounded-md px-3 py-1 text-[11px] font-medium transition-all ${
                  mode === 'image'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Image to Image
              </button>
            </div>

            <div className="flex items-center gap-3">
              {rateLimit.remaining <= 2 && rateLimit.remaining > 0 && (
                <span className="text-[11px] font-medium text-amber-600">
                  {rateLimit.remaining} left today
                </span>
              )}
              {rateLimit.remaining <= 0 && (
                <span className="text-[11px] font-medium text-destructive">
                  Limit reached
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/40 font-mono">
                1024 x 1024
              </span>
            </div>
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
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => handleDownload(lightbox)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setLightbox(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/40 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/60"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <p className="text-sm text-white/90">{lightbox.prompt}</p>
                <div className="mt-2 flex items-center gap-2">
                  <PicturaIcon size={14} />
                  <span className="text-[10px] text-white/50">
                    {lightbox.type === 'text' ? 'Text to Image' : 'Image to Image'}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
