import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('drops falsy values and flattens arrays and objects', () => {
    expect(cn('a', undefined, null, false, ['b', 'c'], { d: true, e: false })).toBe('a b c d')
  })

  it('lets later tailwind classes win over conflicting earlier ones', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('text-sm text-muted-foreground', 'text-foreground')).toBe('text-sm text-foreground')
  })

  it('returns an empty string with no inputs', () => {
    expect(cn()).toBe('')
  })
})
