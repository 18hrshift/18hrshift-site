import type { Idea } from '@/config/ideas'
import { ideasPage } from '@/config/site'
import { ExternalLink } from '@/components/ui/primitives'

// One idea as an index card: what kind of thing it is, how far it got, the pitch.
function IdeaCard({ idea, headingLevel }: { idea: Idea; headingLevel: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <li className="idea-card" data-stage={idea.stage}>
      <article aria-labelledby={`idea-${idea.id}`}>
        <div className="idea-card-top eyebrow">
          <span>{idea.kind}</span>
          <span className="idea-stage">{idea.stage}</span>
        </div>
        <Heading id={`idea-${idea.id}`} className="idea-name">{idea.name}</Heading>
        <p className="idea-pitch">{idea.pitch}</p>
        {idea.url && (
          <ExternalLink className="idea-link" href={idea.url}>
            {ideasPage.visit} <span className="sr-only">{idea.name}</span> <span aria-hidden="true">↗</span>
          </ExternalLink>
        )}
      </article>
    </li>
  )
}

// A person's pile of ideas, as a grid of index cards.
export function IdeaPile({ ideas, label, headingLevel = 3 }: { ideas: readonly Idea[]; label: string; headingLevel?: 2 | 3 }) {
  return (
    <ul className="idea-pile" aria-label={label}>
      {ideas.map((idea) => <IdeaCard key={idea.id} idea={idea} headingLevel={headingLevel} />)}
    </ul>
  )
}
