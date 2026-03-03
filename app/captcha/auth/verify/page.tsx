'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

export default function CaptchaAuthVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'no-account' | 'error'>('verifying')
  const [message, setMessage] = useState('Verifying your Pictura account...')

  useEffect(() => {
    const checkAccount = async () => {
      try {
        // Check if user is logged into Pictura developer account
        const res = await fetch('/api/developers/auth/session')
        const data = await res.json()

        if (res.ok && data.developer) {
          // User has a developer account, sync with CAPTCHA
          setMessage('Connecting your account...')
          
          // Create or update CAPTCHA session
          const syncRes = await fetch('/api/captcha/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ developerId: data.developer.id })
          })

          if (syncRes.ok) {
            setStatus('success')
            setMessage('Account connected successfully!')
            setTimeout(() => {
              router.push('/captcha/dashboard')
            }, 1500)
          } else {
            setStatus('error')
            setMessage('Failed to connect account. Please try again.')
          }
        } else {
          // No developer account found
          setStatus('no-account')
          setMessage('No Pictura account found')
        }
      } catch {
        setStatus('error')
        setMessage('Something went wrong. Please try again.')
      }
    }

    // Small delay for better UX
    setTimeout(checkAccount, 800)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm w-full text-center"
        >
          <div className="mb-8">
            {status === 'verifying' && (
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            {status === 'success' && (
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            )}
            {status === 'no-account' && (
              <div className="h-16 w-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
                <PicturaIcon size={32} />
              </div>
            )}
            {status === 'error' && (
              <div className="h-16 w-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            )}
          </div>

          <h1 className="text-xl font-semibold text-foreground mb-2">
            {status === 'verifying' && 'Verifying...'}
            {status === 'success' && 'Connected!'}
            {status === 'no-account' && 'Create an Account'}
            {status === 'error' && 'Something Went Wrong'}
          </h1>
          
          <p className="text-sm text-muted-foreground mb-6">{message}</p>

          {status === 'no-account' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You need a Pictura developer account to use PicturaCAPTCHA.
              </p>
              <button
                onClick={() => router.push('/developers/signup?redirect=/captcha/auth/verify')}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Create Pictura Account
              </button>
              <button
                onClick={() => router.push('/developers/login?redirect=/captcha/auth/verify')}
                className="w-full h-11 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                I Have an Account
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/captcha/login')}
                className="w-full h-11 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-muted/50 transition-colors"
              >
                Back to Login
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
