'use client'

import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import Image from 'next/image'

const assets = [
  {
    name: 'Logo Icon',
    description: 'Square logo for profile pictures and app icons',
    file: '/pictura-logo.jpg',
    size: '512x512',
  },
  {
    name: 'Full Logo',
    description: 'Horizontal wordmark logo for banners and headers',
    file: '/pictura-logo-full.jpg',
    size: '1200x400',
  },
  {
    name: 'Social Preview',
    description: 'Open Graph image for social media sharing',
    file: '/og-image.jpg',
    size: '1200x630',
  },
]

export function BrandAssets() {
  const handleDownload = (file: string, name: string) => {
    const link = document.createElement('a')
    link.href = file
    link.download = `pictura-${name.toLowerCase().replace(/\s+/g, '-')}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {assets.map((asset, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-xl border border-border/50 bg-card/40 overflow-hidden hover:border-primary/30 transition-all"
              >
                <div className="relative aspect-square bg-muted/30 flex items-center justify-center p-8">
                  <Image
                    src={asset.file}
                    alt={asset.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-foreground mb-1">{asset.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{asset.description}</p>
                  <p className="text-xs text-muted-foreground/60 mb-4">{asset.size}</p>
                  <button
                    onClick={() => handleDownload(asset.file, asset.name)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-16 p-8 rounded-xl border border-border/50 bg-card/40"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Brand Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="h-20 rounded-lg bg-primary mb-2" />
                <p className="text-sm font-medium text-foreground">Primary</p>
                <p className="text-xs text-muted-foreground">#c87941</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Foreground</p>
                <p className="text-xs text-muted-foreground">#1a1a1a</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-background border border-border mb-2" />
                <p className="text-sm font-medium text-foreground">Background</p>
                <p className="text-xs text-muted-foreground">#faf8f5</p>
              </div>
              <div>
                <div className="h-20 rounded-lg bg-muted mb-2" />
                <p className="text-sm font-medium text-foreground">Muted</p>
                <p className="text-xs text-muted-foreground">#f0ebe4</p>
              </div>
            </div>
          </motion.div>

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
