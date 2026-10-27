import { test, expect } from '@playwright/test'
import { ideas, ideasBy, ideaStages } from '@/config/ideas'
import { people, playerOrder } from '@/config/people'
import { home, ideasPage } from '@/config/site'
import { expectIdeaPile } from './helpers'

test('every idea has a known owner, a unique id and no em dashes in its pitch', () => {
  expect(new Set(ideas.map((idea) => idea.id)).size).toBe(ideas.length)
  for (const idea of ideas) {
    expect(Object.keys(people), idea.id).toContain(idea.owner)
    expect(Object.keys(ideaStages), idea.id).toContain(idea.stage)
    expect(idea.pitch, idea.id).not.toMatch(/—/)
    if (idea.url) expect(idea.url, idea.id).toMatch(/^https:\/\//)
  }
})

test('the pile page shows the stage legend and both piles', async ({ page }) => {
  await page.goto(ideasPage.path, { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText(ideasPage.title.join(''))
  for (const [stage, meaning] of Object.entries(ideaStages)) {
    await expect(page.locator('.idea-legend').getByText(meaning, { exact: true })).toBeVisible()
    await expect(page.locator('.idea-legend dt', { hasText: stage })).toBeVisible()
  }
  for (const id of playerOrder) {
    const person = people[id]
    const heading = page.getByRole('heading', { level: 2, name: ideasPage.pileTitle(person.firstName) })
    await expect(heading.getByRole('link')).toHaveAttribute('href', person.page)
    await expectIdeaPile(page, ideasBy(id), person.firstName)
  }
})

test('the nav and the contact section lead to the pile', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Ideas' })).toHaveAttribute('href', ideasPage.path)
  await expect(page.locator('#contact').getByRole('link', { name: home.contact.pileLink.label })).toHaveAttribute('href', ideasPage.path)
})
