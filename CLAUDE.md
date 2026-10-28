@AGENTS.md

# 18HRSHIFT site

Relaunched October 27, 2026 as the joint portfolio of John Byrnes and Joe Lanellotti. See README.md for setup, structure and verification.

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, raw Three.js.
- Read the installed Next.js guides before changing framework behavior.
- Routes: `/` (home sections in `components/home/`), `/games`, `/lab`, `/side-quests`, `/john` and `/joe`. `/blog` belongs to the separate blog app (`18hrshift/18hrshift-blog`), proxied by `next.config.ts` from `config/blog-zone.ts`; keep rewrite caching off for it. Both profiles render `components/people/ProfilePage.tsx`; a person's sections are listed in `profilePages` in `config/site.ts`.
- `config/site.ts`, `config/people.ts`, `config/games.ts`, `config/projects.ts`, `config/ideas.ts` and `config/lab.ts` own all content. Components read config; don't type copy, links or paths into components or duplicate config values.
- Idea pile pitches (Side quests on the site) describe what actually got built, and the stage stays honest. No private hosts, client names or other people's data in them.
- Player stats render only when they have a value. Avatar paths live in one `config/people.ts` entry each so a swap is one line.
- Fonts: Barlow Condensed for display, Barlow for body, JetBrains Mono for labels.
- Shared color tokens live in `app/globals.css`; feature styles in `styles/`. Use the tokens in components. Three.js and the share images read the token values.
- `LabScene` is dynamically loaded with `ssr: false` inside client components. Dispose renderer resources, respect reduced motion, and stop offscreen/background render loops. React Strict Mode reuses the canvas: do not force context loss during effect replay cleanup.
- Core content renders without JS. Prefer native links, buttons and dialog semantics. Keep visible focus and the native pointer; do not add a custom cursor or scroll hijacking. Moving decoration needs a pause and a static reduced-motion state.
- Descriptions must match real work; keep prototype and development labels. Game copy comes from each game's README and status docs. Do not publish private endpoints, account details, credentials, topology or unsupported outcome/scale claims. No em dashes in copy.
- Public images: `public/games/` (gameplay captures), `public/projects/` (brand art and site captures), `public/people/`, `public/lab/`, and the lettermark source in `public/assets/`. Label captures as captures; distinguish them from illustrations. Refresh captures with `npm run capture:sites`.
- `npm run lint`, `bash test.sh`, and `npm run test:e2e` are required for substantive changes. Browser tests need a production build and Chromium.
- The Vercel project is `18hrshift-site`. Deploy with the Vercel CLI; a push does not deploy. Previews are `vercel deploy`; production needs explicit approval. Verify owner, target and alias.
