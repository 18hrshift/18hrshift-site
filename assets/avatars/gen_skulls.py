#!/usr/bin/env python3
"""Generate personalized 18hr skull avatars via OpenRouter (gpt-5.4-image-2).

Passes the 18hr lettermark as a reference image so the skull keeps its anatomy,
then adds one personal element per variant. Runs variants concurrently.

Usage: OPENROUTER_API_KEY=... python3 gen_skulls.py <ref.png> <out_dir> [variant ids...]
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
    "Reference image: the 18hr logo. Use ONLY the skull character that forms the '8' "
    "(ignore the 1, h and r letters). Keep its exact anatomy: a round dome head, two "
    "ring eyes (a thick circle with a small hollow dot pupil), and a lower jaw made of "
    "three short rounded stubby legs separated by two narrow slits. "
    "Draw a single square profile-picture avatar of that skull in simple line art: "
    "bold uniform black outlines with rounded line ends, the same stroke weight as the "
    "logo, flat white fills, no shading, no gradients, no texture. Centered, generous "
    "margin, plain solid white background. Playful and clean, sticker-like, readable at "
    "48 pixels. Absolutely NO text, NO letters, NO numbers, NO names, NO team or brand logos. "
    "Personal element: "
)

VARIANTS = {
    "john-gamer": "the skull wears a chunky over-ear gaming headset with a short boom mic, "
                  "and holds a classic game controller in front of its jaw with two tiny hands.",
    "john-helmet": "the skull wears an American football helmet with a facemask cage over its "
                   "face and a center stripe. The helmet shell is the ONLY color in the image: "
                   "a deep green (#125740) flat fill. Everything else stays black line on white. "
                   "No logo or decal on the helmet.",
    "john-combo": "the skull wears an American football helmet (deep green #125740 shell is the "
                  "only color, no logo) and holds a game controller in two tiny hands. Keep it "
                  "simple, few lines.",
    "joe-headphones": "the skull wears big over-ear studio headphones and two or three small "
                      "music notes float beside it.",
    "joe-vinyl": "a vinyl record sits behind the skull like a halo, its grooves drawn as a few "
                 "thin concentric lines, and the skull wears small earbuds with a cord.",
    "joe-mic": "the skull wears over-ear headphones around its neck and sings into a vintage "
               "studio microphone on a short stand, with one small music note.",
}


def generate(ref_b64: str, vid: str, out_dir: Path) -> str:
    body = json.dumps({
        "model": MODEL,
        "modalities": ["image", "text"],
        "messages": [{
            "role": "user",
            "content": [
                {"type": "text", "text": BASE + VARIANTS[vid]},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{ref_b64}"}},
            ],
        }],
    }).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
        "Content-Type": "application/json",
    })
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read().decode())
    msg = data["choices"][0]["message"]
    images = msg.get("images") or []
    if not images:
        raise RuntimeError(f"{vid}: no image in response: {json.dumps(data)[:400]}")
    url = images[0]["image_url"]["url"]
    raw = base64.b64decode(url.split(",", 1)[1])
    path = out_dir / f"{vid}.png"
    path.write_bytes(raw)
    cost = data.get("usage", {}).get("cost")
    return f"{path} cost={cost}"


def main():
    ref, out_dir, *ids = sys.argv[1:]
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    ref_b64 = base64.b64encode(Path(ref).read_bytes()).decode()
    ids = ids or list(VARIANTS)
    with ThreadPoolExecutor(max_workers=6) as pool:
        futures = {vid: pool.submit(generate, ref_b64, vid, out_dir) for vid in ids}
        for vid, f in futures.items():
            try:
                print(f.result(), flush=True)
            except Exception as e:  # report each failure, keep the others
                print(f"FAILED {vid}: {e}", flush=True)


if __name__ == "__main__":
    main()
