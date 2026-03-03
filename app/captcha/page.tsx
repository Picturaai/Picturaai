'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Shield, Globe, Code2, ArrowRight, Copy, CheckCircle2, X, Lock, Eye } from 'lucide-react'
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
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative border-b border-border/40 pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-primary/5 blur-3xl" />
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
                <span className="text-primary">Pictura</span>CAPTCHA
              </h1>
              <p className="mt-4 text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                A free, privacy-first CAPTCHA service that protects your website from bots without annoying your users.
              </p>
              
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center lg:justify-start gap-3">
                <Link
                  href="/captcha/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Get Free Site Key
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/captcha/docs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Documentation
                </Link>
              </div>
              
              <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  No limits
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-primary" />
                  No tracking
                </span>
                <span className="flex items-center gap-1.5">
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
              <div className="relative w-full max-w-xs sm:max-w-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                <div className="relative bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xl">
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
      <section className="py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-10 sm:mb-12"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Why <span className="text-primary">Pictura</span>CAPTCHA?</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Built by developers, for developers. No corporate surveillance, no paywalls, just protection.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'No tracking cookies, no data selling.' },
              { icon: Lock, title: 'Secure', desc: 'Strong bot detection algorithms.' },
              { icon: Globe, title: 'Global CDN', desc: 'Served from edge locations.' },
              { icon: Code2, title: 'Easy Integration', desc: '3 lines of code to integrate.' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">{feature.title}</h3>
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Comparison Table */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
            className="text-center mb-8 sm:mb-10"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Compare CAPTCHA Solutions</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">See how we stack up against the competition</p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="w-full overflow-hidden"
          >
            <div className="overflow-x-auto scrollbar-hide">
              <div className="min-w-[500px]">
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left py-3 px-3 sm:px-4 font-semibold text-foreground">Feature</th>
                      <th className="py-3 px-2 sm:px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <PicturaIcon size={16} />
                          <span className="font-semibold text-primary">Pictura</span>
                        </div>
                      </th>
                      <th className="py-3 px-2 sm:px-3 text-center font-semibold text-muted-foreground">reCAPTCHA</th>
                      <th className="py-3 px-2 sm:px-3 text-center font-semibold text-muted-foreground">hCaptcha</th>
                      <th className="py-3 px-2 sm:px-3 text-center font-semibold text-muted-foreground">Turnstile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      { feature: 'Price', pictura: 'Free Forever', recaptcha: 'Free/Paid', hcaptcha: 'Free/Paid', turnstile: 'Free/Paid' },
                      { feature: 'Request Limit', pictura: 'Unlimited', recaptcha: '1M/mo', hcaptcha: '1M/mo', turnstile: '1M/mo' },
                      { feature: 'Privacy Focused', pictura: true, recaptcha: false, hcaptcha: 'Partial', turnstile: 'Partial' },
                      { feature: 'No Tracking', pictura: true, recaptcha: false, hcaptcha: false, turnstile: 'Partial' },
                      { feature: 'Invisible Mode', pictura: true, recaptcha: true, hcaptcha: true, turnstile: true },
                      { feature: 'Accessibility', pictura: 'AAA', recaptcha: 'AA', hcaptcha: 'AA', turnstile: 'AA' },
                    ].map((row, i) => (
                      <tr key={row.feature} className={i % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                        <td className="py-3 px-3 sm:px-4 font-medium text-foreground">{row.feature}</td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.pictura === 'boolean' ? (
                            row.pictura ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-primary font-medium text-xs sm:text-sm">{row.pictura}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.recaptcha === 'boolean' ? (
                            row.recaptcha ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">{row.recaptcha}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.hcaptcha === 'boolean' ? (
                            row.hcaptcha ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">{row.hcaptcha}</span>
                          )}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center">
                          {typeof row.turnstile === 'boolean' ? (
                            row.turnstile ? <Check className="h-4 w-4 text-primary mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />
                          ) : (
                            <span className="text-muted-foreground text-xs sm:text-sm">{row.turnstile}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
              Swipe to see all providers
            </p>
          </motion.div>
        </div>
      </section>
      
      {/* Code Example */}
      <section className="py-12 sm:py-16 md:py-20">
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
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Integration in minutes</h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Add PicturaCAPTCHA to your website with just a few lines of code. Works with React, Vue, Angular, and vanilla JS.
              </p>
              
              <div className="mt-6 space-y-3">
                {[
                  'Get your free site key',
                  'Add the script to your page',
                  'Add the CAPTCHA container',
                  'Handle the verification callback'
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm sm:text-base text-foreground">{step}</span>
                  </div>
                ))}
              </div>
              
              <Link
                href="/captcha/docs"
                className="mt-6 inline-flex items-center gap-2 text-sm sm:text-base text-primary hover:underline"
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
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 bg-muted/50 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400" />
                      <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary/60" />
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
                <pre className="p-3 sm:p-4 text-xs sm:text-sm overflow-x-auto bg-background">
                  <code className="text-foreground font-mono leading-relaxed whitespace-pre">
{`<!-- 1. Add the script -->
<script src="https://captcha.picturaai.sbs/api.js" async defer></script>

<!-- 2. Add the CAPTCHA container -->
<div id="pictura-captcha" data-sitekey="YOUR_SITE_KEY"></div>

<!-- 3. Handle verification -->
<script>
  function onCaptchaVerify(token) {
    fetch('/api/verify', {
      method: 'POST',
      body: JSON.stringify({ token })
    })
  }
</script>`}
                  </code>
                </pre>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-12 sm:py-16 md:py-20 border-t border-border/40 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            variants={fadeUp}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Ready to protect your website?</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Get started in minutes with our free CAPTCHA service. No credit card required.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/captcha/signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get Free Site Key
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/captcha/docs"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Read Documentation
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  )
}
