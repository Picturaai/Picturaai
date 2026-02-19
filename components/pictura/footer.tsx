export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-primary flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
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
              <span className="text-sm font-bold text-foreground leading-tight">Pictura</span>
              <span className="text-[10px] font-mono text-muted-foreground">by Imoogle</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Pictura is a beta model. Images are generated using AI and may not always
            be accurate. Use responsibly.
          </p>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Imoogle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
