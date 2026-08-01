import { NextResponse } from 'next/server'
import { EMPTY_REPO_STATS, GITHUB_OWNER, GITHUB_REPO, parseRepoStats } from '@/lib/github'

/** Cache the upstream call for an hour so visitors never hit GitHub's rate limit. */
export const revalidate = 3600

export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'pictura-website',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
      },
      next: { revalidate },
    })

    if (!res.ok) {
      return NextResponse.json(EMPTY_REPO_STATS, {
        headers: { 'Cache-Control': 'public, max-age=300' },
      })
    }

    return NextResponse.json(parseRepoStats(await res.json()), {
      headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
    })
  } catch (error) {
    console.error('GitHub stars lookup failed:', error)
    return NextResponse.json(EMPTY_REPO_STATS, {
      headers: { 'Cache-Control': 'public, max-age=300' },
    })
  }
}
