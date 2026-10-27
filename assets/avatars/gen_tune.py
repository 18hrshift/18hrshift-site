#!/usr/bin/env python3
"""Round 7: rebalance Joe against John, editing the picked pair.

John's notes on the final pair: Joe is too close to John, so the headphones go and
he gets a small DJ setup. Joe's note: make the pair more yin-yang balanced. Every
variant gives Joe John's silhouette (something on the head, the skull, a prop held
below at the same height) with mirrored background motifs. The `-yy` variants add
one tiny accent of each character's color to the other, like the dots in a yin-yang.

Usage: OPENROUTER_API_KEY=... python3 gen_tune.py <pair.png> <out_dir> [variant ids...]
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

EDIT = (
    "Edit this image. Keep John on the left exactly as he is: same skull, headset, controller, "
    "hands, background motifs, colors, glow and position.{john_extra} Redraw only Joe on the right "
    "so the two read as a balanced, mirrored pair, like two halves of a yin-yang. Joe's skull is "
    "identical in size, shape and height to John's: round dome, two ring eyes hidden behind dark "
    "rectangular sunglasses with a small glint on each lens, and a jaw of exactly ONE row of three "
    "short rounded stubby legs separated by two narrow slits. REMOVE Joe's headphones completely: "
    "his dome is bare apart from the sunglasses. REMOVE the two speaker cabinets. {prop} Joe's prop "
    "sits at the same height, width and visual weight as John's controller, so both characters "
    "share one silhouette: something on the head, the skull, a prop held below. Mirror John's "
    "background motifs: John has small pixel stars and a D-pad on his outer left, so give Joe the "
    "same number of small thin-line motifs (music notes, a small equalizer and a tiny vinyl record) "
    "on his outer right, with the same size and spacing. Same white line weight and neon glow as "
    "John. Joe's colors are magenta and sky blue.{joe_extra} Solid black background. No text, "
    "letters, numbers, names or logos."
)

PROPS = {
    "deck": "Give Joe a compact DJ controller held in his two small hands in front of his jaw, the "
            "same way John holds his game controller: two round jog wheels with a small mixer and "
            "faders between them, his thumbs resting on the jog wheels.",
    "booth": "Put Joe behind a small DJ booth: a low booth front panel at the bottom with two "
             "turntables on top, a record on each and a small mixer between them. His two small "
             "hands rest on the records, mid-scratch.",
}

YIN_YANG = {
    "john_extra": " The only change to John: add one tiny magenta button light on his controller.",
    "joe_extra": " Add one tiny green LED light on Joe's mixer, the only green on him.",
}

VARIANTS = {
    "deck": ("deck", False),
    "booth": ("booth", False),
    "deck-yy": ("deck", True),
    "booth-yy": ("booth", True),
}


def prompt(vid: str) -> str:
    prop, yin_yang = VARIANTS[vid]
    extras = YIN_YANG if yin_yang else {"john_extra": "", "joe_extra": ""}
    return EDIT.format(prop=PROPS[prop], **extras)


def generate(pair_b64: str, vid: str, out_dir: Path) -> str:
    content = [
        {"type": "text", "text": prompt(vid)},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{pair_b64}"}},
    ]
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
    if "choices" not in data:
        raise RuntimeError(f"{vid}: {json.dumps(data.get('error', data))[:300]}")
    images = data["choices"][0]["message"].get("images") or []
    if not images:
        raise RuntimeError(f"{vid}: no image in response: {json.dumps(data)[:300]}")
    raw = base64.b64decode(images[0]["image_url"]["url"].split(",", 1)[1])
    path = out_dir / f"pair-{vid}.png"
    path.write_bytes(raw)
    return f"{path} cost={data.get('usage', {}).get('cost')}"


def main():
    pair, out_dir, *ids = sys.argv[1:]
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    pair_b64 = base64.b64encode(Path(pair).read_bytes()).decode()
    ids = ids or list(VARIANTS)
    with ThreadPoolExecutor(max_workers=len(ids)) as pool:
        futures = {v: pool.submit(generate, pair_b64, v, out_dir) for v in ids}
        for v, f in futures.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED {v}: {e}", flush=True)


if __name__ == "__main__":
    main()
