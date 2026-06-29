#!/usr/bin/env python3
"""One-off: convert the TTF fonts actually used by the app to WOFF2.

WOFF2 is ~50-70% smaller than TTF and is already compressed, so it both
shrinks the network payload and removes the need for server-side font
compression. Glyph coverage is preserved (no subsetting) so nothing visual
changes.
"""
import os
from fontTools.ttLib import TTFont

FONTS_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "fonts")

# Fonts referenced by app/layout.tsx (next/font/local)
USED = [
    "Roboto-Regular", "Roboto-Light", "Roboto-Medium", "Roboto-SemiBold", "Roboto-Bold",
    "Montserrat-Thin", "Montserrat-Light", "Montserrat-Regular",
    "Montserrat-SemiBold", "Montserrat-Bold", "Montserrat-Black",
    "ZillaSlab-Regular", "ZillaSlab-Bold", "ZillaSlab-Italic",
    "AlteHaasGroteskRegular", "AlteHaasGroteskBold",
    "kalpurush",
]

# Fonts that are declared-but-unused or never referenced -> remove entirely
DEAD = [
    "PlayfairDisplay-Regular", "PlayfairDisplay-Italic", "PlayfairDisplay-Bold",
    "LeagueSpartan_Variable",
    "Montserrat-Italic",  # never declared in layout.tsx
]


def main():
    fonts_dir = os.path.abspath(FONTS_DIR)
    converted = 0
    saved = 0
    for name in USED:
        ttf = os.path.join(fonts_dir, name + ".ttf")
        woff2 = os.path.join(fonts_dir, name + ".woff2")
        if not os.path.exists(ttf):
            print(f"  SKIP (missing): {name}.ttf")
            continue
        before = os.path.getsize(ttf)
        f = TTFont(ttf)
        f.flavor = "woff2"
        f.save(woff2)
        after = os.path.getsize(woff2)
        saved += before - after
        converted += 1
        print(f"  {name}: {before//1024}K -> {after//1024}K woff2")
        # remove the now-unreferenced TTF so it isn't deployed
        os.remove(ttf)

    for name in DEAD:
        ttf = os.path.join(fonts_dir, name + ".ttf")
        if os.path.exists(ttf):
            saved += os.path.getsize(ttf)
            os.remove(ttf)
            print(f"  removed dead font: {name}.ttf")

    print(f"\nConverted {converted} fonts, freed ~{saved//1024}K")


if __name__ == "__main__":
    main()
