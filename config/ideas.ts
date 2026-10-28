// The idea pile: less-formed ideas, half-built games and shelved apps. The site
// calls it Side quests (`ideasPage` in config/site.ts): shown on /side-quests and
// on each person's page. Pitches describe what actually got built, not
// what it could become, and the stage says honestly how far each one got. Keep
// private hosts, client names and other people's data out of these.

import type { PersonId } from './people'

export type IdeaStage = 'Napkin' | 'Prototype' | 'Playable' | 'Working' | 'Shelved'
export type IdeaKind = 'Game' | 'App' | 'Tool' | 'Bot' | 'Hardware'

export type Idea = {
  id: string
  name: string
  owner: PersonId
  kind: IdeaKind
  stage: IdeaStage
  pitch: string
  // Only for a public page someone can actually visit.
  url?: string
}

// The legend on /side-quests, in order of how far along an idea is.
export const ideaStages: Readonly<Record<IdeaStage, string>> = {
  Napkin: 'Notes, research and a hunch',
  Prototype: 'Some of it runs',
  Playable: 'You could play a slice of it',
  Working: 'It works, it just never launched',
  Shelved: 'Got far, then got parked',
}

export const ideas: readonly Idea[] = [
  // John
  {
    id: 'openwater',
    name: 'Openwater',
    owner: 'john',
    kind: 'App',
    stage: 'Shelved',
    pitch: 'A free fishing app, starting with Pennsylvania: trout stocking, water conditions and regulations on one map, with no paywall. The data side got far. The phone app only got as far as the map.',
  },
  {
    id: 'dogear',
    name: 'Dogear',
    owner: 'john',
    kind: 'Tool',
    stage: 'Prototype',
    pitch: 'Turn books you own into offline audiobooks with chapter markers and the cover, in a natural voice that runs on a normal computer. The goal is talking books that blind and low-vision listeners can navigate.',
    url: 'https://github.com/18hrshift/dogear-app',
  },
  {
    id: 'recko',
    name: 'Recko',
    owner: 'john',
    kind: 'App',
    stage: 'Prototype',
    pitch: 'One taste profile from everything you’ve watched, played and read, so you can ask for “something low-stakes and funny tonight” and get picks based on what you actually liked.',
  },
  {
    id: 'frugelli',
    name: 'Frugelli',
    owner: 'john',
    kind: 'App',
    stage: 'Prototype',
    pitch: 'Your weekly grocery circular, made personal. Tell it what you buy and where you shop, and it flags which of your groceries are unusually cheap this week. Southeast Pennsylvania first. The site is up; prices aren’t flowing yet.',
    url: 'https://frugelli.com',
  },
  {
    id: 'open-ordering',
    name: 'Open Ordering',
    owner: 'john',
    kind: 'App',
    stage: 'Napkin',
    pitch: 'Free, open-source online ordering for neighborhood restaurants, so the pizza place can take orders on its own site without an app taking a cut of every sale.',
  },
  {
    id: 'refurbrig',
    name: 'RefurbRig',
    owner: 'john',
    kind: 'App',
    stage: 'Napkin',
    pitch: 'A price tracker for used office PCs, the kind people grab for home labs. Group sold listings by model and spec to see what a machine really goes for.',
  },
  {
    id: 'rank-race',
    name: 'Rank Race',
    owner: 'john',
    kind: 'Tool',
    stage: 'Working',
    pitch: 'The weekly college football Top 25 as an animated race video. Teams fly on and off the board, with a short storyline card for the week.',
  },
  {
    id: 'scoreboard',
    name: 'ScoreBoard',
    owner: 'john',
    kind: 'App',
    stage: 'Prototype',
    pitch: 'A Windows tray app for live scores, with a short AI note on which games are worth flipping to.',
  },
  {
    id: 'research-desk',
    name: 'Research Desk',
    owner: 'john',
    kind: 'Tool',
    stage: 'Working',
    pitch: 'A research desk in the terminal. Hand it a niche and it plans the research, sends helpers out for sources, fact-checks the claims and writes up the report.',
  },

  // Joe: games
  {
    id: 'keybinder',
    name: 'Keybinder',
    owner: 'joe',
    kind: 'Game',
    stage: 'Playable',
    pitch: 'An arena roguelite where your keyboard is the build. Each new power goes on whatever key you press, and powers on neighboring keys recharge each other, until curses start forcing them onto awkward keys.',
  },
  {
    id: 'duneborn',
    name: 'Duneborn',
    owner: 'joe',
    kind: 'Game',
    stage: 'Playable',
    pitch: 'Play the monster under the sand. Swim through the desert, breach to ambush fuel convoys, bring down refineries and take on a moving drilling-rig boss.',
  },
  {
    id: 'getaway-spies',
    name: 'Getaway Spies',
    owner: 'joe',
    kind: 'Game',
    stage: 'Playable',
    pitch: 'Rival spies ransack a randomly built mansion for getaway-kart parts, booby-trap the furniture and race to escape first. It started as a 2D split-screen game and is growing into 3D with LAN play and a solo heist.',
  },
  {
    id: 'dynasty',
    name: 'Dynasty: The Redwater Breach',
    owner: 'joe',
    kind: 'Game',
    stage: 'Playable',
    pitch: 'A hack-and-slash battlefield brawler. Duel the gate warden, capture a siege cannon, blast the fortress gate open and lead the charge to the final boss.',
  },
  {
    id: 'channel-surf-studio',
    name: 'Channel Surf Studio',
    owner: 'joe',
    kind: 'Game',
    stage: 'Playable',
    pitch: 'Run a fake TV network. Draft made-up comedy shows, split the budget, fill six time slots and fight it out in the ratings.',
  },
  {
    id: 'button-garden',
    name: 'Button Garden',
    owner: 'joe',
    kind: 'Game',
    stage: 'Prototype',
    pitch: 'A cozy game for kids about designing coat buttons for storybook characters, then exporting them as real 3D-printable models with a grown-up’s help.',
  },
  {
    id: 'epic-real-life',
    name: 'Epic Real Life',
    owner: 'joe',
    kind: 'Game',
    stage: 'Prototype',
    pitch: 'A tactical battle sandbox on a real map. Drop up to 500 units anywhere in the world, give orders and watch the fight play out.',
  },
  {
    id: 'aftermath',
    name: 'Aftermath',
    owner: 'joe',
    kind: 'Game',
    stage: 'Prototype',
    pitch: 'A Mass Effect fan concept: a roguelite with an AI crewmate who follows what’s happening in your actual game and radios in, out loud.',
  },

  // Joe: apps, tools and bots
  {
    id: 'bandrewards',
    name: 'BandRewards',
    owner: 'joe',
    kind: 'App',
    stage: 'Prototype',
    pitch: 'Party games out of any song. Guess the Song rooms for two to eight phones, plus Lyric Battle, a typing duel against the lyrics.',
  },
  {
    id: 'ring-creator',
    name: 'Ring Creator',
    owner: 'joe',
    kind: 'Tool',
    stage: 'Working',
    pitch: 'A character creator for engagement rings. Build one from parts in 3D, get live jeweler checks as you go, and export a solid model ready to print or cast.',
  },
  {
    id: 'nobody',
    name: 'Nobody',
    owner: 'joe',
    kind: 'App',
    stage: 'Prototype',
    pitch: 'The anti-social network. The more followers you have anywhere else, the worse your standing here. Rooms for nothing much, unremarkable meals and abandoned hobbies.',
  },
  {
    id: 'santa',
    name: 'Santa',
    owner: 'joe',
    kind: 'Bot',
    stage: 'Prototype',
    pitch: 'A Discord voice bot that listens to the people who opt in and drops pictures of whatever they’re talking about into the chat. Say “Hey Santa” to ask it something out loud.',
  },
  {
    id: 'afk',
    name: 'AFK',
    owner: 'joe',
    kind: 'Tool',
    stage: 'Working',
    pitch: 'Keep tabs on your AI coding agents from your phone. It mirrors the terminal sessions on your PC and pings you when one needs an answer.',
  },
  {
    id: 'desk-screen',
    name: 'Desk screen',
    owner: 'joe',
    kind: 'Hardware',
    stage: 'Working',
    pitch: 'A tiny USB screen on the desk with PC stats, AI session status and a virtual pet whose mood follows how hard the machine is working.',
  },
  {
    id: 'controls-database',
    name: 'Controls Database',
    owner: 'joe',
    kind: 'App',
    stage: 'Prototype',
    pitch: 'Look up any game’s controls by platform and controller, and suggest fixes when they’re wrong.',
  },
]

export const ideasBy = (owner: PersonId) => ideas.filter((idea) => idea.owner === owner)
