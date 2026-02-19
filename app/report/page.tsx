import type { Metadata } from 'next'
import { Navigation } from '@/components/pictura/navigation'
import { Footer } from '@/components/pictura/footer'
import { ReportForm } from '@/components/pictura/report-form'

export const metadata: Metadata = {
  title: 'Report a Bug - Pictura by Imoogle',
  description: 'Help us improve Pictura by reporting bugs and issues you encounter.',
}

export default function ReportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-28 pb-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <span className="text-xs font-mono tracking-[0.25em] text-primary mb-2 block">FEEDBACK</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Report a Bug</h1>
            <p className="text-muted-foreground leading-relaxed">
              Pictura is in beta and we rely on your feedback to improve. If you have encountered
              a bug, unexpected behavior, or have a suggestion, please let us know below.
            </p>
          </div>
          <ReportForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
