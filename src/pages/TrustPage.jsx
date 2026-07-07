/* Shared shell for the small trust/legal pages.
 * Each page passes a title + body (JSX). Preserves site design tokens.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TrustPage({ eyebrow, title, lead, children }) {
  return (
    <div className="min-h-screen bg-black text-zinc-300"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <main id="main" className="max-w-3xl mx-auto px-4 pt-12 pb-16">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-[13px] mb-8"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          back to atlases
        </Link>

        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ◇ {eyebrow}
          </div>
        )}
        <h1 className="text-zinc-100 text-[36px] sm:text-[48px] font-bold leading-tight tracking-tight mb-4"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          {title}
        </h1>
        {lead && (
          <p className="text-zinc-500 text-[15px] leading-relaxed max-w-2xl mb-8">
            {lead}
          </p>
        )}

        <div className="prose-atlas text-zinc-400 text-[14.5px] leading-relaxed space-y-4 max-w-2xl">
          {children}
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </div>
      </main>
    </div>
  );
}
