'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Settings,
  Bell,
  ChevronRight,
  Zap,
  TrendingUp,
  Clock,
  Shield,
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
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'usage' | 'settings'>('overview')

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
        toast.success('API key created successfully')
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

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(keyId)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedKey(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#C87941]" />
          <p className="text-sm text-neutral-500">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!developer) {
    return null
  }

  const currencySymbol = developer.currency === 'NGN' ? '₦' : developer.currency === 'USD' ? '$' : developer.currency
  const growthPercent = developer.usage.lastMonth > 0 
    ? Math.round(((developer.usage.thisMonth - developer.usage.lastMonth) / developer.usage.lastMonth) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-neutral-800 bg-[#0a0a0a] hidden lg:flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-neutral-800">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[#C87941] flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-white text-sm">Pictura</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 font-medium">API</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider px-3 py-2">
            Dashboard
          </div>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'keys', label: 'API Keys', icon: Key },
            { id: 'usage', label: 'Usage & Billing', icon: CreditCard },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all ${
                activeTab === item.id 
                  ? 'bg-neutral-800 text-white' 
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          
          <div className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider px-3 py-2 mt-4">
            Resources
          </div>
          <Link
            href="/api-docs"
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-all"
          >
            <FileText className="h-4 w-4" />
            Documentation
            <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
          </Link>
        </nav>

        {/* User Profile */}
        <div className="p-3 border-t border-neutral-800">
          <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#C87941] to-[#8B5A2B] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {developer.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{developer.name}</p>
                <p className="text-xs text-neutral-500 truncate">{developer.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 text-xs text-neutral-300 hover:text-white hover:border-neutral-600 transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-50 border-b border-neutral-800 bg-[#0a0a0a]/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-[#C87941] flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-semibold text-white text-sm">Pictura</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="p-2 text-neutral-400 hover:text-white">
              <Bell className="h-4 w-4" />
            </button>
            <button onClick={handleLogout} className="p-2 text-neutral-400 hover:text-white">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
          {['overview', 'keys', 'usage', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === tab ? 'bg-neutral-800 text-white' : 'text-neutral-500'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="lg:pl-64">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-semibold text-white">
                {activeTab === 'overview' && 'Overview'}
                {activeTab === 'keys' && 'API Keys'}
                {activeTab === 'usage' && 'Usage & Billing'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className="text-sm text-neutral-500 mt-1">
                {activeTab === 'overview' && 'Monitor your API usage and performance'}
                {activeTab === 'keys' && 'Manage your API keys and access tokens'}
                {activeTab === 'usage' && 'Track your usage and manage billing'}
                {activeTab === 'settings' && 'Configure your account settings'}
              </p>
            </div>
            {activeTab === 'keys' && (
              <button
                onClick={handleCreateKey}
                disabled={creatingKey}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                {creatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Create Key
              </button>
            )}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-[#C87941]" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-white">
                    {currencySymbol}{developer.creditsBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">Available Credits</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-blue-500" />
                    </div>
                    {growthPercent !== 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${growthPercent > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {growthPercent > 0 ? '+' : ''}{growthPercent}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-semibold text-white">{developer.usage.thisMonth.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-1">Requests This Month</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-white">{developer.usage.totalRequests.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-1">Total Requests</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Key className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <p className="text-2xl font-semibold text-white">{developer.apiKeys.length}</p>
                  <p className="text-xs text-neutral-500 mt-1">Active API Keys</p>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/api-docs"
                  className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-[#C87941]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">Documentation</h3>
                        <p className="text-xs text-neutral-500">Learn how to integrate the API</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                  </div>
                </Link>

                <button
                  onClick={() => setActiveTab('keys')}
                  className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-white">Manage API Keys</h3>
                        <p className="text-xs text-neutral-500">Create and manage your keys</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-neutral-600 group-hover:text-neutral-400 transition-colors" />
                  </div>
                </button>
              </div>

              {/* Recent API Keys */}
              {developer.apiKeys.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-white">Recent API Keys</h2>
                    <button 
                      onClick={() => setActiveTab('keys')}
                      className="text-xs text-neutral-500 hover:text-white transition-colors"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-3">
                    {developer.apiKeys.slice(0, 3).map((key, index) => (
                      <motion.div
                        key={key.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-neutral-800 flex items-center justify-center">
                            <Key className="h-4 w-4 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{key.name}</p>
                            <p className="text-xs text-neutral-500">
                              Created {new Date(key.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{key.requests_count.toLocaleString()}</p>
                          <p className="text-xs text-neutral-500">requests</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'keys' && (
            <div className="space-y-6">
              {developer.apiKeys.length === 0 ? (
                <div className="text-center py-16 rounded-xl border border-dashed border-neutral-800">
                  <div className="h-12 w-12 rounded-xl bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                    <Key className="h-6 w-6 text-neutral-500" />
                  </div>
                  <h3 className="text-sm font-medium text-white mb-2">No API keys yet</h3>
                  <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
                    Create your first API key to start making requests to the Pictura API
                  </p>
                  <button
                    onClick={handleCreateKey}
                    disabled={creatingKey}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create API Key
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {developer.apiKeys.map((key, index) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                            <Key className="h-5 w-5 text-neutral-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">{key.name}</h3>
                            <p className="text-xs text-neutral-500">
                              Created {new Date(key.created_at).toLocaleDateString()} · {key.requests_count.toLocaleString()} requests
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500">Active</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700">
                        <code className="flex-1 text-sm font-mono text-neutral-300 truncate">
                          {visibleKeys.has(key.id) ? key.key : key.key.substring(0, 12) + '••••••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="p-2 rounded-md hover:bg-neutral-700 transition-colors"
                        >
                          {visibleKeys.has(key.id) ? (
                            <EyeOff className="h-4 w-4 text-neutral-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-neutral-400" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.key, key.id)}
                          className="p-2 rounded-md hover:bg-neutral-700 transition-colors"
                        >
                          {copiedKey === key.id ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4 text-neutral-400" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {key.last_used ? `Last used ${new Date(key.last_used).toLocaleDateString()}` : 'Never used'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="h-3 w-3" />
                          Full access
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-6">
              {/* Balance Card */}
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-neutral-500 mb-2">Current Balance</p>
                    <p className="text-3xl font-semibold text-white">
                      {currencySymbol}{developer.creditsBalance.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-500 mt-2">
                      ~{Math.floor(developer.creditsBalance / (developer.currency === 'NGN' ? 5 : 0.01)).toLocaleString()} images remaining
                    </p>
                  </div>
                  <Link
                    href="/developers/dashboard/billing"
                    className="px-4 py-2 rounded-md bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors"
                  >
                    Add Credits
                  </Link>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <p className="text-xs text-neutral-500 mb-2">This Month</p>
                  <p className="text-2xl font-semibold text-white">{developer.usage.thisMonth.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-1">API requests</p>
                </div>
                <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                  <p className="text-xs text-neutral-500 mb-2">Last Month</p>
                  <p className="text-2xl font-semibold text-white">{developer.usage.lastMonth.toLocaleString()}</p>
                  <p className="text-xs text-neutral-500 mt-1">API requests</p>
                </div>
              </div>

              {/* Pricing */}
              <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <h3 className="text-sm font-medium text-white mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
                        <Zap className="h-4 w-4 text-[#C87941]" />
                      </div>
                      <span className="text-sm text-neutral-300">Image generation</span>
                    </div>
                    <span className="text-sm font-medium text-white">{currencySymbol}{developer.currency === 'NGN' ? '5' : '0.01'}/image</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Profile Settings */}
              <div className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50">
                <h3 className="text-sm font-medium text-white mb-4">Profile</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#C87941] to-[#8B5A2B] flex items-center justify-center">
                    <span className="text-xl font-semibold text-white">
                      {developer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-white">{developer.name}</p>
                    <p className="text-sm text-neutral-500">{developer.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      defaultValue={developer.name}
                      className="w-full h-10 px-3 rounded-lg bg-neutral-800 border border-neutral-700 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#C87941] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      defaultValue={developer.email}
                      disabled
                      className="w-full h-10 px-3 rounded-lg bg-neutral-800/50 border border-neutral-700 text-sm text-neutral-500 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="p-6 rounded-xl border border-red-500/20 bg-red-500/5">
                <h3 className="text-sm font-medium text-red-500 mb-2">Danger Zone</h3>
                <p className="text-xs text-neutral-500 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button className="px-4 py-2 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-500 hover:bg-red-500/20 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
