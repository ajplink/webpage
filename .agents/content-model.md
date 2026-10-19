# Content model

Five collections, validated by Zod schemas in `src/content.config.ts`
(Astro content layer, `glob()` loaders). One file per item, per locale folder
(see [i18n.md](i18n.md)).

| Collection | File | Key fields | Body |
| --- | --- | --- | --- |
| `team` | `src/content/team/<locale>/<slug>.md` | `name`, `role`, `department` (DREE/DP/DL/DCI/Direção), `bio`, `photo?`, `links?`, `order?`, `active` | unused (bio is a field) |
| `events` | `src/content/events/<locale>/<slug>.md` | `title`, `date`, `endDate?`, `location`, `summary`, `registrationUrl?`, `cancelled`, `cover?` | full description |
| `news` | `src/content/news/<locale>/<slug>.md` | `title`, `date`, `summary`, `tags[]`, `draft`, `cover?` | MDX post |
| `projects` | `src/content/projects/<locale>/<slug>.md` | `title`, `summary`, `status` (idea/active/completed), `tags[]`, `leads[]` (references to `team`), `links?`, `hasSimulation`, `cover?` | full description |
| `pages` | `src/content/pages/<locale>/<slug>.md` | `title`, `summary?` | page text (`about`, `join`, `privacy` — file names are fixed keys) |

## Derived, never stored

- **Event status** (`upcoming` / `past` / `cancelled`): `eventStatus()` in
  `src/lib/content.ts` derives it from `endDate ?? date` (a date-only value
  covers its whole day). Only `cancelled: true` is hand-set.
- **Publication**: `draft: true` (news) excludes the entry from listings, feeds,
  sitemap and page generation. Drafts are still schema-validated on purpose.
- **Lead names**: `projectLeads()` resolves `leads` references in the viewer's
  locale by slug.

## References

`leads: [pt/<slug>]` — always the **pt** entry id (`reference('team')`).
The resolver strips the locale and finds the localized version of the person.

## Validation rules worth remembering

- `date` fields accept `AAAA-MM-DD` and are coerced to `Date` (`z.coerce.date()`).
- URLs must be absolute (`z.url()`).
- `tags` are lowercase identifiers, identical across locales (not translated).
- Images live in `src/assets/` and are referenced **relative to the content
  file** (`../../../assets/covers/x.png` from `src/content/<col>/<locale>/`).
- YAML gotcha: quote any text value containing `": "` (`summary: "Ideia: …"`).

## Placeholder content

The shipped entries are examples (`# ENTRADA DE EXEMPLO` comments and
"conteúdo de exemplo" notes). Replace them before going live; do not invent
real people, partners or statistics meanwhile.
