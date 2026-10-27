import { test, expect } from '@playwright/test'
import { people, playerOrder, playerStatLabels } from '@/config/people'
import { filledStats } from '@/lib/content'

// PlayerStats renders exactly the rows filledStats returns, and nothing when it
// returns none. These unit checks pin that selection; the page checks below prove
// the rendered result with real config.

const [one, many] = [0, 1] as const

test('an empty stat is dropped and a filled one is kept', () => {
  const stats = filledStats({ firstGame: 'Star Wars: Yoda Stories', favoriteBand: '', firstGpu: '   ' })
  expect(stats).toEqual([{ key: 'firstGame', label: playerStatLabels.firstGame[one], value: 'Star Wars: Yoda Stories' }])
})

test('no stats with a value means nothing to render', () => {
  expect(filledStats({})).toEqual([])
  expect(filledStats({ firstGame: '', currentInterest: [] })).toEqual([])
  expect(filledStats({ favoriteBand: [' ', ''] })).toEqual([])
})

test('a list of answers reads as one row under the plural label', () => {
  expect(filledStats({ favoriteBand: ['Goose', ' ', 'Eggy'] })).toEqual([
    { key: 'favoriteBand', label: playerStatLabels.favoriteBand[many], value: 'Goose, Eggy' },
  ])
  expect(filledStats({ favoriteBand: ['Goose'] })).toEqual([
    { key: 'favoriteBand', label: playerStatLabels.favoriteBand[one], value: 'Goose' },
  ])
})

test('filled stats keep the configured order and labels', () => {
  const stats = filledStats({ currentInterest: 'Infrastructure', firstGame: 'A', favoriteBand: 'B' })
  expect(stats.map((stat) => stat.key)).toEqual(['firstGame', 'favoriteBand', 'currentInterest'])
  expect(stats.map((stat) => stat.label)).toEqual([playerStatLabels.firstGame[one], playerStatLabels.favoriteBand[one], playerStatLabels.currentInterest[one]])
})

test('both players show their stats as a character sheet, on the home cards and their pages', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  for (const id of playerOrder) {
    const expected = filledStats(people[id].stats)
    expect(expected.length, `${id} has stats`).toBeGreaterThan(0)
    const rows = page.getByRole('article', { name: people[id].name }).locator('.player-stat')
    await expect(rows).toHaveCount(expected.length)
    for (const [index, stat] of expected.entries()) {
      await expect(rows.nth(index).locator('dt')).toHaveText(stat.label)
      await expect(rows.nth(index).locator('dd')).toHaveText(stat.value)
    }
  }

  for (const id of playerOrder) {
    await page.goto(people[id].page, { waitUntil: 'networkidle' })
    await expect(page.locator('.profile .player-stats')).toBeVisible()
    await expect(page.locator('.profile .player-stat dd')).toHaveText(filledStats(people[id].stats).map((stat) => stat.value))
  }
})
