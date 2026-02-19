'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PicturaIcon, PicturaWordmark } from './pictura-logo'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/studio', label: 'Studio' },
  { href: '/about', label: 'About' },
  { href: '/report', label: 'Report Bug' },
]

export function Navigation() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <PicturaIcon size={34} />
            <div className="flex flex-col">
              <PicturaWordmark className="text-lg text-foreground" />
              <span className="text-[9px] font-mono tracking-[0.2em] text-muted-foreground -mt-0.5">
                BY IMOOGLE
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/60"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wider">
              BETA
            </span>
            <Link
              href="/studio"
              className="px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
            >
              Open Studio
            </Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            <div className="flex flex-col gap-[5px]">
              <span
                className={`block h-[2px] w-5 bg-foreground rounded-full transition-all duration-300 origin-center ${
                  open ? 'rotate-45 translate-y-[7px]' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-5 bg-foreground rounded-full transition-all duration-300 ${
                  open ? 'opacity-0 scale-x-0' : ''
                }`}
              />
              <span
                className={`block h-[2px] w-5 bg-foreground rounded-full transition-all duration-300 origin-center ${
                  open ? '-rotate-45 -translate-y-[7px]' : ''
                }`}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-500 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl" />
        <div className="relative flex flex-col items-center justify-center h-full gap-2">
          <div className="flex items-center gap-2 mb-8">
            <PicturaIcon size={48} />
            <PicturaWordmark className="text-3xl text-foreground" />
          </div>
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-2xl font-medium text-foreground/70 hover:text-foreground transition-all py-3 px-8 rounded-2xl hover:bg-secondary/60"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 flex flex-col items-center gap-4">
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 tracking-wider">
              BETA
            </span>
            <Link
              href="/studio"
              onClick={() => setOpen(false)}
              className="px-8 py-3 text-base font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-md"
            >
              Open Studio
            </Link>
          </div>
          <p className="absolute bottom-8 text-xs text-muted-foreground font-mono tracking-wider">
            IMOOGLE LABS / NIGERIA
          </p>
        </div>
      </div>
    </>
  )
}
