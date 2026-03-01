'use client'

import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

// Original SVG content for downloads
const logoIconSvg = `<svg width="512" height="512" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

const logoFullSvg = `<svg width="400" height="100" viewBox="0 0 400 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="10" y="18" width="64" height="64" rx="16" fill="url(#pictura-bg-full)"/>
  <path d="M32 64V36h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C48.3 58.8 45.5 60 42 60h-4" stroke="url(#pictura-stroke-full)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="54" cy="38" r="3" fill="url(#pictura-accent-full)"/>
  <text x="90" y="62" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="700" fill="#1a1a1a">Pictura</text>
  <defs>
    <linearGradient id="pictura-bg-full" x1="10" y1="18" x2="74" y2="82">
      <stop stop-color="#C87941"/>
      <stop offset="1" stop-color="#A0522D"/>
    </linearGradient>
    <linearGradient id="pictura-stroke-full" x1="32" y1="36" x2="54" y2="64">
      <stop stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="#F5E6D3"/>
    </linearGradient>
    <linearGradient id="pictura-accent-full" x1="51" y1="35" x2="57" y2="41">
      <stop stop-color="#FFD700"/>
      <stop offset="1" stop-color="#FFA500"/>
    </linearGradient>
  </defs>
</svg>`

const logoIconOnlySvg = `<svg width="512" height="512" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4" stroke="#C87941" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  <circle cx="44" cy="20" r="3" fill="#FFD700"/>
</svg>`

export function BrandAssets() {
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
  }

  const handleDownloadPng = (svgContent: string, filename: string, width: number, height: number) => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
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
      }, 'image/png')
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-32 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Brand</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground">Brand Assets</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Download official Pictura logos and brand assets for press, social media, and marketing use.
            </p>
          </motion.div>

          {/* Logo Icon */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="rounded-xl border border-border/50 bg-card/40 overflow-hidden"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center p-12">
                <PicturaIcon size={120} />
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-1">Logo Icon</h3>
                <p className="text-xs text-muted-foreground mb-4">Square logo for profile pictures and app icons</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadSvg(logoIconSvg, 'pictura-logo.svg')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    SVG
                  </button>
                  <button
                    onClick={() => handleDownloadPng(logoIconSvg, 'pictura-logo.png', 512, 512)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-primary text-primary font-medium text-sm transition-all hover:bg-primary/5"
                  >
                    <Download className="w-4 h-4" />
                    PNG
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Full Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl border border-border/50 bg-card/40 overflow-hidden"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center p-8">
                <div className="flex items-center gap-3">
                  <PicturaIcon size={64} />
                  <span className="text-3xl font-bold text-foreground">Pictura</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-1">Full Logo</h3>
                <p className="text-xs text-muted-foreground mb-4">Logo with wordmark for headers and banners</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadSvg(logoFullSvg, 'pictura-logo-full.svg')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    SVG
                  </button>
                  <button
                    onClick={() => handleDownloadPng(logoFullSvg, 'pictura-logo-full.png', 800, 200)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-primary text-primary font-medium text-sm transition-all hover:bg-primary/5"
                  >
                    <Download className="w-4 h-4" />
                    PNG
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Icon Only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl border border-border/50 bg-card/40 overflow-hidden"
            >
              <div className="aspect-square bg-muted/30 flex items-center justify-center p-12">
                <svg width="120" height="120" viewBox="0 0 64 64" fill="none">
                  <path d="M22 46V18h10c3.5 0 6.3 1.2 8.4 3.5 2.1 2.3 3.1 5.2 3.1 8.5s-1 6.2-3.1 8.5C38.3 40.8 35.5 42 32 42h-4" stroke="#C87941" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <circle cx="44" cy="20" r="3" fill="#FFD700"/>
                </svg>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-foreground mb-1">Icon Only</h3>
                <p className="text-xs text-muted-foreground mb-4">Minimal mark without background</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadSvg(logoIconOnlySvg, 'pictura-icon.svg')}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    SVG
                  </button>
                  <button
                    onClick={() => handleDownloadPng(logoIconOnlySvg, 'pictura-icon.png', 512, 512)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border border-primary text-primary font-medium text-sm transition-all hover:bg-primary/5"
                  >
                    <Download className="w-4 h-4" />
                    PNG
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Brand Colors */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="p-8 rounded-xl border border-border/50 bg-card/40"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Brand Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 rounded-lg bg-[#C87941] mb-2" />
                <p className="text-sm font-medium text-foreground">Primary</p>
                <p className="text-xs text-muted-foreground font-mono">#C87941</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-[#FFD700] mb-2" />
                <p className="text-sm font-medium text-foreground">Accent</p>
                <p className="text-xs text-muted-foreground font-mono">#FFD700</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-[#1a1a1a] mb-2" />
                <p className="text-sm font-medium text-foreground">Foreground</p>
                <p className="text-xs text-muted-foreground font-mono">#1A1A1A</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-[#faf8f5] border border-border mb-2" />
                <p className="text-sm font-medium text-foreground">Background</p>
                <p className="text-xs text-muted-foreground font-mono">#FAF8F5</p>
              </div>
            </div>
          </motion.div>

          {/* Usage Guidelines */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 p-8 rounded-xl border border-border/50 bg-card/40"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Usage Guidelines</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Do not modify or distort the logo</li>
              <li>Maintain adequate spacing around the logo</li>
              <li>Use the provided colors for consistency</li>
              <li>Do not use the logo in a way that suggests partnership without permission</li>
              <li>For press inquiries, contact info@picturaai.sbs</li>
            </ul>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
