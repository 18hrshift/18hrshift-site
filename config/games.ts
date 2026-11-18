// Every game in the cabinet. Copy and status come from each game's own README and
// status docs; keep them in step when a game changes. Captures are real gameplay,
// taken from the live sites by scripts/capture-sites.mjs. A game with no public
// build yet uses a frame from its own capture tooling, cropped to 1440x900.

import type { PersonId } from './people'

type GameBase = {
  id: string
  name: string
  // Shown next to the name when the name itself is provisional.
  nameNote?: string
  genre: string
  line: string
  status: string
  owner: PersonId
  accent: 'accent' | 'blue' | 'orange' | 'magenta'
  bestOn?: string
  note?: string
  // How it plays, a few short lines folded into the card under gamesPage.aboutLabel.
  about?: readonly string[]
  capture: { src: string; alt: string; width: number; height: number }
}

// A game is playable now, with a link to play it, or not yet, with what is
// coming in place of that link.
export type Game = GameBase & ({ url: string; comingSoon?: never } | { url?: never; comingSoon: string })

const capture = (id: string, alt: string) => ({ src: `/games/${id}.webp`, alt: `Gameplay capture: ${alt}`, width: 1440, height: 900 })

export const games: readonly Game[] = [
  {
    id: 'biscayne',
    name: 'Biscayne',
    nameNote: 'Working title',
    genre: 'Crime sim + roguelite',
    line: 'Miami Beach, 1983. Inherit your grandpa’s run-down strip mall, find out he was laundering cartel money, and keep up the payments. Then take the airboat into the swamp.',
    status: 'In development',
    owner: 'john',
    comingSoon: 'Demo coming soon',
    accent: 'blue',
    bestOn: 'Desktop, keyboard or gamepad',
    about: [
      'Days on the strip: fix up storefronts, sign tenants and keep them happy.',
      'Evenings, wash the dirty cash through your fronts. Wash too much and the heat comes.',
      'Wednesdays the cartel drops off more cash. Sundays they collect, and the vig only goes up.',
      'Saturday mornings, bid on storage units at the auction past the end of the block.',
      'Swamp runs on Uncle Dale’s airboat: auto-firing weapons, level-ups and five stages with a boss in each.',
      'One story across both halves, with a strip full of tenants and something humming out in the swamp.',
    ],
    capture: capture('biscayne', 'Collins Avenue by day, the pawn shop and the Suds City laundromat with tenants out front.'),
  },
  {
    id: 'exponential-dead',
    name: 'Exponential Dead',
    genre: 'The math runner',
    line: 'A cute-macabre roguelite. Steer a skeleton horde through math gates, multiply it, then march it into oversized boss fights.',
    status: 'In development',
    owner: 'john',
    url: 'https://ed.18hrshift.com',
    accent: 'magenta',
    bestOn: 'Desktop, mouse and keyboard',
    capture: capture('exponential-dead', 'a tiny necromancer and a skeleton horde on a grave road, heading for two math gates.'),
  },
  {
    id: 'ruff-n-tumble',
    name: 'Ruff-n-Tumble',
    genre: 'Herding',
    line: 'A tactical herding journey. Lead three dogs, guide the herd across risky country and bring them home.',
    status: 'In development',
    owner: 'john',
    url: 'https://ruffntumble.18hrshift.com',
    accent: 'orange',
    bestOn: 'Desktop, mouse and keyboard',
    capture: capture('ruff-n-tumble', 'three dogs waiting for orders on the home farm.'),
  },
  {
    id: 'specter',
    name: 'Specter 1-1',
    genre: 'Gunship',
    line: 'A tactical gunship experiment set in an alternate Cold War. Orbit above the city, protect the squad on the ground, and carry your losses.',
    status: 'Playable prototype',
    owner: 'john',
    url: 'https://c130.18hrshift.com',
    accent: 'blue',
    bestOn: 'Desktop, mouse and keyboard',
    capture: capture('specter', 'the gunship’s targeting view over a city, with weapon and squad readouts.'),
  },
  {
    id: 'fourth-and-chalk',
    name: '4th & Chalk',
    nameNote: 'Working title',
    genre: 'Football deckbuilder',
    line: 'A roguelike deckbuilder about American football. Build a deck of play-call cards and coach your way through a high school season.',
    status: 'Early build',
    owner: 'john',
    url: 'https://chalk.18hrshift.com',
    accent: 'accent',
    capture: capture('fourth-and-chalk', 'a hand of play-call cards under the scoreboard on a chalkboard field.'),
  },
  {
    id: 'flagged',
    name: 'Flagged',
    genre: 'NFL rules game',
    line: 'What’s the call? Learn the NFL rulebook one real play at a time, with the league’s own ruling behind every answer.',
    status: 'Live',
    owner: 'john',
    url: 'https://flagged.18hrshift.com',
    accent: 'accent',
    note: 'Independent fan project. Not affiliated with or endorsed by the NFL.',
    capture: capture('flagged', 'the daily call, a real play drawn in chalk with the question underneath.'),
  },
  {
    id: 'gasguesser',
    name: 'GasGuesser',
    genre: 'Daily guessing game',
    line: 'Real American gas stations with the price signs hidden. Guess the posted price of regular or diesel.',
    status: 'Beta',
    owner: 'john',
    url: 'https://gasguesser.18hrshift.com',
    accent: 'orange',
    capture: capture('gasguesser', 'a real gas station photo with the price hidden and the guess slider below.'),
  },
  {
    id: 'spotslop',
    name: 'SpotSlop',
    genre: 'Real or AI?',
    line: 'Five photos a day: real or AI? After each guess, see the real photo next to its AI twin, then challenge a friend to the same five.',
    status: 'Live',
    owner: 'joe',
    url: 'https://spotslop.art',
    accent: 'blue',
    bestOn: 'Phone or desktop',
    capture: capture('spotslop', 'photo 1 of the daily five, a table with wooden spoons, above the Real photo and AI-generated buttons.'),
  },
  {
    id: 'sorter',
    name: 'Sorter',
    genre: 'Ranking game',
    line: 'Rank things by picking between two at a time. Fruit Sorter is the first game.',
    status: 'Live',
    owner: 'john',
    url: 'https://sort.18hrshift.com',
    accent: 'orange',
    capture: capture('sorter', 'two fruits head to head in a which-would-you-rather-eat matchup.'),
  },
]

export const gamesBy = (owner: PersonId) => games.filter((game) => game.owner === owner)
