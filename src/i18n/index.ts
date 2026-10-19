/**
 * i18n helpers: UI translation, language tags and date formatting.
 * Route helpers live in ./routes.ts.
 */
import { HTML_LANG, type Locale } from '../config/site';

export { t, type UIKey } from './ui';

/** BCP-47 language tag for <html lang> and <meta> attributes. */
export function htmlLang(locale: Locale): string {
  return HTML_LANG[locale];
}

/** Date formatting with the locale's conventions (pt-PT, en-US, en-GB). */
export function formatDate(locale: Locale, date: Date, options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(HTML_LANG[locale], options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

/** Date range for multi-day events ("10–12 mar 2026"). */
export function formatDateRange(locale: Locale, start: Date, end?: Date): string {
  if (!end || sameDay(start, end)) return formatDate(locale, start);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()}–${formatDate(locale, end)}`;
  }
  return `${formatDate(locale, start)} – ${formatDate(locale, end)}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}
