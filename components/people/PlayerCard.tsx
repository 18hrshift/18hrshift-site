import Image from 'next/image'
import Link from 'next/link'
import type { Person } from '@/config/people'
import { home } from '@/config/site'
import { PlayerStats } from './PlayerStats'

// One side of the character select: avatar, name, line, stats and where to go next.
export function PlayerCard({ person }: { person: Person }) {
  const headingId = `player-${person.id}`
  return (
    <article className={`player-card player-card--${person.accent}`} aria-labelledby={headingId}>
      <div className="player-card-top eyebrow">
        <span className="player-slot">{person.slot}</span>
        <span className="player-ready">{home.players.readyLabel}</span>
      </div>
      <div className="player-avatar">
        <span className="player-corners" aria-hidden="true"><span /><span /><span /><span /></span>
        <Image src={person.avatar.src} alt={person.avatar.alt} width={person.avatar.width} height={person.avatar.height} sizes="(max-width: 700px) 70vw, 28vw" />
      </div>
      <h3 id={headingId} className="player-name">{person.name}</h3>
      <p className="player-line">{person.line}</p>
      <PlayerStats stats={person.stats} label={`${person.firstName}’s player stats`} />
      <Link className="player-cta" href={person.page}>{person.firstName}’s page <span aria-hidden="true">→</span></Link>
    </article>
  )
}
