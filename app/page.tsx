import { Header } from '@/components/pictura/header'
import { Hero } from '@/components/pictura/hero'
import { Generator } from '@/components/pictura/generator'
import { Footer } from '@/components/pictura/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex flex-col">
        <Hero />
        <Generator />
      </main>
      <Footer />
    </div>
  )
}
