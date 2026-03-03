'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, RefreshCw, Loader2 } from 'lucide-react'
import { PicturaIcon } from './pictura-icon'

type ChallengeType = 'math' | 'pattern' | 'word' | 'sequence' | 'emoji' | 'color'

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
    return { type: 'math', instruction: 'Solve this math problem', question: `${a} ${op} ${b} = ?`, options: options.sort(() => Math.random() - 0.5), answer: answer.toString() }
  },

  pattern: (): Challenge => {
    const patterns = [
      { seq: [2, 4, 6, 8], next: '10', rule: 'adding 2' },
      { seq: [1, 3, 5, 7], next: '9', rule: 'odd numbers' },
      { seq: [3, 6, 9, 12], next: '15', rule: 'multiples of 3' },
      { seq: [5, 10, 15, 20], next: '25', rule: 'adding 5' },
      { seq: [1, 2, 4, 8], next: '16', rule: 'doubling' },
      { seq: [100, 90, 80, 70], next: '60', rule: 'subtracting 10' },
    ]
    const p = patterns[Math.floor(Math.random() * patterns.length)]
    const options = [p.next]
    while (options.length < 4) {
      const w = (parseInt(p.next) + Math.floor(Math.random() * 20) - 10).toString()
      if (w !== p.next && !options.includes(w) && parseInt(w) > 0) options.push(w)
    }
    return { type: 'pattern', instruction: 'Find the next number in the sequence', question: p.seq.join(', ') + ', ?', options: options.sort(() => Math.random() - 0.5), answer: p.next }
  },

  word: (): Challenge => {
    const words = [
      { scrambled: 'OLVE', answer: 'LOVE' },
      { scrambled: 'ETRE', answer: 'TREE' },
      { scrambled: 'KOOB', answer: 'BOOK' },
      { scrambled: 'TARS', answer: 'STAR' },
      { scrambled: 'ODOF', answer: 'FOOD' },
      { scrambled: 'EMOH', answer: 'HOME' },
      { scrambled: 'DIWR', answer: 'WORD' },
      { scrambled: 'EDOC', answer: 'CODE' },
    ]
    const w = words[Math.floor(Math.random() * words.length)]
    const others = words.filter(x => x.answer !== w.answer).slice(0, 3).map(x => x.answer)
    return { type: 'word', instruction: 'Unscramble the letters to form a word', question: w.scrambled, options: [w.answer, ...others].sort(() => Math.random() - 0.5), answer: w.answer }
  },

  sequence: (): Challenge => {
    const seqs = [
      { items: ['Monday', 'Tuesday', 'Wednesday'], next: 'Thursday' },
      { items: ['January', 'February', 'March'], next: 'April' },
      { items: ['A', 'B', 'C', 'D'], next: 'E' },
      { items: ['Spring', 'Summer', 'Fall'], next: 'Winter' },
      { items: ['First', 'Second', 'Third'], next: 'Fourth' },
    ]
    const s = seqs[Math.floor(Math.random() * seqs.length)]
    const extras = ['Friday', 'May', 'F', 'Autumn', 'Fifth', 'Saturday', 'June', 'G']
    const options = [s.next]
    while (options.length < 4) {
      const e = extras[Math.floor(Math.random() * extras.length)]
      if (!options.includes(e)) options.push(e)
    }
    return { type: 'sequence', instruction: 'What comes next?', question: s.items.join(' → ') + ' → ?', options: options.sort(() => Math.random() - 0.5), answer: s.next }
  },

  emoji: (): Challenge => {
    const challenges = [
      { q: 'Which is a fruit?', opts: ['🍎', '🚗', '🏠', '📱'], ans: '🍎' },
      { q: 'Which is an animal?', opts: ['🐕', '🌳', '⭐', '🎵'], ans: '🐕' },
      { q: 'Which is a vehicle?', opts: ['✈️', '🌺', '📚', '🎸'], ans: '✈️' },
      { q: 'Which represents weather?', opts: ['☀️', '🎂', '💻', '🎯'], ans: '☀️' },
      { q: 'Which is food?', opts: ['🍕', '🎨', '🔑', '💡'], ans: '🍕' },
    ]
    const c = challenges[Math.floor(Math.random() * challenges.length)]
    return { type: 'emoji', instruction: 'Select the correct emoji', question: c.q, options: c.opts.sort(() => Math.random() - 0.5), answer: c.ans }
  },

  color: (): Challenge => {
    const colors = [
      { name: 'Red', hex: '#EF4444' },
      { name: 'Blue', hex: '#3B82F6' },
      { name: 'Green', hex: '#22C55E' },
      { name: 'Yellow', hex: '#EAB308' },
      { name: 'Purple', hex: '#A855F7' },
      { name: 'Orange', hex: '#F97316' },
    ]
    const correct = colors[Math.floor(Math.random() * colors.length)]
    const options = [correct.name]
    const others = colors.filter(c => c.name !== correct.name)
    while (options.length < 4 && others.length > 0) {
      const idx = Math.floor(Math.random() * others.length)
      options.push(others[idx].name)
      others.splice(idx, 1)
    }
    return { type: 'color', instruction: `Select the color shown`, question: correct.hex, options: options.sort(() => Math.random() - 0.5), answer: correct.name }
  },
}

function generateChallenge(): Challenge {
  const types: ChallengeType[] = ['math', 'pattern', 'word', 'sequence', 'emoji', 'color']
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
    setState('verifying')

    setTimeout(() => {
      if (answer === challenge.answer) {
        setState('verified')
        const token = generateToken({ solved: true, type: challenge.type, attempts: attempts + 1, time: Date.now() - startTimeRef.current })
        setTimeout(() => onVerify(token), 300)
      } else {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        if (newAttempts >= 3) {
          setState('failed')
          setTimeout(() => startChallenge(), 1000)
        } else {
          setState('challenge')
          setSelected(null)
        }
      }
    }, 400)
  }, [state, challenge, attempts, onVerify, startChallenge])

  useEffect(() => {
    if (state === 'challenge') {
      const timer = setTimeout(() => { setState('idle'); onExpire?.() }, 120000)
      return () => clearTimeout(timer)
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
            className="w-full flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all"
          >
            <div className="w-6 h-6 rounded border-2 border-primary/40 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-transparent" />
            </div>
            <span className="text-sm text-foreground">I&apos;m not a robot</span>
            <div className="ml-auto flex items-center gap-2">
              <PicturaIcon size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground font-medium">PicturaCAPTCHA</span>
            </div>
          </motion.button>
        )}

        {state === 'challenge' && challenge && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="rounded-lg border border-primary/20 bg-card overflow-hidden shadow-lg"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <PicturaIcon size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Security Verification</span>
              </div>
              <button type="button" onClick={startChallenge} className="p-1.5 rounded-md hover:bg-primary/10 transition-colors" title="Get new challenge">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Challenge */}
            <div className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{challenge.instruction}</p>
              
              {challenge.type === 'color' ? (
                <div className="w-full h-16 rounded-lg mb-4 border border-border" style={{ backgroundColor: challenge.question }} />
              ) : (
                <p className="text-lg font-semibold text-foreground mb-4">{challenge.question}</p>
              )}

              <div className="grid grid-cols-2 gap-2">
                {challenge.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    disabled={selected !== null}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      selected === opt
                        ? opt === challenge.answer
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-destructive/10 border-destructive text-destructive'
                        : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground'
                    } disabled:cursor-not-allowed`}
                  >
                    {challenge.type === 'emoji' ? <span className="text-2xl">{opt}</span> : opt}
                  </button>
                ))}
              </div>

              {attempts > 0 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  {3 - attempts} attempt{3 - attempts !== 1 ? 's' : ''} remaining
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-secondary/30 border-t border-border/50">
              <span className="text-[10px] text-muted-foreground">Protected by PicturaCAPTCHA</span>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <a href="/privacy" className="hover:underline">Privacy</a>
                <span>·</span>
                <a href="/terms" className="hover:underline">Terms</a>
              </div>
            </div>
          </motion.div>
        )}

        {state === 'verifying' && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card"
          >
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">Verifying...</span>
            <div className="ml-auto flex items-center gap-2">
              <PicturaIcon size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground">PicturaCAPTCHA</span>
            </div>
          </motion.div>
        )}

        {state === 'verified' && (
          <motion.div
            key="verified"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5"
          >
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm text-foreground font-medium">Verification complete</span>
            <div className="ml-auto flex items-center gap-2">
              <PicturaIcon size={16} className="text-primary" />
              <span className="text-xs text-muted-foreground">PicturaCAPTCHA</span>
            </div>
          </motion.div>
        )}

        {state === 'failed' && (
          <motion.div
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5"
          >
            <Loader2 className="w-5 h-5 text-destructive animate-spin" />
            <span className="text-sm text-destructive">Too many attempts. Loading new challenge...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
