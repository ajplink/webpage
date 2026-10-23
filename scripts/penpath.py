#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""
penpath.py — derives the writing path(s) of the wordmark.

    uv run scripts/penpath.py

The word is NOT one stroke (Ricardo, 23 Oct 2026): the p writes itself, then
the pen lifts to the l's loop (starting at its right side), writes l-i-n,
lifts again and writes the k starting just like an l (loop -> vertical ->
a loop -> a smaller loop -> the leg out).

Ordering rule: where strokes cross, the ink of the LATER stroke is claimed by
the later stroke — e.g. the ascent into the l's loop claims only the right
half of the crossing; the descent claims the left half and the stem later.

Geometry: every stroke is a smooth curve through its choreography anchors,
then snapped to the ink skeleton (the true centerline), so the pencil hugs
the letterforms.

Output: src/assets/logo/source/pen-route.txt — one SVG path per line (one
per stroke), in artwork coordinates (viewBox 483 1214 3083 1503).
"""

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
skel_pts = np.argwhere(skel)[:, ::-1]  # (x, y)

ux = lambda x: 483 + (x / W) * 3083
uy = lambda y: 1214 + (y / H) * 1503
px = lambda vx: (vx - 483) / 3083 * W
py = lambda vy: (vy - 1214) / 1503 * H

# ------------------------------------------------------------- strokes
# (label, [anchors in artwork units]) — order is the writing order.
STROKES = [
    ("p", [
        ("p: leftmost point, the start",   520, 2330),
        ("p: the tail rises",              640, 2250),
        ("p: tail joins the stem",         775, 2170),
        ("p: up to the top of the stem",   830, 1900),
        ("p: DOWN the stem",               810, 2100),
        ("p: into the descender",          817, 2450),
        ("p: the descender tip",           819, 2700),
        ("p: back up the stem",            822, 2450),
        ("p: top of the stem again",       835, 1960),
        ("p: bowl, top left",              905, 1875),
        ("p: bowl, top",                  1015, 1855),
        ("p: bowl, upper right",          1105, 1935),
        ("p: bowl, right",                1114, 2040),
        ("p: bowl, lower right",          1067, 2170),
        ("p: bowl, bottom",                975, 2250),
        ("p: bowl closes at the stem",     885, 2215),
        ("p: leaves towards the l",       1180, 2255),
    ]),
    ("l", [
        # pen lift from the p's connector onto the RIGHT side of the crossing:
        # the ascent claims the crossing's right half only
        ("l: begins on the right of the crossing", 1455, 2085),
        ("l: loop right strand, low",      1470, 2010),
        ("l: loop right strand, mid",      1510, 1830),
        ("l: loop right strand, high",     1560, 1500),
        ("l: near the apex, right",        1600, 1370),
        ("l: the apex",                    1555, 1255),
        ("l: loop left strand, top",       1470, 1330),
        ("l: loop left strand, mid",       1420, 1550),
        ("l: loop left strand, low",       1378, 1900),
        ("l: the crossing, its left half", 1385, 2055),
        ("l: down the stem (the vertical)",1410, 2150),
        ("l: stem base",                   1425, 2285),
        ("l: exit right",                  1520, 2310),
    ]),
    ("in", [
        ("i: up the left strand, base",    1655, 2265),
        ("i: up the left strand",          1695, 2100),
        ("i: the top",                     1728, 2000),
        ("i: down the right strand",       1765, 2110),
        ("i: the bottom",                  1805, 2265),
        ("i: exit right",                  1968, 2270),
        ("n: rise into arch 1",            2085, 2135),
        ("n: arch 1 apex",                 2268, 1968),
        ("n: the middle leg",              2295, 2295),
        ("n: rise into arch 2",            2450, 2055),
        ("n: arch 2 apex",                 2516, 1918),
        ("n: the exit leg",                2695, 2295),
        ("n: connector to the k",          2875, 2335),
    ]),
    ("k", [
        # pen lift: the k starts just like an l — on the right of its loop
        ("k: begins on the right of its loop", 3105, 2225),
        ("k: loop right strand, low",      3130, 2060),
        ("k: loop right strand, mid",      3195, 1875),
        ("k: loop right strand, high",     3245, 1620),
        ("k: near the apex, right",        3215, 1390),
        ("k: the apex",                    3167, 1252),
        ("k: loop left strand, top",       3060, 1330),
        ("k: loop left strand, mid",       2985, 1600),
        ("k: loop left strand, low",       2948, 1950),
        ("k: the vertical, down",          2950, 2150),
        ("k: the vertical at the baseline",2958, 2365),
        ("k: a loop, up right",            3040, 2270),
        ("k: the smaller loop (the knot)", 3110, 2185),
        ("k: the knot loops back",         3185, 2200),
        ("k: the leg kicks out",           3370, 2040),
        ("k: the leg curves down",         3480, 2180),
        ("k: the rightmost point, done",   3559, 2315),
    ]),
]


def snap(vx, vy):
    """nearest ink-skeleton point (the centerline)"""
    d = (skel_pts[:, 0] - px(vx)) ** 2 + (skel_pts[:, 1] - py(vy)) ** 2
    return tuple(skel_pts[int(np.argmin(d))])


def catmull(points, samples=24):
    pts = np.array(points, dtype=float)
    pts = np.vstack([pts[0] + (pts[0] - pts[1]), pts, pts[-1] + (pts[-1] - pts[-2])])
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for t in range(samples):
            t /= samples
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2
                             + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(pts[-2])
    return np.array(out)


def snap_walk(points, radius=14):
    """slide every point onto the centerline, keeping continuity"""
    out = []
    prev = None
    for x, y in points:
        d2 = (skel_pts[:, 0] - x) ** 2 + (skel_pts[:, 1] - y) ** 2
        near = skel_pts[d2 < radius * radius]
        if len(near) == 0:
            out.append((x, y))
            continue
        if prev is None:
            pick = near[int(np.argmin(d2[d2 < radius * radius]))]
        else:
            dp = (near[:, 0] - prev[0]) ** 2 + (near[:, 1] - prev[1]) ** 2
            pick = near[int(np.argmin(dp))]
        prev = (float(pick[0]), float(pick[1]))
        out.append(prev)
    return np.array(out)


def resample(points, step=6.0):
    """even point spacing along the stroke (constant pen speed)"""
    out = [points[0]]
    acc = 0.0
    for a, b in zip(points, points[1:]):
        seg = float(np.hypot(*(b - a)))
        while acc + seg >= step:
            t = (step - acc) / seg
            pt = a + (b - a) * t
            out.append(pt)
            a = pt
            seg = float(np.hypot(*(b - a)))
            acc = 0.0
        acc += seg
    out.append(points[-1])
    return np.array(out)


lines = []
lengths = []
for name, anchors in STROKES:
    curve = catmull([snap(vx, vy) for _, vx, vy in anchors])
    curve = snap_walk(curve)
    curve = resample(curve)
    d = " ".join(f"{'M' if i == 0 else 'L'}{ux(x):.0f},{uy(y):.0f}" for i, (x, y) in enumerate(curve))
    lines.append(d)
    lengths.append(sum(float(np.hypot(*(b - a))) for a, b in zip(curve, curve[1:])) or 1.0)
    # quality check: distance from the ink
    worst = 0
    for x, y in curve:
        xi, yi = int(round(x)), int(round(y))
        for r in range(1, 30):
            if any(ink[min(H - 1, max(0, yi + dy)), min(W - 1, max(0, xi + dx))]
                   for dy in range(-r, r + 1) for dx in range(-r, r + 1)):
                worst = max(worst, r)
                break
    print(f"stroke {name}: {len(curve)} points, max {worst}px off the ink")

OUT.write_text("\n".join(lines))
total = sum(lengths)
run = 0.0
for (name, _), ln in zip(STROKES, lengths):
    print(f"  window {name}: start {run / total:.3f} len {ln / total:.3f}")
    run += ln
print(f"-> {OUT.relative_to(ROOT)} ({len(lines)} strokes)")
