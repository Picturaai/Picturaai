import { describe, expect, it } from 'vitest'
import { EMPTY_REPO_STATS, formatCompactCount, parseRepoStats } from '@/lib/github'

describe('parseRepoStats', () => {
  it('picks the counts the badges render', () => {
    expect(
      parseRepoStats({
        stargazers_count: 1284,
        forks_count: 37,
        subscribers_count: 12,
        open_issues_count: 4,
        name: 'Picturaai',
      })
    ).toEqual({ stars: 1284, forks: 37, watchers: 12, openIssues: 4 })
  })

  it('falls back to watchers_count when subscribers_count is absent', () => {
    expect(parseRepoStats({ watchers_count: 9 }).watchers).toBe(9)
  })

  it('returns empty stats for malformed payloads', () => {
    expect(parseRepoStats(null)).toEqual(EMPTY_REPO_STATS)
    expect(parseRepoStats('not json')).toEqual(EMPTY_REPO_STATS)
    expect(parseRepoStats({ stargazers_count: 'many', forks_count: -3 })).toEqual(EMPTY_REPO_STATS)
  })
})

describe('formatCompactCount', () => {
  it('shows exact counts below a thousand', () => {
    expect(formatCompactCount(0)).toBe('0')
    expect(formatCompactCount(942)).toBe('942')
  })

  it('abbreviates thousands and millions the way GitHub does', () => {
    expect(formatCompactCount(1200)).toBe('1.2k')
    expect(formatCompactCount(2000)).toBe('2k')
    expect(formatCompactCount(13400)).toBe('13k')
    expect(formatCompactCount(1_500_000)).toBe('1.5m')
    expect(formatCompactCount(12_000_000)).toBe('12m')
  })

  it('renders a dash when the count is unavailable', () => {
    expect(formatCompactCount(null)).toBe('—')
    expect(formatCompactCount(undefined)).toBe('—')
    expect(formatCompactCount(Number.NaN)).toBe('—')
  })
})
