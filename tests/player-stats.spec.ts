import { test, expect } from '@playwright/test'
import { people, playerStatLabels } from '@/config/people'
import { filledStats } from '@/lib/content'

// PlayerStats renders exactly the rows filledStats returns, and nothing when it
// returns none. These unit checks pin that selection; the page checks below prove
// the rendered result with real config (John's stats are filled, Joe's are empty).

test('an empty stat is dropped and a filled one is kept', () => {
  const stats = filledStats({ firstGame: 'Star Wars: Yoda Stories', favoriteBand: '', firstGpu: '   ' })
  expect(stats).toEqual([{ key: 'firstGame', label: playerStatLabels.firstGame, value: 'Star Wars: Yoda Stories' }])
})

test('no stats with a value means nothing to render', () => {
  expect(filledStats({})).toEqual([])
  expect(filledStats({ firstGame: '', currentInterest: '' })).toEqual([])
})

test('filled stats keep the configured order and labels', () => {
  const stats = filledStats({ currentInterest: 'Infrastructure', firstGame: 'A', favoriteBand: 'B' })
  expect(stats.map((stat) => stat.key)).toEqual(['firstGame', 'favoriteBand', 'currentInterest'])
  expect(stats.map((stat) => stat.label)).toEqual([playerStatLabels.firstGame, playerStatLabels.favoriteBand, playerStatLabels.currentInterest])
})

test('filled stats render as a character sheet and empty ones leave no block', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const johnCard = page.getByRole('article', { name: people.john.name })
  const johnStats = filledStats(people.john.stats)
  const rows = johnCard.locator('.player-stat')
  await expect(rows).toHaveCount(johnStats.length)
  for (const [index, stat] of johnStats.entries()) {
    await expect(rows.nth(index).locator('dt')).toHaveText(stat.label)
    await expect(rows.nth(index).locator('dd')).toHaveText(stat.value)
  }
  expect(filledStats(people.joe.stats)).toEqual([])
  await expect(page.getByRole('article', { name: people.joe.name }).locator('.player-stats')).toHaveCount(0)

  await page.goto('/john', { waitUntil: 'networkidle' })
  await expect(page.locator('.profile .player-stats')).toBeVisible()
  await expect(page.locator('.profile .player-stat dd')).toHaveText(johnStats.map((stat) => stat.value))
})
