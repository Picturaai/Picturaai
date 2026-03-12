'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PicturaLogo } from '@/components/pictura/pictura-logo'

type ReportRow = {
  id: number
  ticket_id: string
  name: string
  email: string
  type: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved'
  assigned_to: string | null
  internal_note: string | null
  created_at: string
  ip_address: string | null
  country: string | null
  city: string | null
  region: string | null
  device_type: string | null
  user_agent: string | null
}

export default function StaffDashboardPage() {
  const router = useRouter()
  const [reports, setReports] = useState<ReportRow[]>([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  const load = async () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    const res = await fetch(`/api/admin/reports?${params.toString()}`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return router.replace('/admin/login')
    setReports(data.reports || [])
  }

  useEffect(() => {
    load().catch(() => setMessage('Failed to load reports'))
  }, [])

  const update = async (id: number, payload: Record<string, unknown>) => {
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, ...payload }),
    })
    const data = await res.json()
    if (!res.ok) return setMessage(data.error || 'Failed to update report')
    setReports((prev) => prev.map((item) => (item.id === id ? data.report : item)))
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <PicturaLogo size="sm" />
            <h1 className="text-base font-semibold sm:text-lg">Staff Query Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/admin" className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Admin overview</Link>
            <Link href="/admin/sessions" className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Sessions</Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket, email, subject, IP"
            className="h-10 w-full rounded-xl border border-border/60 bg-background px-3 text-sm"
          />
          <button onClick={load} className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground">Search</button>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <article key={r.id} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs">{r.ticket_id}</p>
                <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p>
              </div>

              <h3 className="mt-2 break-words text-sm font-semibold">{r.subject}</h3>
              <p className="mt-1 break-all text-xs text-muted-foreground">{r.type} • {r.name} ({r.email})</p>
              <p className="mt-1 break-all text-xs text-muted-foreground">{r.device_type || 'unknown'} • {r.city || '-'}, {r.region || '-'} {r.country || '-'} • {r.ip_address || '-'}</p>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.description}</p>

              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <select value={r.status} onChange={(e) => update(r.id, { status: e.target.value })} className="h-10 rounded-xl border border-border/60 bg-background px-2 text-xs">
                  <option value="open">open</option>
                  <option value="in_progress">in progress</option>
                  <option value="resolved">resolved</option>
                </select>
                <input defaultValue={r.assigned_to || ''} onBlur={(e) => update(r.id, { assignedTo: e.target.value })} placeholder="Assign to staff" className="h-10 rounded-xl border border-border/60 bg-background px-2 text-xs" />
                <input defaultValue={r.internal_note || ''} onBlur={(e) => update(r.id, { internalNote: e.target.value })} placeholder="Internal note" className="h-10 rounded-xl border border-border/60 bg-background px-2 text-xs" />
              </div>
            </article>
          ))}
        </div>

        {message ? <p className="mt-3 text-xs text-muted-foreground">{message}</p> : null}
      </main>
    </div>
  )
}
