import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';  // eager — the entry page

// Lazy-load everything else so the initial bundle only carries the homepage.
// Each of these routes ships as its own chunk (~5–20 KB gzipped each).
const Dashboard    = lazy(() => import('./pages/Dashboard.jsx'));
const FAQ          = lazy(() => import('./pages/FAQ.jsx'));
const AtlasLanding = lazy(() => import('./pages/AtlasLanding.jsx'));
const AnswerPage   = lazy(() => import('./pages/AnswerPage.jsx'));
const AnswersIndex = lazy(() => import('./pages/AnswersIndex.jsx'));
const NotFound     = lazy(() => import('./pages/NotFound.jsx'));

// Trust pages are all in one module — one lazy import loads the module,
// then each route pulls its named export. Only ~15 KB gz total.
const trustPages = () => import('./pages/trust-pages.jsx');
const AboutPage         = lazy(() => trustPages().then(m => ({ default: m.AboutPage })));
const MissionPage       = lazy(() => trustPages().then(m => ({ default: m.MissionPage })));
const RoadmapPage       = lazy(() => trustPages().then(m => ({ default: m.RoadmapPage })));
const ChangelogPage     = lazy(() => trustPages().then(m => ({ default: m.ChangelogPage })));
const SandboxSafetyPage = lazy(() => trustPages().then(m => ({ default: m.SandboxSafetyPage })));
const PrivacyPage       = lazy(() => trustPages().then(m => ({ default: m.PrivacyPage })));
const TermsPage         = lazy(() => trustPages().then(m => ({ default: m.TermsPage })));
const ContactPage       = lazy(() => trustPages().then(m => ({ default: m.ContactPage })));
const SupportPage       = lazy(() => trustPages().then(m => ({ default: m.SupportPage })));
const AccessibilityPage = lazy(() => trustPages().then(m => ({ default: m.AccessibilityPage })));
const CookiesPage       = lazy(() => trustPages().then(m => ({ default: m.CookiesPage })));

// Lazy-load atlases — each ships as its own chunk (unchanged from original)
const CoolifyAtlas       = lazy(() => import('./atlases/coolify-atlas.jsx'));
const N8nAtlas           = lazy(() => import('./atlases/n8n-atlas.jsx'));
const DockerAtlas        = lazy(() => import('./atlases/docker-atlas.jsx'));
const JavaScriptAtlas    = lazy(() => import('./atlases/javascript-atlas.jsx'));
const PythonAtlas        = lazy(() => import('./atlases/python-atlas.jsx'));
const CAtlas             = lazy(() => import('./atlases/c-atlas.jsx'));
const CppAtlas           = lazy(() => import('./atlases/cpp-atlas.jsx'));
const DbAtlas            = lazy(() => import('./atlases/db-atlas.jsx'));
const NetAtlas           = lazy(() => import('./atlases/net-atlas.jsx'));
const LinuxAtlas         = lazy(() => import('./atlases/linux-atlas.jsx'));
const CryptoAtlas        = lazy(() => import('./atlases/crypto-atlas.jsx'));
const CompilersAtlas     = lazy(() => import('./atlases/compilers-atlas.jsx'));
const ObservabilityAtlas = lazy(() => import('./atlases/observability-atlas.jsx'));
const AIAtlas            = lazy(() => import('./atlases/ai-atlas.jsx'));
const FiveMAtlas         = lazy(() => import('./atlases/fivem-atlas.jsx'));
const EncodingAtlas      = lazy(() => import('./atlases/encoding-atlas.jsx'));

/* Loading state — replaces the previous plain text with a skeleton
 * that at least suggests the atlas is coming, not that the page is dead. */
const Loading = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3">
    <div className="w-16 h-16 border border-zinc-800 flex items-center justify-center text-emerald-300 text-[36px] leading-none animate-pulse"
      style={{ fontFamily: 'serif' }} aria-hidden="true">
      ◇
    </div>
    <div className="text-zinc-500 text-[11px] tracking-[0.35em] uppercase"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      loading…
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/"           element={<Landing />} />
        <Route path="/dashboard"  element={<Dashboard />} />

        <Route path="/faq"             element={<FAQ />} />
        <Route path="/about"           element={<AboutPage />} />
        <Route path="/mission"         element={<MissionPage />} />
        <Route path="/roadmap"         element={<RoadmapPage />} />
        <Route path="/changelog"       element={<ChangelogPage />} />
        <Route path="/sandbox-safety"  element={<SandboxSafetyPage />} />
        <Route path="/privacy"         element={<PrivacyPage />} />
        <Route path="/terms"           element={<TermsPage />} />
        <Route path="/contact"         element={<ContactPage />} />
        <Route path="/support"         element={<SupportPage />} />
        <Route path="/accessibility"   element={<AccessibilityPage />} />
        <Route path="/cookies"         element={<CookiesPage />} />

        <Route path="/atlas/:slug"    element={<AtlasLanding />} />
        <Route path="/answers"        element={<AnswersIndex />} />
        <Route path="/answers/:slug"  element={<AnswerPage />} />

        <Route path="/coolify"      element={<CoolifyAtlas />} />
        <Route path="/n8n"          element={<N8nAtlas />} />
        <Route path="/docker"       element={<DockerAtlas />} />
        <Route path="/javascript"   element={<JavaScriptAtlas />} />
        <Route path="/python"       element={<PythonAtlas />} />
        <Route path="/c"            element={<CAtlas />} />
        <Route path="/cpp"          element={<CppAtlas />} />
        <Route path="/db"           element={<DbAtlas />} />
        <Route path="/net"          element={<NetAtlas />} />
        <Route path="/linux"        element={<LinuxAtlas />} />
        <Route path="/crypto"       element={<CryptoAtlas />} />
        <Route path="/compilers"    element={<CompilersAtlas />} />
        <Route path="/observability" element={<ObservabilityAtlas />} />
        <Route path="/ai"           element={<AIAtlas />} />
        <Route path="/fivem"        element={<FiveMAtlas />} />
        <Route path="/encoding"     element={<EncodingAtlas />} />

        {/* Real 404 — replaces silent fallback to Landing (bad crawl signal) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
