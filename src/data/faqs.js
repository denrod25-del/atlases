/* Frequently Asked Questions — 25 Q&A across 5 groups.
 * FAQPage JSON-LD in index.html carries the top 7 for AI-answer surfaces.
 */

export const FAQ_GROUPS = [
  {
    id: 'basics',
    label: 'The basics',
    items: [
      { q: 'What is Atlases?',
        a: `Atlases is an interactive learning platform for software engineering. Each atlas is a chapter-based guide on one topic — databases, Linux, networking, Docker, AI engineering, and more — with real browser sandboxes where you practice concepts as you learn them.` },
      { q: 'Who is Atlases for?',
        a: `Working engineers, self-taught developers, students, and career switchers. Some atlases are beginner-friendly (Python, Linux, Encoding); others are advanced (Distributed Systems, Compilers, Reliability). Every atlas lists its difficulty and prerequisites up front.` },
      { q: 'How is Atlases different from a YouTube tutorial or docs?',
        a: `Two things. First: every concept has an interactive — a live sandbox, simulator, or playground — where you can try the idea immediately instead of watching someone else use it. Second: content is structured into chapters with explicit learning objectives, not a random walk through a topic.` },
      { q: 'Do I need to install anything?',
        a: `No. Every atlas runs in your browser. Terminals, code editors, databases, and simulators are all browser-based. You can start learning immediately from any device with a modern browser.` },
      { q: 'Is Atlases free?',
        a: `Yes. All atlases are free and open access. No account is required. Progress saves locally to your browser — no signup, no tracking, no ads.` },
    ],
  },
  {
    id: 'getting-started',
    label: 'Getting started',
    items: [
      { q: 'I have never programmed before. Where do I start?',
        a: `Start with Python — it assumes no prior programming knowledge and you write and run real Python in your browser from the first chapter. Alternative starts: Linux (if you want a shell-first approach) or Encoding (if you want to understand what bytes are).` },
      { q: 'I know some programming. Which atlas fits me?',
        a: `Choose a Learning Path — Backend, AI, DevOps, or Computer Science — and the path recommends a starting atlas. If you already know a language, skip Python and jump into the intermediate atlas that matches your target work.` },
      { q: 'How long does each atlas take?',
        a: `Each atlas has 12 chapters and takes 6–16 hours depending on your prior experience. You can complete an atlas across several evenings, or knock out chapters in shorter sessions.` },
      { q: 'Can I save my progress?',
        a: `Yes — progress saves automatically to your browser's local storage per-chapter. No account required. If you use a different browser or clear storage, progress won't transfer.` },
      { q: 'Do I need to complete atlases in order?',
        a: `No. Every atlas is standalone. If prerequisites help, they're listed on the atlas card. Learning paths are recommendations, not requirements — jump around freely.` },
    ],
  },
  {
    id: 'sandboxes',
    label: 'Browser sandboxes',
    items: [
      { q: 'Are the browser sandboxes real?',
        a: `Yes. The Python sandbox runs real CPython via Pyodide. C and C++ sandboxes use JSCPP. The Linux terminal is a working mini-shell. SQL runs against real SQLite (sql.js). The AI atlas uses real tokenizers. What you type actually runs and produces real output.` },
      { q: 'How do the sandboxes stay safe?',
        a: `Every sandbox runs in the browser's own isolation model — WebAssembly, Web Workers, and sandboxed iframes. Nothing you write leaves your browser. No sandbox code touches our servers. Session state stays on your device.` },
      { q: 'Can I break things in the sandbox?',
        a: `Please do. Delete files, fork bombs, infinite loops — the sandbox can be reset from any page. Breaking things safely is the fastest way to learn what shouldn't be broken elsewhere.` },
      { q: 'Do sandboxes work offline?',
        a: `Client-side sandboxes (Python, C, C++, SQL, Encoding, Linux basics) work offline once the page has loaded. Sandboxes needing external services (some AI features, real DNS lookups) require connectivity.` },
      { q: 'Can I download my sandbox work?',
        a: `Yes. Every sandbox has an export path — copy code to clipboard or download files as text. Nothing is locked in.` },
    ],
  },
  {
    id: 'topics',
    label: 'Topics covered',
    items: [
      { q: 'What programming languages does Atlases cover?',
        a: `Direct language atlases: Python, JavaScript, C, C++. Language-agnostic atlases (Databases, Linux, Networking, Docker, Cryptography, AI Engineering) contain code samples in whichever language is most natural for the topic.` },
      { q: 'Does Atlases cover AI and machine learning?',
        a: `Yes — the AI/LLM Engineering atlas covers tokens, RAG, agents, evals, cost calculation, and real tokenizer usage. Focus is on building with existing models, not training new ones from scratch.` },
      { q: 'Are there DevOps and infrastructure atlases?',
        a: `Yes — Linux, Networking, Docker, Coolify (self-hosted PaaS), n8n (workflow automation), Observability (OpenTelemetry, metrics, traces, SLOs), and the advanced Reliability atlas covering SLOs, error budgets, and chaos engineering.` },
      { q: 'Does Atlases teach computer science fundamentals?',
        a: `Yes — Compilers, Cryptography, Encoding/Bytes, C, C++, Networking — the foundations most self-taught engineers wish they'd learned formally.` },
      { q: 'What is FiveM / QBCore / Lua doing in the atlas list?',
        a: `The FiveM / Lua / QBCore atlas covers game-server programming for the FiveM (GTA V multiplayer) modding platform — a real active community with real production servers. It's a great practical Lua and event-driven-systems primer.` },
    ],
  },
  {
    id: 'trust',
    label: 'Trust & privacy',
    items: [
      { q: 'What data do you collect?',
        a: `Almost none. There is no signup, so no accounts, no emails collected. No behavioral ads, no third-party tracking. Progress state saves to your browser's local storage, not to our servers. See the Privacy Policy for the exact scope.` },
      { q: 'Do sandboxes send my code anywhere?',
        a: `No. Sandbox code executes in your browser via WebAssembly. Keystrokes are not logged, code is not uploaded, output is not stored on our servers.` },
      { q: 'Who runs Atlases?',
        a: `Atlases is a project by B. Symbolic. It's built independently, without VC backing, and is intended to remain free.` },
      { q: 'Can I contribute or report an issue?',
        a: `Yes. Content issues, sandbox bugs, and feature requests go to the Contact page. Every atlas has a "found a problem?" link in its footer.` },
      { q: 'Are the atlases open source?',
        a: `The site is source-available under the license in the repository. Individual sandbox libraries (Pyodide, sql.js, JSCPP) are their own open-source projects.` },
    ],
  },
];

// Flat list for search
export const ALL_FAQS = FAQ_GROUPS.flatMap(g => g.items);
