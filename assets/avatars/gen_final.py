#!/usr/bin/env python3
"""Final pass: edit John's round 3 pick instead of redrawing it.

John picked neon with Joe's shades on (round 3) and asked for one fix: Joe's
second row of jaw legs goes. Sending the picked pair as the only image with an
edit instruction keeps everything else as it was.

Usage: OPENROUTER_API_KEY=... python3 gen_final.py <picked_pair.png> <out_dir> [count]
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
    "Edit this image. Keep everything exactly the same: the black background, John on the left "
    "with every line, color and glow unchanged, Joe's magenta headphones, his sunglasses, both "
    "speaker cabinets with blue sound waves, and both equalizer bars. Change ONLY Joe's skull: "
    "it currently has two stacked rows of jaw legs, which is wrong. Remove the lower row so his "
    "skull ends after ONE row of three short rounded stubby jaw legs separated by two narrow "
    "slits, exactly like John's skull on the left. Joe's skull must be the same size and "
    "proportions as John's, with its jaw bottom at the same height as John's jaw bottom, and it "
    "stays centered between his speakers. No text, letters, numbers, names or logos."
)


def generate(pair_b64: str, n: int, out_dir: Path) -> str:
    content = [
        {"type": "text", "text": EDIT},
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
    images = data["choices"][0]["message"].get("images") or []
    if not images:
        raise RuntimeError(f"take {n}: no image in response: {json.dumps(data)[:400]}")
    raw = base64.b64decode(images[0]["image_url"]["url"].split(",", 1)[1])
    path = out_dir / f"pair-final-{n}.png"
    path.write_bytes(raw)
    return f"{path} cost={data.get('usage', {}).get('cost')}"


def main():
    pair, out_dir, *rest = sys.argv[1:]
    count = int(rest[0]) if rest else 2
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    pair_b64 = base64.b64encode(Path(pair).read_bytes()).decode()
    with ThreadPoolExecutor(max_workers=count) as pool:
        futures = {n: pool.submit(generate, pair_b64, n, out_dir) for n in range(1, count + 1)}
        for n, f in futures.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED take {n}: {e}", flush=True)


if __name__ == "__main__":
    main()
