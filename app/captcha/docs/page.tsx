'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowLeft, Book, Code2, Server, Shield, Settings, Terminal } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Book },
  { id: 'installation', label: 'Installation', icon: Terminal },
  { id: 'configuration', label: 'Configuration', icon: Settings },
  { id: 'server-verification', label: 'Server Verification', icon: Server },
  { id: 'frameworks', label: 'Framework Guides', icon: Code2 },
  { id: 'security', label: 'Security', icon: Shield },
]

function CodeBlock({ code, filename }: { code: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <span className="h-2 w-2 rounded-full bg-primary/60" />
          </div>
          {filename && <span className="text-[10px] text-muted-foreground ml-2">{filename}</span>}
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-3 min-w-max">
          <code className="text-foreground font-mono text-[11px] leading-relaxed whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  )
}

export default function CaptchaDocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="mx-auto max-w-5xl px-4 pt-20 pb-12">
        <Link href="/captcha" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to PicturaCAPTCHA
        </Link>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Mobile dropdown */}
          <div className="lg:hidden">
            <select 
              value={activeSection}
              onChange={(e) => {
                setActiveSection(e.target.value)
                document.getElementById(e.target.value)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground text-sm"
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.label}</option>
              ))}
            </select>
          </div>
          
          {/* Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-48 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>
          
          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              {/* Hero - Centered */}
              <div className="text-center mb-10 pb-8 border-b border-border">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  <span className="text-primary">Pictura</span>CAPTCHA Documentation
                </h1>
                <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                  Everything you need to integrate PicturaCAPTCHA into your website. Get started in under 5 minutes.
                </p>
              </div>
              
              {/* Getting Started */}
              <section id="getting-started" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Getting Started</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  PicturaCAPTCHA is completely free with no limits. Follow these steps:
                </p>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-foreground text-sm mb-3">Quick Start</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Get your free site key from <Link href="/captcha/dashboard" className="text-primary hover:underline">the dashboard</Link></li>
                    <li>Add the script tag to your HTML</li>
                    <li>Add the CAPTCHA container element</li>
                    <li>Verify tokens on your server</li>
                  </ol>
                </div>
              </section>
              
              {/* Installation */}
              <section id="installation" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Installation</h2>
                
                <h3 className="text-sm font-medium text-foreground mb-2">Add the Script</h3>
                <CodeBlock 
                  filename="index.html"
                  code={`<script src="https://captcha.picturaai.sbs/api.js" async defer></script>`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">Add the Container</h3>
                <CodeBlock 
                  filename="form.html"
                  code={`<form id="myForm">
  <input type="email" name="email" />
  
  <!-- PicturaCAPTCHA -->
  <div id="pictura-captcha" 
       data-sitekey="YOUR_SITE_KEY"
       data-callback="onVerify">
  </div>
  
  <button type="submit">Submit</button>
</form>

<script>
  function onVerify(token) {
    console.log('Verified:', token);
  }
</script>`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">NPM Package</h3>
                <CodeBlock 
                  filename="terminal"
                  code={`npm install @pictura/captcha`}
                />
              </section>
              
              {/* Configuration */}
              <section id="configuration" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Configuration</h2>
                
                <div className="space-y-3">
                  {[
                    { attr: 'data-sitekey', default: 'required', desc: 'Your site key from the dashboard' },
                    { attr: 'data-callback', default: '-', desc: 'Function called on successful verification' },
                    { attr: 'data-size', default: 'normal', desc: 'Size: compact, normal, or invisible' },
                    { attr: 'data-theme', default: 'auto', desc: 'Theme: light, dark, or auto' },
                  ].map((item) => (
                    <div key={item.attr} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                      <code className="text-primary text-xs font-medium">{item.attr}</code>
                      <span className="text-xs text-muted-foreground hidden sm:block">|</span>
                      <span className="text-xs text-muted-foreground">Default: {item.default}</span>
                      <span className="text-xs text-muted-foreground hidden sm:block">|</span>
                      <span className="text-xs text-foreground">{item.desc}</span>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* Server Verification */}
              <section id="server-verification" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Server Verification</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Always verify tokens on your server to prevent bypass:
                </p>
                
                <CodeBlock 
                  filename="verify.js"
                  code={`const response = await fetch(
  'https://captcha.picturaai.sbs/api/verify',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.CAPTCHA_SECRET,
      token: captchaToken
    })
  }
);

const { success } = await response.json();

if (!success) {
  throw new Error('CAPTCHA verification failed');
}`}
                />
              </section>
              
              {/* Frameworks */}
              <section id="frameworks" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Framework Guides</h2>
                
                <h3 className="text-sm font-medium text-foreground mb-2">React Component</h3>
                <CodeBlock 
                  filename="Form.tsx"
                  code={`import { PicturaCaptcha } from '@pictura/captcha/react';

function ContactForm() {
  const [token, setToken] = useState('');
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      
      <PicturaCaptcha
        sitekey="YOUR_SITE_KEY"
        onVerify={setToken}
      />
      
      <button type="submit">Submit</button>
    </form>
  );
}`}
                />
                
                <h3 className="text-sm font-medium text-foreground mb-2 mt-6">Next.js API Route</h3>
                <CodeBlock 
                  filename="app/api/verify/route.ts"
                  code={`export async function POST(req: Request) {
  const { token } = await req.json();
  
  const res = await fetch(
    'https://captcha.picturaai.sbs/api/verify',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.CAPTCHA_SECRET,
        token
      })
    }
  );
  
  const data = await res.json();
  return Response.json({ success: data.success });
}`}
                />
              </section>
              
              {/* Security */}
              <section id="security" className="mb-10 scroll-mt-24">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Security Best Practices</h2>
                
                <div className="grid gap-3">
                  {[
                    { title: 'Keep secrets secure', desc: 'Never expose your secret key in client-side code.' },
                    { title: 'Verify every request', desc: 'Always verify tokens server-side before processing.' },
                    { title: 'Single-use tokens', desc: 'Each token can only be verified once.' },
                    { title: 'Token expiration', desc: 'Tokens expire after 5 minutes.' },
                  ].map((item) => (
                    <div key={item.title} className="bg-card border border-border rounded-xl p-4">
                      <h3 className="font-semibold text-foreground text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
              
              {/* CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
                <h3 className="font-semibold text-foreground mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our community for support.
                </p>
                <a 
                  href="https://t.me/picturaai_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Join Telegram
                </a>
              </div>
            </motion.div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
