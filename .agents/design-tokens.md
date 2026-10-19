# Design tokens

`src/styles/tokens.css` is the **only** place where visual values are defined.
Components consume custom properties; nothing visual is hard-coded elsewhere
(synced exceptions: `<meta name="theme-color">` in `Base.astro`, and
`public/favicon.svg` / placeholder images which mirror the palette).

## Blocks in tokens.css

1. **Brand palette** — the seven swappable colours (`--palette-*`): blue, pink,
   yellow, green, orange, black, white. Rebranding = editing these.
2. **Semantic colours** — `--color-*` (bg, surface, text, text-muted, primary,
   primary-contrast, accent, border, focus, tint). Map them to the palette
   without touching components.
3. **Typography** — `--font-sans` / `--font-display` / `--font-mono` (mono is a
   system stack: zero bytes), fluid `--step--1 … --step-5` scale (`clamp()`),
   `--leading-*`, `--tracking-*`.
4. **Space & layout** — fluid `--space-3xs … --space-3xl`, `--measure` (65ch),
   `--container` (72rem), `--radius`, `--shadow`, `--border-width`.
5. **Motion** — `--duration`, `--ease`; all transitions are disabled under
   `prefers-reduced-motion` (in `global.css`).

Dark scheme: a `@media (prefers-color-scheme: dark)` block redefines the same
semantic tokens. No JS toggle in v1.

## Rules

- Contrast: every foreground/background pair must stay WCAG AA (4.5:1 text,
  3:1 UI). Run `npm run contrast` after any colour change — it reads
  tokens.css, resolves `var()` aliases and checks both schemes.
- Yellow is decorative-only (1.85:1 on the light background) — never use it for
  small text.
- Cards use **borders, not shadows** (`--shadow` exists for rare, tiny lift).
- Max two type families (currently Fraunces display + Inter body, both
  self-hosted Latin subsets via `@fontsource-variable`, `font-display: swap`).
- Shared primitives live in `global.css` (`.container`, `.prose`, `.badge`,
  `.grid`, `.button`, `.eyebrow`, `.lead`, `.skip-link`); component-specific
  rules stay scoped inside their `.astro` file.
