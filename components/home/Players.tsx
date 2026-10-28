import Image from 'next/image'
import { people, playerOrder } from '@/config/people'
import { home } from '@/config/site'
import { PlayerCard } from '@/components/people/PlayerCard'
import { SectionHead } from '@/components/ui/primitives'

// The two players side by side, as equals, then the origin story with a photo of
// the two of them.
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
        <figure className="origin-photo">
          <Image src={players.originPhoto.src} alt={players.originPhoto.alt} width={players.originPhoto.width} height={players.originPhoto.height} sizes="(max-width: 760px) 240px, 280px" />
          <figcaption>{players.originPhoto.caption}</figcaption>
        </figure>
        <div className="origin-copy">
          <p className="eyebrow origin-eyebrow">{players.originEyebrow}</p>
          <h3 className="origin-title">{players.originTitle}</h3>
          <p className="origin-text">{players.origin}</p>
        </div>
        <span className="origin-caret" aria-hidden="true">▼</span>
      </div>
    </section>
  )
}
