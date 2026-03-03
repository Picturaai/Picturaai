'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, UserPlus, LogIn } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type VerifyStatus = 'checking' | 'verifying' | 'syncing' | 'success' | 'no-account' | 'error'

export default function CaptchaAuthVerifyPage() {
  const router = useRouter()
  const [status, setStatus] = useState<VerifyStatus>('checking')
  const [userName, setUserName] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Step 1: Check if user is logged in
        setStatus('checking')
        await new Promise(resolve => setTimeout(resolve, 600))
        
        const sessionRes = await fetch('/api/developers/auth/session')
        const sessionData = await sessionRes.json()

        if (!sessionRes.ok || !sessionData.developer) {
          // Not logged in - show create account prompt
          setStatus('no-account')
          return
        }

        // Step 2: User is logged in, verify their details
        setStatus('verifying')
        setUserName(sessionData.developer.name?.split(' ')[0] || '')
        await new Promise(resolve => setTimeout(resolve, 800))

        // Step 3: Sync with CAPTCHA service
        setStatus('syncing')
        const syncRes = await fetch('/api/captcha/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ developerId: sessionData.developer.id })
        })

        if (!syncRes.ok) {
          throw new Error('Failed to sync account')
        }

        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Step 4: Success - redirect to dashboard
        setStatus('success')
        await new Promise(resolve => setTimeout(resolve, 1200))
        router.push('/captcha/dashboard')

      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage('Something went wrong. Please try again.')
      }
    }

    verifyAccount()
  }, [router])

  const getStatusContent = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-6 w-6 text-primary animate-spin" />,
          title: 'Checking Account',
          subtitle: 'Looking for your Pictura account...'
        }
      case 'verifying':
        return {
          icon: <Loader2 className="h-6 w-6 text-primary animate-spin" />,
          title: userName ? `Welcome back, ${userName}!` : 'Verifying Details',
          subtitle: 'Confirming your account information...'
        }
      case 'syncing':
        return {
          icon: <Loader2 className="h-6 w-6 text-primary animate-spin" />,
          title: 'Almost There',
          subtitle: 'Setting up your CAPTCHA dashboard...'
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
          title: 'All Set!',
          subtitle: 'Redirecting to your dashboard...'
        }
      case 'no-account':
        return {
          icon: <PicturaIcon size={24} />,
          title: 'No Account Found',
          subtitle: 'Create a free Pictura account to continue'
        }
      case 'error':
        return {
          icon: <XCircle className="h-6 w-6 text-destructive" />,
          title: 'Verification Failed',
          subtitle: errorMessage
        }
    }
  }

  const content = getStatusContent()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-sm w-full"
        >
          <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center"
              >
                {/* Icon */}
                <div className="h-14 w-14 mx-auto rounded-xl bg-muted/50 flex items-center justify-center mb-5">
                  {content.icon}
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-lg font-semibold text-foreground mb-1">
                  {content.title}
                </h1>
                <p className="text-sm text-muted-foreground mb-6">
                  {content.subtitle}
                </p>

                {/* Progress indicator for loading states */}
                {['checking', 'verifying', 'syncing', 'success'].includes(status) && (
                  <div className="flex justify-center gap-1.5 mb-2">
                    {['checking', 'verifying', 'syncing', 'success'].map((step, i) => (
                      <div
                        key={step}
                        className={`h-1 w-8 rounded-full transition-colors ${
                          ['checking', 'verifying', 'syncing', 'success'].indexOf(status) >= i
                            ? 'bg-primary'
                            : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* No Account Actions */}
                {status === 'no-account' && (
                  <div className="space-y-3 mt-6">
                    <button
                      onClick={() => router.push('/developers/signup?redirect=/captcha/auth/verify')}
                      className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Free Account
                    </button>
                    <button
                      onClick={() => router.push('/developers/login?redirect=/captcha/auth/verify')}
                      className="w-full h-11 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-muted/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In Instead
                    </button>
                  </div>
                )}

                {/* Error Actions */}
                {status === 'error' && (
                  <div className="space-y-3 mt-6">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push('/captcha')}
                      className="w-full h-11 rounded-xl border border-border bg-background text-foreground font-medium hover:bg-muted/50 transition-colors"
                    >
                      Back to CAPTCHA
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            <span className="text-primary">Pictura</span>CAPTCHA is free forever
          </p>
        </motion.div>
      </div>
    </div>
  )
}
