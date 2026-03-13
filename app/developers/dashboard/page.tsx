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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <PicturaIcon size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Loading dashboard...</p>
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur-md border-b border-border">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-9 h-9 rounded-lg border border-border bg-card hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/" className="transition-opacity hover:opacity-80">
          <PicturaIcon size={28} />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-medium">
              {profileInitial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border text-foreground">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-sm font-medium truncate">{developer.name}</p>
              <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
            </div>
            <DropdownMenuItem onClick={() => setActiveTab('settings')} className="text-foreground hover:bg-secondary">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
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
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div 
          className={`fixed inset-y-0 left-0 w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-out flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <PicturaLogo size="sm" />
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="w-8 h-8 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-sidebar-foreground" />
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
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                } ${item.comingSoon ? 'opacity-60' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.comingSoon && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground">Soon</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <Link
              href="/api-docs"
              target="_blank"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 bottom-0">
          <div className="h-14 flex items-center px-5 border-b border-sidebar-border">
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
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-medium'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                } ${item.comingSoon ? 'opacity-60' : ''}`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.comingSoon && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent text-sidebar-foreground">Soon</span>
                )}
              </button>
            ))}
          </nav>

          <div className="p-3 border-t border-sidebar-border">
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0">
                    {profileInitial}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{developer.name}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{developer.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/60 shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border text-foreground">
                <DropdownMenuItem onClick={() => setActiveTab('settings')} className="text-foreground hover:bg-secondary">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('billing')} className="text-foreground hover:bg-secondary">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="text-sm font-medium text-primary">{formatCurrency(developer.creditsBalance)}</span>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10">
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
          <div className="hidden lg:flex items-center justify-between h-14 px-6 border-b border-border bg-background sticky top-0 z-30">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Dashboard</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              <span className="text-foreground capitalize">{activeTab.replace('-', ' ')}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setShowPricingModal(true)}
                variant="outline" 
                size="sm" 
                className="h-8 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary hover:border-primary/50"
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
                  <h1 className="text-2xl font-semibold text-foreground">Welcome back, {developer.name?.split(' ')[0]}</h1>
                  <p className="text-muted-foreground text-sm mt-1">Here's an overview of your API usage and account status.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Credits Card */}
                  <div className="sm:col-span-2 lg:col-span-1 relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/70 p-5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-primary-foreground/70 text-xs font-medium mb-2">
                        <Wallet className="h-3.5 w-3.5" />
                        AVAILABLE CREDITS
                      </div>
                      <div className="text-3xl font-bold text-primary-foreground tracking-tight">
                        {formatCurrency(developer.creditsBalance)}
                      </div>
                      <div className="mt-3 flex items-center gap-2">
                        <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 text-[10px] font-medium">
                          {developer.tier?.toUpperCase() || 'FREE'} TIER
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* This Month */}
                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <Activity className="h-3.5 w-3.5" />
                      THIS MONTH
                    </div>
                    <div className="text-2xl font-semibold text-foreground">
                      {developer.usage.thisMonth.toLocaleString()}
                    </div>
                    {developer.usage.lastMonth > 0 && (
                      <div className={`flex items-center gap-1 mt-2 text-xs ${usagePercentChange >= 0 ? 'text-emerald-600' : 'text-destructive'}`}>
                        <TrendingUp className="h-3 w-3" />
                        <span>{usagePercentChange >= 0 ? '+' : ''}{usagePercentChange}% vs last month</span>
                      </div>
                    )}
                  </div>

                  {/* Total Requests */}
                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <BarChart3 className="h-3.5 w-3.5" />
                      TOTAL REQUESTS
                    </div>
                    <div className="text-2xl font-semibold text-foreground">
                      {developer.usage.totalRequests.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">All time</div>
                  </div>

                  {/* API Keys */}
                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <Key className="h-3.5 w-3.5" />
                      API KEYS
                    </div>
                    <div className="text-2xl font-semibold text-foreground">
                      {developer.apiKeys.filter(k => k.isActive).length}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">{developer.apiKeys.length} total</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button 
                    onClick={() => setActiveTab('api-keys')}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Key className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">Manage API Keys</h3>
                      <p className="text-xs text-muted-foreground truncate">Create and manage your keys</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </button>

                  <button 
                    onClick={() => window.open('/api-docs', '_blank')}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <FileCode className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">API Documentation</h3>
                      <p className="text-xs text-muted-foreground truncate">Reference and guides</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </button>

                  <button 
                    onClick={() => setShowPricingModal(true)}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:bg-secondary/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">Buy Credits</h3>
                      <p className="text-xs text-muted-foreground truncate">Top up your balance</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </button>
                </div>

                {/* Code Example */}
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Terminal className="h-4 w-4 text-primary" />
                      Quick Start
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary"
                      onClick={() => copyToClipboard(`curl -X POST https://api.pictura.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A beautiful sunset over mountains"}'`)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <div className="p-4 font-mono text-sm text-muted-foreground overflow-x-auto bg-secondary/30">
                    <pre className="whitespace-pre-wrap break-all">{`curl -X POST https://api.pictura.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A beautiful sunset over mountains"}'`}</pre>
                  </div>
                </div>

                {/* Recent Activity */}
                {developer.transactions && developer.transactions.length > 0 && (
                  <div className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-medium text-foreground">Recent Activity</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {developer.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-primary/10' : 'bg-secondary'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-4 w-4 ${tx.amount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                              ) : (
                                <DollarSign className={`h-4 w-4 ${tx.amount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
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
                    <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your API keys for Pictura API access.</p>
                  </div>
                  <Button 
                    onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create new key
                  </Button>
                </div>

                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  {developer.apiKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                        <Key className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1">No API keys yet</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">Create your first API key to start using the Pictura API</p>
                      <Button 
                        onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} 
                        variant="outline"
                        className="border-border bg-transparent text-foreground hover:bg-secondary"
                      >
                        Create new key
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {/* Header */}
                      <div className="hidden sm:grid grid-cols-[1fr,auto,auto] gap-4 px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider font-medium bg-secondary/30">
                        <div>Name</div>
                        <div className="w-24 text-center">Requests</div>
                        <div className="w-32 text-right">Actions</div>
                      </div>
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex flex-col sm:grid sm:grid-cols-[1fr,auto,auto] gap-2 sm:gap-4 items-start sm:items-center p-4 hover:bg-secondary/30 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${key.isActive ? 'bg-primary/10' : 'bg-secondary'}`}>
                              <Key className={`h-4 w-4 ${key.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-foreground truncate">{key.name}</p>
                                {!key.isActive && <Badge variant="secondary" className="bg-secondary text-muted-foreground border-0 text-[10px]">Inactive</Badge>}
                              </div>
                              <code className="text-xs text-muted-foreground font-mono block truncate">
                                {showSecretFor === key.id && key.secret_key ? key.secret_key : key.keyPreview}
                              </code>
                            </div>
                          </div>
                          <div className="w-24 text-center hidden sm:block">
                            <span className="text-sm text-muted-foreground">{key.requestsCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 justify-end w-full sm:w-32 pl-12 sm:pl-0">
                            <span className="text-xs text-muted-foreground mr-2 sm:hidden">{key.requestsCount.toLocaleString()} requests</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSecretFor(showSecretFor === key.id ? null : key.id)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                              title={showSecretFor === key.id ? 'Hide key' : 'Reveal key'}
                            >
                              {showSecretFor === key.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.secret_key || key.keyPreview)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-secondary"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setKeyToDelete(key)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="flex items-start gap-3 p-4 border-b border-border">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Keep your API keys secure</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Treat your API key like a password. Rotate keys regularly and keep them private.</p>
                    </div>
                  </div>
                  <div className="px-4 py-3 space-y-1.5 text-sm text-muted-foreground bg-secondary/20">
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
                  <h1 className="text-2xl font-semibold text-foreground">Usage</h1>
                  <p className="text-muted-foreground text-sm mt-1">Monitor your API usage and requests</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <Activity className="h-3.5 w-3.5" />
                      THIS MONTH
                    </div>
                    <div className="text-2xl font-semibold text-foreground">{developer.usage.thisMonth.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">requests</p>
                  </div>

                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <Clock className="h-3.5 w-3.5" />
                      LAST MONTH
                    </div>
                    <div className="text-2xl font-semibold text-foreground">{developer.usage.lastMonth.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">requests</p>
                  </div>

                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <BarChart3 className="h-3.5 w-3.5" />
                      TOTAL
                    </div>
                    <div className="text-2xl font-semibold text-foreground">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground mt-1">all time</p>
                  </div>

                  <div className="rounded-xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium mb-2">
                      <TrendingUp className="h-3.5 w-3.5" />
                      DAILY AVG
                    </div>
                    <div className="text-2xl font-semibold text-foreground">
                      {Math.max(1, Math.round(developer.usage.thisMonth / Math.max(new Date().getDate(), 1))).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">this month</p>
                  </div>
                </div>

                {/* Usage by Key */}
                {developer.apiKeys.length > 0 && (
                  <div className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-medium text-foreground">Usage by API Key</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Key className={`h-4 w-4 ${key.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="text-sm text-foreground truncate">{key.name}</span>
                            {!key.isActive && <Badge className="bg-secondary text-muted-foreground border-0 text-[10px]">Inactive</Badge>}
                          </div>
                          <span className="text-sm font-medium text-foreground">{key.requestsCount.toLocaleString()}</span>
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
                    <h1 className="text-2xl font-semibold text-foreground">Billing</h1>
                    <p className="text-muted-foreground text-sm mt-1">Manage your credits and view transaction history</p>
                  </div>
                  <Button 
                    onClick={() => setShowPricingModal(true)} 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-9"
                  >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Buy Credits
                  </Button>
                </div>

                {/* Balance Card */}
                <div className="rounded-xl bg-gradient-to-br from-primary to-primary/70 p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="relative">
                    <p className="text-primary-foreground/70 text-sm font-medium mb-1">Current Balance</p>
                    <div className="text-4xl font-bold text-primary-foreground tracking-tight mb-4">
                      {formatCurrency(developer.creditsBalance)}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary-foreground/20 text-primary-foreground border-0 text-xs font-medium">
                        {developer.tier?.toUpperCase() || 'FREE'} TIER
                      </Badge>
                      <span className="text-primary-foreground/60 text-sm">Credits never expire</span>
                    </div>
                  </div>
                </div>

                {/* Transaction History */}
                {developer.transactions && developer.transactions.length > 0 && (
                  <div className="rounded-xl bg-card border border-border overflow-hidden">
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="text-sm font-medium text-foreground">Transaction History</h3>
                    </div>
                    <div className="divide-y divide-border">
                      {developer.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-primary/10' : 'bg-secondary'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-4 w-4 ${tx.amount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                              ) : (
                                <DollarSign className={`h-4 w-4 ${tx.amount > 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">Bal: {formatCurrency(tx.balanceAfter)}</p>
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
                <div className="rounded-xl bg-card border border-border p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Playground coming soon</h2>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">We're building an interactive playground to test prompts, inspect responses, and experiment faster.</p>
                  <Badge className="mt-4 bg-secondary text-muted-foreground border-0">Coming Soon</Badge>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
                  <p className="text-muted-foreground text-sm mt-1">Manage your account settings</p>
                </div>

                {/* Profile Card */}
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-primary via-primary/80 to-primary/60 relative">
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
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-3xl font-semibold ring-4 ring-card shrink-0">
                        {profileInitial}
                      </div>
                      <div className="flex-1 min-w-0 pb-1">
                        <h3 className="font-semibold text-lg text-foreground truncate">{developer.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{developer.email}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-0 text-xs self-start sm:self-auto">
                        {developer.tier?.toUpperCase() || 'FREE'} TIER
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="rounded-xl bg-card border border-border overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="text-sm font-medium text-foreground">Account Details</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <Input 
                          value={editableName} 
                          onChange={(e) => setEditableName(e.target.value)} 
                          className="mt-1 bg-background border-border text-foreground text-sm focus:border-primary focus:ring-primary/20" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email Address</Label>
                        <Input 
                          value={developer.email} 
                          disabled 
                          className="mt-1 bg-secondary border-border text-muted-foreground text-sm" 
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateName} 
                        disabled={savingName || !editableName.trim() || editableName.trim() === developer.name} 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs disabled:opacity-50"
                      >
                        {savingName ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t border-border">
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Created</Label>
                        <Input 
                          value={formatDate(developer.createdAt)} 
                          disabled 
                          className="mt-1 bg-secondary border-border text-muted-foreground text-sm" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Currency</Label>
                        <Input 
                          value={developer.currency} 
                          disabled 
                          className="mt-1 bg-secondary border-border text-muted-foreground text-sm" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Credits Balance</Label>
                        <Input 
                          value={formatCurrency(developer.creditsBalance)} 
                          disabled 
                          className="mt-1 bg-secondary border-border text-primary text-sm font-medium" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <div className="rounded-xl bg-card border border-border p-4 text-center">
                    <Key className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-xl font-semibold text-foreground">{developer.apiKeys.filter(k => k.isActive).length}</p>
                    <p className="text-xs text-muted-foreground">Active Keys</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-4 text-center">
                    <Activity className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-xl font-semibold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">This Month</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-4 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-xl font-semibold text-foreground">{developer.usage.totalRequests.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Requests</p>
                  </div>
                  <div className="rounded-xl bg-card border border-border p-4 text-center">
                    <CreditCard className="h-5 w-5 mx-auto text-primary mb-2" />
                    <p className="text-xl font-semibold text-foreground">{developer.transactions?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl bg-card border border-destructive/20 overflow-hidden">
                  <div className="px-4 py-3 border-b border-destructive/20 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                      <div>
                        <h4 className="font-medium text-sm text-destructive">Delete Account</h4>
                        <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="text-xs shrink-0 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20" 
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
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">{newlyCreatedKey ? 'API Key Created' : 'Create new secret key'}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {newlyCreatedKey 
                ? 'Please save this secret key somewhere safe and accessible. For security reasons, you won\'t be able to view it again.'
                : 'Give your API key a name to help you identify it later.'
              }
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Your new API key</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-background border border-border rounded text-xs font-mono text-foreground break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="shrink-0 border-border bg-transparent text-foreground hover:bg-secondary"
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreateKey(false); setNewlyCreatedKey(null) }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="keyName" className="text-muted-foreground">Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="My API Key"
                    className="mt-1 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateKey(false)} className="border-border bg-transparent text-foreground hover:bg-secondary">
                  Cancel
                </Button>
                <Button onClick={handleCreateKey} disabled={creatingKey || !newKeyName.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {creatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create key
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Key Confirmation Dialog */}
      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete API Key</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{keyToDelete?.name}"? This action cannot be undone and any applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToDelete(null)} className="border-border bg-transparent text-foreground hover:bg-secondary">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteKey} disabled={deletingKey}>
              {deletingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently delete your account, all API keys, and usage data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)} className="border-border bg-transparent text-foreground hover:bg-secondary">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={deletingAccount}>
              {deletingAccount ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Buy Credits</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Choose a credit package to top up your account balance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-4">
            {[
              { name: 'Starter', credits: 100, price: 5 },
              { name: 'Pro', credits: 500, price: 20 },
              { name: 'Business', credits: 2000, price: 75 },
            ].map((plan) => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  selectedPlan?.name === plan.name
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30 hover:bg-secondary/50'
                }`}
              >
                <div>
                  <h4 className="font-medium text-foreground">{plan.name}</h4>
                  <p className="text-sm text-muted-foreground">{plan.credits.toLocaleString()} credits</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">${plan.price}</p>
                  <p className="text-xs text-muted-foreground">${(plan.price / plan.credits * 100).toFixed(1)}¢/credit</p>
                </div>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPricingModal(false)} className="border-border bg-transparent text-foreground hover:bg-secondary">
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedPlan) {
                  toast.info('Payment integration coming soon')
                  setShowPricingModal(false)
                }
              }} 
              disabled={!selectedPlan || processingPayment}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {processingPayment ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Welcome to Pictura
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Let's get you started with the Pictura API in just a few steps.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {onboardingStep === 0 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Key className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Create your first API key</h3>
                  <p className="text-sm text-muted-foreground">API keys authenticate your requests to the Pictura API.</p>
                </div>
              </div>
            )}
            {onboardingStep === 1 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <FileCode className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">Explore the documentation</h3>
                  <p className="text-sm text-muted-foreground">Learn how to integrate Pictura into your applications.</p>
                </div>
              </div>
            )}
            {onboardingStep === 2 && (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Rocket className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">You're all set!</h3>
                  <p className="text-sm text-muted-foreground">Start building amazing things with AI-powered image generation.</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            {onboardingStep < 2 ? (
              <Button onClick={() => setOnboardingStep(onboardingStep + 1)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue
              </Button>
            ) : (
              <Button onClick={completeOnboarding} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Get Started
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
