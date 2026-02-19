'use client'

import { useState, useEffect, useCallback, useId } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TextToImageForm } from './text-to-image-form'
import { ImageToImageForm } from './image-to-image-form'
import { ImageGallery } from './image-gallery'
import { UsageIndicator } from './usage-indicator'
import { BetaBanner } from './beta-banner'
import type { GeneratedImage, RateLimitInfo } from '@/lib/types'

export function Generator() {
  const tabsId = useId()
  const [mounted, setMounted] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo>({
    limit: 5,
    remaining: 5,
    used: 0,
    resetAt: '',
  })

  const fetchRateLimit = useCallback(async () => {
    try {
      const res = await fetch('/api/rate-limit')
      if (res.ok) {
        const data = await res.json()
        setRateLimitInfo(data)
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    fetchRateLimit()
  }, [fetchRateLimit])

  function handleGenerated(image: GeneratedImage) {
    setImages((prev) => [image, ...prev])
  }

  function handleRateLimitUpdate(info: RateLimitInfo) {
    setRateLimitInfo(info)
  }

  const isAtLimit = rateLimitInfo.remaining <= 0

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
        {/* Left panel - Controls */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <BetaBanner />
          <UsageIndicator used={rateLimitInfo.used} limit={rateLimitInfo.limit} />

          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            {!mounted ? (
              <div className="flex flex-col gap-4 animate-pulse">
                <div className="h-9 bg-secondary rounded-lg" />
                <div className="h-32 bg-secondary/50 rounded-lg" />
                <div className="h-10 bg-secondary rounded-lg" />
              </div>
            ) : (
            <Tabs defaultValue="text-to-image" className="w-full" key={tabsId}>
              <TabsList className="w-full bg-secondary">
                <TabsTrigger
                  value="text-to-image"
                  className="flex-1 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mr-1.5">
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Text to Image
                </TabsTrigger>
                <TabsTrigger
                  value="image-to-image"
                  className="flex-1 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mr-1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Image to Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text-to-image" className="mt-5">
                <TextToImageForm
                  onGenerated={handleGenerated}
                  onRateLimitUpdate={handleRateLimitUpdate}
                  disabled={isAtLimit}
                />
              </TabsContent>
              <TabsContent value="image-to-image" className="mt-5">
                <ImageToImageForm
                  onGenerated={handleGenerated}
                  onRateLimitUpdate={handleRateLimitUpdate}
                  disabled={isAtLimit}
                />
              </TabsContent>
            </Tabs>
            )}
          </div>

          {/* Model info */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="text-primary">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span className="font-medium">About Pictura</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pictura is an experimental AI image generation model by Imoogle.
                Powered by advanced neural networks, it creates high-quality images
                from text descriptions and transforms existing images. Currently in
                beta with limited daily usage.
              </p>
              <div className="flex flex-wrap gap-2 mt-1">
                {['Neural Networks', 'Diffusion Model', 'Beta v0.1'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-muted-foreground border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Gallery */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">
                  Generated Images
                </h2>
                {images.length > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {images.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                This session
              </span>
            </div>
            <div className="p-3">
              <ImageGallery images={images} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
