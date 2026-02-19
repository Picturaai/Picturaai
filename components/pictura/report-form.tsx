'use client'

import { useState } from 'react'
import { toast } from 'sonner'

const bugCategories = [
  'Image generation fails',
  'Poor image quality',
  'Slow response times',
  'Upload not working',
  'Rate limit issue',
  'UI/Display bug',
  'Other',
]

export function ReportForm() {
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !description.trim()) {
      toast.error('Please select a category and describe the issue.')
      return
    }
    // In a real app this would submit to an API
    setSubmitted(true)
    toast.success('Bug report submitted. Thank you for helping us improve Pictura!')
  }

  if (submitted) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-primary" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Report Submitted</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          Thank you for taking the time to report this issue. Our team at Imoogle Labs will
          review it and work on a fix. We appreciate your help in making Pictura better.
        </p>
        <button
          onClick={() => {
            setSubmitted(false)
            setCategory('')
            setDescription('')
            setEmail('')
          }}
          className="px-5 py-2.5 text-sm font-medium bg-secondary text-foreground rounded-xl hover:bg-secondary/80 transition-colors border border-border"
        >
          Submit Another Report
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
      {/* Category */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Category</label>
        <div className="flex flex-wrap gap-2">
          {bugCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`text-xs px-3 py-2 rounded-xl border transition-all ${
                category === cat
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <label htmlFor="bug-description" className="text-sm font-medium text-foreground">
          Description <span className="text-destructive">*</span>
        </label>
        <textarea
          id="bug-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe the issue in detail. What were you trying to do? What happened instead?"
          rows={5}
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all resize-none leading-relaxed"
          required
        />
      </div>

      {/* Email (optional) */}
      <div className="flex flex-col gap-2">
        <label htmlFor="bug-email" className="text-sm font-medium text-foreground">
          Email <span className="text-xs text-muted-foreground font-normal">(optional, for follow-ups)</span>
        </label>
        <input
          id="bug-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
        />
      </div>

      <button
        type="submit"
        className="self-start px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
      >
        Submit Report
      </button>
    </form>
  )
}
