import { expect, type Locator, type Page } from '@playwright/test'
import type { Idea } from '@/config/ideas'
import type { Person } from '@/config/people'
import { ideasPage, profileCopy } from '@/config/site'

export const routes = ['/', '/games', '/lab', '/ideas', '/john', '/joe'] as const

// Parse every JSON-LD block on the page and flatten @graph entries into one list.
export async function jsonLdNodes(page: Page): Promise<Record<string, unknown>[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents()
  return blocks.flatMap((text) => {
    const data = JSON.parse(text)
    return data['@graph'] ?? [data]
  })
}

export async function expectNoHorizontalOverflow(page: Page, label: string) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, `${label}: no horizontal overflow at ${width}px`).toBeLessThanOrEqual(0)
  }
}

// The profile header shared by /john and /joe: name, avatar, bio, quote, stats and links.
export async function expectProfileHeader(page: Page, person: Person) {
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(person.name)
  await expect(page.getByRole('img', { name: person.avatar.alt })).toBeVisible()
  if (person.photo) await expect(page.getByRole('img', { name: person.photo.alt })).toBeVisible()
  else await expect(page.locator('.profile-photo')).toHaveCount(0)
  for (const part of person.bio) {
    if (part.title) await expect(page.getByRole('heading', { level: 2, name: part.title, exact: true })).toBeVisible()
    for (const paragraph of part.paragraphs) await expect(page.locator('.profile-bio').getByText(paragraph, { exact: true })).toBeVisible()
  }
  if (person.quote) await expect(page.locator('.profile-quote blockquote')).toHaveText(person.quote)
  else await expect(page.locator('.profile-quote')).toHaveCount(0)
  const links = page.getByRole('list', { name: profileCopy.links }).getByRole('link')
  await expect(links).toHaveCount(person.links.length)
  for (const [index, link] of person.links.entries()) {
    await expect(links.nth(index)).toContainText(link.label)
    await expect(links.nth(index)).toHaveAttribute('href', link.href)
  }
}

// A person's idea pile: one card per idea, in config order, with its kind, stage
// and pitch, and a link only where the idea has a public page.
export async function expectIdeaPile(scope: Locator | Page, ideas: readonly Idea[], firstName: string) {
  const pile = scope.getByRole('list', { name: ideasPage.pileTitle(firstName), exact: true })
  const cards = pile.getByRole('article')
  await expect(cards).toHaveCount(ideas.length)
  for (const [index, idea] of ideas.entries()) {
    const card = cards.nth(index)
    await expect(card.getByRole('heading')).toHaveText(idea.name)
    await expect(card.locator('.idea-card-top')).toContainText(idea.kind)
    await expect(card.locator('.idea-stage')).toHaveText(idea.stage)
    await expect(card.getByText(idea.pitch, { exact: true })).toBeVisible()
    if (idea.url) await expect(card.getByRole('link')).toHaveAttribute('href', idea.url)
    else await expect(card.getByRole('link')).toHaveCount(0)
  }
}
