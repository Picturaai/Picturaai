'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2 } from 'lucide-react'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence' | 'image' | 'typing'

interface Challenge {
  type: ChallengeType
  instruction: string
  question: string
  options: string[]
  answer: string
  images?: { src: string; id: string; isTarget: boolean }[]
  distortedText?: string
}

// Image challenge categories with emojis as placeholders (in production, use real images)
const IMAGE_CHALLENGES = [
  { target: 'cat', items: ['cat', 'dog', 'bird', 'fish', 'rabbit', 'hamster'], icons: ['🐱', '🐕', '🐦', '🐟', '🐰', '🐹'] },
  { target: 'car', items: ['car', 'bus', 'bike', 'train', 'plane', 'boat'], icons: ['🚗', '🚌', '🚲', '🚂', '✈️', '⛵'] },
  { target: 'tree', items: ['tree', 'flower', 'cactus', 'mushroom', 'leaf', 'grass'], icons: ['🌲', '🌸', '🌵', '🍄', '🍃', '🌿'] },
  { target: 'pizza', items: ['pizza', 'burger', 'taco', 'sushi', 'cake', 'cookie'], icons: ['🍕', '🍔', '🌮', '🍣', '🎂', '🍪'] },
  { target: 'sun', items: ['sun', 'moon', 'star', 'cloud', 'rain', 'snow'], icons: ['☀️', '🌙', '⭐', '☁️', '🌧️', '❄️'] },
]

// Distorted text generator
const generateDistortedText = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let text = ''
  for (let i = 0; i < 6; i++) {
    text += chars[Math.floor(Math.random() * chars.length)]
  }
  return text
}

// Challenge generators
const CHALLENGES = {
  math: (): Challenge => {
    const ops = ['+', '-', '×']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a: number, b: number, answer: number
    
    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 1
      b = Math.floor(Math.random() * 50) + 1
      answer = a + b
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20
      b = Math.floor(Math.random() * 20) + 1
      answer = a - b
    } else {
      a = Math.floor(Math.random() * 12) + 1
      b = Math.floor(Math.random() * 12) + 1
      answer = a * b
    }
    
    const options = [answer.toString()]
    while (options.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 20) - 10
      if (wrong !== answer && wrong > 0 && !options.includes(wrong.toString())) {
        options.push(wrong.toString())
      }
    }
    
    return {
      type: 'math',
      instruction: 'Solve the math problem',
      question: `${a} ${op} ${b} = ?`,
      options: options.sort(() => Math.random() - 0.5),
      answer: answer.toString()
    }
  },
  
  pattern: (): Challenge => {
    const patterns = [
      { seq: [2, 4, 6, 8], next: 10 },
      { seq: [5, 10, 15, 20], next: 25 },
      { seq: [1, 2, 4, 8], next: 16 },
      { seq: [3, 6, 9, 12], next: 15 },
      { seq: [1, 4, 9, 16], next: 25 },
      { seq: [100, 90, 80, 70], next: 60 },
      { seq: [1, 3, 5, 7], next: 9 },
      { seq: [10, 20, 30, 40], next: 50 },
      { seq: [1, 1, 2, 3, 5], next: 8 },
    ]
    const p = patterns[Math.floor(Math.random() * patterns.length)]
    const options = [p.next.toString()]
    while (options.length < 4) {
      const wrong = p.next + Math.floor(Math.random() * 10) - 5
      if (wrong !== p.next && wrong > 0 && !options.includes(wrong.toString())) {
        options.push(wrong.toString())
      }
    }
    
    return {
      type: 'pattern',
      instruction: 'Complete the sequence',
      question: `${p.seq.join(', ')}, ?`,
      options: options.sort(() => Math.random() - 0.5),
      answer: p.next.toString()
    }
  },
  
  word: (): Challenge => {
    const words = ['HUMAN', 'VERIFY', 'ROBOT', 'IMAGE', 'PHOTO', 'BRAIN', 'WORLD', 'PEACE', 'TRUST', 'PIXEL']
    const word = words[Math.floor(Math.random() * words.length)]
    const shuffled = word.split('').sort(() => Math.random() - 0.5).join('')
    const options = [word]
    const otherWords = words.filter(w => w !== word).sort(() => Math.random() - 0.5).slice(0, 3)
    options.push(...otherWords)
    
    return {
      type: 'word',
      instruction: 'Unscramble the word',
      question: shuffled,
      options: options.sort(() => Math.random() - 0.5),
      answer: word
    }
  },
  
  sequence: (): Challenge => {
    const sequences = [
      { items: ['Mon', 'Tue', 'Wed', 'Thu'], next: 'Fri' },
      { items: ['Jan', 'Feb', 'Mar', 'Apr'], next: 'May' },
      { items: ['A', 'B', 'C', 'D'], next: 'E' },
      { items: ['Spring', 'Summer', 'Fall'], next: 'Winter' },
      { items: ['One', 'Two', 'Three', 'Four'], next: 'Five' },
    ]
    const s = sequences[Math.floor(Math.random() * sequences.length)]
    const options = [s.next]
    const allOptions = ['Sat', 'Sun', 'Jun', 'Jul', 'F', 'G', 'Winter', 'Spring', 'Six', 'Seven']
    const filtered = allOptions.filter(o => o !== s.next).sort(() => Math.random() - 0.5).slice(0, 3)
    options.push(...filtered)
    
    return {
      type: 'sequence',
      instruction: 'What comes next?',
      question: `${s.items.join(' → ')} → ?`,
      options: options.sort(() => Math.random() - 0.5),
      answer: s.next
    }
  },
  
  image: (): Challenge => {
    const cat = IMAGE_CHALLENGES[Math.floor(Math.random() * IMAGE_CHALLENGES.length)]
    const shuffledItems = [...cat.items].sort(() => Math.random() - 0.5).slice(0, 6)
    const targetCount = shuffledItems.filter(i => i === cat.target).length || 1
    
    // Ensure at least 2 targets
    if (targetCount < 2) {
      shuffledItems[0] = cat.target
      shuffledItems[3] = cat.target
    }
    
    const images = shuffledItems.map((item, idx) => ({
      src: cat.icons[cat.items.indexOf(item)],
      id: `img-${idx}`,
      isTarget: item === cat.target
    }))
    
    return {
      type: 'image',
      instruction: `Select all images with a ${cat.target}`,
      question: '',
      options: [],
      answer: images.filter(i => i.isTarget).map(i => i.id).join(','),
      images
    }
  },
  
  typing: (): Challenge => {
    const text = generateDistortedText()
    return {
      type: 'typing',
      instruction: 'Type the characters you see',
      question: '',
      options: [],
      answer: text,
      distortedText: text
    }
  }
}

interface SmartCaptchaProps {
  onVerify: (token: string) => void
  onError?: (error: string) => void
  theme?: 'light' | 'dark' | 'auto'
  size?: 'normal' | 'compact'
}

export function SmartCaptcha({ onVerify, onError, size = 'normal' }: SmartCaptchaProps) {
  const [status, setStatus] = useState<'idle' | 'challenge' | 'verifying' | 'verified' | 'error'>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [typedText, setTypedText] = useState('')
  const [attempts, setAttempts] = useState(0)
  const behaviorRef = useRef({ mouseMovements: 0, keyPresses: 0, startTime: Date.now() })
  
  useEffect(() => {
    const handleMouse = () => { behaviorRef.current.mouseMovements++ }
    const handleKey = () => { behaviorRef.current.keyPresses++ }
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])
  
  const generateChallenge = useCallback(() => {
    const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence', 'image', 'typing']
    const type = types[Math.floor(Math.random() * types.length)]
    setChallenge(CHALLENGES[type]())
    setSelected(null)
    setSelectedImages([])
    setTypedText('')
  }, [])
  
  const startChallenge = () => {
    setStatus('challenge')
    generateChallenge()
  }
  
  const handleSelect = (option: string) => {
    if (status !== 'challenge' || !challenge) return
    setSelected(option)
  }
  
  const handleImageSelect = (id: string) => {
    setSelectedImages(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }
  
  const handleSubmit = async () => {
    if (!challenge) return
    
    let isCorrect = false
    
    if (challenge.type === 'image') {
      const correctIds = challenge.answer.split(',').sort().join(',')
      const selectedIds = selectedImages.sort().join(',')
      isCorrect = correctIds === selectedIds
    } else if (challenge.type === 'typing') {
      isCorrect = typedText.toUpperCase() === challenge.answer
    } else {
      if (!selected) return
      isCorrect = selected === challenge.answer
    }
    
    setStatus('verifying')
    await new Promise(r => setTimeout(r, 400))
    
    if (isCorrect) {
      setStatus('verified')
      const token = btoa(JSON.stringify({
        t: Date.now(),
        b: behaviorRef.current,
        v: true
      }))
      setTimeout(() => onVerify(token), 300)
    } else {
      setAttempts(a => a + 1)
      if (attempts >= 2) {
        setStatus('error')
        onError?.('Too many failed attempts')
      } else {
        generateChallenge()
        setStatus('challenge')
      }
    }
  }
  
  const isCompact = size === 'compact'
  const canSubmit = challenge?.type === 'image' 
    ? selectedImages.length > 0 
    : challenge?.type === 'typing' 
      ? typedText.length === 6 
      : !!selected
  
  return (
    <div className={`w-full ${isCompact ? 'max-w-[280px]' : 'max-w-[320px]'}`}>
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`flex items-center gap-2 border-b border-border bg-muted/30 ${isCompact ? 'px-3 py-2' : 'px-4 py-2.5'}`}>
          <PicturaIcon size={isCompact ? 18 : 22} />
          <span className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'}`}>
            <span className="text-primary">Pictura</span><span className="text-foreground">CAPTCHA</span>
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">Secure</span>
        </div>
        
        {/* Content */}
        <div className={isCompact ? 'p-3' : 'p-4'}>
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <button
                  onClick={startChallenge}
                  className={`flex-shrink-0 rounded border-2 border-border bg-background transition-all hover:border-primary ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}
                />
                <span className={`text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>I&apos;m not a robot</span>
              </motion.div>
            )}
            
            {status === 'challenge' && challenge && (
              <motion.div
                key="challenge"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className={`font-medium text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  {challenge.instruction}
                </p>
                
                {/* Regular challenges (math, pattern, word, sequence) */}
                {['math', 'pattern', 'word', 'sequence'].includes(challenge.type) && (
                  <>
                    <p className={`font-mono font-bold text-primary ${isCompact ? 'text-base' : 'text-lg'}`}>
                      {challenge.question}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {challenge.options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSelect(option)}
                          className={`rounded border px-3 py-2 text-sm font-medium transition-all ${
                            selected === option
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-foreground hover:border-primary/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Image selection challenge */}
                {challenge.type === 'image' && challenge.images && (
                  <div className="grid grid-cols-3 gap-2">
                    {challenge.images.map((img) => (
                      <button
                        key={img.id}
                        onClick={() => handleImageSelect(img.id)}
                        className={`aspect-square rounded-lg border-2 text-2xl flex items-center justify-center transition-all ${
                          selectedImages.includes(img.id)
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/30'
                            : 'border-border bg-muted/30 hover:border-primary/50'
                        }`}
                      >
                        {img.src}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Typing challenge */}
                {challenge.type === 'typing' && challenge.distortedText && (
                  <div className="space-y-3">
                    <div className="relative h-14 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                      {/* Distorted text display */}
                      <div className="relative">
                        {challenge.distortedText.split('').map((char, i) => (
                          <span
                            key={i}
                            className="inline-block text-xl font-bold text-foreground"
                            style={{
                              transform: `rotate(${Math.random() * 20 - 10}deg) translateY(${Math.random() * 6 - 3}px)`,
                              opacity: 0.7 + Math.random() * 0.3,
                              letterSpacing: `${2 + Math.random() * 4}px`,
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                      {/* Noise lines */}
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full opacity-20">
                          <line x1="0" y1="20" x2="100%" y2="35" stroke="currentColor" strokeWidth="1" />
                          <line x1="0" y1="40" x2="100%" y2="25" stroke="currentColor" strokeWidth="1" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="Type the 6 characters"
                      maxLength={6}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-center font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={generateChallenge}
                    className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="flex-1 h-8 rounded bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
                  >
                    Verify
                  </button>
                </div>
                
                {attempts > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    {3 - attempts} attempts remaining
                  </p>
                )}
              </motion.div>
            )}
            
            {status === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-2 py-4"
              >
                <Loader2 className={`animate-spin text-primary ${isCompact ? 'h-4 w-4' : 'h-5 w-5'}`} />
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Verifying...</span>
              </motion.div>
            )}
            
            {status === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <div className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}>
                  <Check className={isCompact ? 'h-3 w-3' : 'h-4 w-4'} />
                </div>
                <span className={`font-medium text-primary ${isCompact ? 'text-xs' : 'text-sm'}`}>Verified</span>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <p className={`text-destructive ${isCompact ? 'text-xs' : 'text-sm'}`}>Verification failed</p>
                <button
                  onClick={() => { setStatus('idle'); setAttempts(0) }}
                  className={`mt-2 text-primary underline ${isCompact ? 'text-xs' : 'text-sm'}`}
                >
                  Try again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className={`border-t border-border bg-muted/20 ${isCompact ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Protected by Pictura</span>
            <div className="flex gap-2 text-[10px] text-muted-foreground">
              <a href="/captcha/privacy" className="hover:underline">Privacy</a>
              <span>·</span>
              <a href="/captcha/terms" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
