import Link from 'next/link'
import { games } from '@/config/games'
import { gamesPage, home } from '@/config/site'
import { MiniCartridge } from '@/components/games/GameCard'
import { SectionHead } from '@/components/ui/primitives'

export function GamesStrip() {
  const copy = home.games
  return (
    <section id="games" className="games-strip section-shell" aria-labelledby="games-strip-title">
      <SectionHead
        id="games-strip-title"
        eyebrow={copy.eyebrow}
        title={copy.title}
        aside={<><p className="games-count eyebrow">{String(games.length).padStart(2, '0')} {home.games.countLabel}</p><p>{copy.aside}</p></>}
      />
      <ul className="mini-cart-row" aria-label={home.games.listLabel}>
        {games.map((game) => <MiniCartridge key={game.id} game={game} />)}
      </ul>
      <Link className="button button-outline games-strip-link" href={gamesPage.path}>{copy.link} <span aria-hidden="true">→</span></Link>
    </section>
  )
}
