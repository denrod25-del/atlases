#!/usr/bin/env node
/* generate-sitemap.mjs — enumerates every indexable route on atlases.vercel.app
 * and writes a fresh public/sitemap.xml.
 *
 * Run automatically on every build via package.json prebuild step.
 * New atlases: add to CORE_ATLASES / EXTERNAL_ATLASES in src/data/atlases-meta.js
 * and the sitemap picks them up next build. Same for answer pages.
 *
 * Route inventory sources:
 *   • Static routes (trust pages, dashboard, indexes)
 *   • Atlas direct routes (from CORE_ATLASES paths)
 *   • Per-atlas landing pages /atlas/:slug (from ALL_ATLASES)
 *   • Answer pages /answers/:slug (from ANSWERS)
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = resolve(__dirname, '..');
const BASE      = 'https://atlases.vercel.app';
const OUT       = resolve(ROOT, 'public', 'sitemap.xml');
const TODAY     = new Date().toISOString().slice(0, 10);

// Parse the atlas + answer data files without executing them.
// We import as strings and regex out the array entries — safer than eval, faster than
// building a proper JS runtime. If the shape changes, this needs updating.
function parseAtlasPaths() {
  const src = readFileSync(resolve(ROOT, 'src', 'data', 'atlases-meta.js'), 'utf8');
  // Core atlases: /path entries
  const coreMatches = [...src.matchAll(/path:\s*'(\/[a-z0-9-]+)'/g)];
  const corePaths = coreMatches.map(m => m[1]);
  // External atlases: name field (becomes atlas slug via lowercase + dash)
  const externalBlock = src.split('EXTERNAL_ATLASES')[1] || '';
  const nameMatches = [...externalBlock.matchAll(/name:\s*'([^']+)'/g)];
  const externalSlugs = nameMatches.map(m => m[1].toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  return { corePaths, externalSlugs };
}

function parseAnswerSlugs() {
  const src = readFileSync(resolve(ROOT, 'src', 'data', 'answers.js'), 'utf8');
  const slugMatches = [...src.matchAll(/slug:\s*'([a-z0-9-]+)'/g)];
  return slugMatches.map(m => m[1]);
}

function buildSitemap() {
  const { corePaths, externalSlugs } = parseAtlasPaths();
  const answerSlugs = parseAnswerSlugs();

  const entries = [];
  const add = (loc, priority, changefreq = 'monthly') =>
    entries.push({ loc: BASE + loc, priority, changefreq });

  // Homepage + dashboard + info
  add('/',            '1.0', 'weekly');
  add('/dashboard',   '0.9', 'daily');
  add('/faq',         '0.8', 'monthly');
  add('/answers',     '0.8', 'monthly');

  // Trust pages
  add('/about',           '0.6');
  add('/mission',         '0.6');
  add('/roadmap',         '0.6', 'weekly');
  add('/changelog',       '0.6', 'weekly');
  add('/sandbox-safety',  '0.6');
  add('/support',         '0.5');
  add('/contact',         '0.5');
  add('/accessibility',   '0.5');
  add('/privacy',         '0.4', 'yearly');
  add('/terms',           '0.4', 'yearly');
  add('/cookies',         '0.4', 'yearly');

  // Atlas direct routes
  corePaths.forEach(p => add(p, '0.9', 'monthly'));

  // Per-atlas landing pages — core atlases use their route slug
  corePaths.forEach(p => add(`/atlas${p}`, '0.8', 'monthly'));

  // Per-atlas landing pages — external atlases use derived slugs
  externalSlugs.forEach(slug => add(`/atlas/${slug}`, '0.8', 'monthly'));

  // Answer pages
  answerSlugs.forEach(slug => add(`/answers/${slug}`, '0.7', 'monthly'));

  // Build XML
  const urls = entries.map(e => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  writeFileSync(OUT, xml, 'utf8');
  console.log(`✓ sitemap.xml — ${entries.length} URLs → ${OUT}`);
}

buildSitemap();
