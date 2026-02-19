import { Badge } from '@/components/ui/badge'

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-5 lg:px-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative size-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary-foreground"
            >
              <path
                d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10m0 0l4.5-4.5a2 2 0 0 1 2.83 0L15 15m-3-3l1.5-1.5a2 2 0 0 1 2.83 0L21 15M3 15v4a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4M3 15h18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground leading-tight">
              Pictura
            </span>
            <span className="text-[11px] font-mono text-muted-foreground tracking-wider uppercase">
              by Imoogle
            </span>
          </div>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
          Beta
        </Badge>
      </div>
      <nav className="hidden md:flex items-center gap-6">
        <span className="text-sm text-muted-foreground font-medium">
          AI Image Generation Model
        </span>
      </nav>
    </header>
  )
}
