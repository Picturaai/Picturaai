'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2 } from 'lucide-react'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence'

interface Challenge {
  type: ChallengeType
  instruction: string
  question: string
  options: string[]
  answer: string
}

const CHALLENGES = {
  math: (): Challenge => {
    const ops = ['+', '-', '×']
    const op = ops[Math.floor(Math.random() * ops.length)]
    let a = Math.floor(Math.random() * 12) + 1
    let b = Math.floor(Math.random() * 12) + 1
    let answer: number
    if (op === '-') { const max = Math.max(a, b); b = Math.min(a, b); a = max }
    switch (op) {
      case '+': answer = a + b; break
      case '-': answer = a - b; break
      case '×': answer = a * b; break
      default: answer = a + b
    }
    const options = [answer.toString()]
    while (options.length < 4) {
      const wrong = answer + Math.floor(Math.random() * 10) - 5
      if (wrong !== answer && wrong >= 0 && !options.includes(wrong.toString())) options.push(wrong.toString())
    }
    return { type: 'math', instruction: 'Solve this', question: `${a} ${op} ${b} = ?`, options: options.sort(() => Math.random() - 0.5), answer: answer.toString() }
  },

  pattern: (): Challenge => {
    const patterns = [
      { seq: [2, 4, 6, 8], next: '10' },
      { seq: [1, 3, 5, 7], next: '9' },
      { seq: [3, 6, 9, 12], next: '15' },
      { seq: [5, 10, 15, 20], next: '25' },
      { seq: [1, 2, 4, 8], next: '16' },
      { seq: [100, 90, 80, 70], next: '60' },
      { seq: [1, 4, 9, 16], next: '25' },
      { seq: [2, 6, 12, 20], next: '30' },
    ]
    const p = patterns[Math.floor(Math.random() * patterns.length)]
    const options = [p.next]
    while (options.length < 4) {
      const w = (parseInt(p.next) + Math.floor(Math.random() * 20) - 10).toString()
      if (w !== p.next && !options.includes(w) && parseInt(w) > 0) options.push(w)
    }
    return { type: 'pattern', instruction: 'What comes next?', question: p.seq.join(', ') + ', ?', options: options.sort(() => Math.random() - 0.5), answer: p.next }
  },

  word: (): Challenge => {
    const words = [
      { scrambled: 'OLVE', answer: 'LOVE' },
      { scrambled: 'ETRE', answer: 'TREE' },
      { scrambled: 'KOOB', answer: 'BOOK' },
      { scrambled: 'TARS', answer: 'STAR' },
      { scrambled: 'ODOF', answer: 'FOOD' },
      { scrambled: 'EMOH', answer: 'HOME' },
      { scrambled: 'EDOC', answer: 'CODE' },
      { scrambled: 'EAMG', answer: 'GAME' },
      { scrambled: 'EITM', answer: 'TIME' },
      { scrambled: 'EILF', answer: 'LIFE' },
    ]
    const w = words[Math.floor(Math.random() * words.length)]
    const others = words.filter(x => x.answer !== w.answer).slice(0, 3).map(x => x.answer)
    return { type: 'word', instruction: 'Unscramble', question: w.scrambled, options: [w.answer, ...others].sort(() => Math.random() - 0.5), answer: w.answer }
  },

  sequence: (): Challenge => {
    const seqs = [
      { items: ['Mon', 'Tue', 'Wed'], next: 'Thu' },
      { items: ['Jan', 'Feb', 'Mar'], next: 'Apr' },
      { items: ['A', 'B', 'C'], next: 'D' },
      { items: ['Spring', 'Summer', 'Fall'], next: 'Winter' },
      { items: ['1st', '2nd', '3rd'], next: '4th' },
      { items: ['One', 'Two', 'Three'], next: 'Four' },
    ]
    const s = seqs[Math.floor(Math.random() * seqs.length)]
    const extras = ['Fri', 'May', 'E', 'Autumn', '5th', 'Five', 'Sat', 'Jun', 'F', 'Six']
    const options = [s.next]
    while (options.length < 4) {
      const e = extras[Math.floor(Math.random() * extras.length)]
      if (!options.includes(e)) options.push(e)
    }
    return { type: 'sequence', instruction: 'What comes next?', question: s.items.join(' → ') + ' → ?', options: options.sort(() => Math.random() - 0.5), answer: s.next }
  },
}

function generateChallenge(): Challenge {
  const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence']
  const type = types[Math.floor(Math.random() * types.length)]
  return CHALLENGES[type]()
}

function generateToken(data: object): string {
  return btoa(JSON.stringify({ ...data, t: Date.now(), r: Math.random().toString(36).slice(2) }))
}

interface SmartCaptchaProps {
  onVerify: (token: string) => void
  onExpire?: () => void
}

export function SmartCaptcha({ onVerify, onExpire }: SmartCaptchaProps) {
  const [state, setState] = useState<'idle' | 'challenge' | 'verifying' | 'verified' | 'failed'>('idle')
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const startTimeRef = useRef(0)

  const startChallenge = useCallback(() => {
    setChallenge(generateChallenge())
    setState('challenge')
    startTimeRef.current = Date.now()
    setSelected(null)
    setAttempts(0)
  }, [])

  const handleSelect = useCallback((answer: string) => {
    if (state !== 'challenge' || !challenge) return
    setSelected(answer)

    // Fast verification - just 150ms delay for visual feedback
    setTimeout(() => {
      if (answer === challenge.answer) {
        setState('verified')
        const token = generateToken({ solved: true, type: challenge.type, attempts: attempts + 1, time: Date.now() - startTimeRef.current })
        onVerify(token)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) {
          setState('failed')
          setTimeout(() => startChallenge(), 500)
        } else {
          // Generate new challenge on wrong answer
          setChallenge(generateChallenge())
          setSelected(null)
        }
      }
    }, 150)
  }, [state, challenge, attempts, onVerify, startChallenge])

  useEffect(() => {
    if (state === 'challenge') {
      const timer = setTimeout(() => { setState('idle'); onExpire?.() }, 120000)
      return () => clearTimeout(timer)
    }
  }, [state, onExpire])

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        {state === 'idle' && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={startChallenge}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-card hover:border-primary/40 transition-all"
          >
            <div className="w-5 h-5 rounded border-2 border-muted-foreground/40 flex items-center justify-center shrink-0" />
            <span className="text-sm text-foreground">I&apos;m not a robot</span>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">P</span>
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Pictura</span>
            </div>
          </motion.button>
        )}

        {state === 'challenge' && challenge && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="rounded-md border border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
                  <span className="text-xs font-bold text-primary-foreground">P</span>
                </div>
                <span className="text-xs font-medium text-foreground">Verify you&apos;re human</span>
              </div>
              <button type="button" onClick={startChallenge} className="p-1 rounded hover:bg-secondary transition-colors" title="New challenge">
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="p-3">
              <p className="text-[11px] text-muted-foreground mb-0.5">{challenge.instruction}</p>
              <p className="text-base font-semibold text-foreground mb-3">{challenge.question}</p>

              <div className="grid grid-cols-2 gap-1.5">
                {challenge.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={selected !== null}
                    className={`px-3 py-2 rounded border text-sm font-medium transition-all ${
                      selected === opt
                        ? opt === challenge.answer
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-destructive/10 border-destructive text-destructive'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                    } disabled:cursor-not-allowed`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {attempts > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2 text-center">
                  {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} left
                </p>
              )}
            </div>

            <div className="flex items-center justify-between px-3 py-1.5 bg-secondary/30 border-t border-border">
              <span className="text-[9px] text-muted-foreground">PicturaCAPTCHA</span>
              <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <a href="/privacy" className="hover:underline">Privacy</a>
                <span>·</span>
                <a href="/terms" className="hover:underline">Terms</a>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'verified' && (
          <motion.div
            key="verified"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-primary/30 bg-primary/5"
          >
            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-foreground">Verified</span>
            <div className="ml-auto flex items-center gap-1.5 shrink-0">
              <div className="w-4 h-4 rounded bg-primary/10 flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary">P</span>
              </div>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">Pictura</span>
            </div>
          </motion.div>
        )}

        {state === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-destructive/30 bg-destructive/5"
          >
            <Loader2 className="w-4 h-4 text-destructive animate-spin shrink-0" />
            <span className="text-sm text-destructive">Loading new challenge...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
