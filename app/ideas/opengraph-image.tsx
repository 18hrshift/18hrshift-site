import { ideas } from '@/config/ideas'
import { ideasPage } from '@/config/site'
import { ogContentType, ogSize, renderOg } from '@/lib/og'

export const size = ogSize
export const contentType = ogContentType
export const alt = `The 18HRSHIFT idea pile: ${ideas.length} half-built games, shelved apps and napkin sketches.`

export default function OgImage() {
  return renderOg({ eyebrow: `${ideasPage.eyebrow} / ${ideas.length}`, title: ideasPage.title, footer: 'Half-built games / shelved apps / napkin sketches' })
}
