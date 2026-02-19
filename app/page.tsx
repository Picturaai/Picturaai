import { Navigation } from '@/components/pictura/navigation'
import { LandingHero } from '@/components/pictura/landing-hero'
import { LandingFeatures } from '@/components/pictura/landing-features'
import { LandingModel } from '@/components/pictura/landing-model'
import { Footer } from '@/components/pictura/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 flex flex-col">
        <LandingHero />
        <LandingFeatures />
        <LandingModel />
      </main>
      <Footer />
    </div>
  )
}
