'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Code2, Zap, Shield, Globe, Terminal, Copy, Check, ChevronRight, Play, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python')
  const [simulating, setSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<string | null>(null)

  const installCmd = 'npm install @pictura/sdk'

  const codeSnippets = {
    python: `import pictura

client = pictura.Client(api_key="pk_...")

response = client.images.generate(
  prompt="A mountain at sunset",
  model="pi-1.5-turbo"
)

print(response.url)`,
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({ apiKey: 'pk_...' })

const response = await client.images.generate({
  prompt: 'A mountain at sunset',
  model: 'pi-1.5-turbo'
})

console.log(response.url)`,
    curl: `curl -X POST https://api.pictura.ai/v1/generate \\
  -H "Authorization: Bearer pk_..." \\
  -d '{"prompt": "A mountain at sunset"}'`,
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const runSimulation = () => {
    setSimulating(true)
    setSimulationResult(null)
    setTimeout(() => {
      setSimulating(false)
      setSimulationResult('/placeholder.svg?height=256&width=256')
    }, 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-28 sm:pt-36 pb-12 sm:pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 mb-4">
                <span className="text-[10px] sm:text-xs font-medium text-primary">API Beta</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Build with Pictura API
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mb-6 max-w-xl">
                Generate stunning AI images with a simple API call. Get started in minutes with our SDKs for Python and Node.js.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href="/developers/signup"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Get API Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleCopy(installCmd)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-mono hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-muted-foreground">$</span>
                  {installCmd}
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="py-8 sm:py-12 border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
              {/* Code */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Quick Start</span>
                </div>
                <div className="rounded-lg border border-border/50 overflow-hidden bg-background">
                  <div className="flex items-center gap-1 p-2 border-b border-border/40 bg-secondary/30">
                    {(['python', 'node', 'curl'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          activeTab === tab
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab === 'python' ? 'Python' : tab === 'node' ? 'Node.js' : 'cURL'}
                      </button>
                    ))}
                    <button
                      onClick={() => handleCopy(codeSnippets[activeTab])}
                      className="ml-auto p-1.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <pre className="p-3 sm:p-4 text-[11px] sm:text-xs leading-relaxed text-foreground overflow-x-auto">
                    <code>{codeSnippets[activeTab]}</code>
                  </pre>
                </div>
              </div>

              {/* Simulation */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Play className="h-4 w-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Try It Live</span>
                </div>
                <div className="rounded-lg border border-border/50 bg-background p-4 h-[calc(100%-28px)]">
                  <div className="flex flex-col h-full">
                    <div className="mb-3">
                      <label className="block text-[10px] text-muted-foreground mb-1">Prompt</label>
                      <input
                        type="text"
                        defaultValue="A serene mountain landscape at golden hour"
                        className="w-full px-3 py-2 rounded-md bg-secondary/50 border border-border/40 text-xs text-foreground"
                      />
                    </div>
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      className="w-full py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 mb-3"
                    >
                      {simulating ? 'Generating...' : 'Generate Image'}
                    </button>
                    <div className="flex-1 rounded-md bg-secondary/30 border border-border/30 flex items-center justify-center min-h-[120px]">
                      {simulating ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] text-muted-foreground">Processing...</span>
                        </div>
                      ) : simulationResult ? (
                        <div className="text-center p-4">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-2">
                            <ImageIcon className="h-8 w-8 text-primary/40" />
                          </div>
                          <p className="text-[10px] text-muted-foreground">Generated in 1.2s</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-[10px] text-muted-foreground">Click generate to try</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Zap, title: 'Fast', desc: 'Generate in <10s' },
                { icon: Shield, title: 'Secure', desc: 'API key auth' },
                { icon: Globe, title: '99.9% Uptime', desc: 'Always available' },
                { icon: Code2, title: 'SDKs', desc: 'Python & Node.js' },
              ].map((f) => (
                <div key={f.title} className="p-4 sm:p-5 rounded-lg border border-border/40 bg-card/50">
                  <f.icon className="h-5 w-5 text-primary mb-2" />
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-12 sm:py-16 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6">API Reference</h2>
            <div className="space-y-3">
              {[
                { method: 'POST', path: '/v1/images/generate', title: 'Generate Image', desc: 'Create an image from text' },
                { method: 'POST', path: '/v1/images/transform', title: 'Transform Image', desc: 'Edit an existing image' },
                { method: 'GET', path: '/v1/images/{id}', title: 'Get Image', desc: 'Retrieve image details' },
                { method: 'GET', path: '/v1/usage', title: 'Get Usage', desc: 'Check API usage stats' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border/40 bg-card/30 hover:bg-card/50 transition-colors">
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                    ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-xs text-foreground font-mono truncate">{ep.path}</code>
                  <span className="hidden sm:block text-xs text-muted-foreground ml-auto">{ep.desc}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 ml-auto sm:ml-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 sm:py-16 border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-6">Pricing</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Free', price: '0', credits: '200 credits', features: ['5 req/min', 'Community support'] },
                { name: 'Pro', price: '29', credits: '5,000 credits', features: ['100 req/min', 'Priority support'], popular: true },
                { name: 'Enterprise', price: 'Custom', credits: 'Unlimited', features: ['Custom limits', 'Dedicated support'] },
              ].map((plan) => (
                <div key={plan.name} className={`p-5 sm:p-6 rounded-lg border ${plan.popular ? 'border-primary bg-primary/5' : 'border-border/40 bg-background'}`}>
                  {plan.popular && <span className="text-[10px] font-medium text-primary mb-2 block">Most Popular</span>}
                  <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2 mb-4">
                    <span className="text-2xl font-bold text-foreground">{plan.price === 'Custom' ? '' : '$'}{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-xs text-muted-foreground">/month</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{plan.credits}</p>
                  <ul className="space-y-1.5 mb-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-foreground">
                        <Check className="h-3 w-3 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/developers/signup"
                    className={`block text-center py-2 rounded-md text-xs font-medium transition-colors ${
                      plan.popular
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <PicturaIcon size={32} className="text-primary mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">Ready to build?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Get your API key and start generating images today.
            </p>
            <Link
              href="/developers/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
