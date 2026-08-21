'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, Mail, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'
import { GitHubIcon } from '@/components/pictura/github-star-button'

const LOGIN_EMAIL_KEY = 'pictura_login_email'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [captchaKey, setCaptchaKey] = useState(0) // Used to reset CAPTCHA
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if already logged in and redirect to dashboard
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const localToken = localStorage.getItem('pictura_session')
        if (!localToken) {
          setCheckingAuth(false)
          return
        }

        const res = await fetch('/api/developers/auth/session', {
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${localToken}` }
        })
        const data = await res.json()

        if (data.authenticated && data.developer) {
          toast.success('Already logged in! Redirecting...')
          window.location.href = '/developers/dashboard'
          return
        }
      } catch {
        // Not authenticated, show login form
      }
      setCheckingAuth(false)
    }
    checkAuth()
  }, [])
  
  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(LOGIN_EMAIL_KEY)
    if (savedEmail) setEmail(savedEmail)
  }, [])
  
  // Auto-save email (not password)
  useEffect(() => {
    if (email) {
      localStorage.setItem(LOGIN_EMAIL_KEY, email)
    }
  }, [email])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (!captchaToken) {
      toast.error('Please verify you are not a robot')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.toLowerCase(), 
          password,
          captchaToken 
        }),
      })

      const data = await res.json()

      if (res.ok && data.token) {
        localStorage.setItem('pictura_session', data.token)
        localStorage.setItem('pictura_developer', JSON.stringify(data.developer))
        localStorage.removeItem(LOGIN_EMAIL_KEY)
        toast.success('Welcome back!')
        setTimeout(() => {
          window.location.href = '/developers/dashboard'
        }, 100)
      } else {
        toast.error(data.error || 'Login failed. Please try again.')
        // Reset CAPTCHA on failed login
        setCaptchaToken(null)
        setCaptchaKey(prev => prev + 1)
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background pt-28 pb-16">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="mx-auto max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-foreground mb-1.5">Welcome back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your developer account</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Smart CAPTCHA - resets on failed login */}
              <SmartCaptcha 
                key={captchaKey}
                onVerify={(token) => setCaptchaToken(token)} 
              />

              <button
                type="submit"
                disabled={loading || !captchaToken}
                className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

               {/* Divider */}
               <div className="relative my-4">
                 <div className="absolute inset-0 flex items-center">
                   <div className="w-full border-t border-border" />
                 </div>
                 <div className="relative flex justify-center text-xs">
                   <span className="bg-card px-3 text-muted-foreground">or continue with</span>
                 </div>
               </div>

               {/* Social Login Buttons */}
               <div className="grid grid-cols-3 gap-3">
                 {/* Google Login Button */}
                 <a
                   href="/api/developers/auth/google"
                   className="h-10 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary/60 hover:border-primary/40 transition-colors flex items-center justify-center gap-2"
                 >
                   <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                     <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                     <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                     <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                     <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                   </svg>
                   <span className="hidden sm:inline">Google</span>
                 </a>

                 {/* GitHub Login Button */}
                 <a
                   href="/api/developers/auth/github"
                   className="h-10 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary/60 hover:border-primary/40 transition-colors flex items-center justify-center gap-2"
                 >
                   <GitHubIcon className="h-4 w-4" />
                   <span className="hidden sm:inline">GitHub</span>
                 </a>

                 {/* Apple Login Button */}
                 <a
                   href="/api/developers/auth/apple"
                   className="h-10 rounded-lg border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary/60 hover:border-primary/40 transition-colors flex items-center justify-center gap-2"
                 >
                   <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                     <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                   </svg>
                   <span className="hidden sm:inline">Apple</span>
                 </a>
               </div>

               <p className="text-center text-sm text-muted-foreground mt-4">
                 Don't have an account?{' '}
                 <Link href="/developers/signup" className="text-primary hover:underline">
                   Sign up
                 </Link>
               </p>
             </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
