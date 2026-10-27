#!/usr/bin/env python3
"""Round 2: matched John + Joe skull pairs, one style direction per image.

Drawing both characters in one image keeps stroke weight, eyes and rendering
consistent between them. References: the white-on-black 18hr icon plus the two
round-1 picks as blueprints.

Usage: OPENROUTER_API_KEY=... python3 gen_pairs.py <icon.png> <john.png> <joe.png> <out_dir> [direction ids...]
"""
import base64
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

MODEL = "openai/gpt-5.4-image-2"
URL = "https://openrouter.ai/api/v1/chat/completions"

BASE = (
    "Image 1 is the 18hr logo: a white skull character on black. Image 2 and image 3 are "
    "rough blueprints of two characters built from that skull. Image 2 is JOHN: wears a "
    "chunky gaming headset with a boom mic and holds a game controller. Image 3 is JOE: wears "
    "big over-ear studio headphones, with music notes nearby. "
    "Draw BOTH characters side by side in ONE wide landscape image as a matched pair, John on "
    "the left, Joe on the right, same size, same height, same stroke weight, same eye style, "
    "same rendering, clearly a set by the same artist. Keep the skull anatomy exactly like the "
    "logo: round dome head, two ring eyes, and a lower jaw of three short rounded stubby legs "
    "separated by two narrow slits. White skulls on a solid pure black background. Make them "
    "more finished and characterful than the blueprints, but still simple, bold and readable "
    "as small profile pictures. Leave even empty space around each character so each can be "
    "cropped to its own square avatar. Absolutely NO text, NO letters, NO numbers, NO names, "
    "NO brand or team logos. Style: "
)

DIRECTIONS = {
    "sticker": "die-cut sticker style matching the logo: pure white fills, thick black outlines "
               "with rounded ends, and a thin white outer contour around each character so it "
               "pops off the black. Flat color only on the accessories: John's headset and "
               "controller in Jets green #1F7A55 with lime #D7FF3F highlights; Joe's headphones "
               "in magenta #FA84BC with sky blue #65BBFF details. No gradients, no shading.",
    "neon": "neon arcade line art: the skulls drawn as clean white line work on black, the "
            "accessories drawn as glowing neon lines, John in green #3DDC84 and lime #D7FF3F, Joe "
            "in magenta #FA84BC and blue #65BBFF, soft glow on the colored lines only. Small "
            "thin-line background motifs: a few pixel stars and a D-pad behind John, a few "
            "equalizer bars and sound waves behind Joe.",
    "screenprint": "screen-printed poster style: white skulls with bold black outlines, flat spot "
                   "colors with halftone dot shading in the colored areas, each character on a "
                   "solid colored circle badge (Jets green #125740 behind John, magenta #FA84BC "
                   "behind Joe), slight print texture. More detailed accessories: John's headset "
                   "with ear-cup detail and a modern controller with lime #D7FF3F accents; Joe's "
                   "studio headphones with a coiled cable and orange #FF7449 accents, plus notes.",
    "pixel": "crisp 16-bit pixel art: white skull bodies with a one-pixel black outline, limited "
             "palette, the same pixel grid density for both. John's headset and controller in "
             "greens and lime #D7FF3F with tiny pixel sparkles; Joe's headphones in magenta "
             "#FA84BC and blue #65BBFF with tiny pixel music notes.",
}


def b64(path: str) -> str:
    return base64.b64encode(Path(path).read_bytes()).decode()


def generate(refs: list[str], did: str, out_dir: Path) -> str:
    content = [{"type": "text", "text": BASE + DIRECTIONS[did]}]
    content += [{"type": "image_url", "image_url": {"url": f"data:image/png;base64,{r}"}} for r in refs]
    body = json.dumps({
        "model": MODEL,
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": "3:2"},
        "messages": [{"role": "user", "content": content}],
    }).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read().decode())
    images = data["choices"][0]["message"].get("images") or []
    if not images:
        raise RuntimeError(f"{did}: no image in response: {json.dumps(data)[:400]}")
    raw = base64.b64decode(images[0]["image_url"]["url"].split(",", 1)[1])
    path = out_dir / f"pair-{did}.png"
    path.write_bytes(raw)
    return f"{path} cost={data.get('usage', {}).get('cost')}"


def main():
    icon, john, joe, out_dir, *ids = sys.argv[1:]
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    refs = [b64(icon), b64(john), b64(joe)]
    ids = ids or list(DIRECTIONS)
    with ThreadPoolExecutor(max_workers=len(ids)) as pool:
        futures = {d: pool.submit(generate, refs, d, out_dir) for d in ids}
        for d, f in futures.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED {d}: {e}", flush=True)


if __name__ == "__main__":
    main()
