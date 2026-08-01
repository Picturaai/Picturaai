/** Public GitHub repository backing the open source badges across the site. */
export const GITHUB_OWNER = 'Picturaai'
export const GITHUB_REPO = 'Picturaai'
export const GITHUB_REPO_URL = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`
export const GITHUB_STARGAZERS_URL = `${GITHUB_REPO_URL}/stargazers`
export const GITHUB_FORK_URL = `${GITHUB_REPO_URL}/fork`
export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`

export type RepoStats = {
  stars: number | null
  forks: number | null
  /** Watchers subscribed to the repository, when GitHub reports it. */
  watchers: number | null
  openIssues: number | null
}

export const EMPTY_REPO_STATS: RepoStats = {
  stars: null,
  forks: null,
  watchers: null,
  openIssues: null,
}

function toCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? Math.trunc(value) : null
}

/** Narrows the GitHub repository payload down to the counts the UI renders. */
export function parseRepoStats(payload: unknown): RepoStats {
  if (typeof payload !== 'object' || payload === null) return EMPTY_REPO_STATS
  const repo = payload as Record<string, unknown>
  return {
    stars: toCount(repo.stargazers_count),
    forks: toCount(repo.forks_count),
    watchers: toCount(repo.subscribers_count ?? repo.watchers_count),
    openIssues: toCount(repo.open_issues_count),
  }
}

/** Formats a count the way GitHub does in its own buttons: 942, 1.2k, 13k, 1.4m. */
export function formatCompactCount(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '—'
  if (value < 1000) return String(Math.trunc(value))
  if (value < 1_000_000) {
    const thousands = value / 1000
    return `${thousands < 10 ? thousands.toFixed(1).replace(/\.0$/, '') : Math.round(thousands)}k`
  }
  const millions = value / 1_000_000
  return `${millions < 10 ? millions.toFixed(1).replace(/\.0$/, '') : Math.round(millions)}m`
}
