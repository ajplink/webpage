/**
 * robots.txt — generated so it always points at the configured origin.
 * Everything is indexable; no AI/scraper exceptions; no analytics.
 */
import { SITE } from '../config/site';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE.url}/sitemap-index.xml`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
