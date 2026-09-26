import { test, expect } from '@playwright/test'

const projectNames = ['Embersave', 'Specter 1-1', 'Hairraiser', 'Openwater', 'Bedrock SQL', 'OpenWrt network', 'The home lab']

test('real portfolio stories open, trap focus, close, and filter by discipline', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' })
  const work = page.locator('#work')
  await work.scrollIntoViewIfNeeded()
  for (const name of projectNames) {
    const card = work.getByRole('button', { name: `Explore ${name}`, exact: true })
    await card.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name, exact: true })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'What we built' })).toBeVisible()
    await page.keyboard.press('Shift+Tab')
    // Native dialogs may move focus to browser chrome; background page controls stay inert.
    expect(await dialog.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(card).toBeFocused()
  }
  await work.getByRole('button', { name: 'Systems', exact: true }).click()
  await expect(work.getByRole('button', { name: /^Explore / })).toHaveCount(3)
  await expect(work.getByRole('button', { name: 'Explore Embersave', exact: true })).toHaveCount(0)
  await work.getByRole('button', { name: 'Games', exact: true }).click()
  await expect(work.getByRole('button', { name: /^Explore / })).toHaveCount(2)
  await work.getByRole('button', { name: 'All', exact: true }).click()
  await expect(work.getByRole('button', { name: /^Explore / })).toHaveCount(7)
})

test('the lab renders three different scenes and responds to its controls', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/', { waitUntil: 'networkidle' })
  const lab = page.locator('#lab')
  await lab.scrollIntoViewIfNeeded()
  const scene = lab.locator('.lab-scene')
  await expect(scene).toHaveAttribute('data-scene-status', 'ready')
  await lab.getByRole('button', { name: 'Pause', exact: true }).click()
  await expect(lab.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  const canvas = scene.locator('canvas')
  await page.mouse.move(0, 0)
  await page.waitForTimeout(150)
  const chrome = await canvas.screenshot()
  await page.waitForTimeout(200)
  expect(chrome.equals(await canvas.screenshot())).toBe(true)
  await lab.getByRole('button', { name: /Particle field/ }).click()
  await expect(scene).toHaveAttribute('data-scene-mode', 'swarm')
  const particles = await canvas.screenshot()
  expect(particles.equals(chrome)).toBe(false)
  const energy = lab.getByRole('slider', { name: /Energy/ })
  await energy.fill('95')
  await expect(energy).toHaveValue('95')
  await expect(energy).toHaveAttribute('aria-valuetext', '95 percent')
  const calm = await canvas.screenshot()
  await lab.getByRole('button', { name: /Disturb the field/ }).click()
  expect((await canvas.screenshot()).equals(calm)).toBe(false)
  await lab.getByRole('button', { name: /Future terrain/ }).click()
  await expect(scene).toHaveAttribute('data-scene-mode', 'terrain')
  expect((await canvas.screenshot()).equals(particles)).toBe(false)
  await lab.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(scene).toHaveAttribute('data-scene-mode', 'flux')
  await expect(energy).toHaveValue('55')
  await expect(lab.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('mobile navigation, division teasers, and narrow screens work', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/', { waitUntil: 'networkidle' })
  const menu = page.locator('.menu-toggle')
  await menu.click()
  await expect(menu).toHaveAttribute('aria-expanded', 'true')
  await page.keyboard.press('Escape')
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  await expect(menu).toBeFocused()
  await menu.click()
  await page.getByRole('navigation').getByRole('link', { name: 'Our universe' }).click()
  await expect(menu).toHaveAttribute('aria-expanded', 'false')
  for (const name of ['Media', 'Industries', 'Games']) {
    const toggle = page.getByRole('button', { name: new RegExp(`18HRSHIFT ${name}`) })
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    const panel = page.locator(`#${await toggle.getAttribute('aria-controls')}`)
    await expect(panel).toBeVisible()
    await expect(panel.getByRole('link')).toBeVisible()
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `No horizontal overflow at ${width}px`).toBe(true)
  }
})

test('reduced motion starts still and can be explicitly enabled', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.locator('#hero').getByRole('button', { name: /Resume motion/ })).toBeVisible()
  const lab = page.locator('#lab')
  await lab.scrollIntoViewIfNeeded()
  await expect(lab.locator('.lab-scene')).toHaveAttribute('data-scene-status', 'ready')
  await expect(lab.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  await lab.getByRole('button', { name: 'Play', exact: true }).click()
  await expect(lab.getByRole('button', { name: 'Pause', exact: true })).toBeVisible()
  await lab.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(lab.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
})

test('WebGL failure gives a usable, honest fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return Reflect.apply(original, this, [type, ...args])
    } as typeof original
  })
  await page.goto('/', { waitUntil: 'networkidle' })
  const lab = page.locator('#lab')
  await lab.scrollIntoViewIfNeeded()
  await expect(lab.locator('.lab-scene')).toHaveAttribute('data-scene-status', 'unavailable')
  await expect(lab.getByRole('status').filter({ hasText: 'Static preview' })).toContainText('Static preview')
  await expect(lab.getByRole('button', { name: /Disturb the field/ })).toBeDisabled()
  await expect(lab.locator('canvas')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('#work').getByRole('button', { name: 'Explore Embersave' })).toBeEnabled()
})

test('core content and contact remain available without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  await page.goto('/', { waitUntil: 'networkidle' })
  await expect(page.getByRole('heading', { level: 1 })).toContainText('IDEAS DON’T')
  for (const name of projectNames) await expect(page.locator('#work').getByRole('button', { name: `Explore ${name}`, exact: true })).toBeVisible()
  await expect(page.locator('#contact').getByRole('link', { name: /admin@18hrshift.com/ }).last()).toHaveAttribute('href', 'mailto:admin@18hrshift.com')
  await context.close()
})
