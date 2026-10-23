/**
 * Localized content access.
 *
 * Content lives in one file per item PER LOCALE:
 *   src/content/<collection>/<locale>/<slug>.md
 *
 * This module resolves a collection for a requested locale:
 *   1. the entry in the requested locale, if it exists;
 *   2. otherwise the first entry along the fallback chain (site.ts FALLBACKS),
 *      ending at the default locale — the page is still generated;
 *   3. structural fields (dates, tags, status, order…) always come from the
 *      default-locale (pt) file when it exists, so translations cannot drift;
 *      text fields (title, summary, role, location) come from the translated file.
 */
import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';
import { DEFAULT_LOCALE, FALLBACKS, LOCALES, type Locale } from '../config/site';

/**
 * Frontmatter fields that are text and therefore taken from the translated
 * file (everything else is structural and always comes from the pt file).
 */
const TEXT_FIELDS = ['title', 'summary', 'role', 'location', 'bio', 'links'] as const;

/** The social bodies, in display order (Órgãos Sociais on the team page). */
export const ORGAOS_SOCIAIS = ['Direção', 'Conselho Fiscal', 'Mesa da Assembleia'] as const;

/** The departments, in display order. */
export const DEPARTMENTS = ['DREE', 'DP', 'DL', 'DCI'] as const;

/** Every team body, in display order. */
export const TEAM_GROUPS = [...ORGAOS_SOCIAIS, ...DEPARTMENTS] as const;
export type Department = (typeof TEAM_GROUPS)[number];

/** One brand-palette accent per body (token references, not colours). */
export const DEPT_ACCENT: Record<Department, string> = {
  'Direção': 'var(--palette-blue)',
  'Conselho Fiscal': 'var(--palette-orange)',
  'Mesa da Assembleia': 'var(--palette-green)',
  DREE: 'var(--palette-pink)',
  DP: 'var(--palette-yellow)',
  DL: 'var(--palette-orange)',
  DCI: 'var(--palette-blue)',
};

/** An entry resolved for one locale, with provenance information. */
export type LocalizedEntry<C extends CollectionKey> = CollectionEntry<C> & {
  /** Locale of the file actually used (may differ from the requested one). */
  locale: Locale;
  /** Stable slug, identical across locales. */
  slug: string;
  /** True when the text came from a fallback locale. */
  isFallback: boolean;
};

const LOCALE_SET = new Set<string>(LOCALES);

/** Split a content id ("pt/ana-exemplo") into locale + slug. */
export function idParts(id: string): { locale: Locale; slug: string } {
  const slash = id.indexOf('/');
  const head = slash === -1 ? id : id.slice(0, slash);
  if (LOCALE_SET.has(head)) {
    return { locale: head as Locale, slug: id.slice(slash + 1) };
  }
  // A file outside a locale folder counts as default-locale content.
  return { locale: DEFAULT_LOCALE, slug: id };
}

function pickText(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of TEXT_FIELDS) {
    if (data[key] !== undefined) out[key] = data[key];
  }
  return out;
}

function mergeEntry<C extends CollectionKey>(
  entry: CollectionEntry<C>,
  baseEntry: CollectionEntry<C> | undefined,
  requested: Locale,
): LocalizedEntry<C> {
  const { locale, slug } = idParts(entry.id);
  const data =
    baseEntry && baseEntry !== entry
      ? ({ ...baseEntry.data, ...pickText(entry.data as Record<string, unknown>) } as CollectionEntry<C>['data'])
      : entry.data;
  return { ...entry, data, locale, slug, isFallback: locale !== requested } as unknown as LocalizedEntry<C>;
}

/** All entries of a collection resolved for one locale, in file order. */
export async function localizedEntries<C extends CollectionKey>(
  collection: C,
  locale: Locale,
): Promise<LocalizedEntry<C>[]> {
  const all = await getCollection(collection);
  const bySlug = new Map<string, Map<Locale, CollectionEntry<C>>>();

  for (const entry of all) {
    const { locale: entryLocale, slug } = idParts(entry.id);
    let versions = bySlug.get(slug);
    if (!versions) {
      versions = new Map();
      bySlug.set(slug, versions);
    }
    versions.set(entryLocale, entry);
  }

  const resolved: LocalizedEntry<C>[] = [];
  for (const versions of bySlug.values()) {
    const chain: Locale[] = [locale, ...FALLBACKS[locale], DEFAULT_LOCALE];
    const entry =
      chain.map((l) => versions.get(l)).find((e) => e !== undefined) ?? [...versions.values()][0];
    resolved.push(mergeEntry(entry, versions.get(DEFAULT_LOCALE), locale));
  }
  return resolved;
}

/** One entry by slug, resolved for one locale (undefined when missing everywhere). */
export async function localizedEntry<C extends CollectionKey>(
  collection: C,
  locale: Locale,
  slug: string,
): Promise<LocalizedEntry<C> | undefined> {
  const entries = await localizedEntries(collection, locale);
  return entries.find((e) => e.slug === slug);
}

/** Drafts are validated but never published. Anything without `draft: true` is public. */
export function isPublished<C extends CollectionKey>(entry: LocalizedEntry<C>): boolean {
  return (entry.data as { draft?: boolean }).draft !== true;
}

/* ----------------------------------------------------------------- events */

export type EventStatus = 'upcoming' | 'past' | 'cancelled';

/**
 * Status is ALWAYS derived from the dates — never typed by hand:
 * - cancelled when the entry says so explicitly;
 * - upcoming until the end of the last day of the event;
 * - past afterwards.
 */
export function eventStatus(event: LocalizedEntry<'events'>): EventStatus {
  if (event.data.cancelled) return 'cancelled';
  const lastDay = event.data.endDate ?? event.data.date;
  // A date-only value covers the whole day in any timezone.
  const end = lastDay.getTime() + 24 * 60 * 60 * 1000 - 1;
  return end >= Date.now() ? 'upcoming' : 'past';
}

/** Events split by derived status: upcoming (soonest first) and past (most recent first). */
export async function eventsByStatus(
  locale: Locale,
): Promise<{ upcoming: LocalizedEntry<'events'>[]; past: LocalizedEntry<'events'>[] }> {
  const entries = await localizedEntries('events', locale);
  const upcoming: LocalizedEntry<'events'>[] = [];
  const past: LocalizedEntry<'events'>[] = [];
  for (const entry of entries) {
    (eventStatus(entry) === 'past' ? past : upcoming).push(entry);
  }
  upcoming.sort((a, b) => a.data.date.getTime() - b.data.date.getTime());
  past.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  return { upcoming, past };
}

/* -------------------------------------------------------------------- news */

/** Published news, most recent first. */
export async function publishedNews(locale: Locale): Promise<LocalizedEntry<'news'>[]> {
  const entries = await localizedEntries('news', locale);
  return entries.filter(isPublished).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/* ---------------------------------------------------------------- projects */

const STATUS_ORDER: Record<'idea' | 'active' | 'completed', number> = { active: 0, idea: 1, completed: 2 };

/** All projects, active first, then ideas, then completed. */
export async function projects(locale: Locale): Promise<LocalizedEntry<'projects'>[]> {
  const entries = await localizedEntries('projects', locale);
  return entries.sort((a, b) => STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status]);
}

/**
 * Project leads resolved as localized team entries.
 * `leads` references always point at the pt entry id (see CONTRIBUTING.md);
 * the referenced member's slug is then resolved in the requested locale.
 */
export async function projectLeads(
  project: LocalizedEntry<'projects'>,
  locale: Locale,
): Promise<LocalizedEntry<'team'>[]> {
  const wanted = new Set(project.data.leads.map((ref) => idParts(ref.id).slug));
  const team = await localizedEntries('team', locale);
  return team.filter((member) => wanted.has(member.slug));
}

/* -------------------------------------------------------------------- team */

/** Active team members grouped by department, honouring `order` then name. */
export async function teamByDepartment(
  locale: Locale,
): Promise<{ department: Department; members: LocalizedEntry<'team'>[] }[]> {
  const entries = (await localizedEntries('team', locale))
    .filter((m) => m.data.active)
    .sort(
      (a, b) =>
        (a.data.order ?? Number.MAX_SAFE_INTEGER) - (b.data.order ?? Number.MAX_SAFE_INTEGER) ||
        a.data.name.localeCompare(b.data.name),
    );
  return TEAM_GROUPS.map((department) => ({
    department,
    members: entries.filter((m) => m.data.department === department),
  })).filter((group) => group.members.length > 0);
}
