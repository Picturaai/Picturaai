'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ImageIcon, X, Download, ZoomIn,
  Upload, Loader2, ArrowRight, Info,
  ThumbsUp, ThumbsDown, Grid3X3, ChevronLeft,
  ChevronDown, Check,
} from 'lucide-react'
import { toast } from 'sonner'
import { PicturaIcon, PicturaLogo } from './pictura-logo'
import { playSuccessSound, playLimitSound } from '@/lib/sounds'
import type { GeneratedImage, RateLimitInfo } from '@/lib/types'

type Mode = 'text' | 'image'
type Feedback = 'up' | 'down' | null

const TOUR_STEPS = [
  {
    title: 'Welcome to Pictura Studio',
    description: 'Create stunning AI-generated images in seconds. Let us show you around.',
    target: 'hero',
  },
  {
    title: 'Choose Your Model',
    description: 'Select a model from the switcher. Currently pi-1.0 is available, with more coming soon.',
    target: 'model',
  },
  {
    title: 'Your Daily Credits',
    description: 'During beta, you get 5 free generations per day. This counter tracks your remaining credits.',
    target: 'credits',
  },
  {
    title: 'Type Your Prompt',
    description: 'Describe what you want to see. Be specific for best results. Use "Image to Image" to transform existing photos.',
    target: 'prompt',
  },
  {
    title: 'View Your Gallery',
    description: 'All generated images appear in your gallery. Rate them, download, or view full size.',
    target: 'gallery',
  },
]

const MODELS = [
  { id: 'pi-1.0', name: 'Pictura pi-1.0', status: 'active' as const, description: 'General purpose image generation' },
  { id: 'pi-1.5-turbo', name: 'Pictura pi-1.5 Turbo', status: 'coming' as const, description: 'Faster, higher quality' },
  { id: 'pi-2.0', name: 'Pictura pi-2.0', status: 'coming' as const, description: 'Next-gen architecture' },
]

/* Custom Send Icon - clean arrow in circle */
function SendIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 12h12M13 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ---- Tour Overlay: positions tooltip next to real elements ---- */
function TourOverlay({
  step, steps, onNext, onSkip,
}: {
  step: number
  steps: typeof TOUR_STEPS
  onNext: () => void
  onSkip: () => void
}) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const current = steps[step]

  useEffect(() => {
    // Step 0 ("hero") has no specific target element - show centered
    if (current.target === 'hero') { setRect(null); return }
    const el = document.querySelector(`[data-tour="${current.target}"]`)
    if (!el) { setRect(null); return }
    const r = el.getBoundingClientRect()
    setRect(r)
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [step, current.target])

  // Compute tooltip position
  const isBottom = rect ? rect.top < window.innerHeight / 2 : false
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <motion.div
      key="tour-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70]"
      onClick={onSkip}
    >
      {/* Dark backdrop with cutout for highlighted element */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Highlight cutout around the target element */}
      {rect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-transparent"
          style={{
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.50)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Tooltip card */}
      <motion.div
        key={`tour-card-${step}`}
        initial={{ opacity: 0, y: isBottom ? -8 : 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: isBottom ? -8 : 8, scale: 0.96 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="absolute z-10 w-[calc(100%-2rem)] max-w-xs rounded-2xl border border-border/40 bg-background p-5 shadow-xl sm:w-80"
        style={
          rect && !isMobile
            ? {
                left: Math.min(Math.max(rect.left, 16), window.innerWidth - 336),
                top: isBottom ? rect.bottom + 14 : undefined,
                bottom: !isBottom ? window.innerHeight - rect.top + 14 : undefined,
              }
            : {
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }
        }
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress dots */}
        <div className="mb-4 flex items-center gap-1.5">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-5 bg-primary' : i < step ? 'w-1 bg-primary/40' : 'w-1 bg-border'
              }`}
            />
          ))}
        </div>

        <h3 className="text-sm font-bold text-foreground">{current.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{current.description}</p>

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/40">{step + 1}/{steps.length}</span>
            <button
              onClick={onNext}
              className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              {step === steps.length - 1 ? 'Done' : 'Next'}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
  const [feedbackMap, setFeedbackMap] = useState<Record<string, Feedback>>({})
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [showExhausted, setShowExhausted] = useState(false)
  const [tourStep, setTourStep] = useState(-1) // -1 = not showing
  const [selectedModel, setSelectedModel] = useState('pi-1.0')
  const [modelOpen, setModelOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)

  const fetchRateLimit = useCallback(async () => {
    try {
      const res = await fetch('/api/rate-limit')
      if (res.ok) setRateLimit(await res.json())
    } catch { /* silent */ }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchRateLimit()
    // Show tour on first visit only
    try {
      if (!localStorage.getItem('pictura_tour_done')) {
        setTimeout(() => setTourStep(0), 600)
      }
    } catch { /* silent */ }
  }, [fetchRateLimit])

  // Close model dropdown when clicking outside
  useEffect(() => {
    if (!modelOpen) return
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('[data-tour="model"]')) setModelOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [modelOpen])

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
      playLimitSound()
      setShowExhausted(true)
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
      playSuccessSound()
      toast.success('Image generated!')
      setTimeout(() => galleryRef.current?.scrollTo({ top: 0, behavior: 'smooth' }), 100)

      // Check if this was the last generation
      const updatedRemaining = data.rateLimitInfo?.remaining ?? rateLimit.remaining - 1
      if (updatedRemaining <= 0) {
        setTimeout(() => {
          playLimitSound()
          setShowExhausted(true)
        }, 1500)
      } else if (updatedRemaining === 1) {
        setTimeout(() => toast('You have 1 generation left today. Make it count!'), 800)
      }
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

  const handleFeedback = (url: string, type: Feedback) => {
    setFeedbackMap((prev) => ({
      ...prev,
      [url]: prev[url] === type ? null : type,
    }))
    if (type === 'up') toast.success('Thanks for the feedback!')
    if (type === 'down') toast('We\'ll use this to improve Pictura.')
  }

  const dismissTour = () => {
    setTourStep(-1)
    try { localStorage.setItem('pictura_tour_done', '1') } catch { /* silent */ }
  }
  const nextTourStep = () => {
    if (tourStep >= TOUR_STEPS.length - 1) { dismissTour(); return }
    setTourStep((s) => s + 1)
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

          {/* Model switcher */}
          <div className="relative" data-tour="model">
            <button
              onClick={() => setModelOpen(!modelOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-border/40 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/60"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="hidden xs:inline">{MODELS.find(m => m.id === selectedModel)?.name ?? selectedModel}</span>
              <span className="xs:hidden">pi-1.0</span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${modelOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {modelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full z-30 mt-1.5 w-64 overflow-hidden rounded-xl border border-border/50 bg-card shadow-lg"
                >
                  <div className="px-3 py-2.5 border-b border-border/30">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Model</p>
                  </div>
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      disabled={model.status === 'coming'}
                      onClick={() => { setSelectedModel(model.id); setModelOpen(false) }}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                        model.status === 'coming'
                          ? 'cursor-not-allowed opacity-50'
                          : 'hover:bg-secondary/60'
                      }`}
                    >
                      <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                        selectedModel === model.id ? 'bg-primary/10' : 'bg-secondary'
                      }`}>
                        <PicturaIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground">{model.name}</span>
                          {model.status === 'coming' && (
                            <span className="rounded bg-muted px-1 py-px text-[9px] font-medium text-muted-foreground">Soon</span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">{model.description}</p>
                      </div>
                      {selectedModel === model.id && <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Credits display */}
          <div data-tour="credits" className="flex items-center gap-2 rounded-full border border-border/50 bg-card px-3 py-1.5">
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

          {images.length > 0 && (
            <button
              onClick={() => setGalleryOpen(!galleryOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-border/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/60"
              aria-label="Toggle gallery"
            >
              <Grid3X3 className="h-3 w-3" />
              <span className="hidden sm:inline">Gallery</span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/10 px-1 text-[10px] font-bold text-primary">
                {images.length}
              </span>
            </button>
          )}
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
      <div ref={galleryRef} data-tour="gallery" className="flex-1 overflow-y-auto">
        {loading && images.length === 0 ? (
          /* First-time loading state - orbital rings */
          <div className="flex h-full flex-col items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="relative flex h-32 w-32 items-center justify-center">
                {/* Outer ring */}
                <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '4s' }} viewBox="0 0 128 128" aria-hidden="true">
                  <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="8 12" className="text-border" />
                </svg>
                {/* Middle ring */}
                <svg className="absolute inset-3 h-[104px] w-[104px] animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} viewBox="0 0 104 104" aria-hidden="true">
                  <circle cx="52" cy="52" r="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 8" className="text-primary/30" />
                </svg>
                {/* Inner ring */}
                <svg className="absolute inset-6 h-20 w-20 animate-spin" style={{ animationDuration: '2.5s' }} viewBox="0 0 80 80" aria-hidden="true">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 10" className="text-primary/50" />
                </svg>
                {/* Center icon */}
                <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <PicturaIcon size={24} />
                </div>
              </div>
              <p className="mt-8 text-sm font-semibold text-foreground">Creating your image</p>
              <p className="mt-1.5 text-xs text-muted-foreground">Pictura is generating, this may take a moment</p>
              {/* Thin progress bar */}
              <div className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-secondary">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 15, ease: 'easeOut' }}
                />
              </div>
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
                  <div className="rounded-2xl border border-border/40 bg-card p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center">
                        {/* Mini spinning ring */}
                        <svg className="absolute inset-0 h-full w-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 56 56" aria-hidden="true">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 10" className="text-primary/40" />
                        </svg>
                        <PicturaIcon size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">Generating image...</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{prompt || 'Processing your request'}</p>
                        <div className="mt-2.5 h-1 w-full max-w-xs overflow-hidden rounded-full bg-secondary">
                          <motion.div
                            className="h-full rounded-full bg-primary"
                            initial={{ width: '0%' }}
                            animate={{ width: '90%' }}
                            transition={{ duration: 15, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {images.map((img, i) => {
                const fb = feedbackMap[img.url] ?? null
                return (
                  <motion.div
                    key={img.url}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.04 }}
                    className="group"
                  >
                    <div className="overflow-hidden rounded-2xl border border-border/30 bg-card">
                      {/* Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <button onClick={() => setLightbox(img)} className="block h-full w-full">
                          <Image
                            src={img.url}
                            alt={img.prompt}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </button>
                        {/* Watermark logo */}
                        <div className="absolute top-2.5 right-2.5 rounded-lg bg-black/20 p-1.5 backdrop-blur-sm">
                          <PicturaIcon size={14} />
                        </div>
                        {/* Expand button on hover */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-200 group-hover:bg-black/10">
                          <div className="scale-0 rounded-full bg-white/20 p-3 backdrop-blur-sm transition-transform duration-200 group-hover:scale-100">
                            <ZoomIn className="h-5 w-5 text-white" />
                          </div>
                        </div>
                      </div>

                      {/* Card info */}
                      <div className="px-4 pb-4 pt-3">
                        <p className="line-clamp-2 text-[13px] leading-relaxed text-foreground">{img.prompt}</p>
                        <div className="mt-2.5 flex items-center gap-1.5">
                          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {img.type === 'text-to-image' ? 'Text' : 'Image'} to Image
                          </span>
                          <span className="text-[10px] text-muted-foreground/50 font-mono">1024px</span>
                        </div>

                        {/* Feedback + actions */}
                        <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-3">
                          <div className="flex items-center gap-1">
                            <span className="mr-1 text-[10px] text-muted-foreground/60">Rate</span>
                            <button
                              onClick={() => handleFeedback(img.url, 'up')}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                                fb === 'up'
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground/40 hover:bg-secondary hover:text-foreground'
                              }`}
                              aria-label="Like this image"
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleFeedback(img.url, 'down')}
                              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                                fb === 'down'
                                  ? 'bg-destructive/10 text-destructive'
                                  : 'text-muted-foreground/40 hover:bg-secondary hover:text-foreground'
                              }`}
                              aria-label="Dislike this image"
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDownload(img)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground/40 transition-all hover:bg-secondary hover:text-foreground"
                              aria-label="Download"
                            >
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
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
          <div data-tour="prompt" className="flex items-end gap-2 rounded-2xl border border-border/50 bg-background p-2 transition-colors focus-within:border-primary/30">
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
                <span className="text-[11px] font-medium text-accent-foreground">
                  {rateLimit.remaining} left today
                </span>
              )}
              {rateLimit.remaining <= 0 && (
                <span className="text-[11px] font-medium text-destructive">
                  Limit reached
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/40 font-mono">
                {selectedModel} &middot; 1024
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Walkthrough Tour - highlights real elements */}
      <AnimatePresence>
        {tourStep >= 0 && tourStep < TOUR_STEPS.length && (
          <TourOverlay
            step={tourStep}
            steps={TOUR_STEPS}
            onNext={nextTourStep}
            onSkip={dismissTour}
          />
        )}
      </AnimatePresence>

      {/* Exhausted overlay */}
      <AnimatePresence>
        {showExhausted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-md p-4"
            onClick={() => setShowExhausted(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/30 bg-background p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative ring */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                <div className="relative flex h-full w-full items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 80 80" aria-hidden="true">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" className="text-destructive/20" />
                    <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="226.19" strokeDashoffset="0" strokeLinecap="round" className="text-destructive/60" />
                  </svg>
                  <PicturaIcon size={28} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-foreground">
                {"Oops! You've used all your credits"}
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {"You've exhausted your 5 free image generations for today. We're working hard to increase limits as Pictura grows."}
              </p>

              <div className="mx-auto mt-5 flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-secondary/50 px-4 py-2.5">
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-primary" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm font-medium text-foreground">
                  Resets daily at <strong>12:00 AM</strong>
                </span>
              </div>

              <p className="mt-4 text-xs text-muted-foreground/60">
                Pictura is in beta. More capacity is coming soon.
              </p>

              <button
                onClick={() => setShowExhausted(false)}
                className="mt-6 w-full rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery side panel */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setGalleryOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {galleryOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-border/40 bg-background"
          >
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
              <div className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4 text-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Your Creations</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {images.length}
                </span>
              </div>
              <button
                onClick={() => setGalleryOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close gallery"
              >
                <ChevronLeft className="h-4 w-4 rotate-180" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {images.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center px-4">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No images yet</p>
                  <p className="mt-1 text-xs text-muted-foreground/60">Your generated images will appear here</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {images.map((img) => (
                    <button
                      key={img.url}
                      onClick={() => { setLightbox(img); setGalleryOpen(false) }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-border/30 bg-card"
                    >
                      <Image
                        src={img.url}
                        alt={img.prompt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="160px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <p className="line-clamp-2 text-[10px] leading-snug text-white/90">{img.prompt}</p>
                      </div>
                      {/* Feedback indicator */}
                      {feedbackMap[img.url] === 'up' && (
                        <div className="absolute top-1.5 right-1.5 rounded-md bg-primary/20 p-0.5 backdrop-blur-sm">
                          <ThumbsUp className="h-2.5 w-2.5 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-border/40 px-4 py-3">
              <p className="text-center text-[10px] text-muted-foreground/50">
                {images.length} image{images.length !== 1 ? 's' : ''} generated in this session
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                <p className="text-sm text-white/90">{lightbox.prompt}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PicturaIcon size={14} />
                    <span className="text-[10px] text-white/50">
                      {lightbox.type === 'text-to-image' ? 'Text to Image' : 'Image to Image'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="mr-1 text-[10px] text-white/40">How did we do?</span>
                    <button
                      onClick={() => handleFeedback(lightbox.url, 'up')}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                        feedbackMap[lightbox.url] === 'up'
                          ? 'bg-white/20 text-white'
                          : 'text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                      aria-label="Like"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(lightbox.url, 'down')}
                      className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                        feedbackMap[lightbox.url] === 'down'
                          ? 'bg-white/20 text-white'
                          : 'text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                      aria-label="Dislike"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
