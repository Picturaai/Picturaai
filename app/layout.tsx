import type { Metadata, Viewport } from 'next'
import { DM_Sans, Space_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-space-mono' })

export const metadata: Metadata = {
  title: 'Pictura by Imoogle - AI Image Generation',
  description: 'Create stunning images with Pictura, an AI-powered image generation model by Imoogle. Text-to-image and image-to-image capabilities.',
  generator: 'Imoogle',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
