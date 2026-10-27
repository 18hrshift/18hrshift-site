// schema.org JSON-LD built from config. Stable @ids let the home page's
// Organization and each Person node point at each other across pages.

import { people, playerOrder, type Person } from '@/config/people'
import { site, home } from '@/config/site'

const absolute = (path: string) => new URL(path, site.url).toString()

export const ids = {
  organization: `${site.url}/#org`,
  person: (person: Person) => `${site.url}/${person.id}#person`,
}

const organizationRef = { '@id': ids.organization }

function organization() {
  return {
    '@type': 'Organization',
    '@id': ids.organization,
    name: site.name,
    url: site.url,
    email: site.email,
    description: home.description,
    slogan: site.tagline,
    founder: playerOrder.map((id) => ({ '@id': ids.person(people[id]) })),
    sameAs: [site.github],
  }
}

function person(person: Person) {
  return {
    '@type': 'Person',
    '@id': ids.person(person),
    name: person.name,
    url: absolute(person.page),
    ...(person.photo && { image: absolute(person.photo.src) }),
    worksFor: organizationRef,
    ...(person.links.length > 0 && { sameAs: person.links.map((link) => link.href) }),
    ...(person.knowsAbout && { knowsAbout: person.knowsAbout }),
  }
}

export function homeJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [organization(), ...playerOrder.map((id) => person(people[id]))],
  }
}

export function profileJsonLd(subject: Person, description: string) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': absolute(subject.page),
        url: absolute(subject.page),
        name: `${subject.name} | ${site.name}`,
        description,
        mainEntity: { '@id': ids.person(subject) },
      },
      person(subject),
      { '@type': 'Organization', '@id': ids.organization, name: site.name, url: site.url },
    ],
  }
}
