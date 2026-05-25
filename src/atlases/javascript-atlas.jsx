import { useState, useEffect } from 'react';
import {
  Compass, Cpu, Code2, Zap, FunctionSquare, Layers, GitBranch, Boxes,
  MousePointerClick, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, Download, ArrowLeft, RotateCcw, Play, Quote, Package,
  Sparkles, Activity, Terminal
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Brendan Eich, 10 days, 1995 — and why JS turned out the way it did." },
  { id: 'foundation', label: 'Foundation', icon: Cpu, num: '02', sub: "Setup, REPLs, strict mode, globalThis." },
  { id: 'bedrock', label: 'Bedrock', icon: Layers, num: '03', sub: "Types, coercion, scope, hoisting — what every JS bug traces back to." },
  { id: 'functions', label: 'Functions', icon: FunctionSquare, num: '04', sub: "First-class. Closures. `this`. The most important chapter." },
  { id: 'objects', label: 'Objects', icon: Boxes, num: '05', sub: "Prototypes, classes, property descriptors." },
  { id: 'iteration', label: 'Iteration', icon: GitBranch, num: '06', sub: "Iterators, generators, ES2025 iterator helpers." },
  { id: 'async', label: 'Async', icon: Activity, num: '07', sub: "Event loop, microtasks, promises. The model that confuses everyone." },
  { id: 'modules', label: 'Modules', icon: Package, num: '08', sub: "ESM, CJS, npm, bundlers, semver." },
  { id: 'sandbox', label: 'Sandbox', icon: Terminal, num: '09', sub: "Real working JS REPL. Six challenges + free play." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '10', sub: "The decision tree for every common JS error." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '11', sub: "Cheatsheet, ECMAScript references, recommended reading." },
];

const STACKS = [
  { id: 'frontend', label: 'Frontend — browser UIs', desc: 'DOM, events, eventually React/Vue/Svelte', icon: '◐' },
  { id: 'backend', label: 'Backend — Node.js / Bun', desc: 'APIs, services, scripts, servers', icon: '◑' },
  { id: 'fullstack', label: 'Fullstack — both ends', desc: 'Browser + server, isomorphic code', icon: '◉' },
  { id: 'automation', label: 'Automation / scripting', desc: 'n8n Code nodes, scrapers, glue code', icon: '⟂' },
  { id: 'fundamentals', label: 'Just the language, properly', desc: 'Master JS itself before picking a platform', icon: 'ƒ' },
];

const GLOSSARY = {
  Primitive: "One of seven immutable value types: undefined, null, boolean, number, bigint, string, symbol. Compared by value.",
  Object: "Everything that isn't a primitive. Arrays, functions, dates, Maps, Sets — all objects. Compared by reference.",
  Closure: "A function plus the lexical environment it was defined in. The function 'closes over' variables it references, keeping them alive after the outer function returns. (YDKJS: Scope & Closures, Ch. 7)",
  "Lexical scope": "Scope determined by where a function is written in the source, not where it's called. JS uses lexical scope. (MDN: Closures)",
  Hoisting: "Engine 'lifts' var declarations and function declarations to the top of scope before execution. let/const are hoisted but unreachable until declared (TDZ).",
  TDZ: "Temporal Dead Zone. Period between block start and let/const declaration. Accessing the variable throws ReferenceError. (MDN: let)",
  IIFE: "Immediately Invoked Function Expression. (function(){…})(). Pre-ESM module scoping pattern.",
  this: "A keyword whose value depends on HOW the function is called. Five rules: arrow (lexical), new, explicit (.call/.apply/.bind), implicit (obj.fn()), default (undefined/global).",
  "Arrow function": "Function with => syntax. No own this, arguments, or super. Cannot be used with new. Inherits this from enclosing scope. (MDN)",
  "Higher-order function": "A function that takes another function as an argument, or returns one. Array.map and filter are canonical examples.",
  "Pure function": "Given same input, always returns same output, modifies nothing outside itself. Easy to test, easy to reason about.",
  Currying: "Transforming f(a,b,c) into f(a)(b)(c). Enables partial application.",
  Prototype: "Every object has an internal [[Prototype]] link. Property lookup walks this chain until found or null. Foundation of JS inheritance. (MDN: Object prototypes)",
  Constructor: "Function used with `new` to create objects. Capitalized by convention. ES2015 added class syntax as sugar over this.",
  Class: "ES2015 syntax for defining objects with shared methods. Looks classical, but underneath: still prototypes.",
  "Private field": "Class fields prefixed with #. Truly private — invisible outside the class. ES2022.",
  Getter: "Method that runs when a property is accessed. `get name() { return this._name }`.",
  Symbol: "Primitive whose values are guaranteed unique. Used for unique property keys and well-known protocols (Symbol.iterator, etc.).",
  Iterator: "Object implementing the iterator protocol: a .next() method returning {value, done}.",
  Iterable: "Object with [Symbol.iterator]() that returns an iterator. Arrays, strings, Maps, Sets are iterables. Enables for-of and spread.",
  Generator: "Function declared with function*. Returns an iterator. yield pauses; next() resumes. Lazy evaluation.",
  "Event loop": "Runtime mechanism for async without threads. Algorithm: pop task → run to completion → drain microtasks → render → repeat. (MDN: The event loop)",
  "Call stack": "Tracks which functions are executing. Push on call, pop on return. Stack overflow = too deep.",
  "Task queue": "Macrotask queue. setTimeout, setInterval, I/O, UI events. One per event loop iteration.",
  "Microtask queue": "Higher priority than tasks. Promise.then, queueMicrotask, MutationObserver. Drained completely between every task.",
  Promise: "Object representing an eventual async result. States: pending → fulfilled or rejected. Settles once. (MDN: Using promises)",
  "async function": "Function that always returns a Promise. `await` inside pauses until a Promise settles.",
  await: "Pauses async function execution until right-hand Promise settles. Unwraps the resolved value. Rejections throw.",
  Module: "File with its own scope, exporting + importing values. Two systems: ESM (modern) and CommonJS (Node legacy).",
  ESM: "ES Modules. Standard. import/export syntax. Static, supports tree-shaking, top-level await.",
  CommonJS: "Node's original module system. require() / module.exports. Dynamic, synchronous.",
  npm: "Node Package Manager. Registry + CLI. Largest software registry (~3M packages).",
  semver: "Semantic Versioning. MAJOR.MINOR.PATCH. ^1.2.3 = compatible; ~1.2.3 = patch-only.",
  "Type coercion": "Implicit type conversion. `1 + '2'` → '12'. `==` triggers coercion. Use `===` to avoid. (MDN: Equality comparisons)",
  "Strict mode": "Opt-in stricter parsing + runtime. 'use strict' at top. Auto in ESM + class bodies. (MDN)",
  globalThis: "Standardized global object accessor. Works in browsers (window), Node (global), Workers (self). ES2020.",
  BigInt: "Arbitrary-precision integer. Literal: 42n. Can't mix with Number (TypeError).",
  Destructuring: "Syntax unpacking arrays/objects into variables. const {a,b} = obj. ES2015.",
};

const QUIZZES = {
  origin: [
    { qid: 'o1', q: "Why is JavaScript called 'JavaScript' if it has almost nothing to do with Java?", opts: ["Java's syntax inspired JavaScript's syntax", "Marketing. Netscape rode the 1995 Java hype by renaming LiveScript to JavaScript", "Originally designed as a scripting layer for Java applets"], a: 1, x: "Brendan Eich's language was Mocha, then LiveScript. Netscape renamed it JavaScript in 1995 to ride Sun's Java marketing. The languages share C-family syntax and roughly nothing else. (MDN: About JavaScript)" },
    { qid: 'o2', q: "Relationship between JavaScript and ECMAScript?", opts: ["Different names for the same thing", "ECMAScript is the standardized language spec; JavaScript is Mozilla/Netscape's implementation. Effectively synonyms today", "ECMAScript is a stricter subset of JavaScript"], a: 1, x: "After Microsoft made JScript, the language was standardized as ECMAScript by Ecma International in 1997. TC39 (the committee) ships new versions yearly. 'JavaScript' is an Oracle trademark; 'ECMAScript' is the spec name. (tc39.es/ecma262)" },
  ],
  foundation: [
    { qid: 'f1', q: "You write `function foo() { x = 5 }` (no var/let/const). What happens in strict mode vs not?", opts: ["Same thing — creates a global variable", "Without strict: implicit global. With strict: ReferenceError", "Both throw an error"], a: 1, x: "Sloppy mode silently creates a global property — a famous source of bugs. Strict mode throws. ESM and class bodies are strict by default. (MDN: Strict mode)" },
    { qid: 'f2', q: "You want a single way to access the global object across browsers, Node, and Workers. What do you use?", opts: ["window", "globalThis", "global"], a: 1, x: "`window` is browser-only, `global` Node-only, `self` browser+worker only. `globalThis` (ES2020) unifies them. (MDN: globalThis)" },
  ],
  bedrock: [
    { qid: 'b1', q: "How many falsy values does JavaScript have?", opts: ["5", "8", "Unlimited"], a: 1, x: "Eight: false, 0, -0, 0n, '', null, undefined, NaN. Everything else (including [], {}, '0', 'false') is truthy. (MDN: Falsy)" },
    { qid: 'b2', q: "`typeof null` returns…?", opts: ["'null'", "'object'", "'undefined'"], a: 1, x: "Returns 'object' — a bug baked in since JavaScript 1.0 that can never be fixed without breaking the web. Use `x === null` for actual null checks. (MDN: typeof)" },
    { qid: 'b3', q: "`0.1 + 0.2 === 0.3` evaluates to…?", opts: ["true", "false", "Throws an error"], a: 1, x: "false. JS numbers are IEEE 754 doubles. 0.1 and 0.2 can't be represented exactly in binary, so their sum is 0.30000000000000004. True in nearly every language. For currency, use BigInt or a decimal lib." },
    { qid: 'b4', q: "Which equality operator should you almost always use?", opts: ["== — handles type coercion for you", "=== — no coercion, predictable", "Either is fine"], a: 1, x: "`==` triggers coercion with surprising rules (`'' == 0`, `[] == false`, `null == undefined` are all true). `===` compares without coercion. (MDN: Equality comparisons. YDKJS: Types & Grammar Ch. 4)" },
  ],
  functions: [
    { qid: 'fn1', q: "What does this print?\nfunction make() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = make();\nconsole.log(inc(), inc());", opts: ["1, 1", "1, 2", "0, 1"], a: 1, x: "Closure. The arrow function keeps `count` alive after make() returns. Each call increments the SAME count. Most important pattern in JS. (YDKJS: Scope & Closures, Ch. 7)" },
    { qid: 'fn2', q: "Inside `setTimeout(function(){ console.log(this) }, 100)` — what is `this` in non-strict mode in browser?", opts: ["The function itself", "The Window (global object)", "undefined"], a: 1, x: "Default binding: `this` defaults to global in non-strict, undefined in strict. Arrow functions would inherit `this` lexically instead. The 5 rules: default, implicit, explicit, new, lexical (arrow). (MDN: this)" },
    { qid: 'fn3', q: "Difference between arrow function and regular function?", opts: ["Arrows are shorter syntax — that's it", "Arrows have no own this/arguments/super; they inherit lexically. Can't be used with new", "Arrows are slower"], a: 1, x: "These differences matter. Arrows are wrong for object methods needing own `this`, for event handlers expecting `this` = element, and for constructors. Perfect for callbacks preserving outer `this`. (MDN: Arrow functions)" },
  ],
  objects: [
    { qid: 'ob1', q: "You do `obj.foo`, JS doesn't find foo on obj. What happens?", opts: ["Returns undefined immediately", "Walks the [[Prototype]] chain, returns first found foo (or undefined at end)", "Throws TypeError"], a: 1, x: "Prototype delegation. Every object has a [[Prototype]] link (default: Object.prototype). Property lookup walks this chain. How `class B extends A` works under the hood. (MDN: Object prototypes)" },
    { qid: 'ob2', q: "`class` syntax — what is it really?", opts: ["A completely new object system added in ES2015", "Syntactic sugar over constructor functions + prototypes. No new mechanism — just better syntax", "An alias for `function`"], a: 1, x: "ES2015 added class, but the underlying mechanism is still prototypes. `class Foo {}` creates a function whose prototype property holds methods. `extends` sets the prototype chain. Knowing this separates users from understanders. (YDKJS: Objects & Classes)" },
    { qid: 'ob3', q: "Two objects: {a: 1} and {a: 1}. Are they ===?", opts: ["Yes — same shape, same values", "No — objects compared by reference, not structure", "Only with Object.is()"], a: 1, x: "Object equality in JS is reference equality. Two structurally identical objects are NOT ===. For structural comparison, use a deep-equal utility. Trips up people coming from Python or Ruby." },
  ],
  iteration: [
    { qid: 'it1', q: "What makes an object 'iterable'?", opts: ["Being an array", "Having a [Symbol.iterator]() method that returns an object with .next()", "Inheriting from Iterable"], a: 1, x: "The iterable protocol: implement [Symbol.iterator](). Arrays, strings, Maps, Sets, generators all do. You can make your own — then for-of and spread work on it. (MDN: Iteration protocols)" },
    { qid: 'it2', q: "What does `function* g() { yield 1; yield 2; yield 3; }` produce?", opts: ["Returns [1, 2, 3]", "Returns an iterator. next() yields {value:1, done:false}, then 2, then 3, then {done:true}", "Logs 1,2,3 and stops"], a: 1, x: "Generators are lazy. They produce an iterator that yields values on demand. `yield` pauses; `next()` resumes. Foundation for async iteration. (MDN: function*)" },
    { qid: 'it3', q: "ES2025 adds iterator helpers. `someIterator.map(x=>x*2).take(5).toArray()` does what?", opts: ["Errors — iterators don't have map", "Lazily maps, takes first 5, materializes to array. Works on any iterator, lazy", "Eagerly converts to array first"], a: 1, x: "ES2025 iterator helpers (.map, .filter, .take, .drop, .toArray, .reduce) work on any iterator and are LAZY — perfect for infinite or large sequences. Huge for memory-efficient streaming. (tc39.es/proposal-iterator-helpers)" },
  ],
  async: [
    { qid: 'as1', q: "Output order?\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);", opts: ["1, 2, 3, 4", "1, 4, 3, 2", "1, 4, 2, 3"], a: 1, x: "1 and 4 sync. Stack empties. Microtask queue drains BEFORE next macrotask → 3 (Promise.then is microtask) before 2 (setTimeout is macrotask). The most-tested async question on earth. (MDN: Event loop)" },
    { qid: 'as2', q: "Inside `async function foo() { ... }`, what does foo() return?", opts: ["Whatever the function returns", "A Promise — always. Plain values wrapped, throws wrapped as rejections", "undefined if no return"], a: 1, x: "async functions ALWAYS return a Promise. `return 5` becomes Promise.resolve(5). `throw err` becomes Promise.reject(err). The whole point — async/await is nicer syntax for Promise chains. (MDN: async function)" },
    { qid: 'as3', q: "Two async ops you want in parallel, wait for both. Correct?", opts: ["const a = await getA(); const b = await getB();", "const [a, b] = await Promise.all([getA(), getB()]);", "Both run in parallel — JS auto-parallelizes"], a: 1, x: "First is sequential — getB doesn't start until getA finishes. Use Promise.all to fire both immediately. Forgetting this means 'why is my app slow?' has a 50% chance of being the answer. (MDN: Promise.all)" },
    { qid: 'as4', q: "Await a promise that rejects. How do you catch?", opts: [".catch() on the promise", "try/catch around the await", "Both work; try/catch is idiomatic inside async functions"], a: 2, x: "Once you're in async/await, try/catch is idiomatic — rejections behave like sync exceptions. .catch() still works but mixes paradigms. (MDN: Using promises)" },
  ],
  modules: [
    { qid: 'm1', q: "Difference between `import x from \u0027foo\u0027` and `const x = require(\u0027foo\u0027)`?", opts: ["Same thing, different syntax", "Import is ESM (static, async, tree-shakeable); require is CommonJS (dynamic, sync, Node-specific)", "Require is faster"], a: 1, x: "ESM imports are hoisted, can't be conditional (top-level), enable tree-shaking. CJS requires are function calls — conditional, lazy, but invisible to bundlers. Modern code prefers ESM. (MDN: Modules)" },
    { qid: 'm2', q: "`\"foo\": \"^1.2.3\"` in package.json. What versions match?", opts: ["Exactly 1.2.3", "Any 1.x.y where >=1.2.3 (caret = compatible)", "Any version starting with 1"], a: 1, x: "^1.2.3 = >=1.2.3 and <2.0.0. ~1.2.3 = >=1.2.3 and <1.3.0 (patch only). Lockfile records exact installed version for reproducible installs. (npm: semver)" },
  ],
  atlas: [
    { qid: 'at1', q: "Three pieces of JS literacy that separate intermediate from senior?", opts: ["Knowing more framework APIs", "Closures, the event loop, and the prototype chain — the language's three load-bearing mechanisms", "Memorizing array methods"], a: 1, x: "Frameworks come and go. The language doesn't. If you can explain closures, draw the event loop, and trace property lookup through a prototype chain, you can read and reason about ANY JS code — including the framework source. The long-term investment." },
  ],
};

const COMMANDS = [
  { cmd: 'node', desc: 'Open the Node REPL — try any JS expression interactively.' },
  { cmd: 'node script.js', desc: 'Run a script file.' },
  { cmd: 'node --inspect-brk script.js', desc: 'Run with debugger attached. Open chrome://inspect.' },
  { cmd: 'npm init -y', desc: 'Create package.json with defaults.' },
  { cmd: 'npm install <pkg>', desc: 'Install a package; updates package.json + lockfile.' },
  { cmd: 'npm install <pkg> --save-dev', desc: 'Install as devDependency (build tools, test runners).' },
  { cmd: 'npm install', desc: 'Install everything in package.json into ./node_modules.' },
  { cmd: 'npm ci', desc: 'Clean install from lockfile. Use in CI — fast + deterministic.' },
  { cmd: 'npm run <script>', desc: 'Run a script from package.json scripts.' },
  { cmd: 'npm outdated', desc: 'See which deps have newer versions.' },
  { cmd: 'npm audit', desc: 'Check for known security vulnerabilities.' },
  { cmd: 'npx <pkg>', desc: 'Run a binary from a package without installing globally.' },
  { cmd: 'node --version', desc: 'Which Node is on PATH.' },
  { cmd: 'corepack enable', desc: 'Activate Node\'s package manager manager (use pnpm/yarn).' },
];

const RESOURCES = [
  { name: 'MDN Web Docs — JavaScript', url: 'developer.mozilla.org/en-US/docs/Web/JavaScript', note: "The reference. If you only bookmark one site, this is it. Maintained by Mozilla, examples for everything.", kind: 'reference' },
  { name: 'TC39 ECMAScript 2025 spec', url: 'tc39.es/ecma262', note: "The actual language spec. Dense but authoritative.", kind: 'spec' },
  { name: 'You Don\'t Know JS Yet (2nd ed)', url: 'github.com/getify/You-Dont-Know-JS', note: "Kyle Simpson's 6-book series. Free online. Get Scope & Closures + This & Object Prototypes first.", kind: 'book' },
  { name: 'Eloquent JavaScript (4th ed)', url: 'eloquentjavascript.net', note: "Marijn Haverbeke. Free online. Most respected single-volume intro.", kind: 'book' },
  { name: 'The Modern JavaScript Tutorial', url: 'javascript.info', note: "Ilya Kantor's comprehensive walkthrough. Free, structured.", kind: 'tutorial' },
  { name: 'Node.js Docs', url: 'nodejs.org/docs/latest', note: "Reference for server-side JS. Guides section is unusually good.", kind: 'reference' },
  { name: 'MDN Curriculum', url: 'developer.mozilla.org/en-US/curriculum', note: "Mozilla's official structured front-end curriculum.", kind: 'curriculum' },
  { name: 'TC39 proposals', url: 'github.com/tc39/proposals', note: "What's coming. Track stage 3-4 to see what'll land next.", kind: 'spec' },
  { name: 'What the heck is the event loop? (Philip Roberts)', url: 'youtube — search title', note: "The 2014 talk that explained the event loop to a generation. Jake Archibald's 'In the loop' goes deeper.", kind: 'talk' },
  { name: 'Exploring JS (Axel Rauschmayer)', url: '2ality.com', note: "Every TC39 feature explained the day it stabilizes.", kind: 'blog' },
];

const PERSONALIZED = {
  frontend: {
    spark: "Frontend kickoff: console.log inside an event listener. Open DevTools → console, paste into the browser, see it run. The browser IS your REPL.",
    functions: "Frontend: event handlers are functions passed by reference. `button.addEventListener('click', handler)` — higher-order function in the wild.",
    async: "Frontend async: fetch() returns a Promise. async/await + try/catch is the modern pattern. AbortController for canceling stale requests.",
  },
  backend: {
    spark: "Backend kickoff: a 6-line HTTP server in plain Node, no Express. `http.createServer((req, res) => res.end('hi')).listen(3000)`. Then iterate.",
    functions: "Backend: middleware is functions all the way down. `(req, res, next) => ...`. Express, Fastify, Koa — same shape, different colors.",
    async: "Backend async is everything: I/O, DB, network. Master Promise.all, error propagation, parallel vs concurrent. AsyncLocalStorage for request context.",
  },
  fullstack: {
    spark: "You'll write the same language on both sides. Build language fluency first — frameworks are details.",
    functions: "Higher-order patterns work identically on both ends. Grok them once, then React hooks + Express middleware + RxJS all click.",
    async: "Browser fetch + Node fetch (standard since Node 18) means the same Promise-based API works both places. Lean into that.",
  },
  automation: {
    spark: "Automation: a Code node in n8n IS a JS REPL with $input.all() and $json available. Same patterns as a Node script — just item arrays instead of stdin/stdout.",
    functions: "Map/filter/reduce on arrays of items is the whole game. Master those three plus destructuring, and 80% of n8n Code nodes write themselves.",
    async: "n8n Code nodes can be async. Useful for one-off API calls in a transform — but for many calls, prefer an HTTP Request node so n8n can parallelize.",
  },
  fundamentals: {
    spark: "Best decision. Get the language right before specializing. Pick the Node REPL or browser DevTools — both full JS engines, no setup.",
    functions: "Spend a week here. Closures and `this` binding take more reps than feels reasonable, then suddenly click and never let go.",
    async: "Watch Jake Archibald's event loop talk twice. Draw the call stack, microtask queue, task queue on paper. Model becomes permanent.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's the error?",
    opts: [
      { label: "🔴 TypeError: cannot read properties of undefined", next: 'type-undef' },
      { label: "🔴 ReferenceError: x is not defined", next: 'ref-undef' },
      { label: "🔴 Unhandled promise rejection", next: 'unh-rej' },
      { label: "🐢 Browser/Node frozen", next: 'frozen' },
      { label: "🌀 Async ordering doesn't make sense", next: 'async-order' },
      { label: "🤔 `this` is wrong / undefined", next: 'this-bind' },
      { label: "🪤 `==` giving weird results", next: 'eq-weird' },
      { label: "📦 Module / import errors", next: 'mod-err' },
    ],
  },
  'type-undef': {
    fix: "You're accessing a property on undefined or null.",
    steps: [
      "Read the stack trace. First line points to file + line — go there.",
      "Add `console.log(obj)` right before the failing line. Is obj what you expected?",
      "Common: async result not yet arrived (missing `await`).",
      "Common: array method returned undefined. `arr.find(...)` returns undefined if no match.",
      "Fix: `obj?.foo?.bar` (optional chaining, ES2020) returns undefined instead of throwing.",
      "Better: investigate WHY the value is missing further upstream.",
    ],
  },
  'ref-undef': {
    fix: "The variable doesn't exist in this scope.",
    steps: [
      "Typo. Check spelling carefully (userId vs userid).",
      "Scope: declared inside a function or block? Can't access from outside.",
      "TDZ: using let/const before declaration. Variable exists but unreachable.",
      "Forgot to import: in ESM, you must `import` what you use.",
      "Node: forgot to require() or path is wrong.",
    ],
  },
  'unh-rej': {
    fix: "A promise rejected and nothing was there to catch.",
    steps: [
      "Find the source: the error message includes the rejection reason.",
      "Wrap awaits in try/catch, or chain .catch() on promise chains.",
      "Forgotten `await`? `fetch(url)` without await returns a Promise; cascade of errors AND rejection unhandled.",
      "Top-level await in modules: errors propagate out — handle at import sites.",
      "Node 15+: unhandled rejections crash by default. Configure process.on('unhandledRejection') for visibility, not as a fix.",
    ],
  },
  frozen: {
    fix: "Synchronous code is blocking the event loop.",
    steps: [
      "Infinite loop? `while(true)` or recursion without base case. DevTools Sources → Pause.",
      "Expensive computation on main thread? Move to Web Worker (browser) or worker_thread (Node).",
      "JSON.parse on huge string is synchronous. Stream parsers for large data.",
      "DOM thrash? Batch reads + writes. Use requestAnimationFrame.",
      "Node: sync I/O (fs.readFileSync) in a request handler blocks every other request.",
    ],
  },
  'async-order': {
    fix: "You're modeling async ordering wrong.",
    steps: [
      "Microtasks (Promise.then, queueMicrotask) ALWAYS drain before next macrotask (setTimeout, I/O).",
      "Inside async function, `await x` pauses, resumes as a microtask. Code after `await` runs next microtask tick.",
      "console.log INSIDE then() can appear LATER than log AFTER the .then() chain — expected.",
      "Parallel: use Promise.all. Sequential awaits run one after another.",
      "Canonical: log(1); setTimeout(()=>log(2),0); Promise.resolve().then(()=>log(3)); log(4); → 1, 4, 3, 2.",
    ],
  },
  'this-bind': {
    fix: "`this` is set by HOW the function is called, not where defined.",
    steps: [
      "Five rules: arrow (lexical) > new > explicit (.call/.apply/.bind) > implicit (obj.fn()) > default (undefined in strict, global otherwise).",
      "Class methods passed as callbacks lose `this`. Fix: .bind(this), or arrow function methods, or wrap: () => this.fn().",
      "Arrows can't be used with new, and ignore explicit .call/.bind. Take `this` from enclosing scope.",
      "Strict mode (incl. all ESM and class bodies): default `this` is undefined, not global.",
      "Debug: `console.log(this)` inside the function. Often clarifies instantly.",
    ],
  },
  'eq-weird': {
    fix: "Stop using `==`. Use `===`.",
    steps: [
      "`==` triggers coercion: `'' == 0` (true), `null == undefined` (true), `[] == false` (true), `[1] == 1` (true).",
      "`===` compares without coercion. Different types → false. Predictable.",
      "Edge: `x == null` checks 'null or undefined' — but `x === null || x === undefined` is clearer.",
      "Special: `NaN === NaN` is FALSE. Use `Number.isNaN(x)`.",
      "Special: `-0 === +0` is true. Use `Object.is(-0, +0)` to distinguish.",
    ],
  },
  'mod-err': {
    q: "Which kind of module issue?",
    opts: [
      { label: "Cannot find module 'foo'", next: 'mod-find' },
      { label: "Cannot use import statement outside a module", next: 'mod-esm' },
      { label: "Mixing ESM and CommonJS", next: 'mod-mix' },
    ],
  },
  'mod-find': {
    fix: "Node can't resolve the path.",
    steps: [
      "Did you `npm install`? Check node_modules/foo exists.",
      "Path right? Relative imports need `./` or `../`. Bare `import x from \u0027foo\u0027` looks in node_modules.",
      "package.json has the dep listed?",
      "ESM-specific: file extensions REQUIRED in imports (`./util.js`, not `./util`).",
      "TS / bundler: tsconfig path aliases may not work at runtime.",
    ],
  },
  'mod-esm': {
    fix: "Node is parsing as CommonJS but you're using ESM syntax.",
    steps: [
      "Easiest: rename file to .mjs.",
      "Or add `\"type\": \"module\"` to package.json (makes ALL .js files ESM in this package).",
      "If you need CJS in an ESM package: name those files .cjs.",
      "TS: ensure tsconfig's `module` + `moduleResolution` are NodeNext or ESNext.",
    ],
  },
  'mod-mix': {
    fix: "ESM can import CJS with quirks. CJS imports ESM only via dynamic import().",
    steps: [
      "ESM importing CJS: `import x from \u0027cjs-pkg\u0027` — works, but only default export is module.exports object. Named imports often fail.",
      "CJS importing ESM: must use `await import(\u0027esm-pkg\u0027)` (dynamic). Plain require() of ESM throws.",
      "Pure ESM packages (no CJS exports) are common now — check the package docs first.",
      "Node 22+: --experimental-require-module flag allows some require()-of-ESM. Still experimental.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'stack', x: 30, y: 30, w: 130, h: 50, label: 'Call Stack', color: '#facc15', desc: "The active execution context. Push frames on call, pop on return. Sync code lives here. Empty = JS ready to pull from queues. Stack overflow if you recurse too deep." },
  { id: 'heap', x: 235, y: 30, w: 130, h: 50, label: 'Heap', color: '#facc15', desc: "Where objects live. Garbage-collected when unreachable from stack + roots. V8 uses generational GC: new objects in Young Gen, survivors promoted to Old." },
  { id: 'apis', x: 30, y: 120, w: 130, h: 38, label: 'Web/Node APIs', color: '#a78bfa', desc: "setTimeout, fetch, fs.readFile, DOM events — NOT in JS. Host APIs running on host threads. When done, push a callback to the task queue (or microtask queue for Promise.then)." },
  { id: 'micro', x: 200, y: 175, w: 165, h: 32, label: 'Microtask queue', color: '#facc15', desc: "Higher priority. Promise.then callbacks, queueMicrotask, MutationObserver. The event loop DRAINS this queue completely between every task." },
  { id: 'task', x: 200, y: 220, w: 165, h: 32, label: 'Task queue (macrotasks)', color: '#a78bfa', desc: "setTimeout, setInterval, I/O completion, UI events. One task per event loop iteration. After task, all microtasks drain before next." },
  { id: 'loop', x: 110, y: 285, w: 180, h: 32, label: 'Event Loop', color: '#facc15', desc: "Coordinator. If stack empty AND microtask queue empty, pull next task from task queue. Push onto stack. Run to completion. Drain microtasks. Repeat. Forever." },
];

const CHALLENGES = [
  {
    id: 'sum', title: '01 · Sum',
    desc: "Write `sum(a, b)` that returns the sum of two numbers.",
    starter: "function sum(a, b) {\n  // your code here\n}",
    fn: 'sum',
    tests: [
      { args: [2, 3], expected: 5 },
      { args: [-1, 1], expected: 0 },
      { args: [0, 0], expected: 0 },
      { args: [100, 200], expected: 300 },
    ],
  },
  {
    id: 'reverse', title: '02 · Reverse a string',
    desc: "Write `reverse(str)` that returns the input string backwards.",
    starter: "function reverse(str) {\n  // your code here\n}",
    fn: 'reverse',
    tests: [
      { args: ['hello'], expected: 'olleh' },
      { args: [''], expected: '' },
      { args: ['a'], expected: 'a' },
      { args: ['JavaScript'], expected: 'tpircSavaJ' },
    ],
  },
  {
    id: 'evensquared', title: '03 · Higher-order arrays',
    desc: "Write `evenSquared(arr)` taking an array of numbers, filter to evens, square each. Use array methods.",
    starter: "function evenSquared(arr) {\n  // hint: filter then map\n}",
    fn: 'evenSquared',
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [4, 16] },
      { args: [[]], expected: [] },
      { args: [[1, 3, 5]], expected: [] },
      { args: [[2, 4, 6]], expected: [4, 16, 36] },
    ],
  },
  {
    id: 'counter', title: '04 · Closure — counter',
    desc: "Write `makeCounter()` returning a NEW function. Each call to that function returns the next integer starting at 1. Two counters should be independent.",
    starter: "function makeCounter() {\n  // your code\n}",
    fn: 'makeCounter',
    custom: true,
    runner: (fn) => {
      const c1 = fn();
      const c2 = fn();
      const r1a = c1();
      const r1b = c1();
      const r2a = c2();
      const r1c = c1();
      return [
        { name: 'first counter call #1 returns 1', pass: r1a === 1 },
        { name: 'first counter call #2 returns 2', pass: r1b === 2 },
        { name: 'second counter starts at 1 (independent)', pass: r2a === 1 },
        { name: 'first counter call #3 returns 3', pass: r1c === 3 },
      ];
    },
  },
  {
    id: 'group', title: '05 · Object — groupBy',
    desc: "Write `groupBy(arr, key)` — array of objects + a key. Returns { keyValue: [items with that value] }.",
    starter: "function groupBy(arr, key) {\n  // your code\n}",
    fn: 'groupBy',
    tests: [
      { args: [[{cat:'a',n:1},{cat:'b',n:2},{cat:'a',n:3}], 'cat'], expected: { a: [{cat:'a',n:1},{cat:'a',n:3}], b: [{cat:'b',n:2}] } },
      { args: [[], 'x'], expected: {} },
    ],
  },
  {
    id: 'delay', title: '06 · Async — delay',
    desc: "Write `delay(ms)` returning a Promise that resolves to 'done' after ms milliseconds. Test with await delay(50).",
    starter: "function delay(ms) {\n  // return a promise\n}",
    fn: 'delay',
    custom: true, async: true,
    runner: async (fn) => {
      const checks = [];
      try {
        const p = fn(10);
        checks.push({ name: 'returns a Promise', pass: p && typeof p.then === 'function' });
        const r = await p;
        checks.push({ name: 'resolves to "done"', pass: r === 'done' });
        const t0 = Date.now();
        await fn(50);
        const dt = Date.now() - t0;
        checks.push({ name: 'waits at least ~50ms', pass: dt >= 45 });
      } catch (e) {
        checks.push({ name: 'no errors thrown', pass: false });
      }
      return checks;
    },
  },
];

const STORAGE_PREFIX = 'jsatlas:';
async function loadKey(key) {
  try { const r = await window.storage.get(STORAGE_PREFIX + key); if (r?.value) return JSON.parse(r.value); }
  catch (e) {}
  return null;
}
async function saveKey(key, value) {
  try { await window.storage.set(STORAGE_PREFIX + key, JSON.stringify(value)); } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════════ */

export default function JavaScriptAtlas() {
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

  const Code = ({ children, id, lang = 'js' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-yellow-300 transition-colors">
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
      info: { border: 'border-yellow-400/40', bg: 'bg-yellow-400/5', text: 'text-yellow-300', label: 'NOTE' },
      warn: { border: 'border-orange-400/40', bg: 'bg-orange-400/5', text: 'text-orange-300', label: 'HEADS UP' },
      tip: { border: 'border-violet-400/40', bg: 'bg-violet-400/5', text: 'text-violet-300', label: 'TIP' },
      you: { border: 'border-emerald-400/40', bg: 'bg-emerald-400/5', text: 'text-emerald-300', label: 'FOR YOUR STACK' },
      cite: { border: 'border-zinc-700', bg: 'bg-zinc-900/40', text: 'text-zinc-400', label: 'CITATION' },
    }[kind];
    return (
      <div className={`my-4 border ${p.border} ${p.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${p.text} mb-1.5 flex items-center gap-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {kind === 'cite' && <Quote size={10} />}
          {title || p.label}
        </div>
        <div className="text-zinc-300 text-[14px] leading-relaxed">{children}</div>
      </div>
    );
  };

  const CheckItem = ({ id, children }) => (
    <button onClick={() => toggleCheck(id)} className="flex items-start gap-3 w-full text-left py-2 hover:bg-zinc-900/50 px-2 -mx-2 transition-colors">
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-yellow-400 border-yellow-400' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-violet-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-yellow-400 bg-yellow-400/10 text-yellow-200' :
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
        className="border-b border-dotted border-yellow-400/60 text-yellow-200 hover:text-yellow-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-yellow-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-yellow-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap any node · Event loop architecture
        </div>
        <svg viewBox="0 0 400 340" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="jarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          <rect x="15" y="15" width="370" height="85" fill="#0a0a0b" stroke="#3f3f46" strokeWidth="1" strokeDasharray="3,3" />
          <text x="25" y="13" fill="#52525b" fontSize="9" style={{ fontFamily: 'JetBrains Mono, monospace' }}>JS ENGINE · single-threaded</text>
          <line x1="95" y1="80" x2="95" y2="118" stroke="#52525b" markerEnd="url(#jarr)" />
          <line x1="160" y1="139" x2="195" y2="183" stroke="#52525b" markerEnd="url(#jarr)" />
          <line x1="160" y1="139" x2="195" y2="228" stroke="#52525b" markerEnd="url(#jarr)" />
          <line x1="200" y1="207" x2="200" y2="280" stroke="#52525b" markerEnd="url(#jarr)" />
          <line x1="200" y1="252" x2="200" y2="280" stroke="#52525b" markerEnd="url(#jarr)" />
          <line x1="200" y1="285" x2="95" y2="80" stroke="#facc15" strokeWidth="0.5" strokeDasharray="2,2" markerEnd="url(#jarr)" opacity="0.5" />
          <text x="170" y="170" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>push</text>
          <text x="225" y="155" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>callback</text>
          <text x="135" y="225" fill="#a78bfa" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>loops</text>
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
          <div className="mt-2 border border-yellow-400/30 bg-yellow-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-yellow-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  const Sandbox = () => {
    const [mode, setMode] = useState('challenges');
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];
    const [code, setCode] = useState(challenge.starter);
    const [output, setOutput] = useState('');
    const [tests, setTests] = useState(null);
    const [running, setRunning] = useState(false);

    useEffect(() => {
      setCode(challenge.starter);
      setOutput('');
      setTests(null);
    }, [challengeIdx]);

    const stringify = (v) => {
      try {
        if (typeof v === 'string') return v;
        if (typeof v === 'function') return v.toString().split('\n')[0] + ' …';
        if (typeof v === 'undefined') return 'undefined';
        if (v === null) return 'null';
        if (typeof v === 'object') return JSON.stringify(v, null, 2);
        return String(v);
      } catch (e) { return String(v); }
    };

    const runFreePlay = () => {
      const logs = [];
      const safeConsole = {
        log: (...args) => logs.push(args.map(stringify).join(' ')),
        error: (...args) => logs.push('[error] ' + args.map(stringify).join(' ')),
        warn: (...args) => logs.push('[warn] ' + args.map(stringify).join(' ')),
        info: (...args) => logs.push(args.map(stringify).join(' ')),
      };
      try {
        const fn = new Function('console', `"use strict";\n${code}`);
        const result = fn(safeConsole);
        if (typeof result !== 'undefined') logs.push('→ ' + stringify(result));
        setOutput(logs.join('\n') || '(no output)');
      } catch (e) {
        setOutput((logs.length ? logs.join('\n') + '\n' : '') + `❌ ${e.name}: ${e.message}`);
      }
    };

    const runTests = async () => {
      setRunning(true);
      setOutput('');
      const logs = [];
      const safeConsole = {
        log: (...args) => logs.push(args.map(stringify).join(' ')),
        error: (...args) => logs.push('[error] ' + args.map(stringify).join(' ')),
      };
      try {
        const builder = new Function('console', `"use strict";\n${code}\nreturn typeof ${challenge.fn} !== "undefined" ? ${challenge.fn} : null;`);
        const userFn = builder(safeConsole);
        if (!userFn) {
          setOutput(`❌ Function "${challenge.fn}" not defined.`);
          setTests([{ name: `defines ${challenge.fn}`, pass: false }]);
          setRunning(false);
          return;
        }
        if (challenge.custom) {
          const checks = challenge.async ? await challenge.runner(userFn) : challenge.runner(userFn);
          setTests(checks);
          setOutput(logs.join('\n') || '(no console output)');
        } else {
          const checks = challenge.tests.map(t => {
            try {
              const actual = userFn(...t.args);
              const pass = JSON.stringify(actual) === JSON.stringify(t.expected);
              return {
                name: `${challenge.fn}(${t.args.map(a => JSON.stringify(a)).join(', ')}) → ${JSON.stringify(t.expected)}`,
                pass,
                actual: JSON.stringify(actual),
              };
            } catch (e) {
              return { name: `${challenge.fn}(...)`, pass: false, err: e.message };
            }
          });
          setTests(checks);
          setOutput(logs.join('\n') || '(no console output)');
        }
      } catch (e) {
        setOutput(`❌ ${e.name}: ${e.message}`);
        setTests([{ name: 'code parses + runs', pass: false }]);
      }
      setRunning(false);
    };

    const allPass = tests && tests.every(t => t.pass);

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            LIVE JS · {mode === 'challenges' ? challenge.title : 'free play'}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-yellow-400 text-yellow-300 bg-yellow-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => { setMode('freeplay'); setCode("// Write any JS — click Run.\n// Try: console.log([1,2,3].map(x => x * 2))\n"); setOutput(''); setTests(null); }} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-yellow-400 text-yellow-300 bg-yellow-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-yellow-400 text-yellow-300 bg-yellow-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.title.split(' · ')[0]}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[13px] text-zinc-300 leading-relaxed">{challenge.desc}</div>
            </div>
          </>
        )}

        <textarea
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
          className="w-full bg-black text-zinc-100 px-3 py-3 text-[13px] outline-none resize-y min-h-[140px] leading-snug"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        />

        <div className="px-3 py-2 border-t border-zinc-800 flex gap-2">
          {mode === 'freeplay' ? (
            <button onClick={runFreePlay}
              className="flex-1 border border-yellow-400 bg-yellow-400/10 text-yellow-200 px-3 py-2 text-[12px] font-bold hover:bg-yellow-400/20 transition-colors flex items-center justify-center gap-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Play size={12} /> Run
            </button>
          ) : (
            <>
              <button onClick={runTests} disabled={running}
                className="flex-1 border border-yellow-400 bg-yellow-400/10 text-yellow-200 px-3 py-2 text-[12px] font-bold hover:bg-yellow-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Play size={12} /> {running ? 'Running…' : 'Run tests'}
              </button>
              <button onClick={() => setCode(challenge.starter)}
                className="border border-zinc-700 text-zinc-400 px-3 py-2 text-[12px] hover:border-zinc-500 transition-colors flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={11} /> Reset
              </button>
            </>
          )}
        </div>

        {(output || tests) && (
          <div className="border-t border-zinc-800 bg-black">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-b border-zinc-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              OUTPUT
            </div>
            <pre className="px-3 py-2 text-[12px] text-zinc-300 max-h-40 overflow-y-auto whitespace-pre-wrap break-words" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {output}
            </pre>
            {tests && (
              <div className="border-t border-zinc-800 px-3 py-2">
                {tests.map((t, i) => (
                  <div key={i} className={`text-[12px] flex items-start gap-2 py-0.5 ${t.pass ? 'text-emerald-300' : 'text-orange-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {t.pass ? <Check size={12} className="shrink-0 mt-0.5" /> : <X size={12} className="shrink-0 mt-0.5" />}
                    <span className="break-all">{t.name}{t.err && ` — ${t.err}`}</span>
                  </div>
                ))}
                {allPass && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 text-emerald-300 text-[12px] font-bold flex items-center gap-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ✓ ALL TESTS PASS {challengeIdx < CHALLENGES.length - 1 && (
                      <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="ml-2 text-yellow-300 hover:text-yellow-100 underline">next →</button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
                  <span className={i === path.length - 1 ? 'text-yellow-300' : ''}>{p}</span>
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
              <div className="border-l-2 border-yellow-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-yellow-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-yellow-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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

  const exportCheatsheet = () => {
    let md = "# JavaScript Atlas — Cheatsheet\n\n";
    md += "## Type checks\n```js\ntypeof x                 // 'undefined' | 'boolean' | 'number' | 'bigint' | 'string' | 'symbol' | 'function' | 'object'\nArray.isArray(x)         // arrays\nNumber.isFinite(x)       // finite\nNumber.isInteger(x)      // integers\nNumber.isNaN(x)          // NaN ONLY\nObject.is(x, y)          // strict; distinguishes -0/+0; treats NaN as equal\nx instanceof Class       // prototype chain check\n```\n\n";
    md += "## Modern syntax\n```js\nconst {a, b: renamed, c = 1} = obj\nconst [first, ...rest] = arr\nuser?.address?.city\nvalue ?? 'default'\nobj.foo ??= 'default'\nconst merged = {...a, ...b}\n```\n\n";
    md += "## Array essentials\n```js\narr.map(fn) / filter(fn) / reduce(fn, init)\narr.find(fn) / findIndex(fn)\narr.some(fn) / every(fn)\narr.flat(d) / flatMap(fn)\narr.at(-1)\nObject.groupBy(arr, fn)   // ES2024\n```\n\n";
    md += "## Promises\n```js\nconst [a, b] = await Promise.all([getA(), getB()])\nawait Promise.allSettled([a, b])\nawait Promise.race([a, b])\nawait Promise.any([a, b, c])\nawait Promise.try(() => possiblyThrowSync())   // ES2025\n```\n\n";
    md += "## ES2025 iterator helpers\n```js\nIterator.from(someIter).map(x => x*2).filter(x => x > 0).take(10).toArray()\n```\n\n";
    md += "## Commands\n\n";
    COMMANDS.forEach(c => { md += `**${c.desc}**\n\`\`\`\n${c.cmd}\n\`\`\`\n\n`; });
    md += "## Authoritative resources\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    md += "\n---\n_Grounded in MDN, TC39 ES2025, YDKJS Yet (2nd ed), Eloquent JavaScript (4th ed), javascript.info._\n";

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'javascript-atlas-cheatsheet.md'; a.click();
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
        <div className="max-w-lg w-full bg-zinc-950 border border-yellow-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-yellow-300" />
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
                  item.kind === 'chapter' ? 'text-yellow-300' :
                  item.kind === 'term' ? 'text-violet-300' : 'text-emerald-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-yellow-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-yellow-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ƒ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What are you using JavaScript for?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-yellow-400 hover:bg-yellow-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-yellow-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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

  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return (
          <>
            <H2 num="◇ 1995">A 10-day language that won the web</H2>
            <P>
              In May 1995, Netscape hired Brendan Eich and gave him ten days to design a scripting language for the browser. The result was originally Mocha, then LiveScript,
              then — for marketing purposes — JavaScript, to ride the Java hype. It shares C-family syntax with Java and roughly nothing else.
            </P>
            <P>
              The language was standardized as <Term name="ESM">ECMAScript</Term> by Ecma International in 1997, after Microsoft shipped its own variant (JScript).
              The standards committee is TC39; they ship a new edition every June. The current version is ECMAScript 2025 (16th edition), approved June 25, 2025.
            </P>
            <Callout kind="cite" title="SOURCE">
              tc39.es/ecma262 — the spec. ES2025 brought iterator helpers, Promise.try(), RegExp.escape(), Set methods (intersection, union, etc.), JSON modules with import attributes, and Float16Array.
            </Callout>
            <H2 num="◇ NATURE">What kind of language is it?</H2>
            <P>JavaScript is genuinely multi-paradigm. You can write it as:</P>
            <ul className="space-y-2 text-[14px] text-zinc-300 my-3">
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Functional:</strong> first-class functions, closures, higher-order functions, immutable patterns</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Object-oriented:</strong> via prototypes (or the class syntactic sugar over prototypes)</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Procedural:</strong> top-down scripts</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Event-driven:</strong> the entire browser model + Node's event loop</span></li>
            </ul>
            <P>Dynamically typed. Single-threaded with cooperative async. Garbage-collected. Prototypal inheritance (not classical, despite <Term>Class</Term>).</P>
            <H2 num="◇ WHERE">Engines + runtimes</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'V8', who: 'Google', where: 'Chrome, Edge (since 2020), Node.js, Deno, Cloudflare Workers' },
                { name: 'SpiderMonkey', who: 'Mozilla', where: 'Firefox. The oldest engine — Eich himself wrote it in 1995.' },
                { name: 'JavaScriptCore', who: 'Apple', where: 'Safari, iOS WebView. Aka Nitro.' },
                { name: 'Hermes', who: 'Meta', where: 'React Native. Built for mobile constraints.' },
              ].map(e => (
                <div key={e.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-yellow-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{e.name}</span>
                    <span className="text-zinc-500 text-[11px]">· by {e.who}</span>
                  </div>
                  <div className="text-zinc-500 text-[12px] mt-1">{e.where}</div>
                </div>
              ))}
            </div>
            <P>
              The crucial split: <strong>language vs platform</strong>. The language is what ECMAScript defines — syntax, types, scoping, prototypes, async semantics.
              The platform is what each environment adds: the DOM (browser), <Kbd>fs</Kbd> (Node), <Kbd>caches</Kbd> (Workers). Same language; vastly different APIs.
            </P>
            <Callout kind="tip" title="WHAT TO LEARN FIRST">
              The language first. Platform second. Closures help everywhere; DOM knowledge only helps in Chrome. This Atlas teaches the language. (MDN's JavaScript guide structure mirrors this distinction.)
            </Callout>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ INSTALL">Get a JS runtime in 60 seconds</H2>
            <P>
              You probably already have one. Open browser DevTools (F12 or Cmd-Opt-I), click Console — that's a full JS engine with the DOM. For server-side, install Node.
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Browser DevTools', via: 'Already there', note: 'Console is a REPL. Sources is a debugger. Performance is a profiler.' },
                { name: 'Node.js (LTS)', via: 'nodejs.org · or nvm/fnm/volta for version management', note: 'Server-side runtime. Comes with npm.' },
                { name: 'Bun', via: 'bun.sh', note: 'Newer Node-compatible runtime. Faster startup, built-in bundler + test runner.' },
                { name: 'Deno', via: 'deno.com', note: 'By Ryan Dahl (Node\'s original creator). Secure-by-default. TypeScript native.' },
              ].map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-zinc-100 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>· {r.via}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ REPL">Two REPLs to know cold</H2>
            <Code id="node-repl" lang="bash">{`node                      # opens Node REPL
> [1, 2, 3].map(x => x * 2)
[ 2, 4, 6 ]
> .exit`}</Code>
            <P>Browser: F12 → Console. Quick checks: "does Array.prototype.flat take a number?" → just try it.</P>
            <H2 num="◇ STRICT">Strict mode</H2>
            <P>
              <Term name="Strict mode">Strict mode</Term> opts you into more sensible parsing + runtime behavior. ESM and class bodies are automatically strict — you rarely need <Kbd>'use strict'</Kbd> explicitly.
            </P>
            <Code id="strict-mode">{`'use strict';

function buggy() {
  foo = 10;   // sloppy mode: silent global. strict mode: ReferenceError
}`}</Code>
            <H2 num="◇ GLOBAL">The global object</H2>
            <P>
              Pre-ES2020, accessing the global needed environment-specific code: <Kbd>window</Kbd> (browser), <Kbd>global</Kbd> (Node), <Kbd>self</Kbd> (workers).
              ES2020 added <Term>globalThis</Term> — works everywhere.
            </P>
            <Code id="globalthis">{`globalThis.fetch       // modern browsers + Node 18+
globalThis.process     // Node only

// Universal feature detection
if (typeof globalThis.fetch === 'function') { /* ... */ }`}</Code>
            <H2 num="◇ CHECK">First-week checklist</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="prep1">Browser DevTools console open; you've run <Kbd>2 + 2</Kbd> there</CheckItem>
              <CheckItem id="prep2">Node installed; <Kbd>node --version</Kbd> shows v20+</CheckItem>
              <CheckItem id="prep3">Run a script: <Kbd>echo "console.log('hi')" {'>'} t.js && node t.js</Kbd></CheckItem>
              <CheckItem id="prep4">Editor with ESLint + Prettier (VSCode default; WebStorm if preferred)</CheckItem>
              <CheckItem id="prep5">Bookmarked: developer.mozilla.org</CheckItem>
            </div>
            <Callout kind="cite" title="READ">
              MDN Learning Area → "Dynamic scripting with JavaScript" — Mozilla's beginner-friendly track, last updated Oct 2025. Good companion to this Atlas.
            </Callout>
            {QUIZZES.foundation.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ TYPES">Seven primitives, then objects</H2>
            <P>
              JavaScript has exactly seven primitive types plus the catch-all <Term>Object</Term>. Primitives are immutable and compared by value;
              objects are mutable and compared by reference.
            </P>
            <div className="grid grid-cols-2 gap-1.5 my-3 text-[12px]">
              {[
                { t: 'undefined', e: 'undefined', n: 'unassigned variables' },
                { t: 'null', e: 'null', n: 'intentional "no value"' },
                { t: 'boolean', e: 'true / false', n: 'two values' },
                { t: 'number', e: '42, 3.14, NaN, Infinity', n: 'IEEE 754 double' },
                { t: 'bigint', e: '42n', n: 'arbitrary-precision int' },
                { t: 'string', e: '"hi", `hi`', n: 'UTF-16 immutable' },
                { t: 'symbol', e: 'Symbol("k")', n: 'guaranteed unique' },
                { t: 'object', e: '{}, [], () => {}', n: 'everything else' },
              ].map(row => (
                <div key={row.t} className="border border-zinc-800 px-2 py-1.5">
                  <code className="text-yellow-300 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.t}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">e.g. {row.e}</div>
                  <div className="text-zinc-500 text-[10px] italic">{row.n}</div>
                </div>
              ))}
            </div>
            <Callout kind="warn" title="typeof QUIRKS">
              <Kbd>typeof null === 'object'</Kbd> — JS 1.0 bug that can't be fixed. Use <Kbd>x === null</Kbd>.<br/>
              <Kbd>typeof NaN === 'number'</Kbd> — yes. Use <Kbd>Number.isNaN(x)</Kbd>.<br/>
              <Kbd>typeof [] === 'object'</Kbd> — arrays ARE objects. Use <Kbd>Array.isArray(x)</Kbd>.
            </Callout>
            <H2 num="◇ COERCE">Coercion: the most-feared topic</H2>
            <P>JS converts between types implicitly in many places. The rules are deterministic but surprising.</P>
            <Code id="coercion">{`1 + '2'           // '12'    (number → string)
'5' - 3           // 2       (string → number)
+'42'             // 42      (unary plus coerces)

// == triggers coercion
0 == ''           // true
0 == '0'          // true
'' == '0'         // FALSE
null == undefined // true (the one useful coercion)
[] == false       // true   (!)
[1] == 1          // true   (!!)

// === doesn't coerce
0 === ''          // false`}</Code>
            <Callout kind="cite" title="DEEPER">
              YDKJS Yet (2nd ed) — Types & Grammar: Kyle Simpson argues coercion isn't broken, just complex. Pragmatic stance: use <Kbd>===</Kbd> by default, reach for <Kbd>==</Kbd> only when you want the coercion (rare).
            </Callout>
            <H2 num="◇ FALSY">The eight falsy values</H2>
            <Code id="falsy">{`false
0
-0
0n              // BigInt zero
''              // empty string
null
undefined
NaN

// Truthy surprises:
'0'             // truthy (non-empty string)
'false'         // truthy
[]              // truthy (empty array is an object)
{}              // truthy`}</Code>
            <H2 num="◇ VARS">var, let, const</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { kw: 'const', use: 'Default. Block-scoped. Can\'t reassign binding (object contents still mutable).' },
                { kw: 'let', use: 'When you must reassign. Block-scoped. TDZ-aware.' },
                { kw: 'var', use: 'Legacy. Function-scoped, hoisted, weird. Avoid in new code.' },
              ].map(v => (
                <div key={v.kw} className="border border-zinc-800 px-3 py-2">
                  <code className="text-yellow-300 text-[13px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.kw}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{v.use}</div>
                </div>
              ))}
            </div>
            <Callout kind="tip" title="TDZ EXAMPLE">
              <Kbd>{'{ console.log(x); let x = 5; }'}</Kbd> throws ReferenceError. The variable `x` exists from block start but is unreachable until the <Kbd>let</Kbd> line. That window is the <Term>TDZ</Term>.
            </Callout>
            <H2 num="◇ SCOPE">Scope: where names live</H2>
            <P>JS uses <Term name="Lexical scope">lexical scope</Term>: variable accessibility is determined by where it's <em>written</em>, not where it's called.</P>
            <Code id="scope">{`const outer = 1;
function makeFn() {
  const inner = 2;
  return () => outer + inner;   // closes over BOTH
}
const fn = makeFn();
fn();   // 3 — even though we're way outside makeFn`}</Code>
            <H2 num="◇ MODERN">Modern operators</H2>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { op: '?.', name: 'Optional chaining', e: 'user?.address?.city', d: 'Returns undefined instead of throwing.' },
                { op: '??', name: 'Nullish coalescing', e: "value ?? 'default'", d: 'Default ONLY for null/undefined. Accepts 0 and "" as valid.' },
                { op: '||=', name: 'Logical OR assign', e: 'x ||= 5', d: 'Assigns if x is falsy.' },
                { op: '??=', name: 'Nullish OR assign', e: 'x ??= 5', d: 'Assigns only if x is null/undefined.' },
                { op: '...', name: 'Spread / rest', e: '[...a, ...b]', d: 'Spread into iterables; collect rest in destructuring.' },
              ].map(row => (
                <div key={row.op} className="border border-zinc-800 px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <code className="text-yellow-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.op}</code>
                    <span className="text-zinc-500 text-[11px]">{row.name}</span>
                  </div>
                  <code className="text-zinc-400 text-[11px] block mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.e}</code>
                  <div className="text-zinc-500 text-[11px] mt-0.5">{row.d}</div>
                </div>
              ))}
            </div>
            {QUIZZES.bedrock.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ FIRST-CLASS">Functions are values</H2>
            <P>
              In JavaScript, functions are <em>first-class</em>: you can store them in variables, pass them as arguments, return them from functions, attach them as object properties.
              The most important property of the language. Everything else builds on it.
            </P>
            {stackData?.functions && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.functions}</Callout>}
            <Code id="firstclass">{`// Stored in variables
const greet = function(name) { return \`hi \${name}\`; };
const greet2 = (name) => \`hi \${name}\`;

// Passed as arguments
[1, 2, 3].map(x => x * 2);   // [2, 4, 6]

// Returned from functions — this enables closures
function multiplier(factor) {
  return (x) => x * factor;
}
const double = multiplier(2);
double(5);   // 10`}</Code>
            <H2 num="◇ DECL">Three ways to define a function</H2>
            <Code id="three-forms">{`// 1) Declaration — hoisted (callable before the line)
function add(a, b) { return a + b; }

// 2) Expression — assigned to variable, hoisted as variable
const subtract = function(a, b) { return a - b; };

// 3) Arrow — no own this/arguments/super, can't be 'new'd
const multiply = (a, b) => a * b;
const square = x => x * x;          // single arg, parens optional
const noop = () => {};               // empty body needs braces`}</Code>
            <H2 num="◇ CLOSURE">Closures — the load-bearing concept</H2>
            <P>
              A <Term>Closure</Term> is what happens when a function "remembers" the variables from where it was defined, even after that outer scope has finished.
              JS gets closures from lexical scoping + first-class functions, free.
            </P>
            <Code id="closure-counter">{`function makeCounter() {
  let count = 0;
  return {
    inc: () => ++count,
    get: () => count,
  };
}

const c = makeCounter();
c.inc(); c.inc(); c.get();   // 2

// Each call to makeCounter creates a NEW closure
const c2 = makeCounter();
c2.get();   // 0 — independent`}</Code>
            <Callout kind="cite" title="DEEPER">
              YDKJS Yet (2nd ed) — Scope & Closures, Chapters 1, 5, 7. Free at github.com/getify/You-Dont-Know-JS. Read these three chapters before anything else.
            </Callout>
            <P>
              Closures power: data privacy, function factories, partial application, memoization, event handlers, React hooks (every <Kbd>useState</Kbd> relies on closures), and most of what makes JS expressive.
            </P>
            <H2 num="◇ THIS">The five `this` rules</H2>
            <P>
              <Term>this</Term> is the most-feared keyword because its value depends on how the function is <em>called</em>, not where it's defined. Five rules, priority order:
            </P>
            <div className="my-4 border border-zinc-800">
              {[
                { rule: '1. Arrow (lexical)', when: 'Arrow function uses `this` from enclosing scope. Cannot be overridden.', e: '() => this.x' },
                { rule: '2. new', when: '`new Fn()` makes `this` = newly created object.', e: 'new Person()' },
                { rule: '3. Explicit', when: 'fn.call(ctx), fn.apply(ctx, [...]), fn.bind(ctx) — `this` is the passed ctx.', e: 'fn.call({x:1})' },
                { rule: '4. Implicit', when: '`obj.fn()` — `this` is the object before the dot.', e: 'obj.greet()' },
                { rule: '5. Default', when: 'Plain `fn()`. Strict: undefined. Non-strict: global.', e: 'fn()' },
              ].map((r, i) => (
                <div key={i} className={`p-3 ${i !== 4 ? 'border-b border-zinc-800' : ''}`}>
                  <div className="text-yellow-300 text-[12px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.rule}</div>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.when}</div>
                  <code className="text-zinc-500 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.e}</code>
                </div>
              ))}
            </div>
            <Callout kind="warn" title="CLASSIC BUG">
              You pass a method as a callback. It loses `this`. <Kbd>btn.onclick = obj.handler;</Kbd> — now <Kbd>obj.handler</Kbd> runs but <Kbd>this</Kbd> isn't obj.
              Fix: <Kbd>btn.onclick = () =&gt; obj.handler();</Kbd> or <Kbd>obj.handler.bind(obj)</Kbd>.
            </Callout>
            <H2 num="◇ HOF">Higher-order functions</H2>
            <P>A function that takes or returns another function. The pattern that makes JS feel small + powerful.</P>
            <Code id="hof">{`[1, 2, 3, 4].filter(x => x > 1)             // [2, 3, 4]
[1, 2, 3, 4].map(x => x * 10)               // [10, 20, 30, 40]
[1, 2, 3, 4].reduce((a, x) => a + x, 0)     // 10

const isEven = x => x % 2 === 0;
const square = x => x * x;
const sumEvenSquares = arr =>
  arr.filter(isEven).map(square).reduce((a, x) => a + x, 0);

sumEvenSquares([1, 2, 3, 4, 5, 6]);   // 4 + 16 + 36 = 56`}</Code>
            <H2 num="◇ ADV">Currying, composition, memoization</H2>
            <Code id="patterns">{`// Currying
const curry = (fn) => (a) => (b) => (c) => fn(a, b, c);
const add3 = (a, b, c) => a + b + c;
curry(add3)(1)(2)(3);   // 6

// Composition (pipe)
const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const process = pipe(double, square, addOne);

// Memoization
const memo = (fn) => {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
};`}</Code>
            {QUIZZES.functions.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ PROTO">Objects all the way down</H2>
            <P>
              Every JS object has a hidden link called <Term>Prototype</Term> ([[Prototype]] in spec). When you access <Kbd>obj.foo</Kbd>:
              JS looks at obj's own properties; if not found, follows [[Prototype]] up the chain until either found or hits <Kbd>null</Kbd>.
            </P>
            <Code id="proto-chain">{`const animal = { eats: true };
const rabbit = Object.create(animal);   // rabbit's [[Prototype]] = animal
rabbit.jumps = true;

rabbit.jumps   // true  (own)
rabbit.eats    // true  (inherited from animal)
rabbit.foo     // undefined (chain ends at Object.prototype → null)

Object.getPrototypeOf(rabbit) === animal;   // true`}</Code>
            <H2 num="◇ CLASS">Class syntax is sugar over prototypes</H2>
            <P>
              ES2015 added <Term>Class</Term> syntax that looks like classical OOP. Underneath, it's still prototypes — but clearer syntax.
            </P>
            <Code id="class-syntax">{`class Animal {
  constructor(name) { this.name = name; }
  speak() { return \`\${this.name} makes a sound\`; }
}

class Dog extends Animal {
  speak() { return \`\${this.name} barks\`; }
  callSuper() { return super.speak(); }
}

const d = new Dog('Rex');
d.speak();              // 'Rex barks'
d instanceof Animal;    // true
Object.getPrototypeOf(Dog.prototype) === Animal.prototype;  // true`}</Code>
            <Callout kind="cite" title="DEEPER">
              YDKJS Yet — Objects & Classes. Kyle Simpson argues prototype delegation is conceptually different from classical inheritance and recommends thinking in delegation terms.
            </Callout>
            <H2 num="◇ MEMBERS">Modern class features</H2>
            <Code id="class-members">{`class Counter {
  count = 0;            // public field
  #secret = 'hidden';   // truly private (# is part of name)
  static instances = 0; // on the class, not instances

  constructor() { Counter.instances++; }

  get isZero() { return this.count === 0; }     // getter
  set value(v) { this.count = Math.max(0, v); } // setter

  inc() { this.count++; }
  static reset() { Counter.instances = 0; }     // static method
}

const c = new Counter();
c.inc();
c.isZero;       // false  (getter)
c.value = -5;   // setter clamps to 0
// c.#secret    // SyntaxError outside the class`}</Code>
            <H2 num="◇ DESC">Property descriptors</H2>
            <P>Every property has a descriptor: <Kbd>value</Kbd>, <Kbd>writable</Kbd>, <Kbd>enumerable</Kbd>, <Kbd>configurable</Kbd> (or <Kbd>get</Kbd>/<Kbd>set</Kbd> for accessors).</P>
            <Code id="descriptors">{`const obj = {};
Object.defineProperty(obj, 'name', {
  value: 'Cle',
  writable: false,      // can't reassign
  enumerable: false,    // hidden from for-in, Object.keys
  configurable: false,  // can't delete or redefine
});

obj.name = 'Other';   // silently fails (throws in strict)
Object.getOwnPropertyDescriptor(obj, 'name');`}</Code>
            <H2 num="◇ COPY">Shallow vs deep copy</H2>
            <Code id="copy">{`// Shallow
const a = { x: 1, nested: { y: 2 } };
const b = { ...a };
b.nested.y = 99;
a.nested.y;   // 99 — nested was shared

// Deep (browser + Node 17+)
const c = structuredClone(a);
c.nested.y = 100;
a.nested.y;   // still 99`}</Code>
            <Callout kind="tip" title="FORGET JSON.parse(JSON.stringify(x))">
              The old trick. Broken for: Dates (become strings), Maps/Sets (become {`{}`}), functions (silently dropped), circular refs (throws). Use <Kbd>structuredClone()</Kbd>.
            </Callout>
            <H2 num="◇ KEYS">Iterating objects</H2>
            <Code id="iterate-obj">{`const obj = { a: 1, b: 2, c: 3 };

Object.keys(obj);       // ['a', 'b', 'c']
Object.values(obj);     // [1, 2, 3]
Object.entries(obj);    // [['a',1], ['b',2], ['c',3]]

// for-in: enumerable properties (own + inherited) — rarely what you want
// for-of: needs iterable; objects aren't iterable by default
for (const [k, v] of Object.entries(obj)) { /* ... */ }

// ES2024
Object.groupBy([1,2,3,4,5], n => n % 2 ? 'odd' : 'even');
// { odd: [1,3,5], even: [2,4] }`}</Code>
            {QUIZZES.objects.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ PROTO">The iterable protocol</H2>
            <P>
              An <Term>Iterable</Term> is any object with a <Kbd>[Symbol.iterator]()</Kbd> method. That method returns an <Term>Iterator</Term> — an object with a <Kbd>next()</Kbd> method returning <Kbd>{`{value, done}`}</Kbd>.
              All built-in iterables (Arrays, Strings, Maps, Sets) follow this protocol.
            </P>
            <Code id="iter-protocol">{`const arr = [10, 20, 30];
const iter = arr[Symbol.iterator]();

iter.next();   // { value: 10, done: false }
iter.next();   // { value: 20, done: false }
iter.next();   // { value: 30, done: false }
iter.next();   // { value: undefined, done: true }

// for-of does this for you
for (const x of arr) console.log(x);

// Spread uses it too
const copy = [...arr];
const fromStr = [...'hi'];   // ['h', 'i']`}</Code>
            <H2 num="◇ CUSTOM">Make your own iterable</H2>
            <Code id="custom-iter">{`const range = {
  from: 1, to: 5,
  [Symbol.iterator]() {
    let cur = this.from;
    const last = this.to;
    return {
      next() {
        return cur <= last
          ? { value: cur++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};

for (const n of range) console.log(n);   // 1, 2, 3, 4, 5
[...range];   // [1, 2, 3, 4, 5]`}</Code>
            <H2 num="◇ GEN">Generators — sugar for iterators</H2>
            <P>
              A <Term>Generator</Term> is a function declared with <Kbd>function*</Kbd>. Returns an iterator automatically. <Kbd>yield</Kbd> pauses; <Kbd>next()</Kbd> resumes.
            </P>
            <Code id="generator">{`function* range(from, to) {
  for (let n = from; n <= to; n++) yield n;
}

[...range(1, 5)];   // [1, 2, 3, 4, 5]

// Lazy / infinite
function* naturals() {
  let n = 1;
  while (true) yield n++;
}

const nat = naturals();
nat.next().value;  // 1
nat.next().value;  // 2
// Could go forever — only computes on demand`}</Code>
            <H2 num="◇ ASYNC-IT">Async iterators + for-await-of</H2>
            <Code id="async-iter">{`async function* fetchPages(urls) {
  for (const url of urls) {
    const r = await fetch(url);
    yield await r.json();
  }
}

for await (const page of fetchPages(urls)) {
  console.log(page);   // each page as it arrives
}`}</Code>
            <P>This is how Node streams, server-sent events, and modern fetch streaming expose data — async iterables.</P>
            <H2 num="◇ ES2025">ES2025: iterator helpers</H2>
            <P>
              For 30 years, iterators had <Kbd>next()</Kbd> and that was it. ES2025 finally added <Kbd>.map</Kbd>, <Kbd>.filter</Kbd>, <Kbd>.take</Kbd>, <Kbd>.drop</Kbd>, <Kbd>.reduce</Kbd>, <Kbd>.toArray</Kbd> directly on iterators. <strong>Lazy.</strong>
            </P>
            <Code id="iter-helpers">{`function* naturals() {
  let n = 1; while (true) yield n++;
}

const result = naturals()
  .filter(n => n % 2 === 0)   // even
  .map(n => n * n)             // squared
  .take(5)                     // first 5
  .toArray();

// [4, 16, 36, 64, 100]
// Only computes 5 squared evens — never tries to materialize the infinite sequence`}</Code>
            <Callout kind="cite" title="ES2025">
              The biggest iterator improvement since iterators existed. Pre-2025 you'd convert to array first (losing laziness) or write helpers by hand. Supported in V8 (Chrome 122+, Node 22+), Deno, Firefox 131+.
            </Callout>
            <H2 num="◇ NEW">Set methods (ES2025)</H2>
            <Code id="set-methods">{`const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

a.intersection(b);        // Set { 2, 3 }
a.union(b);               // Set { 1, 2, 3, 4 }
a.difference(b);          // Set { 1 }
a.symmetricDifference(b); // Set { 1, 4 }
a.isSubsetOf(b);          // false
a.isDisjointFrom(b);      // false`}</Code>
            {QUIZZES.iteration.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ MODEL">The runtime, drawn</H2>
            <P>
              JavaScript is single-threaded. There's exactly ONE call stack. Async operations don't actually run JS code in parallel — they hand off to host APIs, and when those finish, they queue a callback to run later, when the stack is empty.
            </P>
            <ArchDiagram />
            <H2 num="◇ LOOP">Event loop, the algorithm</H2>
            <Code id="event-loop-pseudo" lang="pseudo">{`while (true) {
  // 1) If stack empty AND microtask queue empty:
  //    pull next task, push onto stack, run to completion
  if (stack.empty() && microtasks.empty() && tasks.notEmpty()) {
    stack.run(tasks.shift());
  }

  // 2) After each task: drain ALL microtasks before next task
  while (microtasks.notEmpty()) {
    stack.run(microtasks.shift());
  }

  // 3) Render (browser, ~60Hz)
  if (browser && shouldRender()) render();
}`}</Code>
            <P>Critical: microtasks <em>always</em> drain before the next macrotask. This is why Promise.then runs before setTimeout(fn, 0).</P>
            <H2 num="◇ EXAMPLE">The canonical ordering example</H2>
            <Code id="ordering">{`console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');

// Output: 1, 4, 3, 2`}</Code>
            <P>Why: <strong>1</strong> + <strong>4</strong> sync. Stack empties. Microtasks drain → <strong>3</strong>. Next task → <strong>2</strong>.</P>
            <Callout kind="cite" title="WATCH">
              "What the heck is the event loop?" by Philip Roberts (JSConf EU 2014) — the 25-minute talk that introduced a generation to the model. Jake Archibald's "In the loop" goes deeper on microtasks vs macrotasks.
            </Callout>
            <H2 num="◇ PROM">Promises — three states, settle once</H2>
            <P>
              A <Term>Promise</Term> represents a future value. Three states: <strong>pending</strong> → <strong>fulfilled</strong> or <strong>rejected</strong>. Settled once, never changes.
            </P>
            <Code id="promise-basics">{`const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve(42), 100);
});

p.then(v => console.log(v));         // 42
p.catch(e => console.error(e));      // if rejected
p.finally(() => console.log('done')); // either way

// Combinators
Promise.all([a, b, c]);         // all fulfill; first rejection rejects
Promise.allSettled([a, b, c]);  // all settle; never rejects
Promise.race([a, b, c]);        // first to settle (either way) wins
Promise.any([a, b, c]);         // first to fulfill; rejects if all reject
Promise.try(fn);                // ES2025: catches sync errors too`}</Code>
            <H2 num="◇ ASYNC">async/await — Promises in plain clothes</H2>
            <P>
              An <Term>async function</Term> always returns a Promise. <Term>await</Term> pauses until a Promise settles, unwraps the resolved value.
              Rejections become thrown errors you can <Kbd>try/catch</Kbd>.
            </P>
            {stackData?.async && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.async}</Callout>}
            <Code id="async-await">{`async function loadUser(id) {
  try {
    const r = await fetch(\`/api/users/\${id}\`);
    if (!r.ok) throw new Error(\`HTTP \${r.status}\`);
    return await r.json();
  } catch (err) {
    console.error('load failed:', err);
    throw err;
  }
}

// Parallel
const [user, posts] = await Promise.all([
  loadUser(1),
  loadPosts(1),
]);

// Sequential (often a mistake!)
const user2 = await loadUser(2);    // 200ms
const posts2 = await loadPosts(2);  // another 200ms
// Total: 400ms vs 200ms with Promise.all`}</Code>
            <H2 num="◇ ABORT">Cancellation with AbortController</H2>
            <Code id="abort">{`const ctrl = new AbortController();

const r = await fetch(url, { signal: ctrl.signal });

// Cancel from elsewhere
setTimeout(() => ctrl.abort(), 5000);

ctrl.signal.addEventListener('abort', () => cleanup());`}</Code>
            <Callout kind="warn" title="FORGOTTEN AWAIT">
              <Kbd>const data = fetch(url);</Kbd> (no <Kbd>await</Kbd>) — data is a Promise, not the response. <Kbd>data.json()</Kbd> throws. Lint with <Kbd>no-floating-promises</Kbd>.
            </Callout>
            {QUIZZES.async.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ TWO">Two module systems, awkwardly coexisting</H2>
            <P>
              JavaScript has two: <Term>ESM</Term> (standard since 2015, native in browsers + Node) and <Term>CommonJS</Term> (Node's original, still pervasive in npm).
              Modern code: use ESM. Reality: you'll mix both.
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              <div className="border border-yellow-400/40 bg-yellow-400/5 p-3">
                <div className="text-yellow-300 text-[11px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ESM · standard</div>
                <code className="text-zinc-200 text-[11px] block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{'import { foo } from \'./bar.js\';'}</code>
                <code className="text-zinc-200 text-[11px] block mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>export const foo = ...</code>
                <div className="text-zinc-400 text-[11px] mt-1">Static. Hoisted. Tree-shakeable. Top-level await. Files: .mjs or .js (with type:module).</div>
              </div>
              <div className="border border-zinc-700 p-3">
                <div className="text-zinc-400 text-[11px] uppercase tracking-wider mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>CommonJS · legacy</div>
                <code className="text-zinc-200 text-[11px] block" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{'const { foo } = require(\'./bar\');'}</code>
                <code className="text-zinc-200 text-[11px] block mt-0.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{'module.exports = { foo };'}</code>
                <div className="text-zinc-400 text-[11px] mt-1">Dynamic. Synchronous. Node-specific originally. Files: .cjs or .js (without type:module).</div>
              </div>
            </div>
            <H2 num="◇ ESM">ESM essentials</H2>
            <Code id="esm">{`// Named exports
export const PI = 3.14159;
export function area(r) { return PI * r * r; }

// Default export (one per module)
export default function logCircle(r) { ... }

// Import shapes
import logCircle, { PI, area } from \u0027./circle.js\u0027;
import * as circle from \u0027./circle.js\u0027;
import { PI as π } from \u0027./circle.js\u0027;      // rename
import \u0027./polyfills.js\u0027;                     // side-effect only

// Dynamic (returns Promise — works anywhere, async)
const mod = await import(\u0027./heavy.js\u0027);
mod.bigFn();

// Top-level await (modules only)
const config = await fetch('/config.json').then(r => r.json());`}</Code>
            <Callout kind="warn" title="ESM GOTCHAS">
              File extensions REQUIRED in import paths (<Kbd>./util.js</Kbd>, not <Kbd>./util</Kbd>). Imports happen BEFORE module body — can't conditionally import (static) without <Kbd>await import()</Kbd>.
            </Callout>
            <H2 num="◇ NPM">npm + package.json</H2>
            <Code id="package-json" lang="package.json">{`{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "exports": {
    ".": "./dist/index.js",
    "./utils": "./dist/utils.js"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0"
  },
  "devDependencies": {
    "vitest": "^1.0.0"
  }
}`}</Code>
            <H2 num="◇ SEMVER">Semantic versioning</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { range: '"1.2.3"', means: 'Exactly 1.2.3. No updates.' },
                { range: '"^1.2.3"', means: '>=1.2.3 and <2.0.0. Minor + patch. Default.' },
                { range: '"~1.2.3"', means: '>=1.2.3 and <1.3.0. Patch only.' },
                { range: '">=1.2.3 <2.0.0"', means: 'Explicit range.' },
                { range: '"*" or "latest"', means: 'Latest available. Reproducibility nightmare. Avoid.' },
              ].map(s => (
                <div key={s.range} className="border border-zinc-800 px-3 py-1.5">
                  <code className="text-yellow-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.range}</code>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{s.means}</div>
                </div>
              ))}
            </div>
            <P>
              The <Kbd>package-lock.json</Kbd> (or yarn.lock, pnpm-lock.yaml) records exactly what was installed. Commit it. In CI use <Kbd>npm ci</Kbd> — installs strictly from lockfile, faster + deterministic.
            </P>
            <H2 num="◇ BUND">Why bundlers exist</H2>
            <P>Browsers run ESM natively, but bundlers (Vite, esbuild, Rollup, webpack) still pay off:</P>
            <ul className="space-y-2 text-[14px] text-zinc-300 my-3">
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Tree-shake:</strong> drop unused exports. Smaller bundles.</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Transpile:</strong> JSX, TypeScript, future syntax to current</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Optimize:</strong> minify, code-split, sourcemaps</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Resolve:</strong> CJS deps, node_modules paths, aliases</span></li>
              <li className="flex gap-2"><Check size={14} className="text-yellow-400 shrink-0 mt-1" /> <span><strong>Hot-reload:</strong> dev experience with state preserved</span></li>
            </ul>
            <Callout kind="tip" title="MODERN DEFAULTS">
              <strong>Vite</strong> for app dev (fast, ESM-native). <strong>esbuild</strong> for raw speed. <strong>Rollup</strong> for publishing libraries. Webpack is historical incumbent — rarely the right new choice.
            </Callout>
            {QUIZZES.modules.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ REAL">A real JavaScript engine, in your hand</H2>
            <P>
              This sandbox runs your code through the same JS engine powering this page. Type real JS, hit Run, see what happens. Solve six challenges to confirm what each chapter taught — or flip to Free Play to test anything.
            </P>
            <Sandbox />
            <Callout kind="info" title="HOW IT WORKS">
              Code runs in strict mode via <Kbd>new Function()</Kbd>. <Kbd>console.log</Kbd> is captured. Tests verify your defined function against expected outputs. A real REPL — try things, break things, learn faster.
            </Callout>
            <Callout kind="cite" title="GOING FURTHER">
              When you outgrow this: open Node's REPL (<Kbd>node</Kbd>), browser DevTools console (F12), or playgrounds like codesandbox.io, stackblitz.com for fuller environments with file systems and npm.
            </Callout>
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ TRIAGE">Every JS bug has a class</H2>
            <P>Walk the tree. Tap the closest match. Leaf nodes have the canonical fix.</P>
            <Troubleshooter />
            <H2 num="◇ TOOLS">Tools that pay rent</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { tool: 'console.log', use: "The first reach. Add 'before X' and 'after X' to find where execution diverges." },
                { tool: 'console.table(arr)', use: "Pretty-prints arrays of objects as a table. Better than log for tabular data." },
                { tool: 'console.trace()', use: "Prints the call stack at this point. 'Who called this function?'" },
                { tool: 'console.time / timeEnd', use: "Quick timing. console.time('x'); … console.timeEnd('x');" },
                { tool: 'debugger;', use: "Drop into code. With DevTools open, execution pauses there." },
                { tool: 'Source maps', use: "Map runtime errors in bundled code back to original source. Enable in dev." },
                { tool: 'Performance tab', use: "Browser profiler. Slow functions, layout thrash, long tasks." },
                { tool: 'node --inspect-brk', use: "Run Node with debugger attached. Open chrome://inspect." },
              ].map(t => (
                <div key={t.tool} className="border border-zinc-800 px-3 py-2">
                  <code className="text-yellow-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.tool}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{t.use}</div>
                </div>
              ))}
            </div>
            <Callout kind="info" title="DEBUGGING DISCIPLINE">
              When stuck: 1) Read the error word by word. 2) Reproduce in isolation (smallest case). 3) Add logs upstream of the failure until reality diverges from your model. 4) Fix the model, not just the symptom.
            </Callout>
          </>
        );

      case 10: {
        const totalQuizzes = allQuizzes.length;
        return (
          <>
            <H2 num="◇ SCORE">How you did</H2>
            <div className="grid grid-cols-3 gap-2 my-4 text-center">
              <div className="border border-yellow-400/40 bg-yellow-400/5 p-3">
                <div className="text-[10px] uppercase tracking-[0.2em] text-yellow-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>Correct</div>
                <div className="text-3xl text-yellow-200 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{totalCorrect}</div>
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
                  className="w-full border border-violet-400/50 bg-violet-400/5 text-violet-200 px-3 py-2 text-[13px] mb-2 flex items-center justify-center gap-2"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <RotateCcw size={13} /> {reviewMode ? 'Hide' : 'Review'} missed questions ({missed.length})
                </button>
                {reviewMode && (
                  <div className="mb-4">
                    {missed.map(q => (
                      <div key={q.qid} className="border border-violet-400/30 bg-violet-400/5 p-3 mb-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>RETRY · {q.qid}</div>
                        <button onClick={() => setQuizState(prev => { const n = { ...prev }; delete n[q.qid]; return n; })}
                          className="text-[11px] text-violet-300 hover:text-violet-100 underline">
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
                className="flex items-center justify-center gap-2 border border-yellow-400/40 bg-yellow-400/5 hover:bg-yellow-400/10 text-yellow-200 px-3 py-2.5 text-[13px] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Download size={14} /> Download .md
              </button>
              <button onClick={copyAllCommands}
                className="flex items-center justify-center gap-2 border border-violet-400/40 bg-violet-400/5 hover:bg-violet-400/10 text-violet-200 px-3 py-2.5 text-[13px] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'Copied' : 'Copy all commands'}
              </button>
            </div>

            <H2 num="◇ READ">Authoritative open-source resources</H2>
            <P>The curriculum in this Atlas is grounded in these. If you want depth beyond what fits here, this is the canonical reading list.</P>
            <div className="space-y-2 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[9px] uppercase tracking-wider border px-1.5 py-0.5 ${
                      r.kind === 'reference' ? 'text-yellow-300 border-yellow-300/30' :
                      r.kind === 'spec' ? 'text-violet-300 border-violet-300/30' :
                      r.kind === 'book' ? 'text-emerald-300 border-emerald-300/30' :
                      'text-zinc-400 border-zinc-700'
                    }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                    <span className="text-zinc-100 font-medium">{r.name}</span>
                  </div>
                  <div className="text-zinc-500 text-[11px] mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</div>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>

            <H2 num="◇ ROADMAP">Suggested reading roadmap</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="rm1">Week 1-2: MDN Learning Area "Dynamic scripting with JavaScript" (cover-to-cover)</CheckItem>
              <CheckItem id="rm2">Week 3-6: Eloquent JavaScript 4th ed., Parts I-II (chapters 1-12)</CheckItem>
              <CheckItem id="rm3">Week 7-10: YDKJS Yet — Scope & Closures + Objects & Classes (the two essential volumes)</CheckItem>
              <CheckItem id="rm4">Week 11-12: YDKJS Yet — Async & Performance (then watch Jake Archibald's "In the loop")</CheckItem>
              <CheckItem id="rm5">Ongoing: 2ality.com for every new TC39 feature as it stabilizes</CheckItem>
              <CheckItem id="rm6">Reference: MDN. Always MDN. Bookmark every page you visit twice.</CheckItem>
            </div>

            <H2 num="◇ CMD">Command cheatsheet</H2>
            <div className="space-y-2 my-3 text-[13px]">
              {COMMANDS.map((r, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 group">
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-yellow-300 text-[12px] break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.cmd}</code>
                    <button onClick={() => copy(r.cmd, `c${i}`)} className="text-zinc-600 hover:text-yellow-300 shrink-0">
                      {copied === `c${i}` ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.desc}</div>
                </div>
              ))}
            </div>

            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}

            <div className="my-6 border border-yellow-400/40 bg-yellow-400/5 p-4 text-center">
              <div className="text-[10px] uppercase tracking-[0.3em] text-yellow-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                ƒ Atlas complete
              </div>
              <div className="text-zinc-200 text-[14px]">
                You know the load-bearing mechanisms: closures, the event loop, the prototype chain. From here, any framework is just an API to learn — the language under it is yours.
              </div>
              <div className="text-zinc-500 text-[12px] mt-2 italic">
                Curriculum grounded in MDN, TC39 ES2025, YDKJS Yet (2nd ed.), Eloquent JavaScript (4th ed.), javascript.info.
              </div>
            </div>

            <button onClick={() => { if (confirm('Reset all progress, checklists, and quiz answers?')) resetAll(); }}
              className="w-full text-[11px] text-zinc-600 hover:text-orange-300 py-2 transition-colors flex items-center justify-center gap-1">
              <RotateCcw size={11} /> Reset all progress
            </button>
          </>
        );
      }

      default: return null;
    }
  };

  const cur = SECTIONS[activeSection];
  const Icon = cur.icon;
  const progress = Math.round((completed.size / SECTIONS.length) * 100);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-yellow-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          ƒ LOADING ATLAS
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
                <span className="text-[14px] text-yellow-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ƒ</span>
                <h1 className="text-[18px] font-extrabold tracking-tight" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  JAVASCRIPT <span className="text-yellow-400">ATLAS</span>
                </h1>
              </div>
              <div className="flex items-center gap-2">
                {stack && (
                  <button onClick={() => setShowOnboarding(true)}
                    className="text-[10px] tracking-[0.2em] text-zinc-500 hover:text-yellow-300 border border-zinc-800 hover:border-yellow-400/40 px-2 py-1 transition-colors uppercase"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {STACKS.find(s => s.id === stack)?.icon} {stack}
                  </button>
                )}
                <button onClick={() => setCmdOpen(true)}
                  className="flex items-center gap-1 text-[10px] tracking-[0.2em] text-zinc-500 hover:text-yellow-300 border border-zinc-800 hover:border-yellow-400/40 px-2 py-1 transition-colors"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <Search size={11} /> ⌘K
                </button>
                <span className="text-[10px] tracking-[0.25em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {progress}%
                </span>
              </div>
            </div>
            <div className="h-0.5 bg-zinc-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
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
                    active ? 'border-yellow-400 text-yellow-200 bg-yellow-400/5'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                  }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <span className="text-[10px] text-zinc-500">{s.num}</span>
                  <Ic size={13} />
                  <span>{s.label}</span>
                  {done && <Check size={11} className="text-yellow-400" />}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 pt-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 border border-yellow-400/50 bg-yellow-400/5 flex items-center justify-center">
              <Icon size={18} className="text-yellow-300" />
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
                completed.has(activeSection) ? 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
                : 'border-violet-400/50 bg-violet-400/5 text-violet-200 hover:bg-violet-400/10'
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
