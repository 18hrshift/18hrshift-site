import type { Metadata } from 'next'
import { site } from '@/config/site'

type PageMetadataInput = {
  // Rendered through the root layout's "%s | 18HRSHIFT" template unless `absoluteTitle` is set.
  title: string
  absoluteTitle?: boolean
  description: string
  path: string
  type?: 'website' | 'profile'
}

// Title, description, canonical URL and the Open Graph / Twitter text for one page.
// Each route segment supplies its own image through an opengraph-image file.
export function pageMetadata({ title, absoluteTitle, description, path, type = 'website' }: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${site.name}`
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: { title: fullTitle, description, url: path, siteName: site.name, locale: site.locale, type },
    twitter: { card: 'summary_large_image', title: fullTitle, description },
  }
}
