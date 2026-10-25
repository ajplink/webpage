#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow", "numpy"]
# ///
"""
penpath.py — derives the writing path of the wordmark.

    uv run scripts/penpath.py

The word is ONE SINGLE STROKE (Ricardo, 24 Oct 2026): the pen never lifts.
p -> bridge -> l -> bridge -> i -> n -> bridge -> k, where each "bridge" is
the connecting ink between letters and is simply ridden along.

The k (Ricardo's labelling): it arrives on the bridge (1), dips to the stem's
bottom tip (4), up the stem (3), over the top of the tall loop, down the
right strand (2), through the crossing, makes the 2nd loop (5), then the
3rd loop / the knot (7 -> 6), and out the leg (8) — the word ends at the
rightmost tip.

Geometry: a smooth curve through the choreography anchors, then snapped to
the ink skeleton (the true centerline), so the pencil hugs the letterforms.

Output: src/assets/logo/source/pen-route.txt — ONE SVG path (one line), in
artwork coordinates (viewBox 483 1214 3083 1503).

The k is special: its route comes from Ricardo's reference trace (accepted
24 Oct 2026, saved verbatim in src/assets/logo/source/k-route.txt) — the
descent dives to the stem's bottom tip (4), returns, makes the hook (the
2nd loop), hairpins around the knot's sliver (the 3rd loop) and exits on
the leg (8). The points are snapped to the skeleton like everything else.
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

# ---------------------------------------------------------- choreography
# ONE stroke, in writing order (artwork units). Labels name the motion.
ANCHORS = [
    # --- p: up the stem, the descender dip, the bowl, out towards the l
    ("p: leftmost tail tip, the start",  516, 2322),
    ("p: the tail rises",              640, 2250),
    ("p: tail joins the stem",         775, 2170),
    ("p: up to the top of the stem",   830, 1900),
    ("p: DOWN the stem",               810, 2100),
    ("p: into the descender",          817, 2450),
    ("p: the descender tip",           819, 2712),
    ("p: back up the stem",            822, 2450),
    ("p: top of the stem again",       835, 1960),
    ("p: bowl, top left",              905, 1875),
    ("p: bowl, top",                  1015, 1855),
    ("p: bowl, upper right",          1105, 1935),
    ("p: bowl, right",                1114, 2040),
    ("p: bowl, lower right",          1067, 2170),
    ("p: bowl, bottom",                975, 2250),
    ("p: bowl closes at the stem",     878, 2262),
    ("p: leaves towards the l",       1180, 2255),
    ("p: the exit junction",           1302, 2180),
    # --- l (Ricardo's monoline drawing): the bridge rises straight into the
    # loop's RIGHT strand, over the apex, down the LEFT strand, and the
    # descent turns into the stem and the exit flick. A teardrop + flick —
    # no fork, no retrace.
    ("bridge: p to l",                 1310, 2185),
    ("l: the junction",                1425, 2072),
    ("l: right strand, low",           1470, 2010),
    ("l: right strand, mid",           1510, 1830),
    ("l: right strand, high",          1560, 1500),
    ("l: near the apex, right",        1600, 1370),
    ("l: the apex",                    1545, 1262),
    ("l: the apex junction",           1576, 1255),
    ("l: the apex junction, left",     1504, 1279),
    ("l: left strand, top",            1470, 1330),
    ("l: left strand, mid",            1420, 1550),
    ("l: left strand, low",            1378, 1900),
    ("l: the junction again",          1425, 2072),
    ("l: the stem",                    1412, 2160),
    ("l: stem base",                   1449, 2289),
    ("l: exit right",                  1520, 2310),
    ("l: the exit flick junction",     1490, 2313),
    ("bridge: l to i",                 1606, 2276),
    ("bridge: l to i, end",            1655, 2265),
    # --- i + n
    ("i: up the left strand, base",    1655, 2265),
    ("i: up the left strand",          1695, 2100),
    ("i: the top",                     1728, 1988),
    ("i: down the right strand",       1765, 2110),
    ("i: the bottom",                  1805, 2265),
    ("i: exit right",                  1968, 2270),
    ("n: rise into arch 1",            2085, 2135),
    ("n: arch 1 apex",                 2268, 1968),
    ("n: the middle leg",              2295, 2332),
    ("n: rise into arch 2",            2450, 2055),
    ("n: arch 2 apex",                 2516, 1918),
    ("n: the exit leg",                2695, 2298),
    ("n: connector to the k",          2875, 2335),
    ("n: the bridge junction",         2853, 2320),
    # --- k (Ricardo's drawing, 24 Oct): the numbers are the writing order.
    # 1 the bridge -> up the DIAGONAL to the fork -> 2 up the RIGHT strand
    # (like an l) -> apex -> 3 down the left strand and the stem -> 4 the
    # stem's bottom tip (a dip) -> back up the OTHER strand (the diagonal)
    # -> 5 the hook -> 7 -> 6 the knot hairpin -> 8 the leg, out.
    ("k: the bridge (1)",              2925, 2352),
    ("k: the diagonal junction",       2983, 2197),
    ("k: up the diagonal",             3020, 2245),
    ("k: the fork",                    3079, 2053),
    ("k: right strand, low (2)",       3170, 1960),
    ("k: right strand, mid",           3245, 1620),
    ("k: right strand, high",          3215, 1390),
    ("k: the apex",                    3145, 1270),
    ("k: the apex junction",           3100, 1303),
    ("k: left strand, top (3)",        3060, 1330),
    ("k: left strand, mid",            2985, 1600),
    ("k: the stem, high",              2948, 1950),
    ("k: the stem, low",               2952, 2150),
    ("k: the stem's tip (4)",          2965, 2385),
    ("k: back up the diagonal",        3020, 2245),
    ("k: the fork again",              3079, 2053),
    ("k: into the hook (5)",           3235, 1975),
    ("k: the hook's top",              3320, 1925),
    ("k: the hook's right",            3422, 2018),
    ("k: the hook, coming down",       3312, 2098),
    ("k: the hook descent junction",   3271, 2152),
    ("k: the knot junction",           3288, 2180),
    ("k: the knot's bottom edge",      3240, 2225),
    ("k: the knot's left extreme",     3132, 2252),
    ("k: the knot's top edge (7)",     3150, 2205),
    ("k: the knot, out",               3245, 2160),
    ("k: the knot exit junction",      3319, 2207),
    ("k: the leg (8)",                 3378, 2228),
    ("k: the leg dips",                3490, 2315),
    ("k: the rightmost point, done",   3595, 2352),
]



def snap(vx, vy):
    """nearest ink-skeleton point (the centerline)"""
    d = (skel_pts[:, 0] - px(vx)) ** 2 + (skel_pts[:, 1] - py(vy)) ** 2
    return tuple(skel_pts[int(np.argmin(d))])


# the crossing points: the midline has gaps at the junctions (the thinning
# erodes the crossing blobs), so these anchors are NOT snapped — they are
# the points the static artwork doesn't need and the write does (Ricardo).
JUNCTION_LABELS = {
    "p: the exit junction",
    "l: the apex",
    "l: the apex junction",
    "l: the apex junction, left",
    "l: stem base",
    "l: the exit flick junction",
    "n: the bridge junction",
    "k: the diagonal junction",
    "k: the fork",
    "k: the fork again",
    "k: the apex junction",
    "k: the hook descent junction",
    "k: the knot junction",
    "k: the knot exit junction",
    "bridge: l to i",
    "bridge: l to i, end",
}

# the ink tips where the pen turns back (the skeleton stops short of these)
TIP_LABELS = {
    "p: up to the top of the stem",
    "p: the descender tip",
    "i: the top",
    "n: the middle leg",
    "k: the stem's tip (4)",
}


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


def snap_walk(points, radius=14, keep=()):
    """slide every point onto the centerline, keeping continuity; points at
    crossing junctions stay put (the midline has gaps there)"""
    out = []
    prev = None
    for x, y in points:
        if any((x - k[0]) ** 2 + (y - k[1]) ** 2 < 12 * 12 for k in keep):
            out.append((x, y))
            prev = (x, y)
            continue
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


def reach_tips(points, tips, extra=12.0):
    """push turnarounds through the ink tips: the skeleton stops short of the
    brush's bulbous ends, so each tip anchor aims the path at the ink and a
    touch beyond — the pencil's round cap then covers the rest."""
    out = points.copy()
    for tx, ty in tips:
        i = int(np.argmin((out[:, 0] - tx) ** 2 + (out[:, 1] - ty) ** 2))
        prev = out[max(0, i - 3)]
        d = np.array([tx, ty], dtype=float) - prev
        n = float(np.hypot(*d))
        out[i] = np.array([tx, ty], dtype=float) + (d / n * extra if n > 1e-6 else 0)
    return out


def extend_ends(points, end=8.0):
    out = [points[0]]
    for j in range(1, len(points)):
        seg = points[j] - points[0]
        if float(np.hypot(*seg)) > 1e-6:
            out[0] = points[0] - seg / np.hypot(*seg) * end
            break
    for i in range(1, len(points) - 1):
        out.append(points[i])
    tail = points[-1]
    for j in range(len(points) - 2, -1, -1):
        seg = points[-1] - points[j]
        if float(np.hypot(*seg)) > 1e-6:
            tail = points[-1] + seg / np.hypot(*seg) * end
            break
    out.append(tail)
    return np.array(out)


# --------------------------------------------------------------- strands
# The route is one stroke, but the REVEAL is per strand: each strand's ink
# may only appear when the pen rides THAT strand (Ricardo, 24 Oct: the
# crossings must feel like actual writing). The strand list below cuts the
# anchors into the ink's strands — anywhere two strands come within the
# pencil's width (crossings, hairpins, forks), they must be separate.
UNIT_STARTS = [
    ("p-body",     "p: leftmost tail tip, the start"),
    ("p-bowl",     "p: bowl, top left"),
    ("bridge-pl",  "p: leaves towards the l"),
    ("l-up",       "l: the junction"),
    ("l-down",     "l: left strand, top"),
    ("bridge-li",  "l: exit right"),
    ("i-up",       "i: up the left strand, base"),
    ("in-b",       "i: down the right strand"),
    ("in-c",       "n: rise into arch 2"),
    ("k-diag",     "k: the bridge (1)"),
    ("k-up",       "k: right strand, low (2)"),
    ("k-stem",     "k: left strand, top (3)"),
    ("k-retrace",  "k: back up the diagonal"),
    ("k-hook",     "k: into the hook (5)"),
    ("k-knot-a",   "k: the knot's bottom edge"),
    ("k-knot-b",   "k: the knot's top edge (7)"),
    ("k-leg",      "k: the leg (8)"),
]


def extend_start(points, end=8.0):
    for j in range(1, len(points)):
        seg = points[j] - points[0]
        if float(np.hypot(*seg)) > 1e-6:
            return np.vstack([points[0] - seg / np.hypot(*seg) * end, points])
    return points


def extend_stop(points, end=8.0):
    tail = points[-1]
    for j in range(len(points) - 2, -1, -1):
        seg = points[-1] - points[j]
        if float(np.hypot(*seg)) > 1e-6:
            tail = points[-1] + seg / np.hypot(*seg) * end
            break
    return np.vstack([points, tail])


def build(anchors):
    if len(anchors) == 1:
        anchors = anchors * 2
    pts = [snap(vx, vy) if label not in JUNCTION_LABELS else (px(vx), py(vy))
           for label, vx, vy in anchors]
    c = catmull(pts)
    keep = [np.array([px(vx), py(vy)]) for label, vx, vy in anchors if label in JUNCTION_LABELS]
    c = snap_walk(c, keep=keep)
    c = reach_tips(c, [(px(x), py(y)) for label, x, y in anchors if label in TIP_LABELS])
    return resample(c)


starts = {label: name for name, label in UNIT_STARTS}
groups = []
for entry in ANCHORS:
    if entry[0] in starts:
        groups.append([starts.pop(entry[0]), []])
    groups[-1][1].append(entry)

strands = []
for name, anchors in groups:
    c = build(anchors)
    if name == UNIT_STARTS[0][0]:
        c = extend_start(c)
    if name == UNIT_STARTS[-1][0]:
        c = extend_stop(c)
    strands.append((name, c))

# passes that ride the same ink share one claim (a pen that retraces its own
# strand owns that ink once — no seams, no pen writing like a printer)
GROUP = {name: ("diag" if name in ("k-diag", "k-retrace") else name) for name, _ in strands}
gidx = {}
for name, _ in strands:
    gidx.setdefault(GROUP[name], len(gidx))

lengths = [sum(float(np.hypot(*(b - a))) for a, b in zip(c, c[1:])) or 1.0 for _, c in strands]
total = sum(lengths)
run = 0.0
units = []
all_pts = []
for (name, c), ln in zip(strands, lengths):
    units.append({
        "name": name,
        "claim": gidx[GROUP[name]],
        "d": " ".join(f"{'M' if i == 0 else 'L'}{ux(x):.0f},{uy(y):.0f}" for i, (x, y) in enumerate(c)),
        "start": round(run / total, 4),
        "len": round(ln / total, 4),
    })
    all_pts.append(c)
    print(f"  strand {name:11s} window {run / total:.3f} +{ln / total:.3f}")
    run += ln

curve = np.vstack(all_pts)
d = " ".join(f"{'M' if i == 0 else 'L'}{ux(x):.0f},{uy(y):.0f}" for i, (x, y) in enumerate(curve))

worst = 0
off = []
for x, y in curve:
    xi, yi = int(round(x)), int(round(y))
    for r in range(1, 30):
        if any(ink[min(H - 1, max(0, yi + dy)), min(W - 1, max(0, xi + dx))]
               for dy in range(-r, r + 1) for dx in range(-r, r + 1)):
            if r > 2:
                off.append((r, ux(x), uy(y)))
            worst = max(worst, r)
            break
print(f"one stroke: {len(curve)} points, max {worst}px off the ink")
for r, x, y in sorted(off, reverse=True)[:5]:
    print(f"  {r}px off near art ({x:.0f},{y:.0f})")

OUT.write_text(d + "\n")

# ------------------------------------------------- ownership mask images
# Every ink pixel belongs to the pen whose path passes closest (ties go to
# the later pen — it paints over, like a hand). This is the exact Voronoi
# of the strands: rasterised and saved as mask images, because a band can
# only approximate it and cut strands against each other.
import json
from PIL import Image as _Image, ImageDraw as _Draw

CLAIMS = ROOT / "src/assets/logo/source/claims"
CLAIMS.mkdir(exist_ok=True)
h, w = ink.shape
owner = np.zeros((h, w), dtype=np.int16) - 1
dist = np.full((h, w), 1 << 30, dtype=np.int32)
for name, c in strands:
    si = gidx[GROUP[name]]
    pts = [(float(x), float(y)) for x, y in c]
    step = np.full((h, w), 1 << 30, dtype=np.int32)
    im = _Image.new("L", (w, h), 0)
    dr = _Draw.Draw(im)
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        dr.line((x0, y0, x1, y1), fill=255, width=2)
    r = 1
    for x, y in pts:
        dr.ellipse((x - r, y - r, x + r, y + r), fill=255)
    near = np.array(im) > 0
    step[near] = 1
    # grow the band ring by ring: the first ring that reaches a pixel is its
    # distance to this strand
    cur = near.copy()
    ring = 1
    frontier = near.copy()
    while frontier.any() and ring < 240:
        im2 = _Image.new("L", (w, h), 0)
        dr2 = _Draw.Draw(im2)
        rr = ring + 1
        for x, y in pts[::3]:
            dr2.ellipse((x - rr, y - rr, x + rr, y + rr), fill=255)
        grown = np.array(im2) > 0
        new = grown & ~cur
        step[new] = ring + 1
        cur = grown
        frontier = new
        ring += 1
    better = step < dist  # ties keep the first pen (it painted that ink)
    upd = better & (step < (1 << 30))
    owner[upd] = si
    dist[upd] = step[upd]

# junction blobs: ink near a crossing belongs wholly to the earliest pen
# whose path passes through the crossing
p2 = [np.roll(np.roll(skel.astype(np.uint8), dy, 0), dx, 1) for dy, dx in
      ((-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1))]
junc = skel & (sum(p2) >= 3)
# only the real crossings (size-filtered clusters), not thinning noise
from collections import deque as _dq
_seen = np.zeros_like(junc)
_big = []
for jy, jx in zip(*np.where(junc)):
    if _seen[jy, jx]:
        continue
    q = _dq([(jy, jx)]); _seen[jy, jx] = True; pts = []
    while q:
        cy, cx = q.popleft(); pts.append((cy, cx))
        for dy in range(-3, 4):
            for dx in range(-3, 4):
                ny, nx = cy + dy, cx + dx
                if 0 <= ny < h and 0 <= nx < w and junc[ny, nx] and not _seen[ny, nx]:
                    _seen[ny, nx] = True; q.append((ny, nx))
    if len(pts) >= 10:
        _big.append((int(np.mean([a for a, _ in pts])), int(np.mean([b for _, b in pts]))))
J_R = 20
for jy, jx in _big:
    if not ink[jy, jx]:
        continue
    best_si, best_d = -1, 1 << 30
    for name, c in strands:
        d = min((x - jx) ** 2 + (y - jy) ** 2 for x, y in c)
        if d < best_d:
            best_d, best_si = d, gidx[GROUP[name]]
    if best_d <= J_R * J_R:
        y0, y1 = max(0, jy - J_R), min(h, jy + J_R + 1)
        x0, x1 = max(0, jx - J_R), min(w, jx + J_R + 1)
        disk = np.zeros((h, w), dtype=bool)
        yy, xx = np.ogrid[:h, :w]
        disk |= ((yy - jy) ** 2 + (xx - jx) ** 2) <= J_R * J_R
        owner[ink & disk] = best_si

# the ink tips: one bulb of ink, painted whole by the pen that dips in
for label, vx, vy in ANCHORS:
    if label not in TIP_LABELS:
        continue
    jx, jy = px(vx), py(vy)
    best_si, best_d = -1, 1 << 30
    for name, c in strands:
        d = min((x - jx) ** 2 + (y - jy) ** 2 for x, y in c)
        if d < best_d:
            best_d, best_si = d, gidx[GROUP[name]]
    yy, xx = np.ogrid[:h, :w]
    disk = ((yy - jy) ** 2 + (xx - jx) ** 2) <= 24 * 24
    owner[ink & disk] = best_si

for _ in range(2):
    smoothed = owner.copy()
    for si in range(len(strands)):
        votes = np.zeros(owner.shape, dtype=np.int16)
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                votes += (np.roll(np.roll(owner, dy, 0), dx, 1) == si)
        smoothed[(votes >= 5) & (owner != si) & ink] = si
    owner = smoothed

for si in range(len(groups)):
    m = np.where(ink & (owner == si), 255, 0).astype(np.uint8)
    _Image.fromarray(m, "L").save(CLAIMS / f"claim-{si:02d}.png")
print(f"ownership masks: {len(strands)} written to {CLAIMS.relative_to(ROOT)}")
leftover = int((ink & (owner < 0)).sum())
print(f"ink owned by nobody: {leftover}px")

import json
UNITS = ROOT / "src/assets/logo/source/pen-units.json"
UNITS.write_text(json.dumps(units, indent=1) + "\n")
print(f"-> {OUT.relative_to(ROOT)} (1 stroke, {len(units)} strands)")
print(f"-> {UNITS.relative_to(ROOT)}")
