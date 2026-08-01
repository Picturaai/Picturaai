'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { PicturaIcon } from './pictura-logo'
import { clampSeekTime, formatMediaTime, frameAtTime, playbackRatio } from '@/lib/media'

const FPS = 24

/**
 * Autoplaying, scrubbable preview of a PicturaGen clip. Plays muted once it scrolls
 * into view, pauses when it leaves, and hands control to the visitor on first tap.
 */
export function VideoPreviewPlayer({
  src,
  poster,
  seed,
}: {
  src: string
  poster: string
  seed: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const userPausedRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)

  const play = useCallback(() => {
    videoRef.current?.play().catch(() => {
      /* autoplay can be refused by the browser; the poster and play button stay visible */
    })
  }, [])

  const toggle = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      userPausedRef.current = false
      play()
    } else {
      userPausedRef.current = true
      video.pause()
    }
  }, [play])

  const toggleMuted = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [])

  const seek = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = clampSeekTime(seconds, video.duration)
    setCurrentTime(video.currentTime)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {})
    } else {
      container.requestFullscreen?.().catch(() => {})
    }
  }, [])

  // Autoplay while in view, pause on the way out — unless the visitor paused it.
  useEffect(() => {
    const container = containerRef.current
    const video = videoRef.current
    if (!container || !video) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reducedMotion && !userPausedRef.current) play()
        } else if (!video.paused) {
          video.pause()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [play])

  // Metadata can land before hydration attaches the event handlers.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      setDuration(video.duration)
      setPlaying(!video.paused)
    }
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const ratio = playbackRatio(currentTime, duration)
  const { frame, total } = frameAtTime(currentTime, duration, FPS)

  return (
    <div ref={containerRef} className="relative aspect-video overflow-hidden bg-secondary/30">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label="PicturaGen video preview"
        className="h-full w-full cursor-pointer object-cover"
        onClick={toggle}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
      />

      {/* Cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/15" />

      {/* Top-left: live playback chip */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md sm:left-4 sm:top-4">
        <span className="relative flex h-1.5 w-1.5">
          {playing && <span className="absolute inset-0 animate-ping rounded-full bg-primary/70" />}
          <span className="relative inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        {playing ? `Playing · frame ${frame} / ${total}` : `Paused · frame ${frame} / ${total}`}
      </div>

      {/* Top-right: quality + seed chips */}
      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 sm:right-4 sm:top-4">
        <div className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
          HD · 1280×720
        </div>
        <div className="hidden rounded-full bg-black/50 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur-md sm:block">
          seed {seed}
        </div>
      </div>

      {/* Center play button — only while paused */}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause preview' : 'Play preview'}
        className={`absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-foreground shadow-xl backdrop-blur-md transition-all hover:scale-105 ${
          playing ? 'pointer-events-none scale-90 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <Play className="h-6 w-6 translate-x-0.5 fill-current" />
      </button>

      {/* Pictura watermark */}
      <div className="pointer-events-none absolute bottom-[68px] right-3 flex items-center gap-1.5 rounded-md bg-black/40 px-2 py-1 backdrop-blur-md sm:right-4">
        <PicturaIcon size={10} className="text-white" />
        <span className="text-[10px] font-medium text-white/90">Pictura</span>
      </div>

      {/* Controls */}
      <div className="absolute inset-x-3 bottom-3 rounded-xl border border-white/10 bg-black/50 px-3 py-2 backdrop-blur-md sm:inset-x-4 sm:bottom-4">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15"
          >
            {playing ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          </button>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.05}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek video"
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 outline-none [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{ backgroundImage: `linear-gradient(to right, #fff ${ratio * 100}%, transparent ${ratio * 100}%)` }}
          />

          <span className="flex-shrink-0 font-mono text-[10px] text-white/80">
            {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleMuted}
            aria-label={muted ? 'Unmute' : 'Mute'}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            className="hidden h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/15 hover:text-white sm:flex"
          >
            {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
