import { home } from '@/config/site'
import { ogContentType, ogSize, renderOg } from '@/lib/og'

export const size = ogSize
export const contentType = ogContentType
export const alt = `${home.hero.title.join(' ')} ${home.hero.credit}.`

export default function OgImage() {
  return renderOg({ eyebrow: home.hero.credit, title: home.hero.title, footer: home.tags.join(' / ') })
}
