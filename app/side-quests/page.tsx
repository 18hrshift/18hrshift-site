import Link from 'next/link'
import { ideas, ideasBy, ideaStages, type IdeaStage } from '@/config/ideas'
import { people, playerOrder } from '@/config/people'
import { ideasPage } from '@/config/site'
import { pageMetadata } from '@/lib/metadata'
import { IdeaPile } from '@/components/ideas/IdeaPile'
import { DisplayTitle } from '@/components/ui/primitives'
import '@/styles/people.css'
import '@/styles/ideas.css'

export const metadata = pageMetadata({ title: ideasPage.metaTitle, description: ideasPage.description, path: ideasPage.path })

export default function IdeasPage() {
  return (
    <>
      <header className="page-header section-shell">
        <p className="eyebrow section-eyebrow">{ideasPage.eyebrow} / {String(ideas.length).padStart(2, '0')}</p>
        <h1 className="page-title"><DisplayTitle lines={ideasPage.title} /></h1>
        <p className="page-intro">{ideasPage.intro}</p>
        <dl className="idea-legend" aria-label={ideasPage.legendLabel}>
          {(Object.keys(ideaStages) as IdeaStage[]).map((stage) => (
            <div key={stage} data-stage={stage}>
              <dt className="eyebrow idea-stage">{stage}</dt>
              <dd>{ideaStages[stage]}</dd>
            </div>
          ))}
        </dl>
      </header>
      {playerOrder.map((id) => {
        const person = people[id]
        const title = ideasPage.pileTitle(person.firstName)
        return (
          <section key={id} className={`idea-section section-shell player-card--${person.accent}`} aria-labelledby={`${id}-pile`}>
            <h2 id={`${id}-pile`} className="profile-section-title">
              <span className="eyebrow" aria-hidden="true">{person.initials}</span>
              <Link href={person.page}>{title}</Link>
            </h2>
            <IdeaPile ideas={ideasBy(id)} label={title} />
          </section>
        )
      })}
    </>
  )
}
