# Skull avatars

Personalized versions of the 18hr skull for the person pages. Source art only; nothing here is served by the site until a pick is copied into `public/`.

- `drafts/`: first round, generated October 27, 2026. `john-*` (video games, Jets green with no team logo) and `joe-*` (music). Saved as 64-color palette PNGs at 1024px.
- `round2/`: matched John + Joe pairs, one per style direction (sticker, neon, screenprint, pixel), white on black with color, generated October 27, 2026 after John picked the gamer headset and the studio headphones. `gen_pairs.py` draws both characters in one image so the style matches between them; crop each half to a square for an avatar.
- `round3/`: neon and pixel pairs after John's round 2 notes (Joe made distinct with sunglasses, speakers and different headphones; John's controller held from behind). Each style twice: Joe's shades on, and pushed up. `gen_round3.py` uses the round 2 pair as the style reference. Known flaw: neon Joe grew an extra row of jaw legs.
- `final/pair-neon-shadeson.png`: the previous pick (October 27, 2026, replaced in round 7). John chose neon with Joe's shades on; `gen_final.py` sends the round 3 pair back as an edit that only removes Joe's extra jaw row. `crop_avatars.py` cuts it into the two 640px avatars in `public/people/` on the site, keying out the black so the glow sits on the page, with one shared scale so both skulls come out the same size.
- `gen_tune.py`: round 7 (October 27, 2026). Edits the round 3 final pair again after John's and Joe's notes: Joe drops the headphones and speakers for a DJ booth or a handheld DJ deck, takes John's silhouette (head piece, skull, prop below) with mirrored background motifs, and the `-yy` variants add one tiny accent of each other's color (a magenta light on John's controller, a green LED on Joe's mixer). The prompts live in its `VARIANTS` table.
- `final/pair-booth-yy.png`: **the current pick** (October 27, 2026): Joe at the DJ booth, with the yin-yang accents. Kept at full color because it's the source for any future edit. The other three candidates are in `round7/` (shrunk to 256 colors).
- `pfp/john-pfp.png`, `pfp/joe-pfp.png`: 1000px square profile pictures from the pick, on solid black for social accounts. `make_pfps.py` sizes them to the circle around each drawing, so a round crop keeps every motif, and uses one scale for both.
- `pfp/john-pfp-solo.png`: John alone, just the skull and headset with no controller, hands or motifs (October 27, 2026, John's ask). Its source is `final/john-solo.png`, an `edit_image.py` edit of `pfp/john-pfp.png`, cut with `make_pfps.py --solo` to fill its own circle. `pfp/john-pfp-solo-motifs.png` is the alternate that keeps the stars and D-pad.
- `edit_image.py`: for the next tweak. It sends a pick back with one plain-language change and keeps everything else, the way rounds 3 to 7 were fixed. It works on a pair or a square PFP and keeps the input's shape. Recut with `make_pfps.py` (plus `crop_avatars.py` for a pair) after.
- `gen_skulls.py`: the round 1 generator. It sends the 18hr lettermark as a reference image to OpenRouter (`openai/gpt-5.4-image-2`) so the dome, ring eyes and three-leg jaw stay consistent, then adds one personal element per variant. Prompts live in its `VARIANTS` table.

```bash
export OPENROUTER_API_KEY=...   # key location: central-ops/ACCOUNTS.md
# Tweak the current pick (two takes), then cut the one you like:
python3 assets/avatars/edit_image.py assets/avatars/final/pair-booth-yy.png /tmp/edit "Make Joe's booth a little smaller." 2
python3 assets/avatars/crop_avatars.py /tmp/edit/edit-1.png public/people   # site avatars, 640px transparent
python3 assets/avatars/make_pfps.py /tmp/edit/edit-1.png assets/avatars/pfp  # PFPs, 1000px on black
# A single-character PFP, like John's solo skull:
python3 assets/avatars/edit_image.py assets/avatars/pfp/john-pfp.png /tmp/solo "Remove John's game controller and both of his hands..." 2 bare
python3 assets/avatars/make_pfps.py --solo /tmp/solo/bare-1.png assets/avatars/pfp/john-pfp-solo.png
# How the current pick was made:
python3 assets/avatars/gen_tune.py assets/avatars/final/pair-neon-shadeson.png /tmp/round7 booth-yy
```

Measured cost: about $0.24 per round 1 image, $0.19 per round 2 pair and $0.17 per pair edit (final and round 7) and $0.24 per square edit (solo). The generators write full-size PNGs; shrink candidates before committing, but keep the current pick at full color.
