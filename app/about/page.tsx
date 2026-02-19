import type { Metadata } from 'next'
import Link from 'next/link'
import { Navigation } from '@/components/pictura/navigation'
import { Footer } from '@/components/pictura/footer'
import { PicturaIcon } from '@/components/pictura/pictura-logo'

export const metadata: Metadata = {
  title: 'About Imoogle - The Team Behind Pictura',
  description: 'Learn about Imoogle Technology and Imoogle Labs, the Nigerian AI company building Pictura.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <PicturaIcon size={40} />
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">About Imoogle</h1>
              <p className="text-sm text-muted-foreground font-mono tracking-wider mt-0.5">IMOOGLE LABS / LAGOS, NIGERIA</p>
            </div>
          </div>

          <div className="h-px bg-border my-8" />

          {/* Company */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Who We Are</h2>
            <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
              <p>
                Imoogle Technology is a Nigerian artificial intelligence company headquartered in Lagos.
                Through our research division, Imoogle Labs, we are building the next generation of
                AI-powered creative tools for Africa and the world.
              </p>
              <p>
                We believe that powerful AI tools should not be exclusive to a few companies in Silicon Valley.
                Africa has an incredible pool of talent, creativity, and ambition. Imoogle exists to channel
                that energy into world-class AI products.
              </p>
            </div>
          </section>

          {/* Pictura */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">About Pictura</h2>
            <div className="flex flex-col gap-4 text-muted-foreground leading-relaxed">
              <p>
                Pictura is the Imoogle Picture Model: our AI-powered image generation system.
                It can create stunning images from text descriptions (text-to-image) and transform
                existing images based on prompts (image-to-image).
              </p>
              <p>
                Pictura is currently in <strong className="text-foreground">beta</strong>. This means
                we are actively developing and improving the model every day. During the beta period,
                you can use Pictura for free with a limit of 5 image generations per day. No account
                or sign-up is required.
              </p>
              <p>
                We are working hard to increase limits, improve quality, expand resolution options,
                and release a public API so developers can integrate Pictura into their own applications.
              </p>
            </div>
          </section>

          {/* Nigeria identity */}
          <section className="mb-12">
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-8 h-5 rounded overflow-hidden flex" title="Nigeria">
                  <span className="w-1/3 bg-[#008751]" />
                  <span className="w-1/3 bg-[#ffffff] border-y border-border" />
                  <span className="w-1/3 bg-[#008751]" />
                </span>
                <h2 className="text-xl font-semibold text-foreground">Built in Nigeria</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We are proud to be a Nigerian company building at the frontier of AI. Lagos is our home,
                and Africa is our launchpad. We are committed to demonstrating that world-class AI
                innovation can come from anywhere, and we are just getting started.
              </p>
            </div>
          </section>

          {/* Roadmap */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Roadmap</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Pictura Beta Launch', status: 'Live', done: true },
                { label: 'Text-to-Image Generation', status: 'Live', done: true },
                { label: 'Image-to-Image Transformation', status: 'Live', done: true },
                { label: 'Higher Resolution Outputs', status: 'In Progress', done: false },
                { label: 'Increased Daily Limits', status: 'In Progress', done: false },
                { label: 'Pictura API (Public REST)', status: 'Coming Soon', done: false },
                { label: 'Developer SDKs & Libraries', status: 'Planned', done: false },
                { label: 'Enterprise Plans', status: 'Planned', done: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    item.done ? 'bg-primary/10' : 'bg-secondary'
                  }`}>
                    {item.done ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                      </svg>
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                    )}
                  </span>
                  <span className="flex-1 text-sm text-foreground">{item.label}</span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    item.status === 'Live'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : item.status === 'In Progress'
                        ? 'bg-accent/15 text-accent-foreground border border-accent/20'
                        : 'bg-secondary text-muted-foreground border border-border'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <Link
              href="/studio"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
            >
              Try Pictura Studio
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
