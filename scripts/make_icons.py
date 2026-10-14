#!/usr/bin/env python3
"""Generate the extension icon (black scissors on blue) as SVG + PNGs, plus the store promo tile.

Original geometry defined here; no external artwork. Requires Pillow.
Usage: python3 scripts/make_icons.py
"""
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ICON_DIR = ROOT / "icons"
STORE_DIR = ROOT / "store"
SIZES = [16, 32, 48, 128]
SUPERSAMPLE = 8

BLUE = "#1565c0"
BLACK = "#111111"
PIVOT = "#9e9e9e"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# All coordinates in a 128x128 design space.
CORNER_RADIUS = 24
RING_OUTER, RING_INNER = 16, 9
HALVES = [
    {"ring": (42, 100), "start": (50, 86), "tip": (86, 10)},
    {"ring": (86, 100), "start": (78, 86), "tip": (42, 10)},
]


def blade_polygon(start, tip, w_start=5.0, w_mid=6.5, mid=0.35):
    sx, sy = start
    tx, ty = tip
    dx, dy = tx - sx, ty - sy
    length = math.hypot(dx, dy)
    nx, ny = -dy / length, dx / length
    mx, my = sx + dx * mid, sy + dy * mid
    return [
        (sx + nx * w_start, sy + ny * w_start),
        (mx + nx * w_mid, my + ny * w_mid),
        (tx, ty),
        (mx - nx * w_mid, my - ny * w_mid),
        (sx - nx * w_start, sy - ny * w_start),
    ]


def pivot_point():
    (ax, ay), (bx, by) = HALVES[0]["start"], HALVES[0]["tip"]
    x = 64
    t = (x - ax) / (bx - ax)
    return x, ay + (by - ay) * t


def shapes():
    """Yield (kind, data, color) in paint order."""
    yield "rect", None, BLUE
    for half in HALVES:
        yield "circle", (half["ring"], RING_OUTER), BLACK
        yield "circle", (half["ring"], RING_INNER), BLUE
    for half in HALVES:
        yield "polygon", blade_polygon(half["start"], half["tip"]), BLACK
    yield "circle", (pivot_point(), 3.5), PIVOT


def to_svg():
    parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">']
    for kind, data, color in shapes():
        if kind == "rect":
            parts.append(f'<rect width="128" height="128" rx="{CORNER_RADIUS}" fill="{color}"/>')
        elif kind == "circle":
            (cx, cy), r = data
            parts.append(f'<circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r}" fill="{color}"/>')
        else:
            pts = " ".join(f"{x:.2f},{y:.2f}" for x, y in data)
            parts.append(f'<polygon points="{pts}" fill="{color}"/>')
    parts.append("</svg>")
    return "\n".join(parts) + "\n"


def render(size):
    big = size * SUPERSAMPLE
    s = big / 128
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    for kind, data, color in shapes():
        if kind == "rect":
            draw.rounded_rectangle([0, 0, big - 1, big - 1], radius=CORNER_RADIUS * s, fill=color)
        elif kind == "circle":
            (cx, cy), r = data
            draw.ellipse([(cx - r) * s, (cy - r) * s, (cx + r) * s, (cy + r) * s], fill=color)
        else:
            draw.polygon([(x * s, y * s) for x, y in data], fill=color)
    return img.resize((size, size), Image.LANCZOS)


def promo_tile():
    w, h = 440, 280
    tile = Image.new("RGB", (w, h), "#0d47a1")
    icon = render(128)
    tile.paste(icon, (36, (h - 128) // 2), icon)
    draw = ImageDraw.Draw(tile)
    draw.text((186, 92), "Coupon", font=ImageFont.truetype(FONT, 34), fill="white")
    draw.text((186, 132), "Clip All", font=ImageFont.truetype(FONT, 34), fill="white")
    draw.text((186, 182), "Unofficial helper for", font=ImageFont.truetype(FONT_REGULAR, 14), fill="#bbdefb")
    draw.text((186, 200), "kroger.com digital coupons", font=ImageFont.truetype(FONT_REGULAR, 14), fill="#bbdefb")
    return tile


def main():
    ICON_DIR.mkdir(exist_ok=True)
    STORE_DIR.mkdir(exist_ok=True)
    (ICON_DIR / "icon.svg").write_text(to_svg())
    for size in SIZES:
        render(size).save(ICON_DIR / f"icon-{size}.png")
    promo_tile().save(STORE_DIR / "promo-small-440x280.png")
    print("wrote", ", ".join(f"icons/icon-{n}.png" for n in SIZES), "icons/icon.svg, store/promo-small-440x280.png")


if __name__ == "__main__":
    main()
