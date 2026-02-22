import type { Metadata } from 'next'
import { Navbar } from '@/components/pictura/navbar'
import { Footer } from '@/components/pictura/footer'
import { RamadanCardGenerator } from '@/components/pictura/ramadan-generator'

export const metadata: Metadata = {
  title: 'Ramadan Card Generator | Pictura',
  description: 'Create beautiful Ramadan greeting cards with AI-powered content. Choose from stunning templates, add Quran verses, Hadith, and heartfelt messages. Free by Pictura.',
}

export default function RamadanPage() {
  return (
    <>
      <Navbar />
      <main>
        <RamadanCardGenerator />
      </main>
      <Footer />
    </>
  )
}
