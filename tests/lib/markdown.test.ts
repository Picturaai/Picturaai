import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '@/lib/markdown'

describe('parseMarkdown', () => {
  it('escapes raw HTML before any other transformation', () => {
    const html = parseMarkdown('<script>alert("x")</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('renders headers at three levels', () => {
    expect(parseMarkdown('# Title')).toContain('<h1')
    expect(parseMarkdown('## Title')).toContain('<h2')
    expect(parseMarkdown('### Title')).toContain('<h3')
  })

  it('renders fenced code blocks with the fence content trimmed', () => {
    const html = parseMarkdown('```ts\nconst a = 1\n```')
    expect(html).toContain('<pre')
    expect(html).toContain('<code class="text-sm">const a = 1</code>')
  })

  it('renders inline code', () => {
    expect(parseMarkdown('use `npm run dev` now')).toContain('<code class="bg-secondary/50')
  })

  it('renders bold, italic and bold-italic', () => {
    expect(parseMarkdown('***both***')).toContain('<strong><em>both</em></strong>')
    expect(parseMarkdown('**bold**')).toContain('<strong class="font-semibold">bold</strong>')
    expect(parseMarkdown('*italic*')).toContain('<em>italic</em>')
  })

  it('renders links with href and text', () => {
    const html = parseMarkdown('[Pictura](https://pictura.ai)')
    expect(html).toContain('href="https://pictura.ai"')
    expect(html).toContain('>Pictura</a>')
  })

  it('wraps consecutive list items in a single ul', () => {
    const html = parseMarkdown('- one\n- two')
    expect(html.match(/<ul/g)).toHaveLength(1)
    expect(html.match(/<li/g)).toHaveLength(2)
  })

  it('renders ordered list items', () => {
    expect(parseMarkdown('1. first')).toContain('<li')
  })

  it('splits double newlines into paragraphs and wraps leading text', () => {
    const html = parseMarkdown('first para\n\nsecond para')
    expect(html.startsWith('<p class="text-muted-foreground')).toBe(true)
    expect(html.match(/<p /g)).toHaveLength(2)
  })

  it('does not wrap content that already starts with a block element', () => {
    expect(parseMarkdown('## Heading').startsWith('<h2')).toBe(true)
  })

  it('returns an empty string for empty input', () => {
    expect(parseMarkdown('')).toBe('')
  })
})
