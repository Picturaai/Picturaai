'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PicturaLogo } from '@/components/pictura/pictura-logo'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Failed to login')
        return
      }

      router.push(data.role === 'staff' ? '/staff/dashboard' : '/admin')
    } catch {
      setMessage('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(200,121,65,0.18),transparent_50%)]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border/60 bg-card/90 shadow-2xl backdrop-blur sm:grid-cols-2">
          <section className="hidden bg-gradient-to-br from-primary/15 via-transparent to-primary/5 p-8 sm:block">
            <PicturaLogo size="sm" />
            <h1 className="mt-8 text-3xl font-semibold leading-tight">Pictura Admin Suite</h1>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground">
              Manage sessions, support reports, staff workflows, and platform health from one responsive control center.
            </p>
          </section>

          <section className="p-5 sm:p-8">
            <div className="mb-5 flex items-center justify-between sm:hidden">
              <PicturaLogo size="sm" />
              <Link href="/studio" className="text-xs text-muted-foreground hover:underline">Back to Studio</Link>
            </div>

            <div className="mb-6 hidden justify-end sm:flex">
              <Link href="/studio" className="text-xs text-muted-foreground hover:underline">Back to Studio</Link>
            </div>

            <h2 className="text-xl font-semibold">Admin / Staff Login</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your configured credentials to continue.</p>

            <form onSubmit={onSubmit} className="mt-6 grid gap-3">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-11 rounded-xl border border-border/60 bg-background px-3 text-sm outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                type="password"
                className="h-11 rounded-xl border border-border/60 bg-background px-3 text-sm outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                disabled={loading}
                className="mt-1 h-11 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-95 disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {message ? <p className="mt-3 text-xs text-destructive">{message}</p> : null}
          </section>
        </div>
      </div>
    </main>
  )
}
