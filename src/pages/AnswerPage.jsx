/* /answers/:slug — AEO/GEO answer pages.
 *
 * Long-form Q&A optimized for AI-search extraction (Perplexity, ChatGPT,
 * Claude, Google AI Overview). Structured so a language model can:
 *   1. Quote the quick answer directly.
 *   2. Cite paragraph facts.
 *   3. Surface related sub-questions.
 *
 * Each page also emits QAPage JSON-LD schema.
 */

import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ExternalLink, HelpCircle, Sparkles } from 'lucide-react';
import { ANSWERS_BY_SLUG, ANSWERS } from '../data/answers.js';

function useAnswerHead(answer) {
  useEffect(() => {
    if (!answer) return;
    const prevTitle = document.title;
    document.title = `${answer.title} · Atlases`;

    let meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute('content');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', answer.seoDescription);

    let can = document.querySelector('link[rel="canonical"]');
    const prevCan = can?.getAttribute('href');
    if (!can) {
      can = document.createElement('link');
      can.setAttribute('rel', 'canonical');
      document.head.appendChild(can);
    }
    can.setAttribute('href', `https://atlases.vercel.app/answers/${answer.slug}`);

    // QAPage JSON-LD — the primary + related questions
    const jsonld = document.createElement('script');
    jsonld.type = 'application/ld+json';
    jsonld.dataset.answer = answer.slug;
    jsonld.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'QAPage',
      mainEntity: {
        '@type': 'Question',
        name: answer.title,
        text: answer.title,
        answerCount: 1 + (answer.subQuestions?.length || 0),
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer.quickAnswer + ' ' + answer.paragraphs.join(' '),
        },
        suggestedAnswer: (answer.subQuestions || []).map(sq => ({
          '@type': 'Answer',
          text: sq.a,
        })),
      },
    });
    document.head.appendChild(jsonld);

    return () => {
      document.title = prevTitle;
      if (prevDesc != null) meta.setAttribute('content', prevDesc);
      if (prevCan != null) can.setAttribute('href', prevCan);
      jsonld.remove();
    };
  }, [answer]);
}

export default function AnswerPage() {
  const { slug } = useParams();
  const answer = ANSWERS_BY_SLUG[slug];
  useAnswerHead(answer);

  if (!answer) return <Navigate to="/" replace />;

  const relatedAnswers = (answer.relatedTopics || [])
    .map(s => ANSWERS_BY_SLUG[s])
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-black text-zinc-300"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <main id="main" className="max-w-3xl mx-auto px-4 pt-12 pb-16">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-[13px] mb-8"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          all atlases
        </Link>

        <div className="text-[10px] uppercase tracking-[0.4em] text-emerald-300 mb-3"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ANSWER · {answer.topic}
        </div>

        <h1 className="text-zinc-100 text-[36px] sm:text-[48px] font-bold leading-[1.05] tracking-tight mb-6"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          {answer.title}
        </h1>

        {/* Quick answer — the TL;DR that AI systems quote */}
        <div className="border-l-2 border-emerald-300 pl-4 py-2 mb-8 bg-emerald-300/5">
          <div className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold mb-1.5"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            quick answer
          </div>
          <p className="text-zinc-100 text-[16px] leading-relaxed font-medium">
            {answer.quickAnswer}
          </p>
        </div>

        {/* Long-form paragraphs */}
        <div className="space-y-4 mb-10">
          {answer.paragraphs.map((p, i) => (
            <p key={i} className="text-zinc-300 text-[15px] leading-relaxed">
              {p}
            </p>
          ))}
        </div>

        {/* Sub-questions */}
        {answer.subQuestions && answer.subQuestions.length > 0 && (
          <section aria-labelledby="subq-heading" className="mb-10">
            <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-zinc-900">
              <HelpCircle size={13} className="text-emerald-300" aria-hidden="true" />
              <h2 id="subq-heading"
                className="text-emerald-300 text-[11px] tracking-[0.3em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                related questions
              </h2>
            </div>
            <div className="space-y-6">
              {answer.subQuestions.map((sq, i) => (
                <article key={i}>
                  <h3 className="text-zinc-100 text-[17px] font-bold mb-2 leading-tight"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {sq.q}
                  </h3>
                  <p className="text-zinc-300 text-[14.5px] leading-relaxed">
                    {sq.a}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Related atlases CTA */}
        {answer.relatedAtlases && answer.relatedAtlases.length > 0 && (
          <section aria-labelledby="related-atlas-heading" className="mb-10 border border-emerald-300/30 bg-emerald-300/5 p-5">
            <div className="flex items-center gap-1.5 mb-3">
              <Sparkles size={13} className="text-emerald-300" aria-hidden="true" />
              <h2 id="related-atlas-heading"
                className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                learn this hands-on
              </h2>
            </div>
            <p className="text-zinc-200 text-[14px] leading-relaxed mb-4">
              These atlases teach {answer.topic.toLowerCase()} chapter-by-chapter with browser sandboxes:
            </p>
            <div className="space-y-2">
              {answer.relatedAtlases.map((ra, i) => {
                const isExternal = !!ra.url;
                const props = isExternal
                  ? { href: ra.url, target: '_blank', rel: 'noopener noreferrer' }
                  : { to: ra.path };
                const Wrapper = isExternal ? 'a' : Link;
                return (
                  <Wrapper key={i} {...props}
                    className="flex items-center justify-between gap-2 border border-emerald-300/30 bg-black/40 hover:border-emerald-300 hover:bg-emerald-300/10 p-3 transition-colors">
                    <span className="text-zinc-100 text-[14px] font-semibold">{ra.title}</span>
                    {isExternal
                      ? <ExternalLink size={13} className="text-emerald-300 shrink-0" aria-hidden="true" />
                      : <ArrowRight   size={13} className="text-emerald-300 shrink-0" aria-hidden="true" />
                    }
                  </Wrapper>
                );
              })}
            </div>
          </section>
        )}

        {/* Related answer pages */}
        {relatedAnswers.length > 0 && (
          <section aria-labelledby="related-topics-heading" className="mb-10">
            <h2 id="related-topics-heading"
              className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase font-semibold mb-3"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              related topics
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {relatedAnswers.map(ra => (
                <Link key={ra.slug} to={`/answers/${ra.slug}`}
                  className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-3 transition-colors flex items-center justify-between gap-2">
                  <span className="text-zinc-100 text-[13px] font-semibold truncate">{ra.title}</span>
                  <ArrowRight size={12} className="text-zinc-500 shrink-0" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Prev/next through the answer set — Phase 4 add */}
        <nav aria-label="Answer pages navigation"
          className="mt-10 pt-6 border-t border-zinc-900 grid grid-cols-2 gap-3">
          {(() => {
            const idx = ANSWERS.findIndex(a => a.slug === answer.slug);
            const prev = idx > 0 ? ANSWERS[idx - 1] : null;
            const next = idx < ANSWERS.length - 1 ? ANSWERS[idx + 1] : null;
            return (
              <>
                {prev ? (
                  <Link to={`/answers/${prev.slug}`}
                    className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-3 transition-colors group">
                    <div className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase mb-1 flex items-center gap-1"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <ArrowLeft size={10} strokeWidth={2.5} aria-hidden="true" />
                      previous
                    </div>
                    <div className="text-zinc-200 text-[13px] font-semibold group-hover:text-emerald-300 transition-colors">
                      {prev.title}
                    </div>
                  </Link>
                ) : <div />}
                {next ? (
                  <Link to={`/answers/${next.slug}`}
                    className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/40 hover:bg-zinc-900/60 p-3 transition-colors group text-right">
                    <div className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase mb-1 flex items-center justify-end gap-1"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      next
                      <ArrowRight size={10} strokeWidth={2.5} aria-hidden="true" />
                    </div>
                    <div className="text-zinc-200 text-[13px] font-semibold group-hover:text-emerald-300 transition-colors">
                      {next.title}
                    </div>
                  </Link>
                ) : <div />}
              </>
            );
          })()}
        </nav>

        {/* Footer tracking line */}
        <div className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </div>
      </main>
    </div>
  );
}
