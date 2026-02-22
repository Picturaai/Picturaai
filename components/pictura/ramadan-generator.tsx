'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowRight, ArrowLeft, Download, Sparkles, BookOpen,
  Heart, RefreshCw, Type, User, Loader2, Check, Wand2,
} from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

/* World-Class Ramadan Card Templates */
type Template = {
  id: string
  name: string
  render: (greeting: string, verse: string, senderName: string) => JSX.Element
}

const RamadanCard1 = ({ greeting, verse, senderName }: { greeting: string; verse: string; senderName: string }) => (
  <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ aspectRatio: '5/7', background: 'linear-gradient(135deg, #1a0f00 0%, #2d1a07 50%, #0d0700 100%)' }}>
    {/* Golden top border */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent" />
    
    {/* Decorative corner elements */}
    <div className="absolute top-6 left-6 w-12 h-12 border-l-2 border-t-2 border-[#FFD700] opacity-60" />
    <div className="absolute bottom-6 right-6 w-12 h-12 border-r-2 border-b-2 border-[#FFD700] opacity-60" />
    
    {/* Crescent moon SVG */}
    <svg className="absolute top-8 right-8 w-16 h-16 opacity-40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
      <path d="M 30 30 Q 50 20 60 50 Q 50 80 30 70 Q 35 60 35 50 Q 35 40 30 30" fill="#FFD700" opacity="0.5" />
    </svg>

    {/* Islamic geometric pattern top */}
    <div className="absolute top-0 left-0 right-0 h-24 opacity-10">
      <svg viewBox="0 0 400 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <pattern id="geometric" patternUnits="userSpaceOnUse" width="40" height="40">
            <circle cx="10" cy="10" r="3" fill="#FFD700" />
            <circle cx="30" cy="10" r="3" fill="#FFD700" />
            <circle cx="10" cy="30" r="3" fill="#FFD700" />
            <circle cx="30" cy="30" r="3" fill="#FFD700" />
            <line x1="20" y1="0" x2="20" y2="40" stroke="#FFD700" strokeWidth="1" />
            <line x1="0" y1="20" x2="40" y2="20" stroke="#FFD700" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="400" height="100" fill="url(#geometric)" />
      </svg>
    </div>

    {/* Content */}
    <div className="relative z-10 text-center px-8 py-12">
      <h1 className="text-5xl font-bold text-[#FFD700] mb-2" style={{ textShadow: '0 2px 10px rgba(255, 215, 0, 0.3)' }}>
        Ramadan
      </h1>
      <p className="text-lg text-[#FFB347] mb-8 font-light tracking-widest">كريم</p>

      {/* Divider */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-8 h-px bg-gradient-to-r from-transparent to-[#FFD700]" />
        <div className="w-2 h-2 rounded-full bg-[#FFD700]" />
        <div className="w-8 h-px bg-gradient-to-l from-transparent to-[#FFD700]" />
      </div>

      <p className="text-sm text-[#FFB347] mb-6 max-w-sm mx-auto leading-relaxed">{greeting}</p>

      {verse && (
        <div className="bg-black/30 rounded-lg p-4 my-6 border-l-2 border-[#FFD700]">
          <p className="text-xs text-[#FFD700] italic leading-relaxed">&ldquo;{verse}&rdquo;</p>
        </div>
      )}

      {senderName && (
        <p className="text-xs text-[#FFB347]/70 mt-8">From: {senderName}</p>
      )}

      {/* Pictura watermark */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-40">
        <div className="w-3 h-3" style={{ background: '#FFD700' }} />
        <span className="text-[8px] text-[#FFD700] font-mono">PICTURA</span>
      </div>
    </div>
  </div>
)

const RamadanCard2 = ({ greeting, verse, senderName }: { greeting: string; verse: string; senderName: string }) => (
  <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ aspectRatio: '5/7', background: 'linear-gradient(135deg, #0a1f0a 0%, #0f2f14 50%, #050f05 100%)' }}>
    {/* Lanterns */}
    <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
      <rect x="50" y="80" width="40" height="80" fill="none" stroke="#90EE90" strokeWidth="2" />
      <circle cx="70" cy="70" r="8" fill="#FFD700" />
      <line x1="60" y1="90" x2="80" y2="90" stroke="#90EE90" strokeWidth="1" />
      <rect x="310" y="150" width="40" height="80" fill="none" stroke="#90EE90" strokeWidth="2" />
      <circle cx="330" cy="140" r="8" fill="#FFD700" />
    </svg>

    {/* Top crescent moon */}
    <svg className="absolute top-10 left-1/2 -translate-x-1/2 w-24 h-24 opacity-50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 30 20 Q 60 15 70 50 Q 60 85 30 80 Q 40 65 40 50 Q 40 35 30 20" fill="#90EE90" />
      <circle cx="50" cy="50" r="5" fill="#FFD700" />
    </svg>

    {/* Content */}
    <div className="relative z-10 text-center px-8 py-12">
      <h1 className="text-5xl font-bold text-[#90EE90] mb-2" style={{ textShadow: '0 2px 15px rgba(144, 238, 144, 0.3)' }}>
        رمضان
      </h1>
      <p className="text-lg text-[#C0FFC0] mb-8 font-light">Blessed Month</p>

      <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#90EE90] to-transparent mx-auto mb-8" />

      <p className="text-sm text-[#B0E0B0] mb-6 max-w-sm mx-auto leading-relaxed">{greeting}</p>

      {verse && (
        <div className="bg-white/5 rounded-lg p-4 my-6 border border-[#90EE90]/30">
          <p className="text-xs text-[#C0FFC0] italic leading-relaxed">{verse}</p>
        </div>
      )}

      {senderName && (
        <p className="text-xs text-[#90EE90]/60 mt-8 font-light">~ {senderName}</p>
      )}

      <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-30">
        <div className="w-3 h-3 rounded-full bg-[#90EE90]" />
        <span className="text-[8px] text-[#90EE90] font-mono">PICTURA</span>
      </div>
    </div>
  </div>
)

const RamadanCard3 = ({ greeting, verse, senderName }: { greeting: string; verse: string; senderName: string }) => (
  <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ aspectRatio: '5/7', background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1657 50%, #0f0519 100%)' }}>
    {/* Decorative circles */}
    <div className="absolute top-12 left-12 w-20 h-20 rounded-full border-2 border-[#FFB347]/40 opacity-50" />
    <div className="absolute bottom-20 right-16 w-32 h-32 rounded-full border border-[#FFB347]/20 opacity-40" />

    {/* Starry effect */}
    <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="100" r="1" fill="#FFB347" />
      <circle cx="150" cy="140" r="1.5" fill="#FFB347" />
      <circle cx="320" cy="80" r="1" fill="#FFB347" />
      <circle cx="350" cy="200" r="1" fill="#FFB347" />
      <circle cx="60" cy="400" r="1.5" fill="#FFB347" />
      <circle cx="380" cy="500" r="1" fill="#FFB347" />
    </svg>

    {/* Center crescent moon */}
    <svg className="absolute top-20 right-20 w-20 h-20 opacity-60" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="M 35 25 Q 65 20 75 50 Q 65 80 35 75 Q 45 65 45 50 Q 45 35 35 25" fill="#FFB347" />
    </svg>

    {/* Content */}
    <div className="relative z-10 text-center px-8 py-12">
      <div className="text-6xl font-black text-[#FFB347] mb-1" style={{ textShadow: '0 4px 20px rgba(255, 179, 71, 0.4)' }}>
        🌙
      </div>
      <h1 className="text-4xl font-bold text-[#FFB347] mb-3">Ramadan Kareem</h1>
      <p className="text-xs text-[#FFB347]/80 tracking-widest uppercase mb-8">A Sacred Journey</p>

      <div className="flex justify-center gap-2 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-[#FFB347]" />
        ))}
      </div>

      <p className="text-sm text-[#FFB347] mb-6 max-w-sm mx-auto leading-relaxed font-light">{greeting}</p>

      {verse && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 my-6">
          <p className="text-xs text-[#FFB347] italic leading-relaxed">{verse}</p>
        </div>
      )}

      {senderName && (
        <p className="text-xs text-[#FFB347]/50 mt-8 font-mono">– {senderName}</p>
      )}

      <div className="absolute bottom-4 left-4 flex items-center gap-1 opacity-25">
        <span className="text-[7px] text-[#FFB347] font-mono">©PICTURA</span>
      </div>
    </div>
  </div>
)

const RamadanCard4 = ({ greeting, verse, senderName }: { greeting: string; verse: string; senderName: string }) => (
  <div className="relative w-full h-full overflow-hidden flex items-center justify-center" style={{ aspectRatio: '5/7', background: 'linear-gradient(135deg, #2d0f1a 0%, #3d1428 50%, #1a0810 100%)' }}>
    {/* Arabesque pattern background */}
    <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <path d="M50,50 Q100,80 150,50 T250,50" stroke="#FFB4C8" fill="none" strokeWidth="1" />
      <path d="M50,150 Q100,180 150,150 T250,150" stroke="#FFB4C8" fill="none" strokeWidth="1" />
      <circle cx="200" cy="300" r="50" fill="none" stroke="#FFB4C8" strokeWidth="1" opacity="0.5" />
    </svg>

    {/* Top decorative element */}
    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-4xl">✨</div>

    {/* Content */}
    <div className="relative z-10 text-center px-8 py-12">
      <h1 className="text-5xl font-extrabold text-[#FFB4C8] mb-2" style={{ textShadow: '0 2px 12px rgba(255, 180, 200, 0.3)' }}>
        Ramadan
      </h1>
      <p className="text-sm text-[#FF7099] uppercase tracking-wider font-semibold mb-8">Mubarak</p>

      <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#FFB4C8] to-transparent mx-auto mb-8" />

      <p className="text-sm text-[#FFB4C8] mb-6 max-w-sm mx-auto leading-relaxed">{greeting}</p>

      {verse && (
        <div className="bg-[#1a0810]/80 backdrop-blur rounded-xl p-4 my-6 border border-[#FFB4C8]/30">
          <p className="text-xs text-[#FFB4C8] italic leading-relaxed">&ldquo;{verse}&rdquo;</p>
        </div>
      )}

      {senderName && (
        <p className="text-xs text-[#FF7099]/60 mt-8 font-light">With warmth from {senderName}</p>
      )}

      <div className="absolute bottom-6 right-6 text-2xl opacity-40">🕌</div>
      <div className="absolute bottom-4 right-4 flex items-center gap-1 opacity-25">
        <span className="text-[8px] text-[#FFB4C8] font-mono">PICTURA</span>
      </div>
    </div>
  </div>
)

const templates: Template[] = [
  { id: 'classic-gold', name: 'Classic Gold', render: RamadanCard1 },
  { id: 'emerald-peace', name: 'Emerald Peace', render: RamadanCard2 },
  { id: 'lantern-glow', name: 'Lantern Glow', render: RamadanCard3 },
  { id: 'desert-rose', name: 'Desert Rose', render: RamadanCard4 },
]

export function RamadanGenerator() {
  const [step, setStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState(0)
  const [greeting, setGreeting] = useState('May your Ramadan be filled with blessings and spiritual growth')
  const [verse, setVerse] = useState('')
  const [senderName, setSenderName] = useState('')
  const [generating, setGenerating] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const generateContent = useCallback(async (type: string) => {
    setGenerating(type)
    try {
      const res = await fetch('/api/ramadan/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, context: greeting }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      if (type === 'greeting') setGreeting(data.content)
      else setVerse(data.content)
      toast.success('Content generated!')
    } catch {
      toast.error('Failed to generate content')
    } finally {
      setGenerating(null)
    }
  }, [greeting])

  const downloadCard = useCallback(async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const { default: html2canvas } = await import('html2canvas')
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
        allowTaint: true,
      })
      const url = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = url
      link.download = `ramadan-card-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Card downloaded!')
    } catch (e) {
      console.error('[v0] Download error:', e)
      toast.error('Download failed. Try a simpler card design.')
    } finally {
      setDownloading(false)
    }
  }, [])

  const CardComponent = templates[selectedTemplate].render

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
          Create Your Ramadan Card
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Design stunning Ramadan greeting cards with AI-powered content. Choose a template, customize with verses and greetings, and share with loved ones.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* STEP 0: Template Selection */}
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-xl font-semibold mb-6">Choose Your Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template, idx) => (
                  <button
                    key={template.id}
                    onClick={() => { setSelectedTemplate(idx); setStep(1) }}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all ${
                      idx === selectedTemplate
                        ? 'border-primary bg-primary/10'
                        : 'border-border/50 hover:border-primary/50'
                    }`}
                  >
                    <div className="aspect-[5/7] bg-gradient-to-br from-card to-card/50 p-6 flex flex-col items-center justify-center">
                      <CardComponent greeting="Sample greeting" verse="Sample verse" senderName="" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                      <p className="w-full text-white font-semibold p-4">{template.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 1: Customize */}
        {step === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid md:grid-cols-2 gap-8 items-start"
          >
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-primary" />
                  Greeting Message
                </label>
                <textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full h-24 rounded-lg border border-border/50 bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your greeting..."
                />
                <button
                  onClick={() => generateContent('greeting')}
                  disabled={generating === 'greeting'}
                  className="mt-2 text-xs flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <Wand2 className="w-3 h-3" />
                  {generating === 'greeting' ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Quran Verse (Optional)
                </label>
                <textarea
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="w-full h-20 rounded-lg border border-border/50 bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Add a Quran verse or Hadith..."
                />
                <button
                  onClick={() => generateContent('quran')}
                  disabled={generating === 'quran'}
                  className="mt-2 text-xs flex items-center gap-1 text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  <Wand2 className="w-3 h-3" />
                  {generating === 'quran' ? 'Generating...' : 'Get Quran Verse'}
                </button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  From (Your Name)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full rounded-lg border border-border/50 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Your name"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-border/50 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
                >
                  Preview
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Preview */}
            <div>
              <p className="text-sm font-medium mb-4">Live Preview</p>
              <div className="rounded-2xl border border-border/30 overflow-hidden shadow-2xl" style={{ aspectRatio: '5/7' }}>
                <CardComponent greeting={greeting} verse={verse} senderName={senderName} />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Download */}
        {step === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <h2 className="text-2xl font-semibold mb-2">Your Ramadan Card</h2>
            <p className="text-muted-foreground mb-8">Download and share with your loved ones</p>

            <div className="w-full max-w-2xl rounded-2xl border border-border/30 overflow-hidden shadow-2xl" style={{ aspectRatio: '5/7' }}>
              <div ref={cardRef}>
                <CardComponent greeting={greeting} verse={verse} senderName={senderName} />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 rounded-lg border border-border/50 px-6 py-2.5 font-medium transition-colors hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={downloadCard}
                disabled={downloading}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-60"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Card
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="mx-auto mt-12 flex max-w-xs items-center justify-center gap-2">
        {['Template', 'Customize', 'Download'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                i < step
                  ? 'bg-primary text-primary-foreground'
                  : i === step
                  ? 'bg-primary/30 text-primary ring-2 ring-primary'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= step ? 'text-foreground' : 'text-muted-foreground'}`}>
              {label}
            </span>
            {i < 2 && <div className="w-6 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>
    </div>
  )
}
