'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, FlaskConical } from 'lucide-react'
import { PicturaLogo } from './pictura-logo'

const links = [
  { href: '/studio', label: 'Studio' },
  { href: '/api-docs', label: 'API' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/report', label: 'Report Bug' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl border-b border-border/50'
            : 'bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" aria-label="Pictura home">
            <PicturaLogo size="sm" />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  pathname === l.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/studio"
              className="group ml-3 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Try Pictura
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="relative z-50 flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-secondary/60 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <div className="flex w-[18px] flex-col items-end gap-[5px]">
              <motion.span
                animate={open ? { rotate: 45, y: 7, width: 18 } : { rotate: 0, y: 0, width: 18 }}
                className="block h-[1.5px] rounded-full bg-foreground origin-center"
                transition={{ duration: 0.25 }}
              />
              <motion.span
                animate={open ? { opacity: 0, x: 8 } : { opacity: 1, x: 0 }}
                className="block h-[1.5px] w-3 rounded-full bg-foreground"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={open ? { rotate: -45, y: -7, width: 18 } : { rotate: 0, y: 0, width: 14 }}
                className="block h-[1.5px] rounded-full bg-foreground origin-center"
                transition={{ duration: 0.25 }}
              />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-background/98 backdrop-blur-md md:hidden"
          >
            <motion.nav
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex h-full flex-col justify-center px-8"
            >
              <div className="flex flex-col gap-1">
                {links.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                  >
                    <Link
                      href={l.href}
                      className={`flex items-center rounded-2xl px-5 py-4 text-lg font-medium transition-colors ${
                        pathname === l.href
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-secondary'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="mt-8"
              >
                <Link
                  href="/studio"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:opacity-90"
                >
                  Open Studio
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="mt-10 flex items-center gap-2 text-sm text-muted-foreground"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>Beta &middot; Built by Imoogle Labs</span>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
