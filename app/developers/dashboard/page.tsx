'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Key,
  Copy,
  Eye,
  EyeOff,
  Plus,
  LogOut,
  TrendingUp,
  Zap,
  DollarSign,
  Settings,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface DeveloperData {
  id: string
  email: string
  name: string
  creditsBalance: number
  currency: string
  apiKeys: Array<{
    id: string
    name: string
    key: string
    created_at: string
    last_used: string | null
    requests_count: number
  }>
  usage: {
    thisMonth: number
    lastMonth: number
    totalRequests: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [developer, setDeveloper] = useState<DeveloperData | null>(null)
  const [loading, setLoading] = useState(true)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [creatingKey, setCreatingKey] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('developerToken')
    if (!token) {
      router.push('/developers/login')
      return
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/developers/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          localStorage.removeItem('developerToken')
          router.push('/developers/login')
          return
        }

        const data = await res.json()
        setDeveloper(data)
      } catch {
        toast.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleCreateKey = async () => {
    if (!developer) return

    setCreatingKey(true)
    try {
      const token = localStorage.getItem('developerToken')
      const res = await fetch('/api/developers/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: `API Key ${new Date().toLocaleDateString()}` }),
      })

      if (res.ok) {
        const newKey = await res.json()
        setDeveloper({
          ...developer,
          apiKeys: [...developer.apiKeys, newKey],
        })
        toast.success('API key created')
      } else {
        toast.error('Failed to create API key')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setCreatingKey(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('developerToken')
    router.push('/developers/login')
  }

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!developer) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Pictura Developer Dashboard</h1>
            <p className="text-sm text-muted-foreground">{developer.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Credits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/40 bg-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              {developer.creditsBalance < 10 && (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {developer.creditsBalance} {developer.currency}
            </h2>
            <p className="text-xs text-muted-foreground">
              {developer.creditsBalance < 50
                ? 'Low balance - consider adding more'
                : 'Good balance'}
            </p>
          </motion.div>

          {/* Requests Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border/40 bg-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">{developer.usage.totalRequests}</h2>
            <p className="text-xs text-muted-foreground">This month: {developer.usage.thisMonth}</p>
          </motion.div>

          {/* Usage Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border/40 bg-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">Month-over-Month</p>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {developer.usage.lastMonth > 0
                ? Math.round(
                    ((developer.usage.thisMonth - developer.usage.lastMonth) /
                      developer.usage.lastMonth) *
                      100
                  )
                : 0}
              %
            </h2>
            <p className="text-xs text-muted-foreground">Change from last month</p>
          </motion.div>
        </div>

        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/40 bg-card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">API Keys</h2>
              <p className="text-sm text-muted-foreground">Manage your API keys for authentication</p>
            </div>
            <button
              onClick={handleCreateKey}
              disabled={creatingKey}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Create Key
            </button>
          </div>

          {developer.apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No API keys yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {developer.apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="p-4 rounded-lg border border-border/40 bg-background/50 hover:border-border/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground text-sm mb-1">{key.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(key.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{key.requests_count}</p>
                      <p>requests</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-background rounded-lg p-3 mb-3 border border-border/40">
                    <code className="flex-1 text-xs font-mono text-foreground/70 truncate">
                      {visibleKeys.has(key.id) ? key.key : key.key.substring(0, 10) + '...'}
                    </code>
                    <button
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="Toggle visibility"
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(key.key)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {key.last_used
                      ? `Last used ${new Date(key.last_used).toLocaleDateString()}`
                      : 'Never used'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <Link
            href="/api/docs"
            className="p-6 rounded-xl border border-border/40 bg-card hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground">API Documentation</h3>
              <Zap className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground">
              Learn how to integrate Pictura into your application
            </p>
          </Link>

          <Link
            href="/developers/dashboard/settings"
            className="p-6 rounded-xl border border-border/40 bg-card hover:border-primary/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground">Account Settings</h3>
              <Settings className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-sm text-muted-foreground">
              Manage your profile and security settings
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
