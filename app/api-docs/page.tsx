'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Code2, Zap, Shield, Wifi, BookOpen, Terminal, Copy, Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
}

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const codeSnippets = {
    python: `import pictura

client = pictura.Client(api_key="pk_test_...")

# Generate an image
response = await client.images.generate(
    prompt="A serene mountain landscape at sunset",
    model="pi-1.5-turbo",
    size="1024x1024"
)

print(response.url)`,
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({
  apiKey: 'pk_test_...'
})

// Generate an image
const response = await client.images.generate({
  prompt: 'A serene mountain landscape at sunset',
  model: 'pi-1.5-turbo',
  size: '1024x1024'
})

console.log(response.url)`,
    curl: `curl -X POST https://api.pictura.ai/v1/images/generate \\
  -H "Authorization: Bearer pk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A serene mountain landscape at sunset",
    "model": "pi-1.5-turbo",
    "size": "1024x1024"
  }'`,
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab])
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Generate images in under 10 seconds with optimized models' },
    { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security with API key management' },
    { icon: Wifi, title: 'Reliable', desc: '99.9% uptime SLA with redundant infrastructure' },
    { icon: Code2, title: 'Developer Friendly', desc: 'SDKs for Python, Node.js, and REST API' },
  ]

  const endpoints = [
    {
      method: 'POST',
      path: '/v1/images/generate',
      title: 'Generate Image',
      desc: 'Create an image from a text prompt',
      params: ['prompt (string, required)', 'model (string)', 'size (string)', 'format (string)'],
    },
    {
      method: 'GET',
      path: '/v1/images/{id}',
      title: 'Get Image',
      desc: 'Retrieve a generated or transformed image',
      params: ['id (string, required)'],
    },
    {
      method: 'POST',
      path: '/v1/images/transform',
      title: 'Transform Image',
      desc: 'Apply transformations to an existing image',
      params: ['image (file|url)', 'prompt (string)', 'strength (number)'],
    },
    {
      method: 'GET',
      path: '/v1/usage',
      title: 'Get Usage',
      desc: 'Check current API usage and rate limits',
      params: [],
    },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/5 to-background pt-20 sm:pt-32 pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 mb-6">
                <span className="text-xs font-semibold text-primary">✓ Now Available in Beta</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
                Pictura API Documentation
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-balance px-2">
                Integrate powerful AI image generation directly into your applications with our robust REST API and official SDKs.
              </p>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            >
              {[
                { label: 'API Endpoints', value: '10+' },
                { label: 'Response Time', value: '<500ms' },
                { label: 'Beta Users', value: '5,000+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border/40 bg-card p-6 sm:p-8 text-center">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="border-b border-border/40 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
              variants={fadeUp}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-foreground mb-3">Get Started in Minutes</h2>
              <p className="text-muted-foreground">Follow these simple steps to start using the Pictura API</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { num: '1', title: 'Create Developer Account', desc: 'Sign up and verify your email to access the dashboard' },
                { num: '2', title: 'Get API Key', desc: 'Generate a scoped API key from your developer dashboard' },
                { num: '3', title: 'Install SDK', desc: 'npm install @pictura/sdk or pip install pictura' },
                { num: '4', title: 'Make First Request', desc: 'Send a prompt and receive generated images' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 2}
                  variants={fadeUp}
                  className="rounded-lg border border-border/40 bg-card p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary mb-4">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={6}
              variants={fadeUp}
              className="flex justify-center mt-12"
            >
              <Link
                href="/developers/signup"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
              >
                Get Your API Key Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Code Example */}
        <section className="border-b border-border/40 py-12 sm:py-20 bg-card/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={3}
              variants={fadeUp}
              className="mb-12"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">Quick Start Example</h2>
              <p className="text-sm sm:text-base text-muted-foreground">Choose your preferred language and integrate in minutes</p>
            </motion.div>

            <div className="rounded-xl border border-border/40 overflow-hidden bg-background">
              {/* Tab Bar */}
              <div className="flex flex-wrap items-center gap-2 border-b border-border/40 p-3 sm:p-4 bg-card">
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {(['python', 'node', 'curl'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tab === 'python' && 'Python'}
                      {tab === 'node' && 'Node.js'}
                      {tab === 'curl' && 'cURL'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleCopy}
                  className="ml-auto inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-md bg-secondary text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                      <span className="hidden sm:inline">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code */}
              <div className="overflow-x-auto">
                <pre className="p-4 sm:p-6 text-xs sm:text-sm leading-relaxed text-foreground bg-background min-w-0 whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">
                  {codeSnippets[activeTab]}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="border-b border-border/40 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={4}
              variants={fadeUp}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-foreground mb-3">API Endpoints</h2>
              <p className="text-muted-foreground">Complete reference for all available endpoints</p>
            </motion.div>

            <div className="space-y-3">
              {endpoints.map((ep, i) => (
                <motion.div
                  key={ep.path}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 4}
                  variants={fadeUp}
                  className="rounded-lg border border-border/40 bg-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === ep.path ? null : ep.path)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-4 text-left flex-1">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        ep.method === 'POST'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-secondary text-muted-foreground'
                      }`}>
                        {ep.method}
                      </span>
                      <div>
                        <p className="font-mono text-sm text-foreground">{ep.path}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ep.desc}</p>
                      </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${
                      expandedSection === ep.path ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {expandedSection === ep.path && (
                    <div className="border-t border-border/40 px-6 py-4 bg-secondary/20">
                      <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Parameters</p>
                      {ep.params.length > 0 ? (
                        <ul className="space-y-2">
                          {ep.params.map((param, j) => (
                            <li key={j} className="text-sm text-foreground font-mono">
                              • {param}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No parameters required</p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-b border-border/40 py-20 bg-card/50">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={5}
              variants={fadeUp}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-foreground mb-3">Why Choose Pictura API?</h2>
              <p className="text-muted-foreground">Built for developers, by developers</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i + 5}
                  variants={fadeUp}
                  className="rounded-lg border border-border/40 bg-background p-6"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-b border-border/40 py-20">
          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={6}
              variants={fadeUp}
              className="mb-12 text-center"
            >
              <h2 className="text-2xl font-bold text-foreground mb-3">Simple, Transparent Pricing</h2>
              <p className="text-muted-foreground">Free during beta with ₦4000 welcome credits</p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={6}
              variants={fadeUp}
              className="overflow-hidden rounded-lg border border-border/40"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-card">
                      <th className="px-6 py-4 text-left font-semibold text-foreground">Feature</th>
                      <th className="px-6 py-4 text-center font-semibold text-foreground">Beta (Free)</th>
                      <th className="px-6 py-4 text-center font-semibold text-foreground">Pro</th>
                      <th className="px-6 py-4 text-center font-semibold text-foreground">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { feature: 'Monthly Credits', beta: '₦4,000', pro: '₦20,000', enterprise: 'Custom' },
                      { feature: 'API Calls/Day', beta: '100', pro: '1,000', enterprise: 'Unlimited' },
                      { feature: 'Max Resolution', beta: '1024px', pro: '2048px', enterprise: '4096px' },
                      { feature: 'Response Time', beta: '<10s', pro: '<5s', enterprise: '<2s' },
                      { feature: 'Support', beta: 'Community', pro: 'Email', enterprise: '24/7 Phone' },
                    ].map((row, i) => (
                      <tr key={i} className={`border-b border-border/40 ${i % 2 === 0 ? 'bg-background' : 'bg-secondary/20'}`}>
                        <td className="px-6 py-4 font-medium text-foreground">{row.feature}</td>
                        <td className="px-6 py-4 text-center text-muted-foreground">{row.beta}</td>
                        <td className="px-6 py-4 text-center text-muted-foreground">{row.pro}</td>
                        <td className="px-6 py-4 text-center text-muted-foreground">{row.enterprise}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-20 bg-gradient-to-b from-background to-primary/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={7}
              variants={fadeUp}
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Ready to Build?</h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 text-balance">
                Join thousands of developers using Pictura API to power their applications
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/developers/signup"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/models"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg border border-border/40 text-foreground font-semibold hover:bg-secondary/30 transition-colors"
                >
                  Explore Models
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
