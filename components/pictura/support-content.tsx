'use client'

import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { motion } from 'framer-motion'
import { Heart, Coffee, Rocket, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const supportTiers = [
  {
    icon: Coffee,
    title: 'Coffee',
    amount: 2000,
    description: 'Support the dev team with a coffee',
  },
  {
    icon: Heart,
    title: 'Supporter',
    amount: 5000,
    description: 'Help us keep the servers running',
  },
  {
    icon: Rocket,
    title: 'Booster',
    amount: 10000,
    description: 'Help us build faster and better',
  },
  {
    icon: Star,
    title: 'Champion',
    amount: 25000,
    description: 'Become a founding supporter',
  },
]

export function SupportContent() {
  const [loading, setLoading] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
    }
  }, [searchParams])

  const handleDonate = async (amount: number) => {
    setLoading(amount)
    try {
      const response = await fetch('https://api.korapay.com/merchant/api/v1/charges/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KORAPAY_SECRET_KEY}`,
        },
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'NGN',
          reference: `PICTURA-${Date.now()}`,
          description: `Support Pictura - ₦${amount.toLocaleString()} donation`,
          channels: ['card', 'bank_transfer', 'ussd'],
          customer: {
            name: 'Pictura Supporter',
            email: 'support@sidihost.sbs',
          },
          metadata: {
            campaign: 'pictura-support',
          },
          notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/korapay-webhook`,
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/support?success=true`,
        }),
      })

      const data = await response.json()
      if (data.status && data.data?.checkout_url) {
        window.location.href = data.data.checkout_url
      } else {
        alert('Payment initialization failed. Please try again.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Support</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-foreground">Help Us Grow</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Pictura is free and always will be. Your support helps us improve features, scale infrastructure, and build amazing tools for creators worldwide.
            </p>
          </motion.div>

          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 p-4 rounded-lg border border-primary/30 bg-primary/10 text-foreground"
            >
              <p className="font-semibold">Thank you for your generous support!</p>
              <p className="text-sm text-muted-foreground">Your contribution means the world to us.</p>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {supportTiers.map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="group rounded-xl border border-border/50 bg-card/40 backdrop-blur hover:border-primary/30 hover:bg-card/60 transition-all overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-primary/80 to-primary" />
                <div className="p-6">
                  <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <tier.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{tier.title}</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{tier.amount.toLocaleString()} NGN</p>
                  <p className="text-xs text-muted-foreground mb-4">{tier.description}</p>
                  <button
                    onClick={() => handleDonate(tier.amount)}
                    disabled={loading === tier.amount}
                    className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading === tier.amount ? 'Processing...' : 'Donate'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl border border-border/50 bg-card/40 p-8 md:p-12"
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">What We Use Your Support For</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Better AI Models</h3>
                <p className="text-sm text-muted-foreground">Upgrading to more powerful AI models for better image quality and faster generation.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Server Infrastructure</h3>
                <p className="text-sm text-muted-foreground">Scaling our servers to handle more users and provide faster, more reliable service.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">New Features</h3>
                <p className="text-sm text-muted-foreground">Building exciting new tools and capabilities based on community feedback.</p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Team Growth</h3>
                <p className="text-sm text-muted-foreground">Hiring talented developers and designers to accelerate our roadmap.</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
            className="mt-12 p-8 rounded-xl border border-primary/20 bg-primary/5 text-center"
          >
            <h3 className="text-xl font-semibold text-foreground mb-3">Other Ways to Help</h3>
            <p className="text-muted-foreground mb-4">
              Can't donate? No problem! You can still support us by:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>Sharing Pictura with friends and family</li>
              <li>Leaving feedback and suggestions</li>
              <li>Reporting bugs to help us improve</li>
              <li>Following us on social media</li>
            </ul>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
