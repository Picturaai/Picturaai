/** Shared helpers for the homepage video and audio players. */

/** Formats a media position as m:ss (or h:mm:ss past an hour). */
export function formatMediaTime(seconds: number | null | undefined): string {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const secs = total % 60
  const mins = Math.floor(total / 60) % 60
  const hours = Math.floor(total / 3600)
  const paddedSecs = String(secs).padStart(2, '0')
  if (hours > 0) return `${hours}:${String(mins).padStart(2, '0')}:${paddedSecs}`
  return `${mins}:${paddedSecs}`
}

/** Playback position as a 0-1 ratio, safe for zero-length or not-yet-loaded media. */
export function playbackRatio(currentTime: number, duration: number): number {
  if (!Number.isFinite(currentTime) || !Number.isFinite(duration) || duration <= 0) return 0
  return Math.min(Math.max(currentTime / duration, 0), 1)
}

/** Clamps a seek target so scrubbing never runs past either end of the clip. */
export function clampSeekTime(target: number, duration: number): number {
  if (!Number.isFinite(target) || target < 0) return 0
  if (!Number.isFinite(duration) || duration <= 0) return 0
  return Math.min(target, duration)
}

/** Frame counter shown on the video overlay, mirroring the render progress chip. */
export function frameAtTime(currentTime: number, duration: number, fps: number): { frame: number; total: number } {
  const total = Math.max(Math.round((Number.isFinite(duration) && duration > 0 ? duration : 0) * fps), 1)
  const frame = Math.min(Math.max(Math.round((Number.isFinite(currentTime) ? currentTime : 0) * fps), 0), total)
  return { frame, total }
}
