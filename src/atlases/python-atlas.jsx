import { useState, useEffect, useRef } from 'react';
import {
  Compass, Cpu, Layers, FunctionSquare, Boxes, GitBranch, Activity,
  Package, Terminal, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, RotateCcw, Play, ArrowLeft, Quote, MousePointerClick,
  Loader2
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Guido, 1991, Monty Python — and a language built on readability." },
  { id: 'foundation', label: 'Foundation', icon: Cpu, num: '02', sub: "Install, REPL, venv, uv. The modern 2026 toolchain." },
  { id: 'bedrock', label: 'Bedrock', icon: Layers, num: '03', sub: "Types, the data model, is vs ==, variables as labels." },
  { id: 'functions', label: 'Functions', icon: FunctionSquare, num: '04', sub: "*args, **kwargs, type hints, the mutable default trap, decorators." },
  { id: 'containers', label: 'Containers', icon: Boxes, num: '05', sub: "list / tuple / dict / set, comprehensions, the collections module." },
  { id: 'classes', label: 'Classes', icon: GitBranch, num: '06', sub: "Dunders, MRO, @dataclass, properties — the Python data model." },
  { id: 'iteration', label: 'Iteration', icon: GitBranch, num: '07', sub: "Iterator protocol, generators, yield from, itertools." },
  { id: 'async', label: 'Async', icon: Activity, num: '08', sub: "The GIL, threads vs processes vs asyncio, PEP 703 no-GIL." },
  { id: 'sandbox', label: 'Sandbox', icon: Terminal, num: '09', sub: "Real CPython in your browser via Pyodide. Six challenges + free play." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '10', sub: "Every common Python error, with the canonical fix." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '11', sub: "Cheatsheet, PEP references, recommended reading roadmap." },
];

const STACKS = [
  { id: 'data', label: 'Data / ML', desc: 'numpy, pandas, scikit-learn, torch, notebooks', icon: '∑' },
  { id: 'web', label: 'Web backends', desc: 'FastAPI, Django, Flask — APIs and services', icon: '◐' },
  { id: 'automation', label: 'Automation / scripting', desc: 'ETL, scrapers, glue code, DevOps', icon: '⟂' },
  { id: 'cli', label: 'CLI tools / systems', desc: 'argparse/click, subprocess, file processing', icon: '▶' },
  { id: 'fundamentals', label: 'Just the language, properly', desc: 'Master Python itself first', icon: 'π' },
];

const GLOSSARY = {
  Object: "Everything in Python is one. Each has an identity (memory address, id()), a type (type()), and a value. Some values are mutable, some aren't.",
  Reference: "A variable is a name bound to an object — not a box holding a value. Assignment binds; it doesn't copy. (Python tutorial §4.1)",
  Mutable: "Can be changed in place: list, dict, set, bytearray, most user-defined classes. Mutation through one reference is visible through all.",
  Immutable: "Cannot be changed in place: int, float, bool, str, tuple, frozenset, bytes, None. 'Modifying' creates a new object.",
  Identity: "Each object's id() — unique per object lifetime. `x is y` tests identity. Use it for None, True, False, sentinels — never for value comparisons.",
  Equality: "x == y asks 'do these have the same value', delegating to __eq__. Different from `is`. (Data model §3.3.1)",
  Tuple: "Immutable ordered sequence. Created with commas (parens optional): `1, 2, 3`. Hashable if elements are. Used for fixed records.",
  List: "Mutable ordered sequence. Created with []. The Swiss army knife. Indexed in O(1), append O(1) amortized.",
  Dict: "Mutable mapping from hashable keys to values. Insertion-ordered since 3.7 (officially) — the spec, not just CPython behavior.",
  Set: "Mutable unordered collection of unique hashable elements. O(1) membership test. frozenset() is the immutable, hashable cousin.",
  Comprehension: "Compact syntax to build a list/dict/set/generator from an iterable: `[expr for x in it if cond]`. Faster than equivalent for-loops + appends.",
  Slicing: "seq[start:stop:step] — start inclusive, stop exclusive. Negative indices count from end. Always returns a new object.",
  Unpacking: "Multiple assignment from iterables: `a, b, *rest = [1,2,3,4]`. Star captures the rest. Works in function calls too: `f(*args, **kwargs)`.",
  Walrus: "The := operator (PEP 572, Python 3.8+). Assigns AND returns in one expression: `if (n := len(s)) > 10:`. Use sparingly.",
  Closure: "A nested function that captures variables from its enclosing scope. Lives on after the outer function returns.",
  Lambda: "An anonymous single-expression function: `lambda x: x * 2`. Limited (no statements). Mostly used as a quick callable in map/sorted/filter.",
  args: "*args collects extra positional arguments into a tuple. **kwargs collects extra keyword arguments into a dict. The asterisks are the syntax; 'args' and 'kwargs' are convention.",
  "Default argument": "Evaluated ONCE at function definition. If mutable (list/dict), the same object is reused across all calls. The most classic Python trap.",
  "Mutable default": "The bug pattern: `def f(items=[]):` — the [] is shared across every call without an explicit items. Always use `items=None` and `items = items or []` inside.",
  Decorator: "A callable that takes a function and returns a (usually wrapped) function. `@dec` is sugar for `f = dec(f)`. Stack them; they apply bottom-up.",
  "Type hint": "Optional annotation declaring expected types: `def add(a: int, b: int) -> int:`. Not enforced at runtime by Python itself — checked by tools (mypy, ty). PEP 484.",
  Class: "Blueprint for objects. Defines instance state via __init__ and behavior via methods. Classes are themselves objects.",
  Instance: "An object created from a class. `obj = MyClass()`. Has access to class methods + its own attribute dict (__dict__).",
  Dunder: "Double-underscore method, like __init__ or __repr__. Implements language-level behavior: + is __add__, len() calls __len__, etc. (Data model: docs.python.org/3/reference/datamodel)",
  MRO: "Method Resolution Order. The sequence Python walks to find an attribute on a class. Uses C3 linearization for multiple inheritance. Inspect with `Cls.__mro__`.",
  __init__: "The initializer (not constructor). Called after __new__ creates the object. Set up instance state here.",
  __repr__: "Return a string representation, ideally one that recreates the object: `eval(repr(x)) == x`. Used by REPL display and debugging.",
  __slots__: "Class attribute declaring fixed attribute names. Replaces the per-instance __dict__ with a fixed array — saves memory, faster access, prevents adding new attrs.",
  Property: "A method that acts like an attribute. Use @property for getter, @prop.setter for setter. Lets you change implementation without breaking the API.",
  Iterator: "Object with __next__() that returns next value or raises StopIteration. Also has __iter__() returning self.",
  Iterable: "Object with __iter__() returning an iterator. for-loops call iter() on it to get an iterator. Most containers are iterables.",
  Generator: "A function with `yield`. Returns a generator object (an iterator). Pauses at yield, resumes on next(). Lazy and stateful.",
  "yield from": "Delegate iteration to another iterable inside a generator. `yield from sub_gen()` is equivalent to `for x in sub_gen(): yield x`. PEP 380.",
  GIL: "Global Interpreter Lock. CPython's mechanism ensuring only one thread executes Python bytecode at a time. Threads are useful for I/O (GIL released during waits), not CPU work.",
  asyncio: "The standard library for single-threaded cooperative concurrency. Async functions yield control with await. One event loop coordinates many tasks.",
  coroutine: "An object returned by an async function call. Doesn't run until awaited or scheduled (asyncio.create_task). Different from a generator, though related.",
  await: "Pauses an async function until the awaited awaitable completes. Only valid inside `async def`. The function gives control back to the event loop.",
  venv: "Virtual environment. Isolated Python install with its own dependencies. Standard module: `python -m venv .venv`. uv creates these automatically.",
  pip: "The default package installer. Talks to PyPI. Increasingly replaced by uv for speed + project management, but still ships with Python.",
  PEP: "Python Enhancement Proposal. The mechanism for language and ecosystem changes. PEP 8 (style), PEP 20 (Zen), PEP 484 (type hints), PEP 703 (no-GIL).",
  pyproject: "pyproject.toml — the modern unified config file for project metadata (PEP 621), build system (PEP 517/518), and tool configs (ruff, mypy, pytest)."
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "Python is named after…",
      opts: [ "The snake", "Monty Python's Flying Circus", "A Greek letter" ],
      a: 1,
      x: "Guido van Rossum was reading Monty Python scripts while looking for a name. The snake imagery in logos came later (and is now official branding via PSF). The language has nothing to do with reptiles. (Python FAQ)"
    },
    {
      qid: 'o2',
      q: "What's the relationship between Python and CPython?",
      opts: [
        "They're different languages",
        "CPython is the reference implementation written in C — when people say 'Python', they usually mean CPython",
        "CPython is an extension of Python for C interop"
      ],
      a: 1,
      x: "Python is the language spec. CPython is the C-implementation maintained at github.com/python/cpython — the one you download from python.org. Other implementations: PyPy (JIT), MicroPython (embedded), Jython (JVM), Pyodide (WebAssembly)."
    },
    {
      qid: 'o3',
      q: "Run `import this` in a Python REPL — what happens?",
      opts: [
        "Imports a module called 'this'",
        "Prints The Zen of Python — 19 aphorisms by Tim Peters",
        "Raises an error in Python 3"
      ],
      a: 1,
      x: "PEP 20: The Zen of Python. 'Beautiful is better than ugly. Explicit is better than implicit. Simple is better than complex...' The language's design philosophy in 19 lines. (peps.python.org/pep-0020)"
    },
  ],
  foundation: [
    {
      qid: 'f1',
      q: "Why use a virtual environment (venv) instead of installing packages globally?",
      opts: [
        "Required to run Python",
        "Isolation — each project gets its own dependencies, avoiding version conflicts and 'works on my machine' bugs",
        "Improves performance"
      ],
      a: 1,
      x: "Different projects need different versions of the same library. Without isolation: project A breaks when you upgrade for project B. uv creates and manages these automatically; `python -m venv .venv` is the manual way. (docs.python.org/3/library/venv)"
    },
    {
      qid: 'f2',
      q: "The fastest path from \u0027no Python\u0027 to a working project in 2026 is…",
      opts: [
        "Download python.org installer, then pip install, then maybe set up venv",
        "Install uv once. Then `uv init`, `uv add <pkg>`, `uv run script.py` — handles Python version, venv, packages in one tool",
        "Install conda for everything"
      ],
      a: 1,
      x: "uv (Rust, by Astral) replaced pip + venv + pyenv + pip-tools + poetry in one binary. 10-100× faster than pip. The clear 2026 default. Poetry still works fine if you're already on it; pip ships with Python forever."
    },
    {
      qid: 'f3',
      q: "You're writing Python in 2026. Where does the build/tool config live?",
      opts: [
        "setup.py — the old way",
        "pyproject.toml — single file, project metadata + tool config",
        "Multiple files: setup.cfg, requirements.txt, tox.ini, .flake8"
      ],
      a: 1,
      x: "pyproject.toml (PEP 518/621) is the standard since 2018, fully consolidated by 2024. ruff, mypy, pytest, uv, hatch — all read their config from sections in pyproject.toml. Drastically simpler than the old multi-file mess."
    },
  ],
  bedrock: [
    {
      qid: 'b1',
      q: "What does this print?\n`a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)`",
      opts: [ "[1, 2, 3]", "[1, 2, 3, 4]", "TypeError" ],
      a: 1,
      x: "Assignment in Python binds names to objects, doesn't copy. `b = a` makes b refer to the SAME list. Mutating through b mutates the shared object. This is the most foundational Python concept. (Python tutorial §4.1)"
    },
    {
      qid: 'b2',
      q: "`True == 1` evaluates to…?",
      opts: [ "False — different types", "True — bool is a subclass of int", "TypeError" ],
      a: 1,
      x: "`isinstance(True, int)` is True. True == 1, False == 0, True + True == 2. Bool inherits from int. Almost never relevant — but explains why `[1, True]` deduplicates to {1} in a set."
    },
    {
      qid: 'b3',
      q: "When should you use `is` instead of `==`?",
      opts: [
        "When comparing strings — it's faster",
        "When comparing to None, True, False, or other singletons. NEVER for value comparison",
        "They mean the same thing"
      ],
      a: 1,
      x: "`is` tests identity (same object in memory). `==` tests equality (same value via __eq__). The canonical use: `if x is None:` because None is a singleton. Using `is` on values like ints/strings is undefined behavior (small ints are cached, others aren't). (PEP 8)"
    },
    {
      qid: 'b4',
      q: "Which of these is FALSY in Python?",
      opts: [
        "'False' (the string)",
        "[] (empty list), {} (empty dict), 0, None, '' (empty string)",
        "Only False and None"
      ],
      a: 1,
      x: "Python's falsy set: False, None, 0, 0.0, 0j, '', b'', (), [], {}, set(), range(0). Anything with __bool__ returning False or __len__ returning 0. The string 'False' has length 5, so it's truthy. (docs.python.org/3/library/stdtypes#truth)"
    },
  ],
  functions: [
    {
      qid: 'fn1',
      q: "What does this print?\n`def append(item, items=[]):\n    items.append(item)\n    return items\nappend(1); append(2)`",
      opts: [ "[2]", "[1, 2]", "TypeError" ],
      a: 1,
      x: "THE mutable default trap. The `[]` is evaluated ONCE when the def runs — and reused on every call without an explicit items. So both calls share that list. Fix: `def append(item, items=None): items = items or []`. (docs.python.org/3/tutorial/controlflow#default-argument-values)"
    },
    {
      qid: 'fn2',
      q: "What's a decorator?",
      opts: [
        "A comment style",
        "A callable that takes a function and returns a (usually modified) function. `@dec` is sugar for `f = dec(f)`",
        "Python's way of doing pretty-printing"
      ],
      a: 1,
      x: "Decorators are Python's killer feature for cross-cutting concerns: logging, caching, timing, auth, retries. `@functools.cache` above a function call adds memoization in one line. The pattern is dead simple — but the implications are deep. (Fluent Python, Ch. 9)"
    },
    {
      qid: 'fn3',
      q: "Type hints — what do they do at runtime?",
      opts: [
        "Enforce types — TypeError if wrong",
        "Nothing — they're for tools (mypy, ty, IDEs) to check. Python itself ignores them at runtime",
        "Convert values to the right type"
      ],
      a: 1,
      x: "Hints (PEP 484) are stored in __annotations__ but Python doesn't enforce them. Tools like mypy and ty do static checking. Libraries like Pydantic and dataclasses USE the annotations for validation/codegen. But `def f(x: int)` followed by `f('hi')` runs fine."
    },
    {
      qid: 'fn4',
      q: "Inside `def f(*args, **kwargs):`, what are args and kwargs?",
      opts: [
        "Always lists",
        "args is a tuple of extra positional args; kwargs is a dict of extra keyword args",
        "Reserved keywords"
      ],
      a: 1,
      x: "The * and ** are the syntax that collects extra arguments. `args` and `kwargs` are just convention names — `*items`, `**options` work identically. Call-site: `f(*list_, **dict_)` unpacks them back."
    },
  ],
  containers: [
    {
      qid: 'c1',
      q: "When to use a tuple over a list?",
      opts: [
        "Tuples are always faster",
        "When the collection is fixed (records, function returns), or you need it as a dict key (tuples are hashable; lists aren't)",
        "Tuples have more methods"
      ],
      a: 1,
      x: "Tuples: immutable, hashable, slightly less memory. Use for fixed records (e.g., coordinate = (x, y)), multiple return values, dict keys, set members. Lists: when you'll mutate. Rule of thumb: 'if you'd loop and append, use list; if you'd unpack, use tuple.' (Fluent Python, Ch. 2)"
    },
    {
      qid: 'c2',
      q: "What does this build?\n`[x**2 for x in range(5) if x % 2 == 0]`",
      opts: [
        "An error",
        "[0, 4, 16] — squares of even numbers 0 to 4",
        "[0, 1, 4, 9, 16]"
      ],
      a: 1,
      x: "List comprehension: `[expr for var in iterable if condition]`. Reads naturally: 'x squared, for x in range 5, if x is even'. Faster than equivalent for-loop + append because of bytecode-level optimization. (docs.python.org/3/tutorial/datastructures#list-comprehensions)"
    },
    {
      qid: 'c3',
      q: "You need to count occurrences of items in a list. Best approach?",
      opts: [
        "Manual dict with .get() and increment",
        "collections.Counter(items) — purpose-built, gives .most_common() too",
        "list.count() in a loop"
      ],
      a: 1,
      x: "Counter is a dict subclass that handles missing keys, exposes .most_common(n), supports arithmetic (Counter + Counter, Counter & Counter for intersection). One of the most underused stdlib gems. (docs.python.org/3/library/collections#collections.Counter)"
    },
  ],
  classes: [
    {
      qid: 'cl1',
      q: "What's the difference between __repr__ and __str__?",
      opts: [
        "Same thing — Python only uses one",
        "__repr__ is for developers (debug, eval-able if possible); __str__ is for users (readable). repr() falls back to __repr__ if __str__ is missing",
        "__str__ is for printing; __repr__ is for hashing"
      ],
      a: 1,
      x: "Define __repr__ ALWAYS. Make it look like `ClassName(arg=value)` — ideally `eval(repr(x)) == x`. __str__ is optional, for human-friendly display. If you define only one, define __repr__. (Fluent Python, Ch. 1)"
    },
    {
      qid: 'cl2',
      q: "@dataclass — what does it do?",
      opts: [
        "Makes the class faster",
        "Auto-generates __init__, __repr__, __eq__ (and optionally __hash__, ordering, etc.) based on type annotations. Eliminates boilerplate",
        "Forces immutability"
      ],
      a: 1,
      x: "@dataclass (PEP 557, Python 3.7+) is one of the best language additions in years. Replaces 30 lines of boilerplate with annotations. For data-carrier classes, use it. For richer behavior, regular class. Variants: @dataclass(frozen=True) for immutable, slots=True for memory."
    },
    {
      qid: 'cl3',
      q: "Multiple inheritance: `class C(A, B):` — when C looks up a method, what order does it check?",
      opts: [
        "Left-to-right depth-first, regardless of relationships",
        "C → A → B → object, computed via C3 linearization. Inspectable as C.__mro__",
        "Python doesn't allow multiple inheritance"
      ],
      a: 1,
      x: "C3 linearization gives a consistent, monotonic MRO. Avoids 'diamond problem' inconsistencies. `super()` walks the MRO, not just the immediate parent. (docs.python.org/3/howto/mro)"
    },
  ],
  iteration: [
    {
      qid: 'it1',
      q: "What makes an object iterable?",
      opts: [
        "It must be a list, tuple, or dict",
        "It has __iter__ returning an iterator (object with __next__)",
        "It's a built-in collection"
      ],
      a: 1,
      x: "The iterator protocol: __iter__ on the iterable returns an iterator; __next__ on the iterator returns the next value or raises StopIteration. for-loops, comprehensions, *unpacking — all use this protocol. (docs.python.org/3/library/stdtypes#iterator-types)"
    },
    {
      qid: 'it2',
      q: "Generator vs list comprehension: `(x*2 for x in big)` vs `[x*2 for x in big]`",
      opts: [
        "Same thing — parens vs brackets is style",
        "Generator (parens) is lazy — computes on demand, O(1) memory. List (brackets) is eager — all in memory.",
        "Generators are slower"
      ],
      a: 1,
      x: "Generator expression returns a generator object. Iterates once, computes one item at a time. Perfect for chaining: `sum(x*2 for x in big)` — never materializes the full list. Use generators for streaming + large data. (PEP 289)"
    },
    {
      qid: 'it3',
      q: "What's `yield from`?",
      opts: [
        "A typo for return",
        "Delegates iteration to another iterable inside a generator. Equivalent to: `for x in it: yield x` but also forwards .send/.throw",
        "The async keyword's older sibling"
      ],
      a: 1,
      x: "PEP 380, Python 3.3+. Lets you compose generators cleanly. Used to be the basis for coroutines before async/await. Now mostly for flattening nested iterables and writing tree-walking generators."
    },
  ],
  async: [
    {
      qid: 'a1',
      q: "What does the GIL prevent?",
      opts: [
        "Threading entirely",
        "Multiple threads executing Python bytecode in parallel. Threads still help for I/O (GIL released during waits); they don't help for CPU-bound work",
        "Race conditions automatically"
      ],
      a: 1,
      x: "GIL = Global Interpreter Lock. CPython's reference counting isn't thread-safe; the GIL serializes bytecode execution. Means: threads for I/O concurrency (network, disk), processes (multiprocessing) for CPU parallelism. PEP 703 is changing this — see next question."
    },
    {
      qid: 'a2',
      q: "PEP 703 — what's the status?",
      opts: [
        "Rejected",
        "Free-threaded (no-GIL) CPython is an EXPERIMENTAL build option in 3.13, refined in 3.14, on a multi-phase path to becoming default",
        "Already default in 3.13"
      ],
      a: 1,
      x: "PEP 703 'Making the GIL Optional in CPython.' Phase 1 (3.13): experimental build, opt-in. Phase 2 (3.14+): officially supported but optional. Phase 3 (3.16+ likely): default. Comes with ~10% single-thread slowdown — the cost of changing reference counting and object layout. Worth following."
    },
    {
      qid: 'a3',
      q: "You have 100 HTTP requests to make. Best concurrency model?",
      opts: [
        "100 threads — they'll all run in parallel",
        "asyncio with aiohttp — single thread, cooperative, very efficient for I/O",
        "100 processes via multiprocessing"
      ],
      a: 1,
      x: "I/O-bound: asyncio is the modern default. Cooperative scheduling means one thread handles thousands of concurrent connections. Threading also works (GIL releases for I/O), but asyncio gives more control and scales better. multiprocessing is overkill (heavy per-process cost) for I/O work."
    },
    {
      qid: 'a4',
      q: "Inside `async def fetch():`, how do you call multiple things in parallel and wait for all?",
      opts: [
        "Just await them in sequence",
        "asyncio.gather(*coros) — fires all, returns list of results",
        "Threading"
      ],
      a: 1,
      x: "`await fn1(); await fn2()` is sequential. `await asyncio.gather(fn1(), fn2())` fires both immediately, returns when both complete. For independent tasks, gather is almost always what you want. (docs.python.org/3/library/asyncio-task)"
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "Three concepts that separate intermediate Pythonistas from senior ones?",
      opts: [
        "More libraries memorized",
        "The data model (dunders + how Python wires them), iterators/generators (the lazy/composable patterns), and the GIL + concurrency model",
        "Decorators"
      ],
      a: 1,
      x: "Frameworks change. The data model doesn't. If you can write a custom iterable + context manager, explain why `is None` not `== None`, and choose threading vs multiprocessing vs asyncio for a given workload — you can read any Python codebase. That's the leverage."
    },
  ],
};

const COMMANDS = [
  { cmd: 'uv init my-project', desc: 'Create new project. Sets up pyproject.toml + .venv.' },
  { cmd: 'uv add fastapi httpx', desc: 'Add deps. Updates pyproject.toml + uv.lock, installs into .venv.' },
  { cmd: 'uv add --dev pytest ruff', desc: 'Add dev-only deps.' },
  { cmd: 'uv run python script.py', desc: 'Run a script in the project venv. No manual activation.' },
  { cmd: 'uv run pytest', desc: 'Run a tool installed as a dep, in the venv.' },
  { cmd: 'uv sync', desc: 'Install everything pinned in uv.lock. Reproducible.' },
  { cmd: 'uv python install 3.14', desc: 'Install a specific Python version. uv manages versions too.' },
  { cmd: 'uv python pin 3.14', desc: 'Pin this project to a Python version (.python-version).' },
  { cmd: 'uv tool install ruff', desc: 'Install a CLI tool globally, in its own isolated env.' },
  { cmd: 'python -m venv .venv', desc: 'Old way: create venv with stdlib only. Activate with source .venv/bin/activate.' },
  { cmd: 'python -m pip install -r requirements.txt', desc: 'Old way: install from a flat requirements file.' },
  { cmd: 'python -i script.py', desc: 'Run script, then drop into REPL with state. Best debugging trick.' },
  { cmd: 'python -m http.server 8000', desc: 'Instant static file server in current dir. Stdlib only.' },
  { cmd: 'ruff check . && ruff format .', desc: 'Lint then format. Replaces flake8 + black + isort.' },
  { cmd: 'python -m timeit "<expr>"', desc: 'Microbenchmark an expression. Built-in.' },
];

const RESOURCES = [
  { name: 'The Python Tutorial (official)', url: 'docs.python.org/3/tutorial', note: "The canonical introduction. Concise, accurate, written by core devs. Read all of it. Best ROI of any Python material.", kind: 'reference' },
  { name: 'Python Language Reference', url: 'docs.python.org/3/reference', note: "Authoritative semantics — the data model (Ch. 3) is the single most important chapter on the internet for understanding Python.", kind: 'spec' },
  { name: 'Python Standard Library', url: 'docs.python.org/3/library', note: "The 'batteries included.' Worth scanning the table of contents once. itertools, collections, functools, pathlib, dataclasses, contextlib — gold.", kind: 'reference' },
  { name: 'PEP Index', url: 'peps.python.org', note: "Every language evolution documented. PEP 8 (style), PEP 20 (Zen), PEP 484 (type hints), PEP 557 (dataclasses), PEP 572 (walrus), PEP 703 (no-GIL).", kind: 'spec' },
  { name: 'Fluent Python (2nd ed)', url: 'fluentpython.com', note: "Luciano Ramalho. The book for going from intermediate to senior. Deep on the data model, iteration, concurrency. Not free, but worth the price.", kind: 'book' },
  { name: 'Composing Programs', url: 'composingprograms.com', note: "Berkeley's CS61A textbook. Free. Teaches programming concepts THROUGH Python — closer to MIT/SICP style than typical Python intros.", kind: 'book' },
  { name: 'Think Python (3rd ed)', url: 'greenteapress.com/wp/think-python-3rd-edition', note: "Allen Downey. Free. Academic intro — clean, well-paced, exercises.", kind: 'book' },
  { name: 'Real Python', url: 'realpython.com', note: "High-quality tutorials. Mix of free + paid. Search any Python topic + 'realpython' — usually the best result.", kind: 'tutorial' },
  { name: 'Python Tutor', url: 'pythontutor.com', note: "Visualize Python execution step by step — see references, the heap, frames. Builds intuition for the data model in minutes.", kind: 'tool' },
  { name: 'uv documentation', url: 'docs.astral.sh/uv', note: "The 2026 packaging standard. If you're starting a new project, learn uv first.", kind: 'reference' },
  { name: 'MIT OpenCourseWare 6.0001 / 6.100A', url: 'ocw.mit.edu — search 6.0001', note: "MIT's intro to CS uses Python. Free lectures, problem sets. Course textbook also free online.", kind: 'course' },
  { name: 'PyVideo / PyCon talks', url: 'pyvideo.org', note: "Conference talks index. Raymond Hettinger ('Transforming Code into Beautiful, Idiomatic Python'), David Beazley (anything on concurrency), James Powell ('So you want to be a Python expert?').", kind: 'talks' },
];

const PERSONALIZED = {
  data: {
    spark: "Data path: install Python, then numpy + pandas immediately. Most data work is: load → clean → transform → analyze → plot. Pandas DataFrames are the workhorse. Polars is the up-and-coming alternative (faster, arrow-native).",
    functions: "Data: function-of-DataFrame patterns dominate. `df.pipe(my_clean).pipe(my_transform)`. Type hints with pandas-stubs for static checking. functools.partial for prebinding config to transforms.",
    classes: "Data: dataclasses for record types in pipelines. pydantic BaseModel when input validation matters (config files, API responses). For ML, torch.nn.Module is a class with __call__ → __init__ for layers, forward() for compute.",
    async: "Data: usually NOT async — pandas/numpy are CPU-bound, GIL is irrelevant because they release it (C extensions). For embarrassingly parallel work: joblib or multiprocessing. async matters when ingesting from APIs.",
  },
  web: {
    spark: "Web path: FastAPI for new APIs (async, type-driven, OpenAPI auto-generated). Django for full-stack apps with admin/ORM/auth. Flask for tiny services.",
    functions: "Web: handlers are functions. FastAPI uses type hints AS the request schema — automatic validation and docs. Dependency injection via function defaults: `def handler(db: DB = Depends(get_db)):`.",
    classes: "Web: Django models are classes. SQLAlchemy ORM is classes. Pydantic BaseModel for request/response shapes. @dataclass for internal value types.",
    async: "Web: asyncio matters here. FastAPI is async-native. For Django, async views landed but the ORM is still mostly sync. uvicorn/hypercorn are the ASGI servers.",
  },
  automation: {
    spark: "Automation: `python script.py` is your form factor. The stdlib has `pathlib`, `subprocess`, `argparse`, `csv`, `json`, `re`, `urllib`, `email` — most scripts need nothing else. Add `requests` for HTTP and you've got 80% of automation.",
    functions: "Automation: a script is mostly a single `main()` function plus helpers. `if __name__ == '__main__': main()` is the convention. argparse or click for CLI args. Type hints on every function — pays off when scripts grow.",
    classes: "Automation: classes are often overkill. Use dataclasses for grouping config or input records. Most scripts stay procedural — that's correct.",
    async: "Automation: only when scraping many URLs or hitting many APIs. Otherwise, sync is fine and easier to debug. ThreadPoolExecutor for parallel I/O if you don't want full asyncio.",
  },
  cli: {
    spark: "CLI: argparse (stdlib) for simple tools, click for medium, typer for type-hint-driven. Rich for pretty terminal output. Build a CLI tool, ship via uv tool publish or pipx.",
    functions: "CLI: commands map to functions. typer auto-generates the CLI from type-annotated function signatures. Decorators (@app.command) wire functions into the command tree.",
    classes: "CLI: dataclasses for config, Pydantic for input validation. Click/Typer's Context object holds shared state between subcommands.",
    async: "CLI: rarely async unless the tool talks to many remote APIs. trio is a nice alternative to asyncio for CLI tools — simpler model.",
  },
  fundamentals: {
    spark: "Best choice. Build language fluency before specializing. Open the Python REPL (now color-syntax-highlighted in 3.13+), work through docs.python.org/tutorial section by section. Pause and try every example.",
    functions: "Spend extra time here. Closures, decorators, the late-binding gotcha, *args/**kwargs unpacking — these are leverage. Read Fluent Python's Functions as First-Class Objects chapter twice.",
    classes: "The data model is what makes Python feel coherent. Read 'Pythonic Object' in Fluent Python (Ch. 11). Write a class that implements __iter__, __len__, __eq__, __hash__, __repr__ — and it becomes a real first-class object in the language.",
    async: "Watch David Beazley's PyCon talks on concurrency. The GIL story is more nuanced than the memes suggest. Threading IS useful — for I/O. asyncio isn't always the answer — but is for high-concurrency network code.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's the error?",
    opts: [
      { label: "🔴 NameError: name 'x' is not defined", next: 'name-err' },
      { label: "🔴 TypeError: ... unsupported / wrong type", next: 'type-err' },
      { label: "🔴 AttributeError: ... has no attribute", next: 'attr-err' },
      { label: "🔴 IndentationError / TabError / SyntaxError", next: 'indent-err' },
      { label: "🔴 ModuleNotFoundError / ImportError", next: 'import-err' },
      { label: "🔴 KeyError / IndexError", next: 'key-err' },
      { label: "🐛 Code runs but result is wrong", next: 'logic-err' },
      { label: "🐌 Code is too slow", next: 'slow-err' },
    ],
  },
  'name-err': {
    fix: "The name doesn't exist in any reachable scope.",
    steps: [
      "Read the error: 'name X is not defined' tells you exactly which name.",
      "Typo? Check spelling, capitalization (Python is case-sensitive).",
      "Defined inside a function but used outside? Or vice versa? Scope.",
      "Forgot to import? `import collections` then `collections.Counter`, or `from collections import Counter` then `Counter`.",
      "Variable defined in a conditional branch that didn't execute. Initialize before the branch.",
      "Late-binding closure: `[lambda: i for i in range(3)]` — all lambdas see the FINAL i. Fix: `lambda i=i: i`.",
    ],
  },
  'type-err': {
    fix: "Operation got an object of the wrong type, or wrong number of args.",
    steps: [
      "`unsupported operand type(s) for +: 'int' and 'str'` → check types with `type(x)` or `print(repr(x))`.",
      "Common: `'5' + 1` — Python won't auto-coerce. Fix: `int('5') + 1`.",
      "`takes N positional arguments but M were given` → calling a method? Did you forget that `self` counts?",
      "`'NoneType' object is not subscriptable` → you indexed something that's None. A function returned None and you didn't notice.",
      "`'NoneType' object is not iterable` → same idea, in a for loop or unpacking.",
      "Mutable default args sometimes manifest as TypeError when types change between calls.",
    ],
  },
  'attr-err': {
    fix: "Object doesn't have the attribute you accessed.",
    steps: [
      "Typo on attribute name. `dict.append(...)` — dicts don't have append.",
      "Wrong type? `print(type(x))` to confirm.",
      "Wrong instance — maybe you have the class, not an instance: `MyClass.method` instead of `MyClass().method` or `instance.method`.",
      "Method exists in the class but you're calling on something else (like None after a failed lookup).",
      "Recent: did you typo a private name? `obj._name` vs `obj.__name` (the double-underscore triggers name mangling in classes).",
    ],
  },
  'indent-err': {
    fix: "Whitespace doesn't match — or you have an unclosed bracket above.",
    steps: [
      "Mixing tabs and spaces? Python 3 rejects that. Configure editor: 'Insert spaces' + 4 per indent. Always.",
      "Missing colon on line above? `if x` vs `if x:`. The error often appears on the NEXT line.",
      "Unclosed `(`, `[`, or `{` on a previous line — Python keeps parsing forward looking for the close.",
      "`SyntaxError: invalid syntax` with no obvious cause → look at the line ABOVE the marked one.",
      "Use ruff format / black to autoformat — eliminates most of these.",
    ],
  },
  'import-err': {
    q: "Which import flavor?",
    opts: [
      { label: "ModuleNotFoundError: No module named 'X'", next: 'imp-notfound' },
      { label: "ImportError: cannot import name \u0027X\u0027 from \u0027Y\u0027", next: 'imp-name' },
      { label: "Circular import error", next: 'imp-circ' },
    ],
  },
  'imp-notfound': {
    fix: "The package isn't installed in the active environment.",
    steps: [
      "Activated the right venv? `which python` (or `where python` on Windows) should point to `.venv/bin/python`, not the system one.",
      "Install: `uv add X` or `pip install X`. Confirm it's in pyproject.toml or requirements.txt.",
      "Spelling: PyPI name vs import name often differ (`pip install Pillow` → `import PIL`; `pip install beautifulsoup4` → `import bs4`).",
      "Multiple Python versions? `python3.14 -m pip install X` to be explicit.",
      "Local module: the path matters. Run from the project root, or add `__init__.py` to make folders into packages.",
    ],
  },
  'imp-name': {
    fix: "Module exists but doesn't export what you asked for.",
    steps: [
      "Check the module — `dir(module)` lists what's available.",
      "Version drift: the import you copied is from a newer/older version of the library.",
      "Typo on the name.",
      "Sometimes private (single underscore prefix) names that USED to be exported aren't anymore. Find the new public location.",
    ],
  },
  'imp-circ': {
    fix: "Module A imports B, which imports A — at import time, one of them isn't fully loaded yet.",
    steps: [
      "Refactor: extract shared code into a third module both can depend on.",
      "Move the import inside the function (not at top of file) — defers resolution until call time.",
      "Use TYPE_CHECKING guard for type hints only: `if TYPE_CHECKING: from x import Y` (PEP 484).",
      "Reconsider the dependency direction — circular often means a design smell.",
    ],
  },
  'key-err': {
    fix: "Asked for an element/key that isn't there.",
    steps: [
      "KeyError on dict: use `d.get(key)` (returns None if missing) or `d.get(key, default)`.",
      "Or `key in d` to check before accessing.",
      "Or collections.defaultdict — auto-creates the key with a default factory.",
      "IndexError on list: check `len(list)` first. Negative indexing for the tail is fine; out-of-range still errors.",
      "If iterating: `for i, x in enumerate(lst): ...` — gives index without manual counting.",
    ],
  },
  'logic-err': {
    fix: "No exception — just wrong output. Time to actually debug.",
    steps: [
      "Add `print(repr(x))` at suspected points. Use repr, not str — shows types and quotes.",
      "Better: `breakpoint()` (Python 3.7+) drops you into pdb. n=next, s=step, c=continue, l=list, p var, q=quit.",
      "Best: Python Tutor (pythontutor.com) — paste your code, step through visually.",
      "Off-by-one? Print the loop range and indices.",
      "Mutation surprise? `is` to check identity. Are two variables accidentally the same object?",
      "Encoding issue? `print(repr(s))` shows the actual codepoints. b'' vs '' bites people.",
    ],
  },
  'slow-err': {
    fix: "Profile, then optimize.",
    steps: [
      "Time it: `python -m timeit '<expr>'` or `%timeit` in IPython/Jupyter.",
      "Profile a script: `python -m cProfile -s cumulative script.py` shows where time goes.",
      "Big-O issue? List `.count()` or `in list` is O(n). For repeated lookups: `set(...)` first, then `in set` is O(1).",
      "Concatenating strings in a loop with +? Use ''.join(parts) — O(n) vs O(n²).",
      "Pure Python loops on big data: use numpy/pandas instead — vectorized C under the hood.",
      "CPU-bound but Python: multiprocessing, or Cython/PyPy/Numba/Rust extension.",
      "I/O-bound: asyncio or concurrent.futures.ThreadPoolExecutor.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'src', x: 30, y: 25, w: 130, h: 38, label: '.py source', color: '#fcd34d', desc: "Your Python source file. UTF-8 text. The tokenizer scans it into tokens, the parser builds an Abstract Syntax Tree (AST). Inspect with `ast.parse(src)`." },
  { id: 'bc', x: 220, y: 25, w: 130, h: 38, label: 'Bytecode (.pyc)', color: '#fcd34d', desc: "Compiled stack-machine instructions. CPython compiles modules to bytecode on first import, caches as .pyc in __pycache__. Disassemble with `dis.dis(fn)` to see what the VM actually runs." },
  { id: 'vm', x: 120, y: 100, w: 160, h: 42, label: 'CPython VM', color: '#34d399', desc: "The bytecode interpreter. Stack-based. Executes one opcode at a time on the evaluation stack. Python 3.13+ also has an experimental JIT compiler that specializes hot code paths." },
  { id: 'heap', x: 30, y: 175, w: 150, h: 38, label: 'Object heap', color: '#34d399', desc: "Where Python objects live. Every value is an object with a type pointer, reference count, and value. PyObject in C. Pointers, pointers everywhere." },
  { id: 'rc', x: 220, y: 175, w: 145, h: 38, label: 'Refcount + GC', color: '#34d399', desc: "Memory management: reference counting frees objects when refcount hits 0. A cyclic garbage collector handles reference cycles (where refcount-only would leak). gc module exposes it." },
  { id: 'gil', x: 60, y: 245, w: 130, h: 38, label: 'GIL', color: '#fb7185', desc: "Global Interpreter Lock. Held by the executing thread. Released around I/O and every ~100 bytecode ops. PEP 703 makes it optional — experimental in 3.13, refined in 3.14, eventual default." },
  { id: 'cext', x: 220, y: 245, w: 145, h: 38, label: 'C extensions', color: '#fcd34d', desc: "numpy, lxml, pillow, pydantic-core — compiled C code that talks to CPython via the C API. Can release the GIL for true parallelism (numpy does this)." },
];

const CHALLENGES = [
  {
    id: 'sum_list',
    title: '01 · Sum a list',
    desc: "Write `sum_list(nums)` that returns the sum of a list of numbers. Don't use built-in sum().",
    starter: "def sum_list(nums):\n    # your code here\n    pass\n",
    fn: 'sum_list',
    tests: [
      { args: [[1, 2, 3, 4]], expected: 10 },
      { args: [[]], expected: 0 },
      { args: [[-5, 5]], expected: 0 },
      { args: [[100]], expected: 100 },
    ],
  },
  {
    id: 'word_count',
    title: '02 · Word count',
    desc: "Write `word_count(text)` returning a dict mapping each word to its count. Split on whitespace. Case-sensitive.",
    starter: "def word_count(text):\n    # your code here\n    pass\n",
    fn: 'word_count',
    tests: [
      { args: ['hello world hello'], expected: { hello: 2, world: 1 } },
      { args: [''], expected: {} },
      { args: ['a a a b'], expected: { a: 3, b: 1 } },
    ],
  },
  {
    id: 'evens_squared',
    title: '03 · Comprehension',
    desc: "Write `evens_squared(nums)` that returns squares of even numbers, in order. Use a list comprehension.",
    starter: "def evens_squared(nums):\n    # hint: [expr for x in iterable if condition]\n    pass\n",
    fn: 'evens_squared',
    tests: [
      { args: [[1, 2, 3, 4, 5]], expected: [4, 16] },
      { args: [[]], expected: [] },
      { args: [[1, 3, 5]], expected: [] },
      { args: [[2, 4, 6]], expected: [4, 16, 36] },
    ],
  },
  {
    id: 'point',
    title: '04 · Class with __repr__',
    desc: "Define a Point class with x and y attributes. __init__ takes both. __repr__ returns 'Point(x=N, y=M)'. __eq__ returns True if x and y match.",
    starter: "class Point:\n    # your code\n    pass\n",
    fn: 'Point',
    custom: true,
    runner: async (pyodide) => {
      const checks = [];
      try {
        const p1 = await pyodide.runPythonAsync('Point(3, 4)');
        const r1 = await pyodide.runPythonAsync('repr(Point(3, 4))');
        checks.push({ name: "Point(3, 4) creates instance", pass: !!p1 });
        checks.push({ name: "repr(Point(3, 4)) == 'Point(x=3, y=4)'", pass: r1 === 'Point(x=3, y=4)' });
        const eq1 = await pyodide.runPythonAsync('Point(3, 4) == Point(3, 4)');
        const eq2 = await pyodide.runPythonAsync('Point(3, 4) == Point(3, 5)');
        checks.push({ name: 'equal points are ==', pass: eq1 === true });
        checks.push({ name: 'unequal points are !=', pass: eq2 === false });
      } catch (e) {
        checks.push({ name: 'class defined correctly', pass: false, err: e.message.split('\n').pop() });
      }
      return checks;
    },
  },
  {
    id: 'fib',
    title: '05 · Generator — fibonacci',
    desc: "Write a generator function `fib()` that yields fibonacci numbers indefinitely: 0, 1, 1, 2, 3, 5, 8, 13, ...",
    starter: "def fib():\n    # use yield\n    pass\n",
    fn: 'fib',
    custom: true,
    runner: async (pyodide) => {
      const checks = [];
      try {
        const first10 = await pyodide.runPythonAsync(`
import itertools
list(itertools.islice(fib(), 10))
`);
        const result = first10?.toJs ? first10.toJs() : first10;
        const expected = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34];
        const pass = Array.isArray(result) && result.length === 10 && result.every((v, i) => v === expected[i]);
        checks.push({ name: 'first 10 fibonacci: [0,1,1,2,3,5,8,13,21,34]', pass, actual: pass ? '' : JSON.stringify(result) });
        const isGen = await pyodide.runPythonAsync(`
import inspect
inspect.isgenerator(fib())
`);
        checks.push({ name: 'fib() returns a generator', pass: isGen === true });
      } catch (e) {
        checks.push({ name: 'generator works', pass: false, err: e.message.split('\n').pop() });
      }
      return checks;
    },
  },
  {
    id: 'timer',
    title: '06 · Decorator — @timer',
    desc: "Write a decorator `timer` that wraps a function. The wrapped function should set the attribute `last_duration_ms` on itself after each call (a non-negative float). It should still return the original return value.",
    starter: "def timer(fn):\n    # your code\n    pass\n",
    fn: 'timer',
    custom: true,
    runner: async (pyodide) => {
      const checks = [];
      try {
        await pyodide.runPythonAsync(`
@timer
def add(a, b):
    return a + b
r = add(2, 3)
`);
        const r = await pyodide.runPythonAsync('r');
        checks.push({ name: 'wrapped fn returns correct value (2+3=5)', pass: r === 5 });
        const dur = await pyodide.runPythonAsync('add.last_duration_ms');
        const hasIt = typeof dur === 'number' && dur >= 0;
        checks.push({ name: 'last_duration_ms set to a non-negative number', pass: hasIt, actual: hasIt ? '' : String(dur) });
      } catch (e) {
        checks.push({ name: 'decorator works', pass: false, err: e.message.split('\n').pop() });
      }
      return checks;
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   STORAGE HELPERS
   ═══════════════════════════════════════════════════════════════ */

const STORAGE_PREFIX = 'pyatlas:';
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

export default function PythonAtlas() {
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

  /* ─── Reusable UI ─── */
  const Code = ({ children, id, lang = 'python' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
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
      info: { border: 'border-emerald-400/40', bg: 'bg-emerald-400/5', text: 'text-emerald-300', label: 'NOTE' },
      warn: { border: 'border-orange-400/40', bg: 'bg-orange-400/5', text: 'text-orange-300', label: 'HEADS UP' },
      tip: { border: 'border-amber-300/40', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'TIP' },
      you: { border: 'border-rose-400/40', bg: 'bg-rose-400/5', text: 'text-rose-300', label: 'FOR YOUR STACK' },
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-emerald-400 border-emerald-400' : 'border-zinc-600'}`}>
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
                  reveal && isCorrect ? 'border-emerald-400 bg-emerald-400/10 text-emerald-200' :
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
        className="border-b border-dotted border-emerald-400/60 text-emerald-200 hover:text-emerald-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-emerald-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* ─── Architecture diagram: CPython execution pipeline ─── */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap any node · CPython execution pipeline
        </div>
        <svg viewBox="0 0 400 310" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="parr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          {/* Pipeline arrows */}
          <line x1="160" y1="44" x2="220" y2="44" stroke="#52525b" markerEnd="url(#parr)" />
          <line x1="200" y1="63" x2="200" y2="98" stroke="#52525b" markerEnd="url(#parr)" />
          <line x1="200" y1="142" x2="105" y2="175" stroke="#52525b" markerEnd="url(#parr)" />
          <line x1="200" y1="142" x2="290" y2="175" stroke="#52525b" markerEnd="url(#parr)" />
          <line x1="125" y1="245" x2="125" y2="213" stroke="#52525b" markerEnd="url(#parr)" />
          <line x1="290" y1="245" x2="290" y2="213" stroke="#52525b" markerEnd="url(#parr)" />
          <text x="180" y="40" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>compile</text>
          <text x="208" y="85" fill="#52525b" fontSize="8" style={{ fontFamily: 'JetBrains Mono, monospace' }}>exec</text>
          {ARCH_NODES.map(n => {
            const isSel = archSelected === n.id;
            return (
              <g key={n.id} onClick={() => setArchSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect x={n.x} y={n.y} width={n.w} height={n.h}
                  fill={isSel ? n.color + '30' : n.color + '12'} stroke={n.color}
                  strokeWidth={isSel ? '2' : '1'} />
                <text x={n.x + n.w / 2} y={n.y + n.h / 2 + 4} textAnchor="middle"
                  fill="#e4e4e7" fontSize={n.label.length > 14 ? '10' : '11'}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-emerald-400/30 bg-emerald-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-emerald-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: Real CPython via Pyodide (WASM) ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('challenges'); // 'challenges' | 'freeplay'
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];
    const [code, setCode] = useState(challenge.starter);
    const [output, setOutput] = useState('');
    const [tests, setTests] = useState(null);
    const [running, setRunning] = useState(false);
    const [pyStatus, setPyStatus] = useState('idle'); // idle | loading | ready | error
    const pyodideRef = useRef(null);

    useEffect(() => {
      setCode(challenge.starter);
      setOutput('');
      setTests(null);
    }, [challengeIdx]);

    // Lazy-load Pyodide when sandbox mounts
    useEffect(() => {
      if (window.__pyodideAtlas) {
        pyodideRef.current = window.__pyodideAtlas;
        setPyStatus('ready');
        return;
      }
      if (window.__pyodideAtlasLoading) {
        // Another instance is loading it — poll
        const interval = setInterval(() => {
          if (window.__pyodideAtlas) {
            pyodideRef.current = window.__pyodideAtlas;
            setPyStatus('ready');
            clearInterval(interval);
          }
        }, 200);
        setPyStatus('loading');
        return () => clearInterval(interval);
      }
      window.__pyodideAtlasLoading = true;
      setPyStatus('loading');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.29.4/full/pyodide.js';
      script.onload = async () => {
        try {
          const py = await window.loadPyodide();
          window.__pyodideAtlas = py;
          pyodideRef.current = py;
          setPyStatus('ready');
        } catch (e) {
          setPyStatus('error');
          setOutput('❌ Failed to initialize Pyodide: ' + e.message);
        }
      };
      script.onerror = () => {
        setPyStatus('error');
        setOutput('❌ Failed to load Pyodide from CDN. Check network.');
      };
      document.head.appendChild(script);
    }, []);

    const stringify = (v) => {
      try {
        if (typeof v === 'string') return v;
        if (typeof v === 'undefined') return 'undefined';
        if (v === null) return 'None';
        if (typeof v === 'object') return JSON.stringify(v);
        return String(v);
      } catch (e) { return String(v); }
    };

    const setupCapture = (py) => {
      const captured = { stdout: '', stderr: '' };
      py.setStdout({ batched: (text) => { captured.stdout += text; } });
      py.setStderr({ batched: (text) => { captured.stderr += text; } });
      return captured;
    };

    const runFreePlay = async () => {
      const py = pyodideRef.current;
      if (!py) return;
      setRunning(true);
      const cap = setupCapture(py);
      try {
        const result = await py.runPythonAsync(code);
        let out = cap.stdout;
        if (cap.stderr) out += '[stderr] ' + cap.stderr;
        if (result !== undefined && result !== null) {
          const display = result?.toJs ? JSON.stringify(result.toJs()) : String(result);
          out += (out && !out.endsWith('\n') ? '\n' : '') + '→ ' + display;
        }
        setOutput(out || '(no output)');
      } catch (e) {
        const msg = e.message ? e.message.split('\n').slice(-3).join('\n') : String(e);
        setOutput((cap.stdout || '') + (cap.stderr || '') + '❌ ' + msg);
      }
      setRunning(false);
    };

    const runTests = async () => {
      const py = pyodideRef.current;
      if (!py) return;
      setRunning(true);
      setTests(null);
      const cap = setupCapture(py);
      try {
        // Define user code in fresh namespace
        await py.runPythonAsync(code);
        if (challenge.custom) {
          const checks = await challenge.runner(py);
          setTests(checks);
          setOutput(cap.stdout || '');
        } else {
          // Test by calling fn with each test's args, comparing to expected
          const results = [];
          for (const t of challenge.tests) {
            const argsExpr = t.args.map(toPyLiteral).join(', ');
            const callExpr = `${challenge.fn}(${argsExpr})`;
            try {
              const result = await py.runPythonAsync(callExpr);
              const js = result?.toJs ? result.toJs({ dict_converter: Object.fromEntries }) : result;
              const pass = deepEqual(js, t.expected);
              results.push({
                name: `${challenge.fn}(${t.args.map(a => JSON.stringify(a)).join(', ')}) → ${JSON.stringify(t.expected)}`,
                pass,
                actual: pass ? '' : JSON.stringify(js),
              });
            } catch (e) {
              const msg = e.message ? e.message.split('\n').slice(-1)[0] : String(e);
              results.push({ name: callExpr, pass: false, err: msg });
            }
          }
          setTests(results);
          setOutput(cap.stdout || '');
        }
      } catch (e) {
        const msg = e.message ? e.message.split('\n').slice(-3).join('\n') : String(e);
        setOutput((cap.stdout || '') + (cap.stderr || '') + '❌ ' + msg);
        setTests([{ name: 'code parses + runs', pass: false }]);
      }
      setRunning(false);
    };

    function toPyLiteral(v) {
      if (v === null) return 'None';
      if (v === true) return 'True';
      if (v === false) return 'False';
      if (typeof v === 'string') return JSON.stringify(v);
      if (typeof v === 'number') return String(v);
      if (Array.isArray(v)) return '[' + v.map(toPyLiteral).join(', ') + ']';
      if (typeof v === 'object') return '{' + Object.entries(v).map(([k, val]) => toPyLiteral(k) + ': ' + toPyLiteral(val)).join(', ') + '}';
      return String(v);
    }

    function deepEqual(a, b) {
      if (a === b) return true;
      if (a === null || b === null) return a === b;
      if (typeof a !== typeof b) return false;
      if (typeof a !== 'object') return a === b;
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        return a.every((x, i) => deepEqual(x, b[i]));
      }
      const ak = Object.keys(a).sort(), bk = Object.keys(b).sort();
      if (ak.length !== bk.length) return false;
      if (!ak.every((k, i) => k === bk[i])) return false;
      return ak.every(k => deepEqual(a[k], b[k]));
    }

    const allPass = tests && tests.length > 0 && tests.every(t => t.pass);
    const ready = pyStatus === 'ready';

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE CPYTHON · {mode === 'challenges' ? challenge.title : 'free play'}</span>
            {pyStatus === 'ready' && <span className="text-emerald-400">●</span>}
            {pyStatus === 'loading' && <span className="text-amber-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> loading runtime</span>}
            {pyStatus === 'error' && <span className="text-orange-400">● error</span>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-emerald-400 text-emerald-300 bg-emerald-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => { setMode('freeplay'); setCode("# Write any Python — click Run.\n# Try: print([x*2 for x in range(5)])\n"); setOutput(''); setTests(null); }} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-emerald-400 text-emerald-300 bg-emerald-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-emerald-400 text-emerald-300 bg-emerald-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
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
          className="w-full bg-black text-zinc-100 px-3 py-3 text-[13px] outline-none resize-y min-h-[160px] leading-snug"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        />

        <div className="px-3 py-2 border-t border-zinc-800 flex gap-2">
          {mode === 'freeplay' ? (
            <button onClick={runFreePlay} disabled={!ready || running}
              className="flex-1 border border-emerald-400 bg-emerald-400/10 text-emerald-200 px-3 py-2 text-[12px] font-bold hover:bg-emerald-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> Run</>}
            </button>
          ) : (
            <>
              <button onClick={runTests} disabled={!ready || running}
                className="flex-1 border border-emerald-400 bg-emerald-400/10 text-emerald-200 px-3 py-2 text-[12px] font-bold hover:bg-emerald-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> Run tests</>}
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
            <pre className="px-3 py-2 text-[12px] text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap break-words" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {output || '(no stdout)'}
            </pre>
            {tests && (
              <div className="border-t border-zinc-800 px-3 py-2">
                {tests.map((t, i) => (
                  <div key={i} className={`text-[12px] flex items-start gap-2 py-0.5 ${t.pass ? 'text-emerald-300' : 'text-orange-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {t.pass ? <Check size={12} className="shrink-0 mt-0.5" /> : <X size={12} className="shrink-0 mt-0.5" />}
                    <span className="break-all">{t.name}{t.err && ` — ${t.err}`}{!t.pass && t.actual && ` (got: ${t.actual})`}</span>
                  </div>
                ))}
                {allPass && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 text-emerald-300 text-[12px] font-bold flex items-center gap-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    ✓ ALL TESTS PASS {challengeIdx < CHALLENGES.length - 1 && (
                      <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="ml-2 text-amber-300 hover:text-amber-100 underline">next →</button>
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
                  <span className={i === path.length - 1 ? 'text-emerald-300' : ''}>{p}</span>
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
              <div className="border-l-2 border-emerald-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-emerald-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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
    let md = "# Python Atlas — Cheatsheet\n\n";
    md += "## The data model essentials\n";
    md += "```python\n# Identity vs equality\nx is None              # identity check — for None, True, False, sentinels\nx == 'hello'           # value equality — calls __eq__\n\n# Truthy / falsy (the falsy ones)\nbool(False)            # False\nbool(None) bool(0) bool(0.0) bool('') bool([]) bool({}) bool(set())   # all False\n\n# Common dunders\n__init__   __repr__   __str__   __eq__   __hash__\n__len__    __iter__   __next__  __getitem__  __call__\n__enter__  __exit__   __lt__    __add__   __bool__\n```\n\n";
    md += "## Modern syntax\n";
    md += "```python\n# Type hints (PEP 484+)\ndef f(x: int, y: list[str] | None = None) -> dict[str, int]: ...\n\n# Dataclasses (PEP 557)\nfrom dataclasses import dataclass\n@dataclass\nclass Point:\n    x: int\n    y: int = 0\n\n# Walrus (PEP 572)\nif (n := len(items)) > 10: print(f'big: {n}')\n\n# Match (PEP 634, 3.10+)\nmatch point:\n    case (0, 0): print('origin')\n    case (x, 0): print(f'x-axis: {x}')\n    case _: print('elsewhere')\n```\n\n";
    md += "## Comprehensions\n";
    md += "```python\n[x*2 for x in items if x > 0]            # list\n{x for x in items}                       # set\n{k: v for k, v in pairs}                 # dict\n(x*2 for x in items)                     # generator (lazy)\n```\n\n";
    md += "## Standard library highlights\n";
    md += "```python\nfrom collections import Counter, defaultdict, deque, namedtuple\nfrom itertools import chain, count, islice, takewhile, groupby, product\nfrom functools import cache, lru_cache, partial, reduce, wraps\nfrom pathlib import Path\nfrom dataclasses import dataclass, field, asdict\nfrom contextlib import contextmanager, suppress\nimport json, csv, re, datetime, subprocess, argparse\n```\n\n";
    md += "## Async\n";
    md += "```python\nimport asyncio\n\nasync def fetch(url):\n    ...\n\nasync def main():\n    results = await asyncio.gather(fetch(u) for u in urls)\n\nasyncio.run(main())\n```\n\n";
    md += "## Commands\n\n";
    COMMANDS.forEach(c => { md += `**${c.desc}**\n\`\`\`\n${c.cmd}\n\`\`\`\n\n`; });
    md += "## Authoritative resources\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    md += "\n---\n_Generated by Python Atlas. Curriculum grounded in docs.python.org, PEPs, Fluent Python (Ramalho), Composing Programs (Berkeley CS61A), Think Python (Downey)._\n";
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'python-atlas-cheatsheet.md'; a.click();
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
        <div className="max-w-lg w-full bg-zinc-950 border border-emerald-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-emerald-300" />
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
                  item.kind === 'chapter' ? 'text-emerald-300' :
                  item.kind === 'term' ? 'text-amber-300' : 'text-rose-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-emerald-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>π CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What are you using Python for?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-emerald-400 hover:bg-emerald-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 1991">Born from a Christmas break</H2>
            <P>
              Guido van Rossum started Python in December 1989 at CWI in the Netherlands. He wanted a successor to the ABC language that was usable for system administration tasks and accessible to scientists. The name came from Monty Python's Flying Circus, not the snake.
            </P>
            <P>
              The first public release was 0.9.0 in February 1991. Python 2.0 (2000) introduced list comprehensions and garbage collection. Python 3.0 (2008) made breaking changes for correctness — Unicode by default, print as a function, integer division — and triggered a 12-year migration that finally ended when 2.7 reached EOL in January 2020.
            </P>
            <H2 num="◇ NOW">Python in 2026</H2>
            <P>
              Python 3.14 is the current stable (released October 2025), with 3.13 in maintenance and 3.15 in alpha. The annual release cadence (PEP 602) is now reliable: a new minor every October, supported for five years.
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { ver: '3.13 (Oct 2024)', what: "New REPL (multi-line edit, syntax color), JIT compiler tier (experimental), free-threaded build (PEP 703, experimental), improved error messages." },
                { ver: '3.14 (Oct 2025)', what: "t-strings (PEP 750 template literals), deferred annotations (PEP 649), subinterpreters in stdlib, zstandard compression module, free-threaded refinements." },
                { ver: '3.15 (alpha)', what: "Continued JIT improvements, UTF-8 default encoding (PEP 686), unpacking in comprehensions (PEP 798). Expected October 2026." },
              ].map(v => (
                <div key={v.ver} className="border border-zinc-800 px-3 py-2">
                  <div className="text-emerald-300 text-[12px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.ver}</div>
                  <div className="text-zinc-400 text-[12px] mt-1">{v.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ ZEN">The Zen of Python</H2>
            <P>Type <Kbd>import this</Kbd> in any Python REPL. PEP 20, written by Tim Peters, is the design philosophy in 19 aphorisms:</P>
            <Code id="zen">{`Beautiful is better than ugly.
Explicit is better than implicit.
Simple is better than complex.
Complex is better than complicated.
Flat is better than nested.
Sparse is better than dense.
Readability counts.
...
There should be one-- and preferably only one --obvious way to do it.
...
Now is better than never.
Although never is often better than *right* now.`}</Code>
            <Callout kind="cite" title="SOURCE">peps.python.org/pep-0020. The 'one obvious way' principle is the design DNA — explains why Python often has fewer features than its peers, by design.</Callout>
            <H2 num="◇ IMPLEMENTATIONS">CPython and friends</H2>
            <P>The Python language is a spec; multiple implementations exist.</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'CPython', who: 'PSF', what: "The reference. Written in C. What you download from python.org. Bytecode-interpreted with optional JIT in 3.13+." },
                { name: 'PyPy', who: 'pypy.org', what: "Alternative implementation with a powerful JIT. Often 4-10× faster for long-running CPU work. Lags CPython in newest features." },
                { name: 'MicroPython', who: 'micropython.org', what: "Compact Python for microcontrollers. Runs on $5 boards." },
                { name: 'Pyodide', who: 'pyodide.org', what: "CPython compiled to WebAssembly. Runs in the browser. (The sandbox in Chapter 09 uses it.)" },
                { name: 'Cython', who: 'cython.org', what: "Compiles Python (with type hints) to C extension modules. Used by numpy, pandas, lxml internals." },
              ].map(e => (
                <div key={e.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-emerald-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{e.name}</span>
                    <span className="text-zinc-500 text-[11px]">· {e.who}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1">{e.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ GOVERNANCE">Steering Council</H2>
            <P>
              Guido stepped down as BDFL (Benevolent Dictator For Life) in 2018 after the contentious walrus-operator PEP. Governance moved to an elected Steering Council (PEP 13) — five-person body, annual elections. Language changes still go through the PEP process, debated openly on python-dev and discuss.python.org.
            </P>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ INSTALL">Get Python in 30 seconds</H2>
            <P>
              In 2026, the fastest path is <strong>uv</strong> — a single Rust binary from Astral that installs Python, creates virtualenvs, manages dependencies, runs scripts. Replaces pip + venv + pyenv + pip-tools + poetry. 10-100× faster than pip.
            </P>
            <Code id="install-uv" lang="bash">{`# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or via Homebrew / Cargo
brew install uv
cargo install --git https://github.com/astral-sh/uv uv`}</Code>
            <P>Then:</P>
            <Code id="uv-flow" lang="bash">{`uv python install 3.14         # install Python itself
mkdir my-project && cd my-project
uv init                         # creates pyproject.toml + .venv + main.py
uv add httpx pandas             # install packages
uv run python main.py           # run script in the venv (no activation)
uv sync                         # reproducible install from uv.lock`}</Code>
            <Callout kind="cite" title="CITED">
              Astral's uv reached 126M monthly downloads on PyPI by Q1 2026, surpassing Poetry. Used by OpenAI Codex internally (~1M compute-minutes saved weekly per the Astral team). Dual-licensed MIT + Apache 2.0. (docs.astral.sh/uv)
            </Callout>
            <H2 num="◇ OLD-WAY">The stdlib way (still works)</H2>
            <P>If you can't install uv, the standard tools work:</P>
            <Code id="oldway" lang="bash">{`# Install Python from python.org
python3.14 -m venv .venv         # create virtual environment
source .venv/bin/activate        # activate (macOS/Linux)
.venv\\Scripts\\activate           # activate (Windows)
pip install httpx pandas         # install packages
pip freeze > requirements.txt    # snapshot
deactivate                       # exit venv`}</Code>
            <H2 num="◇ REPL">The REPL — your most-used tool</H2>
            <P>Python 3.13 shipped a brand new REPL based on PyPy's: multi-line editing, syntax highlighting, colorful tracebacks, command history that survives across sessions.</P>
            <Code id="repl-tricks">{`# Start it
python                          # default REPL
python -i script.py             # run script, then drop into REPL with its state
ipython                         # third-party — more features, magics like %timeit

# In the REPL
help(obj)                       # documentation for anything
dir(obj)                        # list available attributes/methods
type(obj)                       # the class
obj.__class__.__mro__           # the method resolution order

# Quick web server (built-in!)
python -m http.server 8000      # serve current directory at localhost:8000`}</Code>
            <Callout kind="tip" title="PYTHON TUTOR">
              <Kbd>pythontutor.com</Kbd> — paste any Python code, step through visually with frames, references, the heap. Single best tool for building intuition about how Python actually works. Free, open-source.
            </Callout>
            <H2 num="◇ PYPROJECT">pyproject.toml — single config</H2>
            <P>The standard config file for modern Python projects (PEP 518, 621). Replaces setup.py + setup.cfg + requirements.txt + tool-specific configs.</P>
            <Code id="pyproject" lang="toml">{`[project]
name = "my-package"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27",
    "pydantic>=2.5",
]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.6", "mypy>=1.10"]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.pytest.ini_options]
testpaths = ["tests"]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"`}</Code>
            <H2 num="◇ CHECK">First-day checklist</H2>
            <div className="border border-zinc-800 p-3 my-3">
              <CheckItem id="pyprep1">uv installed: <Kbd>uv --version</Kbd> shows 0.x</CheckItem>
              <CheckItem id="pyprep2"><Kbd>uv python install 3.14</Kbd> finished</CheckItem>
              <CheckItem id="pyprep3">Created a project: <Kbd>uv init test && cd test && uv run python -c "print(2+2)"</Kbd> prints 4</CheckItem>
              <CheckItem id="pyprep4">Editor: VSCode + Pylance extension, or PyCharm Community</CheckItem>
              <CheckItem id="pyprep5"><Kbd>uv add --dev ruff && uv run ruff check .</Kbd> works</CheckItem>
              <CheckItem id="pyprep6">Bookmarked: docs.python.org/3 + peps.python.org</CheckItem>
            </div>
            {QUIZZES.foundation.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ EVERYTHING">Everything is an object</H2>
            <P>
              In Python, every value — integers, strings, functions, classes, modules, even <em>types themselves</em> — is an object. Each has an identity (a unique id), a type, and a value.
            </P>
            <Code id="everything">{`x = 42
id(x)            # 4373820944  (memory address — unique per object lifetime)
type(x)          # <class 'int'>
type(type(x))    # <class 'type'>   — type IS a type

# Functions are objects too
def greet(): pass
greet.__name__   # 'greet'
greet.x = 10     # attach attributes to functions — totally legal`}</Code>
            <H2 num="◇ LABELS">Variables are labels, not boxes</H2>
            <P>
              Assignment binds a name to an object. It does NOT copy. This is the single most important thing to internalize about Python — bugs from misunderstanding it can persist for years.
            </P>
            <Code id="labels">{`a = [1, 2, 3]
b = a                    # b now refers to the SAME list
b.append(4)
print(a)                 # [1, 2, 3, 4]  — mutated through b, visible via a
print(a is b)            # True — same object

# Force a copy
c = a.copy()             # or list(a) or a[:]
c.append(5)
print(a)                 # unchanged: [1, 2, 3, 4]
print(c)                 # [1, 2, 3, 4, 5]`}</Code>
            <Callout kind="cite" title="VISUALIZE">
              Paste the example above into pythontutor.com. You'll see two variables (`a`, `b`) with arrows pointing to the SAME list object. The mental model becomes permanent in 60 seconds.
            </Callout>
            <H2 num="◇ TYPES">Seven fundamental types</H2>
            <div className="grid grid-cols-2 gap-1.5 my-3 text-[12px]">
              {[
                { t: 'int', e: '42, -7, 2**100', n: 'arbitrary precision' },
                { t: 'float', e: '3.14, 1e-10', n: 'IEEE 754 double' },
                { t: 'complex', e: '3+4j', n: 'rarely used' },
                { t: 'bool', e: 'True, False', n: 'subclass of int (!)' },
                { t: 'str', e: '"hi", \'hi\', f"{x}"', n: 'immutable Unicode' },
                { t: 'bytes', e: 'b"hi"', n: 'immutable byte seq' },
                { t: 'NoneType', e: 'None', n: 'the singleton' },
                { t: '(everything else)', e: 'list, dict, set, ...', n: 'objects' },
              ].map(row => (
                <div key={row.t} className="border border-zinc-800 px-2 py-1.5">
                  <code className="text-emerald-300 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.t}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">e.g. {row.e}</div>
                  <div className="text-zinc-500 text-[10px] italic">{row.n}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ MUTABLE">Mutable vs immutable</H2>
            <P>This split decides whether a value can change in place. Critical for hashability (only immutables can be dict keys) and for the mutable-default trap (next chapter).</P>
            <Code id="mutable">{`# Immutable: int, float, bool, str, tuple, frozenset, bytes, None
s = "hello"
s.upper()                # "HELLO" — new string, s unchanged
s[0] = 'H'               # TypeError: 'str' object does not support item assignment

# Mutable: list, dict, set, bytearray, most user classes
lst = [1, 2, 3]
lst.append(4)            # mutates in place
lst[0] = 99              # mutates in place

# Only immutables are hashable, so:
d = {(1, 2): 'tuple-key works'}        # ✓
d = {[1, 2]: 'list-key fails'}         # TypeError: unhashable type`}</Code>
            <H2 num="◇ EQ">`is` vs `==`: identity vs equality</H2>
            <Code id="is-eq">{`# == asks: do these have the same value? (calls __eq__)
[1, 2] == [1, 2]         # True  (same contents)
"hello" == "hello"        # True

# is asks: are these the same object in memory? (compares id())
[1, 2] is [1, 2]         # False (two distinct list objects, same value)
a = b = [1, 2]
a is b                    # True (same object)

# When to use 'is':
x is None                # ✓ canonical — None is a singleton
x is True / is False      # ✓ but rare; usually you want truthiness check
x is some_sentinel       # ✓ for unique-marker objects

# NEVER:
x is 1                    # implementation-defined; CPython caches small ints, others don't
name is "Ada"            # SyntaxWarning in 3.8+ — don't do this`}</Code>
            <Callout kind="warn" title="PEP 8 RULE">
              For None checks, always: <Kbd>if x is None:</Kbd>. Not <Kbd>if x == None:</Kbd>. Faster, clearer, and avoids __eq__ overrides that could lie.
            </Callout>
            <H2 num="◇ TRUTHY">Truthy and falsy</H2>
            <P>An object is falsy if it overrides <Kbd>__bool__</Kbd> to return False, or <Kbd>__len__</Kbd> to return 0. Otherwise truthy.</P>
            <Code id="truthy">{`# The falsy set (memorize once)
False                    # the boolean
None                     # the singleton
0   0.0   0j   0n        # numeric zeros
""   b""                 # empty strings
[]   ()   {}   set()     # empty containers
range(0)                 # empty range

# Idiomatic usage
if not items:            # cleaner than "if len(items) == 0"
    return

# Gotcha: distinguish None from empty
if x is None:            # specifically the singleton
    ...
if not x:                # ALSO triggers for [], 0, "", etc — be careful`}</Code>
            <H2 num="◇ NUMS">Numbers — Python's killer feature</H2>
            <P>Python integers have <strong>arbitrary precision</strong>. No overflow. Compute factorial(10000) without thinking about it. (This alone justifies Python for many domains.)</P>
            <Code id="bignums">{`2 ** 1000
# 10715086071862673209484250490600018105614048117055336074437503...
# (302 digits, no overflow, no special library needed)

# But floats are IEEE 754 doubles
0.1 + 0.2 == 0.3         # False — same problem as every language
0.1 + 0.2                # 0.30000000000000004

# For decimal precision:
from decimal import Decimal
Decimal("0.1") + Decimal("0.2") == Decimal("0.3")    # True

# For rationals:
from fractions import Fraction
Fraction(1, 3) + Fraction(1, 6)   # Fraction(1, 2)`}</Code>
            <H2 num="◇ STR">Strings are immutable Unicode</H2>
            <Code id="strings">{`s = "héllo 🐍"
len(s)              # 7 (codepoints, not bytes)
s.encode('utf-8')   # b'h\\xc3\\xa9llo \\xf0\\x9f\\x90\\x8d' — 11 bytes
s[0]                # 'h'
s[-1]               # '🐍' (negative indexing)
s[:3]               # 'hél' (slicing)

# F-strings (3.6+)
name, age = "Ada", 30
f"{name} is {age}"           # 'Ada is 30'
f"{age = }"                  # 'age = 30' (debug style, 3.8+)
f"{value:.2f}"               # format spec — 2 decimal places
f"{value:>10}"               # right-aligned in 10-char field

# 3.14: t-strings (template strings — PEP 750)
# t"{user_input}" produces a Template object — for safe SQL, HTML, shell etc.`}</Code>
            {QUIZZES.bedrock.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ DEF">Defining functions</H2>
            <Code id="def-basics">{`# Positional + keyword args, default values, type hints
def greet(name: str, greeting: str = "Hello") -> str:
    return f"{greeting}, {name}!"

greet("Ada")                          # "Hello, Ada!"
greet("Ada", "Howdy")                 # "Howdy, Ada!"
greet(name="Ada", greeting="Hi")      # keyword args

# Multiple return values (actually a tuple)
def divmod_(a, b):
    return a // b, a % b              # returns (q, r)
q, r = divmod_(17, 5)                 # unpacking`}</Code>
            <H2 num="◇ TRAP">The mutable default argument trap</H2>
            <P>Python's most-cited gotcha. Default arguments are evaluated <strong>once</strong>, when the def runs. If the default is mutable (list/dict/set), the same object is shared across every call.</P>
            <Code id="mut-default">{`# THE BUG
def add_item(item, items=[]):
    items.append(item)
    return items

add_item(1)        # [1]
add_item(2)        # [1, 2]   ← items=[] from FIRST def-time still alive!
add_item(3)        # [1, 2, 3]

# THE FIX
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items`}</Code>
            <Callout kind="cite" title="DEEPER">Real Python: "Python's Mutable vs Immutable Types" + "Common Python Anti-Patterns." The list = None idiom is so common that ruff's B006 flag warns about mutable defaults automatically.</Callout>
            <H2 num="◇ STAR">*args and **kwargs</H2>
            <Code id="star">{`# *args collects extra positional args into a tuple
def sum_all(*nums):
    return sum(nums)
sum_all(1, 2, 3, 4)              # 10
sum_all()                        # 0

# **kwargs collects extra keyword args into a dict
def make_user(**fields):
    return fields
make_user(name="Ada", age=30)    # {'name': 'Ada', 'age': 30}

# Both together
def fn(required, *args, **kwargs):
    ...

# Unpacking at the CALL site (the other direction)
args = [1, 2, 3]
kwargs = {'sep': '-', 'end': '!\\n'}
print(*args, **kwargs)           # equivalent to print(1, 2, 3, sep='-', end='!\\n')`}</Code>
            <H2 num="◇ PARAMS">Positional-only and keyword-only</H2>
            <Code id="param-modes">{`# / marks 'must be positional', * marks 'must be keyword'
def f(pos_only, /, normal, *, kw_only):
    return pos_only, normal, kw_only

f(1, 2, kw_only=3)             # ok
f(1, normal=2, kw_only=3)      # ok
f(pos_only=1, normal=2, kw_only=3)   # TypeError — pos_only is positional-only
f(1, 2, 3)                     # TypeError — kw_only must be keyword`}</Code>
            <H2 num="◇ HINTS">Type hints (PEP 484)</H2>
            <P>Hints are <strong>not enforced</strong> at runtime — they're for tools (mypy, ty, IDEs). But libraries like Pydantic and dataclasses USE them.</P>
            {stackData?.functions && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.functions}</Callout>}
            <Code id="hints">{`from typing import Optional, Union, Callable, Iterator

# Pre-3.10 syntax
def find(items: list[int], target: int) -> Optional[int]:
    for i, x in enumerate(items):
        if x == target:
            return i
    return None

# 3.10+ syntax — | for unions, no typing import needed for built-ins
def find2(items: list[int], target: int) -> int | None:
    ...

# More complex
def apply(fn: Callable[[int, int], int], a: int, b: int) -> int:
    return fn(a, b)

def stream() -> Iterator[str]:
    yield "a"

# Run static check
# uv run mypy myfile.py         (or ty, ruff's type checker — in beta)`}</Code>
            <H2 num="◇ LAMBDA">Lambdas — limited but useful</H2>
            <Code id="lambda">{`square = lambda x: x ** 2
square(5)                       # 25

# Primarily used as inline callables
sorted(words, key=lambda w: len(w))                 # by length
sorted(users, key=lambda u: (u.role, u.name))       # by role then name
list(filter(lambda x: x > 0, nums))

# Limits: single expression only. No statements. Always prefer def for anything multi-line.`}</Code>
            <H2 num="◇ CLOSURE">Closures</H2>
            <Code id="closures">{`def make_counter():
    count = 0
    def inc():
        nonlocal count            # without this, can't rebind enclosing var
        count += 1
        return count
    return inc

c = make_counter()
c(), c(), c()                     # (1, 2, 3) — count persists in the closure`}</Code>
            <Callout kind="warn" title="LATE BINDING TRAP">
              <Kbd>{`fns = [lambda: i for i in range(3)]; [f() for f in fns]`}</Kbd> returns <Kbd>[2, 2, 2]</Kbd>, not [0, 1, 2]. The lambdas close over the variable `i`, which by call-time has reached its final value. Fix: bind early — <Kbd>{`lambda i=i: i`}</Kbd>.
            </Callout>
            <H2 num="◇ DEC">Decorators — Python's killer pattern</H2>
            <P>A decorator is a callable that takes a function and returns a (usually wrapped) function. <Kbd>@dec</Kbd> on a function is sugar for <Kbd>f = dec(f)</Kbd>.</P>
            <Code id="decorators">{`import functools, time

def timer(fn):
    @functools.wraps(fn)              # preserves fn.__name__, __doc__, etc.
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = fn(*args, **kwargs)
        wrapper.last_duration = time.perf_counter() - start
        return result
    return wrapper

@timer
def slow_thing(n):
    return sum(range(n))

slow_thing(10_000_000)
slow_thing.last_duration              # 0.182

# Built-in decorators worth knowing:
from functools import cache, lru_cache, partial

@cache                                # memoize, unbounded
def fib(n):
    return n if n < 2 else fib(n-1) + fib(n-2)
fib(100)                              # instant (without @cache: years)

@lru_cache(maxsize=1024)              # bounded memoization
def expensive_lookup(key): ...

# Stack decorators — apply bottom-up
@app.route("/users")
@require_auth
@log_calls
def list_users(): ...`}</Code>
            <H2 num="◇ FUNCTOOLS">functools — every Python dev's toolbox</H2>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { fn: '@cache', what: 'Memoize a function. Unbounded. Python 3.9+.' },
                { fn: '@lru_cache(maxsize=N)', what: 'Memoize with LRU eviction.' },
                { fn: 'functools.partial(fn, *args)', what: 'Pre-bind some args, return a new callable.' },
                { fn: 'functools.reduce(fn, iter, init)', what: 'Left-fold an iterable. Often a comprehension or sum() is clearer.' },
                { fn: '@functools.wraps(fn)', what: 'Copy fn.__name__/__doc__/etc onto the wrapper. Use in every decorator.' },
                { fn: '@singledispatch', what: 'Polymorphic by first-arg type — Python\'s answer to multiple dispatch.' },
                { fn: '@total_ordering', what: 'Define __eq__ + one comparison; get all six for free.' },
              ].map(f => (
                <div key={f.fn} className="border border-zinc-800 px-3 py-1.5">
                  <code className="text-emerald-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{f.fn}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{f.what}</div>
                </div>
              ))}
            </div>
            {QUIZZES.functions.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ FOUR">The four core containers</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { t: 'list', m: 'mutable', e: '[1, 2, 3]', use: "Ordered, indexable, growable. The default sequence. O(1) append, O(n) insert at front. Use deque for both ends." },
                { t: 'tuple', m: 'immutable, hashable', e: '(1, 2, 3) or 1, 2, 3', use: "Fixed records. Function multi-return. Dict keys when you need composite keys. Slightly less memory than lists." },
                { t: 'dict', m: 'mutable, ordered (3.7+)', e: '{"a": 1, "b": 2}', use: "Hash map. O(1) lookup, insertion, deletion. The most-used Python container after list. Insertion order is now part of the spec." },
                { t: 'set', m: 'mutable, unordered', e: '{1, 2, 3} or set()', use: "Unique elements. O(1) membership test. Set algebra: |, &, -, ^. frozenset is the immutable, hashable cousin." },
              ].map(c => (
                <div key={c.t} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <code className="text-emerald-300 text-[13px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.t}</code>
                    <span className="text-amber-300 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.m}</span>
                  </div>
                  <code className="text-zinc-400 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.e}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{c.use}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ SLICE">Slicing — every sequence</H2>
            <Code id="slicing">{`s = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

s[2:5]              # [2, 3, 4]   — start inclusive, stop exclusive
s[:3]               # [0, 1, 2]   — from start
s[7:]               # [7, 8, 9]   — to end
s[-3:]              # [7, 8, 9]   — negative indices count from end
s[::2]              # [0, 2, 4, 6, 8]   — step
s[::-1]             # [9, 8, ..., 0]    — reverse (works on strings too)
s[:]                # full copy

# Slicing produces a NEW object (for built-ins). Mutation on copy doesn't affect original.`}</Code>
            <H2 num="◇ COMP">Comprehensions — Python's superpower</H2>
            {stackData?.containers && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.containers || stackData.functions}</Callout>}
            <Code id="comprehensions">{`# List: [expr for x in iter if cond]
[x**2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]

# Set: braces, same syntax
{w.lower() for w in words if len(w) > 3}

# Dict: key: value
{user.id: user for user in users}
{k: v for k, v in pairs if v is not None}

# Generator: parens — LAZY, O(1) memory
sum(x*2 for x in massive_iterable)        # never builds a list

# Nested
matrix = [[i*j for j in range(5)] for i in range(5)]

# Multiple for-clauses (read like nested for-loops)
[(x, y) for x in range(3) for y in range(3) if x != y]`}</Code>
            <Callout kind="cite" title="WHY">
              List comprehensions are not just syntax sugar — CPython generates more efficient bytecode for them than the equivalent for-loop + .append(). Generator expressions add laziness on top. (Fluent Python, Ch. 2; docs.python.org/3/tutorial/datastructures)
            </Callout>
            <H2 num="◇ WALRUS">The walrus operator (PEP 572)</H2>
            <Code id="walrus">{`# := assigns AND returns the value, in an expression
# Use sparingly — readability cost is real

# Read a chunked stream
while (chunk := f.read(4096)):
    process(chunk)

# Avoid recomputing
if (n := len(items)) > 100:
    print(f"big collection: {n} items")

# In comprehensions — filter and reuse the computed value
[y for x in data if (y := expensive(x)) is not None]`}</Code>
            <H2 num="◇ COLLECTIONS">collections — battery-included containers</H2>
            <Code id="collections">{`from collections import Counter, defaultdict, deque, namedtuple, ChainMap

# Counter — count anything
votes = Counter(['A', 'B', 'A', 'A', 'C', 'B'])
votes.most_common(2)                  # [('A', 3), ('B', 2)]
Counter('mississippi')                # {'i': 4, 's': 4, 'p': 2, 'm': 1}

# defaultdict — auto-create missing keys via factory
groups = defaultdict(list)
for item in items:
    groups[item.category].append(item)   # no KeyError, no .setdefault()

# deque — O(1) push/pop on BOTH ends
recent = deque(maxlen=10)             # auto-evicts oldest
recent.append('new'); recent.appendleft('newest')

# namedtuple — quick lightweight record (often @dataclass is better now)
Point = namedtuple('Point', ['x', 'y'])
p = Point(3, 4)
p.x, p.y                              # 3, 4`}</Code>
            <H2 num="◇ ITERSEQ">Sequence operations</H2>
            <Code id="seq-ops">{`# enumerate — index + value
for i, item in enumerate(items, start=1):
    print(f"{i}. {item}")

# zip — parallel iteration (stops at shortest)
for name, age in zip(names, ages):
    ...
list(zip(*matrix))                    # transpose a matrix

# sorted — returns new list (sort() mutates)
sorted(users, key=lambda u: u.age, reverse=True)
sorted(users, key=lambda u: (u.role, u.name))   # multi-key sort

# any / all — short-circuit logical operators
all(x > 0 for x in nums)              # True if all positive
any(x is None for x in values)        # True if any is None

# reversed — iterator over reversed sequence
list(reversed([1, 2, 3]))             # [3, 2, 1]

# Modern dict merge (3.9+)
merged = a | b                         # {**a, **b} also works
a |= b                                 # in place

# range — lazy integer sequence
range(0, 100, 2)                      # 0, 2, 4, ..., 98 — generator-like`}</Code>
            <H2 num="◇ SPECIAL">bisect and heapq — when O(n) hurts</H2>
            <Code id="bisect-heap">{`# bisect — binary search in a sorted sequence (stdlib)
import bisect
sorted_list = [1, 4, 7, 10, 15]
bisect.insort(sorted_list, 8)         # inserts 8 in correct position, O(log n) find + O(n) shift
bisect.bisect_left(sorted_list, 7)    # index of leftmost 7

# heapq — priority queue
import heapq
h = []
heapq.heappush(h, (priority, task))
priority, task = heapq.heappop(h)     # smallest first (min-heap)
heapq.nlargest(5, iterable)           # top 5 efficiently`}</Code>
            {QUIZZES.containers.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ CLASS">Classes — the basic shape</H2>
            <Code id="class-basic">{`class User:
    # Class attribute — shared across instances
    species = "homo sapiens"

    def __init__(self, name: str, age: int):
        # Instance attributes — per object
        self.name = name
        self.age = age

    def greet(self) -> str:
        return f"Hi, I'm {self.name}"

u = User("Ada", 30)
u.greet()                  # "Hi, I'm Ada"
u.name                     # "Ada" — instance attr
u.species                  # "homo sapiens" — falls back to class attr
User.species               # access on class works too`}</Code>
            <P>
              <Kbd>self</Kbd> is just a convention — it's the instance, passed explicitly as the first arg. Python's <Kbd>obj.method(x)</Kbd> is sugar for <Kbd>ClassName.method(obj, x)</Kbd>.
            </P>
            <H2 num="◇ DATA-MODEL">The data model — dunders</H2>
            <P>
              Python builds language behavior on <Term>Dunder</Term> methods (double-underscore). Define them; the language wires them up. This is THE core idea separating Pythonic code from imperative-with-classes.
            </P>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { d: '__init__(self, ...)', what: 'Initialize a new instance. Called after __new__ creates it.' },
                { d: '__new__(cls, ...)', what: 'Actually create the instance. Rarely override (metaclasses, singletons, immutables).' },
                { d: '__repr__(self)', what: "Debug string. Ideally eval(repr(x)) == x. ALWAYS define this." },
                { d: '__str__(self)', what: "Human display. Falls back to __repr__ if absent." },
                { d: '__eq__(self, other)', what: 'Equality (==). If you define this, also define __hash__.' },
                { d: '__hash__(self)', what: 'Hash for set/dict keys. Default: identity hash. Set to None to make unhashable.' },
                { d: '__lt__ / __le__ / __gt__ / __ge__', what: 'Ordering. Or use @functools.total_ordering with __eq__ + __lt__.' },
                { d: '__len__(self)', what: 'Returns int. Called by len(). Also makes object truthy/falsy via emptiness.' },
                { d: '__iter__(self)', what: 'Return an iterator. Makes the object iterable (for-loop, *unpack).' },
                { d: '__getitem__(self, key)', what: 'obj[key] dispatch. Also lets old-style iteration work (Python tries 0, 1, 2... until IndexError).' },
                { d: '__contains__(self, item)', what: '`in` operator. Falls back to iteration if absent.' },
                { d: '__call__(self, ...)', what: 'Makes an instance callable: obj(x). Useful for callable configs/strategies.' },
                { d: '__enter__ / __exit__', what: 'Context manager protocol — the `with` statement.' },
                { d: '__add__ / __mul__ / ...', what: 'Operator overloading. obj + other → __add__. Right-hand: __radd__ for other + obj.' },
                { d: '__bool__(self)', what: 'Truthiness when not False/0/empty. Falls back to __len__.' },
              ].map(d => (
                <div key={d.d} className="border border-zinc-800 px-3 py-1.5">
                  <code className="text-emerald-300 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{d.d}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{d.what}</div>
                </div>
              ))}
            </div>
            <Callout kind="cite" title="THE BIBLE">
              docs.python.org/3/reference/datamodel — Chapter 3 of the language reference. The single most important Python doc on the internet. Read it once a year.
            </Callout>
            <H2 num="◇ PYTHONIC">A Pythonic class</H2>
            <Code id="pythonic-class">{`from functools import total_ordering

@total_ordering
class Vector:
    __slots__ = ('x', 'y')              # fixed attrs → smaller, faster

    def __init__(self, x: float, y: float):
        self.x, self.y = x, y

    def __repr__(self) -> str:
        return f"Vector({self.x}, {self.y})"

    def __eq__(self, other) -> bool:
        if not isinstance(other, Vector):
            return NotImplemented        # let Python try other.__eq__
        return (self.x, self.y) == (other.x, other.y)

    def __hash__(self) -> int:
        return hash((self.x, self.y))    # hashable from __slots__ tuple

    def __lt__(self, other) -> bool:
        return (self.x**2 + self.y**2) < (other.x**2 + other.y**2)

    def __add__(self, other):
        return Vector(self.x + other.x, self.y + other.y)

    def __abs__(self) -> float:
        return (self.x**2 + self.y**2) ** 0.5`}</Code>
            <H2 num="◇ DATACLASS">@dataclass — eliminate boilerplate (PEP 557)</H2>
            <Code id="dataclass">{`from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    age: int = 0
    tags: list[str] = field(default_factory=list)    # mutable defaults — use factory!

# Auto-generated: __init__, __repr__, __eq__
u = User("Ada", 30)
print(u)                          # User(name='Ada', age=30, tags=[])
u == User("Ada", 30)              # True

# Variants
@dataclass(frozen=True)           # immutable + hashable
class Point: x: int; y: int

@dataclass(slots=True)            # adds __slots__ — smaller, faster (3.10+)
class Item: ...

@dataclass(order=True)            # adds __lt__/__le__/__gt__/__ge__ from field order
class Priority: rank: int; name: str`}</Code>
            <H2 num="◇ PROP">@property — methods that look like attributes</H2>
            <Code id="property">{`class Circle:
    def __init__(self, radius: float):
        self._radius = radius

    @property
    def radius(self) -> float:
        return self._radius

    @radius.setter
    def radius(self, value: float):
        if value < 0:
            raise ValueError("radius must be non-negative")
        self._radius = value

    @property
    def area(self) -> float:             # computed — no setter
        return 3.14159 * self._radius ** 2

c = Circle(5)
c.radius                # 5 — looks like attribute access
c.area                  # 78.54 — computed on access
c.radius = -3           # ValueError`}</Code>
            <H2 num="◇ INHERIT">Inheritance, super(), MRO</H2>
            <Code id="inheritance">{`class Animal:
    def speak(self):
        return "..."

class Dog(Animal):
    def speak(self):
        return "woof"

class Puppy(Dog):
    def speak(self):
        parent = super().speak()         # calls Dog.speak — walks the MRO
        return parent + "!"

# Method Resolution Order for multiple inheritance — C3 linearization
class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass
D.__mro__
# (D, B, C, A, object) — left-to-right, depth-FIRST but consistent`}</Code>
            <Callout kind="cite" title="C3">docs.python.org/3/howto/mro — formal explanation. Most code only uses single inheritance + mixins; deep multi-inheritance trees are usually a smell.</Callout>
            <H2 num="◇ ABC">Abstract base classes</H2>
            <Code id="abc">{`from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def save(self, key: str, value: bytes) -> None: ...

    @abstractmethod
    def load(self, key: str) -> bytes: ...

class S3Storage(Storage):
    def save(self, key, value): ...      # must implement both
    def load(self, key): ...

Storage()           # TypeError: Can't instantiate abstract class`}</Code>
            <H2 num="◇ CM">Context managers</H2>
            <Code id="ctx-mgr">{`# The pattern: with-statement guarantees __exit__ runs even on exception
class Timer:
    def __enter__(self):
        import time; self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc_val, tb):
        self.duration = time.perf_counter() - self.start
        return False                      # don't suppress exceptions

with Timer() as t:
    do_work()
print(t.duration)

# Shortcut for simple cases:
from contextlib import contextmanager
@contextmanager
def opening(path):
    f = open(path)
    try:
        yield f
    finally:
        f.close()
`}</Code>
            {QUIZZES.classes.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ PROTO">The iterator protocol</H2>
            <P>An <Term>Iterable</Term> has <Kbd>__iter__</Kbd> returning an <Term>Iterator</Term>. An iterator has <Kbd>__next__</Kbd> returning the next value or raising <Kbd>StopIteration</Kbd>. Everything iterable in Python — lists, dicts, files, ranges, comprehensions, generators — implements this two-method protocol.</P>
            <Code id="iter-proto">{`# What 'for' actually does
for item in collection:
    process(item)

# Equivalent low-level:
it = iter(collection)        # calls collection.__iter__()
while True:
    try:
        item = next(it)      # calls it.__next__()
    except StopIteration:
        break
    process(item)`}</Code>
            <H2 num="◇ CUSTOM">Custom iterables</H2>
            <Code id="custom-iter">{`class Countdown:
    def __init__(self, n: int): self.n = n
    def __iter__(self):
        return CountdownIter(self.n)

class CountdownIter:
    def __init__(self, n: int): self.n = n
    def __iter__(self): return self
    def __next__(self):
        if self.n <= 0:
            raise StopIteration
        self.n -= 1
        return self.n + 1

for x in Countdown(3):
    print(x)                 # 3, 2, 1`}</Code>
            <H2 num="◇ GEN">Generators — iterators in disguise</H2>
            <P>A function with <Kbd>yield</Kbd> is a generator. Calling it returns a generator object (an iterator). The function body pauses at yield, resumes on <Kbd>next()</Kbd>.</P>
            <Code id="generators">{`def countdown(n):
    while n > 0:
        yield n
        n -= 1

g = countdown(3)
type(g)                       # <class 'generator'>
next(g)                       # 3
next(g)                       # 2
next(g)                       # 1
next(g)                       # raises StopIteration

# Direct rewrite of Countdown above — no boilerplate

# Generator EXPRESSIONS — same idea, comprehension syntax
g = (x*2 for x in range(1_000_000))     # O(1) memory
sum(g)                                  # consumes the generator

# Pipeline-style processing — chain generators
def lines_of(path):
    with open(path) as f:
        for line in f:
            yield line.rstrip()

def errors(lines):
    for l in lines:
        if 'ERROR' in l:
            yield l

count = sum(1 for _ in errors(lines_of('app.log')))    # stream a 10GB file in O(1) memory`}</Code>
            <H2 num="◇ YIELDFROM">yield from — delegation (PEP 380)</H2>
            <Code id="yield-from">{`def flatten(nested):
    for sublist in nested:
        yield from sublist              # equivalent to: for x in sublist: yield x

list(flatten([[1, 2], [3, 4], [5]]))    # [1, 2, 3, 4, 5]

# Compose generators
def chained(*iters):
    for it in iters:
        yield from it

# Tree traversal — natural recursion
def walk(node):
    yield node.value
    for child in node.children:
        yield from walk(child)`}</Code>
            <H2 num="◇ ITER-TOOLS">itertools — the iterator algebra</H2>
            <Code id="itertools">{`from itertools import chain, count, cycle, islice, takewhile, groupby, product, permutations, combinations, accumulate

# Infinite iterators (use islice or break to stop)
count(10, 2)                  # 10, 12, 14, 16, ...
cycle('ABC')                  # A, B, C, A, B, C, ...

# Slicing iterators
islice(infinite_iter, 0, 100)            # first 100
islice(huge_log, 1000, 2000)             # lines 1000-1999

# Conditional take/drop
takewhile(lambda x: x < 100, sorted_iter)    # while condition holds, then stop
dropwhile(lambda x: x.startswith('#'), lines)

# Grouping consecutive (input usually pre-sorted)
for key, group in groupby(sorted(logs, key=lambda l: l.level), key=lambda l: l.level):
    print(key, list(group))

# Combinatorics
list(product('AB', '12'))                # [('A','1'), ('A','2'), ('B','1'), ('B','2')]
list(permutations([1, 2, 3], 2))         # 6 ordered pairs
list(combinations([1, 2, 3], 2))         # 3 unordered pairs

# Cumulative
list(accumulate([1, 2, 3, 4]))           # [1, 3, 6, 10] — running sum`}</Code>
            <Callout kind="cite" title="DEEP DIVE">docs.python.org/3/library/itertools — also has 'Itertools Recipes' at the bottom: composable patterns like pairwise, partition, unique_everseen. Worth bookmarking.</Callout>
            {QUIZZES.iteration.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ GIL">The GIL — what it actually does</H2>
            <P>
              CPython has a <strong>Global Interpreter Lock</strong>. Only one thread executes Python bytecode at a time. It exists because CPython's reference counting isn't thread-safe — making it thread-safe would slow single-threaded code (the common case) substantially.
            </P>
            <P>This is NOT the same as 'Python can't do concurrency.' It means:</P>
            <div className="grid gap-2 my-3 text-[13px]">
              <div className="border border-emerald-400/30 bg-emerald-400/5 px-3 py-2">
                <div className="text-emerald-300 text-[12px] font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>✓ THREADS HELP FOR I/O</div>
                <div className="text-zinc-300 text-[12px]">Network calls, disk reads, subprocess waits — the GIL releases during these. Many threads CAN make many concurrent requests.</div>
              </div>
              <div className="border border-orange-400/30 bg-orange-400/5 px-3 py-2">
                <div className="text-orange-300 text-[12px] font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>✗ THREADS DON'T HELP FOR CPU</div>
                <div className="text-zinc-300 text-[12px]">Pure Python computation? 4 threads on 4 cores still runs serially. Use multiprocessing for true CPU parallelism.</div>
              </div>
              <div className="border border-amber-300/30 bg-amber-300/5 px-3 py-2">
                <div className="text-amber-300 text-[12px] font-bold mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>≈ C EXTENSIONS CAN RELEASE THE GIL</div>
                <div className="text-zinc-300 text-[12px]">numpy, scipy, pandas heavy ops release the GIL → real parallelism inside compiled code. That's why numpy-heavy code threads well despite Python.</div>
              </div>
            </div>
            <H2 num="◇ PEP703">PEP 703 — making the GIL optional</H2>
            <P>The most significant change to Python in 30 years. Status as of 3.14:</P>
            <Code id="pep703">{`# Phase 1 (Python 3.13, Oct 2024): experimental free-threaded build
#   Install via python.org installer (opt-in). Module ecosystem catching up.

# Phase 2 (Python 3.14+, Oct 2025): officially supported but optional
#   Stable C API for free-threaded. ~10% slowdown + 15-20% memory overhead.
#   Major packages (numpy, pandas) shipping no-GIL wheels.

# Phase 3 (likely 3.16+, 2027+): default build is free-threaded
#   GIL builds remain available for compat.

# Check what you're running
import sys
print(sys.flags)            # has 'no_gil' field in free-threaded builds`}</Code>
            <Callout kind="cite" title="WHY IT TOOK 30 YEARS">
              Removing the GIL needed: per-object locking for reference counts, biased reference counting, careful re-architecture of object layout. The performance regression (~10%) is the acceptable cost. PEP 703 is the proposal; CPython issues #110481 tracks implementation.
            </Callout>
            <H2 num="◇ MODELS">Three concurrency models</H2>
            {stackData?.async && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.async}</Callout>}
            <Code id="threading-io">{`# THREADING — for I/O concurrency (still useful despite GIL)
import threading

def fetch(url):
    return urllib.request.urlopen(url).read()

threads = [threading.Thread(target=fetch, args=(u,)) for u in urls]
for t in threads: t.start()
for t in threads: t.join()

# Or higher-level — almost always preferred:
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(max_workers=20) as ex:
    results = list(ex.map(fetch, urls))`}</Code>
            <Code id="multiprocessing">{`# MULTIPROCESSING — for CPU parallelism (separate processes, no shared GIL)
from concurrent.futures import ProcessPoolExecutor

def heavy_calc(n):
    return sum(i*i for i in range(n))   # pure Python, CPU-bound

with ProcessPoolExecutor() as ex:
    results = list(ex.map(heavy_calc, [10_000_000] * 8))
# Truly parallel across cores. Process startup is expensive; pool reuses workers.`}</Code>
            <H2 num="◇ ASYNCIO">asyncio — cooperative concurrency</H2>
            <P>Single-threaded, single-event-loop. Tasks voluntarily yield control with <Kbd>await</Kbd>. Massive concurrency for I/O — one thread handling thousands of connections. The modern default for I/O-bound Python.</P>
            <Code id="asyncio">{`import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()

async def main():
    async with aiohttp.ClientSession() as session:
        # gather — fire all coroutines, wait for all
        results = await asyncio.gather(*[fetch(session, u) for u in urls])
        return results

asyncio.run(main())

# Patterns
async def producer(q):
    for i in range(10):
        await q.put(i)

async def consumer(q):
    while True:
        item = await q.get()
        process(item)
        q.task_done()

async def pipeline():
    q = asyncio.Queue(maxsize=100)
    asyncio.create_task(producer(q))      # fire-and-track
    await asyncio.create_task(consumer(q))`}</Code>
            <H2 num="◇ CHOOSE">Choosing the right model</H2>
            <div className="border border-zinc-800 my-3">
              <div className="grid grid-cols-3 text-[11px] text-zinc-500 px-3 py-2 border-b border-zinc-800 uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <div>Workload</div><div>Tool</div><div>Why</div>
              </div>
              {[
                ['CPU-bound, pure Python', 'multiprocessing / ProcessPoolExecutor', 'Sidesteps GIL with separate processes'],
                ['CPU-bound with numpy/pandas', 'threads or joblib', 'Heavy ops release GIL → real parallelism'],
                ['10-100 I/O calls', 'ThreadPoolExecutor', "Simple, fits existing sync code"],
                ['1000+ concurrent I/O', 'asyncio + aiohttp', "Scales further than threads"],
                ['Mixed CPU + I/O service', 'asyncio + run_in_executor', 'Async event loop + thread pool for blocking calls'],
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 text-[12px] px-3 py-2 border-b border-zinc-900">
                  <div className="text-zinc-300">{row[0]}</div>
                  <div className="text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row[1]}</div>
                  <div className="text-zinc-400">{row[2]}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ SUB">Subinterpreters (PEP 684, 3.14)</H2>
            <P>New in 3.14: <Kbd>interpreters</Kbd> module — multiple Python interpreters within one process, each with its own GIL. Real parallelism without the multiprocessing overhead. Communication via channels. Still rough edges; one to watch.</P>
            <Code id="subinterp">{`# 3.14+
from concurrent import interpreters

interp = interpreters.create()
interp.exec("import math; result = math.factorial(20)")
result = interp.get("result")
interp.close()`}</Code>
            {QUIZZES.async.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIVE">Real CPython in your browser</H2>
            <P>
              The sandbox below loads <strong>Pyodide</strong> — CPython compiled to WebAssembly. The same interpreter from python.org, just running in your tab. First load fetches ~10 MB from the jsdelivr CDN; subsequent runs are instant.
            </P>
            <P>
              Six challenges progress from primitives to decorators. Each runs the real interpreter against tests. Free play mode lets you write any code — comprehensions, classes, generators, asyncio — and run it.
            </P>
            <Sandbox />
            <Callout kind="cite" title="HOW IT WORKS">
              Pyodide is a community project maintained by the Pyodide team. Used by JupyterLite, PyScript, Anaconda Mining tools. Supports most pure-Python packages plus numpy, pandas, scipy, matplotlib (pre-built WASM wheels). v0.29.4 is current. (pyodide.org)
            </Callout>
            <Callout kind="tip" title="EXPERIMENT IDEAS">
              In free play: try <Kbd>import this</Kbd>, <Kbd>{`[x*x for x in range(10)]`}</Kbd>, define a class with <Kbd>__repr__</Kbd>, write a generator. Pyodide ships numpy too — <Kbd>import numpy as np; np.array([1,2,3]).mean()</Kbd> works after a one-time package load.
            </Callout>
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ TRIAGE">When Python throws an error</H2>
            <P>Python's tracebacks are good. Read them <strong>bottom-up</strong>: the deepest frame is where the error fired, lines above are who called whom. The exception name + message at the bottom often tells you exactly what's wrong.</P>
            <P>This decision tree walks the most common errors to canonical fixes. For unfamiliar errors, web search the exact exception name + message — almost always lands on a Stack Overflow answer.</P>
            <Troubleshooter />
            <H2 num="◇ TOOLS">Debug toolkit</H2>
            <Code id="debug-tools">{`# 1. print(repr(x)) — shows types and quotes vs str() which can lie
print(repr(value))                    # 'False' (string) vs False (bool) becomes obvious

# 2. breakpoint() — drops into pdb (Python 3.7+)
def calculate(x):
    breakpoint()                       # interactive debugger here
    return x * 2
# pdb commands: n (next line), s (step into), c (continue),
#               l (list code), p var (print), pp var (pretty), q (quit)

# 3. Python Tutor — visual step-through (pythontutor.com)
#    Paste code, see frames + heap, click forward through each step.

# 4. cProfile — find slow spots
python -m cProfile -s cumulative script.py | head -30

# 5. timeit — microbenchmarks (built-in)
python -m timeit "[x*2 for x in range(1000)]"

# 6. logging > print for non-trivial scripts
import logging
logging.basicConfig(level=logging.DEBUG)
log = logging.getLogger(__name__)
log.debug("value: %r", x)`}</Code>
            <Callout kind="tip" title="THE BEST TRICK">
              <Kbd>python -i script.py</Kbd> — runs the script, then drops you into the REPL with all its variables still alive. You can inspect, poke, and test in the actual post-mortem state. Almost no one uses this; it's the highest-leverage debugging tool in Python.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-emerald-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>correct</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-amber-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{missed.length}</div>
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
                      <div className="text-zinc-100 mb-1">{q.q}</div>
                      <div className="text-emerald-300 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ READING">Recommended reading roadmap</H2>
            <P>
              For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1', plan: "Python Tutorial (docs.python.org/3/tutorial) — read every chapter, run every example. Set up uv + your editor. Build a small script end-to-end." },
                { wk: 'Week 2', plan: "Standard library tour. Skim docs.python.org/3/library table of contents. Deep-dive: collections, itertools, functools, pathlib, dataclasses, json, re, datetime." },
                { wk: 'Week 3', plan: "The data model — docs.python.org/3/reference/datamodel Chapter 3. Write a class with __init__, __repr__, __eq__, __hash__, __iter__. Use Python Tutor to visualize." },
                { wk: 'Week 4', plan: "Fluent Python (Ramalho) chapters 1-3, 7, 8, 10, 11. The book transforms intermediate → senior. Pair with PyVideo: Raymond Hettinger 'Transforming Code into Beautiful, Idiomatic Python'." },
                { wk: 'Week 5-6', plan: "Type hints, mypy or ty. Refactor an old script to add hints. Read PEP 484 + PEP 604." },
                { wk: 'Week 7-8', plan: "Concurrency. Read David Beazley's PyCon talks on the GIL + asyncio. Build something I/O heavy with asyncio + aiohttp." },
                { wk: 'Ongoing', plan: "Stack-specific deep dive. Real Python tutorials for tactical topics. PEPs (peps.python.org) for the WHY of language features. PyVideo for talks." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-emerald-400 pl-3 py-1">
                  <div className="text-emerald-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-emerald-300 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-amber-300 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-emerald-400 text-emerald-300 px-4 py-2 text-[13px] hover:bg-emerald-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-amber-300 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-orange-400 hover:text-orange-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              You've walked the data model, the iteration protocol, the concurrency split, the type system. Frameworks come and go. These don't. Open a Python codebase — any codebase — and you can read it now.
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
            <div className="text-emerald-400 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>π</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>PYTHON</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-rose-400/40 text-rose-300 px-2 py-1 text-[11px] hover:bg-rose-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-emerald-400 hover:text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-emerald-400 bg-emerald-400/10 text-emerald-300' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-emerald-400" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Section heading */}
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-emerald-400 text-emerald-300 bg-emerald-400/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-emerald-400 hover:text-emerald-300'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        {/* ARCH DIAGRAM — only on Bedrock chapter */}
        {activeSection === 2 && (
          <div className="mt-8 pt-6 border-t border-zinc-900">
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ◇ CPython under the hood
            </div>
            <ArchDiagram />
          </div>
        )}

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            π · python atlas · grounded in docs.python.org + PEPs + fluent python
          </div>
        </div>
      </main>
    </div>
  );
}
