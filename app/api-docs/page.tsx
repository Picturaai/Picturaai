'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Code2, Clock, Shield, Globe, Terminal, Copy, Check, 
  ChevronRight, Zap, Database, Image, Server, Cpu, Network,
  Play, Pause, RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

// Architecture nodes for the connection map
const ARCHITECTURE_NODES = [
  { id: 'client', label: 'Your App', icon: Code2, x: 10, y: 50, color: 'primary' },
  { id: 'api', label: 'Pictura API', icon: Server, x: 35, y: 50, color: 'primary' },
  { id: 'queue', label: 'Job Queue', icon: Database, x: 55, y: 30, color: 'muted' },
  { id: 'models', label: 'AI Models', icon: Cpu, x: 75, y: 20, color: 'primary' },
  { id: 'storage', label: 'CDN Storage', icon: Image, x: 75, y: 60, color: 'muted' },
  { id: 'cache', label: 'Edge Cache', icon: Zap, x: 55, y: 70, color: 'muted' },
]

const CONNECTIONS = [
  { from: 'client', to: 'api', label: 'REST/SDK' },
  { from: 'api', to: 'queue', label: 'Async' },
  { from: 'queue', to: 'models', label: 'Process' },
  { from: 'models', to: 'storage', label: 'Store' },
  { from: 'storage', to: 'cache', label: 'Distribute' },
  { from: 'cache', to: 'api', label: 'Serve' },
]

const PRICING_BY_COUNTRY: Record<string, { currency: string; symbol: string; perImage: number; freeCredits: number; pro: number }> = {
  NG: { currency: 'NGN', symbol: '₦', perImage: 5, freeCredits: 1000, pro: 5000 },
  US: { currency: 'USD', symbol: '$', perImage: 0.01, freeCredits: 2, pro: 10 },
  GB: { currency: 'GBP', symbol: '£', perImage: 0.008, freeCredits: 1.60, pro: 8 },
  DEFAULT: { currency: 'USD', symbol: '$', perImage: 0.01, freeCredits: 2, pro: 10 },
}

// Interactive Architecture Visualization
function ArchitectureMap() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [animatingPath, setAnimatingPath] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setAnimatingPath(prev => (prev + 1) % CONNECTIONS.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [isPlaying])

  const getNodePosition = (id: string) => {
    const node = ARCHITECTURE_NODES.find(n => n.id === id)
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 }
  }

  return (
    <div className="relative w-full aspect-[2/1] min-h-[300px] bg-card/50 rounded-2xl border border-border/50 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg bg-background/80 border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setAnimatingPath(0)}
          className="p-2 rounded-lg bg-background/80 border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* SVG Connections */}
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {CONNECTIONS.map((conn, idx) => {
          const from = getNodePosition(conn.from)
          const to = getNodePosition(conn.to)
          const isActive = idx === animatingPath
          
          return (
            <g key={`${conn.from}-${conn.to}`}>
              {/* Base line */}
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="hsl(var(--border))"
                strokeWidth="0.3"
                strokeDasharray="1,1"
              />
              {/* Animated line */}
              {isActive && (
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="url(#lineGradient)"
                  strokeWidth="0.5"
                  filter="url(#glow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
              )}
              {/* Connection label */}
              <text
                x={(from.x + to.x) / 2}
                y={(from.y + to.y) / 2 - 2}
                fontSize="2"
                fill="hsl(var(--muted-foreground))"
                textAnchor="middle"
                className="select-none"
              >
                {conn.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Nodes */}
      {ARCHITECTURE_NODES.map((node) => {
        const Icon = node.icon
        const isActive = activeNode === node.id || 
          CONNECTIONS[animatingPath]?.from === node.id || 
          CONNECTIONS[animatingPath]?.to === node.id
        
        return (
          <motion.div
            key={node.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              isActive ? 'z-20 scale-110' : 'z-10'
            }`}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            whileHover={{ scale: 1.1 }}
          >
            <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
              isActive 
                ? 'bg-primary/10 border-primary/50 shadow-lg shadow-primary/20' 
                : 'bg-background/80 border-border/50'
            }`}>
              <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] sm:text-xs font-medium whitespace-nowrap ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {node.label}
              </span>
            </div>
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-px bg-border" style={{ borderStyle: 'dashed' }} />
          <span>Data Flow</span>
        </div>
      </div>
    </div>
  )
}

export default function ApiDocsPage() {
  const [copied, setCopied] = useState(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'node' | 'python' | 'curl'>('node')
  const [pricing, setPricing] = useState(PRICING_BY_COUNTRY.DEFAULT)

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country_code) {
          setPricing(PRICING_BY_COUNTRY[data.country_code.toUpperCase()] || PRICING_BY_COUNTRY.DEFAULT)
        }
      } catch { /* Use default */ }
    }
    detectLocation()
  }, [])

  const installCmd = 'npm install @pictura/sdk'

  const codeSnippets = {
    node: `import Pictura from '@pictura/sdk'

const client = new Pictura({ apiKey: 'pk_live_...' })

// Generate an image
const image = await client.images.generate({
  prompt: 'A mountain at sunset',
  model: 'pi-1.5-turbo',
  size: '1024x1024'
})

console.log(image.url)`,
    python: `import pictura

client = pictura.Client(api_key="pk_live_...")

# Generate an image
image = client.images.generate(
    prompt="A mountain at sunset",
    model="pi-1.5-turbo",
    size="1024x1024"
)

print(image.url)`,
    curl: `curl -X POST https://api.picturaai.sbs/v1/generate \\
  -H "Authorization: Bearer pk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A mountain at sunset",
    "model": "pi-1.5-turbo",
    "size": "1024x1024"
  }'`,
  }

  const handleCopy = (text: string, id?: string) => {
    navigator.clipboard.writeText(text)
    if (id) {
      setCopiedSnippet(id)
      setTimeout(() => setCopiedSnippet(null), 2000)
    } else {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    toast.success('Copied to clipboard')
  }

  const endpoints = [
    { method: 'POST', path: '/v1/images/generate', title: 'Generate Image', desc: 'Create an image from a text prompt' },
    { method: 'POST', path: '/v1/images/edit', title: 'Edit Image', desc: 'Modify an existing image with AI' },
    { method: 'POST', path: '/v1/images/variations', title: 'Create Variations', desc: 'Generate variations of an image' },
    { method: 'GET', path: '/v1/images/{id}', title: 'Get Image', desc: 'Retrieve image details and status' },
    { method: 'GET', path: '/v1/models', title: 'List Models', desc: 'Get available generation models' },
    { method: 'GET', path: '/v1/usage', title: 'Check Usage', desc: 'View your API usage and credits' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-32 sm:pt-40 pb-12 sm:pb-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-medium text-primary">API v1 - Now in Beta</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
                  Build AI-powered apps with the Pictura API
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl leading-relaxed">
                  Add AI image generation to any application with our simple REST API. 
                  Get <span className="font-semibold text-foreground">{pricing.symbol}{pricing.freeCredits}</span> in free credits to start.
                </p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link
                    href="/developers/signup"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
                  >
                    Get API Key
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleCopy(installCmd)}
                    className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-secondary/80 text-foreground font-mono text-sm hover:bg-secondary transition-all group"
                  >
                    <span className="text-muted-foreground">$</span>
                    <span>{installCmd}</span>
                    {copied ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <Copy className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Architecture Map */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Network className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">How It Works</h2>
              </div>
              <ArchitectureMap />
              <p className="mt-4 text-sm text-muted-foreground text-center">
                Interactive visualization of the Pictura API architecture. Hover over nodes to explore.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Code Example */}
        <section className="py-12 sm:py-16 border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Terminal className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">Quick Start</h2>
              </div>
              <p className="text-muted-foreground mb-8">Get up and running in under a minute</p>
              
              <div className="rounded-xl border border-border/50 overflow-hidden bg-background max-w-3xl">
                <div className="flex items-center justify-between p-3 border-b border-border/40 bg-secondary/30">
                  <div className="flex items-center gap-1">
                    {(['node', 'python', 'curl'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          activeTab === tab
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                      >
                        {tab === 'node' ? 'Node.js' : tab === 'python' ? 'Python' : 'cURL'}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => handleCopy(codeSnippets[activeTab], 'code')}
                    className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                  >
                    {copiedSnippet === 'code' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <pre className="p-6 text-sm leading-relaxed text-foreground overflow-x-auto">
                  <code>{codeSnippets[activeTab]}</code>
                </pre>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">Built for developers</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: Zap, title: 'Fast Generation', desc: 'Images in under 10 seconds' },
                  { icon: Shield, title: 'Secure by Default', desc: 'API key auth & encryption' },
                  { icon: Globe, title: '99.9% Uptime', desc: 'Reliable infrastructure' },
                  { icon: Code2, title: 'Official SDKs', desc: 'Python & Node.js' },
                ].map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="p-5 rounded-xl border border-border/40 bg-card/50 hover:bg-card/80 hover:border-border transition-all"
                  >
                    <f.icon className="h-5 w-5 text-primary mb-3" />
                    <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* API Reference */}
        <section className="py-12 sm:py-16 border-t border-border/40">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">API Reference</h2>
              <div className="space-y-3">
                {endpoints.map((ep, i) => (
                  <motion.div
                    key={ep.path}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-card/30 hover:bg-card/60 hover:border-border transition-all cursor-pointer group"
                  >
                    <span className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${
                      ep.method === 'POST' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-sm text-foreground font-mono flex-1 truncate">{ep.path}</code>
                    <span className="hidden sm:block text-sm text-muted-foreground">{ep.desc}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 sm:py-16 border-t border-border/40 bg-card/30">
          <div className="mx-auto max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-foreground mb-2">Simple pricing</h2>
              <p className="text-muted-foreground mb-8">Start free. Pay as you grow.</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { name: 'Free', price: `${pricing.symbol}0`, unit: '/mo', desc: 'Get started', features: ['Free credits', 'All models', '3 req/min'] },
                  { name: 'Pay As You Go', price: `${pricing.symbol}${pricing.perImage}`, unit: '/image', desc: 'Scale up', features: ['No minimum', 'All models', '10 req/min'] },
                  { name: 'Pro', price: `${pricing.symbol}${pricing.pro}`, unit: '/mo', desc: 'For teams', features: ['25% discount', 'Priority support', '50 req/min'], popular: true },
                ].map((plan) => (
                  <div key={plan.name} className={`p-5 rounded-xl border ${plan.popular ? 'border-primary bg-primary/5' : 'border-border/40 bg-background'}`}>
                    {plan.popular && <span className="text-xs font-medium text-primary mb-2 block">Most Popular</span>}
                    <h3 className="font-semibold text-foreground">{plan.name}</h3>
                    <div className="mt-2 mb-3">
                      <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">{plan.unit}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/developers/signup"
                      className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${
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
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <PicturaIcon size={36} className="text-primary mx-auto mb-5" />
            <h2 className="text-2xl font-bold text-foreground mb-3">Start building today</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get your API key and {pricing.symbol}{pricing.freeCredits} in free credits. No credit card required.
            </p>
            <Link
              href="/developers/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all active:scale-[0.98]"
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
