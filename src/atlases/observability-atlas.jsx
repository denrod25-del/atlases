import { useState, useEffect, useRef } from 'react';
import {
  Compass, Activity, BarChart3, GitBranch, Eye, Wrench, BookOpen, Check,
  ChevronRight, ChevronLeft, Copy, X, Search, RotateCcw, Play, Pause, ArrowLeft,
  Quote, MousePointerClick, Loader2, Library, AlertTriangle, XCircle, Bell,
  Gauge, ScrollText, Layers, Zap, Target
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   OBSERVABILITY ATLAS · DATA
   Tier: NASA-light (educational frontend, production-deployed)
   Invariants: bounded loops, validated inputs, no silent catches,
   short functions, smallest scope.
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Monitoring to observability. The three pillars. OpenTelemetry CNCF graduation, May 2026." },
  { id: 'pillars', label: 'Pillars', icon: Layers, num: '02', sub: "Logs, metrics, traces — and the fourth pillar: continuous profiling." },
  { id: 'logs', label: 'Logs', icon: ScrollText, num: '03', sub: "Structured logging, correlation IDs, levels, what to log and what never to log." },
  { id: 'metrics', label: 'Metrics', icon: Gauge, num: '04', sub: "Counter, gauge, histogram, summary. RED and USE methods. Prometheus model." },
  { id: 'traces', label: 'Traces', icon: GitBranch, num: '05', sub: "Distributed tracing, spans, context propagation, sampling strategies." },
  { id: 'otel', label: 'OpenTelemetry', icon: Eye, num: '06', sub: "The unified standard. SDKs, Collector, OTLP, semantic conventions." },
  { id: 'slo', label: 'SLOs', icon: Target, num: '07', sub: "SLI/SLO/SLA. Error budgets. Burn rates. The Google SRE methodology." },
  { id: 'alerts', label: 'Alerts', icon: Bell, num: '08', sub: "Dashboards, PromQL recipes, alert design, fighting alert fatigue." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Instrumentation patterns, Collector configs, PromQL recipes, SLO templates." },
  { id: 'sandbox', label: 'Sandbox', icon: Activity, num: '10', sub: "Live simulated checkout-api with metrics, logs, traces. Write PromQL. Trigger incidents." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Incident response with telemetry. Reading the three pillars together under pressure." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "Google SRE Book, Honeycomb's o11y guide, OpenTelemetry docs, learning path." },
];

const STACKS = [
  { id: 'backend', label: 'Backend / API', desc: 'HTTP services, request/response, latency and error rates matter most', icon: '▤' },
  { id: 'platform', label: 'Platform / SRE', desc: 'Kubernetes, service mesh, infrastructure metrics, on-call rotations', icon: '⌬' },
  { id: 'data', label: 'Data / streaming', desc: 'Pipelines, batch jobs, throughput, lag, processing time', icon: '⥱' },
  { id: 'ai', label: 'AI / LLM systems', desc: 'Token usage, prompt latency, evaluation metrics, agent traces', icon: '⊛' },
  { id: 'beginner', label: 'Just learn observability', desc: 'Foundations — three pillars, OpenTelemetry, SLOs, dashboards', icon: '◧' },
];

const GLOSSARY = {
  Observability: "The ability to ask arbitrary questions about your system's behavior without having to ship new code to answer them. Contrast with monitoring, which answers predefined questions. The term was popularized by Honeycomb and Charity Majors around 2018, drawing from control theory.",
  Monitoring: "Collecting and analyzing predefined metrics to detect known failure modes. 'Is CPU above 80%?' is monitoring. 'Why did this user's checkout fail?' requires observability.",
  Telemetry: "Data emitted by systems about their behavior. The three classical pillars: logs (discrete events), metrics (aggregated numbers over time), traces (causal chains across services). Continuous profiling is the emerging fourth pillar.",
  Logs: "Discrete, timestamped events. Each log line is a record of something that happened: a request received, an error caught, a job completed. Best when structured (JSON) rather than free text.",
  Metrics: "Numerical measurements aggregated over time. Counter (only goes up), gauge (current value), histogram (distribution), summary (precomputed quantiles). Cheap to store at scale, easy to query, easy to alert on.",
  Traces: "Causal chains showing how a request flows through services. A single trace contains many spans, each representing one operation. Reveals latency contributions and failure cascades across service boundaries.",
  Span: "One operation within a trace. Has a name, start/end timestamps, attributes (key-value tags), and parent/child relationships to other spans. The atomic unit of distributed tracing.",
  "Trace ID": "A unique identifier (typically 128-bit hex) that links all spans in a single trace. Propagated via HTTP headers (W3C Trace Context) so downstream services can join the same trace.",
  "Span ID": "Unique identifier (64-bit hex) for a single span. Combined with the trace ID, identifies that span globally.",
  "Context propagation": "Passing trace and baggage context across service boundaries. W3C Trace Context standard uses traceparent and tracestate HTTP headers. Critical for distributed traces to actually connect.",
  OpenTelemetry: "Vendor-neutral observability framework. Graduated CNCF on May 21, 2026 — second most active CNCF project after Kubernetes. Provides SDKs in 12+ languages, a Collector, and the OTLP wire protocol. All major vendors support it natively.",
  OTLP: "OpenTelemetry Protocol. The wire format for telemetry data. Two variants: gRPC (preferred for high throughput) and HTTP/protobuf. Backends like Datadog, Honeycomb, Grafana Cloud, Jaeger all accept OTLP.",
  Collector: "OpenTelemetry Collector. A standalone process that receives, processes, and exports telemetry. Three pipeline stages: receivers (intake), processors (transform/filter/sample), exporters (send to backends). Decouples instrumentation from storage.",
  "Semantic Conventions": "OpenTelemetry's standardized attribute names. Use http.request.method instead of inventing your own naming. Enables cross-service dashboards and alerts to work consistently.",
  Counter: "A metric that only goes up (or resets to zero on restart). Total requests, total bytes sent, total errors. Use rate() in PromQL to see the per-second change.",
  Gauge: "A metric that can go up or down. Current memory usage, current connection count, queue depth. Sample the value as-is.",
  Histogram: "A metric that distributes observations into buckets. Used for latency, request sizes — anything with a distribution worth analyzing. Compute quantiles (p50, p95, p99) at query time.",
  Summary: "Like a histogram but quantiles are computed client-side at observation time. Less flexible than histograms but cheaper to query. Mostly superseded by histograms.",
  Quantile: "The value below which a given fraction of observations fall. p99 latency = the latency value where 99% of requests are at or below it. The latency 1% of users actually experience.",
  PromQL: "Prometheus Query Language. Functional query language for time-series. Instant queries (point-in-time), range queries (over a window), aggregations, joins, mathematical operations. The query language for most observability backends in 2026.",
  Prometheus: "Open-source time-series database and monitoring system. Pull-based scraping model. CNCF graduated 2018. Current version 3.9.0 (January 2026). The metrics half of the stack — Grafana is the visualization half.",
  Grafana: "Open-source visualization platform. Connects to Prometheus, Loki, Tempo, and ~100 other data sources. Builds dashboards, alerts, and explores data interactively. Current 12.3+ (2026).",
  Alertmanager: "Prometheus's alerting component. Receives alert events from Prometheus, deduplicates them, groups them, routes to receivers (Slack, PagerDuty, email, webhook). Handles silencing and inhibition.",
  SLI: "Service Level Indicator. A specific numeric measure of service health. 'Percentage of requests completing under 200ms.' Always a ratio or rate.",
  SLO: "Service Level Objective. A target value for an SLI over a time window. '99.9% of requests complete under 200ms over a 30-day rolling window.' The internal target.",
  SLA: "Service Level Agreement. A contract with customers backed by financial penalties. Always looser than SLOs — give yourself headroom internally to fix issues before contract violations.",
  "Error budget": "1 - SLO. If SLO is 99.9%, error budget is 0.1% — about 43 minutes of downtime per month. Spend the budget intentionally on risky deployments; preserve it during quiet periods.",
  "Burn rate": "How fast you're consuming error budget. Burn rate of 1 = on track to consume exactly the budget by end of window. Burn rate of 10 = consuming 10× the budget — alert urgently.",
  Cardinality: "The number of unique label combinations on a metric. http_requests_total{path=\"/api/users\", method=\"GET\"} has cardinality = unique paths × unique methods. High cardinality breaks Prometheus.",
  Sampling: "Keeping only a fraction of traces to control storage cost. Head-based: decide at trace start. Tail-based: decide after the trace completes (better — can keep all errors). Required at scale.",
  "Tail-based sampling": "Sampling decision made AFTER the trace completes. Lets you keep 100% of error traces and slow traces, sample 5-10% of everything else. Implemented in OTel Collector tail_sampling processor.",
  RED: "Method by Tom Wilkes (Grafana). For request-driven services: Rate (requests per second), Errors (error rate), Duration (latency distribution). Three metrics that cover most service health.",
  USE: "Method by Brendan Gregg. For resources: Utilization (% time busy), Saturation (queue depth, waiting work), Errors. Apply to every resource in your stack.",
  "Four Golden Signals": "Google SRE Book formulation: latency, traffic, errors, saturation. Closely related to RED + USE. Cover the things that go wrong in production.",
  Logs2: "Discrete event records. Best practices: structured (JSON), include trace_id and span_id, include service name and version, never log secrets or PII, use log levels meaningfully (DEBUG/INFO/WARN/ERROR).",
  "Structured logging": "Logging as JSON (or another machine-readable format) instead of free-text strings. Enables filtering, parsing, correlation. Always include trace_id when available.",
  "Correlation ID": "An identifier that ties logs across services together for one request. Often the trace_id from distributed tracing. Without it, debugging across services becomes archaeology.",
  "Log levels": "DEBUG (development), INFO (normal operations), WARN (degraded but functional), ERROR (failure but recoverable), FATAL (process must die). Use consistently across services.",
  Loki: "Grafana's log aggregation system. Designed to be cost-efficient by indexing only labels, not log content. LogQL is the query language. Common partner to Prometheus for logs.",
  Tempo: "Grafana's distributed tracing backend. Stores traces. Highly scalable, cost-efficient. Often paired with Loki + Prometheus = 'LGTM' stack.",
  Jaeger: "CNCF graduated distributed tracing system. Open source, scalable. Often the first tracing backend teams adopt before considering managed options.",
  Datadog: "Commercial observability platform. SaaS, expensive, comprehensive. Now supports OTel natively. Strong APM and infrastructure monitoring.",
  Honeycomb: "Observability platform built around high-cardinality event data. Founded by Charity Majors. Popularized the modern observability concept. Strong tracing focus.",
  eBPF: "Extended Berkeley Packet Filter. Lets you run sandboxed programs in the Linux kernel. Used for observability: capture network traffic, system calls, function entries — without modifying applications. OpenTelemetry eBPF instrumentation 1.0 stable in 2026.",
  Profiling: "Capturing CPU usage, memory allocation, or other resource usage by function, continuously, in production. The fourth pillar of observability. OpenTelemetry profiling spec entered RC in Q1 2026.",
  pprof: "Go's profiling format, now broadly used. Captures CPU, memory, goroutine, mutex profiles. Continuous profiling tools (Pyroscope, Grafana Phlare) speak pprof.",
  Pyroscope: "Continuous profiling tool, now part of Grafana stack (as Grafana Pyroscope). Captures production profiles with minimal overhead. Find slow functions in live systems.",
  "Pull model": "Prometheus's design: the server scrapes metrics from endpoints over HTTP. Services expose /metrics, Prometheus scrapes them on an interval. Service discovery finds the targets.",
  "Push model": "Services send metrics to the backend. OpenTelemetry uses push (OTLP). Better for ephemeral workloads (Lambda, jobs) where the scraper can't reach the process in time.",
  Exporter: "Two meanings. (1) In Prometheus: a service that translates non-Prometheus metrics to Prometheus format (node_exporter, blackbox_exporter). (2) In OTel: the Collector component that sends data to a backend (otlp exporter, datadog exporter).",
  Receiver: "OTel Collector input component. Accepts telemetry from sources: otlp receiver for SDKs, prometheus receiver for scraping, hostmetrics receiver for system stats.",
  Processor: "OTel Collector middle component. Transforms telemetry: batch, attributes, tail_sampling, memory_limiter, resource. Runs between receivers and exporters.",
  Dashboard: "Visualization of metrics and other telemetry. Best dashboards tell a story: top-level health, then drill-down by service, then by instance. The worst dashboards show every metric with no hierarchy.",
  "Alert fatigue": "When alerts fire too often, on-call engineers stop responding to them. The biggest enemy of reliable systems. Fix by alerting on symptoms (user impact) not causes (every resource hiccup).",
  Postmortem: "Document written after an incident. Blameless — focuses on systemic causes, not individual blame. The single highest-ROI practice for improving reliability. Google's SRE Book has the canonical guide.",
  MTTR: "Mean Time To Recovery (or Repair). The average time from incident detection to resolution. Often the most impactful reliability metric — reducing MTTR matters more than preventing every incident.",
  "On-call": "Engineers responsible for responding to alerts. Good on-call practices: clear runbooks, no alert without runbook, fair rotation, time off after major incidents, blameless culture around mistakes.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "What's the fundamental difference between monitoring and observability?",
      opts: [
        "Different vendors",
        "Monitoring answers predefined questions ('is CPU > 80%?'). Observability lets you ask arbitrary questions about system behavior without shipping new code first.",
        "Same thing, different name"
      ],
      a: 1,
      x: "The term 'observability' was popularized around 2018 by Honeycomb and Charity Majors, drawing from control theory. Monitoring gives you dashboards and alerts for things you anticipated; observability gives you the ability to investigate what you didn't anticipate. In practice you need both: monitoring catches known failure modes, observability lets you debug novel ones."
    },
    {
      qid: 'o2',
      q: "When did OpenTelemetry graduate CNCF?",
      opts: [
        "Years ago — it's old news",
        "May 21, 2026 — making it the second most active CNCF project after Kubernetes",
        "It hasn't graduated yet"
      ],
      a: 1,
      x: "OpenTelemetry graduated CNCF on May 21, 2026 — five days ago at time of writing. It's now the de facto standard for instrumentation, supported natively by every major observability vendor: Datadog, New Relic, Grafana Cloud, Honeycomb, Dynatrace, Splunk, AWS X-Ray, Azure Monitor, Google Cloud. Switching backends no longer requires re-instrumenting."
    },
    {
      qid: 'o3',
      q: "Why does the unified standard matter?",
      opts: [
        "It doesn't, vendor SDKs work fine",
        "Decouples instrumentation from storage. Migrate from Datadog to Honeycomb? Change one Collector config line — zero application code changes. Multiple teams have documented backend migrations completed in under two weeks.",
        "Saves disk space"
      ],
      a: 1,
      x: "Before OpenTelemetry, switching observability backends required reinstrumenting every service — a multi-quarter project. With OTel, instrumentation is decoupled from storage via the Collector. Your services emit OTLP, the Collector routes wherever. The lock-in equation completely shifted in vendor leverage between 2024 and 2026."
    },
  ],
  pillars: [
    {
      qid: 'pi1',
      q: "What are the three classical pillars of observability — and the fourth?",
      opts: [
        "Up, down, sideways",
        "Logs (discrete events), metrics (aggregated numbers), traces (causal chains). Fourth pillar: continuous profiling (CPU/memory per function, continuously, in production).",
        "Servers, services, secrets"
      ],
      a: 1,
      x: "Logs answer 'what happened?'. Metrics answer 'how many / how fast / how much?'. Traces answer 'why / where did time go?'. Profiles answer 'which function is using resources?'. OpenTelemetry's profiling spec entered RC in Q1 2026 — making OTel the first standard to unify all four pillars under one wire protocol."
    },
  ],
  metrics: [
    {
      qid: 'm1',
      q: "What's the difference between a counter and a gauge?",
      opts: [
        "Same thing",
        "Counter only goes up (or resets on restart) — total requests, bytes sent, errors. Gauge can go up or down — current memory, queue depth, active connections. Different query patterns: rate() for counters, raw value for gauges.",
        "Counter is for integers, gauge is for floats"
      ],
      a: 1,
      x: "Counters answer 'how many of X have happened?'. Always use rate(counter[5m]) in PromQL to get the per-second rate over the last 5 minutes. Gauges answer 'what is X right now?'. Common mistake: using a counter when you wanted a gauge, then trying to read it directly and getting an ever-growing number."
    },
    {
      qid: 'm2',
      q: "Why use histograms instead of averages for latency?",
      opts: [
        "They're newer",
        "Averages hide tail latency. If 99 requests take 10ms and 1 takes 10000ms, average is 110ms — but 1% of users had a terrible experience. Histograms let you see p50, p95, p99 — the latencies real users actually experience.",
        "Histograms use less storage"
      ],
      a: 1,
      x: "p99 latency is what 1% of users experience — and that 1% includes your power users who do many requests. If p99 is 5 seconds, your active users feel a 5-second slowdown frequently. The Google SRE Book formalizes this: 'Latency is what your users feel — measure the tail.' Always alert on p95/p99, not average."
    },
    {
      qid: 'm3',
      q: "What is the cardinality explosion problem?",
      opts: [
        "When metrics get too big",
        "Each unique combination of label values creates a separate time series. http_requests{user_id='123', path='/api/users/123'} per user_id = millions of time series, breaking Prometheus storage and queries.",
        "When too many engineers query at once"
      ],
      a: 1,
      x: "Cardinality = unique label combinations. http_requests{method, status} with 4 methods × 6 statuses = 24 series. Add path with 100 endpoints = 2400 series. Add user_id with 1M users = 2.4 BILLION series. Prometheus dies. Rule: NEVER use unbounded label values (user IDs, request IDs, full URLs). Use buckets or sample down."
    },
  ],
  traces: [
    {
      qid: 't1',
      q: "What does a single trace represent?",
      opts: [
        "A single function call",
        "One request as it flows through your distributed system — every service it touches, every database query, every external API call — represented as a tree of spans linked by causal parent/child relationships.",
        "A log file"
      ],
      a: 1,
      x: "A trace captures the lifecycle of one logical operation across service boundaries. Root span = the original request. Child spans = downstream work caused by that request. Each span has a name, attributes (key-value tags), start/end times. The tree shows where time went and which calls failed. This is why traces are so much more powerful than logs for debugging distributed systems."
    },
    {
      qid: 't2',
      q: "Why tail-based sampling instead of head-based?",
      opts: [
        "It's just newer",
        "Head-based decides at trace start (random) — so error and slow traces get sampled away. Tail-based decides AFTER the trace completes — keep 100% of errors, keep slow traces, sample the rest at 5-10%. Implemented in OTel Collector's tail_sampling processor.",
        "Tail-based is cheaper to compute"
      ],
      a: 1,
      x: "Head-based sampling at 1% means 1% of all traces, including 1% of errors. You'd miss 99% of incidents. Tail-based sampling buffers traces briefly, then decides: error happened? keep it. p95+ latency? keep it. Normal? Sample at 5%. Storage costs stay manageable; the interesting traces stay 100%. This is the standard pattern at scale in 2026."
    },
  ],
  otel: [
    {
      qid: 'ot1',
      q: "What does the OpenTelemetry Collector do?",
      opts: [
        "Replaces Prometheus",
        "Receives telemetry from your apps (or from Prometheus scrapes, host metrics, etc.), processes it (batching, sampling, attribute manipulation), and exports to one or more backends. Decouples instrumentation from storage.",
        "It's an alternative SDK"
      ],
      a: 1,
      x: "The Collector is the linchpin of the OTel architecture. Receivers (OTLP, Prometheus, host metrics, syslog, kafka...) bring data in. Processors transform (batch for efficiency, tail_sampling, attributes/redaction, memory_limiter). Exporters send out (OTLP to any vendor, prometheus remote write, files, kafka). Run it as a sidecar per pod, or as a gateway for the cluster — or both."
    },
    {
      qid: 'ot2',
      q: "What are Semantic Conventions and why do they matter?",
      opts: [
        "A coding style guide",
        "Standardized attribute names: http.request.method, db.system, messaging.system, k8s.pod.name. Using them means cross-service dashboards and alerts work consistently — and pre-built dashboards from vendors just work on your data.",
        "Latin names for things"
      ],
      a: 1,
      x: "Before semantic conventions, every team named attributes differently: 'method' or 'http_method' or 'req.verb'. Cross-service queries became impossible. Semantic Conventions (a separate OTel spec) define canonical names across HTTP, gRPC, databases, messaging, cloud providers, Kubernetes, GenAI. Stable since 2024. Following them means out-of-the-box integrations work."
    },
  ],
  slo: [
    {
      qid: 'sl1',
      q: "If your SLO is 99.9% availability, how much error budget do you have per 30-day month?",
      opts: [
        "30 minutes",
        "About 43 minutes 12 seconds — 0.1% of 30 days. That's your budget for downtime, deploys gone wrong, dependency outages, anything that reduces availability.",
        "1 hour"
      ],
      a: 1,
      x: "Error budget = (1 - SLO) × time window. For 99.9% over 30 days: 0.001 × 30 × 24 × 60 = 43.2 minutes. The Google SRE Book treats this as YOUR budget to spend on risk — ship aggressive features when budget is plentiful, freeze and stabilize when burning fast. Don't hoard the budget; that's wasted opportunity for learning."
    },
    {
      qid: 'sl2',
      q: "What's a burn-rate alert?",
      opts: [
        "Notification when servers overheat",
        "An alert that fires based on how fast you're consuming error budget. If your 30-day budget is being burned in 1 hour (burn rate of 720x), wake someone up. If it's being burned over the full 30 days (rate of 1x), no action needed.",
        "Bill alert"
      ],
      a: 1,
      x: "Burn-rate alerts (Google SRE Workbook chapter 5) are the modern way to alert. Multi-window, multi-burn-rate alerts: page on 14.4× over 1h (consuming a month's budget in 2 days), ticket on 6× over 6h, notify on 1× over 3d. Lower noise, better signal — they replace 'CPU > 80%' style alerts that fire constantly without indicating user impact."
    },
  ],
  alerts: [
    {
      qid: 'a1',
      q: "What's the single biggest enemy of reliable systems?",
      opts: [
        "Bugs",
        "Alert fatigue. When alerts fire constantly, on-call engineers stop responding. The fix: alert on user-visible symptoms (error rates, latency SLO burn), not internal causes (CPU, memory, queue depth).",
        "Slow developers"
      ],
      a: 1,
      x: "Every alert should be actionable. If on-call sees an alert and there's nothing meaningful to do, that's a bug in the alert. Common pattern: 'CPU 90% on host-7' fires hourly, gets ignored — real incidents drown in noise. Symptom-based alerting (page when user-visible thing breaks) cuts noise 5-10× and ensures every page deserves response."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What's the canonical book on running production systems?",
      opts: [
        "Eloquent JavaScript",
        "Google's 'Site Reliability Engineering' book (sre.google/books/). Free online. Plus the 'SRE Workbook' (companion). Together they define modern SLO methodology, error budgets, blameless postmortems, and on-call culture.",
        "The Mythical Man-Month"
      ],
      a: 1,
      x: "Google open-sourced the SRE methodology in two books. The first (2016) defines the philosophy and core practices. The Workbook (2018) is hands-on — how to set SLOs, how to design burn-rate alerts, how to do incident response and postmortems. These are still THE references. Honeycomb's Observability Engineering (2022, O'Reilly) is the modern observability companion."
    },
  ],
};

const COMPARISONS = {
  pillars: {
    title: 'The four pillars',
    headers: ['Pillar', 'Data', 'Best for', 'Cost'],
    rows: [
      ['Logs', 'Discrete events with timestamps', "What happened? Audit trail. Detailed context for one event.", "$$ — text storage adds up at scale"],
      ['Metrics', 'Aggregated numbers over time', "How many / how fast / how much? Alerting. Dashboards.", "$ — cheap, bounded by cardinality"],
      ['Traces', 'Causal chains across services', "Where did time go? Why did this request fail? Distributed debugging.", "$$$ — sampled at scale to control cost"],
      ['Profiles', 'CPU/memory per function, continuous', "Which function is hot? Memory growth source? Performance regressions.", "$$ — pprof format, low overhead"],
    ],
  },
  metric_types: {
    title: 'Metric types — when to use which',
    headers: ['Type', 'Behavior', 'Example', 'Query'],
    rows: [
      ['Counter', 'Monotonically increases, resets only on restart', "http_requests_total, errors_total, bytes_sent_total", "rate(metric[5m]) for per-second"],
      ['Gauge', 'Goes up and down freely', "memory_usage_bytes, queue_depth, active_connections", "metric (current value)"],
      ['Histogram', 'Distribution in buckets', "http_request_duration_seconds_bucket{le=\"0.1\"}", "histogram_quantile(0.99, ...)"],
      ['Summary', 'Pre-computed quantiles client-side', "Legacy — histograms are usually better", "metric{quantile=\"0.99\"}"],
    ],
  },
  methods: {
    title: 'Monitoring methodologies',
    headers: ['Method', 'Author', 'For', 'Signals'],
    rows: [
      ['RED', 'Tom Wilkie (Grafana)', "Request-driven services (APIs)", "Rate, Errors, Duration"],
      ['USE', 'Brendan Gregg', "Resources (CPU, memory, disk, network)", "Utilization, Saturation, Errors"],
      ['Four Golden Signals', 'Google SRE Book', "User-visible service health", "Latency, Traffic, Errors, Saturation"],
      ['LETS', 'Less common', "Quick service overview", "Latency, Errors, Throughput, Saturation"],
    ],
  },
  burn_rates: {
    title: 'Multi-window burn-rate alerts (Google SRE Workbook)',
    headers: ['Severity', 'Burn rate', 'Window', 'Action'],
    rows: [
      ['Critical', '14.4×', "1 hour", "Page on-call immediately. Consuming a month's budget in 2 days."],
      ['High', '6×', "6 hours", "Ticket / Slack notification. 5 days to budget exhaustion at current pace."],
      ['Medium', '3×', "1 day", "Investigate during business hours. Budget will be gone in 10 days."],
      ['Low', '1×', "3 days", "Trending toward budget exhaustion exactly. No action — normal operation."],
    ],
  },
  vendors_2026: {
    title: 'Observability platforms (2026)',
    headers: ['Platform', 'Type', 'Strengths', 'OTel support'],
    rows: [
      ['Grafana Cloud', 'SaaS — LGTM stack', "Open-source roots, all four pillars, good pricing tier", "Native (built around it)"],
      ['Datadog', 'SaaS — full APM', "Polished UI, broad integrations, expensive at scale", "Native (v1.37+)"],
      ['Honeycomb', 'SaaS — events/traces', "High-cardinality, modern observability ethos", "Native (founders helped define OTel)"],
      ['New Relic', 'SaaS — APM', "Long history, broad coverage", "Native"],
      ['Self-hosted LGTM', 'Open source', "Loki + Grafana + Tempo + Mimir/Prometheus, no vendor lock-in", "Native"],
      ['SigNoz', 'Open source', "Single-binary OTel-native alternative, growing fast", "Native (built on it)"],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "Logging without correlation IDs", reason: "Logs from one request scattered across 10 services with no link between them. Always include trace_id and span_id from the active span context in every log line. OpenTelemetry's log SDK does this automatically." },
  { name: "High-cardinality metric labels", reason: "Adding user_id, request_id, or full URL as a label creates one time series per unique value. Millions of series = Prometheus dies. Rule: label cardinality should be bounded and small. Use exemplars or traces for per-request detail." },
  { name: "Uniform trace sampling", reason: "1% head-based sampling = you keep 1% of errors. You'll miss 99% of incidents. Use tail-based sampling: keep 100% of errors, keep slow traces (>p95), sample the rest at 5-10%. Implemented in OTel Collector tail_sampling processor." },
  { name: "Alert fatigue", reason: "If alerts fire constantly, on-call stops responding. Real incidents drown in noise. Alert on user-visible symptoms (SLO burn rate, error rates, p99 latency) — not internal causes (CPU, memory, individual host health). Every page deserves response." },
  { name: "No SLOs", reason: "Binary up/down monitoring tells you nothing about user experience. Set SLOs: 99.9% of checkout requests complete under 500ms over 30 days. Track error budget. Page on burn rate. This is the foundation of modern reliability practice." },
  { name: "Logging secrets or PII", reason: "Passwords, tokens, credit card numbers, emails, full names in logs = compliance violation + leak risk. Use structured logging with explicit field allowlists. Redact at the SDK or Collector level. Audit periodically." },
  { name: "Vendor-specific instrumentation", reason: "Hardcoding Datadog or New Relic SDKs everywhere = expensive lock-in. Migrating backends becomes a multi-quarter rewrite. Use OpenTelemetry SDKs + the Collector to route. Every major vendor accepts OTLP in 2026. The lock-in equation flipped." },
  { name: "Dashboards with no hierarchy", reason: "A wall of 50 graphs is not a dashboard — it's a museum. Build dashboards in layers: (1) top-level service health, (2) per-component breakdown, (3) drill-down to instances. The Grafana 'RED method' starter dashboards are a good model." },
  { name: "Treating observability as an add-on", reason: "Bolted-on instrumentation after the system is built misses critical signals. Design observability in: trace propagation through every service, structured logs everywhere, metrics on every meaningful event. The cost of retrofit is 10× the cost of designing in." },
  { name: "Logging at DEBUG in production", reason: "Debug logs in production = massive log volume + storage cost + slower log queries + you stop reading them. Use INFO/WARN/ERROR in production. Enable DEBUG temporarily via runtime feature flags when investigating." },
];

const COMMANDS = [
  { cmd: 'docker run -p 9090:9090 prom/prometheus:v3.9.0', desc: "Run Prometheus locally. Reads config from /etc/prometheus/prometheus.yml inside the container. Web UI at http://localhost:9090." },
  { cmd: 'docker run -p 3000:3000 grafana/grafana:12.3', desc: "Run Grafana locally. UI at http://localhost:3000 (admin/admin). Add Prometheus as a data source pointing to host.docker.internal:9090." },
  { cmd: 'docker run otel/opentelemetry-collector-contrib:latest', desc: "Run the OpenTelemetry Collector with the 'contrib' image (includes all vendor exporters). Configure via mounted config.yaml." },
  { cmd: 'curl http://localhost:9090/metrics', desc: "Scrape any Prometheus-instrumented service's /metrics endpoint. Plain text format — counter and gauge values, histogram buckets, with HELP and TYPE comments." },
  { cmd: 'rate(http_requests_total[5m])', desc: "PromQL: requests-per-second over the last 5 minutes. The fundamental query for counter metrics." },
  { cmd: 'histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[5m])))', desc: "PromQL: p99 latency over 5 minutes. The sum by (le) aggregates across all instances; histogram_quantile converts histogram buckets to a quantile." },
  { cmd: 'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m]))', desc: "PromQL: error rate — fraction of requests with 5xx status. Multiply by 100 for percentage. This is the most common SLI." },
  { cmd: 'up == 0', desc: "PromQL: services that are down (scrape failed). 'up' is the special metric Prometheus generates per scrape target. Standard liveness check." },
  { cmd: 'go install github.com/prometheus/prometheus/cmd/promtool@latest', desc: "Install promtool — Prometheus's CLI for validating configs and PromQL queries. 'promtool check rules rules.yml' validates alert rules before deploy." },
  { cmd: 'promtool check rules rules.yml', desc: "Validate Prometheus alert rule files. Catch syntax errors before they reach production. Always run in CI before merging." },
  { cmd: 'amtool config check alertmanager.yml', desc: "Validate Alertmanager configuration. Same idea as promtool check rules — pre-flight check in CI to avoid breaking alerting on deploy." },
  { cmd: 'otelcol --config=config.yaml', desc: "Run the OpenTelemetry Collector standalone. Common pattern: one Collector per node (agent mode) feeding a gateway pool (gateway mode)." },
  { cmd: 'curl -X POST http://collector:4318/v1/traces -d @trace.json', desc: "Send OTLP/HTTP traces to a Collector for testing. Useful for verifying Collector pipelines without instrumenting a full app." },
  { cmd: 'kubectl top pods --sort-by=memory', desc: "Quick cluster-wide view of pod memory usage. Sorted, descending. The 90-second triage command before opening Grafana." },
  { cmd: 'kubectl logs -f deployment/myapp --since=5m', desc: "Follow logs from all pods of a deployment, last 5 minutes. The 'before structured logging in Loki' triage command — useful when something just broke." },
  { cmd: 'opentelemetry-instrument python app.py', desc: "Auto-instrument Python apps with the OTel auto-instrumentation package. Zero code changes — adds tracing, metrics, logs based on detected libraries." },
];

const RESOURCES = [
  { name: "Google SRE Book", url: 'sre.google/books/ (free online)', note: "Site Reliability Engineering — Google's canonical guide. SLOs, error budgets, on-call, postmortems, automation. The single most influential book in this field. Read alongside the SRE Workbook (also free).", kind: 'book' },
  { name: "Google SRE Workbook", url: 'sre.google/workbook/ (free online)', note: "Hands-on companion. How to design SLOs, multi-window burn-rate alerts, incident response, blameless postmortems. Practical, with worked examples.", kind: 'book' },
  { name: "Observability Engineering", url: 'O\'Reilly, 2022 — Majors, Fong-Jones, Miranda', note: "The modern observability book. Honeycomb founders. Covers the philosophy + practice. Best companion to the OTel docs.", kind: 'book' },
  { name: "OpenTelemetry Documentation", url: 'opentelemetry.io/docs/', note: "Official OTel docs. Concepts, SDK setup for each language, Collector configuration, semantic conventions. The reference. CNCF graduated May 21, 2026.", kind: 'reference' },
  { name: "OpenTelemetry Demo", url: 'github.com/open-telemetry/opentelemetry-demo', note: "A complete e-commerce microservices app instrumented with OTel. Best way to see the full stack in action. Multi-language. Includes Grafana, Prometheus, Jaeger.", kind: 'tutorial' },
  { name: "Prometheus Documentation", url: 'prometheus.io/docs/', note: "Official Prometheus docs. PromQL syntax, configuration, federation, recording rules. Current version 3.9.0 (January 2026).", kind: 'reference' },
  { name: "Grafana Documentation", url: 'grafana.com/docs/grafana/latest/', note: "Official Grafana docs. Panels, dashboards, alerting, data sources. Current 12.3+ (2026).", kind: 'reference' },
  { name: "Honeycomb's o11y Guide", url: 'honeycomb.io/blog/category/observability-engineering', note: "Charity Majors and team write extensively on observability. Practical articles, real production stories. Worth subscribing to.", kind: 'reference' },
  { name: "PromQL for Humans", url: 'timber.io/blog/promql-for-humans/', note: "The friendliest PromQL intro. By Timber.io (now part of Datadog). Walk through every operator with examples.", kind: 'tutorial' },
  { name: "Awesome OpenTelemetry", url: 'github.com/magsther/awesome-opentelemetry', note: "Curated list — SDKs, instrumentation libraries, Collector configs, tutorials, blogs. Good catalog of the ecosystem.", kind: 'reference' },
  { name: "USE Method (Brendan Gregg)", url: 'brendangregg.com/usemethod.html', note: "The original USE method writeup. Apply to every resource: CPU, memory, disk, network, file descriptors. Brendan Gregg's site is a goldmine of perf and observability material.", kind: 'reference' },
  { name: "Awesome Prometheus alerts", url: 'samber.github.io/awesome-prometheus-alerts/', note: "Curated PromQL alert rules. Battle-tested templates for common services (Kubernetes, MySQL, PostgreSQL, Redis, RabbitMQ, etc.). Copy-paste starting point.", kind: 'reference' },
];

const PERSONALIZED = {
  backend: {
    spark: "Backend dev: instrument with OTel auto-instrumentation first (zero code changes). Get traces flowing. Then add custom spans for business logic. Then SLOs on the user-facing endpoints. RED method for everything.",
    pillars: "Backend: traces are your superpower. Every API request becomes a tree showing where time went. Once you have traces flowing, every other diagnosis gets faster.",
    metrics: "Backend: RED on every endpoint. Rate, Errors, Duration. Latency in histograms (always — p99 is what matters). Error rate by status code class (4xx vs 5xx). HTTP method as a low-cardinality label.",
    traces: "Backend: instrument incoming HTTP, outgoing HTTP, database calls, message queue ops. OTel auto-instrumentation does most of this. Manually add spans for cache misses, retries, business logic.",
    alerts: "Backend: alert on user-visible symptoms (SLO burn, p99 latency, 5xx rate) not internal (CPU, memory). Page only when humans need to act. Slack/ticket for trends needing attention but not immediately.",
    library: "Backend: OTel SDK setup, structured logging with trace context, RED-method dashboards, SLO recipes.",
  },
  platform: {
    spark: "Platform/SRE: deploy the LGTM stack (Loki + Grafana + Tempo + Mimir) or pick a managed equivalent. OTel Collector as agent on every node + gateway pool. Standardize on semantic conventions. Multi-window burn-rate alerts. Postmortem culture.",
    pillars: "Platform: all four pillars, fed centrally. Profiling matters more here — find which services use 80% of compute. Continuous profiling (Pyroscope) catches regressions automatically.",
    metrics: "Platform: USE method on every resource. Cluster-level USE (capacity planning), per-node USE (hotspots), per-service USE (right-sizing). Node exporter + cAdvisor + kube-state-metrics + your apps = full picture.",
    traces: "Platform: tail-based sampling in the Collector to control costs. Service mesh (Istio, Linkerd) gives you traces for free. Cross-cluster trace correlation matters when services span multiple clusters.",
    alerts: "Platform: SLO-based alerts at the platform layer (cluster health, ingress error rate, node availability). Burn-rate alerts. Runbooks for every alert. Periodic alert review — kill noisy ones.",
    library: "Platform: Collector configurations, kube-prometheus-stack setup, multi-burn-rate alerts, LGTM deployment patterns.",
  },
  data: {
    spark: "Data eng: metrics on pipeline throughput, lag, processing time. Traces for individual records as they flow through the pipeline. Structured logs with batch IDs as correlation. Custom SLOs (data freshness, completeness).",
    pillars: "Data: metrics for steady-state (throughput, lag), traces for individual record journeys, logs for batch-level events. Profile your Spark/Flink jobs — perf wins compound at scale.",
    metrics: "Data: input rate (records/sec), processing latency (per record), output rate, lag/queue depth, error rate, dead-letter queue size. Histogram for processing latency.",
    traces: "Data: harder than HTTP. Manually propagate context through Kafka headers, batch boundaries. Sample individual records — keep enough to debug bad records.",
    alerts: "Data: lag > threshold, dead-letter queue growing, output rate dropped, schema validation failures. Freshness SLO: 'data X hours old or newer at all times.'",
    library: "Data: Kafka/streaming patterns, batch correlation IDs, lag dashboards, data freshness SLOs.",
  },
  ai: {
    spark: "AI/LLM: token usage as the primary metric. Prompt latency. Eval scores. Agent traces — each tool call as a span. OpenTelemetry GenAI semantic conventions stabilized in 2025. Use Arize Phoenix or Honeycomb for traces.",
    pillars: "AI: traces dominate — agent workflows are deeply nested span trees. Metrics for token costs and latencies. Logs for prompt/completion content (with redaction). Profiling for inference time on self-hosted models.",
    metrics: "AI: tokens per request (in/out), cost per request, latency by model+prompt-class, eval scores over time, cache hit rate. Histogram for latency by model. Counter for tokens (per-tenant for cost).",
    traces: "AI: each LLM call = a span. Each tool call = a span. Multi-agent = nested span trees. OpenInference (Arize) or OpenLLMetry (Traceloop) for instrumentation. OTel multi-agent conventions still experimental.",
    alerts: "AI: token spike (cost explosion), eval score regression, latency p99 high, error rate on specific models, cache hit rate dropped.",
    library: "AI: GenAI semantic conventions, agent trace patterns, eval-as-telemetry, cost dashboards.",
  },
  beginner: {
    spark: "Foundations: read the Google SRE Book chapters 4-6 (SLOs, monitoring, alerting). Spin up Prometheus + Grafana locally with Docker. Write three PromQL queries. Set one SLO. Build one dashboard. The concepts click once you've touched the tools.",
    pillars: "Foundations: focus on metrics first — easiest to grasp. Then logs (with correlation IDs). Then traces (the magic moment). Profiles last — only matters when you have a perf problem.",
    metrics: "Foundations: counter vs gauge first. Then histograms (p99). Then PromQL rate() and histogram_quantile(). These three concepts cover 80% of metric usage.",
    traces: "Foundations: pick a tutorial app with OTel built in (the official OTel Demo). See traces flowing. Then instrument your own toy app. The 'aha' moment is real.",
    alerts: "Foundations: start with one alert on one SLO. Don't over-alert. Read the SRE Workbook chapter on burn-rate alerts before designing your own.",
    library: "Foundations: lean on auto-instrumentation. Read the OTel demo source. Copy patterns, don't invent.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's the observability trouble?",
    opts: [
      { label: "🚨 Page just fired — what now?", next: 'page-fired' },
      { label: "🔍 Can't find logs for a request", next: 'no-logs' },
      { label: "📈 Prometheus is slow or OOMing", next: 'prom-slow' },
      { label: "🌊 Drowning in alerts", next: 'alert-fatigue' },
      { label: "⛓ Traces aren't connecting across services", next: 'broken-traces' },
      { label: "💸 Observability bill exploding", next: 'bill-explosion' },
      { label: "📐 Want to set SLOs but don't know where to start", next: 'set-slo' },
      { label: "🎯 Need to migrate off vendor lock-in", next: 'migrate-vendor' },
    ],
  },
  'page-fired': {
    fix: "Incident response triage. Goal: stop the bleeding first, root cause later.",
    steps: [
      "Acknowledge the page. Stop additional alerts from waking others until you've assessed.",
      "Check the linked runbook (every alert MUST have one). Follow it before improvising.",
      "Pull up the top-level service dashboard. Confirm scope: one service, multiple services, or platform-wide?",
      "Check recent deploys: deployment history in the last 1-2 hours. Most incidents correlate with a recent change. Roll back if suspected.",
      "Check dependencies: is the database/cache/upstream healthy? Many 'service is down' incidents are actually dependency outages.",
      "If user impact is severe AND cause isn't obvious in 5 minutes, declare an incident. Bring in another engineer. Communicate status.",
      "After resolution: write a blameless postmortem within 5 business days. Focus on systemic causes. Track action items to closure."
    ]
  },
  'no-logs': {
    fix: "Usually missing correlation IDs or wrong log level. Sometimes the logs are there — you're querying wrong.",
    steps: [
      "First: do you have the trace_id from the failing request? If yes, query logs by trace_id directly.",
      "If no trace_id: do you have any unique attribute (user_id, request path, time window)? Filter by those.",
      "Check log retention: most setups expire logs after 7-30 days. If incident is older, logs may be archived to cold storage.",
      "Check log levels in the failing service. If DEBUG logs were needed and only INFO is captured, you can't get them retroactively.",
      "Fix forward: ensure every service emits trace_id and span_id in structured logs. OTel logging integration does this automatically.",
      "Adopt structured logging (JSON) if you haven't. Free-text grep doesn't scale. Loki, Datadog Logs, Splunk all want structured.",
      "Sample logging hygiene check: are you logging at INFO in prod? DEBUG should be off. Periodically audit log volume."
    ]
  },
  'prom-slow': {
    fix: "Almost always cardinality. Sometimes retention. Rarely raw write rate.",
    steps: [
      "Identify high-cardinality metrics: topk(10, count by (__name__)({__name__=~\".+\"})). Lists metrics by series count, highest first.",
      "Audit the top offenders. Common culprits: user_id, request_id, full URL, IP address as labels. These should never be labels.",
      "Fix the metrics: remove the high-cardinality label, or use buckets (e.g., user_id → user_tier), or move detail to traces.",
      "Add scrape_interval discipline: 15s is the default; some metrics don't change that often. 60s scrape interval cuts storage 4×.",
      "Recording rules: pre-compute expensive queries. Common dashboard queries become cheap reads if the result is recorded every 30s.",
      "Federation or remote write: if single Prometheus can't scale, federate to a downstream Prometheus or push to Mimir/Cortex/Grafana Cloud Mimir.",
      "Last resort: increase Prometheus memory. But the cardinality fix usually saves 10×+ more resources than throwing memory at it."
    ]
  },
  'alert-fatigue': {
    fix: "Alert audit. Every alert that fires without action being needed is broken. Delete or fix it.",
    steps: [
      "Generate an alert frequency report: for the last 30 days, count alerts by name. Focus on top 10 by volume.",
      "For each high-frequency alert: was action taken? If no, the alert is broken — fix the threshold, fix the symptom-vs-cause framing, or delete.",
      "Move from cause-based (CPU > 80%) to symptom-based (SLO burn rate). The Google SRE Workbook chapter 5 has the patterns.",
      "Multi-window burn rate alerts: critical (14.4× burn over 1h), high (6× over 6h), medium (3× over 1d). Cuts noise dramatically.",
      "Every alert MUST have a runbook. If you can't write one, the alert isn't actionable — delete it.",
      "Periodic alert review: schedule monthly. Walk through every firing alert from the last 30 days. Tune ruthlessly.",
      "On-call survey: ask the team what they trust. Trust = signal-to-noise ratio. High-noise alerts erode trust in the entire system."
    ]
  },
  'broken-traces': {
    fix: "Context propagation broken somewhere. Find the boundary where the trace ends.",
    steps: [
      "Look at a broken trace in the UI. Find the last span that has children. The next service in line is where context dropped.",
      "Check that service: is it using OTel SDK with the right propagator? W3C Trace Context is the standard since 2020.",
      "Check HTTP client config: traceparent header must be forwarded. Most OTel auto-instrumentations do this; custom HTTP clients may not.",
      "For message queues (Kafka, RabbitMQ): context propagates via headers. Producer must inject; consumer must extract. Common manual instrumentation point.",
      "For async work (job queues, async tasks): same as queues — manual context propagation across the boundary.",
      "Test with a simple test trace: hit endpoint A, which calls B, which calls C. Verify all three appear in one trace. Fix any breaks.",
      "Document the propagation pattern. Every service in your stack should follow the same conventions."
    ]
  },
  'bill-explosion': {
    fix: "Three usual suspects: high-cardinality metrics, uniform trace sampling, and verbose logging in prod.",
    steps: [
      "Get cost breakdown by category: logs, metrics, traces, profiles. Which is the biggest line item? Optimize there first.",
      "Logs: enable structured logging, reduce verbosity in prod (no DEBUG), set retention by importance (errors retained longer than info).",
      "Metrics: cardinality audit (see prom-slow branch). Use exemplars to link to traces instead of high-cardinality labels.",
      "Traces: tail-based sampling — keep 100% of errors and slow traces, sample the rest at 5-10%. OTel Collector tail_sampling processor.",
      "Consider open-source/self-hosted for highest-volume signals. LGTM stack on your own infra is cheaper at scale than SaaS.",
      "Or: keep SaaS for the easy 80%, route high-volume noisy data to cheaper storage (S3 for cold logs, Loki for warm).",
      "Renegotiate with vendor: showing planned reductions often unlocks discounts. Vendors prefer keeping you at $0.7M to losing you at $1M."
    ]
  },
  'set-slo': {
    fix: "Start with one user-facing service. One SLI. One target. Iterate.",
    steps: [
      "Pick the most important user-facing endpoint. The one that breaks the business if it's broken.",
      "Choose one SLI: typically request-success rate (% of requests succeeding) and/or latency (% under threshold).",
      "Choose a target: 99% or 99.9% are common starting points. Don't pick 99.99% — you can't hit it without infrastructure investment, and you'll just burn out chasing it.",
      "Pick a time window: 30-day rolling is standard.",
      "Implement: PromQL query for the SLI, alerting rule on burn rate (start with just the critical 14.4× over 1h).",
      "Live with it for a month. Watch the burn rate. Don't change the target yet — see what your real baseline is.",
      "After a month: iterate. Add more services, more SLIs, more burn-rate windows. Build the muscle gradually. Read SRE Workbook chapter 4 for depth."
    ]
  },
  'migrate-vendor': {
    fix: "OpenTelemetry is the answer. Migration is mostly Collector configuration work, not application code changes.",
    steps: [
      "Audit current state: which services use which vendor SDK? Which vendor accepts OTLP? (All major ones in 2026 do.)",
      "Phase 1: deploy OTel Collector(s). Configure to receive from existing sources, export to current vendor. No app changes yet.",
      "Phase 2: replace one service's vendor SDK with OTel SDK. Verify data still flows correctly to current vendor.",
      "Phase 3: repeat across services. Auto-instrumentation handles 80% of services with zero code changes.",
      "Phase 4: add new vendor as a second Collector exporter. Both backends receive data simultaneously. Validate the new one.",
      "Phase 5: cut over alerts and dashboards to the new vendor. Run parallel for 2-4 weeks.",
      "Phase 6: turn off the old vendor exporter. Decommission. Document the new architecture. Multi-week project total, not multi-quarter."
    ]
  },
};

const ARCH_NODES = [
  { id: 'app', x: 20, y: 30, w: 70, h: 28, label: 'app', color: '#67e8f9', desc: "Your application code. Instrumented with OpenTelemetry SDK. Emits traces, metrics, logs to the Collector." },
  { id: 'sdk', x: 110, y: 30, w: 70, h: 28, label: 'OTel SDK', color: '#67e8f9', desc: "OpenTelemetry SDK in your language. Auto-instrumentation + manual spans. Buffers and exports via OTLP." },
  { id: 'collector', x: 110, y: 90, w: 70, h: 28, label: 'Collector', color: '#67e8f9', desc: "OpenTelemetry Collector. Receives from SDKs, processes (batching, sampling, attribute manipulation), exports to backends. The decoupling layer." },
  { id: 'metrics', x: 20, y: 160, w: 70, h: 28, label: 'Prometheus', color: '#fb7185', desc: "Metrics store. Time-series database. Pull-based scraping (or receives via remote write from Collector). PromQL for queries." },
  { id: 'logs', x: 110, y: 160, w: 70, h: 28, label: 'Loki', color: '#fb7185', desc: "Log aggregation. Grafana's log store. Cost-efficient — indexes labels only, not content. LogQL for queries." },
  { id: 'traces', x: 200, y: 160, w: 70, h: 28, label: 'Tempo', color: '#fb7185', desc: "Trace store. Grafana's tracing backend. Highly scalable. Lookup by trace_id; correlate to logs and metrics." },
  { id: 'grafana', x: 110, y: 220, w: 70, h: 28, label: 'Grafana', color: '#fb7185', desc: "Visualization. Dashboards across metrics, logs, traces. Alerting. The unified UI." },
  { id: 'oncall', x: 200, y: 220, w: 70, h: 28, label: 'on-call', color: '#fb7185', desc: "Humans. Respond to alerts. Investigate using the dashboards. Write postmortems. The last and most important component." },
];

/* ═══════════════════════════════════════════════════════════════
   TELEMETRY SIMULATOR — bounded, validated, no silent catches
   Models a fake checkout-api service emitting metrics/logs/traces.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Bounded constants ─── */
const SIM = Object.freeze({
  MAX_HISTORY_POINTS: 300,    // 5 min at 1 Hz
  MAX_LOG_ENTRIES: 50,         // bounded log buffer
  MAX_TRACE_ENTRIES: 20,       // bounded trace buffer
  TICK_MS: 1000,                // 1 sample per second
  HISTOGRAM_BUCKETS_S: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  PATHS: ['/api/checkout', '/api/cart', '/api/products', '/api/users'],
  METHODS: ['GET', 'POST'],
});

/* ─── Pure helpers — assertions on invariants ─── */
function clamp(value, min, max) {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function poissonSample(lambda) {
  // Knuth's algorithm for small lambda. Returns non-negative integer.
  if (!Number.isFinite(lambda) || lambda < 0) return 0;
  if (lambda > 30) return Math.round(lambda); // bounded — avoid pathological loops
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  // Bounded loop: lambda < 30 means expected iterations < 60, hard cap at 200
  for (let i = 0; i < 200; i++) {
    k += 1;
    p *= Math.random();
    if (p <= L) return k - 1;
  }
  return k - 1;
}

function exponentialLatencyMs(scaleMs) {
  // Inverse-CDF sampling. Returns positive ms.
  const u = Math.max(1e-9, Math.random());
  return -Math.log(u) * scaleMs;
}

function nowMs() { return Date.now(); }

function randomHexId(bits) {
  // Generate a random hex ID of the given bit length (8, 64, 128).
  if (![8, 64, 128].includes(bits)) bits = 64;
  const hexChars = bits / 4;
  let s = '';
  for (let i = 0; i < hexChars; i++) {
    s += Math.floor(Math.random() * 16).toString(16);
  }
  return s;
}

/* ─── Metric state — bounded ring buffers ─── */
function makeEmptySimState() {
  return {
    startedAtMs: nowMs(),
    mode: 'normal',              // 'normal' | 'incident'
    // Counters — monotonically increasing totals, with per-label-set series
    counters: {
      http_requests_total: new Map(),  // labelKey -> { labels, value }
      errors_total: new Map(),
    },
    // Gauges — current values
    gauges: {
      active_connections: 12,
      queue_depth: 0,
    },
    // Histogram — bucketed counts of request durations
    // Keyed by labelKey -> { labels, buckets: number[] (cumulative), sum, count }
    histograms: {
      http_request_duration_seconds: new Map(),
    },
    // History: array of snapshots at each tick. Bounded to MAX_HISTORY_POINTS.
    history: [],
    // Recent logs (bounded)
    logs: [],
    // Recent traces (bounded)
    traces: [],
  };
}

function labelKeyOf(labels) {
  // Stable key from a labels object. Sorted for determinism.
  const keys = Object.keys(labels).sort();
  return keys.map(k => `${k}=${labels[k]}`).join(',');
}

function ensureCounterSeries(state, name, labels) {
  const key = labelKeyOf(labels);
  const map = state.counters[name];
  if (!map.has(key)) {
    map.set(key, { labels: { ...labels }, value: 0 });
  }
  return map.get(key);
}

function ensureHistogramSeries(state, name, labels) {
  const key = labelKeyOf(labels);
  const map = state.histograms[name];
  if (!map.has(key)) {
    const buckets = new Array(SIM.HISTOGRAM_BUCKETS_S.length).fill(0);
    map.set(key, { labels: { ...labels }, buckets, sum: 0, count: 0 });
  }
  return map.get(key);
}

function recordRequest(state, method, path, statusCode, latencyMs) {
  // Validate inputs at the boundary
  if (typeof method !== 'string' || method.length === 0) return;
  if (typeof path !== 'string' || path.length === 0) return;
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) return;
  if (!Number.isFinite(latencyMs) || latencyMs < 0) return;

  const status = String(statusCode);
  const labels = { method, path, status };
  const reqSeries = ensureCounterSeries(state, 'http_requests_total', labels);
  reqSeries.value += 1;

  if (statusCode >= 500) {
    const errSeries = ensureCounterSeries(state, 'errors_total', { method, path });
    errSeries.value += 1;
  }

  const histLabels = { method, path };
  const hist = ensureHistogramSeries(state, 'http_request_duration_seconds', histLabels);
  const latencyS = latencyMs / 1000;
  hist.sum += latencyS;
  hist.count += 1;
  // Cumulative bucket counts: bucket[i] counts requests with latency <= boundary[i]
  for (let i = 0; i < SIM.HISTOGRAM_BUCKETS_S.length; i++) {
    if (latencyS <= SIM.HISTOGRAM_BUCKETS_S[i]) hist.buckets[i] += 1;
  }
}

function pushBoundedLog(state, entry) {
  // Bounded log buffer — drop oldest beyond cap
  state.logs.push(entry);
  if (state.logs.length > SIM.MAX_LOG_ENTRIES) {
    state.logs.splice(0, state.logs.length - SIM.MAX_LOG_ENTRIES);
  }
}

function pushBoundedTrace(state, trace) {
  state.traces.push(trace);
  if (state.traces.length > SIM.MAX_TRACE_ENTRIES) {
    state.traces.splice(0, state.traces.length - SIM.MAX_TRACE_ENTRIES);
  }
}

function pushBoundedHistory(state, snap) {
  state.history.push(snap);
  if (state.history.length > SIM.MAX_HISTORY_POINTS) {
    state.history.splice(0, state.history.length - SIM.MAX_HISTORY_POINTS);
  }
}

/* ─── One simulation tick — generates one second of traffic ─── */
function simulateOneTick(state) {
  // Validate state shape minimally
  if (!state || !state.counters || !state.histograms) return state;

  const inIncident = state.mode === 'incident';
  // Baseline ~30 req/sec, incident bumps to ~50 req/sec with elevated errors
  const lambda = inIncident ? 50 : 30;
  const requestsThisSecond = Math.min(poissonSample(lambda), 200);

  // Bounded loop — requestsThisSecond is already clamped to <= 200
  for (let i = 0; i < requestsThisSecond; i++) {
    const method = SIM.METHODS[Math.floor(Math.random() * SIM.METHODS.length)];
    const path = SIM.PATHS[Math.floor(Math.random() * SIM.PATHS.length)];

    // Latency: exponential with scale=80ms normal, 250ms in incident
    const scaleMs = inIncident ? 250 : 80;
    const latencyMs = clamp(exponentialLatencyMs(scaleMs), 1, 10000);

    // Error probability: 0.5% normal, 8% during incident
    const errorProb = inIncident ? 0.08 : 0.005;
    const isError = Math.random() < errorProb;
    const statusCode = isError ? 500 : 200;

    recordRequest(state, method, path, statusCode, latencyMs);

    // Sample logs (record ~5% as logs to avoid flooding the UI)
    if (Math.random() < 0.05 || isError) {
      const traceId = randomHexId(128);
      const spanId = randomHexId(64);
      pushBoundedLog(state, {
        ts: nowMs(),
        level: isError ? 'ERROR' : 'INFO',
        msg: isError ? `request failed: ${method} ${path}` : `${method} ${path} ${statusCode}`,
        trace_id: traceId,
        span_id: spanId,
        attrs: { method, path, status: statusCode, latency_ms: Math.round(latencyMs) },
      });

      // Record a trace for ~half of those logs
      if (Math.random() < 0.5) {
        pushBoundedTrace(state, {
          trace_id: traceId,
          root_name: `${method} ${path}`,
          duration_ms: Math.round(latencyMs),
          status: isError ? 'error' : 'ok',
          spans: makeSampleSpans(method, path, latencyMs, isError),
          ts: nowMs(),
        });
      }
    }
  }

  // Update gauges
  state.gauges.active_connections = Math.round(clamp(
    state.gauges.active_connections + (Math.random() - 0.5) * 4,
    0,
    inIncident ? 200 : 50
  ));
  state.gauges.queue_depth = Math.round(clamp(
    state.gauges.queue_depth + (inIncident ? Math.random() * 5 : -Math.random() * 2),
    0,
    inIncident ? 100 : 5
  ));

  // Snapshot for history
  pushBoundedHistory(state, snapshotForHistory(state));

  return state;
}

function snapshotForHistory(state) {
  // Compute aggregated values for THIS tick. Used for sparkline plotting.
  let totalRequests = 0;
  let totalErrors = 0;
  for (const s of state.counters.http_requests_total.values()) totalRequests += s.value;
  for (const s of state.counters.errors_total.values()) totalErrors += s.value;

  // p99 latency over all histograms — quick approximation by summing buckets
  const aggBuckets = new Array(SIM.HISTOGRAM_BUCKETS_S.length).fill(0);
  let aggSum = 0;
  let aggCount = 0;
  for (const s of state.histograms.http_request_duration_seconds.values()) {
    for (let i = 0; i < aggBuckets.length; i++) aggBuckets[i] += s.buckets[i];
    aggSum += s.sum;
    aggCount += s.count;
  }
  const p99 = computeQuantileFromBuckets(0.99, aggBuckets, aggCount);
  const p50 = computeQuantileFromBuckets(0.50, aggBuckets, aggCount);

  return {
    ts: nowMs(),
    totalRequests,
    totalErrors,
    p50_ms: p50 * 1000,
    p99_ms: p99 * 1000,
    active_connections: state.gauges.active_connections,
    queue_depth: state.gauges.queue_depth,
  };
}

function computeQuantileFromBuckets(q, buckets, totalCount) {
  if (!Number.isFinite(q) || q < 0 || q > 1) return 0;
  if (totalCount <= 0) return 0;
  const target = q * totalCount;
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i] >= target) return SIM.HISTOGRAM_BUCKETS_S[i];
  }
  return SIM.HISTOGRAM_BUCKETS_S[SIM.HISTOGRAM_BUCKETS_S.length - 1];
}

function makeSampleSpans(method, path, latencyMs, isError) {
  // Generate a small, plausible span tree for one request
  const totalMs = Math.round(latencyMs);
  const dbMs = Math.max(1, Math.round(totalMs * 0.4));
  const cacheMs = Math.max(1, Math.round(totalMs * 0.05));
  return [
    { name: `${method} ${path}`, ms: totalMs, status: isError ? 'error' : 'ok', depth: 0 },
    { name: 'auth.validate', ms: Math.max(1, Math.round(totalMs * 0.05)), status: 'ok', depth: 1 },
    { name: 'cache.get', ms: cacheMs, status: 'ok', depth: 1 },
    { name: 'db.query', ms: dbMs, status: isError ? 'error' : 'ok', depth: 1 },
    { name: 'db.tx.checkout', ms: Math.max(1, Math.round(dbMs * 0.6)), status: isError ? 'error' : 'ok', depth: 2 },
    { name: 'response.serialize', ms: Math.max(1, Math.round(totalMs * 0.05)), status: 'ok', depth: 1 },
  ];
}

/* ═══════════════════════════════════════════════════════════════
   PROMQL EVALUATOR — a small, validated subset
   Supports: metric names, label selectors, rate(), sum(), avg(),
   max(), min(), count(), histogram_quantile(), arithmetic, "by (...)"
   ═══════════════════════════════════════════════════════════════ */

/* ─── Tokenizer (bounded; rejects malformed input) ─── */
function tokenizePromQL(input) {
  if (typeof input !== 'string') throw new Error('PromQL: input must be string');
  if (input.length > 1000) throw new Error('PromQL: input too long (max 1000 chars)');

  const tokens = [];
  let i = 0;
  const N = input.length;
  let safety = 0;
  while (i < N) {
    safety += 1;
    if (safety > 5000) throw new Error('PromQL: tokenizer safety limit exceeded');
    const c = input[i];
    if (c === ' ' || c === '\t' || c === '\n') { i++; continue; }
    if (/[a-zA-Z_:]/.test(c)) {
      let j = i;
      while (j < N && /[a-zA-Z0-9_:]/.test(input[j])) j++;
      tokens.push({ type: 'IDENT', value: input.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < N && /[0-9.]/.test(input[j])) j++;
      tokens.push({ type: 'NUMBER', value: parseFloat(input.slice(i, j)) });
      i = j;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      while (j < N && input[j] !== '"') j++;
      if (j >= N) throw new Error('PromQL: unterminated string');
      tokens.push({ type: 'STRING', value: input.slice(i + 1, j) });
      i = j + 1;
      continue;
    }
    // Two-char operators first
    const two = input.slice(i, i + 2);
    if (two === '!=' || two === '=~' || two === '!~' || two === '==') {
      tokens.push({ type: 'OP', value: two });
      i += 2;
      continue;
    }
    if ('={}[]()+-*/,'.includes(c)) {
      tokens.push({ type: c });
      i += 1;
      continue;
    }
    throw new Error(`PromQL: unexpected character '${c}' at position ${i}`);
  }
  tokens.push({ type: 'EOF' });
  return tokens;
}

/* ─── Parser — produces AST ─── */
function parsePromQL(input) {
  const tokens = tokenizePromQL(input);
  let pos = 0;
  const peek = (off = 0) => tokens[pos + off];
  const eat = () => tokens[pos++];
  const expect = (type) => {
    const t = eat();
    if (t.type !== type) throw new Error(`PromQL: expected ${type}, got ${t.type}`);
    return t;
  };

  function parsePrimary() {
    const t = peek();
    if (t.type === 'NUMBER') { eat(); return { kind: 'Number', value: t.value }; }
    if (t.type === '(') {
      eat();
      const expr = parseExpr();
      expect(')');
      return expr;
    }
    if (t.type === 'IDENT') {
      // Handle PromQL aggregator prefix form: "sum by (label) (expr)"
      const AGGREGATORS = ['sum', 'avg', 'max', 'min', 'count'];
      if (AGGREGATORS.includes(t.value) &&
          tokens[pos + 1] && tokens[pos + 1].type === 'IDENT' &&
          tokens[pos + 1].value === 'by') {
        eat();  // aggregator
        eat();  // by
        expect('(');
        const by = [];
        // Bounded loop — label list has at most a few entries; cap defensively
        let safety = 0;
        while (peek().type !== ')') {
          safety++;
          if (safety > 100) throw new Error('PromQL: too many group-by labels');
          by.push(expect('IDENT').value);
          if (peek().type === ',') eat();
        }
        expect(')');
        expect('(');
        const args = [parseExpr()];
        while (peek().type === ',') { eat(); args.push(parseExpr()); }
        expect(')');
        return { kind: 'Call', name: t.value, args, by };
      }

      eat();
      // function call?
      if (peek().type === '(') {
        // Could be aggregation with "by (...)" or just function call
        eat(); // (
        const args = [];
        if (peek().type !== ')') {
          args.push(parseExpr());
          while (peek().type === ',') { eat(); args.push(parseExpr()); }
        }
        expect(')');
        // optional by (...)
        let by = null;
        if (peek().type === 'IDENT' && peek().value === 'by') {
          eat(); expect('(');
          by = [];
          while (peek().type !== ')') {
            const n = expect('IDENT');
            by.push(n.value);
            if (peek().type === ',') eat();
          }
          expect(')');
        }
        return { kind: 'Call', name: t.value, args, by };
      }
      // bare metric selector — may have {labels} and/or [duration]
      let labels = {};
      let labelOps = {};   // op per label (=, !=, =~, !~)
      if (peek().type === '{') {
        eat();
        while (peek().type !== '}') {
          const name = expect('IDENT').value;
          let op = '=';
          if (peek().type === '=') eat();
          else if (peek().type === 'OP') { op = eat().value; }
          else throw new Error('PromQL: expected = or != or =~ in label selector');
          const value = expect('STRING').value;
          labels[name] = value;
          labelOps[name] = op;
          if (peek().type === ',') eat();
        }
        expect('}');
      }
      let range = null;
      if (peek().type === '[') {
        eat();
        // Duration literals like "1m", "30s", "1h" tokenize as NUMBER + IDENT.
        // Combine them into a single duration string.
        if (peek().type !== 'NUMBER') throw new Error('PromQL: duration requires a number');
        const n = eat().value;
        if (peek().type !== 'IDENT') throw new Error('PromQL: duration requires a unit');
        const unit = eat().value;
        range = `${n}${unit}`;
        expect(']');
      }
      return { kind: 'Selector', name: t.value, labels, labelOps, range };
    }
    throw new Error(`PromQL: unexpected token ${t.type}`);
  }

  function parseMul() {
    let left = parsePrimary();
    while (peek().type === '*' || peek().type === '/') {
      const op = eat().type;
      const right = parsePrimary();
      left = { kind: 'Binary', op, left, right };
    }
    return left;
  }

  function parseExpr() {
    let left = parseMul();
    while (peek().type === '+' || peek().type === '-') {
      const op = eat().type;
      const right = parseMul();
      left = { kind: 'Binary', op, left, right };
    }
    return left;
  }

  const ast = parseExpr();
  if (peek().type !== 'EOF') throw new Error('PromQL: extra input after expression');
  return ast;
}

/* ─── Evaluator — walks the AST against a sim state snapshot ─── */
function durationToSeconds(s) {
  if (typeof s !== 'string' || s.length < 2) throw new Error('PromQL: bad duration');
  const unit = s[s.length - 1];
  const n = parseInt(s.slice(0, -1), 10);
  if (!Number.isFinite(n)) throw new Error(`PromQL: bad duration '${s}'`);
  if (unit === 's') return n;
  if (unit === 'm') return n * 60;
  if (unit === 'h') return n * 3600;
  throw new Error(`PromQL: unsupported duration unit '${unit}'`);
}

function matchLabels(seriesLabels, sel, ops) {
  // Returns true iff seriesLabels satisfies selector.
  for (const key of Object.keys(sel)) {
    const want = sel[key];
    const got = seriesLabels[key];
    const op = ops[key] || '=';
    if (op === '=') { if (got !== want) return false; }
    else if (op === '!=') { if (got === want) return false; }
    else if (op === '=~') {
      try { if (!new RegExp(`^${want}$`).test(got || '')) return false; }
      catch (e) { throw new Error('PromQL: bad regex'); }
    }
    else if (op === '!~') {
      try { if (new RegExp(`^${want}$`).test(got || '')) return false; }
      catch (e) { throw new Error('PromQL: bad regex'); }
    }
  }
  return true;
}

function selectorSeriesValues(state, ast) {
  // Returns [{labels, value}] for an instant selector.
  const results = [];
  const ops = ast.labelOps || {};

  // Counters
  if (state.counters[ast.name]) {
    for (const s of state.counters[ast.name].values()) {
      if (matchLabels(s.labels, ast.labels, ops)) {
        results.push({ labels: s.labels, value: s.value });
      }
    }
    return results;
  }
  // Histogram special bucket form: name_bucket{le="..."}
  if (ast.name.endsWith('_bucket')) {
    const base = ast.name.slice(0, -'_bucket'.length);
    if (state.histograms[base]) {
      for (const s of state.histograms[base].values()) {
        const wantLe = ast.labels.le;
        for (let i = 0; i < SIM.HISTOGRAM_BUCKETS_S.length; i++) {
          const le = String(SIM.HISTOGRAM_BUCKETS_S[i]);
          if (wantLe && le !== wantLe) continue;
          const labels = { ...s.labels, le };
          if (matchLabels(labels, ast.labels, ops)) {
            results.push({ labels, value: s.buckets[i] });
          }
        }
      }
      return results;
    }
  }
  // Gauges
  if (state.gauges[ast.name] !== undefined) {
    results.push({ labels: {}, value: state.gauges[ast.name] });
    return results;
  }
  // Histogram count and sum convenience: name_count, name_sum
  if (ast.name.endsWith('_count')) {
    const base = ast.name.slice(0, -'_count'.length);
    if (state.histograms[base]) {
      for (const s of state.histograms[base].values()) {
        if (matchLabels(s.labels, ast.labels, ops)) {
          results.push({ labels: s.labels, value: s.count });
        }
      }
      return results;
    }
  }
  if (ast.name.endsWith('_sum')) {
    const base = ast.name.slice(0, -'_sum'.length);
    if (state.histograms[base]) {
      for (const s of state.histograms[base].values()) {
        if (matchLabels(s.labels, ast.labels, ops)) {
          results.push({ labels: s.labels, value: s.sum });
        }
      }
      return results;
    }
  }
  return results;
}

function rateAcrossHistory(state, ast) {
  // rate(metric[duration]) — approximate as (current - first-in-window) / windowSeconds
  if (!ast.range) throw new Error('PromQL: rate() requires a range vector');
  const winSec = durationToSeconds(ast.range);
  const winMs = winSec * 1000;
  const nowT = nowMs();
  // Use history for total counter value at window-start; current is now.
  // For simplicity, sum across all matching series and use the earliest snapshot still in history.
  const current = selectorSeriesValues(state, ast).reduce((a, b) => a + b.value, 0);
  // Snapshot back winSec ago — pick history entry with ts >= nowT - winMs
  const cutoff = nowT - winMs;
  const winStart = state.history.find(h => h.ts >= cutoff);
  if (!winStart) {
    // not enough history — return 0 (per-second; can't compute reliably yet)
    return [{ labels: {}, value: 0 }];
  }
  // Approximate value-at-window-start: assume requests grew linearly => first ≈ current - winSec * recent_rate
  // We don't have per-series history (tradeoff for simplicity). Use total-requests history as proxy.
  if (ast.name === 'http_requests_total') {
    const startTotal = winStart.totalRequests;
    const currentTotal = state.history.length ? state.history[state.history.length - 1].totalRequests : current;
    const elapsedSec = Math.max(1, (nowT - winStart.ts) / 1000);
    return [{ labels: {}, value: (currentTotal - startTotal) / elapsedSec }];
  }
  if (ast.name === 'errors_total') {
    const startTotal = winStart.totalErrors;
    const currentTotal = state.history.length ? state.history[state.history.length - 1].totalErrors : current;
    const elapsedSec = Math.max(1, (nowT - winStart.ts) / 1000);
    return [{ labels: {}, value: (currentTotal - startTotal) / elapsedSec }];
  }
  // Fallback: return current value over winSec
  return [{ labels: {}, value: current / Math.max(1, winSec) }];
}

function aggregate(values, fn, by) {
  // Group by 'by' labels, apply fn to each group's values.
  const groups = new Map();
  for (const v of values) {
    const groupLabels = {};
    if (by) for (const k of by) if (v.labels[k] !== undefined) groupLabels[k] = v.labels[k];
    const key = labelKeyOf(groupLabels);
    if (!groups.has(key)) groups.set(key, { labels: groupLabels, values: [] });
    groups.get(key).values.push(v.value);
  }
  const out = [];
  for (const g of groups.values()) {
    let value;
    if (fn === 'sum') value = g.values.reduce((a, b) => a + b, 0);
    else if (fn === 'avg') value = g.values.reduce((a, b) => a + b, 0) / Math.max(1, g.values.length);
    else if (fn === 'max') value = Math.max(...g.values);
    else if (fn === 'min') value = Math.min(...g.values);
    else if (fn === 'count') value = g.values.length;
    else throw new Error(`PromQL: unsupported aggregation '${fn}'`);
    out.push({ labels: g.labels, value });
  }
  return out;
}

function evalPromQL(ast, state) {
  if (!ast || !state) throw new Error('PromQL: missing ast or state');

  if (ast.kind === 'Number') return [{ labels: {}, value: ast.value }];

  if (ast.kind === 'Selector') {
    if (ast.range) {
      // bare range vector outside of a function is not valid in real PromQL,
      // but for sandbox forgiveness we treat it as instant
      return selectorSeriesValues(state, ast);
    }
    return selectorSeriesValues(state, ast);
  }

  if (ast.kind === 'Binary') {
    const left = evalPromQL(ast.left, state);
    const right = evalPromQL(ast.right, state);
    // For sandbox we handle scalar-on-vector and vector-on-scalar simply
    const op = ast.op;
    const apply = (a, b) => {
      if (op === '+') return a + b;
      if (op === '-') return a - b;
      if (op === '*') return a * b;
      if (op === '/') return b === 0 ? 0 : a / b;
      throw new Error(`PromQL: bad operator ${op}`);
    };
    if (left.length === 1 && right.length === 1) {
      return [{ labels: {}, value: apply(left[0].value, right[0].value) }];
    }
    if (left.length === 1) {
      return right.map(r => ({ labels: r.labels, value: apply(left[0].value, r.value) }));
    }
    if (right.length === 1) {
      return left.map(l => ({ labels: l.labels, value: apply(l.value, right[0].value) }));
    }
    // For sandbox, join by-labels match implicitly
    const result = [];
    for (const l of left) {
      for (const r of right) {
        if (labelKeyOf(l.labels) === labelKeyOf(r.labels)) {
          result.push({ labels: l.labels, value: apply(l.value, r.value) });
        }
      }
    }
    return result;
  }

  if (ast.kind === 'Call') {
    const name = ast.name;
    if (name === 'rate') {
      if (ast.args.length !== 1 || ast.args[0].kind !== 'Selector') {
        throw new Error('PromQL: rate() takes one selector with a range');
      }
      return rateAcrossHistory(state, ast.args[0]);
    }
    if (['sum', 'avg', 'max', 'min', 'count'].includes(name)) {
      const inner = evalPromQL(ast.args[0], state);
      return aggregate(inner, name, ast.by);
    }
    if (name === 'histogram_quantile') {
      if (ast.args.length !== 2) throw new Error('PromQL: histogram_quantile(q, vector)');
      const qVals = evalPromQL(ast.args[0], state);
      const q = qVals.length ? qVals[0].value : 0.5;
      const bucketsAll = evalPromQL(ast.args[1], state);
      // Group by 'by' from outer or default by all non-le labels
      const groups = new Map();
      for (const b of bucketsAll) {
        const groupLabels = {};
        for (const k of Object.keys(b.labels)) if (k !== 'le') groupLabels[k] = b.labels[k];
        const key = labelKeyOf(groupLabels);
        if (!groups.has(key)) groups.set(key, { labels: groupLabels, buckets: [], count: 0 });
        const le = parseFloat(b.labels.le);
        groups.get(key).buckets.push({ le, count: b.value });
        groups.get(key).count = Math.max(groups.get(key).count, b.value);
      }
      const out = [];
      for (const g of groups.values()) {
        g.buckets.sort((a, b) => a.le - b.le);
        const total = g.buckets.length ? g.buckets[g.buckets.length - 1].count : 0;
        if (total === 0) { out.push({ labels: g.labels, value: 0 }); continue; }
        const target = q * total;
        let chosen = g.buckets[g.buckets.length - 1].le;
        for (const b of g.buckets) {
          if (b.count >= target) { chosen = b.le; break; }
        }
        out.push({ labels: g.labels, value: chosen });
      }
      return out;
    }
    throw new Error(`PromQL: unsupported function '${name}'`);
  }

  throw new Error(`PromQL: unsupported node '${ast.kind}'`);
}

function evaluatePromQLSafe(query, state) {
  // Public entry — validates inputs, returns { ok, result, error }.
  if (typeof query !== 'string') return { ok: false, error: 'query must be a string', result: null };
  const trimmed = query.trim();
  if (trimmed.length === 0) return { ok: false, error: 'empty query', result: null };
  try {
    const ast = parsePromQL(trimmed);
    const result = evalPromQL(ast, state);
    return { ok: true, result, error: null };
  } catch (e) {
    return { ok: false, error: e.message || String(e), result: null };
  }
}

/* ─── Sandbox challenges ─── */
const CHALLENGES = [
  { id: 'count', title: '01 · Count of requests', desc: "Query the raw http_requests_total counter. Try: http_requests_total", check: r => r.length > 0 && r[0].value > 0 },
  { id: 'rate', title: '02 · Per-second rate', desc: "Use rate() over a window. Try: rate(http_requests_total[1m])", check: r => r.length === 1 && r[0].value > 0 },
  { id: 'errors', title: '03 · Error rate', desc: "Compute errors per second. Try: rate(errors_total[1m])", check: r => r.length >= 1 },
  { id: 'sum', title: '04 · Aggregate', desc: "Sum across all series. Try: sum(http_requests_total)", check: r => r.length === 1 },
  { id: 'sum-by', title: '05 · Sum by label', desc: "Group sums by method. Try: sum by (method) (http_requests_total)", check: r => r.length >= 1 && r[0].labels.method !== undefined },
  { id: 'p99', title: '06 · p99 latency', desc: "Compute p99 from histogram. Try: histogram_quantile(0.99, sum by (le) (http_request_duration_seconds_bucket))", check: r => r.length >= 1 && r[0].value > 0 },
  { id: 'error-ratio', title: '07 · Error ratio', desc: "Errors divided by total. Try: sum(rate(errors_total[1m])) / sum(rate(http_requests_total[1m]))", check: r => r.length === 1 },
  { id: 'incident', title: '08 · Trigger incident', desc: "Hit 'TRIGGER INCIDENT' and watch the metrics react. Then write a query showing the error spike.", check: () => true },
];

/* ─── Storage helpers (validated, no silent catches) ─── */
const STORAGE_PREFIX = 'obsatlas:';

async function loadKey(key) {
  if (typeof key !== 'string' || key.length === 0) return null;
  try {
    const result = await window.storage.get(STORAGE_PREFIX + key);
    if (!result || typeof result.value !== 'string') return null;
    return JSON.parse(result.value);
  } catch (e) {
    // NASA-light: never silent — surface storage errors with context
    console.warn(`[obsatlas] storage.get failed for "${key}":`, e?.message || e);
    return null;
  }
}

async function saveKey(key, value) {
  if (typeof key !== 'string' || key.length === 0) return false;
  try {
    await window.storage.set(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[obsatlas] storage.set failed for "${key}":`, e?.message || e);
    return false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function ObservabilityAtlas() {
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
      if (Array.isArray(c)) setCompleted(new Set(c));
      if (cl && typeof cl === 'object') setChecklist(cl);
      if (qs && typeof qs === 'object') setQuizState(qs);
      if (typeof st === 'string') setStack(st);
      if (typeof as === 'number' && as >= 0 && as < SECTIONS.length) setActiveSection(as);
      if (!st) setShowOnboarding(true);
      setLoaded(true);
    })();
    return () => { try { document.head.removeChild(link); } catch (e) { /* link may already be gone on hot-reload */ } };
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
    if (typeof text !== 'string') return;
    navigator.clipboard.writeText(text).catch(e => console.warn('[obsatlas] copy failed:', e?.message));
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };
  const toggleCheck = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const markComplete = (i) => setCompleted(prev => new Set([...prev, i]));
  const answerQuiz = (qid, choice, correct) => {
    setQuizState(prev => ({ ...prev, [qid]: { choice, correct: choice === correct } }));
  };

  /* ─── UI primitives ─── */
  const Code = ({ children, id, lang = 'yaml' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
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
    const palette = {
      info: { border: 'border-cyan-300/40', bg: 'bg-cyan-300/5', text: 'text-cyan-300', label: 'NOTE' },
      warn: { border: 'border-rose-400/50', bg: 'bg-rose-400/5', text: 'text-rose-300', label: 'GOTCHA' },
      tip: { border: 'border-amber-300/40', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'TIP' },
      you: { border: 'border-fuchsia-300/40', bg: 'bg-fuchsia-300/5', text: 'text-fuchsia-200', label: 'FOR YOUR STACK' },
      cite: { border: 'border-zinc-700', bg: 'bg-zinc-900/40', text: 'text-zinc-400', label: 'CITATION' },
      dont: { border: 'border-rose-500/60', bg: 'bg-rose-500/10', text: 'text-rose-300', label: 'DO NOT' },
    }[kind] || { border: 'border-zinc-700', bg: 'bg-zinc-900/40', text: 'text-zinc-400', label: 'NOTE' };
    return (
      <div className={`my-4 border ${palette.border} ${palette.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${palette.text} mb-1.5 flex items-center gap-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {kind === 'cite' && <Quote size={10} />}
          {kind === 'warn' && <AlertTriangle size={10} />}
          {kind === 'dont' && <XCircle size={10} />}
          {title || palette.label}
        </div>
        <div className="text-zinc-300 text-[14px] leading-relaxed">{children}</div>
      </div>
    );
  };

  const ComparisonTable = ({ data }) => (
    <div className="my-4 border border-zinc-800 overflow-x-auto">
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ▤ {data.title}
      </div>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900/50">
            {data.headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-[11px] uppercase tracking-wider text-zinc-500 font-normal" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, ri) => (
            <tr key={ri} className="border-b border-zinc-900 last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-cyan-300' : 'text-zinc-300'}`}
                    style={ci === 0 ? { fontFamily: 'JetBrains Mono, monospace' } : {}}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const CheckItem = ({ id, children }) => (
    <button onClick={() => toggleCheck(id)} className="flex items-start gap-3 w-full text-left py-2 hover:bg-zinc-900/50 px-2 -mx-2 transition-colors">
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-cyan-300 border-cyan-300' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-rose-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          CHECK · {quiz.qid.toUpperCase()}
        </div>
        <div className="text-zinc-100 text-[15px] mb-3 whitespace-pre-wrap">{quiz.q}</div>
        <div className="space-y-1.5">
          {quiz.opts.map((opt, i) => {
            const isChosen = state?.choice === i;
            const isCorrect = i === quiz.a;
            const reveal = !!state;
            return (
              <button key={i} onClick={() => !state && answerQuiz(quiz.qid, i, quiz.a)} disabled={!!state}
                className={`w-full text-left px-3 py-2 border text-[13px] transition-colors flex items-center gap-2 ${
                  reveal && isCorrect ? 'border-cyan-300 bg-cyan-300/10 text-cyan-300' :
                  reveal && isChosen && !isCorrect ? 'border-rose-400 bg-rose-400/10 text-rose-200' :
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
        className="border-b border-dotted border-cyan-300/60 text-cyan-300 hover:text-cyan-200 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-cyan-300 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* Observability stack diagram — apps emit telemetry → Collector → backends → Grafana → on-call */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap a stage · app → SDK → Collector → backends → Grafana → on-call
        </div>
        <svg viewBox="0 0 290 270" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="obsarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          <line x1="90" y1="44" x2="110" y2="44" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="145" y1="58" x2="145" y2="90" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="120" y1="118" x2="55" y2="160" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="145" y1="118" x2="145" y2="160" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="170" y1="118" x2="235" y2="160" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="55" y1="188" x2="120" y2="222" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="145" y1="188" x2="145" y2="220" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="235" y1="188" x2="170" y2="222" stroke="#52525b" markerEnd="url(#obsarr)" />
          <line x1="180" y1="234" x2="200" y2="234" stroke="#52525b" markerEnd="url(#obsarr)" />
          {ARCH_NODES.map(n => {
            const isSel = archSelected === n.id;
            return (
              <g key={n.id} onClick={() => setArchSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={isSel ? n.color + '30' : n.color + '12'} stroke={n.color}
                  strokeWidth={isSel ? '2' : '1'} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle"
                  fill="#e4e4e7" fontSize="11"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-cyan-300/30 bg-cyan-300/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-cyan-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: Live telemetry simulator with PromQL evaluation ─── */
  const Sandbox = () => {
    const [running, setRunning] = useState(false);
    const [tickCount, setTickCount] = useState(0);
    const [query, setQuery] = useState('sum by (status) (http_requests_total)');
    const [queryResult, setQueryResult] = useState({ ok: true, result: [], error: null });
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];
    const [view, setView] = useState('dashboard');

    const simRef = useRef(makeEmptySimState());
    const intervalRef = useRef(null);

    useEffect(() => {
      if (!running) return undefined;
      intervalRef.current = setInterval(() => {
        simulateOneTick(simRef.current);
        setTickCount(c => c + 1);
      }, SIM.TICK_MS);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      };
    }, [running]);

    useEffect(() => {
      const r = evaluatePromQLSafe(query, simRef.current);
      setQueryResult(r);
    }, [tickCount, query]);

    const start = () => {
      simRef.current = makeEmptySimState();
      setTickCount(0);
      setRunning(true);
    };
    const stop = () => setRunning(false);
    const triggerIncident = () => { if (simRef.current) simRef.current.mode = 'incident'; };
    const restoreNormal = () => { if (simRef.current) simRef.current.mode = 'normal'; };

    const seedQuery = (idx) => {
      const seeds = [
        'http_requests_total',
        'rate(http_requests_total[1m])',
        'rate(errors_total[1m])',
        'sum(http_requests_total)',
        'sum by (method) (http_requests_total)',
        'histogram_quantile(0.99, sum by (le) (http_request_duration_seconds_bucket))',
        'sum(rate(errors_total[1m])) / sum(rate(http_requests_total[1m]))',
        'rate(errors_total[1m])',
      ];
      if (seeds[idx]) setQuery(seeds[idx]);
      setChallengeIdx(idx);
    };

    const snap = simRef.current.history.length
      ? simRef.current.history[simRef.current.history.length - 1]
      : null;
    const mode = simRef.current.mode;

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE · checkout-api</span>
            <span className={running ? 'text-cyan-300 animate-pulse' : 'text-zinc-600'}>●</span>
            <span className={mode === 'incident' ? 'text-rose-400 font-bold' : 'text-zinc-500'}>
              {mode === 'incident' ? 'INCIDENT' : 'NORMAL'}
            </span>
          </div>
          <div className="flex gap-1">
            {!running ? (
              <button onClick={start} className="text-[11px] px-2 py-1 border border-cyan-300 text-cyan-300 bg-cyan-300/10 hover:bg-cyan-300/20 flex items-center gap-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Play size={11} /> start
              </button>
            ) : (
              <button onClick={stop} className="text-[11px] px-2 py-1 border border-zinc-700 text-zinc-400 hover:border-zinc-500 flex items-center gap-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Pause size={11} /> pause
              </button>
            )}
            {mode === 'normal' ? (
              <button onClick={triggerIncident} disabled={!running} className="text-[11px] px-2 py-1 border border-rose-400 text-rose-300 bg-rose-400/10 hover:bg-rose-400/20 disabled:opacity-40 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                TRIGGER INCIDENT
              </button>
            ) : (
              <button onClick={restoreNormal} disabled={!running} className="text-[11px] px-2 py-1 border border-cyan-300 text-cyan-300 bg-cyan-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                resolve incident
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-zinc-800 divide-x divide-zinc-800">
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>requests</div>
            <div className="text-[20px] font-bold text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{snap?.totalRequests ?? 0}</div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>errors</div>
            <div className={`text-[20px] font-bold ${snap?.totalErrors > 5 ? 'text-rose-400' : 'text-zinc-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{snap?.totalErrors ?? 0}</div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>p50 latency</div>
            <div className="text-[20px] font-bold text-zinc-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{snap ? Math.round(snap.p50_ms) : 0}<span className="text-[12px] text-zinc-600">ms</span></div>
          </div>
          <div className="px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>p99 latency</div>
            <div className={`text-[20px] font-bold ${snap?.p99_ms > 1000 ? 'text-rose-400' : 'text-amber-200'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{snap ? Math.round(snap.p99_ms) : 0}<span className="text-[12px] text-zinc-600">ms</span></div>
          </div>
        </div>

        <div className="px-3 py-2 border-b border-zinc-800 flex gap-1 flex-wrap">
          {[
            { id: 'dashboard', label: 'PromQL' },
            { id: 'logs', label: 'Logs' },
            { id: 'traces', label: 'Traces' },
          ].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              className={`text-[11px] px-2 py-1 border ${view === t.id ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-700 text-zinc-500'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.label}</button>
          ))}
        </div>

        {view === 'dashboard' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => seedQuery(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.title.split(' · ')[0]}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[13px] text-zinc-300 leading-relaxed">{challenge.desc}</div>
            </div>

            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>PROMQL QUERY</div>
              <input value={query} onChange={e => setQuery(e.target.value)} spellCheck={false}
                className="w-full bg-black border border-zinc-800 text-cyan-200 p-2 text-[13px] outline-none focus:border-cyan-300"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                placeholder="rate(http_requests_total[1m])" />
            </div>

            <div className="border-t border-zinc-800 bg-black">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-b border-zinc-800 flex items-center justify-between" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span>RESULT {!running && '(start the simulator)'}</span>
                {queryResult.ok && <span className="text-cyan-300">{queryResult.result.length} series</span>}
              </div>
              {!queryResult.ok && (
                <pre className="px-3 py-2 text-[12px] text-rose-300 whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{queryResult.error}</pre>
              )}
              {queryResult.ok && queryResult.result.length === 0 && (
                <div className="px-3 py-3 text-[12px] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  No matching series. {!running && 'Start the simulator to generate data.'}
                </div>
              )}
              {queryResult.ok && queryResult.result.length > 0 && (
                <div className="max-h-64 overflow-y-auto">
                  {queryResult.result.slice(0, 30).map((row, i) => (
                    <div key={i} className="px-3 py-1 border-b border-zinc-900 last:border-0 flex items-center gap-2 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <span className="text-zinc-400 flex-1 truncate">
                        {Object.keys(row.labels).length === 0
                          ? <span className="text-zinc-600">{'{}'}</span>
                          : <>{'{'}<span className="text-cyan-300">{Object.entries(row.labels).map(([k, v]) => `${k}="${v}"`).join(', ')}</span>{'}'}</>
                        }
                      </span>
                      <span className="text-amber-200 font-bold shrink-0">{typeof row.value === 'number' ? (Math.abs(row.value) > 100 ? row.value.toFixed(1) : row.value.toFixed(3)) : row.value}</span>
                    </div>
                  ))}
                  {queryResult.result.length > 30 && (
                    <div className="px-3 py-1 text-[10px] text-zinc-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      …{queryResult.result.length - 30} more series
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {view === 'logs' && (
          <div className="bg-black max-h-96 overflow-y-auto">
            {simRef.current.logs.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                No logs yet. {!running && 'Start the simulator.'}
              </div>
            )}
            {[...simRef.current.logs].reverse().map((log, i) => (
              <div key={i} className="px-3 py-1.5 border-b border-zinc-900 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-zinc-600 shrink-0">{new Date(log.ts).toISOString().slice(11, 23)}</span>
                  <span className={`shrink-0 font-bold ${log.level === 'ERROR' ? 'text-rose-400' : 'text-cyan-300'}`}>{log.level}</span>
                  <span className="text-zinc-300">{log.msg}</span>
                </div>
                <div className="text-zinc-600 text-[10px] mt-0.5 break-all">
                  trace_id={log.trace_id?.slice(0, 16)}… span_id={log.span_id?.slice(0, 8)}
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'traces' && (
          <div className="bg-black max-h-96 overflow-y-auto">
            {simRef.current.traces.length === 0 && (
              <div className="px-3 py-3 text-[12px] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                No traces yet. {!running && 'Start the simulator.'}
              </div>
            )}
            {[...simRef.current.traces].reverse().slice(0, 8).map((trace, i) => (
              <div key={i} className="px-3 py-2 border-b border-zinc-900">
                <div className="flex items-center gap-2 mb-1 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className={`shrink-0 font-bold ${trace.status === 'error' ? 'text-rose-400' : 'text-cyan-300'}`}>
                    {trace.status === 'error' ? '✗' : '✓'}
                  </span>
                  <span className="text-zinc-200">{trace.root_name}</span>
                  <span className="text-zinc-500 ml-auto">{trace.duration_ms}ms</span>
                </div>
                <div className="text-zinc-600 text-[10px] mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  trace_id={trace.trace_id.slice(0, 24)}…
                </div>
                <div className="space-y-0.5">
                  {trace.spans.map((sp, j) => (
                    <div key={j} className="flex items-center gap-2 text-[10px]" style={{ fontFamily: 'JetBrains Mono, monospace', paddingLeft: `${sp.depth * 16}px` }}>
                      <span className={`shrink-0 ${sp.status === 'error' ? 'text-rose-400' : 'text-zinc-500'}`}>
                        {sp.status === 'error' ? '✗' : '·'}
                      </span>
                      <span className="text-zinc-300 truncate">{sp.name}</span>
                      <span className="text-zinc-600 ml-auto shrink-0">{sp.ms}ms</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  /* ─── LIBRARY: instrumentation patterns and recipes ─── */
  const LIBRARY = {
    otel_sdk: {
      label: "OTel SDK", icon: "◉",
      snippets: [
        {
          id: 'otel-node', title: "Node.js — auto-instrumentation",
          desc: "Zero code changes. Install OTel packages, run with --require.",
          code: "// tracing.js — load via node --require ./tracing.js server.js\nconst { NodeSDK } = require('@opentelemetry/sdk-node');\nconst { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');\nconst { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');\n\nconst sdk = new NodeSDK({\n  traceExporter: new OTLPTraceExporter({ url: 'http://collector:4318/v1/traces' }),\n  instrumentations: [getNodeAutoInstrumentations()],\n  serviceName: 'checkout-api',\n});\nsdk.start();",
          note: "Covers Express, Fastify, Koa, http/https, gRPC, MongoDB, PostgreSQL, MySQL, Redis, AWS SDK, dozens more. Add manual spans for business logic on top."
        },
        {
          id: 'otel-python', title: "Python — auto-instrumentation",
          desc: "Single command instruments most apps.",
          code: "# Install\npip install opentelemetry-distro opentelemetry-exporter-otlp\nopentelemetry-bootstrap -a install\n\n# Configure via env vars (12-factor friendly)\nexport OTEL_SERVICE_NAME=checkout-api\nexport OTEL_EXPORTER_OTLP_ENDPOINT=http://collector:4318\nexport OTEL_TRACES_EXPORTER=otlp\nexport OTEL_METRICS_EXPORTER=otlp\nexport OTEL_LOGS_EXPORTER=otlp\n\n# Run\nopentelemetry-instrument python app.py",
          note: "OTel Python bootstrap detects installed libraries and instruments automatically. Covers FastAPI, Flask, Django, SQLAlchemy, psycopg2, redis-py, requests, httpx, boto3, kafka-python."
        },
      ],
    },
    structured_logs: {
      label: "Structured logging", icon: "▣",
      snippets: [
        {
          id: 'log-pino', title: "Node.js — pino with trace context",
          desc: "JSON logs with trace_id and span_id from the active OTel span.",
          code: "import pino from 'pino';\nimport { trace, context } from '@opentelemetry/api';\n\nconst logger = pino({\n  level: process.env.LOG_LEVEL || 'info',\n  formatters: {\n    log: (obj) => {\n      const span = trace.getSpan(context.active());\n      if (span) {\n        const sc = span.spanContext();\n        return { ...obj, trace_id: sc.traceId, span_id: sc.spanId };\n      }\n      return obj;\n    },\n  },\n});\n\nlogger.info({ user_id: '123', action: 'checkout' }, 'order placed');",
          note: "Every log line includes trace context. In Grafana/Loki, click a slow trace, query logs by trace_id, see exactly what happened. The killer integration."
        },
        {
          id: 'log-redact', title: "Redact secrets and PII",
          desc: "Configure your logger to scrub sensitive fields automatically.",
          code: "// pino built-in redaction\nconst logger = pino({\n  redact: {\n    paths: [\n      'password', '*.password',\n      'token', '*.token', 'authorization',\n      'req.headers.authorization', 'req.headers.cookie',\n      'credit_card', 'ssn', 'email',\n    ],\n    censor: '[REDACTED]',\n  },\n});\n\n// Python (structlog) — custom processor\ndef redact_sensitive(_, __, event_dict):\n    REDACT_KEYS = {'password', 'token', 'authorization', 'ssn', 'credit_card'}\n    for k in list(event_dict.keys()):\n        if k.lower() in REDACT_KEYS:\n            event_dict[k] = '[REDACTED]'\n    return event_dict",
          note: "Test redaction in CI. Add a test that constructs a log with sensitive fields and asserts the output doesn't contain secret values. Audit periodically."
        },
      ],
    },
    metrics_lib: {
      label: "Metrics", icon: "▥",
      snippets: [
        {
          id: 'metrics-prom-node', title: "Node.js — prom-client",
          desc: "Counter, Histogram, Gauge with cardinality discipline.",
          code: "import { Counter, Histogram, Gauge, register } from 'prom-client';\n\nconst httpRequests = new Counter({\n  name: 'http_requests_total',\n  help: 'Total HTTP requests',\n  labelNames: ['method', 'route', 'status_code'],  // LOW CARDINALITY ONLY\n});\n\nconst httpDuration = new Histogram({\n  name: 'http_request_duration_seconds',\n  help: 'HTTP request latency',\n  labelNames: ['method', 'route'],\n  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],\n});\n\napp.use((req, res, next) => {\n  const end = httpDuration.startTimer({ method: req.method, route: req.route?.path });\n  res.on('finish', () => {\n    end();\n    httpRequests.inc({ method: req.method, route: req.route?.path, status_code: res.statusCode });\n  });\n  next();\n});\n\napp.get('/metrics', async (req, res) => {\n  res.set('Content-Type', register.contentType);\n  res.end(await register.metrics());\n});",
          note: "Use req.route.path (e.g. '/users/:id') NOT req.url (e.g. '/users/12345') as label — first is bounded, second explodes cardinality. user_id, request_id, full URL are NEVER labels."
        },
      ],
    },
    traces_lib: {
      label: "Traces", icon: "⤳",
      snippets: [
        {
          id: 'trace-spans', title: "Manual spans for business logic",
          desc: "Add spans around interesting work the auto-instrumentation can't see.",
          code: "import { trace, SpanStatusCode } from '@opentelemetry/api';\nconst tracer = trace.getTracer('checkout-api');\n\nasync function processOrder(orderId) {\n  return await tracer.startActiveSpan('processOrder', async (span) => {\n    try {\n      span.setAttribute('order.id', orderId);\n      span.setAttribute('order.value_cents', order.totalCents);\n\n      const payment = await tracer.startActiveSpan('charge_payment', async (s) => {\n        try {\n          const result = await chargePayment(order);\n          s.setAttribute('payment.method', result.method);\n          return result;\n        } catch (e) {\n          s.recordException(e);\n          s.setStatus({ code: SpanStatusCode.ERROR, message: e.message });\n          throw e;\n        } finally { s.end(); }\n      });\n      return payment;\n    } catch (e) {\n      span.recordException(e);\n      span.setStatus({ code: SpanStatusCode.ERROR, message: e.message });\n      throw e;\n    } finally { span.end(); }\n  });\n}",
          note: "Always call span.end() in finally. recordException makes errors searchable. Use low-cardinality attribute keys; never put user_id or request_id as a span attribute key (value is fine)."
        },
      ],
    },
    collector_cfg: {
      label: "Collector configs", icon: "◇",
      snippets: [
        {
          id: 'collector-base', title: "Basic OTel Collector pipeline",
          desc: "Receive OTLP, batch, export to backend. The starting point.",
          code: "receivers:\n  otlp:\n    protocols:\n      grpc: { endpoint: 0.0.0.0:4317 }\n      http: { endpoint: 0.0.0.0:4318 }\n\nprocessors:\n  memory_limiter:\n    check_interval: 1s\n    limit_mib: 1500\n  batch:\n    timeout: 10s\n    send_batch_size: 1024\n  resource:\n    attributes:\n      - key: deployment.environment\n        value: production\n        action: upsert\n\nexporters:\n  otlp/honeycomb:\n    endpoint: api.honeycomb.io:443\n    headers:\n      x-honeycomb-team: ${HONEYCOMB_API_KEY}\n  prometheus:\n    endpoint: 0.0.0.0:9090\n\nservice:\n  pipelines:\n    traces:\n      receivers: [otlp]\n      processors: [memory_limiter, resource, batch]\n      exporters: [otlp/honeycomb]\n    metrics:\n      receivers: [otlp]\n      processors: [memory_limiter, resource, batch]\n      exporters: [prometheus]",
          note: "memory_limiter MUST be first processor — protects the Collector from OOM under load spikes. batch should be near the end — batches by time and size for efficient export."
        },
        {
          id: 'collector-tail', title: "Tail-based sampling",
          desc: "Keep 100% of errors and slow traces, sample the rest.",
          code: "processors:\n  tail_sampling:\n    decision_wait: 10s\n    num_traces: 50000\n    policies:\n      - name: errors-policy\n        type: status_code\n        status_code: { status_codes: [ERROR] }\n      - name: latency-policy\n        type: latency\n        latency: { threshold_ms: 1000 }\n      - name: random-sample\n        type: probabilistic\n        probabilistic: { sampling_percentage: 5 }",
          note: "decision_wait should be longer than your longest expected trace. Tail sampling buffers traces in memory until completion."
        },
      ],
    },
    promql_recipes: {
      label: "PromQL recipes", icon: "⟁",
      snippets: [
        {
          id: 'promql-red', title: "RED method dashboard queries",
          desc: "Rate, Errors, Duration for any HTTP service.",
          code: "# Rate — requests per second\nsum(rate(http_requests_total[5m])) by (service)\n\n# Errors — error rate as fraction\nsum(rate(http_requests_total{status=~\"5..\"}[5m])) by (service)\n  /\nsum(rate(http_requests_total[5m])) by (service)\n\n# Duration — p99\nhistogram_quantile(0.99,\n  sum by (service, le) (rate(http_request_duration_seconds_bucket[5m])))\n\n# Top 10 endpoints by request rate\ntopk(10, sum by (route) (rate(http_requests_total[5m])))",
          note: "rate() needs at least 2 data points in the window — use [5m] not [1m] for stable values. histogram_quantile needs 'le' in the by clause."
        },
        {
          id: 'promql-burn', title: "SLO burn rate alerts",
          desc: "Multi-window burn rate. Google SRE Workbook chapter 5.",
          code: "# SLO: 99.9% availability over 30 days\n# Burn rate over 1 hour — page on-call (consuming month budget in 2 days)\n( 1 - (\n  sum(rate(http_requests_total{status!~\"5..\"}[1h]))\n  /\n  sum(rate(http_requests_total[1h]))\n)) / (1 - 0.999) > 14.4\n\n# Burn rate over 6 hours — ticket\n( 1 - (\n  sum(rate(http_requests_total{status!~\"5..\"}[6h]))\n  /\n  sum(rate(http_requests_total[6h]))\n)) / (1 - 0.999) > 6",
          note: "Burn rate = current error rate / acceptable error rate. SRE Workbook table 5-2 has the canonical multi-window thresholds."
        },
      ],
    },
    slo_lib: {
      label: "SLO templates", icon: "◎",
      snippets: [
        {
          id: 'slo-doc', title: "SLO definition document",
          desc: "Template for documenting a service-level objective.",
          code: "# SLO — checkout-api\n\nService: checkout-api\nOwner: payments team\nLast reviewed: 2026-05-01\n\nSLI: HTTP request success rate\n  = (successful requests) / (all requests)\n  successful = status NOT IN [500, 502, 503, 504]\n\nSLO: 99.9% over 30-day rolling window\n  Error budget: 43 min 12 sec / 30 days\n\nSLI: p95 latency under 500ms\nSLO: 95% of requests under 500ms over 30 days\n\nAlerting (multi-window burn rate):\n  Critical (page): 14.4x burn over 1h\n  High (ticket):   6x burn over 6h\n  Medium (review): 3x burn over 1d\n\nExclusions:\n  - /healthz endpoints\n  - synthetic monitoring traffic",
          note: "Document the SLO before implementing. Reviewing the doc with stakeholders forces clarity. Re-review quarterly — SLOs drift as systems and user expectations evolve."
        },
      ],
    },
    alerts_lib: {
      label: "Alertmanager", icon: "⏰",
      snippets: [
        {
          id: 'alertmanager-cfg', title: "Alertmanager routing",
          desc: "Route critical to PagerDuty, others to Slack.",
          code: "route:\n  group_by: ['alertname', 'service']\n  group_wait: 30s\n  group_interval: 5m\n  repeat_interval: 4h\n  receiver: 'default-slack'\n  routes:\n    - match: { severity: critical }\n      receiver: 'pagerduty'\n      continue: true\n    - match: { severity: warning }\n      receiver: 'team-slack'\n\nreceivers:\n  - name: 'pagerduty'\n    pagerduty_configs:\n      - service_key: ${PAGERDUTY_KEY}\n  - name: 'team-slack'\n    slack_configs:\n      - api_url: ${SLACK_WEBHOOK}\n        channel: '#alerts'\n        title: '{{ .GroupLabels.alertname }}'\n        text: '{{ range .Alerts }}{{ .Annotations.summary }}\\n{{ end }}'\n  - name: 'default-slack'\n    slack_configs:\n      - api_url: ${SLACK_WEBHOOK}\n        channel: '#monitoring'\n\ninhibit_rules:\n  - source_match: { severity: critical }\n    target_match: { severity: warning }\n    equal: ['alertname', 'service']",
          note: "inhibit_rules suppress lower-severity alerts when a higher-severity one fires for the same service. Reduces noise during big incidents."
        },
      ],
    },
  };

  const LibraryViewer = () => {
    const cats = Object.keys(LIBRARY);
    const [activeCat, setActiveCat] = useState(cats[0]);
    const [expanded, setExpanded] = useState({});
    const cat = LIBRARY[activeCat];
    const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/20">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase shrink-0 pr-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Library size={12} className="inline mr-1" /> LIB
          </div>
          {cats.map(c => (
            <button key={c} onClick={() => setActiveCat(c)}
              className={`text-[11px] px-2 py-1 border whitespace-nowrap shrink-0 flex items-center gap-1 ${
                activeCat === c ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="text-cyan-300">{LIBRARY[c].icon}</span>
              {LIBRARY[c].label}
            </button>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {cat.snippets.map((s, i) => {
            const isOpen = !!expanded[s.id];
            return (
              <div key={s.id} className="border border-zinc-800">
                <button onClick={() => toggle(s.id)} className="w-full text-left px-3 py-2 hover:bg-zinc-900/60 flex items-start gap-3 transition-colors">
                  <span className="text-[10px] text-cyan-300 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-zinc-100 text-[14px] font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{s.title}</div>
                    <div className="text-zinc-400 text-[12px] mt-0.5">{s.desc}</div>
                  </div>
                  <ChevronRight size={14} className={`text-zinc-500 shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-zinc-800 bg-black/60">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-900">
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>code</span>
                      <button onClick={() => copy(s.code, 'lib-' + s.id)} className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors">
                        {copied === 'lib-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'lib-' + s.id ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <code>{s.code}</code>
                    </pre>
                    {s.note && (
                      <div className="border-t border-zinc-900 px-3 py-2 text-[12px] text-zinc-400 italic leading-relaxed">
                        <span className="text-rose-400 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
                        {s.note}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Troubleshooter = () => {
    const [path, setPath] = useState(['start']);
    const cur = TROUBLESHOOT[path[path.length - 1]];
    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] text-rose-300 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Wrench size={12} /> TRIAGE TREE
          </div>
          {path.length > 1 && (
            <button onClick={() => setPath(['start'])} className="text-[11px] text-zinc-500 hover:text-rose-300 flex items-center gap-1">
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
                  <span className={i === path.length - 1 ? 'text-cyan-300' : ''}>{p}</span>
                </span>
              ))}
            </div>
          )}
          {cur.q && (
            <>
              <div className="text-zinc-100 text-[15px] mb-3 font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{cur.q}</div>
              <div className="space-y-2">
                {cur.opts.map((opt, i) => (
                  <button key={i} onClick={() => setPath([...path, opt.next])}
                    className="w-full text-left border border-zinc-800 hover:border-rose-400 hover:bg-rose-400/5 px-3 py-2.5 text-[14px] text-zinc-200 transition-colors flex items-center justify-between group">
                    <span>{opt.label}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-rose-300" />
                  </button>
                ))}
              </div>
            </>
          )}
          {cur.fix && (
            <>
              <div className="border-l-2 border-cyan-300 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-cyan-300 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}
          {path.length > 1 && (
            <button onClick={() => setPath(path.slice(0, -1))} className="mt-4 text-[12px] text-zinc-500 hover:text-zinc-300 flex items-center gap-1">
              <ArrowLeft size={12} /> Back
            </button>
          )}
        </div>
      </div>
    );
  };

  /* ─── Export helpers ─── */
  const exportCheatsheet = () => {
    let md = "# Observability Atlas — Cheatsheet\n\n";
    md += "## Four pillars\n\n| Pillar | Data | Best for | Cost |\n|---|---|---|---|\n";
    COMPARISONS.pillars.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Metric types\n\n| Type | Behavior | Example | Query |\n|---|---|---|---|\n";
    COMPARISONS.metric_types.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Burn rate alerts\n\n| Severity | Burn rate | Window | Action |\n|---|---|---|---|\n";
    COMPARISONS.burn_rates.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Commands\n\n```bash\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    try {
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'observability-atlas-cheatsheet.md'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('[obsatlas] export failed:', e?.message);
    }
  };

  const exportLibrary = () => {
    let md = "# Observability Atlas — Library\n\n";
    Object.entries(LIBRARY).forEach(([, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => {
        md += `### ${s.title}\n${s.desc}\n\n\`\`\`\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`;
      });
    });
    try {
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'observability-atlas-library.md'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('[obsatlas] export failed:', e?.message);
    }
  };

  const copyAllCommands = () => {
    const all = COMMANDS.map(c => `# ${c.desc}\n${c.cmd}`).join('\n\n');
    copy(all, 'allcmds');
  };

  const allQuizzes = Object.values(QUIZZES).flat();
  const missed = allQuizzes.filter(q => quizState[q.qid] && !quizState[q.qid].correct);
  const totalAnswered = allQuizzes.filter(q => quizState[q.qid]).length;
  const totalCorrect = allQuizzes.filter(q => quizState[q.qid]?.correct).length;

  const CommandPalette = () => {
    const [q, setQ] = useState('');
    const items = [
      ...SECTIONS.map((s, i) => ({ kind: 'chapter', label: s.label, idx: i, hint: s.sub })),
      ...Object.keys(GLOSSARY).map(t => ({ kind: 'term', label: t, hint: GLOSSARY[t].slice(0, 80) + '...' })),
      ...COMMANDS.map(c => ({ kind: 'command', label: c.cmd, hint: c.desc, copy: c.cmd })),
      ...Object.entries(LIBRARY).flatMap(([, c]) =>
        c.snippets.map(s => ({ kind: 'library', label: s.title, hint: `${c.label} - ${s.desc}` }))
      ),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-cyan-300/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-cyan-300" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Chapters, terms, commands, library"
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
                  else if (item.kind === 'library') { setActiveSection(8); setCmdOpen(false); }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900 flex items-start gap-3">
                <span className={`text-[9px] uppercase tracking-wider mt-1 shrink-0 w-16 ${
                  item.kind === 'chapter' ? 'text-cyan-300' :
                  item.kind === 'term' ? 'text-rose-400' :
                  item.kind === 'library' ? 'text-amber-300' : 'text-fuchsia-300'
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
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setTermPopup(null)}>
        <div className="max-w-md w-full bg-zinc-950 border border-cyan-300/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
            <button onClick={() => setTermPopup(null)} className="text-zinc-500 hover:text-zinc-200"><X size={16} /></button>
          </div>
          <div className="text-zinc-100 text-[18px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{termPopup}</div>
          <div className="text-zinc-300 text-[14px] leading-relaxed">{GLOSSARY[termPopup] || 'No definition.'}</div>
        </div>
      </div>
    );
  };

  const Onboarding = () => (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-950 border border-cyan-300/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>◉ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your observability context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-cyan-300 hover:bg-cyan-300/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-cyan-300 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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

  /* ═══════════════════════════════════════════════════════════════
     SECTION RENDERER
     ═══════════════════════════════════════════════════════════════ */
  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return (
          <>
            <H2 num="◇ 2018">Observability emerges from monitoring</H2>
            <P>
              For decades, "monitoring" meant collecting predefined metrics and alerting when they crossed thresholds. CPU > 80%? Page someone. Disk full? Page someone. This worked when systems were simple — a web server, a database, a cache.
            </P>
            <P>
              Around 2018, the term <Term>observability</Term> took on a more specific meaning thanks to Charity Majors and the Honeycomb team. Borrowed from control theory, it pointed at a different need: distributed systems with hundreds of services, where failures emerge from interactions you couldn't have predicted. Monitoring tells you something is wrong. Observability lets you figure out <em>why</em> — by asking arbitrary questions about system behavior without shipping new code first.
            </P>
            <H2 num="◇ 2024-2026">OpenTelemetry takes over</H2>
            <P>
              OpenTelemetry started in 2019 as a merger of OpenTracing and OpenCensus. It promised something simple: one set of SDKs, one wire protocol (<Term>OTLP</Term>), one Collector — and then your telemetry could go anywhere. By 2024 every major vendor accepted it. On <strong>May 21, 2026 — five days ago — OTel graduated CNCF</strong>, the second most active project in the foundation after Kubernetes.
            </P>
            <div className="grid gap-2 my-3">
              <CheckItem id="otel-graduated">May 21, 2026 — OpenTelemetry graduated CNCF</CheckItem>
              <CheckItem id="otel-vendors">Every major vendor (Datadog, Honeycomb, New Relic, Grafana Cloud, Dynatrace, AWS, Azure, GCP) supports OTLP natively</CheckItem>
              <CheckItem id="otel-profiling">Continuous profiling — the fourth pillar — entered RC in Q1 2026</CheckItem>
              <CheckItem id="otel-ebpf">eBPF-based auto-instrumentation 1.0 stable in 2026</CheckItem>
              <CheckItem id="otel-genai">GenAI / multi-agent semantic conventions in experimental status; AI observability is the new frontier</CheckItem>
            </div>
            <Callout kind="cite" title="WHY THIS MATTERS">
              Before OTel, switching observability backends required reinstrumenting every service — a multi-quarter project. Now it's a Collector config change. The vendor lock-in equation flipped between 2024 and 2026. Pick a backend for its product, not because you're trapped.
            </Callout>
            <H2 num="◇ ARCH">The modern observability stack</H2>
            <P>
              Apps emit telemetry through the OTel SDK. The Collector receives, processes (sample, batch, redact, route), and exports to one or more backends. Grafana (or equivalent) sits on top, unifying the views across metrics (Prometheus), logs (Loki), and traces (Tempo). On-call humans close the loop.
            </P>
            <ArchDiagram />
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ FOUR">The four pillars</H2>
            <P>
              Each pillar answers different questions. <Term>Logs</Term> tell you <em>what happened</em>. <Term>Metrics</Term> tell you <em>how many, how fast, how much</em>. <Term>Traces</Term> tell you <em>where did the time go</em>. <Term>Profiling</Term> tells you <em>which function is hot</em>. You need all four for a complete picture.
            </P>
            <ComparisonTable data={COMPARISONS.pillars} />
            <H2 num="◇ CORR">Correlation is the magic</H2>
            <P>
              Individually each pillar is useful. Together they're transformative. A user reports a slow checkout. You query metrics — p99 spiked at 14:23. You query logs filtered to that minute — see ERROR lines with a specific <Term>Trace ID</Term>. You open that trace — see the database query took 8 seconds. You query profiles for the DB query — see the query plan changed because the index dropped. From metric anomaly to root cause in three jumps.
            </P>
            <P>
              This correlation only works if your instrumentation includes the right metadata. Every log line needs <Kbd>trace_id</Kbd>. Every metric series needs consistent labels. Every trace span needs proper context propagation. The OTel SDKs do this automatically — when you use them properly.
            </P>
            <Callout kind="info" title="THE GOLDEN PATH">
              1. Auto-instrument with OTel SDK (zero code changes). 2. Add structured logging with trace context. 3. Run an OTel Collector to route data. 4. Pick a backend (or self-host LGTM). 5. Build RED-method dashboards. 6. Set SLOs. 7. Burn-rate alerts. Most teams skip steps and regret it.
            </Callout>
            {QUIZZES.pillars.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ EVENT">Logs are discrete events</H2>
            <P>
              A log line records that something happened at a specific moment. A request arrived. An error was caught. A job completed. Each line has a timestamp, a severity, a message, and ideally structured context.
            </P>
            <P>
              Free-text logs were the only option for decades. Modern practice: <Term>structured logging</Term> — emit JSON (or another machine-readable format) with explicit fields. Why? You can filter, parse, correlate, aggregate. Free-text grep doesn't scale to billions of lines across hundreds of services.
            </P>
            <Code id="log-structured" lang="json">{`// Free-text — bad
2026-05-26 14:23:11 ERROR user 12345 failed to checkout: payment declined for order 7890

// Structured — good
{
  "ts": "2026-05-26T14:23:11Z",
  "level": "ERROR",
  "service": "checkout-api",
  "msg": "checkout failed: payment declined",
  "user_id": "12345",
  "order_id": "7890",
  "trace_id": "abc123def456...",
  "span_id": "789xyz..."
}`}</Code>
            <H2 num="◇ CORR">Correlation IDs — the most important field</H2>
            <P>
              Every log line should include <Kbd>trace_id</Kbd> from the active OTel span. This makes logs queryable by request — click a slow trace, see exactly the log lines that request produced across every service. Without correlation IDs, debugging distributed systems is archaeology.
            </P>
            <H2 num="◇ LEVEL">Log levels — use them with discipline</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              <div className="border border-zinc-800 px-3 py-2">
                <code className="text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>DEBUG</code>
                <div className="text-zinc-400 mt-1">Development only. Never enable in prod (volume + storage cost). Use feature flags for temporary debug logging in prod when investigating.</div>
              </div>
              <div className="border border-zinc-800 px-3 py-2">
                <code className="text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>INFO</code>
                <div className="text-zinc-400 mt-1">Normal operations. Service started, request completed, job finished. The default in production. Log significant state transitions, not every function call.</div>
              </div>
              <div className="border border-zinc-800 px-3 py-2">
                <code className="text-amber-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>WARN</code>
                <div className="text-zinc-400 mt-1">Degraded but functional. Retried after transient failure, degraded mode active, deprecated path hit. Should be rare; investigate WARN spikes.</div>
              </div>
              <div className="border border-zinc-800 px-3 py-2">
                <code className="text-rose-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ERROR</code>
                <div className="text-zinc-400 mt-1">Failure but recoverable. Operation failed, exception caught. Each ERROR represents user impact or potential incident.</div>
              </div>
              <div className="border border-zinc-800 px-3 py-2">
                <code className="text-rose-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FATAL</code>
                <div className="text-zinc-400 mt-1">Process can't continue. Log and exit. Used at startup (config invalid, dependency unreachable). Almost never logged at steady state.</div>
              </div>
            </div>
            <Callout kind="dont" title="LOGGING SECRETS OR PII">
              Passwords, tokens, credit card numbers, full names, emails, addresses — never log these. Even accidental inclusion in error logs becomes a compliance violation and breach exposure. Use logger redaction features (pino has built-in redact; structlog has processors). Audit periodically.
            </Callout>
            {stackData?.pillars && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.pillars}</Callout>}
            {QUIZZES.metrics.slice(0, 0).map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ AGGR">Aggregated numbers over time</H2>
            <P>
              A metric is a number that updates over time. Counter values increase; gauges go up and down; histograms record distributions. Metrics are cheap to store (a counter is one number per scrape) and fast to query — making them the foundation of dashboards and alerts.
            </P>
            <ComparisonTable data={COMPARISONS.metric_types} />
            <H2 num="◇ HIST">Why histograms beat averages</H2>
            <P>
              "Average request latency is 50ms" sounds great. Then you discover 99% of requests are 10ms and 1% are 4000ms — averaging hid the disaster. <Term>Quantiles</Term> reveal the truth: p50 latency (median), p95 (worst 5%), p99 (worst 1%). The Google SRE Book is emphatic on this: latency is what users feel; measure the tail.
            </P>
            <Code id="hist-pattern" lang="text">{`# Histogram with explicit buckets — what real users experience
http_request_duration_seconds_bucket{le="0.005"}    50000   <- 50k req under 5ms
http_request_duration_seconds_bucket{le="0.01"}     85000
http_request_duration_seconds_bucket{le="0.025"}    98000
http_request_duration_seconds_bucket{le="0.1"}      99500
http_request_duration_seconds_bucket{le="0.5"}      99950
http_request_duration_seconds_bucket{le="1"}        99990
http_request_duration_seconds_bucket{le="5"}        100000  <- 100k total

# PromQL p99 — find the bucket where 99% of requests land
histogram_quantile(0.99,
  sum by (le) (rate(http_request_duration_seconds_bucket[5m])))
# = approx 0.1 (100ms) — what your 99th percentile user feels`}</Code>
            <H2 num="◇ METHOD">Three methodologies — RED, USE, Golden Signals</H2>
            <ComparisonTable data={COMPARISONS.methods} />
            <P>
              Use <strong>RED</strong> for request-driven services. <strong>USE</strong> for resources (CPU, memory, disk). <strong>Four Golden Signals</strong> at the user-visible service level. They overlap; pick a primary methodology per service tier and apply it consistently.
            </P>
            <H2 num="◇ CARD">Cardinality discipline</H2>
            <P>
              Every unique combination of label values creates a separate time series. <Kbd>http_requests_total{'{method="GET", path="/api/x"}'}</Kbd> with 4 methods × 100 paths × 6 statuses = 2,400 series. Add <Kbd>user_id</Kbd> with 1M users = 2.4 BILLION series. Prometheus dies. Rule: <strong>NEVER use unbounded label values as labels</strong>. User IDs, request IDs, full URLs, IP addresses — these are <em>span attributes</em> or <em>log fields</em>, never metric labels.
            </P>
            <Callout kind="dont" title="HIGH-CARDINALITY METRIC LABELS">
              The number one reason Prometheus instances die. Audit your top 10 cardinality metrics: <Kbd>topk(10, count by (__name__)({'__name__'}=~".+"))</Kbd>. Fix the worst offenders. Move per-request detail to traces.
            </Callout>
            {stackData?.metrics && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.metrics}</Callout>}
            {QUIZZES.metrics.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ TREE">A trace is a tree of spans</H2>
            <P>
              When a request hits your system, it touches multiple services — auth, business logic, database, cache, downstream APIs. A <Term>trace</Term> represents the whole journey. Each piece of work is a <Term>Span</Term> with a parent/child relationship to other spans. Together they form a tree rooted at the original request.
            </P>
            <Code id="trace-example" lang="text">{`Trace abc123def456...

POST /api/checkout                                     487ms  [root span]
├─ auth.validate                                        12ms
├─ cart.fetch                                           34ms
│  └─ db.query: SELECT items FROM carts WHERE user=?    28ms
├─ inventory.check                                      85ms
│  ├─ db.query: SELECT stock FROM products WHERE...     45ms
│  └─ cache.set                                          3ms
├─ payment.charge                                      298ms  ← slow! investigate
│  ├─ external.stripe.charge                           285ms
│  └─ db.tx.payment_record                              10ms
└─ response.serialize                                    8ms`}</Code>
            <H2 num="◇ PROP">Context propagation — the linchpin</H2>
            <P>
              For a trace to span services, the <Term>Trace ID</Term> + parent <Term>Span ID</Term> must travel with the request. The <strong>W3C Trace Context standard</strong> defines two HTTP headers — <Kbd>traceparent</Kbd> and <Kbd>tracestate</Kbd> — that propagate this automatically.
            </P>
            <Code id="traceparent" lang="http">{`# Incoming request from service A to service B carries:
GET /api/users HTTP/1.1
Host: service-b
traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01
              ^^  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  ^^^^^^^^^^^^^^^^  ^^
              version  trace-id (16 bytes hex)        parent-span-id    flags

# Service B's OTel SDK reads this header automatically.
# Creates a child span with the same trace-id, parent = b7ad6b71...`}</Code>
            <H2 num="◇ SAMPLE">Sampling — keeping enough, not everything</H2>
            <P>
              At scale, sending every trace is impossibly expensive. You must sample. Two approaches:
            </P>
            <P>
              <strong>Head-based:</strong> decide at trace start (randomly). 1% sampling = you keep 1% of all traces, including 1% of errors. Simple but you miss most incidents.
            </P>
            <P>
              <strong>Tail-based:</strong> the OTel Collector buffers each trace briefly, decides after it completes. Keep 100% of errors. Keep 100% of slow traces (e.g., > p95). Sample the rest at 5-10%. <strong>Cost stays bounded, signal stays high.</strong> This is the modern standard for production.
            </P>
            <Callout kind="info" title="OTEL COLLECTOR TAIL SAMPLING">
              The <Kbd>tail_sampling</Kbd> processor in the OTel Collector implements this. Policy stack: <Kbd>status_code: [ERROR]</Kbd>, then <Kbd>latency: threshold_ms: 1000</Kbd>, then <Kbd>probabilistic: 5</Kbd>. Library has the full config.
            </Callout>
            {stackData?.traces && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.traces}</Callout>}
            {QUIZZES.traces.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ STD">The unified standard</H2>
            <P>
              <Term>OpenTelemetry</Term> is the vendor-neutral observability framework. SDKs in 12+ languages. A single wire protocol (<Term>OTLP</Term>). A Collector for routing. Semantic Conventions for consistent attribute naming. As of <strong>May 21, 2026</strong>, OTel graduated CNCF — the second most active project in the foundation.
            </P>
            <P>
              The argument for adopting it isn't ideology — it's leverage. Your instrumentation work compounds because it's not tied to a vendor. Switch backends? Collector config change. Add a second backend for redundancy? Add an exporter. Try a new vendor for one team? Route via the Collector. The lock-in equation completely flipped in your favor between 2024 and 2026.
            </P>
            <H2 num="◇ COLL">The Collector — pipelines for telemetry</H2>
            <P>
              The <Term>Collector</Term> is a standalone process that receives, processes, and exports telemetry. Three stages per pipeline:
            </P>
            <Code id="collector-arch" lang="text">{`receivers       processors         exporters
─────────       ──────────         ─────────
otlp            memory_limiter     otlp/honeycomb
prometheus  →   batch          →   prometheus
hostmetrics     tail_sampling      loki
kafka           resource           file
syslog          attributes         debug

   pipelines:
     traces:  [otlp]      → [memory_limiter, tail_sampling, batch] → [otlp/honeycomb]
     metrics: [otlp, prom]→ [memory_limiter, batch]                 → [prometheus]
     logs:    [otlp]      → [memory_limiter, batch]                 → [loki]`}</Code>
            <H2 num="◇ SEM">Semantic Conventions — the secret sauce</H2>
            <P>
              <Term>Semantic Conventions</Term> are OTel's standardized attribute names. <Kbd>http.request.method</Kbd> not <Kbd>method</Kbd>. <Kbd>db.system</Kbd> not <Kbd>database</Kbd>. <Kbd>messaging.system</Kbd> not <Kbd>queue_type</Kbd>. Why bother? Because vendors ship pre-built dashboards and alerts that work on these names. Use them and most integrations work out of the box.
            </P>
            <ComparisonTable data={COMPARISONS.vendors_2026} />
            <Callout kind="tip" title="START WITH AUTO-INSTRUMENTATION">
              <Kbd>opentelemetry-instrument python app.py</Kbd> covers 80% of services with zero code changes. Add manual spans only for business logic the auto-instrumentation can't see. The Library has setup snippets for Node, Python, Go.
            </Callout>
            {QUIZZES.otel.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ SLI">Measuring what users feel</H2>
            <P>
              An <Term>SLI</Term> — Service Level Indicator — is a specific numeric measure of service health, always a ratio or rate. "Percentage of HTTP requests that succeed." "Percentage of requests completing under 500ms." These are SLIs because they're concrete numbers that map to user experience.
            </P>
            <H2 num="◇ SLO">SLOs and error budgets</H2>
            <P>
              An <Term>SLO</Term> is a target value for an SLI over a time window. "99.9% of requests succeed over a 30-day rolling window." The remaining 0.1% is your <Term>error budget</Term> — your permission to fail, deploy risky changes, accept dependency outages. For 99.9% over 30 days, the budget is about <strong>43 minutes 12 seconds</strong> of failure.
            </P>
            <P>
              Don't hoard the budget. If you finish a month with most of it intact, you were too conservative — ship more risky things. If you burned it in week 1, you took on too much risk — freeze and stabilize. The budget is a knob you turn to balance velocity against reliability.
            </P>
            <H2 num="◇ SLA">SLAs are different — they're contracts</H2>
            <P>
              An <Term>SLA</Term> is a customer-facing contract backed by financial penalties. ALWAYS set SLAs looser than internal SLOs. If your SLA is 99.9% you want internal SLO targets at 99.95% — gives you headroom to fix issues before contract violations.
            </P>
            <H2 num="◇ BURN">Multi-window burn-rate alerts</H2>
            <P>
              The Google SRE Workbook chapter 5 defines the canonical alerting pattern. Don't alert when error rate crosses an arbitrary threshold — alert when you're <em>burning your error budget fast enough to matter</em>.
            </P>
            <ComparisonTable data={COMPARISONS.burn_rates} />
            <P>
              Use multiple windows in combination: page only if the FAST burn (14.4× over 1h) AND the slow burn (3× over 6h) both fire — eliminates noise from transient blips. The Library has PromQL templates.
            </P>
            <Callout kind="dont" title="100% SLO TARGETS">
              99.99% needs significant infrastructure investment (~4 nines = 52 minutes per year). 99.999% is basically impossible without specialized engineering (~5 nines = 5 minutes per year). For most services, 99.9% is realistic and meaningful. Don't pick a number that sounds good but you can't hit — you'll just burn out chasing it.
            </Callout>
            {stackData?.spark && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            {QUIZZES.slo.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ STORY">Dashboards tell stories</H2>
            <P>
              A great dashboard answers a specific question at a glance. A wall of 50 graphs is not a dashboard — it's a museum. Build dashboards in layers:
            </P>
            <P>
              <strong>Tier 1: service health.</strong> Top-level overview. RED metrics for the service. Current SLO status. Active alerts. The single dashboard on-call opens first.
            </P>
            <P>
              <strong>Tier 2: component breakdown.</strong> One panel per major dependency. DB query rate + latency. Cache hit rate. Queue depth. External API latency. Drill from Tier 1 when something looks off.
            </P>
            <P>
              <strong>Tier 3: deep dive.</strong> Per-host, per-pod, per-query detail. Used during incidents to identify root causes. Often pre-built but rarely viewed.
            </P>
            <H2 num="◇ ALERT">The alert design rule</H2>
            <P>
              Every alert must satisfy three properties: <strong>actionable</strong> (on-call knows what to do), <strong>user-impacting</strong> (matters to users, not just internal), <strong>runbook-backed</strong> (documented response procedure). If an alert fails any of these, delete or fix it.
            </P>
            <Callout kind="dont" title="ALERT FATIGUE">
              The biggest enemy of reliable systems. When alerts fire constantly, on-call stops responding. Real incidents drown in noise. Fix by alerting on user-visible symptoms (SLO burn rate, error rates, p99 latency) — not internal causes (CPU, memory, individual host health). Schedule monthly alert review. Kill noisy alerts ruthlessly.
            </Callout>
            <H2 num="◇ ONCALL">On-call culture matters more than tooling</H2>
            <P>
              The best alerting setup in the world won't save a team that's burning out from bad on-call practices. Three principles from the Google SRE Workbook:
            </P>
            <div className="grid gap-2 my-3">
              <CheckItem id="oncall-runbook">Every alert has a linked runbook. No exceptions.</CheckItem>
              <CheckItem id="oncall-rotation">Fair rotation across the team. No "the senior person handles it." </CheckItem>
              <CheckItem id="oncall-comp">Compensation for being on-call (extra PTO, pay, or both). On-call is real work.</CheckItem>
              <CheckItem id="oncall-postmortem">Blameless postmortems within 5 business days of any incident.</CheckItem>
              <CheckItem id="oncall-followup">Action items from postmortems tracked to closure. Don't repeat incidents.</CheckItem>
              <CheckItem id="oncall-handoff">Documented handoff between rotations. The incoming on-call should know what's happening.</CheckItem>
              <CheckItem id="oncall-review">Monthly alert review. Tune ruthlessly. Delete what doesn't trigger action.</CheckItem>
            </div>
            {stackData?.alerts && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.alerts}</Callout>}
            {QUIZZES.alerts.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">Production instrumentation patterns</H2>
            <P>
              Eight categories of battle-tested patterns: OTel SDK setup (Node, Python, Go), structured logging with trace context + redaction, metrics with cardinality discipline, manual spans for business logic, OTel Collector configurations including tail-based sampling, PromQL recipes for RED-method dashboards and SLO burn-rate alerts, SLO definition templates, and Alertmanager routing.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <button onClick={exportLibrary} className="flex items-center gap-2 border border-cyan-300 text-cyan-300 px-4 py-2 text-[13px] hover:bg-cyan-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Library size={14} /> Download library.md
            </button>
            <H2 num="◇ DONT">Anti-patterns</H2>
            <div className="grid gap-2 my-3">
              {ANTIPATTERNS.map(a => (
                <Callout key={a.name} kind="dont" title={a.name}>{a.reason}</Callout>
              ))}
            </div>
            {stackData?.library && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.library}</Callout>}
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ LIVE">A live telemetry simulator</H2>
            <P>
              The sandbox runs a simulated checkout-api service in your browser. Real metric generation (Poisson-distributed request arrivals, exponential latency distribution, configurable error rates). Real PromQL evaluation (a working subset of PromQL parses and runs against the live data). Real-looking traces and structured logs.
            </P>
            <P>
              Start the simulator. Try the eight challenges, from a bare counter query through histogram quantiles to an error-ratio expression. Then trigger an incident and watch every signal react — request rate climbs, error counter spikes, p99 latency blows up, the dashboard panels go red. Resolve it and watch them recover.
            </P>
            <Sandbox />
            <Callout kind="tip" title="THE INCIDENT EXPERIENCE">
              Start the simulator. Wait ~10 seconds for baseline metrics. Hit TRIGGER INCIDENT. Within 3-5 seconds you'll see: request rate up ~70%, error counter spiking, p99 latency tripling, queue_depth growing. Switch to the Logs tab — ERROR lines streaming. Switch to Traces — sample requests showing the slow db.query span turning red. This is exactly what an incident feels like in production.
            </Callout>
            <Callout kind="tip" title="THE PROMQL CHALLENGES">
              The challenges teach PromQL incrementally. Challenge 1 (bare counter) → 2 (rate) → 5 (sum by) → 6 (histogram_quantile) → 7 (error ratio). The error ratio query is the same formula you'd use to compute the SLI for your real services.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When something is wrong</H2>
            <P>
              Eight branches covering the most common observability troubles — page response, missing logs, slow Prometheus, alert fatigue, broken traces, bill explosions, setting first SLOs, vendor migration. Each branch has a step-by-step decision path.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLS">The observability engineer's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'OpenTelemetry Collector', what: "The router. Receives telemetry, processes (sample, batch, redact), exports to backends. Run as agent (per-pod sidecar) and gateway (cluster-wide pool). Essential." },
                { name: 'Prometheus', what: "Time-series database. Pull-based scraping. PromQL. Current 3.9.0 (Jan 2026). Best for metrics; pair with Grafana for visualization." },
                { name: 'Grafana', what: "Visualization platform. ~100 data sources. Alerting. Dashboards. Current 12.3+ (2026). The unified UI for the LGTM stack." },
                { name: 'Loki', what: "Grafana's log aggregation. Cost-efficient — indexes labels only, not content. LogQL for queries. Pairs naturally with Prometheus + Tempo." },
                { name: 'Tempo', what: "Grafana's distributed tracing backend. Highly scalable. Lookup by trace_id. The 'T' in LGTM." },
                { name: 'Alertmanager', what: "Prometheus's alert routing. Dedupe, group, silence, inhibit. Routes to PagerDuty, Slack, email, webhook. Configure thoughtfully or alerts go everywhere." },
                { name: 'Pyroscope (Grafana)', what: "Continuous profiling. Captures CPU + memory profiles in production with minimal overhead. Find slow functions in live systems. The 4th pillar in practice." },
                { name: 'Honeycomb / Datadog / New Relic', what: "Commercial alternatives to self-hosting. Polished UI, broad integrations. All support OTel natively in 2026 — no lock-in." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-cyan-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-cyan-300 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-rose-400 text-rose-300 px-4 py-2 text-[13px] hover:bg-rose-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
            </button>
          </>
        );

      case 11:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-cyan-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>correct</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-rose-400 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{missed.length}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>missed</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-zinc-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalAnswered}/{allQuizzes.length}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>answered</div>
              </div>
            </div>
            {missed.length > 0 && (
              <>
                <H2 num="◇ REVIEW">Worth a second look</H2>
                <div className="space-y-2">
                  {missed.map(q => (
                    <div key={q.qid} className="border border-zinc-800 bg-zinc-900/30 p-3 text-[13px]">
                      <div className="text-zinc-100 mb-1 whitespace-pre-wrap">{q.q}</div>
                      <div className="text-cyan-300 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A learning path</H2>
            <P>For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1', plan: "Read Google SRE Book chapters 4-6 (SLOs, monitoring, alerting). Free at sre.google/books/. The conceptual foundation for everything else." },
                { wk: 'Week 2', plan: "Spin up Prometheus + Grafana locally with Docker Compose. Configure node_exporter. Write three PromQL queries. Build one dashboard." },
                { wk: 'Week 3', plan: "Instrument a small app with OpenTelemetry. Auto-instrumentation first (the easy 80%). Add manual spans for business logic." },
                { wk: 'Week 4', plan: "Deploy an OTel Collector. Configure receivers, processors (memory_limiter + batch + tail_sampling), exporters. Route to a backend." },
                { wk: 'Week 5-6', plan: "Define one SLO on one real service. PromQL query for the SLI. Burn-rate alert. Live with it for two weeks. Iterate." },
                { wk: 'Week 7-8', plan: "Read 'Observability Engineering' (Majors, Fong-Jones, Miranda). The modern philosophy. Apply concepts to your own work." },
                { wk: 'Beyond', plan: "Read SRE Workbook. Practice blameless postmortems. Audit your alerts monthly. Build the muscle. Observability is a discipline, not a destination." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-cyan-300 pl-3 py-1">
                  <div className="text-cyan-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-cyan-300 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-rose-300 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-cyan-300 text-cyan-300 px-4 py-2 text-[13px] hover:bg-cyan-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-rose-400 text-rose-300 px-4 py-2 text-[13px] hover:bg-rose-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-amber-300 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-rose-400 hover:text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              You've walked from monitoring's origins through the modern observability stack — OpenTelemetry CNCF-graduated May 2026, the four pillars, RED + USE + Golden Signals, SLOs with multi-window burn-rate alerts, OTel Collector pipelines with tail-based sampling, structured logging with trace correlation. A working live telemetry simulator with real PromQL evaluation. Real production patterns in the Library. Observability is a discipline that compounds with practice. Set one SLO. Tune one alert. Add one runbook. Repeat.
            </Callout>
          </>
        );

      default: return null;
    }
  };

  const sec = SECTIONS[activeSection];

  return (
    <div className="min-h-screen bg-black text-zinc-300" style={{ fontFamily: 'Manrope, sans-serif' }}>
      {showOnboarding && <Onboarding />}
      {cmdOpen && <CommandPalette />}
      <TermPopover />

      <header className="border-b border-zinc-800 sticky top-0 bg-black/90 backdrop-blur-sm z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-cyan-300 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>◉</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>OBSERVABILITY</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-rose-400/40 text-rose-300 px-2 py-1 text-[11px] hover:bg-rose-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-cyan-300 hover:text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Search size={12} /> <span className="hidden sm:inline">search</span>
              <kbd className="hidden sm:inline border border-zinc-700 px-1 text-[9px] ml-0.5">⌘K</kbd>
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-zinc-800 bg-zinc-950 sticky top-[57px] z-20">
        <div className="max-w-4xl mx-auto px-4 py-2 flex gap-1 overflow-x-auto">
          {SECTIONS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeSection;
            const isDone = completed.has(i);
            return (
              <button key={s.id} onClick={() => setActiveSection(i)}
                className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] border transition-colors whitespace-nowrap ${
                  isActive ? 'border-cyan-300 bg-cyan-300/10 text-cyan-300' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-cyan-300" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            CHAPTER {sec.num}
          </div>
          <h1 className="text-zinc-100 text-[32px] font-bold leading-tight mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {sec.label}
          </h1>
          <p className="text-zinc-500 text-[14px]">{sec.sub}</p>
        </div>

        {renderSection()}

        <div className="mt-10 pt-5 border-t border-zinc-900 flex items-center justify-between gap-2 flex-wrap">
          <button onClick={() => setActiveSection(Math.max(0, activeSection - 1))} disabled={activeSection === 0}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-cyan-300 hover:text-cyan-300'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-cyan-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ◉ · observability atlas · grounded in OpenTelemetry (CNCF graduated May 2026) + Google SRE Book
          </div>
        </div>
      </main>
    </div>
  );
}
