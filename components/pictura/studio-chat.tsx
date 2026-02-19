'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { PicturaIcon, PicturaWatermark } from './pictura-logo'
import type { RateLimitInfo } from '@/lib/types'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  imageUrl?: string
  sourceImageUrl?: string
  type?: 'text-to-image' | 'image-to-image'
  timestamp: Date
  isLoading?: boolean
}

export function StudioChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: 'Welcome to Pictura Studio. Describe an image you want to create, or upload an image to transform it. You have 5 free generations per day during beta.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({ limit: 5, remaining: 5, used: 0, resetAt: '' })
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    fetch('/api/rate-limit').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setRateLimitInfo(data)
    }).catch(() => {})
  }, [])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setUploadPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function removeUpload() {
    setUploadedFile(null)
    setUploadPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!input.trim() && !uploadedFile) || isGenerating) return
    if (rateLimitInfo.remaining <= 0) {
      setMessages(prev => [...prev, {
        id: `limit-${Date.now()}`,
        role: 'system',
        content: 'You have reached your daily limit of 5 images. This resets at midnight UTC. We are working on increasing limits soon.',
        timestamp: new Date(),
      }])
      return
    }

    const prompt = input.trim()
    const isImageToImage = !!uploadedFile
    const userMsgId = `user-${Date.now()}`
    const assistantMsgId = `assistant-${Date.now()}`

    // Add user message
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: prompt || 'Transform this image',
      sourceImageUrl: uploadPreview || undefined,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    // Add loading message
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: isImageToImage ? 'Transforming your image...' : 'Creating your image...',
      timestamp: new Date(),
      isLoading: true,
    }])
    setIsGenerating(true)

    try {
      let res: Response
      if (isImageToImage && uploadedFile) {
        const formData = new FormData()
        formData.append('prompt', prompt || 'Transform this image')
        formData.append('image', uploadedFile)
        res = await fetch('/api/generate/image-to-image', { method: 'POST', body: formData })
      } else {
        res = await fetch('/api/generate/text-to-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        })
      }

      const data = await res.json()

      if (!res.ok) {
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
          ...m,
          content: data.error || 'Something went wrong. Please try again.',
          isLoading: false,
        } : m))
        if (data.rateLimitInfo) setRateLimitInfo(data.rateLimitInfo)
        return
      }

      setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        content: `Here is your generated image for: "${prompt || 'image transformation'}"`,
        imageUrl: data.url,
        type: data.type,
        isLoading: false,
      } : m))
      if (data.rateLimitInfo) setRateLimitInfo(data.rateLimitInfo)
    } catch {
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
        ...m,
        content: 'Network error. Please check your connection and try again.',
        isLoading: false,
      } : m))
    } finally {
      setIsGenerating(false)
      removeUpload()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const usedCount = rateLimitInfo.used
  const limitCount = rateLimitInfo.limit

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Studio header */}
      <header className="shrink-0 border-b border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2 group">
              <PicturaIcon size={28} />
              <span className="font-bold text-foreground text-sm">Pictura</span>
            </a>
            <span className="text-muted-foreground/40">|</span>
            <span className="text-sm font-medium text-muted-foreground">Studio</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wider">
              BETA
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: limitCount }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i < usedCount ? 'bg-primary' : 'bg-secondary border border-border'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {rateLimitInfo.remaining}/{limitCount}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-secondary border border-border'
                  : msg.role === 'system'
                    ? 'bg-accent/20 border border-accent/30'
                    : 'bg-primary/10 border border-primary/20'
              }`}>
                {msg.role === 'user' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-foreground" />
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" className="text-foreground" />
                  </svg>
                ) : msg.role === 'system' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5" className="text-accent-foreground" />
                    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-accent-foreground" />
                  </svg>
                ) : (
                  <PicturaIcon size={18} />
                )}
              </div>

              {/* Message content */}
              <div className={`flex flex-col gap-2 max-w-[80%] sm:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : msg.role === 'system'
                      ? 'bg-accent/10 text-accent-foreground border border-accent/20 rounded-tl-sm'
                      : 'bg-card border border-border rounded-tl-sm shadow-sm'
                }`}>
                  {msg.isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-sm text-muted-foreground">{msg.content}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  )}
                </div>

                {/* Source image (user uploaded) */}
                {msg.sourceImageUrl && (
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-border">
                    <Image src={msg.sourceImageUrl} alt="Uploaded source" fill className="object-cover" />
                  </div>
                )}

                {/* Generated image */}
                {msg.imageUrl && (
                  <button
                    onClick={() => setLightboxUrl(msg.imageUrl!)}
                    className="group relative w-72 sm:w-80 aspect-square rounded-2xl overflow-hidden border-2 border-border hover:border-primary/40 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Image src={msg.imageUrl} alt={msg.content} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <PicturaWatermark className="absolute bottom-2 right-2" />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-all flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-card/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium text-foreground border border-border shadow">
                        View full size
                      </span>
                    </div>
                  </button>
                )}

                <span className="text-[10px] text-muted-foreground font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="shrink-0 border-t border-border bg-card/80 backdrop-blur-xl px-4 sm:px-6 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {/* Upload preview */}
          {uploadPreview && (
            <div className="mb-3 flex items-center gap-3 p-2 bg-secondary/50 rounded-xl border border-border">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                <Image src={uploadPreview} alt="Upload preview" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{uploadedFile?.name}</p>
                <p className="text-[10px] text-muted-foreground">Image will be transformed with your prompt</p>
              </div>
              <button
                type="button"
                onClick={removeUpload}
                className="shrink-0 w-7 h-7 rounded-lg bg-secondary hover:bg-destructive/10 flex items-center justify-center transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted-foreground" />
                </svg>
              </button>
            </div>
          )}

          <div className="flex items-end gap-2 bg-secondary/40 rounded-2xl border border-border p-2 focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
            {/* Upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 w-10 h-10 rounded-xl bg-secondary/80 hover:bg-secondary flex items-center justify-center transition-colors"
              title="Upload an image to transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" />
                <path d="m17 8-5-5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground" />
                <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload image"
            />

            {/* Text input */}
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={uploadedFile ? 'Describe how to transform this image...' : 'Describe the image you want to create...'}
              rows={1}
              className="flex-1 bg-transparent resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none py-2.5 px-2 max-h-32 leading-relaxed"
              disabled={isGenerating}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={isGenerating || (!input.trim() && !uploadedFile)}
              className="shrink-0 w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 disabled:bg-secondary disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-sm"
            >
              {isGenerating ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="text-primary-foreground/30" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-primary-foreground" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
                  <path d="m22 2-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
                </svg>
              )}
            </button>
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-2 font-mono tracking-wide">
            PICTURA BETA / {rateLimitInfo.remaining} GENERATIONS LEFT TODAY / IMOOGLE LABS
          </p>
        </form>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 backdrop-blur-sm p-4"
          onClick={() => setLightboxUrl(null)}
          role="dialog"
          aria-label="Image lightbox"
        >
          <div className="relative max-w-3xl w-full aspect-square rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <Image src={lightboxUrl} alt="Generated image" fill className="object-contain bg-card" />
            <PicturaWatermark className="absolute bottom-3 right-3" />
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-card/90 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-card transition-colors shadow"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-foreground" />
              </svg>
            </button>
            <a
              href={lightboxUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-sm border border-border text-xs font-medium text-foreground hover:bg-card transition-colors shadow"
              onClick={e => e.stopPropagation()}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m7 10 5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Download
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
