// Small read helpers over config. They throw on a bad id so a typo fails the build.

import { games, type Game } from '@/config/games'
import { playerStatLabels, type PlayerStats } from '@/config/people'
import { projectById, type Project } from '@/config/projects'
import { home } from '@/config/site'

export type FeaturedItem = { type: 'game'; item: Game } | { type: 'project'; item: Project }

export function gameById(id: string): Game {
  const game = games.find((item) => item.id === id)
  if (!game) throw new Error(`Unknown game id "${id}" in config.`)
  return game
}

export function featuredItems(): FeaturedItem[] {
  return home.featured.items.map((entry) =>
    entry.type === 'game' ? { type: 'game', item: gameById(entry.id) } : { type: 'project', item: projectById(entry.id) },
  )
}

// The stats that have a value, in display order, with their labels.
export function filledStats(stats: PlayerStats): { key: keyof PlayerStats; label: string; value: string }[] {
  return (Object.keys(playerStatLabels) as (keyof PlayerStats)[])
    .map((key) => ({ key, label: playerStatLabels[key], value: stats[key]?.trim() ?? '' }))
    .filter((stat) => stat.value.length > 0)
}
