import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';

// Lazy-load atlases — each ships as its own chunk so the landing page is fast
const CoolifyAtlas    = lazy(() => import('./atlases/coolify-atlas.jsx'));
const N8nAtlas        = lazy(() => import('./atlases/n8n-atlas.jsx'));
const DockerAtlas     = lazy(() => import('./atlases/docker-atlas.jsx'));
const JavaScriptAtlas = lazy(() => import('./atlases/javascript-atlas.jsx'));
const PythonAtlas     = lazy(() => import('./atlases/python-atlas.jsx'));
const CAtlas          = lazy(() => import('./atlases/c-atlas.jsx'));
const CppAtlas        = lazy(() => import('./atlases/cpp-atlas.jsx'));
const DbAtlas         = lazy(() => import('./atlases/db-atlas.jsx'));
const NetAtlas        = lazy(() => import('./atlases/net-atlas.jsx'));
const LinuxAtlas      = lazy(() => import('./atlases/linux-atlas.jsx'));
const CryptoAtlas     = lazy(() => import('./atlases/crypto-atlas.jsx'));
const CompilersAtlas  = lazy(() => import('./atlases/compilers-atlas.jsx'));
const ObservabilityAtlas = lazy(() => import('./atlases/observability-atlas.jsx'));
const AIAtlas = lazy(() => import('./atlases/ai-atlas.jsx'));
const FiveMAtlas = lazy(() => import('./atlases/fivem-atlas.jsx'));
const EncodingAtlas = lazy(() => import('./atlases/encoding-atlas.jsx'));

const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-black text-zinc-500">
    <div className="text-sm tracking-[0.3em] uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      loading atlas…
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/coolify"    element={<CoolifyAtlas />} />
        <Route path="/n8n"        element={<N8nAtlas />} />
        <Route path="/docker"     element={<DockerAtlas />} />
        <Route path="/javascript" element={<JavaScriptAtlas />} />
        <Route path="/python"     element={<PythonAtlas />} />
        <Route path="/c"          element={<CAtlas />} />
        <Route path="/cpp"        element={<CppAtlas />} />
        <Route path="/db"         element={<DbAtlas />} />
        <Route path="/net"        element={<NetAtlas />} />
        <Route path="/linux"      element={<LinuxAtlas />} />
        <Route path="/crypto"     element={<CryptoAtlas />} />
        <Route path="/compilers"  element={<CompilersAtlas />} />
        <Route path="/observability" element={<ObservabilityAtlas />} />
        <Route path="/ai" element={<AIAtlas />} />
        <Route path="/fivem" element={<FiveMAtlas />} />
        <Route path="/encoding" element={<EncodingAtlas />} />
        <Route path="*"           element={<Landing />} />
      </Routes>
    </Suspense>
  );
}
