# Skull avatars

Personalized versions of the 18hr skull for the person pages. Source art only; nothing here is served by the site until a pick is copied into `public/`.

- `drafts/`: first round, generated October 27, 2026. `john-*` (video games, Jets green with no team logo) and `joe-*` (music). Saved as 64-color palette PNGs at 1024px.
- `round2/`: matched John + Joe pairs, one per style direction (sticker, neon, screenprint, pixel), white on black with color, generated October 27, 2026 after John picked the gamer headset and the studio headphones. `gen_pairs.py` draws both characters in one image so the style matches between them; crop each half to a square for an avatar.
- `round3/`: neon and pixel pairs after John's round 2 notes (Joe made distinct with sunglasses, speakers and different headphones; John's controller held from behind). Each style twice: Joe's shades on, and pushed up. `gen_round3.py` uses the round 2 pair as the style reference. Known flaw: neon Joe grew an extra row of jaw legs.
- `final/pair-neon-shadeson.png`: the pick (October 27, 2026). John chose neon with Joe's shades on; `gen_final.py` sends the round 3 pair back as an edit that only removes Joe's extra jaw row. `crop_avatars.py` cuts it into the two 640px avatars in `public/people/` on the site, keying out the black so the glow sits on the page, with one shared scale so both skulls come out the same size.
- `gen_skulls.py`: the round 1 generator. It sends the 18hr lettermark as a reference image to OpenRouter (`openai/gpt-5.4-image-2`) so the dome, ring eyes and three-leg jaw stay consistent, then adds one personal element per variant. Prompts live in its `VARIANTS` table.

```bash
export OPENROUTER_API_KEY=...   # key location: central-ops/ACCOUNTS.md
python3 assets/avatars/gen_skulls.py public/assets/lettermark-black.png assets/avatars/drafts john-combo
python3 assets/avatars/gen_final.py assets/avatars/round3/pair-neon-shadeson.png /tmp/final 2
python3 assets/avatars/crop_avatars.py /tmp/final/pair-final-1.png public/people
```

Measured cost: about $0.24 per round 1 image, $0.19 per round 2 pair and $0.17 per final edit. The generator writes full-size PNGs; shrink them before committing.
