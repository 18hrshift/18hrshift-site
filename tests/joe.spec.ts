import { test, expect } from '@playwright/test'
import { gamesBy } from '@/config/games'
import { ideasBy } from '@/config/ideas'
import { people } from '@/config/people'
import { projectById } from '@/config/projects'
import { ideasPage, profilePages } from '@/config/site'
import { expectIdeaPile, expectProfileHeader, jsonLdNodes } from './helpers'

const joe = people.joe

test.beforeEach(async ({ page }) => {
  await page.goto('/joe', { waitUntil: 'networkidle' })
})

test('the profile shows his avatar, bio and stats, with no photo or links yet', async ({ page }) => {
  await expectProfileHeader(page, joe)
  await expect(page.locator('.profile .player-stats')).toBeVisible()
  await expect(page.locator('.profile-links')).toHaveCount(0)
})

test('his projects link out only where a live site exists', async ({ page }) => {
  for (const section of profilePages.joe.sections) {
    if (section.kind !== 'projects') continue
    const region = page.getByRole('region', { name: section.title })
    for (const id of section.projects) {
      const project = projectById(id)
      const article = region.getByRole('article', { name: project.name })
      await expect(article.getByText(project.story)).toBeVisible()
      await expect(article.getByText(project.status!, { exact: true })).toBeVisible()
      for (const feature of project.features ?? []) await expect(article.getByText(feature, { exact: true })).toBeVisible()
      if (project.url) {
        await expect(article.getByRole('link', { name: new RegExp(project.linkLabel!) })).toHaveAttribute('href', project.url)
        const capture = article.getByRole('img', { name: project.capture!.alt })
        await expect(capture).toBeVisible()
        expect(await capture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0), `${project.name} capture loads`).toBe(true)
      } else {
        await expect(article.getByRole('link')).toHaveCount(0)
      }
    }
  }
  await expect(page.getByRole('link', { name: /NYBEC/ })).toHaveAttribute('href', 'https://nybec.com')
})

test('his games link to their cabinet cards', async ({ page }) => {
  const gamesSection = profilePages.joe.sections.find((section) => section.kind === 'games')!
  const region = page.getByRole('region', { name: gamesSection.title })
  const theirGames = gamesBy(joe.id)
  expect(theirGames.length).toBeGreaterThan(0)
  await expect(region.getByRole('link')).toHaveCount(theirGames.length)
  for (const game of theirGames) await expect(region.getByRole('link', { name: new RegExp(game.name) })).toHaveAttribute('href', `/games#${game.id}`)
})

test('his idea pile shows every idea from config', async ({ page }) => {
  const ideasSection = profilePages.joe.sections.find((section) => section.kind === 'ideas')!
  const region = page.getByRole('region', { name: ideasSection.title })
  await expectIdeaPile(region, ideasBy(joe.id), joe.firstName)
  await expect(region.getByRole('link', { name: ideasPage.profileLink })).toHaveAttribute('href', ideasPage.path)
})

test('ProfilePage and Person JSON-LD for Joe', async ({ page }) => {
  const nodes = await jsonLdNodes(page)
  expect(nodes.find((node) => node['@type'] === 'ProfilePage')).toMatchObject({
    url: 'https://18hrshift.com/joe',
    mainEntity: { '@id': 'https://18hrshift.com/joe#person' },
  })
  const person = nodes.find((node) => node['@type'] === 'Person')
  expect(person).toMatchObject({
    '@id': 'https://18hrshift.com/joe#person',
    name: joe.name,
    url: 'https://18hrshift.com/joe',
    worksFor: { '@id': 'https://18hrshift.com/#org' },
  })
  expect(person).not.toHaveProperty('sameAs')
  expect(person).not.toHaveProperty('image')
})
