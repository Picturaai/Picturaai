'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mic2, Play, Pause, Download, Loader2, Copy,
  Check, RefreshCw, Volume2, VolumeX, ChevronDown, 
  Wand2, X, Music, Share2
} from 'lucide-react'
import { toast } from 'sonner'
import { PicturaIcon } from './pictura-logo'

interface VoiceEntry {
  id: string
  url: string
  text: string
  voiceId: string
  voiceName: string
  createdAt: string
}

interface VoiceOption {
  id: string
  name: string
  description: string
}

const VOICE_OPTIONS: VoiceOption[] = [
  { id: 'default', name: 'Default', description: 'Balanced voice for general use' },
  { id: 'female-young', name: 'Young Female', description: 'Clear young female voice' },
  { id: 'male-deep', name: 'Deep Male', description: 'Deep authoritative male voice' },
  { id: 'narrator', name: 'Narrator', description: 'Professional narration style' },
  { id: 'friendly', name: 'Friendly', description: 'Warm and approachable tone' },
]

const EXAMPLE_TEXTS = [
  'Welcome to Pictura Voice Studio! Transform your text into natural-sounding speech with our AI-powered voice synthesis technology.',
  'The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet.',
  'Breaking news: Scientists have discovered a new species of deep-sea creature in the Pacific Ocean.',
  'Hello there! I would love to help you create amazing voice content today.',
]

const CHARACTER_LIMIT = 5000

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function VoiceStudio() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('default')
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null)
  const [voiceHistory, setVoiceHistory] = useState<VoiceEntry[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Clean up audio refs on unmount
  useEffect(() => {
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.src = ''
      })
    }
  }, [])

  const selectedVoiceOption = VOICE_OPTIONS.find(v => v.id === selectedVoice) || VOICE_OPTIONS[0]
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= CHARACTER_LIMIT) {
      setText(value)
    }
  }

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to convert')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoice,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      
      const newEntry: VoiceEntry = {
        id: `voice-${Date.now()}`,
        url: data.url,
        text: data.text,
        voiceId: data.voiceId,
        voiceName: selectedVoiceOption.name,
        createdAt: data.createdAt,
      }

      setVoiceHistory(prev => [newEntry, ...prev])
      toast.success('Voice generated successfully!')
      
      // Clear the input after successful generation
      setText('')
      
    } catch (error) {
      console.error('Voice generation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to generate voice')
    } finally {
      setLoading(false)
    }
  }

  const togglePlayback = useCallback((id: string, url: string) => {
    // Stop any currently playing audio
    Object.entries(audioRefs.current).forEach(([entryId, audio]) => {
      if (entryId !== id && !audio.paused) {
        audio.pause()
        audio.currentTime = 0
        setCurrentPlaying(null)
      }
    })

    const audio = audioRefs.current[id]
    if (!audio) {
      const newAudio = new Audio(url)
      newAudio.muted = isMuted
      newAudio.onended = () => setCurrentPlaying(null)
      newAudio.onerror = () => {
        toast.error('Failed to play audio')
        setCurrentPlaying(null)
      }
      audioRefs.current[id] = newAudio
      newAudio.play()
      setCurrentPlaying(id)
    } else if (audio.paused) {
      audio.muted = isMuted
      audio.play()
      setCurrentPlaying(id)
    } else {
      audio.pause()
      audio.currentTime = 0
      setCurrentPlaying(null)
    }
  }, [isMuted])

  const handleDownload = (entry: VoiceEntry) => {
    const link = document.createElement('a')
    link.href = entry.url
    link.download = `pictura-voice-${entry.voiceId}-${Date.now()}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Download started!')
  }

  const handleCopyText = (entry: VoiceEntry) => {
    navigator.clipboard.writeText(entry.text)
    setCopiedId(entry.id)
    toast.success('Text copied to clipboard')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleToggleMute = () => {
    const newMuted = !isMuted
    setIsMuted(newMuted)
    Object.values(audioRefs.current).forEach(audio => {
      audio.muted = newMuted
    })
  }

  const handleUseExample = (exampleText: string) => {
    setText(exampleText)
    textareaRef.current?.focus()
  }

  const characterCount = text.length
  const isNearLimit = characterCount > CHARACTER_LIMIT * 0.9
  const isAtLimit = characterCount >= CHARACTER_LIMIT

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Mic2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Voice Studio</h1>
                <p className="text-xs text-muted-foreground">AI-powered text to speech</p>
              </div>
            </div>
            <button
              onClick={handleToggleMute}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Voice Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Enter your text</span>
              </div>
              
              {/* Voice Selector */}
              <div className="relative">
                <button
                  onClick={() => setVoiceOpen(!voiceOpen)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary/80"
                >
                  <Mic2 className="h-3.5 w-3.5 text-primary" />
                  <span className="max-w-[100px] truncate">{selectedVoiceOption.name}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${voiceOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {voiceOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 top-full z-10 mt-2 w-64 rounded-xl border border-border bg-card p-2"
                    >
                      {VOICE_OPTIONS.map((voice) => (
                        <button
                          key={voice.id}
                          onClick={() => {
                            setSelectedVoice(voice.id)
                            setVoiceOpen(false)
                          }}
                          className={`flex w-full flex-col items-start rounded-lg p-3 text-left transition-colors ${
                            selectedVoice === voice.id
                              ? 'bg-primary/10'
                              : 'hover:bg-secondary'
                          }`}
                        >
                          <span className={`text-sm font-medium ${selectedVoice === voice.id ? 'text-primary' : 'text-foreground'}`}>
                            {voice.name}
                          </span>
                          <span className="mt-0.5 text-xs text-muted-foreground">
                            {voice.description}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleTextChange}
              placeholder="Type or paste your text here to convert to speech..."
              className="min-h-[180px] w-full resize-none rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/40"
              disabled={loading}
            />

            <div className="mt-3 flex items-center justify-between">
              <span className={`text-xs ${isAtLimit ? 'text-destructive' : isNearLimit ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {characterCount.toLocaleString()} / {CHARACTER_LIMIT.toLocaleString()} characters
              </span>
              
              <button
                onClick={handleGenerate}
                disabled={loading || !text.trim() || isAtLimit}
                className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mic2 className="h-4 w-4" />
                    Generate Voice
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Example Texts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="mb-3 flex items-center gap-2">
            <Music className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Try these examples</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TEXTS.map((example, i) => (
              <button
                key={i}
                onClick={() => handleUseExample(example)}
                disabled={loading}
                className="rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                Example {i + 1}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Voice History */}
        {voiceHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Your Voice Creations</span>
              </div>
              <button
                onClick={() => setVoiceHistory([])}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-3">
              {voiceHistory.map((entry) => {
                const isCurrentlyPlaying = currentPlaying === entry.id
                
                return (
                  <motion.div
                    key={entry.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="rounded-xl border border-border bg-card p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            <Mic2 className="h-3 w-3" />
                            {entry.voiceName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(entry.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">{entry.text}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => togglePlayback(entry.id, entry.url)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all hover:bg-primary/90"
                          aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
                        >
                          {isCurrentlyPlaying ? (
                            <Pause className="h-4 w-4 fill-current" />
                          ) : (
                            <Play className="h-4 w-4 fill-current translate-x-0.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDownload(entry)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label="Download"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCopyText(entry)}
                          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                          aria-label="Copy text"
                        >
                          {copiedId === entry.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {voiceHistory.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Mic2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No voice creations yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter some text above and click Generate Voice to create your first AI-powered voice clip.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  )
}
