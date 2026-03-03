'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2, AlertTriangle, Clock, ShieldCheck, Fingerprint } from 'lucide-react'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence' | 'image' | 'typing' | 'slider'

interface Challenge {
  type: ChallengeType
  instruction: string
  question: string
  options: string[]
  answer: string
  images?: { src: string; id: string; isTarget: boolean }[]
  distortedText?: string
  sliderTarget?: number
}

// Image challenge categories
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
  },
  
  slider: (): Challenge => {
    const target = Math.floor(Math.random() * 80) + 10 // 10-90
    return {
      type: 'slider',
      instruction: 'Slide to the marked position',
      question: '',
      options: [],
      answer: target.toString(),
      sliderTarget: target
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
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'challenge' | 'verifying' | 'verified' | 'cooldown' | 'error'>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [typedText, setTypedText] = useState('')
  const [sliderValue, setSliderValue] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [riskScore, setRiskScore] = useState(0)
  
  // Behavior tracking for bot detection
  const behaviorRef = useRef({
    mouseMovements: 0,
    mouseVelocities: [] as number[],
    keyPresses: 0,
    keyTimings: [] as number[],
    scrollEvents: 0,
    touchEvents: 0,
    startTime: Date.now(),
    lastMousePos: { x: 0, y: 0 },
    lastMouseTime: Date.now(),
    focusChanges: 0,
    clickPatterns: [] as number[],
  })
  
  // Advanced behavior tracking
  useEffect(() => {
    let lastX = 0, lastY = 0, lastTime = Date.now()
    
    const handleMouse = (e: MouseEvent) => {
      const now = Date.now()
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      const dt = now - lastTime
      if (dt > 0) {
        const velocity = Math.sqrt(dx * dx + dy * dy) / dt
        behaviorRef.current.mouseVelocities.push(velocity)
        if (behaviorRef.current.mouseVelocities.length > 100) {
          behaviorRef.current.mouseVelocities.shift()
        }
      }
      behaviorRef.current.mouseMovements++
      lastX = e.clientX
      lastY = e.clientY
      lastTime = now
    }
    
    const handleKey = () => {
      const now = Date.now()
      behaviorRef.current.keyTimings.push(now)
      behaviorRef.current.keyPresses++
      if (behaviorRef.current.keyTimings.length > 50) {
        behaviorRef.current.keyTimings.shift()
      }
    }
    
    const handleScroll = () => { behaviorRef.current.scrollEvents++ }
    const handleTouch = () => { behaviorRef.current.touchEvents++ }
    const handleFocus = () => { behaviorRef.current.focusChanges++ }
    const handleClick = () => {
      behaviorRef.current.clickPatterns.push(Date.now())
      if (behaviorRef.current.clickPatterns.length > 20) {
        behaviorRef.current.clickPatterns.shift()
      }
    }
    
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('keydown', handleKey)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('touchstart', handleTouch)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('click', handleClick)
    
    return () => {
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('touchstart', handleTouch)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('click', handleClick)
    }
  }, [])
  
  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(t => {
          if (t <= 1) {
            setStatus('idle')
            setAttempts(0)
            return 0
          }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownTime])
  
  // Calculate risk score based on behavior
  const calculateRiskScore = useCallback(() => {
    const b = behaviorRef.current
    let score = 0
    
    // Time on page (bots often act immediately)
    const timeOnPage = (Date.now() - b.startTime) / 1000
    if (timeOnPage < 2) score += 30
    else if (timeOnPage < 5) score += 15
    
    // Mouse movement patterns
    if (b.mouseMovements < 5) score += 25
    
    // Mouse velocity variance (bots have consistent velocity)
    if (b.mouseVelocities.length > 5) {
      const avg = b.mouseVelocities.reduce((a, v) => a + v, 0) / b.mouseVelocities.length
      const variance = b.mouseVelocities.reduce((a, v) => a + Math.pow(v - avg, 2), 0) / b.mouseVelocities.length
      if (variance < 0.01) score += 20 // Too consistent
    }
    
    // Key timing patterns (bots type too fast or too consistent)
    if (b.keyTimings.length > 5) {
      const intervals = []
      for (let i = 1; i < b.keyTimings.length; i++) {
        intervals.push(b.keyTimings[i] - b.keyTimings[i - 1])
      }
      const avgInterval = intervals.reduce((a, v) => a + v, 0) / intervals.length
      if (avgInterval < 30) score += 20 // Typing too fast
      
      const variance = intervals.reduce((a, v) => a + Math.pow(v - avgInterval, 2), 0) / intervals.length
      if (variance < 100) score += 15 // Too consistent timing
    }
    
    // Touch events (mobile users should have some)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile && b.touchEvents === 0) score += 15
    
    return Math.min(score, 100)
  }, [])
  
  const generateChallenge = useCallback(() => {
    const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence', 'image', 'typing', 'slider']
    const type = types[Math.floor(Math.random() * types.length)]
    setChallenge(CHALLENGES[type]())
    setSelected(null)
    setSelectedImages([])
    setTypedText('')
    setSliderValue(0)
  }, [])
  
  const startChallenge = async () => {
    setStatus('analyzing')
    
    // Simulate behavior analysis
    await new Promise(r => setTimeout(r, 800))
    
    const risk = calculateRiskScore()
    setRiskScore(risk)
    
    // Low risk: auto-verify, Medium: simple challenge, High: hard challenge
    if (risk < 20 && behaviorRef.current.mouseMovements > 10) {
      // Auto-pass for clearly human behavior
      setStatus('verifying')
      await new Promise(r => setTimeout(r, 500))
      setStatus('verified')
      const token = btoa(JSON.stringify({
        t: Date.now(),
        r: risk,
        v: true,
        auto: true
      }))
      setTimeout(() => onVerify(token), 300)
    } else {
      setStatus('challenge')
      generateChallenge()
    }
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
    } else if (challenge.type === 'slider') {
      const target = parseInt(challenge.answer)
      isCorrect = Math.abs(sliderValue - target) <= 5 // Allow 5% tolerance
    } else {
      if (!selected) return
      isCorrect = selected === challenge.answer
    }
    
    setStatus('verifying')
    await new Promise(r => setTimeout(r, 500))
    
    if (isCorrect) {
      setStatus('verified')
      const token = btoa(JSON.stringify({
        t: Date.now(),
        r: riskScore,
        b: {
          m: behaviorRef.current.mouseMovements,
          k: behaviorRef.current.keyPresses,
          d: Date.now() - behaviorRef.current.startTime
        },
        v: true
      }))
      setTimeout(() => onVerify(token), 300)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        // Cooldown period
        setStatus('cooldown')
        setCooldownTime(60) // 60 second cooldown
        onError?.('Too many failed attempts. Please try again in 1 minute.')
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
      : challenge?.type === 'slider'
        ? true
        : !!selected
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <div className={`w-full ${isCompact ? 'max-w-[280px]' : 'max-w-[320px]'}`}>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`flex items-center gap-2 border-b border-border bg-muted/30 ${isCompact ? 'px-3 py-2' : 'px-4 py-2.5'}`}>
          <PicturaIcon size={isCompact ? 18 : 22} />
          <span className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'}`}>
            <span className="text-primary">Pictura</span><span className="text-foreground">CAPTCHA</span>
          </span>
          <span className="ml-auto flex items-center gap-1 text-[10px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            Secure
          </span>
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
                  className={`flex-shrink-0 rounded-md border-2 border-border bg-background transition-all hover:border-primary hover:bg-primary/5 ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}
                />
                <span className={`text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>I&apos;m not a robot</span>
              </motion.div>
            )}
            
            {status === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-4"
              >
                <div className="relative">
                  <Fingerprint className={`text-primary ${isCompact ? 'h-6 w-6' : 'h-8 w-8'}`} />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  Analyzing behavior...
                </span>
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
                
                {/* Regular challenges */}
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
                          className={`rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all ${
                            selected === option
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Image selection */}
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
                    <div className="relative h-14 rounded-lg bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border border-border flex items-center justify-center overflow-hidden">
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
                      <div className="absolute inset-0 pointer-events-none">
                        <svg className="w-full h-full opacity-30">
                          <line x1="0" y1="20" x2="100%" y2="35" stroke="currentColor" strokeWidth="1" />
                          <line x1="0" y1="40" x2="100%" y2="25" stroke="currentColor" strokeWidth="1" />
                          <line x1="10%" y1="10" x2="90%" y2="50" stroke="currentColor" strokeWidth="0.5" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="Type the 6 characters"
                      maxLength={6}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-center font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                )}
                
                {/* Slider challenge */}
                {challenge.type === 'slider' && challenge.sliderTarget !== undefined && (
                  <div className="space-y-3">
                    <div className="relative h-12 rounded-lg bg-muted/30 border border-border overflow-hidden">
                      {/* Target indicator */}
                      <div 
                        className="absolute top-0 h-full w-1 bg-primary"
                        style={{ left: `${challenge.sliderTarget}%` }}
                      />
                      <div 
                        className="absolute top-0 h-full w-4 bg-primary/20"
                        style={{ left: `${challenge.sliderTarget - 2}%` }}
                      />
                      {/* Current position */}
                      <div 
                        className="absolute top-1 bottom-1 w-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground text-xs font-bold transition-all duration-100"
                        style={{ left: `calc(${sliderValue}% - 16px)` }}
                      >
                        {sliderValue}
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none bg-muted cursor-pointer accent-primary"
                    />
                    <p className="text-xs text-center text-muted-foreground">
                      Move slider to the highlighted position
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={generateChallenge}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Get new challenge"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  >
                    Verify
                  </button>
                </div>
                
                {attempts > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    {3 - attempts} {3 - attempts === 1 ? 'attempt' : 'attempts'} remaining
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
                className="flex items-center justify-center gap-2 py-6"
              >
                <Loader2 className={`animate-spin text-primary ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`} />
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>Verifying...</span>
              </motion.div>
            )}
            
            {status === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 py-1"
              >
                <motion.div 
                  className={`flex items-center justify-center rounded-full bg-primary text-primary-foreground ${isCompact ? 'h-6 w-6' : 'h-7 w-7'}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <Check className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                </motion.div>
                <span className={`font-semibold text-primary ${isCompact ? 'text-sm' : 'text-base'}`}>Verified</span>
              </motion.div>
            )}
            
            {status === 'cooldown' && (
              <motion.div
                key="cooldown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 space-y-3"
              >
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium text-sm">Verification Failed</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  We couldn&apos;t verify you are human. Please try again later.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-foreground">{formatTime(cooldownTime)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Try again in {cooldownTime} seconds
                </p>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-3"
              >
                <p className={`text-destructive ${isCompact ? 'text-xs' : 'text-sm'}`}>Verification failed</p>
                <button
                  onClick={() => { setStatus('idle'); setAttempts(0) }}
                  className={`mt-2 text-primary hover:underline ${isCompact ? 'text-xs' : 'text-sm'}`}
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
              <a href="/captcha/privacy" className="hover:text-primary transition-colors">Privacy</a>
              <span>·</span>
              <a href="/captcha/terms" className="hover:text-primary transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
