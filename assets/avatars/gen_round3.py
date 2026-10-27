#!/usr/bin/env python3
"""Round 3: neon and pixel pairs with John's round 2 fixes (Joe distinct, controller held naturally).

Drawing both characters in one image keeps stroke weight, eyes and rendering
consistent between them. References: the white-on-black 18hr icon plus the two
round-1 picks as blueprints.

Usage: OPENROUTER_API_KEY=... python3 gen_round3.py <icon.png> <neon_pair.png> <pixel_pair.png> <out_dir> [ids...]
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
    "Image 1 is the 18hr logo: a white skull character on black. Image 2 is the APPROVED STYLE "
    "REFERENCE: two characters drawn from that skull. Match image 2's rendering exactly (line "
    "weight, glow or pixel density, palette, black background, skull proportions) but redesign "
    "the accessories as described below. Draw both characters side by side in ONE wide landscape "
    "image as a matched pair, John on the left, Joe on the right, same skull size and height. "
    "Keep the skull anatomy exactly like the logo: round dome head, two ring eyes, and a lower jaw "
    "of three short rounded stubby legs separated by two narrow slits. "
    "JOHN (green and lime accents): wears a chunky gaming headset with a boom mic. He holds a game "
    "controller the natural way, gripped in two small hands in front of his jaw, seen from BEHIND: "
    "the controller's back and shoulder triggers face the viewer and his thumbs curl over the top, "
    "so its face buttons are hidden, as if he is mid-game. "
    "JOE (magenta and blue accents) must read as clearly different from John at a glance: big "
    "padded over-ear studio headphones with NO mic and a different shape from John's headset, "
    "{shades}, and two small speaker cabinets beside him with round woofers and sound waves "
    "coming out. No controller for Joe. "
    "Leave even empty space around each character so each can be cropped to its own square "
    "avatar. Absolutely NO text, NO letters, NO numbers, NO names, NO brand or team logos. Style: "
)

SHADES = {
    "on": "dark rectangular sunglasses worn over his eyes, his ring eyes hidden behind the lenses, a small glint on each lens",
    "up": "dark sunglasses pushed up on top of his dome so his ring eyes stay visible",
}

STYLES = {
    "neon": "neon arcade line art exactly like image 2: skulls as clean white line work on black, accessories as glowing neon lines, soft glow on the colored lines only, a few small thin-line background motifs (pixel stars and a D-pad near John, equalizer bars near Joe).",
    "pixel": "crisp 16-bit pixel art exactly like image 2: white skull bodies with a one-pixel black outline, limited palette, the same pixel grid density for both, tiny pixel sparkles near John and tiny pixel music notes near Joe.",
}

DIRECTIONS = {f"{s}-shades{h}": (s, h) for s in STYLES for h in SHADES}


def b64(path: str) -> str:
    return base64.b64encode(Path(path).read_bytes()).decode()


def generate(icon: str, style_refs: dict[str, str], did: str, out_dir: Path) -> str:
    style, shades = DIRECTIONS[did]
    text = BASE.replace("{shades}", SHADES[shades]) + STYLES[style]
    refs = [icon, style_refs[style]]
    content = [{"type": "text", "text": text}]
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
    icon, neon_ref, pixel_ref, out_dir, *ids = sys.argv[1:]
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    icon_b64 = b64(icon)
    style_refs = {"neon": b64(neon_ref), "pixel": b64(pixel_ref)}
    ids = ids or list(DIRECTIONS)
    with ThreadPoolExecutor(max_workers=len(ids)) as pool:
        futures = {d: pool.submit(generate, icon_b64, style_refs, d, out_dir) for d in ids}
        for d, f in futures.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED {d}: {e}", flush=True)


if __name__ == "__main__":
    main()
