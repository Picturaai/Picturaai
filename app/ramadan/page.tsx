
'use client'

import { RamadanGenerator } from '@/components/pictura/ramadan-generator'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Download, Zap, Edit3 } from 'lucide-react'

export default function RamadanPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-16 md:py-24 px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="inline-block rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
                NEW FEATURE
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
                Create <span className="text-primary">Ramadan Cards</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Design beautiful greeting cards with AI-powered content. Choose templates, customize your message, and share with loved ones instantly.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-16 md:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Edit3, title: 'Clean Templates', desc: 'Beautiful, minimal card designs' },
                { icon: Zap, title: 'AI Content', desc: 'Generate verses and wishes instantly' },
                { icon: Download, title: 'One-Click Download', desc: 'Share on social media instantly' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-lg border border-border bg-card text-center"
                >
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Generator */}
        <section className="px-6 py-16 md:py-24 border-t border-border">
          <div className="mx-auto max-w-6xl">
            <RamadanGenerator />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
