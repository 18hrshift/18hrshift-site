import Image from 'next/image'
import { home } from '@/config/site'
import { featuredItems, type FeaturedItem } from '@/lib/content'
import ProjectArtwork from '@/components/projects/ProjectArtwork'
import { ExternalLink, OwnerTag, SectionHead, Status } from '@/components/ui/primitives'

function Art({ entry }: { entry: FeaturedItem }) {
  if (entry.type === 'game') {
    const { capture } = entry.item
    return <Image className="featured-capture" src={capture.src} alt={capture.alt} fill sizes="(max-width: 760px) 92vw, 60vw" />
  }
  return <ProjectArtwork project={entry.item} />
}

// Mixed work, each card tagged with whose it is and linking straight to the real thing.
export function Featured() {
  const { featured } = home
  return (
    <section id="work" className="featured section-shell" aria-labelledby="featured-title">
      <SectionHead id="featured-title" eyebrow={featured.eyebrow} title={featured.title} tone="muted" aside={<p>{featured.aside}</p>} />
      <ul className="featured-grid">
        {featuredItems().map((entry) => {
          const { item } = entry
          const kind = entry.type === 'game' ? entry.item.genre : entry.item.kind
          const summary = entry.type === 'game' ? entry.item.line : entry.item.summary
          return (
            <li key={item.id} className={`featured-card featured-card--${item.id}`}>
              <div className="featured-art"><Art entry={entry} /></div>
              <div className="featured-info">
                <div className="featured-tags">
                  <span className="eyebrow featured-kind">{kind}</span>
                  <OwnerTag owner={item.owner} />
                </div>
                <h3 className="featured-name">
                  {item.url
                    ? <ExternalLink className="featured-link" href={item.url}>{item.name} <span aria-hidden="true">↗</span></ExternalLink>
                    : item.name}
                </h3>
                <p className="featured-summary">{summary}</p>
                {item.status && <Status>{item.status}</Status>}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
