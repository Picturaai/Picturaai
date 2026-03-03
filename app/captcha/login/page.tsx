'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'
import { toast } from 'sonner'

export default function CaptchaLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!captchaVerified) {
      toast.error('Please complete the CAPTCHA')
      return
    }

    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Welcome back!')
        router.push('/captcha/dashboard')
      } else {
        toast.error(data.error || 'Invalid credentials')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="mx-auto max-w-md px-4 sm:px-6 pt-24 sm:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-4 shadow-lg shadow-primary/20">
              <PicturaIcon size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in to CAPTCHA</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Use your Pictura developer account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="pt-2">
              <SmartCaptcha 
                onVerify={() => setCaptchaVerified(true)} 
                size="compact"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !captchaVerified}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/developers/signup" className="text-primary hover:underline font-medium">
                Create a Pictura account
              </Link>
            </p>
            <Link href="/captcha" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Back to PicturaCAPTCHA
            </Link>
          </div>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  )
}
