/* /faq — the full FAQ. All 25 questions grouped, semantic <details>. */

import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { FAQ_GROUPS } from '../data/faqs.js';

export default function FAQ() {
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

        <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ FREQUENTLY ASKED QUESTIONS
        </div>
        <h1 className="text-zinc-100 text-[36px] sm:text-[48px] font-bold leading-tight tracking-tight mb-4"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Everything worth asking about Atlases.
        </h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed max-w-2xl mb-10">
          If your question isn't answered here, the Contact page is the fastest route. Every question
          is indexed for search engines and AI assistants via structured data.
        </p>

        <div className="space-y-10">
          {FAQ_GROUPS.map(group => (
            <section key={group.id} aria-labelledby={`grp-${group.id}`}>
              <h2 id={`grp-${group.id}`}
                className="text-emerald-300 text-[11px] tracking-[0.3em] uppercase mb-4 pb-2 border-b border-zinc-900 font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {group.label}
              </h2>
              <div className="space-y-2">
                {group.items.map((faq, i) => (
                  <details key={i} className="group border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-colors">
                    <summary className="cursor-pointer list-none px-4 py-3 flex items-start justify-between gap-3 text-zinc-100 font-semibold text-[14.5px] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-emerald-300"
                      style={{ fontFamily: 'Manrope, sans-serif' }}>
                      <span>{faq.q}</span>
                      <ChevronRight size={14} className="text-zinc-500 shrink-0 mt-1 transition-transform group-open:rotate-90"
                        aria-hidden="true" />
                    </summary>
                    <div className="px-4 pb-4 pt-2 text-zinc-400 text-[13.5px] leading-relaxed border-t border-zinc-900">
                      {faq.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </div>
      </main>
    </div>
  );
}
