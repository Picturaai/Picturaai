'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Book,
  ChevronDown,
  Loader2,
  Menu,
  X,
  Activity,
  ArrowUpRight,
  Shield,
  Wallet,
  Lock,
  User,
  DollarSign,
  Gift,
  Sparkles,
  Rocket,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
  Clock,
  TrendingUp,
  Code2,
  Play,
  FileCode,
  Terminal,
} from 'lucide-react'
import { PicturaLogo, PicturaIcon } from '@/components/pictura/pictura-logo'
import { PatternAvatar } from '@/components/pictura/pattern-avatar'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  secret_key?: string
  createdAt: string
  lastUsed: string | null
  requestsCount: number
  isActive: boolean
}

interface Developer {
  id: string
  email: string
  name: string
  creditsBalance: number
  currency: string
  tier: string
  createdAt: string
  lastLogin: string
  apiKeys: ApiKey[]
  usage: {
    thisMonth: number
    lastMonth: number
    totalRequests: number
  }
  transactions: {
    id: string
    type: string
    amount: number
    description: string
    balanceAfter: number
    createdAt: string
  }[]
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', CAD: 'C$',
  AUD: 'A$', INR: '₹', ZAR: 'R', KES: 'KSh', GHS: 'GH₵',
  JPY: '¥', BRL: 'R$',
}

export default function DeveloperDashboard() {
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'api-keys' | 'usage' | 'billing' | 'settings' | 'playground'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  const [showSecretFor, setShowSecretFor] = useState<string | null>(null)
  
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)
  const [deletingKey, setDeletingKey] = useState(false)
  
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{name: string, credits: number, price: number} | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [editableName, setEditableName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [pendingPaymentUrl, setPendingPaymentUrl] = useState<string | null>(null)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const localToken = localStorage.getItem('pictura_session')
      
      const headers: HeadersInit = {}
      if (localToken) {
        headers['Authorization'] = `Bearer ${localToken}`
      }
      
      const res = await fetch('/api/developers/dashboard', {
        credentials: 'include',
        headers,
      })
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        if (res.status === 401) {
          localStorage.removeItem('pictura_session')
          localStorage.removeItem('pictura_developer')
          window.location.href = '/developers/login'
          return
        }
        toast.error(errorData.error || 'Failed to load dashboard')
        return
      }

      const data = await res.json()
      setDeveloper(data)
      
      const hasSeenOnboarding = localStorage.getItem('pictura_onboarding_complete')
      if (!hasSeenOnboarding && data.apiKeys?.length <= 1) {
        setShowOnboarding(true)
      }
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  useEffect(() => {
    if (developer?.name) setEditableName(developer.name)
  }, [developer?.name])

  useEffect(() => {
    const paymentState = new URLSearchParams(window.location.search).get('payment')
    const pendingUrl = localStorage.getItem('pictura_pending_payment_url')
    if (pendingUrl) setPendingPaymentUrl(pendingUrl)

    if (paymentState === 'success') {
      localStorage.removeItem('pictura_pending_payment_url')
      setPendingPaymentUrl(null)
      toast.success('Payment successful! Credits will reflect shortly.')
    } else if (paymentState === 'cancel' || paymentState === 'cancelled') {
      toast.info('Payment pending. You can continue from your saved payment link.')
    }
  }, [])

  const handleUpdateName = async () => {
    if (!editableName.trim() || !developer || editableName.trim() === developer.name) return
    setSavingName(true)
    try {
      const token = localStorage.getItem('pictura_session')
      const res = await fetch('/api/developers/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: editableName.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Failed to update name')
        return
      }
      toast.success('Profile updated')
      fetchDashboard()
    } catch {
      toast.error('Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleLogout = async () => {
    try {
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = {}
      if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      
      await fetch('/api/developers/auth/logout', {
        method: 'POST',
        headers,
        credentials: 'include',
      })
    } finally {
      localStorage.removeItem('pictura_session')
      localStorage.removeItem('pictura_developer')
      window.location.href = '/developers/login'
    }
  }

  const handleDeleteAccount = async () => {
    setDeletingAccount(true)
    try {
      const localToken = localStorage.getItem('pictura_session')
      const res = await fetch('/api/developers/profile', {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          ...(localToken ? { Authorization: `Bearer ${localToken}` } : {}),
        },
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete account')
        return
      }

      toast.success('Account deleted successfully')
      localStorage.removeItem('pictura_session')
      localStorage.removeItem('pictura_developer')
      localStorage.removeItem('pictura_pending_payment_url')
      window.location.href = '/developers/login'
    } catch {
      toast.error('Failed to delete account')
    } finally {
      setDeletingAccount(false)
      setShowDeleteAccountDialog(false)
    }
  }

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key')
      return
    }

    setCreatingKey(true)
    try {
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      
      const res = await fetch('/api/developers/api-keys', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ name: newKeyName.trim() }),
      })

      const data = await res.json()

      if (res.ok && data.key) {
        setNewlyCreatedKey(data.key)
        toast.success('API key created! Save it now - it won\'t be shown again.')
        fetchDashboard()
      } else {
        toast.error(data.error || 'Failed to create API key')
      }
    } catch {
      toast.error('Failed to create API key')
    } finally {
      setCreatingKey(false)
    }
  }

  const handleDeleteKey = async () => {
    if (!keyToDelete) return

    setDeletingKey(true)
    try {
      const localToken = localStorage.getItem('pictura_session')
      const headers: HeadersInit = {}
      if (localToken) headers['Authorization'] = `Bearer ${localToken}`
      
      const res = await fetch(`/api/developers/api-keys?id=${keyToDelete.id}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
      })

      if (res.ok) {
        toast.success('API key deleted')
        fetchDashboard()
        setKeyToDelete(null)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete API key')
      }
    } catch {
      toast.error('Failed to delete API key')
    } finally {
      setDeletingKey(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopiedKey(false), 2000)
  }

  const completeOnboarding = () => {
    localStorage.setItem('pictura_onboarding_complete', 'true')
    setShowOnboarding(false)
  }

  const formatCurrency = (amount: number) => {
    const symbol = developer ? CURRENCY_SYMBOLS[developer.currency] || '$' : '$'
    return `${symbol}${amount.toFixed(2)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const profileInitial = (developer?.name || developer?.email || 'D').charAt(0).toUpperCase()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#C87941]/20 border-t-[#C87941] animate-spin" />
            <PicturaIcon size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-[#6B6B6B] text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!developer) return null

  const navItems: Array<{
    id: 'overview' | 'api-keys' | 'usage' | 'billing' | 'settings' | 'playground'
    label: string
    icon: typeof BarChart3
    comingSoon?: boolean
  }> = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'usage', label: 'Usage', icon: Activity },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'playground', label: 'Playground', icon: Rocket, comingSoon: true },
  ]

  const usagePercentChange = developer.usage.lastMonth > 0 
    ? Math.round(((developer.usage.thisMonth - developer.usage.lastMonth) / developer.usage.lastMonth) * 100)
    : 0

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#FAFAFA] overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#1F1F1F]">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-9 h-9 rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#222] flex items-center justify-center transition-colors"
        >
          <Menu className="h-4 w-4 text-[#999]" />
        </button>
        <Link href="/" className="transition-opacity hover:opacity-80">
          <PicturaIcon size={28} />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C87941] to-[#8B4D26] flex items-center justify-center text-white text-sm font-medium">
              {profileInitial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-[#2A2A2A] text-[#FAFAFA]">
            <div className="px-3 py-2 border-b border-[#2A2A2A]">
              <p className="text-sm font-medium truncate">{developer.name}</p>
              <p className="text-xs text-[#888] truncate">{developer.email}</p>
            </div>
            <DropdownMenuItem onClick={() => setActiveTab('settings')} className="text-[#CCC] hover:text-white hover:bg-[#2A2A2A]">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#2A2A2A]" />
            <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div 
          className={`fixed inset-y-0 left-0 w-72 bg-[#0D0D0D] border-r border-[#1F1F1F] transform transition-transform duration-300 ease-out flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-[#1F1F1F]">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <PicturaLogo size="sm" />
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="w-8 h-8 rounded-lg bg-[#1A1A1A] hover:bg-[#222] flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-[#999]" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.comingSoon) {
                    toast.info('Playground is coming soon')
                    return
                  }
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-[#1F1F1F] text-white font-medium'
                    : 'text-[#888] hover:text-[#CCC] hover:bg-[#1A1A1A]'
                } ${item.comingSoon ? 'opacity-60' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.comingSoon && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#888]">Soon</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-[#1F1F1F]">
            <Link
              href="/api-docs"
              target="_blank"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-[#CCC] hover:bg-[#1A1A1A] transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-[#1F1F1F]">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-[#0D0D0D] border-r border-[#1F1F1F] fixed left-0 top-0 bottom-0">
          <div className="h-14 flex items-center px-5 border-b border-[#1F1F1F]">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <PicturaLogo size="sm" />
            </Link>
          </div>
          
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.comingSoon) {
                    toast.info('Playground is coming soon')
                    return
                  }
                  setActiveTab(item.id)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-[#1F1F1F] text-white font-medium'
                    : 'text-[#888] hover:text-[#CCC] hover:bg-[#1A1A1A]'
                } ${item.comingSoon ? 'opacity-60' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.comingSoon && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-[#2A2A2A] text-[#888]">Soon</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-[#1F1F1F]">
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#888] hover:text-[#CCC] hover:bg-[#1A1A1A] transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-[#1F1F1F]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[#1A1A1A] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C87941] to-[#8B4D26] flex items-center justify-center text-white text-sm font-medium shrink-0">
                    {profileInitial}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-white truncate">{developer.name}</p>
                    <p className="text-xs text-[#666] truncate">{developer.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-[#666] shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-[#2A2A2A] text-[#FAFAFA]">
                <DropdownMenuItem onClick={() => setActiveTab('settings')} className="text-[#CCC] hover:text-white hover:bg-[#2A2A2A]">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('billing')} className="text-[#CCC] hover:text-white hover:bg-[#2A2A2A]">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm text-[#888]">Credits</span>
                  <span className="text-sm font-medium text-[#C87941]">{formatCurrency(developer.creditsBalance)}</span>
                </div>
                <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
          {/* Top Bar */}
          <div className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-[#1F1F1F] bg-[#0D0D0D] sticky top-0 z-30">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#666]">Dashboard</span>
              <ChevronRight className="h-4 w-4 text-[#444]" />
              <span className="text-white capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowPricingModal(true)}
                variant="outline" 
                size="sm" 
                className="h-8 border-[#2A2A2A] bg-transparent text-[#C87941] hover:bg-[#C87941]/10 hover:text-[#C87941] hover:border-[#C87941]/50"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                {formatCurrency(developer.creditsBalance)}
              </Button>
            </div>
          </div>

          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Header */}
                <div>
                  <h1 className="text-2xl font-semibold text-white">Welcome back, {developer.name?.split(' ')[0]}</h1>
                  <p className="text-[#888] text-sm mt-1">Here's an overview of your API usage and account status.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Credits Card */}
                  <div className="sm:col-span-2 lg:col-span-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#C87941] to-[#8B4D26] p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-white/70 text-xs font-medium mb-2">
                        <Wallet className="h-3.5 w-3.5" />
                        AVAILABLE CREDITS
                      </div>
                      <div className="text-3xl font-bold text-white tracking-tight">
                        {formatCurrency(developer.creditsBalance)}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge className="bg-white/20 text-white border-0 text-[10px] font-medium">
                          {developer.tier?.toUpperCase() || 'FREE'} TIER
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <Activity className="h-3.5 w-3.5" />
                      THIS MONTH
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {developer.usage.thisMonth.toLocaleString()}
                    </div>
                    {developer.usage.lastMonth > 0 && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${usagePercentChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        <TrendingUp className="h-3 w-3" />
                        <span>{usagePercentChange >= 0 ? '+' : ''}{usagePercentChange}% vs last month</span>
                      </div>
                    )}
                  </div>

                  {/* Total Requests */}
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <BarChart3 className="h-3.5 w-3.5" />
                      TOTAL REQUESTS
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {developer.usage.totalRequests.toLocaleString()}
                    </div>
                    <div className="text-xs text-[#666] mt-2">All time</div>
                  </div>

                  {/* API Keys */}
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <Key className="h-3.5 w-3.5" />
                      API KEYS
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {developer.apiKeys.filter(k => k.isActive).length}
                    </div>
                    <div className="text-xs text-[#666] mt-2">{developer.apiKeys.length} total</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button 
                    onClick={() => setActiveTab('api-keys')}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#1F1F1F] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center group-hover:bg-[#333] transition-colors">
                      <Key className="h-5 w-5 text-[#C87941]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">Manage API Keys</h3>
                      <p className="text-xs text-[#666] truncate">Create and manage your keys</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#444] group-hover:text-[#666] transition-colors" />
                  </button>

                  <button 
                    onClick={() => window.open('/api-docs', '_blank')}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#1F1F1F] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center group-hover:bg-[#333] transition-colors">
                      <FileCode className="h-5 w-5 text-[#C87941]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">API Documentation</h3>
                      <p className="text-xs text-[#666] truncate">Reference and guides</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-[#444] group-hover:text-[#666] transition-colors" />
                  </button>

                  <button 
                    onClick={() => setShowPricingModal(true)}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#1F1F1F] transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#2A2A2A] flex items-center justify-center group-hover:bg-[#333] transition-colors">
                      <Zap className="h-5 w-5 text-[#C87941]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-white">Buy Credits</h3>
                      <p className="text-xs text-[#666] truncate">Top up your balance</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#444] group-hover:text-[#666] transition-colors" />
                  </button>
                </div>

                {/* Code Example */}
                <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <Terminal className="h-4 w-4 text-[#C87941]" />
                      Quick Start
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-[#888] hover:text-white hover:bg-[#2A2A2A]"
                      onClick={() => copyToClipboard(`curl -X POST https://api.pictura.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A beautiful sunset over mountains"}'`)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-4 font-mono text-sm text-[#AAA] overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-all">{`curl -X POST https://api.pictura.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A beautiful sunset over mountains"}'`}</pre>
                  </div>
                </div>

                {/* Recent Activity */}
                {developer.transactions && developer.transactions.length > 0 && (
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#2A2A2A]">
                      <h3 className="text-sm font-medium text-white">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-[#2A2A2A]">
                      {developer.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-[#C87941]/10' : 'bg-[#2A2A2A]'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-4 w-4 ${tx.amount > 0 ? 'text-[#C87941]' : 'text-[#666]'}`} />
                              ) : (
                                <DollarSign className={`h-4 w-4 ${tx.amount > 0 ? 'text-[#C87941]' : 'text-[#666]'}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                              <p className="text-xs text-[#666]">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-[#888]'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-white">API Keys</h1>
                    <p className="text-[#888] text-sm mt-1">Manage your API keys for Pictura API access.</p>
                  </div>
                  <Button 
                    onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} 
                    className="bg-[#C87941] hover:bg-[#B86D35] text-white h-9"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create new key
                  </Button>
                </div>

                <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                  {developer.apiKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-4">
                        <Key className="h-8 w-8 text-[#666]" />
                      </div>
                      <h3 className="font-medium text-white mb-1">No API keys yet</h3>
                      <p className="text-sm text-[#666] text-center mb-4">Create your first API key to start using the Pictura API</p>
                      <Button 
                        onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} 
                        variant="outline"
                        className="border-[#3A3A3A] bg-transparent text-white hover:bg-[#2A2A2A]"
                      >
                        Create new key
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[#2A2A2A]">
                      {/* Header */}
                      <div className="hidden sm:grid grid-cols-[1fr,auto,auto] gap-4 px-4 py-2 text-xs text-[#666] uppercase tracking-wider font-medium">
                        <div>Name</div>
                        <div className="w-24 text-center">Requests</div>
                        <div className="w-32 text-right">Actions</div>
                      </div>
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex flex-col sm:grid sm:grid-cols-[1fr,auto,auto] gap-2 sm:gap-4 items-start sm:items-center p-4 hover:bg-[#1F1F1F] transition-colors">
                          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${key.isActive ? 'bg-[#C87941]/10' : 'bg-[#2A2A2A]'}`}>
                              <Key className={`h-4 w-4 ${key.isActive ? 'text-[#C87941]' : 'text-[#666]'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-white truncate">{key.name}</p>
                                {!key.isActive && <Badge variant="secondary" className="bg-[#2A2A2A] text-[#888] border-0 text-[10px]">Inactive</Badge>}
                              </div>
                              <code className="text-xs text-[#666] font-mono block truncate">
                                {showSecretFor === key.id && key.secret_key ? key.secret_key : key.keyPreview}
                              </code>
                            </div>
                          </div>
                          <div className="w-24 text-center hidden sm:block">
                            <span className="text-sm text-[#888]">{key.requestsCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end w-full sm:w-32 pl-12 sm:pl-0">
                            <span className="text-xs text-[#666] mr-2 sm:hidden">{key.requestsCount.toLocaleString()} requests</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSecretFor(showSecretFor === key.id ? null : key.id)}
                              className="h-8 w-8 p-0 text-[#666] hover:text-white hover:bg-[#2A2A2A]"
                              title={showSecretFor === key.id ? 'Hide key' : 'Reveal key'}
                            >
                              {showSecretFor === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.secret_key || key.keyPreview)}
                              className="h-8 w-8 p-0 text-[#666] hover:text-white hover:bg-[#2A2A2A]"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setKeyToDelete(key)}
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security Notice */}
                <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                  <div className="flex items-start gap-3 p-4 border-b border-[#2A2A2A]">
                    <div className="w-9 h-9 rounded-lg bg-[#C87941]/10 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-[#C87941]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Keep your API keys secure</p>
                      <p className="text-xs text-[#888] mt-0.5">Treat your API key like a password. Rotate keys regularly and keep them private.</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-1.5 text-sm text-[#888]">
                    <p>Never expose keys in frontend code or public repositories.</p>
                    <p>Use separate keys for production and staging environments.</p>
                    <p>Delete compromised keys immediately and issue a new one.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-white">Usage</h1>
                  <p className="text-[#888] text-sm mt-1">Monitor your API usage and requests</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <Activity className="h-3.5 w-3.5" />
                      THIS MONTH
                    </div>
                    <div className="text-2xl font-semibold text-white">{developer.usage.thisMonth.toLocaleString()}</div>
                    <p className="text-xs text-[#666] mt-1">requests</p>
                  </div>

                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      LAST MONTH
                    </div>
                    <div className="text-2xl font-semibold text-white">{developer.usage.lastMonth.toLocaleString()}</div>
                    <p className="text-xs text-[#666] mt-1">requests</p>
                  </div>

                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <BarChart3 className="h-3.5 w-3.5" />
                      TOTAL
                    </div>
                    <div className="text-2xl font-semibold text-white">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-xs text-[#666] mt-1">all time</p>
                  </div>

                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-5">
                    <div className="flex items-center gap-2 text-[#888] text-xs font-medium mb-2">
                      <TrendingUp className="h-3.5 w-3.5" />
                      DAILY AVG
                    </div>
                    <div className="text-2xl font-semibold text-white">
                      {Math.max(1, Math.round(developer.usage.thisMonth / Math.max(new Date().getDate(), 1))).toLocaleString()}
                    </div>
                    <p className="text-xs text-[#666] mt-1">this month</p>
                  </div>
                </div>

                {/* Usage by Key */}
                {developer.apiKeys.length > 0 && (
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#2A2A2A]">
                      <h3 className="text-sm font-medium text-white">Usage by API Key</h3>
                    </div>
                    <div className="divide-y divide-[#2A2A2A]">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Key className={`h-4 w-4 ${key.isActive ? 'text-[#C87941]' : 'text-[#666]'}`} />
                            <span className="text-sm text-white truncate">{key.name}</span>
                            {!key.isActive && <Badge className="bg-[#2A2A2A] text-[#888] border-0 text-[10px]">Inactive</Badge>}
                          </div>
                          <span className="text-sm font-medium text-white">{key.requestsCount.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold text-white">Billing</h1>
                    <p className="text-[#888] text-sm mt-1">Manage your credits and view transaction history</p>
                  </div>
                  <Button 
                    onClick={() => setShowPricingModal(true)} 
                    className="bg-[#C87941] hover:bg-[#B86D35] text-white h-9"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Buy Credits
                  </Button>
                </div>

                {/* Balance Card */}
                <div className="rounded-xl bg-gradient-to-br from-[#C87941] to-[#8B4D26] p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <p className="text-white/70 text-sm font-medium mb-1">Current Balance</p>
                    <div className="text-4xl font-bold text-white tracking-tight mb-4">
                      {formatCurrency(developer.creditsBalance)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-white/20 text-white border-0 text-xs font-medium">
                        {developer.tier?.toUpperCase() || 'FREE'} TIER
                      </Badge>
                      <span className="text-white/60 text-sm">Credits never expire</span>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                {developer.transactions && developer.transactions.length > 0 && (
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#2A2A2A]">
                      <h3 className="text-sm font-medium text-white">Transaction History</h3>
                    </div>
                    <div className="divide-y divide-[#2A2A2A]">
                      {developer.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-[#C87941]/10' : 'bg-[#2A2A2A]'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-4 w-4 ${tx.amount > 0 ? 'text-[#C87941]' : 'text-[#666]'}`} />
                              ) : (
                                <DollarSign className={`h-4 w-4 ${tx.amount > 0 ? 'text-[#C87941]' : 'text-[#666]'}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                              <p className="text-xs text-[#666]">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-[#888]'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-xs text-[#666]">Bal: {formatCurrency(tx.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Playground Tab */}
            {activeTab === 'playground' && (
              <div className="space-y-6">
                <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#C87941]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-[#C87941]" />
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">Playground coming soon</h2>
                  <p className="text-sm text-[#888] max-w-md mx-auto">We're building an interactive playground to test prompts, inspect responses, and experiment faster.</p>
                  <Badge className="mt-4 bg-[#2A2A2A] text-[#888] border-0">Coming Soon</Badge>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-white">Settings</h1>
                  <p className="text-[#888] text-sm mt-1">Manage your account settings</p>
                </div>

                {/* Profile Card */}
                <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-[#C87941] via-[#A65D2E] to-[#8B4D26] relative">
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id="settingsGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.5" fill="white"/>
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#settingsGrid)"/>
                      </svg>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#C87941] to-[#8B4D26] flex items-center justify-center text-white text-3xl font-semibold ring-4 ring-[#1A1A1A] shrink-0">
                        {profileInitial}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <h3 className="font-semibold text-lg text-white truncate">{developer.name}</h3>
                        <p className="text-sm text-[#888] truncate">{developer.email}</p>
                      </div>
                      <Badge className="bg-[#C87941]/10 text-[#C87941] border-0 text-xs self-start sm:self-auto">
                        {developer.tier?.toUpperCase() || 'FREE'} TIER
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#2A2A2A] flex items-center gap-2">
                    <User className="h-4 w-4 text-[#C87941]" />
                    <h3 className="text-sm font-medium text-white">Account Details</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-[#888]">Full Name</Label>
                        <Input 
                          value={editableName} 
                          onChange={(e) => setEditableName(e.target.value)} 
                          className="mt-1 bg-[#0D0D0D] border-[#2A2A2A] text-white text-sm focus:border-[#C87941] focus:ring-[#C87941]/20" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#888]">Email Address</Label>
                        <Input 
                          value={developer.email} 
                          disabled 
                          className="mt-1 bg-[#0D0D0D] border-[#2A2A2A] text-[#666] text-sm" 
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateName} 
                        disabled={savingName || !editableName.trim() || editableName.trim() === developer.name} 
                        className="bg-[#C87941] hover:bg-[#B86D35] text-white h-8 text-xs disabled:opacity-50"
                      >
                        {savingName ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-[#2A2A2A]">
                      <div>
                        <Label className="text-xs text-[#888]">Account Created</Label>
                        <Input 
                          value={formatDate(developer.createdAt)} 
                          disabled 
                          className="mt-1 bg-[#0D0D0D] border-[#2A2A2A] text-[#666] text-sm" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#888]">Currency</Label>
                        <Input 
                          value={developer.currency} 
                          disabled 
                          className="mt-1 bg-[#0D0D0D] border-[#2A2A2A] text-[#666] text-sm" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-[#888]">Credits Balance</Label>
                        <Input 
                          value={formatCurrency(developer.creditsBalance)} 
                          disabled 
                          className="mt-1 bg-[#0D0D0D] border-[#2A2A2A] text-[#C87941] text-sm font-medium" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-4 text-center">
                    <Key className="h-5 w-5 mx-auto text-[#C87941] mb-2" />
                    <p className="text-xl font-semibold text-white">{developer.apiKeys.filter(k => k.isActive).length}</p>
                    <p className="text-xs text-[#666]">Active Keys</p>
                  </div>
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-4 text-center">
                    <Activity className="h-5 w-5 mx-auto text-[#C87941] mb-2" />
                    <p className="text-xl font-semibold text-white">{developer.usage.thisMonth.toLocaleString()}</p>
                    <p className="text-xs text-[#666]">This Month</p>
                  </div>
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-4 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto text-[#C87941] mb-2" />
                    <p className="text-xl font-semibold text-white">{developer.usage.totalRequests.toLocaleString()}</p>
                    <p className="text-xs text-[#666]">Total Requests</p>
                  </div>
                  <div className="rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] p-4 text-center">
                    <CreditCard className="h-5 w-5 mx-auto text-[#C87941] mb-2" />
                    <p className="text-xl font-semibold text-white">{developer.transactions?.length || 0}</p>
                    <p className="text-xs text-[#666]">Transactions</p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl bg-[#1A1A1A] border border-red-500/20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-red-400" />
                    <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-red-500/20 bg-red-500/5">
                      <div>
                        <h4 className="font-medium text-sm text-red-400">Delete Account</h4>
                        <p className="text-xs text-[#888]">Permanently delete your account and all associated data</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="text-xs shrink-0 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20" 
                        onClick={() => setShowDeleteAccountDialog(true)}
                      >
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{newlyCreatedKey ? 'API Key Created' : 'Create new secret key'}</DialogTitle>
            <DialogDescription className="text-[#888]">
              {newlyCreatedKey 
                ? 'Please save this secret key somewhere safe and accessible. For security reasons, you won\'t be able to view it again.'
                : 'Give your API key a name to help you identify it later.'
              }
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-[#888]">Your new API key</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded text-xs font-mono text-white break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="shrink-0 border-[#2A2A2A] bg-transparent text-white hover:bg-[#2A2A2A]"
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreateKey(false); setNewlyCreatedKey(null) }} className="w-full bg-[#C87941] hover:bg-[#B86D35] text-white">
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="keyName" className="text-[#888]">Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="My API Key"
                    className="mt-1 bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#666] focus:border-[#C87941] focus:ring-[#C87941]/20"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setShowCreateKey(false)} className="border-[#2A2A2A] bg-transparent text-white hover:bg-[#2A2A2A]">
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={creatingKey} className="bg-[#C87941] hover:bg-[#B86D35] text-white">
                  {creatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create secret key
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Key Confirmation Dialog */}
      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Revoke secret key</DialogTitle>
            <DialogDescription className="text-[#888]">
              This API key will immediately be disabled. API requests made using this key will be rejected, which could cause any systems still depending on it to break. Once revoked, you'll no longer be able to view or modify this API key.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="p-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg">
              <p className="text-sm text-white font-medium">{keyToDelete?.name}</p>
              <code className="text-xs text-[#666] font-mono">{keyToDelete?.keyPreview}</code>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setKeyToDelete(null)} className="border-[#2A2A2A] bg-transparent text-white hover:bg-[#2A2A2A]">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteKey} disabled={deletingKey} className="bg-red-500 hover:bg-red-600">
              {deletingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Revoke key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Account</DialogTitle>
            <DialogDescription className="text-[#888]">
              This will permanently disable your API keys, clear active sessions, and anonymize your developer profile. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)} disabled={deletingAccount} className="border-[#2A2A2A] bg-transparent text-white hover:bg-[#2A2A2A]">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount} className="bg-red-500 hover:bg-red-600">
              {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white sm:max-w-lg">
          {onboardingStep === 0 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <PicturaIcon size={64} />
                </div>
                <DialogTitle className="text-center text-xl text-white">Welcome to Pictura Developer Portal!</DialogTitle>
                <DialogDescription className="text-center text-[#888]">
                  You're all set to start generating images with our AI-powered API. Let's show you around.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => setOnboardingStep(1)} className="bg-[#C87941] hover:bg-[#B86D35] text-white">
                  Get Started
                </Button>
              </DialogFooter>
            </>
          )}

          {onboardingStep === 1 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#C87941]/10 flex items-center justify-center">
                    <Key className="h-8 w-8 text-[#C87941]" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl text-white">Your API Key is Ready</DialogTitle>
                <DialogDescription className="text-center text-[#888]">
                  We've created your first API key automatically. You can manage your keys and create new ones from the API Keys section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setOnboardingStep(0)} className="border-[#2A2A2A] bg-transparent text-white hover:bg-[#2A2A2A]">Back</Button>
                <Button onClick={() => setOnboardingStep(2)} className="bg-[#C87941] hover:bg-[#B86D35] text-white">
                  Next
                </Button>
              </DialogFooter>
            </>
          )}

          {onboardingStep === 2 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#C87941]/10 flex items-center justify-center">
                    <Gift className="h-8 w-8 text-[#C87941]" />
                  </div>
                </div>
                <DialogTitle className="text-center text-xl text-white">Free Credits to Start</DialogTitle>
                <DialogDescription className="text-center text-[#888]">
                  You have free credits to start building! Each API call costs a small amount of credits. Check your balance in the Billing section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setOnboardingStep(1)} className="border-[#2A2A2A] bg-transparent text-white hover:bg-[#2A2A2A]">Back</Button>
                <Button onClick={completeOnboarding} className="bg-[#C87941] hover:bg-[#B86D35] text-white">
                  Start Building
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] text-white sm:max-w-lg p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#C87941] to-[#8B4D26] px-6 py-4">
            <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Buy Credits
            </DialogTitle>
            <p className="text-white/70 text-sm mt-0.5">Choose a package. Credits never expire.</p>
          </div>
          
          <div className="p-4 space-y-2 max-h-[50vh] overflow-y-auto">
            {[
              { name: 'Starter', credits: 1000, price: 500, popular: false },
              { name: 'Growth', credits: 5000, price: 2000, popular: true },
              { name: 'Pro', credits: 15000, price: 5000, popular: false },
              { name: 'Business', credits: 50000, price: 15000, popular: false },
              { name: 'Enterprise', credits: 150000, price: 40000, popular: false },
              { name: 'Custom', credits: 500000, price: 100000, popular: false },
            ].map((plan) => (
              <div
                key={plan.name}
                onClick={() => setSelectedPlan(plan)}
                className={`relative flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPlan?.name === plan.name 
                    ? 'border-[#C87941] bg-[#C87941]/10' 
                    : 'border-[#2A2A2A] hover:border-[#3A3A3A] hover:bg-[#222]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedPlan?.name === plan.name 
                      ? 'bg-[#C87941] text-white' 
                      : 'bg-[#2A2A2A] text-[#888]'
                  }`}>
                    {plan.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{plan.name}</span>
                      {plan.popular && (
                        <span className="px-1.5 py-0.5 bg-[#C87941] text-white text-[10px] font-medium rounded">Best</span>
                      )}
                    </div>
                    <span className="text-xs text-[#888]">{plan.credits.toLocaleString()} credits</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#C87941]">
                    {CURRENCY_SYMBOLS[developer.currency] || '₦'}{plan.price.toLocaleString()}
                  </span>
                  {selectedPlan?.name === plan.name && (
                    <Check className="h-4 w-4 text-[#C87941]" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 pt-0 space-y-3">
            <Button 
              onClick={async () => {
                if (!selectedPlan || !developer) return
                setProcessingPayment(true)
                try {
                  const res = await fetch('/api/paystack/initialize', {
                    method: 'POST',
                    headers: { 
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('pictura_session')}`
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                      amount: selectedPlan.price,
                      credits: selectedPlan.credits,
                      planName: selectedPlan.name,
                      email: developer.email,
                      name: developer.name,
                    }),
                  })
                  const data = await res.json()
                  if (data.success && data.authorizationUrl) {
                    localStorage.setItem('pictura_pending_payment_url', data.authorizationUrl)
                    setPendingPaymentUrl(data.authorizationUrl)
                    window.location.href = data.authorizationUrl
                  } else {
                    toast.error(data.error || 'Payment initialization failed')
                  }
                } catch {
                  toast.error('An error occurred')
                } finally {
                  setProcessingPayment(false)
                }
              }}
              disabled={!selectedPlan || processingPayment}
              className="w-full h-11 bg-[#C87941] hover:bg-[#B86D35] text-white font-medium"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : selectedPlan ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Pay {CURRENCY_SYMBOLS[developer.currency] || '₦'}{selectedPlan.price.toLocaleString()}
                </>
              ) : (
                'Select a Package'
              )}
            </Button>
            <p className="text-[10px] text-center text-[#666] flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secure payment powered by Paystack
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
