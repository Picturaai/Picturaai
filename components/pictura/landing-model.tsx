import Link from 'next/link'

export function LandingModel() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative bg-card border border-border rounded-3xl overflow-hidden">
          {/* Decorative accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-primary" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left - Info */}
            <div className="p-8 sm:p-12 flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono tracking-[0.2em] text-primary px-3 py-1 rounded-full bg-primary/8 border border-primary/15">
                  BETA v0.1
                </span>
                <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground px-3 py-1 rounded-full bg-secondary border border-border">
                  FREE
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance leading-tight">
                Built in Nigeria.
                <br />
                For the world.
              </h2>

              <p className="text-muted-foreground leading-relaxed text-pretty">
                Pictura is the Imoogle Picture Model, developed at Imoogle Labs in Nigeria.
                We are building Africa&apos;s first consumer-facing AI image generation model,
                and we are just getting started. Our mission is to democratize creative AI
                tools and make them accessible to everyone.
              </p>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                    </svg>
                  </span>
                  <span className="text-foreground">5 free images per day during beta</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                    </svg>
                  </span>
                  <span className="text-foreground">No sign-up or account required</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                    </svg>
                  </span>
                  <span className="text-foreground">Improving daily with more capabilities soon</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                    </svg>
                  </span>
                  <span className="text-foreground">API access launching soon for developers</span>
                </div>
              </div>

              <Link
                href="/studio"
                className="self-start mt-2 group flex items-center gap-2 px-6 py-3 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                Try Pictura Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            {/* Right - Stats */}
            <div className="bg-secondary/40 p-8 sm:p-12 flex flex-col justify-center gap-8 border-t lg:border-t-0 lg:border-l border-border">
              <div>
                <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground block mb-5">
                  MODEL SPECS
                </span>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-3xl font-bold text-foreground">1024</p>
                    <p className="text-xs text-muted-foreground mt-1">Max resolution (px)</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-foreground">{'<'}10s</p>
                    <p className="text-xs text-muted-foreground mt-1">Avg generation time</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">2</p>
                    <p className="text-xs text-muted-foreground mt-1">Generation modes</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">5/day</p>
                    <p className="text-xs text-muted-foreground mt-1">Beta daily limit</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <span className="text-xs font-mono tracking-[0.2em] text-muted-foreground block mb-4">
                  ROADMAP
                </span>
                <div className="flex flex-col gap-3">
                  {[
                    { label: 'Higher resolution outputs', status: 'In Progress' },
                    { label: 'Increased daily limits', status: 'In Progress' },
                    { label: 'Public REST API', status: 'Coming Soon' },
                    { label: 'Developer SDKs', status: 'Planned' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{item.label}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        item.status === 'In Progress'
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : item.status === 'Coming Soon'
                            ? 'bg-accent/15 text-accent-foreground border border-accent/20'
                            : 'bg-secondary text-muted-foreground border border-border'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
