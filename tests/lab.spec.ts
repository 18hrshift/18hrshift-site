import { test, expect } from '@playwright/test'
import { labCopy, labDefaults } from '@/config/lab'
import { systems } from '@/config/projects'
import { home } from '@/config/site'

test('the lab renders three different scenes and responds to its controls', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto('/lab', { waitUntil: 'networkidle' })
  const lab = page.locator('#lab')
  const scene = lab.locator('.lab-scene')
  await scene.scrollIntoViewIfNeeded()
  await expect(scene).toHaveAttribute('data-scene-status', 'ready')
  await lab.getByRole('button', { name: labCopy.pause, exact: true }).click()
  await expect(lab.getByRole('button', { name: labCopy.play, exact: true })).toBeVisible()
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
  await lab.getByRole('button', { name: new RegExp(labCopy.burst) }).click()
  expect((await canvas.screenshot()).equals(calm)).toBe(false)
  await lab.getByRole('button', { name: /Future terrain/ }).click()
  await expect(scene).toHaveAttribute('data-scene-mode', 'terrain')
  expect((await canvas.screenshot()).equals(particles)).toBe(false)
  await lab.getByRole('button', { name: labCopy.reset, exact: true }).click()
  await expect(scene).toHaveAttribute('data-scene-mode', labDefaults.mode)
  await expect(energy).toHaveValue(String(Math.round(labDefaults.energy * 100)))
  await expect(lab.getByRole('button', { name: labCopy.pause, exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('system case studies open, trap focus, close and restore focus', async ({ page }) => {
  await page.goto('/lab', { waitUntil: 'networkidle' })
  const section = page.locator('#systems')
  await expect(section.getByRole('button', { name: /^Explore / })).toHaveCount(systems.length)
  for (const system of systems) {
    const button = section.getByRole('button', { name: `Explore ${system.name}`, exact: true })
    await button.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByRole('heading', { name: system.name, exact: true })).toBeVisible()
    await expect(dialog.getByRole('heading', { name: 'What we built' })).toBeVisible()
    for (const feature of system.features ?? []) await expect(dialog.getByText(feature)).toBeVisible()
    await expect(dialog.getByText(system.status!, { exact: true })).toBeVisible()
    await page.keyboard.press('Shift+Tab')
    // Native dialogs may move focus to browser chrome; background page controls stay inert.
    expect(await dialog.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body)).toBe(true)
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()
    await expect(button).toBeFocused()
  }
})

test('reduced motion starts the lab still and keeps the ticker static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/lab', { waitUntil: 'networkidle' })
  const lab = page.locator('#lab')
  await expect(lab.locator('.lab-scene')).toHaveAttribute('data-scene-status', 'ready')
  await expect(lab.getByText(labCopy.reducedMotionNote)).toBeVisible()
  await expect(lab.getByRole('button', { name: labCopy.play, exact: true })).toBeVisible()
  await lab.getByRole('button', { name: labCopy.play, exact: true }).click()
  await expect(lab.getByRole('button', { name: labCopy.pause, exact: true })).toBeVisible()
  await lab.getByRole('button', { name: labCopy.reset, exact: true }).click()
  await expect(lab.getByRole('button', { name: labCopy.play, exact: true })).toBeVisible()

  await page.goto('/', { waitUntil: 'networkidle' })
  const track = page.locator('.ticker-track').first()
  expect(await track.evaluate((el) => getComputedStyle(el).animationName)).toBe('none')
  await expect(page.locator('.ticker-track--echo')).toBeHidden()
  await expect(page.getByText(home.tickerPause)).toBeHidden()
  for (const tag of home.tags) await expect(track.getByText(tag, { exact: true })).toBeVisible()
})

test('WebGL failure gives a usable, honest fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return Reflect.apply(original, this, [type, ...args])
    } as typeof original
  })
  await page.goto('/lab', { waitUntil: 'networkidle' })
  const lab = page.locator('#lab')
  await expect(lab.locator('.lab-scene')).toHaveAttribute('data-scene-status', 'unavailable')
  await expect(lab.locator('.lab-scene').getByRole('status')).toHaveText(labCopy.unavailable)
  await expect(lab.getByRole('button', { name: new RegExp(labCopy.burst) })).toBeDisabled()
  await expect(lab.locator('canvas')).toHaveAttribute('aria-hidden', 'true')
  await expect(page.locator('#systems').getByRole('button', { name: `Explore ${systems[0].name}` })).toBeEnabled()
})
