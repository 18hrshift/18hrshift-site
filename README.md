# 18HRSHIFT

The studio website: a portfolio of real products and systems, an interactive visual lab, and a preview of Games, Media, and Industries.

## Run locally

```bash
npm ci
npm run dev -- --port 3318
```

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and Three.js. The page is statically rendered; the visual lab loads in the browser. No application credentials or paid API calls are needed.

## Content and design

- `config/site.ts`: identity, navigation, contact and social links.
- `config/projects.ts`: all seven portfolio stories, features, availability and public destinations. Remove an entry here to remove it from the gallery and its filters.
- `config/lab.ts`: the three experiments and initial settings.
- `components/sections/Universe.tsx`: Games, Media and Industries teaser content.
- `app/globals.css`: shared design tokens, layout and typography.
- `styles/`: scoped portfolio, lab and universe styles.

The portfolio covers Embersave, Specter 1-1, Hairraiser, Openwater, Bedrock SQL, OpenWrt and the home lab. Status labels distinguish available sites, prototypes, works in development and privately operated systems. Infrastructure copy describes capabilities without publishing operational endpoints, credentials or network topology.

Embersave and Hairraiser artwork uses their existing brand assets. The Specter image is a capture of actual browser gameplay. Openwater's map and the systems diagrams are illustrations, not product screenshots or live telemetry. Keep claims and availability aligned with each project's maintained source documentation.

## Interactions

- Project filters and native modal case studies, with Escape, keyboard focus handling and scroll restoration.
- Liquid chrome, particle field and generative terrain rendered in real time. Energy, disturbance, pause/play and reset controls change the actual scene.
- Independent hero motion control. Both canvases respect reduced motion and stop drawing offscreen or in hidden tabs.
- A static illustration and explanatory message when WebGL is unavailable. The rest of the site remains usable.
- Expandable division teasers and a mobile navigation menu.

## Verification

```bash
npm run lint
bash test.sh
npx playwright install chromium
npm run test:e2e
```

`test.sh` runs TypeScript and a production build. Browser tests launch that production build on port 3320, and cover all seven project dialogs, filters, distinct lab renders, energy/burst/pause/reset, mobile navigation, division panels, 320–1440px overflow, reduced motion, unsupported WebGL and core content without JavaScript. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium binary, or `PLAYWRIGHT_BASE_URL` to test an already running preview. Test artifacts are ignored by Git.

## Delivery

The repository is bound to the existing `18hrshift-site` Vercel project. A push to `main` triggers production deployment. Preview deployments are separate; verify the current project/team binding before publishing. A successful local build is not evidence of a deployment.
