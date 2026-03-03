'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Code2, Zap, Shield, Globe, Terminal, Copy, Check, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const PRICING_BY_COUNTRY: Record<string, { currency: string; symbol: string; perImage: number; freeCredits: number; pro: number }> = {
  NG: { currency: 'NGN', symbol: '₦', perImage: 5, freeCredits: 1000, pro: 5000 },
  US: { currency: 'USD', symbol: '$', perImage: 0.01, freeCredits: 2, pro: 10 },
  GB: { currency: 'GBP', symbol: '£', perImage: 0.008, freeCredits: 1.60, pro: 8 },
  CA: { currency: 'CAD', symbol: 'C$', perImage: 0.013, freeCredits: 2.60, pro: 13 },
  AU: { currency: 'AUD', symbol: 'A$', perImage: 0.015, freeCredits: 3, pro: 15 },
  IN: { currency: 'INR', symbol: '₹', perImage: 0.84, freeCredits: 168, pro: 840 },
  DE: { currency: 'EUR', symbol: '€', perImage: 0.009, freeCredits: 1.80, pro: 9 },
  FR: { currency: 'EUR', symbol: '€', perImage: 0.009, freeCredits: 1.80, pro: 9 },
  ZA: { currency: 'ZAR', symbol: 'R', perImage: 0.19, freeCredits: 38, pro: 190 },
  KE: { currency: 'KES', symbol: 'KSh', perImage: 1.29, freeCredits: 258, pro: 1290 },
  GH: { currency: 'GHS', symbol: 'GH₵', perImage: 0.12, freeCredits: 24, pro: 120 },
  BR: { currency: 'BRL', symbol: 'R$', perImage: 0.05, freeCredits: 10, pro: 50 },
  JP: { currency: 'JPY', symbol: '¥', perImage: 1.5, freeCredits: 300, pro: 1500 },
}

const DEFAULT_PRICING = { currency: 'USD', symbol: '$', perImage: 0.01, freeCredits: 2, pro: 10 }

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python')
  const [pricing, setPricing] = useState(DEFAULT_PRICING)

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country_code) {
          const cc = data.country_code.toUpperCase()
          setPricing(PRICING_BY_COUNTRY[cc] || DEFAULT_PRICING)
        }
      } catch {
        // Use default
      }
    }
    detectLocation()
  }, [])

  const installCmd = 'npm install @pictura/sdk'

  const codeSnippets = {
    python: `import pictura

client = pictura.Client(api_key="pk_live_...")

# Generate an image in your app
response = client.images.generate(
    prompt="A mountain at sunset",
    model="pi-1.5-turbo",
    size="1024x1024"
)

print(response.url)`,
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({ apiKey: 'pk_live_...' })

// Generate an image in your app
const response = await client.images.generate({
    prompt: 'A mountain at sunset',
    model: 'pi-1.5-turbo',
    size: '1024x1024'
})

console.log(response.url)`,
    curl: `curl -X POST https://api.picturaai.sbs/v1/generate \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A mountain at sunset",
    "model": "pi-1.5-turbo"
  }'`,
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-32 sm:pt-40 pb-16 sm:pb-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 mb-6">
                <span className="text-sm font-medium text-primary">Now in Beta</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Add AI image generation to your product
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Pictura API gives developers the power to integrate AI image generation into any application. 
                Get <span className="font-semibold text-foreground">{pricing.symbol}{pricing.freeCredits}</span> in free credits to start building.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link
                  href="/developers/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                >
                  Get API Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleCopy(installCmd)}
                  className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-secondary text-foreground font-mono text-sm hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-muted-foreground">$</span>
                  {installCmd}
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-16 sm:py-20 border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="font-semibold text-foreground">Quick Start</span>
              </div>
              <p className="text-muted-foreground">Get up and running with just a few lines of code</p>
            </div>
            
            <div className="rounded-xl border border-border/50 overflow-hidden bg-background max-w-3xl">
              <div className="flex items-center gap-2 p-4 border-b border-border/40 bg-secondary/30">
                {(['python', 'node', 'curl'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className="ml-auto p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <pre className="p-6 text-sm leading-relaxed text-foreground overflow-x-auto">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-secondary/50 border border-border/40 max-w-3xl">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Test your integration:</span> Create your API key in the dashboard, 
                then make requests directly from your application. Monitor usage and manage credits in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">Built for developers</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Zap, title: 'Fast Generation', desc: 'Images generated in under 10 seconds with optimized infrastructure' },
                { icon: Shield, title: 'Secure by Default', desc: 'API key authentication, rate limiting, and encrypted requests' },
                { icon: Globe, title: '99.9% Uptime', desc: 'Reliable infrastructure you can depend on for production apps' },
                { icon: Code2, title: 'Official SDKs', desc: 'First-class Python and Node.js libraries with TypeScript support' },
              ].map((f) => (
                <div key={f.title} className="p-6 rounded-xl border border-border/40 bg-card/50">
                  <f.icon className="h-6 w-6 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-16 sm:py-20 border-t border-border/40">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10">API Reference</h2>
            <div className="space-y-4">
              {[
                { method: 'POST', path: '/v1/images/generate', title: 'Generate Image', desc: 'Create an image from a text prompt' },
                { method: 'POST', path: '/v1/images/transform', title: 'Transform Image', desc: 'Edit or transform existing images' },
                { method: 'GET', path: '/v1/images/{id}', title: 'Get Image', desc: 'Retrieve image details and status' },
                { method: 'GET', path: '/v1/usage', title: 'Check Usage', desc: 'View your API usage and remaining credits' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-4 p-5 rounded-xl border border-border/40 bg-card/30 hover:bg-card/50 transition-colors cursor-pointer">
                  <span className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${
                    ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm text-foreground font-mono flex-1 truncate">{ep.path}</code>
                  <span className="hidden sm:block text-muted-foreground">{ep.desc}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 sm:py-20 border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start for free. Pay as you scale. Prices in {pricing.currency}.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { 
                  name: 'Free', 
                  price: pricing.symbol + '0', 
                  unit: '/month',
                  desc: `${pricing.symbol}${pricing.freeCredits} in free credits to start building`,
                  features: ['Free credits to get started', 'All models included', '3 requests per minute', 'Community support'],
                },
                { 
                  name: 'Pay As You Go', 
                  price: pricing.symbol + pricing.perImage.toString(), 
                  unit: '/image',
                  desc: 'Only pay for what you use. No commitment.',
                  features: ['No monthly minimum', 'All models included', '10 requests per minute', 'Email support'],
                },
                { 
                  name: 'Pro', 
                  price: pricing.symbol + pricing.pro.toString(), 
                  unit: '/month',
                  desc: 'For production applications and teams',
                  features: ['25% volume discount', 'All models included', '50 requests per minute', 'Priority support'],
                  popular: true 
                },
              ].map((plan) => (
                <div key={plan.name} className={`p-6 rounded-xl border ${plan.popular ? 'border-primary bg-primary/5' : 'border-border/40 bg-background'}`}>
                  {plan.popular && <span className="text-sm font-medium text-primary mb-3 block">Most Popular</span>}
                  <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-3 mb-4">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.unit}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.desc}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/developers/signup"
                    className={`block text-center py-3 rounded-lg font-medium transition-colors ${
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
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <PicturaIcon size={40} className="text-primary mx-auto mb-6" />
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Start building today</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Create your account and get {pricing.symbol}{pricing.freeCredits} in free credits. No credit card required.
            </p>
            <Link
              href="/developers/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Get Your API Key
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
