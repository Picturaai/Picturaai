'use client'

import { GitBranch } from 'lucide-react'
import { GitHubIcon, GitHubStarButton } from './github-star-button'
import { useRepoStats } from '@/hooks/use-repo-stats'
import { formatCompactCount, GITHUB_REPO_URL } from '@/lib/github'
import { cn } from '@/lib/utils'

/** Reused on every marketing page so the open source story is visible site-wide. */
export function OpenSourceBanner({
  description = 'Every part of Pictura — Studio, the public API, and PicturaCAPTCHA — is developed in the open. Read the code, file an issue, or send a pull request.',
  className,
}: {
  description?: string
  className?: string
}) {
  const { stats } = useRepoStats()

  return (
    <section
      className={cn(
        'mx-auto max-w-5xl rounded-2xl border border-border/60 bg-card p-6 sm:p-8',
        className,
      )}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <GitHubIcon className="h-3.5 w-3.5" />
            Open source
          </span>
          <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground">
            Pictura is open source
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono text-foreground">Picturaai/Picturaai</span>
            <span className="inline-flex items-center gap-1">
              <GitBranch className="h-3.5 w-3.5" />
              {formatCompactCount(stats.forks)} forks
            </span>
          </p>
        </div>

        <div className="flex flex-shrink-0 flex-col gap-2 sm:items-end">
          <GitHubStarButton />
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            Browse the source code
          </a>
        </div>
      </div>
    </section>
  )
}
