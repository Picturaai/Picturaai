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
  CreditCard,
  BarChart3,
  FileText,
  Settings,
  Loader2,
  Check,
  ExternalLink,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

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
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'usage'>('overview')

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
        toast.success('API key created successfully')
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

  const currencySymbol = developer.currency === 'NGN' ? '₦' : developer.currency === 'USD' ? '$' : developer.currency

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card hidden lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <PicturaIcon size={24} className="text-primary" />
              <span className="font-semibold text-foreground">Pictura</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('keys')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'keys' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Key className="h-4 w-4" />
              API Keys
            </button>
            <button
              onClick={() => setActiveTab('usage')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'usage' 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              Usage & Billing
            </button>
            <Link
              href="/api-docs"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <FileText className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {developer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{developer.name}</p>
                <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <PicturaIcon size={20} className="text-primary" />
            <span className="font-semibold text-foreground">Pictura</span>
          </Link>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto">
          {['overview', 'keys', 'usage'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'keys' && 'API Keys'}
              {activeTab === 'usage' && 'Usage & Billing'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {activeTab === 'overview' && 'Overview of your Pictura API usage'}
              {activeTab === 'keys' && 'Manage your API keys for authentication'}
              {activeTab === 'usage' && 'Monitor your usage and manage billing'}
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <p className="text-sm text-muted-foreground mb-1">Available Credits</p>
                  <p className="text-2xl font-bold text-foreground">
                    {currencySymbol}{developer.creditsBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ~{Math.floor(developer.creditsBalance / (developer.currency === 'NGN' ? 5 : 0.01))} images
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">API requests</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-6 rounded-xl border border-border bg-card"
                >
                  <p className="text-sm text-muted-foreground mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-foreground">{developer.usage.totalRequests.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </motion.div>
              </div>

              {/* Quick actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/api-docs"
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group"
                >
                  <FileText className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to integrate Pictura API into your application
                  </p>
                </Link>

                <button
                  onClick={() => setActiveTab('keys')}
                  className="p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors text-left group"
                >
                  <Key className="h-5 w-5 text-primary mb-3" />
                  <h3 className="font-semibold text-foreground mb-1">API Keys</h3>
                  <p className="text-sm text-muted-foreground">
                    Create and manage your API keys
                  </p>
                </button>
              </div>

              {/* Recent keys */}
              {developer.apiKeys.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Recent API Keys</h2>
                  <div className="space-y-3">
                    {developer.apiKeys.slice(0, 2).map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
                      >
                        <div>
                          <p className="font-medium text-foreground">{key.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">{key.requests_count}</p>
                          <p className="text-sm text-muted-foreground">requests</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {developer.apiKeys.length} key{developer.apiKeys.length !== 1 ? 's' : ''} created
                </p>
                <button
                  onClick={handleCreateKey}
                  disabled={creatingKey}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {creatingKey ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create New Key
                </button>
              </div>

              {developer.apiKeys.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-dashed border-border">
                  <Key className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-1">No API keys yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first API key to get started</p>
                  <button
                    onClick={handleCreateKey}
                    disabled={creatingKey}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create API Key
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {developer.apiKeys.map((key) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-xl border border-border bg-card"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{key.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(key.created_at).toLocaleDateString()} · {key.requests_count} requests
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                        <code className="flex-1 text-sm font-mono text-foreground truncate">
                          {visibleKeys.has(key.id) ? key.key : key.key.substring(0, 12) + '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-2 rounded-md hover:bg-secondary transition-colors"
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
                          className="p-2 rounded-md hover:bg-secondary transition-colors"
                          title="Copy"
                        >
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-3">
                        {key.last_used
                          ? `Last used ${new Date(key.last_used).toLocaleDateString()}`
                          : 'Never used'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Current balance */}
              <div className="p-6 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                    <p className="text-3xl font-bold text-foreground">
                      {currencySymbol}{developer.creditsBalance.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Approximately {Math.floor(developer.creditsBalance / (developer.currency === 'NGN' ? 5 : 0.01)).toLocaleString()} images remaining
                    </p>
                  </div>
                  <Link
                    href="/developers/dashboard/billing"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add Credits
                  </Link>
                </div>
              </div>

              {/* Usage stats */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl border border-border bg-card">
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-2xl font-bold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">requests</p>
                </div>
                <div className="p-6 rounded-xl border border-border bg-card">
                  <p className="text-sm text-muted-foreground mb-1">Last Month</p>
                  <p className="text-2xl font-bold text-foreground">{developer.usage.lastMonth.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground mt-1">requests</p>
                </div>
              </div>

              {/* Pricing info */}
              <div className="p-6 rounded-xl border border-border bg-secondary/30">
                <h3 className="font-semibold text-foreground mb-3">Pricing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per image generation</span>
                    <span className="font-medium text-foreground">{currencySymbol}{developer.currency === 'NGN' ? '5' : '0.01'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate limit</span>
                    <span className="font-medium text-foreground">10 requests/min</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
