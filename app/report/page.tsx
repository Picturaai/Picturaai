'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const categories = [
  'Image generation failure',
  'Image quality issue',
  'Upload not working',
  'Rate limit problem',
  'UI / design issue',
  'Other',
]

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
}

export default function ReportPage() {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!category || !description.trim()) {
      toast.error('Please select a category and describe the issue.')
      return
    }
    setSubmitted(true)
    toast.success('Bug report submitted. Thank you!')
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-xl px-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Feedback</span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Report a Bug</h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Pictura is in beta and we rely on your feedback to improve. If you have encountered a bug,
              unexpected behavior, or have a suggestion, please let us know.
            </p>
          </motion.div>

          <div className="my-10 h-px bg-border/50" />

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center rounded-2xl border border-border/50 bg-card px-6 py-14 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-foreground">Thank you!</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Your report has been received. Our team will review it and work on a fix.
              </p>
              <button
                onClick={() => { setSubmitted(false); setCategory(''); setDescription(''); setEmail('') }}
                className="mt-6 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Submit another report
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="flex flex-col gap-6"
            >
              {/* Category */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-foreground">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                        category === c
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 bg-card text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2.5 block text-sm font-medium text-foreground">
                  Describe the issue
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What happened? What did you expect to happen?"
                  rows={5}
                  className="w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-2.5 block text-sm font-medium text-foreground">
                  Email <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 transition-colors focus:border-primary/40"
                />
                <p className="mt-1.5 text-[11px] text-muted-foreground/60">
                  If you would like us to follow up with you.
                </p>
              </div>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                <Send className="h-3.5 w-3.5" />
                Submit Report
              </button>
            </motion.form>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
