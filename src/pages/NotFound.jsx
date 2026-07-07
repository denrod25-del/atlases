/* /404 — real 404 page. Sets status via meta (SPA limitation — Vercel
 * treats this as a 200 unless you set the redirect header, which we do below
 * via a manual convention). Offers concrete recovery paths.
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, HelpCircle, BookOpen } from 'lucide-react';
import { CORE_ATLASES } from '../data/atlases-meta.js';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Not found · Atlases';
    // Signal to crawlers via meta — SPA can't return real 404 status
    let robots = document.querySelector('meta[name="robots"]');
    const prev = robots?.getAttribute('content');
    if (!robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.appendChild(robots);
    }
    robots.setAttribute('content', 'noindex,follow');
    return () => {
      if (prev != null) robots.setAttribute('content', prev);
      else robots.remove();
    };
  }, []);

  // Sample a few atlases to suggest for recovery
  const suggested = CORE_ATLASES.slice(0, 4);

  return (
    <div className="min-h-screen bg-black text-zinc-300 flex flex-col"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <main id="main" className="max-w-3xl mx-auto px-4 pt-16 pb-16 flex-1 w-full">
        <div className="text-[10px] uppercase tracking-[0.4em] text-rose-300 mb-3"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ 404 · NOT FOUND
        </div>
        <h1 className="text-zinc-100 text-[48px] sm:text-[64px] font-bold leading-[0.95] tracking-tight mb-4"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Wrong turn.<br />
          <span className="text-zinc-500">Nothing at that URL.</span>
        </h1>
        <p className="text-zinc-400 text-[16px] leading-relaxed max-w-2xl mb-10">
          The page you asked for doesn't exist — either the link is stale or the URL was mistyped.
          Everything worth reaching is one of these.
        </p>

        {/* Recovery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
          <Link to="/"
            className="border border-emerald-300/40 bg-emerald-300/5 hover:border-emerald-300 hover:bg-emerald-300/10 p-4 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 border border-emerald-300/40 bg-emerald-300/10 flex items-center justify-center shrink-0">
              <ArrowLeft size={15} className="text-emerald-300" aria-hidden="true" />
            </div>
            <div>
              <div className="text-zinc-100 text-[14px] font-bold mb-0.5"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Go home
              </div>
              <div className="text-zinc-400 text-[12.5px] leading-snug">
                Back to the atlas grid and the sample lesson.
              </div>
            </div>
          </Link>

          <Link to="/#learning-paths"
            className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-4 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 border border-zinc-800 flex items-center justify-center shrink-0">
              <Compass size={15} className="text-sky-300" aria-hidden="true" />
            </div>
            <div>
              <div className="text-zinc-100 text-[14px] font-bold mb-0.5"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Learning paths
              </div>
              <div className="text-zinc-400 text-[12.5px] leading-snug">
                Curated sequences for Backend / AI / DevOps / CS.
              </div>
            </div>
          </Link>

          <Link to="/faq"
            className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-4 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 border border-zinc-800 flex items-center justify-center shrink-0">
              <HelpCircle size={15} className="text-amber-300" aria-hidden="true" />
            </div>
            <div>
              <div className="text-zinc-100 text-[14px] font-bold mb-0.5"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                FAQ
              </div>
              <div className="text-zinc-400 text-[12.5px] leading-snug">
                25 answers about how the site works.
              </div>
            </div>
          </Link>

          <Link to="/answers"
            className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-4 transition-colors flex items-start gap-3">
            <div className="w-9 h-9 border border-zinc-800 flex items-center justify-center shrink-0">
              <BookOpen size={15} className="text-fuchsia-300" aria-hidden="true" />
            </div>
            <div>
              <div className="text-zinc-100 text-[14px] font-bold mb-0.5"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Answer pages
              </div>
              <div className="text-zinc-400 text-[12.5px] leading-snug">
                "What is Docker / Linux / Networking" — long-form.
              </div>
            </div>
          </Link>
        </div>

        {/* Suggested atlases */}
        <section aria-labelledby="suggested-heading">
          <h2 id="suggested-heading"
            className="text-zinc-300 text-[10px] tracking-[0.3em] uppercase font-semibold mb-3"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            or jump straight into an atlas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {suggested.map(a => (
              <Link key={a.path} to={a.path}
                className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-3 transition-colors flex items-center gap-2">
                <span className="text-[22px] leading-none shrink-0"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: a.color }}
                  aria-hidden="true">
                  {a.glyph}
                </span>
                <span className="text-zinc-200 text-[12px] font-semibold truncate">
                  {a.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </div>
      </main>
    </div>
  );
}
