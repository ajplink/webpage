/**
 * Localized route table — the single place where URL slugs live.
 *
 * Every page key maps to a slug per locale, so URLs are localized
 * (/pt/sobre/ vs /en-us/about/) while content slugs stay identical across
 * locales (/pt/eventos/robotica-de-verao/ ↔ /en-us/events/robotica-de-verao/).
 *
 * To rename a URL: change one line here. Nothing else needs editing.
 */
import { LOCALES, SITE, type Locale } from '../config/site';

type Slugs = Record<Locale, string>;

export const ROUTES = {
  /** Home (empty slug → /pt/). */
  home: { pt: '', 'en-us': '', 'en-gb': '' },
  about: { pt: 'sobre', 'en-us': 'about', 'en-gb': 'about' },
  team: { pt: 'equipa', 'en-us': 'team', 'en-gb': 'team' },
  events: { pt: 'eventos', 'en-us': 'events', 'en-gb': 'events' },
  news: { pt: 'noticias', 'en-us': 'news', 'en-gb': 'news' },
  projects: { pt: 'projetos', 'en-us': 'projects', 'en-gb': 'projects' },
  join: { pt: 'juntar', 'en-us': 'join', 'en-gb': 'join' },
  privacy: { pt: 'privacidade', 'en-us': 'privacy', 'en-gb': 'privacy' },
} satisfies Record<string, Slugs>;

export type RouteKey = keyof typeof ROUTES;

/** Route keys that own detail pages, mapped to their content collection. */
export const SECTION_COLLECTIONS = {
  events: 'events',
  news: 'news',
  projects: 'projects',
} as const satisfies Partial<Record<RouteKey, 'events' | 'news' | 'projects'>>;

export type SectionKey = keyof typeof SECTION_COLLECTIONS;

/** Page keys that are plain (content-driven or listing) pages, no detail children. */
export const PAGE_KEYS = ['about', 'team', 'events', 'news', 'projects', 'join', 'privacy'] as const satisfies readonly RouteKey[];

/** URL path (with trailing slash) for a route, optionally for one entry. */
export function href(locale: Locale, key: RouteKey, entrySlug?: string): string {
  const parts = [locale, ROUTES[key][locale], entrySlug].filter((p): p is string => Boolean(p));
  return `/${parts.join('/')}/`;
}

/** Absolute URL for a route. */
export function absoluteUrl(locale: Locale, key: RouteKey, entrySlug?: string): string {
  return `${SITE.url.replace(/\/$/, '')}${href(locale, key, entrySlug)}`;
}

/** hreflang alternates for a route, one entry per locale. */
export function alternates(key: RouteKey, entrySlug?: string): Record<Locale, string> {
  return Object.fromEntries(LOCALES.map((l) => [l, href(l, key, entrySlug)])) as Record<Locale, string>;
}

/** Reverse lookup: localized slug → route key (for a given locale). */
export function routeKeyForSlug(locale: Locale, slug: string): RouteKey | undefined {
  return (Object.keys(ROUTES) as RouteKey[]).find((k) => ROUTES[k][locale] === slug);
}

/** Reverse lookup: localized section prefix → section key (for a given locale). */
export function sectionKeyForPrefix(locale: Locale, prefix: string): SectionKey | undefined {
  return (Object.keys(SECTION_COLLECTIONS) as SectionKey[]).find((k) => ROUTES[k][locale] === prefix);
}
