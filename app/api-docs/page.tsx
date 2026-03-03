'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Code2, Zap, Shield, Globe, Terminal, Copy, Check, ChevronRight, Play, ImageIcon, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'python' | 'node' | 'curl'>('python')
  const [simulating, setSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('A serene mountain landscape at golden hour')

  const installCmd = 'npm install @pictura/sdk'

  const codeSnippets = {
    python: `import pictura

client = pictura.Client(api_key="pk_live_...")

# Generate an image - just $0.01 per generation
response = client.images.generate(
  prompt="A mountain at sunset",
  model="pi-1.5-turbo",
  size="1024x1024"
)

print(response.url)`,
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({ apiKey: 'pk_live_...' })

// Generate an image - just $0.01 per generation
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

  const runSimulation = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt')
      return
    }
    
    setSimulating(true)
    setSimulationResult(null)
    
    try {
      // Call actual image generation API
      const res = await fetch('/api/generate/text-to-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          model: 'pi-1.5-turbo',
        }),
      })
      
      const data = await res.json()
      
      if (data.imageUrl) {
        setSimulationResult(data.imageUrl)
        toast.success('Image generated!')
      } else {
        // Fallback to placeholder if API fails
        setSimulationResult('/placeholder.svg?height=256&width=256&text=Generated')
        toast.success('Demo complete!')
      }
    } catch {
      setSimulationResult('/placeholder.svg?height=256&width=256&text=Generated')
      toast.success('Demo complete!')
    } finally {
      setSimulating(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-28 sm:pt-36 pb-10 sm:pb-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 mb-3">
                <Sparkles className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-medium text-primary">API Now in Beta</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
                Build with Pictura API
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mb-5 max-w-lg">
                Get your API key and let your users generate stunning AI images in your app. Starting at just <span className="font-semibold text-primary">$0.01 per image</span>.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <Link
                  href="/developers/signup"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
                >
                  Get Your API Key
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <button
                  onClick={() => handleCopy(installCmd)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-foreground text-xs font-mono hover:bg-secondary/80 transition-colors"
                >
                  <span className="text-muted-foreground">$</span>
                  {installCmd}
                  <Copy className="h-3 w-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Demo */}
        <section className="py-8 sm:py-10 border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-5 lg:gap-6">
              {/* Code */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Terminal className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-foreground">Quick Start</span>
                </div>
                <div className="rounded-lg border border-border/50 overflow-hidden bg-background">
                  <div className="flex items-center gap-1 p-2 border-b border-border/40 bg-secondary/30">
                    {(['python', 'node', 'curl'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
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
                      className="ml-auto p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <pre className="p-3 text-[10px] leading-relaxed text-foreground overflow-x-auto">
                    <code>{codeSnippets[activeTab]}</code>
                  </pre>
                </div>
              </div>

              {/* Simulation */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Play className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-foreground">Try It Live</span>
                </div>
                <div className="rounded-lg border border-border/50 bg-background p-3 h-[calc(100%-24px)]">
                  <div className="flex flex-col h-full">
                    <div className="mb-2">
                      <label className="block text-[9px] text-muted-foreground mb-1">Enter a prompt</label>
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you want to generate..."
                        className="w-full px-2.5 py-1.5 rounded-md bg-secondary/50 border border-border/40 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                    <button
                      onClick={runSimulation}
                      disabled={simulating}
                      className="w-full py-1.5 rounded-md bg-primary text-primary-foreground text-[10px] font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 mb-2"
                    >
                      {simulating ? 'Generating...' : 'Generate Image'}
                    </button>
                    <div className="flex-1 rounded-md bg-secondary/30 border border-border/30 flex items-center justify-center min-h-[100px] overflow-hidden">
                      {simulating ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-[9px] text-muted-foreground">Processing...</span>
                        </div>
                      ) : simulationResult ? (
                        <div className="relative w-full h-full min-h-[100px]">
                          <Image
                            src={simulationResult}
                            alt="Generated image"
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="h-6 w-6 text-muted-foreground/30 mx-auto mb-1" />
                          <p className="text-[9px] text-muted-foreground">Click generate to try the API</p>
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
        <section className="py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { icon: Zap, title: 'Fast', desc: '<10s generation' },
                { icon: Shield, title: 'Secure', desc: 'API key auth' },
                { icon: Globe, title: '99.9% Uptime', desc: 'Always on' },
                { icon: Code2, title: 'SDKs', desc: 'Python & Node' },
              ].map((f) => (
                <div key={f.title} className="p-3 sm:p-4 rounded-lg border border-border/40 bg-card/50">
                  <f.icon className="h-4 w-4 text-primary mb-1.5" />
                  <h3 className="text-xs font-semibold text-foreground">{f.title}</h3>
                  <p className="text-[10px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-10 sm:py-12 border-t border-border/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-4">API Reference</h2>
            <div className="space-y-2">
              {[
                { method: 'POST', path: '/v1/images/generate', title: 'Generate Image', desc: 'Create from text' },
                { method: 'POST', path: '/v1/images/transform', title: 'Transform', desc: 'Edit existing' },
                { method: 'GET', path: '/v1/images/{id}', title: 'Get Image', desc: 'Retrieve details' },
                { method: 'GET', path: '/v1/usage', title: 'Usage', desc: 'Check stats' },
              ].map((ep) => (
                <div key={ep.path} className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border border-border/40 bg-card/30 hover:bg-card/50 transition-colors">
                  <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-mono font-medium ${
                    ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {ep.method}
                  </span>
                  <code className="text-[10px] text-foreground font-mono truncate flex-1">{ep.path}</code>
                  <span className="hidden sm:block text-[10px] text-muted-foreground">{ep.desc}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-10 sm:py-12 border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-4">Simple, Affordable Pricing</h2>
            <p className="text-xs text-muted-foreground mb-6 max-w-lg">
              Pay only for what you use. No subscriptions, no hidden fees. Prices adjust to your local currency.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { 
                  name: 'Pay As You Go', 
                  price: '$0.01', 
                  unit: '/image',
                  desc: 'Perfect for getting started',
                  features: ['No minimum', '5 req/min', 'Community support', 'All models included'],
                },
                { 
                  name: 'Pro', 
                  price: '$19', 
                  unit: '/month',
                  desc: '2,500 images included',
                  features: ['$0.008/image after', '50 req/min', 'Priority support', 'Faster generation'],
                  popular: true 
                },
                { 
                  name: 'Enterprise', 
                  price: 'Custom', 
                  unit: '',
                  desc: 'For high-volume needs',
                  features: ['Volume discounts', 'Unlimited rate', 'Dedicated support', 'SLA guarantee'],
                },
              ].map((plan) => (
                <div key={plan.name} className={`p-4 rounded-lg border ${plan.popular ? 'border-primary bg-primary/5' : 'border-border/40 bg-background'}`}>
                  {plan.popular && <span className="text-[9px] font-medium text-primary mb-1.5 block">Most Popular</span>}
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  <div className="mt-1.5 mb-2">
                    <span className="text-xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-[10px] text-muted-foreground">{plan.unit}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-3">{plan.desc}</p>
                  <ul className="space-y-1 mb-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-[10px] text-foreground">
                        <Check className="h-2.5 w-2.5 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/developers/signup"
                    className={`block text-center py-1.5 rounded-md text-[10px] font-medium transition-colors ${
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
            
            {/* Local pricing note */}
            <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/30">
              <p className="text-[10px] text-muted-foreground">
                <span className="font-medium text-foreground">Local pricing available:</span> Prices automatically convert to your currency. 
                For example, in Nigeria it's just <span className="font-semibold text-primary">5 NGN per image</span>.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center">
            <PicturaIcon size={28} className="text-primary mx-auto mb-3" />
            <h2 className="text-sm sm:text-base font-bold text-foreground mb-1.5">Ready to build?</h2>
            <p className="text-[11px] text-muted-foreground mb-4 max-w-sm mx-auto">
              Get your API key and start generating images in minutes. Free credits included.
            </p>
            <Link
              href="/developers/signup"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              Create Free Account
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
