#!/usr/bin/env python3
"""Make one small change to a finished pair and leave everything else alone.

The pair goes back to the model as the only image, with a plain-language instruction.
That keeps the style, the layout and the other character as they are, which is how
every pick since round 3 was fixed. Use it for future tweaks to final/pair-booth-yy.png
instead of writing another round script.

Usage: OPENROUTER_API_KEY=... python3 edit_pair.py <pair.png> <out_dir> "<change>" [takes]
Writes <out_dir>/pair-edit-<n>.png, then crop with crop_avatars.py and make_pfps.py.
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
    "Edit this image. Change ONLY this: {change} Keep everything else exactly the same: John on "
    "the left and Joe on the right, every line, color, glow, prop and background motif, their "
    "sizes and positions, and the solid black background. No text, letters, numbers, names or "
    "logos."
)


def generate(pair_b64: str, change: str, n: int, out_dir: Path) -> str:
    content = [
        {"type": "text", "text": EDIT.format(change=change)},
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
        raise RuntimeError(f"take {n}: {json.dumps(data.get('error', data))[:300]}")
    images = data["choices"][0]["message"].get("images") or []
    if not images:
        raise RuntimeError(f"take {n}: no image in response: {json.dumps(data)[:300]}")
    raw = base64.b64decode(images[0]["image_url"]["url"].split(",", 1)[1])
    path = out_dir / f"pair-edit-{n}.png"
    path.write_bytes(raw)
    return f"{path} cost={data.get('usage', {}).get('cost')}"


def main():
    pair, out_dir, change, *rest = sys.argv[1:]
    takes = int(rest[0]) if rest else 2
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    pair_b64 = base64.b64encode(Path(pair).read_bytes()).decode()
    with ThreadPoolExecutor(max_workers=takes) as pool:
        futures = [pool.submit(generate, pair_b64, change.strip(), n, out_dir) for n in range(1, takes + 1)]
        for f in futures:
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED: {e}", flush=True)


if __name__ == "__main__":
    main()
