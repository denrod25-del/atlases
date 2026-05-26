import { useState, useEffect, useRef } from 'react';
import {
  Compass, Network, Layers, ArrowRight, Boxes, GitBranch, Activity,
  Terminal, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, RotateCcw, Play, ArrowLeft, Quote, MousePointerClick,
  Loader2, Library, AlertTriangle, Globe, Lock, Zap, ExternalLink,
  XCircle, Server, Shuffle
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   NET ATLAS · DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "ARPANET 1969, TCP/IP, the Web, and the 2026 internet." },
  { id: 'layers', label: 'Layers', icon: Layers, num: '02', sub: "OSI's 7 layers, TCP/IP's 4. The mental model that orders everything." },
  { id: 'dns', label: 'DNS', icon: Globe, num: '03', sub: "How names become IPs. Records, recursion, DoH / DoT / DoQ." },
  { id: 'tls', label: 'TLS', icon: Lock, num: '04', sub: "Encryption, certificates, the 1.3 handshake. ECH, OCSP, ACME." },
  { id: 'http', label: 'HTTP', icon: Network, num: '05', sub: "Methods, status, headers. HTTP/1.1 vs 2 vs 3 — three versions in parallel." },
  { id: 'transport', label: 'Transport', icon: Shuffle, num: '06', sub: "TCP, UDP, QUIC. What each guarantees, when to choose." },
  { id: 'proxies', label: 'Proxies & LB', icon: Server, num: '07', sub: "L4 vs L7, reverse proxies, Nginx, Caddy, HAProxy, Traefik." },
  { id: 'cdn', label: 'CDN & Cache', icon: Zap, num: '08', sub: "Edge networks, Cache-Control, ETag, Cloudflare, Fastly, stale-while-revalidate." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Curated configs — DNS, TLS, HTTP, caching, proxies, security headers." },
  { id: 'sandbox', label: 'Sandbox', icon: Terminal, num: '10', sub: "Real DNS + HTTP in your browser. DoH lookups, fetch + headers, 6 challenges." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "DNS won't resolve, TLS handshake fails, CORS preflight, mixed content — decoded." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "RFCs that matter, books, and the networking reading roadmap." },
];

const STACKS = [
  { id: 'backend', label: 'Backend / API', desc: 'Designing HTTP APIs, REST, auth, webhooks', icon: '◉' },
  { id: 'devops', label: 'DevOps / SRE', desc: 'Production ops, load balancing, CDN, observability', icon: '⚙' },
  { id: 'frontend', label: 'Frontend / performance', desc: 'Page load, browser network behavior, Core Web Vitals', icon: '◐' },
  { id: 'security', label: 'Security', desc: 'TLS, certificates, mTLS, encrypted DNS, headers', icon: '⛨' },
  { id: 'fundamentals', label: 'Just the protocols', desc: 'OSI, TCP/IP, DNS, HTTP — foundations first', icon: '⇌' },
];

const GLOSSARY = {
  IP: "Internet Protocol address. v4 is 32-bit (4.3 billion total — exhausted, share via NAT); v6 is 128-bit (effectively infinite). Addresses identify network interfaces, not devices.",
  IPv4: "32-bit address space, written as four dotted decimals (192.168.1.1). 4.3B addresses; exhausted since 2011. Private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.",
  IPv6: "128-bit address space written as eight colon-separated hex groups (2001:db8::1). Adoption ~45% globally in 2026. Required for new mobile networks. Link-local fe80::/10 always present.",
  CIDR: "Classless Inter-Domain Routing notation: 10.0.0.0/24 = 10.0.0.0 with first 24 bits as network prefix, leaving 8 bits = 256 addresses. /32 = single host. /0 = the entire internet.",
  Subnet: "A logical subdivision of an IP network. Defined by network address + subnet mask (or CIDR). Hosts in same subnet talk directly; cross-subnet needs a router.",
  NAT: "Network Address Translation. Maps many private IPs to one public IP. Why your home network can have 50 devices behind one external address. Common in IPv4; rare in IPv6.",
  DNS: "Domain Name System. The protocol that resolves names (example.com) to IPs (93.184.215.14). Hierarchical: root → TLD → authoritative. Cached aggressively.",
  Resolver: "DNS client component that does the recursion work — querying root, TLD, authoritative servers on behalf of the OS. Public: 1.1.1.1 (Cloudflare), 8.8.8.8 (Google), 9.9.9.9 (Quad9).",
  Authoritative: "A DNS server that holds the actual records for a zone — the source of truth. Different from resolvers (which cache). Domain registrars expose 'NS records' pointing to these.",
  "A record": "Maps a domain to an IPv4 address. example.com → 93.184.215.14.",
  "AAAA record": "Maps a domain to an IPv6 address. 'Quad-A.' example.com → 2606:2800:21f:cb07:6820:80da:af6b:8b2c.",
  "CNAME record": "Canonical name — alias. www.example.com → example.com. Can't coexist with other records at the same name; can't be at the zone apex (use ALIAS / ANAME at apex).",
  "MX record": "Mail eXchange. Where to send email for this domain. Has a priority (lower = preferred). gmail.com → various aspmx.l.google.com.",
  "TXT record": "Arbitrary text. Used for SPF (anti-spam), DKIM (email signing), DMARC (email policy), domain verification (Google, GitHub, etc.).",
  "SRV record": "Service location — points to a host + port for a named service. _sip._tcp.example.com → priority/weight/port/target. Used by VoIP, XMPP, autodiscovery.",
  "CAA record": "Certificate Authority Authorization. Lists which CAs may issue certs for the domain. Mitigates rogue issuance. Required by Let's Encrypt and most CAs since 2017.",
  TTL: "Time to live. How long a DNS record may be cached. Short TTL (60s) = fast propagation, more queries. Long TTL (24h) = fewer queries, slow change. Pick deliberately.",
  DoH: "DNS over HTTPS (RFC 8484). Encrypts DNS queries over HTTPS port 443. Blends with web traffic — hard to block. Firefox US: 85%+ adoption (2026).",
  DoT: "DNS over TLS (RFC 7858). Encrypted DNS on dedicated port 853. Network-admin-friendly (visible as DoT traffic). Common in routers and OS-level settings.",
  DoQ: "DNS over QUIC. The newest encrypted DNS transport. Lower latency than DoH because QUIC handshake is faster.",
  ODoH: "Oblivious DNS over HTTPS. Adds a proxy between client and resolver — the resolver sees queries but not the client IP; the proxy sees the IP but not the queries. Apple uses for iCloud Private Relay.",
  DNSSEC: "DNS Security Extensions. Cryptographic signatures on DNS records — proves answers came from the authoritative server. Slow rollout; ~30% of domains in 2026.",
  TCP: "Transmission Control Protocol. Reliable, ordered, connection-oriented. Three-way handshake (SYN, SYN-ACK, ACK) before any data. Head-of-line blocking on packet loss.",
  UDP: "User Datagram Protocol. Connectionless, unreliable, no ordering. Lower overhead. Foundation of DNS, NTP, video streaming, QUIC.",
  QUIC: "RFC 9000. UDP-based transport with built-in encryption + multiplexed streams. Solves TCP's head-of-line blocking. Foundation of HTTP/3.",
  TLS: "Transport Layer Security. The 'S' in HTTPS. TLS 1.3 (RFC 8446) is current — 1-RTT handshake, simpler cipher suites, mandatory forward secrecy.",
  HTTPS: "HTTP over TLS. Default for the web — 94%+ of traffic in 2026. Encrypts request line + headers + body; the destination IP and SNI hostname are still visible without ECH.",
  Certificate: "X.509 document binding a domain name to a public key. Signed by a Certificate Authority (CA) the client trusts. Browsers ship with a root store (~150 CAs).",
  CA: "Certificate Authority. Issues certificates after validating you control the domain. Let's Encrypt (free, automated), DigiCert, GlobalSign. Anyone can be a CA technically; few are trusted.",
  ACME: "Automated Certificate Management Environment (RFC 8555). The protocol Let's Encrypt uses. Clients (certbot, Caddy auto-https, acme.sh) request + renew certs automatically.",
  OCSP: "Online Certificate Status Protocol. How browsers check if a cert is revoked. Stapling (server attaches OCSP response) avoids client→CA round-trip and privacy leak.",
  SNI: "Server Name Indication (TLS extension). Tells the server which hostname you want during handshake — required for one IP to host many HTTPS sites. Still plaintext without ECH.",
  ECH: "Encrypted Client Hello. Encrypts SNI + other handshake fields, hiding the destination hostname from network observers. Cloudflare ships it; Firefox + Chrome support it.",
  HTTP: "Hypertext Transfer Protocol. Request/response over a connection. Stateless (each request independent). Methods (GET, POST, etc.), status codes (200, 404, ...), headers.",
  "HTTP/1.1": "RFC 7230 (1997, refined 2014). Text protocol, one request at a time per connection (pipelining never worked). Still 28% of traffic in 2026 — surprisingly persistent.",
  "HTTP/2": "RFC 9113. Binary, multiplexed streams over a single TCP connection. HPACK header compression. ~51% of traffic in 2026 — the current majority.",
  "HTTP/3": "RFC 9114. HTTP semantics over QUIC. ~21% of traffic in 2026; plateaued. Eliminates TCP head-of-line blocking. Required: TLS 1.3.",
  Method: "GET (fetch), POST (create), PUT (replace), PATCH (update), DELETE (remove), HEAD (headers only), OPTIONS (capabilities), CONNECT (tunnel). REST conventions.",
  "Status code": "3-digit response code. 1xx informational, 2xx success, 3xx redirect, 4xx client error, 5xx server error. The full set is small — worth memorizing.",
  Header: "Key-value metadata on requests and responses. Content-Type, Cache-Control, Authorization, Cookie, X-* custom. HTTP/2+ compresses these via HPACK / QPACK.",
  Cookie: "Header-based key-value pairs the browser persists per-domain. Auth tokens, session IDs. SameSite (Lax/Strict/None), Secure, HttpOnly attributes control behavior.",
  CORS: "Cross-Origin Resource Sharing. Browser security feature controlling which origins may read responses from other origins. Preflight OPTIONS request for 'non-simple' methods.",
  HSTS: "HTTP Strict Transport Security. Server tells browser 'always use HTTPS for this domain.' Once received, browser refuses HTTP for the duration (max-age). Preload list bakes it in.",
  CSP: "Content Security Policy. Server-controlled allowlist for what resources (scripts, styles, images) a page may load. Defense against XSS.",
  ETag: "Cache validator — opaque string a server attaches to a response. Client returns it in If-None-Match on next request; server replies 304 Not Modified if unchanged.",
  "Cache-Control": "Header dictating caching policy. max-age=N, public/private, no-cache (revalidate every time), no-store (don't cache), immutable, stale-while-revalidate.",
  CDN: "Content Delivery Network. Distributed edge servers caching content near users. Cloudflare, Fastly, AWS CloudFront, Akamai. Reduce latency + origin load.",
  Origin: "The server holding the source of truth — what a CDN protects. Also the request origin (scheme://host:port) for CORS.",
  "Reverse proxy": "Sits in front of one or more backend servers. Terminates TLS, routes by host/path, load balances, caches. Nginx, Caddy, HAProxy, Traefik, Envoy.",
  "Load balancer": "Distributes traffic across backends. L4 (TCP/IP — fast, dumb) or L7 (HTTP — content-aware, slower). Algorithms: round-robin, least-connections, IP-hash.",
  Latency: "Time to traverse the network — milliseconds. Limited by speed of light + queuing. NYC ↔ London round-trip ~70ms minimum. Critical for interactive apps.",
  Bandwidth: "Data per unit time — Mbps/Gbps. The 'pipe size.' Different from latency: a fat pipe with high latency still feels slow for chatty protocols.",
  RTT: "Round-Trip Time. Time for a packet to travel client → server → client. Determines how snappy interactive operations feel. TLS 1.3 = 1 RTT to handshake; 0-RTT for resumption.",
  MTU: "Maximum Transmission Unit. Largest packet size allowed on a link. Ethernet default 1500 bytes. Mismatched MTU = silent packet drops, weird slow flows.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "When did the first ARPANET message get sent?",
      opts: ["1969 — UCLA to Stanford", "1983 — TCP/IP standardization", "1991 — World Wide Web"],
      a: 0,
      x: "October 29, 1969 — Leonard Kleinrock's lab at UCLA sent the first message to Stanford Research Institute. They tried to type 'LOGIN'; the system crashed after 'LO'. ARPANET ran on NCP (Network Control Program) until January 1, 1983, when it switched to TCP/IP — the actual birth of 'the Internet' as a protocol-defined network. Tim Berners-Lee invented the Web on top of it in 1989-1991."
    },
    {
      qid: 'o2',
      q: "What's the current state of HTTP version adoption (April 2026)?",
      opts: [
        "HTTP/3 has replaced HTTP/2",
        "HTTP/2: 51%, HTTP/1.x: 28%, HTTP/3: 21% — three versions in stable equilibrium",
        "HTTP/1.1 is gone"
      ],
      a: 1,
      x: "Three months of stable share through Q1-Q2 2026: HTTP/2 51.33%, HTTP/1.1 still 27.63%, HTTP/3 plateaued at 21.04%. HTTPS 94%+. TLS 1.3 dominant at 94%. HTTP/3's plateau is the surprise — the chain (client → server → middleboxes) still has gaps. New protocols don't replace; they accumulate."
    },
    {
      qid: 'o3',
      q: "Why is HTTP/3 stuck at ~21% in 2026 when browsers fully support it?",
      opts: [
        "Browsers don't support it",
        "Deployment chain incomplete: middleboxes (firewalls, NAT, corporate proxies) still block or fall back UDP/QUIC. Operations cost (TLS 1.3 mandatory, UDP performance tuning) also drags adoption.",
        "It's slower than HTTP/2"
      ],
      a: 1,
      x: "Three forces drag HTTP/3 adoption: (1) middleboxes that don't understand QUIC and downgrade connections; (2) operational complexity — UDP performance tuning, mandatory TLS 1.3, kernel optimization (UDP segmentation offload); (3) HTTP/2 is 'good enough' for most sites. Cloudflare/Meta/Google traffic IS mostly HTTP/3 by volume; the long tail is HTTP/2."
    },
  ],
  layers: [
    {
      qid: 'l1',
      q: "OSI Layer 4 is…",
      opts: ["Network (IP)", "Transport (TCP, UDP)", "Application (HTTP)"],
      a: 1,
      x: "OSI 7 layers (bottom up): 1 Physical (cables), 2 Data Link (Ethernet, MAC), 3 Network (IP), 4 Transport (TCP/UDP), 5 Session, 6 Presentation, 7 Application (HTTP, DNS, SSH). TCP/IP collapses this to 4: Link, Internet (IP), Transport (TCP/UDP), Application. People say 'L4 load balancer' (TCP) and 'L7 load balancer' (HTTP) constantly — know what they mean."
    },
    {
      qid: 'l2',
      q: "Encapsulation: what's the order of headers a packet has on the wire?",
      opts: [
        "HTTP → TLS → TCP → IP → Ethernet",
        "Ethernet → IP → TCP → TLS → HTTP",
        "It depends on the day"
      ],
      a: 1,
      x: "Wire order is OUTERMOST FIRST — Ethernet (link) → IP (network) → TCP (transport) → TLS (session/presentation) → HTTP (application). Each layer wraps the next: the Ethernet frame contains the IP packet, which contains the TCP segment, which contains the TLS record, which contains the HTTP message. When debugging, you peel the onion."
    },
  ],
  dns: [
    {
      qid: 'd1',
      q: "Your browser fetches example.com. Which DNS path is correct?",
      opts: [
        "OS asks the website directly",
        "OS → local resolver (often ISP or 1.1.1.1) → root server → TLD (.com) → authoritative for example.com → IP returned, cached at every step",
        "DNS is now optional"
      ],
      a: 1,
      x: "Standard recursive resolution. (1) OS checks its cache + hosts file. (2) Asks configured resolver (1.1.1.1, 8.8.8.8, or ISP). (3) Resolver asks root '.' server → 'go to .com nameservers.' (4) Asks .com → 'go to example.com nameservers.' (5) Asks example.com authoritative → A record. (6) Returns + caches at every hop. Cached lookups bypass most of this — that's why DNS is fast in practice."
    },
    {
      qid: 'd2',
      q: "Why can't you put a CNAME at the zone apex (example.com itself)?",
      opts: [
        "Arbitrary rule",
        "CNAME requires no other records exist at the same name. The zone apex MUST have SOA + NS records. Solutions: ALIAS / ANAME (proprietary), CNAME flattening (Cloudflare), or just use A records.",
        "It works fine"
      ],
      a: 1,
      x: "RFC 1034 says CNAME can't coexist with other record types. Apex must have SOA + NS, so CNAME there is illegal. Workarounds: Cloudflare flattens CNAMEs at apex (resolves and returns A). Route 53 has 'ALIAS' for AWS resources. Or just point an A record at the IP. Use www.example.com → CNAME → cdn.example.com as a workaround."
    },
    {
      qid: 'd3',
      q: "DoH (DNS over HTTPS) — what's the main reason browsers ship it?",
      opts: [
        "Faster than plaintext DNS",
        "Privacy + integrity: prevents ISP from seeing every domain you visit, prevents on-path attackers from forging DNS responses, and traffic blends with HTTPS so it's hard to block.",
        "It uses less bandwidth"
      ],
      a: 1,
      x: "Plaintext DNS (port 53) is the last leak in the encrypted-web story: even with HTTPS, an observer sees every domain you look up. DoH encrypts it. Trade-off: centralization — DoH usually goes to Cloudflare or Google rather than your ISP, concentrating data with fewer parties. ODoH (Oblivious DoH) addresses this by splitting trust."
    },
  ],
  tls: [
    {
      qid: 't1',
      q: "What's different about the TLS 1.3 handshake vs 1.2?",
      opts: [
        "Identical",
        "TLS 1.3 = 1 RTT (or 0-RTT for resumption). TLS 1.2 = 2 RTT minimum. 1.3 dropped weak ciphers, requires forward secrecy, encrypts more of the handshake. Faster + safer.",
        "1.3 is slower"
      ],
      a: 1,
      x: "TLS 1.3 (RFC 8446, 2018) reduced the handshake to 1 round-trip by combining steps and dropping unused negotiation. 0-RTT resumption sends data with the first packet for known servers (with replay-attack caveats). All ciphersuites mandate AEAD + forward secrecy — no more RSA key exchange. As of 2026, TLS 1.3 is 94% of traffic."
    },
    {
      qid: 't2',
      q: "Let's Encrypt certificates expire after 90 days. Why short?",
      opts: [
        "Money",
        "Short validity limits damage from compromised certs, forces automation (manual renewal of millions of certs doesn't scale), and reduces reliance on revocation infrastructure (which doesn't work well).",
        "Compliance"
      ],
      a: 1,
      x: "Browsers + the CA industry have been steadily reducing max cert lifetime (was 5 years, then 2, then 1, then 397 days, soon 200, eventually 47). Short validity = the real revocation mechanism. Forces ACME automation everywhere. Caddy + Traefik + cert-manager handle this transparently. If you're manually renewing certs in 2026, automate."
    },
    {
      qid: 't3',
      q: "What does SNI (Server Name Indication) leak, and what fixes it?",
      opts: [
        "Nothing",
        "SNI sends the hostname in plaintext during TLS handshake — a network observer sees you connected to example.com, even with HTTPS. ECH (Encrypted Client Hello) encrypts SNI. Cloudflare ships it; Firefox + Chrome support it.",
        "It only leaks IP"
      ],
      a: 1,
      x: "Pre-ECH, HTTPS hides URL paths and content but not which hostname you connected to (SNI is plaintext because the server might host many hostnames on one IP and needs to pick a cert before encrypting). ECH (RFC 9460) wraps the inner ClientHello in an outer one encrypted to the CDN's public key. Combined with DoH, hostname-level privacy is real."
    },
  ],
  http: [
    {
      qid: 'h1',
      q: "What's the difference between 301 and 302?",
      opts: [
        "Same thing",
        "301 = permanent redirect (browsers + caches remember). 302 = temporary (always re-check). For lasting URL changes, use 301; for A/B testing or temporary redirects, 302. 308 + 307 are the method-preserving versions.",
        "302 is for GET only"
      ],
      a: 1,
      x: "301 Moved Permanently — search engines update their index, browsers cache aggressively, hard to revert. 302 Found — temporary, re-check each time. 301/302 historically changed POST to GET on redirect; 308 Permanent Redirect + 307 Temporary Redirect preserve the method. Use 308/307 for API redirects."
    },
    {
      qid: 'h2',
      q: "When is PATCH the right method (vs PUT)?",
      opts: [
        "They're identical",
        "PUT replaces the entire resource — send the full new state. PATCH applies a partial update — send only the fields that change. RFC 5789 defines PATCH; format conventions vary (JSON Merge Patch, JSON Patch).",
        "PATCH is deprecated"
      ],
      a: 1,
      x: "PUT /users/1 with {name, email, age} = the resource IS NOW exactly that. PATCH /users/1 with {email: 'new'} = update just email. PATCH bodies aren't fully standardized — RFC 7396 (JSON Merge Patch) is the lightweight common case. RFC 6902 (JSON Patch) is operation-based (add/remove/replace/move). Pick one and document it."
    },
    {
      qid: 'h3',
      q: "What's a CORS preflight, and when does it happen?",
      opts: [
        "Always before every request",
        "An OPTIONS request the browser sends before the real cross-origin request, IF the request is 'non-simple' (custom headers, non-GET/POST methods, Content-Type beyond form-data/url-encoded/plain). Server must respond with Access-Control-Allow-* headers or browser blocks the real request.",
        "Only for POST"
      ],
      a: 1,
      x: "Browsers preflight when: method is not GET/HEAD/POST, OR Content-Type isn't 'simple' (text/plain, multipart/form-data, application/x-www-form-urlencoded), OR custom headers are set, OR credentials are sent. Server replies to OPTIONS with Allow-Origin / Allow-Methods / Allow-Headers / Max-Age (cache the preflight). Common bug: app server doesn't handle OPTIONS — proxy/framework must."
    },
  ],
  transport: [
    {
      qid: 'tr1',
      q: "Why is QUIC built on UDP instead of TCP?",
      opts: [
        "Random",
        "TCP is in-kernel and can't be updated quickly. QUIC ships in userspace on top of UDP — every endpoint can adopt new versions without OS upgrades. Also fixes TCP's head-of-line blocking on packet loss.",
        "UDP is faster"
      ],
      a: 1,
      x: "Three reasons: (1) deployability — TCP modifications need OS updates that take a decade to propagate; QUIC is a userspace library; (2) HoL blocking — TCP is one ordered stream, so one lost packet stalls everything; QUIC has independent streams; (3) integrated TLS 1.3 handshake — fewer round trips. Trade-off: more CPU (encryption + congestion control in userspace), and middleboxes that block UDP."
    },
  ],
  proxies: [
    {
      qid: 'p1',
      q: "L4 vs L7 load balancer — what's the trade-off?",
      opts: [
        "Same thing",
        "L4 routes by TCP/IP (fast, can't see inside encrypted streams, no HTTP awareness). L7 routes by HTTP (host, path, headers — content-aware, can terminate TLS, slower). Use L7 for HTTP services; L4 for non-HTTP or extreme throughput.",
        "L7 is always better"
      ],
      a: 1,
      x: "L4 (HAProxy in TCP mode, AWS NLB, Nginx stream module): doesn't decrypt — fast, less CPU, opaque to traffic. Used for databases, gRPC over TLS, raw TCP services. L7 (Nginx HTTP, HAProxy HTTP mode, Envoy, Traefik, Caddy): terminates TLS, routes by Host header, can rewrite, can rate-limit, can cache. Modern apps default L7."
    },
  ],
  cdn: [
    {
      qid: 'cdn1',
      q: "Cache-Control: public, max-age=31536000, immutable — what does 'immutable' add?",
      opts: [
        "Nothing extra",
        "Tells the browser this resource will NEVER change for the duration. Browsers skip revalidation even on reload (whereas max-age alone may still send If-Modified-Since on F5). Use for content-hashed asset URLs.",
        "Cache forever regardless"
      ],
      a: 1,
      x: "max-age=N alone: browser may still revalidate with If-Modified-Since / If-None-Match on user-initiated reload (F5). immutable says 'don't even revalidate' — assumes the URL changes when content changes (hash-in-filename: app.a3f2c1.js). Use with build-pipeline-fingerprinted assets. Save bandwidth + reduce origin load."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What separates capable network practitioners from senior ones?",
      opts: [
        "Memorizing all the RFCs",
        "Fluent debugging with curl/dig/openssl s_client, reading EXPLAIN-like artifacts (Chrome DevTools Network panel, HAR files), thinking in layers (which layer is broken?), and understanding the protocol gap between 'works in dev' and 'works behind a CDN with TLS termination'.",
        "Knowing every port number"
      ],
      a: 1,
      x: "Networking debugging is layer triage: is it L3 (can I ping?), L4 (can I open a TCP connection?), L5/6 (does TLS handshake complete?), L7 (does HTTP return what I expect?). curl -v, dig +trace, openssl s_client -connect host:443, and reading Network panels fluently is the senior toolkit."
    },
  ],
};

const COMPARISONS = {
  http_versions: {
    title: 'HTTP version landscape (April 2026)',
    headers: ['Version', 'Transport', 'Adoption', 'Key trait', 'Use when'],
    rows: [
      ['HTTP/1.1', 'TCP', '27.6%', "Text protocol, 1 request at a time per connection", "Legacy stuck, simple intermediaries, never going away"],
      ['HTTP/2', 'TCP + TLS 1.2+', '51.3% (majority)', "Binary, multiplexed streams, HPACK compression", "Default modern choice; what every CDN serves"],
      ['HTTP/3', 'QUIC (UDP) + TLS 1.3', '21.0% (plateaued)', "No HoL blocking, 0-RTT resumption, integrated TLS", "Mobile-heavy apps, latency-sensitive (video, gaming)"],
    ],
  },
  tls_versions: {
    title: 'TLS version status',
    headers: ['Version', 'Year', 'Status', 'Notes'],
    rows: [
      ['SSL 2.0 / 3.0', '1995-1996', 'BANNED', 'Cryptographically broken. Browsers reject.'],
      ['TLS 1.0 / 1.1', '1999-2006', 'DEPRECATED', 'Disabled in all major browsers since 2020.'],
      ['TLS 1.2', '2008', 'Legacy support', 'Still functional. ~6% of 2026 traffic.'],
      ['TLS 1.3', '2018 (RFC 8446)', 'CURRENT', '94% of traffic. 1-RTT handshake. Default.'],
    ],
  },
  dns_records: {
    title: 'Essential DNS record types',
    headers: ['Type', 'Maps to', 'Example use'],
    rows: [
      ['A', 'IPv4 address', "example.com → 93.184.215.14"],
      ['AAAA', 'IPv6 address', "example.com → 2606:2800:21f:cb07:..."],
      ['CNAME', 'Another name (alias)', "www.example.com → example.com"],
      ['MX', 'Mail server + priority', "example.com mail → mx1.example.com (10)"],
      ['TXT', 'Arbitrary text', "SPF, DKIM, DMARC, domain verification"],
      ['NS', 'Authoritative nameserver', "example.com → ns1.cloudflare.com"],
      ['SRV', 'Service location (host:port)', "_sip._tcp.example.com → priority/weight/port/target"],
      ['CAA', 'Allowed certificate authority', "example.com CAA 0 issue 'letsencrypt.org'"],
      ['PTR', 'IP → name (reverse DNS)', "Reverse lookups; mail server trust"],
      ['SOA', 'Zone metadata', "Primary NS + admin email + serial + refresh/retry/expire"],
    ],
  },
  status_codes: {
    title: 'HTTP status codes worth knowing',
    headers: ['Code', 'Meaning', 'When to use'],
    rows: [
      ['200 OK', 'Success', "Standard happy path"],
      ['201 Created', 'Resource created', "POST that creates; return Location header"],
      ['204 No Content', 'Success, empty body', "DELETE success, PUT update with no payload"],
      ['301 / 308', 'Permanent redirect', "URL moved forever (308 preserves method)"],
      ['302 / 307', 'Temporary redirect', "Try again here for now (307 preserves method)"],
      ['304 Not Modified', 'Cache hit', "ETag / Last-Modified matched — use your cache"],
      ['400 Bad Request', 'Client sent garbage', "Malformed JSON, validation failure"],
      ['401 Unauthorized', 'No / bad credentials', "Missing or invalid auth — sign in"],
      ['403 Forbidden', 'Auth valid but no access', "Logged in but not allowed"],
      ['404 Not Found', 'Resource missing', "URL doesn't exist (or hidden)"],
      ['409 Conflict', 'State conflict', "Concurrent edit, version mismatch"],
      ['410 Gone', 'Resource intentionally removed', "Like 404 but signals 'won't return'"],
      ['422 Unprocessable', 'Syntax OK, semantics wrong', "Validation failure after parse"],
      ['429 Too Many Requests', 'Rate limit', "Retry-After header should accompany"],
      ['500 Internal Server Error', 'Server crashed', "Unhandled exception, generic failure"],
      ['502 Bad Gateway', 'Upstream returned garbage', "Proxy got bad response from backend"],
      ['503 Service Unavailable', "Server can't right now", "Maintenance, overload — Retry-After"],
      ['504 Gateway Timeout', "Upstream didn't reply", "Backend too slow / dead"],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "Plaintext DNS in 2026", reason: "Every hostname you look up leaks to your ISP and any on-path observer. Configure DoH (1.1.1.1, dns.google, dns.quad9.net) on devices, routers, and OS. Browsers ship DoH by default in many regions." },
  { name: "GET for state changes", reason: "GET is supposed to be safe + idempotent — caches, browsers, and prefetchers may re-fire it without consent. Use POST/PUT/PATCH/DELETE for mutations. Crawlers triggering deletes is a classic incident." },
  { name: "Hardcoded IPs in app code", reason: "DNS exists for a reason. IPs change, CDNs return different IPs per region, load balancers shift backends. Hardcoded IPs break in mysterious ways and skip TLS SNI matching." },
  { name: "No HSTS on production HTTPS", reason: "Without HSTS, the first connection to your domain CAN be plain HTTP (until redirected). MITM possible. Set Strict-Transport-Security: max-age=31536000; includeSubDomains; preload. Submit to hstspreload.org." },
  { name: "Mixing HTTP and HTTPS resources", reason: "An HTTPS page loading HTTP scripts/images = 'mixed content' — modern browsers block scripts entirely, downgrade page security. Audit all asset URLs. Use protocol-relative or HTTPS explicitly." },
  { name: "Wildcard CORS in production", reason: "Access-Control-Allow-Origin: * means any site can read your API responses. Acceptable for genuinely public data (font CDNs); dangerous when combined with credentialed cookies. Be explicit: list trusted origins." },
  { name: "Long TTLs on records you change", reason: "TTL 86400 + domain migration = 24 hours of split-brain. Before any change, lower TTL to 60s a day ahead. After the change settles, raise it back. Pre-plan TTL like you pre-plan deploys." },
  { name: "Synchronous fan-out across the network", reason: "Backend calls 5 microservices serially over HTTP = sum of all latencies + any timeout kills the request. Parallelize independent calls; use timeouts everywhere; have circuit breakers." },
  { name: "No client-side timeout", reason: "Default HTTP libraries often wait forever. A backend hang = your worker pool exhausted = cascading outage. Set timeouts on every external call (connect, read, total). Reasonable defaults: 5-30 seconds depending on operation." },
  { name: "Cache-Control on dynamic content", reason: "User-specific responses (account pages, dashboards) cached on a CDN = one user sees another's data. Cache-Control: private, no-store on anything personalized. Vary on Cookie/Authorization when applicable." },
];

const COMMANDS = [
  { cmd: 'dig +short example.com', desc: "DNS lookup, A record. +trace shows recursion. +short = just the answer. @1.1.1.1 = ask specific resolver. dig MX example.com for mail records." },
  { cmd: 'dig +trace example.com', desc: "Walk the entire DNS recursion — root → TLD → authoritative. Shows you exactly how the answer is derived. Best DNS debugging command." },
  { cmd: 'curl -v https://example.com', desc: "HTTP request with full transcript — DNS, TCP, TLS handshake, request, response headers. -I = headers only. -L follows redirects. --http3 forces HTTP/3 (curl 8.0+)." },
  { cmd: 'curl -w "%{time_total}s %{http_version}\\n" -o /dev/null -s https://example.com', desc: "Total time + HTTP version detected. -w extracts variables; %{time_namelookup}, %{time_connect}, %{time_starttransfer} break down phases." },
  { cmd: 'openssl s_client -connect example.com:443 -servername example.com', desc: "Manual TLS handshake. See cert chain, ciphers, protocols. Press Ctrl+D to send + close. -tls1_3 forces version. The TLS debugging command." },
  { cmd: 'openssl x509 -in cert.pem -text -noout', desc: "Decode a certificate file — subject, issuer, validity, extensions (SAN, key usage). Add -dates for just the validity window." },
  { cmd: 'curl https://cloudflare-dns.com/dns-query?name=example.com&type=A -H "accept: application/dns-json"', desc: "DNS-over-HTTPS lookup using Cloudflare's resolver. Returns JSON. Works from anywhere with HTTPS access. The sandbox in this atlas uses this." },
  { cmd: 'ping -c 5 example.com', desc: "ICMP echo, 5 packets. Tests basic reachability + measures RTT. Not all servers respond to ping; use other tools for actual diagnostics." },
  { cmd: 'traceroute example.com', desc: "Show the path packets take. Each hop adds ~1 row. Asterisks mean a hop didn't respond — common; doesn't necessarily indicate failure. mtr (combined ping+traceroute) is better." },
  { cmd: 'ss -tnlp | grep LISTEN', desc: "What's listening on TCP ports? Modern replacement for 'netstat -tnlp'. -t TCP, -n no DNS resolve, -l listening, -p process. -u for UDP." },
  { cmd: 'tcpdump -i any -nn host example.com', desc: "Capture packets to/from example.com. -i any all interfaces, -nn don't resolve. Best paired with Wireshark for analysis. Heavy tool; use when other tools fail." },
  { cmd: 'nginx -t && systemctl reload nginx', desc: "Test config syntax, then graceful reload. Reload re-reads config without dropping connections. Don't restart in production unless you must." },
];

const RESOURCES = [
  { name: "High Performance Browser Networking", url: 'hpbn.co (free online)', note: "Ilya Grigorik (former Google web perf lead). Free online. Covers TCP, UDP, TLS, HTTP/1/2, WebSocket, WebRTC. The definitive book on browser networking. Read it.", kind: 'book' },
  { name: "Computer Networking: A Top-Down Approach", url: "A book — Kurose & Ross", note: "The standard university textbook for networking. Top-down: starts with HTTP and works down to physical. ~800 pages. Best for foundational depth.", kind: 'book' },
  { name: "Cloudflare Learning Center", url: 'cloudflare.com/learning', note: "Free articles on DNS, TLS, HTTP, DDoS, BGP, CDN — written by people running the network at scale. Excellent for filling specific gaps quickly.", kind: 'reference' },
  { name: "MDN Web Docs — HTTP section", url: 'developer.mozilla.org/en-US/docs/Web/HTTP', note: "Mozilla. Best free reference for HTTP semantics — methods, headers, status codes, CORS, caching. Search engine for HTTP knowledge.", kind: 'reference' },
  { name: "Caddy documentation", url: 'caddyserver.com/docs', note: "Even if you don't use Caddy: its docs explain HTTPS automation (ACME), reverse proxying, TLS configuration better than most tutorials. Worth reading.", kind: 'reference' },
  { name: "Let's Encrypt documentation", url: 'letsencrypt.org/docs', note: "How ACME actually works. Challenge types (HTTP-01, DNS-01, TLS-ALPN-01). Rate limits. Operational guidance for production cert automation.", kind: 'reference' },
  { name: "Wireshark Wiki — Sample Captures", url: 'wiki.wireshark.org/SampleCaptures', note: "Real packet captures to study: TLS 1.3 handshakes, HTTP/2 streams, DNS resolution. Open in Wireshark; learn by inspection.", kind: 'tool' },
  { name: "Internet Storm Center", url: 'isc.sans.edu', note: "Daily threat + network anomaly reporting. Not learning-oriented, but you'll learn debugging through real incident analyses.", kind: 'reference' },
  { name: "RFC Editor (rfc-editor.org)", url: 'rfc-editor.org', note: "The actual standards. RFC 9110-9114 = HTTP/1.1/2/3 modern set. RFC 9000 = QUIC. RFC 8446 = TLS 1.3. RFC 1034/1035 = DNS. Free, authoritative, dense.", kind: 'spec' },
  { name: "Julia Evans zines", url: 'wizardzines.com', note: "Illustrated quick-reference zines on networking topics (HTTP, DNS, tcpdump). Friendly, deep, surprisingly current. Paid; worth it.", kind: 'book' },
  { name: "Cloudflare Radar", url: 'radar.cloudflare.com', note: "Real-time stats: HTTP version share, TLS version share, DNS query trends, BGP outages globally. Where the 2026 protocol numbers come from.", kind: 'tool' },
  { name: "DNSViz", url: 'dnsviz.net', note: "Visualize DNS resolution + DNSSEC chain for any domain. Best DNS debugging tool that isn't dig.", kind: 'tool' },
];

const PERSONALIZED = {
  backend: {
    spark: "Backend: REST conventions, idempotent methods, proper status codes, pagination + filtering patterns, webhooks. Build APIs that other apps can integrate without reading source code.",
    dns: "Backend: API subdomains (api.example.com), separate frontend/backend nameservers, CAA records to lock certificate issuance. Document your DNS like you document code.",
    http: "Backend: PATCH vs PUT clarity, 201 with Location header on create, 204 on successful delete with no body, 409 on version conflict, 429 with Retry-After on rate limit. Idempotency keys for non-idempotent POST.",
    library: "Backend: HTTP patterns (status codes, headers, idempotency), Security headers (HSTS, CSP, CORS), Caching (ETag for API responses), Debugging (curl + jq workflow).",
  },
  devops: {
    spark: "DevOps: Caddy or Traefik for automatic HTTPS (no manual cert work), CDN in front of origin (Cloudflare), observability across the network stack (logs + metrics + traces), graceful deploys.",
    dns: "DevOps: low TTL during migrations, multi-CDN strategies, geo-DNS via NS1 / Route 53 / Cloudflare, DNSSEC validation in critical paths. Monitor DNS resolution time as a first-class metric.",
    http: "DevOps: Cache-Control headers as a deployment discipline, HSTS preload for permanent HTTPS, structured access logs (JSON), rate limiting at the edge, Cloudflare Workers / Lambda@Edge for header rewrites.",
    library: "DevOps: Reverse proxies (Caddy + Nginx configs), Load balancing (health checks, sticky sessions), Caching (CDN + browser cache layering), Debugging (mtr, dig, tcpdump field manual).",
  },
  frontend: {
    spark: "Frontend: every fetch is a network hop — coalesce, cache, prefetch. Service workers for offline + cache control. Lazy load below the fold. Core Web Vitals (LCP, INP, CLS) are network-shaped.",
    dns: "Frontend: dns-prefetch + preconnect for critical third-party origins. Self-host fonts when possible (one less DNS lookup + connection). HTTP/3 helps mobile users with lossy networks.",
    http: "Frontend: HTTP/2 + HTTP/3 enable many parallel requests but request count still matters; cache aggressively with content-hashed URLs + immutable; ETag for revalidation. fetch() vs XHR (use fetch).",
    library: "Frontend: HTTP patterns (fetch with timeout, AbortController), Caching (immutable + content-hash), Security headers (CSP, frame-ancestors), Debugging (DevTools Network panel as primary tool).",
  },
  security: {
    spark: "Security: TLS 1.3 only, HSTS preload, CAA records, mTLS for service-to-service, OAuth 2.1 / OIDC for users. Defense in depth: assume any single layer fails.",
    dns: "Security: DNSSEC for high-value zones, CAA to lock CAs, DoH/DoT to prevent ISP snooping, separate registrar accounts with hardware 2FA. DNS hijacking is the start of most domain takeovers.",
    tls: "Security: cert lifetime minimization (let ACME automate), ECH for SNI privacy, OCSP stapling, pinning for first-party mobile apps (carefully — avoid bricking). Audit your trust chain.",
    library: "Security: TLS patterns (Let's Encrypt + Caddy), Security headers (HSTS + CSP + Permissions-Policy), Debugging (openssl s_client, ssllabs.com test, securityheaders.com).",
  },
  fundamentals: {
    spark: "Learn the protocols. Start with HPBN (free online). Set up a local server with nginx or Caddy. Use curl -v relentlessly. Read packet captures. The foundation pays dividends forever.",
    dns: "Spend 2-3 weeks JUST on DNS. dig +trace every domain you visit. Set up your own zone (cheap domain + Cloudflare free tier). Add every record type at least once. Understand TTL.",
    tls: "Use openssl s_client manually. Generate self-signed certs with openssl req. Build a tiny CA. Watch a TLS 1.3 handshake in Wireshark. Read RFC 8446 (yes, the actual RFC). It clicks once you've done it.",
    library: "All categories. Each library category maps to a real ops skill — DNS hygiene, TLS automation, HTTP correctness, caching, proxy configuration, security headers, debugging tools.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's broken?",
    opts: [
      { label: "🔴 DNS won't resolve / wrong IP returned", next: 'dns-fail' },
      { label: "🔴 TLS handshake fails / cert error", next: 'tls-fail' },
      { label: "🚫 CORS error in browser console", next: 'cors-fail' },
      { label: "🔄 Redirect loop / infinite redirects", next: 'redirect-loop' },
      { label: "🐢 Site is slow / poor latency", next: 'slow' },
      { label: "❓ Mixed content blocked in browser", next: 'mixed' },
      { label: "🔌 Connection refused / timeout", next: 'conn' },
      { label: "🌀 5xx errors from your service", next: '5xx' },
    ],
  },
  'dns-fail': {
    fix: "DNS is a hierarchy + cache pile-up. Trace it to find the layer that's wrong.",
    steps: [
      "dig +short example.com — what IP does the public resolver return? Try @1.1.1.1 + @8.8.8.8 to see if they agree.",
      "dig +trace example.com — walk the recursion from root. Shows you which nameserver returned what. If trace fails at a particular level, that's your culprit.",
      "Compare to authoritative directly: dig @ns1.your-registrar.com example.com — is the record actually there?",
      "TTL still high after a change? Old caches everywhere. Wait the TTL out. Lower TTL BEFORE planned changes.",
      "/etc/hosts override on your machine? cat /etc/hosts to be sure. Local DNS cache: ipconfig /flushdns (Windows), sudo dscacheutil -flushcache (macOS), systemd-resolve --flush-caches (Linux).",
      "Browser-level DNS cache: chrome://net-internals/#dns → Clear host cache.",
      "DoH bypassing your DNS server? Browsers + OS now use DoH to Cloudflare/Google. Check browser settings if local DNS overrides aren't working.",
    ],
  },
  'tls-fail': {
    fix: "TLS error type tells you what's wrong: cert validity, name mismatch, chain incomplete, protocol/cipher mismatch.",
    steps: [
      "openssl s_client -connect example.com:443 -servername example.com — see the cert chain + handshake. Reads like dig +trace for TLS.",
      "Cert expired? Look at the Validity / Not After date. Set up auto-renewal (certbot, Caddy, acme.sh).",
      "Name mismatch? Cert is for example.com but you're hitting www.example.com or vice versa. Check SAN extensions (openssl x509 -in cert -text | grep -A1 'Subject Alternative Name').",
      "Chain incomplete? Server didn't send intermediate certs. Browsers can sometimes auto-fetch; many tools (Java HTTP clients, curl on some systems) can't. Fix server config to include full chain.",
      "Self-signed cert in production? You shouldn't. Use Let's Encrypt (free) via certbot or Caddy. Caddy auto-handles ACME on its own.",
      "Modern client refuses TLS 1.0/1.1? Don't disable security; upgrade server config. Mozilla SSL Config Generator gives copy-paste for nginx/apache/caddy.",
      "Test from outside your network: ssllabs.com/ssltest/. Gives full grade + diagnoses common issues.",
    ],
  },
  'cors-fail': {
    fix: "Browser blocks cross-origin reads unless server explicitly allows. Read the exact error in DevTools.",
    steps: [
      "Open DevTools → Network panel. Look at the failing request. Is there a preflight OPTIONS request? What did the server return?",
      "Non-simple request triggered preflight. Server MUST respond to OPTIONS with Access-Control-Allow-Origin (matching your origin or *), Allow-Methods, Allow-Headers covering what you're sending.",
      "Server returns 200 to OPTIONS but missing headers? Framework/proxy stripping them. Add headers explicitly: nginx 'add_header Access-Control-Allow-Origin $http_origin always;' (the 'always' matters for error responses).",
      "Wildcard + credentials? Can't combine '*' with Access-Control-Allow-Credentials: true. Must echo the specific origin instead.",
      "Cookies on cross-origin? SameSite=None; Secure required. Browsers no longer send cross-site cookies by default.",
      "Test: curl -i -X OPTIONS https://api.example.com/path -H 'Origin: https://app.example.com' -H 'Access-Control-Request-Method: POST' — does the response have proper headers?",
    ],
  },
  'redirect-loop': {
    fix: "Two systems disagree about where the canonical URL is. Usually a CDN/origin/app misconfiguration.",
    steps: [
      "curl -IL https://example.com — see the full redirect chain. -I = head only, -L = follow.",
      "HTTP → HTTPS at edge AND app-level both redirecting? CDN says 'go to HTTPS', app behind CDN sees HTTP-from-CDN and says 'go to HTTPS' again, loop. Trust X-Forwarded-Proto header at app level.",
      "WWW vs non-WWW: both sides redirecting to the other. Pick one canonical, redirect the other to it once.",
      "Trailing slash: /path → /path/ → /path → … Configure one rule, not two.",
      "Custom domain on a hosted platform (Vercel, Netlify) with old redirect rule still active? Check the platform's redirect config.",
    ],
  },
  'slow': {
    fix: "Latency vs throughput vs server time — different fixes. Measure first.",
    steps: [
      "curl -w '@-' -o /dev/null -s https://example.com <<< '\\n  dns:    %{time_namelookup}s\\n  conn:   %{time_connect}s\\n  tls:    %{time_appconnect}s\\n  ttfb:   %{time_starttransfer}s\\n  total:  %{time_total}s\\n' — phase breakdown.",
      "DNS slow (> 100ms)? Configure DoH or change resolver. Add dns-prefetch hints for known third parties.",
      "TLS slow (> 200ms)? Upgrade to TLS 1.3, enable HTTP/2 or HTTP/3 (TLS 1.3 in QUIC = 1-RTT).",
      "TTFB slow (time to first byte)? Origin slow — your server or backend. Investigate app metrics, database, etc.",
      "Total slow but TTFB fast? Big response or slow transfer. Check Content-Encoding (gzip / br compression). Check response size.",
      "Worldwide users? Add CDN. Cloudflare free tier covers most cases. Configure proper Cache-Control headers so CDN actually caches.",
      "Use webpagetest.org for a real browser test from multiple locations. Filmstrip + waterfall make root cause obvious.",
    ],
  },
  'mixed': {
    fix: "HTTPS page is loading HTTP resources. Browser blocks scripts; passive content gets a warning.",
    steps: [
      "DevTools console will list each blocked resource with URL. Fix at the source — change http:// to https:// in your code/templates.",
      "Old absolute URLs in DB content (user-generated)? Migration: UPDATE rows replacing http:// with https:// for safe domains. Or rewrite in HTML proxy.",
      "Third-party widget on http://? They need HTTPS or you can't use them. Most major widgets support HTTPS now.",
      "Use Content-Security-Policy: upgrade-insecure-requests — tells browser to automatically rewrite http:// to https:// for subresource requests. Useful migration tool.",
      "Audit: securityheaders.com tests your domain for these issues + more.",
    ],
  },
  'conn': {
    fix: "Connection refused = nothing listening / firewall blocking. Timeout = packets disappearing into the void.",
    steps: [
      "Connection refused: service isn't running, or running on wrong port, or bound to localhost only (127.0.0.1) instead of 0.0.0.0. Check ss -tlnp on the server.",
      "Timeout: firewall (host or cloud security group), wrong route, MTU issue. Test with telnet host port or nc -vz host port.",
      "Telnet hangs forever → packets being dropped silently (firewall). Telnet refused fast → service not listening.",
      "Cloud (AWS/GCP/Azure): check security groups, NACLs, route tables, and instance-level iptables/ufw.",
      "DNS returned an old/wrong IP? Service moved. dig +short the hostname, telnet to current IP directly to bypass DNS.",
      "Look at server logs at the time of the attempted connection. If nothing shows up, traffic never reached the host.",
    ],
  },
  '5xx': {
    fix: "5xx = your side broke. Read the logs. 502/503/504 are proxy errors with specific meanings.",
    steps: [
      "500: unhandled exception. App logs will have the stack trace. Look there first.",
      "502 Bad Gateway: proxy got malformed response from backend. Backend likely crashed mid-response, or returned non-HTTP, or has wrong content-length.",
      "503 Service Unavailable: server explicitly says 'not now.' Pair with Retry-After header. Often used during deploys, maintenance, overload.",
      "504 Gateway Timeout: backend didn't respond in time. Proxy timeout (nginx proxy_read_timeout default 60s) lower than backend's slow query? Either speed up backend or extend timeout.",
      "Intermittent 5xx? Could be a single bad instance behind a load balancer. Check per-instance health. Check connection pool exhaustion.",
      "5xx spike + DB connection errors → DB overload or connection pool depleted. Look at DB metrics, not app metrics.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'app', x: 20, y: 18, w: 100, h: 28, label: 'Application', layer: 'L7', color: '#67e8f9', desc: "HTTP, DNS, SMTP, SSH, WebSocket. The protocols you write code against. Where REST APIs, browsers, mail clients operate." },
  { id: 'tls', x: 20, y: 58, w: 100, h: 28, label: 'TLS / SSL', layer: 'L6/5', color: '#67e8f9', desc: "Encryption + authentication layer between transport and application. TLS 1.3 is current. Provides confidentiality, integrity, identity via certificates." },
  { id: 'tcp', x: 20, y: 98, w: 100, h: 28, label: 'Transport', layer: 'L4', color: '#fb923c', desc: "TCP (reliable, ordered), UDP (datagrams, no guarantees), QUIC (UDP-based with TLS + multiplexing). Ports live here." },
  { id: 'ip', x: 20, y: 138, w: 100, h: 28, label: 'Network (IP)', layer: 'L3', color: '#fb923c', desc: "IPv4 / IPv6 — addressing + routing across networks. Routers operate at this layer. NAT lives here. Source of latency budgets." },
  { id: 'eth', x: 20, y: 178, w: 100, h: 28, label: 'Data link', layer: 'L2', color: '#fb923c', desc: "Ethernet, Wi-Fi (802.11), MAC addresses. Local network frames. Switches operate here." },
  { id: 'phy', x: 20, y: 218, w: 100, h: 28, label: 'Physical', layer: 'L1', color: '#fb923c', desc: "Copper, fiber, radio. Actual bits on actual media. Cables and modulation. Where engineers find 'is it plugged in.'" },
  { id: 'dns', x: 160, y: 18, w: 110, h: 28, label: 'DNS resolver', color: '#67e8f9', desc: "1.1.1.1, 8.8.8.8, your ISP. Translates names → IPs. Most queries served from cache." },
  { id: 'cdn', x: 160, y: 78, w: 110, h: 28, label: 'CDN edge', color: '#67e8f9', desc: "Cloudflare, Fastly, CloudFront. Caches static content close to users. TLS termination, security at the edge." },
  { id: 'lb', x: 160, y: 138, w: 110, h: 28, label: 'Load balancer', color: '#fb923c', desc: "Nginx, Caddy, HAProxy, AWS ELB. Routes traffic to one of N backends. L4 (TCP) or L7 (HTTP)." },
  { id: 'origin', x: 160, y: 198, w: 110, h: 28, label: 'Origin server', color: '#fb923c', desc: "Your app. Where the work actually happens. Behind every CDN + LB; rarely directly exposed to the internet." },
];

const CHALLENGES = [
  {
    id: 'resolve',
    title: '01 · Resolve a domain',
    desc: "Look up example.com's IPv4 (A record) using DNS over HTTPS. Returns 93.184.215.14 (or similar).",
    hint: "Use the DoH query type 'A'.",
    check: (result) => result && result.Answer && result.Answer.some(r => /^\d+\.\d+\.\d+\.\d+$/.test(r.data)),
    op: 'dns',
    domain: 'example.com',
    type: 'A',
  },
  {
    id: 'records',
    title: '02 · Find Cloudflare\'s nameservers',
    desc: "Query cloudflare.com NS records via DoH. Should return ns1.cloudflare.com / ns2.cloudflare.com style answers.",
    hint: "DoH query type 'NS' on cloudflare.com.",
    check: (result) => result && result.Answer && result.Answer.some(r => r.data?.includes('cloudflare.com')),
    op: 'dns',
    domain: 'cloudflare.com',
    type: 'NS',
  },
  {
    id: 'http',
    title: '03 · Fetch a URL + check status',
    desc: "Fetch https://httpbin.org/status/200 and confirm status code 200.",
    hint: "Just a fetch. Look at the status field in the result.",
    check: (result) => result?.status === 200,
    op: 'http',
    url: 'https://httpbin.org/status/200',
  },
  {
    id: 'redirect',
    title: '04 · Detect a redirect',
    desc: "Fetch https://httpbin.org/redirect/1 — see how the fetch handles a 302 redirect chain.",
    hint: "fetch follows redirects by default. The final URL should differ from the requested URL.",
    check: (result) => result?.url && result.url !== 'https://httpbin.org/redirect/1',
    op: 'http',
    url: 'https://httpbin.org/redirect/1',
  },
  {
    id: 'json',
    title: '05 · Fetch JSON, inspect it',
    desc: "Fetch https://httpbin.org/json and confirm the body parses as JSON.",
    hint: "Read result.bodyJson — should be a parsed object, not null.",
    check: (result) => result?.bodyJson && typeof result.bodyJson === 'object',
    op: 'http',
    url: 'https://httpbin.org/json',
  },
  {
    id: 'cors',
    title: '06 · Hit a non-CORS endpoint',
    desc: "Try fetching https://api.github.com/zen — it allows CORS and returns a one-liner zen quote.",
    hint: "GitHub's API sets Access-Control-Allow-Origin: *. The response will be plaintext.",
    check: (result) => result?.status === 200 && typeof result.bodyText === 'string' && result.bodyText.length > 0,
    op: 'http',
    url: 'https://api.github.com/zen',
  },
];

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'netatlas:';
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

const LIBRARY = {
  dns: {
    label: 'DNS',
    icon: '◯',
    snippets: [
      {
        id: 'records-template',
        title: 'A minimal production DNS zone',
        desc: "What every domain should have: apex + www, mail (or explicit no-mail), CAA to lock CA, TXT for SPF/DMARC.",
        code: `; example.com zone — copy-paste template
example.com.        IN  A      203.0.113.10       ; or use ALIAS to a hostname
example.com.        IN  AAAA   2001:db8::10
www.example.com.    IN  CNAME  example.com.

; Mail — either real MX or explicit "no mail"
example.com.        IN  MX     10  mail.example.com.
; If you don't send email FROM this domain:
example.com.        IN  TXT    "v=spf1 -all"
_dmarc.example.com. IN  TXT    "v=DMARC1; p=reject; rua=mailto:dmarc@example.com"

; CAA — lock which CAs can issue certs for you
example.com.        IN  CAA    0  issue       "letsencrypt.org"
example.com.        IN  CAA    0  issuewild   "letsencrypt.org"
example.com.        IN  CAA    0  iodef       "mailto:security@example.com"

; TXT for ownership verification (Google, GitHub, etc.)
example.com.        IN  TXT    "google-site-verification=..."`,
        note: "Even if you don't send mail FROM a domain, set SPF -all and DMARC p=reject to prevent spammers from spoofing it. CAA records prevent rogue CAs from issuing certs (Let's Encrypt enforces CAA). Use Cloudflare/Route 53/your-registrar; copy this template, fill in IPs."
      },
      {
        id: 'ttl-strategy',
        title: 'TTL strategy by record type',
        desc: "Long TTL = fewer queries, slow change. Short TTL = fast updates, more queries. Match TTL to expected churn.",
        code: `; STABLE infrastructure — long TTL (24h)
example.com.        IN  A      203.0.113.10   ; TTL 86400
www.example.com.    IN  CNAME  example.com.   ; TTL 86400

; APEX records during planned change — DROP TTL FIRST
; 24h before change:
example.com.        IN  A      203.0.113.10   ; TTL 60
; Wait 24h for caches to expire old TTL
; Make the change:
example.com.        IN  A      203.0.113.20   ; TTL 60
; After change settles (24-48h):
example.com.        IN  A      203.0.113.20   ; TTL 86400

; CDN-fronted records — let CDN handle it
www.example.com.    IN  CNAME  example.cdn.com. ; TTL 300

; Email — long TTL, rarely changes
example.com.        IN  MX  10  mail.example.com.  ; TTL 86400`,
        note: "The pre-emptive TTL drop is the single most-forgotten DNS practice. Day before a migration: lower TTL to 60s. Day after migration settles: raise back to 24h. Skipping this = up to 24h of split-brain during the migration."
      },
      {
        id: 'doh-curl',
        title: 'DNS over HTTPS from anywhere with curl',
        desc: "DoH queries work from anywhere HTTPS does. JSON API at Cloudflare 1.1.1.1.",
        code: `# Cloudflare DoH (JSON API) — accepts ?name= ?type=
curl -s 'https://cloudflare-dns.com/dns-query?name=example.com&type=A' \\
    -H 'accept: application/dns-json' | jq

# Sample response:
# {
#   "Status": 0,
#   "Answer": [
#     {
#       "name": "example.com",
#       "type": 1,
#       "TTL": 3600,
#       "data": "93.184.215.14"
#     }
#   ]
# }

# Google DoH (same JSON format)
curl -s 'https://dns.google/resolve?name=example.com&type=A' | jq

# Quad9 DoH
curl -s 'https://dns.quad9.net:5053/dns-query?name=example.com&type=A' \\
    -H 'accept: application/dns-json' | jq

# Force DoH for the whole system:
# Linux: systemd-resolved with DNSOverTLS=yes + DNS=1.1.1.1#cloudflare-dns.com
# macOS: System Settings → Network → Wi-Fi → Details → DNS
# Browsers: Firefox Settings → Privacy → Network Settings`,
        note: "This is the same API the Net Atlas sandbox uses. Works from any environment with HTTPS access — including JavaScript fetch from the browser. Bypasses ISP DNS (and ISP censorship)."
      },
      {
        id: 'dig-cookbook',
        title: 'dig cookbook — the queries you actually run',
        desc: "Common dig invocations. Print this. Tape it to your monitor.",
        code: `# Quick lookup
dig +short example.com                # A records only
dig +short MX example.com             # mail servers
dig +short TXT example.com            # SPF, DKIM, verification
dig +short NS example.com             # authoritative nameservers
dig +short -x 8.8.8.8                 # reverse DNS

# Trace recursion (best DNS debugging tool)
dig +trace example.com                # walk root → TLD → authoritative

# Query a specific server
dig @1.1.1.1 example.com              # ask Cloudflare directly
dig @ns1.your-registrar.com example.com  # ask authoritative directly

# Multiple types at once (BIND 9.11+)
dig example.com A AAAA MX TXT

# Compare resolvers (find DNS inconsistency)
for resolver in 1.1.1.1 8.8.8.8 9.9.9.9 208.67.222.222; do
    echo "=== $resolver ==="
    dig @$resolver +short example.com
done

# DNSSEC validation
dig +dnssec example.com               # see RRSIG records
dig +sigchase +trusted-key=./trusted-key.key example.com   # validate locally`,
        note: "dig +trace is the single best DNS debugging command. When something looks wrong, +trace shows you exactly which step in the recursion returned the unexpected answer. Compare resolvers across providers to detect caching issues."
      },
    ],
  },
  tls: {
    label: 'TLS',
    icon: '⛨',
    snippets: [
      {
        id: 'caddy-auto-https',
        title: 'Caddy — automatic HTTPS, zero config',
        desc: "The simplest reverse proxy with HTTPS automation. Caddy gets certs from Let's Encrypt on first request.",
        code: `# Caddyfile — minimal HTTPS reverse proxy
example.com {
    reverse_proxy localhost:3000
}

# With explicit HTTP→HTTPS redirect (Caddy does this by default)
www.example.com {
    redir https://example.com{uri} permanent
}

# Multiple sites
api.example.com {
    reverse_proxy localhost:8080
}

dash.example.com {
    reverse_proxy localhost:8081
    encode gzip
    header Cache-Control "no-store"
}

# Run
# caddy run --config Caddyfile

# That's it. Caddy:
#   - Gets Let's Encrypt cert on first HTTPS request
#   - Renews automatically before expiry
#   - Redirects HTTP → HTTPS
#   - Uses TLS 1.3 with sane defaults
#   - Supports HTTP/2 + HTTP/3 by default`,
        note: "Caddy by Matt Holt makes HTTPS a non-event. No certbot, no cron jobs, no nginx config wrestling. Sane defaults across the board. The only real downside vs nginx: smaller ecosystem of modules. For 90% of use cases, Caddy is the right answer."
      },
      {
        id: 'nginx-tls13',
        title: 'Nginx — modern TLS 1.3 config',
        desc: "If you're stuck with nginx, use Mozilla's intermediate profile. Copy-paste these settings.",
        code: `# /etc/nginx/sites-available/example.com
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name example.com;

    # certbot-managed
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # Mozilla "Intermediate" — broad compatibility + modern security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/example.com/chain.pem;
    resolver 1.1.1.1 valid=300s;
    resolver_timeout 5s;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}`,
        note: "Mozilla SSL Configuration Generator (ssl-config.mozilla.org) regenerates this for current best practice — bookmark it. Three profiles: Modern (TLS 1.3 only, drops older clients), Intermediate (default, broad compat), Old (legacy clients). Use Intermediate unless you have a specific reason."
      },
      {
        id: 'certbot',
        title: 'Let\'s Encrypt with certbot',
        desc: "If you don't use Caddy, certbot is the standard ACME client. Standalone or nginx-integrated.",
        code: `# Install
sudo apt install certbot python3-certbot-nginx
# Or via snap: sudo snap install --classic certbot

# Get a cert + auto-configure nginx
sudo certbot --nginx -d example.com -d www.example.com

# Get cert WITHOUT modifying server config (manual install)
sudo certbot certonly --webroot -w /var/www/example -d example.com

# DNS challenge (no webserver needed; works for wildcards)
sudo certbot certonly --manual --preferred-challenges dns -d "*.example.com" -d example.com

# Auto-renewal is installed by default via systemd timer
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run    # test renewal works

# Force renew (if cert is < 30 days old, certbot skips)
sudo certbot renew --force-renewal`,
        note: "Modern certbot installs a systemd timer for auto-renewal — verify with the dry-run command. Let's Encrypt rate limits: 50 certs per registered domain per week, 5 duplicate certs per week. Stage environment: --staging flag (uses test CA, certs aren't trusted, no rate limits)."
      },
      {
        id: 'mtls',
        title: 'mTLS — client certificate auth',
        desc: "Mutual TLS: both sides authenticate via certs. Service-to-service auth without secrets.",
        code: `# Generate your own CA (for testing or internal use)
openssl req -x509 -newkey rsa:4096 -days 365 -nodes \\
    -keyout ca-key.pem -out ca-cert.pem \\
    -subj "/CN=My Internal CA"

# Server cert signed by your CA
openssl req -newkey rsa:4096 -nodes \\
    -keyout server-key.pem -out server.csr \\
    -subj "/CN=api.internal.example.com"
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem \\
    -CAcreateserial -out server-cert.pem -days 365

# Client cert (one per service or user)
openssl req -newkey rsa:4096 -nodes \\
    -keyout client-key.pem -out client.csr \\
    -subj "/CN=worker-service-1"
openssl x509 -req -in client.csr -CA ca-cert.pem -CAkey ca-key.pem \\
    -CAcreateserial -out client-cert.pem -days 365

# nginx config — require client cert
server {
    listen 443 ssl;
    server_name api.internal.example.com;
    ssl_certificate     server-cert.pem;
    ssl_certificate_key server-key.pem;
    ssl_client_certificate ca-cert.pem;
    ssl_verify_client on;          # require client cert
    # ssl_verify_client optional;  # allow but don't require
    location / {
        proxy_set_header X-Client-CN $ssl_client_s_dn;
        proxy_pass http://localhost:8080;
    }
}

# curl with client cert
curl --cert client-cert.pem --key client-key.pem https://api.internal.example.com/`,
        note: "mTLS is the gold standard for service-to-service auth — no shared secrets, automatic rotation via cert renewal, identity baked into the connection. Service meshes (Istio, Linkerd) automate this. For internal services, your own CA is fine; for public mTLS, the cert must come from a public CA (rare)."
      },
    ],
  },
  http: {
    label: 'HTTP',
    icon: '⇌',
    snippets: [
      {
        id: 'rest-patterns',
        title: 'REST resource design — methods + status codes',
        desc: "The conventions every API should follow. Skim before designing new endpoints.",
        code: `# COLLECTIONS — plural noun
GET    /users               # list users (200 OK + body)
                            # supports: ?page=1&limit=20&sort=created_at
POST   /users               # create (201 Created + Location: /users/123)

# RESOURCES — singular by ID
GET    /users/123           # fetch one (200 OK or 404 Not Found)
PUT    /users/123           # replace entire resource (200 OK or 204 No Content)
PATCH  /users/123           # partial update (200 OK or 204 No Content)
DELETE /users/123           # delete (204 No Content or 200 OK with body)

# SUB-RESOURCES — hierarchy
GET    /users/123/orders         # this user's orders
POST   /users/123/orders         # create order for user
GET    /users/123/orders/456     # specific order

# ACTIONS that aren't standard CRUD — verbs ok
POST   /users/123/reset-password
POST   /orders/456/cancel
POST   /jobs/789/retry

# STATUS CODE QUICK GUIDE
200 OK              — GET, PUT, PATCH success with body
201 Created         — POST that created (include Location header)
204 No Content      — success, no body (often DELETE, sometimes PUT/PATCH)
400 Bad Request     — malformed JSON, missing required field
401 Unauthorized    — no/invalid auth (sign in)
403 Forbidden       — authenticated but not permitted
404 Not Found       — resource doesn't exist
409 Conflict        — version mismatch, concurrent edit
422 Unprocessable   — validation failed (after parse)
429 Too Many        — rate limited (include Retry-After)
500 Internal Error  — server bug
503 Unavailable     — overloaded/maintenance (include Retry-After)`,
        note: "Picking 401 vs 403: 401 means 'who are you?' (not signed in); 403 means 'I know who you are; you can't.' Picking 400 vs 422: 400 for syntactic errors (bad JSON); 422 for semantic ones (valid JSON but field validation failed). 409 specifically signals retry-with-new-state-may-succeed."
      },
      {
        id: 'idempotency',
        title: 'Idempotency keys — safe retries for POST',
        desc: "POST is not idempotent by default. Add an Idempotency-Key header so retries don't double-charge.",
        code: `# Client side
const idempotencyKey = crypto.randomUUID();
const response = await fetch('https://api.example.com/payments', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({ amount: 1000, currency: 'usd' }),
});
// If response is unclear (timeout, network error), RETRY WITH SAME KEY
// Server returns the original result, not a duplicate charge.

# Server side (pseudocode)
async function handle_payment(req):
    key = req.headers['Idempotency-Key']
    if not key:
        return 400, "Idempotency-Key required"

    # Check store: have we seen this key recently?
    existing = await idempotency_store.get(key)
    if existing:
        if existing.is_complete:
            return existing.status_code, existing.body
        else:
            return 409, "Request still processing"

    # Mark as in-progress
    await idempotency_store.set(key, {is_complete: False, ttl: 24h})

    # Do the actual work
    result = await charge_card(req.body)

    # Store result
    await idempotency_store.set(key, {
        is_complete: True,
        status_code: 200,
        body: result,
        ttl: 24h
    })
    return 200, result`,
        note: "Stripe, AWS, Cloudflare all use this pattern for write APIs. Without idempotency keys, every network blip turns 'did the payment go through?' into a production incident. TTL the keys for 24h-30d depending on your SLA."
      },
      {
        id: 'cache-headers',
        title: 'Cache-Control — the headers you actually need',
        desc: "Browser + CDN caching is controlled by these headers. The patterns by content type.",
        code: `# STATIC IMMUTABLE ASSETS (hashed filenames: app.a3f2c1.js)
Cache-Control: public, max-age=31536000, immutable
# 1 year, no revalidation. URL change = new file.

# HTML (changes with deploys, want freshness)
Cache-Control: public, max-age=0, must-revalidate
# Always revalidate; ETag/Last-Modified return 304 if unchanged.

# API RESPONSES — user-specific
Cache-Control: private, no-store
# CDN never caches; browser doesn't store either.

# API RESPONSES — public, slowly changing
Cache-Control: public, max-age=60, stale-while-revalidate=300
# Browser caches 60s. After that, returns stale (up to 5min more)
# while fetching fresh in background. Best of both worlds.

# AUTH-PROTECTED CONTENT
Cache-Control: private, no-cache
Vary: Authorization
# Browser caches but always revalidates. Vary prevents
# different users seeing each other's cached responses.

# ETag for conditional GETs
ETag: "a3f2c1d4"
# Client returns: If-None-Match: "a3f2c1d4"
# Server: 304 Not Modified (no body) if unchanged.`,
        note: "stale-while-revalidate is the underused gem (RFC 5861). Serves stale content instantly while revalidating in background — feels instant, eventually consistent. Cloudflare honors it; most CDNs do. For HTML on dashboards, this pattern works great."
      },
      {
        id: 'security-headers',
        title: 'Security headers — set these on every response',
        desc: "The set of HTTP response headers that close common attack surfaces. Audit with securityheaders.com.",
        code: `# HSTS — force HTTPS forever
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
# 2 years, all subdomains. Submit to hstspreload.org for browser-baked-in.

# Content Security Policy — control what the page can load
Content-Security-Policy: default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.example.com; frame-ancestors 'none'
# Defense against XSS + clickjacking.

# Clickjacking protection (legacy header, replaced by CSP frame-ancestors)
X-Frame-Options: DENY

# MIME sniffing — make browser respect Content-Type
X-Content-Type-Options: nosniff

# Referrer policy — what to leak to other origins
Referrer-Policy: strict-origin-when-cross-origin

# Permissions Policy — disable browser features you don't use
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()

# Cross-Origin Opener Policy — isolate browsing context
Cross-Origin-Opener-Policy: same-origin

# Cross-Origin Embedder Policy — pair with COOP for SharedArrayBuffer access
Cross-Origin-Embedder-Policy: require-corp`,
        note: "Set these once at your edge (CDN, nginx, Caddy) so every response inherits them. Test with securityheaders.com — A+ rating in 10 minutes. Most apps need only HSTS + CSP + X-Content-Type-Options + Referrer-Policy."
      },
    ],
  },
  caching: {
    label: 'Caching',
    icon: '⊟',
    snippets: [
      {
        id: 'cdn-config',
        title: 'CDN configuration cheat sheet',
        desc: "What to cache, how long, what to vary on. The decisions that matter at the edge.",
        code: `# Cloudflare Page Rules / Cache Rules (or Workers)
# Pattern: example.com/static/*
# - Edge Cache TTL: 1 year
# - Browser Cache TTL: 1 year
# Set Cache-Control on origin: public, max-age=31536000, immutable

# Pattern: example.com/api/*
# - Bypass cache (let origin Cache-Control decide)
# Set origin Cache-Control per endpoint.

# Pattern: example.com/blog/*
# - Edge Cache TTL: 1 hour
# - Browser Cache TTL: 5 minutes
# - Respect existing headers: Yes

# VARY headers — when same URL produces different responses
Vary: Accept-Encoding         # gzip vs br vs none
Vary: Accept                  # JSON vs HTML
Vary: Authorization           # CRITICAL for auth-protected content
Vary: Cookie                  # user-specific
# Without Vary, CDN serves first user's cached response to everyone.

# CACHE KEY tweaks (CDN-specific)
# Cloudflare: 'Cache Key' setting — include/exclude headers, cookies, query params
# By default many CDNs key on URL only. Override for personalized content.

# Purge by URL after content change
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE/purge_cache" \\
    -H "Authorization: Bearer $TOKEN" \\
    -H "Content-Type: application/json" \\
    --data '{"files": ["https://example.com/api/data.json"]}'`,
        note: "The most common CDN bug: same URL, different content per user, no Vary header → cache poisoning. ALWAYS set Vary: Authorization on auth-protected responses. Or use Cache-Control: private to opt out of CDN caching entirely."
      },
      {
        id: 'etag-pattern',
        title: 'ETag pattern — conditional GET done right',
        desc: "ETag enables 304 Not Modified responses. Saves bandwidth, improves perceived speed.",
        code: `# Server side (Express.js example)
app.get('/api/users/:id', async (req, res) => {
    const user = await db.users.findById(req.params.id);
    if (!user) return res.status(404).end();

    // Compute ETag from content
    const etag = crypto.createHash('sha1')
        .update(JSON.stringify(user))
        .digest('base64')
        .slice(0, 16);

    res.set('ETag', \`"\${etag}"\`);
    res.set('Cache-Control', 'private, must-revalidate');

    // Client sent the same ETag back? Nothing changed.
    if (req.header('if-none-match') === \`"\${etag}"\`) {
        return res.status(304).end();   // no body
    }

    return res.json(user);
});

# Strong vs weak ETags
ETag: "abc123"         # strong — byte-for-byte identical
ETag: W/"abc123"       # weak — semantically equivalent

# Use weak ETags when small reformatting (whitespace, header order)
# doesn't matter for the consumer.`,
        note: "Frameworks (Express, Fastify, Spring, Django) often auto-generate ETags from response body. Free win for any GET endpoint. Doesn't help for streaming responses or huge payloads (computing ETag is O(n))."
      },
      {
        id: 'swr',
        title: 'stale-while-revalidate — make stale feel instant',
        desc: "RFC 5861. Lets clients serve stale content while fetching fresh in background. Killer pattern.",
        code: `# Response header
Cache-Control: public, max-age=60, stale-while-revalidate=300

# What happens:
# Time 0:    Response cached.
# Time <60s: Cache returns it. No revalidation.
# Time 60-360s:
#            Cache returns stale immediately.
#            In background: fetch fresh + update cache.
#            Next request gets fresh.
# Time >360s: Cache fully expired. Synchronous fetch required.

# Result: from the user's perspective, response is ALWAYS instant
# while still being eventually consistent.

# On the client (Next.js, SWR, React Query all support this)
import useSWR from 'swr';

function User({ id }) {
    const { data, error, isLoading } = useSWR(\`/api/users/\${id}\`,
        fetcher,
        { revalidateOnFocus: true, dedupingInterval: 5000 }
    );
    // Stale data shown immediately; revalidates in background.
}`,
        note: "SWR is the killer pattern for read-heavy data that changes slowly (blog posts, product listings, user profiles). For real-time data, websocket or SSE instead. For dashboards: short max-age + long swr = always-snappy + eventually-fresh."
      },
    ],
  },
  proxies: {
    label: 'Reverse Proxies',
    icon: '⇄',
    snippets: [
      {
        id: 'caddy-full',
        title: 'Caddy — full-featured reverse proxy',
        desc: "The simplest path to production HTTPS + multiple backends + caching headers.",
        code: `# Caddyfile

# Main site — single backend
example.com {
    encode gzip zstd
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote}
    }
}

# Static + API on same domain
app.example.com {
    handle /api/* {
        reverse_proxy localhost:8080
    }
    handle /* {
        root * /var/www/app
        file_server
        header Cache-Control "public, max-age=31536000, immutable" {
            path *.js *.css *.png *.jpg *.woff2
        }
    }
}

# Load balance to multiple backends
api.example.com {
    reverse_proxy localhost:8001 localhost:8002 localhost:8003 {
        lb_policy round_robin
        health_uri /health
        health_interval 10s
    }
}

# WebSocket support — works automatically
ws.example.com {
    reverse_proxy localhost:6000
}`,
        note: "Caddy handles HTTPS, HTTP/2, HTTP/3, certificates, gzip, security headers, websockets, load balancing — out of the box, no flags. If you're starting fresh, use Caddy unless you have a specific reason for nginx (eg existing config, third-party module)."
      },
      {
        id: 'nginx-full',
        title: 'Nginx — production reverse proxy config',
        desc: "Nginx still dominates in production. Modern config with HTTPS, security headers, gzip, cache.",
        code: `# /etc/nginx/sites-available/example.com
upstream backend {
    server localhost:3000 max_fails=3 fail_timeout=10s;
    server localhost:3001 max_fails=3 fail_timeout=10s;
    keepalive 32;
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;

    # Limit body size
    client_max_body_size 10M;

    # Static files
    location /static/ {
        root /var/www/example;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # API + app
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 5s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;

        # Keep-alive to upstream
        proxy_set_header Connection "";
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}`,
        note: "Things that matter: proxy_http_version 1.1 (default is 1.0 which kills keep-alive), the `always` flag on add_header (otherwise headers don't appear on error responses), explicit Connection \"\" header (clears Connection: close from client), and timeouts (defaults are 60s — usually too long for APIs)."
      },
      {
        id: 'traefik',
        title: 'Traefik — Docker-native reverse proxy',
        desc: "Auto-discovers services via Docker labels. Best when running multiple containers.",
        code: `# docker-compose.yml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.insecure=true"  # dashboard on :8080, internal only
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.email=admin@example.com"
      - "--certificatesresolvers.le.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.le.acme.httpchallenge.entrypoint=web"
      - "--entrypoints.web.http.redirections.entrypoint.to=websecure"
      - "--entrypoints.web.http.redirections.entrypoint.scheme=https"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  app:
    image: my-app:latest
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`example.com\`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=le"
      - "traefik.http.services.app.loadbalancer.server.port=3000"`,
        note: "Traefik auto-discovers services via Docker labels — add a container with the right labels, Traefik routes traffic + gets a Let's Encrypt cert. No config changes when scaling. Perfect for development + small production setups. For bigger deployments, Envoy or Caddy with manual config are usually preferred."
      },
    ],
  },
  loadbalancing: {
    label: 'Load Balancing',
    icon: '⊟',
    snippets: [
      {
        id: 'health-checks',
        title: 'Health checks done right',
        desc: "A health endpoint that actually tells you when the service can serve traffic.",
        code: `# Two endpoints, different purposes:

# /health — liveness probe (Kubernetes terminology)
# Answers: is this process alive?
GET /health
200 OK
{ "status": "ok", "uptime_seconds": 12345 }

# /ready — readiness probe
# Answers: can this instance serve requests RIGHT NOW?
# Checks dependencies: DB connection, cache, downstream services.
GET /ready
200 OK
{
    "status": "ok",
    "dependencies": {
        "database": "ok",
        "redis": "ok",
        "downstream_api": "ok"
    }
}

# Return 503 when NOT ready
GET /ready
503 Service Unavailable
{
    "status": "degraded",
    "dependencies": {
        "database": "ok",
        "redis": "timeout",
        "downstream_api": "ok"
    }
}

# Load balancer uses /ready — removes instance from pool when it returns 5xx
# Kubernetes uses both:
#   liveness  → restart pod if /health fails (probably stuck)
#   readiness → stop sending traffic if /ready fails (deps down)

# Implementation (Express)
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/ready', async (req, res) => {
    const deps = {};
    try { await db.query('SELECT 1'); deps.database = 'ok'; }
    catch (e) { deps.database = 'fail'; }
    try { await redis.ping(); deps.redis = 'ok'; }
    catch (e) { deps.redis = 'fail'; }

    const ok = Object.values(deps).every(v => v === 'ok');
    res.status(ok ? 200 : 503).json({
        status: ok ? 'ok' : 'degraded',
        dependencies: deps
    });
});`,
        note: "Separating liveness + readiness is the difference between 'pod restart loops because Redis blipped' and 'pod waits a few seconds then resumes.' Don't make /health hit the database — your load balancer's health probe shouldn't be the bottleneck."
      },
      {
        id: 'algorithms',
        title: 'Load balancing algorithms — when to use which',
        desc: "Round-robin, least-connections, IP-hash, EWMA. Different traffic shapes want different algorithms.",
        code: `# ROUND ROBIN — default for most cases
# Pros: dead simple, predictable
# Cons: ignores backend load
# Use when: requests are uniform, backends identical

upstream backend {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

# LEAST CONNECTIONS — bias toward less busy
# Pros: handles non-uniform request duration
# Cons: a sticky slow request keeps an instance underweighted
# Use when: long-tail request durations (some fast, some slow)

upstream backend {
    least_conn;
    server app1:3000;
    server app2:3000;
}

# IP HASH — sticky sessions by client IP
# Pros: same client always gets same backend (no shared session store needed)
# Cons: uneven distribution if some clients are heavy; loses sticky on backend restart
# Use when: legacy app requires in-memory sessions

upstream backend {
    ip_hash;
    server app1:3000;
    server app2:3000;
}

# WEIGHTED — different capacity backends
upstream backend {
    server big-instance:3000 weight=3;
    server small-instance:3000 weight=1;
}

# HEALTH CHECKS — drop unhealthy backends automatically
upstream backend {
    server app1:3000 max_fails=3 fail_timeout=10s;
    server app2:3000 max_fails=3 fail_timeout=10s;
    server app3:3000 backup;          # only used if others fail
}`,
        note: "Default to round-robin. Switch to least-connections when you've measured that request durations vary widely. ip_hash is a workaround for stateless backend redesign — prefer shared session stores (Redis) and stateless app instances. AWS ALB / GCP Load Balancer have their own algorithms; usually 'least outstanding requests' is the modern default."
      },
    ],
  },
  security: {
    label: 'Security Headers',
    icon: '⛨',
    snippets: [
      {
        id: 'hsts-preload',
        title: 'HSTS preload — bake HTTPS into browsers',
        desc: "Submit your domain to the browser-shipped preload list. Browsers refuse HTTP forever, even on first visit.",
        code: `# Response header — required for preload eligibility
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload

# Requirements (hstspreload.org):
# 1. Serve a valid HTTPS certificate
# 2. Redirect from HTTP → HTTPS on same host
# 3. Serve all subdomains over HTTPS
# 4. Serve HSTS header on the base domain (not redirects)
#    - max-age >= 31536000 (1 year)
#    - includeSubDomains directive
#    - preload directive

# Submit at hstspreload.org/?domain=example.com
# Chrome ships it; Firefox + Safari + Edge pull from Chrome's list.
# Inclusion is permanent for practical purposes — removal takes months.

# Test
curl -I https://example.com | grep -i strict-transport

# Before submitting:
# - Confirm ALL subdomains work over HTTPS
# - Confirm no http://anything.example.com URLs exist anywhere
# - Test with a long max-age (1 month) first to flush problems`,
        note: "Once preloaded, your domain CANNOT serve HTTP — browsers refuse before even hitting your server. Removal requires a request to the browser teams + waiting for next browser release. Test thoroughly first."
      },
      {
        id: 'csp-template',
        title: 'CSP — Content Security Policy template',
        desc: "Defense in depth against XSS. Restrict what the page can load. Iterate from strict to working.",
        code: `# Strict starter — everything from your own origin only
Content-Security-Policy:
    default-src 'self';
    script-src 'self';
    style-src 'self';
    img-src 'self' data:;
    font-src 'self';
    connect-src 'self';
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;

# Real-world example with common allowlist
Content-Security-Policy:
    default-src 'self';
    script-src 'self' 'sha256-...' https://cdn.example.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://api.example.com wss://ws.example.com;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    report-uri https://csp-report.example.com/report;

# Report-only mode for testing (won't block, just reports)
Content-Security-Policy-Report-Only: default-src 'self'; report-uri /csp-report

# Nonces for inline scripts (preferred over 'unsafe-inline')
# Server generates random nonce per response:
#   <script nonce="abc123">...</script>
#   Content-Security-Policy: script-src 'nonce-abc123'`,
        note: "Start with Report-Only mode in production for 1-2 weeks. Collect violations via report-uri (services: Sentry, report-uri.com). Tighten policy based on real violations. Strict CSPs are the single biggest XSS mitigation. 'unsafe-inline' on script-src defeats most of it — work to eliminate."
      },
      {
        id: 'cors-config',
        title: 'CORS — getting it right',
        desc: "Cross-origin requests from browser JS. The headers, the preflight, the common bugs.",
        code: `# Simple CORS — public API, no credentials
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type

# Credentialed CORS — cookies / auth
# Can't use wildcard; must echo origin
Access-Control-Allow-Origin: https://app.example.com    # specific
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization

# Preflight cache — avoid OPTIONS on every request
Access-Control-Max-Age: 86400      # cache preflight 24h

# Implementation (Express)
const cors = require('cors');
app.use(cors({
    origin: (origin, callback) => {
        const allowed = ['https://app.example.com', 'https://admin.example.com'];
        if (!origin || allowed.includes(origin)) callback(null, true);
        else callback(new Error('CORS denied'));
    },
    credentials: true,
    maxAge: 86400,
}));

# Nginx — CORS headers
location /api/ {
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '$http_origin' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
        add_header 'Access-Control-Max-Age' 86400 always;
        return 204;
    }
    add_header 'Access-Control-Allow-Origin' '$http_origin' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    proxy_pass http://backend;
}`,
        note: "Three things kill CORS configs: (1) wildcard with credentials — invalid, browser rejects; (2) headers only on 200 responses (use 'always' in nginx); (3) preflight not implemented (server returns 405 on OPTIONS). The browser is helpful — read the actual console error; it tells you which check failed."
      },
    ],
  },
  debug: {
    label: 'Debugging',
    icon: '⌗',
    snippets: [
      {
        id: 'curl-cookbook',
        title: 'curl cookbook — the commands you actually run',
        desc: "Print this. Tape it to your monitor. curl is the universal HTTP debugger.",
        code: `# Just the response body
curl https://example.com

# Headers only
curl -I https://example.com
curl --head https://example.com

# Verbose — see DNS, TCP, TLS, HTTP transcript
curl -v https://example.com

# Follow redirects
curl -L https://example.com

# Timing breakdown
curl -w "@-" -o /dev/null -s https://example.com <<EOF
   dns:    %{time_namelookup}s
   conn:   %{time_connect}s
   tls:    %{time_appconnect}s
   ttfb:   %{time_starttransfer}s
   total:  %{time_total}s
   http_version: %{http_version}
EOF

# POST JSON
curl -X POST https://api.example.com/users \\
    -H 'Content-Type: application/json' \\
    -d '{"name":"Alice","email":"a@x.com"}'

# Send a file
curl -X POST https://api.example.com/upload \\
    -F file=@photo.jpg \\
    -F "title=My photo"

# With auth
curl -u user:pass https://api.example.com/private          # Basic
curl -H 'Authorization: Bearer $TOKEN' https://api.example.com/  # Bearer

# Skip TLS verification (DEBUG ONLY)
curl -k https://self-signed.example.com

# Force HTTP version
curl --http1.1 https://example.com
curl --http2 https://example.com
curl --http3 https://example.com       # curl 8+

# Use specific resolver (debug DNS)
curl --resolve example.com:443:93.184.215.14 https://example.com

# Save response + headers
curl -i https://example.com > response.txt   # body
curl -D headers.txt https://example.com      # headers separately

# Show ALL TLS details
curl -v --tlsv1.3 https://example.com 2>&1 | grep -E '^[*<>]'`,
        note: "The single most important debugging tool in networking. -v shows you what's happening step-by-step. Pair with --resolve to bypass DNS (test a specific IP). With -w you can build mini benchmark scripts."
      },
      {
        id: 'wireshark-tips',
        title: 'Wireshark essentials — packet-level debugging',
        desc: "When tools above fail, drop to packets. The filters and views that matter.",
        code: `# Capture filters (BEFORE capture, faster)
host example.com                    # to/from one host
port 443                            # TLS traffic
tcp port 443 and host example.com   # combine
not arp                             # less noise

# Display filters (AFTER capture, more flexible)
http                                # only HTTP
http.request                        # only HTTP requests
http.response.code == 500           # 500 errors only
tls.handshake                       # TLS handshake messages
tls.handshake.type == 1             # ClientHello
ip.addr == 93.184.215.14
tcp.flags.reset == 1                # connection resets
tcp.analysis.retransmission         # retransmits (sign of loss)
tcp.analysis.zero_window            # receiver buffer full

# Common diagnostic flows
# 1. TLS handshake failure
#    Filter: tls.handshake
#    Look for: ClientHello → ServerHello → ... → Alert
#    Alert codes tell you what failed

# 2. HTTP/2 issues
#    Filter: http2
#    Stream IDs + frame types show flow

# 3. TCP retransmits (packet loss)
#    Filter: tcp.analysis.flags
#    Excessive retransmits = bad network or MTU mismatch

# Decrypting TLS (if you have the keys)
# Set SSLKEYLOGFILE env var, browser writes keys there
# Wireshark: Edit → Preferences → Protocols → TLS → (Pre)-Master-Secret log filename

# Real-time CLI capture (no GUI)
tshark -i any -f 'host example.com' -Y http
tcpdump -i any -nn host example.com -X     # hex+ASCII payload`,
        note: "Wireshark intimidates but pays off. Two skills matter most: capture filters (limit what's captured — your machine will choke otherwise) and display filters (slice captured data). Both autocomplete in the GUI. For learning, capture a curl https://example.com and dissect packet by packet."
      },
      {
        id: 'devtools-network',
        title: 'Chrome DevTools Network panel — read it fluently',
        desc: "The single best browser debugging tool. The columns that matter, the filters worth knowing.",
        code: `# Open: F12 → Network tab. Refresh page to capture.

# COLUMNS WORTH SHOWING
Name              # URL (sometimes truncated)
Status            # 200, 304, 404, etc.
Protocol          # h2 (HTTP/2), h3 (HTTP/3), http/1.1
Initiator         # what triggered the request
Size              # transferred vs content
Time              # total duration
Waterfall         # visual timing

# Right-click column header to add:
# - Protocol — see which HTTP version each request used
# - Cookies — see cookie data per request
# - Set Cookies — see what server set
# - Priority — browser's request priority (high, low, etc.)

# FILTERS
# Top bar filter accepts:
- status-code:200
- method:POST
- domain:api.example.com
- mime-type:image
- larger-than:1000     # bytes
- has-response-header:Cache-Control

# THROTTLING
# Top right dropdown: simulate 3G / 4G / offline. Test your app on slow networks.

# DISABLE CACHE
# Checkbox: 'Disable cache' (only when DevTools open). Forces fresh loads.

# COPY OPTIONS (right-click request)
- Copy as cURL — re-run from terminal
- Copy as fetch — re-run in browser console
- Copy as PowerShell — Windows users
- Save all as HAR — share complete capture with someone

# TIMING TAB (click a request)
- Queueing → Stalled → DNS → Connect → TLS → Send → Wait (TTFB) → Receive
- Tells you EXACTLY which phase is slow

# Common reads:
# - DNS column high? Use DoH / better resolver / dns-prefetch.
# - Connect+TLS high? Use HTTP/2/3 (reuses connections). Add preconnect hints.
# - Wait (TTFB) high? Backend slow. Investigate origin.
# - Receive high? Big response. Compress, paginate, stream.`,
        note: "Watching the Network panel for 5 minutes on your own site teaches you more than 5 hours of theory. Copy-as-curl is the killer feature for sharing a problem reproduction. HAR export captures the entire session for offline analysis — load it back into DevTools later."
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function NetAtlas() {
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

  /* ─── UI primitives ─── */
  const Code = ({ children, id, lang = 'bash' }) => (
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
    const p = {
      info: { border: 'border-cyan-300/40', bg: 'bg-cyan-300/5', text: 'text-cyan-200', label: 'NOTE' },
      warn: { border: 'border-red-400/50', bg: 'bg-red-400/5', text: 'text-red-300', label: 'GOTCHA' },
      tip: { border: 'border-orange-400/40', bg: 'bg-orange-400/5', text: 'text-orange-200', label: 'TIP' },
      you: { border: 'border-lime-300/40', bg: 'bg-lime-300/5', text: 'text-lime-200', label: 'FOR YOUR STACK' },
      cite: { border: 'border-zinc-700', bg: 'bg-zinc-900/40', text: 'text-zinc-400', label: 'CITATION' },
      dont: { border: 'border-red-500/60', bg: 'bg-red-500/10', text: 'text-red-300', label: 'DO NOT' },
    }[kind];
    return (
      <div className={`my-4 border ${p.border} ${p.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${p.text} mb-1.5 flex items-center gap-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {kind === 'cite' && <Quote size={10} />}
          {kind === 'warn' && <AlertTriangle size={10} />}
          {kind === 'dont' && <XCircle size={10} />}
          {title || p.label}
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
        <div className="text-[10px] uppercase tracking-[0.25em] text-orange-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-cyan-300 bg-cyan-300/10 text-cyan-200' :
                  reveal && isChosen && !isCorrect ? 'border-red-400 bg-red-400/10 text-red-200' :
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
        className="border-b border-dotted border-cyan-300/60 text-cyan-200 hover:text-cyan-100 transition-colors">
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

  /* Network architecture diagram — left side is OSI stack, right side is real infra */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap a layer or service · OSI stack (left) + real internet path (right)
        </div>
        <svg viewBox="0 0 290 260" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="netarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          {/* Left column connectors (OSI stack) */}
          <line x1="70" y1="46" x2="70" y2="58" stroke="#52525b" markerEnd="url(#netarr)" />
          <line x1="70" y1="86" x2="70" y2="98" stroke="#52525b" markerEnd="url(#netarr)" />
          <line x1="70" y1="126" x2="70" y2="138" stroke="#52525b" markerEnd="url(#netarr)" />
          <line x1="70" y1="166" x2="70" y2="178" stroke="#52525b" markerEnd="url(#netarr)" />
          <line x1="70" y1="206" x2="70" y2="218" stroke="#52525b" markerEnd="url(#netarr)" />
          {/* Right column connectors (real infra path) */}
          <line x1="215" y1="46" x2="215" y2="78" stroke="#52525b" markerEnd="url(#netarr)" />
          <line x1="215" y1="106" x2="215" y2="138" stroke="#52525b" markerEnd="url(#netarr)" />
          <line x1="215" y1="166" x2="215" y2="198" stroke="#52525b" markerEnd="url(#netarr)" />
          {/* Cross labels */}
          <text x="135" y="34" textAnchor="middle" fill="#52525b" fontSize="9" style={{ fontFamily: 'JetBrains Mono, monospace' }}>OSI STACK</text>
          <text x="215" y="14" textAnchor="middle" fill="#52525b" fontSize="9" style={{ fontFamily: 'JetBrains Mono, monospace' }}>REQUEST PATH</text>
          {ARCH_NODES.map(n => {
            const isSel = archSelected === n.id;
            return (
              <g key={n.id} onClick={() => setArchSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={isSel ? n.color + '30' : n.color + '12'} stroke={n.color}
                  strokeWidth={isSel ? '2' : '1'} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle"
                  fill="#e4e4e7" fontSize="10"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.label}
                </text>
                {n.layer && (
                  <text x={n.x - 4} y={n.y + n.h / 2 + 3} textAnchor="end"
                    fill="#71717a" fontSize="8"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {n.layer}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-cyan-300/30 bg-cyan-300/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-cyan-300 font-semibold">{sel.label}{sel.layer && <span className="text-zinc-500 text-[11px] ml-2">({sel.layer})</span>}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: real DNS + HTTP operations ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('challenges');
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];

    // Free play state
    const [freeOp, setFreeOp] = useState('dns');
    const [freeDomain, setFreeDomain] = useState('example.com');
    const [freeType, setFreeType] = useState('A');
    const [freeUrl, setFreeUrl] = useState('https://api.github.com/zen');

    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      setOutput(null);
      setError(null);
      setTestResult(null);
      setShowHint(false);
    }, [challengeIdx, mode]);

    const runDns = async (domain, type) => {
      const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${encodeURIComponent(type)}`;
      const r = await fetch(url, { headers: { 'accept': 'application/dns-json' } });
      if (!r.ok) throw new Error(`DoH returned ${r.status}`);
      return await r.json();
    };

    const runHttp = async (url) => {
      const t0 = performance.now();
      const r = await fetch(url, { method: 'GET' });
      const t1 = performance.now();
      const headers = {};
      r.headers.forEach((v, k) => headers[k] = v);
      const text = await r.text();
      let bodyJson = null;
      try { bodyJson = JSON.parse(text); } catch (e) {}
      return {
        status: r.status,
        statusText: r.statusText,
        url: r.url,
        ok: r.ok,
        redirected: r.redirected,
        type: r.type,
        headers,
        bodyText: text.slice(0, 1500),
        bodyTextLength: text.length,
        bodyJson,
        timeMs: Math.round(t1 - t0),
      };
    };

    const runChallenge = async () => {
      setRunning(true); setError(null); setTestResult(null); setOutput(null);
      try {
        let result;
        if (challenge.op === 'dns') {
          result = await runDns(challenge.domain, challenge.type);
        } else {
          result = await runHttp(challenge.url);
        }
        setOutput({ kind: challenge.op, result });
        const pass = challenge.check ? challenge.check(result) : true;
        setTestResult({ pass });
      } catch (e) {
        setError('❌ ' + (e?.message || String(e)));
        setTestResult({ pass: false });
      }
      setRunning(false);
    };

    const runFreePlay = async () => {
      setRunning(true); setError(null); setOutput(null);
      try {
        if (freeOp === 'dns') {
          const result = await runDns(freeDomain, freeType);
          setOutput({ kind: 'dns', result });
        } else {
          const result = await runHttp(freeUrl);
          setOutput({ kind: 'http', result });
        }
      } catch (e) {
        setError('❌ ' + (e?.message || String(e)));
      }
      setRunning(false);
    };

    const renderDnsResult = (r) => {
      if (!r) return null;
      const answers = r.Answer || [];
      const typeMap = { 1: 'A', 2: 'NS', 5: 'CNAME', 15: 'MX', 16: 'TXT', 28: 'AAAA', 33: 'SRV', 257: 'CAA', 6: 'SOA', 12: 'PTR' };
      return (
        <div>
          <div className="px-3 py-1.5 text-[10px] text-zinc-500 border-b border-zinc-800 flex items-center justify-between" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>STATUS: {r.Status === 0 ? 'NOERROR' : `Code ${r.Status}`}</span>
            <span>{answers.length} answer{answers.length !== 1 ? 's' : ''}</span>
          </div>
          {answers.length === 0 ? (
            <div className="px-3 py-3 text-[12px] text-zinc-500 italic" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              (no records)
            </div>
          ) : (
            <table className="w-full text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950">
                  <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-300 font-normal">name</th>
                  <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-300 font-normal">type</th>
                  <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-300 font-normal">ttl</th>
                  <th className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-cyan-300 font-normal">data</th>
                </tr>
              </thead>
              <tbody>
                {answers.map((a, i) => (
                  <tr key={i} className="border-b border-zinc-900 last:border-0">
                    <td className="px-3 py-1.5 text-zinc-300 align-top">{a.name}</td>
                    <td className="px-3 py-1.5 text-orange-300 align-top">{typeMap[a.type] || a.type}</td>
                    <td className="px-3 py-1.5 text-zinc-500 align-top">{a.TTL}</td>
                    <td className="px-3 py-1.5 text-zinc-100 align-top break-all">{a.data}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      );
    };

    const renderHttpResult = (r) => {
      if (!r) return null;
      const statusColor = r.status < 300 ? 'text-cyan-300' : r.status < 400 ? 'text-orange-300' : 'text-red-300';
      const httpVersion = r.headers['x-firefox-spdy'] || r.headers['alt-svc']?.match(/h(\d+)=/)?.[1] || '?';
      return (
        <div>
          <div className="px-3 py-1.5 text-[10px] text-zinc-500 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span className={statusColor + ' font-bold'}>HTTP {r.status} {r.statusText}</span>
            <span>{r.timeMs}ms · {r.bodyTextLength} bytes</span>
          </div>
          {r.redirected && (
            <div className="px-3 py-1 text-[10px] text-orange-300 bg-orange-300/5 border-b border-zinc-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ↪ REDIRECTED → {r.url}
            </div>
          )}
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>HEADERS</div>
          <div className="text-[11px] max-h-48 overflow-y-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {Object.entries(r.headers).slice(0, 20).map(([k, v]) => (
              <div key={k} className="px-3 py-0.5 border-b border-zinc-900 last:border-0 flex gap-2">
                <span className="text-cyan-300 shrink-0">{k}:</span>
                <span className="text-zinc-300 break-all">{v}</span>
              </div>
            ))}
          </div>
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500 border-b border-y border-zinc-900" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            BODY {r.bodyJson ? '(parsed JSON)' : '(text preview)'}
          </div>
          <pre className="px-3 py-2 text-[11px] text-zinc-200 overflow-x-auto max-h-48 leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {r.bodyJson ? JSON.stringify(r.bodyJson, null, 2).slice(0, 1200) : r.bodyText}
          </pre>
        </div>
      );
    };

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE NETWORK · {mode === 'challenges' ? challenge.title : 'free play'}</span>
            <span className="text-cyan-400">●</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => setMode('freeplay')} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.title.split(' · ')[0]}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[13px] text-zinc-300 leading-relaxed">{challenge.desc}</div>
              <div className="mt-1.5 text-[11px] text-zinc-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {challenge.op === 'dns' ? (
                  <>DoH: cloudflare-dns.com/dns-query?name={challenge.domain}&type={challenge.type}</>
                ) : (
                  <>fetch({challenge.url})</>
                )}
              </div>
              {!showHint && (
                <button onClick={() => setShowHint(true)} className="mt-2 text-[11px] text-zinc-500 hover:text-orange-300 underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  show hint
                </button>
              )}
              {showHint && (
                <div className="mt-2 text-[11px] text-orange-300 leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  HINT: {challenge.hint}
                </div>
              )}
            </div>
          </>
        )}

        {mode === 'freeplay' && (
          <div className="px-3 py-3 border-b border-zinc-800 space-y-2">
            <div className="flex gap-1">
              <button onClick={() => setFreeOp('dns')} className={`flex-1 text-[11px] px-2 py-1.5 border ${freeOp === 'dns' ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>DNS lookup</button>
              <button onClick={() => setFreeOp('http')} className={`flex-1 text-[11px] px-2 py-1.5 border ${freeOp === 'http' ? 'border-cyan-300 text-cyan-300 bg-cyan-300/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>HTTP fetch</button>
            </div>
            {freeOp === 'dns' ? (
              <div className="flex gap-2">
                <input value={freeDomain} onChange={e => setFreeDomain(e.target.value)} placeholder="domain"
                  className="flex-1 bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <select value={freeType} onChange={e => setFreeType(e.target.value)}
                  className="bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA', 'SOA'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            ) : (
              <input value={freeUrl} onChange={e => setFreeUrl(e.target.value)} placeholder="https://..."
                className="w-full bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
            )}
            <div className="text-[10px] text-zinc-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {freeOp === 'http' && "Note: many sites block cross-origin requests via CORS. Try: api.github.com, httpbin.org, cloudflare-dns.com."}
            </div>
          </div>
        )}

        <div className="px-3 py-2 border-b border-zinc-800 flex gap-2">
          <button
            onClick={mode === 'challenges' ? runChallenge : runFreePlay}
            disabled={running}
            className="flex-1 border border-cyan-300 bg-cyan-300/10 text-cyan-200 px-3 py-2 text-[12px] font-bold hover:bg-cyan-300/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> {mode === 'challenges' ? 'Run + check' : 'Run'}</>}
          </button>
        </div>

        {(output || error) && (
          <div className="border-t border-zinc-800 bg-black">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-b border-zinc-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>RESULT</div>
            {error && (
              <pre className="px-3 py-2 text-[12px] text-red-300 whitespace-pre-wrap break-words" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {error}
              </pre>
            )}
            {output?.kind === 'dns' && renderDnsResult(output.result)}
            {output?.kind === 'http' && renderHttpResult(output.result)}
            {testResult && (
              <div className="border-t border-zinc-800 px-3 py-2">
                <div className={`text-[12px] flex items-center gap-2 ${testResult.pass ? 'text-cyan-300' : 'text-red-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {testResult.pass ? <Check size={14} /> : <X size={14} />}
                  {testResult.pass ? 'CHALLENGE PASSED' : 'NOT QUITE — check the expected output'}
                </div>
                {testResult.pass && challengeIdx < CHALLENGES.length - 1 && (
                  <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="mt-2 text-orange-300 hover:text-orange-100 underline text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    next challenge →
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ─── LIBRARY browser ─── */
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
                  <span className="text-[10px] text-cyan-400 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>config</span>
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
                        <span className="text-orange-300 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
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

  /* ─── Triage tree ─── */
  const Troubleshooter = () => {
    const [path, setPath] = useState(['start']);
    const cur = TROUBLESHOOT[path[path.length - 1]];
    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] text-red-300 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Wrench size={12} /> TRIAGE TREE
          </div>
          {path.length > 1 && (
            <button onClick={() => setPath(['start'])} className="text-[11px] text-zinc-500 hover:text-red-300 flex items-center gap-1">
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
              <div className="text-zinc-100 text-[15px] mb-3 font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {cur.q}
              </div>
              <div className="space-y-2">
                {cur.opts.map((opt, i) => (
                  <button key={i} onClick={() => setPath([...path, opt.next])}
                    className="w-full text-left border border-zinc-800 hover:border-red-400 hover:bg-red-400/5 px-3 py-2.5 text-[14px] text-zinc-200 transition-colors flex items-center justify-between group">
                    <span>{opt.label}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-red-300" />
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
                      <span className="text-cyan-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              )}
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

  /* ─── Exports ─── */
  const exportCheatsheet = () => {
    let md = "# Net Atlas — Cheatsheet\n\n";
    md += "## HTTP version landscape (April 2026)\n\n";
    md += "| Version | Transport | Share | Use when |\n|---|---|---|---|\n";
    COMPARISONS.http_versions.rows.forEach(r => { md += `| **${r[0]}** | ${r[1]} | ${r[2]} | ${r[4]} |\n`; });
    md += "\n## TLS versions\n\n";
    md += "| Version | Year | Status |\n|---|---|---|\n";
    COMPARISONS.tls_versions.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## DNS record types\n\n";
    md += "| Type | Maps to | Use |\n|---|---|---|\n";
    COMPARISONS.dns_records.rows.forEach(r => { md += `| **${r[0]}** | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## Status codes worth knowing\n\n";
    md += "| Code | Meaning | When |\n|---|---|---|\n";
    COMPARISONS.status_codes.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## Essential commands\n\n```bash\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    md += "\n---\n_Generated by Net Atlas. Grounded in RFC 9110-9114 (HTTP), RFC 8446 (TLS 1.3), RFC 9000 (QUIC), Cloudflare Radar, HPBN by Ilya Grigorik._\n";
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'net-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportLibrary = () => {
    let md = "# Net Atlas — Library\n\nA curated networking config + recipe collection.\n\n";
    Object.entries(LIBRARY).forEach(([_, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => {
        md += `### ${s.title}\n${s.desc}\n\n\`\`\`\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`;
      });
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'net-atlas-library.md'; a.click();
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

  /* ─── Modals ─── */
  const CommandPalette = () => {
    const [q, setQ] = useState('');
    const items = [
      ...SECTIONS.map((s, i) => ({ kind: 'chapter', label: s.label, idx: i, hint: s.sub })),
      ...Object.keys(GLOSSARY).map(t => ({ kind: 'term', label: t, hint: GLOSSARY[t].slice(0, 80) + '…' })),
      ...COMMANDS.map(c => ({ kind: 'command', label: c.cmd, hint: c.desc, copy: c.cmd })),
      ...Object.entries(LIBRARY).flatMap(([_, c]) =>
        c.snippets.map(s => ({ kind: 'library', label: s.title, hint: `${c.label} · ${s.desc}` }))
      ),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-cyan-300/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-cyan-300" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Chapters · terms · commands · library"
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
                  item.kind === 'term' ? 'text-orange-300' :
                  item.kind === 'library' ? 'text-lime-300' : 'text-amber-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-cyan-300/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-cyan-300/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⇌ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your network context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-cyan-300 hover:bg-cyan-300/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-cyan-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 1969">The first packet</H2>
            <P>
              October 29, 1969 — Leonard Kleinrock's lab at UCLA sent the first ARPANET message to Stanford Research Institute. Two letters made it through before the system crashed: "LO." (They were trying to type "LOGIN.") ARPANET ran on NCP — the Network Control Program — for over a decade. The actual Internet, as a protocol-defined network, was born January 1, 1983, when ARPANET cut over to TCP/IP.
            </P>
            <P>
              Tim Berners-Lee invented the Web on top of it between 1989-1991 at CERN. HTTP, HTML, and URLs were originally one developer's side project. The Web didn't really win until Mosaic (1993) and Netscape (1994) made it visual. The protocol stack we use today — IP, TCP, DNS, HTTP, TLS — is fundamentally that same set, with three decades of refinement.
            </P>
            <H2 num="◇ 2026">The current landscape</H2>
            <P>
              Three things define the 2026 internet:
            </P>
            <div className="grid gap-2 my-3">
              <CheckItem id="land-tls13">TLS 1.3 dominant — 94% of traffic. Everything else is legacy.</CheckItem>
              <CheckItem id="land-https">HTTPS at 94%+ of traffic. The encrypted web is the only web.</CheckItem>
              <CheckItem id="land-http23">HTTP/2 (51%) and HTTP/3 (21%) coexist with HTTP/1.1 (28%) — three versions in equilibrium.</CheckItem>
              <CheckItem id="land-doh">DoH adoption above 85% in US Firefox users. Plaintext DNS dying.</CheckItem>
              <CheckItem id="land-quic">QUIC is real. HTTP/3 + DoQ + WebTransport all build on it.</CheckItem>
              <CheckItem id="land-ipv6">IPv6 at ~45% globally. Still a slow burn but mobile networks force it.</CheckItem>
              <CheckItem id="land-le">Let's Encrypt + ACME = HTTPS is free + automated. No excuse not to.</CheckItem>
              <CheckItem id="land-ech">Encrypted Client Hello (ECH) hides SNI from network observers. Cloudflare ships it.</CheckItem>
            </div>
            <Callout kind="cite" title="HTTP VERSION SHARE (APRIL 2026)">
              Three months of stable share through Q1-Q2 2026: <strong>HTTP/2 51.33%</strong>, <strong>HTTP/1.1 27.63%</strong>, <strong>HTTP/3 21.04%</strong>. HTTPS 94.32%, TLS 1.3 dominant at 93.92%. HTTP/3's plateau is the surprise — the chain (client → server → middleboxes) still has gaps. New protocols don't replace; they accumulate. Source: technologychecker.io HTTP adoption analysis.
            </Callout>
            <H2 num="◇ MENTAL">The mental model</H2>
            <P>
              Networking has more inheritance than design. Every layer of today's internet exists because of constraints from the layer below, decisions made decades ago, and the impossible coordination problem of upgrading a planet's worth of routers. You can't understand it as "what would I build today?" — you have to understand it as "what made sense given what existed in 1981, 1991, 2001, 2011, 2021."
            </P>
            <P>
              The reward: once you see the layering, everything becomes simpler. "Why is DNS UDP?" — because UDP existed and DNS needed to be small + fast. "Why does HTTPS leak hostnames via SNI?" — because the IP→hostname binding had to happen BEFORE encryption could start. "Why is HTTP/3 on UDP?" — because TCP is in-kernel and can't be updated; QUIC is in userspace.
            </P>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ OSI">The 7-layer model</H2>
            <P>
              The OSI model (Open Systems Interconnection, 1984) defines 7 conceptual layers. TCP/IP (the actual internet stack) collapses these into 4. Most working engineers use OSI numbering — "L4 load balancer," "L7 reverse proxy" — but think in TCP/IP groups.
            </P>
            <ArchDiagram />
            <Code id="osi-table" lang="text">{`OSI 7 LAYERS          TCP/IP 4 LAYERS      EXAMPLES
─────────────         ───────────────      ─────────────────────────────
L7 Application                              HTTP, DNS, SSH, FTP, SMTP
L6 Presentation       Application          TLS, JSON, MIME types
L5 Session                                  TLS session, cookies
L4 Transport          Transport            TCP, UDP, QUIC
L3 Network            Internet             IP (v4/v6), ICMP, routing
L2 Data Link          Network Access       Ethernet, Wi-Fi (802.11), MAC
L1 Physical                                  Copper, fiber, radio waves`}</Code>
            <H2 num="◇ ENCAP">Encapsulation — how it actually moves</H2>
            <P>
              Every packet on the wire has nested headers. Outermost is the lowest layer; innermost is the application data. A browser fetching https://example.com sends a packet shaped like:
            </P>
            <Code id="encapsulation" lang="text">{`┌─────────────────────────────────────────────────────────────┐
│ Ethernet header (L2): source MAC, dest MAC, EtherType       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ IP header (L3): source IP, dest IP, TTL, protocol       │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ TCP header (L4): src port, dst port, seq#, flags    │ │ │
│ │ │ ┌─────────────────────────────────────────────────┐ │ │ │
│ │ │ │ TLS record (L6/5): version, content type, len   │ │ │ │
│ │ │ │ ┌─────────────────────────────────────────────┐ │ │ │ │
│ │ │ │ │ HTTP request (L7): GET /path HTTP/1.1\\r\\n    │ │ │ │ │
│ │ │ │ │ Host: example.com\\r\\nAccept: ...\\r\\n\\r\\n     │ │ │ │ │
│ │ │ │ └─────────────────────────────────────────────┘ │ │ │ │
│ │ │ └─────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

Each router strips L2 (Ethernet), reads L3 (IP) to route, re-wraps L2.
TCP segment reassembled at endpoints.
TLS decrypted at endpoints (or terminating proxy).
HTTP parsed at application.`}</Code>
            <H2 num="◇ WHO">Who operates at each layer</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { l: 'L1/L2', who: "Network engineers. Cables, switches, Wi-Fi configuration." },
                { l: 'L3', who: "Network engineers + ops. Routers, firewalls, BGP, subnets." },
                { l: 'L4', who: "DevOps + SRE. Load balancers (L4 = TCP-level), kernel tuning, TCP options." },
                { l: 'L5/L6/L7', who: "App developers. HTTP semantics, TLS configuration, REST API design." },
              ].map(x => (
                <div key={x.l} className="border border-zinc-800 px-3 py-2">
                  <code className="text-cyan-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{x.l}</code>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{x.who}</div>
                </div>
              ))}
            </div>
            <Callout kind="tip" title="DEBUGGING IS LAYER TRIAGE">
              When something doesn't work, ask: <strong>which layer is broken?</strong> Can I ping? (L3.) Can I open a TCP connection? (L4.) Does TLS handshake? (L5/6.) Does HTTP return what I expect? (L7.) Most senior debugging is the discipline of testing each layer independently.
            </Callout>
            {QUIZZES.layers.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ MAP">The phonebook of the internet</H2>
            <P>
              <Term>DNS</Term> translates human names (example.com) into IPs (93.184.215.14). It's hierarchical: root → TLD (.com) → authoritative for example.com. Every domain is cached at every step, which is why DNS feels instant despite the recursion underneath.
            </P>
            <Code id="dns-recursion" lang="text">{`Your laptop                  Resolver (1.1.1.1)       Root (.)        TLD (.com)         Authoritative (example.com)
     │                              │                     │                │                       │
     │ "Who is example.com?"        │                     │                │                       │
     │─────────────────────────────>│                     │                │                       │
     │                              │                     │                │                       │
     │                              │ "Who handles .com?" │                │                       │
     │                              │────────────────────>│                │                       │
     │                              │ "Ask a.gtld...com"  │                │                       │
     │                              │<────────────────────│                │                       │
     │                              │                     │                │                       │
     │                              │ "Who handles example.com?"          │                       │
     │                              │──────────────────────────────────────>│                       │
     │                              │ "Ask ns1.example.com"                │                       │
     │                              │<──────────────────────────────────────│                       │
     │                              │                     │                │                       │
     │                              │ "What's the A record for example.com?"                       │
     │                              │──────────────────────────────────────────────────────────────>│
     │                              │ "93.184.215.14, TTL 3600"                                    │
     │                              │<──────────────────────────────────────────────────────────────│
     │ "93.184.215.14"              │                     │                │                       │
     │<─────────────────────────────│                     │                │                       │
     │                                                                                              │
     (in practice: most of this is cached — recursion above only happens on cache miss)`}</Code>
            <H2 num="◇ RECORDS">Record types</H2>
            <ComparisonTable data={COMPARISONS.dns_records} />
            <H2 num="◇ DOH">DoH, DoT, DoQ — encrypted DNS</H2>
            <P>
              Default DNS is plaintext on port 53 — every domain you visit leaks to your ISP and any on-path observer. Three encrypted alternatives now widely deployed:
            </P>
            <Code id="encrypted-dns" lang="text">{`DOH — DNS over HTTPS (RFC 8484)
  Port:    443 (same as HTTPS — blends with web traffic)
  Format:  HTTPS POST or GET with JSON / wire format
  Used by: Firefox (85%+ US), Chrome (region-dependent), Brave, iOS 14+
  Pros:    Hardest to block (looks like HTTPS)
  Cons:    Centralizes queries with Cloudflare/Google/etc.

DOT — DNS over TLS (RFC 7858)
  Port:    853 (dedicated)
  Format:  Standard DNS wire format over TLS
  Used by: Android 9+, many home routers, OS-level DNS
  Pros:    Network admins can identify + manage
  Cons:    Easy to block at the port level

DOQ — DNS over QUIC (RFC 9250)
  Port:    853 (UDP, QUIC)
  Pros:    Fastest handshake (QUIC's 0-RTT)
  Cons:    Newer, less ubiquitous

ODOH — Oblivious DNS over HTTPS
  Architecture: client → proxy → resolver
  Resolver sees queries (not client IP); proxy sees IP (not queries).
  Apple uses ODoH on Cloudflare for iCloud Private Relay.`}</Code>
            <H2 num="◇ TTL">TTL strategy</H2>
            <P>
              Time-to-live controls how long caches keep records. The tradeoff: short TTL = fast change propagation + more queries; long TTL = fewer queries + slow change. The pre-change TTL drop is the most-forgotten DNS practice.
            </P>
            <Code id="ttl">{`# DAY BEFORE planned change — drop TTL
example.com.   IN A 203.0.113.10   ; TTL 60

# Wait 24h for caches to expire old TTL

# Day of change
example.com.   IN A 203.0.113.20   ; TTL 60

# After 24-48h, restore long TTL
example.com.   IN A 203.0.113.20   ; TTL 86400`}</Code>
            <Callout kind="dont" title="LONG TTL DURING MIGRATIONS">
              TTL 86400 + domain migration = 24 hours of split-brain. Drop TTL to 60s the day BEFORE any change. Restore after it settles. Skip this and you'll have user reports for a full day.
            </Callout>
            <Callout kind="dont" title="CNAME AT THE APEX">
              <Kbd>example.com IN CNAME other.example.com</Kbd> is invalid — CNAME can't coexist with the SOA + NS records that apex requires. Use A records, ALIAS (Route 53), or Cloudflare's CNAME flattening.
            </Callout>
            {stackData?.dns && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.dns}</Callout>}
            {QUIZZES.dns.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ TLS">Transport Layer Security</H2>
            <P>
              <Term>TLS</Term> is the 'S' in HTTPS. It does three things: <strong>confidentiality</strong> (no one in the middle reads), <strong>integrity</strong> (no one in the middle modifies), <strong>identity</strong> (you know you're talking to who you think). TLS 1.3 (RFC 8446, 2018) is current — 94% of traffic in 2026.
            </P>
            <ComparisonTable data={COMPARISONS.tls_versions} />
            <H2 num="◇ HANDSHAKE">The TLS 1.3 handshake — one round trip</H2>
            <Code id="handshake" lang="text">{`CLIENT                                                  SERVER
  │                                                       │
  │  ClientHello                                          │
  │    + supported_versions: TLS 1.3                      │
  │    + cipher_suites: [TLS_AES_256_GCM_SHA384, ...]     │
  │    + key_share: client's ephemeral public key         │
  │    + signature_algorithms: [...]                      │
  │    + server_name: example.com (SNI — plaintext!)      │
  │ ─────────────────────────────────────────────────────>│
  │                                                       │
  │                                                       │  ServerHello
  │                                                       │    + key_share: server's ephemeral public key
  │                                                       │    (now BOTH sides can derive shared secret)
  │                                                       │  EncryptedExtensions
  │                                                       │  Certificate (encrypted)
  │                                                       │  CertificateVerify
  │                                                       │  Finished
  │ <─────────────────────────────────────────────────────│
  │                                                       │
  │  Finished                                             │
  │  (Application Data — HTTP request can start here)     │
  │ ─────────────────────────────────────────────────────>│
  │                                                       │
  │ <───────── Application Data ─────────────────────────>│
  │                                                       │
  TOTAL: 1 round trip to encrypted application data.
  TLS 1.2 required 2 RTT. TLS 1.3 cuts the negotiation phase.
  0-RTT resumption: with a previously-established session, the
  client can send application data WITH the ClientHello.`}</Code>
            <H2 num="◇ CERTS">Certificates + ACME</H2>
            <P>
              A certificate binds a domain to a public key, signed by a <Term>CA</Term> the client trusts. Browsers ship with ~150 trusted root CAs. <Term>ACME</Term> (RFC 8555) automates the entire issuance + renewal cycle. Let's Encrypt is the dominant ACME-compatible CA — free, 90-day certs, automated by clients like certbot, Caddy, acme.sh.
            </P>
            <Code id="cert-chain" lang="text">{`Trust chain (root → end-entity):

  Root CA (in browser trust store, self-signed)
   └── Intermediate CA (signed by root, on disk)
        └── End-entity cert (your example.com, signed by intermediate)

When you serve HTTPS, send: end-entity + intermediate chain.
Browser walks chain up to a trusted root.

Common bugs:
  - Missing intermediate cert (browsers might recover; many tools won't)
  - Hostname mismatch (cert is for example.com, you're hitting www.example.com)
  - Expired (90-day default for Let's Encrypt; automate renewal)
  - Untrusted root (self-signed certs, internal CAs not in browser store)`}</Code>
            <H2 num="◇ SNI">SNI + ECH</H2>
            <P>
              <Term>SNI</Term> (Server Name Indication) tells the server which hostname you want during the TLS handshake — required for one IP to host many HTTPS sites. Problem: SNI is plaintext, so a network observer sees which hostname you connected to even with HTTPS. <Term>ECH</Term> (Encrypted Client Hello, RFC 9460) fixes this by wrapping the inner ClientHello in an outer one encrypted to the CDN's public key. Cloudflare ships it; Firefox and Chrome support it.
            </P>
            <Callout kind="info" title="LET'S ENCRYPT CERT LIFETIME IS SHRINKING">
              Was 5 years. Then 2. Then 1 year. Then 397 days (current public CA max). Industry is moving toward 200 days, eventually 47 days. The premise: short validity = automated renewal = no manual mistakes = real revocation via expiry. If you're still manually renewing certs, your future self will thank you for automating.
            </Callout>
            {stackData?.tls && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.tls}</Callout>}
            {QUIZZES.tls.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ HTTP">Hypertext Transfer Protocol</H2>
            <P>
              HTTP is request/response over a connection. Stateless — each request stands alone (cookies bolt state on top). Three versions in active use in 2026, all carrying the same semantics:
            </P>
            <ComparisonTable data={COMPARISONS.http_versions} />
            <H2 num="◇ METHODS">Methods + semantics</H2>
            <Code id="methods" lang="text">{`GET     Fetch. Safe + idempotent. Cacheable. NO body changes.
HEAD    Like GET but only headers (no body). Quick existence/timestamp check.
POST    Create + non-idempotent submission. NOT safe to retry blindly.
PUT     Replace entire resource. Idempotent (PUT same body twice = same result).
PATCH   Partial update. NOT necessarily idempotent (depends on format).
DELETE  Remove. Idempotent (deleting twice = still gone).
OPTIONS Capabilities query. CORS preflight uses this.
CONNECT Tunnel through a proxy (HTTPS via HTTP proxy).

IDEMPOTENCY: same request, same effect, regardless of count.
  GET, HEAD, PUT, DELETE — idempotent.
  POST, PATCH — NOT inherently. Use Idempotency-Key header for safety.

SAFETY: doesn't modify server state.
  GET, HEAD, OPTIONS — safe.
  Everything else — not safe.

These properties matter for retry logic, caching, and crawlers.
A web crawler firing GET on a /delete-account URL = your fault for using GET.`}</Code>
            <H2 num="◇ STATUS">Status codes worth knowing</H2>
            <ComparisonTable data={COMPARISONS.status_codes} />
            <H2 num="◇ HEADERS">Essential headers</H2>
            <Code id="headers">{`# REQUEST
Host: example.com                       # which hostname (required HTTP/1.1+)
User-Agent: Mozilla/5.0 ...             # client identification
Accept: application/json                # what content types client accepts
Accept-Encoding: gzip, br, zstd         # what compression client accepts
Authorization: Bearer eyJhbG...         # authentication
Cookie: session=abc; theme=dark         # state
Content-Type: application/json          # body format (for POST/PUT/PATCH)
Content-Length: 42                      # body size
If-None-Match: "abc123"                 # ETag-based conditional GET
Origin: https://app.example.com         # for CORS

# RESPONSE
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Cache-Control: public, max-age=60
ETag: "abc123"
Set-Cookie: session=xyz; SameSite=Lax; Secure; HttpOnly
Location: /users/42                     # for 201 / 3xx
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'
Access-Control-Allow-Origin: https://app.example.com
Vary: Accept-Encoding, Authorization    # cache key modifiers`}</Code>
            <H2 num="◇ CORS">CORS — Cross-Origin Resource Sharing</H2>
            <P>
              Browsers enforce same-origin policy: JavaScript from one origin (scheme + host + port) can't read responses from another. CORS lets servers opt-in to allowing specific origins to read their responses. For "non-simple" requests (custom headers, non-GET/POST, etc.), the browser sends a preflight OPTIONS request first.
            </P>
            <Code id="cors">{`# Browser fetches https://api.example.com from origin https://app.example.com
# Request method = PUT (non-simple)
# Browser preflights:

OPTIONS /users/42 HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type, Authorization

# Server replies:

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400

# Browser sees headers, allows the real PUT to proceed.
# If preflight fails or headers missing, browser blocks. Network panel
# shows the failure; the real request never goes out.`}</Code>
            <Callout kind="dont" title="GET FOR STATE CHANGES">
              <Kbd>GET /delete-account</Kbd> = a crawler or prefetcher will eventually fire it. Email link previews fetch URLs. Browser extensions prefetch. <strong>Use POST for mutations.</strong>
            </Callout>
            {stackData?.http && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.http}</Callout>}
            {QUIZZES.http.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ TCP">TCP — reliable, ordered, slow to start</H2>
            <P>
              <Term>TCP</Term> provides reliable, ordered, connection-oriented streams over IP. Before any data flows, the three-way handshake establishes the connection. Lost packets are retransmitted. Bytes arrive in order, or not at all.
            </P>
            <Code id="tcp" lang="text">{`THREE-WAY HANDSHAKE
  Client                                   Server
    │ ──── SYN (seq=x) ────────────────────>│
    │                                       │
    │ <─── SYN-ACK (seq=y, ack=x+1) ────────│
    │                                       │
    │ ──── ACK (ack=y+1) ──────────────────>│
    │                                       │
    │       (connection established)        │
    │ <──── data ─────────────────────────> │

TCP guarantees:
  - Reliability   — retransmit lost segments
  - Ordering      — receiver buffers + reorders
  - Flow control  — window size prevents overwhelming receiver
  - Congestion control — backs off when network busy

Cost:
  - 1 RTT for handshake (before app sends data)
  - Head-of-line blocking: one lost packet stalls the WHOLE stream
  - Connection state kept on both sides`}</Code>
            <H2 num="◇ UDP">UDP — fire and forget</H2>
            <P>
              <Term>UDP</Term> is the opposite: no connection, no reliability, no ordering. You send a datagram; it arrives or it doesn't. Header is tiny (8 bytes vs TCP's 20+). Foundation of DNS, NTP, video streaming, and now QUIC.
            </P>
            <Code id="udp" lang="text">{`UDP packet structure:
  ┌─────────────────────────────────────────────┐
  │ Source port (16) │ Dest port (16)           │
  │ Length (16)      │ Checksum (16)            │
  │ Payload (variable, up to 65,507 bytes)      │
  └─────────────────────────────────────────────┘

UDP semantics:
  - No handshake — first packet is data
  - No retransmission — lost packets stay lost
  - No ordering — packets may arrive out of order or duplicated
  - No connection state — server doesn't track clients

When UDP makes sense:
  - DNS (request + response = 2 packets, retry trivially)
  - Real-time media (lost video frames are stale anyway)
  - Game protocols (latency > completeness)
  - QUIC, on top of which HTTP/3 builds reliability differently`}</Code>
            <H2 num="◇ QUIC">QUIC — TCP redesigned for the modern web</H2>
            <P>
              <Term>QUIC</Term> (RFC 9000) is a UDP-based transport that takes TCP's ideas (reliability, ordering, congestion control) and rebuilds them in userspace, while solving three TCP problems:
            </P>
            <div className="grid gap-2 my-3 text-[14px]">
              {[
                { p: "Head-of-line blocking", q: "QUIC has multiple independent streams per connection. One stream losing a packet doesn't stall the others." },
                { p: "Slow connection setup", q: "Integrated TLS 1.3 handshake — 1 RTT to encrypted data. 0-RTT for known servers." },
                { p: "OS-level protocol updates", q: "TCP is in-kernel; QUIC is a userspace library. Endpoints can adopt new versions without OS upgrades." },
              ].map(x => (
                <div key={x.p} className="border-l-2 border-cyan-300 pl-3 py-1">
                  <div className="text-cyan-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{x.p}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{x.q}</div>
                </div>
              ))}
            </div>
            <Callout kind="info" title="WHY HTTP/3 ISN'T WINNING FASTER">
              QUIC plateaued at 21% in early 2026 despite full browser support. Three drags: (1) <strong>middleboxes</strong> — firewalls, NATs, corporate proxies that don't understand QUIC and downgrade; (2) <strong>operational cost</strong> — UDP performance tuning, mandatory TLS 1.3, kernel UDP segmentation offload; (3) <strong>HTTP/2 is good enough</strong> for most sites. The big traffic sources (Google, Meta, Cloudflare) are mostly HTTP/3 by volume; the long tail is HTTP/2.
            </Callout>
            <H2 num="◇ TIMINGS">Latency budgets — round trips matter</H2>
            <Code id="timings" lang="text">{`TYPICAL ROUND-TRIP TIMES (RTT)
  Same city          ~1-5 ms
  Same country       ~20-50 ms
  Cross-continent    ~70-150 ms (limited by speed of light)
  Satellite          ~600 ms (geostationary; LEO like Starlink ~30-40ms)

WHAT EACH RTT COSTS
  1 RTT = 1 round trip = client→server→client

  TCP handshake:           1 RTT before any data
  TLS 1.3 handshake:       1 RTT (combined with TCP)
  TLS 1.2 handshake:       2 RTT (separate from TCP)
  HTTP/1.1 request:        1 RTT per request (no multiplexing)
  HTTP/2 request:          included in connection (multiplexed)
  HTTP/3 first request:    1 RTT total (QUIC includes TLS 1.3)
  HTTP/3 0-RTT resumption: 0 RTT (data sent with ClientHello)

  Cross-continent (100ms RTT):
    HTTP/1.1 + TLS 1.2 first request:  4 RTT × 100ms = 400ms before bytes
    HTTP/3 0-RTT resumption:           0 RTT = 0ms before bytes (effectively)`}</Code>
            {QUIZZES.transport.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ PROXY">Reverse proxies — the front door</H2>
            <P>
              A <Term>reverse proxy</Term> sits in front of your real backend servers. It terminates TLS, routes by hostname/path, handles compression, sets security headers, caches, and presents a single endpoint while distributing to many backends. Every production web app has one.
            </P>
            <Code id="rp-job" lang="text">{`Internet
   │
   ▼
[Reverse proxy]   ← terminates TLS, sets security headers, gzip/br
   │
   ├──> backend1:3000  (handles /api/users)
   ├──> backend2:3000  (handles /api/orders)
   └──> static files from disk  (handles /static/*)

Common reverse proxies in 2026:
  Caddy    — HTTPS automatic, simplest config
  Nginx    — most deployed; battle-tested; verbose config
  Traefik  — Docker-native, auto-discovery via labels
  HAProxy  — L4 + L7; loves stats + observability
  Envoy    — service mesh data plane (Istio, Consul)
  Apache   — legacy; still common on shared hosting`}</Code>
            <H2 num="◇ L4L7">L4 vs L7 load balancing</H2>
            <P>
              The choice depends on what the LB needs to see. L4 routes by TCP/IP — fast, dumb, opaque. L7 routes by HTTP — content-aware, slower, smart.
            </P>
            <Code id="l4l7" lang="text">{`L4 LOAD BALANCER (TCP)
  Routes by: source IP, dest IP, ports
  Sees: encrypted bytes (doesn't decrypt)
  Speed: high (no parsing)
  Used for: databases, gRPC over TLS, raw TCP, extreme throughput
  Examples: HAProxy TCP mode, AWS NLB, nginx stream module

L7 LOAD BALANCER (HTTP)
  Routes by: Host header, URL path, headers, cookies
  Sees: terminates TLS, parses HTTP
  Speed: lower (must decrypt + parse)
  Used for: HTTP services, CDN, API gateways
  Examples: Nginx HTTP mode, HAProxy HTTP mode, Envoy, Traefik, Caddy

WHICH TO USE
  Modern apps: L7. The visibility + smarts outweigh CPU cost.
  Databases, websockets, non-HTTP: L4.
  Hybrid: edge L7 (HTTPS termination) → internal L4 (cluster traffic).`}</Code>
            <H2 num="◇ HEALTH">Health checks — liveness + readiness</H2>
            <P>
              Load balancers route around dead instances using health checks. Two patterns matter:
            </P>
            <Code id="health" lang="text">{`/health  — LIVENESS PROBE
  Question: is this process alive?
  Cheap, always-on, no dependencies.
  Returns 200 if the process can serve at all.
  Kubernetes restart trigger if this fails repeatedly.

/ready   — READINESS PROBE
  Question: can this instance serve requests RIGHT NOW?
  Checks dependencies: DB connection, cache, downstream services.
  Returns 503 if any critical dependency is down.
  Load balancer removes instance from rotation.

DON'T MIX THEM. A failed /ready (Redis blip) shouldn't restart the pod —
just stop routing traffic for a few seconds. A failed /health (process
deadlocked) SHOULD restart.`}</Code>
            {QUIZZES.proxies.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ CDN">Content Delivery Networks</H2>
            <P>
              A <Term>CDN</Term> is a distributed network of edge servers cached close to users. Static assets (images, JS, CSS) served from the nearest edge instead of your single origin. Reduces latency dramatically + offloads origin traffic. Modern CDNs (Cloudflare, Fastly, Akamai, CloudFront, Bunny) also do TLS termination, WAF, DDoS protection, edge compute.
            </P>
            <Code id="cdn-flow" lang="text">{`Without CDN:
  User in Tokyo  ────────────────────────────────────>  Origin in Virginia
  (250ms RTT, every request)                            (your server)

With CDN:
  User in Tokyo  ─────>  CDN edge in Tokyo  ───────>  Origin (only on cache miss)
  (10ms RTT)             (caches static + sometimes API)

What gets cached at the edge:
  - Static assets (images, JS, CSS) — usually 1+ year
  - Public HTML — minutes to hours
  - API responses with right Cache-Control
  - Generated images, transformed content (CDN edge compute)

What DOESN'T:
  - User-specific content (account pages, dashboards)
  - POST/PUT/PATCH/DELETE responses
  - Anything with Cache-Control: private or no-store`}</Code>
            <H2 num="◇ CACHE">Cache-Control directives that matter</H2>
            <Code id="cc">{`# IMMUTABLE STATIC ASSETS (hashed URLs: app.a3f2c1.js)
Cache-Control: public, max-age=31536000, immutable
# 1 year. Browser doesn't even revalidate on F5.

# HTML — want freshness on every visit
Cache-Control: public, max-age=0, must-revalidate
# Revalidates via ETag / Last-Modified; gets 304 if unchanged.

# USER-SPECIFIC API RESPONSES
Cache-Control: private, no-store
# CDN never caches; browser doesn't store. Use Vary: Authorization to be safe.

# PUBLIC API, SLOWLY CHANGING
Cache-Control: public, max-age=60, stale-while-revalidate=300
# Fresh for 60s. Up to 5min more, serve STALE INSTANTLY while
# revalidating in background. Feels instant; eventually consistent.

# EXPLICIT NO-CACHE (revalidate every time)
Cache-Control: no-cache
# Not "don't cache" — "cache but check on every use."

# DON'T CACHE AT ALL (sensitive data)
Cache-Control: no-store
# This is the actual "don't cache." Use for auth tokens, etc.`}</Code>
            <H2 num="◇ ETAG">ETag + 304 Not Modified</H2>
            <P>
              Server sends ETag (an opaque content hash) with the response. Browser stores it. Next request, browser sends <Kbd>If-None-Match: "abc123"</Kbd>. If content unchanged, server responds <strong>304 Not Modified</strong> with no body. Saves bandwidth + transfer time without losing freshness.
            </P>
            <Code id="etag-flow" lang="text">{`First request:
  Client:  GET /api/users/42
  Server:  200 OK
           ETag: "abc123"
           Content-Type: application/json
           [body bytes]

Second request (later, browser checking freshness):
  Client:  GET /api/users/42
           If-None-Match: "abc123"
  Server:  304 Not Modified
           ETag: "abc123"
           (no body — browser uses cached copy)

If content changed:
  Server:  200 OK
           ETag: "xyz789"
           [new body bytes]

Frameworks (Express, Fastify, Spring, etc.) often generate ETags
automatically from response bodies. Free win for every GET endpoint.`}</Code>
            <H2 num="◇ SWR">stale-while-revalidate — the underused gem</H2>
            <P>
              RFC 5861's <Kbd>stale-while-revalidate=N</Kbd> directive lets caches serve stale content INSTANTLY while fetching fresh in the background. The next request gets fresh. From the user's perspective, every response is instant; from the system's perspective, content is eventually consistent. Cloudflare honors it. Many CDNs do. Browsers do.
            </P>
            <Callout kind="dont" title="CACHE-CONTROL ON USER-SPECIFIC RESPONSES">
              CDN caches your <Kbd>/dashboard</Kbd> response, then serves another user the cached version. Now User B sees User A's data. <strong>Set <Kbd>Cache-Control: private, no-store</Kbd> on auth-protected responses.</strong> Or use <Kbd>Vary: Authorization</Kbd> + <Kbd>private</Kbd> + verify your CDN respects them.
            </Callout>
            {QUIZZES.cdn.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">A working library of networking configs</H2>
            <P>
              Eight categories of production-grade networking patterns — DNS zones, TLS automation, HTTP patterns, caching, reverse proxies, load balancing, security headers, debugging cookbooks. Every snippet has a copy button. Paste straight into nginx.conf, Caddyfile, your DNS provider, your terminal.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-cyan-300 text-cyan-300 px-4 py-2 text-[13px] hover:bg-cyan-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
            </div>
            <H2 num="◇ DONT">Anti-patterns — networking edition</H2>
            <div className="grid gap-2 my-3">
              {ANTIPATTERNS.map(a => (
                <Callout key={a.name} kind="dont" title={a.name}>{a.reason}</Callout>
              ))}
            </div>
            <Callout kind="cite" title="INSPIRATION">
              Patterns drawn from RFC 9110-9114 (HTTP), RFC 8446 (TLS 1.3), RFC 9000 (QUIC), Mozilla SSL Config Generator, Cloudflare Learning, Caddy + Nginx + Traefik docs, and decades of accumulated wisdom from production incidents.
            </Callout>
            {stackData?.library && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.library}</Callout>}
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ LIVE">Real network operations in your browser</H2>
            <P>
              The sandbox does two things that are usually impossible without a backend: <strong>real DNS queries</strong> via Cloudflare's public DoH endpoint (cloudflare-dns.com/dns-query), and <strong>real HTTP fetches</strong> with full response inspection (status, headers, timing, body). No mocks. Six challenges progress from basic A-record lookup through DNS NS records, HTTP status codes, redirect chains, JSON responses, and CORS-aware endpoints.
            </P>
            <Code id="sandbox-info" lang="text">{`DNS via DoH (DNS over HTTPS):
  Endpoint: https://cloudflare-dns.com/dns-query
  Header:   accept: application/dns-json
  Query:    ?name=example.com&type=A
  Returns:  { Status: 0, Answer: [{name, type, TTL, data}, ...] }

HTTP via fetch():
  Browser's standard Fetch API.
  Returns: status, headers, body (text + JSON), timing.

CORS gotcha:
  Most websites don't allow cross-origin reads. Try these CORS-friendly endpoints:
    - api.github.com/zen (returns one-liner)
    - httpbin.org/* (HTTP testing service)
    - cloudflare-dns.com/dns-query (the DoH endpoint itself)
  Sites that block: most production apps. The browser will report a CORS error.`}</Code>
            <Sandbox />
            <Callout kind="cite" title="HOW IT WORKS">
              The sandbox uses two browser-native primitives: <Kbd>fetch()</Kbd> for HTTP and the same fetch against Cloudflare's DoH JSON endpoint for DNS. Everything runs entirely client-side — no backend, no proxy. CORS limits which third-party sites you can fetch from, but DoH and any CORS-enabled API work.
            </Callout>
            <Callout kind="tip" title="LOCAL NETWORK PRACTICE">
              For unlimited practice: install <Kbd>dig</Kbd> (BIND tools), <Kbd>curl</Kbd>, and <Kbd>openssl</Kbd> locally. Run the commands from the cheatsheet against real sites. Open Chrome DevTools Network panel on any site and read every column. Capture a session with Wireshark + dissect packets. The intuition only comes from doing.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When the network is the problem</H2>
            <P>
              Most networking issues fall into a small number of categories. Walk the tree — DNS failing, TLS handshake breaking, CORS blocking, redirects looping, slowness, connection refused, 5xx from your service. The fixes are well-known once you've identified the layer.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLKIT">The debugger's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'curl -v', what: "Full HTTP transcript with DNS, TCP, TLS phases. The universal HTTP debugger. -w for timing, --http3 to force protocol, --resolve to bypass DNS." },
                { name: 'dig +trace', what: "Walk DNS recursion from root → TLD → authoritative. Best DNS debugging command. Shows exactly which step returned the unexpected answer." },
                { name: 'openssl s_client', what: "Manual TLS handshake. See cert chain, ciphers, protocols. The TLS debugging command. -tls1_3 forces version." },
                { name: 'tcpdump / Wireshark', what: "Packet-level capture + analysis. When app-layer tools fail. Capture filters limit what's recorded; display filters slice it." },
                { name: 'mtr', what: "Combined ping + traceroute, continuously updating. Best for diagnosing intermittent network issues — see which hop is dropping packets." },
                { name: 'Chrome DevTools Network', what: "Browser-side network panel. Waterfall view, timing breakdown per request, copy-as-curl for sharing repros, HAR export." },
                { name: 'ssllabs.com/ssltest', what: "Free TLS configuration tester. Grades your HTTPS setup A+ → F. Identifies weak ciphers, missing intermediates, HSTS, OCSP issues." },
                { name: 'securityheaders.com', what: "Free security header audit. Checks HSTS, CSP, X-Frame-Options, etc. A+ in 10 minutes once you set the recommended headers." },
                { name: 'webpagetest.org', what: "Real-browser performance testing from multiple locations. Filmstrip + waterfall + identification of slow requests. Free." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-cyan-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands reference</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-cyan-300 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-orange-400 text-orange-300 px-4 py-2 text-[13px] hover:bg-orange-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'allcmds' ? 'copied!' : 'Copy all commands as one block'}
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
                <div className="text-orange-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{missed.length}</div>
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
            <H2 num="◇ ROADMAP">A networking reading roadmap</H2>
            <P>
              For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1', plan: "High Performance Browser Networking (hpbn.co — free online). Chapters 1-4: latency/bandwidth, TCP, UDP, TLS. Foundation that everything else builds on." },
                { wk: 'Week 2', plan: "DNS deep dive. Buy a cheap domain ($10 at Porkbun/Namecheap). Move it to Cloudflare DNS. Add every record type at least once. Use dig +trace on every domain you visit." },
                { wk: 'Week 3', plan: "TLS from scratch. Generate self-signed certs with openssl. Watch a TLS 1.3 handshake in Wireshark. Read RFC 8446 (yes, the actual RFC — clicks once you've done it)." },
                { wk: 'Week 4-6', plan: "Build with Caddy or Nginx. Real domain, real Let's Encrypt cert, real reverse proxy. Add security headers. Test with ssllabs.com + securityheaders.com until A+ on both." },
                { wk: 'Week 7-9', plan: "Add a CDN (Cloudflare free tier). Configure Cache-Control headers properly. Use webpagetest.org to measure. Master the Network panel — copy-as-curl every interesting request." },
                { wk: 'Week 10+', plan: "Kurose-Ross textbook for theory + RFCs for depth. Wireshark on captured sessions. Operate something real with traffic + watch metrics. The intuition compounds." },
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
                  <code className="text-orange-300 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-cyan-300 text-cyan-300 px-4 py-2 text-[13px] hover:bg-cyan-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-orange-400 text-orange-300 px-4 py-2 text-[13px] hover:bg-orange-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-lime-300 text-lime-200 px-4 py-2 text-[13px] hover:bg-lime-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-red-400 hover:text-red-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              The network is the substrate. Every app you build runs through DNS, TLS, HTTP, TCP/UDP, IP. You've walked from ARPANET's first packet through the current 2026 stack — the layer model, DNS hierarchy + DoH, TLS 1.3 handshakes, the three HTTP versions, TCP and QUIC, reverse proxies and load balancers, CDN caching, a working library of configs, real DNS + HTTP execution, and the triage tree. Open the docs. Run the commands. Build something with HTTPS that you operate. The intuition compounds.
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

      {/* HEADER */}
      <header className="border-b border-zinc-800 sticky top-0 bg-black/90 backdrop-blur-sm z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-cyan-300 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>⇌</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>NET</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-lime-300/40 text-lime-200 px-2 py-1 text-[11px] hover:bg-lime-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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

      {/* NAV STRIP */}
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

      {/* MAIN */}
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

        {/* FOOTER NAV */}
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
            ⇌ · net atlas · grounded in rfc 9110-9114 + tls 1.3 + cloudflare radar + hpbn
          </div>
        </div>
      </main>
    </div>
  );
}
