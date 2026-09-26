'use client'

import { useState } from 'react'
import { site } from '@/config/site'
import '@/styles/universe.css'

const divisions = [
  {
    id: 'games',
    number: '01',
    name: 'Games',
    line: 'Worlds worth getting lost in.',
    description:
      'New rules. Strange places. One more try. We’re exploring what happens when creative technology becomes something you can play.',
    areas: ['Interactive worlds', 'Playful mechanics', 'Playable experiments'],
    href: '#lab',
    action: 'Step into the playground',
  },
  {
    id: 'media',
    number: '02',
    name: 'Media',
    line: 'Culture in motion.',
    description:
      'Stories with a point of view. We’re exploring the space where moving image, sound, and digital experiences meet.',
    areas: ['Moving image', 'Sound & storytelling', 'Digital experiences'],
    href: `mailto:${site.endpoint.email}`,
    action: 'Make something with us',
  },
  {
    id: 'industries',
    number: '03',
    name: 'Industries',
    line: 'Ideas built for the real world.',
    description:
      'Useful can be unexpected, too. A direction for ambitious tools, connected systems, and ideas that move beyond the screen.',
    areas: ['Tools & systems', 'Connected experiences', 'Physical × digital'],
    href: '#work',
    action: 'Explore what we’ve built',
  },
] as const

export function Universe() {
  const [active, setActive] = useState<string | null>('games')

  return (
    <section id="universe" className="universe-section" aria-labelledby="universe-heading">
      <div className="section-shell">
        <div className="universe-intro">
          <div>
            <p className="eyebrow">03 / The 18HRSHIFT universe</p>
            <h2 id="universe-heading" className="universe-heading">
              One name.<br />Many worlds.
            </h2>
          </div>
          <div className="universe-intro-copy">
            <p>We don’t fit in one box.<br />So we’re building a few of our own.</p>
            <span>New directions. Shared curiosity. See what’s on the horizon.</span>
          </div>
        </div>

        <div className="universe-divisions">
          {divisions.map((division) => {
            const expanded = active === division.id

            return (
              <article
                key={division.id}
                className={`universe-division universe-division--${division.id}${expanded ? ' is-expanded' : ''}`}
              >
                <h3 className="universe-division-heading">
                  <button
                    type="button"
                    id={`universe-${division.id}-toggle`}
                    className="universe-toggle"
                    aria-expanded={expanded}
                    aria-controls={`universe-${division.id}-panel`}
                    onClick={() => setActive(expanded ? null : division.id)}
                  >
                    <span className="universe-number" aria-hidden="true">{division.number}</span>
                    <span className="universe-name">
                      <span className="universe-brand">18HRSHIFT</span>
                      <span className="universe-title">{division.name}</span>
                    </span>
                    <span className="universe-status"><span />Exploring</span>
                    <span className="universe-toggle-symbol" aria-hidden="true">
                      <span /><span />
                    </span>
                  </button>
                </h3>

                <div
                  id={`universe-${division.id}-panel`}
                  className="universe-panel"
                  role="region"
                  aria-labelledby={`universe-${division.id}-toggle`}
                  hidden={!expanded}
                >
                  <div className="universe-panel-copy">
                    <p className="universe-tagline">{division.line}</p>
                    <p className="universe-description">{division.description}</p>
                    <ul className="universe-areas" aria-label={`${division.name} areas of exploration`}>
                      {division.areas.map((area) => <li key={area}>{area}</li>)}
                    </ul>
                    <a className="universe-action" href={division.href}>
                      {division.action}<span aria-hidden="true">↗</span>
                    </a>
                  </div>

                  <div className="universe-art" aria-hidden="true">
                    <svg viewBox="0 0 320 280" className="universe-emblem" fill="none">
                      {division.id === 'games' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <path d="M160 15 285 140 160 265 35 140Z" />
                          <path d="M160 38 262 140 160 242 58 140Z" />
                          <path d="m160 60 80 80-80 80-80-80Z" />
                          <path d="m160 79 17 44 44 17-44 17-17 44-17-44-44-17 44-17Z" fill="currentColor" />
                          <path d="M160 0v33M160 247v33M20 140h33M267 140h33" />
                          <path d="m58 38 19 19m166 166 19 19M58 242l19-19M243 57l19-19" strokeWidth="1" />
                        </g>
                      )}
                      {division.id === 'media' && (
                        <g stroke="currentColor" strokeWidth="2">
                          <ellipse cx="160" cy="140" rx="140" ry="66" transform="rotate(-35 160 140)" />
                          <ellipse cx="160" cy="140" rx="140" ry="66" transform="rotate(35 160 140)" />
                          <ellipse cx="160" cy="140" rx="140" ry="66" transform="rotate(90 160 140)" />
                          <circle cx="160" cy="140" r="49" fill="var(--universe-color)" />
                          <path d="m150 120 30 20-30 20Z" fill="currentColor" strokeLinejoin="round" />
                          <circle cx="61" cy="70" r="6" fill="currentColor" />
                          <circle cx="257" cy="209" r="6" fill="currentColor" />
                        </g>
                      )}
                      {division.id === 'industries' && (
                        <g stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                          <path d="m160 15 109 63v124l-109 63-109-63V78Z" />
                          <path d="m51 78 109 64 109-64M160 142v123" />
                          <path d="m160 55 74 43v84l-74 43-74-43V98Z" />
                          <path d="m86 98 74 43 74-43M160 141v84" />
                          <path d="m160 94 40 23v46l-40 23-40-23v-46Z" fill="currentColor" />
                          <path d="m120 117 40 23 40-23M160 140v46" stroke="var(--universe-color)" />
                          <path d="M160 0v15M160 265v15M38 71l13 7m218 124 13 7M38 209l13-7m218-124 13-7" />
                        </g>
                      )}
                    </svg>
                    <span className="universe-art-caption">New territory / {division.number}</span>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <a className="universe-labs" href="#lab">
          <span className="universe-labs-mark" aria-hidden="true">✳</span>
          <span className="universe-labs-title">The common thread? <strong>Experimentation.</strong></span>
          <span className="universe-labs-link">Meet 18HRSHIFT Labs <span aria-hidden="true">↗</span></span>
        </a>
      </div>
    </section>
  )
}
