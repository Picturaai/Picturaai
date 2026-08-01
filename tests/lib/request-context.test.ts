import { describe, expect, it } from 'vitest'
import { getRequestContext } from '@/lib/request-context'

function requestWith(headers: Record<string, string>) {
  return new Request('https://pictura.ai/api/generate', { headers })
}

describe('getRequestContext', () => {
  it('returns nulls and unknown device for a bare request', () => {
    expect(getRequestContext(requestWith({}))).toEqual({
      ip: null,
      userAgent: null,
      country: null,
      city: null,
      region: null,
      deviceType: 'unknown',
    })
  })

  it('takes the first ip of x-forwarded-for', () => {
    expect(getRequestContext(requestWith({ 'x-forwarded-for': ' 1.2.3.4 , 5.6.7.8' })).ip).toBe('1.2.3.4')
  })

  it('falls back through x-real-ip and cf-connecting-ip', () => {
    expect(getRequestContext(requestWith({ 'x-real-ip': '9.9.9.9' })).ip).toBe('9.9.9.9')
    expect(getRequestContext(requestWith({ 'cf-connecting-ip': '8.8.8.8' })).ip).toBe('8.8.8.8')
  })

  it('prefers vercel geo headers over cloudflare ones', () => {
    const ctx = getRequestContext(
      requestWith({
        'x-vercel-ip-country': 'US',
        'cf-ipcountry': 'FR',
        'x-vercel-ip-city': 'Austin',
        'x-vercel-ip-country-region': 'TX',
      }),
    )
    expect(ctx).toMatchObject({ country: 'US', city: 'Austin', region: 'TX' })
  })

  it('uses cloudflare geo headers when vercel ones are absent', () => {
    const ctx = getRequestContext(requestWith({ 'cf-ipcountry': 'FR', 'cf-ipcity': 'Paris', 'cf-region': 'IDF' }))
    expect(ctx).toMatchObject({ country: 'FR', city: 'Paris', region: 'IDF' })
  })

  it.each([
    ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'bot'],
    ['curl/8.4.0', 'bot'],
    ['Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'tablet'],
    ['Mozilla/5.0 (Linux; Android 14; SM-X200) AppleWebKit/537.36', 'tablet'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 'mobile'],
    ['Mozilla/5.0 (Linux; Android 14; Pixel 8 Mobile) AppleWebKit/537.36', 'mobile'],
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120', 'desktop'],
  ])('classifies %s as %s', (ua, deviceType) => {
    const ctx = getRequestContext(requestWith({ 'user-agent': ua }))
    expect(ctx.deviceType).toBe(deviceType)
    expect(ctx.userAgent).toBe(ua)
  })
})
