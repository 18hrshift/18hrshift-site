<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 18HRSHIFT site

This file is the one set of instructions for every coding agent working in this repo (Claude Code reads it through `CLAUDE.md`). `next dev` only rewrites the block between the `nextjs-agent-rules` markers above, so edit everything below freely.

Relaunched October 27, 2026 as the joint portfolio of John Byrnes and Joe Lancellotti. Both of them, and their agents, work in this repo. See README.md for setup, structure and verification.

## Project rules

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, raw Three.js.
- Read the installed Next.js guides before changing framework behavior.
- Routes: `/` (home sections in `components/home/`), `/games`, `/lab`, `/side-quests`, `/john` and `/joe`. `/blog` belongs to the separate blog app (`18hrshift/18hrshift-blog`), proxied by `next.config.ts` from `config/blog-zone.ts`; keep rewrite caching off for it. Link to it (and any other zone) through `SiteLink`, never `next/link`. Both profiles render `components/people/ProfilePage.tsx`; a person's sections are listed in `profilePages` in `config/site.ts`.
- `config/site.ts`, `config/people.ts`, `config/games.ts`, `config/projects.ts`, `config/ideas.ts` and `config/lab.ts` own all content. Components read config; don't type copy, links or paths into components or duplicate config values.
- Idea pile pitches (Side quests on the site) describe what actually got built, and the stage stays honest. No private hosts, client names or other people's data in them.
- Joe's surname is **Lancellotti**, with a c (L-a-n-c-e-l-l-o-t-t-i). It was misspelled "Lanellotti" until November 17, 2026. Full names are typed once, in `config/people.ts`; any copy that names John or Joe interpolates `people.<id>.name` (see the top of `config/site.ts`) instead of retyping it.
- Player stats render only when they have a value. Avatar paths live in one `config/people.ts` entry each so a swap is one line.
- Fonts: Barlow Condensed for display, Barlow for body, JetBrains Mono for labels.
- Shared color tokens live in `app/globals.css`; feature styles in `styles/`. Use the tokens in components. Three.js and the share images read the token values.
- `LabScene` is dynamically loaded with `ssr: false` inside client components. Dispose renderer resources, respect reduced motion, and stop offscreen/background render loops. React Strict Mode reuses the canvas: do not force context loss during effect replay cleanup.
- Core content renders without JS. Prefer native links, buttons and dialog semantics. Keep visible focus and the native pointer; do not add a custom cursor or scroll hijacking. Moving decoration needs a pause and a static reduced-motion state.
- Descriptions must match real work; keep prototype and development labels. Game copy comes from each game's README and status docs. Do not publish private endpoints, account details, credentials, topology or unsupported outcome/scale claims. No em dashes in copy.
- Public images: `public/games/` (gameplay captures), `public/projects/` (brand art and site captures), `public/people/`, `public/lab/`, and the lettermark source in `public/assets/`. Label captures as captures; distinguish them from illustrations. Refresh captures with `npm run capture:sites`.
- `npm run lint`, `bash test.sh`, and `npm run test:e2e` are required for substantive changes. Browser tests need a production build and Chromium.
- The Vercel project is `18hrshift-site`, connected to this GitHub repo since November 17, 2026. **A push to `main` deploys production**; any other branch gets a preview URL. Run the checks before pushing `main`, and put unfinished work on a branch. GitHub Actions (`.github/workflows/checks.yml`) runs the same checks on every push but does not block the deploy. After a push, verify the deployment's state, target and alias. `vercel deploy` from a linked checkout still works for a manual deploy.

## Working standards

These are the shared 18HRSHIFT standards for John's and Joe's agents. This repo is public: nothing private (accounts, machines, hosts, client work, credentials) goes in this file or anywhere else in it.

### Engineering principles

1. **Modularity.** Small, focused, composable pieces. Each unit does one thing well. No god files or god scripts; split responsibility aggressively.
2. **No hacky solutions.** If a fix feels like a workaround, it is. Find the right fix.
3. **Clear over clever.** Write for the next person who reads it.
4. **Config is the single source of truth.** IDs, paths, links and copy live in config and are loaded, not mirrored. A constant that repeats a config value is drift. A test should prove that changing the config changes the behavior.
5. **Secrets never in git.** Keys and tokens go in `.env` files or the host's environment settings. If one is ever committed, rotate it right away; removing the commit is not enough.
6. **Validate at the boundary.** Check external input where it enters the system so bad data fails at the door.
7. **Fail loudly.** Errors surface where someone will see them, not in a silent catch.
8. **Test what you build.** New code ships with tests, and the checks above pass before anything reaches `main`.
9. **Every change ships its docs.** Update README.md or this file in the same change. Docs are claims, not wishes: never document a command, route or flag that isn't built, and check docs against the code, not memory.

### Git and delivery

- Pull before starting. Both founders' agents work here, so check `git status` and the latest `main` first.
- Inspect uncommitted or untracked changes before touching them. Never discard changes you didn't make; if they're unfinished, move them to a `wip/<topic>` branch and push it.
- Stage files deliberately, not the whole tree. Never commit secrets, build output, caches or local data; add a `.gitignore` pattern instead.
- Done means committed and pushed. Commit in logical groups with messages that say what changed and why.
- `main` is production. Only push `main` when the checks pass and the change is ready to go live.
- Never force-push or rewrite published history. If a push is rejected, fetch and sort out the conflict deliberately; don't resolve it blindly.

### Writing and reporting

- Concise and direct. Short sentences. No em dashes, in copy, docs or commit messages.
- Report outcomes as they are: if a check fails, say so with the output; if a step was skipped, say that. Explain the evidence and its limits instead of guessing confidently.
