/* /atlas/:slug — per-atlas landing page.
 *
 * Reads from atlases-meta.js. Each atlas gets its own indexable URL with:
 *   • unique H1 + meta title/description via dynamic <head> tags
 *   • Course JSON-LD schema for that atlas (rich results)
 *   • learning objectives, prerequisites, sandbox, exercises, hours
 *   • what you'll build
 *   • related atlases (via track overlap)
 *   • large CTA to open the actual atlas
 *
 * Rendering is SPA — Googlebot handles JS, LLM crawlers also do. For pure
 * static SEO, migrate to Vite SSR or Next later.
 */

import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, ExternalLink, Sparkles, Clock,
  BookOpenCheck, Layers, Target, GitBranch,
} from 'lucide-react';
import { CORE_ATLASES, EXTERNAL_ATLASES, ALL_ATLASES, TRACKS } from '../data/atlases-meta.js';

const DIFFICULTY_STYLES = {
  Beginner:     'text-lime-300 border-lime-400/40 bg-lime-400/5',
  Intermediate: 'text-amber-300 border-amber-400/40 bg-amber-400/5',
  Advanced:     'text-rose-300 border-rose-400/40 bg-rose-400/5',
};

/** Map an atlas record to its landing-page URL slug.
 *  Core atlases use their /route path (minus the slash).
 *  External atlases use their name field, lowercased and dashed.
 */
function atlasSlug(atlas) {
  if (atlas.external) return atlas.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return atlas.path.slice(1);
}

/** Dynamic <head> updates for SEO. React Router-friendly, no lib needed. */
function useAtlasHead(atlas) {
  useEffect(() => {
    if (!atlas) return;
    const prevTitle = document.title;
    document.title = `${atlas.title} · Atlases`;

    // description
    let meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', atlas.sub);

    // canonical
    let can = document.querySelector('link[rel="canonical"]');
    const prevCan = can?.getAttribute('href');
    if (!can) {
      can = document.createElement('link');
      can.setAttribute('rel', 'canonical');
      document.head.appendChild(can);
    }
    can.setAttribute('href', `https://atlases.vercel.app/atlas/${atlasSlug(atlas)}`);

    // Course JSON-LD (rich results)
    const jsonld = document.createElement('script');
    jsonld.type = 'application/ld+json';
    jsonld.dataset.atlasLanding = atlasSlug(atlas);
    jsonld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: atlas.title,
      description: atlas.sub,
      provider: {
        '@type': 'Organization',
        name: 'Atlases',
        sameAs: 'https://atlases.vercel.app',
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        courseWorkload: `PT${(atlas.hours + '').split('–')[0]}H`,
      },
      offers: { '@type': 'Offer', category: 'Free', price: '0', priceCurrency: 'USD' },
      educationalLevel: atlas.difficulty.toLowerCase(),
    });
    document.head.appendChild(jsonld);

    return () => {
      document.title = prevTitle;
      if (prevDesc != null) meta.setAttribute('content', prevDesc);
      if (prevCan != null) can.setAttribute('href', prevCan);
      jsonld.remove();
    };
  }, [atlas]);
}

function RelatedAtlas({ atlas }) {
  const isExternal = atlas.external;
  const Wrapper = isExternal ? 'a' : Link;
  const target = isExternal
    ? { href: atlas.url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: `/atlas/${atlasSlug(atlas)}` };
  return (
    <Wrapper {...target}
      className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-3 transition-colors flex items-center gap-3">
      <span className="text-[24px] leading-none shrink-0"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: atlas.color }}
        aria-hidden="true">
        {atlas.glyph}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-zinc-100 text-[13px] font-semibold truncate">
          {atlas.title}
        </div>
        <div className="text-zinc-500 text-[11px] truncate"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {atlas.difficulty} · {atlas.hours}h
        </div>
      </div>
      {isExternal ? <ExternalLink size={12} className="text-zinc-500 shrink-0" aria-hidden="true" />
                  : <ArrowRight   size={12} className="text-zinc-500 shrink-0" aria-hidden="true" />}
    </Wrapper>
  );
}

export default function AtlasLanding() {
  const { slug } = useParams();
  const atlas = ALL_ATLASES.find(a => atlasSlug(a) === slug);
  useAtlasHead(atlas);

  if (!atlas) return <Navigate to="/" replace />;

  const isExternal = atlas.external;
  const openHref = isExternal ? atlas.url : atlas.path;

  // Related atlases: same tracks, exclude self
  const related = ALL_ATLASES
    .filter(a => a !== atlas && a.tracks.some(t => atlas.tracks.includes(t)))
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-zinc-300"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <main id="main" className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        {/* Back nav */}
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-[13px] mb-8"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          all atlases
        </Link>

        {/* Header — glyph + eyebrow + title */}
        <div className="flex items-start gap-5 mb-6">
          <span className="text-[64px] leading-none shrink-0"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: atlas.color }}
            aria-hidden="true">
            {atlas.glyph}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ◇ ATLAS · {atlas.name}
              {isExternal && <span className="text-zinc-600"> · external deploy</span>}
              {atlas.status === 'new' && <span className="text-emerald-300"> · new</span>}
            </div>
            <h1 className="text-zinc-100 text-[40px] sm:text-[52px] font-bold leading-[1.02] tracking-tight mb-3"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              {atlas.title}
            </h1>
            <p className="text-zinc-400 text-[15px] sm:text-[16px] leading-relaxed max-w-2xl">
              {atlas.sub}
            </p>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className={`text-[10px] tracking-[0.2em] uppercase font-semibold px-2 py-1 border ${DIFFICULTY_STYLES[atlas.difficulty]}`}
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {atlas.difficulty}
          </span>
          {atlas.tracks.map(trackId => (
            <span key={trackId}
              className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-zinc-800 ${TRACKS[trackId].color}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {TRACKS[trackId].label.split(' ')[0]}
            </span>
          ))}
          <span className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-zinc-800 text-zinc-500"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {atlas.chapters} chapters
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-zinc-800 text-zinc-500"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {atlas.exercises} exercises
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-zinc-800 text-zinc-500"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {atlas.hours}h
          </span>
        </div>

        {/* Primary CTA */}
        <div className="mb-10">
          {isExternal ? (
            <a href={openHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-100 text-black hover:bg-white transition-colors font-semibold text-[14px]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Open {atlas.title}
              <ExternalLink size={13} strokeWidth={2.5} aria-hidden="true" />
            </a>
          ) : (
            <Link to={openHref}
              className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-100 text-black hover:bg-white transition-colors font-semibold text-[14px]"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Open {atlas.title}
              <ArrowRight size={13} strokeWidth={2.5} aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Sandbox */}
          <div className="border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={12} className="text-emerald-300" aria-hidden="true" />
              <h2 className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                sandbox
              </h2>
            </div>
            <p className="text-zinc-200 text-[13.5px] leading-relaxed">{atlas.sandbox}</p>
          </div>

          {/* Prerequisites */}
          <div className="border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Layers size={12} className="text-zinc-400" aria-hidden="true" />
              <h2 className="text-zinc-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                prerequisites
              </h2>
            </div>
            <ul className="space-y-1">
              {atlas.prereq.map((p, i) => (
                <li key={i} className="text-zinc-200 text-[13.5px] leading-relaxed">{p}</li>
              ))}
            </ul>
          </div>

          {/* What you'll build */}
          <div className="border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpenCheck size={12} className="text-zinc-400" aria-hidden="true" />
              <h2 className="text-zinc-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                what you'll build
              </h2>
            </div>
            <p className="text-zinc-200 text-[13.5px] leading-relaxed">{atlas.build}</p>
          </div>

          {/* Time */}
          <div className="border border-zinc-800 bg-zinc-950/40 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={12} className="text-zinc-400" aria-hidden="true" />
              <h2 className="text-zinc-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                estimated time
              </h2>
            </div>
            <p className="text-zinc-200 text-[13.5px] leading-relaxed">
              {atlas.hours} hours across {atlas.chapters} chapters — go at your pace.
            </p>
          </div>
        </div>

        {/* Related atlases */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="mb-10">
            <div className="flex items-center gap-1.5 mb-3">
              <GitBranch size={12} className="text-zinc-400" aria-hidden="true" />
              <h2 id="related-heading"
                className="text-zinc-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                related atlases
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {related.map(a => <RelatedAtlas key={atlasSlug(a)} atlas={a} />)}
            </div>
          </section>
        )}

        {/* Secondary CTA at bottom */}
        <div className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
          <p className="text-zinc-500 text-[13px]">
            Ready to start? {atlas.difficulty === 'Advanced' && 'Check the prerequisites first — '}
            it takes about {atlas.hours} hours to finish.
          </p>
          {isExternal ? (
            <a href={openHref} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-300 hover:bg-emerald-300/10 transition-colors font-semibold text-[13px] shrink-0"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Open atlas <ExternalLink size={12} aria-hidden="true" />
            </a>
          ) : (
            <Link to={openHref}
              className="inline-flex items-center gap-2 px-4 py-2 border border-emerald-300 text-emerald-300 hover:bg-emerald-300/10 transition-colors font-semibold text-[13px] shrink-0"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              Open atlas <ArrowRight size={12} aria-hidden="true" />
            </Link>
          )}
        </div>

        {/* Footer tracking line */}
        <div className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </div>
      </main>
    </div>
  );
}
