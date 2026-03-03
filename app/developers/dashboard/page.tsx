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
  Loader2,
  Check,
  ExternalLink,
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
    const token = localStorage.getItem('pictura_session')
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
          localStorage.removeItem('pictura_session')
          localStorage.removeItem('pictura_developer')
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
      const token = localStorage.getItem('pictura_session')
      const res = await fetch('/api/developers/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: `Key ${new Date().toLocaleDateString()}` }),
      })

      if (res.ok) {
        const newKey = await res.json()
        setDeveloper({
          ...developer,
          apiKeys: [...developer.apiKeys, newKey],
        })
        toast.success('API key created')
      } else {
        toast.error('Failed to create key')
      }
    } catch {
      toast.error('An error occurred')
    } finally {
      setCreatingKey(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('pictura_session')
    localStorage.removeItem('pictura_developer')
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
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
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
      <aside className="fixed inset-y-0 left-0 w-56 border-r border-border bg-card hidden lg:block">
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-border">
            <Link href="/" className="flex items-center gap-2">
              <PicturaIcon size={20} className="text-primary" />
              <span className="font-medium text-sm text-foreground">Pictura</span>
            </Link>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'keys', label: 'API Keys', icon: Key },
              { id: 'usage', label: 'Usage', icon: CreditCard },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as typeof activeTab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
            <Link
              href="/api-docs"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <FileText className="h-4 w-4" />
              Docs
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </Link>
          </nav>

          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5 px-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
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
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-secondary text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <PicturaIcon size={18} className="text-primary" />
            <span className="font-medium text-sm text-foreground">Pictura</span>
          </Link>
          <button onClick={handleLogout} className="p-2 text-muted-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {['overview', 'keys', 'usage'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-56">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="mb-6">
            <h1 className="text-lg font-semibold text-foreground">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'keys' && 'API Keys'}
              {activeTab === 'usage' && 'Usage & Billing'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === 'overview' && 'Overview of your API usage'}
              {activeTab === 'keys' && 'Manage your API keys'}
              {activeTab === 'usage' && 'Monitor usage and billing'}
            </p>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="grid sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <p className="text-xs text-muted-foreground mb-1">Credits</p>
                  <p className="text-xl font-semibold text-foreground">
                    {currencySymbol}{developer.creditsBalance.toLocaleString()}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="text-xl font-semibold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 rounded-lg border border-border bg-card"
                >
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="text-xl font-semibold text-foreground">{developer.usage.totalRequests.toLocaleString()}</p>
                </motion.div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/api-docs"
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors"
                >
                  <FileText className="h-4 w-4 text-primary mb-2" />
                  <h3 className="text-sm font-medium text-foreground mb-0.5">Documentation</h3>
                  <p className="text-xs text-muted-foreground">Learn how to integrate the API</p>
                </Link>

                <button
                  onClick={() => setActiveTab('keys')}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-colors text-left"
                >
                  <Key className="h-4 w-4 text-primary mb-2" />
                  <h3 className="text-sm font-medium text-foreground mb-0.5">API Keys</h3>
                  <p className="text-xs text-muted-foreground">Create and manage keys</p>
                </button>
              </div>

              {developer.apiKeys.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-foreground mb-3">Recent Keys</h2>
                  <div className="space-y-2">
                    {developer.apiKeys.slice(0, 2).map((key) => (
                      <div
                        key={key.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{key.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">{key.requests_count}</p>
                          <p className="text-xs text-muted-foreground">requests</p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {developer.apiKeys.length} key{developer.apiKeys.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={handleCreateKey}
                  disabled={creatingKey}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {creatingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                  Create Key
                </button>
              </div>

              {developer.apiKeys.length === 0 ? (
                <div className="text-center py-10 rounded-lg border border-dashed border-border">
                  <Key className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-foreground mb-1">No API keys</h3>
                  <p className="text-xs text-muted-foreground mb-3">Create your first key to get started</p>
                  <button
                    onClick={handleCreateKey}
                    disabled={creatingKey}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Key
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {developer.apiKeys.map((key) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">{key.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            Created {new Date(key.created_at).toLocaleDateString()} · {key.requests_count} requests
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50 border border-border">
                        <code className="flex-1 text-xs font-mono text-foreground truncate">
                          {visibleKeys.has(key.id) ? key.key : key.key.substring(0, 12) + '••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-1.5 rounded hover:bg-secondary transition-colors"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key)}
                          className="p-1.5 rounded hover:bg-secondary transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-2">
                        {key.last_used ? `Last used ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg border border-border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Balance</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {currencySymbol}{developer.creditsBalance.toLocaleString()}
                    </p>
                  </div>
                  <Link
                    href="/developers/dashboard/billing"
                    className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Add Credits
                  </Link>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="text-xl font-semibold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">requests</p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <p className="text-xs text-muted-foreground mb-1">Last Month</p>
                  <p className="text-xl font-semibold text-foreground">{developer.usage.lastMonth.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">requests</p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border bg-card">
                <h3 className="text-sm font-medium text-foreground mb-3">Pricing</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Image generation</span>
                    <span className="text-foreground">{currencySymbol}{developer.currency === 'NGN' ? '5' : '0.01'}/image</span>
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
