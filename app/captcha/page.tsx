'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Shield, Zap, Globe, Code2, ArrowRight, Copy, CheckCircle2 } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 }
  })
}

export default function CaptchaPage() {
  const [copied, setCopied] = useState(false)
  const [demoVerified, setDemoVerified] = useState(false)
  
  const codeSnippet = `<!-- 1. Add the script -->
<script src="https://captcha.picturaai.sbs/api.js" async defer></script>

<!-- 2. Add the CAPTCHA container -->
<div id="pictura-captcha" data-sitekey="YOUR_SITE_KEY"></div>

<!-- 3. Handle verification -->
<script>
  function onCaptchaVerify(token) {
    // Send token to your server
    fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }
</script>`

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40 pt-24 pb-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  100% Free Forever
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                PicturaCAPTCHA
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                A free, privacy-first CAPTCHA service that protects your website from bots without annoying your users.
              </p>
              
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/captcha/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Free Site Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/captcha/docs"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Documentation
                </Link>
              </div>
              
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  No limits
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  No tracking
                </span>
                <span className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  No ads
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial="hidden"
              animate="visible"
              custom={1}
              variants={fadeUp}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-8 shadow-xl">
                  <p className="text-sm font-medium text-foreground mb-4">Try it yourself:</p>
                  <SmartCaptcha 
                    onVerify={() => setDemoVerified(true)} 
                    size="normal"
                  />
                  {demoVerified && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-sm text-primary flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Verified! See how easy that was?
                    </motion.p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground">Why PicturaCAPTCHA?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. No corporate surveillance, no paywalls, just protection.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'No tracking cookies, no data selling, no fingerprinting. Your users stay private.' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Challenges load instantly. No slow image grids to wait for.' },
              { icon: Globe, title: 'Global CDN', desc: 'Served from edge locations worldwide for minimal latency.' },
              { icon: Code2, title: 'Easy Integration', desc: 'Add 3 lines of code to any website. Works with all frameworks.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Comparison Table */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground">Compare CAPTCHA Solutions</h2>
            <p className="mt-4 text-muted-foreground">See how we stack up against the competition</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="overflow-x-auto"
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-4 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <PicturaIcon size={20} />
                      <span className="font-semibold text-primary">PicturaCAPTCHA</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">reCAPTCHA</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">hCaptcha</th>
                  <th className="text-center py-4 px-4 font-semibold text-muted-foreground">Turnstile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { feature: 'Price', pictura: 'Free Forever', recaptcha: 'Free / Paid', hcaptcha: 'Free / Paid', turnstile: 'Free / Paid' },
                  { feature: 'Request Limit', pictura: 'Unlimited', recaptcha: '1M/month', hcaptcha: '1M/month', turnstile: '1M/month' },
                  { feature: 'Privacy Focused', pictura: true, recaptcha: false, hcaptcha: 'Partial', turnstile: 'Partial' },
                  { feature: 'No User Tracking', pictura: true, recaptcha: false, hcaptcha: false, turnstile: 'Partial' },
                  { feature: 'Open Source', pictura: 'Soon', recaptcha: false, hcaptcha: false, turnstile: false },
                  { feature: 'Invisible Mode', pictura: true, recaptcha: true, hcaptcha: true, turnstile: true },
                  { feature: 'Challenge Types', pictura: '4+', recaptcha: '2', hcaptcha: '3', turnstile: '1' },
                  { feature: 'Accessibility', pictura: 'AAA', recaptcha: 'AA', hcaptcha: 'AA', turnstile: 'AA' },
                ].map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/50">
                    <td className="py-4 px-4 font-medium text-foreground">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.pictura === 'boolean' ? (
                        row.pictura ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="text-primary font-medium">{row.pictura}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.recaptcha === 'boolean' ? (
                        row.recaptcha ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="text-muted-foreground">{row.recaptcha}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.hcaptcha === 'boolean' ? (
                        row.hcaptcha ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="text-muted-foreground">{row.hcaptcha}</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.turnstile === 'boolean' ? (
                        row.turnstile ? <Check className="h-5 w-5 text-primary mx-auto" /> : <span className="text-muted-foreground">-</span>
                      ) : (
                        <span className="text-muted-foreground">{row.turnstile}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>
      
      {/* Code Example */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <h2 className="text-3xl font-bold text-foreground">Integration in minutes</h2>
              <p className="mt-4 text-muted-foreground">
                Add PicturaCAPTCHA to your website with just a few lines of code. Works with React, Vue, Angular, vanilla JS, and any other framework.
              </p>
              
              <div className="mt-8 space-y-4">
                {[
                  'Get your free site key',
                  'Add the script to your page',
                  'Add the CAPTCHA container',
                  'Handle the verification callback'
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/captcha/docs"
                className="mt-8 inline-flex items-center gap-2 text-primary hover:underline"
              >
                Read full documentation
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
            >
              <div className="rounded-xl border border-border bg-[#0d0d0d] overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-[#171717] border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                      <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                      <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">index.html</span>
                  </div>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="p-4 text-sm overflow-x-auto font-mono">
                  <code className="text-[#e6e6e6]">
                    <span className="text-[#6a9955]">{'<!-- 1. Add the script -->'}</span>{'\n'}
                    <span className="text-[#808080]">{'<'}</span><span className="text-[#569cd6]">script</span> <span className="text-[#9cdcfe]">src</span><span className="text-[#808080]">=</span><span className="text-[#ce9178]">"https://captcha.picturaai.sbs/api.js"</span> <span className="text-[#569cd6]">async defer</span><span className="text-[#808080]">{'></'}</span><span className="text-[#569cd6]">script</span><span className="text-[#808080]">{'>'}</span>{'\n\n'}
                    <span className="text-[#6a9955]">{'<!-- 2. Add the CAPTCHA container -->'}</span>{'\n'}
                    <span className="text-[#808080]">{'<'}</span><span className="text-[#569cd6]">div</span> <span className="text-[#9cdcfe]">id</span><span className="text-[#808080]">=</span><span className="text-[#ce9178]">"pictura-captcha"</span> <span className="text-[#9cdcfe]">data-sitekey</span><span className="text-[#808080]">=</span><span className="text-[#ce9178]">"YOUR_SITE_KEY"</span><span className="text-[#808080]">{'></'}</span><span className="text-[#569cd6]">div</span><span className="text-[#808080]">{'>'}</span>{'\n\n'}
                    <span className="text-[#6a9955]">{'<!-- 3. Handle verification -->'}</span>{'\n'}
                    <span className="text-[#808080]">{'<'}</span><span className="text-[#569cd6]">script</span><span className="text-[#808080]">{'>'}</span>{'\n'}
                    {'  '}<span className="text-[#569cd6]">function</span> <span className="text-[#dcdcaa]">onCaptchaVerify</span><span className="text-[#808080]">(</span><span className="text-[#9cdcfe]">token</span><span className="text-[#808080]">)</span> <span className="text-[#808080]">{'{'}</span>{'\n'}
                    {'    '}<span className="text-[#6a9955]">// Send token to your server</span>{'\n'}
                    {'    '}<span className="text-[#dcdcaa]">fetch</span><span className="text-[#808080]">(</span><span className="text-[#ce9178]">'/api/verify'</span><span className="text-[#808080]">,</span> <span className="text-[#808080]">{'{'}</span>{'\n'}
                    {'      '}<span className="text-[#9cdcfe]">method</span><span className="text-[#808080]">:</span> <span className="text-[#ce9178]">'POST'</span><span className="text-[#808080]">,</span>{'\n'}
                    {'      '}<span className="text-[#9cdcfe]">body</span><span className="text-[#808080]">:</span> <span className="text-[#569cd6]">JSON</span><span className="text-[#808080]">.</span><span className="text-[#dcdcaa]">stringify</span><span className="text-[#808080]">({'{'}</span> <span className="text-[#9cdcfe]">token</span> <span className="text-[#808080]">{'}'})</span>{'\n'}
                    {'    '}<span className="text-[#808080]">{'}'})</span>{'\n'}
                    {'  '}<span className="text-[#808080]">{'}'}</span>{'\n'}
                    <span className="text-[#808080]">{'</'}</span><span className="text-[#569cd6]">script</span><span className="text-[#808080]">{'>'}</span>
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-primary/5">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <PicturaIcon size={48} className="mx-auto" />
            <h2 className="mt-6 text-3xl font-bold text-foreground">Ready to protect your website?</h2>
            <p className="mt-4 text-muted-foreground">
              Get started in under 5 minutes. No credit card required, no usage limits, no catch.
            </p>
            <Link
              href="/captcha/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Get Your Free Site Key
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
