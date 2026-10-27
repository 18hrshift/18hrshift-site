# Skull avatars

Personalized versions of the 18hr skull for the person pages. Source art only; nothing here is served by the site until a pick is copied into `public/`.

- `drafts/`: first round, generated October 27, 2026. `john-*` (video games, Jets green with no team logo) and `joe-*` (music). Saved as 64-color palette PNGs at 1024px.
- `round2/`: matched John + Joe pairs, one per style direction (sticker, neon, screenprint, pixel), white on black with color, generated October 27, 2026 after John picked the gamer headset and the studio headphones. `gen_pairs.py` draws both characters in one image so the style matches between them; crop each half to a square for an avatar.
- `gen_skulls.py`: the round 1 generator. It sends the 18hr lettermark as a reference image to OpenRouter (`openai/gpt-5.4-image-2`) so the dome, ring eyes and three-leg jaw stay consistent, then adds one personal element per variant. Prompts live in its `VARIANTS` table.

```bash
export OPENROUTER_API_KEY=...   # key location: central-ops/ACCOUNTS.md
python3 assets/avatars/gen_skulls.py public/assets/lettermark-black.png assets/avatars/drafts john-combo
```

Measured cost: about $0.24 per round 1 image and $0.19 per round 2 pair. The generator writes full-size PNGs; shrink them before committing.
