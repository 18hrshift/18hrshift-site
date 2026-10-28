import { test, expect } from '@playwright/test'
import { blogZone } from '@/config/blog-zone'
import { games } from '@/config/games'
import { people } from '@/config/people'
import { systems } from '@/config/projects'
import { gamesPage, home, labPage, profilePages, site } from '@/config/site'
import { expectNoHorizontalOverflow, routes } from './helpers'

// Next writes the root URL without a trailing slash.
const absolute = (path: string) => (path === '/' ? site.url : new URL(path, site.url).toString())

test('mobile navigation opens, closes with Escape, and marks the current page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  const menu = page.locator('.menu-toggle')
  const nav = page.getByRole('navigation', { name: 'Main navigation' })
  await expect(nav.getByRole('link', { name: 'Games' })).toBeHidden()
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await expect(nav.getByRole('link', { name: 'Games' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
  await menu.click()
  await nav.getByRole('link', { name: 'Games' }).click()
  await expect(page).toHaveURL(/\/games$/)
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await menu.click()
  await expect(nav.getByRole('link', { name: 'Games' })).toHaveAttribute('aria-current', 'page')
  await expect(nav.getByRole('link', { name: 'Lab' })).not.toHaveAttribute('aria-current', 'page')
})

test('no page overflows horizontally from 320 to 1440px', async ({ page }) => {
  for (const path of routes) {
    await page.goto(path, { waitUntil: 'networkidle' })
    await expectNoHorizontalOverflow(page, path)
  }
})

test('core content and links work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()

  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(home.hero.title[0])
  await expect(page.getByText(home.hero.body)).toBeVisible()
  for (const id of ['john', 'joe'] as const) await expect(page.getByRole('heading', { name: people[id].name })).toBeVisible()
  await expect(page.getByText(home.players.origin)).toBeVisible()
  await expect(page.locator('#games .mini-cart-link')).toHaveCount(games.length)
  await expect(page.locator('#contact').getByRole('link', { name: site.email, exact: true })).toHaveAttribute('href', `mailto:${site.email}`)
  const footer = page.getByRole('navigation', { name: 'Footer' })
  for (const item of site.nav) await expect(footer.getByRole('link', { name: item.label, exact: true })).toHaveAttribute('href', item.href)

  await page.goto('/games', { waitUntil: 'networkidle' })
  for (const game of games) await expect(page.getByRole('link', { name: new RegExp(`${gamesPage.play} ${game.name}`) })).toHaveAttribute('href', game.url)

  for (const id of ['john', 'joe'] as const) {
    await page.goto(people[id].page, { waitUntil: 'networkidle' })
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(people[id].name)
    for (const paragraph of people[id].bio.flatMap((part) => part.paragraphs)) await expect(page.getByText(paragraph, { exact: true })).toBeVisible()
  }
  await page.goto('/john', { waitUntil: 'networkidle' })
  await expect(page.getByRole('region', { name: 'His games' }).getByRole('link')).toHaveCount(games.filter((game) => game.owner === 'john').length)

  await page.goto('/lab', { waitUntil: 'networkidle' })
  for (const line of labPage.title) await expect(page.getByRole('heading', { level: 1 })).toContainText(line)
  for (const system of systems) await expect(page.getByRole('button', { name: `Explore ${system.name}` })).toBeVisible()
  await context.close()
})

test('each page has its own title, canonical URL and share image', async ({ page, request }) => {
  const pages = [
    { path: '/', title: home.metaTitle },
    { path: '/games', title: `${gamesPage.metaTitle} | ${site.name}` },
    { path: '/john', title: `${profilePages.john.metaTitle} | ${site.name}` },
    { path: '/joe', title: `${profilePages.joe.metaTitle} | ${site.name}` },
    { path: '/lab', title: `${labPage.metaTitle} | ${site.name}` },
  ]
  for (const { path, title } of pages) {
    await page.goto(path)
    await expect(page).toHaveTitle(title)
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', absolute(path))
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', title)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', absolute(path))
    const image = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(image, `${path} has an og:image`).toBeTruthy()
    // The tag points at production; fetch the same path from the server under test.
    const response = await request.get(new URL(image!).pathname + new URL(image!).search)
    expect(response.ok(), `${path} og:image responds`).toBe(true)
    expect(response.headers()['content-type']).toBe('image/png')
  }
})

test('sitemap lists every page and robots points at it', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of routes) expect(sitemap).toContain(`<loc>${new URL(path, site.url).toString()}</loc>`)
  const robots = await (await request.get('/robots.txt')).text()
  expect(robots).toContain('Allow: /')
  expect(robots).toContain(`Sitemap: ${site.url}/sitemap.xml`)
  expect(robots).toContain(`Sitemap: ${site.url}${blogZone.path}/sitemap.xml`)
})

test('no em dashes in any page copy', async ({ page }) => {
  for (const path of routes) {
    await page.goto(path, { waitUntil: 'networkidle' })
    const text = await page.evaluate(() => document.body.innerText + ' ' + document.title + ' ' + Array.from(document.querySelectorAll('meta[content]'), (meta) => meta.getAttribute('content')).join(' ') + ' ' + Array.from(document.querySelectorAll('img[alt]'), (img) => img.getAttribute('alt')).join(' '))
    expect(text, `${path} has no em dash`).not.toContain('—')
  }
})
