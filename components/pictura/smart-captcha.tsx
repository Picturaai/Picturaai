'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Check, RefreshCw } from 'lucide-react'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence'

interface Challenge {
  type: ChallengeType
  question: string
  options: string[]
  answer: string
  hint: string
}

interface SmartCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

function generateChallenge(): Challenge {
  const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence']
  const type = types[Math.floor(Math.random() * types.length)]

  switch (type) {
    case 'math': {
      const ops = ['+', '-', '×']
      const op = ops[Math.floor(Math.random() * ops.length)]
      const a = Math.floor(Math.random() * 10) + 1
      const b = Math.floor(Math.random() * 10) + 1
      let answer: number
      let num1 = a, num2 = b
      switch (op) {
        case '+': answer = a + b; break
        case '-': num1 = Math.max(a, b); num2 = Math.min(a, b); answer = num1 - num2; break
        case '×': answer = a * b; break
        default: answer = a + b
      }
      
      const options = [answer.toString()]
      while (options.length < 4) {
        const wrong = answer + (Math.floor(Math.random() * 10) - 5)
        if (wrong !== answer && wrong >= 0 && !options.includes(wrong.toString())) {
          options.push(wrong.toString())
        }
      }
      options.sort(() => Math.random() - 0.5)

      return { type: 'math', question: `${num1} ${op} ${num2} = ?`, options, answer: answer.toString(), hint: 'Solve it' }
    }

    case 'pattern': {
      const patterns = [
        { seq: [2, 4, 6, 8], next: '10', hint: '+2 each time' },
        { seq: [1, 3, 5, 7], next: '9', hint: 'Odd numbers' },
        { seq: [3, 6, 9, 12], next: '15', hint: '+3 each time' },
        { seq: [5, 10, 15, 20], next: '25', hint: '+5 each time' },
        { seq: [1, 2, 4, 8], next: '16', hint: 'Doubles' },
      ]
      const p = patterns[Math.floor(Math.random() * patterns.length)]
      const options = [p.next]
      while (options.length < 4) {
        const w = (parseInt(p.next) + Math.floor(Math.random() * 10) - 5).toString()
        if (w !== p.next && !options.includes(w) && parseInt(w) > 0) options.push(w)
      }
      options.sort(() => Math.random() - 0.5)
      return { type: 'pattern', question: `${p.seq.join(', ')}, ?`, options, answer: p.next, hint: p.hint }
    }

    case 'word': {
      const words = [
        { scrambled: 'OLVE', answer: 'LOVE', hint: 'A feeling' },
        { scrambled: 'ETRE', answer: 'TREE', hint: 'Nature' },
        { scrambled: 'KOOB', answer: 'BOOK', hint: 'You read it' },
        { scrambled: 'TARS', answer: 'STAR', hint: 'In the sky' },
        { scrambled: 'ODOF', answer: 'FOOD', hint: 'You eat it' },
      ]
      const w = words[Math.floor(Math.random() * words.length)]
      const options = [w.answer, ...words.filter(x => x.answer !== w.answer).slice(0, 3).map(x => x.answer)]
      options.sort(() => Math.random() - 0.5)
      return { type: 'word', question: `Unscramble: ${w.scrambled}`, options, answer: w.answer, hint: w.hint }
    }

    case 'sequence': {
      const seqs = [
        { items: ['Mon', 'Tue', 'Wed'], next: 'Thu', hint: 'Days' },
        { items: ['Jan', 'Feb', 'Mar'], next: 'Apr', hint: 'Months' },
        { items: ['A', 'B', 'C'], next: 'D', hint: 'Alphabet' },
        { items: ['Red', 'Orange', 'Yellow'], next: 'Green', hint: 'Rainbow' },
      ]
      const s = seqs[Math.floor(Math.random() * seqs.length)]
      const extras = ['Fri', 'May', 'E', 'Blue', 'Sun', 'Dec', 'Z']
      const options = [s.next]
      while (options.length < 4) {
        const e = extras[Math.floor(Math.random() * extras.length)]
        if (!options.includes(e)) options.push(e)
      }
      options.sort(() => Math.random() - 0.5)
      return { type: 'sequence', question: `${s.items.join(' → ')} → ?`, options, answer: s.next, hint: s.hint }
    }

    default:
      return generateChallenge()
  }
}

function generateToken(data: object): string {
  return btoa(JSON.stringify({ ...data, t: Date.now(), n: Math.random().toString(36).slice(2) }))
}

export function SmartCaptcha({ onVerify, onExpire }: SmartCaptchaProps) {
  const [state, setState] = useState<'idle' | 'challenge' | 'verifying' | 'verified' | 'failed'>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const startTimeRef = useRef(0)

  const startChallenge = useCallback(() => {
    setChallenge(generateChallenge())
    setState('challenge')
    startTimeRef.current = Date.now()
    setSelected(null)
    setShowHint(false)
    setAttempts(0)
  }, [])

  const handleSelect = useCallback((answer: string) => {
    if (state !== 'challenge' || !challenge) return
    setSelected(answer)
    setState('verifying')

    setTimeout(() => {
      if (answer === challenge.answer) {
        setState('verified')
        const token = generateToken({ solved: true, type: challenge.type, attempts: attempts + 1, time: Date.now() - startTimeRef.current })
        setTimeout(() => onVerify(token), 400)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) {
          setState('failed')
          setTimeout(() => startChallenge(), 1200)
        } else {
          setState('challenge')
          setSelected(null)
          setShowHint(true)
        }
      }
    }, 500)
  }, [state, challenge, attempts, onVerify, startChallenge])

  useEffect(() => {
    if (state === 'challenge') {
      const t = setTimeout(() => { setState('idle'); onExpire?.() }, 120000)
      return () => clearTimeout(t)
    }
  }, [state, onExpire])

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={startChallenge}
            className="w-full flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
          >
            <div className="w-5 h-5 rounded border-2 border-muted-foreground/40" />
            <span className="text-sm text-muted-foreground">Verify you&apos;re human</span>
            <div className="ml-auto flex items-center gap-1.5 text-muted-foreground/50">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium">Pictura</span>
            </div>
          </motion.button>
        )}

        {state === 'challenge' && challenge && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-secondary/30">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-muted-foreground">Security Check</span>
              </div>
              <button type="button" onClick={startChallenge} className="p-1 rounded hover:bg-secondary">
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <div className="p-3">
              <p className="text-sm font-medium text-foreground">{challenge.question}</p>
              {showHint && <p className="text-xs text-muted-foreground mt-0.5">Hint: {challenge.hint}</p>}
              <div className="grid grid-cols-2 gap-2 mt-3">
                {challenge.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={selected !== null}
                    className={`p-2.5 rounded border text-sm font-medium transition-all ${
                      selected === opt
                        ? opt === challenge.answer
                          ? 'bg-green-500/10 border-green-500 text-green-600'
                          : 'bg-red-500/10 border-red-500 text-red-600'
                        : 'border-border hover:bg-secondary/50 text-foreground'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {attempts > 0 && <p className="text-[11px] text-muted-foreground mt-2 text-center">{3 - attempts} attempts left</p>}
            </div>
            <div className="flex items-center justify-between px-3 py-1.5 border-t border-border/50 bg-secondary/20">
              <span className="text-[9px] text-muted-foreground/50">Protected by Pictura</span>
            </div>
          </motion.div>
        )}

        {state === 'verifying' && (
          <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-3.5 rounded-lg border border-border bg-card">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-sm text-muted-foreground">Verifying...</span>
          </motion.div>
        )}

        {state === 'verified' && (
          <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-3.5 rounded-lg border border-green-500/30 bg-green-500/5">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-green-600 font-medium">Verified</span>
            <div className="ml-auto flex items-center gap-1.5 text-muted-foreground/50">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px]">Pictura</span>
            </div>
          </motion.div>
        )}

        {state === 'failed' && (
          <motion.div key="failed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-3.5 rounded-lg border border-red-500/30 bg-red-500/5">
            <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />
            <span className="text-sm text-red-600">Loading new challenge...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
