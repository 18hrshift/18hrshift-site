import Image from 'next/image'
import { gamesBy } from '@/config/games'
import type { Person } from '@/config/people'
import { projectById } from '@/config/projects'
import { profileCopy, profilePages, type ProfileSection } from '@/config/site'
import { profileJsonLd } from '@/lib/structured-data'
import { MiniCartridge } from '@/components/games/GameCard'
import { PlayerStats } from '@/components/people/PlayerStats'
import { ProjectFeature } from '@/components/projects/ProjectFeature'
import { SystemList } from '@/components/projects/SystemList'
import { ExternalLink, JsonLd } from '@/components/ui/primitives'

function SectionBody({ person, section }: { person: Person; section: ProfileSection }) {
  if (section.kind === 'projects') return <div className="profile-projects">{section.projects.map((id) => <ProjectFeature key={id} project={projectById(id)} />)}</div>
  if (section.kind === 'systems') return <SystemList />
  return (
    <ul className="mini-cart-grid">
      {gamesBy(person.id).map((game) => <MiniCartridge key={game.id} game={game} />)}
    </ul>
  )
}

// The player profile shared by /john and /joe: character card, bio, stats and
// links, then the sections listed for that person in config/site.ts.
export function ProfilePage({ person }: { person: Person }) {
  const { description, sections } = profilePages[person.id]
  const visible = sections.filter((section) => section.kind !== 'games' || gamesBy(person.id).length > 0)
  return (
    <>
      <JsonLd data={profileJsonLd(person, description)} />
      <header className={`profile section-shell player-card--${person.accent}`}>
        <div className={person.photo ? 'profile-visuals has-photo' : 'profile-visuals'}>
          <div className="profile-avatar">
            <span className="player-corners" aria-hidden="true"><span /><span /><span /><span /></span>
            <Image src={person.avatar.src} alt={person.avatar.alt} width={person.avatar.width} height={person.avatar.height} sizes="(max-width: 760px) 80vw, 36vw" preload />
          </div>
          {person.photo && (
            <figure className="profile-photo">
              <Image src={person.photo.src} alt={person.photo.alt} width={person.photo.width} height={person.photo.height} sizes="(max-width: 760px) 44vw, 18vw" />
              <figcaption className="eyebrow">{profileCopy.photoLabel}</figcaption>
            </figure>
          )}
        </div>
        <div className="profile-copy">
          <p className="eyebrow section-eyebrow">{person.slot} / {profileCopy.eyebrow}</p>
          <h1 className="page-title profile-name">{person.name}</h1>
          <p className="profile-line">{person.line}</p>
          <div className="profile-bio">
            {person.bio.map((part, index) => (
              <div key={part.title ?? index} className="profile-bio-part">
                {part.title && <h2 className="eyebrow profile-bio-title">{part.title}</h2>}
                {part.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            ))}
          </div>
          {person.quote && (
            <figure className="profile-quote">
              <figcaption className="eyebrow">{profileCopy.quoteLabel}</figcaption>
              <blockquote><p>{person.quote}</p></blockquote>
            </figure>
          )}
          <PlayerStats stats={person.stats} label={`${person.firstName}’s player stats`} />
          {person.links.length > 0 && (
            <ul className="profile-links" aria-label={profileCopy.links}>
              {person.links.map((link) => (
                <li key={link.href}><ExternalLink href={link.href}>{link.label} <span aria-hidden="true">↗</span></ExternalLink></li>
              ))}
            </ul>
          )}
        </div>
      </header>

      {visible.map((section) => (
        <section key={section.id} className={`profile-section section-shell player-card--${person.accent}`} aria-labelledby={`${section.id}-heading`}>
          <h2 id={`${section.id}-heading`} className="profile-section-title"><span className="eyebrow" aria-hidden="true">{person.slot}</span>{section.title}</h2>
          <SectionBody person={person} section={section} />
        </section>
      ))}
    </>
  )
}
