'use client'

import { Progress } from '@/components/ui/progress'

interface UsageIndicatorProps {
  used: number
  limit: number
}

export function UsageIndicator({ used, limit }: UsageIndicatorProps) {
  const remaining = Math.max(0, limit - used)
  const percentage = (used / limit) * 100
  const isNearLimit = remaining <= 1
  const isAtLimit = remaining === 0

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`size-2 rounded-full ${
              isAtLimit
                ? 'bg-destructive'
                : isNearLimit
                  ? 'bg-accent'
                  : 'bg-primary'
            }`}
          />
          <span className="text-sm font-medium text-foreground">
            Daily Usage
          </span>
        </div>
        <span className="text-sm font-mono text-muted-foreground">
          {used}/{limit}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-1.5 ${
          isAtLimit
            ? '[&>[data-slot=progress-indicator]]:bg-destructive'
            : isNearLimit
              ? '[&>[data-slot=progress-indicator]]:bg-accent'
              : '[&>[data-slot=progress-indicator]]:bg-primary'
        }`}
      />
      {isAtLimit ? (
        <p className="text-xs text-destructive">
          Daily limit reached. Resets at midnight UTC.
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          {remaining} generation{remaining !== 1 ? 's' : ''} remaining today.
          We are working on increasing limits.
        </p>
      )}
    </div>
  )
}
