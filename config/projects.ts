// Everything that isn't a game: platforms, the show, ideas in progress and the
// systems we run. Systems (`kind: 'System'`) appear on both /lab and /john.
// Descriptions must match the real work; keep status labels honest. A project
// with a `capture` shows a real screenshot of its live site, taken by
// scripts/capture-sites.mjs; the rest use brand art or an illustration.

import type { PersonId } from './people'

export type ProjectKind = 'Platform' | 'Web app' | 'App' | 'Podcast' | 'Prototype' | 'Fan translation' | 'Idea' | 'System'

export type Project = {
  id: string
  name: string
  kind: ProjectKind
  owner: PersonId
  discipline: string
  summary: string
  headline?: string
  story: string
  features?: readonly string[]
  status?: string
  statusNote?: string
  url?: string
  linkLabel?: string
  capture?: { src: string; alt: string; width: number; height: number }
}

const siteCapture = (id: string, alt: string) => ({ src: `/projects/${id}.webp`, alt: `Site capture: ${alt}`, width: 1440, height: 900 })

export const projects: readonly Project[] = [
  {
    id: 'hairraiser',
    name: 'Hairraiser',
    kind: 'Platform',
    owner: 'john',
    discipline: 'Platforms / Brand',
    summary: 'An idea with a human side.',
    headline: 'Fund your comeback.',
    story: 'Personal crowdfunding for hair-restoration journeys. Hairraiser brings campaign stories, contributions and progress updates together in a warm, approachable product built around the people using it.',
    features: [
      'Campaign creation, cover photos and progress updates',
      'One-off contributions through Stripe Checkout',
      'Campaigner dashboards and payout-review requests',
      'A complete brand, website and educational content',
    ],
    status: 'Live web platform',
    statusNote: 'The public website and campaign platform are available now, with ongoing product development.',
    url: 'https://hairraiser.xyz',
    linkLabel: 'Visit Hairraiser',
  },
  {
    id: 'aah',
    name: 'Andrew Asks How',
    kind: 'Podcast',
    owner: 'john',
    discipline: 'Podcast / Production',
    summary: 'Long-form interviews. John has produced all 100 episodes.',
    headline: 'Pull up a chair.',
    story: 'A long-form interview show. Andrew Forte sits down with founders and influential people in startups, crypto and internet culture for a relaxed conversation. John co-founded it with Andrew and has produced all 100 episodes.',
    url: 'https://andrewaskshow.com',
    linkLabel: 'Listen at andrewaskshow.com',
  },
  {
    id: 'embersave',
    name: 'Embersave',
    kind: 'Idea',
    owner: 'john',
    discipline: 'Gaming tools / Desktop',
    summary: 'One world. Whoever gets online first.',
    headline: 'Keep the world alive.',
    story: 'A survival world should belong to the whole friend group. Embersave is an open-source launcher that passes one shared save between players. Take a turn hosting, play together, then hand the world on when you leave.',
    features: [
      'Palworld host handoffs between two machines',
      'One host at a time, with background save snapshots',
      'Save recovery and a desktop launcher',
      'Save files kept in the players’ own Google Drive',
    ],
    status: 'In development',
    statusNote: 'The Palworld handoff has been tested end to end. There is no public installer yet; broader game support is still ahead.',
    url: 'https://embersave.18hrshift.com',
    linkLabel: 'Meet Embersave',
  },
  {
    id: 'power-hour-club',
    name: 'Power Hour Club',
    kind: 'Web app',
    owner: 'joe',
    discipline: 'Web app / Music & video',
    summary: 'Make and play power hour playlists from YouTube clips.',
    story: 'A website for making and playing power hour playlists: short video clips that play one after another, traditionally changing every minute for an hour. Pick clips from YouTube, build your own playlists or explore ones the community shared, with optional drinking-game features for gatherings.',
    features: [
      'Create playlists from YouTube clips',
      'Choose where clips begin and play them in sequence',
      'Browse community playlists',
      'Optional drinking-game features',
    ],
    status: 'Live',
    url: 'https://powerhour.club',
    linkLabel: 'Visit Power Hour Club',
    capture: siteCapture('power-hour-club', 'the Power Hour Club home page, with playlist tools and community picks.'),
  },
  {
    id: 'nybec',
    name: 'NYBEC Tracker',
    kind: 'Web app',
    owner: 'joe',
    discipline: 'Web app / Food & maps',
    summary: 'Find and compare bacon, egg and cheese sandwiches across NY, NJ and CT.',
    story: 'Find and compare bacon, egg and cheese sandwiches at delis and bodegas across New York, New Jersey and Connecticut, with prices, locations, hours, photos and reviews.',
    features: [
      'Find nearby delis and bodegas on a map',
      'Compare BEC prices',
      'Location details, hours, photos and reviews',
      'Coverage across New York, New Jersey and Connecticut',
    ],
    status: 'Live',
    url: 'https://nybec.com',
    linkLabel: 'Visit NYBEC Tracker',
    capture: siteCapture('nybec', 'the NYBEC Tracker home page, with a price search and a list of the cheapest sandwiches.'),
  },
  {
    id: 'ourtv',
    name: 'OurTV',
    kind: 'App',
    owner: 'joe',
    discipline: 'Desktop & Android app / TV',
    summary: 'Turn the streaming services you already pay for into TV channels.',
    story: 'Make your own TV channels out of the streaming services you already pay for. Put shows and movies in the order you want, from any of your services, and the channel airs around the clock with a real program guide. Press Watch to open whatever is on now, or share a channel so a friend can run their own copy.',
    features: [
      'Channels built only from the services you subscribe to',
      'A live program guide: on now, up next, after that',
      'Press Watch to jump into the program already in progress',
      'Share channels with friends or post them for anyone to copy',
      'For Windows and Android, with streaming logins kept on your device',
    ],
    status: 'Invite only',
    url: 'https://ourtvnow.com',
    linkLabel: 'Visit OurTV',
    capture: siteCapture('ourtv', 'the OurTV home page, “Make your own TV channels”, with an example program guide below.'),
  },
  {
    id: 'marginalia',
    name: 'Marginalia',
    kind: 'Prototype',
    owner: 'joe',
    discipline: 'Book illustrator',
    summary: 'A reading app that illustrates the story as you go.',
    story: 'An illustrated reading app that creates pictures for moments in a story as you read or listen. Choose an art style, tune the reading experience, and follow along with narration.',
    features: [
      'Illustrations generated for scenes while reading or listening',
      'Art style, text size, theme and illustration frequency controls',
      'Narration with voice, speed and playback controls',
      'A bookshelf of classic books, imported texts and saved places',
      'Review pictures and keep character appearances consistent',
      'Export an illustrated edition for offline reading',
    ],
    status: 'Local prototype',
  },
  {
    id: 'ouran',
    name: 'Ouran High School Host Club',
    kind: 'Fan translation',
    owner: 'joe',
    discipline: 'English fan translation / Nintendo DS',
    summary: 'A community fan translation of the Nintendo DS game into English.',
    story: 'A community fan translation that brings the game’s dialogue, story scenes and parts of its menus into English, so more fans can experience its characters and branching story. The work covers translating and reviewing the text, fitting it to the game’s screens, and playtesting how it reads.',
    features: [
      'English dialogue and story scenes',
      'Translated menu elements and artwork',
      'A branching story with multiple character paths and endings',
      'Community review materials for feedback and corrections',
    ],
    status: 'Ongoing fan project',
  },
  {
    id: 'bedrock',
    name: 'Bedrock SQL',
    kind: 'System',
    owner: 'john',
    discipline: 'Infrastructure / PostgreSQL',
    summary: 'The foundation underneath the products.',
    headline: 'Build on something solid.',
    story: 'Our self-hosted PostgreSQL platform gives separate projects a shared operational foundation. The work goes beyond running a database: it includes tenant boundaries, encrypted connections, recoverable backups and checks that exercise the database itself.',
    features: [
      'Separate project databases and access roles',
      'TLS connections and bounded tenant connection budgets',
      'Off-provider backups and point-in-time recovery',
      'Automated restore drills and authenticated health checks',
    ],
    status: 'Built & operated',
    statusNote: 'An operational platform for our own projects, designed around a single database server and tested recovery workflows.',
  },
  {
    id: 'openwrt',
    name: 'OpenWrt network',
    kind: 'System',
    owner: 'john',
    discipline: 'Networking / Open source',
    summary: 'Own the network. Understand every layer.',
    headline: 'A network with a plan.',
    story: 'An open-source network build, from router firmware to DNS filtering and a considered cutover. OpenWrt and Pi-hole form the base, with guest separation, private remote access and monitoring designed for everyday use.',
    features: [
      'Official OpenWrt router setup and completed cutover',
      'Pi-hole filtering with a filtered DNS fallback',
      'Guest Wi-Fi separation and WireGuard remote access',
      'Service checks, configuration backups and recovery guides',
    ],
    status: 'Built & operated',
    statusNote: 'Running on our own network, with configuration backups and documented recovery procedures.',
  },
  {
    id: 'homelab',
    name: 'The home lab',
    kind: 'System',
    owner: 'john',
    discipline: 'Virtualization / Operations',
    summary: 'Where the experiments become infrastructure.',
    headline: 'From the machine up.',
    story: 'A hands-on environment for building and running our own services. Virtual machines, backup routines, power monitoring and documented recovery turn a collection of hardware into a place where ideas can keep running.',
    features: [
      'Proxmox virtualization with Linux guests',
      'Scheduled virtual-machine backups and boot configuration',
      'UPS monitoring and graceful-shutdown configuration',
      'Shared observability and evidence-led incident runbooks',
    ],
    status: 'Built & operated',
    statusNote: 'Our working environment for self-hosted services, development, and infrastructure experiments.',
  },
]

export const projectById = (id: string) => {
  const project = projects.find((item) => item.id === id)
  if (!project) throw new Error(`Unknown project id "${id}" in config.`)
  return project
}

export const systems = projects.filter((project) => project.kind === 'System')
