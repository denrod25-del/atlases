import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ATLASES = [
  {
    path: '/db',
    glyph: '⛁',
    name: 'DB',
    title: 'Databases',
    color: '#818cf8',
    accent: '#f472b6',
    sub: 'SQL, indexes, transactions, distributed. Real SQLite sandbox.',
    chapters: 12,
  },
  {
    path: '/net',
    glyph: '⇌',
    name: 'Net',
    title: 'Networking',
    color: '#67e8f9',
    accent: '#fb923c',
    sub: 'DNS, TLS, HTTP, CDN. Real DNS + HTTP sandbox.',
    chapters: 12,
  },
  {
    path: '/linux',
    glyph: '#',
    name: 'Linux',
    title: 'Linux',
    color: '#4ade80',
    accent: '#fcd34d',
    sub: 'Shell, filesystem, processes, systemd. Real mini-shell sandbox.',
    chapters: 12,
  },
  {
    path: '/crypto',
    glyph: '⊕',
    name: 'Crypto',
    title: 'Cryptography',
    color: '#6ee7b7',
    accent: '#e879f9',
    sub: 'Hashes, AES, Ed25519, post-quantum. Real SubtleCrypto sandbox.',
    chapters: 12,
  },
  {
    path: '/compilers',
    glyph: 'λ',
    name: 'Compilers',
    title: 'Compilers',
    color: '#a78bfa',
    accent: '#fbbf24',
    sub: 'Lexer, parser, IR, optimization. Live toy compiler + real LLVM samples.',
    chapters: 12,
  },
  {
    path: '/observability',
    glyph: '◉',
    name: 'Observability',
    title: 'Observability',
    color: '#67e8f9',
    accent: '#fb7185',
    sub: 'OpenTelemetry, metrics, traces, SLOs. Live PromQL sandbox with simulated incident.',
    chapters: 12,
  },
  {
    path: '/ai',
    glyph: '⊛',
    name: 'AI/LLM',
    title: 'AI/LLM Engineering',
    color: '#fb923c',
    accent: '#5eead4',
    sub: 'Tokens, RAG, agents, evals. Real tokenizer + cost calc + eval runner sandbox.',
    chapters: 12,
  },
  {
    path: '/fivem',
    glyph: '◫',
    name: 'FiveM/Lua',
    title: 'FiveM / Lua / QBCore',
    color: '#f9a8d4',
    accent: '#22d3ee',
    sub: 'Server/client split, events, QBCore→QBox, NUI. Real Lua interpreter + event flow sim + fxmanifest builder.',
    chapters: 12,
  },
  {
    path: '/encoding',
    glyph: '◰',
    name: 'Encoding',
    title: 'Encoding / Bytes / Wire Formats',
    color: '#fde68a',
    accent: '#38bdf8',
    sub: 'ASCII, UTF-8, base64, hex, URL encoding. Real multi-converter + UTF-8 bit visualizer + mojibake demo.',
    chapters: 12,
  },
  {
    path: '/python',
    glyph: 'π',
    name: 'Python',
    title: 'Python',
    color: '#34d399',
    accent: '#fcd34d',
    sub: 'Language, stdlib, packaging, the modern toolchain. Real CPython.',
    chapters: 12,
  },
  {
    path: '/javascript',
    glyph: 'ƒ',
    name: 'JS',
    title: 'JavaScript',
    color: '#facc15',
    accent: '#a78bfa',
    sub: 'The language, runtime, the modern stack. Real REPL.',
    chapters: 12,
  },
  {
    path: '/cpp',
    glyph: '∷',
    name: 'C++',
    title: 'C++',
    color: '#c084fc',
    accent: '#2dd4bf',
    sub: 'RAII, templates, smart pointers, modern C++. Through C++26.',
    chapters: 12,
  },
  {
    path: '/c',
    glyph: '&',
    name: 'C',
    title: 'C',
    color: '#60a5fa',
    accent: '#f87171',
    sub: 'Pointers, memory, the toolchain. The foundation.',
    chapters: 12,
  },
  {
    path: '/docker',
    glyph: '⧈',
    name: 'Docker',
    title: 'Docker',
    color: '#38bdf8',
    accent: '#fbbf24',
    sub: 'Containers, images, networking, Compose. From first principles.',
    chapters: 12,
  },
  {
    path: '/n8n',
    glyph: '⬢',
    name: 'n8n',
    title: 'n8n',
    color: '#fb7185',
    accent: '#22d3ee',
    sub: 'Workflow automation, nodes, AI agents, self-hosting.',
    chapters: 12,
  },
  {
    path: '/coolify',
    glyph: '⟁',
    name: 'Coolify',
    title: 'Coolify',
    color: '#a3e635',
    accent: '#e879f9',
    sub: 'Self-hosted PaaS. Deploy your own infrastructure.',
    chapters: 12,
  },
];

export default function Landing() {
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-300" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* HERO */}
      <header className="max-w-4xl mx-auto px-4 pt-12 pb-8 sm:pt-20 sm:pb-12">
        <div className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ INTERACTIVE LEARNING ATLASES
        </div>
        <h1 className="text-zinc-100 text-[44px] sm:text-[64px] font-bold leading-[0.95] mb-4 tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Pick a topic.<br />
          <span className="text-zinc-500">Build the intuition.</span>
        </h1>
        <p className="text-zinc-400 text-[16px] sm:text-[18px] leading-relaxed max-w-2xl">
          Sixteen long-form interactive guides — each one a 12-chapter dive with real sandboxes,
          curated snippet libraries, troubleshooting trees, and the kind of practical detail
          you actually need to ship.
        </p>
        <div className="mt-4 text-[12px] text-zinc-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          progress saves locally · no signup · {ATLASES.length} atlases · {ATLASES.length * 12} chapters
        </div>
      </header>

      {/* GRID */}
      <main className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ATLASES.map((a) => (
            <Link
              key={a.path}
              to={a.path}
              className="group block border border-zinc-800 hover:border-zinc-600 bg-zinc-950/60 hover:bg-zinc-900/60 transition-colors p-5 relative overflow-hidden"
            >
              {/* accent corner */}
              <div
                className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ background: `radial-gradient(circle at top right, ${a.color}, transparent 70%)` }}
              />
              <div className="flex items-baseline gap-3 mb-3 relative">
                <div
                  className="text-[36px] leading-none font-bold shrink-0"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: a.color }}
                >
                  {a.glyph}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.3em] text-zinc-600 mb-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    Atlas
                  </div>
                  <div className="text-zinc-100 text-[22px] font-bold leading-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {a.title}
                  </div>
                </div>
                <ArrowRight size={16} className="text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </div>
              <p className="text-zinc-400 text-[13px] leading-relaxed mb-3 relative">{a.sub}</p>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span>{a.chapters} chapters</span>
                <span className="text-zinc-800">·</span>
                <span style={{ color: a.accent }}>open →</span>
              </div>
            </Link>
          ))}
        </div>

        {/* WHAT'S INSIDE */}
        <section className="mt-12 border-t border-zinc-900 pt-8">
          <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ◇ WHAT'S IN EACH ATLAS
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
            {[
              ['12 chapters', 'origin → toolchain → bedrock → working library → triage → roadmap'],
              ['Real sandboxes', 'JS REPL, CPython (Pyodide), C / C++ (JSCPP), SQLite (sql.js)'],
              ['Curated libraries', 'production-grade snippets organized by intent, MIT-licensed'],
              ['Troubleshooting trees', 'walk the symptom → diagnose → fix path interactively'],
              ['Per-chapter quizzes', 'every claim backed; explanations cite primary sources'],
              ['Personalized for you', 'pick a stack profile, examples adapt throughout'],
              ['Comparison tables', 'STL containers, smart pointers, DB engines, isolation levels'],
              ['Saved progress', 'completion, quiz answers, your profile — all kept locally'],
            ].map(([h, b]) => (
              <div key={h} className="flex items-baseline gap-2">
                <span className="text-zinc-100 font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{h}</span>
                <span className="text-zinc-500">— {b}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 pt-6 border-t border-zinc-900 text-[10px] text-zinc-700 text-center tracking-[0.3em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ◇ ATLASES · BUILT TO TEACH · NO ADS · NO TRACKING
        </footer>
      </main>
    </div>
  );
}
