'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Disc3, Download, Heart, Mic2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'
import { clampSeekTime, formatMediaTime, playbackRatio } from '@/lib/media'

const WAVEFORM = [
  0.32, 0.55, 0.78, 0.42, 0.68, 0.92, 0.6, 0.35, 0.82, 0.5, 0.72, 0.4, 0.58, 0.85, 0.5, 0.3, 0.65, 0.9, 0.45, 0.55,
  0.75, 0.4, 0.6, 0.8, 0.45, 0.65, 0.88, 0.52, 0.36, 0.74, 0.48, 0.62, 0.86, 0.5, 0.3, 0.7, 0.42, 0.58, 0.82, 0.5,
]

const SKIP_SECONDS = 10

/** Playable PicturaSound demo track: real audio, scrubbable waveform, live progress. */
export function AudioPreviewPlayer({
  src,
  title,
  subtitle,
  cover,
  lyrics,
}: {
  src: string
  title: string
  subtitle: string
  cover: string
  lyrics: React.ReactNode
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [liked, setLiked] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      audio.play().catch(() => {
        /* playback can be refused before a user gesture; the button stays available */
      })
    } else {
      audio.pause()
    }
  }, [])

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = clampSeekTime(seconds, audio.duration)
    setCurrentTime(audio.currentTime)
  }, [])

  const seekToRatio = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const bounds = event.currentTarget.getBoundingClientRect()
      if (bounds.width === 0) return
      seek(((event.clientX - bounds.left) / bounds.width) * (audioRef.current?.duration ?? 0))
    },
    [seek]
  )

  const toggleMuted = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }, [])

  // Metadata can land before hydration attaches the event handlers.
  useEffect(() => {
    const audio = audioRef.current
    if (audio && audio.readyState >= HTMLMediaElement.HAVE_METADATA) setDuration(audio.duration)
  }, [])

  const ratio = playbackRatio(currentTime, duration)

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-lg">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Top: cover + meta — stacks on mobile */}
      <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
        <div className="relative aspect-square overflow-hidden bg-secondary/30 sm:aspect-auto">
          <Image src={cover} alt={`${title} cover art`} fill className="object-cover" sizes="(min-width: 640px) 180px, 100vw" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/40" />
          {/* Vinyl accent spins only while the track plays */}
          <motion.div
            className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur-md"
            animate={playing ? { rotate: 360 } : { rotate: 0 }}
            transition={playing ? { duration: 8, repeat: Infinity, ease: 'linear' } : { duration: 0.4 }}
          >
            <Disc3 className="h-4 w-4 text-white" />
          </motion.div>
        </div>

        <div className="flex flex-col justify-between gap-3 p-4 sm:p-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">Demo</span>
              <span className="text-[10px] text-muted-foreground">
                {formatMediaTime(duration)} · 44.1kHz · Stereo
              </span>
            </div>
            <h3 className="mt-2 text-lg font-bold text-foreground sm:text-xl">{title}</h3>
            <p className="text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
          </div>

          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => seek(currentTime - SKIP_SECONDS)}
              aria-label={`Back ${SKIP_SECONDS} seconds`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <SkipBack className="h-4 w-4 fill-current" />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? 'Pause track' : 'Play track'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-transform hover:scale-105 active:scale-95"
            >
              {playing ? <Pause className="h-5 w-5 fill-current" /> : <Play className="h-5 w-5 translate-x-0.5 fill-current" />}
            </button>
            <button
              type="button"
              onClick={() => seek(currentTime + SKIP_SECONDS)}
              aria-label={`Forward ${SKIP_SECONDS} seconds`}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <SkipForward className="h-4 w-4 fill-current" />
            </button>

            <div className="ml-1 flex min-w-0 flex-1 items-center gap-2 sm:ml-2">
              <span className="flex-shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">{formatMediaTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.1}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                aria-label="Seek track"
                className="h-1 w-full min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-secondary outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--primary) ${ratio * 100}%, transparent ${ratio * 100}%)`,
                }}
              />
              <span className="flex-shrink-0 font-mono text-[10px] text-muted-foreground tabular-nums">{formatMediaTime(duration)}</span>
            </div>

            <button
              type="button"
              onClick={toggleMuted}
              aria-label={muted ? 'Unmute track' : 'Mute track'}
              className="hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setLiked((prev) => !prev)}
              aria-label={liked ? 'Remove from favourites' : 'Add to favourites'}
              aria-pressed={liked}
              className={`hidden h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-secondary sm:flex ${
                liked ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
            >
              <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            </button>
            <a
              href={src}
              download
              aria-label="Download track"
              className="hidden h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex"
            >
              <Download className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Waveform — click to scrub, animates only while playing */}
      <div className="border-t border-border/30 bg-secondary/20 p-4 sm:p-5">
        <div
          onClick={seekToRatio}
          role="presentation"
          className="flex h-16 cursor-pointer items-center gap-[2px] sm:h-20 sm:gap-[3px]"
        >
          {WAVEFORM.map((h, i) => {
            const played = i / (WAVEFORM.length - 1) <= ratio
            return (
              <motion.span
                key={i}
                className={`flex-1 rounded-sm transition-colors ${played ? 'bg-primary' : 'bg-primary/30'}`}
                style={{ height: `${h * 100}%` }}
                animate={playing ? { height: [`${h * 100}%`, `${(1 - h * 0.55) * 100}%`, `${h * 100}%`] } : { height: `${h * 100}%` }}
                transition={
                  playing
                    ? { duration: 1.6 + (i % 5) * 0.2, repeat: Infinity, ease: 'easeInOut', delay: i * 0.04 }
                    : { duration: 0.3 }
                }
              />
            )
          })}
        </div>
      </div>

      {/* Lyrics preview row */}
      <div className="border-t border-border/30 bg-card px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Mic2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Lyrics</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-foreground sm:text-sm">{lyrics}</p>
      </div>
    </div>
  )
}
