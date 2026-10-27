# Skull avatars

Personalized versions of the 18hr skull for the person pages. Source art only; nothing here is served by the site until a pick is copied into `public/`.

- `drafts/`: first round, generated October 27, 2026. `john-*` (video games, Jets green with no team logo) and `joe-*` (music). Saved as 64-color palette PNGs at 1024px.
- `gen_skulls.py`: the generator. It sends the 18hr lettermark as a reference image to OpenRouter (`openai/gpt-5.4-image-2`) so the dome, ring eyes and three-leg jaw stay consistent, then adds one personal element per variant. Prompts live in its `VARIANTS` table.

```bash
export OPENROUTER_API_KEY=...   # key location: central-ops/ACCOUNTS.md
python3 assets/avatars/gen_skulls.py public/assets/lettermark-black.png assets/avatars/drafts john-combo
```

Measured cost: about $0.24 per image. The generator writes full-size PNGs; shrink them before committing.

## On the site

The relaunch serves `drafts/john-gamer.png` and `drafts/joe-headphones.png` as placeholders until the final art (white on black, with color) is picked. `prepare_web.py` made the served files: with `--line-art` it keeps the black lines, makes the white paper transparent and lightens the lines so they read on the dark site, then saves a 640px palette PNG.

```bash
python3 assets/avatars/prepare_web.py assets/avatars/drafts/john-gamer.png public/people/john-avatar.png --line-art
python3 assets/avatars/prepare_web.py assets/avatars/drafts/joe-headphones.png public/people/joe-avatar.png --line-art
```

For art already made for a dark background, drop `--line-art` and the script only resizes. Then point `avatar.src` in `config/people.ts` at the new file (and update its `alt`).
