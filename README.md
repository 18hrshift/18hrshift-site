# 18HRSHIFT

The joint portfolio and launch pad of John Byrnes and Joe Lanellotti: their games, platforms, side projects, an interactive Three.js lab and the systems they run. Nothing is for sale; collaborators are welcome.

## Run locally

```bash
npm ci
npm run dev -- --port 3318
```

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 and Three.js. Every page is statically rendered; the lab scene loads in the browser. No application credentials or paid API calls are needed.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Hero, the tag ticker, the P1/P2 character select with the origin story and player stats, featured work (each card tagged with whose it is), the games strip, a lab teaser and "Build with us" contact |
| `/games` | Every game as a cartridge card: genre, owner, a real gameplay capture, an honest one-line description, status and a play link. An empty slot is held for more of Joe's games |
| `/lab` | The Three.js lab (liquid chrome, particle field, terrain) with its controls, then the systems case studies (Bedrock SQL, OpenWrt network, home lab) in native dialogs |
| `/ideas` | The idea pile: half-built games, shelved apps and napkin sketches as index cards, one pile per person, with a legend for how far each one got |
| `/john`, `/joe` | Player profiles from one template (`components/people/ProfilePage.tsx`): avatar, photo when there is one, bio, stats, links, then the sections listed for that person, ending with their idea pile |

Each route has its own title, description, canonical URL and generated share image (`opengraph-image.tsx` in its folder, drawn by `lib/og.tsx`). `app/sitemap.ts` and `app/robots.ts` cover the routes. JSON-LD (`lib/structured-data.ts`) puts an Organization with the stable `@id` `https://18hrshift.com/#org` on `/`, with both founders as Person `@id`s, and a ProfilePage plus Person (`worksFor` the organization) on each profile.

## Content lives in config

Components read these files; no copy, link or path is typed anywhere else.

- `config/site.ts`: identity, navigation (the player links come from `config/people.ts`), contact, and the copy for every page: home sections and featured items, the games page, the lab page, project labels and the profile page sections for each person.
- `config/people.ts`: John and Joe. Name, slot, page, card line, avatar, optional photo, bio sections, pull quote, links (also their JSON-LD `sameAs`), `knowsAbout` and player stats. A stat is one answer or a short list (shown comma-separated under the plural label). Only stats with a value render, and the block disappears when none do. To swap an avatar, change its `avatar.src`; the art and its generators are in `assets/avatars/` on `main`.
- `config/games.ts`: every game with its owner, genre, honest line, status, URL, accent and gameplay capture. Copy and status come from each game's own README and status docs.
- `config/projects.ts`: everything that isn't a game. Platforms, the podcast, ideas, Joe's projects and the systems. Systems (`kind: 'System'`) appear on both `/lab` and John's profile from the same entries. Projects with a live site carry a `capture`.
- `config/lab.ts`: the three experiments, their defaults and the lab's labels.
- `config/ideas.ts`: the idea pile. Each idea has an owner, a kind, a stage (`Napkin`, `Prototype`, `Playable`, `Working`, `Shelved`, explained by `ideaStages`) and a pitch that describes what actually got built. A link only for a public page. `/ideas` shows every pile; a profile shows its owner's pile through a `kind: 'ideas'` section in `config/site.ts`, after any `lead` projects (Embersave on John's).

Status labels must stay honest: prototypes stay prototypes, and projects without a public site have no link. Don't publish private endpoints, account details, credentials, network topology or unsupported outcome or scale claims. No em dashes in copy; `tests/layout.spec.ts` checks every page.

## Code layout

- `app/`: routes, metadata, share images, sitemap, robots, 404. `app/globals.css` holds the color tokens and shared layout.
- `components/home/`: the home sections. `components/people/`: player card, stats and the profile template. `components/games/`: cartridge, mini cartridge and the empty slot. `components/projects/`: artwork, details, dialog, inline feature and the systems list. `components/lab/`: the lab workbench and Three.js scene. `components/ui/primitives.tsx`: shared tags, headings, links, the equalizer motif and the JSON-LD script. `components/brand/Lettermark.tsx`: the 18hr lettermark, its silhouette (the outline's outer contour, derived in code) and the hero sticker drawn from both.
- `lib/`: metadata, structured data, share images and small config readers.
- `styles/`: `home.css`, `people.css`, `games.css`, `projects.css` and `lab.css`.

## Images

- `public/games/`: gameplay captures of each live game (1440x900 WebP), taken with Playwright by `npm run capture:sites`. Alt text starts "Gameplay capture:" and each card labels its image the same way.
- `public/projects/`: Embersave and Hairraiser brand art; `power-hour-club.webp` and `nybec.webp` are captures of those live sites, labelled "Site capture". The podcast, Marginalia, the Ouran fan translation and the systems art are illustrations drawn in code.
- `public/people/`: avatars and John's photo. The avatars are the round 7 neon pair (`assets/avatars/final/pair-booth-yy.png`), cut into transparent 640px squares by `assets/avatars/crop_avatars.py`. `assets/avatars/README.md` has the generators, the edit script for tweaks and the 1000px PFPs.
- `public/lab/liquid-chrome.webp`: a still of the liquid chrome scene captured from `/lab`, used by the home teaser.

To refresh captures, run `npm run capture:sites` (or name ids: `npm run capture:sites -- sorter nybec`). Each game has a short click path in the script that gets past its menus into play. Look at the results before committing; live sites change.

## Design

Dark tokens with a lime accent, plus blue, orange and magenta. Barlow Condensed for display, Barlow for body, JetBrains Mono for labels. The identity is internet native, AI native, gamer, creative and music, with two orchestrated moments: the character select (selection brackets snap in on hover or focus) and the tag ticker. Games are cartridges; a small equalizer is the music motif.

- Core content renders without JavaScript. Links and buttons are native, focus is visible and the pointer is the browser's own.
- The ticker pauses on hover or with its "Pause motion" checkbox (no JavaScript needed) and is a static row under reduced motion. Equalizer bars play a few beats and rest. The lab starts paused under reduced motion and stops drawing offscreen or in hidden tabs, and disposes its Three.js resources.
- No page overflows horizontally from 320 to 1440px.

## Verification

```bash
npm run lint
bash test.sh
npx playwright install chromium
npm run test:e2e
```

`test.sh` runs TypeScript and a production build. Browser tests start that build on port 3320 and cover the home sections and JSON-LD, the ticker pause, every game card and capture, the empty slot, both profiles (bio, stats, links, project links, games, idea piles, systems dialogs, JSON-LD), the idea pile page and its legend, the lab scenes and controls, system dialogs with focus handling, reduced motion, unsupported WebGL, mobile navigation, 320 to 1440px overflow on every page, core content without JavaScript, per-page metadata and share images, the sitemap and robots, and em dashes. `tests/player-stats.spec.ts` checks that empty stats are dropped, lists take the plural label, and filled ones render. `tests/ideas.spec.ts` checks every idea's owner, stage, id and pitch. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium, or `PLAYWRIGHT_BASE_URL` to test a running server. Test artifacts are ignored by Git.

## Delivery

The repository is bound to the existing `18hrshift-site` Vercel project. Deploy with the Vercel CLI from a checkout linked to that project (`.vercel/project.json`, gitignored): `vercel deploy` for a preview, `vercel deploy --prod` only for an approved production release. Do not assume a Git push deploys anything. Verify the project, target and alias after every deploy.
