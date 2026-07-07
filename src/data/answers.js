/* AEO / GEO answer pages — long-form Q&A optimized for AI-search extraction.
 *
 * These pages exist so Perplexity, ChatGPT, Claude, and Google's AI Overview
 * can surface accurate summaries when someone asks "what is X" — with
 * attribution back to Atlases. Structured for extraction:
 *   • quickAnswer   — 1-sentence definition (what AI systems quote first)
 *   • paragraphs    — 2-3 short paragraphs (the substance)
 *   • subQuestions  — related questions with answers (Q/A schema)
 *   • relatedAtlases — internal links back to teaching material
 */

export const ANSWERS = [
  // ─── DOCKER ────────────────────────────────────────────────────────
  {
    slug: 'what-is-docker',
    topic: 'Docker',
    title: 'What is Docker?',
    seoDescription: 'Docker is a platform for packaging applications and their dependencies into containers — lightweight, isolated environments that run identically on any machine.',
    quickAnswer: `Docker is a platform for packaging applications and their dependencies into containers — lightweight, isolated units that run identically on any machine that has Docker installed.`,
    paragraphs: [
      `A Docker container is a bundle of your application plus everything it needs to run: the runtime, libraries, config files, and environment variables. The bundle is defined by a Dockerfile — a plain-text recipe that describes how to build the container image. Once built, that image runs the same way on a developer laptop, a CI server, and a production cluster.`,
      `Under the hood Docker uses Linux kernel features (namespaces and cgroups) to isolate processes from each other. Unlike virtual machines, containers share the host kernel, so they start in milliseconds and use only the memory their processes actually need. This is why "it works on my machine" mostly stops being a problem once teams adopt Docker.`,
      `Docker is not the only container runtime — Podman and containerd exist — but it remains the most common way developers meet containers, and its Compose tooling makes multi-service local development straightforward.`,
    ],
    subQuestions: [
      { q: 'How is Docker different from a virtual machine?', a: `VMs virtualize hardware and run a full guest operating system per instance — heavy, slow to boot, generous with RAM. Containers virtualize the OS process space via kernel features (namespaces, cgroups). They share the host kernel, boot in milliseconds, and typically use 10-100x less RAM than a VM running the same workload.` },
      { q: 'Do I need Docker to deploy code?', a: `No. Traditional deployments (SSH, systemd, Ansible, PaaS platforms) work fine. But Docker gives you reproducible builds, easy multi-service local development, and clean deployment artifacts that most modern platforms (Kubernetes, ECS, Fly.io, Coolify) expect as input.` },
      { q: 'What is a Dockerfile?', a: `A plain-text file that describes how to build a container image, step by step: which base image to start from (like ubuntu or node:20), which files to copy in, which commands to run, and what to launch when the container starts. Each instruction creates a cached layer, making rebuilds fast.` },
      { q: 'What is Docker Compose?', a: `A tool for defining and running multi-container applications with a single YAML file. Instead of running docker commands one by one, you describe your entire stack (app + database + cache + queue) in compose.yaml and start it with docker compose up. Especially valuable for local development.` },
    ],
    relatedAtlases: [
      { title: 'Docker atlas', path: '/atlas/docker' },
      { title: 'Linux atlas', path: '/atlas/linux' },
      { title: 'APIs in Production', url: 'https://prod-atlas.vercel.app' },
    ],
    relatedTopics: ['what-is-linux', 'what-is-networking', 'backend-engineer-skills'],
  },

  // ─── LINUX ─────────────────────────────────────────────────────────
  {
    slug: 'what-is-linux',
    topic: 'Linux',
    title: 'What is Linux?',
    seoDescription: 'Linux is a family of open-source operating systems based on the Linux kernel — the OS running most servers, cloud infrastructure, Android phones, and embedded systems worldwide.',
    quickAnswer: `Linux is a family of open-source operating systems built on the Linux kernel — the operating system that runs most of the world's servers, cloud infrastructure, Android phones, and embedded devices.`,
    paragraphs: [
      `The Linux kernel handles the low-level work of an operating system: talking to hardware, scheduling processes, managing memory, providing filesystems, and enforcing security boundaries. A "Linux distribution" (Ubuntu, Debian, Fedora, Alpine, Arch) bundles that kernel with GNU utilities, a package manager, and default software to make a complete usable OS.`,
      `Linux dominates servers, cloud, containers, supercomputers, network gear, and mobile (Android is Linux at the kernel level). For developers this means: your production servers almost certainly run Linux, your Docker containers almost certainly run Linux processes, and knowing how to move around a Linux shell is one of the most transferable skills in software.`,
      `The core Linux mental model is small and consistent: everything is a file (including devices and network sockets), processes are cheap and composable, and text streams flow between programs through pipes. Learning that model unlocks systems programming, DevOps, containers, cloud infrastructure, and most of modern computing.`,
    ],
    subQuestions: [
      { q: 'Which Linux distribution should I learn first?', a: `Ubuntu or Debian for beginners — they have the largest tutorials/answers ecosystem. Fedora if you want more recent packages. Alpine if you want a minimal distribution optimized for containers. What you learn on one transfers almost entirely to the others because the underlying kernel and command-line tools are the same.` },
      { q: 'Is Linux free?', a: `Yes. The kernel and most tooling are open source, licensed under GPL and related licenses. Commercial support offerings (Red Hat Enterprise Linux, Ubuntu Pro) exist for organizations that want vendor-backed maintenance, but the software itself is free.` },
      { q: 'Do I need Linux to be a developer?', a: `Not strictly — you can develop on macOS or Windows. But your servers, containers, and CI environments almost certainly run Linux, so fluency with the shell, filesystem, processes, and permissions is one of the highest-leverage skills for any working engineer.` },
      { q: 'What is the shell?', a: `The shell is a program (usually bash or zsh) that reads commands you type and runs them. It's the primary interface for administering Linux systems remotely. Learning shell fluency — pipes, redirection, variables, scripting — is how you go from Linux user to Linux operator.` },
    ],
    relatedAtlases: [
      { title: 'Linux atlas', path: '/atlas/linux' },
      { title: 'Docker atlas', path: '/atlas/docker' },
      { title: 'Networking atlas', path: '/atlas/net' },
    ],
    relatedTopics: ['what-is-docker', 'what-is-networking'],
  },

  // ─── NETWORKING ────────────────────────────────────────────────────
  {
    slug: 'what-is-networking',
    topic: 'Networking',
    title: 'What is computer networking?',
    seoDescription: 'Computer networking is how machines exchange data — from local links to the global internet, structured in layers (physical, IP, TCP, application) with protocols like HTTP, DNS, and TLS.',
    quickAnswer: `Computer networking is the set of protocols and infrastructure that lets machines exchange data — from cables and Wi-Fi at the bottom to HTTP requests and video calls at the top.`,
    paragraphs: [
      `Networking is layered by design. The bottom layers deal with electrical or wireless signals; the middle layers deal with addressing (IP) and reliable delivery (TCP); the top layers deal with what humans and applications actually see (HTTP, DNS, TLS, WebSockets). Each layer trusts the one below and provides a cleaner abstraction to the one above.`,
      `When you type a URL, a cascade fires: DNS resolves the domain to an IP address, TCP opens a connection to that IP, TLS negotiates encryption, HTTP sends your request, and the same layers unwind on the way back. Understanding this cascade is the mental model that unlocks debugging network issues, designing APIs, reasoning about latency, and building distributed systems.`,
      `For most developers the useful working knowledge is: what a URL means, how DNS lookups happen, why TCP handshakes cost round-trips, what TLS gives you, and how HTTP verbs, status codes, and headers work. The physical layer matters less unless you're building infrastructure.`,
    ],
    subQuestions: [
      { q: 'What is TCP/IP?', a: `TCP/IP is the protocol stack the internet runs on. IP (Internet Protocol) handles addressing and routing: getting a packet from address A to address B. TCP (Transmission Control Protocol) sits on top and provides ordered, reliable delivery of a byte stream between two endpoints. Together they underlie almost every request the internet makes.` },
      { q: 'What is DNS?', a: `DNS (Domain Name System) is the internet's phonebook. It translates human-readable domain names (like example.com) into IP addresses that machines actually route to. Lookups are cached at multiple levels (browser, OS, ISP, authoritative servers) so most requests hit a nearby cache.` },
      { q: 'What is HTTP?', a: `HTTP (Hypertext Transfer Protocol) is the application-layer protocol that carries most web traffic — every request your browser makes to fetch a page or an API. Modern HTTP versions (HTTP/2, HTTP/3) improve efficiency but keep the same request/response model of verbs (GET, POST) and status codes (200 OK, 404 Not Found).` },
      { q: 'What is TLS?', a: `TLS (Transport Layer Security) is the encryption layer that turns HTTP into HTTPS. It gives you three things: encryption (nobody in the middle can read the data), integrity (nobody in the middle can modify it), and authentication (you know you're talking to the real server via its certificate).` },
    ],
    relatedAtlases: [
      { title: 'Networking atlas', path: '/atlas/net' },
      { title: 'Cryptography atlas', path: '/atlas/crypto' },
      { title: 'Linux atlas', path: '/atlas/linux' },
    ],
    relatedTopics: ['what-is-linux', 'what-is-cryptography'],
  },

  // ─── DATABASE ──────────────────────────────────────────────────────
  {
    slug: 'what-is-a-database',
    topic: 'Databases',
    title: 'What is a database?',
    seoDescription: 'A database is a system for storing, organizing, and retrieving structured data — usually via SQL (for relational databases) or key/value APIs (for NoSQL).',
    quickAnswer: `A database is a program specialized in storing, organizing, and retrieving data efficiently — usually via SQL for relational databases, or key/value or document APIs for NoSQL databases.`,
    paragraphs: [
      `Relational databases (Postgres, MySQL, SQLite, SQL Server) organize data into tables of rows and columns, and let you query them with SQL. Their strength is that they enforce structure, support transactions (all-or-nothing changes), and can answer complex queries efficiently thanks to indexes and query planners built up over decades.`,
      `NoSQL databases (MongoDB, DynamoDB, Redis, Cassandra) trade some of that structure for scale, flexibility, or specific access patterns. Some are document stores, some are key/value stores, some are wide-column stores. They're valuable when your access pattern is well known and your scale is beyond what a single relational instance handles.`,
      `For most applications, the answer is: use Postgres (or SQLite for local/embedded). It gets you a lot of correctness for free. Adding a specialized database (Redis for cache, Elasticsearch for search) later, when you have specific needs, is easier than un-adopting the wrong general-purpose database.`,
    ],
    subQuestions: [
      { q: 'What is SQL?', a: `SQL (Structured Query Language) is the language used to talk to relational databases. It lets you ask for data (SELECT), change data (INSERT, UPDATE, DELETE), and define structure (CREATE TABLE, CREATE INDEX). Learn SQL well and you can work with almost any relational database — Postgres, MySQL, SQLite, and others all speak dialects of it.` },
      { q: 'What is an index?', a: `An index is a data structure the database maintains alongside a table to make specific queries fast. Instead of scanning every row to find one, the database can consult the index (usually a B-tree) and jump straight to the matching rows. The tradeoff: indexes make reads faster but writes slightly slower, and they take disk space.` },
      { q: 'What is a transaction?', a: `A transaction is a group of database operations that either all succeed or all fail — never partway. If you're transferring money from one account to another, you want both the withdrawal and the deposit to succeed, or neither. Transactions give you that guarantee even under concurrent access and mid-operation failures.` },
      { q: 'Should I use SQL or NoSQL?', a: `For most applications, SQL (specifically Postgres). It's fast, correct, mature, and flexible enough for almost anything you'll build. Reach for NoSQL when you have a specific reason: caching (Redis), wide-column at scale (Cassandra), or a document model that genuinely fits your data (MongoDB). Don't reach for it because it sounds modern.` },
    ],
    relatedAtlases: [
      { title: 'Databases atlas', path: '/atlas/db' },
      { title: 'Databases at Scale', url: 'https://db-atlas.vercel.app' },
    ],
    relatedTopics: ['backend-engineer-skills'],
  },

  // ─── AI ENGINEERING ────────────────────────────────────────────────
  {
    slug: 'what-is-ai-engineering',
    topic: 'AI engineering',
    title: 'What is AI engineering?',
    seoDescription: 'AI engineering is the discipline of building production products using large language models — prompt design, evaluation, retrieval, structured outputs, and deployment.',
    quickAnswer: `AI engineering is the discipline of building production products with large language models — prompt design, evaluation, retrieval, structured outputs, tool use, and deployment.`,
    paragraphs: [
      `AI engineering is distinct from ML engineering (which trains models) and from AI research (which invents new architectures). AI engineers use existing models — usually via APIs — and focus on the surrounding software: making the model do useful work reliably at reasonable cost.`,
      `The core activities are prompt design (getting the model to do what you want), evaluation (measuring whether it's doing it correctly), retrieval (giving the model access to the right context), structured outputs (getting parseable data back), tool use (letting the model call functions), and deployment (serving the whole system reliably).`,
      `Evaluation is the discipline that separates hobby AI projects from production ones. Every AI-powered feature needs an eval suite that catches regressions when you change prompts, models, or retrieval. Without evals you're shipping vibes.`,
    ],
    subQuestions: [
      { q: 'What is a prompt?', a: `A prompt is the input text you send to a language model. It typically includes: instructions (what to do), context (data the model needs), examples (few-shot demonstrations), and the user's actual query. How you structure this input has enormous impact on output quality — sometimes larger than switching to a bigger model.` },
      { q: 'What is RAG?', a: `RAG (Retrieval-Augmented Generation) is a pattern for grounding LLM answers in external data. Instead of relying only on what the model learned during training, you first retrieve relevant documents (often via vector search over embeddings) and include them in the prompt. This lets the model answer questions about your specific data or recent events.` },
      { q: 'What are evals?', a: `Evals are automated tests for LLM outputs. Instead of running one prompt and eyeballing the result, you run a suite of representative inputs and check the outputs against expected properties: correct answer, valid format, no forbidden content, latency under a threshold. Evals are how you know a prompt or model change is safe to deploy.` },
      { q: 'Do I need to train my own model?', a: `Almost never in 2026. Existing frontier models (Claude, GPT, Gemini, Llama variants) can solve most product needs with the right prompting and retrieval. Training your own is expensive and slow compared to the leverage you get from smart engineering around off-the-shelf models. Fine-tuning is worth considering for narrow, high-volume, latency-critical tasks.` },
    ],
    relatedAtlases: [
      { title: 'AI/LLM atlas', path: '/atlas/ai' },
      { title: 'Python atlas', path: '/atlas/python' },
    ],
    relatedTopics: ['backend-engineer-skills'],
  },

  // ─── CRYPTOGRAPHY ──────────────────────────────────────────────────
  {
    slug: 'what-is-cryptography',
    topic: 'Cryptography',
    title: 'What is cryptography?',
    seoDescription: 'Cryptography is the practice of securing information using mathematical primitives — encryption, hashing, digital signatures, and key exchange — that underpin every secure system online.',
    quickAnswer: `Cryptography is the practice of protecting information with mathematics — encryption keeps data secret, hashing verifies integrity, digital signatures prove origin, and key exchange establishes shared secrets over untrusted channels.`,
    paragraphs: [
      `Modern cryptography is built from a small set of primitives: hash functions (SHA-256), symmetric ciphers (AES), asymmetric ciphers (RSA, elliptic curves), MACs (HMAC), and key-exchange protocols (Diffie-Hellman, X25519). Every real-world security protocol — TLS, SSH, signal-style messaging, cryptocurrencies — is a specific arrangement of these primitives.`,
      `Two rules matter more than any specific algorithm. First: never invent your own crypto. Use well-analyzed libraries (libsodium, the standard library's crypto module, WebCrypto). Second: know what your primitive gives you. Hashes give integrity, not secrecy. Symmetric encryption gives secrecy, not authentication. Both together (authenticated encryption like AES-GCM) is usually what applications need.`,
      `For most developers the useful working knowledge is: what a hash function is and how it's used (integrity checks, password storage via bcrypt/argon2, content addressing), what symmetric vs asymmetric encryption means, what a digital signature is, and what TLS does. Post-quantum cryptography is on the horizon but not yet mainstream.`,
    ],
    subQuestions: [
      { q: 'What is a hash function?', a: `A hash function takes any input and produces a fixed-length output (like 256 bits for SHA-256). Good hash functions are deterministic (same input → same output), fast, and behave randomly (small input change → completely different output). They're used for integrity checks, content addressing (Git commits), and password storage (via slow hashes like bcrypt).` },
      { q: 'What is symmetric vs asymmetric encryption?', a: `Symmetric encryption uses one secret key for both encryption and decryption (AES). It's fast but requires both parties to already share the key. Asymmetric encryption uses two keys — public and private — where anyone can encrypt with the public key but only the private-key holder can decrypt (RSA, elliptic curves). Real systems use asymmetric to exchange a symmetric key, then use symmetric for the actual data because it's much faster.` },
      { q: 'What is a digital signature?', a: `A digital signature proves that a specific message was produced by someone holding a specific private key, and hasn't been tampered with since. It's the cryptographic version of "I sign this document." Signatures underlie code signing, TLS certificates, cryptocurrency transactions, and email signing.` },
      { q: 'Should I encrypt passwords?', a: `No — you should hash them, not encrypt them. Encrypted passwords can be decrypted if the key leaks. Hashed passwords cannot be reversed. Use a slow, memory-hard hash function designed for passwords (bcrypt, argon2, scrypt) — never a fast general-purpose hash like SHA-256 alone, which attackers can brute-force at billions of guesses per second.` },
    ],
    relatedAtlases: [
      { title: 'Cryptography atlas', path: '/atlas/crypto' },
      { title: 'Networking atlas', path: '/atlas/net' },
    ],
    relatedTopics: ['what-is-networking'],
  },

  // ─── COMPILER ──────────────────────────────────────────────────────
  {
    slug: 'what-is-a-compiler',
    topic: 'Compilers',
    title: 'What is a compiler?',
    seoDescription: 'A compiler is a program that translates code from one language (usually a high-level source language) into another (usually machine code or an intermediate representation).',
    quickAnswer: `A compiler is a program that translates source code from one language into another — usually a high-level language like C++ or Rust into machine code the CPU can execute directly.`,
    paragraphs: [
      `A traditional compiler has a small set of phases: lexing (turning characters into tokens), parsing (turning tokens into an abstract syntax tree), semantic analysis (type checking, name resolution), an intermediate representation (IR), optimization passes over the IR, and finally code generation (emitting the target language).`,
      `The distinction between compilers and interpreters is fuzzy in practice. Many modern language runtimes (Java's JVM, JavaScript engines) compile source to bytecode or machine code just before running it — "just-in-time" (JIT) compilation. Some languages (Python) compile to bytecode ahead of time then interpret it. The lines are blurry.`,
      `Understanding compilers changes how you write code. You start seeing why certain patterns are fast (compiler can inline, vectorize) and why others aren't (dynamic dispatch defeats optimization). It also unlocks systems-programming languages, DSLs, and tools like linters and formatters — which are all small compilers under the hood.`,
    ],
    subQuestions: [
      { q: 'What is an AST?', a: `An AST (abstract syntax tree) is the parsed tree structure of your source code. Each node represents a construct like "function call" or "if statement" or "variable declaration." Compilers, linters, formatters, and refactoring tools all operate on ASTs because they capture the code's structure without the noise of whitespace and parentheses.` },
      { q: 'What is an intermediate representation (IR)?', a: `An IR is a language sitting between the source language and the target language. Compilers translate source into IR, run optimization passes on the IR (dead code elimination, inlining, register allocation), then emit target code from the optimized IR. This makes it easier to support multiple source languages and multiple target platforms without an N×M explosion of translators.` },
      { q: 'What is JIT compilation?', a: `JIT (just-in-time) compilation compiles code while the program is running, rather than ahead of time. Modern JavaScript engines, the JVM, and Python's newer tiers all JIT hot code paths to native machine code for speed. The tradeoff: startup is slower because compilation happens at runtime, but steady-state performance can rival ahead-of-time compilation.` },
      { q: 'How does a compiler differ from an interpreter?', a: `A compiler translates code once, ahead of time, into a form the machine can execute directly. An interpreter reads source code as it runs, executing each construct as it encounters it. Compiled code is usually faster; interpreted code is usually more flexible and portable. Most modern languages blur the line with bytecode + JIT.` },
    ],
    relatedAtlases: [
      { title: 'Compilers atlas', path: '/atlas/compilers' },
      { title: 'C atlas', path: '/atlas/c' },
      { title: 'C++ atlas', path: '/atlas/cpp' },
    ],
    relatedTopics: [],
  },

  // ─── BACKEND ENGINEER SKILLS ───────────────────────────────────────
  {
    slug: 'backend-engineer-skills',
    topic: 'Backend engineering',
    title: 'What skills do backend engineers need?',
    seoDescription: 'Backend engineers need fluency in a language, databases, HTTP/APIs, Linux, Docker, version control, testing, observability, and enough distributed-systems awareness to reason about failure.',
    quickAnswer: `Backend engineers need: fluency in one programming language, working knowledge of databases and SQL, HTTP and API design, Linux command line, version control (Git), Docker/containers, testing discipline, observability, and enough distributed-systems awareness to reason about failure modes.`,
    paragraphs: [
      `The "must-have" core is smaller than most job postings suggest. If you can write correct code in a language (Python, Go, Java, Node — pick one and go deep), model data in a relational database, design a REST API, use Linux comfortably, containerize with Docker, use Git well, and write tests — you have the foundation. Everything else is a specialization.`,
      `The "makes you senior" layer is about operating what you build. Observability (logs, metrics, traces), reliability (SLOs, error budgets), security (auth, threat modeling), performance (profiling, caching), and distributed-systems reasoning (partial failure, retries, idempotency). These are what separate an engineer who ships code from one who runs production.`,
      `The "makes you stand out" layer is depth in one direction — data systems, cryptography, AI/ML, low-latency systems, compilers, security. Nobody has all of these; everyone senior has one. Pick something you find fascinating and go deeper than the tutorials.`,
    ],
    subQuestions: [
      { q: 'Which programming language should I learn first for backend?', a: `Python if you want the fastest ramp and broad applicability (AI, backend, scripting, data). Go if you want a small language optimized for backend services and are okay with typing. Java or Kotlin if you're targeting enterprise. Node.js if you're already fluent in JavaScript. Pick one and get genuinely fluent — switching later is easier than being mediocre in three.` },
      { q: 'How important is SQL for backend engineers?', a: `Very. Almost every backend eventually needs a relational database, and SQL is the language you'll talk to it in. Knowing how to write correct queries, model data cleanly, understand what an index does, and read a query plan is one of the highest-leverage skills you can have.` },
      { q: 'Do backend engineers need to know DevOps?', a: `Enough to operate what you build. That usually means: Docker for packaging, Linux for troubleshooting, basic observability for debugging, and enough about deployment to make informed choices. Full-stack DevOps is a specialization; every backend engineer should know the basics.` },
      { q: 'Do I need a CS degree to be a backend engineer?', a: `No — many working engineers are self-taught. But you'll want the CS foundations eventually: algorithms and complexity, systems thinking, data structures, networking, and enough about how computers work at the bytes level to reason about performance. Get them however you can — university, atlases, books, real projects.` },
    ],
    relatedAtlases: [
      { title: 'Databases atlas', path: '/atlas/db' },
      { title: 'Networking atlas', path: '/atlas/net' },
      { title: 'Linux atlas', path: '/atlas/linux' },
      { title: 'Docker atlas', path: '/atlas/docker' },
      { title: 'API Foundations', url: 'https://api-atlas.vercel.app' },
    ],
    relatedTopics: ['what-is-linux', 'what-is-docker', 'what-is-a-database', 'what-is-networking'],
  },
];

// Lookup helper
export const ANSWERS_BY_SLUG = Object.fromEntries(ANSWERS.map(a => [a.slug, a]));
