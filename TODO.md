# TODO — Plink site rework

Every topic from Ricardo's prompts. Nothing gets dropped. (Prompts of
23 Oct: the original dump + follow-ups on the wordmark, buttons, navbar,
stutter, team page, codebase, packages.)

## Brand & identity

- [x] **Lightbulb logo + favicon** — `lampada.svg` (Ricardo's SVG) is the mark;
      favicon mirrors it.
- [x] **One-stroke handwritten "plink" wordmark** — `nome.svg` (Ricardo's SVG).
- [x] **The wordmark writes itself in front of the user** — animated on the home
      hero (reveal follows the writing route), `prefers-reduced-motion` shows
      the end state.
- [ ] **All graphics are icons/SVG** — no emoji, no third-party images. Theme
      icons + flags done; dummy team portraits and page motifs pending.
- [ ] **Keep the brand assets clean** — strip Inkscape metadata from the two
      SVGs, originals preserved untouched at the repo root.

## Theme & language

- [x] **Light + dark mode with a manual toggle** — sun/moon pill in the header,
      persists across pages, OS preference fallback without JS
      (`/theme.js`, the one documented progressive enhancement, CSP-safe).
- [x] **Dark scheme parity** — palette lifts in dark; `npm run contrast` green.
- [x] **Language switcher is a dropdown with flags** — `details`-based, flag SVG
      per locale (PT / US / UK), zero JS.

## Navbar / interaction bugs (explicit asks)

- [ ] **Remove the "downglow" on navbar buttons** — whatever draws below the
      nav items must go (accent bar under the active item / any shadow-glow).
- [ ] **Fix the page stutter when clicking navbar buttons** — diagnose the
      real cause (layout shift on load, dev-server latency, or transition)
      with measurements, then fix it.
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

- [ ] **Team page rework (still untouched — do it)**:
  - [ ] **Full department names** spelled out (expansions PLACEHOLDER until
        Ricardo confirms): Direção, DREE, DP, DL, DCI.
  - [ ] **Headcounts**: Direção 4, DREE 5, DP 7, + DL/DCI per "etc.".
  - [ ] **Big dummy profile pictures** — generated local SVG portraits, one per
        member (no initials-only cards).
  - [ ] **Carousel per department** — CSS-only scroll-snap, keyboard accessible.
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
