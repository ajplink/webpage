# Wordmark animation — how it works and what is left

The home hero writes "plink" in front of the user. This file records the
current model, the tuning knobs, and the open defects (Ricardo, 23 Oct 2026:
park this and come back to it).

## The model

The word is **not one stroke**. `scripts/penpath.py` (run with
`uv run scripts/penpath.py`) derives the pen path(s) and writes
`src/assets/logo/source/pen-route.txt` — one SVG path per line:

1. **p** — tail → up the stem → down into the descender → back up → the bowl
   (closed onto the stem) → out from under the bowl.
   *pen lift*
2. **l** — the loop (the LaTeX `ℓ`): begins on the **right** of the crossing,
   up the right strand, apex, down the left strand, through the crossing
   (its left half is claimed HERE, not by the ascent), down the stem (the
   vertical), out to the i.
3. **i + n** — the i hairpin (up the left strand, down the right), then the n
   (arch, middle leg, arch, exit leg).
   *pen lift*
4. **k** — starts just like an l (right of its loop, up, apex, down, the
   vertical) → then a loop, a smaller loop (the knot) → the leg out; the
   path ENDS at the rightmost point of the word.

Ordering rule: where strokes cross, the LATER stroke claims the crossing's
ink. That is why the l's ascent starts on the right half of the crossing.

Each stroke gets its own time window of `--draw-duration`, proportional to
its arc length (constant pen speed). Windows are baked into
`src/components/Logo.astro` (`--w-start` / `--w-len` on each pen path);
`scripts/penpath.py` prints them after each run.

## Knobs

- `--draw-duration` in `src/styles/tokens.css` — overall speed.
- Pencil width: `stroke-width` on the pen paths in `Logo.astro`
  (currently **94** = the artwork's brush width).
- The dev-only slider under the word (home page, `npm run dev`): drag to
  trace the writing frame by frame.

## Iterating (the workflow that worked)

1. Edit the anchors in `scripts/penpath.py` (each is labelled with the
   motion it represents).
2. `uv run scripts/penpath.py` — reports each stroke's distance from the
   ink (keep it ≤ ~2px) and prints the speed windows.
3. Regenerate/rewire `Logo.astro` (the paths and windows), `npm run build`,
   then trace with the slider and get Ricardo's eyes on it.

The routes are snapped to the ink skeleton (the true centerline) after a
Catmull-Rom through the anchors — do not hand-place points on the ink, place
anchors and let the snap do the geometry.

## Open defects (parked)

- **Parts of the word are missing**: some ink is not claimed by any stroke's
  band (the pencil is 94 but the paths hug the centerline; corners/ends of
  strokes can stay uncovered until the settle fade). Widen the ends of the
  strokes or add anchor coverage at stroke starts/stops.
- **The k is still wrong** — the hardest letter. Its loop/knot/leg needs a
  second pass against Ricardo's tracing; it also has one 13px deviation
  from the ink (the only stroke not at 1–2px).
- **Speed felt inconsistent** before the arc-length windows; re-check the
  feel now that each stroke's duration is proportional to its length.
- **Point spacing** was uneven; `resample()` now spaces points evenly
  (6 render px). Tune `step` if the motion feels steppy.

## Related

- The artwork: `src/assets/logo/nome.svg` (Ricardo's), paths extracted to
  `src/assets/logo/source/nome-v2-{ink,spark}.txt`.
- The sparks (the i's dot) blink in at the end of the write.
- Reduced motion: the finished word shows immediately.
