'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PicturaLogo } from '@/components/pictura/pictura-logo'

type Overview = {
  developers: number
  anonymousSessions: number
  openReports: number
  totalReports: number
  recentReports: Array<{
    id: number
    ticket_id: string
    type: string
    subject: string
    status: string
    assigned_to: string | null
    created_at: string
    ip_address: string | null
    country: string | null
    city: string | null
    region: string | null
    device_type: string | null
  }>
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/overview', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) return router.replace('/admin/login')
      setOverview(data.overview)
    }

    load().catch(() => setMessage('Failed to load dashboard'))
  }, [router])

  const logout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST', credentials: 'include' })
    router.replace('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <PicturaLogo size="sm" />
            <h1 className="text-base font-semibold sm:text-lg">Admin Control Dashboard</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/admin/sessions" className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Anonymous users</Link>
            <Link href="/staff/dashboard" className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Staff dashboard</Link>
            <button onClick={logout} className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Logout</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Developers" value={overview?.developers ?? 0} />
          <MetricCard title="Anonymous sessions" value={overview?.anonymousSessions ?? 0} />
          <MetricCard title="Open reports" value={overview?.openReports ?? 0} />
          <MetricCard title="Total reports" value={overview?.totalReports ?? 0} />
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold sm:text-base">Recent complaints / feedback / bugs</h2>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] text-xs">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2">Ticket</th>
                  <th>Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Device / Location / IP</th>
                </tr>
              </thead>
              <tbody>
                {overview?.recentReports?.map((r) => (
                  <tr key={r.id} className="border-t border-border/40 align-top">
                    <td className="py-2 font-mono">{r.ticket_id}</td>
                    <td>{r.type}</td>
                    <td className="max-w-[260px] truncate">{r.subject}</td>
                    <td>{r.status}</td>
                    <td>{r.assigned_to || '-'}</td>
                    <td className="max-w-[330px] truncate">
                      {r.device_type || 'unknown'} • {r.city || '-'}, {r.region || '-'} {r.country || '-'} • {r.ip_address || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {overview?.recentReports?.length ? (
              overview.recentReports.map((r) => (
                <article key={r.id} className="rounded-xl border border-border/60 bg-background p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[11px]">{r.ticket_id}</p>
                    <span className="rounded-full border border-border/50 px-2 py-0.5 text-[10px]">{r.status}</span>
                  </div>
                  <p className="mt-1 font-medium">{r.subject}</p>
                  <p className="mt-1 text-muted-foreground">{r.type} • {r.assigned_to || 'unassigned'}</p>
                  <p className="mt-1 break-all text-muted-foreground">
                    {r.device_type || 'unknown'} • {r.city || '-'}, {r.region || '-'} {r.country || '-'} • {r.ip_address || '-'}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recent reports.</p>
            )}
          </div>
        </section>

        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      </main>
    </div>
  )
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
      <p className="text-xs text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  )
}
