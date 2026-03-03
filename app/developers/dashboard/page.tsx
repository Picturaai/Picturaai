'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  User,
  DollarSign,
  Gift,
} from 'lucide-react'
import { PicturaLogo, PicturaIcon } from '@/components/pictura/pictura-logo'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
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
  const router = useRouter()
  const [developer, setDeveloper] = useState<Developer | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'api-keys' | 'usage' | 'billing' | 'settings'>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // API Key creation
  const [showCreateKey, setShowCreateKey] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [creatingKey, setCreatingKey] = useState(false)
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState(false)
  
  // Delete confirmation
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)
  const [deletingKey, setDeletingKey] = useState(false)
  
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-4">
          <PicturaIcon size={48} className="animate-pulse" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!developer) return null

  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'usage', label: 'Usage', icon: Activity },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-9 h-9 rounded-xl bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors active:scale-95"
        >
          <Menu className="h-4 w-4" />
        </button>
        <PicturaLogo size="sm" />
        <button 
          onClick={() => setActiveTab('settings')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C87941] to-[#A66835] text-white flex items-center justify-center text-xs font-semibold shadow-md shadow-[#C87941]/20 active:scale-95 transition-transform"
        >
          {developer.name?.charAt(0).toUpperCase() || 'D'}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
          onClick={() => setSidebarOpen(false)} 
        />
        <div 
          className={`fixed inset-y-0 left-0 w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-[#C87941]/5 to-transparent">
            <PicturaLogo size="sm" />
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#C87941] to-[#A66835] p-4 text-white">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm font-semibold backdrop-blur-sm">
                    {developer.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{developer.name}</p>
                    <p className="text-[10px] text-white/70 truncate">{developer.email}</p>
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-white/60">Balance</p>
                    <p className="text-lg font-bold">{formatCurrency(developer.creditsBalance)}</p>
                  </div>
                  <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-[#C87941] text-white font-medium shadow-md shadow-[#C87941]/20'
                    : 'text-muted-foreground hover:bg-muted/80 active:scale-[0.98]'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            ))}
          </nav>

          {/* Quick Links */}
          <div className="px-3 py-2 border-t">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Resources</p>
            <Link
              href="/api-docs"
              target="_blank"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
            </Link>
            <Link
              href="/developers/support"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Support
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-4 border-t bg-muted/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm text-red-600 bg-red-50 hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white border-r">
          <div className="p-6 border-b">
            <PicturaLogo />
            <Badge className="mt-2 text-xs bg-[#C87941]/10 text-[#C87941] hover:bg-[#C87941]/20">Developer Portal</Badge>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-[#C87941]/10 text-[#C87941] font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t">
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="w-9 h-9 rounded-full bg-[#C87941] text-white flex items-center justify-center text-sm font-medium">
                    {developer.name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{developer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('billing')}>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pricing
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/api-docs" target="_blank">
                    <Book className="h-4 w-4 mr-2" />
                    Documentation
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Credits</span>
                  <span className="text-sm font-medium">{formatCurrency(developer.creditsBalance)}</span>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Welcome back, {developer.name?.split(' ')[0]}</h1>
                <p className="text-sm text-muted-foreground">Here's what's happening with your API</p>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Credit Card Design */}
                <Card className="col-span-full md:col-span-1 bg-gradient-to-br from-[#C87941] to-[#A66835] text-white border-0 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                  <CardContent className="p-4 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/70">Credit Balance</p>
                        <div className="text-xl sm:text-2xl font-bold mt-0.5">{formatCurrency(developer.creditsBalance)}</div>
                      </div>
                      <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center">
                        <CreditCard className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/60">Account</p>
                        <p className="text-xs font-mono">{developer.email.split('@')[0]}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-white/60">Tier</p>
                        <p className="text-xs capitalize">{developer.tier || 'Free'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Activity className="h-3.5 w-3.5" />
                      This Month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-lg sm:text-xl font-bold">{developer.usage.thisMonth.toLocaleString()}</div>
                    {developer.usage.lastMonth > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                        <ArrowUpRight className="h-2.5 w-2.5 text-[#C87941]" />
                        <span className="text-[#C87941]">
                          {Math.round(((developer.usage.thisMonth - developer.usage.lastMonth) / developer.usage.lastMonth) * 100)}%
                        </span>
                        vs last month
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Total Requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-lg sm:text-xl font-bold">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Key className="h-3.5 w-3.5" />
                      API Keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-lg sm:text-xl font-bold">{developer.apiKeys.filter(k => k.isActive).length}</div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {developer.apiKeys.length} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="cursor-pointer hover:border-[#C87941]/50 transition-colors group" onClick={() => setActiveTab('api-keys')}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-[#C87941]/10 flex items-center justify-center group-hover:bg-[#C87941]/20 transition-colors shrink-0">
                      <Key className="h-5 w-5 text-[#C87941]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium">Manage API Keys</h3>
                      <p className="text-xs text-muted-foreground truncate">Create and manage your keys</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-[#C87941]/50 transition-colors group" onClick={() => window.open('/api-docs', '_blank')}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-[#C87941]/10 flex items-center justify-center group-hover:bg-[#C87941]/20 transition-colors shrink-0">
                      <Book className="h-5 w-5 text-[#C87941]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium">Documentation</h3>
                      <p className="text-xs text-muted-foreground truncate">Learn how to use the API</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              {developer.transactions && developer.transactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {developer.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.amount > 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-4 w-4 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                              ) : (
                                <DollarSign className={`h-4 w-4 ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`} />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{tx.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* API Keys Tab */}
          {activeTab === 'api-keys' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                    API Keys
                    <Badge variant="secondary" className="text-[10px]">Beta</Badge>
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Manage your API keys for Pictura API access.
                  </p>
                </div>
                <Button onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} className="bg-[#C87941] hover:bg-[#B86D35] text-sm h-9">
                  <Plus className="h-4 w-4 mr-1.5" />
                  New Key
                </Button>
              </div>

              <Card>
                <CardContent className="p-0">
                  {developer.apiKeys.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-muted rounded-lg m-4">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Key className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium mb-1">No API keys added</h3>
                      <p className="text-sm text-muted-foreground text-center mb-4">Create your first API key to start using the Pictura API</p>
                      <Button onClick={() => { setShowCreateKey(true); setNewKeyName(''); setNewlyCreatedKey(null) }} variant="outline">
                        New Key
                      </Button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${key.isActive ? 'bg-[#C87941]/10' : 'bg-muted'}`}>
                              <Key className={`h-5 w-5 ${key.isActive ? 'text-[#C87941]' : 'text-muted-foreground'}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{key.name}</p>
                                {!key.isActive && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                              </div>
                              <code className="text-sm text-muted-foreground font-mono">{key.keyPreview}</code>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground hidden sm:block">
                              {key.requestsCount.toLocaleString()} requests
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(key.keyPreview)}
                              className="text-muted-foreground"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setKeyToDelete(key)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="flex items-start gap-3 p-4">
                  <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">Keep your API keys secure</p>
                    <p className="text-sm text-amber-700">Never share your API keys in public repositories or client-side code.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Usage</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Monitor your API usage and requests</p>
              </div>

              <div className="grid gap-3 sm:gap-4 grid-cols-3">
                <Card>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">This Month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-lg sm:text-2xl font-bold">{developer.usage.thisMonth.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">Last Month</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-lg sm:text-2xl font-bold">{developer.usage.lastMonth.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">requests</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-1.5 pt-3 px-3 sm:px-4">
                    <CardDescription className="text-xs">All Time</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-lg sm:text-2xl font-bold">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">requests</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Usage by API Key</CardTitle>
                </CardHeader>
                <CardContent>
                  {developer.apiKeys.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No API keys yet</p>
                  ) : (
                    <div className="space-y-4">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="flex items-center justify-between py-2">
                          <div className="flex items-center gap-3">
                            <Key className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{key.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {key.requestsCount.toLocaleString()} requests
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Billing</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your credits and payment methods</p>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold">{developer.tier === 'free' ? 'Free Plan' : 'Premium Plan'}</h3>
                      <p className="text-xs text-muted-foreground">Pay as you go pricing</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="text-xs h-8">View Plans</Button>
                      <Button size="sm" className="bg-[#C87941] hover:bg-[#B86D35] text-xs h-8">Upgrade</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base">Credit Balance</CardTitle>
                  <CardDescription className="text-xs">Your credits are used for API calls.</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Credit Card Design in Billing */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#C87941] to-[#A66835] text-white p-4 sm:p-5">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                    <div className="relative flex items-start justify-between mb-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/70">Available Balance</p>
                        <div className="text-2xl sm:text-3xl font-bold mt-1">{formatCurrency(developer.creditsBalance)}</div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between text-xs">
                      <span className="text-white/70">{developer.currency}</span>
                      <span className="font-mono text-white/80">{developer.email.split('@')[0]}</span>
                    </div>
                  </div>
                  <Button className="mt-4 bg-[#C87941] hover:bg-[#B86D35] text-sm h-9">Buy Credits</Button>
                </CardContent>
              </Card>

              {developer.transactions && developer.transactions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {developer.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-3">
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </div>
                            <p className="text-xs text-muted-foreground">Balance: {formatCurrency(tx.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Settings</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your account settings</p>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base">Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="flex items-center gap-3 sm:gap-4 pb-4 border-b">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#C87941] text-white flex items-center justify-center text-lg sm:text-xl font-semibold shrink-0">
                      {developer.name?.charAt(0).toUpperCase() || 'D'}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{developer.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Full Name</Label>
                      <Input value={developer.name} disabled className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <Input value={developer.email} disabled className="mt-1" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-muted-foreground">Account Created</Label>
                      <Input value={formatDate(developer.createdAt)} disabled className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Currency</Label>
                      <Input value={developer.currency} disabled className="mt-1" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                    <div>
                      <h4 className="font-medium text-red-900">Delete Account</h4>
                      <p className="text-sm text-red-700">Permanently delete your account and all associated data</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete Account</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Create API Key Dialog */}
      <Dialog open={showCreateKey} onOpenChange={setShowCreateKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{newlyCreatedKey ? 'API Key Created' : 'Create API Key'}</DialogTitle>
            <DialogDescription>
              {newlyCreatedKey 
                ? 'Save this key securely. It will not be shown again.'
                : 'Give your API key a name to help you identify it later.'
              }
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <Label className="text-green-800">Your API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-3 bg-white border rounded text-sm font-mono break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                  >
                    {copiedKey ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => { setShowCreateKey(false); setNewlyCreatedKey(null) }} className="bg-[#C87941] hover:bg-[#B86D35]">
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production, Development"
                    className="mt-1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateKey(false)}>Cancel</Button>
                <Button onClick={handleCreateKey} disabled={creatingKey} className="bg-[#C87941] hover:bg-[#B86D35]">
                  {creatingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Key
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Key Confirmation Dialog */}
      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{keyToDelete?.name}"? This action cannot be undone and any applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToDelete(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteKey} disabled={deletingKey}>
              {deletingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onboarding Dialog */}
      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="sm:max-w-lg">
          {onboardingStep === 0 && (
            <>
              <DialogHeader>
                <div className="flex justify-center mb-4">
                  <PicturaIcon size={64} />
                </div>
                <DialogTitle className="text-center text-xl">Welcome to Pictura Developer Portal!</DialogTitle>
                <DialogDescription className="text-center">
                  You're all set to start generating images with our AI-powered API. Let's show you around.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => setOnboardingStep(1)} className="bg-[#C87941] hover:bg-[#B86D35]">
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
                <DialogTitle className="text-center text-xl">Your API Key is Ready</DialogTitle>
                <DialogDescription className="text-center">
                  We've created your first API key automatically. You can manage your keys and create new ones from the API Keys section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setOnboardingStep(0)}>Back</Button>
                <Button onClick={() => setOnboardingStep(2)} className="bg-[#C87941] hover:bg-[#B86D35]">
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
                <DialogTitle className="text-center text-xl">Free Credits to Start</DialogTitle>
                <DialogDescription className="text-center">
                  You have free credits to start building! Each API call costs a small amount of credits. Check your balance in the Billing section.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center gap-2">
                <Button variant="outline" onClick={() => setOnboardingStep(1)}>Back</Button>
                <Button onClick={completeOnboarding} className="bg-[#C87941] hover:bg-[#B86D35]">
                  Start Building
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
