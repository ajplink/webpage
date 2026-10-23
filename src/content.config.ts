/**
 * Content collections for Associação Plink.
 *
 * CONVENTION (see CONTRIBUTING.md): one file per item, per locale folder.
 *
 *   src/content/<collection>/<locale>/<slug>.md
 *   e.g. src/content/events/pt/robotica-de-verao.md
 *        src/content/events/en-us/robotica-de-verao.md   (same <slug>!)
 *
 * - The locale comes from the folder name (never typed in frontmatter).
 * - The `pt` file is the source of truth for structural fields (dates, tags,
 *   status, order…). Translated files only need the text fields translated
 *   (title, summary, role, location) — but they are validated by the same
 *   schema, so copying the pt file and translating it is the easiest path.
 * - A missing translation is fine: the entry falls back to Portuguese and the
 *   page is still generated at its locale URL.
 */
import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Link list used by team and projects: label + absolute URL. */
const link = z.object({
  label: z.string(),
  url: z.url(),
});

const team = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: ({ image }) =>
    z.object({
      /** Full name (not translated). */
      name: z.string(),
      /** Role/position — translate this. */
      role: z.string(),
      /** Internal department. */
      department: z.enum(['Direção', 'Conselho Fiscal', 'Mesa da Assembleia', 'DREE', 'DP', 'DL', 'DCI']),
      /** Optional photo (src/assets/...). Falls back to initials when absent. */
      photo: image().optional(),
      /** Short bio shown on the team card (one or two sentences). */
      bio: z.string(),
      /** Optional personal/professional links. */
      links: z.array(link).optional(),
      /** Sort order within a department (ascending). Defaults to file order. */
      order: z.number().optional(),
      /** Inactive members are hidden from the team page but keep working as project leads. */
      active: z.boolean().default(true),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** Start date. A date-only value covers the whole day. */
      date: z.coerce.date(),
      /** Optional end date (multi-day events). */
      endDate: z.coerce.date().optional(),
      /** Place — translate this ("Lisboa" → "Lisbon"). */
      location: z.string(),
      cover: image().optional(),
      summary: z.string(),
      /** External registration form, if any. */
      registrationUrl: z.url().optional(),
      /**
       * Cancelled events keep their place in listings with a "cancelled" badge.
       * (Upcoming/past is always derived from the dates — never typed by hand.)
       */
      cancelled: z.boolean().default(false),
    }),
});

const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      date: z.coerce.date(),
      summary: z.string(),
      cover: image().optional(),
      /** Lowercase topic tags, identical across locales (not translated). */
      tags: z.array(z.string()).default([]),
      /** Drafts are validated but never listed, linked or fed to RSS. */
      draft: z.boolean().default(false),
    }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      status: z.enum(['idea', 'active', 'completed']),
      /** Lowercase topic tags, identical across locales (not translated). */
      tags: z.array(z.string()).default([]),
      /** References to team entries — always the `pt` entry id, e.g. `pt/ana-exemplo`. */
      leads: z.array(reference('team')).default([]),
      cover: image().optional(),
      links: z.array(link).default([]),
      /** Marks projects that will host an interactive simulation in the future. */
      hasSimulation: z.boolean().default(false),
    }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    /** Optional lead paragraph shown under the page title. */
    summary: z.string().optional(),
  }),
});

export const collections = { team, events, news, projects, pages };
