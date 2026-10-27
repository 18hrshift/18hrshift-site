import type { PlayerStats as Stats } from '@/config/people'
import { filledStats } from '@/lib/content'

// Character-sheet stats. Renders only the stats that have a value, and nothing
// at all when none do.
export function PlayerStats({ stats, label }: { stats: Stats; label: string }) {
  const filled = filledStats(stats)
  if (filled.length === 0) return null
  return (
    <dl className="player-stats" aria-label={label}>
      {filled.map((stat) => (
        <div key={stat.key} className="player-stat" data-stat={stat.key}>
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      ))}
    </dl>
  )
}
