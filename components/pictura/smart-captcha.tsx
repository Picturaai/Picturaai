'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2 } from 'lucide-react'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence'

interface Challenge {
  type: ChallengeType
  instruction: string
  question: string
  options: string[]
  answer: string
}

// Challenge generators - creates thousands of unique challenges
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
      { seq: [2, 4, 6, 8], next: 10, rule: 'add 2' },
      { seq: [5, 10, 15, 20], next: 25, rule: 'add 5' },
      { seq: [1, 2, 4, 8], next: 16, rule: 'multiply by 2' },
      { seq: [3, 6, 9, 12], next: 15, rule: 'add 3' },
      { seq: [1, 4, 9, 16], next: 25, rule: 'squares' },
      { seq: [100, 90, 80, 70], next: 60, rule: 'subtract 10' },
      { seq: [1, 3, 5, 7], next: 9, rule: 'add 2' },
      { seq: [2, 6, 18, 54], next: 162, rule: 'multiply by 3' },
      { seq: [10, 20, 30, 40], next: 50, rule: 'add 10' },
      { seq: [1, 1, 2, 3, 5], next: 8, rule: 'fibonacci' },
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
    const words = [
      'HUMAN', 'VERIFY', 'ROBOT', 'IMAGE', 'PHOTO', 'BRAIN',
      'WORLD', 'PEACE', 'TRUST', 'PIXEL', 'CLOUD', 'LIGHT',
      'MUSIC', 'WATER', 'HEART', 'EARTH', 'POWER', 'DREAM'
    ]
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
      { items: ['Mon', 'Tue', 'Wed', 'Thu'], next: 'Fri', category: 'days' },
      { items: ['Jan', 'Feb', 'Mar', 'Apr'], next: 'May', category: 'months' },
      { items: ['A', 'B', 'C', 'D'], next: 'E', category: 'alphabet' },
      { items: ['Spring', 'Summer', 'Fall'], next: 'Winter', category: 'seasons' },
      { items: ['Red', 'Orange', 'Yellow'], next: 'Green', category: 'rainbow' },
      { items: ['One', 'Two', 'Three', 'Four'], next: 'Five', category: 'numbers' },
    ]
    const s = sequences[Math.floor(Math.random() * sequences.length)]
    const options = [s.next]
    const allOptions = ['Sat', 'Sun', 'Jun', 'Jul', 'F', 'G', 'Winter', 'Spring', 'Blue', 'Purple', 'Six', 'Seven']
    const filtered = allOptions.filter(o => o !== s.next).sort(() => Math.random() - 0.5).slice(0, 3)
    options.push(...filtered)
    
    return {
      type: 'sequence',
      instruction: 'What comes next?',
      question: `${s.items.join(' → ')} → ?`,
      options: options.sort(() => Math.random() - 0.5),
      answer: s.next
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
    const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence']
    const type = types[Math.floor(Math.random() * types.length)]
    setChallenge(CHALLENGES[type]())
    setSelected(null)
  }, [])
  
  const startChallenge = () => {
    setStatus('challenge')
    generateChallenge()
  }
  
  const handleSelect = (option: string) => {
    if (status !== 'challenge' || !challenge) return
    setSelected(option)
  }
  
  const handleSubmit = async () => {
    if (!selected || !challenge) return
    
    setStatus('verifying')
    
    // Short verification delay
    await new Promise(r => setTimeout(r, 300))
    
    if (selected === challenge.answer) {
      setStatus('verified')
      const token = btoa(JSON.stringify({
        t: Date.now(),
        b: behaviorRef.current,
        v: true
      }))
      setTimeout(() => onVerify(token), 200)
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
  
  return (
    <div className={`w-full ${isCompact ? 'max-w-[280px]' : 'max-w-[320px]'}`}>
      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className={`flex items-center gap-2 border-b border-border bg-muted/30 ${isCompact ? 'px-3 py-2' : 'px-4 py-2.5'}`}>
          <PicturaIcon size={isCompact ? 18 : 22} />
          <span className={`font-semibold ${isCompact ? 'text-xs' : 'text-sm'}`}><span className="text-primary">Pictura</span><span className="text-foreground">CAPTCHA</span></span>
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
                <span className={`text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>I'm not a robot</span>
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
                <div>
                  <p className={`font-medium text-foreground ${isCompact ? 'text-xs' : 'text-sm'}`}>{challenge.instruction}</p>
                  <p className={`mt-1 font-mono font-bold text-primary ${isCompact ? 'text-base' : 'text-lg'}`}>{challenge.question}</p>
                </div>
                
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
                
                <div className="flex gap-2">
                  <button
                    onClick={generateChallenge}
                    className="flex h-8 w-8 items-center justify-center rounded border border-border text-muted-foreground hover:bg-muted"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selected}
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
                <div className={`flex items-center justify-center rounded-full bg-green-500 text-white ${isCompact ? 'h-5 w-5' : 'h-6 w-6'}`}>
                  <Check className={isCompact ? 'h-3 w-3' : 'h-4 w-4'} />
                </div>
                <span className={`font-medium text-green-600 ${isCompact ? 'text-xs' : 'text-sm'}`}>Verified</span>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-2"
              >
                <p className={`text-red-500 ${isCompact ? 'text-xs' : 'text-sm'}`}>Verification failed</p>
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
