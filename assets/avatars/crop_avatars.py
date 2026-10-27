#!/usr/bin/env python3
"""Cut a John + Joe pair image into two square, transparent avatars for public/people/.

The pair is neon on black. Black is keyed out with an "unmultiply" (alpha is each
pixel's brightest channel, color is divided back up), so the glow survives and the
avatar sits on the site's own frame background.

Usage: python3 crop_avatars.py <pair.png> <out_dir> [size]
Writes <out_dir>/john-avatar.png and <out_dir>/joe-avatar.png.
"""
import sys
from pathlib import Path

from PIL import Image

THRESHOLD = 40   # a channel this bright counts as drawing when finding the bounds
PADDING = 1.10   # square side as a multiple of the wider drawing's longer side
FLOOR = 12       # anything darker is treated as pure background


def unmultiply_black(im: Image.Image) -> Image.Image:
    out = []
    for r, g, b in im.convert("RGB").getdata():
        a = max(r, g, b)
        if a < FLOOR:
            out.append((0, 0, 0, 0))
        else:
            out.append((r * 255 // a, g * 255 // a, b * 255 // a, a))
    keyed = Image.new("RGBA", im.size)
    keyed.putdata(out)
    return keyed


def drawing_bounds(half: Image.Image) -> tuple[int, int, int, int]:
    mask = half.convert("RGB").point(lambda v: 255 if v > THRESHOLD else 0).convert("L")
    return mask.getbbox()


def square_crop(half: Image.Image, bounds: tuple[int, int, int, int], side: int, size: int) -> Image.Image:
    left, top, right, bottom = bounds
    cx, cy = (left + right) // 2, (top + bottom) // 2
    canvas = Image.new("RGB", (side, side), (0, 0, 0))
    canvas.paste(half.crop((cx - side // 2, cy - side // 2, cx + side - side // 2, cy + side - side // 2)))
    keyed = unmultiply_black(canvas.resize((size, size), Image.LANCZOS))
    return keyed.quantize(colors=256, method=Image.Quantize.FASTOCTREE)


def main():
    pair, out_dir, *rest = sys.argv[1:]
    size = int(rest[0]) if rest else 640
    im = Image.open(pair)
    w, h = im.size
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    halves = {"john": im.crop((0, 0, w // 2, h)), "joe": im.crop((w // 2, 0, w, h))}
    bounds = {name: drawing_bounds(half) for name, half in halves.items()}
    # One shared side for both crops, so the two skulls come out the same size.
    side = int(max(max(r - l, b - t) for l, t, r, b in bounds.values()) * PADDING)
    for name, half in halves.items():
        path = out_dir / f"{name}-avatar.png"
        square_crop(half, bounds[name], side, size).save(path, optimize=True)
        print(path)


if __name__ == "__main__":
    main()
