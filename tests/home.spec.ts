import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { games } from '@/config/games'
import { people } from '@/config/people'
import { home, site } from '@/config/site'
import { featuredItems } from '@/lib/content'
import { jsonLdNodes } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
})

test('hero, players and origin story render from config', async ({ page }) => {
  const h1 = page.getByRole('heading', { level: 1 })
  for (const line of home.hero.title) await expect(h1).toContainText(line)
  await expect(page.getByText(home.hero.body)).toBeVisible()
  await expect(page.getByRole('link', { name: home.hero.primary.label })).toHaveAttribute('href', home.hero.primary.href)

  const players = page.locator('#players')
  for (const id of ['john', 'joe'] as const) {
    const person = people[id]
    const card = players.getByRole('article', { name: person.name })
    await expect(card.getByRole('img', { name: person.avatar.alt })).toBeVisible()
    await expect(card).toContainText(person.line)
    await expect(card).toContainText(person.initials)
    await expect(card.getByRole('link')).toHaveCount(1)
    await expect(card.getByRole('link', { name: new RegExp(`${person.firstName}’s page`) })).toHaveAttribute('href', person.page)
  }
  await players.getByRole('link', { name: /Joe’s page/ }).click()
  await expect(page).toHaveURL(/\/joe$/)
  await page.goBack()

  await expect(players.getByText(home.players.origin)).toBeVisible()
})

test('featured work links to the real thing and tags each card with its owner', async ({ page }) => {
  const cards = page.locator('#work .featured-card')
  const items = featuredItems()
  await expect(cards).toHaveCount(items.length)
  for (const [index, { item }] of items.entries()) {
    const card = cards.nth(index)
    await expect(card.getByRole('heading', { level: 3 })).toContainText(item.name)
    await expect(card.locator('.owner-tag')).toContainText(people[item.owner].initials)
    await expect(card.locator('.owner-tag')).toContainText(people[item.owner].firstName)
    if (item.url) {
      const link = card.getByRole('link', { name: new RegExp(item.name) })
      await expect(link).toHaveAttribute('href', item.url)
      await expect(link).toHaveAttribute('target', '_blank')
    }
  }
})

test('the games strip links every game to its card on /games', async ({ page }) => {
  const strip = page.locator('#games')
  const links = strip.locator('.mini-cart-link')
  await expect(links).toHaveCount(games.length)
  for (const [index, game] of games.entries()) {
    await expect(links.nth(index)).toHaveAttribute('href', `/games#${game.id}`)
    await expect(links.nth(index)).toContainText(game.name)
    await expect(links.nth(index)).toContainText(game.status)
  }
  await links.nth(2).click()
  await expect(page).toHaveURL(new RegExp(`/games#${games[2].id}$`))
  await expect(page.locator(`#${games[2].id}`)).toBeInViewport()
})

test('the lab teaser and contact lead somewhere real', async ({ page }) => {
  await expect(page.getByRole('link', { name: new RegExp(home.lab.link) })).toHaveAttribute('href', '/lab')
  const contact = page.locator('#contact')
  await expect(contact.getByRole('link', { name: site.email, exact: true })).toHaveAttribute('href', `mailto:${site.email}`)
  await expect(contact.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', site.github)
})

test('Organization JSON-LD names both founders by stable @id', async ({ page }) => {
  const nodes = await jsonLdNodes(page)
  const org = nodes.find((node) => node['@type'] === 'Organization')
  expect(org).toMatchObject({
    '@id': 'https://18hrshift.com/#org',
    name: site.name,
    url: site.url,
    founder: [{ '@id': 'https://18hrshift.com/john#person' }, { '@id': 'https://18hrshift.com/joe#person' }],
    sameAs: [site.github],
  })
  for (const id of ['john', 'joe'] as const) {
    expect(nodes.find((node) => node['@id'] === `https://18hrshift.com/${id}#person`)).toMatchObject({
      '@type': 'Person',
      name: people[id].name,
      url: `https://18hrshift.com/${id}`,
      worksFor: { '@id': 'https://18hrshift.com/#org' },
    })
  }
})

test('the tag ticker scrolls, and its checkbox pauses it without JavaScript state', async ({ page }) => {
  const track = page.locator('.ticker-track').first()
  await expect(track.locator('li')).toHaveText([...home.tags])
  const playState = () => track.evaluate((el) => getComputedStyle(el).animationPlayState)
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe('ticker')
  await page.mouse.move(0, 0)
  expect(await playState()).toBe('running')
  await page.getByText(home.tickerPause).click()
  await page.mouse.move(0, 0)
  await expect(page.locator('#ticker-pause')).toBeChecked()
  expect(await playState()).toBe('paused')
})

test('the origin story shows the photo of the two of them, stripped of metadata', async ({ page }) => {
  const photo = home.players.originPhoto
  const origin = page.locator('#players .origin')
  await expect(origin.getByRole('img', { name: photo.alt })).toBeVisible()
  await expect(origin.locator('figcaption')).toHaveText(photo.caption)

  // The served file carries no EXIF (camera, time, GPS), color profile, XMP or IPTC block.
  const bytes = readFileSync(join(process.cwd(), 'public', photo.src)).toString('latin1')
  for (const marker of ['Exif\0\0', 'ICC_PROFILE', 'http://ns.adobe.com/xap', 'Photoshop 3.0']) expect(bytes).not.toContain(marker)
})
