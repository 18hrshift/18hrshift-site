import type { Metadata } from 'next'
import { Barlow_Condensed, Barlow, JetBrains_Mono } from 'next/font/google'
import { LenisProvider } from '@/components/providers/LenisProvider'
import './globals.css'
import { site } from '@/config/site'

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-barlow',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: site.name,
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.name,
    description: site.description,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${barlow.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  )
}
