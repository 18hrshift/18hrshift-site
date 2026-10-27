#!/usr/bin/env node
// Capture every live site the config shows a picture of: real gameplay for each
// game in config/games.ts, and the live site for each project in config/projects.ts
// that has a `capture`. Each is saved as an optimized WebP at its `capture.src`
// under public/.
//
//   npm run capture:sites              # everything
//   npm run capture:sites -- sorter    # just the ids you name
//
// Each game gets a short click path from its landing screen into actual play.
// A game without a path is captured as it first loads, with a warning; project
// sites are captured as they load. A failed path stops that capture and the
// script exits non-zero; existing files are only replaced by a successful capture.

import { join } from 'node:path'
import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { games } from '../config/games.ts'
import { projects } from '../config/projects.ts'

const viewport = { width: 1440, height: 900 }
const quality = 72
const root = new URL('..', import.meta.url).pathname

const button = (page, name) => page.getByRole('button', { name }).first()

const paths = {
  'exponential-dead': async (page) => {
    await button(page, /New Game/).click()
    await page.waitForTimeout(5000)
    await button(page, /Begin expedition/).click()
    await page.waitForTimeout(3000)
    await button(page, /Verdant March/).click()
    await page.waitForTimeout(3000)
    await button(page, /Depart for/).click()
    await page.waitForTimeout(3000)
  },
  'ruff-n-tumble': async (page) => {
    await page.waitForTimeout(4000)
  },
  specter: async (page) => {
    await page.getByText('NEW OPERATION').click()
    await page.waitForTimeout(3000)
    await page.getByText('DEPLOY').nth(2).click()
    await page.waitForTimeout(3000)
    await page.getByText('ESCORT').first().click()
    await page.waitForTimeout(2000)
    await page.getByText('START MISSION').click()
    await page.waitForTimeout(12000)
  },
  'fourth-and-chalk': async (page) => {
    await button(page, /Play Week 1/).click()
    await page.waitForTimeout(4000)
    await button(page, /Receive/).click()
    await page.waitForTimeout(5000)
  },
  flagged: async (page) => {
    await page.getByRole('link', { name: /Today/ }).first().click()
    await page.waitForTimeout(4000)
  },
  gasguesser: async (page) => {
    await page.waitForTimeout(3000)
  },
  // Dismiss the site's "update ready" prompt if a fresh visit shows one.
  'power-hour-club': async (page) => {
    const later = button(page, /^Later$/)
    if (await later.isVisible()) await later.click()
    await page.waitForTimeout(1000)
  },
  spotslop: async (page) => {
    await button(page, /Play today/).click()
    await page.waitForTimeout(3000)
  },
  sorter: async (page) => {
    await page.getByRole('link', { name: /Start ranking/ }).or(page.getByRole('button', { name: /Start ranking/ })).first().click()
    await page.waitForTimeout(3000)
    await button(page, /Start comparing/).click()
    await page.waitForTimeout(3000)
  },
}

// A fixed seed keeps the 4th & Chalk run (and its opening hand) the same between captures.
const startUrl = { 'fourth-and-chalk': (url) => `${url}/?seed=7` }

const targets = [
  ...games.map((game) => ({ ...game, kind: 'game' })),
  ...projects.filter((project) => project.capture && project.url).map((project) => ({ ...project, kind: 'project' })),
]

const wanted = process.argv.slice(2)
const unknown = wanted.filter((id) => !targets.some((target) => target.id === id))
if (unknown.length) {
  console.error(`Unknown id(s): ${unknown.join(', ')}`)
  process.exit(1)
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
})
let failed = 0
for (const target of targets) {
  if (wanted.length && !wanted.includes(target.id)) continue
  const page = await browser.newPage({ viewport })
  try {
    await page.goto(startUrl[target.id]?.(target.url) ?? target.url, { waitUntil: 'load', timeout: 60_000 })
    await page.waitForTimeout(5000)
    const path = paths[target.id]
    if (path) await path(page)
    else if (target.kind === 'game') console.warn(`${target.id}: no click path, capturing the landing screen`)
    const png = await page.screenshot()
    const dest = join(root, 'public', target.capture.src)
    const info = await sharp(png).resize(target.capture.width, target.capture.height).webp({ quality }).toFile(dest)
    console.log(`${target.id}: ${dest} (${Math.round(info.size / 1024)} KB)`)
  } catch (error) {
    failed++
    console.error(`${target.id}: capture failed: ${error.message.split('\n')[0]}`)
  }
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
