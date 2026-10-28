// Small shared pieces used across pages. Server components; no client JS.

import { people, type PersonId } from '@/config/people'

export function ExternalLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}<span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

// Two-line display heading: the second line takes the accent (or muted) colour.
export function DisplayTitle({ lines, tone = 'accent' }: { lines: readonly string[]; tone?: 'accent' | 'muted' }) {
  return (
    <>
      {lines.map((line, index) => (
        <span key={line} className={index > 0 ? `title-line title-line--${tone}` : 'title-line'}>{line}</span>
      ))}
    </>
  )
}

export function SectionHead({ id, eyebrow, title, aside, tone }: { id: string; eyebrow: string; title: readonly string[]; aside?: React.ReactNode; tone?: 'accent' | 'muted' }) {
  return (
    <div className="section-head">
      <div>
        <p className="eyebrow section-eyebrow">{eyebrow}</p>
        <h2 id={id} className="section-title"><DisplayTitle lines={title} tone={tone} /></h2>
      </div>
      {aside && <div className="section-aside">{aside}</div>}
    </div>
  )
}

export function OwnerTag({ owner }: { owner: PersonId }) {
  const person = people[owner]
  return (
    <span className={`owner-tag owner-tag--${person.accent}`}>
      <span className="owner-initials">{person.initials}</span>
      <span>{person.firstName}</span>
    </span>
  )
}

export function Status({ children }: { children: React.ReactNode }) {
  return <span className="status-label"><i aria-hidden="true" />{children}</span>
}

// Resting bar heights: a fixed, uneven pattern so the bars read as sound, not a ramp.
const barLevel = (index: number) => (0.25 + 0.75 * Math.abs(Math.sin(index * 1.7) * Math.cos(index * 0.45))).toFixed(2)

// Decorative music motif. Bars settle after a few beats; hover replays them.
export function Equalizer({ bars = 5, className = '' }: { bars?: number; className?: string }) {
  return (
    <span className={`eq ${className}`} aria-hidden="true">
      {Array.from({ length: bars }, (_, index) => <span key={index} style={{ '--i': index, '--h': barLevel(index + 1) } as React.CSSProperties} />)}
    </span>
  )
}

export function JsonLd({ data }: { data: object }) {
  // Escape "<" so a value can never close the script element early.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
