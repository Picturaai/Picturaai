'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PicturaWatermark } from './pictura-logo'

const showcaseImages = [
  { src: '/images/showcase-1.jpg', alt: 'AI-generated African savanna landscape' },
  { src: '/images/showcase-2.jpg', alt: 'AI-generated portrait in traditional fashion' },
  { src: '/images/showcase-3.jpg', alt: 'AI-generated futuristic African city' },
  { src: '/images/showcase-4.jpg', alt: 'AI-generated underwater coral reef' },
  { src: '/images/showcase-5.jpg', alt: 'AI-generated enchanted forest' },
  { src: '/images/showcase-6.jpg', alt: 'AI-generated cosmic nebula' },
]

export function LandingHero() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseImages.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-16 px-6">
      {/* Background showcase image with fade */}
      <div className="absolute inset-0 -z-10">
        {showcaseImages.map((img, i) => (
          <div
            key={img.src}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              i === activeIndex ? 'opacity-20' : 'opacity-0'
            }`}
          >
            <Image
              src={img.src}
              alt=""
              fill
              className="object-cover"
              priority={i === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
      </div>

      {/* Hero content */}
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-xs font-mono tracking-wider text-primary">
            BETA MODEL / FREE ACCESS
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground text-balance leading-[1.1]">
          Imagine it.
          <br />
          <span className="text-primary">Pictura</span> creates it.
        </h1>

        <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed text-pretty">
          The Imoogle Picture Model. Generate stunning, high-quality images from text
          or transform existing ones with our AI. Built in Nigeria, for the world.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <Link
            href="/studio"
            className="group flex items-center gap-2 px-7 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            Open Studio
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <Link
            href="/about"
            className="px-7 py-3.5 text-base font-medium text-foreground bg-secondary/60 rounded-2xl hover:bg-secondary transition-all border border-border"
          >
            Learn More
          </Link>
        </div>

        <p className="text-xs text-muted-foreground mt-1 font-mono tracking-wide">
          FREE DURING BETA / 5 IMAGES PER DAY / NO SIGN-UP REQUIRED
        </p>
      </div>

      {/* Showcase gallery grid */}
      <div className="w-full max-w-6xl mx-auto mt-16 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {showcaseImages.map((img, i) => (
            <div
              key={img.src}
              className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-500 cursor-pointer ${
                i === activeIndex
                  ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'border-border hover:border-primary/40'
              }`}
              onClick={() => setActiveIndex(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setActiveIndex(i) }}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Watermark */}
              <div className="absolute bottom-2 right-2">
                <PicturaWatermark />
              </div>
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">
          All images above were generated with Pictura
        </p>
      </div>
    </section>
  )
}
