import Link from 'next/link'
import { PicturaIcon } from './pictura-logo'

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <span className="flex items-center gap-2.5">
              <PicturaIcon size={28} />
              <span className="text-lg font-bold tracking-tight text-foreground">Pictura</span>
            </span>
            <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
              Non-profit AI image generation. Built with pride in Lagos, Nigeria.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="flex h-3.5 w-5 overflow-hidden rounded-sm" aria-label="Nigerian flag">
                <span className="w-1/3 bg-[#008751]" />
                <span className="w-1/3 bg-[#FFFFFF] border-y border-border/30" />
                <span className="w-1/3 bg-[#008751]" />
              </span>
              <span className="text-xs text-muted-foreground">Made in Nigeria</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Product</span>
            <Link href="/studio" className="text-sm text-foreground/70 transition-colors hover:text-primary">Studio</Link>
            <span className="flex items-center gap-2 text-sm text-foreground/40">
              API
              <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">SOON</span>
            </span>
            <span className="flex items-center gap-2 text-sm text-foreground/70">
              Pricing
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] text-emerald-600">FREE</span>
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Company</span>
            <Link href="/about" className="text-sm text-foreground/70 transition-colors hover:text-primary">About Imoogle</Link>
            <Link href="/report" className="text-sm text-foreground/70 transition-colors hover:text-primary">Report a Bug</Link>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Legal</span>
            <span className="text-sm text-foreground/40">Privacy Policy</span>
            <span className="text-sm text-foreground/40">Terms of Service</span>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border/40 pt-8 md:flex-row md:items-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Imoogle Technology. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
            <span className="font-mono text-[10px] tracking-widest text-muted-foreground/50">
              IMOOGLE LABS
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
