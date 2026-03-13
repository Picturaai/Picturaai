'use client'

import { useMemo, useRef, useState } from 'react'
import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { PicturaIcon } from './pictura-logo'

type BrandedVideoPlayerProps = {
  src: string
  className?: string
  badgeLabel?: string
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function BrandedVideoPlayer({
  src,
  className = '',
  badgeLabel = 'Pictura Player',
}: BrandedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const progress = useMemo(() => {
    if (!duration) return 0
    return Math.max(0, Math.min(100, (currentTime / duration) * 100))
  }, [currentTime, duration])

  const togglePlay = () => {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      void el.play()
      return
    }
    el.pause()
  }

  const toggleMute = () => {
    const el = videoRef.current
    if (!el) return
    el.muted = !el.muted
    setIsMuted(el.muted)
  }

  const onSeek = (value: number) => {
    const el = videoRef.current
    if (!el || !Number.isFinite(value)) return
    el.currentTime = value
    setCurrentTime(value)
  }

  const openFullscreen = () => {
    const el = videoRef.current
    if (!el) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    void el.requestFullscreen?.()
  }

  return (
    <div className={`group relative h-full w-full overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onLoadedMetadata={(e) => setDuration((e.target as HTMLVideoElement).duration || 0)}
        onTimeUpdate={(e) => setCurrentTime((e.target as HTMLVideoElement).currentTime || 0)}
        onVolumeChange={(e) => setIsMuted((e.target as HTMLVideoElement).muted)}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/35 via-black/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-primary/30 px-2.5 py-1 text-[10px] font-semibold text-white shadow-lg backdrop-blur-sm">
        <PicturaIcon size={11} />
        {badgeLabel}
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-primary/60 bg-primary/70 text-white shadow-lg backdrop-blur-sm transition hover:bg-primary"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
            </button>
            <button
              onClick={toggleMute}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>

          <button
            onClick={openFullscreen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/35 bg-black/45 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/65"
            aria-label="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 rounded-lg border border-white/15 bg-black/30 px-2 py-1.5 backdrop-blur-sm">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="h-1.5 w-full cursor-pointer accent-primary"
            aria-label="Seek video"
          />
          <div className="mt-1 flex items-center justify-between text-[10px] text-white/85">
            <span>{formatTime(currentTime)}</span>
            <span className="text-primary-foreground/90">{Math.round(progress)}%</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
