'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2, AlertCircle, Fingerprint, Heart, X } from 'lucide-react'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type ChallengeType = 'math' | 'pattern' | 'word' | 'image' | 'typing' | 'slider' | 'biometric'

interface Challenge {
  type: ChallengeType
  question: string
  answer: string
  options?: string[]
  images?: { id: string; emoji: string; isTarget: boolean }[]
  targetCount?: number
  distortedText?: string
  sliderTarget?: number
}

const IMAGE_CATEGORIES = [
  { target: 'cats', items: [
    { id: '1', emoji: '🐱', isTarget: true }, { id: '2', emoji: '🐕', isTarget: false },
    { id: '3', emoji: '🐈', isTarget: true }, { id: '4', emoji: '🐦', isTarget: false },
    { id: '5', emoji: '🦁', isTarget: false }, { id: '6', emoji: '🐈‍⬛', isTarget: true },
  ]},
  { target: 'food', items: [
    { id: '1', emoji: '🍕', isTarget: true }, { id: '2', emoji: '🚗', isTarget: false },
    { id: '3', emoji: '🍔', isTarget: true }, { id: '4', emoji: '🏠', isTarget: false },
    { id: '5', emoji: '🎸', isTarget: false }, { id: '6', emoji: '🍎', isTarget: true },
  ]},
  { target: 'vehicles', items: [
    { id: '1', emoji: '🚗', isTarget: true }, { id: '2', emoji: '🌳', isTarget: false },
    { id: '3', emoji: '✈️', isTarget: true }, { id: '4', emoji: '🏀', isTarget: false },
    { id: '5', emoji: '🚌', isTarget: true }, { id: '6', emoji: '🎵', isTarget: false },
  ]},
]

const generateChallenge = (): Challenge => {
  const types: ChallengeType[] = ['math', 'pattern', 'word', 'image', 'typing', 'slider', 'biometric']
  const type = types[Math.floor(Math.random() * types.length)]
  
  switch (type) {
    case 'math': {
      const ops = ['+', '-', '×']
      const op = ops[Math.floor(Math.random() * ops.length)]
      let a: number, b: number, answer: number
      if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; answer = a + b }
      else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * a); answer = a - b }
      else { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; answer = a * b }
      const wrongAnswers = [answer + Math.floor(Math.random() * 5) + 1, answer - Math.floor(Math.random() * 5) - 1, answer + Math.floor(Math.random() * 10) - 5].filter(x => x !== answer && x > 0)
      return { type, question: `What is ${a} ${op} ${b}?`, answer: answer.toString(), options: [answer.toString(), ...wrongAnswers.slice(0, 3).map(String)].sort(() => Math.random() - 0.5) }
    }
    case 'pattern': {
      const patterns = [
        { seq: [2, 4, 6, 8], next: '10', q: '2, 4, 6, 8, ?' },
        { seq: [1, 3, 5, 7], next: '9', q: '1, 3, 5, 7, ?' },
        { seq: [3, 6, 9, 12], next: '15', q: '3, 6, 9, 12, ?' },
        { seq: [1, 4, 9, 16], next: '25', q: '1, 4, 9, 16, ?' },
        { seq: [2, 4, 8, 16], next: '32', q: '2, 4, 8, 16, ?' },
      ]
      const p = patterns[Math.floor(Math.random() * patterns.length)]
      const wrongOpts = [parseInt(p.next) + 2, parseInt(p.next) - 1, parseInt(p.next) + 5].map(String)
      return { type, question: p.q, answer: p.next, options: [p.next, ...wrongOpts].sort(() => Math.random() - 0.5) }
    }
    case 'word': {
      const words = [{ scrambled: 'UEBL', answer: 'BLUE' }, { scrambled: 'ETRE', answer: 'TREE' }, { scrambled: 'ODOG', answer: 'GOOD' }, { scrambled: 'PPLAE', answer: 'APPLE' }]
      const w = words[Math.floor(Math.random() * words.length)]
      return { type, question: `Unscramble: ${w.scrambled}`, answer: w.answer, options: [w.answer, 'CAKE', 'MOON', 'FISH'].sort(() => Math.random() - 0.5) }
    }
    case 'image': {
      const cat = IMAGE_CATEGORIES[Math.floor(Math.random() * IMAGE_CATEGORIES.length)]
      return { type, question: `Select all ${cat.target}`, answer: cat.target, images: cat.items, targetCount: cat.items.filter(i => i.isTarget).length }
    }
    case 'typing': {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let text = ''
      for (let i = 0; i < 5; i++) text += chars[Math.floor(Math.random() * chars.length)]
      return { type, question: 'Type the characters below', answer: text, distortedText: text }
    }
    case 'slider': {
      const target = Math.floor(Math.random() * 60) + 20
      return { type, question: `Slide to ${target}`, answer: target.toString(), sliderTarget: target }
    }
    case 'biometric':
      return { type, question: 'Hold to verify your presence', answer: 'verified' }
    default:
      return { type: 'math', question: 'What is 2 + 2?', answer: '4', options: ['3', '4', '5', '6'] }
  }
}

interface SmartCaptchaProps {
  onVerify?: (token: string) => void
  siteKey?: string
  isCompact?: boolean
}

export function SmartCaptcha({ onVerify, siteKey = 'demo', isCompact = false }: SmartCaptchaProps) {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'challenge' | 'wrong' | 'verifying' | 'verified' | 'cooldown'>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [sliderValue, setSliderValue] = useState(50)
  const [attempts, setAttempts] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)
  
  // Biometric hold state
  const [isHolding, setIsHolding] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [pulseData, setPulseData] = useState<number[]>([])
  const [pulseDetected, setPulseDetected] = useState(false)
  const holdStartRef = useRef<number>(0)
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Behavior tracking
  const interactionsRef = useRef(0)
  
  useEffect(() => {
    const track = () => { interactionsRef.current++ }
    window.addEventListener('mousemove', track)
    window.addEventListener('touchstart', track)
    return () => { window.removeEventListener('mousemove', track); window.removeEventListener('touchstart', track) }
  }, [])
  
  // Cooldown timer
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime(t => {
          if (t <= 1) { setStatus('idle'); setAttempts(0); return 0 }
          return t - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldownTime])
  
  const resetChallenge = useCallback(() => {
    setUserAnswer('')
    setSelectedImages([])
    setSliderValue(50)
    setHoldProgress(0)
    setPulseData([])
    setPulseDetected(false)
    setChallenge(generateChallenge())
  }, [])
  
  const startChallenge = useCallback(() => {
    if (status === 'cooldown') return
    setStatus('analyzing')
    setTimeout(() => {
      // Auto-pass if lots of human behavior
      if (interactionsRef.current > 20 && Math.random() > 0.6) {
        setStatus('verifying')
        setTimeout(() => { setStatus('verified'); onVerify?.(`pictura_${Date.now()}_${siteKey}`) }, 800)
      } else {
        resetChallenge()
        setStatus('challenge')
      }
    }, 1000)
  }, [status, onVerify, siteKey, resetChallenge])
  
  const handleWrong = useCallback(() => {
    setStatus('wrong')
    const newAttempts = attempts + 1
    setAttempts(newAttempts)
    
    setTimeout(() => {
      if (newAttempts >= 3) {
        setStatus('cooldown')
        setCooldownTime(60)
      } else {
        resetChallenge()
        setStatus('challenge')
      }
    }, 1500)
  }, [attempts, resetChallenge])
  
  const handleCorrect = useCallback(() => {
    setStatus('verifying')
    setTimeout(() => { setStatus('verified'); onVerify?.(`pictura_${Date.now()}_${siteKey}`) }, 800)
  }, [onVerify, siteKey])
  
  const checkAnswer = useCallback((answer?: string) => {
    if (!challenge) return
    const check = answer || userAnswer
    let correct = false
    
    switch (challenge.type) {
      case 'math': case 'pattern': case 'word':
        correct = check.toUpperCase() === challenge.answer.toUpperCase()
        break
      case 'typing':
        correct = check.toUpperCase() === challenge.answer
        break
      case 'image':
        const correctIds = challenge.images?.filter(i => i.isTarget).map(i => i.id) || []
        correct = selectedImages.length === correctIds.length && selectedImages.every(id => correctIds.includes(id))
        break
      case 'slider':
        correct = Math.abs(sliderValue - (challenge.sliderTarget || 50)) <= 3
        break
      case 'biometric':
        correct = holdProgress >= 100 && pulseDetected
        break
    }
    
    if (correct) handleCorrect()
    else handleWrong()
  }, [challenge, userAnswer, selectedImages, sliderValue, holdProgress, pulseDetected, handleCorrect, handleWrong])
  
  // Auto-check for typing
  useEffect(() => {
    if (challenge?.type === 'typing' && userAnswer.length === challenge.answer.length) {
      checkAnswer(userAnswer)
    }
  }, [userAnswer, challenge, checkAnswer])
  
  // Auto-check for slider
  useEffect(() => {
    if (challenge?.type === 'slider' && challenge.sliderTarget) {
      if (Math.abs(sliderValue - challenge.sliderTarget) <= 3) {
        const timer = setTimeout(() => checkAnswer(), 500)
        return () => clearTimeout(timer)
      }
    }
  }, [sliderValue, challenge, checkAnswer])
  
  // Auto-check for images
  useEffect(() => {
    if (challenge?.type === 'image' && challenge.targetCount && selectedImages.length === challenge.targetCount) {
      const timer = setTimeout(() => checkAnswer(), 500)
      return () => clearTimeout(timer)
    }
  }, [selectedImages, challenge, checkAnswer])
  
  // Biometric hold handlers
  const startHold = () => {
    if (challenge?.type !== 'biometric' || status !== 'challenge') return
    setIsHolding(true)
    holdStartRef.current = Date.now()
    
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current
      const progress = Math.min(100, (elapsed / 3000) * 100)
      setHoldProgress(progress)
      if (progress >= 100 && holdIntervalRef.current) clearInterval(holdIntervalRef.current)
    }, 50)
    
    // Simulate pulse detection - detecting "blood flow" via touch pressure variations
    pulseIntervalRef.current = setInterval(() => {
      setPulseData(prev => {
        const newData = [...prev, 60 + Math.random() * 40]
        if (newData.length >= 15) setPulseDetected(true)
        return newData.slice(-30)
      })
    }, 100)
  }
  
  const endHold = () => {
    setIsHolding(false)
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
    
    if (holdProgress >= 100 && pulseDetected) {
      checkAnswer()
    } else if (holdProgress > 0 && holdProgress < 100) {
      setHoldProgress(0)
      setPulseData([])
      setPulseDetected(false)
    }
  }
  
  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current)
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
    }
  }, [])
  
  const toggleImage = (id: string) => {
    setSelectedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div className={`w-full ${isCompact ? 'max-w-[280px]' : 'max-w-sm'}`}>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <PicturaIcon size={14} className="text-primary-foreground" />
            </div>
            <span className="font-semibold text-sm"><span className="text-primary">Pictura</span><span className="text-foreground">CAPTCHA</span></span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium">Secure</span>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <AnimatePresence mode="wait">
            {/* Idle */}
            {status === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <button onClick={startChallenge} className="h-6 w-6 rounded-md border-2 border-border hover:border-primary/50 transition-colors flex items-center justify-center">
                  <div className="h-3 w-3 rounded-sm bg-transparent" />
                </button>
                <span className="text-sm text-foreground">I am human</span>
              </motion.div>
            )}
            
            {/* Analyzing */}
            {status === 'analyzing' && (
              <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <Fingerprint className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm text-muted-foreground">Analyzing behavior...</span>
              </motion.div>
            )}
            
            {/* Wrong Answer */}
            {status === 'wrong' && (
              <motion.div key="wrong" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-2">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-destructive/10 mb-3">
                  <X className="h-6 w-6 text-destructive" />
                </div>
                <p className="text-sm font-medium text-destructive">Incorrect</p>
                <p className="text-xs text-muted-foreground mt-1">Loading new challenge...</p>
              </motion.div>
            )}
            
            {/* Challenge */}
            {status === 'challenge' && challenge && (
              <motion.div key="challenge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {/* Question + Refresh */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{challenge.question}</p>
                  <button onClick={resetChallenge} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="New challenge">
                    <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Options (math, pattern, word) */}
                {challenge.options && (
                  <div className="grid grid-cols-2 gap-2">
                    {challenge.options.map((opt) => (
                      <button key={opt} onClick={() => checkAnswer(opt)} className="py-2.5 px-3 rounded-lg border border-border bg-background hover:bg-muted hover:border-primary/30 transition-all text-sm font-medium">
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Image selection */}
                {challenge.type === 'image' && challenge.images && (
                  <div className="grid grid-cols-3 gap-2">
                    {challenge.images.map((img) => (
                      <button key={img.id} onClick={() => toggleImage(img.id)} className={`aspect-square rounded-lg border-2 text-2xl flex items-center justify-center transition-all ${selectedImages.includes(img.id) ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 hover:border-primary/30'}`}>
                        {img.emoji}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Typing */}
                {challenge.type === 'typing' && (
                  <div className="space-y-3">
                    <div className="relative h-14 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 opacity-20">
                        {[...Array(5)].map((_, i) => (<div key={i} className="absolute h-px bg-foreground/50" style={{ top: `${20 + i * 15}%`, left: 0, right: 0, transform: `rotate(${-2 + Math.random() * 4}deg)` }} />))}
                      </div>
                      <span className="font-mono text-xl tracking-[0.3em] font-bold text-foreground relative" style={{ fontStyle: 'italic', transform: 'skewX(-5deg)' }}>{challenge.distortedText}</span>
                    </div>
                    <input type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value.toUpperCase())} placeholder="Type characters" maxLength={challenge.answer.length} className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" autoComplete="off" />
                    <div className="flex justify-center gap-1">
                      {challenge.answer.split('').map((_, i) => (<div key={i} className={`h-1.5 w-6 rounded-full ${i < userAnswer.length ? 'bg-primary' : 'bg-muted'}`} />))}
                    </div>
                  </div>
                )}
                
                {/* Slider */}
                {challenge.type === 'slider' && (
                  <div className="space-y-3">
                    <input type="range" min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(parseInt(e.target.value))} className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span className="font-medium text-foreground">{sliderValue}</span>
                      <span>100</span>
                    </div>
                  </div>
                )}
                
                {/* Biometric Hold */}
                {challenge.type === 'biometric' && (
                  <div className="space-y-3 text-center">
                    <p className="text-xs text-muted-foreground">Press and hold to detect pulse</p>
                    
                    <button onMouseDown={startHold} onMouseUp={endHold} onMouseLeave={endHold} onTouchStart={startHold} onTouchEnd={endHold} className={`relative w-24 h-24 rounded-full border-4 transition-all mx-auto flex items-center justify-center ${isHolding ? 'border-primary bg-primary/10 scale-95' : 'border-border bg-muted/30 hover:border-primary/50'}`}>
                      {/* Progress ring */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary/20" />
                        <circle cx="48" cy="48" r="44" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${holdProgress * 2.76} 276`} className="text-primary transition-all" />
                      </svg>
                      
                      <div className="flex flex-col items-center">
                        {isHolding ? (
                          <>
                            <Heart className={`h-6 w-6 text-primary ${pulseData.length > 0 ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] text-primary mt-1 font-medium">
                              {pulseDetected ? `${Math.round(pulseData[pulseData.length - 1])} BPM` : 'Detecting...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Fingerprint className="h-8 w-8 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground mt-1">HOLD</span>
                          </>
                        )}
                      </div>
                    </button>
                    
                    {/* Pulse visualization */}
                    {isHolding && pulseData.length > 0 && (
                      <div className="h-8 flex items-end justify-center gap-0.5">
                        {pulseData.slice(-20).map((val, i) => (
                          <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${(val - 50) * 0.5}px` }} className="w-1 bg-primary/60 rounded-full" />
                        ))}
                      </div>
                    )}
                    
                    <p className="text-[10px] text-muted-foreground">
                      {pulseDetected ? 'Pulse detected - Release to verify' : 'Simulates biometric blood flow detection'}
                    </p>
                  </div>
                )}
                
                {/* Attempts */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (<div key={i} className={`h-1.5 w-1.5 rounded-full ${i < attempts ? 'bg-destructive' : 'bg-muted'}`} />))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{3 - attempts} attempts left</span>
                </div>
              </motion.div>
            )}
            
            {/* Verifying */}
            {status === 'verifying' && (
              <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Verifying...</span>
              </motion.div>
            )}
            
            {/* Verified */}
            {status === 'verified' && (
              <motion.div key="verified" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-primary">Verified</span>
              </motion.div>
            )}
            
            {/* Cooldown */}
            {status === 'cooldown' && (
              <motion.div key="cooldown" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Verification Failed</span>
                </div>
                <p className="text-xs text-muted-foreground">We couldn't verify you are human.</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="h-8 w-8 rounded-full border-2 border-muted flex items-center justify-center">
                    <span className="text-sm font-mono font-bold text-foreground">{cooldownTime}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">seconds until retry</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Protected by Pictura</span>
          <div className="flex items-center gap-2">
            <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
            <span>·</span>
            <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </div>
  )
}
