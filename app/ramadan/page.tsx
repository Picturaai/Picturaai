'use client'

import { RamadanGenerator } from '@/components/pictura/ramadan-generator'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'

export default function RamadanPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Header with gradient background */}
        <div className="relative overflow-hidden py-16 md:py-24">
          {/* Animated background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,var(--primary)/0.08,transparent_70%)]" />
            <motion.div
              className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', filter: 'blur(80px)' }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
                ✨ New Feature
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 text-center"
            >
              Ramadan Card <span className="text-primary">Generator</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-8"
            >
              Create beautiful, personalized Ramadan greeting cards with AI-powered Islamic verses, Hadith, and duas. Share the blessing with your loved ones.
            </motion.p>
          </div>
        </div>

        {/* Main Generator */}
        <div className="relative px-6 py-12 md:py-20">
          <div className="mx-auto max-w-7xl">
            <RamadanGenerator />
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-border/50 px-6 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold text-foreground mb-2">World-Class Design</h3>
                <p className="text-sm text-muted-foreground">Hand-crafted templates with Islamic geometric patterns, crescents, lanterns, and elegant Islamic art elements</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <h3 className="font-semibold text-foreground mb-2">AI-Powered Content</h3>
                <p className="text-sm text-muted-foreground">Generate authentic Quran verses, Hadith, and Islamic duas using Mistral's most advanced AI model</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📱</div>
                <h3 className="font-semibold text-foreground mb-2">Share & Download</h3>
                <p className="text-sm text-muted-foreground">Download as high-resolution PNG with Pictura watermark and share on social media instantly</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
