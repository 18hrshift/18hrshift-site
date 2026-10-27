import { games } from '@/config/games'
import { gamesPage } from '@/config/site'
import { ogContentType, ogSize, renderOg } from '@/lib/og'

export const size = ogSize
export const contentType = ogContentType
export const alt = `18HRSHIFT games: ${games.map((game) => game.name).join(', ')}.`

export default function OgImage() {
  return renderOg({ eyebrow: `${gamesPage.eyebrow} / ${games.length}`, title: gamesPage.title, footer: games.map((game) => game.name).join(' / ') })
}
