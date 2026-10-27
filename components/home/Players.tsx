import { people, playerOrder } from '@/config/people'
import { home } from '@/config/site'
import { PlayerCard } from '@/components/people/PlayerCard'
import { SectionHead } from '@/components/ui/primitives'

// Character select: P1 and P2 side by side in co-op, then the origin story.
export function Players() {
  const { players } = home
  return (
    <section id="players" className="players section-shell" aria-labelledby="players-title">
      <SectionHead id="players-title" eyebrow={players.eyebrow} title={players.title} />
      <div className="player-select">
        {playerOrder.map((id, index) => (
          <div key={id} className="player-select-slot">
            {index === 1 && <span className="coop-badge eyebrow" aria-hidden="true">{players.mode}</span>}
            <PlayerCard person={people[id]} />
          </div>
        ))}
      </div>
      <div className="origin">
        <p className="eyebrow origin-eyebrow">{players.originEyebrow}</p>
        <h3 className="origin-title">{players.originTitle}</h3>
        <p className="origin-text">{players.origin}</p>
        <span className="origin-caret" aria-hidden="true">▼</span>
      </div>
    </section>
  )
}
