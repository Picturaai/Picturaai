'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PicturaLogo } from '@/components/pictura/pictura-logo'
import { Loader2, RefreshCw, Search } from 'lucide-react'

type SessionRow = {
  session_id: string
  credits_used: number
  credits_reset_at: string | null
  video_used: number
  video_reset_at: string | null
  tour_completed: boolean
  created_at: string
  last_ip: string | null
  last_user_agent: string | null
  last_country: string | null
  last_city: string | null
  last_region: string | null
  last_device: string | null
  last_seen_at: string | null
}

type Limits = { image: number; video: number }

export default function AdminSessionsPage() {
  const router = useRouter()
  const [authLoading, setAuthLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<SessionRow[]>([])
  const [limits, setLimits] = useState<Limits>({ image: 5, video: 2 })
  const [selectedSession, setSelectedSession] = useState('')
  const [imageDelta, setImageDelta] = useState('')
  const [videoDelta, setVideoDelta] = useState('')
  const [imageRemaining, setImageRemaining] = useState('')
  const [videoRemaining, setVideoRemaining] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const selected = useMemo(() => rows.find((row) => row.session_id === selectedSession) || null, [rows, selectedSession])

  useEffect(() => {
    const run = async () => {
      const res = await fetch('/api/admin/auth/me', { credentials: 'include' })
      if (!res.ok) {
        router.replace('/admin/login')
        return
      }
      setAuthLoading(false)
      loadSessions()
    }

    run()
  }, [router])

  const loadSessions = async () => {
    setLoading(true)
    setMessage('')
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())

      const res = await fetch(`/api/admin/sessions?${params.toString()}`, { credentials: 'include' })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'Failed to load sessions')
        return
      }

      setRows(data.sessions || [])
      setLimits(data.limits || { image: 5, video: 2 })
      if (!selectedSession && data.sessions?.[0]?.session_id) {
        setSelectedSession(data.sessions[0].session_id)
      }
    } catch {
      setMessage('Network error while loading sessions')
    } finally {
      setLoading(false)
    }
  }

  const updateSession = async (payload: Record<string, unknown>) => {
    if (!selectedSession.trim()) return setMessage('Select a session first.')

    setLoading(true)
    setMessage('')
    try {
      const res = await fetch('/api/admin/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: selectedSession, ...payload }),
      })
      const data = await res.json()
      if (!res.ok) return setMessage(data.error || 'Failed to update session')

      setRows((prev) => prev.map((row) => (row.session_id === selectedSession ? data.session : row)))
      setMessage('Session updated successfully.')
      setImageDelta('')
      setVideoDelta('')
      setImageRemaining('')
      setVideoRemaining('')
    } catch {
      setMessage('Network error while updating session')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const imageRemainingValue = selected ? Math.max(0, limits.image - selected.credits_used) : 0
  const videoRemainingValue = selected ? Math.max(0, limits.video - selected.video_used) : 0

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="transition-opacity hover:opacity-80">
              <PicturaLogo size="sm" />
            </Link>
            <div>
              <h1 className="text-base font-semibold sm:text-lg">Anonymous Session Intelligence</h1>
              <p className="text-xs text-muted-foreground">Session, IP, device, location, and credit controls.</p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-xs">
            <Link href="/admin" className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Overview</Link>
            <Link href="/staff/dashboard" className="rounded-lg border border-border/50 px-2.5 py-1.5 hover:bg-secondary">Staff</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 sm:grid-cols-12 sm:px-6">
        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:col-span-7">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search session, IP, location"
                className="h-10 w-full rounded-xl border border-border/60 bg-background pl-9 pr-3 text-sm outline-none ring-offset-background focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={loadSessions}
              disabled={loading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/60">
            <div className="max-h-[560px] overflow-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="sticky top-0 bg-secondary/60">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Session</th>
                    <th className="px-3 py-2 font-semibold">Image left</th>
                    <th className="px-3 py-2 font-semibold">Video left</th>
                    <th className="px-3 py-2 font-semibold">Device / Location / IP</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const imageLeft = Math.max(0, limits.image - row.credits_used)
                    const videoLeft = Math.max(0, limits.video - row.video_used)
                    const active = row.session_id === selectedSession
                    return (
                      <tr
                        key={row.session_id}
                        className={`cursor-pointer border-t border-border/40 ${active ? 'bg-primary/10' : 'hover:bg-secondary/40'}`}
                        onClick={() => setSelectedSession(row.session_id)}
                      >
                        <td className="px-3 py-2 font-mono text-[11px]">{row.session_id}</td>
                        <td className="px-3 py-2">{imageLeft}</td>
                        <td className="px-3 py-2">{videoLeft}</td>
                        <td className="px-3 py-2">{row.last_device || 'unknown'} • {row.last_city || '-'}, {row.last_region || '-'} {row.last_country || '-'} • {row.last_ip || '-'}</td>
                      </tr>
                    )
                  })}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">No sessions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:col-span-5">
          <h2 className="text-sm font-semibold">Selected session</h2>
          <p className="mt-1 break-all rounded-lg bg-secondary/50 px-2 py-1 font-mono text-[11px]">{selectedSession || '—'}</p>
          <p className="mt-2 text-xs text-muted-foreground">Current role daily limits: image {limits.image} / video {limits.video}</p>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-border/60 bg-background p-2">
              <p className="text-muted-foreground">Image remaining</p>
              <p className="text-base font-semibold">{imageRemainingValue}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-background p-2">
              <p className="text-muted-foreground">Video remaining</p>
              <p className="text-base font-semibold">{videoRemainingValue}</p>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border/60 bg-background p-3 text-xs">
            <p><span className="text-muted-foreground">Device:</span> {selected?.last_device || '-'}</p>
            <p><span className="text-muted-foreground">IP:</span> {selected?.last_ip || '-'}</p>
            <p><span className="text-muted-foreground">Location:</span> {selected?.last_city || '-'}, {selected?.last_region || '-'} {selected?.last_country || '-'}</p>
            <p><span className="text-muted-foreground">Last seen:</span> {selected?.last_seen_at ? new Date(selected.last_seen_at).toLocaleString() : '-'}</p>
            <p className="break-all"><span className="text-muted-foreground">User agent:</span> {selected?.last_user_agent || '-'}</p>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              onClick={() => updateSession({ reset: true })}
              disabled={loading || !selectedSession}
              className="h-10 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              Reset daily usage
            </button>

            <ControlRow value={imageDelta} onChange={setImageDelta} placeholder="Add image credits" buttonText="Apply" onClick={() => updateSession({ imageDelta: Number(imageDelta || 0) })} disabled={loading || !selectedSession} />
            <ControlRow value={videoDelta} onChange={setVideoDelta} placeholder="Add video credits" buttonText="Apply" onClick={() => updateSession({ videoDelta: Number(videoDelta || 0) })} disabled={loading || !selectedSession} />
            <ControlRow value={imageRemaining} onChange={setImageRemaining} placeholder="Set image remaining" buttonText="Set" onClick={() => updateSession({ imageRemaining: Number(imageRemaining || 0) })} disabled={loading || !selectedSession} />
            <ControlRow value={videoRemaining} onChange={setVideoRemaining} placeholder="Set video remaining" buttonText="Set" onClick={() => updateSession({ videoRemaining: Number(videoRemaining || 0) })} disabled={loading || !selectedSession} />
          </div>

          {message ? <p className="mt-3 text-xs text-muted-foreground">{message}</p> : null}
        </section>
      </main>
    </div>
  )
}

function ControlRow({
  value,
  onChange,
  placeholder,
  buttonText,
  onClick,
  disabled,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  buttonText: string
  onClick: () => void
  disabled: boolean
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm" />
      <button onClick={onClick} disabled={disabled} className="h-10 rounded-xl border border-border/60 bg-background px-3 text-sm font-medium hover:bg-secondary/60 disabled:opacity-60">{buttonText}</button>
    </div>
  )
}
