'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Code2, Zap, Shield, Globe, Terminal, Copy, Check, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const PRICING_BY_COUNTRY: Record<string, { currency: string; symbol: string; perImage: number; free: number; pro: number }> = {
  NG: { currency: 'NGN', symbol: '₦', perImage: 5, free: 500, pro: 4000 },
  US: { currency: 'USD', symbol: '$', perImage: 0.01, free: 1, pro: 10 },
  GB: { currency: 'GBP', symbol: '£', perImage: 0.008, free: 0.8, pro: 8 },
  CA: { currency: 'CAD', symbol: 'C$', perImage: 0.013, free: 1.3, pro: 13 },
  AU: { currency: 'AUD', symbol: 'A$', perImage: 0.015, free: 1.5, pro: 15 },
  IN: { currency: 'INR', symbol: '₹', perImage: 0.84, free: 84, pro: 840 },
  DE: { currency: 'EUR', symbol: '€', perImage: 0.009, free: 0.9, pro: 9 },
  FR: { currency: 'EUR', symbol: '€', perImage: 0.009, free: 0.9, pro: 9 },
  ZA: { currency: 'ZAR', symbol: 'R', perImage: 0.19, free: 19, pro: 190 },
  KE: { currency: 'KES', symbol: 'KSh', perImage: 1.29, free: 129, pro: 1290 },
  GH: { currency: 'GHS', symbol: 'GH₵', perImage: 0.12, free: 12, pro: 120 },
  BR: { currency: 'BRL', symbol: 'R$', perImage: 0.05, free: 5, pro: 50 },
  JP: { currency: 'JPY', symbol: '¥', perImage: 1.5, free: 150, pro: 1500 },
}

const DEFAULT_PRICING = { currency: 'USD', symbol: '$', perImage: 0.01, free: 1, pro: 10 }

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python')
  const [pricing, setPricing] = useState(DEFAULT_PRICING)
  const [countryCode, setCountryCode] = useState('US')

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country_code) {
          const cc = data.country_code.toUpperCase()
          setCountryCode(cc)
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

# Generate an image
response = client.images.generate(
    prompt="A mountain at sunset",
    model="pi-1.5-turbo",
    size="1024x1024"
)

print(response.url)`,
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({ apiKey: 'pk_live_...' })

// Generate an image
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
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 mb-4">
                <span className="text-xs font-medium text-primary">API Now in Beta</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Build with Pictura API
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mb-6 max-w-lg">
                Get your API key and let your users generate stunning AI images in your application. 
                Starting at just <span className="font-semibold text-primary">{pricing.symbol}{pricing.perImage}</span> per image.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Link
                  href="/developers/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Get Your API Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => handleCopy(installCmd)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-mono hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-muted-foreground">$</span>
                  {installCmd}
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-16 sm:py-20 border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Quick Start</span>
              </div>
              <p className="text-muted-foreground">Get started with just a few lines of code</p>
            </div>
            
            <div className="rounded-xl border border-border/50 overflow-hidden bg-background max-w-3xl">
              <div className="flex items-center gap-2 p-3 border-b border-border/40 bg-secondary/30">
                {(['python', 'node', 'curl'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
                  className="ml-auto p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <pre className="p-4 sm:p-6 text-sm leading-relaxed text-foreground overflow-x-auto">
                <code>{codeSnippets[activeTab]}</code>
              </pre>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border/40 max-w-3xl">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Test your integration:</span> After creating your API key in the dashboard, 
                you can test it directly by making requests to our endpoints. Check your usage and remaining credits in real-time.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-foreground mb-8">Why Pictura API?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Zap, title: 'Fast Generation', desc: 'Images generated in under 10 seconds' },
                { icon: Shield, title: 'Secure', desc: 'API key authentication with rate limiting' },
                { icon: Globe, title: '99.9% Uptime', desc: 'Reliable infrastructure, always available' },
                { icon: Code2, title: 'SDKs', desc: 'Official Python and Node.js libraries' },
              ].map((f) => (
                <div key={f.title} className="p-5 rounded-xl border border-border/40 bg-card/50">
                  <f.icon className="h-5 w-5 text-primary mb-3" />
                  <h3 className="text-base font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-16 sm:py-20 border-t border-border/40">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-foreground mb-8">API Reference</h2>
            <div className="space-y-3">
              {[
                { method: 'POST', path: '/v1/images/generate', title: 'Generate Image', desc: 'Create an image from text prompt' },
                { method: 'POST', path: '/v1/images/transform', title: 'Transform Image', desc: 'Edit or transform existing images' },
                { method: 'GET', path: '/v1/images/{id}', title: 'Get Image', desc: 'Retrieve image details and status' },
                { method: 'GET', path: '/v1/usage', title: 'Check Usage', desc: 'View your API usage statistics' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-3 sm:gap-4 p-4 rounded-xl border border-border/40 bg-card/30 hover:bg-card/50 transition-colors">
                  <span className={`shrink-0 px-2 py-1 rounded text-xs font-mono font-medium ${
                    ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-sm text-foreground font-mono flex-1 truncate">{ep.path}</code>
                  <span className="hidden sm:block text-sm text-muted-foreground">{ep.desc}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-16 sm:py-20 border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Simple, Affordable Pricing</h2>
            <p className="text-muted-foreground mb-8">
              Pay only for what you use. Prices shown in {pricing.currency}.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { 
                  name: 'Free', 
                  price: pricing.symbol + '0', 
                  unit: '/month',
                  desc: `${Math.floor(pricing.free / pricing.perImage)} free images to start`,
                  features: [`${pricing.symbol}${pricing.free} free credits`, '3 requests/min', 'Community support', 'All models'],
                },
                { 
                  name: 'Pay As You Go', 
                  price: pricing.symbol + pricing.perImage.toString(), 
                  unit: '/image',
                  desc: 'Perfect for growing apps',
                  features: ['No minimum spend', '10 requests/min', 'Email support', 'Priority queue'],
                },
                { 
                  name: 'Pro', 
                  price: pricing.symbol + pricing.pro.toString(), 
                  unit: '/month',
                  desc: `${Math.floor((pricing.pro / pricing.perImage) * 1.25)} images included`,
                  features: ['25% bonus credits', '50 requests/min', 'Priority support', 'Faster generation'],
                  popular: true 
                },
              ].map((plan) => (
                <div key={plan.name} className={`p-6 rounded-xl border ${plan.popular ? 'border-primary bg-primary/5' : 'border-border/40 bg-background'}`}>
                  {plan.popular && <span className="text-xs font-medium text-primary mb-2 block">Most Popular</span>}
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">{plan.unit}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                  <ul className="space-y-2 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/developers/signup"
                    className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
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
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <PicturaIcon size={32} className="text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Ready to build?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your free account and start generating images in minutes. No credit card required.
            </p>
            <Link
              href="/developers/signup"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
