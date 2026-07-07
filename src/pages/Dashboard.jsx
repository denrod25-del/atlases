/* /dashboard — personal learning dashboard.
 *
 * Reads directly from localStorage using each atlas's known storage prefix
 * (see atlas-storage-map.js). No account required, no server call — the
 * same "progress saves locally" story the site advertises.
 *
 * Displays:
 *   • Overall stats (chapters done, atlases started, atlases finished)
 *   • Continue-where-you-left-off (most recently active atlas)
 *   • Per-atlas progress cards with completion bars
 *   • Recommended next atlas (based on tracks of atlases in progress)
 *   • First-visit empty state that funnels to a learning path
 *
 * Also tracks: last-visit dashboard timestamp for a streak counter.
 * Streak logic is deliberately forgiving — visiting the dashboard counts.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Award, BookOpen, Flame, CheckCircle2,
  Compass, TrendingUp, Sparkles, RotateCcw,
} from 'lucide-react';
import { CORE_ATLASES, ALL_ATLASES } from '../data/atlases-meta.js';
import { STORAGE_PREFIX_TO_PATH, ATLAS_KEYS } from '../data/atlas-storage-map.js';
import { LEARNING_PATHS } from '../data/paths.js';

// Core atlases whose progress the dashboard can actually read.
const TRACKED_PATHS = new Set(Object.values(STORAGE_PREFIX_TO_PATH));
const TRACKED_ATLASES = CORE_ATLASES.filter(a => TRACKED_PATHS.has(a.path));

// ─── Storage helpers ──────────────────────────────────────────────
const STREAK_KEY = 'atlases-hub:streak';

// Accessing localStorage throws SecurityError when browser storage is
// disabled/blocked — treat that the same as "no saved progress".
function safeGetItem(key) {
  try { return localStorage.getItem(key); }
  catch { return null; }
}

function readAtlasProgress() {
  const results = [];
  if (typeof window === 'undefined' || !window.storage) return results;

  for (const [prefix, atlasPath] of Object.entries(STORAGE_PREFIX_TO_PATH)) {
    const atlas = CORE_ATLASES.find(a => a.path === atlasPath);
    if (!atlas) continue;

    const rawCompleted = safeGetItem(prefix + ':' + ATLAS_KEYS.completed);
    const rawActive    = safeGetItem(prefix + ':' + ATLAS_KEYS.activeSection);
    const rawStack     = safeGetItem(prefix + ':' + ATLAS_KEYS.stack);

    let completedIds = [];
    if (rawCompleted) {
      try { completedIds = JSON.parse(rawCompleted); }
      catch { completedIds = []; }
    }
    // Some atlases persist Set values as string arrays — normalize to a set of strings
    const doneCount = Array.isArray(completedIds) ? completedIds.length : 0;
    const activeSection = rawActive !== null ? parseInt(rawActive, 10) : null;
    const started = doneCount > 0 || (activeSection !== null && activeSection > 0);
    const finished = doneCount >= atlas.chapters;
    const progress = Math.min(100, Math.round((doneCount / atlas.chapters) * 100));

    results.push({
      atlas,
      prefix,
      doneCount,
      activeSection,
      hasStack: rawStack !== null,
      started,
      finished,
      progress,
    });
  }
  return results;
}

// Streak: visit-based, forgiving. Increment when a new day is visited,
// break if more than one day gap. Stored as { last: 'YYYY-MM-DD', count: n }.
function readStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (!raw) return { count: 0, last: null };
    const parsed = JSON.parse(raw);
    return { count: parsed.count || 0, last: parsed.last || null };
  } catch { return { count: 0, last: null }; }
}

function updateStreak() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const prev = readStreak();
  if (prev.last === today) return prev; // same day, no change
  let count;
  if (prev.last) {
    const prevDate = new Date(prev.last + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const daysGap = Math.round((todayDate - prevDate) / (1000 * 60 * 60 * 24));
    count = daysGap === 1 ? prev.count + 1 : 1; // consecutive → +1, else reset
  } else {
    count = 1;
  }
  const next = { count, last: today };
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(next)); } catch {}
  return next;
}

// Suggest which atlas to do next: prefer in-progress atlas with highest progress,
// otherwise recommend based on tracks of in-progress atlases, otherwise a starter.
function recommendNext(progress) {
  const inProgress = progress.filter(p => p.started && !p.finished);
  if (inProgress.length > 0) {
    // Continue the atlas the user is furthest along in
    return inProgress.sort((a, b) => b.progress - a.progress)[0].atlas;
  }
  // No in-progress atlas → suggest based on tracks of atlases actually touched
  const touchedTracks = new Set(
    progress.filter(p => p.started).flatMap(p => p.atlas.tracks)
  );
  if (touchedTracks.size > 0) {
    // Find an untouched atlas in one of those tracks
    const startedPaths = new Set(progress.filter(p => p.started).map(p => p.atlas.path));
    const candidate = CORE_ATLASES.find(a =>
      a.tracks.some(t => touchedTracks.has(t)) && !startedPaths.has(a.path)
    );
    if (candidate) return candidate;
  }
  // Complete fresh start → suggest Python (broadly applicable, beginner)
  return CORE_ATLASES.find(a => a.path === '/python');
}

// ─── UI pieces ────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, subtitle, color = 'text-emerald-300' }) {
  return (
    <div className="border border-zinc-800 bg-zinc-950/40 p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className={color} aria-hidden="true" />
        <div className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase font-semibold"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {label}
        </div>
      </div>
      <div className={`${color} text-[32px] font-bold leading-none mb-1`}
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        {value}
      </div>
      {subtitle && (
        <div className="text-zinc-500 text-[11px] leading-relaxed">
          {subtitle}
        </div>
      )}
    </div>
  );
}

function ProgressCard({ p }) {
  const { atlas, doneCount, activeSection, progress, started, finished } = p;
  return (
    <div className="border border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-900/60 p-4 transition-colors flex flex-col">
      <div className="flex items-baseline gap-2.5 mb-2">
        <span className="text-[24px] leading-none shrink-0"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: atlas.color }}
          aria-hidden="true">
          {atlas.glyph}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-zinc-100 text-[15px] font-bold truncate"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {atlas.title}
          </div>
          <div className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {finished ? 'complete' : started ? 'in progress' : 'not started'}
          </div>
        </div>
        {finished && (
          <CheckCircle2 size={16} className="text-emerald-300 shrink-0" aria-hidden="true" />
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-zinc-400 text-[11px]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {doneCount} / {atlas.chapters} chapters
          </span>
          <span className="text-zinc-500 text-[11px] font-semibold"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {progress}%
          </span>
        </div>
        <div className="h-1.5 bg-zinc-900 border border-zinc-800 overflow-hidden" role="progressbar"
          aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
          aria-label={`${atlas.title} progress: ${progress} percent`}>
          <div className="h-full transition-all"
            style={{ width: `${progress}%`, background: atlas.color }} />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-auto">
        <Link to={atlas.path}
          className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 border border-emerald-300 text-emerald-300 hover:bg-emerald-300/10 font-semibold text-[12px] transition-colors"
          style={{ fontFamily: 'Manrope, sans-serif' }}
          aria-label={started ? `Continue ${atlas.title}` : `Start ${atlas.title}`}>
          {started ? (finished ? 'Review' : 'Continue') : 'Start'}
          <ArrowRight size={11} strokeWidth={2.5} aria-hidden="true" />
        </Link>
        <Link to={`/atlas/${atlas.path.slice(1)}`}
          className="text-zinc-500 hover:text-zinc-300 text-[10px] tracking-[0.2em] uppercase px-2 transition-colors"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
          aria-label={`See details for ${atlas.title}`}>
          info
        </Link>
      </div>
    </div>
  );
}

function EmptyState({ streak }) {
  return (
    <section className="border border-emerald-300/30 bg-emerald-300/5 p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 border border-emerald-300/40 bg-emerald-300/10 flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-emerald-300" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-zinc-100 text-[20px] font-bold leading-tight mb-1"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Welcome to your dashboard.
          </h2>
          <p className="text-zinc-400 text-[13.5px] leading-relaxed">
            You haven't started an atlas yet. Pick a Learning Path — the site recommends where to
            begin based on what you want to build.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
        {LEARNING_PATHS.map(path => (
          <Link key={path.id} to={`/#learning-paths`}
            className="flex items-center justify-between gap-2 border border-emerald-300/30 bg-black/40 hover:border-emerald-300 hover:bg-emerald-300/10 p-3 transition-colors">
            <div>
              <div className={`${path.color} text-[10px] tracking-[0.25em] uppercase font-semibold`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                path
              </div>
              <div className="text-zinc-100 text-[13.5px] font-bold">
                {path.label}
              </div>
            </div>
            <ArrowRight size={13} className="text-emerald-300 shrink-0" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const [progress, setProgress] = useState([]);
  const [streak, setStreak] = useState({ count: 0, last: null });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = 'Your dashboard · Atlases';
    setProgress(readAtlasProgress());
    setStreak(updateStreak());
    setLoaded(true);
  }, []);

  const started    = progress.filter(p => p.started);
  const inProgress = progress.filter(p => p.started && !p.finished);
  const finished   = progress.filter(p => p.finished);
  const totalChaptersDone = progress.reduce((s, p) => s + p.doneCount, 0);
  // Denominator counts only atlases with persisted progress (stateless
  // Coolify is untracked) so completing every tracked atlas reads 100%.
  const totalChaptersAvail = TRACKED_ATLASES.reduce((s, a) => s + a.chapters, 0);
  const overallPct = totalChaptersAvail > 0
    ? Math.round((totalChaptersDone / totalChaptersAvail) * 100)
    : 0;

  const recommendation = loaded ? recommendNext(progress) : null;
  const isFirstVisit = loaded && started.length === 0;

  const resetStreak = () => {
    try { localStorage.removeItem(STREAK_KEY); } catch {}
    setStreak({ count: 0, last: null });
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300"
      style={{ fontFamily: 'Manrope, sans-serif' }}>
      <main id="main" className="max-w-4xl mx-auto px-4 pt-12 pb-16">
        <Link to="/"
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-zinc-200 text-[13px] mb-8"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <ArrowLeft size={13} strokeWidth={2} aria-hidden="true" />
          back to atlases
        </Link>

        <div className="text-[10px] uppercase tracking-[0.4em] text-emerald-300 mb-3"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ YOUR DASHBOARD
        </div>
        <h1 className="text-zinc-100 text-[36px] sm:text-[48px] font-bold leading-tight tracking-tight mb-3"
          style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          {isFirstVisit ? 'Ready to begin?' : `${overallPct}% through the atlases.`}
        </h1>
        <p className="text-zinc-500 text-[15px] leading-relaxed max-w-2xl mb-10">
          All progress lives on your device — nothing is uploaded. Clear browser storage and
          the dashboard resets. Sign-in for cross-device progress is on the roadmap.
        </p>

        {isFirstVisit && <EmptyState streak={streak} />}

        {/* Stat cards */}
        {!isFirstVisit && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard icon={Flame} label="streak" value={streak.count}
              subtitle={streak.count === 1 ? 'day (started today)' : streak.count > 1 ? 'days in a row' : 'no active streak'}
              color="text-amber-300" />
            <StatCard icon={BookOpen} label="chapters done" value={totalChaptersDone}
              subtitle={`of ${totalChaptersAvail} total`} />
            <StatCard icon={Compass} label="atlases started" value={started.length}
              subtitle={`of ${CORE_ATLASES.length} core`} />
            <StatCard icon={Award} label="atlases completed" value={finished.length}
              subtitle={finished.length === 1 ? 'nicely done' : finished.length > 1 ? 'great progress' : 'first coming soon'} />
          </div>
        )}

        {/* Recommended next */}
        {recommendation && !isFirstVisit && (
          <section aria-labelledby="rec-heading"
            className="border border-emerald-300/30 bg-emerald-300/5 p-5 mb-8">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={13} className="text-emerald-300" aria-hidden="true" />
              <h2 id="rec-heading"
                className="text-emerald-300 text-[10px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {inProgress.length > 0 ? 'continue where you left off' : 'recommended next'}
              </h2>
            </div>
            <div className="flex items-start gap-4">
              <span className="text-[48px] leading-none shrink-0"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: recommendation.color }}
                aria-hidden="true">
                {recommendation.glyph}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-zinc-100 text-[22px] font-bold leading-tight mb-1"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {recommendation.title}
                </div>
                <p className="text-zinc-300 text-[13.5px] leading-relaxed mb-3">
                  {recommendation.sub}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={recommendation.path}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-300 text-black hover:bg-emerald-200 font-semibold text-[13px] transition-colors"
                    style={{ fontFamily: 'Manrope, sans-serif' }}>
                    {inProgress.length > 0 ? 'Continue' : 'Start'}
                    <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
                  </Link>
                  <Link to={`/atlas/${recommendation.path.slice(1)}`}
                    className="text-zinc-400 hover:text-zinc-200 text-[12px] underline transition-colors"
                    style={{ fontFamily: 'Manrope, sans-serif' }}>
                    see details
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* All atlases with progress */}
        <section aria-labelledby="all-heading" className="mb-10">
          <h2 id="all-heading"
            className="text-emerald-300 text-[11px] tracking-[0.3em] uppercase font-semibold mb-4 pb-2 border-b border-zinc-900"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            all atlases · your progress
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {progress.map(p => <ProgressCard key={p.atlas.path} p={p} />)}
          </div>
        </section>

        {/* Utilities */}
        <section className="border-t border-zinc-900 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-zinc-600 text-[11px]"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            progress is per-device · nothing is uploaded
          </p>
          {streak.count > 0 && (
            <button onClick={resetStreak}
              className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-300 text-[11px] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-300"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
              aria-label="Reset streak counter">
              <RotateCcw size={10} aria-hidden="true" />
              reset streak
            </button>
          )}
        </section>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </div>
      </main>
    </div>
  );
}
