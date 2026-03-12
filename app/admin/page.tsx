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
  recentReports: Array<{ id: number; ticket_id: string; type: string; subject: string; status: string; assigned_to: string | null; created_at: string }>
}

export default function AdminOverviewPage() {
  const router = useRouter()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/admin/overview', { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        router.replace('/admin/login')
        return
      }
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
      <header className="border-b border-border/50 bg-card/60">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3"><PicturaLogo size="sm" /><h1 className="text-sm font-semibold">Admin Control Dashboard</h1></div>
          <div className="flex gap-3 text-xs"><Link href="/admin/sessions" className="hover:underline">Anonymous users</Link><Link href="/staff/dashboard" className="hover:underline">Staff dashboard</Link><button onClick={logout} className="hover:underline">Logout</button></div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Card title="Developers" value={overview?.developers ?? 0} />
          <Card title="Anonymous sessions" value={overview?.anonymousSessions ?? 0} />
          <Card title="Open reports" value={overview?.openReports ?? 0} />
          <Card title="Total reports" value={overview?.totalReports ?? 0} />
        </div>
        <section className="rounded-2xl border border-border/60 bg-card p-4">
          <h2 className="text-sm font-semibold mb-3">Recent complaints / feedback / bugs</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs"><thead><tr className="text-left"><th className="py-2">Ticket</th><th>Type</th><th>Subject</th><th>Status</th><th>Assigned</th></tr></thead><tbody>
              {overview?.recentReports?.map((r) => <tr key={r.id} className="border-t border-border/40"><td className="py-2 font-mono">{r.ticket_id}</td><td>{r.type}</td><td>{r.subject}</td><td>{r.status}</td><td>{r.assigned_to || '-'}</td></tr>)}
            </tbody></table>
          </div>
        </section>
        {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      </main>
    </div>
  )
}

function Card({ title, value }: { title: string; value: number }) {
  return <div className="rounded-xl border border-border/60 bg-card p-4"><p className="text-xs text-muted-foreground">{title}</p><p className="text-2xl font-semibold mt-1">{value}</p></div>
}
