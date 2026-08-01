'use client'

import { Star } from 'lucide-react'
import { useRepoStats } from '@/hooks/use-repo-stats'
import { formatCompactCount, GITHUB_STARGAZERS_URL } from '@/lib/github'
import { cn } from '@/lib/utils'

export function GitHubIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.29-1.7-1.29-1.7-1.06-.72.08-.7.08-.7 1.17.08 1.78 1.2 1.78 1.2 1.04 1.79 2.74 1.27 3.4.97.11-.76.41-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.7 5.4-5.26 5.69.42.36.79 1.07.79 2.16v3.2c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

type Variant = 'compact' | 'default' | 'block'

const surface =
  'group inline-flex items-center gap-2 rounded-full border border-border bg-card font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-secondary/60'

const variants: Record<Variant, string> = {
  compact: `${surface} px-3 py-1.5 text-xs`,
  default: `${surface} px-4 py-2 text-sm`,
  block: 'flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-[15px] font-semibold text-foreground transition-colors active:bg-secondary/60',
}

/** "Star on GitHub" link with the live stargazer count from /api/github/stars. */
export function GitHubStarButton({
  variant = 'default',
  label = 'Star on GitHub',
  className,
}: {
  variant?: Variant
  label?: string
  className?: string
}) {
  const { stats, loading } = useRepoStats()
  const hasCount = typeof stats.stars === 'number'

  return (
    <a
      href={GITHUB_STARGAZERS_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={hasCount ? `Star Pictura on GitHub — ${stats.stars} stars` : 'Star Pictura on GitHub'}
      className={cn(variants[variant], className)}
    >
      <GitHubIcon className={variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span>{label}</span>
      <span className="flex items-center gap-1 border-l border-border/70 pl-2 text-muted-foreground transition-colors group-hover:text-primary">
        <Star className={cn('fill-current', variant === 'compact' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
        {loading && !hasCount ? (
          <span className="inline-block h-3 w-5 animate-pulse rounded bg-border" aria-hidden="true" />
        ) : (
          <span className="font-mono text-xs tabular-nums">{formatCompactCount(stats.stars)}</span>
        )}
      </span>
    </a>
  )
}
