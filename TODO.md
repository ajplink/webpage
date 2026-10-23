# TODO — Plink site rework

## Ricardo's batches (23 Oct) — work in this order

- [x] **Navbar wordmark broken** — cause: the ink/spark paths were swapped
      (word drew in invisible yellow). Fixed.
- [x] **Team page: remove the useless headers, circles and "these people make
      this happen" talk** — names are self-explanatory.
- [x] **Home: the self-writing wordmark not showing while it writes** — same
      swapped-path bug, fixed; reveal verified progressive.
- [x] **Footer**: remove the footerText line, keep it small, social media as
      icons (no YouTube), links horizontal.
- [x] **Change the font** — open-source preferred.
- [x] **Use more of the width of the page**.
- [x] **404 page speaks only one language** — make it trilingual-bilingual.
- [x] **HTML blobs in built pages** — generated output (Astro compression):
      left alone as instructed.
- [x] **Repo organisation**: logo SVGs out of the root into assets/, folder
      for team photos.
- [x] **Remove the lamp logo from the navbar** — keep only the written one.
- [x] **Wordmark words black or white** (pure, per scheme).
- [x] **Revolver motif** — the square lamp logo has 4 circles; scrolling down
      should step through them like a revolver (scroll-driven animation).
- [x] **Animate the theme and language buttons** (micro-interactions).
- [x] **Remove US English — two languages are enough** (pt + en-gb); retire
      en-us content to an archive folder (nothing is deleted).
- [ ] **"The site still feels very boring"** — overall energy pass (revolver
      motif, animations, motion on scroll where it earns its place).

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
