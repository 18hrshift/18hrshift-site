import { games } from '@/config/games'
import { gamesPage } from '@/config/site'
import { pageMetadata } from '@/lib/metadata'
import { EmptySlot, GameCard } from '@/components/games/GameCard'
import { DisplayTitle } from '@/components/ui/primitives'
import '@/styles/games.css'

export const metadata = pageMetadata({ title: gamesPage.metaTitle, description: gamesPage.description, path: gamesPage.path })

export default function GamesPage() {
  return (
    <>
      <header className="page-header section-shell">
        <p className="eyebrow section-eyebrow">{gamesPage.eyebrow} / {String(games.length).padStart(2, '0')}</p>
        <h1 className="page-title"><DisplayTitle lines={gamesPage.title} /></h1>
        <p className="page-intro">{gamesPage.intro}</p>
      </header>
      <section className="section-shell cabinet" aria-label={gamesPage.listLabel}>
        <div className="cabinet-grid">
          {games.map((game) => <GameCard key={game.id} game={game} />)}
          <EmptySlot />
        </div>
      </section>
    </>
  )
}
