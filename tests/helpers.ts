import { expect, type Page } from '@playwright/test'
import type { Person } from '@/config/people'
import { profileCopy } from '@/config/site'

export const routes = ['/', '/games', '/lab', '/john', '/joe'] as const

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
