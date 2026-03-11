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
  Wallet,
  Lock,
  User,
  DollarSign,
  Gift,
  Sparkles,
  Zap,
  Crown,
  Eye,
  EyeOff,
} from 'lucide-react'
import { PicturaLogo, PicturaIcon } from '@/components/pictura/pictura-logo'
import { PatternAvatar } from '@/components/pictura/pattern-avatar'

interface ApiKey {
  id: string
  name: string
  keyPreview: string
  secret_key?: string // Full API key for display
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
  const [showSecretFor, setShowSecretFor] = useState<string | null>(null) // Track which key is revealed
  
  // Delete confirmation
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null)
  const [deletingKey, setDeletingKey] = useState(false)
  
  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(0)
  
  // Pricing & Payment
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{name: string, credits: number, price: number} | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)

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
    <div className="min-h-screen bg-[#FAFAFA] overflow-x-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-9 h-9 rounded-lg bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors active:scale-95"
        >
          <Menu className="h-4 w-4" />
        </button>
        <PicturaLogo size="sm" />
        <button onClick={() => setActiveTab('settings')} className="active:scale-95 transition-transform">
          <PatternAvatar name={developer.name || 'Developer'} email={developer.email} size="sm" />
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
          className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r transform transition-transform duration-300 ease-out flex flex-col ${
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

          {/* Navigation */}
          <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
            <p className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Menu</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  activeTab === item.id
                    ? 'bg-[#C87941] text-white font-medium'
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
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-gray-50 border-r">
          <div className="p-4 border-b border-gray-200">
            <PicturaIcon className="w-8 h-8" />
            <span className="text-sm font-medium text-gray-600 mt-2 block">Developer Dashboard</span>
          </div>
          
          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-white text-gray-900 font-medium shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
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
                  <PatternAvatar name={developer.name || 'Developer'} email={developer.email} size="md" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">{developer.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{developer.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
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
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl overflow-x-hidden">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Welcome back, {developer.name?.split(' ')[0]}</h1>
                <p className="text-sm text-muted-foreground">Here's what's happening with your API</p>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ATM Card Design - Brand Color */}
                <Card className="col-span-full sm:col-span-2 md:col-span-1 overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #10A37F 0%, #0D8C6D 50%, #0A6B56 100%)', border: 'none' }}>
                  {/* Contactless icon */}
                  <div className="absolute top-4 right-4">
                    <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8.5 14.5c2-2 5-2 7 0M6 12c3.5-3.5 8.5-3.5 12 0M3.5 9.5c5-5 12-5 17 0" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  <CardContent className="p-5 pt-5 relative text-white">
                    <div className="mb-4">
                      <p className="text-[10px] uppercase tracking-wider text-white/70 mb-1">Available Credits</p>
                      <div className="text-2xl sm:text-3xl font-semibold tracking-tight">{formatCurrency(developer.creditsBalance)}</div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Account</p>
                        <p className="text-xs font-medium tracking-wide truncate max-w-[140px]">{developer.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-white/50 mb-0.5">Plan</p>
                        <p className="text-xs font-medium">{developer.tier?.toUpperCase() || 'FREE'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Activity className="h-3.5 w-3.5" />
                      This Month
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{developer.usage.thisMonth.toLocaleString()}</div>
                    {developer.usage.lastMonth > 0 && (
                      <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-0.5">
                        <ArrowUpRight className="h-2.5 w-2.5" />
                        <span>
                          {Math.round(((developer.usage.thisMonth - developer.usage.lastMonth) / developer.usage.lastMonth) * 100)}%
                        </span>
                        vs last month
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                      <BarChart3 className="h-3.5 w-3.5" />
                      Total Requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{developer.usage.totalRequests.toLocaleString()}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">All time</p>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200">
                  <CardHeader className="pb-2 pt-3 px-3 sm:px-4">
                    <CardDescription className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Key className="h-3.5 w-3.5" />
                      API Keys
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-3 px-3 sm:px-4">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-900">{developer.apiKeys.filter(k => k.isActive).length}</div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      {developer.apiKeys.length} total
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <Card className="cursor-pointer hover:bg-gray-50 transition-colors group border border-gray-200" onClick={() => setActiveTab('api-keys')}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors shrink-0">
                      <Key className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">API Keys</h3>
                      <p className="text-xs text-gray-500 truncate">Create and manage keys</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:bg-gray-50 transition-colors group border border-gray-200" onClick={() => window.open('/api-docs', '_blank')}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors shrink-0">
                      <Book className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">Documentation</h3>
                      <p className="text-xs text-gray-500 truncate">API reference & guides</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Transactions */}
              {developer.transactions && developer.transactions.length > 0 && (
                <Card className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base text-gray-900">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {developer.transactions.slice(0, 5).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 ${tx.amount > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                              {tx.type === 'signup_bonus' || tx.type === 'promo' ? (
                                <Gift className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${tx.amount > 0 ? 'text-green-600' : 'text-gray-500'}`} />
                              ) : (
                                <DollarSign className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${tx.amount > 0 ? 'text-green-600' : 'text-gray-500'}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                              <p className="text-[10px] sm:text-xs text-gray-500">{formatDate(tx.createdAt)}</p>
                            </div>
                          </div>
                          <div className={`text-xs sm:text-sm font-medium shrink-0 ${tx.amount > 0 ? 'text-green-600' : 'text-gray-500'}`}>
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
                        <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-muted/50 transition-colors gap-2 sm:gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 ${key.isActive ? 'bg-[#C87941]/10' : 'bg-muted'}`}>
                              <Key className={`h-4 w-4 sm:h-5 sm:w-5 ${key.isActive ? 'text-[#C87941]' : 'text-muted-foreground'}`} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-sm sm:text-base truncate">{key.name}</p>
                                {!key.isActive && <Badge variant="secondary" className="text-[10px] sm:text-xs">Inactive</Badge>}
                              </div>
                              <code className="text-xs sm:text-sm text-muted-foreground font-mono block truncate">
                                {showSecretFor === key.id && key.secret_key ? key.secret_key : key.keyPreview}
                              </code>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 pl-11 sm:pl-0">
                            <p className="text-[10px] sm:text-xs text-muted-foreground">
                              {key.requestsCount.toLocaleString()} requests
                            </p>
                            <div className="flex items-center gap-1">
                              {/* Reveal/Hide button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSecretFor(showSecretFor === key.id ? null : key.id)}
                                className="text-muted-foreground h-8 w-8 p-0"
                                title={showSecretFor === key.id ? 'Hide key' : 'Reveal key'}
                              >
                                {showSecretFor === key.id ? (
                                  <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                ) : (
                                  <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(key.secret_key || key.keyPreview)}
                                className="text-muted-foreground h-8 w-8 p-0"
                              >
                                <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setKeyToDelete(key)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                              >
                                <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
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
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowPricingModal(true)}>View Plans</Button>
                      <Button size="sm" className="bg-[#C87941] hover:bg-[#B86D35] text-xs h-8" onClick={() => setShowPricingModal(true)}>Upgrade</Button>
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
                  {/* Premium ATM Card Design - Brand Color */}
                  <div className="relative overflow-hidden rounded-lg aspect-[1.6/1] max-w-md" style={{ background: 'linear-gradient(135deg, #C87941 0%, #A65D2E 50%, #8B4D26 100%)' }}>
                    {/* Chip */}
                    <div className="absolute top-6 left-6 w-12 h-9 rounded-lg bg-gradient-to-br from-yellow-200 via-yellow-300 to-yellow-400 opacity-90">
                      <div className="absolute inset-1 grid grid-cols-3 gap-0.5">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="bg-yellow-400/50 rounded-sm" />
                        ))}
                      </div>
                    </div>
                    {/* Contactless */}
                    <div className="absolute top-6 right-6">
                      <svg className="w-8 h-8 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8.5 14.5c2-2 5-2 7 0M6 12c3.5-3.5 8.5-3.5 12 0M3.5 9.5c5-5 12-5 17 0" strokeLinecap="round"/>
                      </svg>
                    </div>
                    {/* Background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <defs>
                          <pattern id="billingGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="0.5" fill="white"/>
                          </pattern>
                        </defs>
                        <rect width="100" height="100" fill="url(#billingGrid)"/>
                      </svg>
                    </div>
                    {/* Holographic strip */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    
                    {/* Card content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="mb-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/70 mb-1">Available Balance</p>
                        <div className="text-3xl sm:text-4xl font-bold tracking-tight">{formatCurrency(developer.creditsBalance)}</div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[8px] uppercase tracking-wider text-white/60 mb-0.5">Card Holder</p>
                          <p className="text-sm font-medium tracking-wide">{developer.name?.toUpperCase()}</p>
                        </div>
                        <div className="flex gap-1">
                          <div className="w-7 h-7 rounded-full bg-white/30" />
                          <div className="w-7 h-7 rounded-full bg-white/20 -ml-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setShowPricingModal(true)} className="mt-4 bg-[#C87941] hover:bg-[#B86D35] text-sm h-9">Buy Credits</Button>
                </CardContent>
              </Card>

              {developer.transactions && developer.transactions.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm sm:text-base">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y">
                      {developer.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2.5 sm:py-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium truncate">{tx.description}</p>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <div className={`text-xs sm:text-sm font-medium ${tx.amount > 0 ? 'text-[#C87941]' : 'text-muted-foreground'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </div>
                            <p className="text-[10px] sm:text-xs text-muted-foreground">Bal: {formatCurrency(tx.balanceAfter)}</p>
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

              {/* Profile Card with Brand Color Background */}
              <Card className="overflow-hidden">
                <div className="h-20 sm:h-24 bg-gradient-to-br from-[#C87941] via-[#A65D2E] to-[#8B4D26] relative">
                  <div className="absolute inset-0 opacity-15">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <pattern id="settingsGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                          <circle cx="1" cy="1" r="0.5" fill="white"/>
                        </pattern>
                      </defs>
                      <rect width="100" height="100" fill="url(#settingsGrid)"/>
                    </svg>
                  </div>
                </div>
                <CardContent className="relative pt-0">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10 sm:-mt-12">
                    <div className="ring-4 ring-background rounded-full">
                      <PatternAvatar name={developer.name || 'Developer'} email={developer.email} size="xl" />
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <h3 className="font-semibold text-base sm:text-lg truncate">{developer.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{developer.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="text-[10px] bg-[#C87941]/10 text-[#C87941] border border-[#C87941]/20">
                        {developer.tier?.toUpperCase() || 'FREE'} TIER
                      </Badge>
                      <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => setShowPricingModal(true)}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-[#C87941]" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Full Name</Label>
                      <Input value={developer.name} disabled className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      <Input value={developer.email} disabled className="mt-1 text-sm" />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">Account Created</Label>
                      <Input value={formatDate(developer.createdAt)} disabled className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Currency</Label>
                      <Input value={developer.currency} disabled className="mt-1 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Credits Balance</Label>
                      <Input value={formatCurrency(developer.creditsBalance)} disabled className="mt-1 text-sm font-medium text-[#C87941]" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                <Card className="bg-[#C87941]/5 border-[#C87941]/20">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Key className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.apiKeys.filter(k => k.isActive).length}</p>
                    <p className="text-[10px] text-muted-foreground">Active Keys</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#C87941]/5 border-[#C87941]/20">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <Activity className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.usage.thisMonth.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">This Month</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#C87941]/5 border-[#C87941]/20">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <BarChart3 className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.usage.totalRequests.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">Total Requests</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#C87941]/5 border-[#C87941]/20">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <CreditCard className="h-5 w-5 mx-auto text-[#C87941] mb-1" />
                    <p className="text-lg sm:text-xl font-bold">{developer.transactions?.length || 0}</p>
                    <p className="text-[10px] text-muted-foreground">Transactions</p>
                  </CardContent>
                </Card>
              </div>

              {/* Danger Zone */}
              <Card className="border-destructive/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm sm:text-base text-destructive flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Danger Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div>
                      <h4 className="font-medium text-sm text-destructive">Delete Account</h4>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data</p>
                    </div>
                    <Button variant="destructive" size="sm" className="text-xs shrink-0">Delete Account</Button>
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
              <div className="p-4 bg-[#C87941]/10 border border-[#C87941]/30 rounded-lg">
                <Label className="text-[#C87941]">Your API Key</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-3 bg-white border rounded text-xs sm:text-sm font-mono break-all">{newlyCreatedKey}</code>
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
                  <div className="w-16 h-16 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
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
                  <div className="w-16 h-16 rounded-lg bg-[#C87941]/10 flex items-center justify-center">
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

      {/* Pricing Modal */}
      <Dialog open={showPricingModal} onOpenChange={setShowPricingModal}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          {/* Header with brand gradient */}
          <div className="bg-gradient-to-r from-[#C87941] to-[#A65D2E] p-4 text-white">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Buy Credits
            </DialogTitle>
            <p className="text-white/80 text-xs mt-0.5">Choose a package. Credits never expire.</p>
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
                className={`relative flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedPlan?.name === plan.name 
                ? 'border-[#C87941] bg-[#C87941]/5' 
                    : 'border-border hover:border-[#C87941]/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    selectedPlan?.name === plan.name 
                      ? 'bg-[#C87941] text-white' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {plan.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{plan.name}</span>
                      {plan.popular && (
                        <span className="px-1.5 py-0.5 bg-[#C87941] text-white text-[9px] font-medium rounded">Best</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{plan.credits.toLocaleString()} credits</span>
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
              className="w-full bg-[#C87941] hover:bg-[#B86D35] h-10"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : selectedPlan ? (
                <>
                  <Lock className="h-3.5 w-3.5 mr-2" />
                  Pay {CURRENCY_SYMBOLS[developer.currency] || '₦'}{selectedPlan.price.toLocaleString()}
                </>
              ) : (
                'Select a Package'
              )}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
              <Shield className="h-3 w-3" />
              Secure payment powered by Paystack
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
