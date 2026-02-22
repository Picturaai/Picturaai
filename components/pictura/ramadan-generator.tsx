'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowRight, ArrowLeft, Download, Sparkles, Moon, Star, BookOpen,
  Heart, RefreshCw, Type, User, Loader2, Check, ChevronRight,
} from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

/* ------------------------------------------------------------------ */
/* Templates                                                           */
/* ------------------------------------------------------------------ */

type Template = {
  id: string
  name: string
  description: string
  bgClass: string
  textColor: string
  accentColor: string
  pattern: 'crescent' | 'lanterns' | 'geometric' | 'stars' | 'mosque' | 'arabesque' | 'minimal' | 'calligraphy'
}

const templates: Template[] = [
  {
    id: 'classic-gold',
    name: 'Classic Gold',
    description: 'Elegant gold crescent with warm tones',
    bgClass: 'bg-gradient-to-br from-[#1a0f00] via-[#2d1a07] to-[#0d0700]',
    textColor: 'text-[#FFD700]',
    accentColor: '#FFD700',
    pattern: 'crescent',
  },
  {
    id: 'crescent-night',
    name: 'Crescent Night',
    description: 'Deep midnight blue with silver stars',
    bgClass: 'bg-gradient-to-br from-[#0a0e27] via-[#131940] to-[#060818]',
    textColor: 'text-[#C0C8FF]',
    accentColor: '#8B9AFF',
    pattern: 'stars',
  },
  {
    id: 'lantern-glow',
    name: 'Lantern Glow',
    description: 'Warm lanterns in the evening sky',
    bgClass: 'bg-gradient-to-br from-[#1a0a2e] via-[#2d1657] to-[#0f0519]',
    textColor: 'text-[#FFB347]',
    accentColor: '#FFB347',
    pattern: 'lanterns',
  },
  {
    id: 'emerald-peace',
    name: 'Emerald Peace',
    description: 'Traditional Islamic green and gold',
    bgClass: 'bg-gradient-to-br from-[#0a1f0a] via-[#0f2f14] to-[#050f05]',
    textColor: 'text-[#90EE90]',
    accentColor: '#4CAF50',
    pattern: 'geometric',
  },
  {
    id: 'royal-purple',
    name: 'Royal Mosque',
    description: 'Majestic mosque silhouette design',
    bgClass: 'bg-gradient-to-br from-[#1a0a2e] via-[#0f1940] to-[#0a0520]',
    textColor: 'text-[#E8D5FF]',
    accentColor: '#B88AFF',
    pattern: 'mosque',
  },
  {
    id: 'desert-rose',
    name: 'Desert Rose',
    description: 'Warm rose tones with arabesque patterns',
    bgClass: 'bg-gradient-to-br from-[#2d0f1a] via-[#3d1428] to-[#1a0810]',
    textColor: 'text-[#FFB4C8]',
    accentColor: '#FF7099',
    pattern: 'arabesque',
  },
  {
    id: 'midnight-calm',
    name: 'Midnight Calm',
    description: 'Minimalist dark design with golden accent',
    bgClass: 'bg-gradient-to-br from-[#0f0f0f] via-[#1a1a1a] to-[#0a0a0a]',
    textColor: 'text-[#C87941]',
    accentColor: '#C87941',
    pattern: 'minimal',
  },
  {
    id: 'sacred-script',
    name: 'Sacred Script',
    description: 'Calligraphy-inspired elegant design',
    bgClass: 'bg-gradient-to-br from-[#1a1400] via-[#2d2200] to-[#0f0a00]',
    textColor: 'text-[#FFE4B5]',
    accentColor: '#DAA520',
    pattern: 'calligraphy',
  },
]

type ContentType = 'greeting' | 'quran' | 'hadith' | 'dua' | 'custom'

/* ------------------------------------------------------------------ */
/* SVG Pattern Renderers                                               */
/* ------------------------------------------------------------------ */

function CardPattern({ pattern, color }: { pattern: Template['pattern']; color: string }) {
  switch (pattern) {
    case 'crescent':
      return (
        <svg className="absolute top-6 right-6 opacity-30" width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="45" stroke={color} strokeWidth="1.5" fill="none" />
          <circle cx="72" cy="48" r="35" fill="currentColor" className="text-[#0d0700]" />
          <circle cx="85" cy="25" r="4" fill={color} />
          <circle cx="95" cy="35" r="2" fill={color} opacity="0.6" />
          <circle cx="100" cy="22" r="1.5" fill={color} opacity="0.4" />
        </svg>
      )
    case 'stars':
      return (
        <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 260" fill="none">
          {[
            { x: 50, y: 30, r: 2 }, { x: 120, y: 50, r: 1.5 }, { x: 200, y: 20, r: 2.5 },
            { x: 300, y: 40, r: 1.8 }, { x: 350, y: 60, r: 1.2 }, { x: 80, y: 80, r: 1 },
            { x: 250, y: 70, r: 1.5 }, { x: 380, y: 25, r: 2 }, { x: 30, y: 55, r: 1.3 },
            { x: 170, y: 45, r: 1.8 }, { x: 320, y: 80, r: 1 }, { x: 140, y: 15, r: 2.2 },
            { x: 360, y: 50, r: 1.5 }, { x: 60, y: 100, r: 1 }, { x: 220, y: 90, r: 1.8 },
          ].map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={color}>
              <animate attributeName="opacity" values="0.3;1;0.3" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
          <circle cx="340" cy="50" r="30" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="352" cy="40" r="22" fill="#060818" />
        </svg>
      )
    case 'lanterns':
      return (
        <svg className="absolute top-0 left-0 w-full opacity-25" height="100" viewBox="0 0 400 100" fill="none">
          {[60, 140, 220, 300, 380].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="0" x2={x} y2={25 + i * 3} stroke={color} strokeWidth="0.8" />
              <rect x={x - 8} y={25 + i * 3} width="16" height="24" rx="4" stroke={color} strokeWidth="1" fill="none" />
              <ellipse cx={x} cy={37 + i * 3} rx="3" ry="4" fill={color} opacity="0.4" />
            </g>
          ))}
        </svg>
      )
    case 'geometric':
      return (
        <svg className="absolute bottom-4 right-4 opacity-20" width="140" height="140" viewBox="0 0 140 140" fill="none">
          <polygon points="70,10 130,40 130,100 70,130 10,100 10,40" stroke={color} strokeWidth="1" fill="none" />
          <polygon points="70,30 110,50 110,90 70,110 30,90 30,50" stroke={color} strokeWidth="0.8" fill="none" />
          <polygon points="70,50 90,60 90,80 70,90 50,80 50,60" stroke={color} strokeWidth="0.6" fill="none" />
          <circle cx="70" cy="70" r="8" stroke={color} strokeWidth="0.5" fill="none" />
        </svg>
      )
    case 'mosque':
      return (
        <svg className="absolute bottom-0 left-0 w-full opacity-15" height="80" viewBox="0 0 400 80" fill="none">
          <path d="M0,80 L0,50 Q50,20 100,50 L100,40 Q130,10 160,40 L160,50 Q200,15 240,50 L240,40 Q270,10 300,40 L300,50 Q350,20 400,50 L400,80 Z" fill={color} />
          <line x1="130" y1="10" x2="130" y2="0" stroke={color} strokeWidth="1.5" />
          <circle cx="130" cy="0" r="3" fill={color} opacity="0.6" />
          <line x1="270" y1="10" x2="270" y2="0" stroke={color} strokeWidth="1.5" />
          <circle cx="270" cy="0" r="3" fill={color} opacity="0.6" />
        </svg>
      )
    case 'arabesque':
      return (
        <svg className="absolute top-4 left-4 opacity-15" width="160" height="160" viewBox="0 0 160 160" fill="none">
          <path d="M80,10 Q120,40 110,80 Q100,120 80,150 Q60,120 50,80 Q40,40 80,10 Z" stroke={color} strokeWidth="1" fill="none" />
          <path d="M80,30 Q105,50 100,80 Q95,110 80,130 Q65,110 60,80 Q55,50 80,30 Z" stroke={color} strokeWidth="0.8" fill="none" />
          <circle cx="80" cy="80" r="12" stroke={color} strokeWidth="0.8" fill="none" />
          <circle cx="80" cy="80" r="4" fill={color} opacity="0.3" />
        </svg>
      )
    case 'minimal':
      return (
        <svg className="absolute top-6 right-6 opacity-20" width="80" height="80" viewBox="0 0 80 80" fill="none">
          <line x1="0" y1="0" x2="80" y2="80" stroke={color} strokeWidth="0.5" />
          <line x1="80" y1="0" x2="0" y2="80" stroke={color} strokeWidth="0.5" />
          <circle cx="40" cy="40" r="20" stroke={color} strokeWidth="0.8" fill="none" />
        </svg>
      )
    case 'calligraphy':
      return (
        <svg className="absolute top-4 right-4 opacity-20" width="140" height="60" viewBox="0 0 140 60" fill="none">
          <path d="M10,50 Q30,10 70,30 Q110,50 130,10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M20,45 Q50,20 80,35 Q110,50 120,25" stroke={color} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
        </svg>
      )
  }
}

/* ------------------------------------------------------------------ */
/* Main Component                                                      */
/* ------------------------------------------------------------------ */

export function RamadanCardGenerator() {
  const [step, setStep] = useState(0) // 0=template, 1=customize, 2=preview
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0])
  const [greeting, setGreeting] = useState('Ramadan Kareem')
  const [message, setMessage] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [generating, setGenerating] = useState<ContentType | null>(null)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateContent = useCallback(async (type: ContentType, context?: string) => {
    setGenerating(type)
    try {
      const res = await fetch('/api/ramadan/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setMessage(data.content)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated!`)
    } catch {
      toast.error('Failed to generate content. Please try again.')
    } finally {
      setGenerating(null)
    }
  }, [])

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        scale: 3,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `ramadan-card-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      toast.success('Card downloaded!')
    } catch {
      toast.error('Failed to download. Please try again.')
    } finally {
      setDownloading(false)
    }
  }, [])

  const contentButtons: { type: ContentType; label: string; icon: typeof Sparkles; desc: string }[] = [
    { type: 'greeting', label: 'Greeting', icon: Heart, desc: 'Generate a heartfelt Ramadan greeting' },
    { type: 'quran', label: 'Quran Verse', icon: BookOpen, desc: 'Get a relevant verse from the Quran' },
    { type: 'hadith', label: 'Hadith', icon: Star, desc: 'Get an authentic Hadith about Ramadan' },
    { type: 'dua', label: 'Dua', icon: Moon, desc: 'Generate a beautiful supplication' },
  ]

  /* ---------- Card Preview Component ---------- */
  function CardPreview({ interactive = false }: { interactive?: boolean }) {
    const t = selectedTemplate
    return (
      <div
        ref={interactive ? cardRef : undefined}
        className={`relative overflow-hidden rounded-xl ${t.bgClass} aspect-[5/3.2] w-full`}
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <CardPattern pattern={t.pattern} color={t.accentColor} />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
          {/* Top section */}
          <div>
            {recipientName && (
              <p className="text-xs opacity-60" style={{ color: t.accentColor }}>
                Dear {recipientName},
              </p>
            )}
            <h2
              className={`mt-1 text-2xl font-bold sm:text-3xl ${t.textColor}`}
              style={{ lineHeight: 1.2 }}
            >
              {greeting || 'Ramadan Kareem'}
            </h2>
          </div>

          {/* Message */}
          {message && (
            <p
              className="my-3 max-w-[85%] text-xs leading-relaxed sm:text-sm"
              style={{ color: t.accentColor, opacity: 0.85 }}
            >
              {message}
            </p>
          )}

          {/* Bottom section */}
          <div className="flex items-end justify-between">
            <div>
              {senderName && (
                <p className="text-xs opacity-50" style={{ color: t.accentColor }}>
                  From {senderName}
                </p>
              )}
            </div>
            {/* Watermark */}
            <div className="flex items-center gap-1 opacity-30">
              <PicturaIcon size={14} />
              <span className="text-[8px] font-semibold tracking-widest" style={{ color: t.accentColor }}>
                PICTURA
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border/50 bg-gradient-to-b from-primary/5 to-background pb-12 pt-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--primary)/0.08,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10"
          >
            <Moon className="h-7 w-7 text-primary" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl font-bold text-foreground sm:text-4xl md:text-5xl"
          >
            Ramadan Card Generator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground leading-relaxed"
          >
            Create beautiful Ramadan greeting cards with AI-powered content.
            Choose from stunning templates, add Quran verses, Hadith, or heartfelt messages.
          </motion.p>

          {/* Step indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2"
          >
            {['Template', 'Customize', 'Download'].map((label, i) => (
              <button
                key={label}
                onClick={() => { if (i <= step || (i === 1 && step >= 0) || (i === 2 && step >= 1)) setStep(i) }}
                className="flex items-center gap-2"
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  i < step
                    ? 'bg-primary text-primary-foreground'
                    : i === step
                      ? 'bg-primary/15 text-primary ring-2 ring-primary/30'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className={`hidden text-xs font-medium sm:block ${
                  i === step ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {label}
                </span>
                {i < 2 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AnimatePresence mode="wait">
          {/* STEP 0: Template Selection */}
          {step === 0 && (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-foreground">Choose a Template</h2>
              <p className="mt-1 text-sm text-muted-foreground">Select a design that matches the mood of your greeting</p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
                      selectedTemplate.id === t.id
                        ? 'border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'border-border/30 hover:border-border/60'
                    }`}
                  >
                    <div className={`relative aspect-[5/3.2] ${t.bgClass}`}>
                      <CardPattern pattern={t.pattern} color={t.accentColor} />
                      <div className="relative z-10 flex h-full flex-col justify-between p-4">
                        <h3 className={`text-base font-bold ${t.textColor}`}>Ramadan Kareem</h3>
                        <div className="flex items-center gap-1 opacity-30">
                          <PicturaIcon size={10} />
                          <span className="text-[7px] tracking-widest" style={{ color: t.accentColor }}>PICTURA</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-card/80 p-3 text-left">
                      <p className="text-xs font-semibold text-foreground">{t.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{t.description}</p>
                    </div>
                    {selectedTemplate.id === t.id && (
                      <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(1)}
                  className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                >
                  Customize Card
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 1: Customize */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="grid gap-8 lg:grid-cols-2"
            >
              {/* Left - Controls */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Customize Your Card</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Add your personal touch with AI-powered content</p>
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <User className="h-3 w-3" /> Recipient
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Their name"
                      className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <User className="h-3 w-3" /> Sender
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Greeting title */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Type className="h-3 w-3" /> Greeting Title
                  </label>
                  <input
                    type="text"
                    value={greeting}
                    onChange={(e) => setGreeting(e.target.value)}
                    placeholder="Ramadan Kareem"
                    className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* AI Content Buttons */}
                <div>
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-primary" /> AI-Powered Content
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {contentButtons.map((btn) => (
                      <button
                        key={btn.type}
                        onClick={() => generateContent(btn.type)}
                        disabled={generating !== null}
                        className="group flex items-center gap-2 rounded-lg border border-border/40 bg-card/60 p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/15">
                          {generating === btn.type ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <btn.icon className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">{btn.label}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{btn.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom AI prompt */}
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3 w-3" /> Custom AI Prompt
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g., A greeting for my family about gratitude..."
                      id="custom-prompt"
                      className="flex-1 rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const el = document.getElementById('custom-prompt') as HTMLInputElement
                          if (el.value.trim()) generateContent('custom', el.value.trim())
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById('custom-prompt') as HTMLInputElement
                        if (el.value.trim()) generateContent('custom', el.value.trim())
                      }}
                      disabled={generating !== null}
                      className="flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                    >
                      {generating === 'custom' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Message textarea */}
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <BookOpen className="h-3 w-3" /> Card Message
                    </label>
                    {message && (
                      <button
                        onClick={() => setMessage('')}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message will appear here. Use the AI buttons above or type your own..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-border/50 bg-card px-3 py-2.5 text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/40 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                {/* Nav buttons */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Templates
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-95"
                  >
                    Preview & Download
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Right - Live Preview */}
              <div>
                <p className="mb-3 text-xs font-medium text-muted-foreground">Live Preview</p>
                <div className="overflow-hidden rounded-xl border border-border/30 shadow-lg">
                  <CardPreview />
                </div>
                <p className="mt-2 text-center text-[10px] text-muted-foreground/50">
                  Changes appear in real-time
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Preview & Download */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <h2 className="text-lg font-semibold text-foreground">Your Ramadan Card</h2>
              <p className="mt-1 text-sm text-muted-foreground">Preview and download your creation</p>

              {/* Large preview */}
              <div className="mt-8 w-full max-w-2xl">
                <div className="overflow-hidden rounded-2xl border border-border/30 shadow-2xl shadow-primary/10">
                  <CardPreview interactive />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Edit Card
                </button>
                <button
                  onClick={downloadCard}
                  disabled={downloading}
                  className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:opacity-90 active:scale-95 disabled:opacity-60"
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Download PNG
                </button>
                <button
                  onClick={() => {
                    setMessage('')
                    setGreeting('Ramadan Kareem')
                    setRecipientName('')
                    setSenderName('')
                    setStep(0)
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border/50 bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/60"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start Over
                </button>
              </div>

              {/* Share note */}
              <p className="mt-6 max-w-md text-center text-xs text-muted-foreground/60 leading-relaxed">
                Your card will be downloaded as a high-quality PNG image.
                Share it with your loved ones via WhatsApp, email, or social media.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
