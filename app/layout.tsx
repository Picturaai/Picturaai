import type { Metadata, Viewport } from 'next'
import { DM_Sans, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: {
    default: 'Pictura - AI Image Generation | Create Stunning Images Free',
    template: '%s | Pictura by Imoogle',
  },
  description: 'Create stunning AI-generated images for free with Pictura by Imoogle. Transform text into beautiful artwork or remix existing images. No sign-up required.',
  keywords: ['AI image generation', 'text to image', 'image to image', 'AI art', 'free AI image generator', 'Pictura', 'Imoogle', 'AI artwork'],
  authors: [{ name: 'Imoogle', url: 'https://imoogle.com' }],
  creator: 'Imoogle',
  publisher: 'Imoogle',
  metadataBase: new URL('https://pictura.imoogle.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pictura.imoogle.com',
    siteName: 'Pictura',
    title: 'Pictura - AI Image Generation | Create Stunning Images Free',
    description: 'Create stunning AI-generated images for free with Pictura by Imoogle. Transform text into beautiful artwork or remix existing images. No sign-up required.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pictura - AI-Powered Image Generation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pictura - AI Image Generation | Create Stunning Images Free',
    description: 'Create stunning AI-generated images for free with Pictura by Imoogle. Transform text into beautiful artwork. No sign-up required.',
    images: ['/og-image.jpg'],
    creator: '@imlogle',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#c87941',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${spaceMono.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            unstyled: true,
            classNames: {
              toast: 'flex items-center gap-3 w-full rounded-xl border border-border/60 bg-card px-4 py-3.5 shadow-lg backdrop-blur-sm font-sans',
              title: 'text-sm font-medium text-foreground',
              description: 'text-xs text-muted-foreground mt-0.5',
              success: 'border-primary/30 bg-primary/5',
              error: 'border-destructive/30 bg-destructive/5',
              actionButton: 'bg-primary text-primary-foreground text-xs font-medium rounded-lg px-3 py-1.5',
            },
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}
