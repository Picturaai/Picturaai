'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Layers, Globe, FlaskConical, Cpu, Shield, BarChart3, BookOpen, Microscope, GitBranch, Check, X, MapPin, CircleDollarSign, Image as ImageIcon, Clock } from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

const showcaseImages = [
  { src: '/images/showcase-1.jpg', label: 'Portrait', prompt: '"Golden skin portrait with African beadwork jewelry"' },
  { src: '/images/showcase-2.jpg', label: 'Architecture', prompt: '"Futuristic solarpunk city with green terraces"' },
  { src: '/images/showcase-3.jpg', label: 'Macro', prompt: '"Mechanical butterfly with copper filigree wings"' },
  { src: '/images/showcase-4.jpg', label: 'Landscape', prompt: '"African savanna at dawn, oil painting style"' },
  { src: '/images/showcase-5.jpg', label: 'Still Life', prompt: '"Espresso on marble, dramatic side lighting"' },
  { src: '/images/showcase-6.jpg', label: 'Fantasy', prompt: '"Underwater coral palace with bioluminescent jellyfish"' },
]

const features = [
  {
    icon: Zap,
    title: 'Text to Image',
    description: 'Describe any scene, concept, or idea and Pictura generates it in seconds.',
  },
  {
    icon: Layers,
    title: 'Image to Image',
    description: 'Upload a reference and describe transformations to reimagine existing visuals.',
  },
  {
    icon: Globe,
    title: 'Free During Beta',
    description: 'Completely free to use. AI creativity should be accessible to everyone.',
  },
]

const architecture = [
  {
    icon: Cpu,
    title: 'Multi-Model Pipeline',
    description: 'Pictura chains multiple specialized models in a pipeline for optimal quality across different visual styles.',
  },
  {
    icon: Shield,
    title: 'Safety & Moderation',
    description: 'Built-in content filtering and safety layers ensure responsible generation with every request.',
  },
  {
    icon: BarChart3,
    title: 'Adaptive Resolution',
    description: 'Intelligent resolution scaling that adapts to your content type for the best output quality.',
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] } }),
}

/* Currency map by country code */
const CURRENCY_MAP: Record<string, { symbol: string; code: string; name: string }> = {
  NG: { symbol: '\u20A6', code: 'NGN', name: 'Nigerian Naira' },
  US: { symbol: '$', code: 'USD', name: 'US Dollar' },
  GB: { symbol: '\u00A3', code: 'GBP', name: 'British Pound' },
  EU: { symbol: '\u20AC', code: 'EUR', name: 'Euro' },
  DE: { symbol: '\u20AC', code: 'EUR', name: 'Euro' },
  FR: { symbol: '\u20AC', code: 'EUR', name: 'Euro' },
  ES: { symbol: '\u20AC', code: 'EUR', name: 'Euro' },
  IT: { symbol: '\u20AC', code: 'EUR', name: 'Euro' },
  NL: { symbol: '\u20AC', code: 'EUR', name: 'Euro' },
  IN: { symbol: '\u20B9', code: 'INR', name: 'Indian Rupee' },
  JP: { symbol: '\u00A5', code: 'JPY', name: 'Japanese Yen' },
  CN: { symbol: '\u00A5', code: 'CNY', name: 'Chinese Yuan' },
  KR: { symbol: '\u20A9', code: 'KRW', name: 'Korean Won' },
  BR: { symbol: 'R$', code: 'BRL', name: 'Brazilian Real' },
  CA: { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar' },
  AU: { symbol: 'A$', code: 'AUD', name: 'Australian Dollar' },
  ZA: { symbol: 'R', code: 'ZAR', name: 'South African Rand' },
  KE: { symbol: 'KSh', code: 'KES', name: 'Kenyan Shilling' },
  GH: { symbol: 'GH\u20B5', code: 'GHS', name: 'Ghanaian Cedi' },
  EG: { symbol: 'E\u00A3', code: 'EGP', name: 'Egyptian Pound' },
  AE: { symbol: 'AED', code: 'AED', name: 'UAE Dirham' },
  SA: { symbol: 'SAR', code: 'SAR', name: 'Saudi Riyal' },
  MX: { symbol: 'MX$', code: 'MXN', name: 'Mexican Peso' },
  PH: { symbol: '\u20B1', code: 'PHP', name: 'Philippine Peso' },
  ID: { symbol: 'Rp', code: 'IDR', name: 'Indonesian Rupiah' },
  TH: { symbol: '\u0E3F', code: 'THB', name: 'Thai Baht' },
  PK: { symbol: 'Rs', code: 'PKR', name: 'Pakistani Rupee' },
  BD: { symbol: '\u09F3', code: 'BDT', name: 'Bangladeshi Taka' },
  TR: { symbol: '\u20BA', code: 'TRY', name: 'Turkish Lira' },
  PL: { symbol: 'z\u0142', code: 'PLN', name: 'Polish Zloty' },
  SE: { symbol: 'kr', code: 'SEK', name: 'Swedish Krona' },
  NO: { symbol: 'kr', code: 'NOK', name: 'Norwegian Krone' },
  DK: { symbol: 'kr', code: 'DKK', name: 'Danish Krone' },
  CH: { symbol: 'CHF', code: 'CHF', name: 'Swiss Franc' },
  RU: { symbol: '\u20BD', code: 'RUB', name: 'Russian Ruble' },
  SG: { symbol: 'S$', code: 'SGD', name: 'Singapore Dollar' },
  MY: { symbol: 'RM', code: 'MYR', name: 'Malaysian Ringgit' },
  TZ: { symbol: 'TSh', code: 'TZS', name: 'Tanzanian Shilling' },
}

const DEFAULT_CURRENCY = { symbol: '$', code: 'USD', name: 'US Dollar' }

type GeoInfo = {
  country: string
  countryCode: string
  city: string
  currency: { symbol: string; code: string; name: string }
}

export function Landing() {
  const [activeImage, setActiveImage] = useState(0)
  const [geo, setGeo] = useState<GeoInfo | null>(null)

  // Typewriter phrases
  const heroPhrases = [
    'stunning visuals',
    'beautiful logos',
    'concept art',
    'product photos',
    'anime characters',
  ]
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(heroPhrases[0].length)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentPhrase = heroPhrases[phraseIdx]
  const displayText = currentPhrase.slice(0, charIdx)

  useEffect(() => {
    const typeSpeed = isDeleting ? 40 : 80
    const pauseDelay = !isDeleting && charIdx === currentPhrase.length ? 2200 : isDeleting && charIdx === 0 ? 400 : typeSpeed

    const timeout = setTimeout(() => {
      if (!isDeleting && charIdx === currentPhrase.length) {
        // Start deleting after pause
        setIsDeleting(true)
      } else if (isDeleting && charIdx === 0) {
        // Move to next phrase
        setIsDeleting(false)
        setPhraseIdx((prev) => (prev + 1) % heroPhrases.length)
      } else {
        setCharIdx((prev) => prev + (isDeleting ? -1 : 1))
      }
    }, pauseDelay)

    return () => clearTimeout(timeout)
  }, [charIdx, isDeleting, currentPhrase, heroPhrases.length])

  useEffect(() => {
    const interval = setInterval(() => setActiveImage((prev) => (prev + 1) % showcaseImages.length), 5000)
    return () => clearInterval(interval)
  }, [])

  // Auto-detect location
  useEffect(() => {
    const detect = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/', { cache: 'force-cache' })
        if (!res.ok) throw new Error('Geo lookup failed')
        const data = await res.json()
        const cc = (data.country_code || '').toUpperCase()
        setGeo({
          country: data.country_name || 'Unknown',
          countryCode: cc,
          city: data.city || '',
          currency: CURRENCY_MAP[cc] || DEFAULT_CURRENCY,
        })
      } catch {
        setGeo({
          country: 'your country',
          countryCode: '',
          city: '',
          currency: DEFAULT_CURRENCY,
        })
      }
    }
    detect()
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-44 md:pb-32">
        {/* --- Animated flowing gradient background --- */}
        <div className="absolute inset-0 -z-10 overflow-hidden bg-background">
          {/* Base radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_50%_-20%,var(--primary)/0.08,transparent_70%)]" />

          {/* Flowing animated gradient orbs */}
          <motion.div
            className="absolute -top-1/3 left-1/4 h-[800px] w-[800px] rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -50, 100, 0],
              scale: [1, 1.3, 0.9, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            className="absolute -right-1/4 top-1/4 h-[600px] w-[600px] rounded-full opacity-15"
            style={{
              background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
              filter: 'blur(100px)',
            }}
            animate={{
              x: [-50, -100, 50, -50],
              y: [0, 60, -80, 0],
              scale: [0.9, 1.2, 1, 0.9],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />

          <motion.div
            className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 h-[700px] w-[700px] rounded-full opacity-10"
            style={{
              background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
              filter: 'blur(120px)',
            }}
            animate={{
              x: [0, -80, 80, 0],
              y: [0, 40, -60, 0],
              scale: [1.1, 0.95, 1.15, 1.1],
            }}
            transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Floating particles */}
          {[
            { x: '15%', y: '20%', size: 3, dur: 12 },
            { x: '80%', y: '30%', size: 2, dur: 15 },
            { x: '30%', y: '70%', size: 2.5, dur: 18 },
            { x: '85%', y: '80%', size: 2, dur: 14 },
            { x: '50%', y: '15%', size: 3, dur: 16 },
            { x: '20%', y: '85%', size: 2, dur: 20 },
            { x: '70%', y: '50%', size: 2.5, dur: 17 },
            { x: '10%', y: '50%', size: 2, dur: 19 },
          ].map((particle, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                background: 'var(--primary)',
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: particle.dur,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}

          {/* Subtle shimmer overlay lines */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear', repeatDelay: 5 }}
          />

          {/* Bottom fade to background */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary"
            >
              <FlaskConical className="h-3.5 w-3.5" />
              Beta &middot; Imoogle Picture Model
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold leading-[1.08] tracking-tight text-foreground md:text-6xl lg:text-7xl"
            >
              Turn words into
              <br />
              <span className="text-primary">
                {displayText}
                <span className="ml-0.5 inline-block w-[3px] align-middle animate-pulse bg-primary" style={{ height: '0.85em' }} />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Pictura is a free AI image generation model by Imoogle Labs.
              Create beautiful images from text or transform existing ones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/studio"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Open Studio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary sm:w-auto"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Showcase - 3D Perspective Card Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto mt-20 max-w-6xl"
            style={{ perspective: '1800px' }}
          >
            {/* Main display card with 3D tilt */}
            <div className="relative">
              {/* Ambient glow behind main card */}
              <motion.div
                className="absolute -inset-8 -z-10 rounded-3xl"
                animate={{
                  background: [
                    'radial-gradient(ellipse at 30% 50%, var(--primary) 0%, transparent 70%)',
                    'radial-gradient(ellipse at 70% 50%, var(--primary) 0%, transparent 70%)',
                    'radial-gradient(ellipse at 30% 50%, var(--primary) 0%, transparent 70%)',
                  ],
                  opacity: [0.06, 0.1, 0.06],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Stacked cards behind (depth effect) */}
              <div className="absolute -right-3 -bottom-3 left-3 top-3 -z-20 rounded-2xl border border-border/20 bg-card/40 blur-[1px]" />
              <div className="absolute -right-6 -bottom-6 left-6 top-6 -z-30 rounded-2xl border border-border/10 bg-card/20 blur-[2px]" />

              {/* Main card */}
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/10"
                animate={{
                  rotateY: [0, 1.5, 0, -1.5, 0],
                  rotateX: [0, -0.5, 0, 0.5, 0],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* Card flip animation between images */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ rotateY: 90, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <Image
                        src={showcaseImages[activeImage].src}
                        alt={showcaseImages[activeImage].label}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1100px"
                        priority
                      />

                      {/* Shimmer overlay during transition */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top-left label badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeImage}
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[11px] font-medium text-white/90">
                          {showcaseImages[activeImage].label}
                        </span>
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  {/* Bottom info panel with glassmorphism */}
                  <div className="absolute inset-x-0 bottom-0 z-10">
                    <div className="bg-gradient-to-t from-black/70 via-black/40 to-transparent px-6 pb-5 pt-16">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeImage}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.4, delay: 0.1 }}
                          className="flex items-end justify-between gap-4"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-primary/20 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-primary">
                                Prompt
                              </span>
                              <span className="font-mono text-[9px] text-white/30">
                                {activeImage + 1}/{showcaseImages.length}
                              </span>
                            </div>
                            <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/85">
                              {showcaseImages[activeImage].prompt}
                            </p>
                          </div>
                          <div className="flex flex-shrink-0 flex-col items-center gap-1">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
                              <PicturaIcon size={16} className="opacity-80" />
                            </div>
                            <span className="font-mono text-[8px] tracking-widest text-white/30">PICTURA</span>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Decorative corner accents */}
                  <div className="absolute top-3 right-3 z-10 h-6 w-6 border-t-2 border-r-2 border-primary/20 rounded-tr-lg" />
                  <div className="absolute bottom-3 left-3 z-10 h-6 w-6 border-b-2 border-l-2 border-primary/20 rounded-bl-lg" />
                </div>
              </motion.div>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-8 flex items-center justify-center gap-3">
              {showcaseImages.map((img, i) => (
                <button
                  key={img.src}
                  onClick={() => setActiveImage(i)}
                  className="group relative"
                  aria-label={`View ${img.label}`}
                >
                  <div className={`relative h-14 w-20 overflow-hidden rounded-lg border-2 transition-all duration-300 sm:h-16 sm:w-24 ${
                    i === activeImage
                      ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                      : 'border-border/30 opacity-50 hover:opacity-80 hover:border-border/60'
                  }`}>
                    <Image
                      src={img.src}
                      alt={img.label}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                    {i === activeImage && (
                      <motion.div
                        layoutId="showcase-active-indicator"
                        className="absolute inset-0 border-2 border-primary rounded-lg"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </div>
                  <span className={`mt-1.5 block text-center text-[9px] font-medium transition-colors ${
                    i === activeImage ? 'text-primary' : 'text-muted-foreground/50'
                  }`}>
                    {img.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Progress bar */}
            <div className="mx-auto mt-4 flex max-w-xs items-center gap-1.5">
              {showcaseImages.map((_, i) => (
                <div key={`prog-${i}`} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-border/30">
                  {i === activeImage && (
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 5, ease: 'linear' }}
                      key={`prog-active-${activeImage}`}
                    />
                  )}
                  {i < activeImage && (
                    <div className="absolute inset-0 rounded-full bg-primary/40" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h2
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance"
            >
              Everything you need to create
            </motion.h2>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={1}
              variants={fadeUp}
              className="mt-4 text-base text-muted-foreground"
            >
              Powerful AI with a simple interface. No prompt engineering required.
            </motion.p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                custom={i + 2}
                variants={fadeUp}
                className="group rounded-2xl border border-border/50 bg-card p-7 transition-colors hover:border-primary/30"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models - moved up after Features */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <GitBranch className="h-3 w-3" />
              Model Family
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              The Pictura Model Series
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              A family of image generation models built progressively with enhanced capabilities.
            </p>
          </motion.div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-3">
            {[
              {
                name: 'pi-1.0',
                label: 'Pictura pi-1.0',
                status: 'Active',
                statusColor: 'bg-primary/10 text-primary',
                desc: 'Our foundational model. Handles text-to-image and image-to-image generation with 1024px output. Optimized for diverse artistic styles and photorealism.',
                specs: ['1024 x 1024', 'Text & Image Input', 'General Purpose'],
              },
              {
                name: 'pi-1.5-turbo',
                label: 'Pictura pi-1.5 Turbo',
                status: 'Coming Soon',
                statusColor: 'bg-muted text-muted-foreground',
                desc: 'Our next iteration with 2x faster inference, higher fidelity details, and improved prompt adherence. Built on an optimized diffusion backbone.',
                specs: ['Up to 2048px', '2x Faster', 'Enhanced Detail'],
              },
              {
                name: 'pi-2.0',
                label: 'Pictura pi-2.0',
                status: 'In Research',
                statusColor: 'bg-muted text-muted-foreground',
                desc: 'Next-generation architecture with multi-modal understanding, style memory, and composable scene generation. A fundamentally new approach to visual synthesis.',
                specs: ['Multi-Modal', 'Style Memory', 'Scene Composition'],
              },
            ].map((model, i) => (
              <motion.div
                key={model.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-30px' }}
                custom={i + 1}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card"
              >
                {/* Status badge */}
                <div className="flex items-center justify-between border-b border-border/30 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <PicturaIcon size={16} />
                    <span className="font-mono text-xs font-bold text-foreground">{model.name}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${model.statusColor}`}>
                    {model.status}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-base font-semibold text-foreground">{model.label}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{model.desc}</p>

                  {/* Spec badges */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {model.specs.map((spec) => (
                      <span key={spec} className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <BarChart3 className="h-3 w-3" />
              Comparison
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              How Pictura compares
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              See how we stack up against other popular image generation platforms.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={1}
            variants={fadeUp}
            className="mx-auto mt-14 max-w-6xl"
          >
            {/* Scrollable wrapper for mobile */}
            <div className="-mx-6 overflow-x-auto px-6 pb-2 scrollbar-thin">
              <div className="min-w-[800px]">
                <div className="overflow-hidden rounded-2xl border border-border/50 shadow-lg shadow-primary/5">
                  {/* Frosted glass header */}
                  <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] border-b border-border/30 bg-card/80 backdrop-blur-sm">
                    <div className="px-5 py-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Feature</div>
                    <div className="relative flex items-center gap-2 px-5 py-4">
                      {/* Pictura highlight glow */}
                      <div className="absolute inset-0 bg-primary/[0.04]" />
                      <div className="relative flex items-center gap-2">
                        <PicturaIcon size={14} />
                        <span className="text-xs font-bold text-primary">Pictura</span>
                      </div>
                    </div>
                    <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">DALL-E 3</div>
                    <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">Midjourney</div>
                    <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">Stable Diff.</div>
                    <div className="px-5 py-4 text-xs font-semibold text-muted-foreground">Nano Banana</div>
                  </div>

                  {/* Table rows */}
                  {[
                    { feature: 'Pricing', pictura: geo ? `${geo.currency.symbol}0 Free` : 'Free', dalle: '$0.04/img', midjourney: '$10/mo', stable: 'Free*', nano: 'Freemium' },
                    { feature: 'Max Resolution', pictura: '1024px', dalle: '1024px', midjourney: '1024px', stable: '1024px', nano: '1024px' },
                    { feature: 'Image-to-Image', pictura: true, dalle: false, midjourney: true, stable: true, nano: true },
                    { feature: 'No Sign-Up', pictura: true, dalle: false, midjourney: false, stable: true, nano: false },
                    { feature: 'API Access', pictura: 'Soon', dalle: true, midjourney: false, stable: true, nano: true },
                    { feature: 'Safety Filter', pictura: true, dalle: true, midjourney: true, stable: 'Optional', nano: true },
                    { feature: 'Open Source', pictura: 'Planned', dalle: false, midjourney: false, stable: true, nano: false },
                    { feature: 'Daily Free Tier', pictura: '5 images', dalle: 'None', midjourney: 'None', stable: 'Unlimited*', nano: 'Limited' },
                    { feature: 'Speed', pictura: 'Fast', dalle: 'Medium', midjourney: 'Slow', stable: 'Varies', nano: 'Fast' },
                  ].map((row, i) => (
                    <div
                      key={row.feature}
                      className={`group grid grid-cols-[1.4fr_1fr_1fr_1fr_1fr_1fr] transition-colors hover:bg-primary/[0.02] ${
                        i % 2 === 0 ? 'bg-background' : 'bg-secondary/15'
                      } ${i < 8 ? 'border-b border-border/15' : ''}`}
                    >
                      <div className="px-5 py-3.5 text-xs font-medium text-foreground">{row.feature}</div>
                      {[row.pictura, row.dalle, row.midjourney, row.stable, row.nano].map((val, ci) => (
                        <div
                          key={`${row.feature}-${ci}`}
                          className={`relative flex items-center px-5 py-3.5 ${ci === 0 ? '' : ''}`}
                        >
                          {/* Pictura column highlight */}
                          {ci === 0 && <div className="absolute inset-0 bg-primary/[0.03]" />}
                          <div className="relative">
                            {val === true ? (
                              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                ci === 0
                                  ? 'bg-primary/15 text-primary'
                                  : 'bg-primary/10 text-primary/80'
                              }`}>
                                <Check className="h-3 w-3" />
                                Yes
                              </span>
                            ) : val === false ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground/50">
                                <X className="h-3 w-3" />
                                No
                              </span>
                            ) : (
                              <span className={`text-xs ${ci === 0 ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                                {val}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll hint on mobile */}
            <p className="mt-2 text-center text-[10px] text-muted-foreground/40 sm:hidden">
              Swipe to see all platforms
            </p>
            <p className="mt-3 text-center text-[10px] text-muted-foreground/50">
              * Stable Diffusion requires self-hosting for unlimited free usage. Comparison as of 2025.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Technical Paper / Research Section */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-4xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Microscope className="h-3 w-3" />
                Research
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                How Pictura Works
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                A technical overview of the architecture and methodology behind Pictura.
              </p>
            </motion.div>

            {/* Paper-style abstract card */}
            <motion.article
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={1}
              variants={fadeUp}
              className="mt-12 rounded-2xl border border-border/50 bg-card"
            >
              <div className="border-b border-border/30 px-6 py-5 md:px-8">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                  <div>
                    <h3 className="text-base font-bold text-foreground md:text-lg">
                      Pictura: Multi-Stage Diffusion for High-Fidelity Image Synthesis
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Imoogle Labs &middot; Research Division &middot; 2025
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-6 md:px-8">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Abstract</p>
                <p className="text-sm leading-[1.7] text-foreground">
                  We present Pictura, a multi-stage diffusion-based image generation system designed
                  for high-fidelity visual synthesis from textual and visual prompts. Our architecture
                  introduces a <strong>cascaded pipeline</strong> that combines semantic understanding through
                  transformer-based prompt encoding, style-conditioned latent diffusion for initial synthesis,
                  and a learned super-resolution module for detail refinement. The system employs a
                  novel <strong>adaptive routing mechanism</strong> that dynamically selects specialized sub-networks
                  based on detected content category (portrait, landscape, abstract, architectural), yielding
                  measurable improvements in output coherence. Safety constraints are enforced through an
                  integrated classifier operating in latent space, enabling content moderation without
                  post-generation filtering.
                </p>

                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Key Contributions</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { title: 'Cascaded Diffusion Pipeline', desc: 'A three-stage architecture combining semantic encoding, latent diffusion, and learned upscaling for optimal quality-speed trade-offs.' },
                      { title: 'Adaptive Style Routing', desc: 'Content-aware model selection that routes generation through specialized sub-networks based on detected visual category.' },
                      { title: 'Latent-Space Safety', desc: 'An integrated classifier operating on latent representations for efficient real-time content moderation without quality loss.' },
                      { title: 'Edge-Optimized Inference', desc: 'Quantized model variants and CDN-backed delivery enabling sub-second generation at global scale.' },
                    ].map((c) => (
                      <div key={c.title} className="rounded-xl border border-border/30 bg-background p-4">
                        <h4 className="text-xs font-semibold text-foreground">{c.title}</h4>
                        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">System Specifications</p>
                  <div className="overflow-hidden rounded-xl border border-border/30">
                    <table className="w-full text-left text-xs">
                      <tbody>
                        {[
                          ['Architecture', 'Cascaded Latent Diffusion with Transformer Encoder'],
                          ['Prompt Encoder', 'Custom CLIP-aligned text encoder (512-dim)'],
                          ['Diffusion Steps', '50-step DDIM sampling with classifier-free guidance'],
                          ['Output Resolution', '1024 x 1024 (pi-1.0)'],
                          ['Safety Layer', 'Latent-space NSFW classifier (99.2% precision)'],
                          ['Inference', 'Optimized via quantization + edge caching'],
                        ].map(([key, val], i) => (
                          <tr key={key} className={i % 2 === 0 ? 'bg-background' : 'bg-secondary/30'}>
                            <td className="whitespace-nowrap px-4 py-2.5 font-medium text-foreground">{key}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 rounded-xl bg-secondary/40 px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Citation</p>
                  <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                    Imoogle Labs (2025). Pictura: Multi-Stage Diffusion for High-Fidelity Image Synthesis. <em>Imoogle Research Technical Report</em>, TR-2025-001.
                  </p>
                </div>
              </div>
            </motion.article>
          </div>
        </div>
      </section>

      {/* Architecture / Pipeline */}
      <section className="border-t border-border/40 bg-secondary/20 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
              className="mx-auto max-w-2xl text-center"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                <Cpu className="h-3 w-3" />
                Under the Hood
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                Our Architecture
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Pictura is built on a multi-stage generation pipeline optimized for quality and speed.
              </p>
            </motion.div>

            <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-3">
              {architecture.map((a, i) => (
                <motion.div
                  key={a.title}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-30px' }}
                  custom={i + 1}
                  variants={fadeUp}
                  className="rounded-2xl border border-border/50 bg-card p-6"
                >
                  <a.icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{a.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{a.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Pipeline wire diagram */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={4}
              variants={fadeUp}
              className="mt-10 rounded-2xl border border-border/50 bg-card p-6 md:p-8"
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Generation Pipeline</p>

              <div className="flex flex-col md:hidden">
                {[
                  { icon: Cpu, label: 'Prompt Analysis', desc: 'NLP parsing & intent detection' },
                  { icon: Layers, label: 'Model Router', desc: 'Style-optimized model selection' },
                  { icon: Zap, label: 'Diffusion Engine', desc: 'Multi-pass image generation' },
                  { icon: Shield, label: 'Safety & Enhance', desc: 'Content filter & upscaling' },
                  { icon: Globe, label: 'Edge Delivery', desc: 'CDN-backed global output' },
                ].map((s, i, arr) => (
                  <div key={s.label} className="flex flex-col items-center">
                    <div className="flex w-full items-center gap-4 rounded-xl border border-border/40 bg-background px-4 py-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{s.label}</p>
                        <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="flex flex-col items-center py-1">
                        <div className="h-4 w-px bg-primary/30" />
                        <svg width="8" height="5" viewBox="0 0 8 5" className="text-primary/30" aria-hidden="true"><path d="M4 5L0 0h8z" fill="currentColor" /></svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <div className="relative flex items-start justify-between">
                  <div className="absolute top-[18px] left-[36px] right-[36px] h-px bg-primary/20" aria-hidden="true" />
                  <div className="absolute top-[17px] left-[36px] right-[36px] h-[3px] overflow-hidden" aria-hidden="true">
                    <div className="h-full w-24 rounded-full bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-[slideWire_3s_ease-in-out_infinite]" />
                  </div>
                  {[
                    { icon: Cpu, label: 'Prompt Analysis', desc: 'NLP parsing' },
                    { icon: Layers, label: 'Model Router', desc: 'Style routing' },
                    { icon: Zap, label: 'Diffusion', desc: 'Generation' },
                    { icon: Shield, label: 'Safety', desc: 'Filter & enhance' },
                    { icon: Globe, label: 'Delivery', desc: 'CDN output' },
                  ].map((s) => (
                    <div key={s.label} className="relative z-10 flex flex-col items-center gap-2.5 text-center" style={{ width: '18%' }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-card shadow-sm">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{s.label}</p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Model Info + Roadmap */}
      <section className="border-t border-border/40 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={0}
              variants={fadeUp}
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
                Built in Nigeria,
                <br />for the world
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                Pictura is the Imoogle Picture Model &mdash; developed by Imoogle Labs, a non-profit AI
                research lab. We believe powerful creative AI should be free and accessible to everyone.
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                During beta, every user gets 5 free generations per day. We are actively improving
                the model and working toward releasing a public API.
              </p>

              {/* Stats cards */}
              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  {
                    icon: ImageIcon,
                    value: '5',
                    label: 'Daily Limit',
                    sub: 'Free generations',
                  },
                  {
                    icon: CircleDollarSign,
                    value: geo ? `${geo.currency.symbol}0` : 'Free',
                    label: 'Price',
                    sub: geo ? `${geo.currency.code} \u2014 free forever` : 'Always free',
                  },
                  {
                    icon: Zap,
                    value: '1024',
                    label: 'Max Resolution',
                    sub: 'px output size',
                  },
                  {
                    icon: Clock,
                    value: '<5s',
                    label: 'Generation',
                    sub: 'Average latency',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="group rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-primary/20"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8 transition-colors group-hover:bg-primary/15">
                      <stat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="mt-3 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                      {stat.value}
                    </div>
                    <div className="mt-0.5 text-xs font-medium text-foreground/70">{stat.label}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Location badge */}
              {geo && geo.countryCode && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/40 bg-secondary/40 px-3.5 py-1.5"
                >
                  <MapPin className="h-3 w-3 text-primary" />
                  <span className="text-[11px] text-muted-foreground">
                    Detected: <span className="font-medium text-foreground">{geo.city ? `${geo.city}, ` : ''}{geo.country}</span>
                    {' '}&middot; Currency: <span className="font-medium text-foreground">{geo.currency.symbol} {geo.currency.code}</span>
                  </span>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              custom={2}
              variants={fadeUp}
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">Roadmap</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Beta Launch', status: 'Live', active: true },
                  { label: 'Image-to-Image Support', status: 'Live', active: true },
                  { label: 'Higher Resolution Output', status: 'In Progress', active: false },
                  { label: 'Public API Release', status: 'Coming Soon', active: false },
                  { label: 'Style Controls & Presets', status: 'Planned', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-card px-5 py-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-2 w-2 rounded-full ${item.active ? 'bg-primary' : 'bg-border'}`} />
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${
                      item.status === 'Live'
                        ? 'bg-primary/10 text-primary'
                        : item.status === 'In Progress'
                        ? 'bg-accent/15 text-accent-foreground'
                        : item.status === 'Coming Soon'
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-secondary text-muted-foreground'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA with animated background */}
      <section className="relative overflow-hidden border-t border-border/40 py-24 md:py-32">
        {/* Animated soul particles */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          {/* Floating orbs */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full bg-primary/10 blur-2xl"
              style={{
                width: 80 + i * 40,
                height: 80 + i * 40,
                left: `${10 + i * 15}%`,
                top: `${15 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30, 0, 30, 0],
                x: [0, 15, -15, 10, 0],
                scale: [1, 1.1, 0.95, 1.05, 1],
                opacity: [0.3, 0.5, 0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}

          {/* Rotating ring */}
          <motion.div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            <svg width="500" height="500" viewBox="0 0 500 500" className="opacity-[0.06]">
              <circle cx="250" cy="250" r="200" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="10 20" className="text-primary" />
              <circle cx="250" cy="250" r="240" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="5 15" className="text-foreground" />
            </svg>
          </motion.div>

          {/* Floating dots - deterministic positions to avoid hydration mismatch */}
          {[
            { l: 12, t: 8, y: 52, d: 3.2, dl: 0.1 }, { l: 34, t: 72, y: 68, d: 5.1, dl: 1.2 },
            { l: 56, t: 23, y: 45, d: 4.3, dl: 2.3 }, { l: 78, t: 61, y: 90, d: 6.0, dl: 0.8 },
            { l: 91, t: 15, y: 55, d: 3.8, dl: 3.5 }, { l: 5, t: 88, y: 70, d: 4.9, dl: 1.7 },
            { l: 45, t: 45, y: 60, d: 5.5, dl: 0.5 }, { l: 67, t: 33, y: 48, d: 3.5, dl: 2.8 },
            { l: 23, t: 56, y: 82, d: 6.2, dl: 4.1 }, { l: 82, t: 78, y: 44, d: 4.1, dl: 0.3 },
            { l: 15, t: 35, y: 75, d: 5.8, dl: 3.2 }, { l: 50, t: 90, y: 58, d: 3.9, dl: 1.5 },
            { l: 72, t: 10, y: 66, d: 4.7, dl: 2.0 }, { l: 38, t: 65, y: 50, d: 5.3, dl: 4.5 },
            { l: 88, t: 42, y: 72, d: 3.3, dl: 0.9 }, { l: 8, t: 55, y: 88, d: 6.5, dl: 3.8 },
            { l: 62, t: 82, y: 42, d: 4.4, dl: 1.1 }, { l: 28, t: 18, y: 62, d: 5.0, dl: 2.6 },
            { l: 95, t: 50, y: 56, d: 3.6, dl: 4.0 }, { l: 42, t: 3, y: 78, d: 4.8, dl: 0.6 },
          ].map((dot, i) => (
            <motion.div
              key={`dot-${i}`}
              className="absolute h-1 w-1 rounded-full bg-primary/30"
              style={{ left: `${dot.l}%`, top: `${dot.t}%` }}
              animate={{ y: [0, -dot.y, 0], opacity: [0, 0.8, 0] }}
              transition={{ duration: dot.d, repeat: Infinity, delay: dot.dl, ease: 'easeInOut' }}
            />
          ))}

          {/* Central glow */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto w-fit"
            >
              <PicturaIcon size={48} className="mx-auto" />
            </motion.div>
            <h2 className="mx-auto mt-6 max-w-lg text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Start creating with Pictura
            </h2>
            <p className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
              No sign-up required. Open the studio and start generating for free.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/studio"
                className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
              >
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '2s' }} />
                Open Studio
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
