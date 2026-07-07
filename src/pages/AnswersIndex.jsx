/* /answers — index of all AEO answer pages. */
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { ANSWERS } from '../data/answers.js';

export default function AnswersIndex() {
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
        <div className="text-[10px] uppercase tracking-[0.4em] text-emerald-300 mb-3"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ANSWERS
        </div>
        <h1 className="text-zinc-100 text-[36px] sm:text-[48px] font-bold leading-tight tracking-tight mb-4"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Answers, in plain English.
        </h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed max-w-2xl mb-10">
          Straight answers to the questions people actually search for. Each page links to the
          hands-on atlas where you can learn the topic properly.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ANSWERS.map(a => (
            <Link key={a.slug} to={`/answers/${a.slug}`}
              className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-4 transition-colors">
              <div className="flex items-start gap-2 mb-1.5">
                <HelpCircle size={13} className="text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
                <h2 className="text-zinc-100 text-[15px] font-bold leading-snug"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {a.title}
                </h2>
              </div>
              <p className="text-zinc-500 text-[12.5px] leading-relaxed ml-6">
                {a.quickAnswer}
              </p>
              <div className="ml-6 mt-2 text-emerald-300 text-[11px] tracking-[0.2em] uppercase flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                read <ArrowRight size={10} strokeWidth={2.5} aria-hidden="true" />
              </div>
            </Link>
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
