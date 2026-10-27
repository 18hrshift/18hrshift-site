#!/usr/bin/env python3
"""Turn a skull avatar pick into the web file the site serves from public/people/.

Usage:
    python3 assets/avatars/prepare_web.py SRC DEST [--line-art] [--size 640]

--line-art is for the first-round drafts (black lines on white). It keeps the
lines, makes the paper transparent and lightens the lines so they read on the
site's dark background. Without it the image is only resized, which suits art
that is already made for a dark background.
"""

import argparse

from PIL import Image, ImageOps

INK = (241, 242, 233)  # --clr-ink in app/globals.css


PAPER_NOISE = 24  # alpha below this is off-white paper grain, not line


def line_art(image: Image.Image) -> Image.Image:
    gray = ImageOps.grayscale(image.convert('RGB'))
    alpha = ImageOps.invert(gray)  # dark line -> opaque, white paper -> clear
    alpha = alpha.point(lambda a: 0 if a < PAPER_NOISE else round((a - PAPER_NOISE) * 255 / (255 - PAPER_NOISE)))
    out = Image.new('RGBA', image.size, INK + (0,))
    out.putalpha(alpha)
    return out


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split('\n')[0])
    parser.add_argument('src')
    parser.add_argument('dest')
    parser.add_argument('--line-art', action='store_true')
    parser.add_argument('--size', type=int, default=640)
    args = parser.parse_args()

    image = Image.open(args.src)
    image = line_art(image) if args.line_art else image.convert('RGBA')
    image = image.resize((args.size, args.size), Image.LANCZOS)
    if args.line_art:
        # One ink colour, so a small palette of alpha steps loses nothing visible.
        image = image.quantize(colors=32, method=Image.Quantize.FASTOCTREE)
    image.save(args.dest, optimize=True)
    print(f'{args.dest}: {image.size[0]}x{image.size[1]}')


if __name__ == '__main__':
    main()
