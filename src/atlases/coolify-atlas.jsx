import { useState, useEffect } from 'react';
import {
  Terminal, Server, Database, Cloud, Lock, GitBranch, Settings, Activity,
  BookOpen, Check, ChevronRight, ChevronLeft, Copy, CheckCircle2, Circle,
  X, Zap, Layers, Globe, AlertTriangle, ArrowRight, Cpu, HardDrive,
  Network, ShieldCheck, RefreshCw, Box, Sparkles, FileCode, KeyRound,
  Map, Compass
} from 'lucide-react';

export default function CoolifyAtlas() {
  const [activeSection, setActiveSection] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [copied, setCopied] = useState(null);
  const [checklist, setChecklist] = useState({});
  const [quizState, setQuizState] = useState({});
  const [serverSize, setServerSize] = useState({ apps: 3, databases: 2, services: 1 });
  const [deployPath, setDeployPath] = useState(null);

  // Inject distinctive fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  const copy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const toggleCheck = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const markComplete = (i) => setCompleted(prev => new Set([...prev, i]));
  const answerQuiz = (qid, choice, correct) => {
    setQuizState(prev => ({ ...prev, [qid]: { choice, correct: choice === correct } }));
  };

  const sections = [
    { id: 'origin', label: 'Origin', icon: Compass, num: '01' },
    { id: 'blueprint', label: 'Blueprint', icon: Map, num: '02' },
    { id: 'ignition', label: 'Ignition', icon: Zap, num: '03' },
    { id: 'cockpit', label: 'Cockpit', icon: Layers, num: '04' },
    { id: 'deploy', label: 'Deploy', icon: GitBranch, num: '05' },
    { id: 'stack', label: 'Stack', icon: Database, num: '06' },
    { id: 'perimeter', label: 'Perimeter', icon: Globe, num: '07' },
    { id: 'guard', label: 'Guard', icon: ShieldCheck, num: '08' },
    { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '09' },
  ];

  const progress = Math.round((completed.size / sections.length) * 100);

  // ----- Reusable UI bits -----
  const Code = ({ children, id, lang = 'bash' }) => (
    <div className="my-3 group relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button
          onClick={() => copy(children, id)}
          className="flex items-center gap-1.5 hover:text-lime-300 transition-colors"
        >
          {copied === id ? <Check size={12} /> : <Copy size={12} />}
          {copied === id ? 'copied' : 'copy'}
        </button>
      </div>
      <pre
        className="bg-zinc-950 border border-zinc-800 border-t-0 text-zinc-100 px-3 py-3 text-[13px] overflow-x-auto leading-relaxed"
        style={{ fontFamily: 'JetBrains Mono, monospace' }}
      >
        <code>{children}</code>
      </pre>
    </div>
  );

  const Callout = ({ kind = 'info', children, title }) => {
    const palette = {
      info: { border: 'border-lime-400/40', bg: 'bg-lime-400/5', text: 'text-lime-300', label: 'NOTE' },
      warn: { border: 'border-orange-400/40', bg: 'bg-orange-400/5', text: 'text-orange-300', label: 'HEADS UP' },
      tip: { border: 'border-fuchsia-400/40', bg: 'bg-fuchsia-400/5', text: 'text-fuchsia-300', label: 'TIP' },
    }[kind];
    return (
      <div className={`my-4 border ${palette.border} ${palette.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${palette.text} mb-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {title || palette.label}
        </div>
        <div className="text-zinc-300 text-[14px] leading-relaxed">{children}</div>
      </div>
    );
  };

  const Check_ = ({ id, children }) => (
    <button
      onClick={() => toggleCheck(id)}
      className="flex items-start gap-3 w-full text-left py-2 hover:bg-zinc-900/50 px-2 -mx-2 transition-colors"
    >
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
        checklist[id] ? 'bg-lime-400 border-lime-400' : 'border-zinc-600'
      }`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
        {children}
      </span>
    </button>
  );

  const Quiz = ({ qid, question, options, correct, explain }) => {
    const state = quizState[qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          KNOWLEDGE CHECK
        </div>
        <div className="text-zinc-100 text-[15px] mb-3">{question}</div>
        <div className="space-y-1.5">
          {options.map((opt, i) => {
            const isChosen = state?.choice === i;
            const isCorrect = i === correct;
            const reveal = !!state;
            return (
              <button
                key={i}
                onClick={() => !state && answerQuiz(qid, i, correct)}
                disabled={!!state}
                className={`w-full text-left px-3 py-2 border text-[13px] transition-colors flex items-center gap-2 ${
                  reveal && isCorrect ? 'border-lime-400 bg-lime-400/10 text-lime-200' :
                  reveal && isChosen && !isCorrect ? 'border-orange-400 bg-orange-400/10 text-orange-200' :
                  'border-zinc-800 hover:border-zinc-600 text-zinc-300'
                }`}
              >
                <span className="text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {reveal && isCorrect && <Check size={14} className="ml-auto" />}
                {reveal && isChosen && !isCorrect && <X size={14} className="ml-auto" />}
              </button>
            );
          })}
        </div>
        {state && (
          <div className="mt-3 text-[13px] text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">
            {explain}
          </div>
        )}
      </div>
    );
  };

  const H2 = ({ children, num }) => (
    <h2 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-lime-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        {num}
      </span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
        {children}
      </span>
    </h2>
  );

  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;

  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-lime-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {children}
    </code>
  );

  // ----- Section content -----
  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return (
          <>
            <H2 num="◇ DEF">The trade you're making</H2>
            <P>
              Coolify is a self-hosted PaaS — Vercel's developer experience, but the box is yours. You get
              <span className="text-lime-300"> git push → live URL</span>, automatic SSL, one-click databases,
              and 280+ pre-baked services. In exchange you own a VPS, you patch it, and you pay for bytes you actually use.
            </P>

            <div className="my-5 border border-zinc-800 bg-zinc-900/30">
              <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 px-3 py-2 border-b border-zinc-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Architecture
              </div>
              <div className="p-4 space-y-3 text-[13px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <div className="flex items-center gap-3">
                  <div className="w-32 px-2 py-1.5 border border-lime-400/50 bg-lime-400/5 text-lime-300 text-center">git push</div>
                  <ArrowRight size={14} className="text-zinc-600" />
                  <div className="flex-1 px-2 py-1.5 border border-zinc-700 text-zinc-300">Coolify control plane (VPS #1)</div>
                </div>
                <div className="pl-4 border-l border-dashed border-zinc-700 ml-16 space-y-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-zinc-600">└─</span>
                    <Box size={12} /> Traefik (routing + SSL)
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-zinc-600">└─</span>
                    <Box size={12} /> Docker engine
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-zinc-600">└─</span>
                    <Box size={12} /> Your apps + databases (containers)
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
                  <div className="w-32 px-2 py-1.5 border border-fuchsia-400/50 bg-fuchsia-400/5 text-fuchsia-300 text-center">user request</div>
                  <ArrowRight size={14} className="text-zinc-600" />
                  <div className="flex-1 px-2 py-1.5 border border-zinc-700 text-zinc-300">app.your-domain.com (Traefik routes to container)</div>
                </div>
              </div>
            </div>

            <H2 num="◇ WHEN">When Coolify shines</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><Check size={16} className="text-lime-400 shrink-0 mt-0.5" /> Multiple side projects you don't want to pay $20/mo each to host</li>
              <li className="flex gap-2"><Check size={16} className="text-lime-400 shrink-0 mt-0.5" /> Running n8n, Supabase, Postgres, Redis without piecing it together yourself</li>
              <li className="flex gap-2"><Check size={16} className="text-lime-400 shrink-0 mt-0.5" /> Internal tools that don't need global edge distribution</li>
              <li className="flex gap-2"><Check size={16} className="text-lime-400 shrink-0 mt-0.5" /> Tight budget, big stack — one $20 VPS hosts everything</li>
            </ul>

            <H2 num="◇ WHEN-NOT">When to look elsewhere</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> You need true multi-region failover → managed K8s or Vercel</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> You don't want to ever SSH or patch a server</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> Sub-50ms latency to users on 5 continents matters</li>
            </ul>

            <Quiz
              qid="q1"
              question="Your client needs an app available with <100ms latency in both Asia and Europe. Coolify fit?"
              options={['Yes, just deploy to multiple servers', 'No — pick a global edge platform', 'Yes, Coolify auto-distributes globally']}
              correct={1}
              explain="Coolify doesn't do edge distribution or multi-region failover. It's a single-region PaaS. For a globally-distributed app, you'd want Vercel/Cloudflare/managed K8s. Coolify can run apps in multiple regions if you add servers there, but routing users to the nearest one isn't built in."
            />
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ SPECS">Pick the right metal</H2>
            <P>Coolify itself eats about 1GB of RAM idle. Everything else is your apps. Plan accordingly.</P>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="border border-zinc-800 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Minimum</div>
                <div className="text-zinc-200 text-[13px] space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <div className="flex items-center gap-2"><Cpu size={12} /> 2 vCPU</div>
                  <div className="flex items-center gap-2"><Activity size={12} /> 2 GB RAM</div>
                  <div className="flex items-center gap-2"><HardDrive size={12} /> 30 GB SSD</div>
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">Kicks the tires. Tight.</div>
              </div>
              <div className="border border-lime-400/40 bg-lime-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-lime-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Sweet spot</div>
                <div className="text-zinc-200 text-[13px] space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <div className="flex items-center gap-2"><Cpu size={12} /> 4 vCPU</div>
                  <div className="flex items-center gap-2"><Activity size={12} /> 8 GB RAM</div>
                  <div className="flex items-center gap-2"><HardDrive size={12} /> 100 GB NVMe</div>
                </div>
                <div className="text-[11px] text-zinc-400 mt-2">Real workloads, breathing room.</div>
              </div>
            </div>

            {/* Interactive sizer */}
            <div className="my-5 border border-fuchsia-400/30 bg-fuchsia-400/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Server sizer · drag the sliders
              </div>
              {[
                { key: 'apps', label: 'Next.js / Node apps', max: 10, ramPer: 0.5 },
                { key: 'databases', label: 'Databases (Postgres/Redis)', max: 5, ramPer: 0.4 },
                { key: 'services', label: 'Heavy services (n8n, Supabase)', max: 5, ramPer: 1.2 },
              ].map(row => (
                <div key={row.key} className="mb-3">
                  <div className="flex justify-between text-[12px] text-zinc-300 mb-1">
                    <span>{row.label}</span>
                    <span className="text-fuchsia-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {serverSize[row.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={row.max}
                    value={serverSize[row.key]}
                    onChange={(e) => setServerSize(prev => ({ ...prev, [row.key]: parseInt(e.target.value) }))}
                    className="w-full accent-fuchsia-400"
                  />
                </div>
              ))}
              {(() => {
                const ram = 1 + serverSize.apps * 0.5 + serverSize.databases * 0.4 + serverSize.services * 1.2;
                const rec = ram < 4 ? '4 GB' : ram < 8 ? '8 GB' : ram < 16 ? '16 GB' : '32 GB';
                return (
                  <div className="mt-2 pt-3 border-t border-fuchsia-400/20 text-[13px] text-zinc-200">
                    Estimated RAM need: <span className="text-fuchsia-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>~{ram.toFixed(1)} GB</span>
                    <span className="text-zinc-500"> · pick at least </span>
                    <span className="text-lime-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rec}</span>
                  </div>
                );
              })()}
            </div>

            <H2 num="◇ HOSTS">Where to rent</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Hetzner', note: 'Best price/perf. ~€4/mo for 4GB. Official Coolify integration.', tag: 'top pick' },
                { name: 'DigitalOcean', note: '1-click Coolify droplet. ~$24/mo for 4GB.', tag: 'easy mode' },
                { name: 'Vultr / Linode', note: 'Solid. Pick the closest region to you.', tag: 'fine' },
                { name: 'Contabo', note: 'Cheap & beefy specs, slower I/O, occasional flakiness.', tag: 'budget' },
              ].map(h => (
                <div key={h.name} className="flex items-start gap-3 border border-zinc-800 px-3 py-2">
                  <Server size={14} className="text-zinc-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-100 font-medium">{h.name}</span>
                      <span className="text-[9px] uppercase tracking-wider text-lime-300/70 border border-lime-300/30 px-1.5 py-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.tag}</span>
                    </div>
                    <div className="text-zinc-400 text-[12px] mt-0.5">{h.note}</div>
                  </div>
                </div>
              ))}
            </div>

            <Callout kind="tip" title="ONE BOX OR TWO?">
              Best practice: <span className="text-zinc-100">Coolify on its own VPS</span>, deploy your apps to a separate server it manages.
              That way a runaway build on app-server-1 doesn't kill the control plane. For a side-project budget, one box is fine —
              just don't run heavy CI builds.
            </Callout>

            <H2 num="◇ CHECKLIST">Before you install</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <Check_ id="prep1">Ubuntu 24.04 LTS (or Debian 12) on a fresh VPS</Check_>
              <Check_ id="prep2">Root SSH access works (test it now)</Check_>
              <Check_ id="prep3">A domain you control (optional now, useful soon)</Check_>
              <Check_ id="prep4">UFW or provider firewall ready — you'll open 22, 80, 443, 8000</Check_>
              <Check_ id="prep5">Server is in a region close to your users</Check_>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ ONE-LINER">The whole install</H2>
            <P>SSH in as root, paste this, walk away for 5 minutes.</P>

            <Code id="install-cmd">curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash</Code>

            <Callout kind="warn" title="RUN AS ROOT">
              The installer refuses to run as a regular user. <Kbd>sudo -i</Kbd> first, or SSH in as root.
              The script installs Docker, pulls the Coolify containers, and starts everything.
            </Callout>

            <H2 num="◇ EXPECTED">What you'll see</H2>
            <Code id="install-output" lang="terminal output">{`==========================================
 Coolify Installation
==========================================
 Welcome to Coolify Installer!
 This script will install everything for you.
 Sit back and relax.

 OK: Docker Engine is installed.
 OK: Docker Compose is installed.
 OK: Coolify directories created.
 OK: Pulling Coolify containers...
 OK: Coolify is running.

 Visit http://<YOUR-SERVER-IP>:8000 to finish setup.`}</Code>

            <H2 num="◇ FIRST LOGIN">Sealing the door</H2>
            <P>
              Open <Kbd>http://YOUR_IP:8000</Kbd>. The first form creates the root admin. <span className="text-orange-300">Use a real password.</span>
              {' '}This UI is exposed to the public internet on port 8000 until you put a domain + SSL in front of it.
            </P>

            <div className="border border-zinc-800 p-3 my-3">
              <Check_ id="post1">Created admin user with a strong password</Check_>
              <Check_ id="post2">Enabled 2FA in Settings → Profile</Check_>
              <Check_ id="post3">Pointed a domain (e.g. <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-lime-300">coolify.yourdomain.com</span>) at the server IP</Check_>
              <Check_ id="post4">Set the Coolify instance URL in Settings → Configuration (Traefik will issue SSL)</Check_>
              <Check_ id="post5">Closed port 8000 once HTTPS works — only 80 + 443 stay open</Check_>
            </div>

            <H2 num="◇ FIREWALL">UFW the right way</H2>
            <Code id="ufw">{`ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP (Traefik)
ufw allow 443/tcp    # HTTPS (Traefik)
ufw allow 8000/tcp   # Coolify UI — close after domain setup
ufw enable`}</Code>

            <Quiz
              qid="q2"
              question="After you set up coolify.yourdomain.com with SSL, what should you do about port 8000?"
              options={['Leave it open as a backup', 'Close it — the domain serves the UI now', 'Open it to 0.0.0.0 with no firewall']}
              correct={1}
              explain="Once Traefik handles your UI through HTTPS on 443, port 8000 is just an extra attack surface. Close it. You can always reopen it temporarily if Traefik breaks."
            />
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ MAP">The five top-level concepts</H2>
            <P>Coolify's UI looks busy at first. It's really five things stacked.</P>

            <div className="space-y-2 my-4">
              {[
                { icon: Server, name: 'Servers', desc: 'Boxes Coolify deploys to. Even your control-plane VPS shows up here as "localhost".', color: 'lime' },
                { icon: Layers, name: 'Projects', desc: 'Logical groupings. Inside each: Environments (production/staging) → Resources (apps, dbs, services).', color: 'fuchsia' },
                { icon: GitBranch, name: 'Sources', desc: 'Your git providers — GitHub, GitLab, Bitbucket, Gitea. Connect once, deploy any repo.', color: 'lime' },
                { icon: Cloud, name: 'Destinations', desc: 'Docker networks on a Server. You usually only need the default — advanced users isolate stacks.', color: 'fuchsia' },
                { icon: Box, name: 'Services', desc: 'The 280+ one-click templates. n8n, Supabase, Plausible, Ghost, etc.', color: 'lime' },
              ].map(item => (
                <div key={item.name} className="flex gap-3 border border-zinc-800 p-3">
                  <div className={`shrink-0 w-8 h-8 border flex items-center justify-center ${item.color === 'lime' ? 'border-lime-400/40 text-lime-300' : 'border-fuchsia-400/40 text-fuchsia-300'}`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <div className="text-zinc-100 font-medium text-[14px]">{item.name}</div>
                    <div className="text-zinc-400 text-[13px] leading-snug mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <H2 num="◇ HIERARCHY">How things nest</H2>
            <div className="border border-zinc-800 bg-zinc-950/50 p-4 text-[13px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="text-fuchsia-300">Team</div>
              <div className="pl-4 text-lime-300">└─ Project: "FlowFirst"</div>
              <div className="pl-8 text-zinc-300">└─ Environment: production</div>
              <div className="pl-12 text-zinc-400">├─ Application: marketing-site (Next.js)</div>
              <div className="pl-12 text-zinc-400">├─ Database: postgres-leads</div>
              <div className="pl-12 text-zinc-400">└─ Service: n8n-automation</div>
              <div className="pl-8 text-zinc-300">└─ Environment: staging</div>
              <div className="pl-12 text-zinc-400">└─ Application: marketing-site-staging</div>
            </div>

            <Callout kind="info" title="WHERE TO FIND IT">
              Most daily work happens in <Kbd>Projects → [your project] → [environment]</Kbd>. Everything else
              is one-time setup.
            </Callout>

            <H2 num="◇ SETTINGS">Worth visiting once</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300 my-3">
              <li className="flex gap-2"><Settings size={14} className="text-zinc-500 mt-1 shrink-0" /><span><span className="text-zinc-100">Settings → Configuration</span> — your Coolify instance domain</span></li>
              <li className="flex gap-2"><KeyRound size={14} className="text-zinc-500 mt-1 shrink-0" /><span><span className="text-zinc-100">Keys & Tokens</span> — SSH keys for managed servers, GitHub deploy tokens</span></li>
              <li className="flex gap-2"><RefreshCw size={14} className="text-zinc-500 mt-1 shrink-0" /><span><span className="text-zinc-100">Auto-Update</span> — set to weekly so you don't fall behind on patches</span></li>
              <li className="flex gap-2"><Activity size={14} className="text-zinc-500 mt-1 shrink-0" /><span><span className="text-zinc-100">Notifications</span> — Discord/Telegram/email for deploy + health events</span></li>
            </ul>
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ FIRST DEPLOY">From repo to live URL</H2>
            <P>The path you'll walk a hundred times. Learn it once.</P>

            <div className="my-4 border border-zinc-800">
              {[
                { step: '01', title: 'Connect a Source', detail: 'Sources → + GitHub App. OAuth flow gives Coolify access to your repos. You can scope to specific repos only.' },
                { step: '02', title: 'New Project', detail: 'Projects → + New. Give it a name. Add a Production environment.' },
                { step: '03', title: 'Add a Resource', detail: '+ New Resource → Application → "Public Repository" or "From GitHub App". Pick the repo + branch.' },
                { step: '04', title: 'Pick a build pack', detail: 'Coolify auto-detects: Nixpacks (zero-config), Static, Dockerfile, or Docker Compose. For most Node/Python apps, Nixpacks just works.' },
                { step: '05', title: 'Set environment variables', detail: 'Environment Variables tab. Mark secrets as build-time vs runtime. Use a generated value or paste your own.' },
                { step: '06', title: 'Deploy', detail: 'Click Deploy. Watch the build log stream live. First build takes 2–5 minutes; subsequent builds are cached.' },
                { step: '07', title: 'Hit your URL', detail: 'Coolify gives you a free sslip.io domain immediately. Add your own domain in the Domains field — Traefik issues SSL automatically.' },
              ].map((s, i) => (
                <div key={s.step} className={`flex gap-3 p-3 ${i !== 6 ? 'border-b border-zinc-800' : ''}`}>
                  <div className="text-lime-400 text-[12px] shrink-0 w-8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.step}</div>
                  <div>
                    <div className="text-zinc-100 text-[14px] font-medium">{s.title}</div>
                    <div className="text-zinc-400 text-[13px] leading-snug mt-0.5">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <H2 num="◇ BUILD PACK">Which one for what</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Nixpacks', when: 'Standard Next.js, Express, FastAPI, Django, Laravel. Auto-detects everything.', best: true },
                { name: 'Dockerfile', when: 'You need custom system deps, weird build steps, or a tight production image.' },
                { name: 'Docker Compose', when: 'Multi-container app (web + worker + cache) in one repo.' },
                { name: 'Static', when: 'Plain HTML/CSS/JS or pre-built dist folder. Astro, Vite, plain SPA.' },
              ].map(b => (
                <div key={b.name} className={`border px-3 py-2 ${b.best ? 'border-lime-400/40 bg-lime-400/5' : 'border-zinc-800'}`}>
                  <div className="flex items-center gap-2">
                    <FileCode size={13} className={b.best ? 'text-lime-300' : 'text-zinc-500'} />
                    <span className={b.best ? 'text-lime-200' : 'text-zinc-200'} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{b.name}</span>
                    {b.best && <span className="text-[9px] uppercase tracking-wider text-lime-300/70 border border-lime-300/30 px-1.5">default</span>}
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{b.when}</div>
                </div>
              ))}
            </div>

            <H2 num="◇ DECIDE">What should you deploy first?</H2>
            <div className="my-4 grid grid-cols-2 gap-2">
              {[
                { label: 'A test Next.js app', value: 'next', advice: "Smart move. Use the create-next-app starter, push to GitHub, deploy it. You'll learn the full path in 15 minutes without risk. Set the Domain to a free sslip.io subdomain, confirm SSL, then add your real domain." },
                { label: 'n8n right away', value: 'n8n', advice: "Use Services, not Application. + New Resource → Service → n8n. Coolify spins up n8n + Postgres + Redis for queue mode in one click. Set N8N_HOST, N8N_PROTOCOL=https, and a domain. Done in 2 minutes." },
                { label: 'A production app', value: 'prod', advice: "Slow down. Do a throwaway deploy first to learn the UI, then deploy production with: ① pinned image tags, ② enabled health checks, ③ a S3 backup target on the database, ④ Discord notifications for failures." },
                { label: 'A static site', value: 'static', advice: "Easiest possible start. Push an HTML repo, pick 'Static' build pack, point a domain. SSL within 60 seconds of DNS propagating." },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDeployPath(opt)}
                  className={`text-left p-3 border text-[13px] transition-colors ${
                    deployPath?.value === opt.value
                      ? 'border-lime-400 bg-lime-400/10 text-lime-200'
                      : 'border-zinc-800 hover:border-zinc-600 text-zinc-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {deployPath && (
              <div className="border-l-2 border-lime-400 pl-3 text-[13px] text-zinc-300 leading-relaxed">
                {deployPath.advice}
              </div>
            )}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ ONE-CLICK">Databases that just work</H2>
            <P>+ New Resource → Database → pick one. Coolify gives you a connection string. That's the whole flow.</P>

            <div className="grid grid-cols-2 gap-2 my-3 text-[13px]">
              {['PostgreSQL', 'MySQL', 'MariaDB', 'MongoDB', 'Redis', 'KeyDB', 'DragonflyDB', 'ClickHouse'].map(db => (
                <div key={db} className="border border-zinc-800 px-3 py-2 flex items-center gap-2">
                  <Database size={13} className="text-lime-300" />
                  <span className="text-zinc-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{db}</span>
                </div>
              ))}
            </div>

            <H2 num="◇ STRINGS">Internal vs external</H2>
            <P>Every database gives you two connection strings. Pick the right one or you'll either leak data or break your app.</P>

            <div className="my-3 space-y-2">
              <div className="border border-lime-400/40 bg-lime-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-lime-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Internal · use this</div>
                <code className="text-[12px] text-zinc-200 break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  postgresql://postgres:PASS@postgres-xyz123:5432/postgres
                </code>
                <div className="text-zinc-400 text-[12px] mt-2">When your app runs on the same Coolify server. Traffic never leaves Docker's internal network. Faster, safer, no firewall.</div>
              </div>
              <div className="border border-orange-400/40 bg-orange-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-orange-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>External · only when needed</div>
                <code className="text-[12px] text-zinc-200 break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  postgresql://postgres:PASS@your-server.com:5432/postgres
                </code>
                <div className="text-zinc-400 text-[12px] mt-2">For connecting from your laptop, a CI pipeline, or an off-server tool. Toggle "Publicly Accessible" on. Turn it off when done.</div>
              </div>
            </div>

            <Callout kind="warn" title="REDIS v4 AUTH">
              Coolify v4's Redis ships with auth enabled by default. The bare <Kbd>redis://host:6379</Kbd>
              {' '}will fail with <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-orange-300">NOAUTH Authentication required</span>.
              Always copy the full string Coolify shows you.
            </Callout>

            <H2 num="◇ SERVICES">The 280+ catalog</H2>
            <P>+ New Resource → Service → pick a template. These come pre-wired with the databases/queues they need.</P>

            <div className="grid grid-cols-2 gap-2 my-3 text-[13px]">
              {[
                { name: 'n8n', tag: 'automation' },
                { name: 'Supabase', tag: 'backend' },
                { name: 'Plausible', tag: 'analytics' },
                { name: 'Umami', tag: 'analytics' },
                { name: 'Ghost', tag: 'cms' },
                { name: 'Gitea', tag: 'git' },
                { name: 'Minio', tag: 's3' },
                { name: 'Flowise', tag: 'ai' },
                { name: 'NocoDB', tag: 'db ui' },
                { name: 'Uptime Kuma', tag: 'monitoring' },
              ].map(s => (
                <div key={s.name} className="flex items-center justify-between border border-zinc-800 px-3 py-2">
                  <span className="text-zinc-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.name}</span>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500">{s.tag}</span>
                </div>
              ))}
            </div>

            <Callout kind="tip" title="n8n SPECIFICALLY">
              Coolify's n8n service template runs n8n in <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-fuchsia-300">queue mode</span> with
              Postgres + Redis + a worker process. That's the production-grade setup most people botch when self-hosting from a raw docker-compose. Set <Kbd>WEBHOOK_URL</Kbd>
              {' '}to your domain so OAuth callbacks (Google, Slack) work.
            </Callout>
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ DOMAIN">Pointing a name at your box</H2>
            <P>Two DNS records and a click. That's it.</P>

            <div className="border border-zinc-800 my-3">
              <div className="grid grid-cols-4 text-[11px] uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-800 px-3 py-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span>Type</span><span>Name</span><span>Value</span><span>TTL</span>
              </div>
              {[
                ['A', 'app', '203.0.113.42', '300'],
                ['A', 'coolify', '203.0.113.42', '300'],
                ['CNAME', '*', 'app.yourdomain.com', '300'],
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-4 text-[12px] text-zinc-200 px-3 py-2 border-b border-zinc-800 last:border-b-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {row.map((c, j) => <span key={j} className={j === 0 ? 'text-lime-300' : ''}>{c}</span>)}
                </div>
              ))}
            </div>

            <H2 num="◇ SSL">Traefik does the work</H2>
            <P>
              In your Application or Service → Domains field, enter <Kbd>https://app.yourdomain.com</Kbd>.
              Coolify tells Traefik. Traefik talks to Let's Encrypt. Cert provisioned in under a minute. Renews automatically.
            </P>

            <Callout kind="warn" title="DNS HAS TO PROPAGATE FIRST">
              Let's Encrypt validates by hitting your domain. If DNS hasn't propagated, the challenge fails and
              the cert request is rate-limited. Confirm <Kbd>dig app.yourdomain.com</Kbd> returns your IP before adding it.
            </Callout>

            <H2 num="◇ TESTING">No domain? Use sslip.io</H2>
            <P>
              Coolify can hand you a free domain like <Kbd>203-0-113-42.sslip.io</Kbd> that auto-resolves to your IP,
              with valid SSL. Perfect for testing. Switch to your real domain later — no re-deploy needed.
            </P>

            <H2 num="◇ WILDCARD">For staging + PR previews</H2>
            <P>
              Want every PR to get <Kbd>pr-42.yourdomain.com</Kbd> automatically? You need a wildcard cert.
              That requires the <span className="text-zinc-100">DNS challenge</span>, which means giving Coolify
              an API token for your DNS provider (Cloudflare, Route53). Settings → SSL → Wildcard.
            </P>

            <Quiz
              qid="q3"
              question="You add app.yourdomain.com but SSL fails. DNS hasn't fully propagated yet. What do you do?"
              options={[
                'Keep retrying — Let\'s Encrypt has no rate limits',
                'Wait for DNS to resolve, then retry. Use sslip.io meanwhile.',
                'Disable SSL and run plain HTTP'
              ]}
              correct={1}
              explain="Let's Encrypt has aggressive rate limits — 5 failed validations per hour per domain. Spamming retries gets you locked out for hours. Confirm DNS with dig/nslookup first, or use a sslip.io domain for testing."
            />
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ BACKUPS">Data goes somewhere off-box</H2>
            <P>Rule one of self-hosting: your backup isn't a backup if it lives on the same server.</P>

            <div className="my-4 border border-zinc-800">
              {[
                { step: 'A', t: 'Create an S3 bucket', d: 'Backblaze B2, Cloudflare R2 (no egress fees!), AWS S3, Wasabi. Make an API key with write-only access to the bucket.' },
                { step: 'B', t: 'Add the destination in Coolify', d: 'Settings → S3 Storages. Paste endpoint, key, secret, bucket name. Coolify tests the connection.' },
                { step: 'C', t: 'Enable on each database', d: 'Database → Backups tab. Pick schedule (daily 3am works well), retention (e.g. keep 14 daily, 4 weekly), S3 destination.' },
                { step: 'D', t: 'Test the restore', d: 'Download a backup, restore to a fresh DB resource in a test project. Untested backups are wishes.' },
              ].map((s, i) => (
                <div key={i} className={`flex gap-3 p-3 ${i !== 3 ? 'border-b border-zinc-800' : ''}`}>
                  <div className="text-lime-400 text-[14px] shrink-0 w-6" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.step}</div>
                  <div>
                    <div className="text-zinc-100 text-[14px]">{s.t}</div>
                    <div className="text-zinc-400 text-[12px] leading-snug mt-0.5">{s.d}</div>
                  </div>
                </div>
              ))}
            </div>

            <H2 num="◇ UPDATES">Patching without panic</H2>
            <P>
              Settings → Configuration → Auto-Update Enabled. Pick a window (e.g. Sunday 4am). Coolify pulls
              new versions of itself, runs the upgrade script, restarts the dashboard. Your apps keep running through it.
            </P>

            <Callout kind="info" title="MANUAL UPGRADE">
              If auto-update is off, run the install script again — it doubles as the upgrade command:
              <Code id="upgrade">curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash</Code>
            </Callout>

            <H2 num="◇ HARDEN">Lock the door</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <Check_ id="h1">2FA enabled on every admin account</Check_>
              <Check_ id="h2">SSH password auth disabled — keys only</Check_>
              <Check_ id="h3">Root SSH login disabled (use a sudo user)</Check_>
              <Check_ id="h4">UFW or provider firewall active, only 22/80/443 open</Check_>
              <Check_ id="h5">Fail2ban installed (banishes brute-force attempts)</Check_>
              <Check_ id="h6">Coolify auto-updates ON</Check_>
              <Check_ id="h7">Unattended-upgrades on Ubuntu for OS security patches</Check_>
              <Check_ id="h8">Discord/Telegram notifications wired up for deploy + health alerts</Check_>
            </div>

            <H2 num="◇ GOTCHAS">Things that bite people</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Running out of disk because Docker layers pile up. Run <Kbd>docker system prune -a</Kbd> monthly.</span></li>
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Builds OOM-killing the server. Either size up or build elsewhere and push the image.</span></li>
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Forgetting to set <Kbd>WEBHOOK_URL</Kbd> on n8n — OAuth integrations silently break.</span></li>
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Exposing port 8000 forever. Move the UI to a domain with SSL and close that port.</span></li>
            </ul>
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ COMMANDS">Cheatsheet</H2>
            <div className="space-y-2 my-3 text-[13px]">
              {[
                { c: 'cd /data/coolify/source', d: 'Where Coolify lives on disk' },
                { c: 'docker compose ps', d: 'Status of Coolify\'s own containers' },
                { c: 'docker compose logs -f', d: 'Tail Coolify logs' },
                { c: 'docker ps', d: 'All running containers (yours + Coolify\'s)' },
                { c: 'docker system prune -a', d: 'Reclaim disk from old images/layers' },
                { c: 'docker stats', d: 'Live CPU/RAM per container' },
                { c: 'systemctl status docker', d: 'Confirm Docker is healthy' },
                { c: 'ufw status verbose', d: 'See firewall rules' },
              ].map((r, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2">
                  <code className="text-lime-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.c}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.d}</div>
                </div>
              ))}
            </div>

            <H2 num="◇ LINKS">Where to go next</H2>
            <div className="space-y-2 my-3 text-[13px]">
              {[
                { name: 'Official docs', url: 'coolify.io/docs', note: 'Always start here. Search is decent.' },
                { name: 'GitHub', url: 'github.com/coollabsio/coolify', note: 'Source, issues, releases.' },
                { name: 'Discord', url: 'coolify.io/discord', note: 'Fastest help. The maintainer is active.' },
                { name: 'Service templates', url: 'github.com/coollabsio/coolify/tree/main/templates/compose', note: 'Read the docker-compose for any service before deploying it.' },
              ].map(l => (
                <div key={l.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-fuchsia-300" />
                    <span className="text-zinc-100">{l.name}</span>
                    <span className="text-zinc-500 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.url}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{l.note}</div>
                </div>
              ))}
            </div>

            <H2 num="◇ FINAL">The full picture</H2>
            <Quiz
              qid="qfinal"
              question="You're spinning up: marketing site (Next.js), n8n automation, Postgres for leads, a static landing page. What's the cleanest Coolify setup?"
              options={[
                'Four separate Projects, one resource each',
                'One Project, one Environment, four Resources (the apps + n8n service + database)',
                'Four separate Servers, one Project each',
              ]}
              correct={1}
              explain="Group related work in one Project under one Environment. The marketing site, the static landing page, n8n, and Postgres all belong to the same operation, so they share env vars, domains, and a deployment lifecycle. Separate Projects make sense when work is genuinely unrelated (e.g. a client's stack vs. your own)."
            />

            <div className="my-6 border border-lime-400/40 bg-lime-400/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-lime-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ⟁ Atlas complete
              </div>
              <div className="text-zinc-200 text-[14px]">
                You know enough to spin up a server, deploy an app, and not get owned.
                The rest is reps. Go push something.
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const current = sections[activeSection];
  const Icon = current.icon;

  return (
    <div
      className="min-h-screen bg-zinc-950 text-zinc-100"
      style={{ fontFamily: 'Manrope, sans-serif' }}
    >
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(63 63 70) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative">
        {/* Header */}
        <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-20">
          <div className="px-4 py-3 max-w-4xl mx-auto">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[11px] tracking-[0.3em] text-lime-400"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  ⟁
                </span>
                <h1
                  className="text-[18px] font-extrabold tracking-tight"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  COOLIFY <span className="text-lime-400">ATLAS</span>
                </h1>
              </div>
              <span
                className="text-[10px] tracking-[0.25em] text-zinc-500"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {progress}% MAPPED
              </span>
            </div>
            <div className="h-0.5 bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-lime-400 to-fuchsia-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* Section tabs */}
        <nav className="border-b border-zinc-800 bg-zinc-950/60 sticky top-[60px] z-10 overflow-x-auto">
          <div className="flex max-w-4xl mx-auto">
            {sections.map((s, i) => {
              const Ic = s.icon;
              const active = activeSection === i;
              const done = completed.has(i);
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(i)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-[12px] border-b-2 whitespace-nowrap transition-all shrink-0 ${
                    active
                      ? 'border-lime-400 text-lime-200 bg-lime-400/5'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <span className="text-[10px] text-zinc-500">{s.num}</span>
                  <Ic size={13} />
                  <span>{s.label}</span>
                  {done && <Check size={11} className="text-lime-400" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Section header */}
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 border border-lime-400/50 bg-lime-400/5 flex items-center justify-center">
              <Icon size={18} className="text-lime-300" />
            </div>
            <div>
              <div
                className="text-[10px] tracking-[0.3em] text-zinc-500"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                CHAPTER {current.num}
              </div>
              <h2
                className="text-[26px] font-bold leading-none tracking-tight"
                style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                {current.label}
              </h2>
            </div>
          </div>
          {/* Subtitle per section */}
          <div className="text-[13px] text-zinc-500 italic mb-4 mt-2 border-l-2 border-zinc-800 pl-3">
            {[
              "Why Coolify exists, and the trade you're making.",
              "Picking a VPS that won't choke on day three.",
              "From fresh box to running dashboard in five minutes.",
              "The map of the UI, so nothing feels mysterious.",
              "First app, first deploy, first live URL.",
              "Databases, Redis, and the 280+ service library.",
              "Domains, SSL, and the DNS gotchas.",
              "Backups, hardening, updates — the boring stuff that saves you.",
              "Commands, links, and a final knowledge check.",
            ][activeSection]}
          </div>
        </div>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 pb-32">
          {renderSection()}
        </main>

        {/* Footer nav */}
        <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur z-20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="flex items-center gap-1.5 px-3 py-2 border border-zinc-800 text-zinc-300 text-[12px] hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              <ChevronLeft size={14} />
              Prev
            </button>

            <button
              onClick={() => markComplete(activeSection)}
              className={`flex-1 px-3 py-2 border text-[12px] transition-colors ${
                completed.has(activeSection)
                  ? 'border-lime-400 bg-lime-400/10 text-lime-300'
                  : 'border-fuchsia-400/50 bg-fuchsia-400/5 text-fuchsia-200 hover:bg-fuchsia-400/10'
              }`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              {completed.has(activeSection) ? '✓ Chapter complete' : 'Mark chapter complete'}
            </button>

            <button
              onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
              disabled={activeSection === sections.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 border border-zinc-800 text-zinc-300 text-[12px] hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
