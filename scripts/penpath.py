#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""
penpath.py — derives the writing path of the wordmark.

    uv run scripts/penpath.py

Thins the ink of src/assets/logo/nome.svg to its skeleton (the centerline a
pen follows), walks it from the start of the "p" to the final flick of the
"k", and writes ONE continuous SVG path to
src/assets/logo/source/pen-route.txt — Logo.astro uses it as the mask that
makes the word appear exactly as it is written.

Pipeline: render -> binary -> Zhang-Suen thinning -> ordered walk (smooth
direction changes, retrace jumps at dead ends) -> smoothing -> resampled SVG
path in artwork coordinates (viewBox 483 1214 3083 1503).
"""

import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "src/assets/logo/nome.svg"
OUT = ROOT / "src/assets/logo/source/pen-route.txt"
W, H = 900, 439  # render size (artwork aspect 3083:1503)

# ---------------------------------------------------------------- render
with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
    subprocess.run(["rsvg-convert", "-w", str(W), str(ART), "-o", tmp.name], check=True)
    img = Image.open(tmp.name).convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    gray = np.array(Image.alpha_composite(bg, img).convert("L"))

ink = gray < 128  # True = ink
H, W = ink.shape


# ------------------------------------------------- Zhang-Suen thinning
def thin(ink: np.ndarray) -> np.ndarray:
    img = ink.astype(np.uint8)
    changed = True
    while changed:
        changed = False
        for sub in (0, 1):
            p = [np.roll(np.roll(img, dy, 0), dx, 1) for dy, dx in
                 ((-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1))]
            neighbours = sum(p)
            transitions = sum(((p[i] == 0) & (p[(i + 1) % 8] == 1)) for i in range(8))
            keep = (
                (img == 1)
                & (neighbours >= 2)
                & (neighbours <= 6)
                & (transitions == 1)
            )
            if sub == 0:
                keep &= (p[0] * p[2] * p[4] == 0) & (p[2] * p[4] * p[6] == 0)
            else:
                keep &= (p[0] * p[2] * p[6] == 0) & (p[0] * p[4] * p[6] == 0)
            if keep.any():
                img[keep] = 0
                changed = True
    return img.astype(bool)


skel = thin(ink)

# ------------------------------------------------------------- walk
pts = np.argwhere(skel)  # (y, x)
skeleton = {(int(x), int(y)) for y, x in pts}


def neighbours(x, y):
    return [
        (x + dx, y + dy)
        for dy in (-1, 0, 1)
        for dx in (-1, 0, 1)
        if (dx or dy) and (x + dx, y + dy) in skeleton
    ]


# start at the TOP of the "p" (writing begins at the top of the stem);
# the p occupies the leftmost ~20% of the word
p_region = [(x, y) for x, y in skeleton if x < 0.2 * W]
start = min(p_region or skeleton, key=lambda p: p[1])
visited: set[tuple[int, int]] = set()
route: list[tuple[int, int]] = []
cur = start
prev_dir = (1.0, 0.0)

while len(visited) < len(skeleton):
    visited.add(cur)
    route.append(cur)
    options = [p for p in neighbours(*cur) if p not in visited]
    if options:
        # continue along the most similar direction (one smooth pen motion)
        # continue smoothly, with a gentle rightward bias (like a real pen)
        best = max(
            options,
            key=lambda o: (o[0] - cur[0]) * prev_dir[0] + (o[1] - cur[1]) * prev_dir[1] + 0.35 * (o[0] - cur[0]),
        )
        prev_dir = (best[0] - cur[0], best[1] - cur[1])
        cur = best
    else:
        # dead end: retrace / pen-lift to the nearest unvisited skeleton point
        rest = [p for p in skeleton if p not in visited]
        if not rest:
            break
        near = min(rest, key=lambda p: (p[0] - cur[0]) ** 2 + (p[1] - cur[1]) ** 2 - 40 * (p[0] - cur[0]))
        route.append(near)
        visited.add(near)
        prev_dir = (near[0] - cur[0], near[1] - cur[1])
        cur = near

# ------------------------------------------------- smooth + resample
ux = lambda x: 483 + (x / W) * 3083
uy = lambda y: 1214 + (y / H) * 1503
smooth = np.array([(ux(x), uy(y)) for x, y in route], dtype=float)

for _ in range(24):
    smooth[1:-1] = (smooth[:-2] + 2 * smooth[1:-1] + smooth[2:]) / 4

resampled = [smooth[0]]
for pt in smooth[1:]:
    if np.hypot(*(pt - resampled[-1])) >= 18:
        resampled.append(pt)
resampled.append(smooth[-1])

d = " ".join(f"{'M' if i == 0 else 'L'}{x:.0f},{y:.0f}" for i, (x, y) in enumerate(resampled))
OUT.write_text(d)
print(f"pen route: {len(resampled)} points -> {OUT.relative_to(ROOT)}")
