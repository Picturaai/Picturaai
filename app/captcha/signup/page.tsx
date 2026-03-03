'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { toast } from 'sonner'

export default function CaptchaSignupPage() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [loading, setLoading] = useState(false)
  const [siteKey, setSiteKey] = useState('')
  const [secretKey, setSecretKey] = useState('')
  const [copiedSite, setCopiedSite] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  
  const [formData, setFormData] = useState({
    email: '',
    siteName: '',
    domain: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.siteName || !formData.domain) {
      toast.error('Please fill in all fields')
      return
    }
    
    setLoading(true)
    
    try {
      const res = await fetch('/api/captcha/create-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSiteKey(data.siteKey)
        setSecretKey(data.secretKey)
        setStep('success')
        toast.success('Site keys generated successfully!')
      } else {
        toast.error(data.error || 'Failed to create site')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyKey = (key: string, type: 'site' | 'secret') => {
    navigator.clipboard.writeText(key)
    if (type === 'site') {
      setCopiedSite(true)
      setTimeout(() => setCopiedSite(false), 2000)
    } else {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="mx-auto max-w-lg px-6 py-24">
        <Link
          href="/captcha"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to PicturaCAPTCHA
        </Link>
        
        {step === 'form' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <PicturaIcon size={32} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Get Your Site Keys</h1>
                <p className="text-sm text-muted-foreground">Free forever, no limits</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">We'll send your keys here for safekeeping</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Site name
                </label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  placeholder="My Awesome Website"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Domain
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="example.com"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">Your site key will only work on this domain</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Generate Site Keys'}
              </button>
            </form>
            
            <p className="mt-6 text-xs text-center text-muted-foreground">
              By creating a site, you agree to our{' '}
              <Link href="/captcha/terms" className="text-primary hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/captcha/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Your keys are ready!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Save these keys - the secret key won't be shown again
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Site Key</span>
                  <span className="text-xs text-muted-foreground">Use in your frontend</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-primary bg-primary/5 px-3 py-2 rounded truncate">
                    {siteKey}
                  </code>
                  <button
                    onClick={() => copyKey(siteKey, 'site')}
                    className="h-9 w-9 flex items-center justify-center rounded border border-border hover:bg-muted"
                  >
                    {copiedSite ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Secret Key</span>
                  <span className="text-xs text-red-500">Keep this private!</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-foreground bg-muted px-3 py-2 rounded truncate">
                    {secretKey}
                  </code>
                  <button
                    onClick={() => copyKey(secretKey, 'secret')}
                    className="h-9 w-9 flex items-center justify-center rounded border border-border hover:bg-muted"
                  >
                    {copiedSecret ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/captcha/docs"
                className="flex items-center justify-center gap-2 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
              >
                View Documentation
                <ExternalLink className="h-4 w-4" />
              </Link>
              <button
                onClick={() => { setStep('form'); setFormData({ email: '', siteName: '', domain: '' }) }}
                className="h-10 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted"
              >
                Create Another Site
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}
