'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, CheckCircle2, Mail, Lock, User, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', dialCode: '+234', flag: '🇳🇬', credits: 4000, pricePerImage: 5 },
  { code: 'US', name: 'United States', currency: 'USD', dialCode: '+1', flag: '🇺🇸', credits: 5, pricePerImage: 0.01 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', dialCode: '+44', flag: '🇬🇧', credits: 4, pricePerImage: 0.008 },
  { code: 'CA', name: 'Canada', currency: 'CAD', dialCode: '+1', flag: '🇨🇦', credits: 6.5, pricePerImage: 0.013 },
  { code: 'AU', name: 'Australia', currency: 'AUD', dialCode: '+61', flag: '🇦🇺', credits: 7.5, pricePerImage: 0.015 },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', dialCode: '+27', flag: '🇿🇦', credits: 95, pricePerImage: 0.19 },
  { code: 'KE', name: 'Kenya', currency: 'KES', dialCode: '+254', flag: '🇰🇪', credits: 645, pricePerImage: 1.29 },
  { code: 'GH', name: 'Ghana', currency: 'GHS', dialCode: '+233', flag: '🇬🇭', credits: 62, pricePerImage: 0.12 },
  { code: 'IN', name: 'India', currency: 'INR', dialCode: '+91', flag: '🇮🇳', credits: 420, pricePerImage: 0.84 },
  { code: 'DE', name: 'Germany', currency: 'EUR', dialCode: '+49', flag: '🇩🇪', credits: 4.5, pricePerImage: 0.009 },
  { code: 'FR', name: 'France', currency: 'EUR', dialCode: '+33', flag: '🇫🇷', credits: 4.5, pricePerImage: 0.009 },
  { code: 'JP', name: 'Japan', currency: 'JPY', dialCode: '+81', flag: '🇯🇵', credits: 750, pricePerImage: 1.5 },
  { code: 'BR', name: 'Brazil', currency: 'BRL', dialCode: '+55', flag: '🇧🇷', credits: 25, pricePerImage: 0.05 },
]

type SignupStep = 'info' | 'verification' | 'complete'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<SignupStep>('info')
  const [detecting, setDetecting] = useState(true)
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('US')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const selectedCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0]

  // Auto-detect user location
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country_code) {
          const found = COUNTRIES.find(c => c.code === data.country_code)
          if (found) {
            setCountry(found.code)
          }
        }
      } catch {
        // Default to US if detection fails
      } finally {
        setDetecting(false)
      }
    }
    detectLocation()
  }, [])

  // Timer for OTP
  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(interval)
    }
  }, [timer])

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim() || !email.trim() || !password.trim() || !phoneNumber.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          country,
          phoneNumber: `${selectedCountry.dialCode}${phoneNumber}`,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setStep('verification')
        setTimer(600)
        toast.success('Verification code sent to your email')
      } else {
        toast.error(data.error || 'Failed to send verification code')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp,
          fullName,
          password,
          country,
          phoneNumber: `${selectedCountry.dialCode}${phoneNumber}`,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setApiKey(data.apiKey || '')
        setStep('complete')
      } else {
        toast.error(data.error || 'Invalid verification code')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopiedKey(true)
    toast.success('API key copied!')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 sm:pt-36 pb-16">
        <div className="mx-auto max-w-sm px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-foreground mb-1">
                {step === 'complete' ? 'Welcome to Pictura!' : 'Create Developer Account'}
              </h1>
              {step === 'info' && !detecting && (
                <p className="text-xs text-muted-foreground">
                  Get <span className="font-semibold text-primary">{selectedCountry.credits} {selectedCountry.currency}</span> in free credits
                </p>
              )}
            </div>

            {/* Info Step */}
            {step === 'info' && (
              <motion.form
                onSubmit={handleSignupStep1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Country</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">{selectedCountry.flag}</span>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={detecting}
                      className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 px-2 rounded-md bg-secondary border border-border/50 text-xs font-medium text-muted-foreground shrink-0">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.dialCode}</span>
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="8012345678"
                      className="flex-1 h-9 px-3 rounded-md bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-9 pl-9 pr-3 rounded-md bg-background border border-border/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-muted-foreground pt-2">
                  Already have an account?{' '}
                  <Link href="/developers/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}

            {/* Verification Step */}
            {step === 'verification' && (
              <motion.form
                onSubmit={handleVerifyOTP}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="text-center p-3 rounded-md bg-secondary/50 border border-border/40">
                  <p className="text-xs text-muted-foreground">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-xs font-medium text-foreground">{email}</p>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-foreground mb-1">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border/50 text-foreground text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>

                <div className="text-center text-[11px] text-muted-foreground">
                  {timer > 0 ? (
                    <p>
                      Code expires in{' '}
                      <span className="font-medium text-foreground">
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSignupStep1({ preventDefault: () => {} } as React.FormEvent)}
                      className="text-primary hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            {/* Success Step */}
            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h2 className="text-base font-semibold text-foreground mb-1">
                    Account Created!
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    You received <span className="font-medium text-primary">{selectedCountry.credits} {selectedCountry.currency}</span> in free credits.
                    <br />
                    That's about <span className="font-medium">{Math.floor(selectedCountry.credits / selectedCountry.pricePerImage)} images</span> to get started!
                  </p>
                </div>

                {apiKey && (
                  <div className="p-3 rounded-md bg-secondary/50 border border-border/40">
                    <p className="text-[10px] text-muted-foreground mb-1.5">Your API Key (save it now, won't be shown again)</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-[10px] font-mono text-foreground bg-background p-2 rounded border border-border/30 truncate">
                        {apiKey}
                      </code>
                      <button
                        onClick={copyApiKey}
                        className="shrink-0 p-2 rounded-md bg-background border border-border/30 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedKey ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <Link
                    href="/developers/dashboard"
                    className="block w-full h-9 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center leading-9"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/api-docs"
                    className="block w-full h-9 rounded-md bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors text-center leading-9"
                  >
                    View Documentation
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
