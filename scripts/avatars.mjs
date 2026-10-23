#!/usr/bin/env node
/**
 * scripts/avatars.mjs — generates a dummy SVG portrait per team member.
 *
 *   node scripts/avatars.mjs
 *
 * Reads `name:` from every src/content/team/pt/*.md and writes
 * src/assets/team-photos/<slug>.svg. Deterministic: the member's name seeds the
 * palette, hair and features, so re-running never churns the files.
 *
 * These are PLACEHOLDER portraits (never invented photos of real people):
 * flat illustrations in the brand palette. Replace with real photos by
 * filling the `photo:` field of the member's content file.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const teamDir = join(root, 'src/content/team/pt');
const outDir = join(root, 'src/assets/team-photos');
mkdirSync(outDir, { recursive: true });

/* ------------------------------------------------------------- palette */

const SKIN = ['#f2c9a8', '#e8b08a', '#c98e63', '#9c6b47', '#6f4a30'];
const HAIR = ['#2f2620', '#16130f', '#b98a48', '#b4552d', '#8a8a8a', '#4b3626'];
const SHIRT = ['#1d4ed8', '#b01161', '#0f7a4d', '#c2451d', '#e8b302', '#5b4bd6'];
const BG = ['#e9eefc', '#fbe4ef', '#e2f2e9', '#fdeee2', '#fbf2d3', '#ece9fd'];

/** Small deterministic hash so a person always gets the same face. */
function hash(str) {
  let h = 2166136261;
  for (const ch of str) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/* --------------------------------------------------------------- faces */

const hairStyles = [
  // 1. short crop
  (hair) =>
    `<path d="M60 92 C58 50 78 38 100 38 C122 38 142 50 140 92 C138 68 122 60 100 60 C78 60 62 68 60 92 Z" fill="${hair}"/>`,
  // 2. long, past the shoulders
  (hair) =>
    `<path d="M58 96 C56 48 78 36 100 36 C122 36 144 48 142 96 L146 150 C132 142 128 118 128 96 C122 74 112 62 100 62 C88 62 78 74 72 96 C72 118 68 142 54 150 Z" fill="${hair}"/>`,
  // 3. bun
  (hair) =>
    `<circle cx="100" cy="30" r="15" fill="${hair}"/><path d="M62 90 C62 52 80 42 100 42 C120 42 138 52 138 90 C136 68 120 60 100 60 C80 60 64 68 62 90 Z" fill="${hair}"/>`,
  // 4. curls
  (hair) =>
    `<g fill="${hair}"><circle cx="68" cy="62" r="16"/><circle cx="88" cy="48" r="17"/><circle cx="112" cy="48" r="17"/><circle cx="132" cy="62" r="16"/><circle cx="142" cy="84" r="13"/><circle cx="58" cy="84" r="13"/></g>`,
  // 5. afro
  (hair) => `<circle cx="100" cy="72" r="56" fill="${hair}"/>`,
  // 6. buzz cut
  (hair) =>
    `<path d="M64 88 C64 56 80 44 100 44 C120 44 136 56 136 88 C134 72 120 64 100 64 C80 64 66 72 64 88 Z" fill="${hair}" opacity="0.85"/>`,
];

function avatar(seed) {
  const pick = (arr, salt) => arr[(seed >>> salt) % arr.length];
  const skin = pick(SKIN, 3);
  const hair = pick(HAIR, 7);
  const shirt = pick(SHIRT, 11);
  const bg = pick(BG, 13);
  const style = hairStyles[(seed >>> 5) % hairStyles.length];
  const glasses = seed % 3 === 0;
  const blush = seed % 4 === 0;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="28" fill="${bg}"/>
  <path d="M18 200 C24 156 58 138 100 138 C142 138 176 156 182 200 Z" fill="${shirt}"/>
  <rect x="88" y="104" width="24" height="36" rx="12" fill="${skin}"/>
  <ellipse cx="100" cy="86" rx="38" ry="44" fill="${skin}"/>
  <circle cx="63" cy="92" r="7" fill="${skin}"/>
  <circle cx="137" cy="92" r="7" fill="${skin}"/>
  ${style(hair)}
  <g fill="#26221f"><circle cx="85" cy="88" r="4.5"/><circle cx="115" cy="88" r="4.5"/></g>
  <path d="M84 110 Q100 124 116 110" fill="none" stroke="#26221f" stroke-width="4.5" stroke-linecap="round"/>
  ${blush ? `<g fill="#e88a8a" opacity="0.45"><circle cx="72" cy="102" r="8"/><circle cx="128" cy="102" r="8"/></g>` : ''}
  ${glasses ? `<g fill="none" stroke="#3a3a3a" stroke-width="3.5"><circle cx="85" cy="88" r="13"/><circle cx="115" cy="88" r="13"/><path d="M98 88h4M72 86l-9-3M128 86l9-3"/></g>` : ''}
</svg>
`;
}

/* ------------------------------------------------------------- generate */

const files = readdirSync(teamDir).filter((f) => f.endsWith('.md'));
for (const file of files) {
  const slug = basename(file, '.md');
  const md = readFileSync(join(teamDir, file), 'utf8');
  const name = /^name:\s*(.+)$/m.exec(md)?.[1]?.trim() ?? slug;
  writeFileSync(join(outDir, `${slug}.svg`), avatar(hash(name + slug)));
}
console.log(`avatars: ${files.length} written to src/assets/team-photos/`);
