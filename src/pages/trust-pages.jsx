/* Phase 3 — real content for trust routes.
 *
 * Every page below is production-quality prose in the Atlases voice.
 * The Privacy Policy and Terms are still Atlases-authored and not a
 * substitute for legal review, but they're accurate to what the site
 * actually does and will hold up as public-facing policy.
 */

import { Link } from 'react-router-dom';
import TrustPage from './TrustPage.jsx';

// ─── About ─────────────────────────────────────────────────────────
export function AboutPage() {
  return (
    <TrustPage eyebrow="ABOUT" title="About Atlases"
      lead="Atlases is an interactive learning platform for software engineering, built by an independent maker who wanted the kind of learning material that didn't exist yet.">
      <p>
        Every atlas is a long-form guide with real browser sandboxes, chapter-by-chapter structure,
        curated snippet libraries, and troubleshooting trees. Nothing to install. No signup.
        No ads. Progress saves locally to your browser.
      </p>
      <p>
        The idea came from a specific frustration: engineering education is either shallow
        (YouTube tutorials) or gated (bootcamps, university courses, paid platforms). What was
        missing was long-form, interactive, free material that respected your time and treated
        you like an adult who wanted to learn something properly.
      </p>
      <p>
        <strong className="text-zinc-200">Who's behind it:</strong> Atlases is a project of{' '}
        <span className="text-zinc-200">B. Symbolic</span>, an independent studio. No VC. No investors.
        The goal is to keep it free, useful, and unclouded by growth-hacking.
      </p>
      <p>
        <strong className="text-zinc-200">Contributing:</strong> content issues, sandbox bugs, and
        feature requests are welcomed via the <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact page</Link>.
        Every atlas footer also carries a direct-report link.
      </p>
      <p>
        <strong className="text-zinc-200">What's next:</strong> the{' '}
        <Link to="/roadmap" className="text-emerald-300 hover:text-emerald-200 underline">Roadmap</Link> is
        public. Requests and feedback shape it.
      </p>
    </TrustPage>
  );
}

// ─── Mission ───────────────────────────────────────────────────────
export function MissionPage() {
  return (
    <TrustPage eyebrow="MISSION" title="Why Atlases exists"
      lead="Engineering education has a shape problem. Atlases exists to try a different one.">
      <p>
        The dominant learning shapes today are: short videos (fun, low depth), documentation
        (necessary, hostile to beginners), interactive courses (usually paywalled), and books
        (dense, static). Each has real value. None of them are what someone actually needs when
        they're trying to learn a specific hard thing quickly and thoroughly.
      </p>
      <p>
        <strong className="text-zinc-200">The Atlases shape:</strong> long-form, chapter-based
        interactive guides where every concept is immediately practicable. You don't watch someone
        else write SQL — you write it. You don't read about Linux — you use a working shell in your
        browser. You don't memorize what Docker is — you build a container.
      </p>
      <p>
        <strong className="text-zinc-200">The constraint that shapes everything:</strong> free and
        unowned by any vendor. No conversion funnels, no upgrade prompts, no "sign up to see the rest."
        The material has to work for someone at 2am with no wallet and no company backing.
      </p>
      <p>
        <strong className="text-zinc-200">What we optimize for:</strong> whether a working engineer
        (or a person becoming one) walks away from an atlas better at the actual work. Not video
        views. Not signup rates. Whether the knowledge stuck and can be used.
      </p>
      <p>
        <strong className="text-zinc-200">What we don't do:</strong> collect data we don't need,
        run ads, sell attention, gamify things that shouldn't be games, replace real practice with
        infinite quizzes, or pretend to teach things we haven't done ourselves.
      </p>
    </TrustPage>
  );
}

// ─── Roadmap ───────────────────────────────────────────────────────
export function RoadmapPage() {
  return (
    <TrustPage eyebrow="ROADMAP" title="What's next"
      lead="A public plan. Dates are targets, not promises — timelines slip when things need to be built well.">
      <p>
        The roadmap tracks the biggest planned work only. Smaller improvements ship as they're
        ready and land in the <Link to="/changelog" className="text-emerald-300 hover:text-emerald-200 underline">Changelog</Link>.
      </p>
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Now — actively building
      </h2>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Per-atlas landing pages</strong> — dedicated pages at /atlas/:slug with learning objectives, prerequisites, and related-atlas navigation (SEO surface for individual atlases).</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">AEO/GEO answer pages</strong> — long-form "what is X" pages at /answers/:slug optimized for AI-search extraction and structured for LLM citation.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Sample lesson on homepage</strong> — 3-step SQL exercise so visitors can experience the teaching pattern in 90 seconds.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Personal dashboard</strong> — /dashboard shows chapters completed, in-progress atlases, streak, continue-where-you-left-off, all from local storage.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Next — planned this quarter
      </h2>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Optional accounts</strong> — cross-device progress sync via a magic-link login. Fully optional; no account required to learn.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Mobile atlas experience</strong> — improved reading and sandbox interactions on phones. Currently usable, not optimal.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">More answer pages</strong> — expand /answers/ to cover the top 30 topics engineers search for.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Later — planned but not scheduled
      </h2>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Frontend track</strong> — atlases for HTML/CSS, React, browser APIs, performance. Deliberately last: the existing web tutorial ecosystem is more crowded here.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Incident Response atlas</strong> — completes the operations arc (Observability → Reliability → Incident Response).</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Algorithms atlas</strong> — classic algorithms with visualizers, complexity analysis, and real practice problems.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Operating Systems atlas</strong> — processes, threads, virtual memory, scheduling, filesystems, syscalls.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Native mobile app</strong> — offline reading on phones and tablets. Contingent on demand.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Not on the roadmap
      </h2>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed">Certifications, badges, LinkedIn integrations, or any employer-verification layer. The point is skills, not signaling.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed">Paid tiers, subscriptions, or advertising.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed">Gamification for its own sake (leaderboards, points-for-clicks).</li>
      </ul>

      <p className="mt-8 text-zinc-500 text-[13px] italic">
        Suggestions and requests welcome via <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link>. The
        roadmap follows demand where it aligns with the mission.
      </p>
    </TrustPage>
  );
}

// ─── Changelog ─────────────────────────────────────────────────────
export function ChangelogPage() {
  const entries = [
    {
      date: '2026-07-01',
      title: 'Phase 3 — Trust content + Dashboard',
      items: [
        'Personal dashboard at /dashboard with streak, per-atlas progress, and continue-where-you-left-off',
        'Complete rewrites of Privacy, Terms, About, Mission, Roadmap with real production-quality content',
        'New Mission page separating the "why exists" story from the "who is behind it" story',
        'New Changelog page (you\'re reading it)',
        'Sitemap generation moved to a build script — new atlases and answer pages auto-appear',
      ],
    },
    {
      date: '2026-07-01',
      title: 'Phase 2 — Sample lesson + Per-atlas landing pages + AEO',
      items: [
        'Homepage sample lesson: 3-step interactive SQL playground with tiny-sql evaluator (zero deps)',
        'Per-atlas landing pages at /atlas/:slug with Course JSON-LD schema, dynamic meta tags, and related-atlas navigation',
        'AEO/GEO answer pages at /answers/:slug — 8 long-form Q&A pages optimized for AI-search extraction',
        'QAPage JSON-LD schema on answer pages for Perplexity / ChatGPT / Claude / Google AI Overview',
        'robots.txt + sitemap.xml with all 65 indexable URLs',
      ],
    },
    {
      date: '2026-07-01',
      title: 'Phase 1 — Homepage overhaul',
      items: [
        'New hero with dual CTA (Start Learning + Browse Atlases) and 4-item trust row',
        'Learning Paths section — Backend / AI / DevOps / CS with recommended starting atlases',
        'Why Atlases side-by-side comparison',
        'Improved atlas cards with difficulty, hours, exercises, sandbox description',
        'FAQ preview on homepage + dedicated /faq with 25 questions across 5 groups',
        'Full SEO/AEO/GEO in index.html: 5 JSON-LD schemas (Organization, WebSite, Course, FAQPage, BreadcrumbList)',
        '9 trust-page routes with placeholder content (Phase 3 replaced with real content)',
        'WCAG 2.1 AA accessibility baseline: semantic HTML, focus states, skip-link, reduced-motion',
      ],
    },
    {
      date: 'earlier',
      title: 'Original launch — 16 interactive atlases',
      items: [
        'Databases, Networking, Linux, Cryptography, Compilers, Observability, AI/LLM, FiveM/Lua, Encoding',
        'Python, JavaScript, C++, C, Docker, n8n, Coolify',
        'Real browser sandboxes: SQLite (sql.js), CPython (Pyodide), C/C++ (JSCPP), SubtleCrypto, Lua interpreter, PromQL',
        'Per-chapter quizzes, curated snippet libraries, troubleshooting trees, stack-profile personalization',
        'Progress persistence via localStorage — no signup required',
      ],
    },
  ];

  return (
    <TrustPage eyebrow="CHANGELOG" title="What changed"
      lead="Every meaningful update. Small fixes and copy edits happen continuously and aren't listed.">
      <div className="space-y-10">
        {entries.map((e, i) => (
          <section key={i} className="border-l-2 border-emerald-300/40 pl-4">
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="text-emerald-300 text-[11px] tracking-[0.25em] uppercase font-semibold"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {e.date}
              </span>
              <h2 className="text-zinc-100 text-[18px] font-bold leading-tight"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {e.title}
              </h2>
            </div>
            <ul className="space-y-1.5 pl-4">
              {e.items.map((item, j) => (
                <li key={j} className="text-zinc-300 text-[13.5px] leading-relaxed list-disc marker:text-zinc-600">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </TrustPage>
  );
}

// ─── Sandbox Safety ────────────────────────────────────────────────
export function SandboxSafetyPage() {
  return (
    <TrustPage eyebrow="SANDBOX SAFETY" title="How the sandboxes stay safe"
      lead="Every sandbox in every atlas runs in the browser's own isolation model. Your code and data don't leave your device.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Browser isolation
      </h2>
      <p>
        Sandboxes use one of several isolation primitives depending on the atlas:
      </p>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">WebAssembly (WASM)</strong> — Pyodide runs real CPython in a sandboxed WASM module. JSCPP runs C/C++ similarly. sql.js runs SQLite. WASM cannot make arbitrary network requests, read your filesystem, or install anything.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Web Workers</strong> — long-running or CPU-heavy sandbox operations execute in a Web Worker, isolated from the main page thread. If a sandbox hangs, only the worker is affected.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">In-JS evaluators</strong> — small sandboxes (like the homepage sample-lesson SQL) run in constrained JS that only processes text input. No `eval`, no dynamic code execution of user input.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Data privacy
      </h2>
      <p>
        Code you write in sandboxes stays on your device. Keystrokes are not logged, source is
        not uploaded, output is not stored on our servers. When you refresh the page, sandbox
        contents reset unless you've explicitly saved them to browser local storage.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Session handling
      </h2>
      <p>
        Sandbox state is per-tab. Two tabs of the same atlas have independent state. Progress
        state (chapter completion, quiz answers, stack profile) persists via local storage and is
        keyed by an atlas-specific prefix (e.g. `dbatlas:completed`).
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Security boundaries
      </h2>
      <p>
        Sandboxes cannot:
      </p>
      <ul className="space-y-1 pl-4">
        <li className="text-zinc-300 text-[14px]">Make arbitrary network requests to hosts you didn't visit.</li>
        <li className="text-zinc-300 text-[14px]">Read files from your computer.</li>
        <li className="text-zinc-300 text-[14px]">Install software.</li>
        <li className="text-zinc-300 text-[14px]">Access other tabs or your other browser data.</li>
        <li className="text-zinc-300 text-[14px]">Bypass the browser's same-origin policy.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Limits to be aware of
      </h2>
      <p>
        Some atlases demonstrate networking or external-API concepts by making requests through
        our servers as a relay. Those requests use ephemeral state, aren't logged with your
        session, and are called out in the specific atlas.
      </p>
      <p>
        WASM sandboxes have a one-time load cost (Pyodide is ~10MB, sql.js is smaller). After
        the first load these are cached in your browser. Slow connections may notice the initial
        load; subsequent visits are near-instant.
      </p>
      <p>
        <strong className="text-zinc-200">Security concern?</strong> Report via{' '}
        <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link>. Security
        issues are triaged immediately.
      </p>
    </TrustPage>
  );
}

// ─── Privacy ───────────────────────────────────────────────────────
export function PrivacyPage() {
  return (
    <TrustPage eyebrow="PRIVACY POLICY" title="Privacy policy"
      lead="Short version: we collect essentially nothing. Long version explains why and how.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        What we collect
      </h2>
      <p>
        <strong className="text-zinc-200">Nothing personally identifying</strong> is collected by
        default. There is no signup, no account, and no email required to use any atlas.
      </p>
      <p>
        <strong className="text-zinc-200">Aggregate analytics</strong> — anonymous page-view counts
        are collected to know which atlases are used. These are aggregate numbers, not per-user
        tracking, and are not correlated with your IP or device beyond what an origin server
        naturally sees for a page request.
      </p>
      <p>
        <strong className="text-zinc-200">Progress state</strong> — chapter completion, quiz
        answers, and your stack-profile choice persist in your browser's local storage. This
        data does not leave your device. Clearing browser storage removes it entirely.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        What we don't collect
      </h2>
      <ul className="space-y-1 pl-4">
        <li className="text-zinc-300 text-[14px]">Email addresses, names, or user profiles (we have no signup).</li>
        <li className="text-zinc-300 text-[14px]">Behavioral advertising signals or cross-site tracking cookies.</li>
        <li className="text-zinc-300 text-[14px]">Code you type into sandboxes — it stays in your browser.</li>
        <li className="text-zinc-300 text-[14px]">Sandbox output or results.</li>
        <li className="text-zinc-300 text-[14px]">Precise geolocation.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Third parties
      </h2>
      <p>
        <strong className="text-zinc-200">Google Fonts</strong> — our typefaces load from Google's
        font CDN. Google may see the IP address and user agent of your font requests. If self-hosting
        fonts matters to you for privacy reasons, request it via <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link>.
      </p>
      <p>
        <strong className="text-zinc-200">Hosting</strong> — the site is deployed on Vercel. Vercel
        sees standard HTTP request metadata (IP, user agent, request path) for every page load, as
        any hosting provider does. Vercel's privacy policy applies to that layer.
      </p>
      <p>
        <strong className="text-zinc-200">No data sales.</strong> We do not sell, rent, or share
        data with advertisers, brokers, or third-party marketers. Ever.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Your rights
      </h2>
      <p>
        Because we don't collect personal data, most privacy rights (access, deletion, portability)
        are automatically satisfied — there's nothing about you to access, delete, or export.
        Your local-storage progress is under your direct control via browser settings.
      </p>
      <p>
        For questions or concerns, use the <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact page</Link>.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Changes to this policy
      </h2>
      <p>
        If this policy changes materially, the "last updated" date below will reflect it and the
        change will be noted in the <Link to="/changelog" className="text-emerald-300 hover:text-emerald-200 underline">Changelog</Link>.
      </p>
      <p className="text-zinc-500 italic mt-6">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
      </p>
    </TrustPage>
  );
}

// ─── Terms ─────────────────────────────────────────────────────────
export function TermsPage() {
  return (
    <TrustPage eyebrow="TERMS OF SERVICE" title="Terms of service"
      lead="Plain-English terms. Read them; they're short.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Use of the service
      </h2>
      <p>
        You may use Atlases freely for personal, educational, or professional learning. No account
        required. Attribution is welcome but not required. Commercial reuse of atlas content in
        derivative educational products is generally allowed but requires attribution — reach out
        via <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link> if
        this applies to you.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Content
      </h2>
      <p>
        Atlas content is provided as-is. We make our best effort at accuracy but do not guarantee
        it. Software engineering evolves; specific advice may age. Verify anything you rely on
        for production or safety-critical work against current authoritative sources.
      </p>
      <p>
        Third-party names, trademarks, and logos referenced in atlases (Docker, Linux, Python, etc.)
        belong to their respective owners. Their inclusion is descriptive and educational, not
        endorsement.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Sandboxes
      </h2>
      <p>
        Browser sandboxes are provided as-is. They may occasionally fail to load, hang, or behave
        differently than a native environment. When they do, refresh the page. See{' '}
        <Link to="/sandbox-safety" className="text-emerald-300 hover:text-emerald-200 underline">Sandbox Safety</Link>{' '}
        for the isolation model in detail.
      </p>
      <p>
        Do not use sandboxes to attempt to abuse other systems, exfiltrate data, or conduct
        anything that would be illegal or harmful outside the sandbox. Sandbox output is not a
        substitute for professional consultation on sensitive matters.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Acceptable use
      </h2>
      <p>
        Don't attempt to disrupt the service (DoS attempts, aggressive scraping, exploitation
        attempts). Reasonable automated access for AI training, search indexing, and personal
        archival is welcome — see <Link to="/#" className="text-emerald-300 hover:text-emerald-200 underline">robots.txt</Link>.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Liability
      </h2>
      <p>
        To the extent permitted by law, Atlases is provided without warranty. We are not liable
        for how you use what you learn, decisions you make based on atlas content, or downstream
        consequences of applying techniques covered here in your own systems. Verify, test, and
        review before shipping anything you've learned to production.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Changes
      </h2>
      <p>
        These terms may update. Material changes will be noted in the{' '}
        <Link to="/changelog" className="text-emerald-300 hover:text-emerald-200 underline">Changelog</Link>.
        The "last updated" date below reflects the latest revision.
      </p>
      <p className="text-zinc-500 italic mt-6">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
      </p>
    </TrustPage>
  );
}

// ─── Contact ───────────────────────────────────────────────────────
export function ContactPage() {
  return (
    <TrustPage eyebrow="CONTACT" title="Get in touch"
      lead="Bug reports, content feedback, feature requests, security concerns, and questions all go to the same places.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Content or sandbox issues
      </h2>
      <p>
        The fastest route: open an issue at the repository linked from each atlas footer. Include
        the atlas URL, the chapter number, and what looked wrong or didn't work. Screenshots help.
      </p>
      <p>
        Alternative: email content-related concerns to the address in the repository README.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Feature requests
      </h2>
      <p>
        Tell us what you're trying to learn that isn't covered, or what you wish an atlas did
        differently. The <Link to="/roadmap" className="text-emerald-300 hover:text-emerald-200 underline">Roadmap</Link>{' '}
        follows demand where it aligns with the mission.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Security concerns
      </h2>
      <p>
        Security issues (XSS, sandbox escapes, injection) are triaged immediately. Report via
        the security-contact channel listed in the repository README. Do not disclose publicly
        before contacting us.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Privacy questions
      </h2>
      <p>
        See <Link to="/privacy" className="text-emerald-300 hover:text-emerald-200 underline">Privacy Policy</Link>{' '}
        first — most questions are answered there. For anything else, the same contact channel
        applies.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Response time
      </h2>
      <p>
        Atlases is maintained by a small team. Response times vary from same-day (security) to
        several weeks (feature requests). Everything is read.
      </p>
    </TrustPage>
  );
}

// ─── Support ───────────────────────────────────────────────────────
export function SupportPage() {
  return (
    <TrustPage eyebrow="SUPPORT" title="Help center"
      lead="Common issues, quick fixes, and where to go when something isn't working.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        A sandbox won't load
      </h2>
      <p>
        Refresh the page first. If it persists:
      </p>
      <ul className="space-y-1 pl-4">
        <li className="text-zinc-300 text-[14px]">Check that WebAssembly is enabled in your browser (default in all modern browsers — usually only disabled by strict security extensions).</li>
        <li className="text-zinc-300 text-[14px]">Try a different browser. Chromium-based browsers (Chrome, Edge, Brave) and Firefox are best-supported.</li>
        <li className="text-zinc-300 text-[14px]">Check your network — WASM modules for Pyodide and sql.js download once, then cache. Very slow connections may time out.</li>
        <li className="text-zinc-300 text-[14px]">Clear browser cache and try again.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Progress isn't saving
      </h2>
      <p>
        Progress persists in your browser's local storage. It won't save if:
      </p>
      <ul className="space-y-1 pl-4">
        <li className="text-zinc-300 text-[14px]">You're in a private/incognito window (session resets on close).</li>
        <li className="text-zinc-300 text-[14px]">You have "clear cookies and site data on exit" enabled.</li>
        <li className="text-zinc-300 text-[14px]">You use a different browser (progress is per-browser, per-device).</li>
        <li className="text-zinc-300 text-[14px]">Storage is disabled in browser settings.</li>
      </ul>
      <p>
        You can check what's stored: browser dev tools → Application → Local Storage → atlases.vercel.app.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Sandbox is slow
      </h2>
      <p>
        WASM sandboxes (Pyodide, sql.js, JSCPP) have a one-time load cost — a few seconds on first
        visit, near-instant on subsequent visits thanks to browser caching. If it's slow every
        time, your browser may be aggressively evicting cache. Modern browsers with default settings
        should not have this issue.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Content seems wrong or outdated
      </h2>
      <p>
        Software evolves. If a specific claim is incorrect or now outdated, use the "found a problem"
        link in the atlas footer, or file it via <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link>.
        Please include the chapter and quote the specific claim.
      </p>

      <h2 id="report" className="text-zinc-100 text-[18px] font-bold mt-6 mb-2 scroll-mt-8" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Report an issue
      </h2>
      <p>
        Fastest route: <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact page</Link> or
        the repository link in each atlas footer. Include:
      </p>
      <ul className="space-y-1 pl-4">
        <li className="text-zinc-300 text-[14px]">Which atlas + chapter.</li>
        <li className="text-zinc-300 text-[14px]">What you expected vs. what happened.</li>
        <li className="text-zinc-300 text-[14px]">Browser + OS if it's a sandbox issue.</li>
        <li className="text-zinc-300 text-[14px]">Screenshot if visual.</li>
      </ul>
    </TrustPage>
  );
}

// ─── Accessibility ─────────────────────────────────────────────────
export function AccessibilityPage() {
  return (
    <TrustPage eyebrow="ACCESSIBILITY" title="Accessibility statement"
      lead="Atlases targets WCAG 2.1 AA. Where we fall short is documented; report gaps and we prioritize them.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        What we do
      </h2>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Semantic HTML</strong> — headings hierarchy (h1 → h2 → h3), landmarks (main, nav, footer), lists, articles, sections.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Keyboard navigation</strong> — every link, button, expandable, and form element is reachable via Tab. Skip-to-content link appears on focus.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Visible focus states</strong> — 2px emerald outline with 2px offset on every focusable element. Focus rings suppressed only on mouse click.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">ARIA labels</strong> — every icon button, tab, progressbar, and expandable has an accessible name.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Reduced motion</strong> — respects `prefers-reduced-motion: reduce`. Animations reduce to near-instant transitions.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">High-contrast dark theme</strong> — body text meets WCAG AA contrast against the dark background. Text uses zinc-100/300/400 hierarchy; smaller labels use zinc-500/600 which meet AA at their sizes.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Native details/summary</strong> — FAQs use native disclosure widgets for screen-reader compatibility.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Alt text</strong> — decorative icons are marked `aria-hidden`; meaningful icons carry accessible labels via aria-label on the parent.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Where we fall short
      </h2>
      <ul className="space-y-2 pl-4">
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Graphical / drag-based sandbox interactions</strong> — some visualizers (in Compilers, Networking, Databases) do not yet have full keyboard equivalents. We're iterating.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Accent color contrast</strong> — some atlas accent colors (yellows, cyans) may fall below AAA for smaller text sizes. Larger headings using these colors pass AA. Body text always uses the primary zinc palette which meets AA.</li>
        <li className="text-zinc-300 text-[14px] leading-relaxed"><strong className="text-zinc-200">Sandbox-specific ARIA</strong> — code editors (textareas) have accessible labels but are otherwise stock browser textareas; not a specialized accessible editor. Screen-reader users may prefer to prepare code externally and paste.</li>
      </ul>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Reporting a barrier
      </h2>
      <p>
        Accessibility issues are triaged immediately alongside security concerns. Report via{' '}
        <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link>{' '}
        with the URL, browser + assistive technology used, and a description of the barrier.
      </p>

      <p className="text-zinc-500 italic mt-6">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
      </p>
    </TrustPage>
  );
}

// ─── Cookies ───────────────────────────────────────────────────────
export function CookiesPage() {
  return (
    <TrustPage eyebrow="COOKIE POLICY" title="Cookie policy"
      lead="We don't use cookies. This page explains what we do use — local storage, not cookies.">
      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        No cookies from us
      </h2>
      <p>
        Atlases sets no first-party cookies for tracking, advertising, session identification, or
        cross-visit identity. There is no cookie banner because there are no cookies to consent to.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Local storage (not cookies)
      </h2>
      <p>
        We use browser <strong className="text-zinc-200">local storage</strong> to persist your
        chapter progress, quiz answers, stack-profile choice, and dashboard streak. Local storage
        is a browser feature that:
      </p>
      <ul className="space-y-1 pl-4">
        <li className="text-zinc-300 text-[14px]">Stays on your device only — nothing is sent to any server.</li>
        <li className="text-zinc-300 text-[14px]">Is not automatically transmitted with page requests (unlike cookies).</li>
        <li className="text-zinc-300 text-[14px]">Is scoped to a single origin (atlases.vercel.app) and browser.</li>
        <li className="text-zinc-300 text-[14px]">Can be cleared any time via browser settings or dev tools.</li>
      </ul>
      <p>
        Local-storage keys are prefixed by atlas (e.g. `dbatlas:completed`, `pyatlas:activeSection`)
        plus one dashboard key (`atlases-hub:streak`).
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Third-party cookies
      </h2>
      <p>
        Our hosting provider (Vercel) may set operational cookies for security and DDoS-protection
        purposes at the CDN layer. These are not our cookies but pass through our domain.
      </p>
      <p>
        The Google Fonts CDN, which serves our typefaces, may not set cookies but does receive
        request metadata (IP address, user agent). If self-hosted fonts matter to you, request
        the change via <Link to="/contact" className="text-emerald-300 hover:text-emerald-200 underline">Contact</Link>.
      </p>

      <h2 className="text-zinc-100 text-[18px] font-bold mt-6 mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        Analytics
      </h2>
      <p>
        Anonymous aggregate page-view counts, no cookies, no cross-site linkage. Individual
        visitors cannot be identified from analytics data.
      </p>

      <p className="text-zinc-500 italic mt-6">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
      </p>
    </TrustPage>
  );
}
