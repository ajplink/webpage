# TODO — Plink site rework

Dump captured from Ricardo. Check items off as they land; every item is a promise.

## Brand & identity

- [x] **Lightbulb logo** — favicon is the lightbulb (`public/favicon.svg`, mirrors
      `src/components/Bulb.astro`); ripple mark retired.
- [ ] **One-stroke handwritten "plink" wordmark** — working placeholder letterforms
      in `src/components/Logo.astro` (one path + three yellow sparks as the i-dot);
      **Ricardo sends the proper SVG — swap the path and done.**
- [x] **The wordmark writes itself in front of the user** — stroke-draw animation on
      the home hero, sparks pop at the end, `prefers-reduced-motion` shows the
      end state.
- [ ] **All graphics are icons/SVG** — every visual asset (toggle icons, flags, UI
      icons, decorative motifs, dummy portraits) is inline or local SVG. No emoji,
      no third-party images. (theme icons + flags done)

## Theme & language

- [x] **Light + dark mode with a manual toggle** — sun/moon SVG pill in the header;
      choice persists across pages; falls back to `prefers-color-scheme` with no
      JS. Tiny external `theme.js` (CSP-safe: `script-src 'self'`) as the one
      documented progressive enhancement.
- [x] **Dark scheme parity** — dark tokens extended to cover the palette colours;
      `npm run contrast` green in both schemes.
- [x] **Language switcher becomes a dropdown with flags** — `details`-based dropdown
      (still zero JS), flag SVG per locale (PT / US / UK), current language shown.
- [x] **No click/hover gimmicks on buttons** — the hover lift + sticker shadow are
      gone; buttons just change colour.

## Sócios (membership)

- [ ] **Split "Sócios" into two pages**:
  - [ ] **Tornar-me Sócio** — sign-up page; **lists the benefits of being an
        associate** (what you get, how it works, how to join).
  - [ ] **Área de Sócio** — members check their personal info, membership status,
        fees; static placeholder + clear path to real access (no backend in v1).
- [ ] **No membership spam on the front page** — at most one quiet link; no big
      membership CTA block in the home flow.

## New pages

- [ ] **Donations page** (Doações) — how to support, what money buys, IBAN / MB WAY
      placeholders, transparency note.
- [ ] **Sponsors page** (Apoios/Parceiros) — sponsor tiers, placeholder sponsor logo
      grid (local SVGs), "become a sponsor" CTA.

## Content

- [ ] **Team page rework**:
  - [ ] **Full department names** (not bare acronyms) — Direção, DREE, DP, DL, DCI
        spelled out (expansions are PLACEHOLDER until Ricardo confirms).
  - [ ] **Real headcount per department**: Direção 4, DREE 5, DP 7, + DL/DCI to
        match "etc." (placeholder counts, easy to adjust).
  - [ ] **Big pictures with actual dummy profile pictures** — generated local SVG
        portraits (no initials-only cards), one per member.
  - [ ] **Carousel** — members shown in a carousel per department (CSS-only,
        scroll-snap, keyboard accessible).
- [ ] **More events** — several new placeholder events (upcoming *and* past) so the
      events page and home have real rhythm.
- [ ] **About page redesign** — currently reads like a bad wiki; rebuild as a proper
      designed page (structure, hierarchy, personality).

## Design & tone

- [ ] **Design overhaul — stop being square and bland** — more generous radii,
      playful shapes and motifs, asymmetric layouts, sticker/badge energy where it
      fits; still calm and editorial, still the same tokens discipline.
- [ ] **Use the palette** — blue, pink, yellow, green and orange all get real screen
      time (departments, sections, cards, motifs), not just one accent.
- [ ] **Voice** — funny and easygoing, but serious when it matters (mission,
      safeguarding, money). Copy pass across pages.

## Plumbing (follows from the above)

- [ ] Routes + nav + UI strings for the new pages in all three locales
      (`routes.ts`, `ui.ts`, `site.ts`, footer).
- [ ] Keep `.agents/` guides and AGENTS.md in sync with the real decisions
      (theme toggle, new pages, avatar generation).
- [ ] Verification: `npm run build` (0 errors/0 warnings), `npm run contrast`,
      preview + 320 px + keyboard + reduced-motion checks, Lighthouse ≥ 95.
