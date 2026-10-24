/**
 * icons.ts — the site's icon shapes: ONE source of truth.
 *
 * Every icon is hand-drawn on a 24×24 grid (live area 2–22), stroked with
 * 2 units, round caps and joins — see Icon.astro for the rendering. A name
 * maps to a single SVG path data string, possibly with several subpaths;
 * everything is stroke-only geometry (dots are `v.01` round-cap strokes), so
 * the very same strings can be stroked on a `<path>` or in a canvas through
 * `Path2D` (the About page's cradle draws its in-ball glyphs from here).
 *
 * To add a glyph: draw it here, use it through <Icon name="…" />. Never a
 * raster, never an emoji, never a one-off inline SVG.
 */

export type IconName =
  | 'calendar'
  | 'pin'
  | 'ticket'
  | 'newspaper'
  | 'flask'
  | 'book'
  | 'megaphone'
  | 'heart'
  | 'coin'
  | 'users'
  | 'star'
  | 'check'
  | 'mail'
  | 'shield'
  | 'rocket'
  | 'spark'
  | 'bulb'
  | 'menu'
  | 'chevron'
  | 'instagram'
  | 'linkedin';

export const ICON_PATHS: Record<IconName, string> = {
  /* kinds of content */
  calendar:
    'M5.25 6.5h13.5a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5H5.25A2.5 2.5 0 0 1 2.75 17V9a2.5 2.5 0 0 1 2.5-2.5zM8 3.5v5M16 3.5v5M2.75 11h18.5M12 14.8v.01',
  ticket:
    'M3.5 8.5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v1.2a2.3 2.3 0 0 0 0 4.6v1.2a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-1.2a2.3 2.3 0 0 0 0-4.6zM14.5 7v10',
  newspaper:
    'M4 5h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zM2 9.25h20M5 12.25h6v4.5H5zM14 13h5M14 16h5',
  flask:
    'M9.75 3.5h4.5M10.75 3.5v6.3l-4.4 8.1a2.1 2.1 0 0 0 1.8 3.1h7.7a2.1 2.1 0 0 0 1.8-3.1l-4.4-8.1V3.5M8 14.8h8M11 17.8v.01',
  pin: 'M12 21.2c4.1-4.3 6.6-7.7 6.6-10.7a6.6 6.6 0 1 0-13.2 0c0 3 2.5 6.4 6.6 10.7zM13.9 10.4a1.9 1.9 0 1 1-3.8 0 1.9 1.9 0 0 1 3.8 0z',

  /* the values */
  rocket:
    'M12 2.6c3 2 4.7 5.3 4.7 8.7l-2 2.6H9.3l-2-2.6c0-3.4 1.7-6.7 4.7-8.7zM13.7 10.2a1.7 1.7 0 1 1-3.4 0 1.7 1.7 0 0 1 3.4 0zM9.6 13.6L7.2 19.2l3.4-1.2 1.4 2.4 1.4-2.4 3.4 1.2-2.4-5.6',
  users:
    'M9.2 11.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM2.8 20c0-3.3 2.9-6 6.4-6s6.4 2.7 6.4 6M16.2 5.2a3.6 3.6 0 0 1 0 7M17.6 14.2c2.5.7 3.9 2.7 3.9 5.4',
  book: 'M12 7.2C9.8 5.5 7 4.9 3.5 5.1v12.5c3.5-.2 6.3.4 8.5 2.1 2.2-1.7 5-2.3 8.5-2.1V5.1c-3.5-.2-6.3.4-8.5 2.1zM12 7.2v12.5',
  heart:
    'M12 20.2c-4.8-3.2-8.4-6.3-8.4-10.1a4.6 4.6 0 0 1 8.4-2.6 4.6 4.6 0 0 1 8.4 2.6c0 3.8-3.6 6.9-8.4 10.1z',
  spark: 'M12 3.2c.7 4.6 3.4 7.3 8 8-4.6.7-7.3 3.4-8 8-.7-4.6-3.4-7.3-8-8 4.6-.7 7.3-3.4 8-8z',

  /* the rest of the cast */
  coin: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM14.8 8.6a3.8 3.8 0 1 0 0 6.8M8.8 10.4h4.8M8.8 13.6h4.8',
  star: 'M12 3.6l2.65.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z',
  check: 'M4.8 12.8l4.6 4.6L19.2 7.4',
  mail: 'M3 7.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3.6 7.2l8.4 5.8 8.4-5.8',
  shield:
    'M12 2.8l8 2.9v6c0 5.1-3.3 8.9-8 10-4.7-1.1-8-4.9-8-10v-6zM8.6 12.2l2.6 2.6 4.4-4.8',
  megaphone:
    'M4 10.2v3.6a1 1 0 0 0 1 1h2.2L14 19V5l-6.8 4.2H5a1 1 0 0 0-1 1zM17.6 9.2a4 4 0 0 1 0 5.6M8 14.9l1.2 4.1',
  bulb: 'M12 3.2a5.7 5.7 0 0 0-3.4 10.3c.8.6 1.3 1.4 1.4 2.3h4c.1-.9.6-1.7 1.4-2.3A5.7 5.7 0 0 0 12 3.2zM9.6 17.8h4.8M10.2 20.4h3.6',
  menu: 'M4 7h16M4 12h16M4 17h16',
  chevron: 'M6.5 9.5l5.5 5.5 5.5-5.5',

  /* social */
  instagram:
    'M4.5 8a3.5 3.5 0 0 1 3.5-3.5h8A3.5 3.5 0 0 1 19.5 8v8a3.5 3.5 0 0 1-3.5 3.5H8A3.5 3.5 0 0 1 4.5 16zM12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2zM16.7 7.3v.01',
  linkedin:
    'M4.5 8a3.5 3.5 0 0 1 3.5-3.5h8A3.5 3.5 0 0 1 19.5 8v8a3.5 3.5 0 0 1-3.5 3.5H8A3.5 3.5 0 0 1 4.5 16zM8 10.6V17M8 7.2v.01M12 17v-3.7a2.3 2.3 0 0 1 4.6 0V17',
};
