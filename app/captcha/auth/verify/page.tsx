'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle2, XCircle, UserPlus, LogIn, Shield } from 'lucide-react'
import { Navbar } from '@/components/pictura/navbar'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

type VerifyStatus = 'checking' | 'found' | 'syncing' | 'success' | 'no-account' | 'error'

export default function CaptchaAuthVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || 'login' // Track where user came from
  
  const [status, setStatus] = useState<VerifyStatus>('checking')
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verifyAccount = async () => {
      try {
        // Step 1: Check if user has a session
        setStatus('checking')
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const sessionRes = await fetch('/api/developers/auth/session')
        const sessionData = await sessionRes.json()

        if (!sessionRes.ok || !sessionData.developer) {
          // Not logged in - show no account message
          setStatus('no-account')
          return
        }

        // Step 2: Account found - show user info
        setStatus('found')
        setUserName(sessionData.developer.name || '')
        setUserEmail(sessionData.developer.email || '')
        await new Promise(resolve => setTimeout(resolve, 1500))

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

        await new Promise(resolve => setTimeout(resolve, 600))
        
        // Step 4: Success - redirect to dashboard
        setStatus('success')
        await new Promise(resolve => setTimeout(resolve, 1000))
        router.push('/captcha/dashboard')

      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage('Something went wrong. Please try again.')
      }
    }

    verifyAccount()
  }, [router])

  const handleNoAccount = () => {
    // Redirect based on where they came from
    if (from === 'signup') {
      router.push('/developers/signup?redirect=/captcha/auth/verify')
    } else {
      router.push('/captcha/login')
    }
  }

  const getStatusContent = () => {
    switch (status) {
      case 'checking':
        return {
          icon: <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-spin" />,
          title: 'Checking Account',
          subtitle: 'Looking for your Pictura developer account...'
        }
      case 'found':
        return {
          icon: <PicturaIcon size={24} />,
          title: 'Account Found!',
          subtitle: `Fetching your details, ${userName.split(' ')[0] || 'developer'}...`
        }
      case 'syncing':
        return {
          icon: <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary animate-pulse" />,
          title: 'Linking Account',
          subtitle: 'Setting up your CAPTCHA dashboard...'
        }
      case 'success':
        return {
          icon: <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />,
          title: 'All Set!',
          subtitle: 'Redirecting to your dashboard...'
        }
      case 'no-account':
        return {
          icon: <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />,
          title: 'No Account Found',
          subtitle: 'We couldn\'t find a Pictura developer account'
        }
      case 'error':
        return {
          icon: <XCircle className="h-6 w-6 sm:h-7 sm:w-7 text-destructive" />,
          title: 'Verification Failed',
          subtitle: errorMessage
        }
    }
  }

  const content = getStatusContent()
  const progressSteps = ['checking', 'found', 'syncing', 'success']
  const currentIndex = progressSteps.indexOf(status)

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px] sm:max-w-sm"
        >
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
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
                <div className="h-12 w-12 sm:h-14 sm:w-14 mx-auto rounded-xl bg-muted/50 flex items-center justify-center mb-4 sm:mb-5">
                  {content.icon}
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-base sm:text-lg font-semibold text-foreground mb-1">
                  {content.title}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
                  {content.subtitle}
                </p>

                {/* User info when found */}
                {status === 'found' && userEmail && (
                  <div className="mb-5 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">Signed in as</p>
                    <p className="text-sm font-medium text-foreground truncate">{userEmail}</p>
                  </div>
                )}

                {/* Progress indicator for loading states */}
                {currentIndex >= 0 && status !== 'no-account' && status !== 'error' && (
                  <div className="flex justify-center gap-1.5 mb-2">
                    {progressSteps.map((step, i) => (
                      <div
                        key={step}
                        className={`h-1 w-6 sm:w-8 rounded-full transition-colors ${
                          currentIndex >= i ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* No Account Actions */}
                {status === 'no-account' && (
                  <div className="space-y-3 mt-5 sm:mt-6">
                    <button
                      onClick={() => router.push('/developers/signup?redirect=/captcha/auth/verify')}
                      className="w-full h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Create Free Account
                    </button>
                    <button
                      onClick={() => router.push('/developers/login?redirect=/captcha/auth/verify')}
                      className="w-full h-10 sm:h-11 rounded-xl border-2 border-primary/20 bg-primary/5 text-foreground text-sm font-medium hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In Instead
                    </button>
                    <button
                      onClick={handleNoAccount}
                      className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
                    >
                      Back to {from === 'signup' ? 'signup' : 'login'}
                    </button>
                  </div>
                )}

                {/* Error Actions */}
                {status === 'error' && (
                  <div className="space-y-3 mt-5 sm:mt-6">
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full h-10 sm:h-11 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => router.push('/captcha')}
                      className="w-full h-10 sm:h-11 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted/50 transition-colors"
                    >
                      Back to CAPTCHA
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] sm:text-xs text-muted-foreground mt-4">
            <span className="text-primary">Pictura</span>CAPTCHA is free forever
          </p>
        </motion.div>
      </div>
    </div>
  )
}
