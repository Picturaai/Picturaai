'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
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
  ArrowRight,
  Shield,
  User,
  Sparkles,
  Rocket,
  Eye,
  EyeOff,
  Zap,
  TrendingUp,
  Code2,
  Terminal,
  Gift,
  ChevronRight,
} from 'lucide-react'
import { PicturaLogo, PicturaIcon } from '@/components/pictura/pictura-logo'

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

// Tour Steps Configuration
const TOUR_STEPS = [
  {
    target: 'overview-tab',
    title: 'Dashboard Overview',
    description: 'View your account stats, API usage, and quick actions all in one place.',
    position: 'right' as const,
  },
  {
    target: 'api-keys-tab',
    title: 'Manage API Keys',
    description: 'Create and manage your API keys here. Keep them secure!',
    position: 'right' as const,
  },
  {
    target: 'credits-card',
    title: 'Your Credits',
    description: 'Monitor your credit balance. Purchase more when needed.',
    position: 'bottom' as const,
  },
  {
    target: 'quick-start',
    title: 'Quick Start Guide',
    description: 'Copy this code snippet to start making API calls right away.',
    position: 'top' as const,
  },
  {
    target: 'docs-link',
    title: 'Documentation',
    description: 'Access full API documentation for detailed integration guides.',
    position: 'right' as const,
  },
]

// Inline Tour Tooltip Component
function TourTooltip({ 
  step, 
  totalSteps, 
  currentStep, 
  onNext, 
  onSkip, 
  onComplete 
}: { 
  step: typeof TOUR_STEPS[0]
  totalSteps: number
  currentStep: number
  onNext: () => void
  onSkip: () => void
  onComplete: () => void
}) {
  const targetRef = useRef<HTMLElement | null>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const isLast = currentStep === totalSteps - 1

  useEffect(() => {
    const target = document.querySelector(`[data-tour="${step.target}"]`)
    if (target) {
      targetRef.current = target as HTMLElement
      const rect = target.getBoundingClientRect()
      const scrollTop = window.scrollY
      const scrollLeft = window.scrollX
      
      let top = rect.top + scrollTop
      let left = rect.left + scrollLeft

      // Adjust position based on specified direction
      switch (step.position) {
        case 'right':
          left = rect.right + scrollLeft + 12
          top = rect.top + scrollTop + rect.height / 2 - 60
          break
        case 'bottom':
          top = rect.bottom + scrollTop + 12
          left = rect.left + scrollLeft + rect.width / 2 - 140
          break
        case 'top':
          top = rect.top + scrollTop - 140
          left = rect.left + scrollLeft + rect.width / 2 - 140
          break
        case 'left':
          left = rect.left + scrollLeft - 300
          top = rect.top + scrollTop + rect.height / 2 - 60
          break
      }

      setPosition({ top, left: Math.max(12, left) })
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [step])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-foreground/10 backdrop-blur-[2px] z-[60]" onClick={onSkip} />
      
      {/* Highlight ring around target */}
      {targetRef.current && (
        <div 
          className="fixed z-[61] rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none transition-all duration-300"
          style={{
            top: targetRef.current.getBoundingClientRect().top - 4,
            left: targetRef.current.getBoundingClientRect().left - 4,
            width: targetRef.current.getBoundingClientRect().width + 8,
            height: targetRef.current.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed z-[62] w-72 bg-card border border-border rounded-2xl shadow-xl p-4"
        style={{ top: position.top, left: position.left }}
      >
        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentStep ? 'w-6 bg-primary' : i < currentStep ? 'w-2 bg-primary/40' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-4">
          <h4 className="font-semibold text-foreground text-sm">{step.title}</h4>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">{currentStep + 1}/{totalSteps}</span>
            <button
              onClick={isLast ? onComplete : onNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              {isLast ? 'Get Started' : 'Next'}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Arrow pointer */}
        <div 
          className={`absolute w-3 h-3 bg-card border-border rotate-45 ${
            step.position === 'right' ? '-left-1.5 top-1/2 -translate-y-1/2 border-l border-b' :
            step.position === 'bottom' ? '-top-1.5 left-1/2 -translate-x-1/2 border-l border-t' :
            step.position === 'top' ? '-bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b' :
            '-right-1.5 top-1/2 -translate-y-1/2 border-r border-t'
          }`}
        />
      </motion.div>
    </>
  )
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
  
  // Tour state
  const [tourStep, setTourStep] = useState(-1) // -1 means not showing
  const [tourComplete, setTourComplete] = useState(false)
  
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{name: string, credits: number, price: number} | null>(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [editableName, setEditableName] = useState('')
  const [savingName, setSavingName] = useState(false)
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
      
      // Check if tour should be shown (first time users)
      const hasSeenTour = localStorage.getItem('pictura_tour_complete')
      if (!hasSeenTour && data.apiKeys?.length <= 1) {
        // Start tour after a short delay
        setTimeout(() => setTourStep(0), 800)
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

    if (paymentState === 'success') {
      toast.success('Payment successful! Credits will reflect shortly.')
    } else if (paymentState === 'cancel' || paymentState === 'cancelled') {
      toast.info('Payment pending. You can continue from your saved payment link.')
    }
  }, [])

  const handleTourNext = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(tourStep + 1)
    }
  }

  const handleTourSkip = () => {
    setTourStep(-1)
    localStorage.setItem('pictura_tour_complete', 'true')
  }

  const handleTourComplete = () => {
    setTourStep(-1)
    setTourComplete(true)
    localStorage.setItem('pictura_tour_complete', 'true')
    toast.success('Tour complete! You\'re all set to start building.')
  }

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
      {/* Inline Tour */}
      <AnimatePresence>
        {tourStep >= 0 && tourStep < TOUR_STEPS.length && (
          <TourTooltip
            step={TOUR_STEPS[tourStep]}
            totalSteps={TOUR_STEPS.length}
            currentStep={tourStep}
            onNext={handleTourNext}
            onSkip={handleTourSkip}
            onComplete={handleTourComplete}
          />
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 bg-background/95 backdrop-blur-md border-b border-border">
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="w-9 h-9 rounded-xl border border-border bg-card hover:bg-secondary flex items-center justify-center transition-colors"
        >
          <Menu className="h-4 w-4 text-muted-foreground" />
        </button>
        <Link href="/" className="transition-opacity hover:opacity-80">
          <PicturaIcon size={28} className="text-primary" />
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
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

          <div className="p-3 border-t border-sidebar-border" data-tour="docs-link">
            <Link
              href="/api-docs"
              target="_blank"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-sidebar border-r border-sidebar-border fixed left-0 top-0 bottom-0">
          <div className="h-16 flex items-center px-5 border-b border-sidebar-border">
            <Link href="/" className="transition-opacity hover:opacity-80">
              <PicturaLogo size="sm" />
            </Link>
          </div>
          
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                data-tour={index === 0 ? 'overview-tab' : index === 1 ? 'api-keys-tab' : undefined}
                onClick={() => {
                  if (item.comingSoon) {
                    toast.info('Playground is coming soon')
                    return
                  }
                  setActiveTab(item.id)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
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

          <div className="p-3 border-t border-sidebar-border" data-tour="docs-link">
            <Link
              href="/api-docs"
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <Book className="h-4 w-4" />
              Documentation
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Link>
          </div>

          <div className="p-3 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
                    {profileInitial}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">{developer.name}</p>
                    <p className="text-xs text-sidebar-foreground/60 truncate">{developer.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-sidebar-foreground/50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-56 bg-card border-border text-foreground">
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
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
          <div className="max-w-6xl mx-auto p-4 lg:p-8 space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {activeTab === 'overview' && 'Dashboard'}
                  {activeTab === 'api-keys' && 'API Keys'}
                  {activeTab === 'usage' && 'Usage Analytics'}
                  {activeTab === 'billing' && 'Billing'}
                  {activeTab === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'overview' && `Welcome back, ${developer.name?.split(' ')[0] || 'Developer'}`}
                  {activeTab === 'api-keys' && 'Create and manage your API keys'}
                  {activeTab === 'usage' && 'Monitor your API usage and performance'}
                  {activeTab === 'billing' && 'Manage your credits and payments'}
                  {activeTab === 'settings' && 'Manage your account settings'}
                </p>
              </div>
              
              {activeTab === 'api-keys' && (
                <Button 
                  onClick={() => { setNewKeyName(''); setShowCreateKey(true) }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Key
                </Button>
              )}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Credits Card */}
                  <div 
                    data-tour="credits-card"
                    className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 p-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="relative">
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium uppercase tracking-wider">Credits Balance</span>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{formatCurrency(developer.creditsBalance)}</p>
                      <button 
                        onClick={() => setShowPricingModal(true)}
                        className="mt-3 text-xs text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        Add credits <ArrowUpRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* API Requests */}
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs">
                      <TrendingUp className={`h-3 w-3 ${usagePercentChange >= 0 ? 'text-emerald-600' : 'text-destructive'}`} />
                      <span className={usagePercentChange >= 0 ? 'text-emerald-600' : 'text-destructive'}>
                        {usagePercentChange >= 0 ? '+' : ''}{usagePercentChange}%
                      </span>
                      <span className="text-muted-foreground">vs last month</span>
                    </div>
                  </div>

                  {/* Active Keys */}
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Key className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium uppercase tracking-wider">Active Keys</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{developer.apiKeys.filter(k => k.isActive).length}</p>
                    <button 
                      onClick={() => setActiveTab('api-keys')}
                      className="mt-3 text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Manage keys <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Total Requests */}
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium uppercase tracking-wider">All Time</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{developer.usage.totalRequests.toLocaleString()}</p>
                    <p className="mt-3 text-xs text-muted-foreground">Total API requests</p>
                  </div>
                </div>

                {/* Quick Start Section */}
                <div data-tour="quick-start" className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Terminal className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Quick Start</h3>
                        <p className="text-xs text-muted-foreground">Make your first API call</p>
                      </div>
                    </div>
                    <Link
                      href="/api-docs"
                      target="_blank"
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      Full docs <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="p-5">
                    <div className="rounded-xl bg-secondary/50 border border-border overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">cURL</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(`curl -X POST https://picturaai.sbs/api/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "A beautiful sunset over mountains"}'`)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card hover:bg-card/80 text-xs text-muted-foreground hover:text-foreground transition-colors border border-border"
                        >
                          {copiedKey ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          Copy
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm">
                        <code className="text-foreground font-mono">
                          <span className="text-primary">curl</span> -X POST https://picturaai.sbs/api/v1/generate \{'\n'}
                          {'  '}-H <span className="text-accent">"Authorization: Bearer YOUR_API_KEY"</span> \{'\n'}
                          {'  '}-H <span className="text-accent">"Content-Type: application/json"</span> \{'\n'}
                          {'  '}-d <span className="text-accent">{`'{"prompt": "A beautiful sunset over mountains"}'`}</span>
                        </code>
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Recent API Keys */}
                {developer.apiKeys.length > 0 && (
                  <div className="rounded-2xl bg-card border border-border overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground">Recent API Keys</h3>
                      </div>
                      <button 
                        onClick={() => setActiveTab('api-keys')}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        View all
                      </button>
                    </div>
                    <div className="divide-y divide-border">
                      {developer.apiKeys.slice(0, 3).map((key) => (
                        <div key={key.id} className="px-5 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${key.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{key.name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{key.keyPreview}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {key.requestsCount.toLocaleString()} calls
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api-keys' && (
              <div className="space-y-4">
                {developer.apiKeys.length === 0 ? (
                  <div className="rounded-2xl bg-card border border-border p-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Key className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">No API keys yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Create your first API key to start using the Pictura API</p>
                    <Button 
                      onClick={() => { setNewKeyName(''); setShowCreateKey(true) }}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create API Key
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-card border border-border overflow-hidden">
                    <div className="divide-y divide-border">
                      {developer.apiKeys.map((key) => (
                        <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`w-2 h-2 rounded-full ${key.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
                              <h4 className="font-medium text-foreground">{key.name}</h4>
                              <Badge variant={key.isActive ? 'default' : 'secondary'} className="text-[10px]">
                                {key.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <code className="text-xs text-muted-foreground font-mono bg-secondary px-2 py-0.5 rounded">
                                {showSecretFor === key.id && key.secret_key ? key.secret_key : key.keyPreview}
                              </code>
                              {key.secret_key && (
                                <button
                                  onClick={() => setShowSecretFor(showSecretFor === key.id ? null : key.id)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showSecretFor === key.id ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Created {formatDate(key.createdAt)}</span>
                              <span>{key.requestsCount.toLocaleString()} requests</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(key.secret_key || key.keyPreview)}
                              className="h-8 px-3 border-border text-foreground hover:bg-secondary"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setKeyToDelete(key)}
                              className="h-8 px-3 border-destructive/20 text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Activity className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium uppercase tracking-wider">This Month</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{developer.usage.thisMonth.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium uppercase tracking-wider">Last Month</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{developer.usage.lastMonth.toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs font-medium uppercase tracking-wider">All Time</span>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{developer.usage.totalRequests.toLocaleString()}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Usage by API Key</h3>
                  <div className="space-y-3">
                    {developer.apiKeys.map((key) => {
                      const percentage = developer.usage.totalRequests > 0 
                        ? (key.requestsCount / developer.usage.totalRequests) * 100 
                        : 0
                      return (
                        <div key={key.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-foreground">{key.name}</span>
                            <span className="text-sm text-muted-foreground">{key.requestsCount.toLocaleString()}</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.max(percentage, 2)}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Current Balance */}
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-primary/20 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
                      <p className="text-4xl font-bold text-foreground">{formatCurrency(developer.creditsBalance)}</p>
                    </div>
                    <Button 
                      onClick={() => setShowPricingModal(true)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      <Gift className="h-4 w-4" />
                      Add Credits
                    </Button>
                  </div>
                </div>

                {/* Transaction History */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Transaction History</h3>
                  </div>
                  {developer.transactions?.length > 0 ? (
                    <div className="divide-y divide-border">
                      {developer.transactions.map((tx) => (
                        <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-foreground">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-foreground'}`}>
                              {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">Balance: {formatCurrency(tx.balanceAfter)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No transactions yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                {/* Profile Card */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                    <User className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Profile Information</h3>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Full Name</Label>
                        <Input 
                          value={editableName} 
                          onChange={(e) => setEditableName(e.target.value)} 
                          className="mt-1.5 bg-background border-border text-foreground" 
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Email Address</Label>
                        <Input 
                          value={developer.email} 
                          disabled 
                          className="mt-1.5 bg-secondary border-border text-muted-foreground" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        onClick={handleUpdateName} 
                        disabled={savingName || !editableName.trim() || editableName.trim() === developer.name} 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        {savingName ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="rounded-2xl bg-card border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                    <Settings className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">Account Details</h3>
                  </div>
                  <div className="p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">Account Tier</Label>
                        <div className="mt-1.5">
                          <Badge className="bg-primary/10 text-primary border-0">
                            {developer.tier?.toUpperCase() || 'FREE'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Currency</Label>
                        <p className="mt-1.5 text-sm font-medium text-foreground">{developer.currency}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Member Since</Label>
                        <p className="mt-1.5 text-sm font-medium text-foreground">{formatDate(developer.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl bg-card border border-destructive/20 overflow-hidden">
                  <div className="px-5 py-4 border-b border-destructive/20 flex items-center gap-3">
                    <Shield className="h-4 w-4 text-destructive" />
                    <h3 className="font-semibold text-destructive">Danger Zone</h3>
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                      <div>
                        <h4 className="font-medium text-destructive">Delete Account</h4>
                        <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
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
                ? 'Please save this secret key somewhere safe. You won\'t be able to view it again.'
                : 'Give your API key a name to help you identify it later.'
              }
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 border border-border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">Your new API key</span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-3 bg-background border border-border rounded-lg text-xs font-mono text-foreground break-all">{newlyCreatedKey}</code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(newlyCreatedKey)}
                    className="shrink-0 border-border"
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
                    className="mt-1.5 bg-background border-border text-foreground"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateKey(false)} className="border-border">
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

      {/* Delete Key Dialog */}
      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete API Key</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{keyToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToDelete(null)} className="border-border">
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteKey} disabled={deletingKey}>
              {deletingKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteAccountDialog} onOpenChange={setShowDeleteAccountDialog}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Account</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              This will permanently delete your account, all API keys, and usage data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccountDialog(false)} className="border-border">
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
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
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
            <Button variant="outline" onClick={() => setShowPricingModal(false)} className="border-border">
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
    </div>
  )
}
