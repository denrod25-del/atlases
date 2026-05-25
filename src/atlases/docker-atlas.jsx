import { useState, useEffect } from 'react';
import {
  Compass, Cpu, Terminal, Zap, Layers, Network, Boxes, Hammer,
  MousePointerClick, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, Download, ArrowLeft, RotateCcw, Play, AlertTriangle,
  Sparkles, GitBranch, Database, Server, FileCode, KeyRound, Container,
  HardDrive, Package, Lock, ShieldCheck, Activity
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "What Docker actually is, and the mental model that unlocks the rest." },
  { id: 'foundation', label: 'Foundation', icon: Cpu, num: '02', sub: "Install paths — Desktop, Engine, OrbStack — and which fits which machine." },
  { id: 'cockpit', label: 'Cockpit', icon: Terminal, num: '03', sub: "The CLI is the UI. The dozen commands you'll use every day." },
  { id: 'spark', label: 'Spark', icon: Zap, num: '04', sub: "First container in 30 seconds, then a real one." },
  { id: 'images', label: 'Images', icon: Layers, num: '05', sub: "Layers, caching, Dockerfiles, and why order matters." },
  { id: 'stream', label: 'Stream', icon: Network, num: '06', sub: "Ports, volumes, networks, env vars — the runtime model." },
  { id: 'compose', label: 'Compose', icon: Boxes, num: '07', sub: "Multi-container apps in one YAML. The format you'll write most." },
  { id: 'forge', label: 'Forge', icon: Hammer, num: '08', sub: "Building images that ship — small, secure, fast." },
  { id: 'sandbox', label: 'Sandbox', icon: MousePointerClick, num: '09', sub: "Type commands in a mock terminal, see what happens." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '10', sub: "When containers misbehave, walk the decision tree." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '11', sub: "Cheatsheet, Dockerfile reference, export, review." },
];

const STACKS = [
  { id: 'dev', label: 'Local dev environments', desc: 'Run Postgres, Redis, etc. so your laptop stays clean', icon: '⌂' },
  { id: 'selfhost', label: 'Self-hosting services', desc: 'n8n, Coolify, Plausible — running other peoples\' apps', icon: '⬡' },
  { id: 'deploy', label: 'Containerizing my own apps', desc: 'Dockerfile in the repo, deploy the image', icon: '◆' },
  { id: 'ci', label: 'Build pipelines / CI', desc: 'docker build in GitHub Actions, push to a registry', icon: '⟂' },
  { id: 'mixed', label: 'A mix of everything', desc: 'Side projects + client work + experiments', icon: '◈' },
];

const GLOSSARY = {
  Image: "A read-only template containing everything needed to run an app: code, runtime, deps, config. Layered for efficiency. Built from a Dockerfile or pulled from a registry.",
  Container: "A running (or stopped) instance of an image. Isolated process with its own filesystem, network, and process tree. Cheap to start, easy to kill.",
  Layer: "A snapshot of changes from the previous layer. Each Dockerfile instruction creates a new layer. Layers are cached and shared across images.",
  Dockerfile: "Plain-text recipe for building an image. FROM, RUN, COPY, CMD, etc. Each line is a layer.",
  Daemon: "The background process (dockerd) that does the real work — manages images, containers, networks, volumes. The CLI is just a client talking to it.",
  containerd: "The lower-level runtime that actually manages container lifecycle. dockerd talks to containerd; containerd talks to runc.",
  Registry: "A server that stores and distributes images. Docker Hub is the default. ghcr.io, ECR, GCR, Quay are alternatives. Self-host with Distribution or Harbor.",
  Tag: "Version/label on an image. `nginx:1.25-alpine` — nginx is the name, 1.25-alpine is the tag. Default tag is `latest` (dangerous in prod).",
  Volume: "Persistent storage managed by Docker. Survives container removal. Two flavors: named volumes (docker manages location) and bind mounts (you specify host path).",
  "Bind mount": "Mounts a specific host path into the container. Direct file-level access from the host. Great for dev (live-reload your code), risky for prod.",
  "Named volume": "A volume Docker manages on disk under /var/lib/docker/volumes. Use these for databases — Docker handles location and permissions.",
  "Bridge network": "Default network mode. Containers on the same custom bridge can talk by name. Isolated from host network.",
  "Host network": "Container shares the host's network stack. No port mapping needed. Fast, but loses isolation. Use sparingly.",
  "Overlay network": "Multi-host network for Docker Swarm. Containers on different machines can talk as if local. Rarely needed outside Swarm/K8s.",
  ENTRYPOINT: "The command that runs when a container starts. Hard-coded — args become parameters to ENTRYPOINT. Use for the program you always run.",
  CMD: "Default arguments to ENTRYPOINT (or default command if no ENTRYPOINT). Overridable from `docker run`. Use for default options.",
  EXPOSE: "Documents which ports the container listens on. Doesn't actually publish them — you still need `-p host:container`. Mostly documentation + Compose hints.",
  ARG: "Build-time variable. Available only during `docker build`. Used for things like base image versions, build-time switches.",
  ENV: "Runtime environment variable. Set in Dockerfile or at run time with `-e`. Available to the running process.",
  "Multi-stage build": "Dockerfile with multiple FROM lines. Build in one stage, copy only what you need into the final stage. Drops build tools, slashes image size.",
  BuildKit: "Modern Docker build engine. Better caching, parallel layers, secret mounts, cache mounts. Default in recent Docker; enable with DOCKER_BUILDKIT=1 otherwise.",
  "Docker Compose": "Tool for defining and running multi-container apps via a single YAML file. `docker compose up` and your whole stack starts.",
  Healthcheck: "Periodic command Docker runs to verify a container's actually working. Container marked healthy/unhealthy. Compose's `depends_on: condition` reads this.",
  ".dockerignore": "Like .gitignore but for `docker build`. Anything matched is excluded from the build context. Critical for fast builds — don't ship node_modules.",
  distroless: "Google's minimal base images. No shell, no package manager, only your app and its runtime. Tiny + secure. Hard to debug.",
  Alpine: "Tiny Linux distro (~5MB). Popular Docker base. Uses musl libc instead of glibc — occasionally breaks binaries built against glibc.",
  slim: "Debian-based image with most packages stripped out. Bigger than Alpine but uses glibc (fewer surprises). Good default.",
  "Docker Hub": "The default public registry (docker.io). Free pulls (with rate limits for anonymous users). Hosts library/ official images.",
  ghcr: "GitHub Container Registry (ghcr.io). Free for public images. Integrates with GitHub Actions for build-and-push. Increasingly popular.",
  "Docker socket": "/var/run/docker.sock — the Unix socket the CLI uses to talk to the daemon. Mounting it into a container = giving that container root on the host. Dangerous.",
  "WSL2": "Windows Subsystem for Linux v2 — a real Linux kernel inside Windows. Docker Desktop on Windows uses WSL2 as its backend.",
  Cgroups: "Linux feature limiting how much CPU/RAM/IO a process can use. How `--memory` and `--cpus` work under the hood.",
  Namespaces: "Linux feature isolating what a process can see (PIDs, network, filesystem). The foundation of container isolation.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "What's the difference between an image and a container?",
      opts: [
        "They're the same thing",
        "Image = template (recipe + filesystem layers); container = running instance of an image",
        "Image = the source code; container = the binary"
      ],
      a: 1,
      x: "Image is the build artifact — frozen, read-only, layered. Container is what happens when you `docker run` an image. You can have many containers from the same image."
    },
    {
      qid: 'o2',
      q: "You need to run a 50GB ML training workload with GPU passthrough and weeks-long state. Docker fit?",
      opts: [
        "Perfect — Docker handles everything",
        "Workable but awkward — long-lived state + GPU isn't where Docker shines",
        "Impossible without Kubernetes"
      ],
      a: 1,
      x: "Containers are designed to be cattle, not pets. Long-lived state + GPU + huge data volumes work but you're swimming against the design. Bare metal or VMs may be simpler."
    },
  ],
  foundation: [
    {
      qid: 'f1',
      q: "You're on a fresh Ubuntu VPS. Docker Desktop or Docker Engine?",
      opts: [
        "Docker Desktop — friendlier UI",
        "Docker Engine — Desktop isn't for servers",
        "Either works"
      ],
      a: 1,
      x: "Docker Desktop is a developer tool with a GUI, designed for laptops. On a Linux server, install Docker Engine directly: that's what production runs."
    },
    {
      qid: 'f2',
      q: "What does adding your user to the `docker` group actually mean?",
      opts: [
        "Just convenience — no security impact",
        "Effectively root on the host — the docker socket controls everything",
        "Gives the user read-only access to containers"
      ],
      a: 1,
      x: "Members of the docker group can talk to the daemon, which means they can mount the host root filesystem into a container and read/write anything. Treat docker group = root."
    },
  ],
  cockpit: [
    {
      qid: 'c1',
      q: "Difference between `docker run` and `docker exec`?",
      opts: [
        "They're the same",
        "`run` starts a new container from an image; `exec` runs a command in an already-running container",
        "`run` is for prod, `exec` is for dev"
      ],
      a: 1,
      x: "`run` = brand-new container from an image. `exec` = run a process inside an existing container (the classic `docker exec -it CONTAINER bash` for a shell inside it)."
    },
    {
      qid: 'c2',
      q: "`docker system prune -a -f` — safe to run anytime?",
      opts: [
        "Yes, always",
        "Mostly yes — but it deletes stopped containers and all unused images, which can include things you want to keep stopped",
        "Never — it deletes everything"
      ],
      a: 1,
      x: "It nukes stopped containers, unused images, build cache, and unused networks. If you have stopped containers you intend to restart, they're gone. `--volumes` makes it more dangerous still."
    },
  ],
  spark: [
    {
      qid: 's1',
      q: "You run `docker run nginx` and your terminal hangs. What's happening?",
      opts: [
        "Docker is broken",
        "Nginx is running in the foreground attached to your terminal — that's normal; use -d to detach",
        "The container crashed"
      ],
      a: 1,
      x: "Without `-d`, nginx runs in the foreground and you're watching its output. Ctrl-C stops the container. Add `-d` to run detached in the background."
    },
    {
      qid: 's2',
      q: "Container exits immediately. First thing to check?",
      opts: [
        "Reboot the server",
        "`docker logs <name>` — the container's stdout/stderr has the reason",
        "Reinstall Docker"
      ],
      a: 1,
      x: "Containers exit when their main process exits. Logs always tell you why — missing env var, bad config, app crashed. Read them before guessing."
    },
  ],
  images: [
    {
      qid: 'i1',
      q: "Which Dockerfile rebuilds faster after a code change?",
      opts: [
        "A: COPY . . → RUN npm install",
        "B: COPY package*.json ./ → RUN npm install → COPY . .",
        "Both rebuild the same"
      ],
      a: 1,
      x: "B isolates dependencies in their own layer. Code changes invalidate the COPY layer but the install layer stays cached. A rebuilds deps every time code changes — minutes wasted per build."
    },
    {
      qid: 'i2',
      q: "Difference between ENTRYPOINT and CMD?",
      opts: [
        "They're aliases",
        "ENTRYPOINT is the program; CMD is the default args. Run-time args replace CMD but go through ENTRYPOINT",
        "ENTRYPOINT is for prod, CMD is for dev"
      ],
      a: 1,
      x: "ENTRYPOINT [\"nginx\"] + CMD [\"-g\", \"daemon off;\"] means the container runs `nginx -g daemon off;`. If you `docker run image -v`, you get `nginx -v`. ENTRYPOINT is fixed; CMD is replaceable args."
    },
  ],
  stream: [
    {
      qid: 'st1',
      q: "`docker run -p 8080:80 nginx` — which is host, which is container?",
      opts: [
        "8080 is container, 80 is host",
        "8080 is host (the port you visit), 80 is container (where nginx listens inside)",
        "Both are host ports"
      ],
      a: 1,
      x: "HOST:CONTAINER. Browser hits localhost:8080 → Docker routes to port 80 inside the container, where nginx listens. Easy mnemonic: 'left is what you type in your browser.'"
    },
    {
      qid: 'st2',
      q: "Container A can't reach Container B by name. Most likely cause?",
      opts: [
        "DNS is broken on the host",
        "They're not on the same custom Docker network — name-based DNS only works on user-defined networks",
        "Container B isn't running"
      ],
      a: 1,
      x: "The default `bridge` network doesn't do name resolution. Create a network (`docker network create my-net`), attach both containers, then they can reach each other by container name. Compose does this automatically."
    },
    {
      qid: 'st3',
      q: "Your Postgres container loses all data on restart. What's wrong?",
      opts: [
        "Postgres bug",
        "No volume mounted at /var/lib/postgresql/data — restart = fresh filesystem",
        "Container is corrupted"
      ],
      a: 1,
      x: "Container filesystems are ephemeral. Without `-v db-data:/var/lib/postgresql/data` (or a bind mount), every restart starts from a clean image. The volume persists data across restarts."
    },
  ],
  compose: [
    {
      qid: 'co1',
      q: "`depends_on: [db]` — does Compose wait for the DB to be ready before starting the web service?",
      opts: [
        "Yes, ready",
        "No — only started. Use depends_on.condition: service_healthy + a healthcheck on db for real readiness",
        "It waits 10 seconds then continues"
      ],
      a: 1,
      x: "Default depends_on only waits for the container to start, not for the app inside to be responsive. Postgres takes a few seconds to actually accept connections — add a healthcheck and `condition: service_healthy`."
    },
    {
      qid: 'co2',
      q: "You change one line in docker-compose.yml. Cleanest way to apply it?",
      opts: [
        "docker compose down && docker compose up -d",
        "docker compose up -d (Compose figures out what changed)",
        "Restart Docker"
      ],
      a: 1,
      x: "`up -d` is idempotent — Compose detects changed services and recreates only those. `down` is heavier (removes containers + networks) and usually overkill."
    },
  ],
  forge: [
    {
      qid: 'fo1',
      q: "What does a multi-stage build buy you?",
      opts: [
        "Faster builds",
        "Smaller final image — build tools (compilers, dev deps) live in stage 1; stage 2 copies only the artifacts",
        "Nothing significant"
      ],
      a: 1,
      x: "Stage 1: full SDK + build tools + compile. Stage 2: tiny base + just the compiled output. Final image can be 10x smaller. Less to download, less attack surface, faster pulls."
    },
    {
      qid: 'fo2',
      q: "Should containers run as root?",
      opts: [
        "Yes, easier",
        "No — root inside a container is mostly root on the host if container escapes; add a USER directive",
        "Doesn't matter"
      ],
      a: 1,
      x: "Container isolation isn't perfect. A root process in a container with the wrong mount can escalate. Always `RUN addgroup -S app && adduser -S app -G app && USER app` for prod images."
    },
  ],
  atlas: [
    {
      qid: 'a1',
      q: "Your image is 1.4GB and takes 4 minutes to deploy. Three improvements, in order?",
      opts: [
        "Multi-stage build, switch to alpine/slim base, .dockerignore aggressively",
        "Upgrade Docker, faster network, bigger VPS",
        "Use a different language"
      ],
      a: 0,
      x: "The trio: multi-stage (drop build tools), smaller base (alpine/slim/distroless), .dockerignore (don't ship node_modules + .git). Often gets a 1.4GB image to <100MB."
    },
  ],
};

const COMMANDS = [
  { cmd: 'docker run -d --name app -p 3000:3000 myimage', desc: "Run in background, name it, map a port." },
  { cmd: 'docker ps', desc: "List running containers. -a for stopped too." },
  { cmd: 'docker logs -f app', desc: "Tail logs in real time." },
  { cmd: 'docker exec -it app bash', desc: "Get a shell inside a running container." },
  { cmd: 'docker stop app && docker rm app', desc: "Stop and remove. Common combo." },
  { cmd: 'docker images', desc: "List local images." },
  { cmd: 'docker pull nginx:1.25-alpine', desc: "Pull an image from a registry." },
  { cmd: 'docker build -t myapp:latest .', desc: "Build an image from a Dockerfile in current dir." },
  { cmd: 'docker build --no-cache -t myapp .', desc: "Build ignoring layer cache (use when a base changed)." },
  { cmd: 'docker inspect app', desc: "Show every detail about a container/image as JSON." },
  { cmd: 'docker stats', desc: "Live CPU/RAM/IO per container. Like top." },
  { cmd: 'docker system prune -a -f', desc: "Reclaim disk: unused images, stopped containers, build cache." },
  { cmd: 'docker network create app-net', desc: "Create a custom bridge network for container-to-container DNS." },
  { cmd: 'docker volume create db-data', desc: "Create a named volume for persistent storage." },
  { cmd: 'docker compose up -d', desc: "Bring up the stack defined in docker-compose.yml." },
  { cmd: 'docker compose down', desc: "Stop and remove containers + networks (volumes stay)." },
  { cmd: 'docker compose down -v', desc: "Also remove named volumes (data loss — careful)." },
  { cmd: 'docker compose logs -f web', desc: "Tail logs from one service." },
  { cmd: 'docker compose exec web bash', desc: "Shell into a Compose service." },
  { cmd: 'docker login ghcr.io', desc: "Authenticate to a registry before pushing." },
  { cmd: 'docker tag myapp:latest ghcr.io/me/myapp:1.0', desc: "Re-tag for a remote registry." },
  { cmd: 'docker push ghcr.io/me/myapp:1.0', desc: "Push to the registry." },
  { cmd: 'docker save myapp:latest -o myapp.tar', desc: "Save image to a tarball for offline transfer." },
  { cmd: 'docker load -i myapp.tar', desc: "Load an image from a tarball." },
];

const LINKS = [
  { name: 'Official docs', url: 'docs.docker.com', note: 'Reference. The "Get started" tour is unusually good.' },
  { name: 'Dockerfile reference', url: 'docs.docker.com/reference/dockerfile', note: 'Bookmark this. Every instruction explained.' },
  { name: 'Compose spec', url: 'docs.docker.com/compose/compose-file', note: 'Every YAML key, every option.' },
  { name: 'Docker Hub', url: 'hub.docker.com', note: 'Default registry. Search before you build your own.' },
  { name: 'awesome-compose', url: 'github.com/docker/awesome-compose', note: 'Hundreds of working compose examples. Copy and tweak.' },
];

const PERSONALIZED = {
  dev: {
    spark: "For dev, your first container is usually a database. `docker run -d --name pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -v pgdata:/var/lib/postgresql/data postgres:16-alpine` — gives you a Postgres on localhost:5432 with persistent storage.",
    compose: "Compose your whole dev stack: app + db + cache + maybe Minio. One `docker compose up` and your laptop has the same backing services as production. Mount your code as a bind mount for live reload.",
    forge: "For dev images, optimize for rebuild speed, not size. Copy package.json and lockfile FIRST, install deps, THEN copy source. Code changes won't bust the deps layer.",
  },
  selfhost: {
    spark: "Self-host start: pick a useful service. Vaultwarden is small and obvious: `docker run -d --name vault -v vault-data:/data -p 8080:80 vaultwarden/server:latest`. Now you have a password manager you control.",
    compose: "Most self-hosted services publish a compose file you copy and tweak. READ it first — that file is the docs. Look for: env vars, volumes (where data lives), exposed ports, dependencies.",
    forge: "You mostly pull and run, not build. Your focus: volumes (data persistence), named networks (isolation between unrelated services), restart policies (`restart: unless-stopped`), and watching disk usage so layers don't fill it up.",
  },
  deploy: {
    spark: "Containerize one of your apps. Write a Dockerfile in the repo root. `docker build -t myapp .` then `docker run -p 3000:3000 myapp`. The first one always reveals what your app assumed about its environment — env vars, file paths, hostnames.",
    compose: "Compose at home doubles as your dev-prod parity. The same compose file (with different env files) works on your laptop and on a VPS. One source of truth for what your app needs.",
    forge: "Multi-stage build + slim or alpine base + non-root USER + healthcheck. That's the production checklist. Also: pin your base image (`node:20-alpine`, not `node:latest`) for reproducible builds.",
  },
  ci: {
    spark: "CI rhythm: `docker build → docker push → trigger deploy`. Get fluent in `docker build` flags first — `-t`, `--build-arg`, `--cache-from`, `--target` for multi-stage.",
    compose: "In CI, Compose is great for test dependencies. Spin up Postgres + Redis, run your test suite against them, tear down. No mocking, real DB.",
    forge: "BuildKit cache mounts are the difference between 5s and 5min builds. `RUN --mount=type=cache,target=/root/.npm npm ci`. Persist between builds via GitHub Actions cache or a remote registry cache.",
  },
  mixed: {
    spark: "Pick by today's task. One-off → `docker run`. Multiple containers → Compose. Building your own image → Dockerfile.",
    compose: "Reach for Compose the second you need two containers talking to each other. Even for a one-off, it's easier to read a compose file in a week than recall the `docker run` invocation.",
    forge: "Standard production stack: multi-stage build, slim/alpine base, non-root user, healthcheck, pinned versions, aggressive .dockerignore. Always.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's wrong?",
    opts: [
      { label: "🚀 Container won't start (or exits immediately)", next: 'run' },
      { label: "🔨 Build is failing or wrong", next: 'build' },
      { label: "🔌 Networking — containers can't connect", next: 'network' },
      { label: "💾 Volumes / data issues", next: 'volume' },
      { label: "💿 Disk is full", next: 'disk' },
      { label: "🐢 Slow / unresponsive", next: 'perf' },
    ],
  },
  run: {
    q: "Which best matches?",
    opts: [
      { label: "Port already in use error", next: 'r-port' },
      { label: "Image pull failed", next: 'r-pull' },
      { label: "Exits immediately, no obvious error", next: 'r-exit' },
      { label: "Crashes from missing env var", next: 'r-env' },
      { label: "Permission denied inside container", next: 'r-perm' },
    ],
  },
  'r-port': {
    fix: "Another process owns that host port.",
    steps: [
      "`docker ps` — see if another container has it.",
      "`sudo lsof -i :PORT` (Linux/Mac) or `netstat -ano | findstr :PORT` (Windows) to find non-Docker processes.",
      "Either stop the conflicting process or change your `-p` to a different host port. The container side stays the same.",
    ],
    cmd: "docker ps --format 'table {{.Names}}\\t{{.Ports}}'",
  },
  'r-pull': {
    fix: "Image name wrong, registry unreachable, or auth missing.",
    steps: [
      "Triple-check the image name. `library/nginx` vs `nginx` — Docker Hub allows both for official images but typos matter.",
      "Private registry? `docker login <registry>` first.",
      "Network: can you `curl https://registry-1.docker.io/v2/` from the host?",
      "Rate-limited? Docker Hub limits anonymous pulls. Log in (even free account) to multiply your limit.",
    ],
  },
  'r-exit': {
    fix: "Container's main process exited. The logs always say why.",
    steps: [
      "`docker logs <name>` — read carefully. Top to bottom.",
      "Container ran the CMD/ENTRYPOINT to completion (like `echo hello`). That's not a crash; it just finished.",
      "App crashed: stack trace will be in logs.",
      "ENTRYPOINT script failing: try `docker run --entrypoint sh image -c \"ls /\"` to inspect.",
    ],
    cmd: "docker logs <container-name>",
  },
  'r-env': {
    fix: "App needs an env var you didn't set.",
    steps: [
      "Read the image's docs for required env vars.",
      "Set with `-e KEY=value` per var, or `--env-file .env` for many.",
      "Common: DATABASE_URL, REDIS_URL, SECRET_KEY, API_KEY.",
      "Compose: under the service's `environment:` or `env_file:` key.",
    ],
  },
  'r-perm': {
    fix: "UID/GID mismatch between container user and mounted files.",
    steps: [
      "Bind mounts inherit host file ownership. Container app runs as some UID (often non-root). If your host files are owned by your UID 1000 and the container app runs as 1001, → permission denied.",
      "Quick fix (dev): run as root with `--user root`. Don't do this in prod.",
      "Real fix: build the image with a USER that matches, OR `chown` the host files to the container's UID, OR use a named volume (Docker manages perms).",
    ],
  },
  build: {
    q: "What's the build doing wrong?",
    opts: [
      { label: "A specific RUN command is failing", next: 'b-fail' },
      { label: "Build is incredibly slow", next: 'b-slow' },
      { label: "Cache invalidates on every build", next: 'b-cache' },
      { label: "Build dies with 'Killed' / OOM", next: 'b-oom' },
    ],
  },
  'b-fail': {
    fix: "Read the failing layer carefully.",
    steps: [
      "The error is usually in the line right above the 'failed to compute cache key' or 'exit code 1'.",
      "Try the command outside Docker first — `docker run -it node:20-alpine sh`, then paste the failing command. Faster to debug interactively.",
      "Common: missing system package (apk add / apt install something).",
      "Common: file path wrong in COPY — host paths are relative to the build context (`.` in `docker build .`).",
    ],
  },
  'b-slow': {
    fix: "Almost always the build context.",
    steps: [
      "Add a `.dockerignore` with `node_modules`, `.git`, `dist`, `build`, `*.log`. Don't ship gigabytes of files Docker doesn't need.",
      "Order Dockerfile layers from least-to-most-changing. Deps before code.",
      "Use BuildKit cache mounts: `RUN --mount=type=cache,target=/root/.npm npm ci` keeps the package cache between builds.",
      "Multi-stage: parallel stages build concurrently with BuildKit.",
    ],
  },
  'b-cache': {
    fix: "Layer order is wrong, or a 'COPY . .' is too high in the file.",
    steps: [
      "Copy ONLY the lockfile (package.json, requirements.txt, etc.) → install deps → THEN copy the rest of your code.",
      "Code changes shouldn't invalidate the deps layer.",
      "Watch for instructions that 'always change': timestamps, build args that vary each time, etc.",
    ],
  },
  'b-oom': {
    fix: "The machine running the build doesn't have enough RAM.",
    steps: [
      "Docker Desktop: raise memory in Settings → Resources.",
      "CI: use a bigger runner.",
      "Reduce parallelism: `docker build --parallel=2` (if using BuildKit with multiple stages).",
      "For huge node_modules / TypeScript compiles, sometimes `NODE_OPTIONS=--max-old-space-size=4096` helps.",
    ],
  },
  network: {
    q: "What's the symptom?",
    opts: [
      { label: "Can't reach container from host (curl localhost:PORT fails)", next: 'n-host' },
      { label: "Container A can't reach Container B", next: 'n-cont' },
      { label: "DNS resolution fails inside container", next: 'n-dns' },
    ],
  },
  'n-host': {
    fix: "Port mapping or listening interface.",
    steps: [
      "`docker ps` — confirm the port is mapped (e.g. `0.0.0.0:8080->80/tcp`).",
      "Did you forget `-p HOST:CONTAINER` on `docker run`?",
      "App inside container might be listening on 127.0.0.1, not 0.0.0.0 — that means it only accepts connections from inside the container. Bind it to 0.0.0.0 or to the container's IP.",
      "On Mac/Windows, `localhost` and `127.0.0.1` from the host both work. Try the host IP if not.",
    ],
  },
  'n-cont': {
    fix: "They need to be on the same custom network.",
    steps: [
      "Default `bridge` network does NOT do name-based DNS. Create a network: `docker network create app-net`.",
      "Run both containers with `--network app-net`.",
      "Now from Container A: `curl http://b:PORT` (using B's container name as hostname) works.",
      "Compose creates a network per project automatically — services reach each other by service name.",
    ],
    cmd: "docker network create app-net && docker network connect app-net <container>",
  },
  'n-dns': {
    fix: "Either no DNS server, or wrong network.",
    steps: [
      "`docker exec -it <container> cat /etc/resolv.conf` — should show working DNS (often Docker's own).",
      "On user-defined networks, Docker provides DNS for container names. On the default bridge, it doesn't.",
      "Corporate VPN/proxy interfering? Try `--dns 1.1.1.1` on `docker run` or set it in /etc/docker/daemon.json.",
    ],
  },
  volume: {
    q: "What's happening?",
    opts: [
      { label: "Data disappears on container restart", next: 'v-persist' },
      { label: "Permission denied writing to mount", next: 'v-perm' },
      { label: "Bind mount path not found", next: 'v-path' },
    ],
  },
  'v-persist': {
    fix: "No volume is mounted at the data path.",
    steps: [
      "Container filesystems are ephemeral. To persist, mount a volume at the app's data directory.",
      "Postgres: `-v db-data:/var/lib/postgresql/data`. MySQL: `-v db-data:/var/lib/mysql`. Each image's docs say where data lives.",
      "Anonymous volumes (no name, like `-v /var/lib/postgresql/data`) get deleted with `docker rm -v` or `docker compose down -v`. Use NAMED volumes for important data.",
    ],
  },
  'v-perm': {
    fix: "UID inside container doesn't own the mounted path.",
    steps: [
      "Bind mount: `chown -R 1000:1000 ./data` on the host (match the container's UID).",
      "Named volume: Docker usually handles permissions, but custom USER in your image can still mismatch. Set ownership at image-build time.",
      "Last resort: run the container as root with `--user 0` — works but loses security.",
    ],
  },
  'v-path': {
    fix: "Bind mount path doesn't exist on the host, or relative path interpreted weirdly.",
    steps: [
      "Bind mounts need absolute paths: `-v /home/user/data:/data`, not `-v ./data:/data` (unless Compose, which does resolve relative paths).",
      "Path must exist on the host BEFORE you `docker run`.",
      "Windows: convert Windows paths to Linux-style. `C:\\users\\me\\data` becomes `/c/users/me/data` (Docker Desktop) or `/mnt/c/users/me/data` (WSL).",
    ],
  },
  disk: {
    fix: "Docker eats disk via images, stopped containers, build cache, and volumes.",
    steps: [
      "`docker system df` — see what's using how much.",
      "`docker system prune -a -f` — nukes everything unused (images, stopped containers, networks, build cache). Safe-ish.",
      "Add `--volumes` to also remove unused volumes — DANGEROUS if you have orphaned named volumes you care about.",
      "Investigate: `du -sh /var/lib/docker/*` shows what dir is the culprit (overlay2 = images/containers; volumes = named volumes).",
    ],
    cmd: "docker system df && docker system prune -a -f",
  },
  perf: {
    q: "What kind of slow?",
    opts: [
      { label: "Container itself is sluggish", next: 'p-cont' },
      { label: "Docker Desktop is eating my Mac/Windows machine", next: 'p-desktop' },
      { label: "Bind mounts feel slow", next: 'p-mount' },
    ],
  },
  'p-cont': {
    fix: "Resource limits or app behavior.",
    steps: [
      "`docker stats` — confirm CPU/RAM usage. Spinning at 100%? App might be busy-looping.",
      "Set `--memory 2g --cpus 2` to test if resource pressure is the cause.",
      "Container hitting swap? Add `--memory-swap 4g` or upgrade host RAM.",
      "Sometimes the issue is the host: noisy-neighbor VPS, slow disk. `iostat -x 1` on Linux.",
    ],
  },
  'p-desktop': {
    fix: "Docker Desktop on macOS/Windows runs a Linux VM. That VM has memory.",
    steps: [
      "Settings → Resources → lower memory if you don't need 8GB allocated.",
      "Turn off features you don't use (Kubernetes, WSL integration distros).",
      "Try OrbStack (Mac) — much lighter than Docker Desktop, fully compatible.",
      "Restart Docker Desktop periodically — memory pressure builds up over long sessions.",
    ],
  },
  'p-mount': {
    fix: "Bind mounts on macOS/Windows go through a VM filesystem layer. Slow for many small files.",
    steps: [
      "Use `:cached` or `:delegated` consistency modes for performance: `-v ./code:/app:delegated`.",
      "Move node_modules / vendor dirs INTO a named volume so they don't traverse the bind mount.",
      "Or: keep your code in WSL2 (Windows) — bind mounts from WSL into Linux containers are native-speed.",
      "Or: switch to OrbStack on Mac — it's noticeably faster for bind mounts.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'cli', x: 25, y: 18, w: 100, h: 24, label: 'docker CLI', color: '#38bdf8', desc: "What you type. A thin client that talks to the daemon over a Unix socket or TCP. Can be on a different machine than the daemon (DOCKER_HOST env var)." },
  { id: 'registry', x: 275, y: 18, w: 100, h: 24, label: 'Registry', color: '#a78bfa', desc: "Where images live remotely. Docker Hub, ghcr.io, ECR, GCR, Quay, self-hosted. The daemon pulls FROM and pushes TO." },
  { id: 'daemon', x: 110, y: 95, w: 180, h: 32, label: 'Docker daemon (dockerd)', color: '#38bdf8', desc: "The brain. Receives API calls from the CLI, orchestrates containerd, manages images/networks/volumes, talks to registries. Runs as root by default — guard the socket." },
  { id: 'containerd', x: 130, y: 155, w: 140, h: 28, label: 'containerd', color: '#38bdf8', desc: "Lower-level container runtime. Manages container lifecycle: create, start, stop, snapshot. dockerd talks to it; it talks to runc to actually spawn containers." },
  { id: 'images', x: 30, y: 220, w: 100, h: 28, label: 'Images', color: '#fbbf24', desc: "Read-only layered filesystems stored on disk under /var/lib/docker. Multiple containers can run from the same image — layers are shared, not copied." },
  { id: 'containers', x: 270, y: 220, w: 100, h: 28, label: 'Containers', color: '#fbbf24', desc: "Running (or stopped) instances of images. Each gets its own writable top layer, namespace isolation, and cgroup limits. Cheap to start, cheap to throw away." },
  { id: 'networks', x: 30, y: 280, w: 100, h: 28, label: 'Networks', color: '#fbbf24', desc: "Virtual networks the daemon manages. Bridge (default), host, custom bridges, overlay (Swarm). Containers on the same custom network find each other by name." },
  { id: 'volumes', x: 270, y: 280, w: 100, h: 28, label: 'Volumes', color: '#fbbf24', desc: "Persistent storage Docker manages, OR bind mounts you point at a host path. The only way data survives container removal." },
];

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_PREFIX = 'dockeratlas:';
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

export default function DockerAtlas() {
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
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-sky-300 transition-colors">
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
      info: { border: 'border-sky-400/40', bg: 'bg-sky-400/5', text: 'text-sky-300', label: 'NOTE' },
      warn: { border: 'border-orange-400/40', bg: 'bg-orange-400/5', text: 'text-orange-300', label: 'HEADS UP' },
      tip: { border: 'border-amber-400/40', bg: 'bg-amber-400/5', text: 'text-amber-300', label: 'TIP' },
      you: { border: 'border-violet-400/40', bg: 'bg-violet-400/5', text: 'text-violet-300', label: 'FOR YOUR STACK' },
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-sky-400 border-sky-400' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-amber-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-sky-400 bg-sky-400/10 text-sky-200' :
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
        className="border-b border-dotted border-sky-400/60 text-sky-200 hover:text-sky-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-sky-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* ─── Architecture diagram ─── */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap any node
        </div>
        <svg viewBox="0 0 400 330" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="darr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          {/* Host machine boundary */}
          <rect x="15" y="75" width="370" height="240" fill="#0a0a0b" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
          <text x="25" y="92" fill="#52525b" fontSize="9" style={{ fontFamily: 'JetBrains Mono, monospace' }}>HOST · Linux kernel</text>
          {/* Lines */}
          <line x1="75" y1="42" x2="160" y2="89" stroke="#52525b" markerEnd="url(#darr)" />
          <line x1="325" y1="42" x2="280" y2="89" stroke="#52525b" markerEnd="url(#darr)" strokeDasharray="2,2" />
          <text x="220" y="65" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>pull/push</text>
          <line x1="200" y1="127" x2="200" y2="151" stroke="#52525b" markerEnd="url(#darr)" />
          <line x1="160" y1="183" x2="80" y2="216" stroke="#52525b" markerEnd="url(#darr)" />
          <line x1="240" y1="183" x2="320" y2="216" stroke="#52525b" markerEnd="url(#darr)" />
          <line x1="155" y1="119" x2="80" y2="216" stroke="#52525b" strokeDasharray="2,2" />
          <line x1="245" y1="119" x2="320" y2="280" stroke="#52525b" strokeDasharray="2,2" />
          <text x="55" y="180" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>API</text>
          {/* CLI to daemon socket label */}
          <text x="120" y="65" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>socket</text>
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
          <div className="mt-2 border border-sky-400/30 bg-sky-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-sky-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── Sandbox (mock terminal) ─── */
  const Sandbox = () => {
    const [step, setStep] = useState(0);

    const steps = [
      {
        title: "First container",
        hint: "Docker's traditional first run is `hello-world` — a tiny image whose only job is to confirm Docker works.",
        cta: "$ docker run hello-world",
        output: `Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.`,
      },
      {
        title: "Run a real container",
        hint: "Now a real one. Postgres in the background (-d), with a password, with port 5432 exposed, and persistent storage.",
        cta: "$ docker run -d --name db -e POSTGRES_PASSWORD=secret \\\n    -p 5432:5432 -v pgdata:/var/lib/postgresql/data \\\n    postgres:16-alpine",
        output: `Unable to find image 'postgres:16-alpine' locally
16-alpine: Pulling from library/postgres
...
Status: Downloaded newer image for postgres:16-alpine
b2e8a4f1c9d3a7e6f5b8c2a9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9`,
      },
      {
        title: "Inspect",
        hint: "Confirm it's running. docker ps shows running containers, their image, ports, and uptime.",
        cta: "$ docker ps",
        output: `CONTAINER ID   IMAGE                 STATUS         PORTS                    NAMES
b2e8a4f1c9d3   postgres:16-alpine   Up 8 seconds   0.0.0.0:5432->5432/tcp   db`,
      },
      {
        title: "Network for app + db",
        hint: "An app needs to reach the db. Create a custom network so they can resolve each other by name (the default bridge can't).",
        cta: "$ docker network create app-net",
        output: `c4f7a8b1d2e9c3f6a8b4d7e1c5f8a2b9d6e3f4a7b8c1d2e5f6a9b3c4d7e8f1a2`,
      },
      {
        title: "Connect the db",
        hint: "Attach the existing db container to the new network. It can already keep its other connections.",
        cta: "$ docker network connect app-net db",
        output: `(no output — silence is success)`,
      },
      {
        title: "Run the app",
        hint: "Now the app, on the same network, with DB_HOST set to the container name 'db'. Docker's internal DNS resolves it to the right container.",
        cta: "$ docker run -d --name app --network app-net \\\n    -e DB_HOST=db -e DB_PASSWORD=secret \\\n    -p 3000:3000 myapp:latest",
        output: `e9f2a1b8d4c6e3f7a5b9d2c8e4f1a6b3d7c0e2f9a8b5d4c1e6f3a7b2d9c5e8f4`,
      },
      {
        title: "Tail logs",
        hint: "See if the app connected. The app's stdout streams to docker logs.",
        cta: "$ docker logs -f app",
        output: `[app] starting up
[app] connecting to db:5432...
[app] ✓ connected to postgres
[app] server listening on :3000`,
      },
      {
        title: "Recap",
        hint: "You ran two real containers, wired them together on a custom network, and confirmed they're talking. Same pattern works for: app + Redis, n8n + Postgres, app + db + cache. The rhythm scales.",
      },
    ];

    const cur = steps[step];

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            SANDBOX · {step + 1}/{steps.length} · {cur.title}
          </div>
          <button onClick={() => setStep(0)} className="text-[11px] text-zinc-500 hover:text-sky-300 flex items-center gap-1">
            <RotateCcw size={11} /> Reset
          </button>
        </div>
        <div className="p-3">
          <div className="text-[13px] text-zinc-400 italic mb-3 leading-relaxed">{cur.hint}</div>

          {/* Mock terminal */}
          <div className="bg-black border border-zinc-800 p-3 h-72 overflow-y-auto font-mono text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {steps.slice(0, step + 1).filter(s => s.cta).map((s, i) => (
              <div key={i} className="mb-3">
                <div className="text-sky-400 whitespace-pre-wrap leading-snug">{s.cta}</div>
                {s.output && (
                  <div className="text-zinc-400 whitespace-pre-wrap leading-snug mt-1">{s.output}</div>
                )}
              </div>
            ))}
            {step === 0 && !cur.cta && (
              <div className="text-zinc-700 italic">— click below to run the first command —</div>
            )}
            <div className="text-sky-400 inline-block">$ <span className="bg-sky-400/30 inline-block w-2 h-3 align-middle animate-pulse" /></div>
          </div>

          {step < steps.length - 1 && (
            <button onClick={() => setStep(step + 1)}
              className="w-full border border-sky-400 bg-sky-400/10 text-sky-200 px-3 py-2 text-[12px] font-bold hover:bg-sky-400/20 transition-colors flex items-center justify-center gap-2 mt-3"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Play size={12} /> Run next command
            </button>
          )}

          {step === steps.length - 1 && (
            <div className="border border-sky-400/40 bg-sky-400/5 p-3 text-[13px] mt-3">
              <div className="text-sky-300 text-[10px] uppercase tracking-[0.3em] mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⧈ what you just did</div>
              <ol className="space-y-1 text-zinc-300 text-[12px] list-decimal pl-5">
                <li>Pulled and ran an image (hello-world, then postgres)</li>
                <li>Persisted data with a named volume (pgdata)</li>
                <li>Exposed a port to the host (-p 5432:5432)</li>
                <li>Created a custom network for inter-container DNS</li>
                <li>Connected two containers by name (DB_HOST=db)</li>
                <li>Tailed live logs to debug</li>
              </ol>
            </div>
          )}
        </div>
        <div className="border-t border-zinc-800 px-3 py-2 flex items-center gap-1">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 ${i <= step ? 'bg-sky-400' : 'bg-zinc-800'}`} />
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
                  <span className={i === path.length - 1 ? 'text-sky-300' : ''}>{p}</span>
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
              <div className="border-l-2 border-sky-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-sky-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-sky-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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
    let md = "# Docker Atlas — Cheatsheet\n\n";
    md += "## Install\n\n";
    md += "**Linux** (engine, for servers):\n```bash\ncurl -fsSL https://get.docker.com | sh\nsudo usermod -aG docker $USER  # log out + back in\n```\n\n";
    md += "**Mac/Windows**: Docker Desktop from docker.com — or OrbStack on Mac (faster).\n\n";
    md += "## Daily Commands\n\n";
    COMMANDS.forEach(c => { md += `**${c.desc}**\n\`\`\`\n${c.cmd}\n\`\`\`\n\n`; });
    md += "## Dockerfile reference\n\n";
    md += "```dockerfile\n";
    md += "# Build stage\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n";
    md += "# Runtime stage\nFROM node:20-alpine\nWORKDIR /app\nRUN addgroup -S app && adduser -S app -G app\nCOPY --from=builder /app/dist ./dist\nCOPY --from=builder /app/node_modules ./node_modules\nUSER app\nEXPOSE 3000\nHEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1\nCMD [\"node\", \"dist/server.js\"]\n";
    md += "```\n\n";
    md += "## Compose reference (web + db)\n\n";
    md += "```yaml\nservices:\n  web:\n    build: .\n    ports: [\"3000:3000\"]\n    environment:\n      DATABASE_URL: postgres://app:pass@db:5432/app\n    depends_on:\n      db:\n        condition: service_healthy\n    restart: unless-stopped\n\n  db:\n    image: postgres:16-alpine\n    environment:\n      POSTGRES_USER: app\n      POSTGRES_PASSWORD: pass\n      POSTGRES_DB: app\n    volumes:\n      - db-data:/var/lib/postgresql/data\n    healthcheck:\n      test: [\"CMD-SHELL\", \"pg_isready -U app\"]\n      interval: 5s\n    restart: unless-stopped\n\nvolumes:\n  db-data:\n```\n\n";
    md += "## Resources\n";
    LINKS.forEach(l => { md += `- **${l.name}** — ${l.url} · ${l.note}\n`; });
    md += "\n---\n_Generated by Docker Atlas_\n";

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'docker-atlas-cheatsheet.md'; a.click();
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
        <div className="max-w-lg w-full bg-zinc-950 border border-sky-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-sky-300" />
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
                  item.kind === 'chapter' ? 'text-sky-300' :
                  item.kind === 'term' ? 'text-amber-300' : 'text-violet-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-sky-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-sky-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-sky-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⧈ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What do you mostly use Docker for?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples adapt to your use case. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-sky-400 hover:bg-sky-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-sky-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ DEF">Docker, mental model</H2>
            <P>
              Docker is a way to package an application together with everything it needs to run — runtime, libraries, system tools, config — into a single
              <Term>Image</Term>. You then run that image as a <Term>Container</Term>: an isolated process on a host, with its own filesystem and network.
              Same image runs the same on your laptop, on a VPS, in CI, in production.
            </P>
            <ArchDiagram />
            <H2 num="◇ VS">Container vs VM</H2>
            <div className="my-4 grid grid-cols-2 gap-2 text-[13px]">
              <div className="border border-zinc-800 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>VM</div>
                <div className="text-zinc-300 text-[13px]">Virtualizes hardware. Each VM has its own kernel. Heavy: 500MB–GB per VM, slow to boot.</div>
              </div>
              <div className="border border-sky-400/40 bg-sky-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-sky-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Container</div>
                <div className="text-zinc-300 text-[13px]">Shares the host kernel. Isolates via <Term>Namespaces</Term> + <Term>Cgroups</Term>. Tiny: MBs, boots in milliseconds.</div>
              </div>
            </div>
            <H2 num="◇ WHEN">When Docker shines</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><Check size={16} className="text-sky-400 shrink-0 mt-0.5" /> Dev environments — Postgres + Redis on tap, no installing locally</li>
              <li className="flex gap-2"><Check size={16} className="text-sky-400 shrink-0 mt-0.5" /> Deploying apps to any Linux box without "works on my machine" surprises</li>
              <li className="flex gap-2"><Check size={16} className="text-sky-400 shrink-0 mt-0.5" /> Self-hosting services — n8n, Coolify, Plausible, Bitwarden</li>
              <li className="flex gap-2"><Check size={16} className="text-sky-400 shrink-0 mt-0.5" /> CI/CD — reproducible build environments</li>
              <li className="flex gap-2"><Check size={16} className="text-sky-400 shrink-0 mt-0.5" /> Microservices, multi-service apps you want to compose</li>
            </ul>
            <H2 num="◇ WHEN-NOT">When to use something else</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300">
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> Single binary CLI tools — just install them</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> GUI Linux apps — possible but awkward</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> macOS or Windows apps — Docker only runs Linux containers natively</li>
              <li className="flex gap-2"><X size={16} className="text-orange-400 shrink-0 mt-0.5" /> Extremely latency-sensitive workloads where every µs matters</li>
            </ul>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ PICK">Install path by platform</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Linux server', tool: 'Docker Engine', via: 'curl -fsSL https://get.docker.com | sh', tag: 'production' },
                { name: 'Mac (lighter)', tool: 'OrbStack', via: 'orbstack.dev', tag: 'recommended' },
                { name: 'Mac (official)', tool: 'Docker Desktop', via: 'docker.com → Download', tag: 'standard' },
                { name: 'Windows', tool: 'Docker Desktop + WSL2', via: 'docker.com → Download. Enable WSL2.', tag: 'standard' },
                { name: 'Linux desktop', tool: 'Docker Engine OR Desktop', via: 'Either works. Engine is lighter.', tag: 'choice' },
              ].map(h => (
                <div key={h.name} className="flex items-start gap-3 border border-zinc-800 px-3 py-2">
                  <Server size={14} className="text-zinc-500 mt-1 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-zinc-100 font-medium">{h.name}</span>
                      <span className="text-zinc-500 text-[11px]">→</span>
                      <span className="text-sky-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.tool}</span>
                      <span className="text-[9px] uppercase tracking-wider text-sky-300/70 border border-sky-300/30 px-1.5 py-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.tag}</span>
                    </div>
                    <div className="text-zinc-500 text-[12px] mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.via}</div>
                  </div>
                </div>
              ))}
            </div>
            <H2 num="◇ ENGINE">Linux install (servers)</H2>
            <Code id="install-engine">{`# One-line install
curl -fsSL https://get.docker.com | sh

# Add your user to the docker group (avoid sudo every command)
sudo usermod -aG docker $USER
# log out + back in for the group to take effect

# Confirm
docker run hello-world`}</Code>
            <Callout kind="warn" title="DOCKER GROUP = ROOT">
              Adding a user to the <Kbd>docker</Kbd> group is effectively granting them root on the host — they can mount the entire host filesystem into a container and modify anything.
              Treat it accordingly. Don't add untrusted users.
            </Callout>
            <H2 num="◇ SIZE">Resource expectations</H2>
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="border border-zinc-800 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Light use</div>
                <div className="text-zinc-200 text-[13px] space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <div>2 GB RAM</div>
                  <div>20 GB disk</div>
                </div>
                <div className="text-[11px] text-zinc-500 mt-2">Couple containers, dev work.</div>
              </div>
              <div className="border border-sky-400/40 bg-sky-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-sky-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Real work</div>
                <div className="text-zinc-200 text-[13px] space-y-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <div>8+ GB RAM</div>
                  <div>100+ GB SSD</div>
                </div>
                <div className="text-[11px] text-zinc-400 mt-2">Self-hosting + dev + builds.</div>
              </div>
            </div>
            <Callout kind="tip" title="DISK FILLS FAST">
              Layers, build caches, and stopped containers pile up. Plan on running <Kbd>docker system prune -a -f</Kbd> monthly. Set a calendar reminder.
            </Callout>
            <H2 num="◇ CHECK">First-run checklist</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="prep1">Docker installed; <Kbd>docker version</Kbd> shows client AND server</CheckItem>
              <CheckItem id="prep2">User in the docker group (Linux) — no sudo needed</CheckItem>
              <CheckItem id="prep3"><Kbd>docker run hello-world</Kbd> succeeds</CheckItem>
              <CheckItem id="prep4">Docker Desktop: resources tuned (4-8GB RAM, 50GB disk)</CheckItem>
              <CheckItem id="prep5">Logged in to Docker Hub (or whichever registry) — multiplies pull rate limit</CheckItem>
            </div>
            {QUIZZES.foundation.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ TWELVE">Twelve commands, 90% of the work</H2>
            <P>Docker's CLI is huge. Most days you'll touch a dozen verbs. Learn these cold; the rest you can Google.</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { cmd: 'docker run', use: 'Create + start a container from an image.' },
                { cmd: 'docker ps', use: 'List running containers (-a for stopped too).' },
                { cmd: 'docker logs', use: "Read container's stdout/stderr (-f to follow)." },
                { cmd: 'docker exec', use: 'Run a command in a running container (-it for a shell).' },
                { cmd: 'docker stop', use: 'Gracefully stop a container (SIGTERM, then SIGKILL).' },
                { cmd: 'docker rm', use: 'Delete a stopped container.' },
                { cmd: 'docker images', use: 'List local images.' },
                { cmd: 'docker pull', use: 'Download an image from a registry.' },
                { cmd: 'docker build', use: 'Build an image from a Dockerfile.' },
                { cmd: 'docker inspect', use: 'Dump everything about a container or image as JSON.' },
                { cmd: 'docker stats', use: 'Live CPU/RAM/IO per container — like top.' },
                { cmd: 'docker compose', use: 'Multi-container workflows from docker-compose.yml.' },
              ].map(c => (
                <div key={c.cmd} className="border border-zinc-800 px-3 py-2">
                  <code className="text-sky-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{c.use}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ FLAGS">Flags you'll use constantly</H2>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { f: '-d', m: 'Detached. Run in background instead of attaching to your terminal.' },
                { f: '-it', m: 'Interactive + TTY. For shells: `docker run -it ubuntu bash`.' },
                { f: '-p HOST:CONTAINER', m: "Publish port. Browser hits HOST port → routed to CONTAINER port inside." },
                { f: '-v NAME:PATH', m: 'Mount a named volume at PATH inside container.' },
                { f: '-v /host/path:/path', m: 'Bind mount a host directory into the container.' },
                { f: '-e KEY=value', m: 'Set environment variable. Repeat for multiple.' },
                { f: '--env-file .env', m: 'Load env vars from a file.' },
                { f: '--name foo', m: 'Name the container (otherwise Docker generates one).' },
                { f: '--network app-net', m: 'Attach to a custom network.' },
                { f: '--rm', m: 'Auto-delete the container when it exits. Great for one-offs.' },
                { f: '--restart unless-stopped', m: "Auto-restart if it dies. Doesn't restart if you explicitly stop it." },
              ].map(row => (
                <div key={row.f} className="border border-zinc-800 px-3 py-1.5 flex items-start gap-2">
                  <code className="text-sky-300 shrink-0 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.f}</code>
                  <span className="text-zinc-400 text-[11px]">{row.m}</span>
                </div>
              ))}
            </div>
            <H2 num="◇ DESKTOP">The Docker Desktop UI</H2>
            <P>
              If you use Docker Desktop or OrbStack, the GUI mirrors the CLI: a Containers tab (running + stopped), Images tab (local pulls), Volumes, Networks.
              Useful for: peeking at logs, opening a shell, stopping things. The CLI is faster once you're fluent.
            </P>
            {QUIZZES.cockpit.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ FIRST">First containers</H2>
            <P>The path you'll walk a thousand times. Run, inspect, stop, remove.</P>
            {stackData?.spark && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            <H2 num="◇ HELLO">Smallest possible</H2>
            <Code id="hello">docker run hello-world</Code>
            <P>Pulls the image if missing, runs it, prints a message, exits. Tests your install end-to-end.</P>
            <H2 num="◇ NGINX">Something useful</H2>
            <Code id="nginx-run">{`docker run -d --name web -p 8080:80 nginx:alpine
#       │   │      │           │
#       │   │      │           └─ host port 8080 → container port 80
#       │   │      └─ name it "web"
#       │   └─ detached (background)
#       └─ image to run`}</Code>
            <P>Now visit <Kbd>http://localhost:8080</Kbd> — nginx's default page. Container is running in the background.</P>
            <H2 num="◇ INSPECT">Peek inside</H2>
            <div className="my-4 border border-zinc-800">
              {[
                { cmd: 'docker ps', what: 'List running containers + their ports + uptime.' },
                { cmd: 'docker logs web', what: "See nginx's request logs. Add -f to tail." },
                { cmd: 'docker exec -it web sh', what: "Shell inside the container. Look around: ls, cat /etc/nginx/nginx.conf." },
                { cmd: 'docker stats', what: 'Live resource usage. Like top, but per-container.' },
                { cmd: 'docker inspect web', what: "Everything about the container as JSON — IPs, mounts, env, restart policy." },
              ].map((s, i) => (
                <div key={i} className={`p-3 ${i !== 4 ? 'border-b border-zinc-800' : ''}`}>
                  <code className="text-sky-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.cmd}</code>
                  <div className="text-zinc-400 text-[13px] mt-1">{s.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ STOP">Stop + clean up</H2>
            <Code id="cleanup">{`docker stop web   # gracefully stop
docker rm web     # delete the container
# (or combine:)
docker rm -f web  # force-stop and remove`}</Code>
            <Callout kind="tip" title="ONE-OFFS WITH --rm">
              For commands that should clean up after themselves: <Kbd>docker run --rm -it ubuntu bash</Kbd>. The <Kbd>--rm</Kbd>
              {' '}deletes the container automatically when it exits. Great for "I just need a Linux shell for a minute."
            </Callout>
            <H2 num="◇ EXIT">Why containers exit</H2>
            <P>
              A container lives only as long as its main process. <Kbd>nginx</Kbd> never exits (it serves forever), so the container stays up.
              <Kbd>echo hi</Kbd> finishes instantly, so the container dies right after. This trips up everyone once.
            </P>
            {QUIZZES.spark.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ LAYERS">How images actually work</H2>
            <P>
              An image is a stack of <Term>Layer</Term>s — read-only filesystems stacked on top of each other.
              Each line in a Dockerfile creates a new layer. When you pull <Kbd>nginx:alpine</Kbd>, you're really pulling its base layer, then its config layer, then its binary layer.
              When you run it, Docker adds a thin writable layer on top — that's your container.
            </P>
            <Callout kind="info" title="WHY THIS MATTERS">
              Two containers from the same image share all the read-only layers. Want a hundred copies of nginx?
              Disk cost: one image + a hundred tiny writable layers. Cheap.
            </Callout>
            <H2 num="◇ DOCKERFILE">The Dockerfile</H2>
            <P>A plain text recipe. Each instruction is a layer. Build with <Kbd>docker build -t myapp .</Kbd>.</P>
            <Code id="basic-dockerfile" lang="Dockerfile">{`FROM node:20-alpine
WORKDIR /app

# Install deps in a separate layer (cached)
COPY package*.json ./
RUN npm ci

# Then code
COPY . .
RUN npm run build

# Tell Docker which port the app listens on
EXPOSE 3000

# What to run when the container starts
CMD ["node", "dist/server.js"]`}</Code>
            <H2 num="◇ ORDER">Order matters for caching</H2>
            <P>
              Each Dockerfile instruction is cached. If line 5 hasn't changed, Docker reuses the cached layer from last build.
              But the moment a line DOES change, every line after it is rebuilt from scratch.
              That's why <Term>COPY package.json</Term> comes BEFORE <Term>COPY . .</Term> — dependency installation only re-runs when deps actually change.
            </P>
            <div className="my-4 grid gap-2">
              <div className="border border-orange-400/40 bg-orange-400/5 p-3 text-[13px]">
                <div className="text-orange-300 text-[10px] uppercase tracking-wider mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SLOW — rebuilds deps on every code change</div>
                <pre className="text-zinc-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{`COPY . .
RUN npm ci`}</pre>
              </div>
              <div className="border border-sky-400/40 bg-sky-400/5 p-3 text-[13px]">
                <div className="text-sky-300 text-[10px] uppercase tracking-wider mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FAST — deps cached separately</div>
                <pre className="text-zinc-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{`COPY package*.json ./
RUN npm ci
COPY . .`}</pre>
              </div>
            </div>
            <H2 num="◇ INSTR">Instructions you'll use</H2>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { i: 'FROM', m: "Base image. Always the first instruction. e.g. `FROM node:20-alpine`." },
                { i: 'WORKDIR', m: "Set the working directory. Subsequent COPY, RUN, CMD use it." },
                { i: 'COPY', m: "Copy files from host (build context) into image." },
                { i: 'RUN', m: "Execute a shell command at build time. Installs packages, runs scripts." },
                { i: 'ENV', m: "Set environment variable available at runtime." },
                { i: 'ARG', m: "Build-time variable. Pass with `--build-arg KEY=value`." },
                { i: 'EXPOSE', m: "Document a port. (Doesn't actually publish — that's `-p` at run time.)" },
                { i: 'USER', m: "Switch to a non-root user for subsequent commands + runtime." },
                { i: 'ENTRYPOINT', m: "The program. Hardcoded; args become parameters." },
                { i: 'CMD', m: "Default args to ENTRYPOINT (or default command). Replaceable at run time." },
                { i: 'HEALTHCHECK', m: "Command Docker runs periodically to check if the container is healthy." },
              ].map(row => (
                <div key={row.i} className="border border-zinc-800 px-3 py-1.5 flex items-start gap-2">
                  <code className="text-sky-300 shrink-0 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.i}</code>
                  <span className="text-zinc-400 text-[11px]">{row.m}</span>
                </div>
              ))}
            </div>
            <H2 num="◇ BUILD">Building + tagging</H2>
            <Code id="build-tag">{`# Build with a tag
docker build -t myapp:1.0 .

# Build without cache (when a base image changed)
docker build --no-cache -t myapp:1.0 .

# Tag for a registry
docker tag myapp:1.0 ghcr.io/me/myapp:1.0
docker push ghcr.io/me/myapp:1.0`}</Code>
            <Callout kind="warn" title="THE `latest` TAG IS A LIE">
              <Kbd>nginx:latest</Kbd> isn't a version. It's a moving target. Today it's 1.27, tomorrow it could be 1.28.
              Always pin in production: <Kbd>nginx:1.27-alpine</Kbd>. Reproducible builds matter.
            </Callout>
            {QUIZZES.images.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ PORTS">Publishing ports</H2>
            <P>Containers have their own network namespace. To reach a containerized app from the host, you publish ports with <Kbd>-p HOST:CONTAINER</Kbd>.</P>
            <Code id="port-example">{`docker run -d -p 8080:80 nginx
#              │
#              └─ host 8080 → container 80
#                 (browser hits localhost:8080, nginx serves it)`}</Code>
            <Callout kind="info" title="EXPOSE ≠ PUBLISH">
              <Kbd>EXPOSE 80</Kbd> in a Dockerfile is documentation. It does NOT publish the port. You still need <Kbd>-p</Kbd> at run time to reach it from outside the container.
            </Callout>
            <H2 num="◇ VOL">Volumes — the only way data survives</H2>
            <P>
              Container filesystems are ephemeral. Stop and delete a container — everything inside is gone.
              For databases, uploaded files, logs you want to keep — mount a <Term>Volume</Term> or a <Term name="Bind mount">bind mount</Term>.
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              <div className="border border-sky-400/40 bg-sky-400/5 p-3">
                <div className="text-sky-300 text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Named volume (recommended for data)</div>
                <code className="text-zinc-200 text-[12px] block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>-v db-data:/var/lib/postgresql/data</code>
                <div className="text-zinc-400 text-[12px] mt-1">Docker manages location and permissions. Survives container removal. Backed up with `docker volume`.</div>
              </div>
              <div className="border border-amber-400/40 bg-amber-400/5 p-3">
                <div className="text-amber-300 text-[10px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Bind mount (recommended for code, configs)</div>
                <code className="text-zinc-200 text-[12px] block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>-v /home/me/code:/app</code>
                <div className="text-zinc-400 text-[12px] mt-1">Points at a specific host path. Live-edits from your editor are visible inside the container. Permission gotchas on Linux.</div>
              </div>
            </div>
            <H2 num="◇ NET">Networks</H2>
            <P>
              By default, containers join the <Term name="Bridge network">bridge</Term> network — isolated from host but talkable via published ports.
              The default bridge has a quirk: <span className="text-orange-300">no name-based DNS</span> between containers.
              To make containers find each other by name, create a custom network.
            </P>
            <Code id="custom-net">{`# Create a custom network
docker network create app-net

# Run containers on it
docker run -d --name db --network app-net -e POSTGRES_PASSWORD=x postgres:16
docker run -d --name web --network app-net -p 3000:3000 \\
    -e DATABASE_URL=postgresql://postgres:x@db:5432/postgres \\
    myapp

# 'db' resolves inside the web container — Docker provides DNS`}</Code>
            <H2 num="◇ ENV">Environment variables</H2>
            <P>The standard way apps get config in containers. Don't hardcode.</P>
            <Code id="env-example">{`# One at a time
docker run -e NODE_ENV=production -e PORT=3000 myapp

# From a file
docker run --env-file .env myapp

# .env file:
# NODE_ENV=production
# DATABASE_URL=postgres://...
# REDIS_URL=redis://...`}</Code>
            <Callout kind="warn" title="SECRETS IN ENV VARS">
              Anyone with <Kbd>docker inspect</Kbd> on the host can read env vars in plain text.
              For real secrets in production: Docker Secrets (Swarm), or external secret manager (HashiCorp Vault, AWS Secrets Manager), or at minimum a separately-managed <Kbd>.env</Kbd> file with strict permissions.
            </Callout>
            <H2 num="◇ LIMITS">Resource limits</H2>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { f: '--memory 512m', m: 'Hard memory cap. App OOM-killed if it exceeds.' },
                { f: '--cpus 1.5', m: 'CPU cap as fraction of cores.' },
                { f: '--restart unless-stopped', m: "Restart on crash. Doesn't restart if YOU stopped it." },
                { f: '--restart on-failure:3', m: 'Restart up to 3 times if it exits with non-zero status.' },
                { f: '--read-only', m: 'Filesystem is read-only — security hardening for prod.' },
              ].map(r => (
                <div key={r.f} className="border border-zinc-800 px-3 py-1.5">
                  <code className="text-sky-300 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.f}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{r.m}</div>
                </div>
              ))}
            </div>
            {QUIZZES.stream.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ WHY">Why Compose</H2>
            <P>
              A real app is rarely one container. It's an app + a database + maybe a cache + maybe a worker.
              You could string together five <Kbd>docker run</Kbd> commands with the right networks and volumes, but that's painful — and unreadable a week later.
            </P>
            <P>
              <Term name="Docker Compose">Compose</Term> lets you describe the whole stack in one YAML file. <Kbd>docker compose up -d</Kbd> brings it all up. <Kbd>docker compose down</Kbd> tears it down.
              You'll write more Compose files than Dockerfiles.
            </P>
            {stackData?.compose && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.compose}</Callout>}
            <H2 num="◇ EX">A real compose.yml</H2>
            <Code id="compose-yml" lang="docker-compose.yml">{`services:
  web:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://app:pass@db:5432/app
      REDIS_URL: redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app"]
      interval: 5s
      timeout: 3s
      retries: 5
    restart: unless-stopped

  cache:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  db-data:`}</Code>
            <H2 num="◇ KEYS">What each part does</H2>
            <ul className="space-y-2 text-[14px] text-zinc-300 my-3">
              <li className="flex gap-2"><Check size={14} className="text-sky-400 shrink-0 mt-1" /><span><span className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>services:</span> top-level. Each entry is a container.</span></li>
              <li className="flex gap-2"><Check size={14} className="text-sky-400 shrink-0 mt-1" /><span><span className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>build: .</span> build from Dockerfile in current dir. Alternative: <Kbd>image: nginx:alpine</Kbd>.</span></li>
              <li className="flex gap-2"><Check size={14} className="text-sky-400 shrink-0 mt-1" /><span><span className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>depends_on:</span> startup order. With <Kbd>condition: service_healthy</Kbd>, waits for the <Term>Healthcheck</Term> to pass.</span></li>
              <li className="flex gap-2"><Check size={14} className="text-sky-400 shrink-0 mt-1" /><span><span className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>healthcheck:</span> the command Docker runs to verify health. Critical for proper startup ordering.</span></li>
              <li className="flex gap-2"><Check size={14} className="text-sky-400 shrink-0 mt-1" /><span><span className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>volumes:</span> named volumes declared at the bottom. Used by services via <Kbd>db-data:/path</Kbd>.</span></li>
              <li className="flex gap-2"><Check size={14} className="text-sky-400 shrink-0 mt-1" /><span><span className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>restart:</span> policy if the container dies. <Kbd>unless-stopped</Kbd> is the production default.</span></li>
            </ul>
            <H2 num="◇ DNS">Free DNS between services</H2>
            <P>
              Compose creates a network per project automatically. Every service is reachable by its service name as a hostname.
              In the YAML above, the web service reaches Postgres at <Kbd>db:5432</Kbd> — not <Kbd>localhost</Kbd>, not <Kbd>127.0.0.1</Kbd>, just <Kbd>db</Kbd>.
            </P>
            <H2 num="◇ DAILY">Daily Compose commands</H2>
            <Code id="compose-daily">{`docker compose up -d              # bring up the stack
docker compose ps                  # status of each service
docker compose logs -f web         # tail logs for one service
docker compose exec web bash       # shell into a service
docker compose restart web         # restart one service
docker compose down                # stop + remove containers + networks
docker compose down -v             # also remove named volumes (DATA LOSS)
docker compose build               # rebuild images (without starting)
docker compose pull                # pull latest images for services using image:`}</Code>
            <Callout kind="tip" title="OVERRIDE FILES">
              Default file: <Kbd>compose.yml</Kbd> (new name) or <Kbd>docker-compose.yml</Kbd> (old). Compose also auto-loads <Kbd>compose.override.yml</Kbd> on top.
              Pattern: base config in <Kbd>compose.yml</Kbd>, dev tweaks in <Kbd>compose.override.yml</Kbd>, prod tweaks in <Kbd>compose.prod.yml</Kbd>{' '}
              loaded with <Kbd>-f compose.yml -f compose.prod.yml</Kbd>.
            </Callout>
            {QUIZZES.compose.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ MULTI">Multi-stage builds</H2>
            <P>
              The biggest single improvement to your images. Build in stage 1 with all the heavy tooling.
              Copy only the artifacts into stage 2 with a tiny runtime base. Final image is 5-20× smaller.
            </P>
            {stackData?.forge && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.forge}</Callout>}
            <Code id="multistage" lang="Dockerfile">{`# ─── Stage 1: build ────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ─── Stage 2: runtime ──────────────────────────
FROM node:20-alpine
WORKDIR /app

# Non-root user
RUN addgroup -S app && adduser -S app -G app

# Copy ONLY what's needed at runtime
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \\
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]`}</Code>
            <H2 num="◇ BASE">Picking a base image</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'node:20-alpine', size: '~50MB', notes: 'Smallest. musl libc — occasional native-binary surprises.' },
                { name: 'node:20-slim', size: '~80MB', notes: 'Debian-based. glibc. Boring + reliable. Good default.' },
                { name: 'node:20', size: '~400MB', notes: 'Full Debian. Includes git, build tools. Almost never needed in runtime.' },
                { name: 'gcr.io/distroless/nodejs20', size: '~80MB', notes: 'No shell, no package manager. Most secure. Hardest to debug.' },
              ].map(b => (
                <div key={b.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sky-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{b.name}</code>
                    <span className="text-amber-300 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{b.size}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{b.notes}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ IGNORE">The .dockerignore file</H2>
            <P>
              Like .gitignore but for the build. Every file in your project directory is sent to the daemon as the build context — including <Kbd>node_modules</Kbd>,{' '}
              <Kbd>.git</Kbd>, and your editor backup files. That's slow and wasteful.
            </P>
            <Code id="dockerignore" lang=".dockerignore">{`node_modules
.git
.gitignore
.env
.env.*
dist
build
*.log
.DS_Store
.vscode
.idea
README.md
docker-compose*.yml
Dockerfile`}</Code>
            <H2 num="◇ SEC">Security checklist</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="sec1">Multi-stage build — no build tools in the final image</CheckItem>
              <CheckItem id="sec2">Non-root <Kbd>USER</Kbd> in the Dockerfile</CheckItem>
              <CheckItem id="sec3">Pinned base image version (not <Kbd>:latest</Kbd>)</CheckItem>
              <CheckItem id="sec4">Aggressive .dockerignore — no secrets, no <Kbd>node_modules</Kbd>, no <Kbd>.git</Kbd></CheckItem>
              <CheckItem id="sec5">No secrets baked into the image (use env vars or build secrets)</CheckItem>
              <CheckItem id="sec6">Healthcheck defined so orchestrators know if it's alive</CheckItem>
              <CheckItem id="sec7">Scanned for known CVEs (Trivy, Snyk, Docker Scout)</CheckItem>
              <CheckItem id="sec8">Image signed (cosign) if going to production at scale</CheckItem>
            </div>
            <H2 num="◇ REG">Registries</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Docker Hub', notes: 'Default. Free pulls (with rate limits). Free private repos limited.' },
                { name: 'ghcr.io', notes: 'GitHub Container Registry. Free for public. Integrates with GitHub Actions.' },
                { name: 'AWS ECR / Google Artifact Registry', notes: 'If you live in their cloud. Paid, integrated with IAM.' },
                { name: 'Self-hosted (Distribution, Harbor)', notes: 'Own your registry. More work but full control.' },
              ].map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-zinc-100 text-[13px]">{r.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{r.notes}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ ARCH">Multi-arch builds</H2>
            <P>
              Running on Apple Silicon dev + Linux x86 prod? Build for both with Buildx and a multi-platform manifest.
              Without this, your laptop builds ARM64 images that fail in cloud x86 environments.
            </P>
            <Code id="buildx">{`docker buildx create --use --name multiarch

docker buildx build --platform linux/amd64,linux/arm64 \\
    -t ghcr.io/me/app:1.0 \\
    --push \\
    .`}</Code>
            {QUIZZES.forge.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ HANDS">Type your way through it</H2>
            <P>
              You've read the theory. Now type. This sandbox steps through running a real two-container app in a mock terminal — same rhythm you'll use for every Docker workflow.
            </P>
            <Sandbox />
            <Callout kind="tip" title="WHY THIS PATTERN">
              The exact six steps you just walked — pull, run with volume + ports, custom network, connect containers by name, tail logs — are the foundation of every multi-container app.
              Add Compose, and you write the same intent declaratively. Same shape, smaller code.
            </Callout>
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ TRIAGE">When containers misbehave</H2>
            <P>Walk the tree. Tap the symptom closest to what you're seeing. Leaf nodes have the fix.</P>
            <Troubleshooter />
            <Callout kind="info" title="BOOKMARK THIS">
              Most Docker pain fits one of these patterns. Coming back here beats searching cryptic error messages at 11pm.
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
              <div className="border border-sky-400/40 bg-sky-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Correct</div>
                <div className="text-3xl text-sky-200 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{totalCorrect}</div>
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
                  className="w-full border border-amber-400/50 bg-amber-400/5 text-amber-200 px-3 py-2 text-[13px] mb-2 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <RotateCcw size={13} /> {reviewMode ? 'Hide' : 'Review'} missed questions ({missed.length})
                </button>
                {reviewMode && (
                  <div className="mb-4">
                    {missed.map(q => (
                      <div key={q.qid} className="border border-amber-400/30 bg-amber-400/5 p-3 mb-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>RETRY · {q.qid}</div>
                        <button onClick={() => setQuizState(prev => { const n = { ...prev }; delete n[q.qid]; return n; })}
                          className="text-[11px] text-amber-300 hover:text-amber-100 underline">
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
                className="flex items-center justify-center gap-2 border border-sky-400/40 bg-sky-400/5 hover:bg-sky-400/10 text-sky-200 px-3 py-2.5 text-[13px] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Download size={14} /> Download .md
              </button>
              <button onClick={copyAllCommands}
                className="flex items-center justify-center gap-2 border border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/10 text-amber-200 px-3 py-2.5 text-[13px] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'Copied' : 'Copy all commands'}
              </button>
            </div>

            <H2 num="◇ DOCKER">Dockerfile template</H2>
            <Code id="ref-dockerfile" lang="Dockerfile">{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/server.js"]`}</Code>

            <H2 num="◇ CMD">Command cheatsheet</H2>
            <div className="space-y-2 my-3 text-[13px]">
              {COMMANDS.map((r, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 group">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-sky-300 text-[12px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.cmd}</code>
                    <button onClick={() => copy(r.cmd, `c${i}`)} className="text-zinc-600 hover:text-sky-300 shrink-0">
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
                    <Sparkles size={12} className="text-amber-300" />
                    <span className="text-zinc-100">{l.name}</span>
                    <span className="text-zinc-500 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{l.url}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{l.note}</div>
                </div>
              ))}
            </div>

            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}

            <div className="my-6 border border-sky-400/40 bg-sky-400/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-sky-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ⧈ Atlas complete
              </div>
              <div className="text-zinc-200 text-[14px]">
                You know enough to containerize an app, compose a stack, and debug at 2am.
                The rest is reps. Go ship something.
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
        <div className="text-sky-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ⧈ LOADING ATLAS
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
                <span className="text-[14px] text-sky-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⧈</span>
                <h1 className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  DOCKER <span className="text-sky-400">ATLAS</span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {stack && (
                  <button onClick={() => setShowOnboarding(true)}
                    className="text-[10px] tracking-[0.2em] text-zinc-500 hover:text-sky-300 border border-zinc-800 hover:border-sky-400/40 px-2 py-1 transition-colors uppercase"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {STACKS.find(s => s.id === stack)?.icon} {stack}
                  </button>
                )}
                <button onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-1 text-[10px] tracking-[0.2em] text-zinc-500 hover:text-sky-300 border border-zinc-800 hover:border-sky-400/40 px-2 py-1 transition-colors"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <Search size={11} /> ⌘K
                </button>
                <span className="text-[10px] tracking-[0.25em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {progress}%
                </span>
              </div>
            </div>
            <div className="h-0.5 bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-amber-400 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                    active ? 'border-sky-400 text-sky-200 bg-sky-400/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="text-[10px] text-zinc-500">{s.num}</span>
                  <Ic size={13} />
                  <span>{s.label}</span>
                  {done && <Check size={11} className="text-sky-400" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 border border-sky-400/50 bg-sky-400/5 flex items-center justify-center">
              <Icon size={18} className="text-sky-300" />
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
                completed.has(activeSection) ? 'border-sky-400 bg-sky-400/10 text-sky-300'
                : 'border-amber-400/50 bg-amber-400/5 text-amber-200 hover:bg-amber-400/10'
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
