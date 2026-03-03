'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, CheckCircle2, Mail, Lock, User, Copy, Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { SmartCaptcha } from '@/components/pictura/smart-captcha'

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', dialCode: '+234', flag: '🇳🇬' },
  { code: 'US', name: 'United States', currency: 'USD', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', currency: 'CAD', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currency: 'AUD', dialCode: '+61', flag: '🇦🇺' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', dialCode: '+27', flag: '🇿🇦' },
  { code: 'KE', name: 'Kenya', currency: 'KES', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', dialCode: '+233', flag: '🇬🇭' },
  { code: 'IN', name: 'India', currency: 'INR', dialCode: '+91', flag: '🇮🇳' },
  { code: 'DE', name: 'Germany', currency: 'EUR', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', currency: 'EUR', dialCode: '+33', flag: '🇫🇷' },
  { code: 'JP', name: 'Japan', currency: 'JPY', dialCode: '+81', flag: '🇯🇵' },
  { code: 'BR', name: 'Brazil', currency: 'BRL', dialCode: '+55', flag: '🇧🇷' },
]

// Free credits by currency
const FREE_CREDITS: Record<string, string> = {
  NGN: '₦1,000',
  USD: '$2',
  GBP: '£1.60',
  EUR: '€1.80',
  CAD: 'C$2.60',
  AUD: 'A$3',
  INR: '₹168',
  ZAR: 'R38',
  KES: 'KSh258',
  GHS: 'GH₵24',
  JPY: '¥300',
  BRL: 'R$10',
}

type SignupStep = 'info' | 'verification' | 'complete'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<SignupStep>('info')
  const [detecting, setDetecting] = useState(true)
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('US')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [copiedKey, setCopiedKey] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const selectedCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0]
  const freeCredits = FREE_CREDITS[selectedCountry.currency] || '$2'

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        if (data.country_code) {
          const found = COUNTRIES.find(c => c.code === data.country_code.toUpperCase())
          if (found) {
            setCountry(found.code)
          }
        }
      } catch {
        // Default to US
      } finally {
        setDetecting(false)
      }
    }
    detectLocation()
  }, [])

  useEffect(() => {
    if (timer > 0) {
      const interval = setTimeout(() => setTimer(timer - 1), 1000)
      return () => clearTimeout(interval)
    }
  }, [timer])

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (!captchaToken) {
      toast.error('Please verify you are not a robot')
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
          currency: selectedCountry.currency,
          phoneNumber: phoneNumber ? `${selectedCountry.dialCode}${phoneNumber}` : '',
          captchaToken,
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

  const verifyOTP = useCallback(async (otpCode: string) => {
    if (loading || otpCode.length !== 6) return

    setLoading(true)
    try {
      const res = await fetch('/api/developers/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      })

      const data = await res.json()

      if (res.ok) {
        setApiKey(data.apiKey || '')
        setStep('complete')
        toast.success('Account created successfully!')
      } else {
        toast.error(data.error || 'Invalid verification code')
        setOtp('')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }, [email, loading])

  // Auto-verify when OTP is complete
  useEffect(() => {
    if (step === 'verification' && otp.length === 6 && !loading) {
      verifyOTP(otp)
    }
  }, [otp, step, loading, verifyOTP])

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      verifyOTP(otp)
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
      <main className="min-h-screen bg-background pt-28 pb-16">
        <div className="mx-auto max-w-md px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold text-foreground mb-1.5">
                {step === 'complete' ? 'Welcome to Pictura' : 'Create your account'}
              </h1>
              {step === 'info' && !detecting && (
                <p className="text-sm text-muted-foreground">
                  Get {freeCredits} in free credits to start building
                </p>
              )}
            </div>

            {/* Info Step */}
            {step === 'info' && (
              <motion.form
                onSubmit={handleSignupStep1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

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
                  <label className="block text-sm font-medium text-foreground mb-1.5">Country</label>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      disabled={detecting}
                      className="w-full h-10 pl-4 pr-10 rounded-lg bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 h-10 rounded-lg bg-secondary border border-border text-sm text-muted-foreground shrink-0">
                      {selectedCountry.dialCode}
                    </span>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Phone number"
                      className="flex-1 h-10 px-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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
                      placeholder="At least 8 characters"
                      className="w-full h-10 pl-10 pr-4 rounded-lg bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {/* Smart CAPTCHA */}
                <SmartCaptcha 
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
                      Sending code...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-muted-foreground">
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
                <div className="text-center p-4 rounded-lg bg-secondary/50 border border-border">
                  <p className="text-sm text-muted-foreground mb-1">
                    We sent a 6-digit code to
                  </p>
                  <p className="text-sm font-medium text-foreground">{email}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Can't find it? Check your spam or junk folder.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Verification code</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      disabled={loading}
                      className="w-full h-12 px-4 rounded-lg bg-background border border-border text-foreground text-center text-lg tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono disabled:opacity-50"
                      autoFocus
                    />
                    {loading && (
                      <div className="absolute inset-y-0 right-3 flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  {otp.length === 6 && loading && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">Verifying your code...</p>
                  )}
                </div>

                {!loading && (
                  <button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Verify & Create Account
                  </button>
                )}

                <div className="text-center text-sm text-muted-foreground">
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
                className="space-y-5"
              >
                <div className="flex justify-center">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Your account is ready. Start integrating Pictura into your applications.
                  </p>
                </div>

                {apiKey && (
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <p className="text-sm text-muted-foreground mb-2">Your API Key</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs font-mono text-foreground bg-background p-2.5 rounded border border-border truncate">
                        {apiKey}
                      </code>
                      <button
                        onClick={copyApiKey}
                        className="shrink-0 p-2.5 rounded bg-background border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Save this key securely. It won't be shown again.</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Link
                    href="/developers/dashboard"
                    className="block w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors text-center leading-10"
                  >
                    Go to Dashboard
                  </Link>
                  <Link
                    href="/api-docs"
                    className="block w-full h-10 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors text-center leading-10"
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
