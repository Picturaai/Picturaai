import Link from 'next/link'
import { PicturaIcon, PicturaWordmark } from './pictura-logo'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <PicturaIcon size={28} />
              <PicturaWordmark className="text-lg text-foreground" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              The Imoogle Picture Model. AI-powered image generation built in Nigeria.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-5 h-3 rounded-sm overflow-hidden flex" title="Built in Nigeria">
                <span className="w-1/3 bg-[#008751]" />
                <span className="w-1/3 bg-[#ffffff] border-y border-border" />
                <span className="w-1/3 bg-[#008751]" />
              </span>
              <span className="text-xs text-muted-foreground">Built in Nigeria</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/studio" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Studio</Link>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                API
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">SOON</span>
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                Pricing
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">FREE</span>
              </span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <div className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About Imoogle</Link>
              <Link href="/report" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Report Bug</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {new Date().getFullYear()} Imoogle Technology. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground font-mono tracking-wider">
            IMOOGLE LABS / LAGOS, NIGERIA
          </p>
        </div>
      </div>
    </footer>
  )
}
