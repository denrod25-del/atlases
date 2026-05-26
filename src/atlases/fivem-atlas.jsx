import { useState, useEffect, useRef } from 'react';
import {
  Compass, Cpu, GitBranch, Layers, Boxes, Zap, Wrench, BookOpen, Check,
  ChevronRight, ChevronLeft, Copy, X, Search, RotateCcw, Play, ArrowLeft,
  Quote, MousePointerClick, Loader2, Library, AlertTriangle, XCircle,
  Code as CodeIcon, MessageSquare, FileText, Target, Database, Gamepad2
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   FIVEM / LUA / QBCORE ATLAS · DATA
   Tier: NASA-light (educational frontend, production-deployed)
   Invariants: bounded loops in Lua sandbox, validated inputs at
   every boundary, no silent catches, short functions.
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "FiveM history, CFX.re, Rockstar acquisition, QBCore -> QBox split, May 2026 state." },
  { id: 'architecture', label: 'Architecture', icon: Layers, num: '02', sub: "Server/client split, resources, the security boundary, OneSync, sessionhost." },
  { id: 'lua', label: 'Lua', icon: CodeIcon, num: '03', sub: "Syntax, tables, metatables, coroutines (Citizen.Wait), FiveM-specific Lua patterns." },
  { id: 'events', label: 'Events', icon: MessageSquare, num: '04', sub: "RegisterNetEvent, TriggerServerEvent, TriggerClientEvent. Server-authority pattern." },
  { id: 'resources', label: 'Resources', icon: Boxes, num: '05', sub: "fxmanifest.lua, dependencies, exports, scripts vs files vs UI. The unit of code." },
  { id: 'database', label: 'Database', icon: Database, num: '06', sub: "oxmysql, query patterns, schemas, async, prepared statements. Why most timeouts live here." },
  { id: 'framework', label: 'QBCore / QBox', icon: GitBranch, num: '07', sub: "Player object, jobs, money, inventory, callbacks. QBCore reality + QBox migration path." },
  { id: 'nui', label: 'NUI', icon: Target, num: '08', sub: "CEF-based UI overlays. HTML/CSS/JS bridge to Lua. SendNUIMessage and RegisterNUICallback." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Production patterns: events, exports, db queries, NUI bridges, performance, security." },
  { id: 'sandbox', label: 'Sandbox', icon: Gamepad2, num: '10', sub: "Live Lua interpreter + event flow simulator + fxmanifest builder. Three real tools." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Client timeouts, resource crashes, sync issues, db blocking, security holes. The pain triage." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "Docs, repos, Discord servers, learning path. The community map." },
];

const STACKS = [
  { id: 'server', label: 'Server scripter', desc: 'Server-side Lua — game logic, database, validation', icon: '⊟' },
  { id: 'client', label: 'Client scripter', desc: 'Client-side Lua + NUI — UI, feel, integrations with the game', icon: '⊞' },
  { id: 'owner', label: 'Server owner / admin', desc: 'Operating a server — less code, more deployment, monitoring, troubleshooting', icon: '◧' },
  { id: 'new', label: 'New to FiveM', desc: 'Foundations — what FiveM is, how Lua works, how to start', icon: '✦' },
  { id: 'migrate', label: 'QBCore -> QBox migrator', desc: 'Moving an existing QBCore server to the modern QBox framework', icon: '⇌' },
];

const GLOSSARY = {
  FiveM: "Multiplayer modification for Grand Theft Auto V. Connects players to community-run servers running custom code (resources). Owned by Rockstar/Take-Two since August 2023, but development continues largely as before under the CFX.re brand. The platform underneath every GTA V roleplay server.",
  "CFX.re": "Cfx.re is the brand and infrastructure behind FiveM (and RedM for RDR2). Provides the platform, runs the master server list, and develops the core technology. Owned by Rockstar since 2023.",
  Lua: "Scripting language used by FiveM (server and client). Lua 5.4 (since FiveM moved off LuaJIT and Lua 5.3). Lightweight, embeddable, dynamically typed. Tables are the only compound data structure. Coroutines power async patterns.",
  Resource: "The unit of code organization in FiveM. A folder containing fxmanifest.lua plus scripts, files, UI. Started/stopped independently. Loaded into the runtime via server.cfg or txAdmin. Everything in FiveM is a resource — even the framework.",
  "fxmanifest.lua": "Required file in every resource. Declares the resource's game (gta5), fx_version, scripts (server_scripts / client_scripts / shared_scripts), files (assets accessible via NUI), dependencies, version, author. The descriptor that tells FiveM how to load the resource.",
  Citizen: "FiveM's runtime namespace. Citizen.CreateThread (async execution), Citizen.Wait (yield), Citizen.SetTimeout (delayed exec). The bridge between Lua and the FiveM scheduler. In modern code, often replaced by CreateThread, Wait (shorter aliases).",
  Coroutine: "Lua's cooperative multitasking primitive. FiveM uses coroutines for async patterns — Citizen.Wait yields the current thread, the scheduler resumes it later. Why you can't just sleep(1000) — you'd block the entire resource.",
  "RegisterNetEvent": "Server or client function that declares an event name as receivable over the network. Required before AddEventHandler for network events — unregistered events are silently dropped (a frequent debugging trap).",
  "AddEventHandler": "Attach a handler function to an event name (local or network). Multiple handlers can attach to the same event. Handlers run in the order they were registered.",
  "TriggerServerEvent": "Called from the client. Fires an event on the server. The server-side handler receives source as a special variable — the player ID who triggered. Critical: source is implicit, not a parameter.",
  "TriggerClientEvent": "Called from the server. Fires an event on one or all clients. First argument: target (-1 = all clients, or a specific player ID). Then event name, then arguments.",
  "Server-authority": "The fundamental security pattern. Never trust the client. Any client can fake any event payload. Validate everything server-side: prices, distances, ownership, permissions. Most FiveM exploits come from servers trusting client data.",
  source: "Special variable inside server-side event handlers. Contains the player ID (number) of the player who triggered the event. NEVER pass source from a TriggerServerEvent arg — clients can fake it.",
  OneSync: "FiveM's state synchronization system for servers above ~32 players. Replaces the legacy 'OneSync legacy' with a server-authoritative entity model. Pretty much required for any modern RP server. OneSync Plus supports up to 1024 players.",
  "OneSync Plus": "Premium tier of OneSync. Allows player counts up to 1024 on a single server. Increases entity replication budget. Most RP servers above 64 players run on it.",
  Resource: "The unit of code organization in FiveM. A folder containing fxmanifest.lua plus scripts. Loaded via server.cfg. Started/stopped independently. start, stop, restart, refresh commands.",
  Export: "Mechanism to expose Lua functions from one resource to another. exports['my_resource']:my_function(args). Works server-to-server and client-to-client. Cross-side (server calling client export) is NOT possible — use events for that.",
  "Server convars": "Server configuration variables set in server.cfg or via console. set sv_hostname, set sv_maxclients, etc. The configuration layer for the server.",
  txAdmin: "Web-based admin panel and process manager for FiveM servers. Default management interface in 2026. Handles server start/stop/restart, log viewing, player management, resource management, and console access via a browser UI.",
  oxmysql: "MySQL/MariaDB connector for FiveM. The standard database driver in 2026 (succeeded mysql-async). Async by default. Parameterized queries. Bundled with QBox; widely used with QBCore.",
  "Parameterized query": "SQL query where values are placeholders (?) and passed separately. oxmysql:execute('SELECT * FROM users WHERE id = ?', { userId }). Prevents SQL injection. Always use these — never concatenate user input into queries.",
  QBCore: "Roleplay framework for FiveM, launched ~2020. Built on Lua, provides player object, jobs, money, inventory, vehicles, callbacks. Was the dominant RP framework 2021-2024. Development largely stalled by 2025; community maintenance only. Still has the biggest script ecosystem.",
  QBox: "Modern fork of QBCore (qbox-project / qbx_core). Actively maintained by former QBCore contributors. Built around the ox_ ecosystem. Lua 5.4. Strict server-authority. Backwards-compatible with most QBCore resources. The 2026 recommendation for new servers.",
  ESX: "Older roleplay framework (es_extended), launched ~2017. Mature, battle-tested, huge script library. Still active. Different player object structure than QBCore/QBox — scripts must target one or the other (or both via wrappers).",
  "qbx_core": "QBox's core resource. Replaces qb-core. Provides the Player object, money, jobs, gangs, inventory wrappers, metadata. The framework heart.",
  "ox_lib": "Utility library from the overextended team. UI primitives (menus, dialogs, input forms), caching, callbacks, math helpers, server-authority helpers. Bundled with QBox; usable standalone.",
  "ox_inventory": "Modern inventory system. Weight-based, slot-based, supports multiple inventory types (player, vehicle, stash, drops). Standard in QBox; works with QBCore via bridge.",
  "ox_target": "Targeting/interaction system. Eye/cursor-based interactions with entities (players, vehicles, peds, props). The 2026 standard for context interactions (E-to-do-X menus).",
  "Player object": "Framework's representation of an online player. Contains identifier, character data, money, job, inventory wrappers, metadata. QBCore: QBCore.Functions.GetPlayer(source). QBox: exports.qbx_core:GetPlayer(source). The handle for all per-player logic.",
  Citizen_CreateThread: "Start an async coroutine. CreateThread(function() ... end). Runs concurrently with other threads. Use Wait(ms) inside to yield. The basic concurrency primitive in FiveM Lua.",
  Citizen_Wait: "Yield current thread for N milliseconds. Wait(0) = next frame (smallest yield). Wait(1000) = 1 second. Required inside while-loops or you'll block the entire resource thread.",
  NUI: "New User Interface. FiveM's CEF-based (Chromium Embedded Framework) UI system. Resources can have an html/index.html that renders as an in-game overlay. Communicate with Lua via SendNUIMessage (Lua -> JS) and fetch() to https://resource-name/callback (JS -> Lua).",
  SendNUIMessage: "Lua function to send data to the NUI JavaScript side. Receives in JS via window.addEventListener('message', e => { const data = e.data; ... }).",
  RegisterNUICallback: "Register a Lua handler for incoming HTTP-style POST requests from the NUI JS side. JS calls fetch(`https://${GetParentResourceName()}/callback`, { method: 'POST', body: ... }) -> Lua handler fires.",
  "GetParentResourceName": "JS-side function (available inside NUI) that returns the name of the Lua resource owning the NUI. Used to construct callback URLs.",
  "SetNuiFocus": "Lua function to give the NUI keyboard/mouse focus. SetNuiFocus(true, true) = both. Required for typing in NUI inputs. Always SetNuiFocus(false, false) when closing the UI — common bug source.",
  "Network ID": "Integer ID for a networked entity (vehicle, ped, object). Use NetworkGetNetworkIdFromEntity(entity) to get it, NetworkGetEntityFromNetworkId(netId) to look it up. The way to refer to entities across the network.",
  "Client tick": "Each frame, FiveM runs the client's main thread once. If a resource blocks this thread (long while loop without Wait), the entire client freezes — and after ~5 seconds, the client times out. The #1 cause of timeouts.",
  "Resource monitor": "Built-in tool (resmon command) to see CPU/memory usage per resource. Resmon 1 in F8 console shows live resource performance. Anything sustained above 0.5ms client-side or 2ms server-side is suspect.",
  "Player slot": "Internal index in the server's player array (1-1024 typically). Distinct from player identifier (Steam/license/etc) which persists across sessions. Use source for the slot; identifiers for persistent data.",
  "License identifier": "Persistent player ID, from Rockstar's online services. license:abcd1234... format. The standard primary key for player data in QBCore/QBox. Works even when Steam not present.",
  Cache: "Server-side per-player cache, often via ox_lib's cache or framework-specific cache wrappers. Avoid re-querying the database for the same value many times per second.",
  "Server cfg": "server.cfg. The server's configuration file. Loaded at startup. Sets convars, declares ensured resources, sets endpoints, hostname, max clients, license key. Edited via VPS or txAdmin.",
  "Ensured resource": "Resource declared with 'ensure my_resource' in server.cfg. Always starts on server boot. The standard way to declare resources you want running.",
  Anti_cheat: "Anti-cheat layer. EAC (Easy Anti-Cheat) is built into FiveM client. Server-side anti-cheats: badger_anticheat, fivem_anticheats, custom. Detects common exploits — money duplication, position teleporting, fly hacks, weapon spawning.",
  CCU: "Concurrent Connected Users. Server's current player count. Capacity limits: 32 (basic), 64 (most setups), 128 (OneSync), 1024 (OneSync Plus). Performance degrades nonlinearly above ~100 players on commodity VPS.",
  "Zap-Hosting": "Common FiveM server host. Pre-configured templates for FiveM servers. Web panel + game-panel integration. Used by many small-to-mid RP servers. Alternative: self-host on a VPS (DigitalOcean, Hetzner, OVH).",
  KVP: "Key-Value Pair storage. SetResourceKvp, GetResourceKvp. FiveM's built-in lightweight persistent storage per-resource. Useful for small config; use a database for player data.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "Who owns FiveM in 2026?",
      opts: [
        "An anonymous Discord cabal",
        "Rockstar Games / Take-Two — acquired CFX.re in August 2023. Development continues under the CFX.re brand with most of the original team. The acquisition formalized what had been a tolerated mod.",
        "Nobody — it's open source"
      ],
      a: 1,
      x: "The 2023 acquisition was a huge moment. Before: FiveM existed in legal gray area, occasional cease-and-desist worries. After: official endorsement, full-time staff, longer-term stability. The platform got safer to invest in. CFX.re still operates the master server list, develops the core tech, runs the keymaster system."
    },
    {
      qid: 'o2',
      q: "What's the QBCore vs QBox situation in 2026?",
      opts: [
        "Same thing",
        "QBCore is the older framework (~2020) — huge script ecosystem but development largely stalled. QBox is the community-driven successor (qbox-project, qbx_core), built on ox_lib + ox_inventory + oxmysql, Lua 5.4, mostly backwards compatible. May 2026 recommendation: QBox for new servers.",
        "QBox is dead"
      ],
      a: 1,
      x: "QBox was forked by former QBCore contributors who wanted to address performance, security, and code quality issues that had accumulated. The qbx_core is the new heart, but heavy lifting is delegated to focused libraries (ox_lib, ox_inventory, oxmysql, ox_target). Modular design. Most QBCore scripts run on QBox with minor configuration changes."
    },
    {
      qid: 'o3',
      q: "Why does the server/client split matter so much?",
      opts: [
        "Performance",
        "It's the SECURITY boundary. Clients can be modified by anyone — never trust their data. All authoritative game logic (money, inventory, positions, permissions) must run server-side. Client code is for UX (UI, feel, smooth interaction) only.",
        "It's tradition"
      ],
      a: 1,
      x: "The single most important concept in FiveM development. Every cheat exploits a server that trusts client data. 'TriggerServerEvent(give_money, 9999999)' works if the server doesn't validate. Server-authority means: server has the truth, client suggests, server validates. The Library has hardening patterns."
    },
  ],
  architecture: [
    {
      qid: 'ar1',
      q: "What's the relationship between resources, scripts, and the manifest?",
      opts: [
        "They're unrelated",
        "Resource = folder with fxmanifest.lua. The manifest lists which Lua files run server-side (server_scripts), client-side (client_scripts), or both (shared_scripts). Plus 'files' for NUI assets, dependencies on other resources, version metadata.",
        "Same thing"
      ],
      a: 1,
      x: "fxmanifest.lua is the descriptor. Without it, FiveM doesn't know what to load. server_scripts (paths to .lua files) get loaded into the server runtime; client_scripts into each client; shared_scripts into both. files (with wildcards like 'html/**/*') become accessible to NUI. The sandbox has a working fxmanifest builder."
    },
    {
      qid: 'ar2',
      q: "When do you need OneSync?",
      opts: [
        "Never",
        "Any server with more than 32 concurrent players. OneSync = server-authoritative entity sync. Below 32, legacy peer-to-peer sync works. OneSync Plus extends to 1024 players. Most modern RP servers run OneSync minimum.",
        "Only for vehicles"
      ],
      a: 1,
      x: "Legacy FiveM had peer-to-peer sync — every client tracked every entity. Didn't scale past 32. OneSync moved authority to the server: the server decides what each client sees, replicates entities the client needs, culls the rest. Required setting for any RP server above the smallest size."
    },
  ],
  lua: [
    {
      qid: 'l1',
      q: "Why can't you just `while true do ... end` in client code?",
      opts: [
        "You can",
        "You'd block the client's main thread. Within ~5 seconds the client times out (the canonical disconnect). You need Wait(N) inside the loop to yield to the scheduler. Wait(0) yields one frame; Wait(1000) yields a second.",
        "It crashes the GTA executable"
      ],
      a: 1,
      x: "FiveM's Lua runs cooperatively. Each frame, the resource thread runs until it yields (Wait/coroutine.yield) or returns. A bare while-true never yields → blocks the entire client → times out. This is the #1 client timeout cause in scripts written by people new to FiveM. Always Wait inside loops."
    },
    {
      qid: 'l2',
      q: "What's special about Lua tables?",
      opts: [
        "Nothing",
        "Tables are Lua's only compound data structure. They serve as arrays, dictionaries, objects, and namespaces. Keys can be any non-nil value. Numeric keys starting at 1 (not 0) form the 'array part'. The metatable mechanism enables operator overloading and inheritance.",
        "They're just dictionaries"
      ],
      a: 1,
      x: "Tables are the workhorse. {1,2,3} is sugar for {[1]=1, [2]=2, [3]=3}. ipairs iterates the array part; pairs iterates everything. Lua 5.4 keeps array part densely packed for performance. Tables are also functions' parameter envelopes — function f(t) reading t.x = passing config objects."
    },
  ],
  events: [
    {
      qid: 'ev1',
      q: "What's wrong with this code: `TriggerServerEvent('give_money', player_id, 1000)`?",
      opts: [
        "Nothing",
        "EVERYTHING. The client controls player_id and 1000 — they can pass any values. A modified client passes a target player + huge amount. Server-side: use `source` (the implicit player who triggered) for identity, and validate the amount against business rules. Never trust client-supplied identity or amounts.",
        "Wrong function name"
      ],
      a: 1,
      x: "The single most common FiveM security mistake. Inside the server-side handler, source is the player who triggered. ANY ARG the client provides is suspect. To give money to the calling player, use source — not a player_id passed in args. To prevent grinding, validate the amount against rate-limits, costs, possessions server-side."
    },
    {
      qid: 'ev2',
      q: "What does RegisterNetEvent do vs AddEventHandler?",
      opts: [
        "Same thing",
        "RegisterNetEvent declares that an event name is allowed to be received over the network. AddEventHandler attaches a function to handle the event when it fires. For network events you need BOTH — without RegisterNetEvent, the event is silently dropped when arriving from the network.",
        "AddEventHandler is for sounds"
      ],
      a: 1,
      x: "A frequent debugging trap: you write the handler, fire the event from the other side, nothing happens. Cause: missing RegisterNetEvent. Modern FiveM (since 2021) gives a console warning, but many tutorials predate that and don't show the RegisterNetEvent call. Always pair them for network events. Pure local events don't need RegisterNetEvent."
    },
  ],
  resources: [
    {
      qid: 'r1',
      q: "What's an export?",
      opts: [
        "Trade goods",
        "A function exposed from one resource for other resources to call. exports['my_resource']:my_function(args). Works server-to-server and client-to-client (NOT cross-side — use events for that). The standard way to compose functionality across resources.",
        "A file extension"
      ],
      a: 1,
      x: "Exports are the API surface between resources. Define in the manifest (server_export 'GetMoney') and in code (exports('GetMoney', function(source) ... end)). Call from another resource: exports['my_resource']:GetMoney(playerId). Performance: exports add overhead — for hot paths inside one resource, use direct function calls."
    },
  ],
  database: [
    {
      qid: 'db1',
      q: "Why is oxmysql:execute synchronous-looking but actually async?",
      opts: [
        "It's just slow",
        "Lua coroutines. oxmysql:executeSync blocks the calling thread (bad — can freeze the resource). oxmysql:execute returns via callback OR yields the coroutine if called inside CreateThread/RegisterNetEvent. Use the non-Sync variant always — it doesn't actually block, it yields.",
        "It uses threads"
      ],
      a: 1,
      x: "This trips up everyone new to Lua coroutines. `local result = MySQL.query.await(query, params)` reads like a sync call but works because Lua's coroutines suspend at the await. Other things in the resource can run during the wait. oxmysql:executeSync ACTUALLY blocks — never use it in event handlers or threads serving players."
    },
    {
      qid: 'db2',
      q: "What's wrong with: `oxmysql:execute('SELECT * FROM users WHERE name = \"' .. userInput .. '\"')`?",
      opts: [
        "Bad style only",
        "SQL injection vulnerability. userInput could be `\"; DROP TABLE users; --`. Use parameterized queries: oxmysql:execute('SELECT * FROM users WHERE name = ?', { userInput }). The driver escapes the value safely. Always parameterize.",
        "Wrong table name"
      ],
      a: 1,
      x: "Concatenating user input into SQL is the oldest security mistake. In FiveM, the user-controlled value typically comes from a NUI form or chat command — fully controllable by the player. Parameterized queries make injection structurally impossible. There's no good reason to concatenate strings into SQL; always use placeholders."
    },
  ],
  framework: [
    {
      qid: 'fw1',
      q: "Get a QBCore player object from a server event handler:",
      opts: [
        "GetPlayer()",
        "QBCore: local Player = QBCore.Functions.GetPlayer(source). QBox: local Player = exports.qbx_core:GetPlayer(source). Both return the player wrapper with money, job, identifier, metadata. nil if player not active.",
        "GetPlayerInfo(source)"
      ],
      a: 1,
      x: "The QBCore.Functions.GetPlayer pattern is everywhere — money operations, job checks, inventory lookups all start here. Always check nil — players can disconnect mid-event. In QBox, the export-based API is the standard call. Both frameworks return similar shapes; migration mostly involves swapping these access patterns."
    },
  ],
  nui: [
    {
      qid: 'n1',
      q: "How does the NUI JavaScript side talk to Lua?",
      opts: [
        "It can't",
        "fetch('https://${GetParentResourceName()}/my_callback', { method: 'POST', body: JSON.stringify(data) }). Lua side: RegisterNUICallback('my_callback', function(data, cb) ... cb({ok=true}) end). HTTP-style POST. Don't forget to call cb() — JS Promise won't resolve otherwise.",
        "Magic"
      ],
      a: 1,
      x: "GetParentResourceName() (a JS function FiveM exposes inside NUI) returns the Lua resource name. Construct the URL, POST data. The Lua callback receives (data, cb) — data is the parsed body, cb is a function you MUST call to send a response. Forgetting cb is a classic 'why won't the UI update?' bug."
    },
  ],
  triage: [
    {
      qid: 'tr1',
      q: "Top 3 causes of client timeout disconnects (server-side scripts):",
      opts: [
        "Bad luck",
        "1) Long-running Lua code on client without Wait() — blocks the tick. 2) Heavy database queries blocking the server thread. 3) High-cardinality state replication overwhelming OneSync (too many entities/players). Use F8 console + resmon to find the culprit.",
        "Only the player's internet"
      ],
      a: 1,
      x: "When all players timeout simultaneously: server-side issue (DB blocking, OneSync overload, script crash). When one player times out repeatedly: their connection OR a client script behaving badly on their machine. resmon in F8 console shows live per-resource CPU usage. Anything sustained above 0.5ms client / 2ms server is suspect."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What's the single highest-leverage skill for FiveM development?",
      opts: [
        "Memorizing GTA natives",
        "Understanding the server/client boundary. Once you internalize 'server has truth, client suggests, server validates', most FiveM patterns and pitfalls click. Security, performance, sync — all flow from this one mental model.",
        "Lua syntax"
      ],
      a: 1,
      x: "FiveM scripts that don't internalize the boundary either get exploited (server trusts client data) or don't scale (clients doing work that should be server-side, or vice versa). The boundary determines everything: where validation lives, what crosses the wire, what's cacheable. Every pattern in the Library follows from this principle."
    },
  ],
};

const COMPARISONS = {
  frameworks_2026: {
    title: 'FiveM frameworks (May 2026)',
    headers: ['Framework', 'Status', 'Best for', 'Notes'],
    rows: [
      ['ESX (es_extended)', 'Active, mature', "Servers with large existing ESX script libraries", "Oldest framework (~2017). Different player object than QB family. Battle-tested."],
      ['QBCore', 'Stalled, community-maintained', "Existing QBCore servers, biggest script ecosystem", "Was dominant 2021-2024. Development largely stalled by 2025. Most production RP servers still here."],
      ['QBox (qbx_core)', 'Actively developed', "New servers in 2026, QBCore migrations", "Modern fork of QBCore. ox_ ecosystem (ox_lib, ox_inventory, oxmysql, ox_target). Lua 5.4. Strict server-authority."],
      ['Standalone', 'N/A (no framework)', "Specialized servers (drift, racing, FFA)", "No framework overhead, no player object, no jobs. Build everything yourself or pull from custom resources."],
    ],
  },
  server_vs_client: {
    title: 'Server vs client — where does the code go?',
    headers: ['Concern', 'Server', 'Client', 'Why'],
    rows: [
      ['Money / inventory authority', "YES", "no (read-only display)", "Authoritative state must be server-side. Clients lie."],
      ['Database access', "YES", "no", "Clients have no DB connection. Server queries on their behalf."],
      ['UI rendering (NUI)', "no", "YES", "UI is client-side. Server sends data; client renders."],
      ['Player input handling', "no", "YES", "Input comes from the player's machine. Validate intent server-side via events."],
      ['Cron-like scheduled jobs', "YES", "no", "Server is always running. Clients come and go."],
      ['Per-player visual effects', "no", "YES", "Only the affected client needs to render the effect."],
      ['Security validation', "YES (always)", "optional", "Client validation is for UX. Server validation is for security."],
    ],
  },
  events_table: {
    title: 'Event functions — server vs client',
    headers: ['Function', 'Where called', 'What it does', 'source available?'],
    rows: [
      ['TriggerServerEvent(name, ...args)', 'Client', 'Fires server-side event', "server handler: source = caller's player id"],
      ['TriggerClientEvent(name, target, ...args)', 'Server', "Fires client-side event on target player(s). -1 = all clients", "client handler: source = -1 (or caller server)"],
      ['TriggerEvent(name, ...args)', 'Either', 'Fires local event in same runtime (no network)', "source = current resource"],
      ['RegisterNetEvent(name)', 'Either', 'Declare event receivable over network', "—"],
      ['AddEventHandler(name, fn)', 'Either', 'Attach handler to event', "inside handler: source = caller (for net events)"],
    ],
  },
  ox_stack: {
    title: 'The ox_ ecosystem (QBox standard, usable everywhere)',
    headers: ['Resource', 'Replaces', 'What it does'],
    rows: [
      ['ox_lib', 'Various utility libs', "Menus, dialogs, notifications, math, caching, callbacks, server-authority helpers. Use everywhere."],
      ['ox_inventory', 'qb-inventory / esx_inventory', "Weight + slot inventory. Multiple inventory types. The 2026 standard."],
      ['oxmysql', 'mysql-async', "Async MySQL/MariaDB connector. Parameterized queries. Promise + callback APIs."],
      ['ox_target', 'qb-target / qtarget', "Eye/cursor-based interaction system. Replaces text-based 'press E' prompts."],
      ['ox_doorlock', 'qb-doorlock', "Door locking system. Lightweight, performant."],
      ['ox_fuel', 'qb-fuel / LegacyFuel', "Vehicle fuel system."],
    ],
  },
  timeout_causes: {
    title: 'Client timeout causes — by frequency (Cle: this one is for you)',
    headers: ['Cause', 'Detection', 'Fix'],
    rows: [
      ['Client script blocks tick (no Wait)', "F8 console: 'resmon 1' shows the resource pegged near 100% client CPU", "Add Wait(0) or Wait(ms) inside any while-loop. Refactor long-running sync code into chunks."],
      ['DB query blocks server thread', "Server-side resmon: oxmysql showing high CPU. txAdmin log: 'WaitForResources blocked'", "Use oxmysql:execute (async) not executeSync. Move heavy queries off the hot path. Cache reads."],
      ['OneSync entity overflow', "Server log: 'Failed to allocate slot for entity'. Player count >100 + many entities", "Cull entities aggressively. DeleteEntity on unused vehicles. Set OneSync entity limits per-player."],
      ['Network thread blocked', "Server log: 'Network thread hitch'. CPU graphs spike", "Reduce TriggerClientEvent frequency. Batch updates. Don't broadcast to -1 (all) when target is one."],
      ['Resource crash / infinite loop', "txAdmin log: 'Resource X has produced too much output'", "Restart that resource. Check its source for recent changes. Add error handling."],
      ['VPS network instability', "Multiple players timeout simultaneously. ping spikes externally", "tracert from VPS to a few players' IPs. Talk to host (Zap, etc). May need to migrate hosts."],
      ['Player-side ISP issue', "Single player times out repeatedly, others fine", "Have them switch to wired Ethernet, run their own tracert, contact ISP."],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "Trusting client-supplied event data", reason: "TriggerServerEvent('give_money', 9999999) — server processes it without validation = exploit. Server-side: use 'source' for identity, validate every argument against business rules. NEVER trust client-supplied player IDs, amounts, items, positions." },
  { name: "Bare while-true loops on the client", reason: "while true do CheckSomething() end blocks the client tick. Client times out within ~5 seconds. ALWAYS Wait(N) inside while-loops. Wait(0) = one frame; Wait(1000) = one second. Choose the largest Wait that meets your responsiveness need." },
  { name: "oxmysql:executeSync in handlers", reason: "Sync queries block the server thread until completion. During that time, no other player's events run. Use oxmysql:execute (callback) or MySQL.query.await (yields the coroutine). Reserve Sync ONLY for one-shot startup code." },
  { name: "Polling for state instead of events", reason: "while true do if PlayerHasJob('cop') then ... end Wait(100) end — runs 10x per second on every client forever. Use events: subscribe to job change, react when it fires. Reduces CPU dramatically." },
  { name: "Forgetting RegisterNetEvent on network events", reason: "AddEventHandler alone doesn't make an event receivable from the network. Without RegisterNetEvent, network triggers are silently dropped. Modern FiveM warns in console but old tutorials don't show it. Always pair them for net events." },
  { name: "String-concatenating SQL queries", reason: "oxmysql:execute('SELECT * FROM users WHERE name = \"' .. input .. '\"') = SQL injection. Use parameterized form: oxmysql:execute('SELECT * FROM users WHERE name = ?', {input}). No exceptions, even 'trusted' inputs." },
  { name: "Heavy NUI updates from a tick", reason: "SendNUIMessage on every frame = 60 messages/sec to the CEF process = janky UI + wasted CPU. Throttle: send when data actually changes, or rate-limit (max once per N ms). Use ox_lib's cache primitives." },
  { name: "Not calling the NUI callback", reason: "RegisterNUICallback('foo', function(data, cb) ... end) — if you don't call cb({ok=true}), the JS-side Promise never resolves. UI hangs. Always cb({}) even when returning no data." },
  { name: "Putting business logic in NUI JS", reason: "Validation in NUI = client-side validation. Anyone can modify the HTML/JS. Treat NUI as a dumb renderer. Validation, math, business rules all go server-side via TriggerServerEvent + handler." },
  { name: "Excessive entity creation without cleanup", reason: "CreateVehicle / CreatePed / CreateObject without tracking + deletion = entity buildup. OneSync slot exhaustion. Players see weird sync issues. Always store created entities; DeleteEntity when done. Use ox_lib's CreateVehicle wrappers when available." },
  { name: "Running QBCore and ESX side by side", reason: "Different player object structures, conflicting database tables, conflicting events. Pick one framework. Migration paths exist (QBCore <-> QBox is easy, ESX <-> QB family is hard) but parallel operation never works." },
  { name: "Using SetNuiFocus(true,...) and never clearing it", reason: "Player loses ability to control the character. Always pair SetNuiFocus(true, true) with SetNuiFocus(false, false) on close. Stuck-mouse is the #1 player support complaint." },
];

const COMMANDS = [
  { cmd: 'resmon 1', desc: "F8 console: show live resource monitor. Per-resource CPU + memory. The single most useful FiveM debugging command. Anything sustained above 0.5ms client / 2ms server needs investigation." },
  { cmd: 'restart resource_name', desc: "Server console (txAdmin or direct): restart a single resource without restarting the whole server. Common: tweak code, restart resource, retest." },
  { cmd: 'refresh', desc: "Server console: reload the resource manifest list. Run after adding a new resource folder so FiveM picks it up. Then 'ensure your_resource' to start it." },
  { cmd: 'ensure resource_name', desc: "Server console or server.cfg: start a resource (and keep it running). Standard way to declare 'this resource should be running'. Add to server.cfg for boot-time starts." },
  { cmd: 'stop resource_name', desc: "Server console: stop a resource. Used during debugging or when reloading config. Followed by 'start resource_name' or 'ensure resource_name'." },
  { cmd: 'status', desc: "Server console: list connected players (id, name, ping, identifiers). The basic 'who's online' command. Combine with 'players' for more detail." },
  { cmd: 'kick player_id "reason"', desc: "Server console: kick a player with a reason. Player ID from 'status' or txAdmin. Reason is shown to the player." },
  { cmd: 'sv_maxclients 64', desc: "server.cfg: maximum concurrent players. 32 default. 64 requires OneSync; up to 1024 requires OneSync Plus. Set per your server's tier." },
  { cmd: 'set onesync on', desc: "server.cfg: enable OneSync. Required for >32 players. Server-authoritative entity sync. Almost always 'on' for RP servers in 2026." },
  { cmd: 'set onesync_population true', desc: "server.cfg: server controls AI/vehicle population (not clients). Reduces sync conflicts. Standard for OneSync servers." },
  { cmd: 'sv_endpointprivacy true', desc: "server.cfg: hide player IPs in 'status' and similar commands. Privacy hardening. Recommended." },
  { cmd: 'load_server_icon icon.png', desc: "server.cfg: 96x96 PNG, max 250KB. Shown in the server list. Required for serious presentation." },
  { cmd: 'add_principal identifier.steam:xxx group.admin', desc: "server.cfg or console: grant admin role to a player. The principals/ace permissions model. Custom groups defined via add_ace." },
  { cmd: 'add_ace group.admin command.kick allow', desc: "server.cfg: allow 'admin' group to use 'kick' command. The permission system. Build custom roles by combining principals + aces." },
  { cmd: 'exports.oxmysql:execute("SELECT * FROM users WHERE id = ?", {playerId})', desc: "Lua: parameterized async query. Returns promise/coroutine yield. The standard DB query pattern in 2026." },
  { cmd: 'CreateThread(function() while true do Wait(0); -- per-frame work end end)', desc: "Lua: standard per-frame loop with mandatory Wait(0). The pattern for client-side rendering loops, input checks, distance checks." },
];

const RESOURCES = [
  { name: "Cfx.re Documentation", url: 'docs.fivem.net', note: "Official FiveM/RedM documentation. Native references, server commands, resource manifest spec, OneSync details. Search-first when you need to know what a function does.", kind: 'reference' },
  { name: "Cfx.re Forums", url: 'forum.cfx.re', note: "Official community forums. Server owners discussing issues, devs sharing resources, support threads. Search before posting — many issues have answers buried in 2019-2023 threads.", kind: 'community' },
  { name: "QBox Documentation", url: 'docs.qbox.re', note: "QBox framework docs. Server install, core API, ox_ ecosystem integration, migration from QBCore. The 2026 reference if you're on QBox.", kind: 'reference' },
  { name: "QBCore Documentation", url: 'docs.qbcore.org', note: "QBCore docs. Still useful for QBCore servers; many concepts translate to QBox. Note: development largely stalled, treat as reference for the framework as-is.", kind: 'reference' },
  { name: "Overextended (ox_lib + friends)", url: 'overextended.dev', note: "Documentation hub for ox_lib, ox_inventory, oxmysql, ox_target. The modern FiveM ecosystem. Read these docs even if you're on QBCore — many resources use ox_lib regardless of framework.", kind: 'reference' },
  { name: "FiveM GitHub (citizenfx/fivem)", url: 'github.com/citizenfx/fivem', note: "Source repo for FiveM itself. Issues, pull requests, releases. Useful for tracking platform changes and known bugs.", kind: 'reference' },
  { name: "QBox GitHub (qbox-project)", url: 'github.com/qbox-project', note: "Org for qbx_core and related resources. Issues, releases, migration guides. The active development center.", kind: 'reference' },
  { name: "Overextended GitHub (overextended)", url: 'github.com/overextended', note: "Org for ox_lib, ox_inventory, oxmysql, ox_target. Issues, releases, examples. Active and well-maintained.", kind: 'reference' },
  { name: "Lua 5.4 Reference Manual", url: 'lua.org/manual/5.4/', note: "Official Lua docs. Language reference. FiveM uses Lua 5.4 since 2024. Read sections on tables, metatables, coroutines — they're foundational.", kind: 'reference' },
  { name: "Roleplay Ready (YouTube)", url: 'youtube.com/@RoleplayReady', note: "Tutorial channel covering FiveM server setup, QBCore/QBox installation, common scripting patterns. Solid for visual learners.", kind: 'tutorial' },
  { name: "Cfx.re Discord", url: 'discord.gg/fivem', note: "Official Discord. Real-time help, development channels, framework-specific channels. Where most active troubleshooting happens in 2026.", kind: 'community' },
  { name: "QBox Discord", url: 'discord.gg/qbox', note: "QBox community Discord. Development, migration help, script sharing. The center of QBox activity.", kind: 'community' },
];

const PERSONALIZED = {
  server: {
    spark: "Server scripter: master the server/client boundary first. Then events with proper source handling. Then async DB via oxmysql. Then caching. Most server-side bugs are: trusted client data, sync DB blocking, or polling instead of events.",
    architecture: "Server side: you're the source of truth. Validate everything. The client tells you what it wants; you decide what actually happens. Resources expose APIs via exports; events bridge to clients.",
    lua: "Server-side Lua runs on Node-ish FiveM runtime. Coroutines (Citizen.CreateThread) for concurrency. Wait(0) yields to the scheduler. Server-side has no 'tick' — your code runs when events fire or threads resume.",
    events: "Server-side: source is your friend, the only trustworthy identifier. Validate every payload arg. Rate-limit handlers (ox_lib's playerLoaded check, throttle helpers). Use callbacks for request-response patterns.",
    database: "oxmysql:execute (async) inside handlers — never executeSync. Use ox_lib's cache for hot reads. Parameterize EVERYTHING. Schema design: indexed identifier columns, separate hot/cold tables.",
    framework: "QBCore: QBCore.Functions.GetPlayer(source). QBox: exports.qbx_core:GetPlayer(source). Always nil-check. Use the framework's money/inventory functions — don't reach into raw DB rows.",
    library: "Server: event handlers, oxmysql patterns, server-authority validation, ox_lib helpers, cron-like scheduled work.",
  },
  client: {
    spark: "Client scripter: master CreateThread + Wait(N). Then NUI bridges (SendNUIMessage + RegisterNUICallback). Then performance — measure with resmon. Most client-side bugs are: blocking the tick, NUI focus leaks, or excessive event spam.",
    architecture: "Client side: rendering, input, UI, integration with the game. Talk to server via events. Keep heavy logic server-side. You're the player's experience; the server is the truth.",
    lua: "Client-side Lua: every frame, the main thread runs. CreateThread(function() while true do Wait(0); per-frame stuff end end) is THE pattern. Always Wait — even Wait(0) yields one frame. Without it, client times out.",
    events: "Client-side: trigger server events for state changes. Listen for server events for state updates. Don't trigger 60 events per second — rate-limit. Cache local state; sync deltas not full snapshots.",
    database: "Client-side has no DB. Want data? Ask server (TriggerServerEvent + callback). For frequently-read static config (like prices), broadcast once on connect and cache client-side.",
    framework: "QBCore client: QBCore.Functions.GetPlayerData() (local cached). Subscribe to QBCore.Functions.GetPlayerData callback for updates. QBox client: similar pattern via exports.qbx_core:GetPlayerData().",
    library: "Client: per-frame loops with bounded Wait, NUI bridges, ox_target setups, ox_lib menus and notifications, performance monitoring.",
  },
  owner: {
    spark: "Server owner: stop writing scripts you don't need. Use ox_lib + ox_inventory + ox_target + a vetted framework. Spend time on server.cfg tuning, txAdmin setup, backup strategy, anti-cheat. The 'just install another script' habit kills servers.",
    architecture: "Owner: understand WHERE problems live. Client timeouts -> usually a misbehaving resource. DB lag -> often unindexed queries. Sync issues -> OneSync config. Each problem class has a specific diagnostic command (resmon, txAdmin logs, mysql slow log).",
    lua: "Owner: you don't have to master Lua, but understand enough to read a script and spot 'this is going to block.' Look for: while-true without Wait, executeSync, no source validation, hardcoded prices.",
    events: "Owner: when adding new resources, sanity-check they're not spamming events. resmon shows the cost. If a 'free' resource pegs at 5ms server-side, it's not free.",
    database: "Owner: run periodic ANALYZE on your tables. Index the columns you query by (identifier especially). Monitor slow query log. Schedule regular backups — RP servers store player progress; loss is catastrophic for retention.",
    framework: "Owner: in 2026, new servers default to QBox. Existing QBCore servers: migrate when it makes sense (you have script-buy time). Don't migrate during a busy period; do it during a planned downtime window.",
    library: "Owner: server.cfg templates, txAdmin setup, monitoring scripts, backup strategies, anti-cheat config.",
  },
  new: {
    spark: "New to FiveM: read Cfx.re docs first (skim — not memorize). Then install a QBox server locally using the QBox docs. Then write one simple resource (a /heal command). Then read code from existing resources. The leap from tutorial to original work happens in step 4.",
    architecture: "Foundations: the server/client split is the most important concept. Server has the truth. Client renders. They talk via events. Resources are folders. Manifests describe what's in them. Once these click, the rest follows.",
    lua: "Foundations: Lua syntax is small. Tables, functions, if/while/for. The FiveM-specific parts: Citizen.CreateThread, Wait, the event functions. Write 10 small scripts. Don't read 1000 pages first.",
    events: "Foundations: TriggerServerEvent (client -> server). TriggerClientEvent (server -> client). RegisterNetEvent + AddEventHandler on the receiving side. Source on server-side = caller. That's 80% of FiveM events.",
    database: "Foundations: oxmysql. Async queries with placeholders. Don't worry about complex patterns yet — start with basic INSERT / SELECT / UPDATE.",
    framework: "New in 2026: start with QBox. Don't waste time on QBCore unless you're inheriting a server. The QBox + ox_ stack is what new ecosystem development targets.",
    library: "New: minimal viable patterns — first event, first export, first NUI, first DB query.",
  },
  migrate: {
    spark: "Migrator: read the QBox migration guide top to bottom before starting. Stand up a fresh QBox server in parallel. Migrate one feature at a time. Don't try to migrate a live production server in one shot.",
    architecture: "Migration: the boundary is the same. Most QBCore scripts work on QBox with config tweaks. The big swaps: qb-inventory -> ox_inventory, qb-target -> ox_target, custom UI -> ox_lib menus. Plan these substitutions, then translate scripts.",
    lua: "Migrator: Lua 5.4 (QBox) has minor differences from older. Integer/float separation, bitwise operators, goto. Most QBCore code Just Works on 5.4. Keep an eye on string.format edge cases.",
    events: "Migrator: most event names are the same (QBCore.Functions.GetPlayer events). Some QBox-specific events differ slightly. Use the QBox compatibility bridge (qbx_core's qb-core shim) during transition.",
    database: "Migrator: schema is mostly identical. The big change is moving inventory data from qb-inventory's format to ox_inventory's. QBox provides a migration script — run it once.",
    framework: "Migrator: this is your stack. Read the QBox docs migration section. Spin up the QBox repo locally. Test individual resources for compatibility. Most things work; the few that don't usually need 30 min of tweaks.",
    library: "Migrator: framework wrapper patterns, ox_ ecosystem onboarding, compatibility bridge usage.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's the FiveM problem?",
    opts: [
      { label: "⏱ Client timeouts / disconnects", next: 'client-timeout' },
      { label: "🐌 Server lag at high player count", next: 'server-lag' },
      { label: "🔥 Resource crashing or 'too much output'", next: 'resource-crash' },
      { label: "🔓 Suspected exploit / money duplication", next: 'exploit' },
      { label: "💾 Database query is slow", next: 'db-slow' },
      { label: "🖼 NUI not displaying or callback hanging", next: 'nui-issue' },
      { label: "🔄 Players desyncing (seeing different things)", next: 'desync' },
      { label: "🆕 Starting a new server — where to begin?", next: 'new-server' },
    ],
  },
  'client-timeout': {
    fix: "Client timeouts have ~6 distinct causes. Triage by who times out, when, and on which resources.",
    steps: [
      "Identify the pattern: ALL players timeout together (server-side issue) vs ONE player keeps timing out (their connection or a client script misbehaving on their machine).",
      "Tell the player to open F8 console, run 'resmon 1', and screenshot. Any resource sustained above 0.5ms client CPU is the prime suspect.",
      "If resmon shows a single resource pegged: check its client_scripts. Look for while-true loops without Wait(). Add Wait(0) inside any per-frame loop. Wait(N) inside polling loops.",
      "If timeouts correlate with peak player count: it's the server. Check txAdmin logs for 'Network thread hitch' or 'OneSync entity overflow' messages. Reduce TriggerClientEvent broadcasts to -1 (all clients) — target specific players when you can.",
      "Check oxmysql performance: long-running queries can block the server thread. Slow queries log to txAdmin if configured. Add indexes on frequently-queried columns.",
      "Network: run tracert from the VPS to a known-affected player's IP. If you see packet loss at the host's edge, that's a hosting issue — talk to Zap/your provider.",
      "Last resort: enable verbose logging (set sv_enforceGameBuild, debug_resources_init) and inspect the player's CitizenFX.log after a timeout for the last actions before disconnect.",
      "Going forward: monitor with txAdmin's live metrics. Every resource you add — resmon it BEFORE shipping to production. The 'one bad resource' pattern is the most common cause."
    ]
  },
  'server-lag': {
    fix: "Server lag at high player count is almost always: heavy queries on the hot path, OneSync misconfigured, or one resource doing too much per-tick work.",
    steps: [
      "Server-side resmon ('resmon 1' from txAdmin console). Find the resource(s) with sustained CPU > 2ms.",
      "Inside the offending resource: look for tight loops, TriggerClientEvent broadcasts (-1), excessive entity creation. These are the usual culprits.",
      "Database: enable mysql slow query log. Add indexes on identifier, char_id, owner, plate (whatever you query by frequently). Aim for queries under 50ms in p99.",
      "OneSync settings: 'set onesync_population true' (server-controlled population — reduces sync work). 'set onesync_distance 150.0' (smaller sync radius if you have entity overflow).",
      "Reduce TriggerClientEvent frequency. If you broadcast position updates 10x/sec to all 100 players, that's 1000 events/sec. Batch updates; send deltas.",
      "Caching: ox_lib's cache for hot reads. Don't re-query the database for the same value 50 times per second.",
      "If you've exhausted optimizations: scale up the VPS. RAM and CPU cores both matter. For 100+ players: 8GB RAM + 4 dedicated cores minimum. 200+: 16GB + 6 cores. Zap, OVH, Hetzner all offer scaling tiers.",
      "Test with txAdmin's 'players simulator' before adding new resources at scale."
    ]
  },
  'resource-crash': {
    fix: "'Resource X has produced too much output' usually means print/console.log in a hot loop, or a runtime error in a per-frame loop.",
    steps: [
      "Read the actual error: txAdmin logs the last few lines of output before the crash. The crash reason is usually right there.",
      "Common cause #1: print() inside a CreateThread loop with Wait(0). Spams console at 60Hz. Remove the print or move it outside.",
      "Common cause #2: an exception in a per-frame thread that gets caught and rethrown. The same error fires every frame. Wrap risky code in pcall().",
      "Common cause #3: a resource depending on another that hasn't started yet. Use dependency declarations in fxmanifest.lua ('dependency \"qbx_core\"').",
      "Restart the offending resource: 'restart resource_name' in console. If it crashes again immediately, leave it stopped while you fix.",
      "Roll back: git log in the resource folder. Identify the last known-good commit. git checkout that commit, restart, verify. Then you know what change broke it.",
      "Add error handling. pcall() around external calls (DB queries, network requests). Log errors with context. Don't let a single bad request take down the whole resource."
    ]
  },
  'exploit': {
    fix: "Money duplication and similar exploits ALWAYS come from servers trusting client data. Audit your events.",
    steps: [
      "Find the exploit: txAdmin transaction logs (if you have them) or oxmysql player_money table over time. Find the player whose money jumped impossibly.",
      "Audit recent code: every TriggerServerEvent handler that adds money, items, or permissions. Each one should validate using 'source' (NOT a client-supplied player ID) and validate the AMOUNT against business rules.",
      "Look for the bad pattern: TriggerServerEvent('give_item', playerId, itemId, count). The handler does AddItem(playerId, itemId, count). Anyone can call this with any args. FIX: handler does AddItem(source, validated_item, validated_count) — derived server-side.",
      "Use ox_lib's playerLoaded check on every handler — prevents events from firing before the player object is ready (a common pre-validation hole).",
      "Add server-side anti-cheat: detect impossible amounts (money jumping >$1000/min outside payday windows), impossible inventories (more weight than max), impossible positions (teleporting outside legal areas).",
      "Investigate the offending player: F8 console history if you have it, recent disconnections, suspicious patterns. Ban with evidence; not just suspicion (false bans erode community trust).",
      "Long-term: every event handler gets a code review with one question — 'can a malicious client break this?' If yes, harden it. Build a checklist into your dev process."
    ]
  },
  'db-slow': {
    fix: "Slow queries usually = missing indexes, or running a sync query where async would do.",
    steps: [
      "Enable slow query log in MySQL: 'set global slow_query_log = 1; set global long_query_time = 0.1;' (logs anything over 100ms).",
      "Watch the log for a few hours during peak. The repeating offenders are your targets.",
      "EXPLAIN the slow queries: 'EXPLAIN SELECT * FROM users WHERE identifier = ?'. Look for 'type: ALL' (full table scan). Add an index on the WHERE column.",
      "Index identifier columns, char_id, plate, owner — anything you look up by frequently. ADD INDEX idx_identifier ON users(identifier).",
      "Switch executeSync to execute (async) everywhere except one-shot startup code. Sync blocks the server thread until done; async yields the coroutine.",
      "Cache hot reads server-side. Player money? Read on connect, update on changes, save periodically — don't query every transaction.",
      "If you have a query that's structurally slow (joins across 10 tables), denormalize. Read-heavy patterns benefit from precomputed columns or materialized views.",
      "Backup your DB before schema changes (ALTER TABLE ADD INDEX). Indexes are fast to add on small tables, painful on 10M-row tables — plan downtime if needed."
    ]
  },
  'nui-issue': {
    fix: "Two main NUI failure modes: UI not appearing (focus / message issue) or callback hanging (forgot to call cb()).",
    steps: [
      "UI not appearing: check the Cfx browser dev tools (F8 console -> 'nui_devtools resource_name'). Look for JS errors, network failures, missing files.",
      "Check fxmanifest.lua has 'ui_page \"html/index.html\"' and 'files { \"html/**/*\" }' — without these, the NUI doesn't load.",
      "Check SetNuiFocus(true, true) called when showing the UI. Without focus, mouse/keyboard don't reach NUI even if it's rendered.",
      "Check SendNUIMessage data structure. JS expects { action: '...', data: ... } (your convention). If your JS doesn't handle the action type, it does nothing.",
      "Callback hanging: forgot to call cb() in your RegisterNUICallback handler. JS Promise never resolves. fetch().then() never fires. Always cb({}) — even with no data.",
      "Cross-resource NUI fetches: must use GetParentResourceName() — hardcoded URL won't work. fetch(`https://${GetParentResourceName()}/foo`, ...).",
      "Always pair SetNuiFocus(true, true) with SetNuiFocus(false, false) on close. Stuck-mouse is the most common UI bug players complain about."
    ]
  },
  'desync': {
    fix: "Desync means clients see different states. Usually OneSync entity ownership, or trusting client position data.",
    steps: [
      "Identify the desync type: positional (player A sees player B in different spot) vs state (player A sees inventory differently than player B sees it).",
      "Positional: OneSync entity ownership issue. The entity owner client streams updates. If they're laggy, others see stale positions. Force ownership to a stable client or server-side for critical entities.",
      "State: the authoritative store disagrees with cached clients. After a state change, TriggerClientEvent(-1, 'update_state', new_state) to broadcast. Or query on demand via callbacks.",
      "Check 'set onesync_population true' is set (server-controlled population — drastically reduces population desync).",
      "Vehicle desync: vehicles inherit the owner's lag. Reset ownership periodically: NetworkRequestControlOfEntity from the server when the current owner is laggy.",
      "Audit your code for client-side authoritative state. If client A says 'I have $100' and client B says 'A has $80', the server has the truth — both clients should re-pull from server.",
      "If desync correlates with a specific resource: stop it temporarily, see if desync clears. Some scripts modify entity state without proper sync notification."
    ]
  },
  'new-server': {
    fix: "Start with QBox in 2026. Don't reinvent. The first month is configuration + learning, not custom code.",
    steps: [
      "Pick a host: Zap-Hosting is the most common; OVH/Hetzner if you want raw VPS control. 4GB RAM / 4 cores minimum for under 64 players.",
      "Install QBox via the official docs (docs.qbox.re). Use the recommended ox_ ecosystem stack (ox_inventory, ox_target, oxmysql).",
      "Configure server.cfg: hostname, license key (from keymaster.fivem.net), sv_maxclients, OneSync on, basic admin (your steam ID as principal.admin).",
      "Install txAdmin (usually pre-bundled with FiveM artifacts). It's the management UI you'll use 90% of the time.",
      "Start with the QBox default resources. Don't add custom scripts for the first week. Play on your own server. Find what's missing.",
      "When you add resources, add ONE at a time. Test each. resmon it. Bad resources are how production servers die.",
      "Set up backups from day one. Daily MySQL dumps to off-site storage. Without backups, one corrupted table = total loss = your community leaves.",
      "Build a Discord, document the server rules, recruit 2-3 staff before opening. Community management is 70% of running a successful RP server."
    ]
  },
};

const ARCH_NODES = [
  { id: 'client', x: 20, y: 30, w: 70, h: 28, label: 'GTA V client', color: '#f9a8d4', desc: "The player's machine. Runs FiveM, which hosts the GTA V game + Lua client runtime + CEF for NUI. Untrusted by design — any client can be modified." },
  { id: 'fivem', x: 110, y: 30, w: 70, h: 28, label: 'FiveM runtime', color: '#f9a8d4', desc: "The Cfx.re runtime layer. Lua scheduler, event bus, native API. Runs your client scripts. Handles network protocol to the server." },
  { id: 'wire', x: 110, y: 80, w: 70, h: 18, label: '⚠ wire ⚠', color: '#fb7185', desc: "The network. UDP-based custom protocol. EVERYTHING crossing this line is untrusted on the receiving side. Server-authority rule lives here." },
  { id: 'server', x: 110, y: 120, w: 70, h: 28, label: 'server runtime', color: '#22d3ee', desc: "FiveM server process on your VPS. Lua server runtime. Has the truth — validates inputs, owns authoritative state, dispatches events to clients." },
  { id: 'resources', x: 20, y: 120, w: 70, h: 28, label: 'resources', color: '#22d3ee', desc: "Your Lua scripts. server_scripts + client_scripts + shared_scripts, organized in resource folders. The framework (QBCore/QBox) is also a resource." },
  { id: 'oxmysql', x: 200, y: 120, w: 70, h: 28, label: 'oxmysql', color: '#22d3ee', desc: "Async MySQL driver. Server-side only. Parameterized queries. The bridge from Lua to your database. Hot path bottleneck if misused." },
  { id: 'mysql', x: 200, y: 170, w: 70, h: 28, label: 'MySQL DB', color: '#22d3ee', desc: "Persistent storage. Player data, inventory, vehicles, jobs, money. Lives on the VPS or a separate DB host. Backups are critical." },
  { id: 'txadmin', x: 20, y: 170, w: 70, h: 28, label: 'txAdmin', color: '#22d3ee', desc: "Web admin panel. Process manager, log viewer, console access, player management. Default management UI in 2026." },
  { id: 'nui', x: 20, y: 220, w: 70, h: 28, label: 'NUI (CEF)', color: '#f9a8d4', desc: "Chromium-embedded UI overlay on the client. Your HTML/CSS/JS renders here. Talks to client Lua via SendNUIMessage (down) and RegisterNUICallback (up)." },
];

/* ═══════════════════════════════════════════════════════════════
   SANDBOX LOGIC — real Lua interpreter (subset), event simulator,
   fxmanifest builder. Bounded, validated, no silent catches.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Bounded constants ─── */
const SBX = Object.freeze({
  MAX_INPUT_CHARS: 10000,
  MAX_TOKENS: 5000,
  MAX_AST_DEPTH: 100,
  MAX_EVAL_STEPS: 10000,
  MAX_STACK_DEPTH: 50,
  MAX_OUTPUT_LINES: 200,
  MAX_TABLE_SIZE: 1000,
  MAX_STRING_LEN: 5000,
});

/* ═══════════════════════════════════════════════════════════════
   LUA TOKENIZER
   ═══════════════════════════════════════════════════════════════ */

const LUA_KEYWORDS = new Set([
  'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for',
  'function', 'goto', 'if', 'in', 'local', 'nil', 'not', 'or',
  'repeat', 'return', 'then', 'true', 'until', 'while',
]);

function luaTokenize(src) {
  // Input validation at boundary (NASA-light)
  if (typeof src !== 'string') throw new Error('tokenize: input must be string');
  if (src.length > SBX.MAX_INPUT_CHARS) {
    throw new Error(`tokenize: input exceeds ${SBX.MAX_INPUT_CHARS} chars`);
  }

  const tokens = [];
  let i = 0;
  let line = 1;
  const N = src.length;
  let safety = 0;

  while (i < N) {
    safety++;
    if (safety > N * 4) throw new Error('tokenize: safety limit');
    if (tokens.length > SBX.MAX_TOKENS) {
      throw new Error(`tokenize: too many tokens (max ${SBX.MAX_TOKENS})`);
    }

    const c = src[i];

    // Whitespace
    if (c === ' ' || c === '\t' || c === '\r') { i++; continue; }
    if (c === '\n') { line++; i++; continue; }

    // Comments
    if (c === '-' && src[i + 1] === '-') {
      // Block comment --[[ ... ]]
      if (src[i + 2] === '[' && src[i + 3] === '[') {
        i += 4;
        while (i < N && !(src[i] === ']' && src[i + 1] === ']')) {
          if (src[i] === '\n') line++;
          i++;
        }
        i += 2; // skip ]]
        continue;
      }
      // Line comment
      while (i < N && src[i] !== '\n') i++;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(c)) {
      let j = i;
      // Hex?
      if (c === '0' && (src[i + 1] === 'x' || src[i + 1] === 'X')) {
        j += 2;
        while (j < N && /[0-9a-fA-F]/.test(src[j])) j++;
        tokens.push({ type: 'NUMBER', value: parseInt(src.slice(i, j), 16), line });
        i = j;
        continue;
      }
      // Decimal
      while (j < N && /[0-9]/.test(src[j])) j++;
      if (src[j] === '.') {
        j++;
        while (j < N && /[0-9]/.test(src[j])) j++;
      }
      // Exponent
      if (src[j] === 'e' || src[j] === 'E') {
        j++;
        if (src[j] === '+' || src[j] === '-') j++;
        while (j < N && /[0-9]/.test(src[j])) j++;
      }
      tokens.push({ type: 'NUMBER', value: parseFloat(src.slice(i, j)), line });
      i = j;
      continue;
    }

    // Strings
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      let value = '';
      let strSafety = 0;
      while (j < N && src[j] !== quote) {
        strSafety++;
        if (strSafety > SBX.MAX_STRING_LEN) throw new Error('tokenize: string too long');
        if (src[j] === '\\') {
          const next = src[j + 1];
          if (next === 'n') value += '\n';
          else if (next === 't') value += '\t';
          else if (next === 'r') value += '\r';
          else if (next === '\\') value += '\\';
          else if (next === quote) value += quote;
          else if (next === "'" || next === '"') value += next;
          else value += next || '';
          j += 2;
        } else {
          if (src[j] === '\n') line++;
          value += src[j];
          j++;
        }
      }
      if (j >= N) throw new Error(`tokenize: unterminated string at line ${line}`);
      tokens.push({ type: 'STRING', value, line });
      i = j + 1;
      continue;
    }

    // Long string [[ ... ]]
    if (c === '[' && src[i + 1] === '[') {
      let j = i + 2;
      let value = '';
      let lsSafety = 0;
      while (j < N && !(src[j] === ']' && src[j + 1] === ']')) {
        lsSafety++;
        if (lsSafety > SBX.MAX_STRING_LEN) throw new Error('tokenize: long string too long');
        if (src[j] === '\n') line++;
        value += src[j];
        j++;
      }
      if (j >= N) throw new Error('tokenize: unterminated long string');
      tokens.push({ type: 'STRING', value, line });
      i = j + 2;
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < N && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (LUA_KEYWORDS.has(word)) {
        tokens.push({ type: 'KEYWORD', value: word, line });
      } else {
        tokens.push({ type: 'IDENT', value: word, line });
      }
      i = j;
      continue;
    }

    // Multi-char operators
    const two = src.slice(i, i + 2);
    const three = src.slice(i, i + 3);
    if (three === '...') { tokens.push({ type: 'OP', value: '...', line }); i += 3; continue; }
    if (two === '==' || two === '~=' || two === '<=' || two === '>=' ||
        two === '..' || two === '//' || two === '::') {
      tokens.push({ type: 'OP', value: two, line }); i += 2; continue;
    }

    // Single-char punctuation/operators
    if ('+-*/%^#=<>(){}[],;.:'.includes(c)) {
      tokens.push({ type: 'OP', value: c, line }); i++; continue;
    }

    throw new Error(`tokenize: unexpected character '${c}' at line ${line}`);
  }

  tokens.push({ type: 'EOF', line });
  return tokens;
}

/* ═══════════════════════════════════════════════════════════════
   LUA PARSER — recursive descent → AST
   AST node shapes documented inline.
   ═══════════════════════════════════════════════════════════════ */

function luaParse(src) {
  const tokens = luaTokenize(src);
  let pos = 0;
  let depthCounter = 0;

  const peek = (off = 0) => tokens[pos + off];
  const eat = () => tokens[pos++];
  const matches = (type, value) => {
    const t = peek();
    if (t.type !== type) return false;
    if (value !== undefined && t.value !== value) return false;
    return true;
  };
  const expect = (type, value) => {
    const t = eat();
    if (t.type !== type || (value !== undefined && t.value !== value)) {
      throw new Error(`parse: expected ${type}${value ? ` '${value}'` : ''} but got ${t.type} '${t.value}' at line ${t.line}`);
    }
    return t;
  };
  const expectKw = (kw) => expect('KEYWORD', kw);
  const expectOp = (op) => expect('OP', op);
  const isKw = (kw) => matches('KEYWORD', kw);
  const isOp = (op) => matches('OP', op);

  function trackDepth() {
    depthCounter++;
    if (depthCounter > SBX.MAX_AST_DEPTH) throw new Error('parse: AST too deep');
  }
  function untrackDepth() { depthCounter--; }

  /* ─── Statements ─── */
  function parseBlock(stopWords) {
    const stmts = [];
    let safety = 0;
    while (peek().type !== 'EOF') {
      safety++;
      if (safety > SBX.MAX_TOKENS) throw new Error('parse: block safety');
      if (isKw('end') || isKw('else') || isKw('elseif') || isKw('until')) break;
      if (stopWords && stopWords.includes(peek().value)) break;
      const s = parseStatement();
      if (s) stmts.push(s);
      if (isOp(';')) eat();
    }
    return stmts;
  }

  function parseStatement() {
    trackDepth();
    try {
      if (isKw('local')) return parseLocal();
      if (isKw('if')) return parseIf();
      if (isKw('while')) return parseWhile();
      if (isKw('for')) return parseFor();
      if (isKw('return')) return parseReturn();
      if (isKw('break')) { eat(); return { kind: 'Break', line: peek().line }; }
      if (isKw('function')) return parseFunctionDecl();
      if (isKw('do')) {
        eat();
        const body = parseBlock();
        expectKw('end');
        return { kind: 'Do', body };
      }
      // Expression statement or assignment
      return parseExprOrAssign();
    } finally { untrackDepth(); }
  }

  function parseLocal() {
    const line = eat().line; // 'local'
    if (isKw('function')) {
      eat();
      const name = expect('IDENT').value;
      const fn = parseFunctionBody();
      return { kind: 'LocalFunction', name, body: fn.body, params: fn.params, line };
    }
    const names = [expect('IDENT').value];
    while (isOp(',')) { eat(); names.push(expect('IDENT').value); }
    let values = [];
    if (isOp('=')) {
      eat();
      values.push(parseExpression());
      while (isOp(',')) { eat(); values.push(parseExpression()); }
    }
    return { kind: 'Local', names, values, line };
  }

  function parseIf() {
    const line = eat().line;
    const cond = parseExpression();
    expectKw('then');
    const thenBlock = parseBlock();
    const elseifs = [];
    let elseBlock = null;
    while (isKw('elseif')) {
      eat();
      const c = parseExpression();
      expectKw('then');
      const b = parseBlock();
      elseifs.push({ cond: c, body: b });
    }
    if (isKw('else')) {
      eat();
      elseBlock = parseBlock();
    }
    expectKw('end');
    return { kind: 'If', cond, then: thenBlock, elseifs, else: elseBlock, line };
  }

  function parseWhile() {
    const line = eat().line;
    const cond = parseExpression();
    expectKw('do');
    const body = parseBlock();
    expectKw('end');
    return { kind: 'While', cond, body, line };
  }

  function parseFor() {
    const line = eat().line;
    const firstName = expect('IDENT').value;
    if (isOp('=')) {
      // Numeric: for i = start, end, step do ... end
      eat();
      const start = parseExpression();
      expectOp(',');
      const limit = parseExpression();
      let step = null;
      if (isOp(',')) { eat(); step = parseExpression(); }
      expectKw('do');
      const body = parseBlock();
      expectKw('end');
      return { kind: 'NumericFor', var: firstName, start, limit, step, body, line };
    }
    // Generic: for k, v in expr do ... end
    const vars = [firstName];
    while (isOp(',')) { eat(); vars.push(expect('IDENT').value); }
    expectKw('in');
    const iters = [parseExpression()];
    while (isOp(',')) { eat(); iters.push(parseExpression()); }
    expectKw('do');
    const body = parseBlock();
    expectKw('end');
    return { kind: 'GenericFor', vars, iters, body, line };
  }

  function parseReturn() {
    const line = eat().line;
    const values = [];
    if (peek().type !== 'EOF' && !isKw('end') && !isKw('else') && !isKw('elseif') && !isKw('until') && !isOp(';')) {
      values.push(parseExpression());
      while (isOp(',')) { eat(); values.push(parseExpression()); }
    }
    return { kind: 'Return', values, line };
  }

  function parseFunctionDecl() {
    const line = eat().line; // 'function'
    const path = [expect('IDENT').value];
    let isMethod = false;
    while (isOp('.')) { eat(); path.push(expect('IDENT').value); }
    if (isOp(':')) { eat(); path.push(expect('IDENT').value); isMethod = true; }
    const fn = parseFunctionBody(isMethod);
    return { kind: 'FunctionDecl', path, params: fn.params, body: fn.body, isMethod, line };
  }

  function parseFunctionBody(isMethod = false) {
    expectOp('(');
    const params = [];
    if (isMethod) params.push('self');
    if (!isOp(')')) {
      if (isOp('...')) { params.push('...'); eat(); }
      else {
        params.push(expect('IDENT').value);
        while (isOp(',')) {
          eat();
          if (isOp('...')) { params.push('...'); eat(); break; }
          params.push(expect('IDENT').value);
        }
      }
    }
    expectOp(')');
    const body = parseBlock();
    expectKw('end');
    return { params, body };
  }

  function parseExprOrAssign() {
    const first = parseSuffixed();
    if (isOp(',') || isOp('=')) {
      // Assignment
      const targets = [first];
      while (isOp(',')) { eat(); targets.push(parseSuffixed()); }
      expectOp('=');
      const values = [parseExpression()];
      while (isOp(',')) { eat(); values.push(parseExpression()); }
      return { kind: 'Assign', targets, values, line: first.line };
    }
    return { kind: 'ExprStmt', expr: first, line: first.line };
  }

  /* ─── Expressions (precedence-climbing) ─── */
  // Lua precedence (lowest to highest):
  // or, and, < > <= >= == ~=, .. (right-assoc), + -, * / // %, unary, ^ (right-assoc)
  const BINOPS = {
    'or': { prec: 1, right: false },
    'and': { prec: 2, right: false },
    '<': { prec: 3, right: false }, '>': { prec: 3, right: false },
    '<=': { prec: 3, right: false }, '>=': { prec: 3, right: false },
    '==': { prec: 3, right: false }, '~=': { prec: 3, right: false },
    '..': { prec: 4, right: true },
    '+': { prec: 5, right: false }, '-': { prec: 5, right: false },
    '*': { prec: 6, right: false }, '/': { prec: 6, right: false },
    '//': { prec: 6, right: false }, '%': { prec: 6, right: false },
    '^': { prec: 8, right: true },
  };

  function getBinOp(t) {
    if (t.type === 'KEYWORD' && (t.value === 'or' || t.value === 'and')) return BINOPS[t.value];
    if (t.type === 'OP' && BINOPS[t.value]) return BINOPS[t.value];
    return null;
  }

  function parseExpression(minPrec = 1) {
    trackDepth();
    try {
      let left = parseUnary();
      let safety = 0;
      while (true) {
        safety++;
        if (safety > 1000) throw new Error('parse: expression safety');
        const op = getBinOp(peek());
        if (!op || op.prec < minPrec) break;
        const opToken = eat();
        const opName = opToken.value;
        const nextMin = op.right ? op.prec : op.prec + 1;
        const right = parseExpression(nextMin);
        left = { kind: 'Binary', op: opName, left, right, line: opToken.line };
      }
      return left;
    } finally { untrackDepth(); }
  }

  function parseUnary() {
    if (isKw('not')) { const t = eat(); return { kind: 'Unary', op: 'not', expr: parseUnary(), line: t.line }; }
    if (isOp('-')) { const t = eat(); return { kind: 'Unary', op: '-', expr: parseUnary(), line: t.line }; }
    if (isOp('#')) { const t = eat(); return { kind: 'Unary', op: '#', expr: parseUnary(), line: t.line }; }
    return parseSuffixed();
  }

  function parseSuffixed() {
    let node = parsePrimary();
    let safety = 0;
    while (true) {
      safety++;
      if (safety > 200) throw new Error('parse: suffix safety');
      if (isOp('.')) {
        const t = eat();
        const name = expect('IDENT').value;
        node = { kind: 'Index', obj: node, key: { kind: 'String', value: name, line: t.line }, line: t.line };
      } else if (isOp('[')) {
        const t = eat();
        const key = parseExpression();
        expectOp(']');
        node = { kind: 'Index', obj: node, key, line: t.line };
      } else if (isOp(':')) {
        const t = eat();
        const name = expect('IDENT').value;
        const args = parseCallArgs();
        node = { kind: 'MethodCall', obj: node, method: name, args, line: t.line };
      } else if (isOp('(') || peek().type === 'STRING' || isOp('{')) {
        const args = parseCallArgs();
        node = { kind: 'Call', fn: node, args, line: peek().line };
      } else {
        break;
      }
    }
    return node;
  }

  function parseCallArgs() {
    const t = peek();
    if (t.type === 'STRING') { eat(); return [{ kind: 'String', value: t.value, line: t.line }]; }
    if (isOp('{')) return [parseTableConstructor()];
    expectOp('(');
    const args = [];
    if (!isOp(')')) {
      args.push(parseExpression());
      while (isOp(',')) { eat(); args.push(parseExpression()); }
    }
    expectOp(')');
    return args;
  }

  function parsePrimary() {
    const t = peek();
    if (t.type === 'NUMBER') { eat(); return { kind: 'Number', value: t.value, line: t.line }; }
    if (t.type === 'STRING') { eat(); return { kind: 'String', value: t.value, line: t.line }; }
    if (t.type === 'KEYWORD') {
      if (t.value === 'true') { eat(); return { kind: 'Bool', value: true, line: t.line }; }
      if (t.value === 'false') { eat(); return { kind: 'Bool', value: false, line: t.line }; }
      if (t.value === 'nil') { eat(); return { kind: 'Nil', line: t.line }; }
      if (t.value === 'function') {
        eat();
        const fn = parseFunctionBody();
        return { kind: 'FunctionExpr', params: fn.params, body: fn.body, line: t.line };
      }
    }
    if (t.type === 'IDENT') { eat(); return { kind: 'Name', name: t.value, line: t.line }; }
    if (t.type === 'OP') {
      if (t.value === '(') {
        eat();
        const e = parseExpression();
        expectOp(')');
        return e;
      }
      if (t.value === '{') return parseTableConstructor();
      if (t.value === '...') { eat(); return { kind: 'Varargs', line: t.line }; }
    }
    throw new Error(`parse: unexpected '${t.value}' at line ${t.line}`);
  }

  function parseTableConstructor() {
    const t = expectOp('{');
    const fields = [];
    let safety = 0;
    while (!isOp('}')) {
      safety++;
      if (safety > SBX.MAX_TABLE_SIZE) throw new Error('parse: table too large');
      if (isOp('[')) {
        eat();
        const key = parseExpression();
        expectOp(']');
        expectOp('=');
        const value = parseExpression();
        fields.push({ kind: 'keyed', key, value });
      } else if (peek().type === 'IDENT' && tokens[pos + 1] && tokens[pos + 1].type === 'OP' && tokens[pos + 1].value === '=') {
        const key = eat().value;
        eat(); // =
        const value = parseExpression();
        fields.push({ kind: 'named', name: key, value });
      } else {
        const value = parseExpression();
        fields.push({ kind: 'array', value });
      }
      if (isOp(',') || isOp(';')) eat();
      else break;
    }
    expectOp('}');
    return { kind: 'Table', fields, line: t.line };
  }

  const program = parseBlock();
  if (peek().type !== 'EOF') throw new Error(`parse: extra input at line ${peek().line}`);
  return program;
}

/* ═══════════════════════════════════════════════════════════════
   LUA EVALUATOR — tree-walking interpreter with environment chain
   Values: number, string, boolean, null (nil), Map (table), function
   Multi-return: array of values; single-value contexts take first.
   ═══════════════════════════════════════════════════════════════ */

class LuaEnv {
  constructor(parent = null) {
    this.vars = new Map();
    this.parent = parent;
  }
  define(name, value) { this.vars.set(name, value); }
  get(name) {
    if (this.vars.has(name)) return this.vars.get(name);
    if (this.parent) return this.parent.get(name);
    return null; // Lua: undefined globals are nil
  }
  set(name, value) {
    // Lua: assignment to existing local in any enclosing scope updates that local;
    // assignment to undeclared name creates a global at the root.
    let e = this;
    while (e) {
      if (e.vars.has(name)) { e.vars.set(name, value); return; }
      e = e.parent;
    }
    // Walk to root
    let root = this;
    while (root.parent) root = root.parent;
    root.vars.set(name, value);
  }
}

class LuaTable {
  constructor() {
    this.arr = [];     // 1-indexed array part (we use 0-indexed JS but expose 1-indexed)
    this.hash = new Map();
    this._isLuaTable = true;
  }
  get(key) {
    if (typeof key === 'number' && Number.isInteger(key) && key >= 1) {
      return this.arr[key - 1] !== undefined ? this.arr[key - 1] : null;
    }
    return this.hash.has(key) ? this.hash.get(key) : null;
  }
  set(key, value) {
    if (key === null || key === undefined) throw new Error('table index is nil');
    if (typeof key === 'number' && Number.isInteger(key) && key >= 1) {
      if (value === null) {
        if (key <= this.arr.length) this.arr[key - 1] = null;
      } else {
        this.arr[key - 1] = value;
      }
      return;
    }
    if (value === null) this.hash.delete(key);
    else this.hash.set(key, value);
  }
  length() {
    // Length is the array part's length (border).
    // Lua: any n where t[n] != nil and t[n+1] == nil. Approximation: count from start.
    let n = 0;
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i] === null || this.arr[i] === undefined) break;
      n++;
    }
    return n;
  }
  entries() {
    const out = [];
    for (let i = 0; i < this.arr.length; i++) {
      if (this.arr[i] !== null && this.arr[i] !== undefined) out.push([i + 1, this.arr[i]]);
    }
    for (const [k, v] of this.hash) out.push([k, v]);
    return out;
  }
}

function isLuaTable(v) { return v && typeof v === 'object' && v._isLuaTable; }
function isLuaFunction(v) { return v && typeof v === 'function' && v._isLuaFunction; }
function isTruthy(v) { return v !== null && v !== false; }

function luaTypeOf(v) {
  if (v === null) return 'nil';
  if (typeof v === 'boolean') return 'boolean';
  if (typeof v === 'number') return 'number';
  if (typeof v === 'string') return 'string';
  if (isLuaTable(v)) return 'table';
  if (isLuaFunction(v)) return 'function';
  return 'userdata';
}

function luaToString(v) {
  if (v === null) return 'nil';
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') {
    if (Number.isInteger(v)) return String(v);
    return String(v);
  }
  if (typeof v === 'string') return v;
  if (isLuaTable(v)) return `table: 0x${Math.floor(Math.random() * 0xffffff).toString(16)}`;
  if (isLuaFunction(v)) return `function: 0x${Math.floor(Math.random() * 0xffffff).toString(16)}`;
  return String(v);
}

function luaToNumber(v) {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return null;
    const n = Number(trimmed);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function luaArith(op, a, b) {
  const na = luaToNumber(a);
  const nb = luaToNumber(b);
  if (na === null || nb === null) {
    throw new Error(`attempt to perform arithmetic on a ${luaTypeOf(na === null ? a : b)} value`);
  }
  switch (op) {
    case '+': return na + nb;
    case '-': return na - nb;
    case '*': return na * nb;
    case '/': return na / nb;
    case '//': return Math.floor(na / nb);
    case '%': return na - Math.floor(na / nb) * nb;
    case '^': return Math.pow(na, nb);
  }
  throw new Error(`bad arith op: ${op}`);
}

function luaCompare(op, a, b) {
  if (typeof a === 'number' && typeof b === 'number') {
    switch (op) {
      case '<': return a < b;
      case '<=': return a <= b;
      case '>': return a > b;
      case '>=': return a >= b;
    }
  }
  if (typeof a === 'string' && typeof b === 'string') {
    switch (op) {
      case '<': return a < b;
      case '<=': return a <= b;
      case '>': return a > b;
      case '>=': return a >= b;
    }
  }
  throw new Error(`attempt to compare ${luaTypeOf(a)} with ${luaTypeOf(b)}`);
}

function luaEquals(a, b) {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  return a === b;
}

/* ─── Evaluator ─── */
function makeLuaRuntime() {
  // Bounded execution context
  const ctx = {
    steps: 0,
    stackDepth: 0,
    output: [],   // lines from print()
    events: [],   // event flow log: { side, kind, name, payload, time }
    eventHandlers: new Map(),  // event name -> [handler functions]
    registeredNet: new Set(),  // event names registered for network
    threadsCreated: 0,
    side: 'shared',  // 'client', 'server', 'shared'
    tick: 0,         // virtual tick counter
    callDepth: 0,
  };

  function step() {
    ctx.steps++;
    if (ctx.steps > SBX.MAX_EVAL_STEPS) {
      throw new Error(`execution exceeded ${SBX.MAX_EVAL_STEPS} steps (likely an infinite loop without Wait())`);
    }
  }

  function emit(line) {
    if (ctx.output.length >= SBX.MAX_OUTPUT_LINES) {
      if (ctx.output[ctx.output.length - 1] !== '... (output truncated)') {
        ctx.output.push('... (output truncated)');
      }
      return;
    }
    ctx.output.push(line);
  }

  // ─── Stdlib ───
  function makeStdlib(env) {
    const print = (...args) => {
      emit(args.map(luaToString).join('\t'));
      return [];
    };
    print._isLuaFunction = true;
    print._name = 'print';

    const tostring = (v) => [luaToString(v)];
    tostring._isLuaFunction = true;

    const tonumber = (v) => [luaToNumber(v)];
    tonumber._isLuaFunction = true;

    const luaType = (v) => [luaTypeOf(v)];
    luaType._isLuaFunction = true;

    const ipairs = (t) => {
      if (!isLuaTable(t)) throw new Error('ipairs: argument must be a table');
      let i = 0;
      const iter = () => {
        i++;
        const v = t.get(i);
        if (v === null) return [null];
        return [i, v];
      };
      iter._isLuaFunction = true;
      return [iter, t, 0];
    };
    ipairs._isLuaFunction = true;

    const pairs = (t) => {
      if (!isLuaTable(t)) throw new Error('pairs: argument must be a table');
      const entries = t.entries();
      let idx = 0;
      const iter = () => {
        if (idx >= entries.length) return [null];
        const [k, v] = entries[idx++];
        return [k, v];
      };
      iter._isLuaFunction = true;
      return [iter, t, null];
    };
    pairs._isLuaFunction = true;

    // math library
    const mathLib = new LuaTable();
    const mfns = {
      floor: (n) => [Math.floor(luaToNumber(n))],
      ceil: (n) => [Math.ceil(luaToNumber(n))],
      abs: (n) => [Math.abs(luaToNumber(n))],
      max: (...a) => [Math.max(...a.map(luaToNumber))],
      min: (...a) => [Math.min(...a.map(luaToNumber))],
      random: (a, b) => {
        if (a === undefined) return [Math.random()];
        if (b === undefined) return [Math.floor(Math.random() * a) + 1];
        return [Math.floor(Math.random() * (b - a + 1)) + a];
      },
      sqrt: (n) => [Math.sqrt(luaToNumber(n))],
      pi: 0,
    };
    for (const [k, v] of Object.entries(mfns)) {
      if (typeof v === 'function') { v._isLuaFunction = true; v._name = `math.${k}`; mathLib.set(k, v); }
      else mathLib.set(k, v);
    }
    mathLib.set('pi', Math.PI);
    mathLib.set('huge', Infinity);

    // string library
    const stringLib = new LuaTable();
    const sfns = {
      format: (fmt, ...args) => {
        if (typeof fmt !== 'string') throw new Error('string.format: bad fmt');
        let out = '';
        let ai = 0;
        let i = 0;
        let safety = 0;
        while (i < fmt.length) {
          safety++;
          if (safety > 1000) break;
          if (fmt[i] === '%') {
            i++;
            const spec = fmt[i];
            if (spec === 'd' || spec === 'i') { out += String(Math.trunc(luaToNumber(args[ai++]))); }
            else if (spec === 'f') { out += luaToNumber(args[ai++]).toFixed(6); }
            else if (spec === 's') { out += luaToString(args[ai++]); }
            else if (spec === 'x') { out += Math.trunc(luaToNumber(args[ai++])).toString(16); }
            else if (spec === '%') { out += '%'; }
            else out += '%' + spec;
            i++;
          } else { out += fmt[i++]; }
        }
        return [out];
      },
      sub: (s, i, j) => {
        s = String(s);
        // Lua sub is 1-indexed
        if (i < 0) i = Math.max(s.length + i + 1, 1);
        else if (i === 0) i = 1;
        if (j === undefined) j = s.length;
        else if (j < 0) j = s.length + j + 1;
        return [s.slice(i - 1, j)];
      },
      upper: (s) => [String(s).toUpperCase()],
      lower: (s) => [String(s).toLowerCase()],
      len: (s) => [String(s).length],
      rep: (s, n) => [String(s).repeat(Math.max(0, Math.min(Math.trunc(n), 1000)))],
      find: (s, pattern) => {
        // Literal substring find only (not full Lua patterns — too complex for sandbox)
        const idx = String(s).indexOf(String(pattern));
        if (idx === -1) return [null];
        return [idx + 1, idx + String(pattern).length];
      },
      gsub: (s, pattern, replacement) => {
        // Literal replacement only
        s = String(s); pattern = String(pattern); replacement = String(replacement);
        let count = 0;
        let i = s.indexOf(pattern);
        let result = '';
        let prev = 0;
        let safety = 0;
        while (i !== -1 && safety < 1000) {
          safety++;
          result += s.slice(prev, i) + replacement;
          count++;
          prev = i + pattern.length;
          if (pattern.length === 0) break;
          i = s.indexOf(pattern, prev);
        }
        result += s.slice(prev);
        return [result, count];
      },
    };
    for (const [k, v] of Object.entries(sfns)) {
      v._isLuaFunction = true; v._name = `string.${k}`; stringLib.set(k, v);
    }

    // table library
    const tableLib = new LuaTable();
    const tfns = {
      insert: (t, ...rest) => {
        if (!isLuaTable(t)) throw new Error('table.insert: bad table');
        if (rest.length === 1) {
          const v = rest[0];
          t.set(t.length() + 1, v);
        } else {
          const pos = luaToNumber(rest[0]);
          const v = rest[1];
          // Shift later entries up
          const len = t.length();
          for (let i = len; i >= pos; i--) t.set(i + 1, t.get(i));
          t.set(pos, v);
        }
        return [];
      },
      remove: (t, pos) => {
        if (!isLuaTable(t)) throw new Error('table.remove: bad table');
        const len = t.length();
        if (pos === undefined) pos = len;
        const removed = t.get(pos);
        for (let i = pos; i < len; i++) t.set(i, t.get(i + 1));
        t.set(len, null);
        return [removed];
      },
      concat: (t, sep) => {
        if (!isLuaTable(t)) throw new Error('table.concat: bad table');
        sep = sep === undefined ? '' : String(sep);
        const parts = [];
        const len = t.length();
        for (let i = 1; i <= len; i++) parts.push(luaToString(t.get(i)));
        return [parts.join(sep)];
      },
    };
    for (const [k, v] of Object.entries(tfns)) {
      v._isLuaFunction = true; v._name = `table.${k}`; tableLib.set(k, v);
    }

    env.define('print', print);
    env.define('tostring', tostring);
    env.define('tonumber', tonumber);
    env.define('type', luaType);
    env.define('ipairs', ipairs);
    env.define('pairs', pairs);
    env.define('math', mathLib);
    env.define('string', stringLib);
    env.define('table', tableLib);

    // FiveM stubs
    const createThread = (fn) => {
      ctx.threadsCreated++;
      if (ctx.threadsCreated > 50) throw new Error('too many threads (max 50)');
      // Execute synchronously in the sandbox; real FiveM is async.
      if (isLuaFunction(fn)) {
        try { fn(); } catch (e) {
          if (e._isLuaBreak) return [];
          throw e;
        }
      }
      return [];
    };
    createThread._isLuaFunction = true;
    createThread._name = 'CreateThread';

    const wait = (ms) => {
      ctx.tick++;
      // In sandbox we don't actually wait; we count "yields" via the step counter.
      // This means while-true-Wait(0) loops MUST hit the step limit and bail.
      step(); step(); step(); step();
      return [];
    };
    wait._isLuaFunction = true;
    wait._name = 'Wait';

    const citizen = new LuaTable();
    citizen.set('CreateThread', createThread);
    citizen.set('Wait', wait);
    env.define('Citizen', citizen);
    env.define('CreateThread', createThread);
    env.define('Wait', wait);

    const registerNetEvent = (name) => {
      if (typeof name !== 'string') throw new Error('RegisterNetEvent: name must be string');
      ctx.registeredNet.add(name);
      ctx.events.push({ side: ctx.side, kind: 'register', name, payload: null, time: ctx.tick });
      return [];
    };
    registerNetEvent._isLuaFunction = true;

    const addEventHandler = (name, handler) => {
      if (typeof name !== 'string') throw new Error('AddEventHandler: name must be string');
      if (!isLuaFunction(handler)) throw new Error('AddEventHandler: handler must be a function');
      if (!ctx.eventHandlers.has(name)) ctx.eventHandlers.set(name, []);
      ctx.eventHandlers.get(name).push(handler);
      ctx.events.push({ side: ctx.side, kind: 'handler', name, payload: null, time: ctx.tick });
      return [];
    };
    addEventHandler._isLuaFunction = true;

    const triggerEvent = (name, ...args) => {
      if (typeof name !== 'string') throw new Error('TriggerEvent: name must be string');
      ctx.events.push({ side: ctx.side, kind: 'local', name, payload: args, time: ctx.tick });
      const handlers = ctx.eventHandlers.get(name) || [];
      for (const h of handlers) h(...args);
      return [];
    };
    triggerEvent._isLuaFunction = true;

    const triggerServerEvent = (name, ...args) => {
      if (typeof name !== 'string') throw new Error('TriggerServerEvent: name must be string');
      ctx.events.push({ side: 'client->server', kind: 'net', name, payload: args, time: ctx.tick });
      // In sandbox, fire it locally for educational purposes
      const handlers = ctx.eventHandlers.get(name) || [];
      for (const h of handlers) {
        if (ctx.registeredNet.has(name)) h(...args);
        else ctx.events.push({ side: 'warn', kind: 'unregistered', name, payload: null, time: ctx.tick });
      }
      return [];
    };
    triggerServerEvent._isLuaFunction = true;

    const triggerClientEvent = (name, target, ...args) => {
      if (typeof name !== 'string') throw new Error('TriggerClientEvent: name must be string');
      ctx.events.push({ side: 'server->client', kind: 'net', name, payload: [target, ...args], time: ctx.tick });
      const handlers = ctx.eventHandlers.get(name) || [];
      for (const h of handlers) {
        if (ctx.registeredNet.has(name)) h(...args);
      }
      return [];
    };
    triggerClientEvent._isLuaFunction = true;

    env.define('RegisterNetEvent', registerNetEvent);
    env.define('AddEventHandler', addEventHandler);
    env.define('TriggerEvent', triggerEvent);
    env.define('TriggerServerEvent', triggerServerEvent);
    env.define('TriggerClientEvent', triggerClientEvent);
  }

  function evalProgram(ast, env) {
    for (const stmt of ast) {
      const result = evalStatement(stmt, env);
      if (result && result.kind === 'return') return result.values;
      if (result && result.kind === 'break') return null;
    }
    return null;
  }

  function evalStatement(stmt, env) {
    step();
    switch (stmt.kind) {
      case 'Local': {
        const values = [];
        for (let i = 0; i < stmt.values.length; i++) {
          const v = evalExpression(stmt.values[i], env, i === stmt.values.length - 1);
          if (Array.isArray(v)) values.push(...v);
          else values.push(v);
        }
        for (let i = 0; i < stmt.names.length; i++) {
          env.define(stmt.names[i], values[i] !== undefined ? values[i] : null);
        }
        return null;
      }
      case 'LocalFunction': {
        // 'local function f() ... end' — declare first, then assign (for recursion)
        env.define(stmt.name, null);
        const fn = makeLuaFunction(stmt.params, stmt.body, env);
        fn._name = stmt.name;
        env.define(stmt.name, fn);
        return null;
      }
      case 'Assign': {
        const values = [];
        for (let i = 0; i < stmt.values.length; i++) {
          const v = evalExpression(stmt.values[i], env, i === stmt.values.length - 1);
          if (Array.isArray(v)) values.push(...v);
          else values.push(v);
        }
        for (let i = 0; i < stmt.targets.length; i++) {
          assignTo(stmt.targets[i], values[i] !== undefined ? values[i] : null, env);
        }
        return null;
      }
      case 'ExprStmt': {
        evalExpression(stmt.expr, env, false);
        return null;
      }
      case 'If': {
        if (isTruthy(evalExpression(stmt.cond, env, false))) {
          return evalProgram(stmt.then, new LuaEnv(env));
        }
        for (const elif of stmt.elseifs) {
          if (isTruthy(evalExpression(elif.cond, env, false))) {
            return evalProgram(elif.body, new LuaEnv(env));
          }
        }
        if (stmt.else) return evalProgram(stmt.else, new LuaEnv(env));
        return null;
      }
      case 'While': {
        let safety = 0;
        while (isTruthy(evalExpression(stmt.cond, env, false))) {
          safety++;
          if (safety > SBX.MAX_EVAL_STEPS) throw new Error('while: safety');
          step();
          const r = evalProgram(stmt.body, new LuaEnv(env));
          if (r === null && safety > SBX.MAX_EVAL_STEPS) throw new Error('runaway while');
          if (r && r.kind === 'return') return r;
        }
        return null;
      }
      case 'NumericFor': {
        const start = luaToNumber(evalExpression(stmt.start, env, false));
        const limit = luaToNumber(evalExpression(stmt.limit, env, false));
        const stepVal = stmt.step ? luaToNumber(evalExpression(stmt.step, env, false)) : 1;
        if (start === null || limit === null || stepVal === null) throw new Error("'for' bounds must be numbers");
        if (stepVal === 0) throw new Error("'for' step is zero");
        let i = start;
        let safety = 0;
        while ((stepVal > 0 && i <= limit) || (stepVal < 0 && i >= limit)) {
          safety++;
          if (safety > SBX.MAX_EVAL_STEPS) throw new Error('for: safety');
          step();
          const loopEnv = new LuaEnv(env);
          loopEnv.define(stmt.var, i);
          const r = evalProgram(stmt.body, loopEnv);
          if (r && r.kind === 'return') return r;
          i += stepVal;
        }
        return null;
      }
      case 'GenericFor': {
        const iterValues = [];
        for (let i = 0; i < stmt.iters.length; i++) {
          const v = evalExpression(stmt.iters[i], env, i === stmt.iters.length - 1);
          if (Array.isArray(v)) iterValues.push(...v);
          else iterValues.push(v);
        }
        const iterFn = iterValues[0];
        const state = iterValues[1];
        let control = iterValues[2];
        if (!isLuaFunction(iterFn)) throw new Error('generic for: iterator must be a function');
        let safety = 0;
        while (true) {
          safety++;
          if (safety > SBX.MAX_EVAL_STEPS) throw new Error('generic for: safety');
          step();
          const results = iterFn(state, control);
          if (!Array.isArray(results) || results[0] === null) break;
          control = results[0];
          const loopEnv = new LuaEnv(env);
          for (let i = 0; i < stmt.vars.length; i++) {
            loopEnv.define(stmt.vars[i], results[i] !== undefined ? results[i] : null);
          }
          const r = evalProgram(stmt.body, loopEnv);
          if (r && r.kind === 'return') return r;
        }
        return null;
      }
      case 'Return': {
        const values = [];
        for (let i = 0; i < stmt.values.length; i++) {
          const v = evalExpression(stmt.values[i], env, i === stmt.values.length - 1);
          if (Array.isArray(v)) values.push(...v);
          else values.push(v);
        }
        return { kind: 'return', values };
      }
      case 'Break': return { kind: 'break' };
      case 'Do': return evalProgram(stmt.body, new LuaEnv(env));
      case 'FunctionDecl': {
        const fn = makeLuaFunction(stmt.params, stmt.body, env);
        fn._name = stmt.path.join('.');
        if (stmt.path.length === 1) {
          env.set(stmt.path[0], fn);
        } else {
          let obj = env.get(stmt.path[0]);
          if (!isLuaTable(obj)) throw new Error(`function decl: ${stmt.path[0]} is not a table`);
          for (let i = 1; i < stmt.path.length - 1; i++) {
            obj = obj.get(stmt.path[i]);
            if (!isLuaTable(obj)) throw new Error(`function decl: bad path`);
          }
          obj.set(stmt.path[stmt.path.length - 1], fn);
        }
        return null;
      }
    }
    throw new Error(`unsupported statement: ${stmt.kind}`);
  }

  function assignTo(target, value, env) {
    if (target.kind === 'Name') {
      env.set(target.name, value);
      return;
    }
    if (target.kind === 'Index') {
      const obj = evalExpression(target.obj, env, false);
      const key = evalExpression(target.key, env, false);
      if (!isLuaTable(obj)) throw new Error(`attempt to index a ${luaTypeOf(obj)} value`);
      obj.set(key, value);
      return;
    }
    throw new Error(`bad assignment target`);
  }

  function evalExpression(expr, env, multireturn = false) {
    step();
    switch (expr.kind) {
      case 'Number': return expr.value;
      case 'String': return expr.value;
      case 'Bool': return expr.value;
      case 'Nil': return null;
      case 'Name': return env.get(expr.name);
      case 'Varargs': {
        const varargs = env.get('...');
        return Array.isArray(varargs) ? varargs : [];
      }
      case 'Binary': return evalBinary(expr, env);
      case 'Unary': return evalUnary(expr, env);
      case 'Index': {
        const obj = evalExpression(expr.obj, env, false);
        if (obj === null) throw new Error(`attempt to index a nil value (line ${expr.line})`);
        if (isLuaTable(obj)) {
          const key = evalExpression(expr.key, env, false);
          return obj.get(key);
        }
        throw new Error(`attempt to index a ${luaTypeOf(obj)} value`);
      }
      case 'Call': return evalCall(expr, env, multireturn);
      case 'MethodCall': return evalMethodCall(expr, env, multireturn);
      case 'Table': return evalTableConstructor(expr, env);
      case 'FunctionExpr': return makeLuaFunction(expr.params, expr.body, env);
    }
    throw new Error(`unsupported expr: ${expr.kind}`);
  }

  function evalBinary(expr, env) {
    const op = expr.op;
    if (op === 'and') {
      const l = evalExpression(expr.left, env, false);
      if (!isTruthy(l)) return l;
      return evalExpression(expr.right, env, false);
    }
    if (op === 'or') {
      const l = evalExpression(expr.left, env, false);
      if (isTruthy(l)) return l;
      return evalExpression(expr.right, env, false);
    }
    const l = evalExpression(expr.left, env, false);
    const r = evalExpression(expr.right, env, false);
    if (op === '..') return luaToString(l) + luaToString(r);
    if (op === '==') return luaEquals(l, r);
    if (op === '~=') return !luaEquals(l, r);
    if (op === '<' || op === '<=' || op === '>' || op === '>=') return luaCompare(op, l, r);
    return luaArith(op, l, r);
  }

  function evalUnary(expr, env) {
    const v = evalExpression(expr.expr, env, false);
    if (expr.op === '-') return -luaToNumber(v);
    if (expr.op === 'not') return !isTruthy(v);
    if (expr.op === '#') {
      if (typeof v === 'string') return v.length;
      if (isLuaTable(v)) return v.length();
      throw new Error(`# on ${luaTypeOf(v)}`);
    }
    throw new Error(`bad unary: ${expr.op}`);
  }

  function evalCall(expr, env, multireturn) {
    const fn = evalExpression(expr.fn, env, false);
    if (!isLuaFunction(fn)) throw new Error(`attempt to call a ${luaTypeOf(fn)} value`);
    const args = [];
    for (let i = 0; i < expr.args.length; i++) {
      const v = evalExpression(expr.args[i], env, i === expr.args.length - 1);
      if (Array.isArray(v)) args.push(...v);
      else args.push(v);
    }
    ctx.callDepth++;
    if (ctx.callDepth > SBX.MAX_STACK_DEPTH) throw new Error('stack overflow');
    try {
      const result = fn(...args);
      if (!multireturn && Array.isArray(result)) return result[0] !== undefined ? result[0] : null;
      return result;
    } finally { ctx.callDepth--; }
  }

  function evalMethodCall(expr, env, multireturn) {
    const obj = evalExpression(expr.obj, env, false);
    if (!isLuaTable(obj)) throw new Error(`attempt to index a ${luaTypeOf(obj)} value for method call`);
    const fn = obj.get(expr.method);
    if (!isLuaFunction(fn)) throw new Error(`attempt to call method '${expr.method}' on ${luaTypeOf(obj)}`);
    const args = [obj];
    for (let i = 0; i < expr.args.length; i++) {
      const v = evalExpression(expr.args[i], env, i === expr.args.length - 1);
      if (Array.isArray(v)) args.push(...v);
      else args.push(v);
    }
    ctx.callDepth++;
    if (ctx.callDepth > SBX.MAX_STACK_DEPTH) throw new Error('stack overflow');
    try {
      const result = fn(...args);
      if (!multireturn && Array.isArray(result)) return result[0] !== undefined ? result[0] : null;
      return result;
    } finally { ctx.callDepth--; }
  }

  function evalTableConstructor(expr, env) {
    const t = new LuaTable();
    let arrayIdx = 1;
    for (const f of expr.fields) {
      if (f.kind === 'array') {
        const v = evalExpression(f.value, env, false);
        t.set(arrayIdx++, v);
      } else if (f.kind === 'named') {
        t.set(f.name, evalExpression(f.value, env, false));
      } else if (f.kind === 'keyed') {
        const k = evalExpression(f.key, env, false);
        t.set(k, evalExpression(f.value, env, false));
      }
    }
    return t;
  }

  function makeLuaFunction(params, body, closureEnv) {
    const fn = (...args) => {
      const env = new LuaEnv(closureEnv);
      let i = 0;
      let hasVarargs = false;
      for (const p of params) {
        if (p === '...') {
          env.define('...', args.slice(i));
          hasVarargs = true;
          break;
        }
        env.define(p, args[i] !== undefined ? args[i] : null);
        i++;
      }
      const result = evalProgram(body, env);
      if (result === null) return [];
      return result;
    };
    fn._isLuaFunction = true;
    return fn;
  }

  return { ctx, makeStdlib, evalProgram, step };
}

function executeLuaSafe(src, side = 'shared') {
  if (typeof src !== 'string') return { ok: false, error: 'source must be string', output: [], events: [] };
  if (src.length === 0) return { ok: true, output: [], events: [], error: null };
  try {
    const ast = luaParse(src);
    const rt = makeLuaRuntime();
    rt.ctx.side = side;
    const env = new LuaEnv();
    rt.makeStdlib(env);
    rt.evalProgram(ast, env);
    return { ok: true, output: rt.ctx.output, events: rt.ctx.events, error: null, steps: rt.ctx.steps };
  } catch (e) {
    return { ok: false, error: e.message || String(e), output: [], events: [], steps: 0 };
  }
}

/* ═══════════════════════════════════════════════════════════════
   EVENT FLOW SIMULATOR — visualize client↔server RPC with the
   security boundary as a real wall.
   ═══════════════════════════════════════════════════════════════ */

function simulateEventFlow(scenario) {
  // scenario: { steps: [{ from: 'client'|'server', op: 'trigger'|'register'|'handle', name, payload, validates? }] }
  if (!scenario || !Array.isArray(scenario.steps)) {
    return { ok: false, error: 'scenario.steps required', flow: [] };
  }
  if (scenario.steps.length > 50) return { ok: false, error: 'too many steps', flow: [] };

  const flow = [];
  const registered = { client: new Set(), server: new Set() };
  const handlers = { client: new Map(), server: new Map() };
  let safety = 0;

  for (const s of scenario.steps) {
    safety++;
    if (safety > 100) break;
    if (!s.from || !s.op) continue;

    if (s.op === 'register') {
      registered[s.from].add(s.name);
      flow.push({ side: s.from, kind: 'register', name: s.name, note: `${s.from}: RegisterNetEvent('${s.name}')` });
    } else if (s.op === 'handle') {
      if (!handlers[s.from].has(s.name)) handlers[s.from].set(s.name, []);
      handlers[s.from].get(s.name).push({ validates: s.validates });
      flow.push({ side: s.from, kind: 'handle', name: s.name, note: `${s.from}: AddEventHandler('${s.name}', ...)` });
    } else if (s.op === 'trigger') {
      const target = s.from === 'client' ? 'server' : 'client';
      flow.push({ side: s.from, kind: 'trigger-out', name: s.name, payload: s.payload, note: `${s.from} fires Trigger${target === 'server' ? 'Server' : 'Client'}Event('${s.name}', ${JSON.stringify(s.payload)})` });
      // Crosses the wire — log the crossing
      flow.push({ side: 'wire', kind: 'crosses-wire', name: s.name, payload: s.payload, note: `→ across the network (UNTRUSTED on receiving side)` });
      // Receiver side
      if (!registered[target].has(s.name)) {
        flow.push({ side: target, kind: 'dropped', name: s.name, note: `${target}: event NOT registered — silently dropped (need RegisterNetEvent on this side)` });
        continue;
      }
      const targetHandlers = handlers[target].get(s.name) || [];
      if (targetHandlers.length === 0) {
        flow.push({ side: target, kind: 'no-handler', name: s.name, note: `${target}: event registered, no handler attached` });
        continue;
      }
      for (const h of targetHandlers) {
        if (target === 'server' && !h.validates) {
          flow.push({ side: target, kind: 'unsafe-handle', name: s.name, payload: s.payload, note: `${target}: HANDLED — but did NOT validate input. EXPLOIT RISK.` });
        } else {
          flow.push({ side: target, kind: 'handle', name: s.name, payload: s.payload, note: `${target}: handled${h.validates ? ' (validated)' : ''}` });
        }
      }
    }
  }
  return { ok: true, flow, error: null };
}

/* ═══════════════════════════════════════════════════════════════
   FXMANIFEST BUILDER — generate + validate
   ═══════════════════════════════════════════════════════════════ */

function buildFxManifest(spec) {
  if (!spec || typeof spec !== 'object') return { ok: false, error: 'spec required', text: '' };
  const errors = [];

  // Validate inputs
  if (!spec.game || !['gta5', 'rdr3', 'common'].includes(spec.game)) {
    errors.push("game must be 'gta5', 'rdr3', or 'common'");
  }
  if (!spec.fx_version) errors.push("fx_version required (try 'cerulean')");
  if (!spec.author) errors.push("author required");
  if (!spec.version) errors.push("version required (e.g., '1.0.0')");
  if (!spec.description) errors.push("description required");

  if (errors.length > 0) return { ok: false, error: errors.join('; '), text: '' };

  const lines = [];
  lines.push(`-- fxmanifest.lua`);
  lines.push(`-- Generated by FiveM Atlas sandbox`);
  lines.push(``);
  lines.push(`fx_version '${spec.fx_version}'`);
  lines.push(`game '${spec.game}'`);
  lines.push(``);
  lines.push(`author '${spec.author}'`);
  lines.push(`description '${spec.description}'`);
  lines.push(`version '${spec.version}'`);
  if (spec.repository) lines.push(`repository '${spec.repository}'`);
  lines.push(``);

  if (spec.shared_scripts && spec.shared_scripts.length > 0) {
    lines.push(`shared_scripts {`);
    for (const s of spec.shared_scripts) lines.push(`  '${s}',`);
    lines.push(`}`);
    lines.push(``);
  }
  if (spec.server_scripts && spec.server_scripts.length > 0) {
    lines.push(`server_scripts {`);
    for (const s of spec.server_scripts) lines.push(`  '${s}',`);
    lines.push(`}`);
    lines.push(``);
  }
  if (spec.client_scripts && spec.client_scripts.length > 0) {
    lines.push(`client_scripts {`);
    for (const s of spec.client_scripts) lines.push(`  '${s}',`);
    lines.push(`}`);
    lines.push(``);
  }
  if (spec.ui_page) {
    lines.push(`ui_page '${spec.ui_page}'`);
    lines.push(``);
  }
  if (spec.files && spec.files.length > 0) {
    lines.push(`files {`);
    for (const f of spec.files) lines.push(`  '${f}',`);
    lines.push(`}`);
    lines.push(``);
  }
  if (spec.dependencies && spec.dependencies.length > 0) {
    lines.push(`dependencies {`);
    for (const d of spec.dependencies) lines.push(`  '${d}',`);
    lines.push(`}`);
    lines.push(``);
  }
  if (spec.lua54) lines.push(`lua54 'yes'`);

  return { ok: true, error: null, text: lines.join('\n').trim() + '\n' };
}

/* ─── Storage helpers — validated, no silent catches ─── */
const STORAGE_PREFIX = 'fivematlas:';

async function loadKey(key) {
  if (typeof key !== 'string' || key.length === 0) return null;
  try {
    const result = await window.storage.get(STORAGE_PREFIX + key);
    if (!result || typeof result.value !== 'string') return null;
    return JSON.parse(result.value);
  } catch (e) {
    console.warn(`[fivematlas] storage.get failed for "${key}":`, e?.message || e);
    return null;
  }
}

async function saveKey(key, value) {
  if (typeof key !== 'string' || key.length === 0) return false;
  try {
    await window.storage.set(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[fivematlas] storage.set failed for "${key}":`, e?.message || e);
    return false;
  }
}

/* ─── Sandbox challenges ─── */
const CHALLENGES = [
  { id: 'lua-hello', title: '01 · Lua hello', desc: "Write basic Lua. Print, variables, tables. Click 'Run' to execute." },
  { id: 'lua-loop', title: '02 · Loop with Wait', desc: "while-true loops MUST Wait() or you'll time out. Try removing the Wait and see the step limit kick in." },
  { id: 'lua-event', title: '03 · Local event', desc: "RegisterNetEvent + AddEventHandler + TriggerEvent. The basic event pattern." },
  { id: 'event-flow', title: '04 · Client→Server flow', desc: "Visualize a client triggering a server event. See what crosses the wire." },
  { id: 'event-unsafe', title: '05 · Unsafe handler', desc: "Server handles client event without validation. See the exploit risk highlighted." },
  { id: 'event-safe', title: '06 · Safe handler', desc: "Same flow with server-side validation. The right pattern." },
  { id: 'manifest', title: '07 · fxmanifest builder', desc: "Build a working fxmanifest.lua via form. Validates required fields." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function FiveMAtlas() {
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
    return () => { try { document.head.removeChild(link); } catch (e) { /* link may already be gone */ } };
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
    navigator.clipboard.writeText(text).catch(e => console.warn('[fivematlas] copy failed:', e?.message));
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };
  const toggleCheck = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const markComplete = (i) => setCompleted(prev => new Set([...prev, i]));
  const answerQuiz = (qid, choice, correct) => {
    setQuizState(prev => ({ ...prev, [qid]: { choice, correct: choice === correct } }));
  };

  /* ─── UI primitives ─── */
  const Code = ({ children, id, lang = 'lua' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-pink-300 transition-colors">
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
      info: { border: 'border-pink-300/40', bg: 'bg-pink-300/5', text: 'text-pink-300', label: 'NOTE' },
      warn: { border: 'border-amber-300/50', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'GOTCHA' },
      tip: { border: 'border-cyan-400/40', bg: 'bg-cyan-400/5', text: 'text-cyan-300', label: 'TIP' },
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
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-pink-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-pink-300' : 'text-zinc-300'}`}
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-pink-300 border-pink-300' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-pink-300 bg-pink-300/10 text-pink-200' :
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
        className="border-b border-dotted border-pink-300/60 text-pink-300 hover:text-pink-200 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-pink-300 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-pink-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* FiveM architecture diagram — client + fivem + wire + server + resources + oxmysql + mysql + txadmin + nui */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap a node · the wire is the security boundary
        </div>
        <svg viewBox="0 0 290 270" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="fmarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          {/* client <-> fivem */}
          <line x1="90" y1="44" x2="110" y2="44" stroke="#52525b" markerEnd="url(#fmarr)" />
          <line x1="110" y1="44" x2="90" y2="44" stroke="#52525b" markerEnd="url(#fmarr)" />
          {/* fivem -> wire -> server */}
          <line x1="145" y1="58" x2="145" y2="80" stroke="#fb7185" strokeWidth="2" markerEnd="url(#fmarr)" />
          <line x1="145" y1="98" x2="145" y2="120" stroke="#fb7185" strokeWidth="2" markerEnd="url(#fmarr)" />
          {/* server <-> resources */}
          <line x1="110" y1="134" x2="90" y2="134" stroke="#52525b" markerEnd="url(#fmarr)" />
          <line x1="90" y1="134" x2="110" y2="134" stroke="#52525b" markerEnd="url(#fmarr)" />
          {/* server -> oxmysql -> mysql */}
          <line x1="180" y1="134" x2="200" y2="134" stroke="#52525b" markerEnd="url(#fmarr)" />
          <line x1="235" y1="148" x2="235" y2="170" stroke="#52525b" markerEnd="url(#fmarr)" />
          {/* server -> txadmin */}
          <line x1="55" y1="148" x2="55" y2="170" stroke="#52525b" markerEnd="url(#fmarr)" />
          {/* client -> nui */}
          <line x1="55" y1="58" x2="55" y2="220" stroke="#52525b" strokeDasharray="2,2" />
          {ARCH_NODES.map(n => {
            const isSel = archSelected === n.id;
            return (
              <g key={n.id} onClick={() => setArchSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={isSel ? n.color + '30' : n.color + '12'} stroke={n.color}
                  strokeWidth={isSel ? '2' : '1'} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle"
                  fill="#e4e4e7" fontSize="9"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-pink-300/30 bg-pink-300/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-pink-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: 3 tools — Lua interpreter, event flow sim, fxmanifest builder ─── */
  const Sandbox = () => {
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];

    // Pre-baked starter code per challenge
    const STARTERS = {
      'lua-hello': `-- Lua basics. Tables, print, variables.
local player = { name = "Mike", money = 500 }
print("Welcome, " .. player.name)
print(string.format("Balance: $%d", player.money))

local function addMoney(p, amount)
  p.money = p.money + amount
  return p.money
end
print("After tip: $" .. addMoney(player, 50))
`,
      'lua-loop': `-- THE classic FiveM client-side pattern.
-- Every frame, run something. MUST Wait(0) to yield.
-- (In this sandbox the step limit will catch us — that's by design.)

CreateThread(function()
  local frame = 0
  while true do
    frame = frame + 1
    if frame % 100 == 0 then
      print("frame: " .. frame)
    end
    Wait(0)  -- yield to scheduler
  end
end)
`,
      'lua-event': `-- Local event pattern.
-- RegisterNetEvent + AddEventHandler + TriggerEvent.

RegisterNetEvent('player:loaded')
AddEventHandler('player:loaded', function(name, jobName)
  print("Player loaded: " .. name)
  print("Job: " .. jobName)
end)

-- Fire it (in real FiveM this often comes from the framework)
TriggerEvent('player:loaded', 'Mike', 'mechanic')
`,
      'event-flow': `-- Use the event flow tool below — not Lua here.`,
      'event-unsafe': `-- Use the event flow tool below — not Lua here.`,
      'event-safe': `-- Use the event flow tool below — not Lua here.`,
      'manifest': `-- Use the manifest builder below — not Lua here.`,
    };

    // Lua editor state
    const [luaSrc, setLuaSrc] = useState(STARTERS[challenge.id] || '-- write Lua here\nprint("hi")');
    const [luaResult, setLuaResult] = useState(null);

    // Update editor when challenge changes
    useEffect(() => {
      setLuaSrc(STARTERS[challenge.id] || '-- write Lua here\nprint("hi")');
      setLuaResult(null);
    }, [challenge.id]);

    const runLua = () => {
      const r = executeLuaSafe(luaSrc, 'shared');
      setLuaResult(r);
    };

    // Event flow scenarios per challenge
    const SCENARIOS = {
      'event-flow': {
        title: "Client triggers a registered, validated server event (the safe path)",
        steps: [
          { from: 'server', op: 'register', name: 'shop:buy' },
          { from: 'server', op: 'handle', name: 'shop:buy', validates: true },
          { from: 'client', op: 'trigger', name: 'shop:buy', payload: ['burger', 1] },
        ],
      },
      'event-unsafe': {
        title: "Client triggers a registered but UNVALIDATED server event — exploit risk",
        steps: [
          { from: 'server', op: 'register', name: 'admin:giveMoney' },
          { from: 'server', op: 'handle', name: 'admin:giveMoney', validates: false },
          { from: 'client', op: 'trigger', name: 'admin:giveMoney', payload: [9999999] },
        ],
      },
      'event-safe': {
        title: "Server triggers a registered client event — outbound, safe pattern",
        steps: [
          { from: 'client', op: 'register', name: 'notify:show' },
          { from: 'client', op: 'handle', name: 'notify:show', validates: false },
          { from: 'server', op: 'trigger', name: 'notify:show', payload: ['You leveled up!'] },
        ],
      },
    };

    const scenario = SCENARIOS[challenge.id];
    const flowResult = scenario ? simulateEventFlow(scenario) : null;

    // Manifest builder state
    const [manifest, setManifest] = useState({
      game: 'gta5',
      fx_version: 'cerulean',
      author: 'Claw World RP',
      version: '1.0.0',
      description: 'Reputation system for gang members',
      shared_scripts: ['@ox_lib/init.lua', 'shared/config.lua'],
      server_scripts: ['@oxmysql/lib/MySQL.lua', 'server/main.lua'],
      client_scripts: ['client/main.lua'],
      ui_page: '',
      files: [],
      dependencies: ['qbx_core', 'ox_lib'],
      lua54: true,
    });
    const manifestResult = buildFxManifest(manifest);

    const updateManifestList = (key, value) => {
      const items = value.split('\n').map(s => s.trim()).filter(s => s.length > 0);
      setManifest(m => ({ ...m, [key]: items }));
    };

    const isLuaTab = ['lua-hello', 'lua-loop', 'lua-event'].includes(challenge.id);
    const isFlowTab = ['event-flow', 'event-unsafe', 'event-safe'].includes(challenge.id);
    const isManifestTab = challenge.id === 'manifest';

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE · {challenge.title.split(' · ')[1]}</span>
            <span className="text-pink-300">●</span>
          </div>
        </div>

        {/* Challenge tabs */}
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
          {CHALLENGES.map((c, i) => (
            <button key={c.id} onClick={() => setChallengeIdx(i)}
              className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-pink-300 text-pink-300 bg-pink-300/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {c.title.split(' · ')[0]}
            </button>
          ))}
        </div>
        <div className="px-3 py-2 border-b border-zinc-800">
          <div className="text-[13px] text-zinc-300 leading-relaxed">{challenge.desc}</div>
        </div>

        {/* LUA INTERPRETER */}
        {isLuaTab && (
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>LUA SOURCE</div>
              <button onClick={runLua}
                className="flex items-center gap-1.5 border border-pink-300 text-pink-300 px-2 py-0.5 text-[11px] hover:bg-pink-300/10"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Play size={11} /> RUN
              </button>
            </div>
            <textarea value={luaSrc} onChange={e => setLuaSrc(e.target.value.slice(0, SBX.MAX_INPUT_CHARS))}
              rows={12} spellCheck={false}
              className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-pink-300 leading-relaxed"
              style={{ fontFamily: 'JetBrains Mono, monospace' }} />
            <div className="text-[10px] text-zinc-600 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {luaSrc.length} / {SBX.MAX_INPUT_CHARS} chars · max {SBX.MAX_EVAL_STEPS} eval steps
            </div>

            {luaResult && (
              <>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>OUTPUT</div>
                  <div className="bg-black border border-zinc-800 px-3 py-2 min-h-[60px] max-h-48 overflow-y-auto">
                    {!luaResult.ok && (
                      <div className="text-rose-300 text-[12px] leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        error: {luaResult.error}
                      </div>
                    )}
                    {luaResult.output.length === 0 && luaResult.ok && (
                      <div className="text-zinc-600 text-[12px] italic">(no print output)</div>
                    )}
                    {luaResult.output.map((line, i) => (
                      <div key={i} className="text-zinc-200 text-[12px] whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{line}</div>
                    ))}
                  </div>
                </div>
                {luaResult.events && luaResult.events.length > 0 && (
                  <div className="mt-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>EVENT LOG</div>
                    <div className="bg-black border border-zinc-800 max-h-48 overflow-y-auto">
                      {luaResult.events.map((e, i) => (
                        <div key={i} className="px-3 py-1 border-b border-zinc-900 last:border-0 text-[11px] flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          <span className={`shrink-0 px-1 ${
                            e.side === 'client->server' ? 'text-pink-300' :
                            e.side === 'server->client' ? 'text-cyan-400' :
                            e.side === 'warn' ? 'text-rose-300' : 'text-zinc-500'
                          }`}>{e.side}</span>
                          <span className="text-zinc-400 w-20">{e.kind}</span>
                          <span className="text-zinc-200">{e.name}</span>
                          {e.payload && Array.isArray(e.payload) && e.payload.length > 0 && (
                            <span className="text-zinc-600 truncate">{JSON.stringify(e.payload)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {luaResult.steps !== undefined && (
                  <div className="text-[10px] text-zinc-600 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    eval steps: {luaResult.steps}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* EVENT FLOW SIMULATOR */}
        {isFlowTab && (
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="text-[12px] text-zinc-300 mb-3 leading-relaxed">
              <strong className="text-pink-300">{scenario.title}</strong>
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SCENARIO</div>
            <div className="bg-black border border-zinc-800 mb-3">
              {scenario.steps.map((s, i) => (
                <div key={i} className="px-3 py-1.5 border-b border-zinc-900 last:border-0 text-[11px] flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="text-zinc-500 w-4">{i + 1}.</span>
                  <span className={s.from === 'client' ? 'text-pink-300 w-16' : 'text-cyan-400 w-16'}>{s.from}</span>
                  <span className="text-zinc-400 w-16">{s.op}</span>
                  <span className="text-zinc-200">{s.name}</span>
                  {s.payload && <span className="text-zinc-600">{JSON.stringify(s.payload)}</span>}
                  {s.validates !== undefined && (
                    <span className={`ml-auto text-[10px] ${s.validates ? 'text-cyan-400' : 'text-rose-300'}`}>
                      {s.validates ? 'validated' : 'NO VALIDATION'}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FLOW</div>
            <div className="bg-black border border-zinc-800">
              {flowResult.flow.map((f, i) => (
                <div key={i} className={`px-3 py-1.5 border-b border-zinc-900 last:border-0 text-[11px] flex items-start gap-2 ${
                  f.kind === 'crosses-wire' ? 'bg-rose-400/5' :
                  f.kind === 'unsafe-handle' ? 'bg-rose-500/10' :
                  f.kind === 'dropped' ? 'bg-amber-300/5' : ''
                }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className={`shrink-0 w-16 ${
                    f.side === 'client' ? 'text-pink-300' :
                    f.side === 'server' ? 'text-cyan-400' :
                    f.side === 'wire' ? 'text-rose-300' : 'text-zinc-500'
                  }`}>{f.side}</span>
                  <span className={`shrink-0 w-24 ${
                    f.kind === 'unsafe-handle' ? 'text-rose-300' :
                    f.kind === 'dropped' ? 'text-amber-200' :
                    f.kind === 'crosses-wire' ? 'text-rose-300' : 'text-zinc-400'
                  }`}>{f.kind}</span>
                  <span className="text-zinc-300 leading-relaxed flex-1">{f.note}</span>
                </div>
              ))}
            </div>
            {challenge.id === 'event-unsafe' && (
              <Callout kind="dont" title="WHY THIS IS BROKEN">
                The server registered the event and attached a handler — but the handler doesn't validate the payload. Any client can fire this event with any amount. Money duplication exploit in 30 seconds of inspection. ALWAYS validate inputs server-side: ranges, ownership, permissions, business rules.
              </Callout>
            )}
            {challenge.id === 'event-flow' && (
              <Callout kind="tip" title="THE SAFE PATTERN">
                Client triggers a registered server event. Server has a handler. Handler validates the payload before acting. This is the textbook safe pattern — replicate it for every client-to-server event in your codebase.
              </Callout>
            )}
          </div>
        )}

        {/* FXMANIFEST BUILDER */}
        {isManifestTab && (
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GAME</div>
                <select value={manifest.game} onChange={e => setManifest(m => ({ ...m, game: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <option value="gta5">gta5</option>
                  <option value="rdr3">rdr3</option>
                  <option value="common">common</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FX_VERSION</div>
                <select value={manifest.fx_version} onChange={e => setManifest(m => ({ ...m, fx_version: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <option value="cerulean">cerulean (current)</option>
                  <option value="bodacious">bodacious</option>
                  <option value="adamant">adamant</option>
                </select>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>AUTHOR</div>
                <input value={manifest.author} onChange={e => setManifest(m => ({ ...m, author: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>VERSION</div>
                <input value={manifest.version} onChange={e => setManifest(m => ({ ...m, version: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div className="sm:col-span-2">
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>DESCRIPTION</div>
                <input value={manifest.description} onChange={e => setManifest(m => ({ ...m, description: e.target.value }))}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SHARED_SCRIPTS (one per line)</div>
                <textarea value={(manifest.shared_scripts || []).join('\n')}
                  onChange={e => updateManifestList('shared_scripts', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[11px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SERVER_SCRIPTS</div>
                <textarea value={(manifest.server_scripts || []).join('\n')}
                  onChange={e => updateManifestList('server_scripts', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[11px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>CLIENT_SCRIPTS</div>
                <textarea value={(manifest.client_scripts || []).join('\n')}
                  onChange={e => updateManifestList('client_scripts', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[11px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>DEPENDENCIES</div>
                <textarea value={(manifest.dependencies || []).join('\n')}
                  onChange={e => updateManifestList('dependencies', e.target.value)}
                  rows={3}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[11px] outline-none focus:border-pink-300"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="lua54-check" checked={manifest.lua54}
                  onChange={e => setManifest(m => ({ ...m, lua54: e.target.checked }))} />
                <label htmlFor="lua54-check" className="text-[12px] text-zinc-300">enable lua54 (recommended)</label>
              </div>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span>GENERATED fxmanifest.lua</span>
                {manifestResult.ok && (
                  <button onClick={() => copy(manifestResult.text, 'manifest-text')} className="flex items-center gap-1 hover:text-pink-300">
                    {copied === 'manifest-text' ? <Check size={11} /> : <Copy size={11} />}
                    {copied === 'manifest-text' ? 'copied' : 'copy'}
                  </button>
                )}
              </div>
              {!manifestResult.ok ? (
                <div className="border border-rose-500/50 bg-rose-500/10 p-3 text-[12px] text-rose-300">
                  error: {manifestResult.error}
                </div>
              ) : (
                <pre className="bg-black border border-zinc-800 p-3 text-[11px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {manifestResult.text}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─── LIBRARY: production FiveM patterns ─── */
  const LIBRARY = {
    server_events: {
      label: "Server events", icon: "⊟",
      snippets: [
        {
          id: 'safe-event', title: "Safe event handler (server-side)",
          desc: "The canonical hardened pattern. Validate every input. Use source for identity. Never trust client args.",
          code: `-- Safe pattern: source for identity, validate the payload
local QBCore = exports['qb-core']:GetCoreObject()
-- (For QBox: local function GetPlayer(src) return exports.qbx_core:GetPlayer(src) end)

RegisterNetEvent('shop:buyItem')
AddEventHandler('shop:buyItem', function(itemId, count)
  local src = source                  -- IDENTITY: server-controlled, trusted
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end       -- player disconnected? abort

  -- Validate types
  if type(itemId) ~= 'string' then return end
  if type(count) ~= 'number' or count < 1 or count > 99 then return end

  -- Look up the canonical price from server-side config
  local item = SHOP_CATALOG[itemId]
  if not item then return end          -- unknown item — silent reject

  local total = item.price * count
  if Player.PlayerData.money.cash < total then
    TriggerClientEvent('notify', src, 'Not enough cash')
    return
  end

  -- All checks pass — perform the action
  Player.Functions.RemoveMoney('cash', total, 'shop:' .. itemId)
  Player.Functions.AddItem(itemId, count)
  TriggerClientEvent('notify', src, 'Purchased ' .. count .. 'x ' .. itemId)
end)`,
          note: "Every server-side event handler should look like this. Identity from source, types validated, business rules applied, canonical data from server config. Compare to the unsafe pattern in the Sandbox event-unsafe challenge."
        },
        {
          id: 'rate-limit', title: "Rate-limit a handler (ox_lib)",
          desc: "Prevent event spam from a single player. ox_lib's rate-limit helper.",
          code: `local rateLimit = lib.rateLimit or {}  -- ox_lib helper (or roll your own)
local cooldowns = {}

RegisterNetEvent('action:perform')
AddEventHandler('action:perform', function(args)
  local src = source
  local now = os.time()
  if cooldowns[src] and now - cooldowns[src] < 2 then
    -- < 2 seconds since last call — drop
    return
  end
  cooldowns[src] = now

  -- normal handling here
end)

-- Cleanup on disconnect
AddEventHandler('playerDropped', function()
  cooldowns[source] = nil
end)`,
          note: "Rate limits protect against macro abuse and accidental client bugs that fire events in tight loops. Tune the threshold to the action — chat messages: 1/sec; purchases: 1 per 2 sec; admin actions: 1 per 5 sec."
        },
      ],
    },
    client_tick: {
      label: "Client tick loops", icon: "⊞",
      snippets: [
        {
          id: 'tick-pattern', title: "Per-frame loop with proper Wait",
          desc: "The bedrock client pattern. Always Wait. Choose Wait based on responsiveness need.",
          code: `-- Per-frame: minimal work. Wait(0) yields one frame (~16ms at 60fps).
CreateThread(function()
  while true do
    Wait(0)
    -- Only urgent per-frame stuff here. Keep tiny.
    if IsControlPressed(0, 38) then  -- E key
      HandleInteract()
    end
  end
end)

-- Slower polling (4Hz) — most things only need this.
CreateThread(function()
  while true do
    Wait(250)
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    UpdateNearbyNPCs(pos)
  end
end)

-- Very slow (1Hz) — once-per-second checks.
CreateThread(function()
  while true do
    Wait(1000)
    UpdateUI()
  end
end)`,
          note: "Tier your tick loops by frequency. Frame-perfect input checks: Wait(0). Position-based logic: Wait(100-500). UI refreshes: Wait(1000+). 90% of your client work belongs in 250ms or slower."
        },
        {
          id: 'dont-poll', title: "Don't poll — use events",
          desc: "Replace 'check every 100ms if X' with 'when X happens, fire event'. Massively reduces client CPU.",
          code: `-- BAD: 10x/sec poll on every client forever
CreateThread(function()
  while true do
    Wait(100)
    if PlayerData.job.name == 'cop' then
      EnableCopUI()
    else
      DisableCopUI()
    end
  end
end)

-- GOOD: react to actual job-change events
AddEventHandler('QBCore:Client:OnJobUpdate', function(JobInfo)
  if JobInfo.name == 'cop' then
    EnableCopUI()
  else
    DisableCopUI()
  end
end)

-- Also good: explicit subscription on PlayerData refresh
AddEventHandler('QBCore:Player:SetPlayerData', function(playerData)
  PlayerData = playerData
  -- only do work that depends on the actual change
end)`,
          note: "The hidden cost of polling is multiplied by player count. 100 players polling 10x/sec = 1000 ops/sec. Events: 0 ops until something actually happens. Same correctness, fraction of the cost."
        },
      ],
    },
    database: {
      label: "Database (oxmysql)", icon: "▤",
      snippets: [
        {
          id: 'async-query', title: "Async query inside event handler",
          desc: "MySQL.query.await yields the coroutine — other things run during the wait.",
          code: `-- Server-side
local MySQL = exports.oxmysql

RegisterNetEvent('garage:storeVehicle')
AddEventHandler('garage:storeVehicle', function(plate)
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end

  -- Validate plate format server-side
  if type(plate) ~= 'string' or #plate > 8 then return end

  -- Parameterized query — NEVER concatenate
  local rows = MySQL:query.await(
    'SELECT * FROM player_vehicles WHERE plate = ? AND citizenid = ?',
    { plate, Player.PlayerData.citizenid }
  )

  if not rows or #rows == 0 then
    TriggerClientEvent('notify', src, 'Not your vehicle')
    return
  end

  -- Update state
  MySQL:update.await(
    'UPDATE player_vehicles SET state = 1 WHERE plate = ?',
    { plate }
  )
  TriggerClientEvent('notify', src, 'Vehicle stored')
end)`,
          note: "Always parameterized. Always async (no executeSync in handlers). Always validate inputs at the boundary. Always check ownership (citizenid match) before mutations."
        },
        {
          id: 'cache-reads', title: "Cache hot reads (ox_lib)",
          desc: "Don't re-query for the same value 50 times/sec. Cache it; invalidate on writes.",
          code: `-- ox_lib cache: { ttl = seconds, capacity = max entries }
local jobCache = lib.cache(60)  -- 1-min TTL

local function GetPlayerJob(citizenid)
  local cached = jobCache:get(citizenid)
  if cached then return cached end

  local row = MySQL:query.await(
    'SELECT job FROM players WHERE citizenid = ? LIMIT 1',
    { citizenid }
  )
  if row and row[1] then
    jobCache:set(citizenid, row[1].job)
    return row[1].job
  end
  return nil
end

-- Invalidate on write
RegisterNetEvent('admin:setJob')
AddEventHandler('admin:setJob', function(targetId, newJob)
  -- ... (auth checks omitted for brevity)
  MySQL:update.await('UPDATE players SET job = ? WHERE citizenid = ?', { newJob, targetId })
  jobCache:set(targetId, newJob)  -- replace cached value
end)`,
          note: "Caching is high-ROI for any value read more often than written. Player money, jobs, inventories, vehicle owners — all good candidates. Invalidate on writes; don't let stale data drift."
        },
      ],
    },
    framework: {
      label: "QBCore / QBox", icon: "⇌",
      snippets: [
        {
          id: 'player-access', title: "Get the Player object (both frameworks)",
          desc: "The starting point for every per-player operation.",
          code: `-- QBCore (server-side)
local QBCore = exports['qb-core']:GetCoreObject()
RegisterNetEvent('something')
AddEventHandler('something', function()
  local Player = QBCore.Functions.GetPlayer(source)
  if not Player then return end
  print(Player.PlayerData.name, Player.PlayerData.money.cash)
end)

-- QBox (server-side) — export-based API
RegisterNetEvent('something')
AddEventHandler('something', function()
  local Player = exports.qbx_core:GetPlayer(source)
  if not Player then return end
  print(Player.PlayerData.name, Player.PlayerData.money.cash)
end)

-- QBCore client-side
local PlayerData = QBCore.Functions.GetPlayerData()
print(PlayerData.charinfo.firstname)

-- QBox client-side
local PlayerData = exports.qbx_core:GetPlayerData()
print(PlayerData.charinfo.firstname)`,
          note: "Player structures are almost identical between QBCore and QBox — the migration mostly involves swapping access patterns. Both nil-check (player can disconnect mid-handler). Both expose money, job, gang, charinfo, metadata."
        },
        {
          id: 'job-check', title: "Job/gang permission checks",
          desc: "Server-side checks before performing privileged actions.",
          code: `local function isCop(Player)
  return Player and Player.PlayerData.job.name == 'police'
end

local function hasJobGrade(Player, jobName, minGrade)
  if not Player then return false end
  return Player.PlayerData.job.name == jobName
     and Player.PlayerData.job.grade.level >= minGrade
end

RegisterNetEvent('police:arrest')
AddEventHandler('police:arrest', function(targetId)
  local src = source
  local officer = QBCore.Functions.GetPlayer(src)
  if not hasJobGrade(officer, 'police', 1) then
    return  -- not a cop, silently drop
  end
  -- proceed with arrest logic
end)`,
          note: "Permission checks ALWAYS server-side. Client-side checks (hide UI for non-cops) are UX; server-side checks are security. Both are needed. Never rely on the client having hidden the UI to prevent the action."
        },
      ],
    },
    nui: {
      label: "NUI bridges", icon: "◧",
      snippets: [
        {
          id: 'nui-bridge', title: "Lua <-> NUI message bridge",
          desc: "The standard pattern for bi-directional Lua/JS communication.",
          code: `-- Lua (client-side)
function OpenShopUI(shopData)
  SetNuiFocus(true, true)  -- give keyboard + mouse to NUI
  SendNUIMessage({
    action = 'openShop',
    data = shopData,
  })
end

-- Receive callback from NUI JS
RegisterNUICallback('buyItem', function(data, cb)
  local itemId = data.itemId
  local count = tonumber(data.count) or 1
  -- Validate
  if type(itemId) ~= 'string' or count < 1 or count > 99 then
    cb({ ok = false, error = 'bad input' })
    return
  end
  TriggerServerEvent('shop:buyItem', itemId, count)
  cb({ ok = true })  -- MUST call cb or JS Promise hangs
end)

RegisterNUICallback('closeShop', function(data, cb)
  SetNuiFocus(false, false)  -- ALWAYS release focus on close
  cb({})
end)`,
          note: "The 'MUST call cb' rule is the #1 NUI bug. JS does fetch().then(); if cb isn't called, the Promise never resolves and the UI freezes. Always cb({}) — even with no data. And always SetNuiFocus(false, false) when closing — stuck-mouse complaints are 80% from forgotten cleanup."
        },
        {
          id: 'nui-js-side', title: "NUI JS side — listen for Lua, call back",
          desc: "The mirror to the Lua bridge. Listen for messages, post callbacks.",
          code: `// html/script.js — runs in CEF inside the FiveM client

// Listen for Lua -> NUI messages
window.addEventListener('message', (event) => {
  const data = event.data;
  if (data.action === 'openShop') {
    renderShop(data.data);
    document.body.style.display = 'block';
  }
});

// Call back to Lua
async function buyItem(itemId, count) {
  try {
    const resp = await fetch(\`https://\${GetParentResourceName()}/buyItem\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, count }),
    });
    const result = await resp.json();
    if (!result.ok) {
      showError(result.error);
    }
  } catch (e) {
    console.error('NUI callback failed:', e);
  }
}

// ESC to close
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    fetch(\`https://\${GetParentResourceName()}/closeShop\`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    document.body.style.display = 'none';
  }
});`,
          note: "GetParentResourceName() is a global FiveM injects into NUI. Returns the resource name (string). Use it to construct callback URLs — don't hardcode the resource name in case you rename. Always handle ESC -> close for accessibility."
        },
      ],
    },
    ox_helpers: {
      label: "ox_lib helpers", icon: "✦",
      snippets: [
        {
          id: 'ox-menu', title: "ox_lib menu (replaces qb-menu)",
          desc: "Modern menu primitive. Used everywhere in QBox; works on QBCore servers too.",
          code: `-- Client-side: open a menu
lib.registerContext({
  id = 'shop_menu',
  title = 'General Store',
  options = {
    {
      title = 'Burger',
      description = '$10',
      icon = 'utensils',
      onSelect = function()
        TriggerServerEvent('shop:buyItem', 'burger', 1)
      end,
    },
    {
      title = 'Water',
      description = '$5',
      icon = 'glass-water',
      onSelect = function()
        TriggerServerEvent('shop:buyItem', 'water', 1)
      end,
    },
  },
})
lib.showContext('shop_menu')`,
          note: "ox_lib menus are the modern replacement for qb-menu / esx_menu_default. Cleaner API, better performance, accessible. Available regardless of framework — just ensure ox_lib in your fxmanifest dependencies."
        },
        {
          id: 'ox-notify', title: "ox_lib notify (replaces QBCore.Functions.Notify)",
          desc: "Drop-in notification primitive. Framework-agnostic.",
          code: `-- Client-side
lib.notify({
  title = 'Purchase complete',
  description = 'You bought a burger for $10',
  type = 'success',  -- 'success', 'error', 'warning', 'info'
  position = 'top-right',
  duration = 4000,
})

-- Server-side: trigger client notify
TriggerClientEvent('ox_lib:notify', src, {
  title = 'Purchase complete',
  type = 'success',
})`,
          note: "Use ox_lib notify regardless of framework. Cleaner than QBCore's built-in and works in both QBCore and QBox setups. The 'ox_lib:notify' event is the standard server-to-client notify trigger."
        },
      ],
    },
    performance: {
      label: "Performance", icon: "⚡",
      snippets: [
        {
          id: 'resmon-usage', title: "Read resmon output",
          desc: "F8 console: resmon 1. Per-resource CPU and memory. Diagnose timeouts here.",
          code: `-- In F8 console (client):
resmon 1            -- show live resource monitor (refresh 1Hz)
resmon 0            -- hide

-- Targets to hit:
-- client CPU: < 0.5ms sustained per resource
-- server CPU: < 2ms sustained per resource
-- spikes < 5ms are usually fine; sustained > 1ms is a smell

-- Common culprits when over budget:
-- 1. Tick loop with Wait(0) doing real work every frame
-- 2. Per-tick distance check or raycast
-- 3. NUI sending messages every frame
-- 4. Resource missing Wait in a CreateThread loop`,
          note: "resmon is the single most useful debugging command in FiveM. Run it during peak hours; identify the top 3 resources by CPU. Fix or replace them. Most servers have 2-3 resources eating 70% of the budget."
        },
        {
          id: 'thread-throttle', title: "Throttle a per-frame check",
          desc: "Distance checks are common in client code. Don't run them at 60Hz.",
          code: `-- BAD: distance check every frame
CreateThread(function()
  while true do
    Wait(0)
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    for _, location in pairs(SHOP_LOCATIONS) do
      local dist = #(pos - location)
      if dist < 2.0 then
        EnableShopPrompt()
      end
    end
  end
end)

-- GOOD: 4Hz check + adaptive throttling
CreateThread(function()
  while true do
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    local nearestDist = 9999
    for _, location in pairs(SHOP_LOCATIONS) do
      local dist = #(pos - location)
      if dist < nearestDist then nearestDist = dist end
      if dist < 2.0 then EnableShopPrompt() end
    end
    -- If far from all shops, slow the loop way down
    Wait(nearestDist < 10.0 and 100 or 1000)
  end
end)`,
          note: "Adaptive throttling: poll fast when near interactive zones, slow when far. Same effective responsiveness, 10x less CPU. The pattern works for any zone-based logic — shops, garages, doors, AI ranges."
        },
      ],
    },
    security: {
      label: "Security", icon: "🛡",
      snippets: [
        {
          id: 'source-id', title: "source is server-controlled — use it",
          desc: "Never accept a player_id from client args. Always use source for identity.",
          code: `-- BAD: client sends their own player ID
RegisterNetEvent('inventory:add')
AddEventHandler('inventory:add', function(playerId, itemId, count)
  local Player = QBCore.Functions.GetPlayer(playerId)  -- ATTACKER controls this
  Player.Functions.AddItem(itemId, count)              -- give items to anyone
end)

-- GOOD: source for identity
RegisterNetEvent('inventory:add')
AddEventHandler('inventory:add', function(itemId, count)
  local src = source                                   -- server controls this
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end
  -- + validate itemId, count, ownership, etc
  Player.Functions.AddItem(itemId, count)
end)`,
          note: "The single most-exploited FiveM pattern: 'TriggerServerEvent with a player ID arg'. Modify the client, fire with anyone's ID, get items/money/teleports for any player. Always derive identity from source — it's the only reliable identifier server-side."
        },
        {
          id: 'distance-check', title: "Server-side distance validation",
          desc: "If an action requires the player be near a location, validate the distance server-side.",
          code: `local SHOP_LOCATIONS = {
  general = vector3(25.7, -1347.3, 29.5),
  hardware = vector3(2748.0, 3473.3, 55.7),
}

RegisterNetEvent('shop:buyItem')
AddEventHandler('shop:buyItem', function(shopId, itemId, count)
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end

  local shopLoc = SHOP_LOCATIONS[shopId]
  if not shopLoc then return end

  -- Server-side distance check (anti-teleport-buy)
  local ped = GetPlayerPed(src)
  local playerCoords = GetEntityCoords(ped)
  local distance = #(playerCoords - shopLoc)
  if distance > 3.0 then
    print(('[anti-cheat] %s tried to buy from %s at %.1fm'):format(src, shopId, distance))
    return
  end

  -- normal purchase logic
end)`,
          note: "Client-side 'press E within 2m' UI is great UX. Server-side distance check is what stops players using cheat scripts to buy from anywhere. The double check (UX client-side + security server-side) is the right pattern."
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
                activeCat === c ? 'border-pink-300 text-pink-300 bg-pink-300/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="text-pink-300">{LIBRARY[c].icon}</span>
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
                  <span className="text-[10px] text-pink-300 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                      <button onClick={() => copy(s.code, 'lib-' + s.id)} className="flex items-center gap-1.5 hover:text-pink-300 transition-colors">
                        {copied === 'lib-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'lib-' + s.id ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <code>{s.code}</code>
                    </pre>
                    {s.note && (
                      <div className="border-t border-zinc-900 px-3 py-2 text-[12px] text-zinc-400 italic leading-relaxed">
                        <span className="text-cyan-400 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
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
          <div className="text-[10px] tracking-[0.25em] text-amber-200 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Wrench size={12} /> TRIAGE TREE
          </div>
          {path.length > 1 && (
            <button onClick={() => setPath(['start'])} className="text-[11px] text-zinc-500 hover:text-amber-200 flex items-center gap-1">
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
                  <span className={i === path.length - 1 ? 'text-pink-300' : ''}>{p}</span>
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
                    className="w-full text-left border border-zinc-800 hover:border-amber-200 hover:bg-amber-300/5 px-3 py-2.5 text-[14px] text-zinc-200 transition-colors flex items-center justify-between group">
                    <span>{opt.label}</span>
                    <ChevronRight size={14} className="text-zinc-600 group-hover:text-amber-200" />
                  </button>
                ))}
              </div>
            </>
          )}
          {cur.fix && (
            <>
              <div className="border-l-2 border-pink-300 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-pink-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-pink-300 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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
    let md = "# FiveM / Lua / QBCore Atlas — Cheatsheet\n\n";
    md += "## Frameworks (May 2026)\n\n| Framework | Status | Best for | Notes |\n|---|---|---|---|\n";
    COMPARISONS.frameworks_2026.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Server vs client\n\n| Concern | Server | Client | Why |\n|---|---|---|---|\n";
    COMPARISONS.server_vs_client.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Event functions\n\n| Function | Where | What | source available |\n|---|---|---|---|\n";
    COMPARISONS.events_table.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## ox_ ecosystem\n\n| Resource | Replaces | What |\n|---|---|---|\n";
    COMPARISONS.ox_stack.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## Client timeout causes\n\n| Cause | Detection | Fix |\n|---|---|---|\n";
    COMPARISONS.timeout_causes.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## Commands\n\n```\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    try {
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'fivem-atlas-cheatsheet.md'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.warn('[fivematlas] export failed:', e?.message); }
  };

  const exportLibrary = () => {
    let md = "# FiveM / Lua / QBCore Atlas — Library\n\n";
    Object.entries(LIBRARY).forEach(([, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => {
        md += `### ${s.title}\n${s.desc}\n\n\`\`\`lua\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`;
      });
    });
    try {
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'fivem-atlas-library.md'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.warn('[fivematlas] export failed:', e?.message); }
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
        <div className="max-w-lg w-full bg-zinc-950 border border-pink-300/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-pink-300" />
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
                  item.kind === 'chapter' ? 'text-pink-300' :
                  item.kind === 'term' ? 'text-cyan-400' :
                  item.kind === 'library' ? 'text-amber-200' : 'text-fuchsia-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-pink-300/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-pink-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-pink-300/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-pink-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>◫ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your FiveM context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-pink-300 hover:bg-pink-300/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-pink-300 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 2014">FiveM is born</H2>
            <P>
              FiveM started as a multiplayer modification for Grand Theft Auto V. The CFX.re team built it as a parallel network stack that lets players connect to community-run servers — server-side game logic, custom content, roleplay scenarios, racing, FFA. By 2018 it had become the dominant GTA V multiplayer mod, with thousands of servers and a vibrant ecosystem.
            </P>
            <H2 num="◇ 2020-2024">QBCore era</H2>
            <P>
              <Term>QBCore</Term> launched around 2020 as a clean-architecture roleplay framework — player object, jobs, money, inventory, vehicles, callbacks. It rapidly overtook the older <Term>ESX</Term> framework for new RP servers. By 2023 it had the largest active script ecosystem on FiveM. Servers ran 100+ concurrent players using OneSync. RP communities formed around it.
            </P>
            <P>
              But QBCore's codebase grew organically. Inconsistent maintenance. Accumulating security holes (money duplication bugs, client-side inventory manipulation). By 2024, active development had largely stalled.
            </P>
            <H2 num="◇ AUG 2023">Rockstar acquires CFX.re</H2>
            <P>
              Take-Two/Rockstar acquired CFX.re. Many feared the worst — a shutdown, IP enforcement, cease-and-desist letters. The reality was the opposite. The mod was formalized. Most of the original team stayed. Development continues under the CFX.re brand with stable infrastructure, official endorsement, longer-term confidence. The legal gray area resolved.
            </P>
            <H2 num="◇ 2025-2026">QBox and the ox_ ecosystem</H2>
            <P>
              Former QBCore contributors forked the project as <Term>QBox</Term> (qbox-project, qbx_core). Goals: address performance, security, code quality. They built on the <Term name="ox_lib">overextended</Term> ecosystem — ox_lib (utilities, UI), ox_inventory (inventory), oxmysql (DB), ox_target (interactions). Lua 5.4. Strict server-authority. Modular. Backwards-compatible with most QBCore resources.
            </P>
            <P>
              May 2026: QBox is the recommended framework for new servers. QBCore still has the biggest script ecosystem and many production servers still run on it (Cle's Claw World RP included). Migration QBCore → QBox is a real ongoing trend; not necessary, but worth planning.
            </P>
            <ComparisonTable data={COMPARISONS.frameworks_2026} />
            <div className="grid gap-2 my-3">
              <CheckItem id="own-rockstar">FiveM is owned by Rockstar/Take-Two since Aug 2023, still developed under CFX.re brand</CheckItem>
              <CheckItem id="own-qbcore-stalled">QBCore: largest ecosystem, development largely stalled by 2025</CheckItem>
              <CheckItem id="own-qbox-modern">QBox: modern fork, actively developed, built on ox_ ecosystem, Lua 5.4</CheckItem>
              <CheckItem id="own-onesync">OneSync (server-authoritative entity sync) is required above 32 players</CheckItem>
            </div>
            <Callout kind="cite" title="WHY THIS MATTERS FOR CLE">
              You're on QBCore. That's fine — Claw World RP works today. But know the landscape: when you start a new feature, ox_lib + ox_inventory + ox_target work on your QBCore stack, and they're the future. Adopt them piece-by-piece. When you eventually move to QBox, most of the migration will already be done.
            </Callout>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ SPLIT">The server/client split</H2>
            <P>
              Two runtimes: the GTA V client (player's machine) and the FiveM server (your VPS). They talk over a network wire. The wire is the security boundary. <strong>Anything crossing it is untrusted on the receiving side.</strong>
            </P>
            <P>
              This isn't a performance concern — it's the design of every FiveM exploit. Modified clients can fake any event, any payload. <Term>Server-authority</Term> means the server has the truth, validates everything, and decides what actually happens.
            </P>
            <ArchDiagram />
            <ComparisonTable data={COMPARISONS.server_vs_client} />
            <H2 num="◇ RES">Resources — the unit of code</H2>
            <P>
              A <Term>Resource</Term> is a folder containing <Term name="fxmanifest.lua">fxmanifest.lua</Term> plus Lua scripts and (optionally) NUI files. Resources start and stop independently. They expose APIs via <Term>Export</Term>s. They communicate via events. Even the framework (QBCore/QBox) is a resource.
            </P>
            <P>
              The manifest declares which scripts run server-side (<Kbd>server_scripts</Kbd>), client-side (<Kbd>client_scripts</Kbd>), or both (<Kbd>shared_scripts</Kbd>). The Sandbox has a working fxmanifest builder.
            </P>
            <Code id="fxmanifest-example" lang="lua">{`-- Resource folder: claw-world-reputation/
-- File: fxmanifest.lua

fx_version 'cerulean'
game 'gta5'

author 'Claw World RP'
description 'Reputation system for gang membership'
version '1.0.0'

shared_scripts {
  '@ox_lib/init.lua',
  'shared/config.lua',
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/main.lua',
  'server/events.lua',
}

client_scripts {
  'client/main.lua',
  'client/ui.lua',
}

ui_page 'html/index.html'
files {
  'html/index.html',
  'html/style.css',
  'html/script.js',
}

dependencies {
  'qbx_core',  -- or 'qb-core' for QBCore servers
  'ox_lib',
}

lua54 'yes'`}</Code>
            <H2 num="◇ ONESYNC">OneSync — required above 32 players</H2>
            <P>
              FiveM's legacy peer-to-peer entity sync didn't scale past 32 concurrent players. <Term>OneSync</Term> moved entity authority to the server — the server decides what each client sees and replicates entities they need, culling the rest. Standard for any RP server. <Term>OneSync Plus</Term> extends to 1024 players.
            </P>
            <Callout kind="warn" title="ONESYNC IS NOT OPTIONAL">
              If you're targeting more than 32 players, OneSync is mandatory. Enable in server.cfg: <Kbd>set onesync on</Kbd>. Also <Kbd>set onesync_population true</Kbd> to let the server control AI/vehicle population (drastically reduces sync conflicts and desync). Standard for any modern RP server.
            </Callout>
            {stackData?.architecture && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.architecture}</Callout>}
            {QUIZZES.architecture.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ SYNTAX">Lua basics — what you'll write</H2>
            <P>
              Lua is small. <Term>Tables</Term> are the only compound data type. Functions are first-class. Coroutines power async. FiveM uses Lua 5.4 (since 2024). The Sandbox has a real Lua interpreter for a meaningful subset.
            </P>
            <Code id="lua-basics" lang="lua">{`-- Variables (local is preferred)
local name = "Mike"
local age = 35
local isActive = true
local nothing = nil

-- Tables: arrays
local items = { "apple", "bread", "water" }
print(items[1])  -- "apple" (1-indexed!)
print(#items)    -- 3 (length)

-- Tables: dictionaries / objects
local player = {
  name = "Mike",
  money = 500,
  inventory = { "apple", "bread" },
}
print(player.name)
print(player["money"])  -- same thing

-- if/elseif/else
if player.money >= 100 then
  print("rich enough")
elseif player.money > 0 then
  print("got some cash")
else
  print("broke")
end

-- while loop
local i = 1
while i <= 3 do
  print(i)
  i = i + 1
end

-- numeric for
for i = 1, 5 do print(i) end          -- 1 2 3 4 5
for i = 1, 10, 2 do print(i) end      -- 1 3 5 7 9 (step 2)

-- generic for over a table's array part
for i, v in ipairs(items) do
  print(i, v)
end

-- generic for over ALL keys
for k, v in pairs(player) do
  print(k, v)
end

-- functions
local function double(x)
  return x * 2
end
print(double(21))  -- 42

-- function as value
local fns = {
  add = function(a, b) return a + b end,
  sub = function(a, b) return a - b end,
}
print(fns.add(10, 5))`}</Code>
            <H2 num="◇ THREAD">Citizen.CreateThread + Wait</H2>
            <P>
              FiveM's concurrency primitive. <Kbd>CreateThread</Kbd> spawns a <Term>Coroutine</Term> that runs concurrently with other threads. <Kbd>Wait(ms)</Kbd> yields the thread for N milliseconds — required inside any while-loop or you'll block the client tick.
            </P>
            <Code id="lua-threads" lang="lua">{`-- Per-frame loop (60Hz) — for input checks, rendering hooks
CreateThread(function()
  while true do
    Wait(0)  -- yield ONE FRAME (~16ms at 60fps)
    if IsControlPressed(0, 38) then  -- E key
      HandleInteract()
    end
  end
end)

-- Slower polling (4Hz) — for position checks, AI updates
CreateThread(function()
  while true do
    Wait(250)
    UpdateNearbyEntities()
  end
end)

-- THE most common newbie bug:
-- DON'T:
-- CreateThread(function()
--   while true do
--     DoStuff()
--     -- NO WAIT! Blocks the tick forever.
--   end
-- end)
-- → client times out within ~5 seconds.
-- ALWAYS Wait inside while-loops.`}</Code>
            <H2 num="◇ TABLE">Tables — Lua's everything</H2>
            <P>
              Tables serve as arrays, dictionaries, objects, namespaces, and method receivers. <Kbd>{`{1,2,3}`}</Kbd> is sugar for <Kbd>{`{[1]=1, [2]=2, [3]=3}`}</Kbd>. <Kbd>#t</Kbd> returns the array part's length. <Kbd>ipairs</Kbd> iterates array indices in order; <Kbd>pairs</Kbd> iterates everything.
            </P>
            <Callout kind="warn" title="1-INDEXED">
              Lua tables are 1-indexed, not 0-indexed. <Kbd>t[1]</Kbd> is the first element, not <Kbd>t[0]</Kbd>. This trips up everyone coming from JavaScript or Python.
            </Callout>
            {stackData?.lua && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.lua}</Callout>}
            {QUIZZES.lua.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ THREE">Three event functions, two registration functions</H2>
            <P>
              <Term name="TriggerEvent">TriggerEvent</Term> fires locally (same runtime, no network). <Term>TriggerServerEvent</Term> fires on the server, from a client. <Term>TriggerClientEvent</Term> fires on a client (or all clients), from the server. <Term>RegisterNetEvent</Term> declares an event name as receivable over the network. <Term>AddEventHandler</Term> attaches a function to handle the event.
            </P>
            <ComparisonTable data={COMPARISONS.events_table} />
            <H2 num="◇ SOURCE">`source` — the only trustworthy identifier</H2>
            <P>
              Inside a server-side event handler, <Term name="source">source</Term> is a special variable containing the player ID of the player who triggered the event. <strong>NEVER pass player IDs as event arguments.</strong> The client controls the arguments; they can fake any ID. Use source for identity. Always.
            </P>
            <Code id="events-safe" lang="lua">{`-- Server-side
RegisterNetEvent('purchase:buyItem')
AddEventHandler('purchase:buyItem', function(itemId, count)
  local src = source                              -- IDENTITY — server-controlled
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end                   -- nil-check (player can disconnect)

  -- Validate the payload (client controls these — DO NOT TRUST)
  if type(itemId) ~= 'string' then return end
  if type(count) ~= 'number' or count < 1 or count > 99 then return end

  -- Look up the price server-side (NEVER trust a client-supplied price)
  local item = SHOP_CATALOG[itemId]
  if not item then return end

  local total = item.price * count
  if Player.PlayerData.money.cash < total then
    TriggerClientEvent('ox_lib:notify', src, { type = 'error', title = 'Not enough cash' })
    return
  end

  Player.Functions.RemoveMoney('cash', total)
  Player.Functions.AddItem(itemId, count)
end)`}</Code>
            <H2 num="◇ REGNET">RegisterNetEvent — easy to forget</H2>
            <P>
              For network events (server-to-client or client-to-server), you need both <Kbd>RegisterNetEvent('name')</Kbd> and <Kbd>AddEventHandler('name', fn)</Kbd>. Without RegisterNetEvent, the event arrives from the network but is silently dropped. Modern FiveM warns in console, but it's still the most common 'why isn't my event firing?' bug.
            </P>
            <Callout kind="dont" title="THE CLASSIC EXPLOIT">
              <Kbd>{`TriggerServerEvent('admin:giveMoney', target_id, amount)`}</Kbd> with a handler that does <Kbd>{`AddMoney(target_id, amount)`}</Kbd> = anyone gives anyone any amount. The Sandbox event-unsafe challenge shows this exact pattern. Always use source for identity. Always validate the payload against server-side business rules.
            </Callout>
            {stackData?.events && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.events}</Callout>}
            {QUIZZES.events.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ MANIFEST">fxmanifest.lua — the resource descriptor</H2>
            <P>
              Every resource has one. It declares the game (gta5), fx_version (current: cerulean), scripts (server/client/shared), files (NUI assets), dependencies, version, author. Without it, FiveM doesn't load the resource. The Sandbox has a working builder.
            </P>
            <P>
              Script paths support globs (<Kbd>server/*.lua</Kbd>) and resource references (<Kbd>@ox_lib/init.lua</Kbd> = pull from another resource). Files section is for NUI assets accessible to the CEF process.
            </P>
            <H2 num="◇ EXPORT">Exports — cross-resource APIs</H2>
            <P>
              An <Term>Export</Term> is a function exposed from one resource for other resources to call. Works server-to-server and client-to-client. NOT cross-side (server can't call a client export directly — use events for that).
            </P>
            <Code id="exports-example" lang="lua">{`-- In resource 'my_economy', server-side:
local function GetPlayerBalance(playerId)
  local Player = QBCore.Functions.GetPlayer(playerId)
  if not Player then return nil end
  return Player.PlayerData.money.cash
end

exports('GetPlayerBalance', GetPlayerBalance)

-- In another resource 'shop', server-side:
local balance = exports['my_economy']:GetPlayerBalance(source)
print(balance)

-- For QBox: exports.qbx_core:GetPlayer(source) — same pattern, modern naming`}</Code>
            <Callout kind="tip" title="EXPORTS HAVE OVERHEAD">
              Each export call serializes args, looks up the target resource, dispatches. Fine for occasional cross-resource calls. For hot paths inside a single resource, use direct function calls. Don't export a function called every frame.
            </Callout>
            <H2 num="◇ STARTORDER">Start order via dependencies</H2>
            <P>
              <Kbd>dependencies</Kbd> in fxmanifest declares 'this resource needs X to start first'. Critical for resources that reference exports from another resource at load time. Without it, you can get 'attempt to index nil' errors when your resource starts before the framework.
            </P>
            <Code id="deps-example" lang="lua">{`-- fxmanifest.lua
dependencies {
  'qbx_core',  -- or 'qb-core'
  'ox_lib',
  'oxmysql',
}

-- These will start FIRST before this resource. Your code can safely call
-- exports.qbx_core:GetPlayer(src) at top-level without nil errors.`}</Code>
            {QUIZZES.resources.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ OXMYSQL">oxmysql — the standard driver</H2>
            <P>
              <Term>oxmysql</Term> is the MySQL/MariaDB connector for FiveM. Replaced the older mysql-async. Async by default. <Term name="Parameterized query">Parameterized queries</Term> — never concatenate user input. Bundled with QBox; widely used with QBCore.
            </P>
            <Code id="oxmysql-basics" lang="lua">{`-- Server-side. oxmysql exposes these via exports:
local MySQL = exports.oxmysql

-- Async select (yields the coroutine — other things run during the wait)
RegisterNetEvent('garage:loadVehicles')
AddEventHandler('garage:loadVehicles', function()
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  if not Player then return end

  local citizenid = Player.PlayerData.citizenid
  local rows = MySQL:query.await(
    'SELECT plate, model, garage FROM player_vehicles WHERE citizenid = ?',
    { citizenid }
  )
  TriggerClientEvent('garage:setVehicles', src, rows)
end)

-- Async update
local affected = MySQL:update.await(
  'UPDATE players SET money = ? WHERE citizenid = ?',
  { newAmount, citizenid }
)
print('rows updated:', affected)

-- Async insert (returns the new row's auto-increment id)
local newId = MySQL:insert.await(
  'INSERT INTO player_outfits (citizenid, name, data) VALUES (?, ?, ?)',
  { citizenid, outfitName, json.encode(outfit) }
)`}</Code>
            <Callout kind="dont" title="STRING CONCATENATION = SQL INJECTION">
              <Kbd>{"MySQL:query.await('SELECT * FROM users WHERE name = \"' .. userInput .. '\"')"}</Kbd> — any string from a player can break out. <Kbd>{`userInput = '"; DROP TABLE users; --'`}</Kbd>. Use parameterized queries. ALWAYS. No exceptions for 'trusted' input.
            </Callout>
            <H2 num="◇ ASYNC">Why async matters — the timeout connection</H2>
            <P>
              <Kbd>MySQL:executeSync</Kbd> blocks the entire server thread until the query returns. During that time, no events fire, no other players' actions process, the network thread can stall. Long sync queries are a common cause of mass timeouts.
            </P>
            <P>
              The async variants (<Kbd>execute</Kbd>, <Kbd>query.await</Kbd>) yield the calling coroutine. The rest of the server keeps running while your query waits. <strong>Use async always except in one-shot startup code.</strong>
            </P>
            <H2 num="◇ INDEX">Indexes — fix slow queries</H2>
            <P>
              If a query takes > 50ms in production, the table is probably missing an index on the WHERE column. <Kbd>EXPLAIN SELECT * FROM users WHERE identifier = ?</Kbd> — if you see <Kbd>type: ALL</Kbd>, that's a full table scan. Add an index.
            </P>
            <Code id="add-index" lang="sql">{`-- Index hot lookup columns
ALTER TABLE players ADD INDEX idx_citizenid (citizenid);
ALTER TABLE player_vehicles ADD INDEX idx_citizenid (citizenid);
ALTER TABLE player_vehicles ADD INDEX idx_plate (plate);
ALTER TABLE bans ADD INDEX idx_identifier (identifier);

-- Verify with EXPLAIN
EXPLAIN SELECT * FROM players WHERE citizenid = 'ABC123';
-- Look for: type=ref (using index), rows=1 or low number
-- BAD: type=ALL (full table scan)`}</Code>
            {stackData?.database && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.database}</Callout>}
            {QUIZZES.database.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ PLAYER">The Player object — your handle</H2>
            <P>
              Both QBCore and QBox expose a <Term>Player object</Term> via similar APIs. It holds identifier, character data, money, job, gang, inventory, metadata. Every per-player operation starts by fetching the Player.
            </P>
            <Code id="player-access" lang="lua">{`-- QBCore (your current stack)
local QBCore = exports['qb-core']:GetCoreObject()
local Player = QBCore.Functions.GetPlayer(source)

-- QBox (the modern path)
local Player = exports.qbx_core:GetPlayer(source)

-- Both return similar shapes:
Player.PlayerData.citizenid   -- "ABC12345" (the persistent ID)
Player.PlayerData.name        -- character display name
Player.PlayerData.money.cash  -- number
Player.PlayerData.money.bank
Player.PlayerData.job.name    -- "police"
Player.PlayerData.job.grade.level
Player.PlayerData.gang.name   -- "ballas" or "none"
Player.PlayerData.charinfo    -- table: firstname, lastname, birthdate, etc.

-- Common operations
Player.Functions.AddMoney('cash', 100, 'shop:purchase')
Player.Functions.RemoveMoney('cash', 50, 'shop:purchase')
Player.Functions.AddItem('burger', 1)
Player.Functions.RemoveItem('burger', 1)
Player.Functions.SetJob('police', 2)`}</Code>
            <H2 num="◇ MIGRATE">Migration path: QBCore → QBox</H2>
            <P>
              Realistic migration: a few months part-time. Not a one-shot rewrite. The QBox compatibility bridge lets you run QBCore resources on QBox with config tweaks. Migrate one resource at a time, test, ship, repeat.
            </P>
            <ComparisonTable data={COMPARISONS.ox_stack} />
            <P>
              The ox_ ecosystem works on BOTH frameworks. <Kbd>ox_lib</Kbd>, <Kbd>ox_inventory</Kbd>, <Kbd>ox_target</Kbd> can be adopted today on your QBCore server. When you eventually flip the framework to QBox, half the migration work is already done.
            </P>
            <Callout kind="tip" title="THE PRACTICAL MIGRATION STRATEGY">
              Don't rewrite. Don't even migrate frameworks first. Instead: 1) Add ox_lib as a dependency. 2) Replace qb-menu calls with lib.registerContext over time. 3) Replace QBCore.Functions.Notify with lib.notify. 4) Eventually replace qb-inventory with ox_inventory (the big one). 5) THEN consider flipping the framework. By the time you do, you're 80% done.
            </Callout>
            <H2 num="◇ JOB">Job-based permission checks</H2>
            <Code id="job-checks" lang="lua">{`-- Reusable helpers
local function hasJob(Player, jobName, minGrade)
  if not Player then return false end
  if Player.PlayerData.job.name ~= jobName then return false end
  if minGrade and Player.PlayerData.job.grade.level < minGrade then return false end
  return true
end

local function hasGang(Player, gangName, minGrade)
  if not Player then return false end
  if Player.PlayerData.gang.name ~= gangName then return false end
  if minGrade and Player.PlayerData.gang.grade.level < minGrade then return false end
  return true
end

-- Server-side permission gate
RegisterNetEvent('police:lockdown')
AddEventHandler('police:lockdown', function()
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  if not hasJob(Player, 'police', 3) then return end  -- need grade 3+
  -- proceed with lockdown logic
end)

-- For Cle's Claw World gang systems:
RegisterNetEvent('gang:claimTurf')
AddEventHandler('gang:claimTurf', function(turfId)
  local src = source
  local Player = QBCore.Functions.GetPlayer(src)
  if not hasGang(Player, 'ballas', 2) then return end  -- need grade 2+ in the gang
  -- proceed with turf claim
end)`}</Code>
            {stackData?.framework && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.framework}</Callout>}
            {QUIZZES.framework.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ CEF">NUI = Chromium-embedded UI</H2>
            <P>
              FiveM ships a Chromium Embedded Framework (CEF) instance per resource. Your <Kbd>html/index.html</Kbd> renders inside it, overlaid on the game. HTML, CSS, JS — standard web stack. Talks to Lua via two channels.
            </P>
            <H2 num="◇ DOWN">Lua → NUI: SendNUIMessage</H2>
            <Code id="nui-down" lang="lua">{`-- Lua client-side
function ShowShop(shopData)
  SetNuiFocus(true, true)        -- give keyboard + mouse to NUI
  SendNUIMessage({
    action = 'openShop',
    data = shopData,
  })
end

-- Hide
function HideShop()
  SetNuiFocus(false, false)      -- ALWAYS release focus on close
  SendNUIMessage({ action = 'closeShop' })
end`}</Code>
            <Code id="nui-down-js" lang="javascript">{`// html/script.js — runs in the CEF process
window.addEventListener('message', (event) => {
  const msg = event.data;
  if (msg.action === 'openShop') {
    renderShop(msg.data);
    document.body.style.display = 'block';
  } else if (msg.action === 'closeShop') {
    document.body.style.display = 'none';
  }
});`}</Code>
            <H2 num="◇ UP">NUI → Lua: RegisterNUICallback</H2>
            <Code id="nui-up" lang="lua">{`-- Lua client-side
RegisterNUICallback('buyItem', function(data, cb)
  -- data: parsed body from the JS fetch
  -- cb: function you MUST call to resolve the JS Promise
  local itemId = data.itemId
  local count = tonumber(data.count) or 1

  -- Validate
  if type(itemId) ~= 'string' or count < 1 or count > 99 then
    cb({ ok = false, error = 'invalid input' })
    return
  end

  -- Forward to server (server does authoritative work)
  TriggerServerEvent('shop:buyItem', itemId, count)
  cb({ ok = true })  -- MUST call cb or JS Promise hangs forever
end)

RegisterNUICallback('closeShop', function(data, cb)
  HideShop()
  cb({})  -- empty response, but MUST call
end)`}</Code>
            <Code id="nui-up-js" lang="javascript">{`// html/script.js
async function buyItem(itemId, count) {
  try {
    const resp = await fetch(\`https://\${GetParentResourceName()}/buyItem\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, count }),
    });
    const result = await resp.json();
    if (!result.ok) {
      showError(result.error);
    }
  } catch (e) {
    console.error('NUI callback failed:', e);
  }
}`}</Code>
            <Callout kind="dont" title="FORGETTING TO CALL cb()">
              The #1 NUI bug. JS does <Kbd>await fetch(...)</Kbd>; if Lua's callback doesn't call <Kbd>cb({})</Kbd>, the Promise never resolves. UI hangs. Always call cb — even with an empty object.
            </Callout>
            <Callout kind="dont" title="LEAKING SetNuiFocus(true,...)">
              <Kbd>SetNuiFocus(true, true)</Kbd> without a matching <Kbd>SetNuiFocus(false, false)</Kbd> = player can't control their character. 'Stuck mouse' is the #1 player support complaint. Always pair them. Use a finally-like pattern (ESC handler, error handler).
            </Callout>
            {QUIZZES.nui.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ PATTERNS">Production patterns library</H2>
            <P>
              Eight categories of battle-tested patterns: hardened server event handlers, client tick loops with proper Wait, oxmysql async queries with parameterization, QBCore/QBox player access, NUI bridges, ox_lib helpers, performance throttling, server-side security validation.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <button onClick={exportLibrary} className="flex items-center gap-2 border border-pink-300 text-pink-300 px-4 py-2 text-[13px] hover:bg-pink-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            <H2 num="◇ THREE">Three real tools, one sandbox</H2>
            <P>
              A real Lua interpreter (a meaningful subset — locals, tables, functions, if/while/for, FiveM event stubs), an event flow simulator that visualizes client↔server RPC with the security boundary, and a working fxmanifest builder that validates against the spec.
            </P>
            <P>
              The Lua interpreter is bounded: max 10,000 eval steps, max stack depth 50, max input 10,000 chars. Try a runaway loop — the step limit catches it. The event simulator shows what happens when you forget RegisterNetEvent (silently dropped) and when handlers don't validate inputs (exploit risk highlighted in red).
            </P>
            <Sandbox />
            <Callout kind="tip" title="WHAT'S REAL — AND WHAT'S NOT">
              The Lua interpreter executes real Lua code (subset). The tokenizer, parser, evaluator are all real. FiveM stubs (CreateThread, Wait, RegisterNetEvent, etc.) log to the event panel but run synchronously in-sandbox — they DON'T actually yield like real FiveM. The fxmanifest builder validates the same fields FiveM requires. The event flow simulator is honest about which side is "client" and "server" and what crosses the wire.
            </Callout>
            <Callout kind="info" title="THE STEP LIMIT IS BY DESIGN">
              Any while-true loop hits the 10,000-step limit even with Wait() — because the sandbox doesn't actually wait. This is the same teaching: in real FiveM, while-true WITHOUT Wait blocks the tick and times out. The sandbox just shows you the bound up front instead of after a 5-second freeze.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When something breaks on Claw World</H2>
            <P>
              Eight branches covering the most common FiveM production troubles. <strong>Client timeouts is the centerpiece</strong> — your active pain point. Each branch has a step-by-step diagnostic path.
            </P>
            <Troubleshooter />
            <H2 num="◇ TIMEOUT">The full client timeout cause table</H2>
            <ComparisonTable data={COMPARISONS.timeout_causes} />
            <H2 num="◇ TOOLS">The FiveM developer's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'F8 console + resmon 1', what: "Single most useful debugging command. Per-resource CPU + memory. Anything sustained > 0.5ms client / 2ms server is a smell." },
                { name: 'txAdmin', what: "Web-based process manager and admin panel. The default management UI in 2026. Live logs, console, player management, resource control." },
                { name: 'CitizenFX.log', what: "Client-side log file (in %AppData%/CitizenFX). Last actions before a crash or timeout. Forward it from players for diagnostics." },
                { name: 'oxmysql slow query log', what: "Set in MySQL config. Log queries > 100ms. The fastest way to find DB-side timeout causes." },
                { name: 'tracert (server -> player)', what: "Diagnose network instability. If packet loss appears at your host's edge, it's a hosting issue. Talk to Zap/your provider." },
                { name: 'GitHub: Cfx.re/fivem issues', what: "Search for your exact error message. Many timeout patterns are documented platform issues with known workarounds." },
                { name: 'ox_lib cache', what: "Reduce database load on hot reads. lib.cache(60) = 60-second TTL. Hot player data should pass through cache, not DB every time." },
                { name: 'pcall() for risky calls', what: "Lua's error-catching primitive. Wrap external calls (DB, HTTP, NUI) to prevent one bad call from killing the resource." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-pink-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-pink-300 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-cyan-400 text-cyan-400 px-4 py-2 text-[13px] hover:bg-cyan-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
            </button>
            {QUIZZES.triage.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 11:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-pink-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
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
                      <div className="text-pink-300 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A pragmatic path forward</H2>
            <P>For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'This week', plan: "Run resmon 1 during peak on Claw World. Screenshot the worst offenders. Investigate the top 1-2 resources eating CPU. Most servers have 1-2 resources eating 50%+ of the budget." },
                { wk: 'This week', plan: "Audit a few server-side event handlers. Look for: source vs client-supplied IDs, payload validation, parameterized SQL. Pick the most-fired event and harden it first." },
                { wk: 'Next week', plan: "Add ox_lib as a dependency to your server.cfg if not already. Start replacing qb-menu calls with lib.registerContext. Replace QBCore.Functions.Notify with lib.notify. These work on QBCore today." },
                { wk: 'Next week', plan: "Set up the mysql slow query log. Watch for 24 hours. The repeating slow queries are your DB optimization targets — add indexes on their WHERE columns." },
                { wk: 'This month', plan: "Test ox_inventory in a staging server. It's the biggest behavioral change of the ox_ stack. Plan a migration window. Coordinate with players (data migration scripts exist)." },
                { wk: 'This month', plan: "Document every custom resource you've written — purpose, dependencies, known issues. Future-you (and any contributors) will thank you. Drop a README.md in each resource folder." },
                { wk: 'Beyond', plan: "Consider the QBox migration when ox_inventory + ox_lib + ox_target are already in place. By then it's a smaller leap. Don't rush it; QBCore servers run fine, but the writing is on the wall." },
                { wk: 'Always', plan: "When adding any new resource: resmon BEFORE shipping. Audit event handlers for source validation. Test with the Sandbox event-unsafe pattern in mind. The discipline compounds." },
              ].map((w, i) => (
                <div key={i} className="border-l-2 border-pink-300 pl-3 py-1">
                  <div className="text-pink-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-pink-300 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-cyan-400 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-pink-300 text-pink-300 px-4 py-2 text-[13px] hover:bg-pink-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-cyan-400 text-cyan-400 px-4 py-2 text-[13px] hover:bg-cyan-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-amber-200 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-rose-400 hover:text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              You've walked from FiveM's origin (CFX.re, Rockstar acquisition) through the QBCore→QBox split, the server/client architecture, Lua fundamentals, the event system + the server-authority rule, fxmanifest + exports, oxmysql, framework patterns, NUI bridges. Live Lua interpreter you can run code in. Event flow simulator that visualizes what crosses the wire. fxmanifest builder.

              The single biggest leverage move for Claw World RP: <strong>resmon 1 during peak, then harden the top 2 resources</strong>. Most servers have one or two bad actors eating most of the CPU budget. Fix them, the timeouts ease. The rest of the atlas is preventative — building the discipline so new code doesn't make it worse.
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
            <div className="text-pink-300 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>◫</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>FIVEM / LUA / QBCORE</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-cyan-400/40 text-cyan-400 px-2 py-1 text-[11px] hover:bg-cyan-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-pink-300 hover:text-pink-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-pink-300 bg-pink-300/10 text-pink-300' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-pink-300" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-pink-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-pink-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-pink-300 text-pink-300 bg-pink-300/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-pink-300 hover:text-pink-300'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-pink-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ◫ · fivem atlas · current May 2026 · source = identity. validate the payload.
          </div>
        </div>
      </main>
    </div>
  );
}
