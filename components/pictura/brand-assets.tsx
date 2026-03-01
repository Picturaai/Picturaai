'use client'

import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Download, Check } from 'lucide-react'
import { PicturaIcon } from './pictura-logo'
import { useState } from 'react'

// High-resolution SVG - scales to any size
const createLogoSvg = (size: number) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="64" height="64" rx="16" fill="url(#pictura-bg)"/>
  <path d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4" stroke="url(#pictura-stroke)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="44" cy="20" r="3" fill="url(#pictura-accent)"/>
  <defs>
    <linearGradient id="pictura-bg" x1="0" y1="0" x2="64" y2="64">
      <stop stop-color="#C87941"/>
      <stop offset="1" stop-color="#A0522D"/>
    </linearGradient>
    <linearGradient id="pictura-stroke" x1="22" y1="18" x2="44" y2="46">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F5E6D3"/>
    </linearGradient>
    <linearGradient id="pictura-accent" x1="41" y1="17" x2="47" y2="23">
      <stop stop-color="#FFD700"/>
      <stop offset="1" stop-color="#FFA500"/>
    </linearGradient>
  </defs>
</svg>`

// Full logo with wordmark
const createFullLogoSvg = (width: number, height: number) => `<svg width="${width}" height="${height}" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="8" y="8" width="64" height="64" rx="16" fill="url(#pictura-bg-full)"/>
  <path d="M30 54V26h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C46.3 48.8 43.5 50 40 50h-4" stroke="url(#pictura-stroke-full)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="52" cy="28" r="3" fill="url(#pictura-accent-full)"/>
  <text x="88" y="52" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="36" font-weight="700" fill="#1a1a1a">Pictura</text>
  <defs>
    <linearGradient id="pictura-bg-full" x1="8" y1="8" x2="72" y2="72">
      <stop stop-color="#C87941"/>
      <stop offset="1" stop-color="#A0522D"/>
    </linearGradient>
    <linearGradient id="pictura-stroke-full" x1="30" y1="26" x2="52" y2="54">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F5E6D3"/>
    </linearGradient>
    <linearGradient id="pictura-accent-full" x1="49" y1="25" x2="55" y2="31">
      <stop stop-color="#FFD700"/>
      <stop offset="1" stop-color="#FFA500"/>
    </linearGradient>
  </defs>
</svg>`

// Icon only (no background)
const createIconOnlySvg = (size: number) => `<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4" stroke="#C87941" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="44" cy="20" r="3" fill="#FFD700"/>
</svg>`

// Social media background templates
const createSocialBgSvg = (width: number, height: number, variant: 'dark' | 'light' | 'gradient') => {
  const bgColor = variant === 'dark' ? '#1a1a1a' : variant === 'light' ? '#FAF8F5' : '#1a1a1a'
  const textColor = variant === 'dark' || variant === 'gradient' ? '#FFFFFF' : '#1a1a1a'
  
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  ${variant === 'gradient' ? `
  <defs>
    <radialGradient id="glow1" cx="30%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#C87941" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="glow2" cx="70%" cy="70%" r="40%">
      <stop offset="0%" stop-color="#C87941" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#glow1)"/>
  <rect width="${width}" height="${height}" fill="url(#glow2)"/>
  ` : ''}
  <g transform="translate(${width/2 - 32}, ${height/2 - 60})">
    <rect width="64" height="64" rx="16" fill="url(#pictura-bg-social)"/>
    <path d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4" stroke="url(#pictura-stroke-social)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="44" cy="20" r="3" fill="url(#pictura-accent-social)"/>
  </g>
  <text x="${width/2}" y="${height/2 + 50}" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="32" font-weight="700" fill="${textColor}" text-anchor="middle">Pictura</text>
  <text x="${width/2}" y="${height/2 + 80}" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="${variant === 'light' ? '#666' : '#999'}" text-anchor="middle">AI Image Generation</text>
  <defs>
    <linearGradient id="pictura-bg-social" x1="0" y1="0" x2="64" y2="64">
      <stop stop-color="#C87941"/>
      <stop offset="1" stop-color="#A0522D"/>
    </linearGradient>
    <linearGradient id="pictura-stroke-social" x1="22" y1="18" x2="44" y2="46">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F5E6D3"/>
    </linearGradient>
    <linearGradient id="pictura-accent-social" x1="41" y1="17" x2="47" y2="23">
      <stop stop-color="#FFD700"/>
      <stop offset="1" stop-color="#FFA500"/>
    </linearGradient>
  </defs>
</svg>`
}

// Social media sizes
const socialSizes = {
  'Instagram Post': { width: 1080, height: 1080 },
  'Instagram Story': { width: 1080, height: 1920 },
  'Facebook Cover': { width: 1640, height: 624 },
  'Twitter Header': { width: 1500, height: 500 },
  'LinkedIn Banner': { width: 1584, height: 396 },
  'YouTube Thumbnail': { width: 1280, height: 720 },
}

export function BrandAssets() {
  const [downloadedItem, setDownloadedItem] = useState<string | null>(null)

  const handleDownloadSvg = (svgContent: string, filename: string) => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setDownloadedItem(filename)
    setTimeout(() => setDownloadedItem(null), 2000)
  }

  const handleDownloadPng = (svgContent: string, filename: string, width: number, height: number) => {
    const canvas = document.createElement('canvas')
    // Use higher resolution for crisp output
    const scale = 2
    canvas.width = width * scale
    canvas.height = height * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = pngUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(pngUrl)
        }
      }, 'image/png', 1.0)
      URL.revokeObjectURL(url)
    }
    img.src = url
    setDownloadedItem(filename)
    setTimeout(() => setDownloadedItem(null), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Brand</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground">Brand Assets</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Download official Pictura logos and assets for social media, marketing, and press use. All assets are high-resolution and ready for any platform.
            </p>
          </motion.div>

          {/* Logo Downloads */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Logos</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Logo Icon */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-muted/20 flex items-center justify-center p-12">
                  <PicturaIcon size={140} />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Logo Icon</h3>
                  <p className="text-xs text-muted-foreground mb-4">Perfect for profile pictures and app icons. Available in multiple sizes.</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadSvg(createLogoSvg(512), 'pictura-logo.svg')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                      >
                        {downloadedItem === 'pictura-logo.svg' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        SVG
                      </button>
                      <button
                        onClick={() => handleDownloadPng(createLogoSvg(1024), 'pictura-logo-1024.png', 1024, 1024)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-primary text-primary font-medium text-sm transition-all hover:bg-primary/5"
                      >
                        {downloadedItem === 'pictura-logo-1024.png' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        PNG 1024px
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadPng(createLogoSvg(512), 'pictura-logo-512.png', 512, 512)}
                        className="flex-1 py-2 rounded-lg border border-border text-muted-foreground font-medium text-xs transition-all hover:border-primary hover:text-primary"
                      >
                        512px
                      </button>
                      <button
                        onClick={() => handleDownloadPng(createLogoSvg(256), 'pictura-logo-256.png', 256, 256)}
                        className="flex-1 py-2 rounded-lg border border-border text-muted-foreground font-medium text-xs transition-all hover:border-primary hover:text-primary"
                      >
                        256px
                      </button>
                      <button
                        onClick={() => handleDownloadPng(createLogoSvg(128), 'pictura-logo-128.png', 128, 128)}
                        className="flex-1 py-2 rounded-lg border border-border text-muted-foreground font-medium text-xs transition-all hover:border-primary hover:text-primary"
                      >
                        128px
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Logo */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-muted/20 flex items-center justify-center p-8">
                  <div className="flex items-center gap-3">
                    <PicturaIcon size={72} />
                    <span className="text-4xl font-bold text-foreground">Pictura</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Full Logo</h3>
                  <p className="text-xs text-muted-foreground mb-4">Logo with wordmark for headers, banners, and marketing materials.</p>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownloadSvg(createFullLogoSvg(640, 160), 'pictura-logo-full.svg')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                      >
                        {downloadedItem === 'pictura-logo-full.svg' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        SVG
                      </button>
                      <button
                        onClick={() => handleDownloadPng(createFullLogoSvg(1280, 320), 'pictura-logo-full.png', 1280, 320)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-primary text-primary font-medium text-sm transition-all hover:bg-primary/5"
                      >
                        {downloadedItem === 'pictura-logo-full.png' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                        PNG HD
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Icon Only */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="aspect-square bg-muted/20 flex items-center justify-center p-12">
                  <svg width="140" height="140" viewBox="0 0 64 64" fill="none">
                    <path d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4" stroke="#C87941" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                    <circle cx="44" cy="20" r="3" fill="#FFD700"/>
                  </svg>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground mb-1">Icon Mark</h3>
                  <p className="text-xs text-muted-foreground mb-4">Minimal mark without background for versatile use.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadSvg(createIconOnlySvg(512), 'pictura-icon.svg')}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                    >
                      {downloadedItem === 'pictura-icon.svg' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      SVG
                    </button>
                    <button
                      onClick={() => handleDownloadPng(createIconOnlySvg(1024), 'pictura-icon.png', 1024, 1024)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-primary text-primary font-medium text-sm transition-all hover:bg-primary/5"
                    >
                      {downloadedItem === 'pictura-icon.png' ? <Check className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                      PNG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Social Media Backgrounds */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Social Media Backgrounds</h2>
            <p className="text-sm text-muted-foreground mb-6">Ready-to-use branded backgrounds for all major social platforms.</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(socialSizes).map(([name, { width, height }]) => (
                <div key={name} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-foreground text-sm">{name}</h3>
                      <p className="text-xs text-muted-foreground">{width} x {height}px</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadPng(createSocialBgSvg(width, height, 'dark'), `pictura-${name.toLowerCase().replace(/\s/g, '-')}-dark.png`, width, height)}
                      className="flex-1 py-2 rounded-lg bg-zinc-900 text-white font-medium text-xs transition-all hover:bg-zinc-800"
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => handleDownloadPng(createSocialBgSvg(width, height, 'light'), `pictura-${name.toLowerCase().replace(/\s/g, '-')}-light.png`, width, height)}
                      className="flex-1 py-2 rounded-lg bg-zinc-100 text-zinc-900 font-medium text-xs transition-all hover:bg-zinc-200"
                    >
                      Light
                    </button>
                    <button
                      onClick={() => handleDownloadPng(createSocialBgSvg(width, height, 'gradient'), `pictura-${name.toLowerCase().replace(/\s/g, '-')}-gradient.png`, width, height)}
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-primary/80 to-primary text-white font-medium text-xs transition-all hover:opacity-90"
                    >
                      Gradient
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Brand Colors */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">Brand Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-24 bg-[#C87941]" />
                <div className="p-4">
                  <p className="font-medium text-foreground">Primary</p>
                  <p className="text-sm text-muted-foreground font-mono">#C87941</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-24 bg-[#FFD700]" />
                <div className="p-4">
                  <p className="font-medium text-foreground">Accent</p>
                  <p className="text-sm text-muted-foreground font-mono">#FFD700</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-24 bg-[#1a1a1a]" />
                <div className="p-4">
                  <p className="font-medium text-foreground">Dark</p>
                  <p className="text-sm text-muted-foreground font-mono">#1A1A1A</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="h-24 bg-[#FAF8F5] border-b border-border" />
                <div className="p-4">
                  <p className="font-medium text-foreground">Light</p>
                  <p className="text-sm text-muted-foreground font-mono">#FAF8F5</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Guidelines */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-6 rounded-xl border border-border bg-card"
          >
            <h2 className="text-xl font-bold text-foreground mb-4">Usage Guidelines</h2>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground mb-2">Do</h3>
                <ul className="space-y-1.5">
                  <li>Use the logo with adequate spacing around it</li>
                  <li>Use official brand colors for consistency</li>
                  <li>Credit Pictura when using our assets</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2">Do Not</h3>
                <ul className="space-y-1.5">
                  <li>Modify, distort, or recolor the logo</li>
                  <li>Use the logo to imply partnership without permission</li>
                  <li>Use low-resolution or pixelated versions</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
              For press inquiries and partnership requests, contact <span className="text-primary">info@picturaai.sbs</span>
            </p>
          </motion.section>
        </div>
      </main>
      <Footer />
    </>
  )
}
