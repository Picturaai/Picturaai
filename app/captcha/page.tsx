'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Check, Shield, Zap, Globe, Code2, ArrowRight, Copy, CheckCircle2, X } from 'lucide-react'
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

// Brand logos as SVG components
const RecaptchaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4285F4"/>
    <path d="M12 2v10l8.5 5c1-1.7 1.5-3.7 1.5-5.8 0-5.3-4.5-9.7-10-9.2z" fill="#34A853"/>
    <path d="M2 12c0 4.4 2.9 8.2 7 9.5V12H2z" fill="#FBBC05"/>
    <path d="M12 22c2.8 0 5.3-1.1 7.2-2.9L12 12v10z" fill="#EA4335"/>
  </svg>
)

const HcaptchaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <rect width="24" height="24" rx="4" fill="#0074BF"/>
    <path d="M6 8h4v4H6V8zM14 8h4v4h-4V8zM6 14h4v4H6v-4zM14 14h4v4h-4v-4z" fill="white"/>
  </svg>
)

const CloudflareLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
    <path d="M16.5 15.5l1-3.5c.2-.6 0-1.2-.5-1.5-.5-.3-1.2-.2-1.6.2l-4 3.8h5.1z" fill="#F6821F"/>
    <path d="M19 12c-.1-.5-.5-.9-1-.9h-6.5l-.5 1.5c-.2.6 0 1.2.5 1.5.5.3 1.2.2 1.6-.2l3-2.9h2.9z" fill="#FBAD41"/>
    <path d="M5 15.5h11l-1-3.5H7c-.8 0-1.5.5-1.8 1.2l-.2.8v1.5z" fill="#F6821F"/>
  </svg>
)

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
      <section className="relative overflow-hidden border-b border-border/40 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] md:w-[800px] h-[600px] md:h-[800px] rounded-full bg-primary/5 blur-3xl" />
        </div>
        
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              animate="visible"
              custom={0}
              variants={fadeUp}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  100% Free Forever
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                PicturaCAPTCHA
              </h1>
              <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                A free, privacy-first CAPTCHA service that protects your website from bots without annoying your users.
              </p>
              
              <div className="mt-6 md:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3 sm:gap-4">
                <Link
                  href="/captcha/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Free Site Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/captcha/docs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Documentation
                </Link>
              </div>
              
              <div className="mt-6 md:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-sm text-muted-foreground">
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
              <div className="relative w-full max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
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
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why PicturaCAPTCHA?</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. No corporate surveillance, no paywalls, just protection.
            </p>
          </motion.div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'No tracking cookies, no data selling, no fingerprinting.' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Challenges load instantly. No slow image grids.' },
              { icon: Globe, title: 'Global CDN', desc: 'Served from edge locations worldwide.' },
              { icon: Code2, title: 'Easy Integration', desc: '3 lines of code. Works with all frameworks.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card p-5 md:p-6"
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
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-10 md:mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Compare CAPTCHA Solutions</h2>
            <p className="mt-4 text-muted-foreground">See how we stack up against the competition</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="-mx-4 sm:mx-0 overflow-x-auto"
          >
            <div className="min-w-[640px] px-4 sm:px-0">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-4 px-4 md:px-6 font-semibold text-foreground text-sm">Feature</th>
                      <th className="py-4 px-3 md:px-4">
                        <div className="flex items-center justify-center gap-2">
                          <PicturaIcon size={20} />
                          <span className="font-semibold text-primary text-sm">Pictura</span>
                        </div>
                      </th>
                      <th className="py-4 px-3 md:px-4">
                        <div className="flex items-center justify-center gap-2">
                          <RecaptchaLogo />
                          <span className="font-semibold text-muted-foreground text-sm hidden sm:inline">reCAPTCHA</span>
                        </div>
                      </th>
                      <th className="py-4 px-3 md:px-4">
                        <div className="flex items-center justify-center gap-2">
                          <HcaptchaLogo />
                          <span className="font-semibold text-muted-foreground text-sm hidden sm:inline">hCaptcha</span>
                        </div>
                      </th>
                      <th className="py-4 px-3 md:px-4">
                        <div className="flex items-center justify-center gap-2">
                          <CloudflareLogo />
                          <span className="font-semibold text-muted-foreground text-sm hidden sm:inline">Turnstile</span>
                        </div>
                      </th>
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
                    ].map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <td className="py-3 md:py-4 px-4 md:px-6 font-medium text-foreground text-sm">{row.feature}</td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                          {typeof row.pictura === 'boolean' ? (
                            row.pictura ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-primary font-medium text-sm">{row.pictura}</span>
                          )}
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                          {typeof row.recaptcha === 'boolean' ? (
                            row.recaptcha ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-sm">{row.recaptcha}</span>
                          )}
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                          {typeof row.hcaptcha === 'boolean' ? (
                            row.hcaptcha ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-sm">{row.hcaptcha}</span>
                          )}
                        </td>
                        <td className="py-3 md:py-4 px-3 md:px-4 text-center">
                          {typeof row.turnstile === 'boolean' ? (
                            row.turnstile ? <Check className="h-5 w-5 text-primary mx-auto" /> : <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-sm">{row.turnstile}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
              Swipe to see all providers
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Code Example */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
              className="order-2 lg:order-1"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Integration in minutes</h2>
              <p className="mt-4 text-muted-foreground">
                Add PicturaCAPTCHA to your website with just a few lines of code. Works with React, Vue, Angular, vanilla JS, and any other framework.
              </p>
              
              <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
                {[
                  'Get your free site key',
                  'Add the script to your page',
                  'Add the CAPTCHA container',
                  'Handle the verification callback'
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/captcha/docs"
                className="mt-6 md:mt-8 inline-flex items-center gap-2 text-primary hover:underline"
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
              className="order-1 lg:order-2"
            >
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
                <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-red-400" />
                      <span className="h-3 w-3 rounded-full bg-yellow-400" />
                      <span className="h-3 w-3 rounded-full bg-green-400" />
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
                <pre className="p-4 md:p-5 text-xs md:text-sm overflow-x-auto bg-background">
                  <code>
                    <span className="text-muted-foreground">{'<!-- 1. Add the script -->'}</span>{'\n'}
                    <span className="text-muted-foreground">{'<'}</span><span className="text-primary">script</span> <span className="text-foreground">src</span><span className="text-muted-foreground">=</span><span className="text-amber-600 dark:text-amber-400">&quot;https://captcha.picturaai.sbs/api.js&quot;</span> <span className="text-primary">async defer</span><span className="text-muted-foreground">{'></'}</span><span className="text-primary">script</span><span className="text-muted-foreground">{'>'}</span>{'\n\n'}
                    <span className="text-muted-foreground">{'<!-- 2. Add the CAPTCHA container -->'}</span>{'\n'}
                    <span className="text-muted-foreground">{'<'}</span><span className="text-primary">div</span> <span className="text-foreground">id</span><span className="text-muted-foreground">=</span><span className="text-amber-600 dark:text-amber-400">&quot;pictura-captcha&quot;</span> <span className="text-foreground">data-sitekey</span><span className="text-muted-foreground">=</span><span className="text-amber-600 dark:text-amber-400">&quot;YOUR_SITE_KEY&quot;</span><span className="text-muted-foreground">{'></'}</span><span className="text-primary">div</span><span className="text-muted-foreground">{'>'}</span>{'\n\n'}
                    <span className="text-muted-foreground">{'<!-- 3. Handle verification -->'}</span>{'\n'}
                    <span className="text-muted-foreground">{'<'}</span><span className="text-primary">script</span><span className="text-muted-foreground">{'>'}</span>{'\n'}
                    {'  '}<span className="text-primary">function</span> <span className="text-foreground">onCaptchaVerify</span><span className="text-muted-foreground">(</span><span className="text-foreground">token</span><span className="text-muted-foreground">)</span> <span className="text-muted-foreground">{'{'}</span>{'\n'}
                    {'    '}<span className="text-muted-foreground">// Send token to your server</span>{'\n'}
                    {'    '}<span className="text-foreground">fetch</span><span className="text-muted-foreground">(</span><span className="text-amber-600 dark:text-amber-400">&apos;/api/verify&apos;</span><span className="text-muted-foreground">,</span> <span className="text-muted-foreground">{'{'}</span>{'\n'}
                    {'      '}<span className="text-foreground">method</span><span className="text-muted-foreground">:</span> <span className="text-amber-600 dark:text-amber-400">&apos;POST&apos;</span><span className="text-muted-foreground">,</span>{'\n'}
                    {'      '}<span className="text-foreground">body</span><span className="text-muted-foreground">:</span> <span className="text-primary">JSON</span><span className="text-muted-foreground">.</span><span className="text-foreground">stringify</span><span className="text-muted-foreground">({'{'}</span> <span className="text-foreground">token</span> <span className="text-muted-foreground">{'}'})</span>{'\n'}
                    {'    '}<span className="text-muted-foreground">{'}'})</span>{'\n'}
                    {'  '}<span className="text-muted-foreground">{'}'}</span>{'\n'}
                    <span className="text-muted-foreground">{'</'}</span><span className="text-primary">script</span><span className="text-muted-foreground">{'>'}</span>
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary/5">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <PicturaIcon size={48} className="mx-auto" />
            <h2 className="mt-6 text-2xl md:text-3xl font-bold text-foreground">Ready to protect your website?</h2>
            <p className="mt-4 text-muted-foreground">
              Get started in under 5 minutes. No credit card required, no usage limits, no catch.
            </p>
            <Link
              href="/captcha/signup"
              className="mt-6 md:mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
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
