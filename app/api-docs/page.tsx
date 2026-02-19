'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code2, Terminal, Webhook, Lock, Check, ChevronRight, Zap, Globe, Copy } from 'lucide-react'
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
    method: 'POST', path: '/v1/images/generate', description: 'Generate an image from a text prompt',
    params: [
      { name: 'prompt', type: 'string', required: true, desc: 'The text description of the image to generate' },
      { name: 'size', type: 'string', required: false, desc: 'Output size. Default: "1024x1024"' },
      { name: 'model', type: 'string', required: false, desc: 'Model variant. Default: "pi-1.0"' },
      { name: 'format', type: 'string', required: false, desc: 'Output format: "png" or "jpeg". Default: "png"' },
    ],
    response: '{\n  "id": "img_abc123",\n  "url": "https://cdn.pictura.ai/...",\n  "prompt": "...",\n  "created_at": "2025-01-15T10:30:00Z"\n}',
  },
  {
    method: 'POST', path: '/v1/images/transform', description: 'Transform an existing image with a prompt',
    params: [
      { name: 'image', type: 'file | url', required: true, desc: 'Source image as file upload or URL' },
      { name: 'prompt', type: 'string', required: true, desc: 'Description of the desired transformation' },
      { name: 'strength', type: 'number', required: false, desc: 'Transform intensity 0-1. Default: 0.75' },
    ],
    response: '{\n  "id": "img_def456",\n  "url": "https://cdn.pictura.ai/...",\n  "source_id": "img_abc123",\n  "created_at": "2025-01-15T10:31:00Z"\n}',
  },
  {
    method: 'GET', path: '/v1/images/{id}', description: 'Retrieve a previously generated image',
    params: [
      { name: 'id', type: 'string', required: true, desc: 'The image ID returned from generate or transform' },
    ],
    response: '{\n  "id": "img_abc123",\n  "url": "https://cdn.pictura.ai/...",\n  "prompt": "...",\n  "status": "completed",\n  "created_at": "2025-01-15T10:30:00Z"\n}',
  },
  {
    method: 'GET', path: '/v1/usage', description: 'Check your current usage and rate limits',
    params: [],
    response: '{\n  "used": 3,\n  "limit": 100,\n  "resets_at": "2025-01-16T00:00:00Z",\n  "plan": "beta"\n}',
  },
]

const features = [
  { icon: Terminal, title: 'RESTful API', description: 'Simple REST endpoints with JSON responses. Integrate with any language in minutes.' },
  { icon: Code2, title: 'Official SDKs', description: 'Client libraries for Python, Node.js, and more coming at launch.' },
  { icon: Webhook, title: 'Webhooks', description: 'Get notified asynchronously when image generation completes.' },
  { icon: Lock, title: 'API Keys', description: 'Secure authentication with scoped API keys and built-in rate limiting.' },
]

const WALKTHROUGH_STEPS = [
  { title: 'Get your API key', desc: 'Sign up and create a scoped API key from the dashboard. Keys are free during beta.' },
  { title: 'Install the SDK', desc: 'pip install pictura or npm install @pictura/sdk -- or use raw HTTP requests.' },
  { title: 'Send your first request', desc: 'Call /v1/images/generate with your prompt. The response includes a CDN URL for your image.' },
  { title: 'Handle the response', desc: 'Images are returned as URLs hosted on our global CDN. Download or embed them directly.' },
]

export default function ApiDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python')
  const [copied, setCopied] = useState(false)

  const codeSnippets = {
    python: `import pictura

client = pictura.Client(api_key="pk_...")

# Generate an image
image = client.generate(
    prompt="A serene mountain lake at golden hour",
    size="1024x1024"
)

print(image.url)
image.save("output.png")`,
    node: `import Pictura from '@pictura/sdk';

const client = new Pictura({ apiKey: 'pk_...' });

// Generate an image
const image = await client.generate({
  prompt: 'A serene mountain lake at golden hour',
  size: '1024x1024',
});

console.log(image.url);`,
    curl: `curl -X POST https://api.pictura.ai/v1/images/generate \\
  -H "Authorization: Bearer pk_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A serene mountain lake at golden hour",
    "size": "1024x1024"
  }'`,
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
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

        <div className="mx-auto max-w-4xl px-6">
          {/* Walkthrough Steps */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">How it works</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Four simple steps to start generating images programmatically.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {WALKTHROUGH_STEPS.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="relative rounded-2xl border border-border/50 bg-card p-5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <h3 className="mt-3.5 text-sm font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{step.desc}</p>
                  {i < WALKTHROUGH_STEPS.length - 1 && (
                    <ChevronRight className="absolute right-[-14px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-border lg:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Card */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
            variants={fadeUp}
            className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center"
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

          {/* API Reference Table */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={3} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">API Reference</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Detailed endpoint documentation with parameters and responses.</p>

            <div className="mt-8 flex flex-col gap-3">
              {endpoints.map((ep) => {
                const isExpanded = expandedEndpoint === ep.path
                return (
                  <div key={ep.path} className="overflow-hidden rounded-xl border border-border/50 bg-card">
                    {/* Endpoint header row */}
                    <button
                      onClick={() => setExpandedEndpoint(isExpanded ? null : ep.path)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-secondary/30"
                    >
                      <span className={`flex-shrink-0 rounded-md px-2.5 py-1 font-mono text-[10px] font-bold tracking-wider ${
                        ep.method === 'POST'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {ep.method}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-foreground">{ep.path}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{ep.description}</p>
                      </div>
                      <ChevronRight className={`h-4 w-4 flex-shrink-0 text-muted-foreground/40 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-border/30 px-5 py-5">
                            {/* Parameters table */}
                            {ep.params.length > 0 && (
                              <div>
                                <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Parameters</p>
                                <div className="overflow-hidden rounded-lg border border-border/30">
                                  <table className="w-full text-left text-xs">
                                    <thead>
                                      <tr className="border-b border-border/30 bg-secondary/30">
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Name</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Type</th>
                                        <th className="hidden px-4 py-2.5 font-semibold text-foreground sm:table-cell">Required</th>
                                        <th className="px-4 py-2.5 font-semibold text-foreground">Description</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {ep.params.map((p, pi) => (
                                        <tr key={p.name} className={pi % 2 === 0 ? 'bg-background' : 'bg-secondary/15'}>
                                          <td className="px-4 py-2.5 font-mono font-medium text-primary">{p.name}</td>
                                          <td className="px-4 py-2.5 font-mono text-muted-foreground">{p.type}</td>
                                          <td className="hidden px-4 py-2.5 sm:table-cell">
                                            {p.required ? (
                                              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                                <Check className="h-2.5 w-2.5" /> Yes
                                              </span>
                                            ) : (
                                              <span className="text-muted-foreground/50">Optional</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5 text-muted-foreground">{p.desc}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Response */}
                            <div className={ep.params.length > 0 ? 'mt-5' : ''}>
                              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Response</p>
                              <div className="overflow-hidden rounded-lg border border-border/30" style={{ background: 'oklch(0.16 0.01 260)' }}>
                                <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed" style={{ color: 'oklch(0.78 0.05 80)' }}>
                                  {ep.response}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Rate Limits Table */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={4} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">Rate Limits & Pricing</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Free during beta, with clear upgrade paths planned.</p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-border/50">
              <div className="grid grid-cols-4 border-b border-border/30 bg-card">
                <div className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Plan</div>
                <div className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Requests/Day</div>
                <div className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Max Resolution</div>
                <div className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Price</div>
              </div>
              {[
                { plan: 'Beta (Current)', requests: '100', resolution: '1024px', price: 'Free', highlight: true },
                { plan: 'Starter', requests: '500', resolution: '1024px', price: '$9/mo', highlight: false },
                { plan: 'Pro', requests: '5,000', resolution: '2048px', price: '$29/mo', highlight: false },
                { plan: 'Enterprise', requests: 'Custom', resolution: 'Custom', price: 'Contact us', highlight: false },
              ].map((row, i) => (
                <div
                  key={row.plan}
                  className={`grid grid-cols-4 ${i < 3 ? 'border-b border-border/20' : ''} ${
                    row.highlight ? 'bg-primary/5' : i % 2 === 0 ? 'bg-background' : 'bg-secondary/15'
                  }`}
                >
                  <div className="flex items-center gap-2 px-5 py-3.5">
                    <span className={`text-xs font-semibold ${row.highlight ? 'text-primary' : 'text-foreground'}`}>{row.plan}</span>
                    {row.highlight && (
                      <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-bold text-primary">Active</span>
                    )}
                  </div>
                  <div className="px-5 py-3.5 text-xs text-muted-foreground">{row.requests}</div>
                  <div className="px-5 py-3.5 text-xs text-muted-foreground">{row.resolution}</div>
                  <div className={`px-5 py-3.5 text-xs font-medium ${row.highlight ? 'text-primary' : 'text-muted-foreground'}`}>{row.price}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[10px] text-muted-foreground/50">
              Pricing is preliminary and subject to change. All beta users will be grandfathered.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={5} variants={fadeUp} className="mt-16">
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

          {/* Code Preview with tabs */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={6} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">Quick Start</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">Get started with your preferred language.</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-border/50" style={{ background: 'oklch(0.16 0.01 260)' }}>
              {/* Tab bar */}
              <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
                <div className="flex items-center gap-1">
                  {(['python', 'node', 'curl'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-md px-3 py-1.5 font-mono text-[11px] transition-colors ${
                        activeTab === tab
                          ? 'bg-white/10 text-white'
                          : 'text-white/40 hover:text-white/60'
                      }`}
                    >
                      {tab === 'python' ? 'Python' : tab === 'node' ? 'Node.js' : 'cURL'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] text-white/40 transition-colors hover:text-white/70"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed" style={{ color: 'oklch(0.82 0.04 80)' }}>
                {codeSnippets[activeTab]}
              </pre>
            </div>
          </motion.div>

          {/* Architecture Wire Diagram */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={7} variants={fadeUp} className="mt-16">
            <h2 className="text-center text-lg font-semibold text-foreground">API Architecture</h2>
            <p className="mt-2 text-center text-sm text-muted-foreground">How requests flow through the Pictura system.</p>
            <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6 sm:p-8">
              <div className="relative mx-auto max-w-md">
                <div className="absolute left-5 top-5 bottom-5 w-px bg-primary/15" aria-hidden="true" />

                <div className="flex flex-col gap-0">
                  {[
                    { icon: Code2, label: 'Your Application', sub: 'REST API call with auth header' },
                    { icon: Lock, label: 'Auth & Rate Limit', sub: 'API key validation & quota check' },
                    { icon: Terminal, label: 'Prompt Processing', sub: 'NLP enhancement & safety filtering' },
                    { icon: Zap, label: 'Model Router', sub: 'Style-optimized model selection' },
                    { icon: Globe, label: 'Generation Engine', sub: 'Multi-pass diffusion pipeline' },
                    { icon: Webhook, label: 'CDN Delivery', sub: 'Global edge response' },
                  ].map((step, i, arr) => (
                    <div key={step.label}>
                      <div className="relative flex items-center gap-4">
                        <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm">
                          <step.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.label}</p>
                          <p className="text-[11px] text-muted-foreground">{step.sub}</p>
                        </div>
                      </div>
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
