// The two of us. Every person-facing string, image and link lives here; pages
// and components read it. To swap an avatar, change its `avatar.src`.

export type PersonId = 'john' | 'joe'

// A stat is one answer or a short list of them (Joe has two favorite bands).
export type PlayerStatValue = string | readonly string[]

export type PlayerStats = {
  firstGame?: PlayerStatValue
  favoriteGame?: PlayerStatValue
  favoriteBand?: PlayerStatValue
  firstGpu?: PlayerStatValue
  currentInterest?: PlayerStatValue
}

// Display order and labels for the character sheet, as [one answer, several].
// Only stats with a value render.
export const playerStatLabels: Readonly<Record<keyof PlayerStats, readonly [one: string, many: string]>> = {
  firstGame: ['First game', 'First games'],
  favoriteGame: ['Favorite game', 'Favorite games'],
  favoriteBand: ['Favorite band', 'Favorite bands'],
  firstGpu: ['First GPU', 'First GPUs'],
  currentInterest: ['Into right now', 'Into right now'],
}

type Image = { src: string; alt: string; width: number; height: number }

export type BioSection = { title?: string; paragraphs: readonly string[] }

export type Person = {
  id: PersonId
  slot: 'P1' | 'P2'
  name: string
  firstName: string
  page: string
  line: string
  avatar: Image
  photo?: Image
  bio: readonly BioSection[]
  quote?: string
  // Public profiles. They also become the person's JSON-LD `sameAs`.
  links: readonly { label: string; href: string }[]
  // JSON-LD `knowsAbout`, only when the person has named them.
  knowsAbout?: readonly string[]
  stats: PlayerStats
  accent: 'accent' | 'magenta'
}

export const people: Readonly<Record<PersonId, Person>> = {
  john: {
    id: 'john',
    slot: 'P1',
    name: 'John Byrnes',
    firstName: 'John',
    page: '/john',
    line: 'Co-founder. Builds the games, produces the podcast, runs the home lab.',
    avatar: {
      src: '/people/john-avatar.png',
      alt: 'John’s neon skull avatar in a gaming headset with a boom mic, holding a controller.',
      width: 640,
      height: 640,
    },
    photo: {
      src: '/people/john-photo.jpg',
      alt: 'John, outdoors, in sunglasses and a grey T-shirt.',
      width: 800,
      height: 800,
    },
    bio: [
      {
        title: 'About',
        paragraphs: [
          'I’ve been tinkering with hardware since middle school. Computers always fascinated me, but programming never fully clicked. AI bridged that gap.',
          'I’ve used language models since GPT, before ChatGPT existed, and now I’m deep into agentic workflows, automation pipelines and anything that saves a ton of time and effort.',
          'I studied economics in college and still love it. I’ve followed crypto for years, as an interested watcher, not an evangelist. And I think we’ll see a solo-founded trillion-dollar company in our lifetime.',
          'I co-founded Andrew Asks How with Andrew Forte and produced all 100 episodes, and I run Sonogee, my production company.',
        ],
      },
      {
        title: 'Reading',
        paragraphs: [
          'Most of my reading happens through audiobooks. I read in clusters, going deep on one subject through several books until I understand its history, people and institutions.',
          'History, geopolitics, organized crime, economics, science, and the systems that shape societies: empires, revolutions, intelligence operations, cartels, corporate power. I like narrative nonfiction that tells a story instead of repeating an argument.',
          'For fiction I want big sci-fi and fantasy with real worldbuilding and political intrigue: Brandon Sanderson, George R. R. Martin, Robert Jordan, Dan Simmons, Adrian Tchaikovsky. Long books and longer series don’t scare me, and I usually have fiction and nonfiction going at the same time.',
        ],
      },
      {
        title: 'Off the keyboard',
        paragraphs: ['Fishing, birdwatching and national parks. These days I build from the Pennsylvania countryside.'],
      },
    ],
    quote: 'I think we’ll see a solo-founded trillion-dollar company in our lifetime.',
    links: [
      { label: 'X', href: 'https://x.com/j_theproducer' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/john-byrnes-964a38237/' },
      { label: 'GitHub', href: 'https://github.com/18hrshift' },
    ],
    knowsAbout: ['Economics', 'AI agents', 'Automation', 'Infrastructure', 'Podcast production'],
    // Only stats with a value render; an empty one stays off the page.
    stats: {
      firstGame: 'Star Wars: Yoda Stories',
      favoriteGame: 'The Legend of Zelda: Majora’s Mask',
      favoriteBand: 'The Grateful Dead',
      firstGpu: 'ATI Radeon 9700 Pro',
      currentInterest: 'Infrastructure',
    },
    accent: 'accent',
  },
  joe: {
    id: 'joe',
    slot: 'P2',
    name: 'Joe Lanellotti',
    firstName: 'Joe',
    page: '/joe',
    line: 'Co-founder. Ships the games, spins the playlists, translates the ones nobody else would.',
    avatar: {
      src: '/people/joe-avatar.png',
      alt: 'Joe’s neon skull avatar in sunglasses, scratching records at a DJ booth.',
      width: 640,
      height: 640,
    },
    // Joe's own words, from his notes (October 27, 2026).
    bio: [
      {
        title: 'About',
        paragraphs: [
          'Some of my earliest gaming memories are of booting up games on my dad’s DOS computer in the workshop. That curiosity stuck with me, eventually leading to building computers and exploring projects of my own.',
          'My extensive list of projects keeps me busy these days, with plenty of ideas still waiting their turn.',
          'I also love music, especially getting out to support local bands. Go Jaguars!',
        ],
      },
    ],
    // His GitHub is coming; add it here when it exists.
    links: [],
    stats: {
      firstGame: ['Doom', 'Hexen', 'Heretic', 'Duke Nukem', 'Redneck Rampage'],
      favoriteGame: ['The Legend of Zelda: Ocarina of Time', 'The Mass Effect trilogy'],
      favoriteBand: ['Goose', 'Eggy'],
      firstGpu: 'EVGA GeForce GTX 670',
      currentInterest: ['AI projects', 'Cooking', 'Following Trevor Lawrence'],
    },
    accent: 'magenta',
  },
}

export const playerOrder: readonly PersonId[] = ['john', 'joe']
