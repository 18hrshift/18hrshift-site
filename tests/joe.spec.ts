import { test, expect } from '@playwright/test'
import { gamesBy } from '@/config/games'
import { people } from '@/config/people'
import { projectById } from '@/config/projects'
import { profilePages } from '@/config/site'
import { expectProfileHeader, jsonLdNodes } from './helpers'

const joe = people.joe

test.beforeEach(async ({ page }) => {
  await page.goto('/joe', { waitUntil: 'networkidle' })
})

test('the profile shows his avatar and intro, with no photo, stats or links yet', async ({ page }) => {
  await expectProfileHeader(page, joe)
  await expect(page.locator('.profile-bio')).toHaveText(joe.bio.flatMap((part) => part.paragraphs).join(''))
  await expect(page.locator('.player-stats')).toHaveCount(0)
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

test('there is no games section while his games are still to come', async ({ page }) => {
  expect(gamesBy(joe.id)).toEqual([])
  await expect(page.locator('.mini-cart-grid')).toHaveCount(0)
  const gamesSection = profilePages.joe.sections.find((section) => section.kind === 'games')!
  await expect(page.getByRole('region', { name: gamesSection.title })).toHaveCount(0)
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
