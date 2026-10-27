import { test, expect } from '@playwright/test'
import { gamesBy } from '@/config/games'
import { ideasBy } from '@/config/ideas'
import { people } from '@/config/people'
import { projectById, systems } from '@/config/projects'
import { profilePages, site } from '@/config/site'
import { expectIdeaPile, expectProfileHeader, jsonLdNodes } from './helpers'

const john = people.john
const sections = profilePages.john.sections
const section = (id: string) => sections.find((item) => item.id === id)!

test.beforeEach(async ({ page }) => {
  await page.goto('/john', { waitUntil: 'networkidle' })
})

test('the profile shows his avatar, photo, bio sections, hot take and links', async ({ page }) => {
  await expectProfileHeader(page, john)
})

test('his work sections come from the shared config', async ({ page }) => {
  for (const id of ['show', 'platform']) {
    const config = section(id)
    if (config.kind !== 'projects') throw new Error(`${id} should list projects`)
    const region = page.getByRole('region', { name: config.title })
    for (const projectId of config.projects) {
      const project = projectById(projectId)
      await expect(region.getByRole('heading', { level: 3 })).toHaveText(project.name)
      await expect(region.getByText(project.story)).toBeVisible()
      if (project.status) await expect(region.getByText(project.status, { exact: true })).toBeVisible()
      await expect(region.getByRole('link', { name: new RegExp(project.linkLabel!) })).toHaveAttribute('href', project.url!)
    }
  }
  const ideas = section('ideas')
  if (ideas.kind !== 'ideas') throw new Error('ideas should be the idea pile')
  const ideasRegion = page.getByRole('region', { name: ideas.title })
  for (const projectId of ideas.lead ?? []) {
    const project = projectById(projectId)
    const article = ideasRegion.getByRole('article', { name: project.name })
    await expect(article.getByText(project.story)).toBeVisible()
    await expect(article.getByText(project.status!, { exact: true })).toBeVisible()
    await expect(article.getByRole('link', { name: new RegExp(project.linkLabel!) })).toHaveAttribute('href', project.url!)
  }
  await expectIdeaPile(ideasRegion, ideasBy(john.id), john.firstName)

  const gamesRegion = page.getByRole('region', { name: section('games').title })
  const theirGames = gamesBy(john.id)
  await expect(gamesRegion.getByRole('link')).toHaveCount(theirGames.length)
  for (const game of theirGames) await expect(gamesRegion.getByRole('link', { name: new RegExp(game.name) })).toHaveAttribute('href', `/games#${game.id}`)
})

test('the systems case studies open as dialogs here too', async ({ page }) => {
  const region = page.getByRole('region', { name: section('systems').title })
  for (const system of systems) {
    const button = region.getByRole('button', { name: `Explore ${system.name}` })
    await button.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByRole('heading', { name: system.name, exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(button).toBeFocused()
  }
})

test('ProfilePage and Person JSON-LD tie John to the organization', async ({ page }) => {
  const nodes = await jsonLdNodes(page)
  expect(nodes.find((node) => node['@type'] === 'ProfilePage')).toMatchObject({
    url: 'https://18hrshift.com/john',
    mainEntity: { '@id': 'https://18hrshift.com/john#person' },
  })
  expect(nodes.find((node) => node['@type'] === 'Person')).toMatchObject({
    '@id': 'https://18hrshift.com/john#person',
    name: john.name,
    url: 'https://18hrshift.com/john',
    image: `${site.url}${john.photo!.src}`,
    worksFor: { '@id': 'https://18hrshift.com/#org' },
    sameAs: john.links.map((link) => link.href),
    knowsAbout: ['Economics', 'AI agents', 'Automation', 'Infrastructure', 'Podcast production'],
  })
})
