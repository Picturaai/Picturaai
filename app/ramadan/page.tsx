
'use client'

import { RamadanGenerator } from '@/components/pictura/ramadan-generator'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Heart, Gift, Share2, Zap } from 'lucide-react'

export default function RamadanPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,var(--primary)/0.1,transparent_70%)]" />
            <motion.div
              className="absolute top-1/4 right-1/4 h-96 w-96 rounded-full opacity-20"
              style={{ background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', filter: 'blur(100px)' }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          <div className="mx-auto max-w-5xl px-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-medium text-primary mb-8"
            >
              <Zap className="w-4 h-4" />
              New Feature
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-foreground mb-6"
            >
              Create Beautiful
              <br />
              <span className="bg-gradient-to-r from-primary via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Ramadan Cards
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-8 max-w-2xl"
            >
              Design personalized Ramadan greeting cards with stunning templates. Add Quran verses, Hadith, or heartfelt messages powered by advanced AI. Share blessings with your loved ones instantly.
            </motion.p>
          </div>
        </section>

        {/* Main Generator */}
        <section className="relative px-6 py-12 md:py-20">
          <div className="mx-auto max-w-7xl">
            <RamadanGenerator />
          </div>
        </section>

        {/* Features Section */}
        <section className="relative border-t border-border/50 px-6 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Pictura for Ramadan Cards</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need to share blessings and spread joy during the holy month
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  icon: Heart,
                  title: 'Stunning Templates',
                  desc: 'Hand-crafted card designs with elegant gradients and refined aesthetics that match Pictura\'s premium quality',
                },
                {
                  icon: Zap,
                  title: 'AI-Powered Content',
                  desc: 'Generate authentic Quran verses, Hadith, and duas instantly with Mistral\'s advanced AI model',
                },
                {
                  icon: Gift,
                  title: 'Full Customization',
                  desc: 'Personalize every detail - titles, messages, sender and recipient names for a truly unique card',
                },
                {
                  icon: Share2,
                  title: 'Easy Sharing',
                  desc: 'Download as high-resolution PNG and share directly on social media or via messaging apps',
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group p-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 hover:bg-card/60 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
