'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code2, Terminal, Webhook, Lock } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
}

const endpoints = [
  { method: 'POST', path: '/v1/images/generate', description: 'Generate an image from a text prompt' },
  { method: 'POST', path: '/v1/images/transform', description: 'Transform an existing image with a prompt' },
  { method: 'GET', path: '/v1/images/{id}', description: 'Retrieve a previously generated image' },
  { method: 'GET', path: '/v1/usage', description: 'Check your current usage and rate limits' },
]

const features = [
  { icon: Terminal, title: 'RESTful API', description: 'Simple REST endpoints with JSON responses. Integrate with any language in minutes.' },
  { icon: Code2, title: 'Official SDKs', description: 'Client libraries for Python, Node.js, and more coming at launch.' },
  { icon: Webhook, title: 'Webhooks', description: 'Get notified asynchronously when image generation completes.' },
  { icon: Lock, title: 'API Keys', description: 'Secure authentication with scoped API keys and built-in rate limiting.' },
]

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          {/* Header */}
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Code2 className="h-6 w-6 text-primary" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pictura API</h1>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Coming Soon
            </div>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Integrate AI image generation directly into your applications.
              The same capabilities available in the Studio, via simple REST endpoints.
            </p>
          </motion.div>
        </div>

        <div className="mx-auto max-w-3xl px-6">
          {/* CTA Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center"
          >
            <PicturaIcon size={36} className="mx-auto" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">API Access Coming Soon</h2>
            <p className="mt-2 mx-auto max-w-md text-sm text-muted-foreground">
              We are actively building the Pictura API. It will be free during beta
              with generous rate limits for developers.
            </p>
            <Link
              href="/studio"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Try the Studio
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Endpoints Preview */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={2} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">Planned Endpoints</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Preview of the API surface we are building.</p>
            <div className="mt-6 flex flex-col gap-2.5">
              {endpoints.map((ep) => (
                <div key={ep.path} className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-5 py-4">
                  <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider ${
                    ep.method === 'POST'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-accent/10 text-accent-foreground'
                  }`}>
                    {ep.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground">{ep.path}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ep.description}</p>
                  </div>
                  <span className="hidden flex-shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
                    Planned
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">What to Expect</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-primary/20">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-3.5 text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Code Preview */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">Quick Start Preview</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">A glimpse of how simple the API will be.</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/50" style={{ background: 'oklch(0.22 0.02 50)' }}>
              {/* Tab bar */}
              <div className="flex items-center border-b border-white/5 px-4 py-2.5">
                <div className="flex items-center gap-1.5 mr-4">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'oklch(0.62 0.14 45 / 0.4)' }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'oklch(0.62 0.14 45 / 0.25)' }} />
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: 'oklch(0.62 0.14 45 / 0.15)' }} />
                </div>
                <span className="font-mono text-[11px]" style={{ color: 'oklch(0.62 0.14 45 / 0.6)' }}>generate.py</span>
              </div>
              {/* Code */}
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
                <code>
                  <span style={{ color: 'oklch(0.72 0.1 55)' }}>import</span>{' '}
                  <span style={{ color: 'oklch(0.85 0.06 75)' }}>pictura</span>{'\n\n'}
                  <span style={{ color: 'oklch(0.5 0.02 50)' }}>{'# Initialize the client'}</span>{'\n'}
                  <span style={{ color: 'oklch(0.88 0.02 75)' }}>client</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}> = </span>
                  <span style={{ color: 'oklch(0.85 0.06 75)' }}>pictura</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>.</span>
                  <span style={{ color: 'oklch(0.72 0.1 55)' }}>Client</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>(</span>
                  <span style={{ color: 'oklch(0.75 0.08 55)' }}>api_key</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>=</span>
                  <span style={{ color: 'oklch(0.62 0.14 45)' }}>{'"pk_..."'}</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>)</span>{'\n\n'}
                  <span style={{ color: 'oklch(0.5 0.02 50)' }}>{'# Generate an image'}</span>{'\n'}
                  <span style={{ color: 'oklch(0.88 0.02 75)' }}>image</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}> = </span>
                  <span style={{ color: 'oklch(0.88 0.02 75)' }}>client</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>.</span>
                  <span style={{ color: 'oklch(0.72 0.1 55)' }}>generate</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>(</span>{'\n'}
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>{'    '}</span>
                  <span style={{ color: 'oklch(0.75 0.08 55)' }}>prompt</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>=</span>
                  <span style={{ color: 'oklch(0.62 0.14 45)' }}>{'"A serene mountain lake at golden hour"'}</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>,</span>{'\n'}
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>{'    '}</span>
                  <span style={{ color: 'oklch(0.75 0.08 55)' }}>size</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>=</span>
                  <span style={{ color: 'oklch(0.62 0.14 45)' }}>{'"1024x1024"'}</span>{'\n'}
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>)</span>{'\n\n'}
                  <span style={{ color: 'oklch(0.88 0.02 75)' }}>image</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>.</span>
                  <span style={{ color: 'oklch(0.72 0.1 55)' }}>save</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>(</span>
                  <span style={{ color: 'oklch(0.62 0.14 45)' }}>{'"output.png"'}</span>
                  <span style={{ color: 'oklch(0.6 0.02 50)' }}>)</span>
                </code>
              </pre>
            </div>
          </motion.div>

          {/* Architecture Wire Diagram */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">API Architecture</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">How requests flow through the Pictura system.</p>
            <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
              {/* Vertical wire flow */}
              <div className="relative mx-auto max-w-md">
                {/* Continuous vertical wire */}
                <div className="absolute left-5 top-5 bottom-5 w-px bg-primary/15" aria-hidden="true" />

                <div className="flex flex-col gap-0">
                  {[
                    { icon: Code2, label: 'Your Application', sub: 'REST API call with auth header' },
                    { icon: Lock, label: 'Auth & Rate Limit', sub: 'API key validation & quota check' },
                    { icon: Terminal, label: 'Prompt Processing', sub: 'NLP enhancement & safety filtering' },
                    { icon: Webhook, label: 'Model Router', sub: 'Style-optimized model selection' },
                    { icon: Code2, label: 'Generation Engine', sub: 'Multi-pass diffusion pipeline' },
                    { icon: Terminal, label: 'CDN Delivery', sub: 'Global edge response' },
                  ].map((step, i, arr) => (
                    <div key={step.label}>
                      <div className="relative flex items-center gap-4">
                        {/* Node dot on wire */}
                        <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm">
                          <step.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.label}</p>
                          <p className="text-[11px] text-muted-foreground">{step.sub}</p>
                        </div>
                      </div>
                      {/* Wire segment with arrow */}
                      {i < arr.length - 1 && (
                        <div className="ml-5 flex flex-col items-center py-0.5" aria-hidden="true">
                          <div className="h-5 w-px bg-primary/20" />
                          <svg width="6" height="4" viewBox="0 0 6 4" className="text-primary/30"><path d="M3 4L0 0h6z" fill="currentColor" /></svg>
                          <div className="h-1 w-px bg-primary/20" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
