/* Landing.jsx — homepage. Preserves the current design language
 * (bg-black, max-w-4xl container, Bricolage/JetBrains Mono/Manrope
 * fonts, ◇ eyebrow markers) and adds:
 *   • updated hero with trust row + dual CTA
 *   • learning-paths section
 *   • why-atlases comparison
 *   • improved atlas grid with difficulty + hours + sandbox metadata
 *   • the existing "what's in each atlas" is preserved
 *   • FAQ preview + link to dedicated /faq page
 *   • enriched footer with nav columns
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Server, Sparkles, GitBranch, Cpu, X,
  ExternalLink, ChevronRight, HelpCircle,
} from 'lucide-react';

import { CORE_ATLASES, EXTERNAL_ATLASES, ALL_ATLASES } from '../data/atlases-meta.js';
import { LEARNING_PATHS } from '../data/paths.js';
import { FAQ_GROUPS } from '../data/faqs.js';
import SampleLesson from '../components/SampleLesson.jsx';

const ICON_MAP = { Server, Sparkles, GitBranch, Cpu };

// ─────────────────────────────────────────────────────────────────────
// Hero
// ─────────────────────────────────────────────────────────────────────

const TRUST_ITEMS = ['Browser-Based', 'Interactive Sandboxes', 'No Installation', 'Learn by Building'];

function Hero() {
  const totalChapters = CORE_ATLASES.reduce((s, a) => s + a.chapters, 0);
  return (
    <header className="max-w-4xl mx-auto px-4 pt-12 pb-8 sm:pt-20 sm:pb-12">
      <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ INTERACTIVE LEARNING ATLASES
      </div>

      <h1 className="text-zinc-100 text-[44px] sm:text-[64px] font-bold leading-[0.95] mb-4 tracking-tight"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Master Software Engineering<br />
        <span className="text-zinc-500">Through Interactive Atlases.</span>
      </h1>

      <p className="text-zinc-400 text-[16px] sm:text-[18px] leading-relaxed max-w-2xl mb-6">
        Learn databases, Linux, networking, Docker, AI engineering, Python, C++, cryptography and more
        through chapter-based guides with real browser sandboxes. No videos. No copy-pasting. You practice
        as you learn.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6" role="group" aria-label="Primary actions">
        <a href="#learning-paths"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-zinc-100 text-black hover:bg-white transition-colors font-semibold text-[14px]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
          aria-label="Start learning — choose a learning path">
          Start Learning
          <ArrowRight size={15} strokeWidth={2.5} aria-hidden="true" />
        </a>
        <a href="#atlases"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 border border-zinc-700 text-zinc-200 hover:border-zinc-500 hover:text-white transition-colors font-semibold text-[14px]"
          style={{ fontFamily: 'Manrope, sans-serif' }}
          aria-label="Browse all atlases">
          Browse Atlases
        </a>
      </div>

      {/* Trust row */}
      <ul className="flex flex-wrap gap-x-5 gap-y-2 items-center mb-6" aria-label="Key features">
        {TRUST_ITEMS.map(item => (
          <li key={item} className="flex items-center gap-1.5 text-zinc-400 text-[12px]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} strokeWidth={3} className="text-emerald-400 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {/* Stats line — preserved from original + dashboard link */}
      <div className="text-[12px] text-zinc-600 flex flex-wrap items-center gap-x-2"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <span>progress saves locally</span>
        <span className="text-zinc-800">·</span>
        <span>no signup</span>
        <span className="text-zinc-800">·</span>
        <span>{ALL_ATLASES.length} atlases</span>
        <span className="text-zinc-800">·</span>
        <span>{totalChapters}+ chapters</span>
        <span className="text-zinc-800">·</span>
        <Link to="/dashboard"
          className="text-emerald-300 hover:text-emerald-200 underline underline-offset-2 transition-colors">
          your dashboard →
        </Link>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Learning Paths
// ─────────────────────────────────────────────────────────────────────

function LearningPaths() {
  return (
    <section id="learning-paths" aria-labelledby="paths-heading"
      className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ CHOOSE YOUR LEARNING PATH
      </div>
      <h2 id="paths-heading"
        className="text-zinc-100 text-[28px] sm:text-[36px] font-bold leading-tight tracking-tight mb-3"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Pick a track. Start where it makes sense.
      </h2>
      <p className="text-zinc-500 text-[14px] leading-relaxed max-w-2xl mb-8">
        Each path is a curated sequence of atlases that builds real skill in a specific direction.
        Every path is optional; every atlas stands alone.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LEARNING_PATHS.map(path => {
          const Icon = ICON_MAP[path.icon];
          return (
            <article key={path.id}
              className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-900/60 transition-colors p-5 flex flex-col"
              aria-labelledby={`path-${path.id}-title`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 border border-zinc-800 flex items-center justify-center shrink-0"
                  style={{ borderColor: path.borderColor }}>
                  <Icon size={16} style={{ color: path.borderColor }} strokeWidth={2} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <div className={`${path.color} text-[10px] tracking-[0.25em] uppercase font-semibold mb-0.5`}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    learning path
                  </div>
                  <h3 id={`path-${path.id}-title`}
                    className="text-zinc-100 text-[19px] leading-tight font-bold"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {path.label}
                  </h3>
                </div>
              </div>

              <p className="text-zinc-400 text-[13px] leading-relaxed mb-3">
                {path.description}
              </p>

              <p className="text-zinc-600 text-[11px] italic mb-3"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                For: {path.audience}
              </p>

              <div className="mb-4 flex-1">
                <div className="text-zinc-600 text-[9.5px] tracking-[0.25em] uppercase mb-1.5"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  what you'll learn
                </div>
                <ul className="space-y-1">
                  {path.outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-zinc-400 text-[12.5px]">
                      <Check size={11} strokeWidth={2.5}
                        style={{ color: path.borderColor }}
                        className="shrink-0 mt-1"
                        aria-hidden="true" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-zinc-900 pt-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <div className="text-zinc-600 text-[9.5px] tracking-[0.25em] uppercase"
                      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      start with
                    </div>
                    <div className="text-zinc-100 text-[13px] font-semibold truncate">
                      {path.startTitle}
                    </div>
                  </div>
                  <Link to={path.startPath}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border text-[12px] font-semibold hover:bg-zinc-900 transition-colors shrink-0"
                    style={{ borderColor: path.borderColor, color: path.borderColor, fontFamily: 'Manrope, sans-serif' }}
                    aria-label={`Start with ${path.startTitle} in ${path.label}`}>
                    Start
                    <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                  </Link>
                </div>

                {/* Sequence chips */}
                <div className="flex flex-wrap gap-1">
                  {path.sequence.map((step, i) => {
                    const isLink = step.path;
                    return (
                      <span key={i}
                        className="text-zinc-600 text-[10px] px-1.5 py-0.5 border border-zinc-900"
                        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {i + 1}. {step.title}
                      </span>
                    );
                  })}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Why Atlases (compact)
// ─────────────────────────────────────────────────────────────────────

const TRADITIONAL = [
  ['Watching videos passively',      'You see someone else use the tool.'],
  ['Reading static documentation',   'Great after you already know. Bad for learning.'],
  ['Copy-pasting code that "works"', 'Runs on the first try. You reproduce nothing.'],
  ['Installing local toolchains',    'Days of setup before the first line of code.'],
  ['No feedback loop',                'You find out in production, when it breaks.'],
];
const ATLASES_WAY = [
  ['Chapter-based interactive guides',   '12 chapters with explicit objectives.'],
  ['Real browser sandboxes',              'The code you write actually runs.'],
  ['Immediate feedback per exercise',     'Every concept has a live try-it.'],
  ['Zero installation',                    'Open a link. That is your setup.'],
  ['Learn by building',                    'Each atlas ends with something you built.'],
];

function WhyAtlases() {
  return (
    <section id="why" aria-labelledby="why-heading"
      className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ WHY ATLASES
      </div>
      <h2 id="why-heading"
        className="text-zinc-100 text-[28px] sm:text-[36px] font-bold leading-tight tracking-tight mb-3"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Different from watching. Different from reading.
      </h2>
      <p className="text-zinc-500 text-[14px] leading-relaxed max-w-2xl mb-8">
        Most engineering education picks between depth and doing. Atlases delivers both by making
        every concept immediately practicable.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border border-zinc-800 bg-zinc-950/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 border border-rose-400/40 bg-rose-400/5 flex items-center justify-center">
              <X size={13} className="text-rose-400" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <h3 className="text-zinc-300 text-[14px] font-semibold"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Traditional learning
            </h3>
          </div>
          <ul className="space-y-2.5">
            {TRADITIONAL.map(([h, s], i) => (
              <li key={i} className="border-t border-zinc-900 pt-2">
                <div className="text-zinc-300 text-[13px] font-semibold">{h}</div>
                <div className="text-zinc-500 text-[11.5px] leading-relaxed">{s}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="border border-emerald-400/30 bg-emerald-400/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 border border-emerald-300/40 bg-emerald-300/10 flex items-center justify-center">
              <Check size={13} className="text-emerald-300" strokeWidth={2.5} aria-hidden="true" />
            </div>
            <h3 className="text-zinc-100 text-[14px] font-semibold"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              The Atlases way
            </h3>
          </div>
          <ul className="space-y-2.5">
            {ATLASES_WAY.map(([h, s], i) => (
              <li key={i} className="border-t border-emerald-400/20 pt-2">
                <div className="text-zinc-100 text-[13px] font-semibold">{h}</div>
                <div className="text-zinc-400 text-[11.5px] leading-relaxed">{s}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Atlas card — preserves original visual but adds difficulty + hours
// ─────────────────────────────────────────────────────────────────────

const DIFFICULTY_STYLES = {
  Beginner:     'text-lime-300 border-lime-400/40',
  Intermediate: 'text-amber-300 border-amber-400/40',
  Advanced:     'text-rose-300 border-rose-400/40',
};


// ─── Prefetch atlas chunks on hover — Phase 4 perf polish ─────────
// When the user hovers a core atlas card, prefetch its Vite chunk so
// the click feels instant. Duplicate calls are cheap (browser dedupes).
const PREFETCHED = new Set();
function prefetchAtlasChunk(path) {
  if (typeof window === 'undefined') return;
  if (PREFETCHED.has(path)) return;
  PREFETCHED.add(path);
  // Vite tag: prefetch the module import which triggers browser prefetch of its chunks.
  // We rely on the same `import(...)` React uses for the route — the module cache dedupes.
  const map = {
    '/coolify':       () => import('../atlases/coolify-atlas.jsx'),
    '/n8n':           () => import('../atlases/n8n-atlas.jsx'),
    '/docker':        () => import('../atlases/docker-atlas.jsx'),
    '/javascript':    () => import('../atlases/javascript-atlas.jsx'),
    '/python':        () => import('../atlases/python-atlas.jsx'),
    '/c':             () => import('../atlases/c-atlas.jsx'),
    '/cpp':           () => import('../atlases/cpp-atlas.jsx'),
    '/db':            () => import('../atlases/db-atlas.jsx'),
    '/net':           () => import('../atlases/net-atlas.jsx'),
    '/linux':         () => import('../atlases/linux-atlas.jsx'),
    '/crypto':        () => import('../atlases/crypto-atlas.jsx'),
    '/compilers':     () => import('../atlases/compilers-atlas.jsx'),
    '/observability': () => import('../atlases/observability-atlas.jsx'),
    '/ai':            () => import('../atlases/ai-atlas.jsx'),
    '/fivem':         () => import('../atlases/fivem-atlas.jsx'),
    '/encoding':      () => import('../atlases/encoding-atlas.jsx'),
  };
  try { map[path]?.(); } catch { /* graceful — hover prefetch is best-effort */ }
}

function AtlasCard({ atlas }) {
  const isExternal = atlas.external;
  // Slug for the per-atlas landing page — matches AtlasLanding's atlasSlug()
  const slug = isExternal
    ? atlas.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : atlas.path.slice(1);
  // Primary link on the card body → straight to the atlas (fastest UX).
  // Secondary "details" link → the /atlas/:slug SEO landing page.
  const Wrapper = isExternal ? 'a' : Link;
  const linkProps = isExternal
    ? { href: atlas.url, target: '_blank', rel: 'noopener noreferrer',
        'aria-label': `Open ${atlas.title} atlas — opens in a new tab` }
    : { to: atlas.path, 'aria-label': `Open ${atlas.title} atlas` };

  return (
    <div className="relative">
    <Wrapper {...linkProps}
      onMouseEnter={isExternal ? undefined : () => prefetchAtlasChunk(atlas.path)}
      onFocus={isExternal ? undefined : () => prefetchAtlasChunk(atlas.path)}
      className="group block border border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-900/60 transition-colors p-5 relative overflow-hidden">
      {/* Accent corner — grows on hover for the color glow polish */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10 group-hover:opacity-30 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at top right, ${atlas.color}, transparent 65%)` }}
        aria-hidden="true" />
      {/* Subtle bottom-left echo — activates on hover */}
      <div className="absolute bottom-0 left-0 w-24 h-16 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at bottom left, ${atlas.color}, transparent 60%)` }}
        aria-hidden="true" />

      {/* NEW badge */}
      {atlas.status === 'new' && (
        <div className="absolute top-3 right-3 z-10 text-[8.5px] tracking-[0.3em] uppercase font-bold text-emerald-300 border border-emerald-300/40 bg-emerald-300/10 px-1.5 py-0.5"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          new
        </div>
      )}

      <div className="flex items-baseline gap-3 mb-3 relative">
        <div className="text-[36px] leading-none font-bold shrink-0"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: atlas.color }}
          aria-hidden="true">
          {atlas.glyph}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 mb-0.5 flex items-center gap-1"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>Atlas</span>
            {isExternal && <ExternalLink size={9} strokeWidth={2} aria-hidden="true" />}
          </div>
          <div className="text-zinc-100 text-[20px] font-bold leading-tight"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {atlas.title}
          </div>
        </div>
        <ArrowRight size={16}
          className="text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
          aria-hidden="true" />
      </div>

      <p className="text-zinc-400 text-[13px] leading-relaxed mb-3 relative">
        {atlas.sub}
      </p>

      {/* Metadata row */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className={`text-[9.5px] tracking-[0.2em] uppercase font-semibold px-1.5 py-0.5 border ${DIFFICULTY_STYLES[atlas.difficulty]}`}
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {atlas.difficulty}
        </span>
        <span className="text-zinc-600 text-[10px]"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {atlas.chapters} chapters · {atlas.hours}h
        </span>
      </div>

      {/* Sandbox row */}
      <div className="text-[10px] text-zinc-500 flex items-start gap-1.5 mb-2"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <Sparkles size={10} className="text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
        <span className="truncate">{atlas.sandbox}</span>
      </div>

      {/* Bottom chapters + open */}
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600 border-t border-zinc-900 pt-2.5"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <span>{atlas.exercises} exercises</span>
        <span className="text-zinc-800">·</span>
        <span style={{ color: atlas.accent }}>open →</span>
      </div>
    </Wrapper>
      {/* Secondary "details" link — bottom-right, SEO surface for /atlas/:slug */}
      <Link to={`/atlas/${slug}`}
        className="absolute bottom-2 right-3 text-zinc-600 hover:text-emerald-300 text-[10px] tracking-[0.2em] uppercase transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
        aria-label={`See details about ${atlas.title}`}>
        details →
      </Link>
    </div>
  );
}

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

function AtlasGrid() {
  const [difficulty, setDifficulty] = useState('All');
  const filterFn = (a) => difficulty === 'All' || a.difficulty === difficulty;
  const core = CORE_ATLASES.filter(filterFn);
  const external = EXTERNAL_ATLASES.filter(filterFn);

  return (
    <section id="atlases" aria-labelledby="atlases-heading"
      className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ THE ATLASES
      </div>
      <h2 id="atlases-heading"
        className="text-zinc-100 text-[28px] sm:text-[36px] font-bold leading-tight tracking-tight mb-3"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        {ALL_ATLASES.length} interactive atlases.
      </h2>
      <p className="text-zinc-500 text-[14px] leading-relaxed max-w-2xl mb-6">
        Every atlas has the same shape: chapters, live sandboxes, and an artifact you built by the end.
        Core atlases live at this domain; advanced series are dedicated deployments.
      </p>

      {/* Difficulty filter */}
      <div className="flex flex-wrap gap-2 mb-6" role="tablist" aria-label="Filter atlases by difficulty">
        {DIFFICULTIES.map(d => {
          const count = d === 'All' ? ALL_ATLASES.length : ALL_ATLASES.filter(a => a.difficulty === d).length;
          const isActive = difficulty === d;
          const activeColor =
            d === 'Beginner'     ? 'text-lime-300 border-lime-300' :
            d === 'Intermediate' ? 'text-amber-300 border-amber-300' :
            d === 'Advanced'     ? 'text-rose-300 border-rose-300' :
                                    'text-emerald-300 border-emerald-300';
          return (
            <button key={d} onClick={() => setDifficulty(d)}
              role="tab" aria-selected={isActive}
              className={`px-3 py-1.5 border text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300 ${
                isActive
                  ? activeColor + ' bg-zinc-900/60'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {d} · {count}
            </button>
          );
        })}
      </div>

      {core.length === 0 && external.length === 0 && (
        <p className="text-zinc-500 text-[13px] italic border border-zinc-800 bg-zinc-950/40 p-4">
          No atlases match — try a different difficulty.
        </p>
      )}

      {core.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {core.map(atlas => <AtlasCard key={atlas.path} atlas={atlas} />)}
        </div>
      )}

      {/* External advanced series */}
      <div className="mt-8 pt-8 border-t border-zinc-900">
        <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ADVANCED SERIES · SEPARATE DEPLOYMENTS
        </div>
        <p className="text-zinc-500 text-[13px] leading-relaxed max-w-2xl mb-6">
          Deeper 4-section atlases shipped as their own Vercel deployments. Prerequisites live above.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {external.map(atlas => <AtlasCard key={atlas.url} atlas={atlas} />)}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// What's in each atlas — preserved from original
// ─────────────────────────────────────────────────────────────────────

function WhatsInside() {
  const rows = [
    ['12 chapters', 'origin → toolchain → bedrock → working library → triage → roadmap'],
    ['Real sandboxes', 'JS REPL, CPython (Pyodide), C / C++ (JSCPP), SQLite (sql.js)'],
    ['Curated libraries', 'production-grade snippets organized by intent, MIT-licensed'],
    ['Troubleshooting trees', 'walk the symptom → diagnose → fix path interactively'],
    ['Per-chapter quizzes', 'every claim backed; explanations cite primary sources'],
    ['Personalized for you', 'pick a stack profile, examples adapt throughout'],
    ['Comparison tables', 'STL containers, smart pointers, DB engines, isolation levels'],
    ['Saved progress', 'completion, quiz answers, your profile — all kept locally'],
  ];

  return (
    <section id="whats-inside" aria-labelledby="inside-heading"
      className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ WHAT'S IN EACH ATLAS
      </div>
      <h2 id="inside-heading" className="sr-only">What's in each atlas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
        {rows.map(([h, b]) => (
          <div key={h} className="flex items-baseline gap-2">
            <span className="text-zinc-100 font-medium"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              {h}
            </span>
            <span className="text-zinc-500">— {b}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// FAQ preview + link to /faq
// ─────────────────────────────────────────────────────────────────────

function FAQPreview() {
  // Show only the "basics" group on the homepage; full FAQ at /faq
  const basics = FAQ_GROUPS.find(g => g.id === 'basics');
  return (
    <section id="faq-preview" aria-labelledby="faq-heading"
      className="max-w-4xl mx-auto px-4 py-12 border-t border-zinc-900">
      <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ FREQUENTLY ASKED
      </div>
      <h2 id="faq-heading"
        className="text-zinc-100 text-[28px] sm:text-[36px] font-bold leading-tight tracking-tight mb-6"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Answers, before you ask.
      </h2>

      <div className="space-y-2 mb-6">
        {basics.items.map((faq, i) => (
          <details key={i} className="group border border-zinc-800 bg-zinc-950/60 hover:border-zinc-700 transition-colors">
            <summary className="cursor-pointer list-none px-4 py-3 flex items-start justify-between gap-3 text-zinc-100 font-semibold text-[14px] focus:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-emerald-300"
              style={{ fontFamily: 'Manrope, sans-serif' }}>
              <span>{faq.q}</span>
              <ChevronRight size={14} className="text-zinc-500 shrink-0 mt-1 transition-transform group-open:rotate-90"
                aria-hidden="true" />
            </summary>
            <div className="px-4 pb-3 pt-1 text-zinc-400 text-[13px] leading-relaxed border-t border-zinc-900">
              {faq.a}
            </div>
          </details>
        ))}
      </div>

      <Link to="/faq"
        className="inline-flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 text-[13px] font-semibold"
        style={{ fontFamily: 'Manrope, sans-serif' }}>
        <HelpCircle size={13} aria-hidden="true" />
        See all 25 questions
        <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
      </Link>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Enriched footer
// ─────────────────────────────────────────────────────────────────────

const FOOTER_LINKS = {
  Learn: [
    ['Browse atlases',  '#atlases'],
    ['Learning paths',  '#learning-paths'],
    ['Sample lesson',   '#sample-lesson'],
    ['Answers',         '/answers'],
    ['FAQ',             '/faq'],
    ['Your dashboard',  '/dashboard'],
  ],
  Trust: [
    ['About',           '/about'],
    ['Mission',         '/mission'],
    ['Roadmap',         '/roadmap'],
    ['Changelog',       '/changelog'],
    ['Sandbox safety',  '/sandbox-safety'],
  ],
  Support: [
    ['Help center',     '/support'],
    ['Contact',         '/contact'],
    ['Accessibility',   '/accessibility'],
  ],
  Legal: [
    ['Privacy policy',  '/privacy'],
    ['Terms of service','/terms'],
    ['Cookie policy',   '/cookies'],
  ],
};

function EnrichedFooter() {
  return (
    <footer role="contentinfo" className="max-w-4xl mx-auto px-4 pt-12 pb-8 mt-4 border-t border-zinc-900">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-8">
        <div className="col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-zinc-100 text-[16px] font-bold"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              ◇ Atlases
            </span>
          </div>
          <p className="text-zinc-500 text-[12px] leading-relaxed mb-2">
            Interactive learning for software engineering. Independent, free, no ads.
          </p>
          <p className="text-zinc-700 text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            a project of B. Symbolic
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([label, links]) => (
          <nav key={label} aria-labelledby={`footer-${label.toLowerCase()}`}>
            <h3 id={`footer-${label.toLowerCase()}`}
              className="text-zinc-300 text-[10px] tracking-[0.25em] uppercase mb-3 font-semibold"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {label}
            </h3>
            <ul className="space-y-1.5">
              {links.map(([text, href]) => {
                const isRoute = href.startsWith('/');
                const Comp = isRoute ? Link : 'a';
                const props = isRoute ? { to: href } : { href };
                return (
                  <li key={text}>
                    <Comp {...props}
                      className="text-zinc-500 hover:text-zinc-200 text-[12.5px] transition-colors"
                      style={{ fontFamily: 'Manrope, sans-serif' }}>
                      {text}
                    </Comp>
                  </li>
                );
              })}
            </ul>
          </nav>
        ))}
      </div>

      <div className="pt-4 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING · {new Date().getFullYear()}
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────

export default function Landing() {
  // Fonts are now loaded in index.html via <link> preconnect for perf,
  // but keep the dynamic loader as a fallback for robustness.
  useEffect(() => {
    if (document.querySelector('link[data-atlas-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.dataset.atlasFonts = '1';
    link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-300"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <a href="#atlases"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-emerald-300 focus:text-black focus:px-3 focus:py-2 focus:font-semibold">
        Skip to atlases
      </a>

      <main id="main">
        <Hero />
        <SampleLesson />
        <LearningPaths />
        <WhyAtlases />
        <AtlasGrid />
        <WhatsInside />
        <FAQPreview />
      </main>

      <EnrichedFooter />
    </div>
  );
}
