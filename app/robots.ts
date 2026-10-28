import type { MetadataRoute } from 'next'
import { blogZone } from '@/config/blog-zone'
import { site } from '@/config/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    // The blog app publishes its own sitemap under its path.
    sitemap: [new URL('/sitemap.xml', site.url).toString(), new URL(`${blogZone.path}/sitemap.xml`, site.url).toString()],
  }
}
