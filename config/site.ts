// Site identity, navigation, contact and page copy. Components read these
// values; none of this text should be typed anywhere else.

import { people, playerOrder, type PersonId } from './people'

export const site = {
  name: '18HRSHIFT',
  tagline: 'Ideas don’t clock out.',
  description: '18HRSHIFT is John Byrnes and Joe Lanellotti: internet native, AI native, building games, music tools, platforms and odd experiments out in the open.',
  url: 'https://18hrshift.com',
  locale: 'en_US',
  email: 'admin@18hrshift.com',
  github: 'https://github.com/18hrshift',
  nav: [
    { label: 'Games', href: '/games' },
    { label: 'Lab', href: '/lab' },
    ...playerOrder.map((id) => ({ label: people[id].firstName, href: people[id].page })),
  ],
  contactLink: { label: 'Build with us', href: '/#contact' },
  headerNote: ['Two players.', 'One long shift.'],
  footerNote: 'Always a work in progress.',
  menu: { open: 'Menu +', close: 'Close −' },
  skipLink: 'Skip to content',
  homeLabel: 'Home',
} as const

export const home = {
  metaTitle: `${site.name} | ${site.tagline}`,
  description: site.description,
  hero: {
    eyebrow: 'Now playing',
    credit: 'John Byrnes + Joe Lanellotti',
    title: ['Ideas don’t', 'clock out.'],
    body: '18HRSHIFT is John Byrnes and Joe Lanellotti. Internet native from the start, AI native now. We use AI to go from idea to working thing in days, then put it out in the open to see what sticks. Games, music tools, platforms, odd experiments. Collaborators welcome.',
    primary: { label: 'Play the games', href: '/games' },
    secondary: { label: 'Meet the players', href: '#players' },
  },
  tags: ['Internet native', 'AI native', 'Gamers', 'Music', 'Builders', 'Open to collabs'],
  tickerLabel: 'What we’re about',
  tickerPause: 'Pause motion',
  players: {
    eyebrow: '01 / Choose your player',
    title: ['Two players.', 'One shift.'],
    mode: 'Co-op mode',
    readyLabel: 'Ready',
    originEyebrow: 'Origin story',
    originTitle: 'Long-time best friends.',
    origin: 'We grew up in suburban Long Island playing video games and tinkering with electronics. We both dabbled in code and it never quite stuck. Agentic coding brought us back, to finally understand the machines we’ve always loved.',
  },
  featured: {
    eyebrow: '02 / Featured work',
    title: ['Out of our heads.', 'Into the open.'],
    aside: 'A mix of what we’ve made: games, platforms, a podcast and ideas we couldn’t leave alone.',
    // Mixed on purpose: `game` ids come from config/games.ts, `project` ids from config/projects.ts.
    items: [
      { type: 'game', id: 'exponential-dead' },
      { type: 'project', id: 'power-hour-club' },
      { type: 'project', id: 'hairraiser' },
      { type: 'project', id: 'nybec' },
      { type: 'project', id: 'aah' },
      { type: 'project', id: 'embersave' },
    ],
  },
  games: {
    eyebrow: '03 / The cabinet',
    title: ['Press start.'],
    aside: 'All playable in a browser. Some are close to done, some are early builds. Every card says which.',
    link: 'See every game',
    countLabel: 'games',
    listLabel: 'Games in the cabinet',
  },
  lab: {
    eyebrow: '04 / The lab',
    title: ['Break things', 'on purpose.'],
    body: 'Three real-time experiments you can push around, plus the systems that keep everything running.',
    still: {
      src: '/lab/liquid-chrome.webp',
      alt: 'A still from the lab: the liquid chrome sculpture, rendered in the browser.',
      width: 1280,
      height: 800,
    },
    stillCaption: 'A still. The real thing renders live.',
    link: 'Enter the lab',
  },
  contact: {
    eyebrow: '05 / Build with us',
    title: ['Got an idea?', 'Let’s build it.'],
    body: 'Not a sales pitch. If you’re making something fun and want company, or you have an idea that won’t leave you alone, say hi.',
    emailLabel: 'Start a conversation at',
  },
} as const

export const gamesPage = {
  path: '/games',
  metaTitle: 'Games',
  description: 'Every 18HRSHIFT game in one place: browser games by John Byrnes and Joe Lanellotti, from release candidates to early builds, with real gameplay captures.',
  eyebrow: 'Games',
  title: ['The', 'cabinet.'],
  intro: 'Every game here runs in a browser, and every image is a real gameplay capture. The status labels are honest: some are close to done, some are early builds.',
  play: 'Play',
  captureLabel: 'Gameplay capture',
  listLabel: 'All games',
  // An empty cartridge slot at the end of the cabinet, held for Joe's games.
  emptySlot: { owner: 'joe', label: 'Slot reserved', screen: 'Insert cartridge', body: 'Joe’s games are on the way.' },
} as const

export const labPage = {
  path: '/lab',
  metaTitle: 'The lab',
  description: 'Real-time Three.js experiments you can play with, and the systems 18HRSHIFT runs underneath: Bedrock SQL, an OpenWrt network and the home lab.',
  eyebrow: 'The lab',
  tag: 'EXPERIMENT IN PUBLIC',
  title: ['Less talk.', 'More play.'],
  intro: 'The browser is a canvas. This one is yours to mess with. Pick a world, change the rules, then look under the hood at the systems we run ourselves.',
  experiments: 'Experiments',
  systems: {
    eyebrow: 'Under the surface',
    title: 'Systems',
    aside: 'We build the systems behind the experience, too.',
  },
} as const

// Labels shared by project cards, details and dialogs.
export const projectCopy = {
  captureLabel: 'Site capture',
  featuresHeading: 'What we built',
  closeDetails: 'Close project details',
  explore: 'Explore',
} as const

// Shared labels for the player profile pages (/john, /joe).
export const profileCopy = {
  eyebrow: 'Player profile',
  photoLabel: 'IRL',
  quoteLabel: 'Hot take',
  links: 'Links',
} as const

export type ProfileSection =
  | { id: string; title: string; kind: 'projects'; projects: readonly string[] }
  | { id: string; title: string; kind: 'games' }
  | { id: string; title: string; kind: 'systems' }

// One entry per person page; the path is the person's `page` in config/people.ts.
// Sections render in order. A games section is left out while that person has no games.
export const profilePages: Readonly<Record<PersonId, { metaTitle: string; description: string; sections: readonly ProfileSection[] }>> = {
  john: {
    metaTitle: 'John Byrnes',
    description: 'John Byrnes, co-founder of 18HRSHIFT. His games, Hairraiser, the Andrew Asks How podcast, the systems he runs and the ideas on his shelf.',
    sections: [
      { id: 'show', title: 'The show', kind: 'projects', projects: ['aah'] },
      { id: 'platform', title: 'The platform', kind: 'projects', projects: ['hairraiser'] },
      { id: 'games', title: 'His games', kind: 'games' },
      { id: 'systems', title: 'Systems', kind: 'systems' },
      { id: 'ideas', title: 'Ideas shelf', kind: 'projects', projects: ['embersave'] },
    ],
  },
  joe: {
    metaTitle: 'Joe Lanellotti',
    description: 'Joe Lanellotti, co-founder of 18HRSHIFT. Power Hour Club, NYBEC Tracker, the Marginalia reading app and an English fan translation of Ouran High School Host Club.',
    sections: [
      { id: 'live', title: 'Live now', kind: 'projects', projects: ['power-hour-club', 'nybec'] },
      { id: 'games', title: 'His games', kind: 'games' },
      { id: 'works', title: 'In the works', kind: 'projects', projects: ['marginalia', 'ouran'] },
    ],
  },
}

export const notFoundPage = {
  title: ['Game over.', 'Continue?'],
  body: 'This page doesn’t exist. Maybe it never did.',
  home: 'Back to the start',
  games: 'Play something instead',
} as const
