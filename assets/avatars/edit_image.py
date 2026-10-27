#!/usr/bin/env python3
"""Make one small change to finished skull art and leave everything else alone.

The image goes back to the model as the only reference, with a plain-language change.
That keeps the style and everything the change doesn't name, which is how every pick
since round 3 was fixed. It works on a pair (3:2) or a single square PFP; the output
keeps the input's shape. Use it for future tweaks instead of writing a round script.

Usage: OPENROUTER_API_KEY=... python3 edit_image.py <image.png> <out_dir> "<change>" [takes] [name]
Writes <out_dir>/<name>-<n>.png (name defaults to "edit"). Recut with make_pfps.py,
and for a pair also crop_avatars.py.
"""
import base64
import json
import os
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

MODEL = "openai/gpt-5.4-image-2"
URL = "https://openrouter.ai/api/v1/chat/completions"
ASPECTS = {"1:1": 1.0, "3:2": 1.5, "2:3": 2 / 3}

EDIT = (
    "Edit this image. Change ONLY this: {change} Keep everything else exactly the same: every "
    "character, line, color, glow, prop and background motif the change doesn't name, their "
    "sizes and positions unless the change says otherwise, and the solid black background. No "
    "text, letters, numbers, names or logos."
)


def aspect_of(path: Path) -> str:
    w, h = Image.open(path).size
    return min(ASPECTS, key=lambda k: abs(ASPECTS[k] - w / h))


def generate(image_b64: str, aspect: str, change: str, path: Path) -> str:
    content = [
        {"type": "text", "text": EDIT.format(change=change)},
        {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{image_b64}"}},
    ]
    body = json.dumps({
        "model": MODEL,
        "modalities": ["image", "text"],
        "image_config": {"aspect_ratio": aspect},
        "messages": [{"role": "user", "content": content}],
    }).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read().decode())
    if "choices" not in data:
        raise RuntimeError(f"{path.name}: {json.dumps(data.get('error', data))[:300]}")
    images = data["choices"][0]["message"].get("images") or []
    if not images:
        raise RuntimeError(f"{path.name}: no image in response: {json.dumps(data)[:300]}")
    path.write_bytes(base64.b64decode(images[0]["image_url"]["url"].split(",", 1)[1]))
    return f"{path} cost={data.get('usage', {}).get('cost')}"


def main():
    image, out_dir, change, *rest = sys.argv[1:]
    takes = int(rest[0]) if rest else 2
    name = rest[1] if len(rest) > 1 else "edit"
    image, out_dir = Path(image), Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    image_b64 = base64.b64encode(image.read_bytes()).decode()
    aspect = aspect_of(image)
    with ThreadPoolExecutor(max_workers=takes) as pool:
        futures = [
            pool.submit(generate, image_b64, aspect, change.strip(), out_dir / f"{name}-{n}.png")
            for n in range(1, takes + 1)
        ]
        for f in futures:
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED: {e}", flush=True)


if __name__ == "__main__":
    main()
