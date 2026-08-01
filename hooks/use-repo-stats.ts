'use client'

import { useEffect, useState } from 'react'
import { EMPTY_REPO_STATS, type RepoStats } from '@/lib/github'

/** Shared across every badge on the page so the API is only hit once per visit. */
let cachedStats: RepoStats | null = null
let inFlight: Promise<RepoStats> | null = null

function loadStats(): Promise<RepoStats> {
  if (cachedStats) return Promise.resolve(cachedStats)
  if (!inFlight) {
    inFlight = fetch('/api/github/stars')
      .then((res) => (res.ok ? res.json() : EMPTY_REPO_STATS))
      .then((stats: RepoStats) => {
        cachedStats = stats
        return stats
      })
      .catch(() => EMPTY_REPO_STATS)
      .finally(() => {
        inFlight = null
      })
  }
  return inFlight
}

export function useRepoStats(): { stats: RepoStats; loading: boolean } {
  const [stats, setStats] = useState<RepoStats>(cachedStats ?? EMPTY_REPO_STATS)
  const [loading, setLoading] = useState(!cachedStats)

  useEffect(() => {
    if (cachedStats) return
    let active = true
    loadStats().then((next) => {
      if (!active) return
      setStats(next)
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  return { stats, loading }
}
