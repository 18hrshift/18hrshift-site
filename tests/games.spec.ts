import { test, expect } from '@playwright/test'
import { games } from '@/config/games'
import { people } from '@/config/people'
import { gamesPage } from '@/config/site'

test('every configured game has an honest card with a real capture and a play link, or what is coming instead', async ({ page }) => {
  await page.goto('/games', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(gamesPage.title.join(''))
  for (const game of games) {
    const card = page.getByRole('article', { name: new RegExp(`^${game.name}`) })
    await expect(card).toHaveAttribute('id', game.id)
    await expect(card.getByRole('heading', { level: 2 })).toContainText(game.name)
    await expect(card).toContainText(game.line)
    await expect(card).toContainText(game.status)
    await expect(card).toContainText(game.genre)
    await expect(card.locator('.owner-tag')).toContainText(people[game.owner].firstName)
    if (game.nameNote) await expect(card).toContainText(game.nameNote)

    const capture = card.getByRole('img', { name: game.capture.alt })
    expect(game.capture.alt).toMatch(/^Gameplay capture: /)
    await capture.scrollIntoViewIfNeeded()
    await expect(capture).toBeVisible()
    expect(await capture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), `${game.name} capture loads`).toBe(true)
    await expect(card.locator('figcaption')).toHaveText(gamesPage.captureLabel)

    if (game.url) {
      const play = card.getByRole('link', { name: new RegExp(`${gamesPage.play} ${game.name}`) })
      await expect(play).toHaveAttribute('href', game.url)
      await expect(play).toHaveAttribute('target', '_blank')
      await expect(play).toHaveAttribute('rel', /noopener/)
    } else {
      await expect(card.getByRole('link')).toHaveCount(0)
      await expect(card.locator('.cartridge-play')).toHaveText(game.comingSoon!)
    }
  }
})

test('a game with more to say folds how it plays into its card, closed until asked', async ({ page }) => {
  const explained = games.filter((game) => game.about)
  expect(explained.length).toBeGreaterThan(0)
  await page.goto('/games', { waitUntil: 'networkidle' })
  for (const game of explained) {
    const card = page.getByRole('article', { name: new RegExp(`^${game.name}`) })
    const about = card.locator('details.cartridge-about')
    await expect(about).not.toHaveAttribute('open')
    for (const point of game.about!) await expect(about.getByText(point, { exact: true })).toBeHidden()
    await about.getByText(gamesPage.aboutLabel, { exact: true }).click()
    await expect(about).toHaveAttribute('open')
    for (const point of game.about!) await expect(about.getByText(point, { exact: true })).toBeVisible()
  }
})

test('the cabinet holds an empty slot for the player whose games are still coming', async ({ page }) => {
  await page.goto('/games', { waitUntil: 'networkidle' })
  const slot = page.getByRole('article', { name: people[gamesPage.emptySlot.owner].firstName, exact: true })
  await expect(slot).toContainText(gamesPage.emptySlot.body)
  await expect(slot.locator('.owner-tag')).toContainText(people[gamesPage.emptySlot.owner].initials)
  await expect(slot.getByRole('link')).toHaveCount(0)
})
