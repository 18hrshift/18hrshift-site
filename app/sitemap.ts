import type { MetadataRoute } from 'next'
import { people, playerOrder } from '@/config/people'
import { gamesPage, labPage, site } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', gamesPage.path, labPage.path, ...playerOrder.map((id) => people[id].page)]
  return paths.map((path) => ({ url: new URL(path, site.url).toString() }))
}
