#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""
penpath.py — derives the writing path of the wordmark.

    uv run scripts/penpath.py

The ORDER is Ricardo's choreography (23 Oct 2026):

  p: start at the leftmost point -> up -> down into the descender ->
     back up -> the p curve -> from the bowl's bottom leave to the l
  l: up the loop's left side, over the top, down through the crossing
     (once) -> down to the baseline -> out
  i, n: straightforward
  k: up the loop, down through the crossing, the little knot, then the
     leg out -> FINISH at the rightmost point. Never return to the p.

The GEOMETRY between those anchors is not hand-guessed: the script thins
the ink to its skeleton (the true centerline) and walks the shortest path
along it between consecutive anchors — so the route hugs the letterforms
exactly and follows the sequence above.

Output: src/assets/logo/source/pen-route.txt (one continuous SVG path in
artwork coordinates, viewBox 483 1214 3083 1503).
"""

import heapq
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ART = ROOT / "src/assets/logo/nome.svg"
OUT = ROOT / "src/assets/logo/source/pen-route.txt"

# ---------------------------------------------------------------- render
with tempfile.NamedTemporaryFile(suffix=".png") as tmp:
    subprocess.run(["rsvg-convert", "-w", "900", str(ART), "-o", tmp.name], check=True)
    img = Image.open(tmp.name).convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    gray = np.array(Image.alpha_composite(bg, img).convert("L"))

ink = gray < 128
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
            keep = (img == 1) & (neighbours >= 2) & (neighbours <= 6) & (transitions == 1)
            if sub == 0:
                keep &= (p[0] * p[2] * p[4] == 0) & (p[2] * p[4] * p[6] == 0)
            else:
                keep &= (p[0] * p[2] * p[6] == 0) & (p[0] * p[4] * p[6] == 0)
            if keep.any():
                img[keep] = 0
                changed = True
    return img.astype(bool)


skel = thin(ink)
pts = [(int(x), int(y)) for y, x in np.argwhere(skel)]
point_set = set(pts)

# artwork user units <-> render px
ux = lambda x: 483 + (x / W) * 3083
uy = lambda y: 1214 + (y / H) * 1503
px = lambda vx: (vx - 483) / 3083 * W
py = lambda vy: (vy - 1214) / 1503 * H


# ------------------------------------------------------ choreography
# (artwork user units; each is snapped to the nearest skeleton point)
ANCHORS = [
    ("p: leftmost point, the start",  490, 2300),
    ("p: up to the top of the stem",  830, 1960),
    ("p: down into the descender",    822, 2715),
    ("p: back up the stem",           845, 1985),
    ("p: over the top of the curve",  990, 1890),
    ("p: right side of the curve",   1110, 2030),
    ("p: bottom of the curve",        990, 2280),
    ("p: leave towards the l",       1240, 2380),
    ("l: up the left of the loop",   1330, 1800),
    ("l: top of the loop",           1450, 1300),
    ("l: down through the crossing", 1540, 2080),
    ("l: baseline, out",             1620, 2420),
    ("i: top",                       1760, 2020),
    ("i: bottom, out",               1880, 2430),
    ("n: first arch",                2180, 1900),
    ("n: between the arches",        2360, 2430),
    ("n: second arch",               2570, 1900),
    ("n: out",                       2760, 2430),
    ("k: up the left of the loop",   3010, 1800),
    ("k: top of the loop",           3120, 1310),
    ("k: down through the crossing", 3190, 2100),
    ("k: the little knot",           3145, 2195),
    ("k: the leg kicks out",         3350, 2330),
    ("k: the rightmost point, done", 3560, 2270),
]


def snap(vx, vy):
    return min(pts, key=lambda p: (p[0] - px(vx)) ** 2 + (p[1] - py(vy)) ** 2)


# ------------------------------------------------ shortest path along ink
neigh = {
    p: [(p[0] + dx, p[1] + dy) for dy in (-1, 0, 1) for dx in (-1, 0, 1)
        if (dx or dy) and (p[0] + dx, p[1] + dy) in point_set]
    for p in pts
}


def path_between(a, b):
    dist = {a: 0.0}
    prev = {}
    queue = [(0.0, a)]
    while queue:
        d, u = heapq.heappop(queue)
        if u == b:
            break
        if d > dist.get(u, float("inf")):
            continue
        for v in neigh[u]:
            nd = d + ((v[0] - u[0]) ** 2 + (v[1] - u[1]) ** 2) ** 0.5
            if nd < dist.get(v, float("inf")):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(queue, (nd, v))
    out = [b]
    while out[-1] != a:
        out.append(prev[out[-1]])
    return out[::-1]


route_px = []
for i, (label, vx, vy) in enumerate(ANCHORS):
    a = snap(vx, vy)
    if i == 0:
        route_px = [a]
    else:
        route_px.extend(path_between(route_px[-1], a)[1:])

# ------------------------------------------------------------ emit
route = [(ux(x), uy(y)) for x, y in route_px]
d = " ".join(f"{'M' if i == 0 else 'L'}{x:.0f},{y:.0f}" for i, (x, y) in enumerate(route))
OUT.write_text(d)
print(f"pen route: {len(route)} points -> {OUT.relative_to(ROOT)}")
print("choreography check (x of each anchor along the route):")
for label, vx, vy in ANCHORS:
    print(f"  x={vx:5.0f} y={vy:5.0f}  {label}")
