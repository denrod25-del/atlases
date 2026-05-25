import { useState, useEffect } from 'react';
import {
  Compass, Server, LayoutGrid, Zap, Boxes, Waves, Bot, ShieldCheck,
  MousePointerClick, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, Download, ArrowLeft, RotateCcw, Plus, Play, AlertTriangle,
  Sparkles, GitBranch, Database, Globe, Clock, Webhook, FileCode, Brain,
  Activity, Layers, KeyRound, Mail, Bell, Filter, Repeat, ArrowRight
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Why n8n, when not, and what you're trading off." },
  { id: 'foundation', label: 'Foundation', icon: Server, num: '02', sub: "Cloud, self-host, Coolify. Sizing without panic." },
  { id: 'cockpit', label: 'Cockpit', icon: LayoutGrid, num: '03', sub: "The editor, executions, credentials, variables — the whole map." },
  { id: 'spark', label: 'Spark', icon: Zap, num: '04', sub: "Your first real workflow, end to end." },
  { id: 'nodes', label: 'Nodes', icon: Boxes, num: '05', sub: "The dozen nodes you'll use 90% of the time." },
  { id: 'stream', label: 'Stream', icon: Waves, num: '06', sub: "Items, expressions, and the data model people get wrong." },
  { id: 'agents', label: 'Agents', icon: Bot, num: '07', sub: "AI agents, tools, memory, RAG — without the buzzword bingo." },
  { id: 'production', label: 'Production', icon: ShieldCheck, num: '08', sub: "Queue mode, error workflows, the things that survive Saturday night." },
  { id: 'sandbox', label: 'Sandbox', icon: MousePointerClick, num: '09', sub: "Build a workflow on a mock canvas, click through it." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '10', sub: "When the workflow breaks, walk the decision tree." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '11', sub: "Commands, expression reference, export, review." },
];

const STACKS = [
  { id: 'leads', label: 'Leads / sales automation', desc: 'Forms, scrapers, enrichment, CRM sync, SMS/email outreach', icon: '⌖' },
  { id: 'ai', label: 'AI agents / chatbots', desc: 'Agent flows, RAG, vector stores, chat interfaces', icon: '◆' },
  { id: 'data', label: 'Data pipelines / ETL', desc: 'API → transform → DB. Daily syncs, reporting, scrapers', icon: '⟂' },
  { id: 'internal', label: 'Internal tools / approvals', desc: 'Forms, approvals, routing, Slack/email notifications', icon: '◐' },
  { id: 'mixed', label: 'A mix of everything', desc: 'Client work + side projects + experiments', icon: '◈' },
];

const GLOSSARY = {
  Workflow: "A chain of nodes wired together. The atomic unit in n8n. Has a single trigger and one or more execution paths.",
  Node: "A single block of work — a trigger, an action, a transformation. Drag from the panel onto the canvas; configure; connect.",
  Trigger: "The node that starts a workflow. Webhook, Schedule, Form, Manual, IMAP, Chat. Every workflow has exactly one (active) trigger.",
  Item: "n8n's atomic unit of data. A JSON object with optional binary attachment. Nodes pass arrays of items between each other.",
  "Pin data": "Freezing a node's output so re-runs use the same data — for development only. Disable before going to production or you'll wonder why nothing's updating.",
  Execution: "A single run of a workflow. Live in Executions tab — success, error, running, waiting. Saved or pruned per workflow settings.",
  Credential: "Stored auth (API key, OAuth, basic auth, SSH key) reusable across workflows. Encrypted at rest with N8N_ENCRYPTION_KEY.",
  Webhook: "A unique URL n8n generates for a Webhook Trigger node. POST to it, the workflow runs. Test URL and Production URL are different.",
  Expression: "JavaScript wrapped in {{ }} that resolves at runtime. {{ $json.email }} reads the current item's email field. Most fields support expressions.",
  "$json": "Shortcut for the current item's JSON. Equivalent to $input.item.json in many contexts. The most-used expression variable.",
  "$node": "Reference another node's output by name. {{ $node['HTTP Request'].json.id }}. Useful when you need data from earlier in the flow, not the immediate previous node.",
  "$items": "All items from a named node as an array. {{ $items('Loop').length }}. Used in aggregation and counting.",
  "Queue mode": "Production execution mode. Main process handles editor + webhooks; jobs go to Redis; separate workers pull and execute. Required at scale.",
  Worker: "Separate n8n process that pulls execution jobs from Redis. Run multiple for parallelism. `n8n worker` is the command.",
  "Main process": "The default n8n process — handles the UI, accepts webhooks, runs workflows directly when not in queue mode.",
  "Sub-workflow": "A workflow called by another via Execute Workflow node. Reusable building blocks. Input/output is data, just like any node.",
  "Static data": "Per-workflow persistent storage. Useful for cursors, last-seen IDs, run counters. Survives across executions.",
  "Binary data": "Files (images, PDFs) attached to an item alongside JSON. Lives in `binary` keyed by name. Some nodes operate on it directly.",
  "Error workflow": "Designated workflow that runs when another workflow fails. Set per-workflow in Settings. Send yourself an alert; don't fly blind.",
  Tag: "String label attached to workflows for filtering. Use them — at 50+ workflows you'll be glad. Tags don't affect execution.",
  Project: "Team-isolated workspace (Enterprise / Cloud feature, also in self-host since v1.x). Each project has its own credentials and workflows.",
  "Community Node": "Third-party node installed from npm (the n8n-nodes-* packages). Risk: not vetted. Reward: lots of integrations.",
  LangChain: "The AI framework n8n's AI nodes are built on. Don't need to know it to use the nodes, but the vocabulary (agent, tool, chain, memory) comes from there.",
  Agent: "An AI node that decides which Tools to call based on a goal. Loop: think → act → observe → repeat until done.",
  Tool: "A node an AI Agent can call. Other workflows, HTTP requests, Code blocks — anything you wire as a tool.",
  Memory: "How an AI Agent remembers conversation context. Window Buffer (last N messages), Postgres Chat Memory (persistent), Redis, Motorhead, etc.",
  "Vector Store": "Database for embeddings (Pinecone, Qdrant, Supabase pgvector, in-memory). The retrieval half of RAG.",
  "Chat Trigger": "Special trigger that gives you a chat-style UI for testing AI agents. Also exposes a public chat URL if you enable it.",
  Embedding: "A numeric vector that represents a chunk of text. Similar text → similar vectors. The foundation of semantic search and RAG.",
  RAG: "Retrieval-Augmented Generation. Load docs → split → embed → store → retrieve relevant chunks at query time → stuff into LLM context.",
  "N8N_ENCRYPTION_KEY": "Secret key used to encrypt credentials in the database. If you lose it, all stored credentials become unreadable. Back it up SEPARATELY from your DB backups.",
  "Cron expression": "Five-part schedule string (`0 */6 * * *` = every 6 hours). Schedule Trigger accepts these directly.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "You need a 4-step automation that runs ~100 times/month. Zapier or n8n?",
      opts: ["Zapier — simpler, fits free tier", "n8n — pricing scales better", "Either is fine"],
      a: 2,
      x: "Honest answer: both work at that volume. Pick on operator comfort. The n8n advantage kicks in around higher volume or complex branching where Zapier task counts get expensive."
    },
    {
      qid: 'o2',
      q: "You're scraping 5,000 records/day, enriching each via OpenAI, then upserting to Postgres. Best tool?",
      opts: ["Zapier", "n8n", "Custom Python script", "Make / Integromat"],
      a: 1,
      x: "Zapier and Make would charge you for every operation. A custom script works but you lose the visual debugging and credential management. n8n is built for this: write the flow once, run it forever, all included."
    },
  ],
  foundation: [
    {
      qid: 'f1',
      q: "You're starting out. Solo, ~20 workflows planned. Cloud or self-host?",
      opts: ["n8n Cloud — get going fast", "Self-host via Docker — full control", "Self-host via Coolify — best of both"],
      a: 2,
      x: "All three are defensible. Cloud is fastest to start. Coolify on a $5 VPS gives you the self-host benefits (no caps, full data ownership) without the install headache. Plain Docker is fine if you already run servers."
    },
    {
      qid: 'f2',
      q: "When MUST you switch from default to queue mode?",
      opts: ["When workflows take longer than 5 seconds", "When you have parallel webhooks, long-running jobs, or want zero-downtime restarts", "Always, for any production use"],
      a: 1,
      x: "Default mode is fine for low/medium volume. Queue mode shines when you need parallelism, when a slow workflow can't block webhooks, or when you want to restart the editor without killing in-flight executions."
    },
    {
      qid: 'f3',
      q: "Default n8n self-host uses SQLite. When should you switch to Postgres?",
      opts: ["Never, SQLite is fine forever", "When you have >50 workflows or going to production", "Only if you want backups"],
      a: 1,
      x: "SQLite is great for dev and tiny installs. Postgres is required for queue mode and recommended for any production work — better concurrency, easier backups, faster execution history queries."
    },
  ],
  cockpit: [
    {
      qid: 'c1',
      q: "Where do you set a secret that 12 different workflows need to access?",
      opts: ["Hardcode it in each workflow", "Credentials (if it's an auth secret) or Variables (if it's a value)", "Static data"],
      a: 1,
      x: "Credentials are for auth (API keys, OAuth, etc) — encrypted. Variables are key/value pairs for non-secret config used across workflows. Static data is per-workflow runtime state."
    },
    {
      qid: 'c2',
      q: "You pinned data on a node during development. You activate the workflow. What happens in production?",
      opts: ["Pinned data is used", "Pinned data is ignored, the node executes normally", "The workflow refuses to run"],
      a: 1,
      x: "Pinned data only affects manual executions. Live runs always execute the node. Still — it's polite to unpin before activating, so the next person doesn't get confused."
    },
  ],
  spark: [
    {
      qid: 's1',
      q: "You built a workflow with Manual Trigger and tested it. Now you want it to run every hour. What do you do?",
      opts: ["Delete the Manual Trigger, add a Schedule Trigger", "Activate the workflow", "Both — change the trigger AND activate"],
      a: 2,
      x: "Manual Trigger never auto-runs. Swap it for a Schedule Trigger AND flip the workflow's active toggle. Forgetting either is the #1 'why isn't it running' question."
    },
  ],
  nodes: [
    {
      qid: 'n1',
      q: "You have 100 items going into an HTTP Request node. By default, what happens?",
      opts: ["The node makes 1 batch request with all 100 items", "The node makes 100 separate HTTP requests", "It errors because the input is too large"],
      a: 1,
      x: "n8n runs nodes once per item by default. For 100 items → 100 API calls. To batch, either use the Loop node, Aggregate before the HTTP, or use HTTP's batching settings."
    },
    {
      qid: 'n2',
      q: "Set/Edit Fields vs Code node for transforming data?",
      opts: ["Always use Code — more flexible", "Set/Edit Fields for simple, Code for logic the Set node can't express", "Always use Set — safer"],
      a: 1,
      x: "Set is faster, easier to read, and harder to break. Reach for Code only when you need real JavaScript (loops, conditionals beyond IF, complex string manipulation, custom validation)."
    },
  ],
  stream: [
    {
      qid: 'st1',
      q: "Your HTTP node returns one big JSON response with an array of 50 objects under `data.records`. How do you make n8n process each record individually?",
      opts: ["It already does", "Add a Split Out node (or Item Lists) pointing at data.records", "Use a Loop node"],
      a: 1,
      x: "One HTTP response = one item by default, even if its JSON contains an array. Use Split Out (formerly Item Lists 'Split Out Items') to fan one item into many."
    },
    {
      qid: 'st2',
      q: "You want to grab a field from a node two steps back, not the immediate previous one. What expression?",
      opts: ["{{ $json.field }}", "{{ $node['EarlierNodeName'].json.field }}", "{{ $previous.previous.json.field }}"],
      a: 1,
      x: "$json always refers to the current item from the previous node. To reach further back, use $node['Name'] with the exact node name (case-sensitive) in brackets."
    },
    {
      qid: 'st3',
      q: "Your Code node has `return items;` but downstream nodes see no data. Likely cause?",
      opts: ["Syntax error", "`items` is the right variable but maybe empty — check input", "Should be `return $input.all()` in current n8n"],
      a: 2,
      x: "n8n's Code node API has evolved. Current correct form is `return $input.all()` or `return items.map(item => ({ json: ... }))`. Old `return items;` may not work in newer versions."
    },
  ],
  agents: [
    {
      qid: 'a1',
      q: "When does an AI Agent beat a hardcoded Chain of nodes?",
      opts: ["Always — agents are smarter", "When the steps to solve a task aren't known upfront and might require decisions", "Never — chains are deterministic and safer"],
      a: 1,
      x: "Agents shine when the path is dynamic: 'answer this user question, calling the right tool only if needed.' For a known sequence (fetch → transform → store), a chain of regular nodes is cheaper, faster, and more debuggable."
    },
    {
      qid: 'a2',
      q: "Your RAG retrieval is returning irrelevant chunks. First thing to check?",
      opts: ["Switch to a more expensive LLM", "Chunk size and overlap, and how documents are split", "Use a different vector store"],
      a: 1,
      x: "RAG quality lives or dies on chunking. Too small → no context; too large → diluted. Bad splits across sentence boundaries hurt retrieval. Tune chunk size + overlap before touching the model."
    },
  ],
  production: [
    {
      qid: 'p1',
      q: "You're running queue mode. Workflows aren't executing — they queue but never run. What's most likely wrong?",
      opts: ["The main process is down", "No worker process is running, or workers can't reach Redis", "Postgres is full"],
      a: 1,
      x: "In queue mode, the main process queues jobs; workers execute. No workers = nothing runs. Check `n8n worker` processes are alive and Redis is reachable from them."
    },
    {
      qid: 'p2',
      q: "Your N8N_ENCRYPTION_KEY changed. What breaks?",
      opts: ["Nothing", "All stored credentials become unreadable — workflows using them error", "The whole instance won't start"],
      a: 1,
      x: "Credentials are encrypted with this key. Change it without re-encrypting, and every credential becomes garbage. Back this key up SEPARATELY from your database — losing both at once means re-entering every credential."
    },
    {
      qid: 'p3',
      q: "Every production workflow should have…",
      opts: ["A Schedule Trigger", "An Error Workflow assigned in Settings", "A Code node for validation"],
      a: 1,
      x: "Error Workflow is the seatbelt. Without it, a failed run just sits in Executions and you don't know unless you check. With it, you get a Slack/email/Discord ping the moment something breaks."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "You're scaling a customer's lead-routing flow. Volume just 10x'd. Three changes you make in order?",
      opts: [
        "Switch to Postgres, enable queue mode, add workers",
        "Add a Code node, upgrade the VPS, change the trigger",
        "Buy n8n Cloud Enterprise, hire help, panic"
      ],
      a: 0,
      x: "The scaling triad: durable DB (Postgres), queue mode (decouple webhooks from execution), workers (parallelism). All three address different bottlenecks; you'll need all three eventually."
    },
  ],
};

const COMMANDS = [
  { cmd: 'docker compose up -d', desc: "Bring up n8n via Docker Compose (most common self-host)." },
  { cmd: 'docker compose logs -f n8n', desc: "Tail n8n's logs in real time." },
  { cmd: 'docker compose ps', desc: "Status of all containers (main, postgres, redis, workers)." },
  { cmd: 'docker compose restart n8n', desc: "Restart just the main n8n process." },
  { cmd: 'n8n start', desc: "Start n8n in the foreground (npm install path)." },
  { cmd: 'n8n worker', desc: "Start a queue-mode worker process. Run multiple for more parallelism." },
  { cmd: 'n8n webhook', desc: "Dedicated webhook process (queue mode optional optimization)." },
  { cmd: 'n8n export:workflow --all --output=./backup.json', desc: "Export every workflow to a JSON file." },
  { cmd: 'n8n import:workflow --input=./backup.json', desc: "Restore workflows from a JSON file." },
  { cmd: 'n8n export:credentials --all --output=./creds.json --decrypted', desc: "Export credentials (decrypted — handle this file like dynamite)." },
  { cmd: 'pg_dump -U n8n n8n > n8n-backup.sql', desc: "Postgres dump — your full source of truth." },
  { cmd: 'npx n8n --version', desc: "Which n8n version is on this machine." },
  { cmd: 'redis-cli -h localhost ping', desc: "Confirm Redis is reachable (queue mode prereq)." },
  { cmd: 'curl -X POST https://n8n.yourdomain.com/webhook/test-id -d "hello"', desc: "Hit a webhook from the command line to test it." },
];

const LINKS = [
  { name: 'Official docs', url: 'docs.n8n.io', note: "Reference. The 'Try it out' examples are unusually good." },
  { name: 'Community forum', url: 'community.n8n.io', note: "Faster help than GitHub issues for most things." },
  { name: 'GitHub', url: 'github.com/n8n-io/n8n', note: 'Source + releases + roadmap.' },
  { name: 'n8n.io workflows', url: 'n8n.io/workflows', note: "Browseable library of 1500+ public workflow templates." },
  { name: 'Hosted Cloud', url: 'n8n.io/cloud', note: 'Managed option if self-host is not your thing.' },
];

const PERSONALIZED = {
  leads: {
    spark: "For lead workflows, the canonical first one: Webhook Trigger (form submit) → Set (normalize fields) → HTTP Request (enrich) → IF (good lead?) → branches to Slack alert and CRM upsert.",
    triggers: "Webhook for inbound forms is your main entry point. Schedule for periodic re-checks (parcel scraping, old-lead nurture). IMAP for parsing email replies.",
    production: "Lead volume spikes are unpredictable. Queue mode is non-negotiable — a Facebook ad going viral shouldn't drop leads because one Slack call hung.",
  },
  ai: {
    spark: "AI build start: Chat Trigger → AI Agent → (Tool: HTTP Request, Tool: Code) → reply. Use Window Buffer Memory for short conversations; Postgres Chat Memory for persistent.",
    triggers: "Chat Trigger is the gateway. Webhook for embedding the agent in another app. Schedule for background ingestion (RAG pipeline).",
    production: "Vector stores live separately (Supabase pgvector, Qdrant) — they scale on a different axis than n8n. Cache embeddings aggressively; they're the slow + expensive step.",
  },
  data: {
    spark: "ETL starter: Schedule Trigger (cron) → HTTP Request (paginated fetch) → Code (transform/clean) → Postgres (upsert). Use Static Data to remember the last cursor/timestamp.",
    triggers: "Schedule for daily/hourly syncs. Webhook for event-driven ingestion. Polling triggers for systems without webhooks.",
    production: "Sub-workflows for reusable transforms (date parsing, address normalization). Static data for high-water marks. Queue mode if any single sync runs >60s.",
  },
  internal: {
    spark: "Internal-tool starter: Form Trigger → Set (defaults + metadata) → IF (routing) → Slack message + Notion entry. Add Wait for human approval if needed.",
    triggers: "Form Trigger gives you a hosted form URL — no separate frontend needed. Webhook for integrations with your existing apps.",
    production: "Form-based flows tolerate slowness better than webhook flows. Default mode usually fine; switch to queue mode when you add background jobs.",
  },
  mixed: {
    spark: "Pick one shape: Schedule + HTTP + IF is the gateway drug to everything. Get fluent there, then layer in webhooks, agents, sub-workflows.",
    triggers: "Get comfortable with Manual + Webhook + Schedule first. Form, IMAP, Chat are all variations once you know the pattern.",
    production: "Tag aggressively. Group related workflows in projects. Set an error workflow on every active one. Queue mode when total exec time per minute exceeds 30 seconds.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's going wrong?",
    opts: [
      { label: "🚫 Workflow isn't running at all", next: 'notrun' },
      { label: "⚠️ A node is failing", next: 'nodefail' },
      { label: "🌀 Data isn't what you expected", next: 'data' },
      { label: "🐢 Workflow is slow / hanging", next: 'slow' },
      { label: "💀 Queue mode workers idle / stuck", next: 'queue' },
      { label: "🔒 Credentials issue", next: 'creds' },
      { label: "📝 Editor / UI problems", next: 'editor' },
    ],
  },
  notrun: {
    q: "What kind of trigger?",
    opts: [
      { label: "Webhook — no executions when POSTed", next: 'nr-webhook' },
      { label: "Schedule — never fires", next: 'nr-schedule' },
      { label: "Form — submission goes nowhere", next: 'nr-form' },
      { label: "Manual — works manually, never auto", next: 'nr-manual' },
    ],
  },
  'nr-webhook': {
    fix: "Webhook URL is the most common confusion.",
    steps: [
      "Test URL ≠ Production URL. Test URL only works after clicking 'Listen for test event'. Production URL works when the workflow is Active.",
      "Workflow must be toggled Active for the Production URL to respond.",
      "Check WEBHOOK_URL env var matches your public domain. If it's localhost, external services can't reach the URL n8n hands out.",
      "Confirm with curl from a different machine: 200 OK on success, 404 if the URL is wrong or workflow inactive.",
    ],
    cmd: "curl -i -X POST https://n8n.yourdomain.com/webhook/<your-id> -H 'Content-Type: application/json' -d '{\"test\":1}'",
  },
  'nr-schedule': {
    fix: "Schedule Triggers only fire when the workflow is active AND the n8n process is running.",
    steps: [
      "Toggle Active in the editor (top right).",
      "If queue mode, schedules are owned by the main process — confirm main is running, not just workers.",
      "Check timezone: n8n uses GENERIC_TIMEZONE env var. A 9am schedule in UTC ≠ 9am in your local time.",
      "Cron expressions: test with crontab.guru before trusting them.",
    ],
  },
  'nr-form': {
    fix: "Form Trigger gives you a hosted URL — but only when the workflow is Active.",
    steps: [
      "Activate the workflow.",
      "Confirm the form URL Coolify/n8n displays — copy/paste it, don't retype.",
      "Public URLs respect WEBHOOK_URL, like webhooks. Wrong WEBHOOK_URL = wrong public URL.",
    ],
  },
  'nr-manual': {
    fix: "Manual Trigger never auto-runs. By design.",
    steps: [
      "Swap it for a Schedule, Webhook, or Form Trigger.",
      "Then activate the workflow.",
      "Manual triggers are for development. Activating doesn't help — they require the 'Execute Workflow' button.",
    ],
  },
  nodefail: {
    q: "What's the error look like?",
    opts: [
      { label: "401 / 403 / Unauthorized", next: 'nf-auth' },
      { label: "429 / rate limited", next: 'nf-rate' },
      { label: "Timeout / takes forever", next: 'nf-timeout' },
      { label: "Type error / undefined / cannot read property", next: 'nf-undefined' },
      { label: "Other", next: 'nf-other' },
    ],
  },
  'nf-auth': {
    fix: "Credentials problem. Almost always.",
    steps: [
      "Open the credential, click Test Connection — n8n tries to authenticate live.",
      "API keys: did the key expire? Was it rotated?",
      "OAuth: token may have expired and refresh failed. Re-authorize.",
      "Custom auth: check N8N_ENCRYPTION_KEY hasn't changed — if it did, every credential breaks.",
    ],
  },
  'nf-rate': {
    fix: "The API is throttling you. Slow down or backoff.",
    steps: [
      "Add a Wait node between iterations for slow rate limits (1-10 req/s).",
      "Loop Over Items with Batch Size set, and a wait between batches.",
      "HTTP Request node: enable 'Retry on Fail' with backoff (settings tab).",
      "If consistent, the provider has a higher tier — sometimes worth paying for.",
    ],
  },
  'nf-timeout': {
    fix: "The remote endpoint is too slow, or n8n's timeout is too tight.",
    steps: [
      "HTTP Request → Options → Timeout. Raise it (default is 5 min in newer versions, was lower).",
      "If queue mode, EXECUTIONS_TIMEOUT env var caps total workflow runtime.",
      "Slow API + many items = use batching/loops + sub-workflows so one item failing doesn't kill the whole batch.",
    ],
  },
  'nf-undefined': {
    fix: "The node before you didn't output what you think it did.",
    steps: [
      "Click the previous node, look at its Output tab — what did it ACTUALLY return?",
      "If empty/zero items, your expression upstream filtered everything out.",
      "{{ $json.foo.bar }} explodes if foo is undefined. Use {{ $json.foo?.bar }} (optional chaining) or set a default.",
      "Pinned data lying to you? Unpin nodes and re-run.",
    ],
  },
  'nf-other': {
    fix: "Generic playbook for unknown errors.",
    steps: [
      "Read the error message word by word — n8n's are usually decent.",
      "Executions tab → click the failed run → open the failing node → see exact input + error.",
      "Search the error message in community.n8n.io — common errors are documented.",
      "Reduce: simplify the workflow until it works, then add back one node at a time.",
    ],
  },
  data: {
    q: "What's off about the data?",
    opts: [
      { label: "Expected many items, got one", next: 'd-one' },
      { label: "Expected one item, got many", next: 'd-many' },
      { label: "$json.field is undefined", next: 'd-undef' },
      { label: "Pinned data confusion", next: 'd-pin' },
    ],
  },
  'd-one': {
    fix: "API returned an array inside one JSON response. n8n sees the whole response as a single item.",
    steps: [
      "Add a Split Out node after your HTTP/API node.",
      "Set 'Fields To Split Out' to the array path, e.g. data.records.",
      "Downstream nodes now see N items, one per array element.",
    ],
  },
  'd-many': {
    fix: "You probably want to aggregate down.",
    steps: [
      "Use Aggregate node — combines an array of items back into one item containing an array.",
      "Useful before HTTP Request when you want one batch call instead of N.",
      "Also Code node with `return [{ json: { all: $input.all().map(i => i.json) } }];`",
    ],
  },
  'd-undef': {
    fix: "The property doesn't exist on the item shape you're working with.",
    steps: [
      "Click the source node → check Output panel for the ACTUAL key names.",
      "Watch for casing: `id` vs `Id` vs `ID`.",
      "Nested fields: {{ $json.user.email }} fails if user is null. Use {{ $json.user?.email }} or precede with an IF check.",
      "Sometimes the field is in `binary`, not `json` — open both panels.",
    ],
  },
  'd-pin': {
    fix: "Pinned data only applies to Manual executions in the editor. Live runs ignore it.",
    steps: [
      "If you're testing manually and seeing weird old data: unpin the node (right-click → Unpin).",
      "Pinned data is yellow-highlighted in the node header.",
      "If a workflow misbehaves on activation but not in manual test, pinned data is masking the real input.",
    ],
  },
  slow: {
    fix: "Find the bottleneck before fixing.",
    steps: [
      "Executions → open the slow run → check timing per node. One node dominates total time, almost always.",
      "Common culprits: large items in HTTP (no streaming), unbatched API calls, Code node doing sync work in a loop.",
      "Per-item execution × N items = death. Use Aggregate before HTTP to batch.",
      "If it's an external API: not your problem — add Wait/retry, or run async via Webhook + later.",
    ],
  },
  queue: {
    q: "Where in the chain is the problem?",
    opts: [
      { label: "Workflows are queued but never execute", next: 'q-workers' },
      { label: "Webhooks return 5xx", next: 'q-main' },
      { label: "Execution history not saving", next: 'q-db' },
    ],
  },
  'q-workers': {
    fix: "No worker is picking up jobs.",
    steps: [
      "Confirm at least one `n8n worker` process is running. `docker compose ps` or `ps aux | grep worker`.",
      "Workers must reach Redis. `redis-cli -h <redis-host> ping` from the worker container.",
      "Workers must share the same N8N_ENCRYPTION_KEY and DB config as main — otherwise they can't decrypt credentials.",
      "Logs: `docker compose logs -f worker` — usually screams at you about what's wrong.",
    ],
    cmd: "docker compose ps && docker compose logs --tail=50 worker",
  },
  'q-main': {
    fix: "Main process is overloaded or down.",
    steps: [
      "`docker compose logs -f n8n` — look for OOM kills or DB connection errors.",
      "Heavy webhook traffic + default mode = main process pegged. Switch to queue mode.",
      "Add a dedicated webhook process: `n8n webhook` to offload from main.",
    ],
  },
  'q-db': {
    fix: "Postgres connection issues, or pruning misconfigured.",
    steps: [
      "Check `docker compose logs postgres` for connection errors.",
      "EXECUTIONS_DATA_PRUNE=true with low EXECUTIONS_DATA_MAX_AGE = aggressive deletion. Maybe too aggressive.",
      "Disk full? `df -h` on the host. Old executions can pile up to gigabytes.",
    ],
  },
  creds: {
    fix: "Credentials are encrypted with N8N_ENCRYPTION_KEY.",
    steps: [
      "If a single credential is broken: open it, re-enter, Test Connection.",
      "If MANY credentials suddenly broken: N8N_ENCRYPTION_KEY probably changed (or wasn't set, then was set, etc).",
      "Recovery: restore the encryption key from backup, restart. Credentials decrypt again.",
      "No backup of the key? Re-enter every credential. (And back up the key SEPARATELY next time.)",
    ],
  },
  editor: {
    q: "What's broken in the editor?",
    opts: [
      { label: "Workflow won't save", next: 'ed-save' },
      { label: "Canvas frozen / laggy", next: 'ed-lag' },
      { label: "Execute button does nothing", next: 'ed-exec' },
    ],
  },
  'ed-save': {
    fix: "Save failures are usually DB or auth.",
    steps: [
      "Browser console (F12) — look for 4xx or 5xx on the save request.",
      "5xx: backend issue. Check n8n logs.",
      "4xx auth: session expired. Refresh / re-login.",
      "Workflow too large? Huge sub-workflow chains or massive pinned data can hit limits — clean up.",
    ],
  },
  'ed-lag': {
    fix: "Big workflows + large pinned data eat browser memory.",
    steps: [
      "Unpin nodes with large outputs.",
      "Break workflows over ~30 nodes into sub-workflows.",
      "Try a fresh browser tab; sometimes the editor leaks memory across sessions.",
    ],
  },
  'ed-exec': {
    fix: "Click happens but nothing fires.",
    steps: [
      "Check the workflow has a valid trigger (or is using Manual Trigger).",
      "Browser console for JS errors.",
      "Hard refresh (Cmd-Shift-R). Yes, really.",
      "If still broken: restart n8n. Memory pressure on main can wedge the editor backend.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'editor', x: 150, y: 18, w: 100, h: 24, label: 'Editor (browser)', color: '#fb7185', desc: "Your browser pointed at n8n. Build workflows, view executions, manage credentials. Talks to the main process via REST + WebSocket." },
  { id: 'webhooks', x: 25, y: 75, w: 100, h: 24, label: 'Incoming webhooks', color: '#22d3ee', desc: "External services POST to your webhook URLs. Hit the n8n main process (or webhook process if queue mode); trigger workflow execution." },
  { id: 'schedule', x: 275, y: 75, w: 100, h: 24, label: 'Schedule timer', color: '#22d3ee', desc: "Internal cron. The main process fires schedule triggers at their configured times. Lives with main, not workers." },
  { id: 'main', x: 110, y: 140, w: 180, h: 32, label: 'n8n main', color: '#fb7185', desc: "The heart. Serves the editor, accepts webhooks, runs schedules. In default mode it also executes workflows. In queue mode, it pushes execution jobs to Redis instead." },
  { id: 'redis', x: 140, y: 200, w: 120, h: 28, label: 'Redis · queue', color: '#fb7185', desc: "Queue mode only. Holds pending execution jobs. Main pushes; workers pop. Pure broker — no business logic lives here." },
  { id: 'workers', x: 90, y: 250, w: 220, h: 32, label: 'Workers (queue mode)', color: '#fb7185', desc: "Separate `n8n worker` processes. Pull jobs from Redis, execute, write results back to Postgres. Run multiple for parallelism." },
  { id: 'pg', x: 35, y: 320, w: 140, h: 28, label: 'Postgres', color: '#fb7185', desc: "Workflows, credentials, executions, variables, projects — everything lives here. Recommended over default SQLite for any production work." },
  { id: 'apis', x: 225, y: 320, w: 140, h: 28, label: 'External APIs', color: '#22d3ee', desc: "Where most node calls go. HTTP Request, Google nodes, OpenAI, Slack — all outbound from main or workers." },
];

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_PREFIX = 'n8natlas:';
async function loadKey(key) {
  try {
    const result = await window.storage.get(STORAGE_PREFIX + key);
    if (result?.value) return JSON.parse(result.value);
  } catch (e) {}
  return null;
}
async function saveKey(key, value) {
  try { await window.storage.set(STORAGE_PREFIX + key, JSON.stringify(value)); }
  catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function N8nAtlas() {
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const [checklist, setChecklist] = useState({});
  const [quizState, setQuizState] = useState({});
  const [stack, setStack] = useState(null);
  const [activeSection, setActiveSection] = useState(0);

  const [copied, setCopied] = useState(null);
  const [termPopup, setTermPopup] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [archSelected, setArchSelected] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [sizer, setSizer] = useState({ workflows: 15, dailyRuns: 500, hasAi: false });

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
    (async () => {
      const [c, cl, qs, st, as] = await Promise.all([
        loadKey('completed'), loadKey('checklist'), loadKey('quizState'),
        loadKey('stack'), loadKey('activeSection'),
      ]);
      if (c) setCompleted(new Set(c));
      if (cl) setChecklist(cl);
      if (qs) setQuizState(qs);
      if (st) setStack(st);
      if (typeof as === 'number') setActiveSection(as);
      if (!st) setShowOnboarding(true);
      setLoaded(true);
    })();
    return () => { try { document.head.removeChild(link); } catch (e) {} };
  }, []);

  useEffect(() => { if (loaded) saveKey('completed', [...completed]); }, [completed, loaded]);
  useEffect(() => { if (loaded) saveKey('checklist', checklist); }, [checklist, loaded]);
  useEffect(() => { if (loaded) saveKey('quizState', quizState); }, [quizState, loaded]);
  useEffect(() => { if (loaded && stack) saveKey('stack', stack); }, [stack, loaded]);
  useEffect(() => { if (loaded) saveKey('activeSection', activeSection); }, [activeSection, loaded]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setCmdOpen(o => !o); }
      if (e.key === 'Escape') { setCmdOpen(false); setTermPopup(null); setArchSelected(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
  const resetAll = async () => {
    setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null);
    setActiveSection(0); setShowOnboarding(true);
    try {
      await Promise.all([
        window.storage.delete(STORAGE_PREFIX + 'completed'),
        window.storage.delete(STORAGE_PREFIX + 'checklist'),
        window.storage.delete(STORAGE_PREFIX + 'quizState'),
        window.storage.delete(STORAGE_PREFIX + 'stack'),
        window.storage.delete(STORAGE_PREFIX + 'activeSection'),
      ]);
    } catch (e) {}
  };

  /* ─── Reusable UI ─── */
  const Code = ({ children, id, lang = 'bash' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-rose-300 transition-colors">
          {copied === id ? <Check size={12} /> : <Copy size={12} />}
          {copied === id ? 'copied' : 'copy'}
        </button>
      </div>
      <pre className="bg-zinc-950 border border-zinc-800 border-t-0 text-zinc-100 px-3 py-3 text-[13px] overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        <code>{children}</code>
      </pre>
    </div>
  );

  const Callout = ({ kind = 'info', children, title }) => {
    const p = {
      info: { border: 'border-rose-400/40', bg: 'bg-rose-400/5', text: 'text-rose-300', label: 'NOTE' },
      warn: { border: 'border-orange-400/40', bg: 'bg-orange-400/5', text: 'text-orange-300', label: 'HEADS UP' },
      tip: { border: 'border-cyan-400/40', bg: 'bg-cyan-400/5', text: 'text-cyan-300', label: 'TIP' },
      you: { border: 'border-amber-400/40', bg: 'bg-amber-400/5', text: 'text-amber-300', label: 'FOR YOUR STACK' },
    }[kind];
    return (
      <div className={`my-4 border ${p.border} ${p.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${p.text} mb-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {title || p.label}
        </div>
        <div className="text-zinc-300 text-[14px] leading-relaxed">{children}</div>
      </div>
    );
  };

  const CheckItem = ({ id, children }) => (
    <button onClick={() => toggleCheck(id)} className="flex items-start gap-3 w-full text-left py-2 hover:bg-zinc-900/50 px-2 -mx-2 transition-colors">
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-rose-400 border-rose-400' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          KNOWLEDGE CHECK · {quiz.qid.toUpperCase()}
        </div>
        <div className="text-zinc-100 text-[15px] mb-3">{quiz.q}</div>
        <div className="space-y-1.5">
          {quiz.opts.map((opt, i) => {
            const isChosen = state?.choice === i;
            const isCorrect = i === quiz.a;
            const reveal = !!state;
            return (
              <button key={i} onClick={() => !state && answerQuiz(quiz.qid, i, quiz.a)} disabled={!!state}
                className={`w-full text-left px-3 py-2 border text-[13px] transition-colors flex items-center gap-2 ${
                  reveal && isCorrect ? 'border-rose-400 bg-rose-400/10 text-rose-200' :
                  reveal && isChosen && !isCorrect ? 'border-orange-400 bg-orange-400/10 text-orange-200' :
                  'border-zinc-800 hover:border-zinc-600 text-zinc-300'
                }`}>
                <span className="text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
                {reveal && isCorrect && <Check size={14} className="ml-auto shrink-0" />}
                {reveal && isChosen && !isCorrect && <X size={14} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
        {state && (
          <div className="mt-3 text-[13px] text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">{quiz.x}</div>
        )}
      </div>
    );
  };

  const Term = ({ children, name }) => {
    const key = name || (typeof children === 'string' ? children : null);
    return (
      <button onClick={() => key && setTermPopup(key)}
        className="border-b border-dotted border-rose-400/60 text-rose-200 hover:text-rose-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-rose-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* ─── Architecture diagram ─── */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap any node
        </div>
        <svg viewBox="0 0 400 370" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          {/* Lines */}
          <line x1="200" y1="42" x2="200" y2="134" stroke="#52525b" markerEnd="url(#arr)" />
          <line x1="75" y1="99" x2="155" y2="140" stroke="#52525b" markerEnd="url(#arr)" />
          <line x1="325" y1="99" x2="245" y2="140" stroke="#52525b" markerEnd="url(#arr)" />
          <line x1="200" y1="172" x2="200" y2="196" stroke="#52525b" markerEnd="url(#arr)" />
          <line x1="200" y1="228" x2="200" y2="244" stroke="#52525b" markerEnd="url(#arr)" />
          <line x1="140" y1="282" x2="100" y2="316" stroke="#52525b" markerEnd="url(#arr)" />
          <line x1="260" y1="282" x2="290" y2="316" stroke="#52525b" markerEnd="url(#arr)" />
          {/* Labels */}
          <text x="200" y="120" textAnchor="middle" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>REST · WS</text>
          {ARCH_NODES.map(n => {
            const isSel = archSelected === n.id;
            return (
              <g key={n.id} onClick={() => setArchSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={isSel ? n.color + '30' : n.color + '12'} stroke={n.color}
                  strokeWidth={isSel ? '2' : '1'} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle"
                  fill="#e4e4e7" fontSize={n.label.length > 16 ? '10' : '11'}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-rose-400/30 bg-rose-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-rose-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── Sandbox ─── */
  const Sandbox = () => {
    const [step, setStep] = useState(0);
    const NODE_W = 130, NODE_H = 44, GAP = 24;

    // Each step defines which nodes are visible on the mini-canvas
    const buildNodes = (stepIdx) => {
      const nodes = [];
      if (stepIdx >= 1) nodes.push({ id: 'schedule', label: 'Schedule', icon: Clock, color: '#fb7185' });
      if (stepIdx >= 3) nodes.push({ id: 'http', label: 'HTTP Request', icon: Globe, color: '#22d3ee' });
      if (stepIdx >= 4) nodes.push({ id: 'if', label: 'IF', icon: Filter, color: '#22d3ee' });
      if (stepIdx >= 5) nodes.push({ id: 'notify', label: 'Slack', icon: Bell, color: '#22d3ee' });
      return nodes;
    };
    const nodes = buildNodes(step);

    const steps = [
      {
        title: "Empty canvas",
        hint: "An empty workflow. Every workflow starts with a single trigger node. Click 'Add first step' to begin.",
        cta: { label: "+ Add first step", to: 1 },
      },
      {
        title: "Pick a trigger",
        hint: "Triggers are special nodes that start workflows. You can have only one active trigger per workflow. Pick Schedule.",
        cta: { label: "Schedule Trigger", to: 2 },
      },
      {
        title: "Configure schedule",
        hint: "Set how often it fires. Every 1 hour is a sensible default for most polling workflows.",
        cta: { label: "Set to every 1 hour →", to: 3 },
      },
      {
        title: "Add an action",
        hint: "Click the '+' after the Schedule node and pick HTTP Request — to call an external API.",
        cta: { label: "+ HTTP Request", to: 4 },
      },
      {
        title: "Branch with IF",
        hint: "After fetching, branch on a condition. Add an IF node — if response has new records, do something.",
        cta: { label: "+ IF (data.newCount > 0)", to: 5 },
      },
      {
        title: "Notify on TRUE",
        hint: "On the TRUE output of IF, add a Slack node to send a message. The FALSE branch just ends.",
        cta: { label: "+ Slack notification", to: 6 },
      },
      {
        title: "Execute",
        hint: "Click Execute Workflow. Watch each node light up green as data flows through. The IF branches; only TRUE downstream nodes run if condition matches.",
        cta: { label: "▶ Execute Workflow", to: 7 },
      },
      {
        title: "Recap",
        hint: "That's the rhythm: one trigger, a chain of actions, branching with IF. Same shape for 90% of real workflows you'll ever build.",
      },
    ];

    const cur = steps[step];

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            SANDBOX · {step + 1}/{steps.length} · {cur.title}
          </div>
          <button onClick={() => setStep(0)} className="text-[11px] text-zinc-500 hover:text-rose-300 flex items-center gap-1">
            <RotateCcw size={11} /> Reset
          </button>
        </div>
        <div className="p-3">
          <div className="text-[13px] text-zinc-400 italic mb-3 leading-relaxed">{cur.hint}</div>

          {/* Mock canvas */}
          <div className="relative bg-zinc-950 border border-zinc-800 h-52 overflow-hidden mb-3" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(63 63 70) 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}>
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-600 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                empty canvas
              </div>
            )}
            <div className="absolute inset-0 flex items-center px-4 gap-1 overflow-x-auto">
              {nodes.map((n, i) => {
                const Ic = n.icon;
                return (
                  <div key={n.id} className="flex items-center gap-1 shrink-0">
                    <div className="border-2 px-2 py-2 bg-zinc-900 flex flex-col items-center gap-1"
                      style={{ borderColor: n.color, width: NODE_W, height: NODE_H }}>
                      <Ic size={14} style={{ color: n.color }} />
                      <div className="text-[10px] text-zinc-200 truncate w-full text-center" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{n.label}</div>
                    </div>
                    {i < nodes.length - 1 && (
                      <div className="flex items-center" style={{ width: GAP }}>
                        <div className="h-px flex-1" style={{ background: '#52525b' }} />
                        <ArrowRight size={10} className="text-zinc-600" />
                      </div>
                    )}
                    {/* Execute animation */}
                    {step === 7 && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full animate-ping" />
                    )}
                  </div>
                );
              })}
              {/* The "+" hint for next step */}
              {cur.cta && step > 0 && step < 7 && nodes.length > 0 && (
                <div className="shrink-0 flex items-center gap-1 ml-1">
                  <div className="h-px w-4 bg-zinc-700" />
                  <div className="border border-dashed border-rose-400/60 px-2 py-1.5 text-rose-300 text-[10px] animate-pulse" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    + add
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA button */}
          {cur.cta && (
            <button onClick={() => setStep(cur.cta.to)}
              className="w-full border border-rose-400 bg-rose-400/10 text-rose-200 px-3 py-2 text-[12px] font-bold hover:bg-rose-400/20 transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {cur.cta.label}
            </button>
          )}

          {step === 7 && (
            <div className="border border-rose-400/40 bg-rose-400/5 p-3 text-[13px]">
              <div className="text-rose-300 text-[10px] uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⬢ what you built</div>
              <ol className="space-y-1 text-zinc-300 text-[12px] list-decimal pl-5">
                <li>A workflow that runs every hour</li>
                <li>Fetches data from an HTTP endpoint</li>
                <li>Branches on a condition with IF</li>
                <li>Sends a Slack notification only when condition is met</li>
              </ol>
              <div className="text-zinc-500 text-[12px] mt-2 italic">Same skeleton works for: scraping new leads, monitoring an API for changes, daily reports, RSS digests, anything polling.</div>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-800 px-3 py-2 flex items-center gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 ${i <= step ? 'bg-rose-400' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>
    );
  };

  /* ─── Troubleshooter ─── */
  const Troubleshooter = () => {
    const [path, setPath] = useState(['start']);
    const cur = TROUBLESHOOT[path[path.length - 1]];

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] text-orange-300 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Wrench size={12} /> DECISION TREE
          </div>
          {path.length > 1 && (
            <button onClick={() => setPath(['start'])} className="text-[11px] text-zinc-500 hover:text-orange-300 flex items-center gap-1">
              <RotateCcw size={11} /> Start over
            </button>
          )}
        </div>
        <div className="p-4">
          {path.length > 1 && (
            <div className="flex items-center gap-1 mb-3 text-[10px] text-zinc-600 flex-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {path.map((p, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight size={10} />}
                  <span className={i === path.length - 1 ? 'text-rose-300' : ''}>{p}</span>
                </span>
              ))}
            </div>
          )}
          {cur.q && (
            <>
              <div className="text-zinc-100 text-[15px] mb-3 font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {cur.q}
              </div>
              <div className="space-y-2">
                {cur.opts.map((opt, i) => (
                  <button key={i} onClick={() => setPath([...path, opt.next])}
                    className="w-full text-left border border-zinc-800 hover:border-orange-400 hover:bg-orange-400/5 px-3 py-2.5 text-[14px] text-zinc-200 transition-colors flex items-center justify-between group">
                    <span>{opt.label}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-orange-300" />
                  </button>
                ))}
              </div>
            </>
          )}
          {cur.fix && (
            <>
              <div className="border-l-2 border-rose-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-rose-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-rose-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              )}
              {cur.cmd && <Code id={`ts-${path[path.length - 1]}`}>{cur.cmd}</Code>}
            </>
          )}
          {path.length > 1 && (
            <button onClick={() => setPath(path.slice(0, -1))}
              className="mt-4 text-[12px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ─── Cheatsheet export ─── */
  const exportCheatsheet = () => {
    let md = "# n8n Atlas — Cheatsheet\n\n";
    md += "## Quick start (Docker Compose)\n```bash\ndocker compose up -d\n```\n\n";
    md += "## Daily Commands\n\n";
    COMMANDS.forEach(c => { md += `**${c.desc}**\n\`\`\`\n${c.cmd}\n\`\`\`\n\n`; });
    md += "## Critical env vars\n";
    md += "- `N8N_ENCRYPTION_KEY` — back this up SEPARATELY from your DB\n";
    md += "- `WEBHOOK_URL` — your public n8n URL; OAuth callbacks depend on it\n";
    md += "- `DB_TYPE=postgresdb` + `DB_POSTGRESDB_*` — Postgres prereq\n";
    md += "- `EXECUTIONS_MODE=queue` + `QUEUE_BULL_REDIS_HOST` — queue mode\n";
    md += "- `GENERIC_TIMEZONE=America/New_York` — affects Schedule Trigger\n\n";
    md += "## Expression cheatsheet\n";
    md += "- `{{ $json.field }}` — current item's field\n";
    md += "- `{{ $json.field?.nested }}` — safe access (returns undefined instead of erroring)\n";
    md += "- `{{ $node['Other Node'].json.id }}` — reach back to another node\n";
    md += "- `{{ $items('Loop').length }}` — array of items from another node\n";
    md += "- `{{ $now.format('yyyy-MM-dd') }}` — luxon DateTime helpers\n";
    md += "- `{{ $vars.MY_VAR }}` — workspace variable\n\n";
    md += "## Resources\n";
    LINKS.forEach(l => { md += `- **${l.name}** — ${l.url} · ${l.note}\n`; });
    md += "\n---\n_Generated by n8n Atlas_\n";

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'n8n-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };
  const copyAllCommands = () => {
    const all = COMMANDS.map(c => `# ${c.desc}\n${c.cmd}`).join('\n\n');
    copy(all, 'allcmds');
  };

  const allQuizzes = Object.values(QUIZZES).flat();
  const missed = allQuizzes.filter(q => quizState[q.qid] && !quizState[q.qid].correct);
  const totalAnswered = allQuizzes.filter(q => quizState[q.qid]).length;
  const totalCorrect = allQuizzes.filter(q => quizState[q.qid]?.correct).length;

  /* ─── Command Palette ─── */
  const CommandPalette = () => {
    const [q, setQ] = useState('');
    const items = [
      ...SECTIONS.map((s, i) => ({ kind: 'chapter', label: s.label, idx: i, hint: s.sub })),
      ...Object.keys(GLOSSARY).map(t => ({ kind: 'term', label: t, hint: GLOSSARY[t].slice(0, 80) + '…' })),
      ...COMMANDS.map(c => ({ kind: 'command', label: c.cmd, hint: c.desc, copy: c.cmd })),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 20);

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-rose-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-rose-300" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Chapters · terms · commands"
              className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-600 outline-none text-[14px]" />
            <kbd className="text-[10px] text-zinc-500 border border-zinc-700 px-1.5 py-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ESC</kbd>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {filtered.length === 0 && <div className="px-4 py-6 text-zinc-500 text-center text-[13px]">No results.</div>}
            {filtered.map((item, i) => (
              <button key={i}
                onClick={() => {
                  if (item.kind === 'chapter') { setActiveSection(item.idx); setCmdOpen(false); }
                  else if (item.kind === 'term') { setTermPopup(item.label); setCmdOpen(false); }
                  else if (item.kind === 'command') { copy(item.copy, 'cmd-' + i); }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900 flex items-start gap-3">
                <span className={`text-[9px] uppercase tracking-wider mt-1 shrink-0 w-16 ${
                  item.kind === 'chapter' ? 'text-rose-300' :
                  item.kind === 'term' ? 'text-cyan-300' : 'text-amber-300'
                }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {item.kind}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-100 text-[13px] truncate" style={{ fontFamily: item.kind === 'command' ? 'JetBrains Mono, monospace' : 'inherit' }}>
                    {item.label}
                  </div>
                  {item.hint && <div className="text-zinc-500 text-[11px] truncate mt-0.5">{item.hint}</div>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TermPopover = () => {
    if (!termPopup) return null;
    const def = GLOSSARY[termPopup];
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setTermPopup(null)}>
        <div className="max-w-md w-full bg-zinc-950 border border-rose-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
            <button onClick={() => setTermPopup(null)} className="text-zinc-500 hover:text-zinc-200"><X size={16} /></button>
          </div>
          <div className="text-zinc-100 text-[18px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{termPopup}</div>
          <div className="text-zinc-300 text-[14px] leading-relaxed">{def || 'No definition yet.'}</div>
        </div>
      </div>
    );
  };

  const Onboarding = () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-rose-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-rose-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⬢ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What do you build in n8n?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples and tips will adapt to your use case. Change this anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-rose-400 hover:bg-rose-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-rose-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
                <div className="flex-1">
                  <div className="text-zinc-100 text-[14px] font-medium">{s.label}</div>
                  <div className="text-zinc-500 text-[12px]">{s.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const stackData = stack && PERSONALIZED[stack];
  const stackLabel = STACKS.find(s => s.id === stack)?.label;

  /* ─── Sections ─── */
  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return (
          <>
            <H2 num="◇ DEF">What n8n actually is</H2>
            <P>
              <Term>Workflow</Term> automation, but with the lid off. Drag <Term name="Node">nodes</Term> onto a canvas,
              wire them together, and a chain of work executes when a <Term>Trigger</Term> fires — a webhook hit, a schedule, a form submission.
              It's Zapier you can host yourself, with no per-task pricing, full JavaScript escape hatch, and 400+ integrations.
            </P>
            <ArchDiagram />
            <H2 num="◇ WHEN">When n8n is the right call</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><Check size={16} className="text-rose-400 shrink-0 mt-0.5" /> High-volume runs that would cost a fortune on Zapier/Make task counts</li>
              <li className="flex gap-2"><Check size={16} className="text-rose-400 shrink-0 mt-0.5" /> Branching logic, loops, conditionals — flows Zapier struggles with</li>
              <li className="flex gap-2"><Check size={16} className="text-rose-400 shrink-0 mt-0.5" /> AI agents, RAG pipelines, anything LLM-heavy</li>
              <li className="flex gap-2"><Check size={16} className="text-rose-400 shrink-0 mt-0.5" /> You want the data to stay on your servers</li>
              <li className="flex gap-2"><Check size={16} className="text-rose-400 shrink-0 mt-0.5" /> Complex integrations that need a Code node escape valve</li>
            </ul>
            <H2 num="◇ WHEN-NOT">When to use something else</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> One-off scripts your team will run twice → just write Python</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> Sub-100ms response APIs → n8n adds overhead per node</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> Apache Airflow-scale data pipelines (hundreds of DAGs) → use Airflow</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> Non-technical users who can't read JSON → Zapier's UX is gentler</li>
            </ul>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ HOST">Where to run it</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'n8n Cloud', when: "Get going in 2 minutes. Managed. Per-execution + per-active-workflow pricing.", tag: 'easiest' },
                { name: 'Self-host via Coolify', when: "+ New Resource → Service → n8n. Postgres + Redis wired up. Best self-host path.", tag: 'recommended' },
                { name: 'Self-host via Docker', when: "Raw docker-compose. You own every env var. More setup, more control.", tag: 'classic' },
                { name: 'npm install -g n8n', when: "Dev only. SQLite by default. Don't run production here.", tag: 'dev' },
              ].map(h => (
                <div key={h.name} className="flex items-start gap-3 border border-zinc-800 px-3 py-2">
                  <Server size={14} className="text-zinc-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-100 font-medium">{h.name}</span>
                      <span className="text-[9px] uppercase tracking-wider text-rose-300/70 border border-rose-300/30 px-1.5 py-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.tag}</span>
                    </div>
                    <div className="text-zinc-400 text-[12px] mt-0.5">{h.when}</div>
                  </div>
                </div>
              ))}
            </div>
            <H2 num="◇ SIZE">Sizing without panic</H2>
            <div className="my-5 border border-cyan-400/30 bg-cyan-400/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Workload sizer
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[12px] text-zinc-300 mb-1">
                  <span>Active workflows</span>
                  <span className="text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sizer.workflows}</span>
                </div>
                <input type="range" min="1" max="100" value={sizer.workflows}
                  onChange={(e) => setSizer(prev => ({ ...prev, workflows: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-400" />
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[12px] text-zinc-300 mb-1">
                  <span>Daily executions</span>
                  <span className="text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sizer.dailyRuns}</span>
                </div>
                <input type="range" min="0" max="10000" step="100" value={sizer.dailyRuns}
                  onChange={(e) => setSizer(prev => ({ ...prev, dailyRuns: parseInt(e.target.value) }))}
                  className="w-full accent-cyan-400" />
              </div>
              <label className="flex items-center gap-2 text-[12px] text-zinc-300 mb-3 cursor-pointer">
                <input type="checkbox" checked={sizer.hasAi}
                  onChange={(e) => setSizer(prev => ({ ...prev, hasAi: e.target.checked }))}
                  className="accent-cyan-400" />
                Includes AI / agent workflows (embeddings, LLM calls)
              </label>
              {(() => {
                const ram = 1 + (sizer.workflows * 0.04) + (sizer.dailyRuns > 1000 ? 1.5 : 0) + (sizer.hasAi ? 1 : 0);
                const needsQueue = sizer.dailyRuns > 500 || sizer.workflows > 30;
                const needsPg = sizer.workflows > 5 || sizer.dailyRuns > 100;
                return (
                  <div className="pt-3 border-t border-cyan-400/20 space-y-2 text-[13px]">
                    <div className="text-zinc-200">
                      RAM target: <span className="text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>~{ram.toFixed(1)} GB</span>
                      <span className="text-zinc-500"> · pick </span>
                      <span className="text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{ram < 2 ? '2 GB' : ram < 4 ? '4 GB' : ram < 8 ? '8 GB' : '16 GB'}</span>
                    </div>
                    <div className="text-zinc-200">
                      Postgres: <span className={needsPg ? 'text-rose-300' : 'text-zinc-500'} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{needsPg ? 'required' : 'optional (SQLite fine)'}</span>
                    </div>
                    <div className="text-zinc-200">
                      Queue mode: <span className={needsQueue ? 'text-rose-300' : 'text-zinc-500'} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{needsQueue ? 'recommended' : 'optional'}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <H2 num="◇ DOCKER">The 5-line Compose</H2>
            <P>Bare-bones Docker setup for self-host. Use Coolify's service template if you want this without typing.</P>
            <Code id="docker-compose" lang="docker-compose.yml">{`services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    ports: ["5678:5678"]
    environment:
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.yourdomain.com
      - GENERIC_TIMEZONE=America/New_York
      - N8N_ENCRYPTION_KEY=\${N8N_ENCRYPTION_KEY}
    volumes:
      - ./n8n_data:/home/node/.n8n`}</Code>
            <Callout kind="warn" title="ENCRYPTION KEY">
              Generate a strong <Kbd>N8N_ENCRYPTION_KEY</Kbd> with <Kbd>openssl rand -hex 32</Kbd>.
              Back it up SEPARATELY from your DB backups. Lose it → every stored credential becomes garbage.
            </Callout>
            <H2 num="◇ CHECK">Before you switch to production</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="prep1">Postgres (not SQLite) as the database</CheckItem>
              <CheckItem id="prep2"><Term name="N8N_ENCRYPTION_KEY">N8N_ENCRYPTION_KEY</Term> set, backed up off-server</CheckItem>
              <CheckItem id="prep3"><Term>Webhook</Term> URL points to your real public domain</CheckItem>
              <CheckItem id="prep4">GENERIC_TIMEZONE set so schedules don't fire 5 hours late</CheckItem>
              <CheckItem id="prep5">User management enabled (don't share a login)</CheckItem>
              <CheckItem id="prep6">Backups: Postgres + workflow JSON exports on a schedule</CheckItem>
            </div>
            {QUIZZES.foundation.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ MAP">The six surfaces</H2>
            <P>n8n's UI looks busy. It's really six things.</P>
            <div className="space-y-2 my-4">
              {[
                { icon: GitBranch, name: 'Workflows', desc: 'List of every workflow. Filter by tag, status, active/inactive.', color: 'rose' },
                { icon: Activity, name: 'Executions', desc: 'Run history per workflow. Click any run to see exact input/output per node. Where you debug.', color: 'cyan' },
                { icon: KeyRound, name: 'Credentials', desc: 'Centralized auth. Set up Google/Slack/Stripe creds once, reuse across all workflows.', color: 'rose' },
                { icon: FileCode, name: 'Variables', desc: 'Key-value pairs available across all workflows via {{ $vars.MY_VAR }}. Good for env-y config.', color: 'cyan' },
                { icon: Layers, name: 'Projects', desc: 'Team isolation. Each project has its own workflows, credentials, members.', color: 'rose' },
                { icon: Boxes, name: 'Templates', desc: '1500+ public starter workflows on n8n.io/workflows — fork as scaffolding.', color: 'cyan' },
              ].map(item => (
                <div key={item.name} className="flex gap-3 border border-zinc-800 p-3">
                  <div className={`shrink-0 w-8 h-8 border flex items-center justify-center ${item.color === 'rose' ? 'border-rose-400/40 text-rose-300' : 'border-cyan-400/40 text-cyan-300'}`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <div className="text-zinc-100 font-medium text-[14px]">{item.name}</div>
                    <div className="text-zinc-400 text-[13px] leading-snug mt-0.5">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <H2 num="◇ EDITOR">Editor anatomy</H2>
            <P>Drag from the right-side panel onto the canvas. Connect by dragging the dot on one node to the next. Click a node to configure it in the side panel.</P>
            <Callout kind="tip" title="KEYBOARD">
              <Kbd>Cmd-S</Kbd> save · <Kbd>Cmd-Z</Kbd> undo · <Kbd>Tab</Kbd> open nodes panel · <Kbd>Enter</Kbd> execute selected node ·{' '}
              <Kbd>D</Kbd> deactivate node (skip on run, still visible) · <Kbd>P</Kbd> pin/unpin
            </Callout>
            <H2 num="◇ EXECUTIONS">Executions are your microscope</H2>
            <P>
              Every run lands in the Executions tab. Open one, click any node — you see the exact input it received, the exact output it produced, and how long it took.
              99% of n8n debugging is reading these panels carefully. Use the Executions tab before Googling.
            </P>
            <H2 num="◇ SECRETS">Credentials vs Variables vs Static Data</H2>
            <div className="grid gap-2 text-[13px] my-3">
              <div className="border border-rose-400/30 bg-rose-400/5 p-3">
                <div className="text-rose-300 text-[11px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Credentials</div>
                <div className="text-zinc-300">Auth (API keys, OAuth, basic auth, SSH). Encrypted with N8N_ENCRYPTION_KEY. Reused across workflows by reference.</div>
              </div>
              <div className="border border-cyan-400/30 bg-cyan-400/5 p-3">
                <div className="text-cyan-300 text-[11px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Variables</div>
                <div className="text-zinc-300">Workspace-wide key/value config. NOT secret. Accessed with <Kbd>{'{{ $vars.NAME }}'}</Kbd>. Good for environment toggles, URLs, defaults.</div>
              </div>
              <div className="border border-zinc-700 bg-zinc-800/40 p-3">
                <div className="text-zinc-300 text-[11px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Static data</div>
                <div className="text-zinc-300">Per-workflow persistent state. Survives across executions. Used for cursors ("last-seen ID"), counters, anything stateful between runs.</div>
              </div>
            </div>
            {QUIZZES.cockpit.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ FIRST">Workflow from blank canvas</H2>
            <P>The path you'll walk a hundred times. Internalize it once.</P>
            {stackData?.spark && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            <div className="my-4 border border-zinc-800">
              {[
                { step: '01', title: 'New workflow', detail: 'Workflows tab → + Add Workflow. You get an empty canvas with a pulsing "Add first step" button.' },
                { step: '02', title: 'Pick a trigger', detail: 'Click + Add first step. Pick Manual Trigger for now — easiest to test with.' },
                { step: '03', title: 'Add an action', detail: "Click the '+' to the right of the trigger. Search 'HTTP Request'. Set Method GET, URL https://api.github.com/users/torvalds." },
                { step: '04', title: 'Execute', detail: 'Click Execute Workflow (bottom-left or top-right). Each node lights up green as it succeeds.' },
                { step: '05', title: 'Read the output', detail: "Click the HTTP node. The right panel shows the response. This is THE debug surface — get comfortable here." },
                { step: '06', title: 'Add a Set node', detail: "Add Set/Edit Fields. Add a string field 'name' with expression {{ $json.name }}. Execute again. Now you have a filtered shape." },
                { step: '07', title: 'Save + activate', detail: 'Cmd-S saves. To run live (on schedule, on webhook), swap the Manual Trigger for the right one AND flip the workflow Active.' },
              ].map((s, i) => (
                <div key={s.step} className={`flex gap-3 p-3 ${i !== 6 ? 'border-b border-zinc-800' : ''}`}>
                  <div className="text-rose-400 text-[12px] shrink-0 w-8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.step}</div>
                  <div>
                    <div className="text-zinc-100 text-[14px] font-medium">{s.title}</div>
                    <div className="text-zinc-400 text-[13px] leading-snug mt-0.5">{s.detail}</div>
                  </div>
                </div>
              ))}
            </div>
            <Callout kind="warn" title="THE #1 FORGOTTEN STEP">
              You finished your workflow, replaced Manual with Schedule, you wait an hour — nothing.
              You forgot the Active toggle (top right). Schedule Triggers only fire on Active workflows.
            </Callout>
            <H2 num="◇ PIN">Pin data while developing</H2>
            <P>
              Right-click any node → <Term name="Pin data">Pin Data</Term>. Now the next manual run uses that frozen output instead of re-fetching.
              Saves API calls + makes development deterministic. Unpin (or it'll keep using stale data and confuse future you).
            </P>
            {QUIZZES.spark.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ TRIGGERS">The starting nodes</H2>
            <P>Every workflow needs exactly one active trigger. Pick by how it should fire.</P>
            {stackData?.triggers && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.triggers}</Callout>}
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Manual Trigger', icon: Play, use: 'Development only. Click Execute to run. Never fires automatically.' },
                { name: 'Webhook', icon: Webhook, use: 'External service POSTs to your URL → workflow runs. Forms, app integrations, third-party events.' },
                { name: 'Schedule Trigger', icon: Clock, use: 'Cron syntax or simple intervals. Polling APIs, daily reports, periodic checks.' },
                { name: 'Form Trigger', icon: FileCode, use: 'Hosted form URL — no separate frontend needed. Internal tools, lead capture.' },
                { name: 'Chat Trigger', icon: Bot, use: 'Built-in chat UI for AI agents. Public URL optional. The gateway to AI workflows.' },
                { name: 'IMAP Email', icon: Mail, use: 'Polls an inbox, fires per new email. Reply parsing, support routing.' },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 p-3 flex gap-3">
                  <t.icon size={16} className="text-rose-300 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-zinc-100 text-[13px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                    <div className="text-zinc-400 text-[12px] mt-0.5">{t.use}</div>
                  </div>
                </div>
              ))}
            </div>
            <H2 num="◇ CORE">Workhorse nodes (90% of your time)</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'HTTP Request', use: 'Most-used node. Talk to any API. Methods, headers, auth, retries, pagination — all here.' },
                { name: 'Set / Edit Fields', use: "Reshape data. Build new fields, rename existing ones, set defaults. Reach for this before Code." },
                { name: 'IF', use: 'Two-branch conditional. TRUE output, FALSE output. Stack multiple IFs for nested logic.' },
                { name: 'Switch', use: 'Multi-branch routing. Up to 4+ outputs based on a value. Cleaner than chained IFs.' },
                { name: 'Code', use: 'JavaScript escape hatch. Run any JS on the items. Use $input.all() to get all items.' },
                { name: 'Merge', use: 'Combine outputs from two branches. Modes: append, concat, mergeByPosition, mergeByKey.' },
                { name: 'Loop Over Items', use: 'Iterate with explicit batch size + delays. Better than implicit per-item execution for slow APIs.' },
                { name: 'Wait', use: 'Pause the workflow — for a duration, until a date, or until a webhook hits. Powerful for approvals.' },
                { name: 'Aggregate', use: 'Combine many items into one. Useful before HTTP if you want one batch call instead of N.' },
                { name: 'Split Out', use: "Opposite of Aggregate. Take an array field and fan it out into one item per element." },
                { name: 'Execute Workflow', use: 'Run a sub-workflow inline. Pass items in, get items out. Reusable building blocks.' },
                { name: 'Filter', use: 'Drop items that fail a condition. Keeps the rest flowing.' },
              ].map(n => (
                <div key={n.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-rose-200 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{n.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{n.use}</div>
                </div>
              ))}
            </div>
            <Callout kind="tip" title="HTTP REQUEST IS KING">
              HTTP Request is the most important node in n8n. Most "is there an integration for X?" answers are: yes, with HTTP Request and the docs.
              Get fluent here and any service becomes integratable.
            </Callout>
            {QUIZZES.nodes.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ MODEL">The item array</H2>
            <P>
              n8n's data model trips up everyone at first. Once it clicks, everything makes sense.
              An <Term>Item</Term> is a JSON object. A node sends and receives <span className="text-rose-300">arrays of items</span>.
              If a node before you outputs 5 items, your node runs 5 times (once per item) by default.
            </P>
            <div className="my-4 border border-zinc-800 bg-zinc-950 p-4 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <div className="text-zinc-500 mb-2">// What a node receives</div>
              <pre className="text-zinc-200">{`[
  { "json": { "id": 1, "name": "Alice" } },
  { "json": { "id": 2, "name": "Bob"   } },
  { "json": { "id": 3, "name": "Cleo"  } }
]`}</pre>
              <div className="text-zinc-500 mt-3 mb-2">// Inside a node, $json refers to the current item</div>
              <pre className="text-zinc-200">{`{{ $json.name }}   →   runs 3 times, returns "Alice", "Bob", "Cleo"`}</pre>
            </div>
            <H2 num="◇ EXPR"><Term>Expressions</Term></H2>
            <P>Any field can be an expression. Click the gear → Expression. Wrap JS in <Kbd>{'{{ }}'}</Kbd>.</P>
            <div className="grid gap-2 my-3 text-[12px]">
              {[
                { e: '{{ $json.email }}', d: "Current item's email field." },
                { e: '{{ $json.user?.email }}', d: 'Safe access — returns undefined instead of erroring if user is null.' },
                { e: "{{ $node['HTTP Request'].json.id }}", d: "First item from a node by name (case-sensitive)." },
                { e: "{{ $items('Loop').length }}", d: 'Total item count from another node.' },
                { e: '{{ $now.format("yyyy-MM-dd") }}', d: 'Luxon DateTime — n8n bakes Luxon into expressions.' },
                { e: '{{ $vars.MY_VAR }}', d: 'Workspace variable.' },
                { e: '{{ $execution.id }}', d: "The current execution ID. Useful for logging." },
                { e: '{{ $workflow.name }}', d: 'Name of the running workflow.' },
              ].map((row, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2">
                  <code className="text-rose-300 text-[12px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.e}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{row.d}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ PATTERNS">Common moves</H2>
            <ul className="space-y-3 text-[14px] text-zinc-300 my-3">
              <li>
                <span className="text-rose-300 font-medium">Fan out:</span> one item with an array field → many items.
                Use <Kbd>Split Out</Kbd>, point at the array path.
              </li>
              <li>
                <span className="text-rose-300 font-medium">Fan in:</span> many items → one with an array.
                Use <Kbd>Aggregate</Kbd>.
              </li>
              <li>
                <span className="text-rose-300 font-medium">Filter:</span> drop items that fail a check.
                Use <Kbd>Filter</Kbd> node or IF + ignore the FALSE branch.
              </li>
              <li>
                <span className="text-rose-300 font-medium">Enrich:</span> add a field from a separate lookup.
                <Kbd>HTTP Request</Kbd> per item, or one batch call + <Kbd>Merge</Kbd> by key.
              </li>
              <li>
                <span className="text-rose-300 font-medium">Accumulate:</span> stateful counters across runs.
                Use <Term name="Static data">static workflow data</Term> via the Code node.
              </li>
            </ul>
            <H2 num="◇ CODE">When to drop to Code</H2>
            <P>Set/Edit Fields handles most reshape. Reach for <Term>Node</Term> Code when you need loops, complex string ops, regex, conditional logic too gnarly for IF.</P>
            <Code id="code-example" lang="javascript">{`// In a Code node, "Run Once for All Items" mode
const items = $input.all();
return items.map(item => ({
  json: {
    full_name: \`\${item.json.firstName} \${item.json.lastName}\`,
    is_business: item.json.email?.endsWith('.com') ?? false,
  }
}));`}</Code>
            {QUIZZES.stream.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ WHAT">Agents in one paragraph</H2>
            <P>
              An <Term>Agent</Term> is an AI node that doesn't follow a fixed sequence. You give it a goal + a set of <Term>Tools</Term>{' '}
              (other nodes, sub-workflows, HTTP requests). It loops: think → call a tool → see the result → decide what to do next.
              Stops when it thinks the goal is met or runs out of iterations.
            </P>
            <H2 num="◇ PARTS">Anatomy of an agent workflow</H2>
            <div className="my-4 border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-[11px] text-zinc-500 mb-3 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Chat Trigger → AI Agent → reply
              </div>
              <div className="space-y-2 text-[13px]">
                <div className="flex items-center gap-2"><Bot size={14} className="text-rose-300" /> <span className="text-zinc-200">AI Agent</span> <span className="text-zinc-500">— the orchestrator</span></div>
                <div className="pl-6 flex items-center gap-2"><Brain size={12} className="text-cyan-300" /> <span className="text-zinc-300">Chat Model</span> <span className="text-zinc-500">— OpenAI, Anthropic, Google, Ollama, etc.</span></div>
                <div className="pl-6 flex items-center gap-2"><Database size={12} className="text-cyan-300" /> <span className="text-zinc-300">Memory</span> <span className="text-zinc-500">— Window Buffer / Postgres Chat / Redis</span></div>
                <div className="pl-6 flex items-center gap-2"><Layers size={12} className="text-cyan-300" /> <span className="text-zinc-300">Tools</span> <span className="text-zinc-500">— other nodes the agent can call</span></div>
              </div>
            </div>
            {stackData && stack === 'ai' && (
              <Callout kind="you" title="FOR YOUR STACK · AI">
                Start with Window Buffer Memory (in-memory). Switch to Postgres Chat Memory once you need persistence across server restarts.
                Cache embeddings — they're the slow + expensive step in RAG.
              </Callout>
            )}
            <H2 num="◇ TOOLS">Wiring tools to an agent</H2>
            <P>
              Below the Agent node, you'll see a Tool socket. Anything you wire there becomes a callable tool.
              The Agent decides when to call it based on its description (be explicit in tool names + descriptions).
            </P>
            <ul className="space-y-2 text-[14px] text-zinc-300 my-3">
              <li className="flex gap-2"><Check size={14} className="text-rose-400 shrink-0 mt-1" /> <span><Kbd>HTTP Request Tool</Kbd> — agent makes any API call you describe</span></li>
              <li className="flex gap-2"><Check size={14} className="text-rose-400 shrink-0 mt-1" /> <span><Kbd>Code Tool</Kbd> — JavaScript the agent can execute (sandboxed)</span></li>
              <li className="flex gap-2"><Check size={14} className="text-rose-400 shrink-0 mt-1" /> <span><Kbd>Workflow Tool</Kbd> — your other workflows as tools (recursive power)</span></li>
              <li className="flex gap-2"><Check size={14} className="text-rose-400 shrink-0 mt-1" /> <span><Kbd>Vector Store Tool</Kbd> — query a vector DB for RAG retrieval</span></li>
            </ul>
            <H2 num="◇ RAG">RAG without the hype</H2>
            <P>Retrieval-Augmented Generation = give the LLM relevant context at query time so it doesn't hallucinate.</P>
            <div className="my-4 border border-cyan-400/30 bg-cyan-400/5 p-3 text-[13px]">
              <div className="text-cyan-300 text-[10px] uppercase tracking-[0.25em] mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Two-phase pipeline</div>
              <div className="text-zinc-300 mb-2"><span className="text-rose-300">Index time</span> (one-off or scheduled):</div>
              <div className="text-zinc-400 text-[12px] ml-3 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Document Load → Text Splitter → Embeddings → Vector Store
              </div>
              <div className="text-zinc-300 mb-2"><span className="text-rose-300">Query time</span> (every chat message):</div>
              <div className="text-zinc-400 text-[12px] ml-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                User question → Embed → Vector Store retrieve → Stuff into LLM prompt
              </div>
            </div>
            <H2 num="◇ STORES">Vector stores in n8n</H2>
            <div className="grid grid-cols-2 gap-2 my-3 text-[12px]">
              {[
                { name: 'In-Memory', note: 'Dev only. Lost on restart.' },
                { name: 'Pinecone', note: 'Managed. Easy. Paid.' },
                { name: 'Supabase pgvector', note: "If you're already on Supabase." },
                { name: 'Qdrant', note: 'Self-host friendly. Fast.' },
                { name: 'Postgres pgvector', note: 'BYO Postgres + extension.' },
                { name: 'Chroma', note: 'Lightweight self-host.' },
              ].map(v => (
                <div key={v.name} className="border border-zinc-800 px-2 py-1.5">
                  <div className="text-zinc-200 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.name}</div>
                  <div className="text-zinc-500 text-[11px]">{v.note}</div>
                </div>
              ))}
            </div>
            {QUIZZES.agents.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ QUEUE">Queue mode, properly</H2>
            <P>
              Default mode: main process does everything. Fine for solo dev or low volume.
              Queue mode: main pushes execution jobs to Redis, separate workers pull and execute.
              Required at scale, mandatory for parallel webhooks, and gives you zero-downtime restarts.
            </P>
            {stackData?.production && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.production}</Callout>}
            <Code id="queue-env" lang=".env">{`# Switch to queue mode
EXECUTIONS_MODE=queue

# Redis the workers will talk to
QUEUE_BULL_REDIS_HOST=redis
QUEUE_BULL_REDIS_PORT=6379

# Postgres (queue mode requires it)
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=...

# Same key everywhere — main AND workers
N8N_ENCRYPTION_KEY=...`}</Code>
            <Callout kind="warn" title="WORKERS NEED THE SAME KEY">
              Every worker process must have <Term name="N8N_ENCRYPTION_KEY">the same N8N_ENCRYPTION_KEY</Term> as main.
              Otherwise workers can't decrypt credentials and every execution fails.
            </Callout>
            <H2 num="◇ ERR">Error workflows</H2>
            <P>
              Every active workflow should have an Error Workflow assigned (Settings → Error Workflow).
              When a run fails, n8n executes the error workflow with details about the failure as input.
              That's how you find out before your customers do.
            </P>
            <Code id="err-payload" lang="error workflow input">{`{
  "execution": { "id": "abc123", "url": "https://n8n.../executions/abc123" },
  "workflow": { "id": "wf-1", "name": "Lead enrichment" },
  "error": {
    "message": "Request failed with status 429",
    "stack": "...",
    "node": "OpenAI Embedding"
  }
}`}</Code>
            <P>
              Typical error workflow: receive the input → Slack message with link → Discord ping if critical → maybe write to a Notion log.
              Build it once, set it as the error workflow on every active production workflow.
            </P>
            <H2 num="◇ BACK">Backups, layered</H2>
            <div className="my-3 border border-zinc-800">
              {[
                { what: "Postgres dump (daily)", how: 'pg_dump → S3-compatible bucket. Source of truth for workflows, executions, credentials.' },
                { what: "Workflow JSON export (weekly)", how: "n8n export:workflow --all --output=./backup.json → commit to a private git repo. Audit-friendly diff history." },
                { what: "Encryption key (one time, off-server)", how: 'Password manager + 1 paper copy in a safe. Not in the same place as your DB backup.' },
                { what: "Vector store (depends)", how: 'Managed: provider handles it. Self-host: dump alongside Postgres.' },
              ].map((b, i) => (
                <div key={i} className={`p-3 ${i !== 3 ? 'border-b border-zinc-800' : ''}`}>
                  <div className="text-zinc-100 text-[14px] font-medium">{b.what}</div>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{b.how}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ HARD">Hardening checklist</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="h1">User management enabled — no shared logins</CheckItem>
              <CheckItem id="h2">2FA enabled on every admin account</CheckItem>
              <CheckItem id="h3">N8N_ENCRYPTION_KEY backed up SEPARATELY from DB</CheckItem>
              <CheckItem id="h4">Error workflow set on every active workflow</CheckItem>
              <CheckItem id="h5">Postgres + workflow JSON backups on a schedule</CheckItem>
              <CheckItem id="h6">EXECUTIONS_DATA_PRUNE=true with sane MAX_AGE (don't fill the disk)</CheckItem>
              <CheckItem id="h7">Discord/Slack notifications wired up for failures</CheckItem>
              <CheckItem id="h8">Tested restore-from-backup at least once (untested backups are wishes)</CheckItem>
            </div>
            <H2 num="◇ TAG">Organize as you grow</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300 my-3">
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Tag workflows aggressively (prod, dev, client-x, broken, ai). Past 30 workflows, untagged = unfindable.</span></li>
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Move client work into separate Projects. Credentials don't leak across.</span></li>
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Sub-workflows beat copy-paste. If three workflows do the same date-parsing, that's a sub-workflow.</span></li>
              <li className="flex gap-2"><AlertTriangle size={14} className="text-orange-400 shrink-0 mt-1" /><span>Naming: <span style={{ fontFamily: 'JetBrains Mono, monospace' }} className="text-rose-300">[client] action verb</span>. e.g. "[FlowFirst] enrich-lead". Search-friendly.</span></li>
            </ul>
            {QUIZZES.production.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ BUILD">Click your way through it</H2>
            <P>
              You've read the theory. Now build a workflow. This sandbox walks the rhythm of putting nodes on a canvas, connecting them,
              and executing — the exact loop you'll repeat for every workflow you ever build.
            </P>
            <Sandbox />
            <Callout kind="tip" title="WHY THIS SHAPE">
              The real n8n canvas has more chrome — drag handles, configuration panels opening to the right, a node search dialog.
              But <span className="text-zinc-100">the rhythm is identical</span>: trigger first, chain actions after, branch when you need, execute, read the output.
              Once that's natural, you'll build real workflows in minutes.
            </Callout>
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ TRIAGE">When things break</H2>
            <P>Walk the tree. Tap the symptom closest to what you're seeing. Leaf nodes have the fix.</P>
            <Troubleshooter />
            <Callout kind="info" title="BOOKMARK THIS">
              Most n8n problems fit one of these patterns. Coming back here beats searching vague error messages at 11pm.
              <Kbd>⌘K</Kbd> jumps here from anywhere.
            </Callout>
          </>
        );

      case 10: {
        const totalQuizzes = allQuizzes.length;
        return (
          <>
            <H2 num="◇ SCORE">How you did</H2>
            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="border border-rose-400/40 bg-rose-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Correct</div>
                <div className="text-3xl text-rose-200 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{totalCorrect}</div>
              </div>
              <div className="border border-orange-400/40 bg-orange-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-orange-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Missed</div>
                <div className="text-3xl text-orange-200 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{missed.length}</div>
              </div>
              <div className="border border-zinc-800 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Total</div>
                <div className="text-3xl text-zinc-300 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{totalAnswered}/{totalQuizzes}</div>
              </div>
            </div>
            {missed.length > 0 && (
              <>
                <button onClick={() => setReviewMode(r => !r)}
                  className="w-full border border-cyan-400/50 bg-cyan-400/5 text-cyan-200 px-3 py-2 text-[13px] mb-2 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <RotateCcw size={13} /> {reviewMode ? 'Hide' : 'Review'} missed questions ({missed.length})
                </button>
                {reviewMode && (
                  <div className="mb-4">
                    {missed.map(q => (
                      <div key={q.qid} className="border border-cyan-400/30 bg-cyan-400/5 p-3 mb-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>RETRY · {q.qid}</div>
                        <button onClick={() => setQuizState(prev => { const n = { ...prev }; delete n[q.qid]; return n; })}
                          className="text-[11px] text-cyan-300 hover:text-cyan-100 underline">
                          Clear and try this one again
                        </button>
                        <Quiz quiz={q} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="grid grid-cols-2 gap-2 my-3">
              <button onClick={exportCheatsheet}
                className="flex items-center justify-center gap-2 border border-rose-400/40 bg-rose-400/5 hover:bg-rose-400/10 text-rose-200 px-3 py-2.5 text-[13px] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Download size={14} /> Download .md
              </button>
              <button onClick={copyAllCommands}
                className="flex items-center justify-center gap-2 border border-cyan-400/40 bg-cyan-400/5 hover:bg-cyan-400/10 text-cyan-200 px-3 py-2.5 text-[13px] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'Copied' : 'Copy all commands'}
              </button>
            </div>

            <H2 num="◇ EXPR">Expression quick reference</H2>
            <div className="space-y-1.5 my-3 text-[12px]">
              {[
                { e: '{{ $json.field }}', d: "Current item's field" },
                { e: '{{ $json.field?.nested }}', d: 'Safe nested access' },
                { e: "{{ $node['Name'].json.x }}", d: 'Reach back to another node' },
                { e: '{{ $items().length }}', d: 'Items count' },
                { e: '{{ $now }}', d: 'Luxon DateTime — try .format(), .plus(), etc.' },
                { e: '{{ $vars.MY_VAR }}', d: 'Workspace variable' },
                { e: '{{ $execution.id }}', d: 'Current execution ID' },
                { e: '{{ $workflow.name }}', d: 'Current workflow name' },
                { e: '{{ $env.MY_ENV }}', d: 'OS env var (allowed list only)' },
                { e: '{{ JSON.stringify($json) }}', d: 'Stringify current item' },
              ].map((r, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-1.5 flex items-center justify-between gap-2">
                  <code className="text-rose-300 text-[11px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.e}</code>
                  <span className="text-zinc-500 text-[11px] shrink-0 text-right">{r.d}</span>
                </div>
              ))}
            </div>

            <H2 num="◇ CMD">Command cheatsheet</H2>
            <div className="space-y-2 my-3 text-[13px]">
              {COMMANDS.map((r, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 group">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-rose-300 text-[12px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.cmd}</code>
                    <button onClick={() => copy(r.cmd, `c${i}`)} className="text-zinc-600 hover:text-rose-300 shrink-0">
                      {copied === `c${i}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.desc}</div>
                </div>
              ))}
            </div>

            <H2 num="◇ LINKS">Where to go next</H2>
            <div className="space-y-2 my-3 text-[13px]">
              {LINKS.map(l => (
                <div key={l.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Sparkles size={12} className="text-cyan-300" />
                    <span className="text-zinc-100">{l.name}</span>
                    <span className="text-zinc-500 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.url}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{l.note}</div>
                </div>
              ))}
            </div>

            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}

            <div className="my-6 border border-rose-400/40 bg-rose-400/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-rose-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ⬢ Atlas complete
              </div>
              <div className="text-zinc-200 text-[14px]">
                You know enough to ship real workflows, scale to queue mode, and debug at 11pm.
                The rest is reps. Go automate something.
              </div>
            </div>

            <button onClick={() => { if (confirm('Reset all progress, checklists, and quiz answers?')) resetAll(); }}
              className="w-full text-[11px] text-zinc-600 hover:text-orange-300 py-2 transition-colors flex items-center justify-center gap-1">
              <RotateCcw size={11} /> Reset all progress
            </button>
          </>
        );
      }

      default:
        return null;
    }
  };

  const cur = SECTIONS[activeSection];
  const Icon = cur.icon;
  const progress = Math.round((completed.size / SECTIONS.length) * 100);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-rose-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ⬢ LOADING ATLAS
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.12]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, rgb(63 63 70) 1px, transparent 0)`,
        backgroundSize: '24px 24px',
      }} />

      {showOnboarding && <Onboarding />}
      {cmdOpen && <CommandPalette />}
      <TermPopover />

      <div className="relative">
        <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-20">
          <div className="px-4 py-3 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-[14px] text-rose-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⬢</span>
                <h1 className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  n8n <span className="text-rose-400">ATLAS</span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {stack && (
                  <button onClick={() => setShowOnboarding(true)}
                    className="text-[10px] tracking-[0.2em] text-zinc-500 hover:text-rose-300 border border-zinc-800 hover:border-rose-400/40 px-2 py-1 transition-colors uppercase"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {STACKS.find(s => s.id === stack)?.icon} {stack}
                  </button>
                )}
                <button onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-1 text-[10px] tracking-[0.2em] text-zinc-500 hover:text-rose-300 border border-zinc-800 hover:border-rose-400/40 px-2 py-1 transition-colors"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <Search size={11} /> ⌘K
                </button>
                <span className="text-[10px] tracking-[0.25em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {progress}%
                </span>
              </div>
            </div>
            <div className="h-0.5 bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </header>

        <nav className="border-b border-zinc-800 bg-zinc-950/60 sticky top-[60px] z-10 overflow-x-auto">
          <div className="flex max-w-4xl mx-auto">
            {SECTIONS.map((s, i) => {
              const Ic = s.icon;
              const active = activeSection === i;
              const done = completed.has(i);
              return (
                <button key={s.id} onClick={() => setActiveSection(i)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-[12px] border-b-2 whitespace-nowrap transition-all shrink-0 ${
                    active ? 'border-rose-400 text-rose-200 bg-rose-400/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="text-[10px] text-zinc-500">{s.num}</span>
                  <Ic size={13} />
                  <span>{s.label}</span>
                  {done && <Check size={11} className="text-rose-400" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 border border-rose-400/50 bg-rose-400/5 flex items-center justify-center">
              <Icon size={18} className="text-rose-300" />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                CHAPTER {cur.num}
              </div>
              <h2 className="text-[26px] font-bold leading-none tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {cur.label}
              </h2>
            </div>
          </div>
          <div className="text-[13px] text-zinc-500 italic mb-4 mt-2 border-l-2 border-zinc-800 pl-3">
            {cur.sub}
          </div>
        </div>

        <main className="max-w-4xl mx-auto px-4 pb-32">
          {renderSection()}
        </main>

        <footer className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur z-20">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
            <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0}
              className="flex items-center gap-1.5 px-3 py-2 border border-zinc-800 text-zinc-300 text-[12px] hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <ChevronLeft size={14} /> Prev
            </button>
            <button onClick={() => markComplete(activeSection)}
              className={`flex-1 px-3 py-2 border text-[12px] transition-colors ${
                completed.has(activeSection) ? 'border-rose-400 bg-rose-400/10 text-rose-300'
                : 'border-cyan-400/50 bg-cyan-400/5 text-cyan-200 hover:bg-cyan-400/10'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {completed.has(activeSection) ? '✓ Chapter complete' : 'Mark chapter complete'}
            </button>
            <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 border border-zinc-800 text-zinc-300 text-[12px] hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              Next <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
