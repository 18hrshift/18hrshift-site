import Image from 'next/image'
import Link from 'next/link'
import type { Game } from '@/config/games'
import { people } from '@/config/people'
import { gamesPage } from '@/config/site'
import { ExternalLink, OwnerTag, Status } from '@/components/ui/primitives'

const host = (url: string) => new URL(url).host

// A game as a cartridge: genre and owner on the label, a real gameplay capture
// on the screen, then the honest line, status and a link to play.
export function GameCard({ game, headingLevel = 2 }: { game: Game; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article id={game.id} className={`cartridge cartridge--${game.accent}`} aria-labelledby={`${game.id}-title`}>
      <div className="cartridge-label">
        <span className="eyebrow cartridge-genre">{game.genre}</span>
        <OwnerTag owner={game.owner} />
      </div>
      <figure className="cartridge-screen">
        <Image src={game.capture.src} alt={game.capture.alt} width={game.capture.width} height={game.capture.height} sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 31vw" />
        <figcaption className="eyebrow cartridge-caption">{gamesPage.captureLabel}</figcaption>
      </figure>
      <div className="cartridge-body">
        <Heading id={`${game.id}-title`} className="cartridge-name">
          {game.name}
          {game.nameNote && <span className="name-note">{game.nameNote}</span>}
        </Heading>
        <p className="cartridge-line">{game.line}</p>
        <div className="cartridge-meta">
          <Status>{game.status}</Status>
          {game.bestOn && <span className="eyebrow cartridge-best">{game.bestOn}</span>}
        </div>
        {game.note && <p className="cartridge-note">{game.note}</p>}
        <ExternalLink className="cartridge-play" href={game.url}>
          <span>{gamesPage.play}<span className="sr-only"> {game.name}</span></span>
          <span className="cartridge-host">{host(game.url)} <span aria-hidden="true">↗</span></span>
        </ExternalLink>
      </div>
    </article>
  )
}

// The small version for the home page strip: links to the game's card on /games.
export function MiniCartridge({ game }: { game: Game }) {
  return (
    <li className={`mini-cart cartridge--${game.accent}`}>
      <Link className="mini-cart-link" href={`${gamesPage.path}#${game.id}`}>
        <span className="mini-cart-screen">
          <Image src={game.capture.src} alt="" width={game.capture.width} height={game.capture.height} sizes="260px" />
        </span>
        <span className="mini-cart-name">{game.name}</span>
        <span className="mini-cart-status">{game.status}</span>
      </Link>
    </li>
  )
}

// An empty cartridge at the end of the cabinet, held for a player whose games are still to come.
export function EmptySlot() {
  const slot = gamesPage.emptySlot
  const person = people[slot.owner]
  return (
    <article className={`cartridge cartridge--empty cartridge--${person.accent}`} aria-labelledby="empty-slot-title">
      <div className="cartridge-label">
        <span className="eyebrow cartridge-genre">{slot.label}</span>
        <OwnerTag owner={slot.owner} />
      </div>
      <div className="cartridge-screen cartridge-screen--empty"><span className="eyebrow">{slot.screen}</span></div>
      <div className="cartridge-body">
        <h2 id="empty-slot-title" className="cartridge-name">{person.firstName}</h2>
        <p className="cartridge-line">{slot.body}</p>
      </div>
    </article>
  )
}
