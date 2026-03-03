'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, Mail, Lock, User } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'

const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', dialCode: '+234' },
  { code: 'US', name: 'United States', currency: 'USD', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', dialCode: '+44' },
  { code: 'CA', name: 'Canada', currency: 'CAD', dialCode: '+1' },
  { code: 'AU', name: 'Australia', currency: 'AUD', dialCode: '+61' },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', dialCode: '+27' },
  { code: 'KE', name: 'Kenya', currency: 'KES', dialCode: '+254' },
  { code: 'GH', name: 'Ghana', currency: 'GHS', dialCode: '+233' },
]

type SignupStep = 'info' | 'verification' | 'complete'

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState<SignupStep>('info')
  
  // Form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [country, setCountry] = useState('NG')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)

  const selectedCountry = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0]
  const startupCredits = country === 'NG' ? 4000 : 5

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
        setTimer(600) // 10 minutes
        toast.success('OTP sent to your email')
      } else {
        toast.error(data.error || 'Failed to send OTP')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
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
        setStep('complete')
        setTimeout(() => router.push('/developers/login'), 2000)
      } else {
        toast.error(data.error || 'Invalid OTP')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pt-28 sm:pt-36 pb-16">
        <div className="mx-auto max-w-sm sm:max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                Create Developer Account
              </h1>
              <p className="text-sm text-muted-foreground">
                Get {startupCredits} {selectedCountry.currency} in free credits
              </p>
            </div>

            {/* Info Step */}
            {step === 'info' && (
              <motion.form
                onSubmit={handleSignupStep1}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Full Name
                  </label>
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
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Email Address
                  </label>
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
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-9 px-3 rounded-md bg-background border border-border/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.currency})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-2.5 rounded-md bg-secondary border border-border/50 text-xs font-medium text-muted-foreground">
                      {selectedCountry.dialCode}
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
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Password
                  </label>
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
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
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
                <div className="text-center p-3 rounded-md bg-secondary/50 border border-border/40 mb-4">
                  <p className="text-xs text-foreground">
                    Enter the 6-digit code we sent to
                  </p>
                  <p className="text-xs font-semibold text-foreground">{email}</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full h-10 px-3 rounded-md bg-background border border-border/50 text-foreground text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-mono"
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
                    'Verify Code'
                  )}
                </button>

                <div className="text-center text-xs text-muted-foreground">
                  {timer > 0 ? (
                    <p>
                      Code expires in{' '}
                      <span className="font-semibold text-foreground">
                        {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                      </span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSignupStep1({ preventDefault: () => {} } as React.FormEvent)}
                      className="text-primary hover:underline"
                    >
                      Resend Code
                    </button>
                  )}
                </div>
              </motion.form>
            )}

            {/* Success Step */}
            {step === 'complete' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  Account Created Successfully!
                </h2>
                <p className="text-muted-foreground">
                  Welcome to Pictura API. You've received{' '}
                  <span className="font-semibold text-foreground">
                    {startupCredits} {selectedCountry.currency}
                  </span>{' '}
                  in free credits.
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to login...
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
