#!/usr/bin/env python3
"""Cut a John + Joe pair into two square profile pictures for social accounts.

Unlike crop_avatars.py (transparent, small, for the site), these stay on solid black
at full color, because most platforms want an opaque image. Platforms crop to a
circle, so the square is sized to the circle around each drawing's farthest lit
pixel, not its bounding box. Both use one shared scale so the skulls match.

Usage: python3 make_pfps.py <pair.png> <out_dir> [size]
Writes <out_dir>/john-pfp.png and <out_dir>/joe-pfp.png.
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops

from crop_avatars import FLOOR, THRESHOLD, drawing_bounds

MARGIN = 1.04  # circle diameter as a multiple of the drawing's own circle


def drawing_radius(half: Image.Image, center: tuple[float, float]) -> float:
    cx, cy = center
    w = half.width
    lit = (i for i, px in enumerate(half.convert("RGB").getdata()) if max(px) > THRESHOLD)
    return max(math.hypot(i % w - cx, i // w - cy) for i in lit)


def pfp(half: Image.Image, center: tuple[float, float], side: int, size: int) -> Image.Image:
    cx, cy = center
    left, top = round(cx - side / 2), round(cy - side / 2)
    # Cropping past the half's edge pads with black, so the other character never leaks in.
    square = half.convert("RGB").crop((left, top, left + side, top + side))
    return flatten_black(square.resize((size, size), Image.LANCZOS))


def flatten_black(im: Image.Image) -> Image.Image:
    """The model's black isn't quite pure. Flatten that noise so it matches the padding."""
    r, g, b = im.split()
    brightest = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = brightest.point(lambda v: 255 if v >= FLOOR else 0)
    return Image.composite(im, Image.new("RGB", im.size, (0, 0, 0)), mask)


def main():
    pair, out_dir, *rest = sys.argv[1:]
    size = int(rest[0]) if rest else 1000
    im = Image.open(pair).convert("RGB")
    w, h = im.size
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    halves = {"john": im.crop((0, 0, w // 2, h)), "joe": im.crop((w // 2, 0, w, h))}
    centers = {}
    for name, half in halves.items():
        l, t, r, b = drawing_bounds(half)
        centers[name] = ((l + r) / 2, (t + b) / 2)
    radius = max(drawing_radius(half, centers[name]) for name, half in halves.items())
    side = math.ceil(2 * radius * MARGIN)
    for name, half in halves.items():
        path = out_dir / f"{name}-pfp.png"
        pfp(half, centers[name], side, size).save(path, optimize=True)
        print(f"{path} side={side}px scale={size / side:.2f}x")


if __name__ == "__main__":
    main()
