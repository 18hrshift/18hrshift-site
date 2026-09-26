import { defineConfig } from '@playwright/test'

const externalURL = process.env.PLAYWRIGHT_BASE_URL

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: 'list',
  use: {
    baseURL: externalURL || 'http://127.0.0.1:3320',
    viewport: { width: 1440, height: 1000 },
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: externalURL ? undefined : {
    command: 'npm run start -- --hostname 127.0.0.1 --port 3320',
    url: 'http://127.0.0.1:3320',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
