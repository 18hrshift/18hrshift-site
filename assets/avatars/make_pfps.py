#!/usr/bin/env python3
"""Cut skull art into square profile pictures for social accounts.

Unlike crop_avatars.py (transparent, small, for the site), these stay on solid black
at full color, because most platforms want an opaque image. Platforms crop to a
circle, so the square is sized to the circle around each drawing's farthest lit
pixel, not its bounding box. A pair gives two PFPs at one shared scale so the skulls
match; --solo cuts one image (a single character) to fill its own circle.

Usage: python3 make_pfps.py <pair.png> <out_dir> [size]
         writes <out_dir>/john-pfp.png and <out_dir>/joe-pfp.png
       python3 make_pfps.py --solo <image.png> <out.png> [size]
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageChops

from crop_avatars import FLOOR, THRESHOLD, drawing_bounds

MARGIN = 1.04  # circle diameter as a multiple of the drawing's own circle


def drawing_circle(art: Image.Image) -> tuple[tuple[float, float], float]:
    """Center (of the drawing's bounds) and the distance to its farthest lit pixel."""
    l, t, r, b = drawing_bounds(art)
    cx, cy = (l + r) / 2, (t + b) / 2
    w = art.width
    lit = (i for i, px in enumerate(art.convert("RGB").getdata()) if max(px) > THRESHOLD)
    return (cx, cy), max(math.hypot(i % w - cx, i // w - cy) for i in lit)


def side_for(radius: float) -> int:
    return math.ceil(2 * radius * MARGIN)


def pfp(art: Image.Image, center: tuple[float, float], side: int, size: int) -> Image.Image:
    cx, cy = center
    left, top = round(cx - side / 2), round(cy - side / 2)
    # Cropping past the edge pads with black, so the other half of a pair never leaks in.
    square = art.convert("RGB").crop((left, top, left + side, top + side))
    return flatten_black(square.resize((size, size), Image.LANCZOS))


def flatten_black(im: Image.Image) -> Image.Image:
    """The model's black isn't quite pure. Flatten that noise so it matches the padding."""
    r, g, b = im.split()
    brightest = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = brightest.point(lambda v: 255 if v >= FLOOR else 0)
    return Image.composite(im, Image.new("RGB", im.size, (0, 0, 0)), mask)


def cut_pair(pair: Path, out_dir: Path, size: int):
    im = Image.open(pair).convert("RGB")
    w, h = im.size
    out_dir.mkdir(parents=True, exist_ok=True)
    halves = {"john": im.crop((0, 0, w // 2, h)), "joe": im.crop((w // 2, 0, w, h))}
    circles = {name: drawing_circle(half) for name, half in halves.items()}
    side = side_for(max(radius for _, radius in circles.values()))
    for name, half in halves.items():
        path = out_dir / f"{name}-pfp.png"
        pfp(half, circles[name][0], side, size).save(path, optimize=True)
        print(f"{path} side={side}px scale={size / side:.2f}x")


def cut_solo(image: Path, out: Path, size: int):
    im = Image.open(image).convert("RGB")
    center, radius = drawing_circle(im)
    side = side_for(radius)
    out.parent.mkdir(parents=True, exist_ok=True)
    pfp(im, center, side, size).save(out, optimize=True)
    print(f"{out} side={side}px scale={size / side:.2f}x")


def main():
    args = sys.argv[1:]
    solo = args[:1] == ["--solo"]
    src, dest, *rest = args[1:] if solo else args
    size = int(rest[0]) if rest else 1000
    (cut_solo if solo else cut_pair)(Path(src), Path(dest), size)


if __name__ == "__main__":
    main()
