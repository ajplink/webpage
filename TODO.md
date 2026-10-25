# TODO — Plink site rework

## Ricardo's batches (23 Oct) — status

- [x] **Wordmark writes properly** — root cause of the cut view: `<mask>`
      default region clips the artwork in Chrome AND Firefox; explicit region
      fixed it. Verified: writes 0→100% by 1.1 s, ticks blink in at 1.4 s.
- [x] **Lights on faster, tighter writing** (final tune: pen stroke 700,
      sparks at 0.88× of the write).
- [x] **Favicon = the three yellow ticks** of the wordmark.
- [x] **Revolver idea — removed** (misunderstood; the component is parked in
      `archive/revolver-component.astro`, nothing deleted).
- [x] **Team = Órgãos Sociais** (Direção, Conselho Fiscal, Mesa da Assembleia)
      + departments with the real names (DREE = Relações Educativas e
      Empresariais, DCI = Comunicação e Imagem, DL/DP confirmed).
- [x] **Carousels auto-scroll** (CSS marquee, pauses on hover/focus, manual
      scroll under reduced motion).
- [x] **Team page stripped** to names and people.
- [x] **Footer**: small, horizontal, icon socials (no YouTube), no tagline.
- [x] **Font**: Bricolage Grotesque Variable (OFL, single family).
- [x] **Wider page** (container 84rem).
- [x] **404 in both languages**.
- [x] **Two locales only** — en-US retired, content archived under `archive/`.
- [x] **Repo organised** — `src/assets/logo/source/` (Ricardo's SVGs),
      `src/assets/team-photos/` (portraits + future real photos).
- [x] **HTML blobs** — generated output, left alone as instructed.
- [x] **Docs synced** (README, CONTRIBUTING, .agents/*).

### Decisions taken while Ricardo was away

- Conselho Fiscal = 3 people, Mesa da Assembleia = 3 (counts not given;
  change in `src/content/team/pt/`).
- Department name expansions as stated by Ricardo; descriptions updated to
  match (DREE now talks about schools + business relations).
- Sparks "blink in" = quick three-step blink, once, at the end of the write.

### Still open (need Ricardo)

- DL (6) and DCI (5) headcounts — my guesses.
- Área de Sócio data source in v1 (mock + email path today).
- Real IBAN / MB WAY (placeholders today).
- Real team photos → drop into `src/assets/team-photos/` and set `photo:`.

---

## Ricardo's batch (24 Oct)

- [x] **Wordmark writes as ONE single stroke** — the multi-stroke model is
      gone; the k follows Ricardo's reference trace verbatim
      (`src/assets/logo/source/k-route.txt`), the l draws the right loop
      first, the pencil is the real brush width (62) with a soft edge, and
      a yellow marker dot rides the leading edge. `.agents/wordmark.md`
      records the model, the knobs and the verification numbers.
- [ ] **Favicon = the three strokes** — the wordmark's three yellow strokes
      again (as in commit `8670031`); the lightbulb favicon I drew is gone.
- [ ] **Newton's cradle: icons inside the balls** — the caption legend is
      replaced by each value's icon drawn on its own ball. Bigger: it takes
      the width left beside the prose. Seamless: no card chrome, the canvas
      sits straight on the page background.
- [ ] **Light/dark switch — proposals for Ricardo**:
      1. **A lâmpada** (chosen) — the mascot bulb, lit (yellow) in light mode,
         off in dark: “turning the lights on/off”. Brand-native, one glyph.
      2. **Sol e lua num slider** — pill with a sun at one end, a moon at the
         other, knob slides between them. Clearest of the conventional ones.
      3. **Sol↔lua morph** — one icon button, the sun folds into a crescent.
      4. **Interruptor de luz** (rocker) — physical wall switch, playful.
- [ ] **Language selector — proposals for Ricardo**:
      1. **Segmented PT | EN** (chosen) — both languages visible at once,
         active segment filled; one click, no menu, same control in mobile nav.
      2. **Dropdown with full names** — “Português / English” rows, bigger
         flags, tick on the current one.
      3. **Globe + code** — globe glyph + “PT” pill, dropdown behind it.
- [ ] **One consistent icon system** — the whole set redrawn on one grid
      (24×24, 2px stroke, round caps/joins), shapes owned by
      `src/lib/icons.ts` (single source of truth for `Icon.astro` *and* the
      cradle's in-ball glyphs). Home cards get a mark chip per kind of
      content (events = ticket, news = newspaper, projects = flask), section
      heads carry the same chip, and the header menu, chevron and footer
      socials stop being hand-rolled one-off SVGs.

---

## Original dump + first follow-ups

## Brand & identity

- [x] **Lightbulb logo + favicon** — `lampada.svg` (Ricardo's SVG) is the mark,
      svgo-optimised (29 KB), served from `/lampada.svg` + used as favicon;
      originals kept untouched at the repo root.
- [x] **One-stroke handwritten "plink" wordmark** — `nome.svg` (Ricardo's SVG),
      ink + sparks recoloured through tokens (dark mode flips the ink).
- [x] **The wordmark writes itself in front of the user** — pen-route mask reveal
      on the home hero, `prefers-reduced-motion` shows the end state.
- [x] **All graphics are icons/SVG** — theme icons, flags, dummy portraits and
      brand marks are all local SVG.

## Theme & language

- [x] **Light + dark mode with a manual toggle** — sun/moon pill in the header,
      persists across pages, OS preference fallback without JS
      (`/theme.js`, the one documented progressive enhancement, CSP-safe).
- [x] **Dark scheme parity** — palette lifts in dark; `npm run contrast` green.
- [x] **Language switcher is a dropdown with flags** — `details`-based, flag SVG
      per locale (PT / US / UK), zero JS.

## Navbar / interaction bugs (explicit asks)

- [x] **Remove the "downglow" on navbar buttons** — the accent bar under the
      active nav item is gone (weight + colour carry the state now); the
      language dropdown had a soft shadow, also removed.
- [x] **Fix the page stutter when clicking navbar buttons** — cause found: the
      theme toggle popped into the navbar at DOMContentLoaded on every page
      load (layout jump). It now reveals via `html.js` set before first paint.
      Dev-server latency measured: 15–20 ms, not the cause.
- [x] **Remove the after-click effects on buttons** — hover lift + sticker
      shadow gone.

## Sócios (membership)

- [ ] **Split "Sócios" into two pages**:
  - [ ] **Tornar-me Sócio** — sign-up + **the benefits of being an associate**.
  - [ ] **Área de Sócio** — members check their personal info, status, fees;
        static placeholder + clear path to real access (no backend in v1).
- [ ] **No membership spam on the front page** — at most one quiet link.

## New pages

- [ ] **Donations page** (Doações) — how to help, what money buys, IBAN / MB WAY
      placeholders, transparency note.
- [ ] **Sponsors page** (Apoios/Parceiros) — tiers, placeholder sponsor logos
      (local SVGs), "become a sponsor" CTA.

## Content

- [x] **Team page rework**:
  - [x] **Full department names** spelled out (expansions PLACEHOLDER until
        Ricardo confirms): Direção, DREE, DP, DL, DCI.
  - [x] **Headcounts**: Direção 4, DREE 5, DP 7, DL 6, DCI 5 (27 total;
        DL/DCI are guesses — see questions).
  - [x] **Big dummy profile pictures** — `scripts/avatars.mjs` generates a
        distinct SVG portrait per member (seeded by name).
  - [x] **Carousel per department** — CSS scroll-snap, focusable region,
        arrow keys scroll, zero JS.
- [ ] **More events** — several new placeholder events (upcoming and past).
- [ ] **About page redesign** — currently reads like a bad wiki.

## Design & tone

- [ ] **Design overhaul — stop being square and bland** — soft radii, playful
      shapes/motifs, asymmetric layouts, sticker energy where it fits.
- [ ] **Use the palette** — blue, pink, yellow, green, orange all get real
      screen time across pages.
- [ ] **Voice** — funny and easygoing, serious when it matters (mission, money).
      Copy pass across pages.
- [ ] **The three cover PNGs** are near-identical placeholders shown only on
      detail pages — replace with distinct art or drop.

## Plumbing & housekeeping

- [ ] Routes + nav + UI strings for the new pages in all three locales.
- [ ] README/AGENTS/.agents sync: repo map update (Logo, Bulb, Flag,
      ThemeToggle), theme.js decision recorded.
- [ ] Verification: `npm run build` (0 errors/warnings), `npm run contrast`,
      preview + 320 px + keyboard + reduced-motion, Lighthouse ≥ 95.

## Questions for Ricardo (answered: …)

- Department full names: real expansions for DREE / DP / DL / DCI?
- DL and DCI headcounts ("etc.")?
- Área de Sócio "check their info": where does the data come from in v1 —
  external form link, email, or a placeholder mock-up?
- Donation details: real IBAN / MB WAY now or keep placeholders?
