
'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import { Download, Sparkles, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

type CardTemplate = 'elegant' | 'classic' | 'modern' | 'traditional'
type ContentType = 'greeting' | 'quran' | 'hadith' | 'dua' | 'custom'

const TEMPLATES: Record<CardTemplate, { name: string; bgClass: string; textColor: string; accentColor: string }> = {
  elegant: {
    name: 'Elegant Gold',
    bgClass: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100',
    textColor: 'text-amber-950',
    accentColor: 'from-amber-400 to-orange-500',
  },
  classic: {
    name: 'Classic Amber',
    bgClass: 'bg-gradient-to-tr from-amber-900 to-orange-700',
    textColor: 'text-white',
    accentColor: 'from-amber-300 to-yellow-200',
  },
  modern: {
    name: 'Modern Light',
    bgClass: 'bg-gradient-to-b from-white to-amber-50',
    textColor: 'text-amber-950',
    accentColor: 'from-orange-400 to-amber-500',
  },
  traditional: {
    name: 'Traditional',
    bgClass: 'bg-gradient-to-br from-orange-100 via-amber-100 to-yellow-100',
    textColor: 'text-amber-900',
    accentColor: 'from-orange-500 to-amber-600',
  },
}

export function RamadanGenerator() {
  const [step, setStep] = useState<'template' | 'content' | 'preview'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate>('elegant')
  const [contentType, setContentType] = useState<ContentType>('greeting')
  const [title, setTitle] = useState('Ramadan Kareem')
  const [message, setMessage] = useState('Wishing you a blessed month ahead')
  const [fromName, setFromName] = useState('')
  const [toName, setToName] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)
  const [downloaded, setDownloaded] = useState(false)

  const handleGenerateContent = async () => {
    if (!message.trim() && contentType !== 'custom') {
      toast.error('Please enter a prompt or select custom content')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ramadan/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, customPrompt: message, count: 1 }),
      })

      if (!res.ok) throw new Error('Failed to generate content')
      const data = await res.json()
      const content = data.content[0]?.text || data.content[0] || ''
      setGeneratedContent(content)
      setMessage(content)
      toast.success('Content generated successfully!')
    } catch (err) {
      toast.error('Failed to generate content')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!cardRef.current) return

    try {
      setDownloaded(false)
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `ramadan-card-${Date.now()}.png`
      link.click()
      setDownloaded(true)
      toast.success('Card downloaded successfully!')
    } catch (err) {
      toast.error('Failed to download card')
      console.error(err)
    }
  }

  const template = TEMPLATES[selectedTemplate]

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-8 mb-12">
        {(['template', 'content', 'preview'] as const).map((s, idx) => (
          <div key={s} className="flex items-center gap-4">
            <motion.div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                step === s
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : idx < (['template', 'content', 'preview'] as const).indexOf(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {idx < (['template', 'content', 'preview'] as const).indexOf(step) ? '✓' : idx + 1}
            </motion.div>
            <span className="hidden sm:inline text-sm font-medium capitalize">{s}</span>
            {idx < 2 && <div className="hidden lg:block w-8 h-0.5 bg-border" />}
          </div>
        ))}
      </div>

      {/* Template Selection */}
      {step === 'template' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Select Your Card Template</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {(Object.entries(TEMPLATES) as [CardTemplate, typeof TEMPLATES[CardTemplate]][]).map(([key, t]) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  whileHover={{ scale: 1.02 }}
                  className={`relative h-48 rounded-2xl overflow-hidden border-2 transition-all ${
                    selectedTemplate === key ? 'border-primary shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`w-full h-full ${t.bgClass} flex flex-col items-center justify-center gap-3 p-6`}>
                    <div className={`text-3xl font-bold ${t.textColor}`}>Ramadan</div>
                    <div className={`text-sm font-medium ${t.textColor}/70`}>{t.name}</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep('content')}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Next
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Content Customization */}
      {step === 'content' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Content Type Selection */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Customize Content</h2>
                <p className="text-muted-foreground mb-6">Choose how you want to personalize your card</p>

                <div className="space-y-3">
                  {(['greeting', 'quran', 'hadith', 'dua', 'custom'] as ContentType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setContentType(type)
                        setGeneratedContent('')
                        setMessage('')
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        contentType === type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold text-foreground capitalize">{type}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {type === 'greeting' && 'Generate a warm Ramadan greeting'}
                        {type === 'quran' && 'Add a meaningful Quran verse'}
                        {type === 'hadith' && 'Include a Hadith or Islamic wisdom'}
                        {type === 'dua' && 'Add a beautiful dua'}
                        {type === 'custom' && 'Write your own message'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {contentType !== 'custom' && (
                <button
                  onClick={handleGenerateContent}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                >
                  {loading ? 'Generating...' : 'Generate with AI'}
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right: Form Inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Card Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g., Ramadan Kareem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Write your message or generate with AI..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">From</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Your name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">To</label>
                  <input
                    type="text"
                    value={toName}
                    onChange={(e) => setToName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Recipient name (optional)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('template')}
              className="px-8 py-3 border-2 border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('preview')}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              Preview
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* Preview & Download */}
      {step === 'preview' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Card Preview */}
            <div className="flex items-center justify-center">
              <div
                ref={cardRef}
                className={`w-80 h-96 rounded-3xl shadow-2xl p-8 flex flex-col justify-between ${template.bgClass} border-8 border-white`}
              >
                <div className="text-center space-y-2">
                  <h3 className={`text-4xl font-bold ${template.textColor}`}>{title}</h3>
                  {toName && <p className={`text-sm ${template.textColor}/70`}>Dear {toName}</p>}
                </div>

                <div className="space-y-6">
                  <p className={`text-center text-sm leading-relaxed ${template.textColor}/90`}>{message}</p>

                  <div className="flex justify-center gap-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`h-1 w-6 rounded-full bg-gradient-to-r ${template.accentColor}`} />
                    ))}
                  </div>
                </div>

                {fromName && (
                  <div className={`text-right text-sm ${template.textColor}/70`}>
                    With blessings,
                    <br />
                    {fromName}
                  </div>
                )}

                <div className={`text-center text-[10px] ${template.textColor}/50`}>Powered by Pictura</div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-6 flex flex-col justify-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Ready to Share?</h2>
                <p className="text-muted-foreground mb-6">
                  Your card looks amazing! Download it now and share the blessing with your loved ones.
                </p>
              </div>

              <button
                onClick={handleDownload}
                className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 text-lg"
              >
                {downloaded ? (
                  <>
                    <Check className="w-5 h-5" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Card
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('content')}
                className="w-full px-8 py-3 border-2 border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-colors"
              >
                Edit Content
              </button>

              <button
                onClick={() => setStep('template')}
                className="w-full px-8 py-3 border-2 border-border text-foreground rounded-xl font-semibold hover:bg-muted transition-colors"
              >
                Change Template
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
