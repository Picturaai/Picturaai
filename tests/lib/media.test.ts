import { describe, expect, it } from 'vitest'
import { clampSeekTime, formatMediaTime, frameAtTime, playbackRatio } from '@/lib/media'

describe('formatMediaTime', () => {
  it('formats positions as m:ss', () => {
    expect(formatMediaTime(0)).toBe('0:00')
    expect(formatMediaTime(9.7)).toBe('0:09')
    expect(formatMediaTime(168)).toBe('2:48')
  })

  it('adds an hours segment past an hour', () => {
    expect(formatMediaTime(3725)).toBe('1:02:05')
  })

  it('falls back to zero for unloaded media', () => {
    expect(formatMediaTime(Number.NaN)).toBe('0:00')
    expect(formatMediaTime(-4)).toBe('0:00')
    expect(formatMediaTime(undefined)).toBe('0:00')
  })
})

describe('playbackRatio', () => {
  it('reports progress between 0 and 1', () => {
    expect(playbackRatio(6, 12)).toBe(0.5)
    expect(playbackRatio(20, 12)).toBe(1)
    expect(playbackRatio(-2, 12)).toBe(0)
  })

  it('is zero while the duration is unknown', () => {
    expect(playbackRatio(4, 0)).toBe(0)
    expect(playbackRatio(4, Number.NaN)).toBe(0)
  })
})

describe('clampSeekTime', () => {
  it('keeps seeks inside the clip', () => {
    expect(clampSeekTime(5, 12)).toBe(5)
    expect(clampSeekTime(-5, 12)).toBe(0)
    expect(clampSeekTime(99, 12)).toBe(12)
  })

  it('returns zero when the duration is not known yet', () => {
    expect(clampSeekTime(5, 0)).toBe(0)
    expect(clampSeekTime(5, Number.NaN)).toBe(0)
  })
})

describe('frameAtTime', () => {
  it('maps playback position onto a frame counter', () => {
    expect(frameAtTime(6, 12, 24)).toEqual({ frame: 144, total: 288 })
    expect(frameAtTime(0, 12, 24)).toEqual({ frame: 0, total: 288 })
  })

  it('never runs past the last frame', () => {
    expect(frameAtTime(30, 12, 24).frame).toBe(288)
    expect(frameAtTime(Number.NaN, 0, 24)).toEqual({ frame: 0, total: 1 })
  })
})
