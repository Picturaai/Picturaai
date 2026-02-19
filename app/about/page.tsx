'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, Check, Circle, Users, Lightbulb, Globe, Cpu, Shield,
} from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const roadmap = [
  { label: 'Pictura Beta Launch', status: 'Live' as const },
  { label: 'Text-to-Image Generation', status: 'Live' as const },
  { label: 'Image-to-Image Transformation', status: 'Live' as const },
  { label: 'Higher Resolution Outputs', status: 'In Progress' as const },
  { label: 'Increased Daily Limits', status: 'In Progress' as const },
  { label: 'Pictura Public API', status: 'Coming Soon' as const },
  { label: 'Developer SDKs', status: 'Planned' as const },
]

const values = [
  { icon: Globe, title: 'Accessibility', description: 'AI creativity should be free and open to everyone, regardless of location or resources.' },
  { icon: Users, title: 'Community', description: 'We build in public and value feedback from every user who touches Pictura.' },
  { icon: Lightbulb, title: 'Innovation', description: 'We push boundaries from Nigeria, proving world-class AI can come from anywhere.' },
]

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        {/* Header */}
        <section className="mx-auto max-w-3xl px-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="flex items-center gap-3">
              <PicturaIcon size={44} />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">About Imoogle</h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Non-profit AI Research &middot; Nigeria
                </p>
              </div>
            </div>
          </motion.div>

          <div className="my-10 h-px bg-border/50" />

          {/* Company */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mb-14">
            <h2 className="text-lg font-semibold text-foreground">Who We Are</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Imoogle Technology is a non-profit Nigerian artificial intelligence company.
                Through our research division, <strong className="text-foreground">Imoogle Labs</strong>, we build
                AI-powered creative tools for Africa and the world.
              </p>
              <p>
                We believe powerful AI should not be exclusive to a few companies in Silicon Valley.
                Africa has incredible talent, creativity, and ambition&mdash;and Imoogle exists to channel
                that energy into world-class products.
              </p>
            </div>
          </motion.section>

          {/* Pictura */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mb-14">
            <h2 className="text-lg font-semibold text-foreground">About Pictura</h2>
            <div className="mt-4 flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Pictura is the <strong className="text-foreground">Imoogle Picture Model</strong>&mdash;an AI image
                generation system that creates images from text descriptions and transforms existing images based on prompts.
              </p>
              <p>
                Pictura is in <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">Beta</span>.
                During this period, the model is completely free with a limit of 5 generations per day per user.
                No sign-up required.
              </p>
            </div>
          </motion.section>

          {/* Architecture */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-14">
            <h2 className="text-lg font-semibold text-foreground">Technical Architecture</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                { icon: Cpu, title: 'Multi-Model Pipeline', description: 'Pictura chains specialized models in a pipeline, routing prompts to style-optimized models for the best results.' },
                { icon: Shield, title: 'Safety Layer', description: 'Every generation passes through content moderation and safety filtering before delivery.' },
                { icon: Globe, title: 'Edge Delivery', description: 'Generated images are served via a global CDN for instant access anywhere in the world.' },
                { icon: Lightbulb, title: 'Prompt Intelligence', description: 'NLP-powered prompt analysis enhances your descriptions for better visual output quality.' },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-border/50 bg-card p-5">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Nigeria */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mb-14">
            <div className="rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-4 w-6 overflow-hidden rounded-sm" aria-label="Nigerian flag">
                  <span className="w-1/3 bg-[#008751]" />
                  <span className="w-1/3 bg-[#FFFFFF] border-y border-border/30" />
                  <span className="w-1/3 bg-[#008751]" />
                </span>
                <h2 className="text-lg font-semibold text-foreground">Built in Nigeria</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Nigeria is our home and Africa is our launchpad. We are committed to demonstrating that
                world-class AI innovation can come from anywhere. We are proudly Nigerian, and we are just getting started.
              </p>
            </div>
          </motion.section>

          {/* Values */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mb-14">
            <h2 className="text-lg font-semibold text-foreground">Our Values</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border border-border/50 bg-card p-5">
                  <v.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{v.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{v.description}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Roadmap */}
          <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mb-14">
            <h2 className="text-lg font-semibold text-foreground">Roadmap</h2>
            <div className="mt-5 flex flex-col gap-2.5">
              {roadmap.map((item) => {
                const isLive = item.status === 'Live'
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      {isLive ? (
                        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center">
                          <Circle className="h-2 w-2 text-border" />
                        </div>
                      )}
                      <span className="text-sm text-foreground">{item.label}</span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                        item.status === 'Live'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : item.status === 'In Progress'
                            ? 'bg-amber-500/10 text-amber-600'
                            : item.status === 'Coming Soon'
                              ? 'bg-blue-500/10 text-blue-600'
                              : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6} variants={fadeUp} className="text-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Try Pictura Studio
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>
      </main>
      <Footer />
    </>
  )
}
