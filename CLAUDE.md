@AGENTS.md

# 18HRSHIFT site

Current implementation updated September 26, 2026. See README.md for setup and verification.

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, raw Three.js.
- Read the installed Next.js guides before changing framework behavior.
- `app/page.tsx` assembles Hero, Studio, Portfolio, Lab, Universe, contact and footer.
- `config/site.ts`, `config/projects.ts` and `config/lab.ts` own their shared content.
- Fonts: Barlow Condensed for display, Barlow for body, JetBrains Mono for labels.
- Shared color tokens live in `app/globals.css`; feature styles in `styles/`. Use the tokens in components. Three.js reads CSS color variables.
- `LabScene` is dynamically loaded with `ssr: false` inside client components. Dispose renderer resources, respect reduced motion, and stop offscreen/background render loops. React Strict Mode reuses the canvas: do not force context loss during effect replay cleanup.
- Core content renders without JavaScript. Prefer native links, buttons and dialog semantics. Keep visible focus and the native pointer; do not add a custom cursor or scroll hijacking.
- Portfolio descriptions must match real work. Preserve prototype/development labels where applicable. Do not publish private endpoints, account details, credentials, topology or unsupported outcome/scale claims.
- Public artwork is in `public/projects/`; distinguish product captures from illustrations.
- `npm run lint`, `bash test.sh`, and `npm run test:e2e` are required for substantive changes. Browser tests need a production build and Chromium.
- The existing Vercel project is `18hrshift-site`; pushing `main` deploys production. Verify owner and target before delivery.
