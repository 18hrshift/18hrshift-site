import { test, expect } from '@playwright/test'
import { lettermarkPaths, lettermarkSilhouette } from '@/components/brand/Lettermark'

// The hero sticker draws its fill and shadow from the lettermark's own outer contour,
// so their edges line up with the outline at any size. These checks pin that the
// silhouette is that contour, and that the page draws the sticker as one vector with
// no raster mask and no decorative ring behind it.

test('the silhouette is the outline path’s first closed subpath', () => {
  const outline = lettermarkPaths[0]
  expect(outline.startsWith(lettermarkSilhouette)).toBe(true)
  expect(lettermarkSilhouette.startsWith('M')).toBe(true)
  expect(lettermarkSilhouette.endsWith('Z')).toBe(true)
  expect(lettermarkSilhouette.match(/[Zz]/g)).toHaveLength(1)
  // The rest of the outline is the letter holes, each its own subpath.
  expect(outline.slice(lettermarkSilhouette.length).startsWith('M')).toBe(true)
})

test('the hero sticker is one vector: shadow, fill, outline and edge', async ({ page }) => {
  const rasterMasks: string[] = []
  page.on('request', (request) => { if (/silhouette/.test(request.url())) rasterMasks.push(request.url()) })
  await page.goto('/', { waitUntil: 'networkidle' })

  const sticker = page.locator('.hero-mark svg.hero-sticker')
  await expect(sticker).toBeVisible()
  await expect(sticker.locator('.sticker-shadow')).toHaveAttribute('d', lettermarkSilhouette)
  await expect(sticker.locator('.sticker-fill')).toHaveAttribute('d', lettermarkSilhouette)
  await expect(sticker.locator('.sticker-outline > path:not(.sticker-edge)')).toHaveCount(lettermarkPaths.length)
  await expect(sticker.locator('.sticker-edge')).toHaveCSS('fill', 'none')
  expect(rasterMasks).toEqual([])

  const ring = await page.locator('.hero-mark').evaluate((el) => getComputedStyle(el, '::before').content)
  expect(ring).toBe('none')
})
