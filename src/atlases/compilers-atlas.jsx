import { useState, useEffect, useRef } from 'react';
import {
  Compass, Cpu, GitBranch, Layers, Boxes, Zap, Wrench, BookOpen, Check,
  ChevronRight, ChevronLeft, Copy, X, Search, RotateCcw, Play, ArrowLeft,
  Quote, MousePointerClick, Loader2, Library, AlertTriangle, XCircle,
  Code2, FileCode, Binary, Workflow
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   COMPILERS ATLAS · DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "FORTRAN 1957, the Dragon Book, LLVM 2003, the 2026 landscape." },
  { id: 'pipeline', label: 'Pipeline', icon: Workflow, num: '02', sub: "Source → tokens → AST → IR → optimized IR → assembly → object → binary." },
  { id: 'lexer', label: 'Lexer', icon: FileCode, num: '03', sub: "Tokenization, regular expressions, finite automata, error recovery." },
  { id: 'parser', label: 'Parser', icon: GitBranch, num: '04', sub: "Grammars (CFG), recursive descent, LR/LALR, building the AST." },
  { id: 'semantic', label: 'Semantic', icon: Layers, num: '05', sub: "Type checking, symbol tables, scopes, name resolution." },
  { id: 'ir', label: 'IR (LLVM)', icon: Boxes, num: '06', sub: "SSA form, basic blocks, control flow graphs, reading LLVM IR." },
  { id: 'opt', label: 'Optimization', icon: Zap, num: '07', sub: "Dead code, constant folding, inlining, loop unrolling, vectorization." },
  { id: 'codegen', label: 'Codegen', icon: Cpu, num: '08', sub: "Register allocation, instruction selection, ISAs, calling conventions." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Annotated real LLVM IR samples and optimization deep dives." },
  { id: 'sandbox', label: 'Sandbox', icon: Code2, num: '10', sub: "Live toy compiler — see lexer → AST → IR → assembly. Plus real LLVM samples." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Debug compiler errors, optimization regressions, reading disassembly." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "Crafting Interpreters, Engineering a Compiler, Compiler Explorer, papers." },
];

const STACKS = [
  { id: 'app', label: 'App developer', desc: 'Want to understand what your compiler is doing to your code', icon: '◉' },
  { id: 'systems', label: 'Systems / kernel', desc: 'C, C++, performance-critical code where compiler choices matter', icon: '⧈' },
  { id: 'pl', label: 'PL theorist', desc: 'Designing languages, type systems, formal semantics', icon: 'λ' },
  { id: 'perf', label: 'Optimization / perf', desc: 'Profile-guided optimization, vectorization, codegen tuning', icon: '⚡' },
  { id: 'fundamentals', label: 'Just learn how compilers work', desc: 'Foundations — lexers, parsers, AST, IR, codegen', icon: '◧' },
];

const GLOSSARY = {
  Compiler: "Translates source code in one language to another language (usually machine code, sometimes bytecode or another high-level language). 'Compile time' is when the translation happens; 'runtime' is when the result runs.",
  Interpreter: "Executes source code directly without translating to machine code first. Slower than compiled code but more flexible. Python's CPython, Ruby's MRI, Node.js V8 (which actually JIT-compiles too).",
  JIT: "Just-In-Time compilation. Translates hot code paths to machine code at runtime. V8, JVM HotSpot, LuaJIT, .NET CLR. Combines interpreter flexibility with compiled performance.",
  AOT: "Ahead-Of-Time compilation. Translates to machine code before the program runs. C, C++, Rust, Go. Predictable performance, no warmup cost.",
  Frontend: "The part of a compiler that reads source code: lexer, parser, semantic analyzer. Produces an AST or IR. Clang is LLVM's C/C++/Objective-C frontend.",
  Backend: "The part of a compiler that generates machine code from IR: optimization passes, instruction selection, register allocation, codegen. LLVM's backend targets x86-64, ARM64, RISC-V, etc.",
  Lexer: "Also: tokenizer, scanner. Converts source text into a stream of tokens (keywords, identifiers, numbers, operators). Usually implemented as regex matching or hand-written character-by-character.",
  Token: "A meaningful unit of source code identified by the lexer. `int x = 42;` becomes tokens: INT_KEYWORD, IDENTIFIER(x), EQUALS, NUMBER(42), SEMICOLON.",
  Parser: "Reads tokens and builds an Abstract Syntax Tree (AST) according to grammar rules. Two main strategies: top-down (recursive descent, LL) or bottom-up (LR, LALR, used by yacc/bison).",
  AST: "Abstract Syntax Tree. Tree representation of the program's structure. Each node is a syntactic construct (function call, expression, statement). The compiler's primary data structure during early phases.",
  CFG: "Context-Free Grammar. Formal rules describing valid syntax. Written in BNF or EBNF notation. Parsers implement these grammars to recognize valid programs.",
  Grammar: "Rules that define what programs are syntactically valid. E.g., 'expression = term (+ term)*'. Different parser types support different grammar classes (LL(1), LR(1), LALR, etc).",
  "Recursive descent": "Top-down parsing technique where each grammar rule becomes a function. Mutually recursive functions parse subexpressions. Easy to write by hand. Most modern compilers (Clang, Rust, Go) use this.",
  Pratt: "A parsing technique for handling operator precedence elegantly. Each token has a binding power; the parser uses these to build expression trees. Used in TypeScript, V8, Crafting Interpreters.",
  "Symbol table": "Data structure mapping names (variables, functions) to their declarations. Scoped — nested tables for nested scopes. The compiler builds this during parsing or in a dedicated pass.",
  Scope: "Region of program text where a name is visible. Lexical scope (most languages) = scope is determined by source structure. Dynamic scope (rare, e.g., older Lisps) = scope is determined by call stack.",
  IR: "Intermediate Representation. A language between source and machine code. Easier to optimize than source (less structure) and easier to generate than machine code (target-independent). LLVM IR is the de-facto standard.",
  "LLVM IR": "LLVM's intermediate representation. Strongly typed, in SSA form, with explicit control flow via basic blocks. Three forms: human-readable .ll, binary bitcode .bc, in-memory C++ API. Same IR works for any LLVM target.",
  SSA: "Static Single Assignment form. Each variable is assigned exactly once. Repeated assignments become new versions (x1, x2, x3). Simplifies many optimizations dramatically. LLVM IR is in SSA.",
  Phi: "PHI node. SSA construct that selects a value based on which control flow path was taken. After 'if (c) { x1 = 5 } else { x2 = 7 }', a phi node 'x3 = phi(x1, x2)' merges them.",
  "Basic block": "A sequence of instructions with one entry (the first) and one exit (a branch or return). No internal branches. The unit of analysis for most optimizations. Functions are graphs of basic blocks (CFG).",
  CFG2: "Control Flow Graph. Nodes are basic blocks, edges are possible jumps. The compiler's view of program flow. Optimizations like dead code elimination, loop detection, vectorization operate on the CFG.",
  Pass: "An optimization or analysis step that runs on the IR. LLVM has hundreds: dead-code elimination, constant folding, inlining, loop unrolling, vectorization, etc. The 'pass pipeline' is the sequence run by clang -O2 / -O3.",
  Optimization: "Transformations that improve performance (or size) without changing observable behavior. Range from trivial (constant folding) to deep (auto-vectorization, polyhedral loop transformations).",
  "Dead code": "Code whose result is never used. Dead code elimination (DCE) removes it. Trivially: `int x = 5; return 0;` — x is dead. Deeply: entire functions, branches, even fields can be dead.",
  Inlining: "Replacing a function call with the function's body. Eliminates call overhead, enables further optimizations across the call boundary. Compilers decide based on size, profile data, attributes (LLVM's alwaysinline / noinline).",
  "Constant folding": "Computing constant expressions at compile time. `2 + 3 * 4` becomes `14`. Trivial but enables more optimizations downstream. Combined with constant propagation = constant propagation + folding.",
  Codegen: "Code generation. Translates IR into machine code for a specific architecture. Two main subphases: instruction selection (which machine instructions to use) and register allocation (which values live in which registers).",
  "Register allocation": "Assigning IR values (which assume unlimited variables) to a fixed number of CPU registers. NP-hard in general. Classical algorithm: graph coloring on the interference graph. LLVM uses 'greedy' allocator by default.",
  "Instruction selection": "Picking specific machine instructions to implement each IR operation. `add` could be add, lea, inc, etc. LLVM uses tablegen-defined patterns + SelectionDAG / GlobalISel.",
  ISA: "Instruction Set Architecture. The set of instructions a CPU understands. x86-64 (Intel/AMD), ARM64 (Apple Silicon, modern Android, AWS Graviton), RISC-V (open standard, growing fast).",
  ABI: "Application Binary Interface. Conventions for calling functions, passing arguments, return values, register usage at the machine-code level. System V ABI on Linux x86-64; Microsoft x64 calling convention on Windows.",
  "Calling convention": "Subset of the ABI: how arguments are passed (registers vs stack), which registers are caller-saved vs callee-saved, how return values come back. Mismatch = silent corruption or crashes.",
  Linker: "Combines object files (compiler output) into an executable. Resolves cross-file symbols. ld (GNU), ld.lld (LLVM, faster), gold (legacy fast linker). LLD is the modern default for many projects in 2026.",
  LTO: "Link Time Optimization. The linker re-runs optimizations across all object files together, enabling optimizations the compiler couldn't do per-file (cross-module inlining, more dead code elimination).",
  "Profile-guided": "PGO. Compile, run with profiling, recompile with profile data. Compiler optimizes hot paths more aggressively. Can yield 5-30% performance gains. Standard for high-performance C++ deployments.",
  Vectorization: "Generating SIMD instructions (SSE, AVX, NEON) to process multiple elements per instruction. Auto-vectorization happens at -O2 and above when the compiler can prove it's safe.",
  "Loop unrolling": "Duplicating loop body to reduce branch overhead and enable more optimization. `for (i=0; i<4; i++) a[i]=0` becomes `a[0]=0; a[1]=0; a[2]=0; a[3]=0`. Compilers do this automatically at -O2+.",
  Undefined: "Undefined Behavior (UB). C and C++ have many UB constructs (signed overflow, null deref, out-of-bounds, type punning via wrong cast). Compilers may assume UB doesn't happen, producing surprising optimizations.",
  LLVM: "Originally 'Low-Level Virtual Machine'. Modular compiler infrastructure project started by Chris Lattner in 2000 at UIUC, released 2003. Powers Clang, Rust, Swift, Julia, Zig, many others. Current: LLVM 22.1.6 (May 2026).",
  Clang: "LLVM's C/C++/Objective-C frontend. Drop-in replacement for gcc. Stricter standards conformance, better error messages, fast compile times. Default compiler on macOS and FreeBSD.",
  GCC: "GNU Compiler Collection. The original Linux compiler. Backends for many architectures. Mature, conservative, still default on most Linux distros. C++ frontend, Fortran, Ada, Go, D.",
  Godbolt: "Matt Godbolt's Compiler Explorer (godbolt.org). Web-based tool showing source → assembly side by side for hundreds of compilers + flags. The single best tool for understanding what compilers do.",
  Bytecode: "Intermediate code executed by a virtual machine. JVM bytecode, .NET CIL, Python .pyc, Lua bytecode. Slower than machine code but portable across platforms.",
  WebAssembly: "WASM. Portable bytecode designed for web browsers but increasingly used elsewhere. Compiled from C, C++, Rust, Go. Fast, sandboxed, near-native performance.",
  ELF: "Executable and Linkable Format. The binary format on Linux + BSD. Headers, sections, symbols, relocations. `readelf`, `objdump` tools inspect it.",
  "x86-64": "64-bit extension of x86. AMD64 / Intel 64 / EM64T are synonyms. 16 general-purpose registers, complex instruction set, dominant on servers and desktops. Calling convention varies by OS.",
  ARM64: "ARM 64-bit, also called AArch64. Apple Silicon (M1-M4), modern Android, AWS Graviton, Raspberry Pi 4+. 31 general-purpose registers, RISC-style instruction set, increasingly dominant.",
  "RISC-V": "Open-standard ISA, modular extensions. Free to implement. Growing fast in embedded + research + China. RISC-V International oversees the spec. Real silicon shipping at scale by 2026.",
  Tokenizer: "Same as lexer. Converts source text to tokens.",
  Bison: "GNU's parser generator (yacc clone). Generates LALR(1) parsers from grammar files. Used by GCC, PostgreSQL, Ruby's parser. Old, powerful, sharp edges. Most new languages skip it for hand-written recursive descent.",
  Flex: "Fast lexer generator. Generates C code from regex-based token definitions. Often paired with Bison. Modern lexers usually written by hand for better error messages.",
  Tree: "Parse tree (concrete) vs AST (abstract). Parse tree has every grammar symbol; AST drops syntactic noise like parens and keeps only semantically meaningful nodes.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "What's the historical significance of FORTRAN (1957)?",
      opts: [
        "First scripting language",
        "First widely-used high-level language with a real optimizing compiler. Proved compilers could produce code competitive with hand-written assembly — settling the debate.",
        "First language for the web"
      ],
      a: 1,
      x: "Before FORTRAN, programmers wrote assembly by hand. IBM's FORTRAN compiler (1957) generated machine code from algebraic expressions — and crucially, the optimizing compiler produced code as fast as hand-tuned assembly. This proved high-level languages were viable. Every compiler since stands on this foundation. The 'Dragon Book' (Aho, Sethi, Ullman, Lam) systematized the field starting in 1986."
    },
    {
      qid: 'o2',
      q: "What's the current LLVM version (May 2026)?",
      opts: [
        "LLVM 12 — that's been stable for a while",
        "LLVM 22.1.6 (released May 19, 2026). Major versions ship every ~6 months; LLVM 22 series began in 2026.",
        "LLVM hasn't been updated since 2020"
      ],
      a: 1,
      x: "LLVM follows a 6-month release cadence. LLVM 22.1.3 shipped April 7, 2026; LLVM 22.1.6 followed May 19, 2026 with bug fixes. The LLVM project includes Clang (C/C++ frontend), LLD (linker), LLDB (debugger), libc++, the Polly polyhedral optimizer, MLIR (multi-level IR), and more. Powers Rust, Swift, Julia, Zig — not just C/C++."
    },
    {
      qid: 'o3',
      q: "Why does LLVM use an Intermediate Representation instead of going directly from C to assembly?",
      opts: [
        "Historical accident",
        "IR is the abstraction that makes the architecture work: any LANGUAGE frontend can target the same IR; any target BACKEND can compile from the same IR. N frontends + M backends + 1 IR = N×M combinations from N+M components.",
        "Performance reasons"
      ],
      a: 1,
      x: "Without an IR, you'd need a dedicated path from each language to each target — Clang-to-x86, Clang-to-ARM, Rust-to-x86, Rust-to-ARM... O(N×M) work. With IR, each frontend lowers to LLVM IR; each backend compiles LLVM IR to its target. Adding a new language: write a frontend. Adding a new chip: write a backend. The optimization passes work on the IR — they're shared by ALL frontends and ALL backends. This is why LLVM dominates modern compiler infrastructure."
    },
  ],
  pipeline: [
    {
      qid: 'p1',
      q: "What's the correct order of compiler phases?",
      opts: [
        "Parser → Lexer → Codegen → Optimizer",
        "Lexer → Parser → Semantic analysis → IR generation → Optimization → Codegen → Assembler → Linker",
        "There's no fixed order — they run in parallel"
      ],
      a: 1,
      x: "Each phase consumes the output of the previous: text → tokens (lexer) → AST (parser) → typed AST (semantic) → IR (lowering) → optimized IR (passes) → assembly (codegen) → object file (assembler) → executable (linker). Modern compilers blur some boundaries (Clang's parser does some semantic analysis inline) but the conceptual pipeline is universal."
    },
  ],
  lexer: [
    {
      qid: 'l1',
      q: "Why use a lexer instead of having the parser work directly on characters?",
      opts: [
        "Parsers can't handle characters",
        "Separation of concerns. The lexer handles low-level details (whitespace, comments, multi-character operators) so the parser sees a clean token stream. Also: tokens are easier to match against grammar rules than characters.",
        "Performance — characters are slow"
      ],
      a: 1,
      x: "Parsers describe LANGUAGE STRUCTURE (expression = term '+' term). Lexers describe CHARACTER PATTERNS (identifier = [a-zA-Z_][a-zA-Z0-9_]*). Keeping these separate makes both simpler. Some compilers (especially for languages with simple syntax like Lisp) skip the lexer, but for languages with operator precedence + keywords + comments, having a lexer is much cleaner."
    },
  ],
  parser: [
    {
      qid: 'pa1',
      q: "What's the difference between top-down and bottom-up parsing?",
      opts: [
        "Naming convention only",
        "Top-down (LL, recursive descent) starts from the grammar's start symbol and recursively expands. Bottom-up (LR, LALR, yacc/bison) starts from tokens and builds up to the start symbol. Top-down is easier to write by hand; bottom-up handles more grammars but uses generators.",
        "They're identical"
      ],
      a: 1,
      x: "Recursive descent (top-down) writes one function per grammar rule, calling itself recursively. Easy to handwrite, easy to debug, easy to produce good error messages. Most modern compilers use this: Clang, Rust, Go, Swift. LR/LALR (bottom-up) uses a state machine generated from the grammar — handles more grammar classes but harder to debug + worse error messages. Used by GCC, PostgreSQL, Ruby."
    },
  ],
  ir: [
    {
      qid: 'i1',
      q: "What is SSA (Static Single Assignment) form?",
      opts: [
        "A type of variable",
        "An IR form where each variable is assigned EXACTLY ONCE. Repeated assignments become new versions (x1, x2, x3...). Simplifies data-flow analysis dramatically — the value of any variable is the single instruction that defines it.",
        "An old programming language"
      ],
      a: 1,
      x: "In source code, `x = 5; x = x + 1;` reassigns x. In SSA, this becomes `x1 = 5; x2 = x1 + 1;`. Each name has exactly one definition. Critical for optimization: if you want to know where x2 comes from, it's literally the line above — no need for data-flow analysis. LLVM IR is in SSA. Phi nodes handle merges from different control flow paths."
    },
    {
      qid: 'i2',
      q: "What's a basic block?",
      opts: [
        "A code formatting unit",
        "A sequence of instructions with EXACTLY ONE entry point (the first instruction) and ONE exit (the last, which is a branch, return, or call to a no-return function). No branches in the middle.",
        "A type of comment"
      ],
      a: 1,
      x: "Basic blocks are the units of analysis for most compiler optimizations. A function becomes a Control Flow Graph (CFG) — nodes are basic blocks, edges are possible jumps between them. Optimizations like dead code elimination, loop detection, vectorization all operate on the CFG. Understanding basic blocks is the key to reading LLVM IR — every `bb:` label starts a new one."
    },
  ],
  opt: [
    {
      qid: 'op1',
      q: "What's the practical difference between -O0, -O2, and -O3 in Clang?",
      opts: [
        "Just the optimization level number",
        "-O0: no optimization, fastest compile, easiest to debug. -O2: standard production level — most optimizations, no size/speed tradeoffs. -O3: aggressive — more inlining, vectorization, may bloat code. -Os: optimize for size.",
        "They're the same"
      ],
      a: 1,
      x: "-O0 is what you want for debugging — variables stay in memory, source-to-asm mapping is direct. -O2 is what production builds use — strong optimization without code bloat. -O3 is more aggressive (more inlining, more vectorization) — sometimes faster, sometimes slower (cache effects), always larger. Benchmark to know. -Os optimizes for code size (good for embedded). -Ofast adds non-strict math (breaks IEEE 754 compliance — be careful)."
    },
    {
      qid: 'op2',
      q: "What does dead code elimination actually remove?",
      opts: [
        "Comments",
        "Code whose result is provably never used. Trivially: `int x = 5; return 0;` removes the assignment. Deeply: entire functions if never called, entire branches if condition is constant, even fields of structs if never read.",
        "Old code marked deprecated"
      ],
      a: 1,
      x: "Dead Code Elimination (DCE) is one of the most important passes. Combined with constant folding + propagation, it can delete enormous amounts of code. `if (false) { ... 1000 lines ... }` collapses to nothing. `for (int i=0; i<10; i++) { /* unused side effect free */ }` disappears. The compiler can be surprisingly aggressive — this is why benchmarking unused values requires care (volatile, asm volatile, or DoNotOptimize-style helpers)."
    },
  ],
  codegen: [
    {
      qid: 'c1',
      q: "What does the register allocator solve?",
      opts: [
        "Memory bugs",
        "Mapping the IR's unlimited 'virtual registers' (variables in SSA form) onto the CPU's fixed set of physical registers. x86-64 has 16 GPRs; programs have thousands of values live at various points. Optimal allocation is NP-hard.",
        "Stack overflows"
      ],
      a: 1,
      x: "IR pretends you have infinite variables. The CPU has 16 GPRs on x86-64, 31 on ARM64. The register allocator decides which IR values live in registers vs spilled to the stack. Classical algorithm: graph coloring of the interference graph (two values 'interfere' if they're alive at the same time, can't share a register). LLVM uses 'greedy' allocator by default — fast, near-optimal for most code."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What's the highest-leverage compiler tool to learn in 2026?",
      opts: [
        "GDB",
        "Compiler Explorer (godbolt.org). Paste C/C++/Rust/etc., see real assembly output side-by-side from any compiler + any flag combination. The fastest way to develop intuition about what compilers actually do.",
        "vim"
      ],
      a: 1,
      x: "Matt Godbolt built godbolt.org around 2012 to answer 'what does this code actually compile to?' It now supports hundreds of compilers and configurations. Type code, see assembly, hover to highlight source-to-asm mapping. Try -O0 vs -O2, GCC vs Clang vs MSVC, x86-64 vs ARM64. This is the closest thing to a debugger for the compiler's mind."
    },
  ],
};

const COMPARISONS = {
  phases: {
    title: 'Compiler phases — what each does',
    headers: ['Phase', 'Input', 'Output', 'Example'],
    rows: [
      ['Lexer', 'Source text', 'Tokens', "'int x' → [INT_KW, IDENT(x)]"],
      ['Parser', 'Tokens', 'AST', "Tokens → tree of nested expressions"],
      ['Semantic', 'AST', 'Annotated AST', "Type checking, name resolution, scope analysis"],
      ['IR generation', 'Typed AST', 'IR (e.g., LLVM IR)', "AST → SSA form with explicit basic blocks"],
      ['Optimization', 'IR', 'Better IR', "DCE, inlining, constant folding, vectorization"],
      ['Codegen', 'IR', 'Assembly', "Instruction selection + register allocation"],
      ['Assembler', 'Assembly text', 'Object file (.o)', "Assembly text → machine code bytes + symbols"],
      ['Linker', 'Object files', 'Executable', "Resolves cross-file refs, applies relocations"],
    ],
  },
  parsers: {
    title: 'Parser techniques',
    headers: ['Technique', 'Strategy', 'Used by', 'Tradeoffs'],
    rows: [
      ['Recursive descent', 'Top-down, hand-written', 'Clang, Rust, Go, Swift, V8', "Easy to write, great error messages, can be slow on backtracking"],
      ['Pratt parsing', "Top-down, operator precedence", "V8, TypeScript, Crafting Interpreters", "Elegant for expressions with operator precedence"],
      ['LL(1)', "Top-down, table-driven", "Some hand-rolled, ANTLR (more powerful)", "Predictable, limited grammar class"],
      ['LR(1)', "Bottom-up, state machine", "yacc/bison output", "Handles more grammars, worse error messages"],
      ['LALR(1)', "Practical LR variant", "GCC, PostgreSQL, Ruby", "Most LR parsers in practice are LALR"],
      ['PEG', "Parsing Expression Grammar", "Pegjs, Pest (Rust)", "Unambiguous by construction, can be slow"],
    ],
  },
  opt_levels: {
    title: '-O0 / -O1 / -O2 / -O3 / -Os / -Oz / -Ofast',
    headers: ['Flag', 'Speed', 'Size', 'Debug', 'When to use'],
    rows: [
      ['-O0', 'Slowest', 'Largest', 'Best', 'Development. Variables in memory, direct source mapping.'],
      ['-O1', 'Some', 'Smaller', 'OK', "Rarely used — middle ground"],
      ['-O2', 'Fast', 'Moderate', 'OK', "PRODUCTION default. Most optimizations, no size/speed tradeoffs."],
      ['-O3', "Fastest (usually)", "Bigger", "Hard", "Aggressive: more inlining, vectorization. Sometimes slower due to cache effects."],
      ['-Os', "Slower", "Small", "OK", "Optimize for size. Embedded, mobile, code-size-constrained."],
      ['-Oz', "Slower", "Smallest", "OK", "Clang-only. Even more aggressive size minimization than -Os."],
      ['-Ofast', "Fastest", "Big", "Hard", "BREAKS IEEE 754 compliance (assumes no NaN/Inf). Numeric code only if you understand."],
    ],
  },
  isas: {
    title: 'Major instruction set architectures (2026)',
    headers: ['ISA', 'Registers', 'Type', 'Dominant in'],
    rows: [
      ['x86-64', "16 GPRs", "CISC", "Servers, desktops, gaming PCs (Intel/AMD)"],
      ['ARM64 / AArch64', "31 GPRs", "RISC", "Mobile, Apple Silicon (M-series), AWS Graviton, embedded"],
      ['RISC-V', "32 GPRs (RV64)", "RISC, open", "Embedded, growing in cloud + research. Open standard."],
      ['WebAssembly', "Stack-based", "Bytecode", "Browsers, edge (Cloudflare Workers, Fastly), portable compute"],
      ['CUDA PTX', "Many", "GPU", "NVIDIA GPUs. Compiled from CUDA C++ via NVCC + LLVM."],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "Hand-writing assembly when the compiler would do better", reason: "Modern compilers with -O2 / -O3 + PGO + LTO consistently beat hand-written assembly except in specialized cases (intrinsics for SIMD, hot-loop kernels). 'I know assembly so I'll write it myself' is usually wrong. Profile first; let the compiler do its job; reach for intrinsics or asm only when measurements demand it." },
  { name: "Ignoring -O0 vs -O2 differences in benchmarks", reason: "Benchmarking -O0 code is meaningless — variables stay in memory, no inlining, no vectorization. -O0 perf is 5-50x slower than -O2. Always benchmark optimized builds. Many 'C is slow' blog posts forgot -O2." },
  { name: "Triggering undefined behavior", reason: "C/C++ UB (signed overflow, null deref, out-of-bounds, strict aliasing violations) lets the compiler assume the UB doesn't happen, leading to surprising optimizations that 'delete your code.' Use UBSan (-fsanitize=undefined) to catch UB during testing." },
  { name: "Cargo-culting compiler flags", reason: "'-march=native -O3 -funroll-loops' looks aggressive but may make code SLOWER (cache misses from unrolling, non-portable binaries). Measure each flag. Default to -O2; add specific flags only when they help measurably." },
  { name: "Not using LTO when it would help", reason: "Link Time Optimization (-flto) lets the linker re-optimize across object files. 5-15% gains are common. Costs: slower link, higher memory. Worth enabling for production builds." },
  { name: "Writing code that defeats vectorization", reason: "Loops with data dependencies between iterations, function calls in the loop body, or aliased pointers can't be vectorized. Use restrict (C), -fopt-info-vec-missed (GCC), or check assembly to see what blocked it. SIMD intrinsics are the manual fallback." },
  { name: "Mistaking C for assembly", reason: "C is not 'portable assembly.' The compiler reorders, removes, merges, and transforms code aggressively. Operations that look atomic in C aren't (compiler may split them). Operations that look sequential may execute in any order (within as-if rules). Read assembly when this matters." },
  { name: "Inline asm for things compilers do better", reason: "Compilers handle integer math, register allocation, instruction selection better than humans for everything except specialized intrinsics. Inline asm = forfeits optimization across the boundary. Use _Generic / intrinsics / atomics / builtins before inline asm." },
  { name: "Treating warnings as optional", reason: "Compiler warnings catch real bugs — uninitialized variables, dead stores, type confusion, format string mismatches. Enable -Wall -Wextra -Werror in CI. The 'warnings as errors' policy catches more bugs than any other static check." },
  { name: "Not reading the disassembly when debugging perf", reason: "Performance bug? Inspect the assembly. godbolt.org makes this 30 seconds of work. Often reveals: the optimization you expected didn't happen, a bounds check you didn't expect is there, a function call you forgot exists. Reading asm is a learnable skill — start now." },
];

const COMMANDS = [
  { cmd: 'clang -S -emit-llvm foo.c -o foo.ll', desc: "Compile to LLVM IR (human-readable .ll). Add -O0 for unoptimized, -O2 for optimized IR." },
  { cmd: 'clang -S -O2 foo.c -o foo.s', desc: "Compile to assembly with -O2. Default target = host architecture. Add -masm=intel for Intel syntax." },
  { cmd: 'clang -O2 -mllvm -print-after-all foo.c', desc: "Print LLVM IR after each optimization pass. See exactly how the IR transforms." },
  { cmd: 'opt -O2 foo.ll -S -o foo-opt.ll', desc: "Run LLVM optimizer standalone on .ll file. opt is the optimization driver; clang invokes it internally." },
  { cmd: 'llc foo.ll -o foo.s', desc: "Run LLVM backend (codegen) standalone. llc is the IR → assembly driver." },
  { cmd: 'objdump -d -M intel binary', desc: "Disassemble a compiled binary. -d disassembles .text, -M intel uses Intel syntax instead of AT&T (which is unreadable)." },
  { cmd: 'godbolt.org', desc: "Compiler Explorer. Paste code, see assembly side-by-side. Hundreds of compilers + flags. The fastest way to understand compiler output." },
  { cmd: 'clang -Wall -Wextra -Werror -pedantic', desc: "All warnings as errors. The single highest-ROI flag combo for catching bugs. Standard for production C/C++." },
  { cmd: 'clang -fsanitize=address,undefined -O1 -g foo.c', desc: "AddressSanitizer + UBSan. Catches out-of-bounds, use-after-free, undefined behavior at runtime. Slower than production but 10-50x faster than valgrind." },
  { cmd: 'clang -fprofile-generate=./prof foo.c -o foo', desc: "Step 1 of PGO: compile with profiling. Run the binary on representative inputs to populate ./prof." },
  { cmd: 'clang -fprofile-use=./prof -O2 foo.c -o foo', desc: "Step 2 of PGO: recompile using profile data. Compiler optimizes hot paths more aggressively. 5-30% gains common." },
  { cmd: 'clang -flto -O2 foo.c bar.c -o app', desc: "Link Time Optimization. Linker re-runs optimizations across files. Catches cross-file inlining opportunities. 5-15% gains common." },
  { cmd: 'ld.lld', desc: "LLVM's linker. Significantly faster than GNU ld for large projects. Standard for many modern toolchains." },
  { cmd: 'nm binary | sort', desc: "List symbols in a binary or object file. T = text (code), B = uninitialized data, D = initialized data, U = undefined (needs linker). Sorted by address by default." },
  { cmd: 'readelf -a binary', desc: "Read ELF file structure. Headers, sections, symbols, relocations. -d for dynamic section (libraries needed)." },
  { cmd: 'perf stat ./binary', desc: "Linux performance counter stats — cycles, instructions, branch mispredicts, cache misses. The starting point for understanding performance." },
];

const RESOURCES = [
  { name: "Crafting Interpreters", url: 'craftinginterpreters.com (free online)', note: "Robert Nystrom's book — builds two complete interpreters from scratch (tree-walking, then bytecode). The single best introduction to language implementation. Free online, beautifully written.", kind: 'book' },
  { name: "Engineering a Compiler", url: 'amazon — Cooper and Torczon, 3rd ed 2023', note: "The modern Dragon Book. Comprehensive coverage of compiler theory + engineering. Updated for SSA-based IRs (the modern approach). The serious follow-up after Crafting Interpreters.", kind: 'book' },
  { name: "Dragon Book", url: 'amazon — Aho, Lam, Sethi, Ullman, 2nd ed 2006', note: "Compilers: Principles, Techniques, and Tools. The classic. Older but foundational. Best for parsing theory + classical optimization. Engineering a Compiler is more current.", kind: 'book' },
  { name: "Compiler Explorer", url: 'godbolt.org', note: "Matt Godbolt's online tool. Paste code, see assembly from any compiler + any flags. Click a source line, see corresponding assembly highlighted. Essential. Try it RIGHT NOW.", kind: 'tool' },
  { name: "LLVM Documentation", url: 'llvm.org/docs/', note: "Official docs. LangRef (IR reference), Programmer's Manual, Writing an LLVM Pass. Dense but authoritative. LLVM 22.x as of 2026.", kind: 'reference' },
  { name: "LLVM IR Reference (LangRef)", url: 'llvm.org/docs/LangRef.html', note: "Complete spec of LLVM IR. Every instruction, every type, every attribute. The single source of truth. Bookmark.", kind: 'spec' },
  { name: "Writing an LLVM Pass", url: 'llvm.org/docs/WritingAnLLVMPass.html', note: "Step-by-step guide to writing your own optimization pass. The 'Hello World' of LLVM development. Worth doing once to understand how passes work.", kind: 'tutorial' },
  { name: "Kaleidoscope tutorial", url: 'llvm.org/docs/tutorial/', note: "Build a toy language compiler using LLVM, chapter by chapter. Covers lexer, parser, IR generation, JIT execution. The official 'learn LLVM' path.", kind: 'tutorial' },
  { name: "Eli Bendersky's blog", url: 'eli.thegreenplace.net', note: "Deep, careful articles on compilers, LLVM, parsing, code generation. Years of accumulated wisdom. Search his archive when you have a specific question.", kind: 'reference' },
  { name: "What Every Programmer Should Know About Compilers", url: 'matt.sh — Matt Stancliff', note: "Practical guide to using compilers well — flags, optimizations, gotchas. Focused on day-to-day use, not theory.", kind: 'reference' },
  { name: "MLIR — Multi-Level IR", url: 'mlir.llvm.org', note: "LLVM's newer infrastructure for domain-specific compilers. Used by TensorFlow, IREE, CIRCT (hardware compilers). The future for ML compilers, hardware DSLs.", kind: 'reference' },
  { name: "Coursera — Compilers (Alex Aiken)", url: 'coursera.org/learn/compilers', note: "Stanford's compilers course. Free to audit. Builds a complete compiler for Cool (a small OO language). Excellent if you want a full course experience.", kind: 'tutorial' },
];

const PERSONALIZED = {
  app: {
    spark: "App dev: spend 30 minutes on godbolt.org with code you actually wrote. Try -O0 vs -O2. See what the compiler does to your function. This single exercise will change how you write performance-sensitive code.",
    pipeline: "App dev: you don't need to write a compiler, but understanding the pipeline helps debug weird behavior. 'Why is this -O2 build crashing but -O0 works?' usually means UB the optimizer assumed away.",
    ir: "App dev: read some real LLVM IR (the sandbox has 10 examples). You don't need to write IR, but recognizing it helps when compilers + tools talk about it. clang -S -emit-llvm any C file to see.",
    opt: "App dev: know what -O2 actually does. Inlining, constant folding, dead code elimination, vectorization. Then you'll write code that the compiler can optimize, not code that defeats it.",
    library: "App dev: focus on Compiler Explorer + reading disassembly. Skip writing your own parser unless it's a learning project.",
  },
  systems: {
    spark: "Systems dev: read assembly fluently. Use godbolt obsessively. Know your target ISAs (x86-64 + ARM64 in 2026). PGO + LTO for production. UBSan + AddressSanitizer in CI.",
    pipeline: "Systems dev: every C++ template instantiation is a compilation. Every optimization pass affects your hot paths. Learn the pipeline because YOU'LL be the one tuning -mtune and PGO flags.",
    ir: "Systems dev: LLVM IR is your friend. clang -S -emit-llvm shows what the optimizer sees BEFORE codegen. When -O2 produces weird assembly, the IR often explains why.",
    opt: "Systems dev: master -O2 vs -O3 tradeoffs. PGO. LTO. Sometimes -ffast-math (carefully). Sometimes __builtin_expect for branch hints. Always measure.",
    library: "Systems dev: assembly reading, LLVM IR samples, codegen patterns, perf tools (perf, vtune, instruments).",
  },
  pl: {
    spark: "PL theorist: Crafting Interpreters cover to cover. Then Engineering a Compiler. Then the LLVM Kaleidoscope tutorial. Build a small language. Most theory clicks when you've implemented it.",
    pipeline: "PL theorist: understand each phase deeply. Lexer + Parser → semantic analysis (type systems!) → IR (your design choices) → optimization (passes operate on IR shape). Each phase is a research area.",
    ir: "PL theorist: study LLVM IR's design decisions. SSA, basic blocks, phi nodes, the type system. Then study MLIR (multi-level IR) for newer design. Then read papers on continuations vs basic blocks.",
    opt: "PL theorist: each optimization is its own algorithm + correctness proof. SSA enables most modern optimizations. Loop optimizations (LICM, unrolling, vectorization) are deep subfields. Cooper + Torczon covers them.",
    library: "PL theorist: parser implementations (multiple techniques), AST design, IR design choices, optimization pass theory, type system literature.",
  },
  perf: {
    spark: "Perf engineer: profile EVERYTHING before optimizing. perf, vtune, instruments. Then dig into hot functions on godbolt.org. PGO + LTO are required for serious perf. Read Agner Fog's optimization manuals.",
    pipeline: "Perf engineer: codegen + register allocation matter most for hot loops. Vectorization is where the big wins live. Profile-guided optimization changes the inliner's decisions — huge gains on real workloads.",
    ir: "Perf engineer: LLVM IR shows what optimizations the compiler attempted. -mllvm -print-after-all dumps IR after each pass. When auto-vec fails, IR + diagnostics tell you why.",
    opt: "Perf engineer: this is your domain. -O3 vs -O2, PGO, LTO, march/mtune, SIMD intrinsics, branch hints. Measure everything. Read Agner Fog. Practice on real workloads.",
    library: "Perf engineer: optimization pass deep dives, codegen patterns, SIMD examples, perf tooling.",
  },
  fundamentals: {
    spark: "Foundations: Crafting Interpreters by Robert Nystrom. Free online. Build a complete interpreter from scratch — lexer, parser, AST, tree-walking interpreter, then a bytecode VM. Best starting point bar none.",
    pipeline: "Foundations: study the pipeline conceptually first. Don't try to learn LLVM details on day one. Lexer → parser → AST → IR → codegen. The sandbox shows live phase transitions.",
    ir: "Foundations: read 10 LLVM IR samples (curated in the sandbox). Don't write IR yet. Pattern-match: %1 = add i32 ..., br label %loop, etc. Build intuition before going deep.",
    opt: "Foundations: understand WHY optimizations matter — they're the difference between C-like performance and JavaScript-like performance for the same algorithm. Start with constant folding + dead code elimination.",
    library: "Foundations: lexer + parser + AST + LLVM IR primer. Skip codegen + advanced opt initially. Build the basic structure first.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's the compiler trouble?",
    opts: [
      { label: "🐛 Code works at -O0 but breaks at -O2", next: 'ub' },
      { label: "🐌 Auto-vectorization not happening", next: 'vec' },
      { label: "📏 Binary too big", next: 'size' },
      { label: "⏱ Compile times are unbearable", next: 'compile-time' },
      { label: "❓ How do I read this assembly?", next: 'read-asm' },
      { label: "🔬 Optimization regressed after compiler upgrade", next: 'regression' },
      { label: "🏃 Need to make hot loop faster", next: 'hot-loop' },
      { label: "📐 Want to learn — where do I start?", next: 'start-learning' },
    ],
  },
  ub: {
    fix: "Almost always undefined behavior. -O2 optimizer assumes UB doesn't happen and 'optimizes away' your code based on that assumption.",
    steps: [
      "Run with UBSan: clang -fsanitize=undefined -O1 -g your.c. Reports UB at runtime with file/line.",
      "Run with AddressSanitizer: clang -fsanitize=address -O1 -g your.c. Catches out-of-bounds, use-after-free, double-free.",
      "Common UB causes: signed integer overflow, null pointer dereference, out-of-bounds array access, strict aliasing violations, returning local pointer, uninitialized variable reads.",
      "Strict aliasing: type-punning via pointer cast is UB. Use memcpy (compiler optimizes it away when safe) or unions or __attribute__((may_alias)).",
      "Signed overflow: -fwrapv makes signed overflow wrap (defined behavior) at small perf cost. Or use unsigned types.",
      "Inspect generated IR: clang -O2 -S -emit-llvm your.c -o your.ll. See if the optimizer dropped code (look for missing operations).",
      "Compiler version regression? -fsanitize=undefined catches new UB exposed by smarter optimizers."
    ]
  },
  vec: {
    fix: "Compiler couldn't prove the loop is safe to vectorize. Find what's blocking it.",
    steps: [
      "Diagnose: clang -O2 -Rpass-analysis=loop-vectorize your.c. Reports WHY vectorization failed for each loop.",
      "Common blockers: function calls in loop body (compiler can't see inside), data dependencies between iterations, aliased pointers, irregular control flow.",
      "Pointer aliasing: use 'restrict' (C) or __restrict__ (C++) on function parameters to tell compiler pointers don't alias.",
      "Function calls: inline the function. Mark __attribute__((always_inline)) if needed. Compiler can't vectorize across opaque function calls.",
      "Reduction patterns (sum, max): use OpenMP simd pragma or std::reduce (C++17+) — compiler recognizes idioms.",
      "Loop structure: simple counted for loops vectorize easily. while loops with complex conditions don't. Refactor for the optimizer.",
      "Manual SIMD: when auto-vec fails, use intrinsics (immintrin.h for x86, arm_neon.h for ARM). The compiler still optimizes around them."
    ]
  },
  size: {
    fix: "Several common causes: inlining bloat, debug info, unused code, template instantiations.",
    steps: [
      "Try -Os (size) or -Oz (Clang's aggressive size). Disables size-increasing optimizations like aggressive inlining + unrolling.",
      "Strip symbols: strip ./binary. Removes debug info from release builds. (Keep debug build separately for debugging.)",
      "Enable LTO: -flto. Linker removes more dead code across files. Often shrinks binaries 10-20%.",
      "Section-based GC: -ffunction-sections -fdata-sections + linker -Wl,--gc-sections. Removes unused functions/data per file.",
      "C++ template bloat: instantiation explosion. Use explicit instantiation declarations + extern templates to share code across translation units.",
      "Static libs: replace with shared libs (.so / .dylib / .dll) if same code used by multiple binaries.",
      "Profile-guided size opt: PGO can shrink size by ~5% by removing rarely-executed code paths."
    ]
  },
  'compile-time': {
    fix: "C++ template instantiation is the usual culprit. Module systems and incremental builds help.",
    steps: [
      "Profile compilation: clang -ftime-trace generates JSON. View with chrome://tracing or speedscope.app. Shows which files / functions / templates take longest.",
      "Reduce includes: 'include what you use' (IWYU tool). Forward-declare instead of including. Use #pragma once.",
      "C++20 modules: 'import' instead of '#include'. Modules compile once, not per translation unit. Massive build time wins where supported.",
      "Precompiled headers (PCH): compile common headers once. Standard in big C++ codebases.",
      "Distributed builds: distcc, sccache, ccache. Cache compilation results. ccache is free; sccache works with cloud storage.",
      "Linker: switch to lld (LLVM's linker). Often 2-10x faster than GNU ld for large binaries.",
      "Parallel build: make -j$(nproc), ninja, bazel. Most build tools parallelize per-file compilation."
    ]
  },
  'read-asm': {
    fix: "Reading assembly is a learnable skill. Start with godbolt + small examples.",
    steps: [
      "Use godbolt.org. Paste code, see source-to-asm coloring. Hover a source line — corresponding asm highlighted. Best learning tool ever.",
      "Choose Intel syntax: dropdown in godbolt. AT&T syntax (default on Linux) is harder to read (operand order reversed).",
      "Common x86-64 instructions: mov (copy), add/sub/imul/idiv, cmp + jmp/je/jne/jl/jg (compare + branch), call/ret, push/pop, lea (compute address).",
      "Common ARM64: mov/add/sub/mul/sdiv, cmp + b.eq/b.ne, bl/ret, ldr/str (load/store). RISC-style, fewer addressing modes than x86.",
      "Function calls: arguments in registers (rdi, rsi, rdx, rcx, r8, r9 on Linux x86-64; x0-x7 on ARM64). Return value in rax / x0.",
      "Stack frames: rbp/rsp on x86-64. Functions allocate stack with sub rsp, N; restore with add rsp, N or pop rbp.",
      "Practice: start with C functions that compile to 5-10 asm instructions. Gradually go bigger. Match each asm line to source."
    ]
  },
  regression: {
    fix: "Compiler upgrades sometimes regress. Bisect, isolate, report.",
    steps: [
      "Confirm regression: compile + benchmark with both old + new compiler versions on same code. Note delta.",
      "Bisect optimizations: try -O1 with new compiler. If it works, the new -O2 has a regression. Try -O2 -fno-vectorize, -O2 -fno-inline, etc.",
      "Bisect LLVM versions: if regressing across LLVM major versions, can compile from source at git bisect points. Slow but conclusive.",
      "Check release notes: each Clang/LLVM release lists changes. Often a known regression is noted.",
      "Disable suspected pass: clang -mllvm -disable-PASS-NAME. See if perf returns.",
      "Profile the new code: maybe -O3 made it faster on some benchmarks but slower on yours (cache effects, code bloat).",
      "Report it: LLVM bug tracker (bugs.llvm.org / GitHub issues). Reduced test case + before/after asm = useful report."
    ]
  },
  'hot-loop': {
    fix: "Profile first. Then look at codegen. Then consider intrinsics, last resort.",
    steps: [
      "Profile: perf record + perf report. Find the actual hot function. Optimize ONLY that. Premature optimization is the root of much wasted time.",
      "Look at the assembly: godbolt.org or objdump -d. Is the loop vectorized? Are branches predicted? Are there unexpected function calls?",
      "PGO: profile-guided optimization. Compile -fprofile-generate, run benchmarks, compile -fprofile-use. Lets compiler optimize the actual hot path more aggressively.",
      "LTO: -flto. Cross-file inlining + dead code elimination.",
      "Algorithmic changes: usually bigger wins than codegen tuning. O(n²) → O(n log n) beats any micro-optimization. Profile to confirm.",
      "Branch hints: __builtin_expect(cond, expected) for unlikely branches. Or compile with PGO and skip the hints.",
      "SIMD intrinsics: when auto-vec fails. _mm_add_epi32 (SSE), _mm256_... (AVX), vaddq_s32 (NEON). Less portable, much more work. Last resort."
    ]
  },
  'start-learning': {
    fix: "Concrete plan: 3 months to compiler fluency. No prerequisites beyond C/C++ basics.",
    steps: [
      "Week 1-2: Crafting Interpreters by Robert Nystrom (craftinginterpreters.com). Free online. Build a tree-walking interpreter from scratch.",
      "Week 3-4: Crafting Interpreters Part II — bytecode VM. Now you've built two language implementations.",
      "Week 5-6: Spend 1 hour/day on godbolt.org. Take code you've written, see how it compiles. Try -O0 vs -O2. Read the assembly.",
      "Week 7-8: LLVM Kaleidoscope tutorial (llvm.org/docs/tutorial/). Build a simple language using LLVM. Now you understand frontend → IR → JIT.",
      "Week 9-10: Engineering a Compiler (Cooper + Torczon) chapters 1-7. Theory deepening. SSA, dataflow analysis, register allocation.",
      "Week 11-12: Write a small language end-to-end. Lexer + parser + AST + LLVM IR generation. Pick something simple (calculator, simple expression language).",
      "Beyond: read LLVM source. Write an LLVM pass. Contribute a bug fix. The field is wide open for serious learners in 2026."
    ]
  },
};

const ARCH_NODES = [
  { id: 'src', x: 130, y: 18, w: 70, h: 28, label: '.c source', color: '#a78bfa', desc: "C / C++ / Rust / Swift source. Plain text. The starting point." },
  { id: 'tok', x: 130, y: 58, w: 70, h: 28, label: 'tokens', color: '#a78bfa', desc: "Output of the lexer. Sequence of typed tokens (keywords, identifiers, numbers, operators)." },
  { id: 'ast', x: 130, y: 98, w: 70, h: 28, label: 'AST', color: '#a78bfa', desc: "Abstract Syntax Tree. Tree representation of program structure. Output of the parser." },
  { id: 'ir', x: 130, y: 138, w: 70, h: 28, label: 'LLVM IR', color: '#fbbf24', desc: "Intermediate Representation. SSA form, typed, target-independent. Where most optimizations operate." },
  { id: 'opt', x: 50, y: 138, w: 70, h: 28, label: 'opt passes', color: '#fbbf24', desc: "Optimization passes transform IR. DCE, inlining, constant folding, vectorization. -O2 runs ~150 passes by default." },
  { id: 'asm', x: 130, y: 178, w: 70, h: 28, label: '.s asm', color: '#fbbf24', desc: "Target-specific assembly. x86-64, ARM64, RISC-V, WASM. Output of LLVM backend (llc)." },
  { id: 'obj', x: 130, y: 218, w: 70, h: 28, label: '.o object', color: '#a78bfa', desc: "Machine code + relocation info. Output of the assembler. Not yet executable — needs linking." },
  { id: 'exe', x: 130, y: 258, w: 70, h: 28, label: 'executable', color: '#a78bfa', desc: "Final binary. Linker resolved all symbols, applied relocations. Ready to run." },
];

/* ─── Real LLVM IR samples (pre-computed from real clang output) ─── */
const REAL_LLVM_SAMPLES = [
  {
    id: 'hello',
    title: '01 · Hello, World',
    desc: "The classic. See how a 'simple' printf becomes a function call to puts (compiler optimization), with stack setup and ABI handling.",
    source: `#include <stdio.h>

int main(void) {
    printf("Hello, World!\\n");
    return 0;
}`,
    ir_O0: `@.str = private unnamed_addr constant [15 x i8] c"Hello, World!\\0A\\00", align 1

define dso_local i32 @main() #0 {
  %1 = alloca i32, align 4
  store i32 0, ptr %1, align 4
  %2 = call i32 (ptr, ...) @printf(ptr noundef @.str)
  ret i32 0
}

declare i32 @printf(ptr noundef, ...) #1`,
    ir_O2: `@str = private unnamed_addr constant [14 x i8] c"Hello, World!\\00", align 1

define dso_local i32 @main() local_unnamed_addr #0 {
  %1 = tail call i32 @puts(ptr nonnull dereferenceable(1) @str)
  ret i32 0
}

declare noundef i32 @puts(ptr nocapture noundef readonly) local_unnamed_addr #1`,
    asm_O2: `main:
    leaq    str(%rip), %rdi
    jmp     puts@PLT
str:
    .asciz  "Hello, World!"`,
    insight: "Watch -O2 transform printf → puts. The compiler PROVED printf with a constant string ending in \\n is equivalent to puts (with the \\n removed) — and puts is faster. Also note 'tail call' + jmp puts: the compiler turned the call into a jump, eliminating a stack frame entirely. Three lines of source → three lines of assembly."
  },
  {
    id: 'fib-recursive',
    title: '02 · Recursive Fibonacci',
    desc: "Classic recursive fib. See how the compiler can't eliminate exponential recursion — but does inline aggressively.",
    source: `int fib(int n) {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
}`,
    ir_O0: `define dso_local i32 @fib(i32 noundef %0) #0 {
  %2 = alloca i32, align 4
  %3 = alloca i32, align 4
  store i32 %0, ptr %3, align 4
  %4 = load i32, ptr %3, align 4
  %5 = icmp slt i32 %4, 2
  br i1 %5, label %6, label %8

6:
  %7 = load i32, ptr %3, align 4
  store i32 %7, ptr %2, align 4
  br label %15

8:
  %9 = load i32, ptr %3, align 4
  %10 = sub nsw i32 %9, 1
  %11 = call i32 @fib(i32 noundef %10)
  %12 = load i32, ptr %3, align 4
  %13 = sub nsw i32 %12, 2
  %14 = call i32 @fib(i32 noundef %13)
  %add = add nsw i32 %11, %14
  store i32 %add, ptr %2, align 4
  br label %15

15:
  %16 = load i32, ptr %2, align 4
  ret i32 %16
}`,
    ir_O2: `define dso_local i32 @fib(i32 noundef %0) local_unnamed_addr #0 {
  %2 = icmp slt i32 %0, 2
  br i1 %2, label %16, label %3

3:
  %4 = add nsw i32 %0, -1
  %5 = tail call i32 @fib(i32 noundef %4)
  %6 = icmp slt i32 %0, 3
  br i1 %6, label %16, label %7

7:
  %8 = add nsw i32 %0, -2
  %9 = tail call i32 @fib(i32 noundef %8)
  %10 = add nsw i32 %9, %5
  ret i32 %10

16:
  %.pn = phi i32 [ %0, %1 ], [ %5, %3 ]
  ret i32 %.pn
}`,
    asm_O2: `fib:
    cmpl    $2, %edi
    jl      .LBB0_4
    pushq   %rbx
    movl    %edi, %ebx
    addl    $-1, %edi
    callq   fib
    cmpl    $3, %ebx
    jl      .LBB0_3
    addl    $-2, %ebx
    movl    %ebx, %edi
    callq   fib
    addl    %eax, ...
    ret`,
    insight: "Recursive fib stays exponential — no algorithmic transformation. But look at how SSA cleaned up the IR: -O0 has 16 instructions with explicit stack allocs (alloca); -O2 has 10 instructions using only registers. Also note the PHI node merging two paths into one return. The optimizer can't fix algorithmic complexity but eliminates all the bookkeeping overhead."
  },
  {
    id: 'fib-iter',
    title: '03 · Iterative Fibonacci',
    desc: "Same algorithm, iterative version. Compiler can vectorize, unroll, and eliminate the loop overhead.",
    source: `int fib_iter(int n) {
    int a = 0, b = 1;
    for (int i = 0; i < n; i++) {
        int t = a + b;
        a = b;
        b = t;
    }
    return a;
}`,
    ir_O2: `define dso_local i32 @fib_iter(i32 noundef %0) local_unnamed_addr #0 {
  %2 = icmp sgt i32 %0, 0
  br i1 %2, label %3, label %10

3:
  %4 = phi i32 [ %7, %3 ], [ 0, %1 ]
  %5 = phi i32 [ %6, %3 ], [ 1, %1 ]
  %6 = add nsw i32 %4, %5
  %7 = phi i32 [ %5, %3 ]
  %8 = add nuw nsw i32 %iv, 1
  %9 = icmp eq i32 %8, %0
  br i1 %9, label %10, label %3

10:
  %.lcssa = phi i32 [ 0, %1 ], [ %7, %3 ]
  ret i32 %.lcssa
}`,
    asm_O2: `fib_iter:
    testl   %edi, %edi
    jle     .LBB1_3
    xorl    %eax, %eax
    movl    $1, %ecx
    xorl    %edx, %edx
.LBB1_2:
    leal    (%rcx,%rax), %esi
    addl    $1, %edx
    movl    %ecx, %eax
    movl    %esi, %ecx
    cmpl    %edi, %edx
    jl      .LBB1_2
.LBB1_3:
    ret`,
    insight: "The iterative version is dramatically smaller. Note: NO stack allocations — everything in registers (eax, ecx, edx, esi). The 'lea' instruction does add-without-flags in one cycle. The loop is just 5 instructions. This is why iterative > recursive for performance — not because recursion is inherently slow, but because iterative code maps perfectly to register-bound loops."
  },
  {
    id: 'sum-array',
    title: '04 · Sum array — AUTO-VECTORIZATION',
    desc: "Watch -O2 turn a simple loop into SIMD instructions processing 4 (SSE) or 8 (AVX) elements per cycle.",
    source: `int sum(int *arr, int n) {
    int total = 0;
    for (int i = 0; i < n; i++) {
        total += arr[i];
    }
    return total;
}`,
    ir_O2: `define dso_local i32 @sum(ptr nocapture noundef readonly %0, i32 noundef %1) {
  %3 = icmp sgt i32 %1, 0
  br i1 %3, label %4, label %22

; vector.body:
4:
  %vec.phi = phi <4 x i32> [ zeroinitializer, %.preheader ], [ %vec.add, %vector.body ]
  %wide.load = load <4 x i32>, ptr %ptr, align 4
  %vec.add = add <4 x i32> %wide.load, %vec.phi
  ...

; reduce vector to scalar:
%bin.rdx = call i32 @llvm.vector.reduce.add.v4i32(<4 x i32> %vec.add)`,
    asm_O2: `sum:
    testl   %esi, %esi
    jle     .Lzero
    movl    %esi, %eax
    xorl    %edx, %edx
    pxor    %xmm0, %xmm0
.Lvector_loop:
    movdqu  (%rdi,%rdx,4), %xmm1     ; load 4 ints
    paddd   %xmm1, %xmm0             ; add 4 ints in parallel
    addq    $4, %rdx
    cmpq    %rax, %rdx
    jb      .Lvector_loop
    ; horizontal sum of xmm0 -> eax
    pshufd  $238, %xmm0, %xmm1
    paddd   %xmm0, %xmm1
    pshufd  $85, %xmm1, %xmm0
    paddd   %xmm1, %xmm0
    movd    %xmm0, %eax
    ret`,
    insight: "This is the magic of -O2. The C source has ONE add per iteration. The optimized assembly uses PADDD — packed add of 4 32-bit integers in parallel. The loop processes 4 elements per iteration. On AVX2 hardware, the compiler would emit VPADDD on 8 elements per cycle. This is THE optimization that makes C fast for numerical code. NOTE: only works when the compiler can prove the loop is safe — no aliasing, no side effects, regular structure."
  },
  {
    id: 'const-fold',
    title: '05 · Constant folding — compile-time evaluation',
    desc: "When all inputs are constants, the compiler evaluates the entire computation at compile time.",
    source: `int compute(void) {
    int a = 3;
    int b = 4;
    int c = a * a + b * b;
    return c;  // Pythagoras
}`,
    ir_O2: `define dso_local i32 @compute() local_unnamed_addr #0 {
  ret i32 25
}`,
    asm_O2: `compute:
    movl    $25, %eax
    ret`,
    insight: "The ENTIRE function — variable declarations, multiplications, addition — collapsed into 'return 25'. The compiler did all the math at COMPILE TIME. This is why benchmarks that compute on constants are meaningless — the compiler computes the answer once, not per iteration. To benchmark real computation, you need volatile inputs / outputs or DoNotOptimize-style helpers that defeat constant folding."
  },
  {
    id: 'dead-code',
    title: '06 · Dead code elimination',
    desc: "Code that has no observable effect is removed. The optimizer is aggressive here.",
    source: `int compute(int n) {
    int waste = 0;
    for (int i = 0; i < 1000; i++) {
        waste += i;
    }
    int real = n * 2 + 1;
    return real;
}`,
    ir_O2: `define dso_local i32 @compute(i32 noundef %0) local_unnamed_addr #0 {
  %2 = shl i32 %0, 1
  %3 = or i32 %2, 1
  ret i32 %3
}`,
    asm_O2: `compute:
    leal    1(%rdi,%rdi), %eax
    ret`,
    insight: "The 1000-iteration loop COMPLETELY VANISHED. The compiler proved that 'waste' is never read after the loop, so the loop has no observable effect. Then it folded n*2+1 into a single LEA instruction (Load Effective Address — computes n + n + 1 in one cycle using the addressing unit). 7 lines of C → 1 instruction of assembly. This is why microbenchmarking is hard — the compiler eliminates anything it can prove is wasted work."
  },
  {
    id: 'inline-trivial',
    title: '07 · Inlining — function call eliminated',
    desc: "Small functions get inlined at -O2. The call disappears, the body merges into the caller, and more optimizations can fire.",
    source: `static inline int square(int x) {
    return x * x;
}

int hypotenuse_squared(int a, int b) {
    return square(a) + square(b);
}`,
    ir_O2: `define dso_local i32 @hypotenuse_squared(i32 noundef %0, i32 noundef %1) {
  %3 = mul nsw i32 %0, %0
  %4 = mul nsw i32 %1, %1
  %5 = add nsw i32 %4, %3
  ret i32 %5
}`,
    asm_O2: `hypotenuse_squared:
    imull   %edi, %edi
    imull   %esi, %esi
    addl    %esi, %edi
    movl    %edi, %eax
    ret`,
    insight: "The 'square' function is GONE from the binary. Its body was inlined into hypotenuse_squared at both call sites. This is why C++'s heavy use of small inline helpers + templates doesn't (usually) cost performance — the compiler inlines them away. Note: 'static inline' is a strong hint. Without 'static', the compiler might keep an external definition just in case."
  },
  {
    id: 'switch-jump-table',
    title: '08 · Switch → jump table',
    desc: "Sequential case labels compile to a jump table — O(1) dispatch instead of O(n) comparisons.",
    source: `int dispatch(int op, int x) {
    switch (op) {
        case 0: return x;
        case 1: return x + 1;
        case 2: return x * 2;
        case 3: return x * x;
        case 4: return -x;
        default: return 0;
    }
}`,
    ir_O2: `define dso_local i32 @dispatch(i32 noundef %0, i32 noundef %1) {
  switch i32 %0, label %default [
    i32 0, label %case0
    i32 1, label %case1
    i32 2, label %case2
    i32 3, label %case3
    i32 4, label %case4
  ]
  ...
}`,
    asm_O2: `dispatch:
    cmpl    $4, %edi
    ja      .Ldefault
    movslq  %edi, %rax              ; index = op
    jmpq    *.LJTI(,%rax,8)         ; jump via table
.Ljt0: movl %esi, %eax              ; case 0: return x
       ret
.Ljt1: leal 1(%rsi), %eax            ; case 1: return x+1
       ret
.Ljt2: leal (%rsi,%rsi), %eax        ; case 2: return x*2
       ret
...`,
    insight: "Switch statements with dense case values become JUMP TABLES — a single indexed jmp instead of a sequence of compares. This is O(1) regardless of how many cases. The compiler decides based on case density: sparse cases get a binary search; dense cases get a jump table. This is why switch is often faster than if/else if chains for many cases."
  },
  {
    id: 'pointer-arith',
    title: '09 · Pointer arithmetic — LEA magic',
    desc: "Address calculation uses the LEA (Load Effective Address) instruction, which computes complex expressions in one cycle.",
    source: `int *get_element(int *arr, int row, int col, int cols) {
    return &arr[row * cols + col];
}`,
    ir_O2: `define dso_local ptr @get_element(ptr noundef %0, i32 noundef %1, i32 noundef %2, i32 noundef %3) {
  %5 = mul nsw i32 %1, %3
  %6 = add nsw i32 %5, %2
  %7 = sext i32 %6 to i64
  %8 = getelementptr inbounds i32, ptr %0, i64 %7
  ret ptr %8
}`,
    asm_O2: `get_element:
    movslq  %ecx, %rax              ; cols (sign extend)
    imull   %esi, %ecx              ; row * cols
    movslq  %ecx, %rcx
    addq    %rdx, %rcx              ; + col
    leaq    (%rdi,%rcx,4), %rax     ; arr + index*4
    ret`,
    insight: "The LEA instruction at the end does '%rdi + %rcx * 4' in ONE cycle. LEA is x86's secret weapon — uses the addressing unit (separate from the ALU) to compute base + index*scale + offset for free. Hot pointer arithmetic boils down to LEAs. The 'getelementptr' IR instruction (often called GEP) is LLVM's typed pointer arithmetic — preserves type info for the optimizer."
  },
  {
    id: 'loop-unroll',
    title: '10 · Loop unrolling',
    desc: "Small fixed loops get unrolled — the loop body is replicated, eliminating branches.",
    source: `void zero4(int *arr) {
    for (int i = 0; i < 4; i++) {
        arr[i] = 0;
    }
}`,
    ir_O2: `define dso_local void @zero4(ptr nocapture noundef writeonly %0) {
  store i32 0, ptr %0
  %2 = getelementptr inbounds i32, ptr %0, i64 1
  store i32 0, ptr %2
  %3 = getelementptr inbounds i32, ptr %0, i64 2
  store i32 0, ptr %3
  %4 = getelementptr inbounds i32, ptr %0, i64 3
  store i32 0, ptr %4
  ret void
}`,
    asm_O2: `zero4:
    pxor    %xmm0, %xmm0            ; xmm0 = [0,0,0,0]
    movups  %xmm0, (%rdi)           ; store all 4 zeros at once
    ret`,
    insight: "Two optimizations at once: loop unrolled (the for loop became 4 stores), then those 4 stores merged into ONE 128-bit SSE store. The compiler recognized the pattern: zeroing 4 consecutive ints = storing one zero'd XMM register. This is the kind of optimization that makes well-written C competitive with hand-tuned SIMD."
  },
];

const CHALLENGES = [
  { id: 'tokens', title: '01 · Tokenize', desc: "Type a simple expression and see the lexer break it into tokens." },
  { id: 'parse', title: '02 · Parse to AST', desc: "Watch the parser build an Abstract Syntax Tree from your expression." },
  { id: 'precedence', title: '03 · Operator precedence', desc: "Type 2 + 3 * 4. The parser must group multiplication before addition." },
  { id: 'ir', title: '04 · Generate IR', desc: "See SSA-form IR generated from your expression." },
  { id: 'asm', title: '05 · Codegen to assembly', desc: "Watch IR lower to toy assembly with register allocation." },
  { id: 'constfold', title: '06 · Constant folding', desc: "Type '2 + 3'. The optimizer should evaluate it at compile time." },
  { id: 'dce', title: '07 · Dead code elimination', desc: "Type 'int a = 5; int b = 10;' (semicolons separate statements). 'a' is never used — it should be eliminated." },
  { id: 'full', title: '08 · Full pipeline', desc: "Run a complete expression through all phases. Source → tokens → AST → IR → optimized IR → assembly." },
];

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'compileratlas:';
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
   THE TOY COMPILER — Real lexer + parser + IR + codegen
   For a C-like subset: int vars, arithmetic, assignment, return
   ═══════════════════════════════════════════════════════════════ */

/* ─── LEXER ─── */
const TOK = {
  INT: 'INT_KW', RETURN: 'RETURN_KW',
  IDENT: 'IDENT', NUMBER: 'NUMBER',
  PLUS: 'PLUS', MINUS: 'MINUS', STAR: 'STAR', SLASH: 'SLASH',
  ASSIGN: 'ASSIGN', SEMI: 'SEMI', LPAREN: 'LPAREN', RPAREN: 'RPAREN',
  EOF: 'EOF',
};

function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') { i++; continue; }

    if (c === '/' && src[i+1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
      continue;
    }

    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      if (word === 'int') tokens.push({ type: TOK.INT, value: 'int', pos: i });
      else if (word === 'return') tokens.push({ type: TOK.RETURN, value: 'return', pos: i });
      else tokens.push({ type: TOK.IDENT, value: word, pos: i });
      i = j;
      continue;
    }

    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      tokens.push({ type: TOK.NUMBER, value: parseInt(src.slice(i, j), 10), pos: i });
      i = j;
      continue;
    }

    if (c === '+') { tokens.push({ type: TOK.PLUS, value: '+', pos: i }); i++; continue; }
    if (c === '-') { tokens.push({ type: TOK.MINUS, value: '-', pos: i }); i++; continue; }
    if (c === '*') { tokens.push({ type: TOK.STAR, value: '*', pos: i }); i++; continue; }
    if (c === '/') { tokens.push({ type: TOK.SLASH, value: '/', pos: i }); i++; continue; }
    if (c === '=') { tokens.push({ type: TOK.ASSIGN, value: '=', pos: i }); i++; continue; }
    if (c === ';') { tokens.push({ type: TOK.SEMI, value: ';', pos: i }); i++; continue; }
    if (c === '(') { tokens.push({ type: TOK.LPAREN, value: '(', pos: i }); i++; continue; }
    if (c === ')') { tokens.push({ type: TOK.RPAREN, value: ')', pos: i }); i++; continue; }

    throw new Error(`Lexer error: unexpected character '${c}' at position ${i}`);
  }
  tokens.push({ type: TOK.EOF, value: null, pos: src.length });
  return tokens;
}

/* ─── PARSER (recursive descent, with operator precedence) ─── */
function parse(tokens) {
  let pos = 0;
  const peek = () => tokens[pos];
  const advance = () => tokens[pos++];
  const expect = (type) => {
    if (peek().type !== type) {
      throw new Error(`Parse error: expected ${type}, got ${peek().type} ('${peek().value}') at position ${peek().pos}`);
    }
    return advance();
  };

  /* primary := NUMBER | IDENT | '(' expr ')' */
  const parsePrimary = () => {
    const t = peek();
    if (t.type === TOK.NUMBER) { advance(); return { kind: 'Number', value: t.value }; }
    if (t.type === TOK.IDENT) { advance(); return { kind: 'Ident', name: t.value }; }
    if (t.type === TOK.LPAREN) {
      advance();
      const e = parseExpr();
      expect(TOK.RPAREN);
      return e;
    }
    if (t.type === TOK.MINUS) {
      advance();
      const e = parsePrimary();
      return { kind: 'Unary', op: '-', operand: e };
    }
    throw new Error(`Parse error: unexpected token ${t.type} ('${t.value}')`);
  };

  /* mul := primary (('*' | '/') primary)* */
  const parseMul = () => {
    let left = parsePrimary();
    while (peek().type === TOK.STAR || peek().type === TOK.SLASH) {
      const op = advance().value;
      const right = parsePrimary();
      left = { kind: 'Binary', op, left, right };
    }
    return left;
  };

  /* expr := mul (('+' | '-') mul)* */
  const parseExpr = () => {
    let left = parseMul();
    while (peek().type === TOK.PLUS || peek().type === TOK.MINUS) {
      const op = advance().value;
      const right = parseMul();
      left = { kind: 'Binary', op, left, right };
    }
    return left;
  };

  /* stmt := 'int' IDENT '=' expr ';'   (declaration)
           | IDENT '=' expr ';'         (assignment)
           | 'return' expr ';'          (return)
           | expr ';'                   (expression statement) */
  const parseStmt = () => {
    if (peek().type === TOK.INT) {
      advance();
      const name = expect(TOK.IDENT).value;
      expect(TOK.ASSIGN);
      const value = parseExpr();
      expect(TOK.SEMI);
      return { kind: 'Decl', name, value };
    }
    if (peek().type === TOK.RETURN) {
      advance();
      const value = parseExpr();
      expect(TOK.SEMI);
      return { kind: 'Return', value };
    }
    if (peek().type === TOK.IDENT && tokens[pos+1]?.type === TOK.ASSIGN) {
      const name = advance().value;
      advance(); // =
      const value = parseExpr();
      expect(TOK.SEMI);
      return { kind: 'Assign', name, value };
    }
    const value = parseExpr();
    expect(TOK.SEMI);
    return { kind: 'ExprStmt', value };
  };

  /* program := stmt+ */
  const stmts = [];
  while (peek().type !== TOK.EOF) {
    stmts.push(parseStmt());
  }
  return { kind: 'Program', stmts };
}

/* ─── IR GENERATOR (SSA-like — each value numbered uniquely) ─── */
function genIR(ast) {
  let ssaCounter = 1;
  const instrs = [];
  const symtab = {};   // name -> latest SSA id (e.g., 'x' -> '%5')

  const emit = (s) => { instrs.push(s); };
  const fresh = () => `%${ssaCounter++}`;

  const genExpr = (node) => {
    if (node.kind === 'Number') {
      const v = fresh();
      emit(`${v} = i32 ${node.value}`);
      return v;
    }
    if (node.kind === 'Ident') {
      if (!(node.name in symtab)) throw new Error(`Undefined variable '${node.name}'`);
      return symtab[node.name];
    }
    if (node.kind === 'Unary' && node.op === '-') {
      const operand = genExpr(node.operand);
      const v = fresh();
      emit(`${v} = sub i32 0, ${operand}`);
      return v;
    }
    if (node.kind === 'Binary') {
      const l = genExpr(node.left);
      const r = genExpr(node.right);
      const v = fresh();
      const opname = { '+': 'add', '-': 'sub', '*': 'mul', '/': 'sdiv' }[node.op];
      emit(`${v} = ${opname} i32 ${l}, ${r}`);
      return v;
    }
    throw new Error(`Unknown expr kind: ${node.kind}`);
  };

  const genStmt = (stmt) => {
    if (stmt.kind === 'Decl' || stmt.kind === 'Assign') {
      const v = genExpr(stmt.value);
      symtab[stmt.name] = v;   // record latest SSA value for this name
      return;
    }
    if (stmt.kind === 'Return') {
      const v = genExpr(stmt.value);
      emit(`ret i32 ${v}`);
      return;
    }
    if (stmt.kind === 'ExprStmt') {
      genExpr(stmt.value);   // result unused — DCE may delete it later
      return;
    }
    throw new Error(`Unknown stmt kind: ${stmt.kind}`);
  };

  for (const s of ast.stmts) genStmt(s);
  return { instrs, symtab };
}

/* ─── OPTIMIZER (constant folding + dead code elimination) ─── */
function optimize(ir) {
  let { instrs } = ir;

  // Pass 1: constant folding
  // Track which SSA names hold constants
  const consts = {}; // '%1' -> number
  const newInstrs = [];

  for (const line of instrs) {
    // matches:  %X = i32 NUMBER
    let m = line.match(/^(%\d+) = i32 (-?\d+)$/);
    if (m) {
      consts[m[1]] = parseInt(m[2], 10);
      newInstrs.push(line);
      continue;
    }

    // matches:  %X = (add|sub|mul|sdiv) i32 %A, %B   OR   %X = (add|sub|mul|sdiv) i32 0, %A
    m = line.match(/^(%\d+) = (add|sub|mul|sdiv) i32 (-?\d+|%\d+), (-?\d+|%\d+)$/);
    if (m) {
      const [, dst, op, l, r] = m;
      const lv = l.startsWith('%') ? consts[l] : parseInt(l, 10);
      const rv = r.startsWith('%') ? consts[r] : parseInt(r, 10);
      if (lv !== undefined && rv !== undefined) {
        // Both operands are constants — fold!
        let folded;
        if (op === 'add') folded = lv + rv;
        else if (op === 'sub') folded = lv - rv;
        else if (op === 'mul') folded = lv * rv;
        else if (op === 'sdiv') folded = rv !== 0 ? Math.trunc(lv / rv) : 0;
        consts[dst] = folded;
        newInstrs.push(`${dst} = i32 ${folded}     ; folded (was ${op} ${lv}, ${rv})`);
        continue;
      }
    }
    newInstrs.push(line);
  }

  // Pass 2: dead code elimination
  // Find all SSA names that are USED (in ret or as an operand)
  // Anything NOT used can be removed
  const used = new Set();
  for (const line of newInstrs) {
    // collect any %N that appears as an operand
    const m = line.match(/^ret i32 (%\d+)/);
    if (m) { used.add(m[1]); continue; }

    const m2 = line.match(/^(%\d+) = (add|sub|mul|sdiv) i32 (%\d+|-?\d+), (%\d+|-?\d+)/);
    if (m2) {
      if (m2[3].startsWith('%')) used.add(m2[3]);
      if (m2[4].startsWith('%')) used.add(m2[4]);
    }
  }
  // Iteratively propagate: if X is used and X = ... %Y, then Y is also used
  let changed = true;
  while (changed) {
    changed = false;
    for (const line of newInstrs) {
      const m = line.match(/^(%\d+) = (add|sub|mul|sdiv) i32 (%\d+|-?\d+), (%\d+|-?\d+)/);
      if (m && used.has(m[1])) {
        if (m[3].startsWith('%') && !used.has(m[3])) { used.add(m[3]); changed = true; }
        if (m[4].startsWith('%') && !used.has(m[4])) { used.add(m[4]); changed = true; }
      }
    }
  }

  // Keep only used instructions (and rets which have side effects)
  const optimized = [];
  for (const line of newInstrs) {
    if (line.startsWith('ret ')) { optimized.push(line); continue; }
    const m = line.match(/^(%\d+) =/);
    if (m && used.has(m[1])) {
      optimized.push(line);
    } else if (m) {
      optimized.push(`; eliminated dead: ${line.trim()}`);
    } else {
      optimized.push(line);
    }
  }

  return { instrs: optimized };
}

/* ─── ASSEMBLY GENERATOR (toy x86-64-ish) ─── */
function genAssembly(ir) {
  const lines = [];
  lines.push("main:");

  // Simple register allocator: ssa name -> register
  // We have 4 GPRs for the toy: rax, rbx, rcx, rdx
  const regs = ['rax', 'rbx', 'rcx', 'rdx'];
  const ssaToReg = {};
  let nextReg = 0;

  const assignReg = (ssa) => {
    if (ssaToReg[ssa]) return ssaToReg[ssa];
    const r = regs[nextReg % regs.length];
    nextReg++;
    ssaToReg[ssa] = r;
    return r;
  };

  for (const line of ir.instrs) {
    if (line.startsWith(';')) {
      lines.push(`    ${line}`);
      continue;
    }

    let m = line.match(/^(%\d+) = i32 (-?\d+)/);
    if (m) {
      const reg = assignReg(m[1]);
      lines.push(`    mov ${reg}, ${m[2]}        ; ${m[1]} = ${m[2]}`);
      continue;
    }

    m = line.match(/^(%\d+) = (add|sub|mul|sdiv) i32 (%\d+|-?\d+), (%\d+|-?\d+)/);
    if (m) {
      const [, dst, op, l, r] = m;
      const dstReg = assignReg(dst);
      const lRef = l.startsWith('%') ? ssaToReg[l] : l;
      const rRef = r.startsWith('%') ? ssaToReg[r] : r;

      if (op === 'add') {
        lines.push(`    mov ${dstReg}, ${lRef}`);
        lines.push(`    add ${dstReg}, ${rRef}        ; ${dst} = ${l} + ${r}`);
      } else if (op === 'sub') {
        lines.push(`    mov ${dstReg}, ${lRef}`);
        lines.push(`    sub ${dstReg}, ${rRef}        ; ${dst} = ${l} - ${r}`);
      } else if (op === 'mul') {
        lines.push(`    mov rax, ${lRef}`);
        lines.push(`    imul rax, ${rRef}        ; ${dst} = ${l} * ${r}`);
        if (dstReg !== 'rax') lines.push(`    mov ${dstReg}, rax`);
      } else if (op === 'sdiv') {
        lines.push(`    mov rax, ${lRef}`);
        lines.push(`    cqo`);
        lines.push(`    idiv ${rRef}                ; ${dst} = ${l} / ${r}`);
        if (dstReg !== 'rax') lines.push(`    mov ${dstReg}, rax`);
      }
      continue;
    }

    m = line.match(/^ret i32 (%\d+|-?\d+)/);
    if (m) {
      const v = m[1];
      const ref = v.startsWith('%') ? ssaToReg[v] : v;
      if (ref !== 'rax') lines.push(`    mov rax, ${ref}        ; return value`);
      lines.push(`    ret`);
    }
  }

  return lines.join('\n');
}

/* ─── COMPILE: full pipeline (returns all phases) ─── */
function compile(src) {
  const tokens = tokenize(src);
  const ast = parse(tokens);
  const ir = genIR(ast);
  const optimized = optimize(ir);
  const asm = genAssembly(optimized);
  return { tokens, ast, ir: ir.instrs, optimizedIR: optimized.instrs, asm };
}

/* Helper: pretty-print AST as indented tree */
function formatAST(node, indent = 0) {
  const pad = '  '.repeat(indent);
  if (!node) return '';
  if (node.kind === 'Program') {
    return node.stmts.map(s => formatAST(s, indent)).join('\n');
  }
  if (node.kind === 'Number') return `${pad}Number(${node.value})`;
  if (node.kind === 'Ident') return `${pad}Ident(${node.name})`;
  if (node.kind === 'Binary') {
    return `${pad}Binary(${node.op})\n${formatAST(node.left, indent + 1)}\n${formatAST(node.right, indent + 1)}`;
  }
  if (node.kind === 'Unary') {
    return `${pad}Unary(${node.op})\n${formatAST(node.operand, indent + 1)}`;
  }
  if (node.kind === 'Decl') {
    return `${pad}Decl(${node.name})\n${formatAST(node.value, indent + 1)}`;
  }
  if (node.kind === 'Assign') {
    return `${pad}Assign(${node.name})\n${formatAST(node.value, indent + 1)}`;
  }
  if (node.kind === 'Return') {
    return `${pad}Return\n${formatAST(node.value, indent + 1)}`;
  }
  if (node.kind === 'ExprStmt') {
    return `${pad}ExprStmt\n${formatAST(node.value, indent + 1)}`;
  }
  return `${pad}?${node.kind}`;
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function CompilersAtlas() {
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

  const Code = ({ children, id, lang = 'c' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-violet-400 transition-colors">
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
      info: { border: 'border-violet-400/40', bg: 'bg-violet-400/5', text: 'text-violet-300', label: 'NOTE' },
      warn: { border: 'border-red-400/50', bg: 'bg-red-400/5', text: 'text-red-300', label: 'GOTCHA' },
      tip: { border: 'border-amber-400/40', bg: 'bg-amber-400/5', text: 'text-amber-200', label: 'TIP' },
      you: { border: 'border-fuchsia-300/40', bg: 'bg-fuchsia-300/5', text: 'text-fuchsia-200', label: 'FOR YOUR STACK' },
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
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-violet-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-violet-400' : 'text-zinc-300'}`}
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-violet-400 border-violet-400' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-amber-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-violet-400 bg-violet-400/10 text-violet-300' :
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
        className="border-b border-dotted border-violet-400/60 text-violet-300 hover:text-violet-200 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-violet-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-violet-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* Compiler pipeline diagram — source ↓ ... ↓ executable */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap a stage · source ↓ tokens ↓ AST ↓ IR (+ opt) ↓ asm ↓ object ↓ exe
        </div>
        <svg viewBox="0 0 280 305" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="cparr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          <line x1="165" y1="46" x2="165" y2="58" stroke="#52525b" markerEnd="url(#cparr)" />
          <line x1="165" y1="86" x2="165" y2="98" stroke="#52525b" markerEnd="url(#cparr)" />
          <line x1="165" y1="126" x2="165" y2="138" stroke="#52525b" markerEnd="url(#cparr)" />
          <line x1="130" y1="152" x2="120" y2="152" stroke="#52525b" markerEnd="url(#cparr)" />
          <line x1="165" y1="166" x2="165" y2="178" stroke="#52525b" markerEnd="url(#cparr)" />
          <line x1="165" y1="206" x2="165" y2="218" stroke="#52525b" markerEnd="url(#cparr)" />
          <line x1="165" y1="246" x2="165" y2="258" stroke="#52525b" markerEnd="url(#cparr)" />
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
          <div className="mt-2 border border-violet-400/30 bg-violet-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-violet-400 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: live toy compiler + real LLVM samples ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('toy');  // 'toy' or 'real'
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];

    // Toy compiler state
    const [src, setSrc] = useState('int x = 2 + 3 * 4;\nreturn x;');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [showStage, setShowStage] = useState('all'); // 'tokens' | 'ast' | 'ir' | 'optimized' | 'asm' | 'all'

    // Real LLVM samples state
    const [sampleIdx, setSampleIdx] = useState(0);
    const [optLevel, setOptLevel] = useState('O2');  // 'O0' or 'O2'
    const sample = REAL_LLVM_SAMPLES[sampleIdx];

    const compileNow = () => {
      setError(null); setResult(null);
      try {
        const r = compile(src);
        setResult(r);
      } catch (e) {
        setError(e.message);
      }
    };

    // Compile on mount + when source changes (debounced)
    useEffect(() => {
      const t = setTimeout(() => {
        if (mode === 'toy') compileNow();
      }, 200);
      return () => clearTimeout(t);
    }, [src, mode]);

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>{mode === 'toy' ? 'TOY COMPILER · LIVE' : 'REAL LLVM SAMPLES'}</span>
            <span className="text-violet-400">●</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('toy')} className={`text-[10px] px-2 py-0.5 border ${mode === 'toy' ? 'border-violet-400 text-violet-400 bg-violet-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>toy compiler</button>
            <button onClick={() => setMode('real')} className={`text-[10px] px-2 py-0.5 border ${mode === 'real' ? 'border-violet-400 text-violet-400 bg-violet-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>real LLVM samples</button>
          </div>
        </div>

        {mode === 'toy' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => {
                  setChallengeIdx(i);
                  // Seed source for each challenge
                  const seeds = {
                    tokens: 'int x = 42;',
                    parse: 'return x + 1;',
                    precedence: 'return 2 + 3 * 4;',
                    ir: 'int a = 5; int b = a + 3; return b;',
                    asm: 'return 2 * 3 + 1;',
                    constfold: 'return 2 + 3 * 4;',
                    dce: 'int a = 5; int b = 10; return b;',
                    full: 'int x = 2 + 3 * 4;\nint y = x - 1;\nreturn y;',
                  };
                  setSrc(seeds[c.id] || src);
                }}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-violet-400 text-violet-400 bg-violet-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {challenge.title.split(' · ')[0]}
                </button>
              ))}
            </div>

            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[13px] text-zinc-300 leading-relaxed mb-2">{challenge.desc}</div>
              <textarea
                value={src}
                onChange={e => setSrc(e.target.value)}
                spellCheck={false}
                rows={4}
                className="w-full bg-black border border-zinc-800 text-zinc-100 p-3 text-[13px] outline-none focus:border-violet-400 leading-relaxed"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
                placeholder="// type C-like code here..."
              />
              <div className="text-[10px] text-zinc-600 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Supported: int decl, assignment, +/-/*//, parens, return, integer literals
              </div>
            </div>

            <div className="px-3 py-2 border-b border-zinc-800 flex flex-wrap gap-1">
              {['all', 'tokens', 'ast', 'ir', 'optimized', 'asm'].map(s => (
                <button key={s} onClick={() => setShowStage(s)}
                  className={`text-[10px] px-2 py-0.5 border ${showStage === s ? 'border-amber-400 text-amber-200 bg-amber-400/10' : 'border-zinc-700 text-zinc-500'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {s}
                </button>
              ))}
            </div>

            {error && (
              <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/30">
                <div className="text-[11px] uppercase tracking-[0.2em] text-red-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>COMPILE ERROR</div>
                <pre className="text-[12px] text-red-200 whitespace-pre-wrap" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{error}</pre>
              </div>
            )}

            {result && (
              <div className="divide-y divide-zinc-800">
                {(showStage === 'all' || showStage === 'tokens') && (
                  <div className="px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>① TOKENS (lexer output)</div>
                    <div className="flex flex-wrap gap-1">
                      {result.tokens.filter(t => t.type !== TOK.EOF).map((t, i) => (
                        <span key={i} className="bg-zinc-950 border border-zinc-800 px-1.5 py-0.5 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          <span className="text-amber-400">{t.type.replace('_KW', '').replace('IDENT', 'ID')}</span>
                          {t.value !== null && <span className="text-zinc-400">:{t.value}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(showStage === 'all' || showStage === 'ast') && (
                  <div className="px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>② AST (parser output)</div>
                    <pre className="text-[12px] text-zinc-200 leading-relaxed bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{formatAST(result.ast)}</pre>
                  </div>
                )}

                {(showStage === 'all' || showStage === 'ir') && (
                  <div className="px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400 mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>③ IR (SSA-form, unoptimized)</div>
                    <pre className="text-[12px] text-zinc-200 leading-relaxed bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{result.ir.join('\n')}</pre>
                  </div>
                )}

                {(showStage === 'all' || showStage === 'optimized') && (
                  <div className="px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>④ OPTIMIZED IR (constant folding + DCE)</div>
                    <pre className="text-[12px] text-zinc-200 leading-relaxed bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{result.optimizedIR.join('\n')}</pre>
                  </div>
                )}

                {(showStage === 'all' || showStage === 'asm') && (
                  <div className="px-3 py-2">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400 mb-1.5" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⑤ ASSEMBLY (x86-64-like, after register allocation)</div>
                    <pre className="text-[12px] text-zinc-200 leading-relaxed bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{result.asm}</pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {mode === 'real' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {REAL_LLVM_SAMPLES.map((s, i) => (
                <button key={s.id} onClick={() => setSampleIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === sampleIdx ? 'border-violet-400 text-violet-400 bg-violet-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {s.title.split(' · ')[0]}
                </button>
              ))}
            </div>

            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[14px] text-zinc-100 mb-1 font-medium" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{sample.title}</div>
              <div className="text-[13px] text-zinc-400 leading-relaxed">{sample.desc}</div>
            </div>

            {sample.ir_O0 && (
              <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>OPTIMIZATION:</span>
                {['O0', 'O2'].map(o => (
                  <button key={o} onClick={() => setOptLevel(o)}
                    className={`text-[11px] px-2 py-0.5 border ${optLevel === o ? 'border-amber-400 text-amber-200 bg-amber-400/10' : 'border-zinc-700 text-zinc-500'}`}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    -{o}
                  </button>
                ))}
                <span className="text-[10px] text-zinc-600 ml-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>(toggle to see optimization)</span>
              </div>
            )}

            <div className="divide-y divide-zinc-800">
              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>① C SOURCE</div>
                  <button onClick={() => copy(sample.source, 'src-' + sample.id)} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-violet-400">
                    {copied === 'src-' + sample.id ? <Check size={11} /> : <Copy size={11} />}
                    {copied === 'src-' + sample.id ? 'copied' : 'copy'}
                  </button>
                </div>
                <pre className="text-[12px] text-zinc-200 bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sample.source}</pre>
              </div>

              <div className="px-3 py-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-violet-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>② LLVM IR ({optLevel === 'O0' && sample.ir_O0 ? '-O0' : '-O2'})</div>
                  <button onClick={() => copy(optLevel === 'O0' && sample.ir_O0 ? sample.ir_O0 : sample.ir_O2, 'ir-' + sample.id)} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-violet-400">
                    {copied === 'ir-' + sample.id ? <Check size={11} /> : <Copy size={11} />}
                    {copied === 'ir-' + sample.id ? 'copied' : 'copy'}
                  </button>
                </div>
                <pre className="text-[11px] text-zinc-200 bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{optLevel === 'O0' && sample.ir_O0 ? sample.ir_O0 : sample.ir_O2}</pre>
              </div>

              {sample.asm_O2 && (
                <div className="px-3 py-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>③ x86-64 ASSEMBLY (-O2)</div>
                    <button onClick={() => copy(sample.asm_O2, 'asm-' + sample.id)} className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-amber-400">
                      {copied === 'asm-' + sample.id ? <Check size={11} /> : <Copy size={11} />}
                      {copied === 'asm-' + sample.id ? 'copied' : 'copy'}
                    </button>
                  </div>
                  <pre className="text-[11px] text-zinc-200 bg-zinc-950 border border-zinc-800 p-2 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{sample.asm_O2}</pre>
                </div>
              )}

              <div className="px-3 py-2 bg-violet-400/5">
                <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>INSIGHT</div>
                <div className="text-[13px] text-zinc-200 leading-relaxed">{sample.insight}</div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  /* ─── LIBRARY: real LLVM IR sample browser ─── */
  const LibraryViewer = () => {
    const [activeSample, setActiveSample] = useState(0);
    const [optLevel, setOptLevel] = useState('O2');
    const s = REAL_LLVM_SAMPLES[activeSample];
    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/20">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center gap-2 overflow-x-auto">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase shrink-0 pr-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Library size={12} className="inline mr-1" /> SAMPLES
          </div>
          {REAL_LLVM_SAMPLES.map((sample, i) => (
            <button key={sample.id} onClick={() => setActiveSample(i)}
              className={`text-[11px] px-2 py-1 border whitespace-nowrap shrink-0 ${
                activeSample === i ? 'border-violet-400 text-violet-400 bg-violet-400/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {sample.title.split(' · ')[0]}
            </button>
          ))}
        </div>
        <div className="p-3">
          <div className="text-zinc-100 text-[15px] font-medium mb-1" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{s.title}</div>
          <div className="text-zinc-400 text-[12px] mb-3 leading-relaxed">{s.desc}</div>

          <div className="border border-zinc-800 mb-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-900">
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>c source</span>
              <button onClick={() => copy(s.source, 'lib-src-' + s.id)} className="flex items-center gap-1.5 hover:text-violet-400 transition-colors">
                {copied === 'lib-src-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'lib-src-' + s.id ? 'copied' : 'copy'}
              </button>
            </div>
            <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed bg-zinc-950" style={{ fontFamily: 'JetBrains Mono, monospace' }}><code>{s.source}</code></pre>
          </div>

          {s.ir_O0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>OPT:</span>
              {['O0', 'O2'].map(o => (
                <button key={o} onClick={() => setOptLevel(o)}
                  className={`text-[11px] px-2 py-0.5 border ${optLevel === o ? 'border-amber-400 text-amber-200 bg-amber-400/10' : 'border-zinc-700 text-zinc-500'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>-{o}</button>
              ))}
            </div>
          )}

          <div className="border border-zinc-800 mb-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-900">
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>llvm ir ({optLevel === 'O0' && s.ir_O0 ? '-O0' : '-O2'})</span>
              <button onClick={() => copy(optLevel === 'O0' && s.ir_O0 ? s.ir_O0 : s.ir_O2, 'lib-ir-' + s.id)} className="flex items-center gap-1.5 hover:text-violet-400 transition-colors">
                {copied === 'lib-ir-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                {copied === 'lib-ir-' + s.id ? 'copied' : 'copy'}
              </button>
            </div>
            <pre className="px-3 py-2 text-[11px] text-zinc-200 overflow-x-auto leading-relaxed bg-zinc-950" style={{ fontFamily: 'JetBrains Mono, monospace' }}><code>{optLevel === 'O0' && s.ir_O0 ? s.ir_O0 : s.ir_O2}</code></pre>
          </div>

          {s.asm_O2 && (
            <div className="border border-zinc-800 mb-2">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-900">
                <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>x86-64 asm (-O2)</span>
                <button onClick={() => copy(s.asm_O2, 'lib-asm-' + s.id)} className="flex items-center gap-1.5 hover:text-amber-400 transition-colors">
                  {copied === 'lib-asm-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                  {copied === 'lib-asm-' + s.id ? 'copied' : 'copy'}
                </button>
              </div>
              <pre className="px-3 py-2 text-[11px] text-zinc-200 overflow-x-auto leading-relaxed bg-zinc-950" style={{ fontFamily: 'JetBrains Mono, monospace' }}><code>{s.asm_O2}</code></pre>
            </div>
          )}

          <div className="border border-violet-400/30 bg-violet-400/5 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.25em] text-violet-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>INSIGHT</div>
            <div className="text-[13px] text-zinc-200 leading-relaxed">{s.insight}</div>
          </div>
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
                  <span className={i === path.length - 1 ? 'text-violet-400' : ''}>{p}</span>
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
              <div className="border-l-2 border-violet-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-violet-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-violet-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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

  /* ─── Exports + modals ─── */
  const exportCheatsheet = () => {
    let md = "# Compilers Atlas — Cheatsheet\n\n";
    md += "## Compiler phases\n\n| Phase | Input | Output | Example |\n|---|---|---|---|\n";
    COMPARISONS.phases.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Optimization levels\n\n| Flag | Speed | Size | Debug | When |\n|---|---|---|---|---|\n";
    COMPARISONS.opt_levels.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} | ${r[4]} |\n`; });
    md += "\n## Commands\n\n```bash\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'compilers-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportSamples = () => {
    let md = "# Compilers Atlas — Real LLVM Samples\n\n";
    REAL_LLVM_SAMPLES.forEach(s => {
      md += `## ${s.title}\n\n${s.desc}\n\n### Source\n\`\`\`c\n${s.source}\n\`\`\`\n\n`;
      if (s.ir_O0) md += `### LLVM IR (-O0)\n\`\`\`\n${s.ir_O0}\n\`\`\`\n\n`;
      md += `### LLVM IR (-O2)\n\`\`\`\n${s.ir_O2}\n\`\`\`\n\n`;
      if (s.asm_O2) md += `### x86-64 Assembly (-O2)\n\`\`\`\n${s.asm_O2}\n\`\`\`\n\n`;
      md += `### Insight\n${s.insight}\n\n---\n\n`;
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'compilers-atlas-samples.md'; a.click();
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
      ...Object.keys(GLOSSARY).map(t => ({ kind: 'term', label: t, hint: GLOSSARY[t].slice(0, 80) + '...' })),
      ...COMMANDS.map(c => ({ kind: 'command', label: c.cmd, hint: c.desc, copy: c.cmd })),
      ...REAL_LLVM_SAMPLES.map(s => ({ kind: 'sample', label: s.title, hint: s.desc })),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-violet-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-violet-400" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Chapters, terms, commands, samples"
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
                  else if (item.kind === 'sample') { setActiveSection(9); setCmdOpen(false); }
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-zinc-900 border-b border-zinc-900 flex items-start gap-3">
                <span className={`text-[9px] uppercase tracking-wider mt-1 shrink-0 w-16 ${
                  item.kind === 'chapter' ? 'text-violet-400' :
                  item.kind === 'term' ? 'text-amber-400' :
                  item.kind === 'sample' ? 'text-fuchsia-300' : 'text-cyan-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-violet-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-violet-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-violet-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>λ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your compiler context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-violet-400 hover:bg-violet-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-violet-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 1957">FORTRAN proves compilers can win</H2>
            <P>
              Before 1957, programmers wrote assembly by hand. The debate was real: could a compiler ever produce code as fast as a skilled human? IBM's FORTRAN team, led by John Backus, answered yes — and changed everything. The FORTRAN compiler shipped with sophisticated optimizations from day one because the team knew that if they couldn't match hand-written assembly, no one would use it.
            </P>
            <P>
              The result: the first widely-used high-level language with a real optimizing compiler. Every compiler since stands on this foundation. The "Dragon Book" (Aho, Sethi, Ullman, Lam) systematized the field starting in 1986, codifying lexers, parsers, type checking, code generation as the discipline of compiler construction.
            </P>
            <H2 num="◇ 2003">LLVM splits the compiler in two</H2>
            <P>
              Chris Lattner started LLVM at UIUC in 2000 as a research project. Released 2003. The insight: a strongly-typed, target-independent <Term>IR</Term> means N frontends + M backends + 1 IR = N×M compilers from N+M components. Before LLVM, every compiler was a monolith. After LLVM, the architecture stuck.
            </P>
            <P>
              Today Clang (C/C++), Rust, Swift, Julia, Zig, and many more all share the same LLVM backend. Add a new chip — write one backend, all those languages compile to it. Add a new language — write one frontend, it inherits dozens of CPU architectures.
            </P>
            <Callout kind="cite" title="LLVM 22.1.6 — MAY 2026">
              Current stable LLVM is 22.1.6 (released May 19, 2026). The project ships major versions every ~6 months. LLVM 22 brought improvements to MLIR, better RISC-V support, faster compile times with rpmalloc on Windows, and continued progress on the Polly polyhedral optimizer. The Apache 2.0 license + LLVM Exceptions makes it usable in commercial products.
            </Callout>
            <H2 num="◇ WHY">Why IR matters more than the languages</H2>
            <P>
              The compiler architecture diagram below shows the conceptual flow. The middle of the pipeline — IR — is where the leverage lives. Optimization passes operate on IR, so improvements there benefit every language. The 150+ optimization passes that run at -O2 are why C, C++, Rust, Swift all perform similarly despite their wildly different surface syntax.
            </P>
            <ArchDiagram />
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ FLOW">Source to executable — eight phases</H2>
            <P>
              Every C compiler — every compiler, really — passes source code through these phases. The names and exact boundaries differ between projects, but the conceptual flow is universal. Understanding it makes debugging compiler behavior tractable.
            </P>
            <ComparisonTable data={COMPARISONS.phases} />
            <H2 num="◇ EACH">What happens in each phase</H2>
            <P>
              <strong>Lexer:</strong> reads source text character by character and produces tokens. Tokens are typed (KEYWORD, IDENTIFIER, NUMBER, OPERATOR) and carry their text and source position. Whitespace and comments are usually dropped here.
            </P>
            <P>
              <strong>Parser:</strong> reads tokens according to grammar rules and builds an <Term>AST</Term>. The AST captures the program's structure (expressions, statements, declarations) without the syntactic noise.
            </P>
            <P>
              <strong>Semantic analysis:</strong> walks the AST checking that types match, names are defined, scopes are respected. This is where you get "undefined variable", "type mismatch", "no matching function" errors.
            </P>
            <P>
              <strong>IR generation:</strong> lowers the typed AST to <Term>LLVM IR</Term> (or whatever the compiler uses). The IR is closer to assembly than to source — explicit control flow, three-address operations, typed values.
            </P>
            <P>
              <strong>Optimization:</strong> hundreds of passes transform the IR. Dead code elimination, constant folding, inlining, loop optimizations, vectorization. The bulk of compile time for production builds.
            </P>
            <P>
              <strong>Code generation:</strong> the LLVM backend ("llc") lowers IR to target-specific machine instructions. Two big sub-problems: instruction selection (which CPU ops to use) and register allocation (mapping IR values to physical registers).
            </P>
            <P>
              <strong>Assembler:</strong> turns assembly text into a binary object file (.o on Linux, .obj on Windows). Symbols, relocations, sections.
            </P>
            <P>
              <strong>Linker:</strong> combines object files into an executable. Resolves cross-file symbol references, applies relocations, lays out the final binary. <Term>LLD</Term> is LLVM's linker, significantly faster than GNU ld for large binaries.
            </P>
            {stackData?.pipeline && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.pipeline}</Callout>}
            {QUIZZES.pipeline.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ TOKENIZE">Source text → token stream</H2>
            <P>
              The <Term>lexer</Term> (also: tokenizer, scanner) takes source text and produces a sequence of tokens. Each token has a type (KEYWORD, IDENT, NUMBER, OPERATOR) and may carry a value. The parser consumes this stream — it never sees raw characters.
            </P>
            <P>
              For <Kbd>int x = 42;</Kbd> the lexer produces: <Kbd>INT_KW</Kbd>, <Kbd>IDENT(x)</Kbd>, <Kbd>ASSIGN</Kbd>, <Kbd>NUMBER(42)</Kbd>, <Kbd>SEMI</Kbd>. The whitespace between tokens is dropped. Comments are dropped. The parser will work with this typed stream.
            </P>
            <Code id="lex-simple" lang="c">{`// Source
int sum(int x, int y) {
    return x + y;
}

// Tokens (lexer output)
INT_KW, IDENT(sum), LPAREN, INT_KW, IDENT(x), COMMA,
INT_KW, IDENT(y), RPAREN, LBRACE,
RETURN_KW, IDENT(x), PLUS, IDENT(y), SEMI,
RBRACE, EOF`}</Code>
            <H2 num="◇ REGEX">Implementing a lexer</H2>
            <P>
              Three main approaches: <strong>hand-written</strong> (a switch statement on the first character of each token), <strong>regex-based</strong> (each token type is a regex pattern, the lexer matches the longest prefix), or <strong>generator-based</strong> (flex/lex generates C code from a .l file). Modern compilers (Clang, Rust, Go, Swift) use hand-written lexers for better error messages and performance.
            </P>
            <Code id="lex-handwritten" lang="javascript">{`// Hand-written lexer (excerpt — see Sandbox for full implementation)
function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];

    // Skip whitespace
    if (c === ' ' || c === '\\t' || c === '\\n') { i++; continue; }

    // Identifier or keyword: [a-zA-Z_][a-zA-Z0-9_]*
    if (/[a-zA-Z_]/.test(c)) {
      let j = i;
      while (j < src.length && /[a-zA-Z0-9_]/.test(src[j])) j++;
      const word = src.slice(i, j);
      tokens.push(word === 'int' ? { type: 'INT_KW' } : { type: 'IDENT', value: word });
      i = j; continue;
    }

    // Number: [0-9]+
    if (/[0-9]/.test(c)) { /* ... */ }
    if (c === '+') { tokens.push({ type: 'PLUS' }); i++; continue; }
    // ... etc
  }
}`}</Code>
            <Callout kind="info" title="DFA THEORY">
              Lexers correspond to <strong>Deterministic Finite Automata (DFAs)</strong>. Each token pattern is a regular language; the lexer is a DFA that recognizes the union of all token patterns. flex/lex compiles regex patterns to a DFA state table. Hand-written lexers implement the same idea ad hoc — a switch on current character is just a DFA state transition.
            </Callout>
            <Callout kind="tip" title="ERROR RECOVERY">
              Real lexers must recover from errors gracefully. Skip the bad character, emit an error token with position info, continue. The parser then gets a stream that may contain errors but still has structure. Production compilers like Clang produce multiple errors per file — they don't stop at the first one.
            </Callout>
            {QUIZZES.lexer.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ AST">Tokens → tree</H2>
            <P>
              The <Term>parser</Term> reads the token stream and builds an Abstract Syntax Tree (<Term>AST</Term>). The AST is the compiler's primary data structure during the front end — every subsequent phase walks or transforms it. Each node is a syntactic construct: a function declaration, an expression, a statement.
            </P>
            <P>
              For <Kbd>2 + 3 * 4</Kbd> the parser builds <strong>(2 + (3 * 4))</strong> — multiplication binds tighter than addition. The parser must enforce operator precedence. Tap "operator precedence" in the Sandbox to see this happen live.
            </P>
            <ComparisonTable data={COMPARISONS.parsers} />
            <H2 num="◇ RD">Recursive descent — what modern compilers use</H2>
            <P>
              Most modern compilers (Clang, Rust, Go, Swift, V8) use hand-written <Term>recursive descent</Term> parsers. The technique: each grammar rule becomes a function. The functions call each other recursively to parse nested structures. Easy to write, easy to debug, easy to produce good error messages — the main reasons it beat parser generators for production use.
            </P>
            <Code id="parser-recdesc" lang="javascript">{`// Operator precedence via recursive descent
// expr := mul (('+' | '-') mul)*
// mul  := primary (('*' | '/') primary)*
// primary := NUMBER | IDENT | '(' expr ')'

function parseExpr() {
  let left = parseMul();
  while (peek().type === PLUS || peek().type === MINUS) {
    const op = advance().value;
    const right = parseMul();
    left = { kind: 'Binary', op, left, right };
  }
  return left;
}

function parseMul() {
  let left = parsePrimary();
  while (peek().type === STAR || peek().type === SLASH) {
    const op = advance().value;
    const right = parsePrimary();
    left = { kind: 'Binary', op, left, right };
  }
  return left;
}

// Precedence emerges from the call hierarchy:
// parseExpr calls parseMul, parseMul calls parsePrimary.
// '*' binds tighter than '+' because parseMul groups
// before parseExpr sees the result.`}</Code>
            <H2 num="◇ PRATT">Pratt parsing for richer expressions</H2>
            <P>
              When you have many operators with many precedence levels (think: C with ~15 levels), recursive descent gets tedious — you need a parse function per level. <Term>Pratt</Term> parsing handles this elegantly: each operator has a "binding power" (precedence number), and one expression-parsing function uses those numbers to decide associativity. Used by TypeScript, V8, Crafting Interpreters.
            </P>
            <Callout kind="info" title="LL vs LR">
              <strong>LL parsers</strong> (recursive descent, ANTLR) read input <strong>L</strong>eft-to-right, building a <strong>L</strong>eftmost derivation. <strong>LR parsers</strong> (yacc, bison) read <strong>L</strong>eft-to-right but build a <strong>R</strong>ightmost derivation. LR handles more grammars (e.g., left-recursion natively) but generates state machines that are hard to debug. The modern preference is LL recursive descent with good error messages over LR's power.
            </Callout>
            {QUIZZES.parser.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ TYPES">After parsing — semantic analysis</H2>
            <P>
              The AST tells you the program is syntactically valid. <strong>Semantic analysis</strong> checks that it's also <em>meaningful</em>. Three main jobs: type checking, name resolution (which declaration does each identifier refer to), and scope analysis (where is each name visible).
            </P>
            <P>
              This phase is where most user-facing errors come from. "Undefined variable", "type mismatch in assignment", "no matching function for call" — all surface here. A good semantic analyzer reports multiple errors per file, suggests fixes, and gives precise source locations.
            </P>
            <H2 num="◇ SYM">Symbol tables and scope</H2>
            <P>
              A <Term>symbol table</Term> maps names to their declarations. When the parser builds an AST node for <Kbd>x + 1</Kbd>, the analyzer must figure out which <Kbd>x</Kbd> that is — a local variable, a parameter, a global, a closure capture? Symbol tables answer that question.
            </P>
            <P>
              <Term>Scope</Term> is the region where a name is visible. Most languages use <strong>lexical scope</strong> — scope is determined by source structure, with nested blocks creating nested scopes. The symbol table is therefore a stack of scopes; lookup walks outward until it finds the name.
            </P>
            <Code id="symtab" lang="c">{`int x = 1;                  // global x

void f(int x) {              // parameter x shadows global
    int y = x + 1;           // y is local; x is the parameter
    if (y > 0) {
        int x = 5;           // inner x shadows parameter
        printf("%d\\n", x);   // prints 5
    }
    printf("%d\\n", x);       // prints the parameter
}

printf("%d\\n", x);            // prints 1 (global)`}</Code>
            <H2 num="◇ TYPECHECK">Type checking</H2>
            <P>
              In statically-typed languages (C, C++, Rust, Java), the analyzer assigns a type to every expression and checks that operations are valid. <Kbd>int + int</Kbd> is fine; <Kbd>int + pointer</Kbd> may need a conversion; <Kbd>struct + int</Kbd> is an error. The exact rules are the language's <em>type system</em>.
            </P>
            <Callout kind="info" title="TYPE INFERENCE">
              Modern languages (Rust, Swift, TypeScript, Haskell) infer types — you don't annotate every variable. The analyzer solves a constraint system: based on usage, what type must this variable have? The Hindley-Milner algorithm (1969, generalized 1978) is the foundation; modern implementations extend it with subtyping, generics, traits.
            </Callout>
            <Callout kind="dont" title="IGNORING WARNINGS">
              Compiler warnings often point to semantic issues the analyzer is unsure about — possible uninitialized use, type that doesn't quite match, dead code. <Kbd>-Wall -Wextra -Werror</Kbd> in CI catches more bugs than any other static check. Make warnings errors and fix them as they appear.
            </Callout>
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ LOWER">AST → IR — the descent into machine</H2>
            <P>
              After semantic analysis, the AST gets <strong>lowered</strong> to <Term>LLVM IR</Term>. The IR is closer to assembly: explicit control flow with branches, three-address operations, typed values, no nested expressions. This shift in representation is what enables the optimizer to do its work.
            </P>
            <P>
              <Kbd>int z = (a + b) * c;</Kbd> becomes (roughly):
            </P>
            <Code id="ir-example" lang="text">{`%1 = add i32 %a, %b       ; a + b
%2 = mul i32 %1, %c       ; result * c
store i32 %2, ptr %z      ; z = result`}</Code>
            <H2 num="◇ SSA">SSA — Static Single Assignment</H2>
            <P>
              LLVM IR is in <Term>SSA</Term> form. The rule: every variable is assigned <strong>exactly once</strong>. Repeated assignments in source become new versions (<Kbd>x1</Kbd>, <Kbd>x2</Kbd>, <Kbd>x3</Kbd>). This sounds restrictive but is liberating for the optimizer — the definition of any value is the single instruction that created it. No data flow analysis needed to find it.
            </P>
            <Code id="ssa-form" lang="text">{`// Source
x = 5;
x = x + 1;
return x;

// SSA form
%x1 = i32 5
%x2 = add i32 %x1, 1
ret i32 %x2

// Each name has exactly one definition. To find where %x2 comes from,
// it's literally the line above. The optimizer can transform freely.`}</Code>
            <H2 num="◇ BB">Basic blocks and the CFG</H2>
            <P>
              A <Term>basic block</Term> is a sequence of instructions with exactly one entry (the first) and one exit (a branch or return). No branches in the middle. Functions become a <Term>CFG</Term> — Control Flow Graph — where nodes are basic blocks and edges are possible jumps.
            </P>
            <P>
              All major optimizations operate on the CFG. Dead code elimination removes unreachable blocks. Loop detection finds back-edges in the graph. Vectorization analyzes innermost loops. Understanding basic blocks is the key to reading LLVM IR — every label like <Kbd>bb1:</Kbd> or <Kbd>%loop.body:</Kbd> starts a new one.
            </P>
            <Code id="cfg-example" lang="text">{`// if (x > 0) { y = 1; } else { y = 2; }

entry:
  %0 = icmp sgt i32 %x, 0
  br i1 %0, label %if.true, label %if.false

if.true:                          ; basic block 2
  br label %if.end

if.false:                         ; basic block 3
  br label %if.end

if.end:                           ; basic block 4
  %y = phi i32 [ 1, %if.true ], [ 2, %if.false ]
  ret i32 %y`}</Code>
            <H2 num="◇ PHI">Phi nodes — SSA's secret sauce</H2>
            <P>
              When control flow merges, SSA needs a way to pick which version of a variable to use. The <Term>Phi</Term> node does this: it selects a value based on which incoming edge was taken. <Kbd>%y = phi i32 [ 1, %if.true ], [ 2, %if.false ]</Kbd> means "y is 1 if we came from if.true, 2 if from if.false."
            </P>
            <P>
              Phi nodes look strange initially but are essential to SSA. They preserve the single-assignment property at merge points. The optimizer reads them, transforms them, sometimes eliminates them. They're not real instructions — the codegen lowers them to register copies during register allocation.
            </P>
            <Callout kind="tip" title="GO LIVE">
              The Sandbox (chapter 10) has 10 real LLVM IR examples. Try toggling -O0 vs -O2 on the Fibonacci sample — watch the unoptimized version's alloca/load/store noise collapse into clean SSA. This is the optimizer's "mem2reg" pass at work, promoting stack slots to SSA values.
            </Callout>
            {QUIZZES.ir.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ MAGIC">The optimization pipeline</H2>
            <P>
              At <Kbd>-O2</Kbd>, LLVM runs roughly 150 optimization passes on the IR. They run in a carefully tuned order — some passes enable others. Inlining exposes more constant folding opportunities; constant folding enables more dead code elimination; DCE enables more inlining. The pipeline iterates.
            </P>
            <ComparisonTable data={COMPARISONS.opt_levels} />
            <H2 num="◇ DCE">Dead code elimination</H2>
            <P>
              Removes code whose result is never used. The Sandbox's toy DCE pass demonstrates this: <Kbd>int a = 5; int b = 10; return b;</Kbd> — variable <Kbd>a</Kbd> is assigned but never read. The optimized IR marks that assignment as <Kbd>; eliminated dead</Kbd>. Real LLVM is far more aggressive: it deletes entire functions if they're never called, branches if their condition is constant, fields of structs if never read.
            </P>
            <H2 num="◇ FOLD">Constant folding + propagation</H2>
            <P>
              Constant folding evaluates constant expressions at compile time. <Kbd>2 + 3 * 4</Kbd> becomes <Kbd>14</Kbd>. Combined with constant propagation (track which variables hold constants), the optimizer can collapse surprisingly large amounts of code. Try sample 05 (Constant folding) in the Library — the entire <Kbd>compute()</Kbd> function collapses to <Kbd>return 25</Kbd>.
            </P>
            <H2 num="◇ INLINE">Inlining — the most important optimization</H2>
            <P>
              Replacing a function call with the function's body. Eliminates call overhead AND enables further optimizations across the boundary (constants flow in, dead branches get eliminated). Inlining decisions are based on size, profile data, and attributes (<Kbd>__attribute__((always_inline))</Kbd>, <Kbd>__attribute__((noinline))</Kbd>).
            </P>
            <P>
              C++'s heavy use of templates and small helper functions depends on inlining for performance. <Kbd>std::unique_ptr</Kbd> compiles to the same code as a raw pointer because the overloaded operators and destructor are inlined to nothing.
            </P>
            <H2 num="◇ VEC">Auto-vectorization</H2>
            <P>
              The compiler converts scalar loops to <Term>SIMD</Term> (Single Instruction Multiple Data) — process 4 or 8 elements per cycle. See sample 04 (Sum array) in the Library: the C source has one add per iteration; the assembly uses <Kbd>paddd</Kbd> to add 4 ints in parallel.
            </P>
            <P>
              Auto-vec is fragile. Loops with data dependencies between iterations, function calls in the body, aliased pointers, or irregular control flow can't be vectorized. Use <Kbd>-Rpass-analysis=loop-vectorize</Kbd> to see why a loop didn't vectorize.
            </P>
            <H2 num="◇ UNROLL">Loop unrolling</H2>
            <P>
              Small fixed loops get unrolled — the body is replicated, eliminating branch overhead and enabling further optimization. Sample 10 (Loop unrolling) shows <Kbd>for (i=0; i&lt;4; i++) arr[i]=0</Kbd> collapsing to a single 128-bit SSE store. The compiler combined unrolling with vectorization in one move.
            </P>
            <Callout kind="dont" title="PREMATURE OPTIMIZATION">
              "I know assembly so I'll write it myself" is wrong most of the time. -O2 with PGO + LTO beats hand-written assembly except in very specialized cases (SIMD kernels, hot-loop intrinsics). Profile first. Let the compiler do its job. Reach for intrinsics or inline asm only when measurements demand it.
            </Callout>
            {stackData?.opt && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.opt}</Callout>}
            {QUIZZES.opt.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ LOWER2">IR → machine code</H2>
            <P>
              <Term>Codegen</Term> is LLVM's backend. It takes optimized IR and produces target-specific assembly. Two big sub-problems: <strong>instruction selection</strong> (which CPU instructions to use for each IR operation) and <strong>register allocation</strong> (which IR values live in which physical registers).
            </P>
            <P>
              LLVM has two instruction selectors. <strong>SelectionDAG</strong> is the legacy default — builds a DAG of operations, pattern-matches subgraphs against tablegen rules. <strong>GlobalISel</strong> is the newer infrastructure — faster compile times, simpler architecture, gradually replacing SelectionDAG for major targets.
            </P>
            <H2 num="◇ REGALLOC">Register allocation — NP-hard, solved heuristically</H2>
            <P>
              IR pretends you have unlimited "virtual registers." x86-64 has 16 general-purpose registers. ARM64 has 31. The allocator must map IR values to physical registers, spilling to the stack when there aren't enough. Optimal allocation is NP-hard, so real compilers use heuristics.
            </P>
            <P>
              The classical approach is <strong>graph coloring</strong>: build an interference graph (two values interfere if they're alive at the same time), color it with N colors (one per register), and spill the values that don't get colors. LLVM's default is a <strong>greedy</strong> allocator — fast, near-optimal for most code.
            </P>
            <Code id="regalloc-demo" lang="text">{`// IR (unlimited registers — really SSA values)
%1 = add i32 %a, %b
%2 = mul i32 %1, %c
%3 = sub i32 %2, %d
ret i32 %3

// After register allocation on x86-64:
add eax, ebx       ; %a + %b → eax (was %1)
imul eax, ecx      ; * %c → eax (was %2)
sub eax, edx       ; - %d → eax (was %3)
ret`}</Code>
            <H2 num="◇ ISA">Instruction set architectures</H2>
            <ComparisonTable data={COMPARISONS.isas} />
            <H2 num="◇ ABI">Calling conventions</H2>
            <P>
              The <Term>ABI</Term> defines how functions call each other at the machine level: where arguments live (registers vs stack), which registers are caller-saved vs callee-saved, where the return value goes. ABIs differ by OS and architecture.
            </P>
            <P>
              On Linux x86-64 (System V ABI): integer args in <Kbd>rdi, rsi, rdx, rcx, r8, r9</Kbd>; return in <Kbd>rax</Kbd>. Callee saves <Kbd>rbx, rbp, r12-r15</Kbd>. On Windows x64: different! Args in <Kbd>rcx, rdx, r8, r9</Kbd>. Cross-platform code uses the compiler to handle this — never assume.
            </P>
            <Callout kind="info" title="WHY LEA IS MAGIC">
              The x86 <Kbd>LEA</Kbd> (Load Effective Address) instruction computes <Kbd>base + index*scale + offset</Kbd> in one cycle using the addressing unit (not the ALU). Compilers use it for pointer arithmetic AND for clever integer arithmetic — sample 09 in the Library shows it computing <Kbd>n + n + 1</Kbd> in one instruction.
            </Callout>
            {QUIZZES.codegen.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">Real LLVM IR — 10 curated samples</H2>
            <P>
              These are real LLVM IR outputs from <Kbd>clang -S -emit-llvm</Kbd> on real C programs, paired with the corresponding x86-64 assembly from <Kbd>clang -S -O2</Kbd>. Toggle -O0 vs -O2 on samples that have both to see optimization in action.
            </P>
            <P>
              The "insight" panel on each sample calls out the key transformation. Start with sample 1 (Hello World) to see <Kbd>printf</Kbd> become <Kbd>puts</Kbd>. Then sample 4 (Sum array) for auto-vectorization. Then sample 5 (Constant folding) for the dramatic case.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Export samples for reference</H2>
            <button onClick={exportSamples} className="flex items-center gap-2 border border-violet-400 text-violet-400 px-4 py-2 text-[13px] hover:bg-violet-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Library size={14} /> Download samples.md
            </button>
            <H2 num="◇ DONT">Anti-patterns — compiler edition</H2>
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
            <H2 num="◇ LIVE">A real compiler in your browser</H2>
            <P>
              The Sandbox has two modes. <strong>Toy compiler</strong> — type C-like code, see lexer tokens → AST → IR → optimized IR → assembly happen live. Real compilation phases, real SSA IR, real constant folding and DCE. The language is simpler than C (no pointers, simplified types) but the compilation is genuine.
            </P>
            <P>
              <strong>Real LLVM samples</strong> — 10 curated C programs with pre-computed real LLVM IR and x86-64 assembly. Toggle -O0 vs -O2 to watch the optimizer transform code. These are honest outputs from clang, not simulations.
            </P>
            <Sandbox />
            <Callout kind="tip" title="START HERE">
              Pick challenge 6 (Constant folding) in the toy compiler. Type <Kbd>return 2 + 3 * 4;</Kbd>. Watch all stages: tokens show INT_KW gone, NUMBER:2, PLUS, NUMBER:3, STAR, NUMBER:4. AST shows Binary(+) wrapping Binary(*) — that's operator precedence working. IR shows separate add and mul instructions. Optimized IR shows them folded to <Kbd>%5 = i32 14</Kbd>. Assembly is just <Kbd>mov rax, 14 / ret</Kbd>. The compiler did all the math.
            </Callout>
            <Callout kind="tip" title="THEN SWITCH MODES">
              Switch to "real LLVM samples." Try sample 4 (Sum array). Toggle -O2. Notice the assembly uses <Kbd>paddd</Kbd> (packed add of 4 ints in parallel) and <Kbd>movdqu</Kbd> (load 16 bytes at once). The compiler turned your scalar loop into SIMD. This is real production output, not synthesized.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When the compiler is the problem</H2>
            <P>
              Eight branches covering the most common compiler troubles: UB-triggered miscompiles, vectorization failures, oversized binaries, slow compile times, reading assembly, optimization regressions after upgrades, hot loop tuning, and learning paths.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLS">The compiler engineer's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'godbolt.org (Compiler Explorer)', what: "Paste code, see assembly side-by-side from any compiler + any flags. Hover source for asm highlighting. The single best learning tool. Bookmark it. Use it weekly." },
                { name: 'clang -fsanitize=undefined,address', what: "UBSan + ASan. Runtime checks for undefined behavior, out-of-bounds, use-after-free. Slower than production but 10-50x faster than valgrind. Always enable in CI." },
                { name: 'clang -ftime-trace', what: "Profile compilation. Generates JSON viewable at chrome://tracing or speedscope.app. Shows which files / templates take longest. Essential for C++ build time triage." },
                { name: 'perf record + perf report', what: "Linux performance counters. Find the hot function before optimizing. 'Premature optimization is the root of all evil' — Knuth was right." },
                { name: 'objdump -d -M intel', what: "Disassemble compiled binaries. Intel syntax (-M intel) is far more readable than AT&T default. Match source lines to assembly to understand what the compiler did." },
                { name: 'opt -O2 -S file.ll', what: "Run LLVM's optimizer standalone on an IR file. Combined with -print-after-all, lets you see each pass's effect. Great for understanding why -O2 produced what it did." },
                { name: 'lld (ld.lld)', what: "LLVM's linker. Often 2-10x faster than GNU ld for large binaries. Drop-in replacement on most projects. Standard for many modern toolchains." },
                { name: 'cmake + ninja', what: "Modern build pair. Ninja is faster than make for incremental builds. CMake generates ninja files from declarative configuration. Standard in C++ ecosystem." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-violet-400 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-violet-400 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-amber-400 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                <div className="text-violet-400 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>correct</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-amber-400 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{missed.length}</div>
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
                      <div className="text-violet-400 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A compiler curriculum</H2>
            <P>For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1-2', plan: "Crafting Interpreters by Robert Nystrom (craftinginterpreters.com). Free online. Build a tree-walking interpreter from scratch — lexer, parser, AST, runtime." },
                { wk: 'Week 3-4', plan: "Crafting Interpreters Part II — bytecode VM. Now you've built two language implementations. The transition from tree-walking to bytecode is the key insight in modern language implementation." },
                { wk: 'Week 5-6', plan: "Spend an hour daily on godbolt.org. Take code you've written, see how it compiles. -O0 vs -O2. Read the assembly. Form intuitions about what the compiler actually does." },
                { wk: 'Week 7-8', plan: "LLVM Kaleidoscope tutorial (llvm.org/docs/tutorial/). Build a simple language using real LLVM. Lexer → parser → IR generation → JIT execution. Now you understand the LLVM-side of the stack." },
                { wk: 'Week 9-10', plan: "Engineering a Compiler (Cooper + Torczon) chapters 1-7. Theory deepening. SSA, dataflow analysis, register allocation. The modern textbook for serious compiler work." },
                { wk: 'Week 11-12', plan: "Write a small language end-to-end. Pick something simple (calculator, expression language, tiny DSL). Lexer + parser + AST + LLVM IR generation. The capstone project." },
                { wk: 'Beyond', plan: "Read LLVM source. Write an LLVM pass. Contribute a bug fix. Study MLIR for the future of compiler infrastructure. The field is wide open for serious learners in 2026." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-violet-400 pl-3 py-1">
                  <div className="text-violet-400 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-violet-400 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-amber-400 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-violet-400 text-violet-400 px-4 py-2 text-[13px] hover:bg-violet-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportSamples} className="flex items-center gap-2 border border-amber-400 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download samples.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-fuchsia-300 text-fuchsia-200 px-4 py-2 text-[13px] hover:bg-fuchsia-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-red-400 hover:text-red-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              Compilers are the deepest layer of programming infrastructure — the thing that makes everything else possible. You've walked the pipeline from FORTRAN 1957 through LLVM 22.1.6, from lexer tokens to register-allocated x86-64. A working toy compiler in your browser. 10 real LLVM IR samples from real clang. The intuition compounds with use. Spend time on godbolt.org. Read Crafting Interpreters. Build a small language. Compilers are the substrate of every other discipline in this atlas — knowing how they work changes everything else.
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
            <div className="text-violet-400 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>λ</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>COMPILERS</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-amber-400/40 text-amber-200 px-2 py-1 text-[11px] hover:bg-amber-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-violet-400 hover:text-violet-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-violet-400 bg-violet-400/10 text-violet-400' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-violet-400" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-violet-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-violet-400 text-violet-400 bg-violet-400/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-violet-400 hover:text-violet-400'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-violet-400 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            λ · compilers atlas · grounded in LLVM 22.1.6 + Crafting Interpreters + Cooper & Torczon
          </div>
        </div>
      </main>
    </div>
  );
}
