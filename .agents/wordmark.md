# Wordmark animation — how it works and what is left

The home hero writes "plink" in front of the user. This file records the
current model, the tuning knobs, and the verification method.

## The model

The word is **ONE SINGLE STROKE** (Ricardo, 24 Oct 2026) — the pen never
lifts. `scripts/penpath.py` (run with `uv run scripts/penpath.py`) derives
the path and writes `src/assets/logo/source/pen-route.txt` (one SVG path,
one line, artwork coordinates, viewBox 483 1214 3083 1503).

The route:

1. **p** — tail up the stem, down into the descender, back up, the bowl,
   out to the l.
   *bridge* (the connector ink is ridden, never skipped).
2. **l** — the right strand first (Ricardo: the right loop before the left),
   over the apex, down the left strand, down the stem, out to the i.
   The junction below the loop is a **Y-fork**: the bridge joins the stem's
   top and just above it the stem forks into the loop's two strands — the
   stem's top segment is therefore ridden twice (up, then down).
3. **i + n** — the i hairpin, the n's two arches, out.
   *bridge*.
4. **k** — **taken verbatim from Ricardo's reference trace**
   (`src/assets/logo/source/k-route.txt`, accepted 24 Oct 2026): bridge in,
   up the stem and the loop, down the right strand and the steep strand to
   the stem's bottom tip (a dip), **retrace back up**, into the hook (the
   2nd loop), hairpin around the knot's sliver (the 3rd loop), out the leg
   to the word's rightmost point. The reference points are centred on the
   ink skeleton (nearest-point snapping) but never reordered or re-shaped.

Geometry pipeline in `penpath.py`: choreography anchors → Catmull-Rom →
snap to the ink skeleton (Zhang-Suen thinning) → `reach_tips` (aim the
turnarounds through the ink tips — the skeleton stops short of the brush's
bulbous ends) → resample at even spacing (constant pen speed).

## The reveal (`src/components/Logo.astro`)

- The mask is one stroke: `<use href="#pen-route">` with `stroke-dasharray`
  sweeping the path over `--draw-duration`.
- **The pencil is 62** — the real brush width (Ricardo, 24 Oct: "option a,
  by far"). Each pass paints only its own strand; junctions do not bloom.
  The brush's thicker spots stay hidden until the settle fade — that is the
  trade, and the right one.
- **Soft leading edge**: the mask's pen band carries a small
  `feGaussianBlur` (10 units) so ink soaks in behind the tip instead of
  hard-cutting through dense ink.
- **The marker tip**: a zero-length dash with a round cap
  (`stroke-dasharray: 0 2000`) slides along the very same path, exactly at
  the reveal's leading edge, in `--logo-spark` yellow. It fades as the
  sparks blink in. `Logo.astro` reads `pen-route.txt` via `?raw` — the route
  lives in one place only, never pasted into the component.
- **Settle**: missed specks fade in over the last beat (0.95 → 1.0).
- **Sparks**: the three yellow strokes blink in at 0.88 → 1.0.
- Reduced motion: the finished word immediately, no tip, no blink.

## Knobs

- `--draw-duration` in `src/styles/tokens.css` — overall speed.
- Pencil width: `stroke-width` on `.wordmark-pen` in `Logo.astro` (**62**).
- Softness: `feGaussianBlur` `stdDeviation` (**10**).
- The dev-only slider under the word (home page, `npm run dev`): drag to
  trace the writing frame by frame.

## Verifying

The dev scrubber + element screenshots + comparing the yellow tip's
centroid against `#pen-route.getPointAtLength(p * L)` in the page. Last
run (24 Oct 2026): tip error 0.5–0.8 px at p = 0.30/0.55/0.80, revealed
ink grows monotonically (993 → 2243 sampled px live), reduced motion shows
the finished word immediately with the tip's computed opacity 0.

## Performance

The write is the page's only expensive animation — measured (25 Oct 2026,
Lighthouse mobile emulation, `/pt/`):

- with the write: performance 71–79, ~0.6–1 s of main-thread blocking over
  its 1.6 s;
- with the write disabled: 91–99, blocking 37–340 ms.

Cause: the ink is one ~3000-unit path re-rasterised every frame through
nested image + dash masks, once per strand. Two mitigations are already
in place:

1. The two Latin woff2 faces are preloaded in `Base.astro` (first content
   paint on `/pt/` measured 1.8 s → 1.13 s).
2. The write is held paused until load + a free frame
   (`html.js:not(.wordmark-go)` in `Logo.astro`, released by `robot.js`),
   so the page paints and is interactive immediately and the word writes
   a beat later. Without JS nothing pauses; reduced motion shows the
   finished word.

**Recorded option, not built:** to make the write itself free, replace the
stroke reveal with pre-sliced static reveals — ~48 copies of each strand
whose `stroke-dasharray` windows each show one slice of the path, faded in
sequence (opacity is compositor-only: rasterise once, cross-fade), with
the marker dot as a transform-animated marker. Same look, no per-frame
raster. It reworks this model's internals, so it needs Ricardo's nod
before it is attempted. Cheaper lever in the meantime: `--draw-duration`
(1.6 → 1.2 s cuts the work by a quarter).

## Iterating (the workflow that worked)

1. Edit the anchors in `scripts/penpath.py` (each is labelled with the
   motion it represents). The k's reference points are in `k-route.txt` —
   edit those only with Ricardo's blessing.
2. `uv run scripts/penpath.py` — reports each stroke's distance from the
   ink (expect ~1px on the skeleton-snapped parts; up to ~9px at the
   deliberate tip overshoots) and writes `pen-route.txt`.
3. `npm run build`, scrub with the slider, get Ricardo's eyes on it.

## Related

- The artwork: `src/assets/logo/nome.svg` (Ricardo's), paths extracted to
  `src/assets/logo/source/nome-v2-{ink,spark}.txt`.
- The sparks (the i's dot) blink in at the end of the write.
- `.agents/wordmark.md` history: the multi-stroke model (23 Oct, four
  strokes with pen lifts) is gone — git has it if it is ever needed.
