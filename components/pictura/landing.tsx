'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Layers, Globe, FlaskConical, Cpu, Shield, BarChart3, BookOpen, Microscope, GitBranch, Check, X, MapPin, CircleDollarSign, Image as ImageIcon, Clock, Sparkles } from 'lucide-react'
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

  // Typewriter phrases - memoized to prevent re-renders
  const heroPhrases = useMemo(() => [
    'stunning visuals',
    'beautiful logos',
    'concept art',
    'product photos',
    'anime characters',
  ], [])
  
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(heroPhrases[0].length)
  const [isDeleting, setIsDeleting] = useState(false)
  const currentPhrase = heroPhrases[phraseIdx]
  const displayText = currentPhrase.slice(0, charIdx)

  useEffect(() => {
    const typeSpeed = isDeleting ? 30 : 60
    const pauseDelay = !isDeleting && charIdx === currentPhrase.length ? 1800 : isDeleting && charIdx === 0 ? 300 : typeSpeed

    const timeout = setTimeout(() => {
      if (!isDeleting && charIdx === currentPhrase.length) {
        setIsDeleting(true)
      } else if (isDeleting && charIdx === 0) {
        setIsDeleting(false)
        setPhraseIdx((prev) => (prev + 1) % heroPhrases.length)
      } else {
        setCharIdx((prev) => prev + (isDeleting ? -1 : 1))
      }
    }, pauseDelay)

    return () => clearTimeout(timeout)
  }, [charIdx, isDeleting, currentPhrase.length, heroPhrases, phraseIdx])

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
      {/* Hero - Clean, minimal design */}
      <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24">
        {/* Brand color background glow */}
        <div className="absolute inset-0 -z-10 bg-background">
          {/* Top glow */}
          <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,var(--primary)/0.15,transparent_70%)]" />
          {/* Side accents */}
          <div className="absolute -left-40 top-20 h-80 w-80 rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute -right-40 top-40 h-80 w-80 rounded-full bg-primary/8 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            {/* Simple badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <FlaskConical className="h-3 w-3" />
              Free Beta
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Turn words into
              <br />
              <span className="text-primary">
                {displayText}
                <motion.span 
                  className="ml-0.5 inline-block w-[2px] bg-primary align-baseline"
                  style={{ height: '0.7em' }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                />
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
            >
              Free AI image generation by Imoogle Labs. Create stunning visuals from text or transform existing images.
            </motion.p>

            {/* CTA buttons - minimal shadows */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
            >
              <Link
                href="/studio"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98] sm:w-auto"
              >
                Start Creating
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex w-full items-center justify-center rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-secondary sm:w-auto"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Real Studio UI Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 sm:mt-16 -mx-6 px-3 sm:px-4"
          >
            {/* App Window */}
            <div className="relative rounded-xl sm:rounded-2xl border border-border/40 bg-card overflow-hidden">
              {/* Window Chrome */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/40 bg-secondary/30">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-md bg-primary/15 flex items-center justify-center">
                    <PicturaIcon size={12} className="text-primary" />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-foreground hidden sm:inline">Pictura</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background/60 border border-border/30">
                  <svg className="h-3 w-3 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  <span className="text-[10px] sm:text-xs text-muted-foreground">picturaai.sbs</span>
                </div>
                <div className="w-12 sm:w-16" />
              </div>

              {/* App Content - No sidebar on mobile for more space */}
              <div className="p-3 sm:p-4">
                {/* Prompt Input */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/50 bg-background min-w-0">
                    <svg className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={activeImage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 text-xs sm:text-sm text-foreground truncate"
                      >
                        {showcaseImages[activeImage].prompt.replace(/"/g, '')}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                  <button className="px-3 sm:px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 flex-shrink-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                    <span className="hidden xs:inline sm:inline">Generate</span>
                  </button>
                </div>

                {/* Main Output Image */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-secondary/30">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={showcaseImages[activeImage].src}
                        alt={showcaseImages[activeImage].label}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority
                      />
                    </motion.div>
                  </AnimatePresence>
                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-primary/90 backdrop-blur-sm text-[10px] font-medium text-primary-foreground">
                      {showcaseImages[activeImage].label}
                    </span>
                  </div>
                  {/* Action buttons */}
                  <div className="absolute top-2.5 right-2.5 flex gap-1.5">
                    <button className="h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    </button>
                    <button className="h-7 w-7 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    </button>
                  </div>
                </div>

                {/* Thumbnails - always 5 columns, evenly spaced */}
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mt-2.5">
                  {showcaseImages.slice(0, 5).map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                        i === activeImage ? 'ring-2 ring-primary' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img.src} alt="" fill className="object-cover" sizes="20vw" />
                    </button>
                  ))}
                </div>

                {/* Settings Bar */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground">
                    <span><span className="font-medium text-foreground">Model:</span> pi-1.0</span>
                    <span className="hidden sm:inline"><span className="font-medium text-foreground">Size:</span> 1024 x 1024</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-primary">
                    <PicturaIcon size={10} className="text-primary" />
                    <span className="font-medium">Pictura AI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats - Clean horizontal layout */}
            <div className="mt-10 sm:mt-12 px-3">
              <div className="flex items-center justify-center gap-6 sm:gap-12 md:gap-16">
                {/* Free */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <CircleDollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">Free</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Forever</p>
                  </div>
                </div>
                
                {/* 10s */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">10s</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Generation</p>
                  </div>
                </div>
                
                {/* HD */}
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg sm:text-2xl font-bold text-foreground">HD</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Quality</p>
                  </div>
                </div>
              </div>
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

      {/* Gallery - Auto-scrolling cards */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            custom={0}
            variants={fadeUp}
            className="mx-auto max-w-2xl text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ImageIcon className="h-3 w-3" />
              Gallery
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground md:text-4xl text-balance">
              Created with Pictura
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              See what's possible with AI-powered image generation
            </p>
          </motion.div>
        </div>

        {/* Auto-scrolling gallery */}
        <div className="relative">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* First row - scrolls right */}
          <motion.div
            className="flex gap-4 mb-4"
            animate={{ x: [0, -1920] }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          >
            {[...showcaseImages, ...showcaseImages, ...showcaseImages, ...showcaseImages].map((img, i) => (
              <div
                key={`row1-${i}`}
                className="group relative flex-shrink-0 w-72 md:w-80 aspect-[4/3] rounded-xl overflow-hidden border border-border/30 bg-card"
              >
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-medium text-white mb-2">
                    {img.label}
                  </span>
                  <p className="text-xs text-white/90 line-clamp-2">{img.prompt.replace(/"/g, '')}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Second row - scrolls left */}
          <motion.div
            className="flex gap-4"
            animate={{ x: [-1920, 0] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            {[...showcaseImages.slice(3), ...showcaseImages, ...showcaseImages, ...showcaseImages.slice(0, 3)].map((img, i) => (
              <div
                key={`row2-${i}`}
                className="group relative flex-shrink-0 w-72 md:w-80 aspect-[4/3] rounded-xl overflow-hidden border border-border/30 bg-card"
              >
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="320px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 inset-x-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <span className="inline-block rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-medium text-white mb-2">
                    {img.label}
                  </span>
                  <p className="text-xs text-white/90 line-clamp-2">{img.prompt.replace(/"/g, '')}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Models - moved up after Features */}
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
              Ready to create amazing visuals?
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
