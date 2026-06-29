#!/usr/bin/env python3
"""One-off: shrink a couple of oversized static images.

- paper.svg (776K) is a base64-embedded raster used as a *repeating* texture at
  500px tiles, so it can be downscaled hard -> paper.webp.
- avatarPlaceholder.png (212K) is shown at <=96px -> resize in place.
Both stay visually identical at their rendered sizes.
"""
import base64
import io
import os
import re

from PIL import Image

IMAGES = os.path.join(os.path.dirname(__file__), "..", "public", "images")


def optimize_paper():
    svg_path = os.path.join(IMAGES, "paper.svg")
    out_path = os.path.join(IMAGES, "paper.webp")
    with open(svg_path, "r", encoding="utf-8", errors="ignore") as f:
        svg = f.read()
    m = re.search(r"base64,([A-Za-z0-9+/=]+)", svg)
    if not m:
        print("  paper.svg: no embedded raster found, skipping")
        return
    raw = base64.b64decode(m.group(1))
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    before = os.path.getsize(svg_path)
    # Tiled at 500px; 640px wide covers it with headroom for retina.
    w = 640
    h = round(img.height * (w / img.width))
    img = img.resize((w, h), Image.LANCZOS)
    img.save(out_path, "WEBP", quality=72, method=6)
    after = os.path.getsize(out_path)
    print(f"  paper.svg {before//1024}K -> paper.webp {after//1024}K")


def optimize_avatar():
    p = os.path.join(IMAGES, "avatarPlaceholder.png")
    if not os.path.exists(p):
        print("  avatarPlaceholder.png missing, skipping")
        return
    before = os.path.getsize(p)
    img = Image.open(p)
    img = img.convert("RGBA") if img.mode in ("RGBA", "LA", "P") else img.convert("RGB")
    img = img.resize((128, 128), Image.LANCZOS)
    img.save(p, "PNG", optimize=True)
    after = os.path.getsize(p)
    print(f"  avatarPlaceholder.png {before//1024}K -> {after//1024}K")


if __name__ == "__main__":
    optimize_paper()
    optimize_avatar()
