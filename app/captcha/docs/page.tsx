'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowLeft, Book, Code2, Server, Shield, Settings, Terminal } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

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

function CodeBlock({ code, language = 'html', filename }: { code: string; language?: string; filename?: string }) {
  const [copied, setCopied] = useState(false)
  
  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden my-4">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          {filename && <span className="text-xs text-muted-foreground ml-2">{filename}</span>}
        </div>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 sm:p-4 text-sm overflow-x-auto bg-background">
        <code className="text-foreground font-mono text-xs leading-relaxed">{code}</code>
      </pre>
    </div>
  )
}

export default function CaptchaDocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link href="/captcha" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to PicturaCAPTCHA
          </Link>
        </div>
        
        <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-10">
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-1">
              <div className="flex items-center gap-2 mb-6">
                <PicturaIcon size={24} />
                <span className="font-semibold text-foreground">Documentation</span>
              </div>
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
          <main className="min-w-0">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <h1 className="text-3xl font-bold text-foreground mb-4">PicturaCAPTCHA Documentation</h1>
              <p className="text-muted-foreground mb-8">
                Everything you need to integrate PicturaCAPTCHA into your website or application.
              </p>
              
              {/* Getting Started */}
              <section id="getting-started" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Getting Started</h2>
                <p className="text-muted-foreground mb-4">
                  PicturaCAPTCHA is a free, privacy-first CAPTCHA service. Get started in under 5 minutes.
                </p>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6">
                  <h3 className="font-semibold text-foreground mb-2">Quick Start</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Get your free site key from <Link href="/captcha/signup" className="text-primary hover:underline">the signup page</Link></li>
                    <li>Add the script tag to your HTML</li>
                    <li>Add the CAPTCHA container element</li>
                    <li>Verify tokens on your server</li>
                  </ol>
                </div>
              </section>
              
              {/* Installation */}
              <section id="installation" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Installation</h2>
                
                <h3 className="text-lg font-medium text-foreground mb-3">HTML/JavaScript</h3>
                <p className="text-muted-foreground mb-4">
                  Add the following script tag to your HTML page, preferably in the {"<head>"} section:
                </p>
                
                <CodeBlock 
                  filename="index.html"
                  code={`<script src="https://captcha.picturaai.sbs/api.js" async defer></script>`}
                />
                
                <p className="text-muted-foreground mb-4">
                  Then add the CAPTCHA container where you want it to appear:
                </p>
                
                <CodeBlock 
                  filename="index.html"
                  code={`<form id="myForm">
  <!-- Your form fields -->
  <input type="email" name="email" placeholder="Email" />
  
  <!-- PicturaCAPTCHA container -->
  <div id="pictura-captcha" 
       data-sitekey="YOUR_SITE_KEY"
       data-callback="onCaptchaVerify">
  </div>
  
  <button type="submit">Submit</button>
</form>

<script>
  function onCaptchaVerify(token) {
    console.log('CAPTCHA verified:', token);
    // You can now submit your form
  }
</script>`}
                />
                
                <h3 className="text-lg font-medium text-foreground mb-3 mt-8">NPM Package</h3>
                <p className="text-muted-foreground mb-4">
                  For React, Vue, and other frameworks, install our npm package:
                </p>
                
                <CodeBlock 
                  filename="terminal"
                  code={`npm install @pictura/captcha`}
                />
              </section>
              
              {/* Configuration */}
              <section id="configuration" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Configuration</h2>
                <p className="text-muted-foreground mb-4">
                  Customize PicturaCAPTCHA using data attributes:
                </p>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Attribute</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Default</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="py-3 px-4"><code className="text-primary">data-sitekey</code></td>
                        <td className="py-3 px-4 text-muted-foreground">string</td>
                        <td className="py-3 px-4 text-muted-foreground">required</td>
                        <td className="py-3 px-4 text-muted-foreground">Your site key</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><code className="text-primary">data-callback</code></td>
                        <td className="py-3 px-4 text-muted-foreground">string</td>
                        <td className="py-3 px-4 text-muted-foreground">-</td>
                        <td className="py-3 px-4 text-muted-foreground">Function name called on success</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><code className="text-primary">data-size</code></td>
                        <td className="py-3 px-4 text-muted-foreground">string</td>
                        <td className="py-3 px-4 text-muted-foreground">normal</td>
                        <td className="py-3 px-4 text-muted-foreground">compact, normal, or invisible</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4"><code className="text-primary">data-theme</code></td>
                        <td className="py-3 px-4 text-muted-foreground">string</td>
                        <td className="py-3 px-4 text-muted-foreground">auto</td>
                        <td className="py-3 px-4 text-muted-foreground">light, dark, or auto</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <CodeBlock 
                  filename="example.html"
                  code={`<div id="pictura-captcha" 
     data-sitekey="pk_live_xxxxx"
     data-callback="onVerify"
     data-size="compact"
     data-theme="dark">
</div>`}
                />
              </section>
              
              {/* Server Verification */}
              <section id="server-verification" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Server Verification</h2>
                <p className="text-muted-foreground mb-4">
                  Always verify the CAPTCHA token on your server. Never trust client-side validation alone.
                </p>
                
                <h3 className="text-lg font-medium text-foreground mb-3">API Endpoint</h3>
                <CodeBlock 
                  filename="request"
                  code={`POST https://captcha.picturaai.sbs/api/verify
Content-Type: application/json

{
  "secret": "YOUR_SECRET_KEY",
  "token": "CAPTCHA_TOKEN_FROM_CLIENT",
  "remoteip": "USER_IP_ADDRESS" // optional
}`}
                />
                
                <h3 className="text-lg font-medium text-foreground mb-3 mt-6">Response</h3>
                <CodeBlock 
                  filename="response"
                  code={`{
  "success": true,
  "challenge_ts": "2024-01-15T12:00:00Z",
  "hostname": "example.com"
}`}
                />
                
                <h3 className="text-lg font-medium text-foreground mb-3 mt-6">Node.js Example</h3>
                <CodeBlock 
                  filename="server.js"
                  code={`const express = require('express');
const app = express();

app.post('/api/contact', async (req, res) => {
  const { captchaToken, email, message } = req.body;
  
  // Verify CAPTCHA
  const verifyRes = await fetch('https://captcha.picturaai.sbs/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.CAPTCHA_SECRET_KEY,
      token: captchaToken
    })
  });
  
  const verification = await verifyRes.json();
  
  if (!verification.success) {
    return res.status(400).json({ error: 'CAPTCHA verification failed' });
  }
  
  // Process the form...
  res.json({ success: true });
});`}
                />
              </section>
              
              {/* Framework Guides */}
              <section id="frameworks" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Framework Guides</h2>
                
                <h3 className="text-lg font-medium text-foreground mb-3">React</h3>
                <CodeBlock 
                  filename="ContactForm.tsx"
                  code={`import { PicturaCaptcha } from '@pictura/captcha/react';

function ContactForm() {
  const [token, setToken] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return alert('Please complete the CAPTCHA');
    
    // Submit form with token
    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ token, ...formData })
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input type="email" name="email" />
      <textarea name="message" />
      
      <PicturaCaptcha
        sitekey="YOUR_SITE_KEY"
        onVerify={(token) => setToken(token)}
        size="normal"
      />
      
      <button type="submit">Send</button>
    </form>
  );
}`}
                />
                
                <h3 className="text-lg font-medium text-foreground mb-3 mt-8">Next.js (App Router)</h3>
                <CodeBlock 
                  filename="app/api/verify/route.ts"
                  code={`import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  
  const res = await fetch('https://captcha.picturaai.sbs/api/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.CAPTCHA_SECRET_KEY,
      token
    })
  });
  
  const data = await res.json();
  
  if (!data.success) {
    return NextResponse.json({ error: 'Invalid CAPTCHA' }, { status: 400 });
  }
  
  return NextResponse.json({ success: true });
}`}
                />
              </section>
              
              {/* Security */}
              <section id="security" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-semibold text-foreground mb-4">Security Best Practices</h2>
                
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-2">Keep your secret key secure</h3>
                    <p className="text-sm text-muted-foreground">
                      Never expose your secret key in client-side code. Always verify tokens on your server.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-2">Verify every submission</h3>
                    <p className="text-sm text-muted-foreground">
                      Always verify the CAPTCHA token before processing any form submission or API request.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-2">Tokens are single-use</h3>
                    <p className="text-sm text-muted-foreground">
                      Each token can only be verified once. After verification, the token becomes invalid.
                    </p>
                  </div>
                  
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-semibold text-foreground mb-2">Tokens expire</h3>
                    <p className="text-sm text-muted-foreground">
                      Tokens expire after 5 minutes. If verification fails due to expiration, ask the user to complete a new challenge.
                    </p>
                  </div>
                </div>
              </section>
              
              {/* CTA */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
                <h3 className="text-lg font-semibold text-foreground mb-2">Need help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join our Telegram community for support and updates.
                </p>
                <a 
                  href="https://t.me/picturaai_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
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
