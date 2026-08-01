import { NextResponse } from 'next/server'
import { isIP } from 'net'
import { lookup } from 'dns/promises'

export const runtime = 'nodejs'

function ipv4ToLong(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let value = 0
  for (const part of parts) {
    const octet = Number(part)
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) return null
    value = value * 256 + octet
  }
  return value >>> 0
}

function isPrivateIpv4(ip: string): boolean {
  const long = ipv4ToLong(ip)
  if (long === null) return true // treat unparseable as unsafe
  const inRange = (start: string, end: string) =>
    long >= (ipv4ToLong(start) as number) && long <= (ipv4ToLong(end) as number)
  return (
    inRange('0.0.0.0', '0.255.255.255') || // "this" network
    inRange('10.0.0.0', '10.255.255.255') || // private
    inRange('100.64.0.0', '100.127.255.255') || // carrier-grade NAT
    inRange('127.0.0.0', '127.255.255.255') || // loopback
    inRange('169.254.0.0', '169.254.255.255') || // link-local (cloud metadata)
    inRange('172.16.0.0', '172.31.255.255') || // private
    inRange('192.0.0.0', '192.0.0.255') || // IETF protocol assignments
    inRange('192.168.0.0', '192.168.255.255') || // private
    inRange('198.18.0.0', '198.19.255.255') || // benchmarking
    long >= (ipv4ToLong('224.0.0.0') as number) // multicast + reserved
  )
}

function isPrivateIpv6(ip: string): boolean {
  const h = ip.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === '::1' || h === '::') return true
  if (h.startsWith('fe80')) return true // link-local
  if (h.startsWith('fc') || h.startsWith('fd')) return true // unique local
  // IPv4-mapped / embedded IPv6 (e.g. ::ffff:169.254.169.254)
  const mapped = h.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/)
  if (mapped) return isPrivateIpv4(mapped[1])
  return false
}

function isBlockedAddress(address: string): boolean {
  const family = isIP(address)
  if (family === 4) return isPrivateIpv4(address)
  if (family === 6) return isPrivateIpv6(address)
  return true // not a valid IP literal -> unsafe
}

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return true
  if (isIP(h)) return isBlockedAddress(h)
  return false
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    let parsed: URL
    try {
      parsed = new URL(imageUrl)
    } catch {
      return NextResponse.json({ error: 'Invalid url' }, { status: 400 })
    }

    if (!['http:', 'https:'].includes(parsed.protocol) || isBlockedHostname(parsed.hostname)) {
      return NextResponse.json({ error: 'Unsupported url' }, { status: 400 })
    }

    // Resolve the hostname and reject if any resolved address is private/reserved.
    // Prevents SSRF via hostnames that point at internal services or cloud metadata.
    if (!isIP(parsed.hostname)) {
      try {
        const resolved = await lookup(parsed.hostname, { all: true })
        if (resolved.length === 0 || resolved.some((r) => isBlockedAddress(r.address))) {
          return NextResponse.json({ error: 'Unsupported url' }, { status: 400 })
        }
      } catch {
        return NextResponse.json({ error: 'Unsupported url' }, { status: 400 })
      }
    }

    // Disallow redirects so a permitted host cannot bounce us to an internal target.
    const upstream = await fetch(parsed.toString(), { cache: 'no-store', redirect: 'error' })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 })
    }

    const contentType = upstream.headers.get('content-type') || 'image/png'
    if (!contentType.toLowerCase().startsWith('image/')) {
      return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    }
    const bytes = await upstream.arrayBuffer()

    return new NextResponse(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[download-image] error:', error)
    return NextResponse.json({ error: 'Failed to download image' }, { status: 500 })
  }
}
