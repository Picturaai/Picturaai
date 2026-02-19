'use client'

import { useState, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { GeneratedImage, RateLimitInfo } from '@/lib/types'

interface ImageToImageFormProps {
  onGenerated: (image: GeneratedImage) => void
  onRateLimitUpdate: (info: RateLimitInfo) => void
  disabled: boolean
}

export function ImageToImageForm({
  onGenerated,
  onRateLimitUpdate,
  disabled,
}: ImageToImageFormProps) {
  const [prompt, setPrompt] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WebP)')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be under 10MB')
      return
    }
    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  function removeImage() {
    setSelectedFile(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleGenerate() {
    if (!prompt.trim() || !selectedFile || isGenerating || disabled) return

    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('image', selectedFile)

      const response = await fetch('/api/generate/image-to-image', {
        method: 'POST',
        body: formData,
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
        type: 'image-to-image',
        sourceImageUrl: data.sourceImageUrl,
        createdAt: data.createdAt,
      })

      if (data.rateLimitInfo) {
        onRateLimitUpdate(data.rateLimitInfo)
      }

      toast.success('Image transformed successfully!')
      setPrompt('')
      removeImage()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Upload area */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Upload source image
        </label>
        <div
          className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors cursor-pointer min-h-[180px] ${
            isDragging
              ? 'border-primary bg-primary/5'
              : previewUrl
                ? 'border-primary/30 bg-primary/5'
                : 'border-border bg-secondary/30 hover:border-primary/30 hover:bg-secondary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !previewUrl && fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload an image"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              fileInputRef.current?.click()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
            disabled={isGenerating || disabled}
          />

          {previewUrl ? (
            <div className="relative w-full p-3">
              <img
                src={previewUrl}
                alt="Selected source image"
                className="w-full max-h-[200px] object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage()
                }}
                className="absolute top-4 right-4 size-7 rounded-full bg-foreground/80 text-card flex items-center justify-center hover:bg-foreground transition-colors"
                aria-label="Remove image"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-sm font-medium text-foreground">
                  Drop your image here or click to browse
                </span>
                <span className="text-xs text-muted-foreground">
                  PNG, JPG, or WebP up to 10MB
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Prompt */}
      <div className="flex flex-col gap-2">
        <label htmlFor="img-prompt" className="text-sm font-medium text-foreground">
          Describe the transformation
        </label>
        <Textarea
          id="img-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Transform this into a watercolor painting with soft pastel colors..."
          className="min-h-[100px] resize-none bg-card border-border text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-primary/30 focus-visible:border-primary/50"
          disabled={isGenerating || disabled}
        />
        <span className="text-xs text-muted-foreground">
          Describe how you want to transform the uploaded image.
        </span>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || !selectedFile || isGenerating || disabled}
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
            Transforming with Pictura...
          </span>
        ) : disabled ? (
          'Daily limit reached'
        ) : (
          <span className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10m0 0l4.5-4.5a2 2 0 0 1 2.83 0L15 15m-3-3l1.5-1.5a2 2 0 0 1 2.83 0L21 15M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Transform Image
          </span>
        )}
      </Button>
    </div>
  )
}
