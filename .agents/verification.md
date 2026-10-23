# Verification

Evidence before claims. Run these before saying anything is done.

## Always

```bash
npm run build        # astro check && astro build — must be 0 errors, 0 warnings
npm run contrast     # WCAG AA for all token pairs, light + dark
```

## Content changes

- New/edited files must pass schema validation (the build fails otherwise).
- Check both locales of a page: `/pt/…` and `/en-gb/…` (fallback is expected
  where no translation exists — that is not a bug).
- Drafts must NOT appear anywhere (list pages, RSS `/<locale>/rss.xml`, sitemap).

## Visual / behavioural changes

```bash
npm run preview &
# Lighthouse (not a project dependency — run ad hoc):
npx lighthouse http://localhost:4321/pt/ \
  --chrome-flags="--headless=new --no-sandbox" --output=json
```

Targets: **≥ 95** in performance / accessibility / best practices / SEO
(currently 100 across the tested pages) and ≤ 150 KB page weight excluding
images (measure: gzip(HTML) + gzip(CSS) + fetched woff2).

Structural sanity (Playwright + system Chromium works well):

- 320 px viewport: no horizontal overflow (`documentElement.scrollWidth`).
- One `h1` per page; no heading-level jumps.
- First `Tab` focuses the skip link and it becomes visible.
- Keyboard reachability of the mobile `<details>` menu and the project filters.
- No console errors.

## Regression traps to re-check after touching…

- `src/i18n/routes.ts` → canonical + hreflang URLs in page `<head>`,
  LanguageSwitch links, sitemap alternates.
- `src/lib/content.ts` fallback/merge → en-gb page mixing translated and
  fallback text correctly (translated fields come from the translated file).
- `public/_headers` → CSP must not allow third-party origins; COOP/COEP must
  stay commented out except for future `/simulacoes/*`.
- Fonts in `Base.astro` → only Latin subsets fetched (browser network tab),
  `font-display: swap` present.
