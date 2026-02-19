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
  {
    method: 'POST',
    path: '/v1/images/generate',
    description: 'Generate an image from a text prompt',
    status: 'Coming Soon',
  },
  {
    method: 'POST',
    path: '/v1/images/transform',
    description: 'Transform an existing image with a prompt',
    status: 'Coming Soon',
  },
  {
    method: 'GET',
    path: '/v1/images/{id}',
    description: 'Retrieve a previously generated image',
    status: 'Coming Soon',
  },
  {
    method: 'GET',
    path: '/v1/usage',
    description: 'Check your current usage and rate limits',
    status: 'Coming Soon',
  },
]

const features = [
  { icon: Terminal, title: 'RESTful API', description: 'Simple REST endpoints with JSON responses. Integrate in minutes.' },
  { icon: Code2, title: 'SDKs', description: 'Official client libraries for Python, Node.js, and more.' },
  { icon: Webhook, title: 'Webhooks', description: 'Get notified when image generation completes asynchronously.' },
  { icon: Lock, title: 'API Keys', description: 'Secure authentication with scoped API keys and rate limiting.' },
]

export default function ApiDocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Pictura API</h1>
                <span className="mt-0.5 inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-blue-600">
                  COMING SOON
                </span>
              </div>
            </div>
          </motion.div>

          <div className="my-10 h-px bg-border/50" />

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp}>
            <p className="text-base leading-relaxed text-muted-foreground">
              We are building the Pictura API to allow developers to integrate AI image generation directly
              into their applications. The API will offer the same capabilities available in the Studio&mdash;text-to-image
              and image-to-image&mdash;via simple REST endpoints.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Join the waitlist to get early access when we launch.
            </p>
          </motion.div>

          {/* Coming soon banner */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            variants={fadeUp}
            className="mt-10 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center"
          >
            <PicturaIcon size={40} className="mx-auto" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">API Access Coming Soon</h2>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              We are actively building the Pictura API. It will be free during beta with generous rate limits
              for developers. Stay tuned for updates.
            </p>
            <Link
              href="/studio"
              className="group mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Try the Studio
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>

          {/* Preview endpoints */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mt-14">
            <h2 className="text-lg font-semibold text-foreground">Planned Endpoints</h2>
            <div className="mt-5 flex flex-col gap-2.5">
              {endpoints.map((ep) => (
                <div key={ep.path} className="flex items-center gap-4 rounded-xl border border-border/50 bg-card px-5 py-4">
                  <span className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                    ep.method === 'POST' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'
                  }`}>
                    {ep.method}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-foreground">{ep.path}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{ep.description}</p>
                  </div>
                  <span className="flex-shrink-0 rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {ep.status}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Features */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mt-14">
            <h2 className="text-lg font-semibold text-foreground">What to Expect</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-border/50 bg-card p-5">
                  <f.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{f.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Code preview */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mt-14">
            <h2 className="text-lg font-semibold text-foreground">Preview</h2>
            <div className="mt-5 overflow-hidden rounded-xl border border-border/50 bg-[#1a1612]">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                <span className="ml-3 font-mono text-[10px] text-white/30">generate.py</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed">
                <code>
                  <span className="text-blue-400">import</span>{' '}
                  <span className="text-amber-300">pictura</span>{'\n\n'}
                  <span className="text-white/40">{'# Initialize the client'}</span>{'\n'}
                  <span className="text-white/90">client</span>
                  <span className="text-white/50"> = </span>
                  <span className="text-amber-300">pictura</span>
                  <span className="text-white/50">.</span>
                  <span className="text-green-400">Client</span>
                  <span className="text-white/50">(</span>
                  <span className="text-orange-300">api_key</span>
                  <span className="text-white/50">=</span>
                  <span className="text-green-300">{'"pk_..."'}</span>
                  <span className="text-white/50">)</span>{'\n\n'}
                  <span className="text-white/40">{'# Generate an image'}</span>{'\n'}
                  <span className="text-white/90">image</span>
                  <span className="text-white/50"> = </span>
                  <span className="text-white/90">client</span>
                  <span className="text-white/50">.</span>
                  <span className="text-green-400">generate</span>
                  <span className="text-white/50">(</span>{'\n'}
                  <span className="text-white/50">{'    '}</span>
                  <span className="text-orange-300">prompt</span>
                  <span className="text-white/50">=</span>
                  <span className="text-green-300">{'"A sunset over Lagos lagoon"'}</span>
                  <span className="text-white/50">,</span>{'\n'}
                  <span className="text-white/50">{'    '}</span>
                  <span className="text-orange-300">size</span>
                  <span className="text-white/50">=</span>
                  <span className="text-green-300">{'"1024x1024"'}</span>{'\n'}
                  <span className="text-white/50">)</span>{'\n\n'}
                  <span className="text-white/90">image</span>
                  <span className="text-white/50">.</span>
                  <span className="text-green-400">save</span>
                  <span className="text-white/50">(</span>
                  <span className="text-green-300">{'"lagos_sunset.png"'}</span>
                  <span className="text-white/50">)</span>
                </code>
              </pre>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
