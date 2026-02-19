'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { GeneratedImage, RateLimitInfo } from '@/lib/types'

interface TextToImageFormProps {
  onGenerated: (image: GeneratedImage) => void
  onRateLimitUpdate: (info: RateLimitInfo) => void
  disabled: boolean
}

const EXAMPLE_PROMPTS = [
  'A serene Japanese garden at sunset with cherry blossoms falling',
  'A futuristic city skyline with flying cars and neon lights',
  'A cozy cabin in the snowy mountains with warm firelight',
  'An underwater coral reef teeming with colorful tropical fish',
  'A mystical forest with glowing mushrooms and fireflies at dusk',
]

export function TextToImageForm({
  onGenerated,
  onRateLimitUpdate,
  disabled,
}: TextToImageFormProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  async function handleGenerate() {
    if (!prompt.trim() || isGenerating || disabled) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Generation failed')
        if (data.rateLimitInfo) {
          onRateLimitUpdate(data.rateLimitInfo)
        }
        return
      }

      onGenerated({
        url: data.url,
        prompt: data.prompt,
        type: 'text-to-image',
        createdAt: data.createdAt,
      })

      if (data.rateLimitInfo) {
        onRateLimitUpdate(data.rateLimitInfo)
      }

      toast.success('Image generated successfully!')
      setPrompt('')
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="text-prompt" className="text-sm font-medium text-foreground">
          Describe your image
        </label>
        <Textarea
          id="text-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A magical forest with glowing mushrooms and fireflies at sunset..."
          className="min-h-[120px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary/50"
          disabled={isGenerating || disabled}
        />
        <span className="text-xs text-muted-foreground">
          Be descriptive for best results. Include style, mood, lighting, and details.
        </span>
      </div>

      {/* Example prompts */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Try an example
        </span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPrompt(example)}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary hover:border-primary/20 transition-colors cursor-pointer"
              disabled={isGenerating || disabled}
            >
              {example.length > 45 ? example.slice(0, 45) + '...' : example}
            </button>
          ))}
        </div>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating || disabled}
        className="w-full h-12 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin size-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating with Pictura...
          </span>
        ) : disabled ? (
          'Daily limit reached'
        ) : (
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Generate Image
          </span>
        )}
      </Button>
    </div>
  )
}
