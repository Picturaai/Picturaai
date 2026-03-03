'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2, AlertTriangle, Clock, ShieldCheck, Fingerprint, Hand } from 'lucide-react'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence' | 'image' | 'typing' | 'slider' | 'fingerprint' | 'trace' | 'rotate'

interface Challenge {
  type: ChallengeType
  instruction: string
  question: string
  options: string[]
  answer: string
  images?: { src: string; id: string; isTarget: boolean }[]
  distortedText?: string
  sliderTarget?: number
  touchPoints?: { x: number; y: number }[]
  rotationTarget?: number
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

// Generate random touch points for fingerprint challenge
const generateTouchPoints = () => {
  const points: { x: number; y: number }[] = []
  for (let i = 0; i < 4; i++) {
    points.push({
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60
    })
  }
  return points
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
    const target = Math.floor(Math.random() * 80) + 10
    return {
      type: 'slider',
      instruction: 'Slide to the marked position',
      question: '',
      options: [],
      answer: target.toString(),
      sliderTarget: target
    }
  },
  
  fingerprint: (): Challenge => {
    const points = generateTouchPoints()
    return {
      type: 'fingerprint',
      instruction: 'Touch all the highlighted points',
      question: '',
      options: [],
      answer: points.length.toString(),
      touchPoints: points
    }
  },
  
  trace: (): Challenge => {
    return {
      type: 'trace',
      instruction: 'Trace the path with your finger/mouse',
      question: '',
      options: [],
      answer: 'traced'
    }
  },
  
  rotate: (): Challenge => {
    const target = [90, 180, 270][Math.floor(Math.random() * 3)]
    return {
      type: 'rotate',
      instruction: 'Rotate the image to the correct position',
      question: '',
      options: [],
      answer: target.toString(),
      rotationTarget: target
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
  const [touchedPoints, setTouchedPoints] = useState<number[]>([])
  const [traceProgress, setTraceProgress] = useState(0)
  const [rotation, setRotation] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [riskScore, setRiskScore] = useState(0)
  
  const traceCanvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const tracePointsRef = useRef<{ x: number; y: number }[]>([])
  
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
  
  // Auto-verify when answer is correct
  useEffect(() => {
    if (status !== 'challenge' || !challenge) return
    
    const checkAndVerify = async () => {
      let isCorrect = false
      
      if (challenge.type === 'typing' && typedText.length === 6) {
        isCorrect = typedText.toUpperCase() === challenge.answer
        if (isCorrect) {
          await handleAutoVerify()
        }
      } else if (challenge.type === 'slider') {
        const target = parseInt(challenge.answer)
        isCorrect = Math.abs(sliderValue - target) <= 3
        if (isCorrect && sliderValue > 0) {
          await handleAutoVerify()
        }
      } else if (challenge.type === 'fingerprint') {
        const required = challenge.touchPoints?.length || 0
        if (touchedPoints.length === required) {
          await handleAutoVerify()
        }
      } else if (challenge.type === 'trace' && traceProgress >= 95) {
        await handleAutoVerify()
      } else if (challenge.type === 'rotate') {
        const target = parseInt(challenge.answer)
        if (rotation === target) {
          await handleAutoVerify()
        }
      }
    }
    
    checkAndVerify()
  }, [typedText, sliderValue, touchedPoints, traceProgress, rotation, challenge, status])
  
  // Auto-verify for option selections
  useEffect(() => {
    if (status !== 'challenge' || !challenge || !selected) return
    
    if (['math', 'pattern', 'word', 'sequence'].includes(challenge.type)) {
      if (selected === challenge.answer) {
        handleAutoVerify()
      }
    }
  }, [selected, challenge, status])
  
  const handleAutoVerify = async () => {
    setStatus('verifying')
    await new Promise(r => setTimeout(r, 600))
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
  }
  
  // Calculate risk score based on behavior
  const calculateRiskScore = useCallback(() => {
    const b = behaviorRef.current
    let score = 0
    
    const timeOnPage = (Date.now() - b.startTime) / 1000
    if (timeOnPage < 2) score += 30
    else if (timeOnPage < 5) score += 15
    
    if (b.mouseMovements < 5) score += 25
    
    if (b.mouseVelocities.length > 5) {
      const avg = b.mouseVelocities.reduce((a, v) => a + v, 0) / b.mouseVelocities.length
      const variance = b.mouseVelocities.reduce((a, v) => a + Math.pow(v - avg, 2), 0) / b.mouseVelocities.length
      if (variance < 0.01) score += 20
    }
    
    if (b.keyTimings.length > 5) {
      const intervals = []
      for (let i = 1; i < b.keyTimings.length; i++) {
        intervals.push(b.keyTimings[i] - b.keyTimings[i - 1])
      }
      const avgInterval = intervals.reduce((a, v) => a + v, 0) / intervals.length
      if (avgInterval < 30) score += 20
      
      const variance = intervals.reduce((a, v) => a + Math.pow(v - avgInterval, 2), 0) / intervals.length
      if (variance < 100) score += 15
    }
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile && b.touchEvents === 0) score += 15
    
    return Math.min(score, 100)
  }, [])
  
  const generateChallenge = useCallback(() => {
    const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence', 'image', 'typing', 'slider', 'fingerprint', 'trace', 'rotate']
    const type = types[Math.floor(Math.random() * types.length)]
    setChallenge(CHALLENGES[type]())
    setSelected(null)
    setSelectedImages([])
    setTypedText('')
    setSliderValue(0)
    setTouchedPoints([])
    setTraceProgress(0)
    setRotation(0)
    tracePointsRef.current = []
  }, [])
  
  const startChallenge = async () => {
    setStatus('analyzing')
    
    await new Promise(r => setTimeout(r, 800))
    
    const risk = calculateRiskScore()
    setRiskScore(risk)
    
    if (risk < 20 && behaviorRef.current.mouseMovements > 10) {
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
  
  const handleImageSelect = async (id: string) => {
    const newSelected = selectedImages.includes(id) 
      ? selectedImages.filter(i => i !== id) 
      : [...selectedImages, id]
    setSelectedImages(newSelected)
    
    // Auto-verify for image challenges when all targets are selected
    if (challenge?.type === 'image') {
      const correctIds = challenge.answer.split(',').sort()
      const selectedIds = newSelected.sort()
      if (correctIds.length === selectedIds.length && correctIds.every((id, i) => id === selectedIds[i])) {
        await handleAutoVerify()
      }
    }
  }
  
  const handleTouchPoint = (index: number) => {
    if (!touchedPoints.includes(index)) {
      setTouchedPoints(prev => [...prev, index])
    }
  }
  
  const handleTraceStart = (e: React.MouseEvent | React.TouchEvent) => {
    isDrawingRef.current = true
    const canvas = traceCanvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    tracePointsRef.current = [{ x, y }]
  }
  
  const handleTraceMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return
    const canvas = traceCanvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    tracePointsRef.current.push({ x, y })
    
    // Draw the trace
    ctx.strokeStyle = '#c97a50'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    
    if (tracePointsRef.current.length > 1) {
      const last = tracePointsRef.current[tracePointsRef.current.length - 2]
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    
    // Calculate progress based on path coverage
    const pathLength = tracePointsRef.current.length
    const progress = Math.min(100, (pathLength / 50) * 100)
    setTraceProgress(progress)
  }
  
  const handleTraceEnd = () => {
    isDrawingRef.current = false
  }
  
  const handleManualSubmit = async () => {
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
      isCorrect = Math.abs(sliderValue - target) <= 5
    } else {
      if (!selected) return
      isCorrect = selected === challenge.answer
    }
    
    if (isCorrect) {
      await handleAutoVerify()
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)
      
      if (newAttempts >= 3) {
        setStatus('cooldown')
        setCooldownTime(60)
        onError?.('Too many failed attempts. Please try again in 1 minute.')
      } else {
        generateChallenge()
        setStatus('challenge')
      }
    }
  }
  
  const isCompact = size === 'compact'
  
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
                
                {/* Regular challenges with auto-verify */}
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
                            ? 'border-primary bg-primary/10'
                            : 'border-border bg-muted/30 hover:border-primary/50'
                        }`}
                      >
                        {img.src}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Typing challenge - auto-verifies when complete */}
                {challenge.type === 'typing' && challenge.distortedText && (
                  <div className="space-y-3">
                    <div className="relative h-16 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full">
                        {[...Array(5)].map((_, i) => (
                          <line
                            key={i}
                            x1={Math.random() * 100 + '%'}
                            y1="0"
                            x2={Math.random() * 100 + '%'}
                            y2="100%"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="text-muted-foreground/30"
                          />
                        ))}
                      </svg>
                      <span 
                        className="text-2xl font-mono font-bold tracking-[0.3em] relative z-10"
                        style={{
                          textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                          transform: `rotate(${Math.random() * 4 - 2}deg)`
                        }}
                      >
                        {challenge.distortedText.split('').map((char, i) => (
                          <span
                            key={i}
                            style={{
                              display: 'inline-block',
                              transform: `rotate(${Math.random() * 20 - 10}deg) translateY(${Math.random() * 6 - 3}px)`,
                              color: `hsl(${20 + Math.random() * 20}, 70%, ${40 + Math.random() * 20}%)`
                            }}
                          >
                            {char}
                          </span>
                        ))}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={typedText}
                      onChange={(e) => setTypedText(e.target.value.toUpperCase().slice(0, 6))}
                      placeholder="Type the characters"
                      maxLength={6}
                      className="w-full h-10 px-3 rounded-lg border border-border bg-background text-center font-mono text-lg tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {typedText.length}/6 characters
                    </p>
                  </div>
                )}
                
                {/* Slider challenge - auto-verifies when correct */}
                {challenge.type === 'slider' && challenge.sliderTarget !== undefined && (
                  <div className="space-y-3">
                    <div className="relative h-8 rounded-full bg-muted/50">
                      <div 
                        className="absolute top-0 h-full w-1 bg-primary rounded-full"
                        style={{ left: `${challenge.sliderTarget}%` }}
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary shadow-md cursor-grab active:cursor-grabbing transition-all"
                        style={{ left: `calc(${sliderValue}% - 12px)` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sliderValue}
                      onChange={(e) => setSliderValue(parseInt(e.target.value))}
                      className="w-full accent-primary"
                    />
                  </div>
                )}
                
                {/* Fingerprint touch challenge - auto-verifies */}
                {challenge.type === 'fingerprint' && challenge.touchPoints && (
                  <div className="space-y-3">
                    <div className="relative h-32 rounded-lg bg-muted/30 border border-border">
                      <Hand className="absolute inset-0 m-auto h-16 w-16 text-muted-foreground/20" />
                      {challenge.touchPoints.map((point, i) => (
                        <button
                          key={i}
                          onClick={() => handleTouchPoint(i)}
                          className={`absolute w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center ${
                            touchedPoints.includes(i)
                              ? 'border-primary bg-primary/20 scale-90'
                              : 'border-primary/50 bg-primary/10 animate-pulse'
                          }`}
                          style={{ left: `${point.x}%`, top: `${point.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          {touchedPoints.includes(i) && <Check className="h-4 w-4 text-primary" />}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      {touchedPoints.length}/{challenge.touchPoints.length} points touched
                    </p>
                  </div>
                )}
                
                {/* Trace path challenge - auto-verifies */}
                {challenge.type === 'trace' && (
                  <div className="space-y-3">
                    <div className="relative">
                      <canvas
                        ref={traceCanvasRef}
                        width={280}
                        height={100}
                        onMouseDown={handleTraceStart}
                        onMouseMove={handleTraceMove}
                        onMouseUp={handleTraceEnd}
                        onMouseLeave={handleTraceEnd}
                        onTouchStart={handleTraceStart}
                        onTouchMove={handleTraceMove}
                        onTouchEnd={handleTraceEnd}
                        className="w-full h-24 rounded-lg bg-muted/30 border border-border cursor-crosshair touch-none"
                      />
                      {/* Guide path */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path
                          d="M 20 50 Q 70 20, 140 50 T 260 50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          className="text-primary/30"
                        />
                      </svg>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted/50 overflow-hidden">
                      <motion.div 
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${traceProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Trace the dotted path
                    </p>
                  </div>
                )}
                
                {/* Rotate challenge - auto-verifies */}
                {challenge.type === 'rotate' && challenge.rotationTarget !== undefined && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center">
                      <motion.div
                        className="h-20 w-20 rounded-lg bg-muted/30 border border-border flex items-center justify-center text-4xl"
                        animate={{ rotate: rotation }}
                        transition={{ type: 'spring', stiffness: 100 }}
                      >
                        🏠
                      </motion.div>
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                        className="h-10 px-4 rounded-lg border border-border bg-background hover:bg-muted/50 text-sm font-medium"
                      >
                        ↺ Left
                      </button>
                      <button
                        onClick={() => setRotation(r => (r + 90) % 360)}
                        className="h-10 px-4 rounded-lg border border-border bg-background hover:bg-muted/50 text-sm font-medium"
                      >
                        Right ↻
                      </button>
                    </div>
                    <p className="text-xs text-center text-muted-foreground">
                      Rotate the image to face upward
                    </p>
                  </div>
                )}
                
                {/* Actions - only show for challenges that need manual submit */}
                {challenge.type === 'image' && (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={generateChallenge}
                      className="flex-shrink-0 h-10 w-10 rounded-lg border border-border bg-background flex items-center justify-center hover:bg-muted/50 transition-colors"
                    >
                      <RefreshCw className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={handleManualSubmit}
                      disabled={selectedImages.length === 0}
                      className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Verify
                    </button>
                  </div>
                )}
              </motion.div>
            )}
            
            {status === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center gap-3 py-4"
              >
                <Loader2 className={`animate-spin text-primary ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`} />
                <span className={`text-muted-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  Verifying...
                </span>
              </motion.div>
            )}
            
            {status === 'verified' && (
              <motion.div
                key="verified"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className={`flex-shrink-0 rounded-full bg-primary flex items-center justify-center ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}>
                  <Check className={`text-primary-foreground ${isCompact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                </div>
                <span className={`font-medium text-primary ${isCompact ? 'text-xs' : 'text-sm'}`}>Verified</span>
              </motion.div>
            )}
            
            {status === 'cooldown' && (
              <motion.div
                key="cooldown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-3 py-4"
              >
                <div className="relative">
                  <Clock className={`text-destructive ${isCompact ? 'h-6 w-6' : 'h-8 w-8'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium text-destructive ${isCompact ? 'text-xs' : 'text-sm'}`}>
                    We couldn&apos;t verify you are human
                  </p>
                  <p className={`text-muted-foreground mt-1 ${isCompact ? 'text-[10px]' : 'text-xs'}`}>
                    Try again in <span className="font-mono font-bold text-foreground">{formatTime(cooldownTime)}</span>
                  </p>
                </div>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <AlertTriangle className={`text-destructive ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`} />
                <span className={`text-destructive ${isCompact ? 'text-xs' : 'text-sm'}`}>
                  Verification failed
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className={`flex items-center justify-between border-t border-border bg-muted/20 ${isCompact ? 'px-3 py-1.5' : 'px-4 py-2'}`}>
          <span className={`text-muted-foreground ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
            Protected by <span className="text-primary">Pictura</span>
          </span>
          <div className="flex items-center gap-2">
            <button className={`text-muted-foreground hover:text-foreground transition-colors ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              Privacy
            </button>
            <span className={`text-muted-foreground ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>·</span>
            <button className={`text-muted-foreground hover:text-foreground transition-colors ${isCompact ? 'text-[9px]' : 'text-[10px]'}`}>
              Terms
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
