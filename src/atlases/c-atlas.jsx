import { useState, useEffect, useRef } from 'react';
import {
  Compass, Cpu, Layers, ArrowRight, Boxes, GitBranch, Activity,
  Package, Terminal, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, RotateCcw, Play, ArrowLeft, Quote, MousePointerClick,
  Loader2, Library, AlertTriangle, HardDrive
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   C ATLAS · DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Ritchie, Bell Labs, 1972. Why C is still everywhere 50 years later." },
  { id: 'toolchain', label: 'Toolchain', icon: Cpu, num: '02', sub: "Preprocessor, compiler, assembler, linker. gcc/clang. The build chain." },
  { id: 'bedrock', label: 'Bedrock', icon: Layers, num: '03', sub: "Types, sizeof, signed vs unsigned, integer promotion, declarations." },
  { id: 'pointers', label: 'Pointers', icon: ArrowRight, num: '04', sub: "Addresses, dereferencing, arrays decay, pointer arithmetic — the core mental model." },
  { id: 'memory', label: 'Memory', icon: HardDrive, num: '05', sub: "Stack vs heap, malloc/free, leaks, double-free, use-after-free." },
  { id: 'structures', label: 'Structures', icon: Boxes, num: '06', sub: "struct, union, bitfields, alignment, strings as char arrays." },
  { id: 'stdlib', label: 'libc', icon: Package, num: '07', sub: "stdio, stdlib, string, ctype, math, time — the standard library." },
  { id: 'modernc', label: 'Modern C', icon: GitBranch, num: '08', sub: "C99 → C11 → C17 → C23. Designated init, _Generic, nullptr, constexpr." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Curated snippets — patterns, recipes, idioms. Copy and ship." },
  { id: 'sandbox', label: 'Sandbox', icon: Terminal, num: '10', sub: "Real C execution in your browser via JSCPP. Six challenges + free play." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Compiler errors, undefined behavior, memory bugs, debugging strategy." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "K&R, references, the reading roadmap." },
];

const STACKS = [
  { id: 'embedded', label: 'Embedded / firmware', desc: 'Microcontrollers, RTOS, bare metal', icon: '⚡' },
  { id: 'systems', label: 'Systems / OS', desc: 'Kernels, drivers, performance-critical', icon: '⚙' },
  { id: 'tools', label: 'CLI tools / utilities', desc: 'File processors, network utils, parsers', icon: '▶' },
  { id: 'games', label: 'Games / graphics', desc: 'Engines, renderers, audio', icon: '◐' },
  { id: 'fundamentals', label: 'Just the language, properly', desc: 'Learn C itself first', icon: '&' },
];

const GLOSSARY = {
  Address: "A number identifying a location in memory. Pointers store addresses. &x gives the address of variable x. On 64-bit systems, addresses are 8 bytes.",
  Pointer: "A variable that holds an address. Declared with *. `int *p` means p is a pointer to int. Dereference with *p to read/write the pointed-to value.",
  Dereference: "Following a pointer to access the value at its address. *p reads/writes through pointer p. NULL dereference is undefined behavior — most segfaults.",
  "Array decay": "An array name used in most expressions is converted to a pointer to its first element. `int a[10]; foo(a);` — foo receives `int *`, not `int[10]`. The length is lost.",
  Lvalue: "An expression that designates an object — something you can assign to. `x = 5` (x is lvalue). `5 = x` is illegal (5 isn't lvalue).",
  Rvalue: "An expression that yields a value but doesn't designate storage. `x + 1`, function results, literals. You can read it, can't assign to it.",
  "Storage class": "How long and where a variable lives: auto (default, stack), static (lifetime = program), register (hint), extern (declared here, defined elsewhere), thread_local (C11).",
  "Type qualifier": "Decorations on types: const (read-only), volatile (don't optimize accesses — for hardware/signals), restrict (this pointer is the only access path — optimizer hint), _Atomic (C11, lock-free).",
  Sizeof: "Compile-time operator returning size of a type or expression in bytes (size_t). `sizeof(int)` is typically 4. `sizeof arr` for a stack array gives total bytes; doesn't work after array decay.",
  size_t: "Unsigned integer type for sizes and indices. Defined in <stddef.h>. Use it for loop indices over containers — never int (which can overflow on huge arrays).",
  ptrdiff_t: "Signed type for the difference between two pointers. Result of `p2 - p1` when both point into the same array.",
  "Integer promotion": "Small integer types (char, short) are converted to int (or unsigned int) in expressions. `(char)1 + (char)2` is computed as int. Source of surprising bugs.",
  "Usual arithmetic conversions": "When two operands of different types meet, both convert to a common type. Mixed signed/unsigned often promotes signed to unsigned — a common bug source.",
  Stack: "Memory region for function-local variables and call frames. Grows downward (typically). Fast allocation (just decrement SP). Limited size (often 1-8 MB). Cleaned up automatically on return.",
  Heap: "Memory you request from the OS with malloc/calloc/realloc and return with free. Lifetime is manual. The source of most C memory bugs.",
  malloc: "Allocates `n` bytes on the heap, returns void* to the block (or NULL on failure). Uninitialized memory. Pair with free() exactly once.",
  calloc: "Like malloc but zeros the memory and takes (count, size) for overflow safety. Use for arrays of objects when you want zeros.",
  realloc: "Resize a previously-allocated block. May move it; check the returned pointer. NEVER overwrite original ptr without checking — leak risk.",
  free: "Returns a heap block to the allocator. Double-free is UB. Free of NULL is a no-op (safe). After free(p), p still holds the old address but using it is UB (dangling pointer).",
  "Use-after-free": "Accessing memory after free(). The block may be reused; reads return garbage, writes corrupt the allocator. Always set ptr = NULL after free.",
  "Double-free": "Calling free() twice on the same pointer. Corrupts allocator metadata; may crash, may execute attacker code. AddressSanitizer catches this.",
  "Buffer overflow": "Writing past the end of an array. Corrupts adjacent memory, smashes the stack, classic exploit vector. -fsanitize=address catches these.",
  Struct: "User-defined type aggregating named fields of various types. Memory layout is fields in order, with padding for alignment. Pass by value copies the whole thing.",
  Union: "Like struct but all members share the same memory. Size is the largest member. Used for type-punning (carefully — strict aliasing) and tagged-union patterns.",
  Bitfield: "struct member with explicit bit width: `unsigned flag : 1;`. For packed flags and hardware register layouts. Layout is implementation-defined — fragile across compilers.",
  Alignment: "The address requirement for a type. `int` typically aligned to 4 bytes. struct fields get padded to satisfy each field's alignment.",
  Padding: "Bytes the compiler inserts between struct fields to satisfy alignment. `struct { char c; int i; }` is often 8 bytes, not 5. Reorder fields by size descending to minimize.",
  "Undefined Behavior": "UB. The standard says behavior is not defined — compilers can do ANYTHING. Common UB: signed integer overflow, dereferencing NULL, reading uninitialized memory, out-of-bounds access, data races.",
  "Implementation-defined": "Different from UB: behavior chosen by the implementation, must be documented. `sizeof(int)` is impl-defined. Right shift of negative number is impl-defined.",
  Preprocessor: "Phase 1 of compilation. Handles #include, #define, #ifdef. Pure text substitution — doesn't understand C syntax. Bugs here are nasty.",
  Macro: "Preprocessor token replacement, defined with #define. Function-like macros: parenthesize args + result. Lacks type safety. Modern code prefers inline functions when possible.",
  "Header guard": "Pattern to prevent multiple inclusion: #ifndef X_H / #define X_H / ... / #endif. Or use #pragma once (widely supported, non-standard).",
  TU: "Translation Unit. One .c file plus its #included headers, after preprocessing. The compiler operates on one TU at a time. The linker stitches TUs together.",
  ABI: "Application Binary Interface. The contract between compiled code at runtime: calling convention, struct layout, name mangling (none in C). What lets a shared library work with code compiled separately.",
  Linker: "Final phase. Combines compiled .o files, resolves external symbols (function/variable names), produces an executable or library. Most cryptic errors are linker errors.",
  Make: "The classic build automation tool. Reads a Makefile of rules (target: deps; recipe). Re-runs only rules whose deps are newer than the target.",
  CMake: "Higher-level build-system generator. Writes Makefiles (or Ninja, MSBuild, Xcode) from a portable CMakeLists.txt. Modern de facto standard for cross-platform C/C++.",
  errno: "Thread-local int set by stdlib functions on failure. <errno.h>. Check it AFTER a function returns its failure sentinel; never check errno alone.",
  "C standard": "ISO/IEC 9899. Versions: C89/C90 (the original ANSI), C99 (named init, // comments, VLAs, stdint), C11 (threads, atomics, generic), C17 (corrections), C23 (nullptr, constexpr, _BitInt, attributes).",
  POSIX: "Portable Operating System Interface. Standard for Unix-like systems (Linux, macOS, BSD). Adds pthreads, fork/exec, sockets, signals on top of C standard library.",
  Compilation: "Source → preprocessing → compilation (to assembly) → assembly (to object) → linking (to executable). Each step has its own diagnostics; learn to read them in order.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "C was created in…",
      opts: [ "1965 at MIT", "1972 at Bell Labs by Dennis Ritchie", "1981 at Microsoft" ],
      a: 1,
      x: "Dennis Ritchie created C at Bell Labs around 1969-1972, as a successor to B (which was a successor to BCPL). Used to rewrite Unix in 1973 — the killer app that spread C globally."
    },
    {
      qid: 'o2',
      q: "What's the current C standard (as of 2026)?",
      opts: [ "C99", "C11", "C23 (ISO/IEC 9899:2024)" ],
      a: 2,
      x: "C23 was published October 31, 2024. GCC 15+ uses it by default. Added nullptr, constexpr, true/false keywords, _BitInt, #embed, [[attributes]]. Next is C29 (informally C2Y), draft N3854 from March 2026."
    },
    {
      qid: 'o3',
      q: "Why is C still everywhere in 2026?",
      opts: [
        "Backward compatibility is its only feature",
        "It compiles to small, fast machine code; stable ABI; the lingua franca of OS kernels, embedded firmware, language runtimes (Python/Ruby/Node), libraries everyone links",
        "It's required by ISO law"
      ],
      a: 1,
      x: "Linux kernel: C. Windows kernel: C. macOS XNU: C/C++. SQLite: C. Redis: C. Git: C. nginx: C. CPython: C. The Ruby interpreter: C. WebAssembly's reference implementation: C. C is the platform other languages bind to."
    },
  ],
  toolchain: [
    {
      qid: 't1',
      q: "What are the four phases of building a C program?",
      opts: [
        "Compile and link — two phases",
        "Preprocess → Compile (to assembly) → Assemble (to object) → Link (to executable)",
        "It's all one step inside gcc"
      ],
      a: 1,
      x: "Each phase is a separate program inside gcc/clang. `gcc -E` stops after preprocessing. `gcc -S` stops after compilation (gives assembly). `gcc -c` stops after assembly (gives .o). Default goes all the way to executable."
    },
    {
      qid: 't2',
      q: "Which gcc flags should you always use during development?",
      opts: [
        "Just -o output",
        "-Wall -Wextra -Werror -g -fsanitize=address,undefined -std=c23",
        "-O3 only"
      ],
      a: 1,
      x: "-Wall + -Wextra: warnings on. -Werror: warnings → errors (forces you to fix). -g: debug symbols (gdb/lldb need them). -fsanitize=address,undefined: catches buffer overflows, UAF, UB at runtime. -std=c23: explicit standard. The five-flag baseline."
    },
    {
      qid: 't3',
      q: "What does the linker actually do?",
      opts: [
        "Compiles your code",
        "Combines object files, resolves external symbol references (function/variable names) across translation units, produces final executable or library",
        "Optimizes performance"
      ],
      a: 1,
      x: "When file A calls foo() defined in file B, the compiler emits a placeholder ('undefined reference to foo'). The linker matches it against B's definition. `undefined reference` errors are linker errors — usually a missing source file or unlinked library (-l flag)."
    },
  ],
  bedrock: [
    {
      qid: 'b1',
      q: "On a 64-bit Linux machine, sizeof(int) is most likely…",
      opts: [ "8 (matches pointer size)", "4 (LP64 model)", "It's undefined" ],
      a: 1,
      x: "Linux/macOS 64-bit use LP64: long = 8, pointer = 8, int = 4. Windows 64-bit uses LLP64: same except long = 4. NEVER assume sizes — use stdint.h types (int32_t, int64_t) when you care."
    },
    {
      qid: 'b2',
      q: "`int x = -1; unsigned int y = 1; if (x < y) ...` — does the branch run?",
      opts: [
        "Yes, -1 < 1",
        "No — usual arithmetic conversions promote x to unsigned, so x becomes a huge positive number (4294967295)",
        "Compiler error"
      ],
      a: 1,
      x: "Mixed signed/unsigned → signed converts to unsigned. -1 as unsigned int is UINT_MAX. So the comparison is 4294967295 < 1 → false. Sources of countless bugs. -Wsign-compare warns. Avoid mixing signed and unsigned."
    },
    {
      qid: 'b3',
      q: "Signed integer overflow in C is…",
      opts: [
        "Wraps around (modular arithmetic)",
        "Undefined Behavior — the compiler may assume it doesn't happen, and optimize accordingly",
        "Saturates at INT_MAX"
      ],
      a: 1,
      x: "UB. The compiler can (and does) optimize `if (x + 1 > x)` to `true` because UB means it 'never overflows.' Use -fsanitize=undefined to catch at runtime. Unsigned overflow IS defined (wraps mod 2^N) — different rule."
    },
    {
      qid: 'b4',
      q: "Declaration: `int *p, q;` — what is q?",
      opts: [
        "int* — like p",
        "int — the * binds to p only, not the type",
        "An error"
      ],
      a: 1,
      x: "The * is part of the DECLARATOR, not the type. Common C pitfall. To declare two pointers: `int *p, *q;`. Many style guides recommend one declaration per line to avoid this entirely."
    },
  ],
  pointers: [
    {
      qid: 'p1',
      q: "What does `int arr[5]; foo(arr);` actually pass to foo?",
      opts: [
        "The whole array, copied",
        "A pointer to arr[0] — the array decays. foo() sees `int *`, no length info.",
        "A reference (like C++)"
      ],
      a: 1,
      x: "Arrays decay to pointers in most contexts. Inside foo, sizeof(arr) gives 8 (pointer size), not 20. ALWAYS pass length separately: `void foo(int *arr, size_t n)`. This is the bedrock of C confusion."
    },
    {
      qid: 'p2',
      q: "`char *s = \"hello\"; s[0] = 'H';` — what happens?",
      opts: [
        "Modifies the string to \"Hello\"",
        "Undefined behavior — string literals are typically in read-only memory; likely segfault",
        "Compiler error"
      ],
      a: 1,
      x: "String literals have type `char[]` but are stored in read-only memory in most implementations. Writing to them is UB. C23 actually fixed the type to `const char[]` for new code. Use `char s[] = \"hello\"` (writable copy on the stack) instead."
    },
    {
      qid: 'p3',
      q: "Pointer arithmetic: if `int *p` and p == 0x1000, what's p + 1?",
      opts: [
        "0x1001",
        "0x1004 — pointer arithmetic scales by sizeof(*p)",
        "Undefined"
      ],
      a: 1,
      x: "p + n moves n elements forward, where 'element' is sizeof(*p). For int*, +1 advances 4 bytes. For char*, +1 advances 1 byte. p[i] is exactly *(p + i). Valid only within the bounds of the pointed-to array (+1 past the end is allowed but not dereferenceable)."
    },
  ],
  memory: [
    {
      qid: 'mem1',
      q: "Stack vs heap — when to use which?",
      opts: [
        "Always heap — more flexible",
        "Stack for small, function-scoped values (fast, automatic cleanup). Heap for large, dynamic-lifetime, or unknown-at-compile-time sizes.",
        "Stack only for ints, heap for everything else"
      ],
      a: 1,
      x: "Stack: function locals, small structs, arrays with compile-time-known sizes. Heap (malloc): variable-size buffers, data outliving the call, large blocks. Stack is faster (just SP arithmetic) but limited (~1-8MB total). Heap is unlimited but slower + must free."
    },
    {
      qid: 'mem2',
      q: "After `free(p);`, what should you do?",
      opts: [
        "Nothing — p is now invalid but harmless",
        "Set p = NULL — defends against use-after-free and makes double-free safe (free(NULL) is a no-op)",
        "Reset p to its original value"
      ],
      a: 1,
      x: "After free, p is a dangling pointer — using it is UB. Setting p = NULL means any later *p crashes immediately (debuggable) instead of silently corrupting reused memory. free(NULL) is explicitly allowed and does nothing — so this also makes double-free patterns safe."
    },
    {
      qid: 'mem3',
      q: "`p = realloc(p, new_size);` — what's wrong?",
      opts: [
        "Nothing",
        "If realloc fails, it returns NULL but the original block is still allocated. You've overwritten p, lost the original pointer, and now leak. Use a temp variable.",
        "realloc isn't standard"
      ],
      a: 1,
      x: "Idiomatic fix: `void *tmp = realloc(p, n); if (!tmp) { /* handle error, p still valid */ } else { p = tmp; }`. Classic interview trap. Same logic applies to any 'reassign on failure-prone call'."
    },
  ],
  structures: [
    {
      qid: 's1',
      q: "Why does this struct take 16 bytes on a typical 64-bit system?\n`struct { char c; int i; char d; long l; };`",
      opts: [
        "It doesn't — should be 10 bytes",
        "Padding: c (1) + 3 padding + i (4) + d (1) + 7 padding + l (8) = 24, not 16. (Quiz fix: 24 bytes.) Field alignment requirements force gaps.",
        "It's compiler-dependent magic"
      ],
      a: 1,
      x: "Each field is padded to its alignment requirement. int wants 4-byte alignment, long wants 8. Reorder by size desc to minimize: `long l; int i; char c; char d;` packs into 16 bytes. Critical for cache + struct arrays."
    },
    {
      qid: 's2',
      q: "C strings are…",
      opts: [
        "First-class types with length and content",
        "Arrays of char, terminated by a '\\0' (null byte). Length must be computed by walking until '\\0' — O(n). strlen() does this.",
        "UTF-8 encoded by default"
      ],
      a: 1,
      x: "The null-terminator is THE source of countless C string bugs: missing it (buffer overrun), miscounting length (off-by-one), strcpy with insufficient destination, etc. Modern code uses bounded versions: strncpy (with care), snprintf, strlcpy on BSD."
    },
  ],
  stdlib: [
    {
      qid: 'sl1',
      q: "Which header has malloc/free?",
      opts: [ "<stdio.h>", "<stdlib.h>", "<malloc.h>" ],
      a: 1,
      x: "stdlib.h has malloc, free, calloc, realloc, exit, atoi/atof, getenv, qsort, bsearch, rand, abs. The 'general utilities' library. <malloc.h> is non-standard (Linux/glibc); avoid it for portable code."
    },
    {
      qid: 'sl2',
      q: "What's the right way to convert a string to int with error checking?",
      opts: [
        "atoi(s) — simple",
        "strtol(s, &end, 10) — sets `end` to position after the parsed number, sets errno on overflow. atoi has no error reporting.",
        "scanf(\"%d\", &n)"
      ],
      a: 1,
      x: "atoi(\"abc\") returns 0 — indistinguishable from atoi(\"0\"). strtol gives you the failure path. Modern code uses strtol/strtoul/strtod and checks both end (was anything parsed?) and errno (overflow?)."
    },
  ],
  modernc: [
    {
      qid: 'mc1',
      q: "C23 added… (pick the BIGGEST single change)",
      opts: [
        "More library functions",
        "nullptr as a typed null pointer constant + constexpr for compile-time evaluation — bringing C closer to its modern siblings",
        "Pattern matching"
      ],
      a: 1,
      x: "C23 (ISO/IEC 9899:2024): nullptr (a real nullptr_t type — no more (void*)0 macros), constexpr for variables, true/false as keywords (not macros), _BitInt(N) for arbitrary-width integers, [[attribute]] syntax standardized, typeof and typeof_unqual, #embed for binary inclusion, empty () means (void) (breaks K&R declarations)."
    },
    {
      qid: 'mc2',
      q: "Designated initializers (C99+) — what do they let you do?",
      opts: [
        "Initialize struct fields by name: `struct Point p = { .x = 1, .y = 2 };`",
        "Make initializers run at runtime",
        "Skip initialization"
      ],
      a: 0,
      x: "Massively underused. Reorders independence (rearrange fields without breaking code), self-documenting, lets you skip fields (they zero-init), works for arrays too: `int a[10] = { [4] = 1, [7] = 2 };`. Pair with compound literals for the cleanest C you'll write."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What separates competent C programmers from senior ones?",
      opts: [
        "Memorizing libc",
        "Deep ownership thinking (who allocates, who frees), pointer fluency (decay, arithmetic, double-pointer for ownership transfer), and respect for UB (what compilers can do with it)",
        "Knowing macro tricks"
      ],
      a: 1,
      x: "The K&R book is short because the language is small. The skill is everything you must know IN ADDITION: ownership conventions, memory tooling (ASAN, valgrind), reading assembly, knowing the UB catalog. That's career-long. The atlas points you at the right next steps."
    },
  ],
};

const COMMANDS = [
  { cmd: 'gcc -Wall -Wextra -Werror -g -fsanitize=address,undefined -std=c23 -o app main.c', desc: 'The dev-mode incantation. All warnings, errors-as-errors, debug symbols, sanitizers, modern standard.' },
  { cmd: 'gcc -O3 -DNDEBUG -std=c23 -o app main.c', desc: 'Release build: optimize aggressively, strip asserts.' },
  { cmd: 'gcc -E main.c', desc: 'Stop after preprocessing — see the expanded source. Diagnoses macro bugs.' },
  { cmd: 'gcc -S main.c', desc: 'Stop after compilation — get assembly output (main.s). Useful for performance / understanding what the compiler did.' },
  { cmd: 'gcc -c main.c', desc: 'Compile to object file (main.o) without linking. For separately-compiled projects.' },
  { cmd: 'gcc main.o util.o -o app -lm', desc: 'Link multiple objects + the math library (libm). -l<name> looks for lib<name>.so or lib<name>.a.' },
  { cmd: 'gdb ./app', desc: 'Debug. (r)un, (b)reak <line>, (n)ext, (s)tep, (p)rint var, (bt) backtrace, (q)uit.' },
  { cmd: 'valgrind --leak-check=full ./app', desc: 'Find memory leaks + UB. Slower than AddressSanitizer but doesn\'t need recompilation.' },
  { cmd: 'make', desc: 'Run the default target in Makefile. Re-runs only rules whose dependencies are newer than the target.' },
  { cmd: 'make clean && make', desc: 'Wipe build artifacts and rebuild from scratch.' },
  { cmd: 'objdump -d ./app | less', desc: 'Disassemble the executable. See actual machine instructions.' },
  { cmd: 'nm ./app | grep -i symbol', desc: 'List symbols in an object/executable. Diagnoses undefined-reference linker errors.' },
  { cmd: 'ldd ./app', desc: 'List dynamic libraries this executable depends on. (macOS: otool -L)' },
  { cmd: 'clang-format -i main.c', desc: 'Auto-format source. Pair with a .clang-format file in your repo.' },
  { cmd: 'clang-tidy main.c -- -std=c23', desc: 'Static analysis. Catches bugs the compiler misses.' },
];

const RESOURCES = [
  { name: 'K&R: The C Programming Language (2nd ed)', url: 'A book — buy it', note: "Kernighan & Ritchie. 272 pages. The book. Written by C's creator. Some idioms predate C99 — supplement with modern material — but the foundational chapters (esp. pointers + arrays) are unbeaten.", kind: 'book' },
  { name: 'Modern C (4th ed)', url: 'modernc.gforge.inria.fr', note: "Jens Gustedt. Free PDF. The K&R replacement for C17/C23. Five levels: Encounter → Acquaintance → Cognition → Experience → Ambition. Read all five.", kind: 'book' },
  { name: 'C Programming: A Modern Approach (2nd ed)', url: 'A book — buy it', note: "K. N. King. ~830 pages. The thorough textbook. Used in many university courses. Long but the depth is real.", kind: 'book' },
  { name: 'cppreference.com (C section)', url: 'en.cppreference.com/w/c', note: "The de facto online C reference. More accurate and complete than docs.man for libc. Always the first link to click when you forget how a stdlib function behaves.", kind: 'reference' },
  { name: 'C standard drafts', url: 'open-std.org/jtc1/sc22/wg14', note: "Working group docs. Latest C23 final draft (N3220) is the closest free thing to the official spec (which is $$). Also where you find C29/C2Y proposals.", kind: 'spec' },
  { name: 'Compiler Explorer (godbolt)', url: 'godbolt.org', note: "Paste C, see assembly side-by-side across gcc/clang/msvc + many versions. Best free tool for understanding what the compiler ACTUALLY does. Built by Matt Godbolt.", kind: 'tool' },
  { name: 'CS50 (Harvard)', url: 'cs50.harvard.edu', note: "Harvard's intro CS course — first half is C. Free on edX. David Malan teaches well; problem sets are excellent.", kind: 'course' },
  { name: 'MIT OCW 6.087 Practical Programming in C', url: 'ocw.mit.edu — search 6.087', note: "MIT's intensive C course. Free lecture notes + assignments.", kind: 'course' },
  { name: 'Beej\'s Guide to C Programming', url: 'beej.us/guide/bgc', note: "Brian Hall. Free, friendly, complete. Great when you want a single web-readable reference. Also Beej's Guide to Network Programming is the canonical sockets intro.", kind: 'reference' },
  { name: 'Beej\'s Guide to Network Programming', url: 'beej.us/guide/bgnet', note: "The Bible of TCP/UDP sockets in C. Free, web + PDF. If you ever write network code in C, read this first.", kind: 'tutorial' },
  { name: 'LLVM Clang documentation', url: 'clang.llvm.org/docs', note: "Sanitizers (ASAN, UBSAN, MSAN), -Weverything, attributes, diagnostics. clang has the best warnings and best error messages of any C compiler.", kind: 'reference' },
  { name: 'C FAQ (Steve Summit)', url: 'c-faq.com', note: "Decades-old, still definitive. Section 6 on arrays-and-pointers fixes more confusion than any other 50 pages on the topic.", kind: 'reference' },
];

const PERSONALIZED = {
  embedded: {
    spark: "Embedded: cross-compile (arm-none-eabi-gcc for Cortex-M), tiny stdlib (newlib-nano), no malloc in hot paths. Memory map is yours to manage. Vendor SDKs (STM32 HAL, ESP-IDF, Nordic nRF) are C-first.",
    pointers: "Embedded: pointer to volatile for memory-mapped I/O — `volatile uint32_t *GPIO_REG = (uint32_t *)0x40020000;`. Casts are routine; aliasing is your responsibility. Inline assembly for ISRs.",
    memory: "Embedded: malloc is often banned in safety-critical code (heap fragmentation, nondeterministic timing). Static arenas, ring buffers, pool allocators are the patterns. Build with -fstack-usage to track stack budgets per function.",
    library: "Embedded: lean on the 'Memory' library — arena allocators, ring buffers, fixed pools. The 'Build' library has cross-compile incantations. Avoid most of stdlib's I/O; use vendor HAL.",
  },
  systems: {
    spark: "Systems: Linux kernel style, glibc + POSIX, fork/exec/pipe/signal. Read existing kernels (Linux, FreeBSD) to see disciplined C. Cite SUSv4 (Single Unix Spec) for POSIX behavior.",
    pointers: "Systems: ownership tracking is everything. Document it: `// Returns: caller owns, must free()` or `// Returns: borrowed reference, don't free`. const correctness for read-only borrows. Function pointers for callbacks/vtables.",
    memory: "Systems: arena/region allocators for bulk lifetime. mmap for huge allocations. valgrind + ASAN + UBSAN routinely. Heaptrack for fragmentation. The kernel has slab/buddy allocators worth studying.",
    library: "Systems: 'Data Structures' (linked lists, hash tables — the Linux kernel patterns) + 'I/O' (read whole file, line-by-line) + 'System' (fork, pipe, signal patterns).",
  },
  tools: {
    spark: "CLI tools: argv parsing (getopt_long for GNU style), file I/O, line buffering. Most utilities are ~500-2000 lines of straightforward C. cat, grep, ls — read their sources (coreutils, BSD).",
    pointers: "CLI tools: const char ** for arg lists, char ** for owned strings. Track ownership at function boundaries. Use stdint.h types for any fixed-width work (parsing binary formats).",
    memory: "CLI tools: short-lived processes get away with leaks (OS reclaims on exit). For long-running ones, valgrind. arena_alloc patterns work well for parsers.",
    library: "CLI tools: 'Strings' (parsing, building output) + 'I/O' (file reading) + 'Errors' (errno + clean exit) + 'Build' (release flags).",
  },
  games: {
    spark: "Games: SDL2/3 for windowing+input+audio, OpenGL/Vulkan for graphics, custom or third-party math (cglm). Cache-friendly data layouts (struct-of-arrays vs array-of-structs). Profile with perf or Tracy.",
    pointers: "Games: void* for component systems (ECS), function pointers for hot paths (sometimes). restrict for the optimizer in math-heavy loops. Strict aliasing matters in SIMD code.",
    memory: "Games: per-frame arenas (allocate freely during frame, reset at end), persistent pools for entities, slab allocators for fixed-size objects. malloc/free is for setup/teardown only in hot games.",
    library: "Games: 'Memory' (arenas, pools, slabs) + 'Data Structures' (free list, hash table) + 'Build' (release flags + LTO).",
  },
  fundamentals: {
    spark: "Best choice. Build language fluency before specializing. Read K&R Ch 1-5, then Modern C levels 1-3. Type every example. Build small programs from scratch — argv parser, word counter, basic shell.",
    pointers: "Spend extra weeks here. Read C FAQ section 6 cover to cover. Use Compiler Explorer (godbolt.org) — paste a function, see the assembly. Pointer-to-pointer mental model is THE thing that separates beginners from intermediates.",
    memory: "Read Linux Kernel Newbies + Linux Memory Management docs. Build an arena allocator from scratch. Pair this with reading SQLite (best-documented C codebase) or sled-like data structures.",
    library: "All eight categories. Read each pattern slowly, predict the output, type it yourself, run with -fsanitize=address. The library IS the curriculum once you've grasped pointers.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What broke?",
    opts: [
      { label: "🔴 Compile error: 'undefined reference to X'", next: 'undef-ref' },
      { label: "🔴 Compile error: implicit declaration / type mismatch / syntax", next: 'compile-err' },
      { label: "🔴 Program crashes — segfault / bus error", next: 'segfault' },
      { label: "🔴 AddressSanitizer / valgrind reports an error", next: 'asan' },
      { label: "🔴 Linker error not 'undefined reference'", next: 'link-other' },
      { label: "🐛 Program runs but result is wrong", next: 'logic-err' },
      { label: "🐢 Program is too slow", next: 'slow-err' },
      { label: "❔ Mystery — works on my machine, fails elsewhere", next: 'portability' },
    ],
  },
  'undef-ref': {
    fix: "The linker can't find a symbol that some object references.",
    steps: [
      "READ the symbol name. `undefined reference to 'foo'` means foo was declared but never defined in any object you linked.",
      "Did you forget to add the .c file to your compile command? `gcc main.c util.c -o app` — every .c that defines a used function must be there.",
      "Library missing? `undefined reference to 'sqrt'` → add `-lm` (link libm).",
      "Function defined but never compiled? Check Makefile rules.",
      "C++ calling C? Wrap C headers in extern \"C\".",
      "Static function declared in header, defined in another .c? `static` means file-scope — invisible to the linker. Drop static or move the function.",
      "Inline function with no out-of-line definition? Either move the definition to header (with static or inline), or provide a non-inline copy in some .c.",
    ],
  },
  'compile-err': {
    fix: "The compiler is rejecting the source. Read the FIRST error — later ones are usually fallout.",
    steps: [
      "`implicit declaration of function 'foo'` → include the header that declares foo. C99+ requires declarations before use.",
      "`incompatible pointer types` → check types on both sides. `int *` ≠ `const int *` ≠ `long *`. The cast you're tempted to add is hiding a real bug 80% of the time.",
      "`expected ';' before '}' token` → look at the line ABOVE the error. C is line-insensitive; missing semicolons cascade.",
      "`error: 'X' undeclared` → typo, missing header, or you put `int x` in a deeper scope than the use site.",
      "`error: redefinition of 'X'` → header included twice without guards; add #pragma once or #ifndef X_H / #define X_H / ... / #endif.",
      "`'struct foo' has no member 'bar'` → typo, or you're using -> on a non-pointer (or . on a pointer).",
    ],
  },
  'segfault': {
    fix: "You dereferenced an invalid address. Almost always one of: NULL, freed pointer, uninitialized pointer, out-of-bounds.",
    steps: [
      "Recompile with `-g -fsanitize=address,undefined` and rerun. ASAN reports the exact line of the bad access AND the line that freed/wrote the source pointer. This is the fastest path to a fix.",
      "No sanitizers? Use gdb: `gdb ./app`, then `run`. When it crashes: `bt` for backtrace, `p variable` to inspect.",
      "Common: dereferencing return of malloc/fopen/etc. without checking for NULL.",
      "Common: walking a string/array off the end.",
      "Common: use-after-free — freed something, kept the pointer, used it later.",
      "Common: stack overflow from infinite recursion. ASAN catches this too.",
      "Print the pointer first: `printf(\"p=%p\\n\", (void *)p);` — if it's 0x0, you have a NULL deref; tiny number means uninitialized; address >>> heap means corruption.",
    ],
  },
  'asan': {
    fix: "Sanitizer found a real bug. Trust the diagnostic.",
    steps: [
      "`heap-buffer-overflow` → array index out of bounds, or off-by-one in a loop, or strcpy with insufficient destination.",
      "`heap-use-after-free` → you accessed p after free(p). Set p = NULL after free; never trust 'I won't use it.'",
      "`stack-buffer-overflow` → wrote past a local array. Often strcpy/sprintf into too-small char buffer.",
      "`memory leak` → malloc without matching free along some code path. Match every malloc with a free; use cleanup labels.",
      "`double-free` → calling free twice. Set to NULL after first free, since free(NULL) is safe.",
      "`use of uninitialized value` (MSAN) → declared a variable, didn't assign, then read it. Initialize at declaration or before first use.",
    ],
  },
  'link-other': {
    fix: "Linker error other than undefined-reference.",
    steps: [
      "`multiple definition of 'X'` → same global defined in multiple .c files. Either it should be static (file-scope) or declared extern in header and defined in ONE .c.",
      "`relocation truncated to fit` → usually a memory-model issue in embedded code, or trying to put -mcmodel=small code at a high address. Adjust mcmodel.",
      "`cannot find -lXYZ` → linker can't find libXYZ.so/.a. Install the dev package (libxyz-dev) or add -L<path>.",
      "Architecture mismatch (.o files from different ABIs) → recompile from clean state.",
    ],
  },
  'logic-err': {
    fix: "No crash, just wrong output. Time for real debugging.",
    steps: [
      "printf debug: print every relevant variable at every suspect step. Use `%d` for int, `%lu` for size_t, `%p` for pointers, `%s` for strings.",
      "Better: use gdb. breakpoints + step + print. `b main`, `r`, then `n`, `s`, `p var`. ASAN-built program still runs under gdb.",
      "Off-by-one? Print loop bounds. `for (i = 0; i <= n; i++)` should usually be `< n`.",
      "Signed/unsigned bug? -Wsign-compare. Mixed comparisons are silently wrong.",
      "Aliasing bug? Two pointers refer to the same memory but you assumed they didn't. Check.",
      "Floating point? Don't compare floats with ==. Use fabs(a - b) < epsilon.",
    ],
  },
  'slow-err': {
    fix: "Profile FIRST. Optimize the hot spot. Repeat.",
    steps: [
      "`perf record ./app && perf report` (Linux). Or Instruments (macOS), VTune. Find the top hotspots.",
      "Compile with -O2 or -O3 for releases. Don't profile -O0 builds — totally different behavior.",
      "Big-O issue? An algorithm change (O(n²) → O(n log n)) beats any micro-optimization.",
      "Cache miss? Access patterns matter. struct-of-arrays often beats array-of-structs for sequential processing.",
      "Function calls in hot loop? `static inline` to encourage inlining. Or compute outside the loop.",
      "Allocations in hot loop? Pre-allocate outside, reuse. Arena allocators win here.",
      "Branch mispredictions? Check `perf stat -e branch-misses`. Sort data; remove unpredictable branches in hot loops.",
    ],
  },
  'portability': {
    fix: "Code that works on one platform fails on another. Almost always an assumption broken by the new environment.",
    steps: [
      "Integer sizes: sizeof(long) differs (8 on Linux, 4 on Windows). Use stdint.h types (int32_t, uint64_t) for anything that travels.",
      "Endianness: little-endian on x86/ARM; big-endian historically. Use htonl/ntohl for network, ntoh for file formats, never raw memcpy of multi-byte values.",
      "Character signedness: `char` is signed on x86, unsigned on ARM. Use `signed char` or `unsigned char` explicitly.",
      "Path separators: '/' on Unix, '\\' on Windows. Build a portable join function.",
      "Line endings: \\n on Unix, \\r\\n on Windows. Open files with 'rb'/'wb' for binary mode to bypass translation.",
      "Compiler extensions: gcc-specific attributes won't work on MSVC. Wrap in #ifdef __GNUC__ blocks.",
      "Undefined behavior: a UB program may work by accident on one compiler. The next release breaks it. Run with sanitizers on all targets.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'src', x: 30, y: 18, w: 95, h: 32, label: '.c source', color: '#fb923c', desc: "Your source files — text. Each .c file is a translation unit (TU). #include lines name other files (headers) to be slurped in by the preprocessor." },
  { id: 'pp', x: 30, y: 78, w: 95, h: 32, label: 'Preprocessor', color: '#fb923c', desc: "cpp (gcc -E). Expands #include, substitutes #define macros, evaluates #if/#ifdef. Pure text transformation — doesn't understand C grammar. Output: a single .i file per TU." },
  { id: 'cc', x: 30, y: 138, w: 95, h: 32, label: 'Compiler', color: '#60a5fa', desc: "cc1 (gcc -S). Lexes, parses, type-checks, generates assembly. Where -Wall warnings come from. Where optimizations run (-O1/-O2/-O3). Output: .s file (assembly)." },
  { id: 'as', x: 30, y: 198, w: 95, h: 32, label: 'Assembler', color: '#60a5fa', desc: "as (gcc -c). Assembly → machine code. Output: .o file (object). Contains compiled code + symbol table (defined symbols, references to undefined ones)." },
  { id: 'ld', x: 175, y: 198, w: 95, h: 32, label: 'Linker', color: '#f87171', desc: "ld (gcc final stage). Combines .o files + libraries, resolves cross-TU references (function calls between files), produces final executable or library. Most cryptic errors live here." },
  { id: 'exe', x: 175, y: 138, w: 95, h: 32, label: 'Executable', color: '#60a5fa', desc: "ELF (Linux/BSD), Mach-O (macOS), PE (Windows). Contains machine code + data segments + dynamic linking info. Runs when you ./app." },
  { id: 'lib', x: 175, y: 18, w: 95, h: 32, label: 'Headers / libs', color: '#fb923c', desc: ".h files included via #include. .a (static, baked into your exe) or .so/.dylib (dynamic, loaded at runtime). libc + libm + your project headers." },
  { id: 'sym', x: 175, y: 78, w: 95, h: 32, label: 'Symbol table', color: '#f87171', desc: "What each .o defines (function names, globals) and what it references but doesn't define. The linker matches references → definitions across all .o files." },
];

const CHALLENGES = [
  {
    id: 'hello',
    title: '01 · Hello, world',
    desc: "The classic. Print 'Hello, World!' followed by a newline.",
    starter: `#include <stdio.h>

int main(void) {
    /* your code */
    return 0;
}
`,
    expected: 'Hello, World!\n',
  },
  {
    id: 'sum',
    title: '02 · Sum an array',
    desc: "Complete sum() so that main() prints 15.",
    starter: `#include <stdio.h>

int sum(int *arr, int n) {
    /* your code */
}

int main(void) {
    int data[] = { 1, 2, 3, 4, 5 };
    printf("%d\\n", sum(data, 5));
    return 0;
}
`,
    expected: '15\n',
  },
  {
    id: 'reverse',
    title: '03 · Reverse in place',
    desc: "Reverse a string in place. Output: olleh",
    starter: `#include <stdio.h>
#include <string.h>

void reverse(char *s) {
    /* your code */
}

int main(void) {
    char buf[] = "hello";
    reverse(buf);
    printf("%s\\n", buf);
    return 0;
}
`,
    expected: 'olleh\n',
  },
  {
    id: 'count_vowels',
    title: '04 · Count vowels',
    desc: "Count vowels (a/e/i/o/u, case-insensitive). Output: 3",
    starter: `#include <stdio.h>
#include <ctype.h>

int count_vowels(const char *s) {
    /* your code */
}

int main(void) {
    printf("%d\\n", count_vowels("Hello World"));
    return 0;
}
`,
    expected: '3\n',
  },
  {
    id: 'fizzbuzz',
    title: '05 · FizzBuzz (1..15)',
    desc: "Print numbers 1-15, but: multiples of 3 → Fizz, multiples of 5 → Buzz, both → FizzBuzz. One per line.",
    starter: `#include <stdio.h>

int main(void) {
    /* your code */
    return 0;
}
`,
    expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n',
  },
  {
    id: 'struct_sort',
    title: '06 · Struct + qsort',
    desc: "Sort scores ascending. Output: 12 45 78 91",
    starter: `#include <stdio.h>
#include <stdlib.h>

typedef struct { int score; } Item;

int compare(const void *a, const void *b) {
    /* return negative / 0 / positive */
}

int main(void) {
    Item items[] = { {91}, {12}, {78}, {45} };
    qsort(items, 4, sizeof(Item), compare);
    for (int i = 0; i < 4; i++) printf("%d%c", items[i].score, i == 3 ? '\\n' : ' ');
    return 0;
}
`,
    expected: '12 45 78 91\n',
  },
];

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'catlas:';
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
  memory: {
    label: 'Memory',
    icon: '◧',
    snippets: [
      {
        id: 'goto-cleanup',
        title: 'Cleanup with goto',
        desc: "C has no destructors. The Linux-kernel idiom: one exit point, LIFO cleanup, every error path resource-safe.",
        code: `int do_work(const char *path, char **out) {
    FILE *f = NULL;
    char *buf = NULL;
    int result = -1;             /* default: failure */

    f = fopen(path, "r");
    if (!f) goto cleanup;

    buf = malloc(4096);
    if (!buf) goto cleanup;

    if (fread(buf, 1, 4096, f) == 0) goto cleanup;

    *out = buf;
    buf = NULL;                  /* ownership transferred — don't free below */
    result = 0;                  /* success */

cleanup:
    free(buf);                   /* free(NULL) is safe */
    if (f) fclose(f);
    return result;
}`,
        note: "Initialize all resource pointers to NULL up front. Set transferred pointers to NULL before goto so cleanup doesn't free them. Single exit means single audit point."
      },
      {
        id: 'arena',
        title: 'Arena (bump) allocator',
        desc: "Allocate many objects, free all at once. Zero fragmentation, O(1) alloc, ideal for parsers, per-frame game code, per-request servers.",
        code: `typedef struct {
    char *base;
    size_t cap;
    size_t used;
} Arena;

Arena arena_create(size_t cap) {
    Arena a = { malloc(cap), cap, 0 };
    return a;
}

void *arena_alloc(Arena *a, size_t bytes) {
    /* align bytes to 16 — adjust for your data */
    size_t aligned = (bytes + 15) & ~(size_t)15;
    if (a->used + aligned > a->cap) return NULL;
    void *p = a->base + a->used;
    a->used += aligned;
    return p;
}

void arena_reset(Arena *a) { a->used = 0; }
void arena_destroy(Arena *a) { free(a->base); a->base = NULL; a->used = a->cap = 0; }`,
        note: "No individual free(). Lifetime tied to the arena. Reset reuses the buffer (great for per-frame allocators). Pair with thread-local arenas for lock-free per-thread pools."
      },
      {
        id: 'dynarray',
        title: 'Dynamic array (vector)',
        desc: "Grow-by-2x amortizes append to O(1). The standard pattern when you don't know the final size.",
        code: `typedef struct {
    int *data;
    size_t len;
    size_t cap;
} IntVec;

int vec_push(IntVec *v, int x) {
    if (v->len == v->cap) {
        size_t new_cap = v->cap ? v->cap * 2 : 8;
        int *new_data = realloc(v->data, new_cap * sizeof *new_data);
        if (!new_data) return -1;   /* old data still valid */
        v->data = new_data;
        v->cap = new_cap;
    }
    v->data[v->len++] = x;
    return 0;
}

void vec_free(IntVec *v) {
    free(v->data);
    v->data = NULL;
    v->len = v->cap = 0;
}`,
        note: "ALWAYS use a temp for realloc; don't overwrite v->data directly — if realloc fails (returns NULL), the original is still valid and you'd leak it otherwise. Initial cap of 8 amortizes small-vector allocations."
      },
      {
        id: 'ring',
        title: 'Ring (circular) buffer',
        desc: "Fixed-size FIFO. Producer writes, consumer reads, no allocations in steady state. Common in embedded + audio.",
        code: `#define RING_CAP 256

typedef struct {
    uint8_t buf[RING_CAP];
    size_t head;                 /* next write */
    size_t tail;                 /* next read */
    size_t count;                /* current fill */
} Ring;

int ring_push(Ring *r, uint8_t b) {
    if (r->count == RING_CAP) return -1;   /* full */
    r->buf[r->head] = b;
    r->head = (r->head + 1) % RING_CAP;
    r->count++;
    return 0;
}

int ring_pop(Ring *r, uint8_t *out) {
    if (r->count == 0) return -1;          /* empty */
    *out = r->buf[r->tail];
    r->tail = (r->tail + 1) % RING_CAP;
    r->count--;
    return 0;
}`,
        note: "Use a power-of-2 capacity and (i & (CAP-1)) instead of % CAP — faster on most CPUs. For SPSC (single producer, single consumer) lock-free, use atomic indices with appropriate memory orderings (C11 stdatomic.h)."
      },
      {
        id: 'pool',
        title: 'Fixed-size pool allocator',
        desc: "Allocate fixed-size blocks with O(1) free. Great for ECS components, game entities, packet headers.",
        code: `typedef struct PoolNode { struct PoolNode *next; } PoolNode;

typedef struct {
    void *blocks;
    PoolNode *free_list;
    size_t block_size;
    size_t capacity;
} Pool;

Pool pool_create(size_t block_size, size_t count) {
    /* round up so each block can hold a PoolNode pointer */
    if (block_size < sizeof(PoolNode)) block_size = sizeof(PoolNode);
    Pool p = { malloc(block_size * count), NULL, block_size, count };

    /* thread all blocks into the free list */
    char *base = (char *)p.blocks;
    for (size_t i = 0; i < count; i++) {
        PoolNode *node = (PoolNode *)(base + i * block_size);
        node->next = p.free_list;
        p.free_list = node;
    }
    return p;
}

void *pool_alloc(Pool *p) {
    if (!p->free_list) return NULL;
    PoolNode *node = p->free_list;
    p->free_list = node->next;
    return node;
}

void pool_free(Pool *p, void *block) {
    PoolNode *node = (PoolNode *)block;
    node->next = p->free_list;
    p->free_list = node;
}`,
        note: "Free list is intrusive (uses first sizeof(ptr) bytes of each block). pool_alloc/free are O(1) and never fragment. Pool itself is freed with one free(p.blocks)."
      },
    ],
  },
  strings: {
    label: 'Strings',
    icon: '⌨',
    snippets: [
      {
        id: 'safe-copy',
        title: 'Safe string copy',
        desc: "strcpy + strcat are unsafe (no bounds). snprintf is the modern replacement — always bounded, always null-terminates (if size > 0).",
        code: `/* GOOD: snprintf truncates instead of overflowing */
char dest[64];
int n = snprintf(dest, sizeof dest, "%s/%s.log", dir, name);
if (n < 0 || (size_t)n >= sizeof dest) {
    /* truncation or encoding error — dest is still null-terminated */
    fprintf(stderr, "name too long\\n");
    return -1;
}

/* BAD: strcpy, strcat — no bounds checking */
strcpy(dest, dir);       /* DON'T */
strcat(dest, "/");
strcat(dest, name);
strcat(dest, ".log");`,
        note: "snprintf returns the length that WOULD have been written (excluding null). >= size means truncation. The sizeof operator works only on stack arrays — for pointers/dynamic buffers, track the size separately."
      },
      {
        id: 'parse-int',
        title: 'Parse int with error checking',
        desc: "atoi() has no failure mode — atoi(\"abc\") returns 0. strtol() gives full error reporting.",
        code: `#include <errno.h>
#include <limits.h>
#include <stdlib.h>

/* Returns 0 on success, -1 on error */
int parse_int(const char *s, int *out) {
    if (!s || !*s) return -1;
    char *end;
    errno = 0;
    long v = strtol(s, &end, 10);

    if (errno == ERANGE)     return -1;   /* overflow */
    if (end == s)            return -1;   /* no digits parsed */
    if (*end != '\\0')        return -1;   /* trailing garbage */
    if (v < INT_MIN || v > INT_MAX) return -1;  /* doesn't fit int */

    *out = (int)v;
    return 0;
}`,
        note: "Same pattern for strtoul, strtod, strtoull. Always check errno (set on overflow), end (was anything parsed?), and trailing chars. The five lines of error handling are what separates production code from quick scripts."
      },
      {
        id: 'tokenize',
        title: 'Tokenize without strtok',
        desc: "strtok modifies its input and uses internal static state (not thread-safe). strsep is cleaner and reentrant.",
        code: `#include <string.h>

/* strsep is POSIX — preferred over strtok */
void parse_csv_line(char *line) {
    char *cursor = line;
    char *token;
    while ((token = strsep(&cursor, ",")) != NULL) {
        /* token may be empty (consecutive delimiters) */
        printf("[%s]\\n", token);
    }
}

/* Pure standard-C version: strtok_r if strsep unavailable */
void parse_csv_line_r(char *line) {
    char *saveptr;
    char *token = strtok_r(line, ",", &saveptr);
    while (token) {
        printf("[%s]\\n", token);
        token = strtok_r(NULL, ",", &saveptr);
    }
}`,
        note: "strtok skips empty tokens (treats consecutive delimiters as one); strsep doesn't. For CSV where empty fields matter, use strsep. Both modify the input — make a copy if you need the original later."
      },
      {
        id: 'string-builder',
        title: 'Append-only string builder',
        desc: "Build a string by repeated append. Grows like a vector. Cleaner than repeated snprintf into a fixed buffer.",
        code: `typedef struct {
    char *data;
    size_t len;
    size_t cap;
} StrBuf;

int sb_appendf(StrBuf *sb, const char *fmt, ...) {
    va_list ap;
    va_start(ap, fmt);

    /* First, ask snprintf how many bytes it needs (size=0 returns count) */
    va_list ap2;
    va_copy(ap2, ap);
    int needed = vsnprintf(NULL, 0, fmt, ap2);
    va_end(ap2);

    if (needed < 0) { va_end(ap); return -1; }

    /* Grow if necessary — +1 for null */
    size_t new_len = sb->len + (size_t)needed;
    if (new_len + 1 > sb->cap) {
        size_t new_cap = sb->cap ? sb->cap * 2 : 64;
        while (new_cap < new_len + 1) new_cap *= 2;
        char *new_data = realloc(sb->data, new_cap);
        if (!new_data) { va_end(ap); return -1; }
        sb->data = new_data;
        sb->cap = new_cap;
    }

    vsnprintf(sb->data + sb->len, sb->cap - sb->len, fmt, ap);
    sb->len = new_len;
    va_end(ap);
    return 0;
}`,
        note: "Needed for log builders, JSON serializers, HTML/SQL constructors. vsnprintf(NULL, 0, ...) is the standard 'how big would this be?' trick. Always va_copy when consuming a va_list twice."
      },
      {
        id: 'starts-ends',
        title: 'String predicates',
        desc: "starts_with / ends_with / contains. C lacks built-ins; here are the canonical short versions.",
        code: `#include <string.h>
#include <stdbool.h>

bool starts_with(const char *s, const char *prefix) {
    return strncmp(s, prefix, strlen(prefix)) == 0;
}

bool ends_with(const char *s, const char *suffix) {
    size_t sl = strlen(s), pl = strlen(suffix);
    return pl <= sl && memcmp(s + sl - pl, suffix, pl) == 0;
}

bool contains(const char *s, const char *needle) {
    return strstr(s, needle) != NULL;
}

/* Case-insensitive compare (POSIX — non-standard in pure C) */
#include <strings.h>
int icmp = strcasecmp(a, b);`,
        note: "ends_with uses memcmp (not strncmp) because we already know lengths — slightly faster, and we've bounds-checked already. C23 may standardize strcasecmp; until then, it's POSIX."
      },
    ],
  },
  ds: {
    label: 'Data Structures',
    icon: '◇',
    snippets: [
      {
        id: 'linked-list',
        title: 'Singly linked list (intrusive)',
        desc: "Embed the link node IN the data type — saves an allocation per node. Linux kernel uses this style throughout.",
        code: `typedef struct ListNode {
    struct ListNode *next;
} ListNode;

typedef struct {
    ListNode link;             /* MUST be first member for casts to work */
    char name[32];
    int value;
} Item;

/* Push front — O(1) */
void list_push(ListNode **head, ListNode *node) {
    node->next = *head;
    *head = node;
}

/* Iterate */
for (ListNode *cur = head; cur != NULL; cur = cur->next) {
    Item *item = (Item *)cur;     /* link is first → safe cast */
    printf("%s = %d\\n", item->name, item->value);
}`,
        note: "Compare to non-intrusive (separate node struct holding a void* data) which needs an extra malloc per insert. Intrusive avoids that. Trade-off: an item can be in at most one list of a given type."
      },
      {
        id: 'hashmap',
        title: 'Hash map (open addressing)',
        desc: "Linear probing on a power-of-2 sized table. Simpler and often faster than chaining. ~80% of the value of a 'real' hash map in 50 lines.",
        code: `#define MAP_INIT 16

typedef struct { uint64_t key; uint64_t val; uint8_t state; } Entry;
/* state: 0 empty, 1 occupied, 2 tombstone */

typedef struct { Entry *t; size_t cap; size_t n; } Map;

/* FNV-1a or similar — for production, use SipHash */
static uint64_t mix(uint64_t k) {
    k ^= k >> 33; k *= 0xff51afd7ed558ccdULL;
    k ^= k >> 33; k *= 0xc4ceb9fe1a85ec53ULL;
    k ^= k >> 33;
    return k;
}

void map_set(Map *m, uint64_t key, uint64_t val) {
    if (m->n * 2 >= m->cap) {        /* resize at 50% load */
        size_t new_cap = m->cap ? m->cap * 2 : MAP_INIT;
        Entry *new_t = calloc(new_cap, sizeof *new_t);
        for (size_t i = 0; i < m->cap; i++) {
            if (m->t[i].state == 1) {
                size_t j = mix(m->t[i].key) & (new_cap - 1);
                while (new_t[j].state) j = (j + 1) & (new_cap - 1);
                new_t[j] = m->t[i];
            }
        }
        free(m->t);
        m->t = new_t;
        m->cap = new_cap;
    }
    size_t i = mix(key) & (m->cap - 1);
    while (m->t[i].state == 1 && m->t[i].key != key) i = (i + 1) & (m->cap - 1);
    if (m->t[i].state != 1) m->n++;
    m->t[i] = (Entry){ key, val, 1 };
}

int map_get(const Map *m, uint64_t key, uint64_t *out) {
    if (!m->cap) return -1;
    size_t i = mix(key) & (m->cap - 1);
    while (m->t[i].state) {
        if (m->t[i].state == 1 && m->t[i].key == key) { *out = m->t[i].val; return 0; }
        i = (i + 1) & (m->cap - 1);
    }
    return -1;
}`,
        note: "Power-of-2 capacity allows `& (cap-1)` instead of `% cap`. Tombstones (state=2) preserve probe chains after deletion. For variable-size keys (strings), hash the key bytes; store key pointer + length."
      },
      {
        id: 'stack-array',
        title: 'Stack on an array',
        desc: "LIFO using a dynamic array. push/pop O(1) amortized.",
        code: `typedef struct { int *data; size_t len; size_t cap; } Stack;

int stack_push(Stack *s, int v) {
    if (s->len == s->cap) {
        size_t nc = s->cap ? s->cap * 2 : 8;
        int *nd = realloc(s->data, nc * sizeof *nd);
        if (!nd) return -1;
        s->data = nd; s->cap = nc;
    }
    s->data[s->len++] = v;
    return 0;
}

int stack_pop(Stack *s, int *out) {
    if (s->len == 0) return -1;
    *out = s->data[--s->len];
    return 0;
}`,
        note: "Same shape as IntVec from Memory. The 'specialized' stack/queue/vector are all the same pattern — sometimes worth a generic-via-macros version, more often worth separate typed versions."
      },
      {
        id: 'queue-ring',
        title: 'Queue on a ring',
        desc: "FIFO. Fixed capacity. O(1) enqueue + dequeue. (See Memory > ring buffer for the byte version — same idea.)",
        code: `typedef struct {
    int *data;
    size_t cap;
    size_t head, tail, count;
} Queue;

int q_push(Queue *q, int v) {
    if (q->count == q->cap) return -1;
    q->data[q->head] = v;
    q->head = (q->head + 1) % q->cap;
    q->count++;
    return 0;
}

int q_pop(Queue *q, int *out) {
    if (q->count == 0) return -1;
    *out = q->data[q->tail];
    q->tail = (q->tail + 1) % q->cap;
    q->count--;
    return 0;
}`,
        note: "Capacity is fixed (allocated once at creation). For growable, use a deque (head/tail can move and grow). For SPSC lock-free between threads, use stdatomic and a power-of-2 capacity."
      },
    ],
  },
  io: {
    label: 'I/O',
    icon: '⇄',
    snippets: [
      {
        id: 'read-whole-file',
        title: 'Read whole file into memory',
        desc: "fseek + ftell + fread. Common for configs, small inputs. Returns a heap buffer + length.",
        code: `#include <stdio.h>
#include <stdlib.h>

/* Returns malloc'd buffer (null-terminated for safety) + sets *len, or NULL on error.
   Caller owns and must free(). */
char *read_file(const char *path, size_t *len) {
    FILE *f = fopen(path, "rb");
    if (!f) return NULL;

    if (fseek(f, 0, SEEK_END) != 0) { fclose(f); return NULL; }
    long sz = ftell(f);
    if (sz < 0)                    { fclose(f); return NULL; }
    rewind(f);

    char *buf = malloc((size_t)sz + 1);
    if (!buf)                       { fclose(f); return NULL; }

    size_t got = fread(buf, 1, (size_t)sz, f);
    fclose(f);
    if (got != (size_t)sz) { free(buf); return NULL; }

    buf[sz] = '\\0';
    if (len) *len = (size_t)got;
    return buf;
}`,
        note: "rb mode prevents Windows \\r\\n translation. +1 byte and \\0 terminator means you can treat the buffer as a C string even if file is text. For huge files use mmap (POSIX) — no copy, OS pages in on demand."
      },
      {
        id: 'read-line-by-line',
        title: 'Read line by line',
        desc: "fgets reads up to a newline. Handle the case of lines longer than the buffer.",
        code: `#include <stdio.h>
#include <string.h>

void process_lines(FILE *f) {
    char line[1024];
    while (fgets(line, sizeof line, f)) {
        /* Strip trailing newline if present */
        size_t n = strlen(line);
        if (n > 0 && line[n - 1] == '\\n') line[n - 1] = '\\0';
        /* line may not be a full line if it was > 1023 bytes — check */
        process(line);
    }
    if (ferror(f)) { perror("read error"); }
}

/* POSIX getline() handles arbitrary-length lines (allocates) */
#include <stdio.h>
char *line = NULL;
size_t cap = 0;
ssize_t n;
while ((n = getline(&line, &cap, f)) != -1) {
    /* line has up to n chars, may contain \\n */
    process_with_length(line, n);
}
free(line);  /* once, at end */`,
        note: "fgets is standard, getline is POSIX but better (no truncation). For binary data containing zero bytes, neither works — use fread directly."
      },
      {
        id: 'binary-struct',
        title: 'Binary record I/O',
        desc: "Read/write fixed-size structs. Watch alignment + endianness for cross-platform formats.",
        code: `#include <stdio.h>
#include <stdint.h>

#pragma pack(push, 1)             /* prevent padding */
typedef struct {
    uint32_t magic;               /* 'FILE' = 0x46494C45 */
    uint16_t version;
    uint16_t record_count;
} Header;
#pragma pack(pop)

int write_header(FILE *f, uint16_t n) {
    Header h = { 0x46494C45u, 1, n };
    return fwrite(&h, sizeof h, 1, f) == 1 ? 0 : -1;
}

int read_header(FILE *f, Header *h) {
    if (fread(h, sizeof *h, 1, f) != 1) return -1;
    if (h->magic != 0x46494C45u) return -1;
    return 0;
}`,
        note: "#pragma pack disables padding — required for on-disk/network formats. For portable formats: serialize each field individually with explicit endianness (htonl + fwrite). Less convenient but bulletproof."
      },
      {
        id: 'printf-safe',
        title: 'Format specifier reference',
        desc: "The cheatsheet for printf families. Wrong specifier = UB.",
        code: `printf("%d",    int);
printf("%u",    unsigned int);
printf("%ld",   long);
printf("%lu",   unsigned long);
printf("%lld",  long long);
printf("%zu",   size_t);                       /* not %d, not %lu */
printf("%zd",   ssize_t / ptrdiff_t);
printf("%f",    double);
printf("%.3f",  double);                        /* 3 decimal places */
printf("%e",    double);                        /* scientific */
printf("%c",    int);                           /* single char */
printf("%s",    const char *);                  /* must be \\0-terminated */
printf("%.*s",  int, const char *);             /* non-terminated, length-limited */
printf("%p",    (void *) ptr);                  /* cast! */
printf("%x",    unsigned int);                  /* hex lowercase */
printf("%08x",  unsigned int);                  /* hex, 8 chars, zero-padded */

/* C99 from <inttypes.h> for fixed-width types */
#include <inttypes.h>
printf("%" PRIu32 "\\n", my_uint32);
printf("%" PRId64 "\\n", my_int64);`,
        note: "size_t is %zu, NOT %u or %lu. ptr is %p AFTER (void *) cast. Use PRId32/PRIu32/etc for portable printing of int32_t/uint32_t. Mismatched format string + arg type is UB (and -Wformat warns)."
      },
    ],
  },
  errors: {
    label: 'Errors',
    icon: '!',
    snippets: [
      {
        id: 'errno',
        title: 'errno pattern',
        desc: "Standard library failure mode. Check return value FIRST, then errno.",
        code: `#include <errno.h>
#include <string.h>
#include <stdio.h>

errno = 0;                                /* reset before call */
FILE *f = fopen(path, "r");
if (!f) {
    fprintf(stderr, "open '%s': %s\\n", path, strerror(errno));
    return -1;
}

/* For perror style (writes to stderr with errno description) */
if (!f) { perror("fopen"); return -1; }

/* Don't trust errno without a failure indication from the function */
size_t n = strtoul(s, &end, 10);   /* errno=0 first, then check end + errno */`,
        note: "errno is thread-local in modern stdlibs. NEVER use errno value from a previous call. Errno values aren't always meaningful between unrelated calls. perror() is shorthand for the strerror pattern, less flexible."
      },
      {
        id: 'return-codes',
        title: 'Return code conventions',
        desc: "Three common patterns for signaling failure. Pick one per project and apply uniformly.",
        code: `/* Pattern 1: 0 success, -1 error (POSIX style) */
int read_config(const char *path) {
    if (!path) return -1;
    /* ... */
    return 0;
}

/* Pattern 2: pointer return — NULL on failure (allocates / lookups) */
char *load_string(const char *key) {
    if (!found(key)) return NULL;
    /* ... */
}

/* Pattern 3: out-param + return code (most flexible) */
int parse_user(const char *s, User *out) {
    if (!s || !out) return -1;
    out->name = /* ... */;
    return 0;
}`,
        note: "Match the convention of surrounding code. POSIX-style 0/-1 is most common in C. Mixing styles within a project is the bug source — pick one. Document ownership in the comment: who frees what."
      },
      {
        id: 'assert',
        title: 'assert vs runtime check',
        desc: "assert is for programmer errors (invariants). Real runtime errors get real handling.",
        code: `#include <assert.h>

/* assert: precondition / invariant — compiled out with -DNDEBUG */
void buffer_set(Buffer *b, size_t i, int v) {
    assert(b != NULL);             /* programmer screwed up */
    assert(i < b->len);
    b->data[i] = v;
}

/* RUNTIME check: input validation, anything user/network-driven */
int parse_user_input(const char *s, int *out) {
    if (!s) return -1;             /* not an assert — user might really pass NULL */
    if (strlen(s) > MAX) {
        log_error("input too long");
        return -1;
    }
    /* ... */
}`,
        note: "Rule: if -DNDEBUG would change correctness, you used assert for the wrong thing. Asserts catch impossible-in-theory cases (caught in dev, optimized away in prod). Real errors deserve real handling."
      },
    ],
  },
  system: {
    label: 'System',
    icon: '◆',
    snippets: [
      {
        id: 'fork-exec',
        title: 'Spawn a process (fork+exec)',
        desc: "POSIX. Run another program, optionally wait for result. The basis of every shell.",
        code: `#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

int run_command(const char *prog, char *const argv[]) {
    pid_t pid = fork();
    if (pid < 0) { perror("fork"); return -1; }

    if (pid == 0) {
        /* Child */
        execvp(prog, argv);
        /* If exec returns, it failed */
        perror("execvp");
        _exit(127);                /* _exit, not exit — don't flush parent's stdio */
    }

    /* Parent — wait for child */
    int status;
    if (waitpid(pid, &status, 0) < 0) { perror("waitpid"); return -1; }
    if (WIFEXITED(status))   return WEXITSTATUS(status);
    if (WIFSIGNALED(status)) return 128 + WTERMSIG(status);
    return -1;
}

/* Example */
char *args[] = { "ls", "-la", NULL };
int rc = run_command("ls", args);`,
        note: "_exit instead of exit in the child path avoids flushing the parent's buffered stdio twice. argv[0] by convention matches prog name; final NULL terminator required. For piped I/O, use pipe() + dup2 between fork and exec."
      },
      {
        id: 'signal',
        title: 'Signal handler',
        desc: "Async-signal-safe handling. Don't call malloc/printf/most things inside a handler.",
        code: `#include <signal.h>
#include <stdatomic.h>
#include <unistd.h>

static volatile sig_atomic_t g_shutdown = 0;

static void on_sigint(int sig) {
    (void)sig;
    g_shutdown = 1;                /* sig_atomic_t writes are safe */
    /* DON'T: malloc, printf, fprintf, free... */
    /* DO: write(2, "got SIGINT\\n", 11);  — write is async-signal-safe */
}

int main(void) {
    struct sigaction sa = {0};
    sa.sa_handler = on_sigint;
    sigemptyset(&sa.sa_mask);
    sa.sa_flags = SA_RESTART;
    sigaction(SIGINT, &sa, NULL);

    while (!g_shutdown) {
        /* main loop */
    }
    return 0;
}`,
        note: "sigaction is preferred over signal() (more control, defined semantics). The list of async-signal-safe functions is small (signal.h documents it). For complex shutdown, set a flag + check from main loop."
      },
      {
        id: 'tcp-client',
        title: 'TCP client (minimal)',
        desc: "Connect, send, receive, close. Beej's Guide has the full treatment; this is the skeleton.",
        code: `#include <sys/socket.h>
#include <netdb.h>
#include <unistd.h>
#include <string.h>

int tcp_connect(const char *host, const char *port) {
    struct addrinfo hints = {0}, *res, *p;
    hints.ai_family = AF_UNSPEC;     /* IPv4 or IPv6 */
    hints.ai_socktype = SOCK_STREAM; /* TCP */

    if (getaddrinfo(host, port, &hints, &res) != 0) return -1;

    int fd = -1;
    for (p = res; p; p = p->ai_next) {
        fd = socket(p->ai_family, p->ai_socktype, p->ai_protocol);
        if (fd < 0) continue;
        if (connect(fd, p->ai_addr, p->ai_addrlen) == 0) break;
        close(fd);
        fd = -1;
    }
    freeaddrinfo(res);
    return fd;
}

/* Example: HTTP/1.0 GET */
int fd = tcp_connect("example.com", "80");
const char *req = "GET / HTTP/1.0\\r\\nHost: example.com\\r\\n\\r\\n";
write(fd, req, strlen(req));
char buf[4096];
ssize_t n;
while ((n = read(fd, buf, sizeof buf)) > 0) {
    write(1, buf, n);              /* stdout */
}
close(fd);`,
        note: "getaddrinfo handles DNS and gives AF_INET/AF_INET6 in one go. Always loop over results (host may resolve to multiple addresses). Modern TCP usually wants TCP_NODELAY for low-latency apps. For TLS, use OpenSSL or libtls."
      },
    ],
  },
  perf: {
    label: 'Performance',
    icon: '⚡',
    snippets: [
      {
        id: 'cache-loop',
        title: 'Cache-friendly iteration',
        desc: "Sequential access is ~10× faster than random. Hot loops should walk memory in order.",
        code: `/* GOOD: row-major access matches memory layout */
double matrix[N][M];
double sum = 0.0;
for (size_t i = 0; i < N; i++)
    for (size_t j = 0; j < M; j++)
        sum += matrix[i][j];        /* contiguous reads */

/* BAD: column-major on row-major array — strided, cache-hostile */
for (size_t j = 0; j < M; j++)
    for (size_t i = 0; i < N; i++)
        sum += matrix[i][j];        /* jumps M*sizeof(double) bytes */

/* For 2D processing where you need column-major, transpose first */`,
        note: "C arrays are row-major: matrix[i][j+1] is adjacent in memory, matrix[i+1][j] is N*sizeof(elem) away. Strided access through a large matrix can be 10-100x slower. perf stat -e cache-misses to measure."
      },
      {
        id: 'soa-vs-aos',
        title: 'Struct-of-arrays vs array-of-structs',
        desc: "When processing one field across many items, SoA outperforms AoS by avoiding cache pollution.",
        code: `/* Array of structs — natural OO style */
typedef struct { float x, y, z, r, g, b, a; } Vertex;
Vertex aos[N];

/* If you only read positions, you still load colors too — cache waste */
for (size_t i = 0; i < N; i++) {
    aos[i].x *= scale;
    aos[i].y *= scale;
    aos[i].z *= scale;
}

/* Struct of arrays — data-oriented */
typedef struct {
    float *x, *y, *z;
    float *r, *g, *b, *a;
} VertexSoA;

VertexSoA soa = { ... };
/* Only position arrays are touched — minimum bytes read */
for (size_t i = 0; i < N; i++) {
    soa.x[i] *= scale;
    soa.y[i] *= scale;
    soa.z[i] *= scale;
}`,
        note: "Game engines, ML libraries, ECS architectures use SoA religiously. Trade-off: 'a Vertex' isn't a single thing anymore — slight loss of locality if you do touch all fields. Profile YOUR access pattern."
      },
      {
        id: 'inline-static',
        title: 'Hot-path inlining hint',
        desc: "static inline lets the compiler inline across translation units and avoid an extern symbol.",
        code: `/* In header file */
static inline int clamp(int v, int lo, int hi) {
    return v < lo ? lo : v > hi ? hi : v;
}

/* The compiler will inline at every call site — no function call overhead */
/* If it CAN'T inline (recursive, address taken), an out-of-line copy lives in each TU */`,
        note: "Modern compilers inline regardless of `inline` for short functions at -O2+. The keyword is mostly a hint and a license. Don't put non-trivial functions in headers — bloats every TU."
      },
      {
        id: 'profile-flow',
        title: 'Profiling workflow',
        desc: "Measure, find the hotspot, fix, measure again. Three commands.",
        code: `# 1. Build with optimizations + debug info
gcc -O2 -g -o app main.c

# 2. Linux: record + report
perf record -g ./app          # -g for call graphs
perf report                   # interactive; top hotspots first

# 3. macOS: Instruments
xcrun xctrace record --template "Time Profiler" --launch -- ./app

# Or platform-agnostic flamegraph:
perf record -F 99 -g ./app
perf script | stackcollapse-perf.pl | flamegraph.pl > out.svg

# Time a specific block from C itself
#include <time.h>
struct timespec t0, t1;
clock_gettime(CLOCK_MONOTONIC, &t0);
/* work */
clock_gettime(CLOCK_MONOTONIC, &t1);
double ms = (t1.tv_sec - t0.tv_sec) * 1000.0 + (t1.tv_nsec - t0.tv_nsec) / 1e6;`,
        note: "First rule: profile -O2/-O3, never -O0. -O0 has overhead that doesn't exist in releases. Second rule: don't optimize without measurements. The hotspot is rarely where you expect."
      },
    ],
  },
  build: {
    label: 'Build',
    icon: '⚒',
    snippets: [
      {
        id: 'dev-flags',
        title: 'Development build incantation',
        desc: "Every flag earns its place. Use these every dev build.",
        code: `gcc -std=c23 \\
    -Wall -Wextra -Wpedantic \\
    -Werror \\
    -Wshadow -Wstrict-prototypes -Wmissing-prototypes \\
    -g -O0 \\
    -fsanitize=address,undefined \\
    -fno-omit-frame-pointer \\
    -o app main.c

# Then run normally — sanitizers print findings to stderr + exit
./app`,
        note: "-Wpedantic enforces strict ISO C. -Wshadow catches inner-scope variable hiding outer (subtle bug source). -Werror means warnings stop the build — forces fixing them now. Sanitizers add ~2x runtime but catch the bugs static analysis can't."
      },
      {
        id: 'release-flags',
        title: 'Release build incantation',
        desc: "Performance + a few safety belts. NOT all-out -O3 + nothing.",
        code: `gcc -std=c23 \\
    -O2 \\
    -DNDEBUG \\
    -flto \\
    -fstack-protector-strong \\
    -D_FORTIFY_SOURCE=2 \\
    -Wall -Wextra \\
    -o app main.c

# For shared libs / max compat, add: -fPIC -fvisibility=hidden
# For absolutely max perf: -O3 -march=native (NOT portable)`,
        note: "-O2 is the sweet spot — most of the gain, less of the binary-size cost vs -O3. -flto = link-time optimization across TUs. -fstack-protector-strong + _FORTIFY_SOURCE=2 catch common buffer overflows in production. -march=native uses your specific CPU's instructions — non-portable binaries."
      },
      {
        id: 'makefile',
        title: 'Minimal Makefile',
        desc: "The classic build template. Auto-rebuilds on header changes via -MMD.",
        code: `CC      := gcc
CFLAGS  := -std=c23 -Wall -Wextra -Werror -g -fsanitize=address,undefined -MMD
LDFLAGS := -fsanitize=address,undefined

SRCS := $(wildcard src/*.c)
OBJS := $(SRCS:.c=.o)
DEPS := $(OBJS:.o=.d)

app: $(OBJS)
\t$(CC) $(LDFLAGS) $^ -o $@

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

clean:
\trm -f app $(OBJS) $(DEPS)

-include $(DEPS)

.PHONY: clean`,
        note: "-MMD emits .d dependency files; -include pulls them in so headers trigger rebuilds. Tabs (not spaces!) for recipe indentation — make's one annoying rule. Add release: target with -O2 -DNDEBUG for production."
      },
      {
        id: 'cmake',
        title: 'Minimal CMakeLists.txt',
        desc: "The modern cross-platform alternative. One config, builds on Linux/macOS/Windows.",
        code: `cmake_minimum_required(VERSION 3.20)
project(myapp C)

set(CMAKE_C_STANDARD 23)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)   # for clangd / IDEs

add_executable(myapp
    src/main.c
    src/util.c
)

target_compile_options(myapp PRIVATE
    -Wall -Wextra -Werror
    $<$<CONFIG:Debug>:-g -fsanitize=address,undefined>
    $<$<CONFIG:Release>:-O2 -DNDEBUG>
)

target_link_options(myapp PRIVATE
    $<$<CONFIG:Debug>:-fsanitize=address,undefined>
)

# Build:
#   cmake -B build -DCMAKE_BUILD_TYPE=Debug
#   cmake --build build`,
        note: "CMAKE_EXPORT_COMPILE_COMMANDS=ON generates compile_commands.json — clangd, ccls, and most C IDEs read it for accurate completion and diagnostics. Use Generator expressions ($<...>) for per-config flags."
      },
      {
        id: 'cross-compile',
        title: 'Cross-compilation',
        desc: "Build for a target architecture other than the host. Common for embedded.",
        code: `# Linux → bare-metal ARM Cortex-M (e.g. STM32, nRF)
arm-none-eabi-gcc -mcpu=cortex-m4 -mthumb \\
    -nostdlib -ffreestanding \\
    -T linker.ld \\
    -O2 -g \\
    -o firmware.elf main.c startup.S

# Linux → Windows (x86_64)
x86_64-w64-mingw32-gcc -o app.exe main.c

# Linux → Raspberry Pi (ARM)
arm-linux-gnueabihf-gcc -o app main.c

# WebAssembly (via emscripten)
emcc -O2 -o app.html main.c`,
        note: "Bare-metal needs -nostdlib (no libc) + a linker script (.ld) describing memory layout. Hosted cross-compile (to another OS) gives you that platform's libc automatically. Vendor SDKs (STM32CubeIDE, ESP-IDF) wrap this with their own toolchains."
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function CAtlas() {
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
  const Code = ({ children, id, lang = 'c' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
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
      info: { border: 'border-blue-400/40', bg: 'bg-blue-400/5', text: 'text-blue-300', label: 'NOTE' },
      warn: { border: 'border-red-400/50', bg: 'bg-red-400/5', text: 'text-red-300', label: 'UNDEFINED BEHAVIOR' },
      tip: { border: 'border-amber-300/40', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'TIP' },
      you: { border: 'border-rose-400/40', bg: 'bg-rose-400/5', text: 'text-rose-300', label: 'FOR YOUR STACK' },
      cite: { border: 'border-zinc-700', bg: 'bg-zinc-900/40', text: 'text-zinc-400', label: 'CITATION' },
    }[kind];
    return (
      <div className={`my-4 border ${p.border} ${p.bg} px-4 py-3`}>
        <div className={`text-[10px] uppercase tracking-[0.25em] ${p.text} mb-1.5 flex items-center gap-1.5`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {kind === 'cite' && <Quote size={10} />}
          {kind === 'warn' && <AlertTriangle size={10} />}
          {title || p.label}
        </div>
        <div className="text-zinc-300 text-[14px] leading-relaxed">{children}</div>
      </div>
    );
  };

  const CheckItem = ({ id, children }) => (
    <button onClick={() => toggleCheck(id)} className="flex items-start gap-3 w-full text-left py-2 hover:bg-zinc-900/50 px-2 -mx-2 transition-colors">
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-blue-400 border-blue-400' : 'border-zinc-600'}`}>
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
                  reveal && isCorrect ? 'border-blue-400 bg-blue-400/10 text-blue-200' :
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
        className="border-b border-dotted border-blue-400/60 text-blue-200 hover:text-blue-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-blue-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-blue-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* ─── Build pipeline diagram ─── */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap any stage · the C build pipeline
        </div>
        <svg viewBox="0 0 300 250" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="carr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          {/* Vertical pipeline arrows left column */}
          <line x1="77.5" y1="50" x2="77.5" y2="78" stroke="#52525b" markerEnd="url(#carr)" />
          <line x1="77.5" y1="110" x2="77.5" y2="138" stroke="#52525b" markerEnd="url(#carr)" />
          <line x1="77.5" y1="170" x2="77.5" y2="198" stroke="#52525b" markerEnd="url(#carr)" />
          {/* Cross arrows */}
          <line x1="125" y1="214" x2="175" y2="214" stroke="#52525b" markerEnd="url(#carr)" />
          <line x1="222.5" y1="198" x2="222.5" y2="170" stroke="#52525b" markerEnd="url(#carr)" />
          {/* Right column down */}
          <line x1="222.5" y1="50" x2="222.5" y2="78" stroke="#52525b" markerEnd="url(#carr)" />
          <line x1="222.5" y1="110" x2="222.5" y2="138" stroke="#52525b" markerEnd="url(#carr)" />
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
              </g>
            );
          })}
        </svg>
        {sel && (
          <div className="mt-2 border border-blue-400/30 bg-blue-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-blue-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: real C execution via JSCPP (interpreter, MIT) ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('challenges');
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];
    const [code, setCode] = useState(challenge.starter);
    const [stdinData, setStdinData] = useState('');
    const [output, setOutput] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState('idle'); // idle | loading | ready | error
    const jscppRef = useRef(null);

    useEffect(() => {
      setCode(challenge.starter);
      setOutput('');
      setTestResult(null);
    }, [challengeIdx]);

    // Lazy-load JSCPP on mount
    useEffect(() => {
      if (window.JSCPP) {
        jscppRef.current = window.JSCPP;
        setStatus('ready');
        return;
      }
      if (window.__jscppLoading) {
        const interval = setInterval(() => {
          if (window.JSCPP) {
            jscppRef.current = window.JSCPP;
            setStatus('ready');
            clearInterval(interval);
          }
        }, 200);
        setStatus('loading');
        return () => clearInterval(interval);
      }
      window.__jscppLoading = true;
      setStatus('loading');
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/JSCPP@2.0.9/dist/JSCPP.es5.min.js';
      script.onload = () => {
        if (window.JSCPP) {
          jscppRef.current = window.JSCPP;
          setStatus('ready');
        } else {
          setStatus('error');
          setOutput('❌ JSCPP loaded but global not found.');
        }
      };
      script.onerror = () => {
        setStatus('error');
        setOutput('❌ Failed to load JSCPP from CDN. Check network.');
      };
      document.head.appendChild(script);
    }, []);

    const runCode = (checkExpected) => {
      const JSCPP = jscppRef.current;
      if (!JSCPP) return;
      setRunning(true);
      setOutput('');
      setTestResult(null);

      let collected = '';
      const config = {
        stdio: { write: (s) => { collected += s; } },
        maxTimeout: 5000,
        unsigned_overflow: 'warn',
      };

      try {
        const exitCode = JSCPP.run(code, stdinData, config);
        let displayOutput = collected;
        if (exitCode !== 0) {
          displayOutput += `\n[exit code: ${exitCode}]`;
        }
        setOutput(displayOutput || '(no output)');

        if (checkExpected) {
          const pass = collected === challenge.expected;
          setTestResult({
            pass,
            expected: challenge.expected,
            actual: collected,
          });
        }
      } catch (e) {
        const msg = e?.message || String(e);
        // JSCPP throws strings/Error with descriptive messages
        setOutput((collected ? collected + '\n' : '') + '❌ ' + msg.split('\n').slice(0, 4).join('\n'));
        if (checkExpected) {
          setTestResult({ pass: false, expected: challenge.expected, actual: collected, err: msg.split('\n')[0] });
        }
      }
      setRunning(false);
    };

    const ready = status === 'ready';

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE C · {mode === 'challenges' ? challenge.title : 'free play'}</span>
            {status === 'ready' && <span className="text-blue-400">●</span>}
            {status === 'loading' && <span className="text-amber-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> loading interpreter</span>}
            {status === 'error' && <span className="text-red-400">● error</span>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-blue-400 text-blue-300 bg-blue-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => { setMode('freeplay'); setCode("#include <stdio.h>\n\nint main(void) {\n    printf(\"Hello from C!\\n\");\n    return 0;\n}\n"); setOutput(''); setTestResult(null); }} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-blue-400 text-blue-300 bg-blue-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-blue-400 text-blue-300 bg-blue-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
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
          className="w-full bg-black text-zinc-100 px-3 py-3 text-[13px] outline-none resize-y min-h-[200px] leading-snug"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        />

        {mode === 'freeplay' && (
          <div className="px-3 py-2 border-t border-zinc-800">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>STDIN (optional)</div>
            <textarea
              value={stdinData}
              onChange={e => setStdinData(e.target.value)}
              spellCheck={false}
              placeholder="Lines fed to scanf / gets..."
              className="w-full bg-black text-zinc-100 px-3 py-2 text-[12px] outline-none resize-y min-h-[40px] border border-zinc-800"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}
            />
          </div>
        )}

        <div className="px-3 py-2 border-t border-zinc-800 flex gap-2">
          {mode === 'freeplay' ? (
            <button onClick={() => runCode(false)} disabled={!ready || running}
              className="flex-1 border border-blue-400 bg-blue-400/10 text-blue-200 px-3 py-2 text-[12px] font-bold hover:bg-blue-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> Run</>}
            </button>
          ) : (
            <>
              <button onClick={() => runCode(true)} disabled={!ready || running}
                className="flex-1 border border-blue-400 bg-blue-400/10 text-blue-200 px-3 py-2 text-[12px] font-bold hover:bg-blue-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {running ? <><Loader2 size={12} className="animate-spin" /> Compiling + running</> : <><Play size={12} /> Run + check</>}
              </button>
              <button onClick={() => setCode(challenge.starter)}
                className="border border-zinc-700 text-zinc-400 px-3 py-2 text-[12px] hover:border-zinc-500 transition-colors flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={11} /> Reset
              </button>
            </>
          )}
        </div>

        {(output || testResult) && (
          <div className="border-t border-zinc-800 bg-black">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-b border-zinc-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              OUTPUT
            </div>
            <pre className="px-3 py-2 text-[12px] text-zinc-300 max-h-48 overflow-y-auto whitespace-pre-wrap break-words" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {output || '(no output)'}
            </pre>
            {testResult && (
              <div className="border-t border-zinc-800 px-3 py-2">
                <div className={`text-[12px] flex items-start gap-2 py-0.5 ${testResult.pass ? 'text-blue-300' : 'text-red-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {testResult.pass ? <Check size={12} className="shrink-0 mt-0.5" /> : <X size={12} className="shrink-0 mt-0.5" />}
                  <span>{testResult.pass ? 'OUTPUT MATCHES EXPECTED' : 'OUTPUT MISMATCH'}</span>
                </div>
                {!testResult.pass && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <div>
                      <div className="text-zinc-500 mb-1">EXPECTED:</div>
                      <pre className="bg-zinc-900 p-2 text-blue-300 whitespace-pre-wrap break-words">{JSON.stringify(testResult.expected)}</pre>
                    </div>
                    <div>
                      <div className="text-zinc-500 mb-1">GOT:</div>
                      <pre className="bg-zinc-900 p-2 text-red-300 whitespace-pre-wrap break-words">{JSON.stringify(testResult.actual)}</pre>
                    </div>
                  </div>
                )}
                {testResult.pass && challengeIdx < CHALLENGES.length - 1 && (
                  <div className="mt-2 pt-2 border-t border-zinc-800 text-blue-300 text-[12px] font-bold flex items-center gap-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="text-amber-300 hover:text-amber-100 underline">next challenge →</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* ─── LIBRARY: snippet browser ─── */
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
                activeCat === c ? 'border-blue-400 text-blue-300 bg-blue-400/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="text-blue-300">{LIBRARY[c].icon}</span>
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
                  <span className="text-[10px] text-blue-400 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>c</span>
                      <button onClick={() => copy(s.code, 'lib-' + s.id)} className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
                        {copied === 'lib-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'lib-' + s.id ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <code>{s.code}</code>
                    </pre>
                    {s.note && (
                      <div className="border-t border-zinc-900 px-3 py-2 text-[12px] text-zinc-400 italic leading-relaxed">
                        <span className="text-amber-300 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
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

  /* ─── Troubleshooter ─── */
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
                  <span className={i === path.length - 1 ? 'text-blue-300' : ''}>{p}</span>
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
              <div className="border-l-2 border-blue-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-blue-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-blue-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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
    let md = "# C Atlas — Cheatsheet\n\n";
    md += "## Dev build (every flag earns its place)\n```bash\ngcc -std=c23 -Wall -Wextra -Werror -g \\\n    -fsanitize=address,undefined \\\n    -fno-omit-frame-pointer \\\n    -o app main.c\n```\n\n";
    md += "## Release build\n```bash\ngcc -std=c23 -O2 -DNDEBUG -flto \\\n    -fstack-protector-strong -D_FORTIFY_SOURCE=2 \\\n    -o app main.c\n```\n\n";
    md += "## Modern C essentials\n```c\n#include <stdint.h>   /* int32_t, uint64_t, intptr_t */\n#include <stddef.h>   /* size_t, ptrdiff_t, NULL */\n#include <stdbool.h>  /* bool, true, false (C99) */\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n\n/* C99: designated init */\nstruct Point p = { .x = 1, .y = 2 };\n\n/* C99: compound literal */\nfoo(&(struct Point){ .x = 10, .y = 20 });\n\n/* C11: _Generic */\n#define abs(x) _Generic((x), int: abs, long: labs, double: fabs)(x)\n\n/* C23: nullptr, constexpr, true/false keywords */\nconstexpr int LIMIT = 64;\nint *p = nullptr;\n```\n\n";
    md += "## Cleanup with goto (Linux-kernel idiom)\n```c\nint do_work(void) {\n    FILE *f = NULL;\n    char *buf = NULL;\n    int rc = -1;\n    f = fopen(\"x\", \"r\");\n    if (!f) goto cleanup;\n    buf = malloc(4096);\n    if (!buf) goto cleanup;\n    /* ... */\n    rc = 0;\ncleanup:\n    free(buf);\n    if (f) fclose(f);\n    return rc;\n}\n```\n\n";
    md += "## printf format specifiers\n```c\n%d   int           %u  unsigned int    %ld  long\n%lu  unsigned long %lld long long       %zu  size_t\n%f   double        %.3f 3 decimals      %e   scientific\n%s   char *        %c   int (char)      %p   (void *)ptr\n%x   hex           %08x zero-padded 8   PRId32 from inttypes.h\n```\n\n";
    md += "## Commands\n\n";
    COMMANDS.forEach(c => { md += `**${c.desc}**\n\`\`\`\n${c.cmd}\n\`\`\`\n\n`; });
    md += "## Authoritative resources\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    md += "\n---\n_Generated by C Atlas. Grounded in K&R, Modern C (Gustedt), cppreference, the ISO C23 draft (N3220), and Beej's Guides._\n";
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'c-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportLibrary = () => {
    let md = "# C Atlas — Library\n\nA curated snippet collection. All MIT-licensed for your use.\n\n";
    Object.entries(LIBRARY).forEach(([_, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => {
        md += `### ${s.title}\n${s.desc}\n\n\`\`\`c\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`;
      });
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'c-atlas-library.md'; a.click();
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
      ...Object.entries(LIBRARY).flatMap(([cat, c]) =>
        c.snippets.map(s => ({ kind: 'library', label: s.title, hint: `${c.label} · ${s.desc}`, lib: true }))
      ),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-blue-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-blue-300" />
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
                  item.kind === 'chapter' ? 'text-blue-300' :
                  item.kind === 'term' ? 'text-amber-300' :
                  item.kind === 'library' ? 'text-rose-300' : 'text-red-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-blue-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-blue-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-blue-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>& CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What are you using C for?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-blue-400 hover:bg-blue-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-blue-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 1972">From a Bell Labs office</H2>
            <P>
              Dennis Ritchie created C at Bell Labs around 1969-1972, derived from Ken Thompson's B (which was derived from BCPL). The killer application: rewriting Unix in C in 1973. Suddenly an operating system was portable — you only needed a C compiler for a new architecture, not a hand-rolled assembly port.
            </P>
            <P>
              The 1978 book by Kernighan and Ritchie ("K&R") defined the language for over a decade before standardization. ANSI standardized C in 1989 (X3.159-1989, "C89"), ISO followed in 1990 (ISO/IEC 9899:1990, "C90"). Same language, different stamps.
            </P>
            <H2 num="◇ ISO">The standard timeline</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { ver: 'C89 / C90', what: "The original ANSI/ISO standard. Function prototypes (no more K&R declarations), const, volatile, void, enum, signed. The foundation." },
                { ver: 'C99', what: "VLAs (variable-length arrays), designated initializers, // comments, stdint.h (int32_t etc), stdbool.h, inline, restrict, _Bool, long long, snprintf. Massive upgrade." },
                { ver: 'C11', what: "_Generic (type-based macros), _Atomic + stdatomic.h, threads.h (rarely implemented), _Alignas/_Alignof, anonymous structs/unions, char16_t/char32_t." },
                { ver: 'C17 / C18', what: "Just bug fixes and clarifications. No new features. Default for GCC 8-14. Sometimes called the 'no-op standard.'" },
                { ver: 'C23 (current)', what: "ISO/IEC 9899:2024, published October 2024. nullptr, constexpr, true/false as keywords, _BitInt(N), #embed, [[attribute]] syntax, typeof, empty () now means (void), enum with explicit underlying type. Default since GCC 15." },
                { ver: 'C29 / C2Y (draft)', what: "Working draft N3854, March 2026. Removing _Imaginary, sequential hex digits, more attributes. Expected late 2029. GCC 15 + Clang 19 already implement experimental bits." },
              ].map(v => (
                <div key={v.ver} className="border border-zinc-800 px-3 py-2">
                  <div className="text-blue-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.ver}</div>
                  <div className="text-zinc-400 text-[12px] mt-1">{v.what}</div>
                </div>
              ))}
            </div>
            <Callout kind="cite" title="SOURCE">
              Wikipedia: C23 (ISO/IEC 9899:2024). The closest free spec is the C23 final draft N3220 at open-std.org/jtc1/sc22/wg14. The published ISO standard is paywalled; the draft is essentially identical.
            </Callout>
            <H2 num="◇ WHY">Why C still wins in 2026</H2>
            <P>
              <strong>The kernel layer.</strong> Linux. Windows NT. macOS XNU. FreeBSD. Every major OS kernel is C (or C++ on a C-shaped runtime). When you write an OS, you can't run a language runtime; C is what's left.
            </P>
            <P>
              <strong>The runtime layer.</strong> CPython. Ruby. V8 (C++ but C interop). PHP. Lua. Most "high-level" languages are built ON C. When you need to extend them with native speed, the boundary is C.
            </P>
            <P>
              <strong>The library layer.</strong> SQLite. Redis. nginx. zlib. OpenSSL. libcurl. Git. The world's most important infrastructure libraries are C — small, fast, portable, ABI-stable for decades.
            </P>
            <P>
              <strong>The embedded layer.</strong> Every microcontroller, every RTOS, every hardware driver. The $5 ESP32 doing your IoT, the chip in your washing machine, the firmware in your car — all C.
            </P>
            <Callout kind="info" title="THE TRADE">
              C gives you the entire machine. The cost: you own every byte. No GC. No bounds checks. No type safety beyond what you write. The skill is using the freedom without bleeding from it. Tools (sanitizers, valgrind, static analyzers) are how modern C remains viable.
            </Callout>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ PIPELINE">Four phases, one command</H2>
            <P>
              When you run <Kbd>gcc main.c -o app</Kbd>, four programs run in sequence. Knowing them is how you debug build errors.
            </P>
            <Code id="phases" lang="bash">{`# 1. Preprocessor (cpp): #include, #define, #ifdef
gcc -E main.c -o main.i        # output: expanded source

# 2. Compiler (cc1): parse, type-check, optimize, emit assembly
gcc -S main.c -o main.s        # output: assembly text

# 3. Assembler (as): assembly → machine code
gcc -c main.c -o main.o        # output: object file

# 4. Linker (ld): combine objects + libraries → executable
gcc main.o -o app              # output: ELF/Mach-O/PE executable

# All four in one (the default):
gcc main.c -o app`}</Code>
            <Callout kind="tip" title="WHERE'S THE ERROR?">
              "undefined reference" = linker error (phase 4). Missing <Term>Header guard</Term> = preprocessor cycle. Type mismatch = compiler. Bad syntax = compiler. Read the error prefix to know which tool spoke.
            </Callout>
            <H2 num="◇ DEV-MODE">The dev-mode incantation</H2>
            <Code id="dev-mode" lang="bash">{`gcc -std=c23 \\
    -Wall -Wextra -Wpedantic \\
    -Werror \\
    -Wshadow -Wstrict-prototypes \\
    -g -O0 \\
    -fsanitize=address,undefined \\
    -fno-omit-frame-pointer \\
    -o app main.c`}</Code>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { flag: '-std=c23', what: 'Use C23. Without this, GCC 15+ still defaults to C23 but pinning is clearer.' },
                { flag: '-Wall -Wextra', what: 'Most warnings on. Despite the name, -Wall does NOT mean "all."' },
                { flag: '-Wpedantic', what: 'Strict ISO conformance — catches gcc-extension reliance.' },
                { flag: '-Werror', what: 'Warnings become errors. Forces fixing them now, not in production.' },
                { flag: '-g', what: 'Debug info — gdb/lldb need this for source-level debugging.' },
                { flag: '-O0', what: 'No optimization — for predictable debugging step-through.' },
                { flag: '-fsanitize=address', what: 'AddressSanitizer: catches buffer overflows, UAF, double-free, leaks. ~2x slowdown, worth it.' },
                { flag: '-fsanitize=undefined', what: 'UndefinedBehaviorSanitizer: catches signed overflow, NULL deref, OOB shifts, misaligned access at runtime.' },
                { flag: '-fno-omit-frame-pointer', what: 'Keep frame pointers — sanitizer backtraces become readable.' },
              ].map(f => (
                <div key={f.flag} className="border border-zinc-800 px-3 py-1.5">
                  <code className="text-blue-300 text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{f.flag}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{f.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ DEBUG">gdb in 60 seconds</H2>
            <Code id="gdb-flow" lang="bash">{`gdb ./app                  # start
(gdb) b main               # breakpoint at function main
(gdb) b file.c:42          # breakpoint at line 42
(gdb) r arg1 arg2          # run with args
(gdb) n                    # next line (step over)
(gdb) s                    # step into
(gdb) c                    # continue until next breakpoint
(gdb) p variable           # print value
(gdb) p *ptr               # print what pointer points to
(gdb) bt                   # backtrace (call stack at crash)
(gdb) info locals          # all local vars
(gdb) q                    # quit`}</Code>
            <Callout kind="tip" title="GODBOLT">
              <Kbd>godbolt.org</Kbd> — Compiler Explorer. Paste C, see assembly across gcc/clang/MSVC + every version. Best free tool for understanding what the compiler ACTUALLY does. Built by Matt Godbolt. Bookmark it.
            </Callout>
            <H2 num="◇ MAKE">Make — the OG build tool</H2>
            <Code id="makefile" lang="makefile">{`CC      := gcc
CFLAGS  := -std=c23 -Wall -Wextra -Werror -g -fsanitize=address,undefined -MMD
LDFLAGS := -fsanitize=address,undefined

SRCS := $(wildcard src/*.c)
OBJS := $(SRCS:.c=.o)
DEPS := $(OBJS:.o=.d)

app: $(OBJS)
\t$(CC) $(LDFLAGS) $^ -o $@

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

clean:
\trm -f app $(OBJS) $(DEPS)

-include $(DEPS)         # auto-rebuild on header changes
.PHONY: clean`}</Code>
            <Callout kind="warn" title="MAKE RULES">
              Recipes MUST be indented with tabs, not spaces. The most common make confusion. -MMD generates dependency files (.d) so changes to .h trigger rebuilds of dependent .c.
            </Callout>
            {QUIZZES.toolchain.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ TYPES">The fundamental types</H2>
            <P>C's types are defined by minimum ranges, not exact widths. Implementations get to choose.</P>
            <Code id="types">{`/* Integer types (sizes typical on 64-bit Linux/macOS — LP64) */
char            /* 1 byte, signedness impl-defined */
signed char     /* 1 byte, -128..127 */
unsigned char   /* 1 byte, 0..255 */
short           /* 2 bytes, -32768..32767 */
int             /* 4 bytes, -2^31..2^31-1 */
long            /* 8 bytes on Linux/macOS, 4 on Windows (LLP64) */
long long       /* 8 bytes everywhere — guaranteed at least 64-bit */

/* Floating-point */
float           /* IEEE 754 single — 4 bytes */
double          /* IEEE 754 double — 8 bytes */
long double     /* 10, 12, or 16 bytes depending on platform */

/* Use stdint.h for portable widths */
#include <stdint.h>
int8_t  int16_t  int32_t  int64_t
uint8_t uint16_t uint32_t uint64_t
intptr_t uintptr_t   /* integer wide enough to hold a pointer */
size_t  ssize_t      /* sizes — from stddef.h / sys/types.h */`}</Code>
            <H2 num="◇ SIZEOF">sizeof — your friend, and a trap</H2>
            <Code id="sizeof">{`/* Works as expected on declared types and stack arrays */
sizeof(int)              /* 4 (typically) */
sizeof(double)           /* 8 */
int arr[10];
sizeof(arr)              /* 40 = 10 * sizeof(int) */
sizeof(arr) / sizeof(arr[0])  /* 10 — array length idiom */

/* TRAP: arrays decay to pointers when passed to functions */
void foo(int arr[]) {
    sizeof(arr);         /* 8 (pointer size on 64-bit), NOT 40 */
}

/* Compile-time evaluation for fixed types — operand not actually evaluated */
sizeof(*p)               /* size of what p points to, even if p is NULL */
sizeof(some_function())  /* compiler determines return type, never calls */`}</Code>
            <H2 num="◇ SIGNED">Signed, unsigned, and the bug factory</H2>
            <P>Mixing signed and unsigned is one of C's most frequent bug sources. The rules:</P>
            <Code id="signed">{`/* Rule 1: signed overflow is UNDEFINED BEHAVIOR */
int x = INT_MAX;
x = x + 1;               /* UB. The compiler may assume this can't happen. */

/* Rule 2: unsigned overflow is DEFINED — wraps modulo 2^N */
unsigned int u = UINT_MAX;
u = u + 1;               /* defined: u == 0 */

/* Rule 3: mixed signed/unsigned promotes to UNSIGNED */
int i = -1;
unsigned u = 1;
if (i < u) printf("yes");
/* DOES NOT PRINT. i becomes UINT_MAX as unsigned, which is NOT < 1. */

/* Rule 4: integer promotion to int in expressions */
unsigned char a = 200, b = 200;
if (a + b > 300) ...     /* TRUE — a and b promote to int, 400 > 300 */
unsigned char c = a + b; /* c = (a + b) % 256 = 144 — narrowed */`}</Code>
            <Callout kind="warn" title="UNDEFINED BEHAVIOR">
              Signed integer overflow is UB. Compilers OPTIMIZE assuming it never happens — meaning `if (x + 1 &lt; x)` becomes `if (false)`. Use <Kbd>-fsanitize=undefined</Kbd> to catch at runtime. Use unsigned (or atomic) when you need defined wrap-around.
            </Callout>
            <H2 num="◇ DECLARATOR">The declarator pitfall</H2>
            <Code id="declarator">{`/* What you think: two pointers to int */
int *p, q;
/* What you got: p is int *, q is int. The * binds to the DECLARATOR. */

/* Correct */
int *p, *q;

/* Better: one per line */
int *p;
int *q;

/* The most confusing C declaration possible */
int *(*foo(int))[5];
/* foo: function taking int, returning pointer to array of 5 pointers to int */
/* Use typedef or cdecl(1) to read these. Better: don't write them. */`}</Code>
            <H2 num="◇ QUALIFIERS">Type qualifiers</H2>
            <div className="grid gap-1.5 my-3 text-[12px]">
              {[
                { q: 'const', what: "Read-only. `const int x = 5;` — modification is a compile error. `const char *s` — s points to chars you can't modify (s itself is mutable). `char * const s` — s itself is const." },
                { q: 'volatile', what: "Don't optimize accesses. Required for memory-mapped I/O, signal handler shared vars, multithreaded shared state (though atomic is better)." },
                { q: 'restrict (C99)', what: "This pointer is the ONLY way to access the pointed memory in this scope. Optimizer hint — lets the compiler reorder/cache. memcpy is declared with restrict; memmove isn't." },
                { q: '_Atomic (C11)', what: "Operations on this value are indivisible. Use with stdatomic.h. The bedrock of lock-free concurrency in modern C." },
              ].map(t => (
                <div key={t.q} className="border border-zinc-800 px-3 py-1.5">
                  <code className="text-blue-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.q}</code>
                  <div className="text-zinc-400 text-[11px] mt-0.5">{t.what}</div>
                </div>
              ))}
            </div>
            {QUIZZES.bedrock.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ MODEL">The core mental model</H2>
            <P>
              A pointer is a value: an address in memory. The type tells the compiler what's at that address (so pointer arithmetic and dereferencing know how many bytes to step / interpret).
            </P>
            <Code id="ptr-basics">{`int x = 42;
int *p = &x;             /* p holds the address of x */

printf("%p\\n", (void*)p);    /* prints the address (e.g. 0x7ffe8b3a4c2c) */
printf("%d\\n", *p);          /* prints 42 — dereferenced */

*p = 100;                /* writes through p — x is now 100 */
printf("%d\\n", x);            /* 100 */

int *q = p;              /* q and p hold the same address */
*q = 7;                  /* x is now 7 — visible via p, q, x */`}</Code>
            <H2 num="◇ DECAY">Arrays decay — the bedrock of confusion</H2>
            <P>An array name in most expressions is converted to a pointer to its first element. The length is lost.</P>
            <Code id="decay">{`int arr[5] = {10, 20, 30, 40, 50};

sizeof(arr);             /* 20 = 5 * sizeof(int) — arr is still an array here */

int *p = arr;            /* implicit decay: p = &arr[0] */
arr[2];                  /* 30 — same as *(arr + 2) */
p[2];                    /* 30 — pointer indexing is sugar for *(p + 2) */

/* THE TRAP: passing an array to a function */
void print_all(int a[]) {              /* a is actually int *, NOT int[5] */
    sizeof(a);                          /* 8 (pointer) on 64-bit, NOT 20 */
    for (int i = 0; i < sizeof(a)/sizeof(a[0]); i++)  /* BUG */
        printf("%d ", a[i]);
}

/* THE FIX: always pass length explicitly */
void print_all_fixed(int *a, size_t n) {
    for (size_t i = 0; i < n; i++)
        printf("%d ", a[i]);
}
print_all_fixed(arr, sizeof(arr) / sizeof(arr[0]));`}</Code>
            <Callout kind="cite" title="DEEPER">
              Steve Summit's C FAQ, section 6: "Arrays and Pointers" — c-faq.com/aryptr. Untangles every confusion. Read it in one sitting; your understanding shifts permanently.
            </Callout>
            <H2 num="◇ ARITH">Pointer arithmetic scales by sizeof</H2>
            <Code id="ptr-arith">{`int arr[] = {10, 20, 30};
int *p = arr;

p + 1                    /* arr + 1 * sizeof(int) — points to arr[1] */
*(p + 2)                 /* 30 */
p[2]                     /* equivalent — array sugar */

char *cp = (char *)p;
cp + 1                   /* p + 1 BYTE — points to second byte of arr[0] */

/* Pointer difference */
int *end = arr + 3;
end - arr                /* 3 (in elements, not bytes) — ptrdiff_t */

/* Valid range: pointers within and ONE PAST the array. */
int *one_past = arr + 3; /* legal — you can compute and compare it */
*one_past;               /* UB — can't dereference one-past */`}</Code>
            <H2 num="◇ NULL">NULL — the canonical absent pointer</H2>
            <Code id="null">{`#include <stddef.h>            /* defines NULL as (void *)0 or similar */

int *p = NULL;
if (p == NULL) { ... }       /* canonical NULL check */
if (!p) { ... }              /* idiomatic shorter form */

*p;                          /* UB — dereferencing NULL is segfault territory */

/* C23: nullptr — typed NULL pointer constant */
int *q = nullptr;            /* C23 only */
/* Different from NULL because nullptr has type nullptr_t — safer in generics */`}</Code>
            <H2 num="◇ VOID">void * — the generic pointer</H2>
            <Code id="voidptr">{`void *malloc(size_t size);   /* returns untyped — caller assigns to typed ptr */

int *arr = malloc(10 * sizeof(int));     /* implicit void* → int* — legal in C */
                                          /* C++ requires explicit cast; C doesn't */

void *generic_storage[100];
int x = 42;
generic_storage[0] = &x;     /* store any pointer */
int *got = generic_storage[0];   /* retrieve */
printf("%d\\n", *got);            /* 42 */

/* qsort uses void * for generic comparison */
int compare(const void *a, const void *b) {
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);   /* avoid (ia - ib) — could overflow */
}
qsort(arr, n, sizeof(int), compare);`}</Code>
            <H2 num="◇ FNPTR">Function pointers</H2>
            <Code id="fnptr">{`/* Declaration: read inside-out */
int (*callback)(int, int);   /* callback is pointer to function (int,int) returning int */

int add(int a, int b) { return a + b; }
int mul(int a, int b) { return a * b; }

callback = add;              /* no & needed; function names decay too */
callback(2, 3);              /* 5 — () implicitly dereferences */

/* typedef for sanity */
typedef int (*BinOp)(int, int);
BinOp op = mul;
op(4, 5);                    /* 20 */

/* Used for: callbacks, vtables (manual OO), pluggable strategies, sorting */
void each(int *a, size_t n, void (*fn)(int)) {
    for (size_t i = 0; i < n; i++) fn(a[i]);
}`}</Code>
            {stackData?.pointers && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.pointers}</Callout>}
            <H2 num="◇ DOUBLE">Double pointers — when you need them</H2>
            <Code id="doubleptr">{`/* Pattern 1: out-parameters that modify the caller's pointer */
int alloc_buffer(char **out, size_t size) {
    *out = malloc(size);
    if (!*out) return -1;
    return 0;
}
char *buf;
alloc_buffer(&buf, 1024);    /* buf now points to the new allocation */

/* Pattern 2: arrays of strings — argv, env, etc. */
int main(int argc, char **argv) {
    for (int i = 0; i < argc; i++) {
        printf("%s\\n", argv[i]);
    }
}

/* Pattern 3: linked list head modification */
void list_push(Node **head, int value) {
    Node *n = malloc(sizeof *n);
    n->value = value;
    n->next = *head;
    *head = n;                   /* modifies caller's head pointer */
}`}</Code>
            {QUIZZES.pointers.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ TWO">Stack and heap</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              <div className="border border-blue-400/30 bg-blue-400/5 px-3 py-2">
                <div className="text-blue-300 font-semibold text-[14px] mb-1">STACK</div>
                <div className="text-zinc-300 text-[12px] leading-relaxed">
                  Per-thread region for function locals + call frames. Allocation is one instruction (decrement SP). Cleaned up automatically on return. Size limited: 1-8 MB typical on Linux/macOS; smaller on embedded. Stack overflow = crash. Don't put huge arrays on the stack.
                </div>
              </div>
              <div className="border border-amber-300/30 bg-amber-300/5 px-3 py-2">
                <div className="text-amber-200 font-semibold text-[14px] mb-1">HEAP</div>
                <div className="text-zinc-300 text-[12px] leading-relaxed">
                  Process-wide pool managed by malloc/free. Allocation is a function call (slower than stack). Lifetime is MANUAL — your responsibility to free. Effectively unlimited (until OS refuses). The source of nearly all C memory bugs.
                </div>
              </div>
            </div>
            <H2 num="◇ MALLOC">malloc family</H2>
            <Code id="malloc">{`#include <stdlib.h>

/* Allocate uninitialized memory */
int *p = malloc(100 * sizeof *p);    /* 100 ints — sizeof *p safer than sizeof(int) */
if (!p) { /* allocation failed — handle */ }

/* Allocate + zero (also has overflow-safe arg form) */
int *zeros = calloc(100, sizeof *zeros);   /* zeroed */

/* Resize an existing block */
void *tmp = realloc(p, 200 * sizeof *p);
if (!tmp) {
    /* OLD p IS STILL VALID — must free or use it; do NOT overwrite p */
    perror("realloc"); free(p); return -1;
}
p = tmp;                              /* commit only on success */

/* Release */
free(p);
p = NULL;                             /* defend against use-after-free */`}</Code>
            <Callout kind="warn" title="DANGLING POINTERS">
              After <Kbd>free(p)</Kbd>, p still holds the old address but the memory is no longer yours — the allocator may reuse it instantly. Using p afterwards is <Term name="Use-after-free">use-after-free</Term>: silent corruption, security holes, occasional crashes. ALWAYS set p = NULL after free.
            </Callout>
            <H2 num="◇ BUGS">The four canonical memory bugs</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Leak', desc: "malloc without matching free along some code path. Long-running process slowly exhausts memory. Caught by: valgrind (--leak-check=full) or ASAN at exit." },
                { name: 'Use-after-free', desc: "Reading or writing through a pointer after the block was freed. May appear to work — until the allocator reuses that memory. Caught by: ASAN, immediately, with exact stack traces of free site + use site." },
                { name: 'Double-free', desc: "Calling free() twice on the same pointer. Corrupts allocator metadata; classic exploit vector. Caught by: ASAN; modern glibc detects most cases too." },
                { name: 'Buffer overflow', desc: "Writing past the end of an array — heap or stack. Smashes adjacent data; on stack, smashes the return address (security exploit). Caught by: ASAN, stack canaries (-fstack-protector), bounds checks." },
              ].map(b => (
                <div key={b.name} className="border border-red-400/30 bg-red-400/5 px-3 py-2">
                  <div className="text-red-300 font-semibold text-[13px] flex items-center gap-1.5">
                    <AlertTriangle size={12} /> {b.name}
                  </div>
                  <div className="text-zinc-300 text-[12px] mt-1 leading-relaxed">{b.desc}</div>
                </div>
              ))}
            </div>
            <Callout kind="info" title="THE ANSWER">
              All four are caught by AddressSanitizer (ASAN). Compile with <Kbd>-fsanitize=address</Kbd>, run normally, read the diagnostic. ASAN is one of the most important tools in modern C — use it in every dev build.
            </Callout>
            {stackData?.memory && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.memory}</Callout>}
            <H2 num="◇ ARENAS">Arenas — the modern alternative</H2>
            <P>
              For batch lifetimes (parse one file, handle one request, render one frame), arena allocators give you O(1) allocation, zero fragmentation, and a single free. The Library chapter has a complete implementation; here's the idea:
            </P>
            <Code id="arena-idea">{`Arena *a = arena_create(64 * 1024);    /* 64 KB region */
Node *n1 = arena_alloc(a, sizeof *n1); /* fast — just bumps a pointer */
char *s  = arena_alloc(a, 256);
Node *n2 = arena_alloc(a, sizeof *n2);
/* ... thousands more allocations ... */

arena_destroy(a);                       /* one free, releases everything */

/* No individual free(). No fragmentation. No leak risk per-allocation.
   Tradeoff: everything in the arena has the same lifetime. */`}</Code>
            {QUIZZES.memory.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ STRUCT">struct — your aggregate types</H2>
            <Code id="struct-basic">{`/* Define */
struct Point {
    int x;
    int y;
};

/* Use */
struct Point p1;
p1.x = 3;
p1.y = 4;

/* Initialize */
struct Point p2 = { 5, 6 };               /* positional */
struct Point p3 = { .x = 5, .y = 6 };     /* designated (C99) — preferred */

/* typedef makes it cleaner */
typedef struct { int x, y; } Point;
Point p4 = { .x = 1, .y = 2 };

/* Pass by value copies the whole struct */
double distance(Point a, Point b) { /* ... */ }

/* Pass by pointer when struct is large or you want to modify */
void translate(Point *p, int dx, int dy) {
    p->x += dx;                            /* p->x is sugar for (*p).x */
    p->y += dy;
}`}</Code>
            <H2 num="◇ PADDING">Padding and alignment</H2>
            <P>The compiler inserts padding between fields to satisfy alignment requirements. Same fields in different order can mean different sizes.</P>
            <Code id="padding">{`/* 24 bytes on 64-bit Linux — not 14 */
struct Bad {
    char c;        /* 1 byte +  3 padding to align next int */
    int  i;        /* 4 bytes + 0 padding */
    char d;        /* 1 byte +  7 padding to align long */
    long l;        /* 8 bytes */
};                 /* total: 24 bytes */

/* 16 bytes — same fields, sorted by size descending */
struct Good {
    long l;        /* 8 bytes — most-aligned first */
    int  i;        /* 4 bytes */
    char c;        /* 1 byte */
    char d;        /* 1 byte +  2 trailing padding (for arrays of this struct) */
};                 /* total: 16 bytes */

/* Inspect: */
printf("%zu vs %zu\\n", sizeof(struct Bad), sizeof(struct Good));
/* offsetof reveals layout: */
#include <stddef.h>
offsetof(struct Bad, l)        /* 16 — 8 before it */`}</Code>
            <Callout kind="tip" title="WHY IT MATTERS">
              For one struct: trivial. For an array of a million: 8 MB saved. For CPU cache: tighter structs = more fit per cache line = faster. For network/disk formats: padding wastes bandwidth. Order matters.
            </Callout>
            <H2 num="◇ UNION">union — one memory, many interpretations</H2>
            <Code id="union">{`union Value {
    int    as_int;
    float  as_float;
    char   as_bytes[4];
};

union Value v;
v.as_float = 1.5f;
printf("%08x\\n", v.as_int);      /* hex bit-pattern of 1.5f (impl: 0x3FC00000) */

/* Tagged-union pattern (sum type) */
enum NodeKind { N_INT, N_STRING };
struct Node {
    enum NodeKind kind;
    union {
        int   as_int;
        char *as_string;
    };                              /* anonymous union — C11 */
};

struct Node n = { .kind = N_INT, .as_int = 42 };
if (n.kind == N_INT) printf("%d\\n", n.as_int);`}</Code>
            <H2 num="◇ BITFIELDS">Bitfields — pack flags into single bytes</H2>
            <Code id="bitfields">{`/* For protocol headers, packed flags, embedded register layouts */
struct Flags {
    unsigned read    : 1;
    unsigned write   : 1;
    unsigned execute : 1;
    unsigned :        5;            /* unnamed padding */
    unsigned ttl     : 8;
};

struct Flags f = { .read = 1, .write = 0, .execute = 1, .ttl = 64 };`}</Code>
            <Callout kind="warn" title="BITFIELD LAYOUT">
              Bitfield layout (endianness within a field, alignment, type used) is largely <Term>Implementation-defined</Term>. Fine for in-process use; risky for on-disk/network formats — different compilers may lay them out differently. For portable serialization, manual bit shifts + masks.
            </Callout>
            <H2 num="◇ STRINGS">C strings: char arrays terminated by '\0'</H2>
            <Code id="strings">{`/* All four lines create equivalent data */
char s1[] = "hello";                /* [h][e][l][l][o][\\0] — 6 bytes, mutable */
char s2[6] = {'h','e','l','l','o',0};
char *s3 = "hello";                 /* string literal — usually read-only */
const char *s4 = "hello";           /* explicit + safe */

/* strlen walks until '\\0' — O(n) */
strlen(s1);                         /* 5 — does NOT include the \\0 */
sizeof s1;                          /* 6 — includes \\0; works only on arrays */

/* THE most common bug: missing \\0 */
char buf[5];
buf[0]='h'; buf[1]='e'; buf[2]='l'; buf[3]='l'; buf[4]='o';
strlen(buf);                        /* UB — reads past buf looking for \\0 */

/* DO use snprintf, NOT strcpy/strcat (unsafe), NOT strncpy (subtle pitfalls) */
char dst[64];
snprintf(dst, sizeof dst, "user=%s, id=%d", name, id);
/* Always null-terminated (when size > 0). Returns desired length — check for >= size. */`}</Code>
            <Callout kind="cite" title="MODERN REPLACEMENT">
              <Kbd>strcpy</Kbd> + <Kbd>strcat</Kbd> are deprecated by every modern style guide (LLVM, Google, Microsoft SDL). Use <Kbd>snprintf</Kbd>. The Library chapter has full safe-string patterns.
            </Callout>
            {QUIZZES.structures.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ LIBC">The standard library — what ships with C</H2>
            <P>libc is the freestanding-plus-hosted runtime. Linked automatically; no need to install anything. Knowing which header has which function saves the most time of any C skill.</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { h: '<stdio.h>', name: 'I/O', what: "printf, scanf, fprintf, snprintf, fopen, fclose, fread, fwrite, fgets, fputs, getline (POSIX), perror, feof, ferror, fseek, ftell, rewind. The most-used header." },
                { h: '<stdlib.h>', name: 'General utilities', what: "malloc, calloc, realloc, free, exit, atexit, getenv, system, qsort, bsearch, rand, srand, abs, labs, strtol, strtoul, strtod, atoi, atof." },
                { h: '<string.h>', name: 'Strings + memory', what: "strlen, strcmp, strncmp, strcpy, strncpy, strcat, strncat, strchr, strrchr, strstr, strerror, memcpy, memmove, memset, memcmp, memchr." },
                { h: '<ctype.h>', name: 'Character classes', what: "isalpha, isdigit, isalnum, isspace, isupper, islower, ispunct, tolower, toupper. All take int (a char or EOF). Locale-dependent." },
                { h: '<math.h>', name: 'Floating-point math', what: "sqrt, pow, exp, log, log2, log10, sin, cos, tan, asin, acos, atan, atan2, floor, ceil, round, fabs, fmod, isnan, isinf. Link with -lm." },
                { h: '<time.h>', name: 'Time', what: "time, time_t, struct tm, localtime, gmtime, strftime, mktime, difftime, clock, clock_gettime (POSIX), CLOCK_MONOTONIC vs CLOCK_REALTIME." },
                { h: '<errno.h>', name: 'Error codes', what: "errno (thread-local int), errno constants (ENOENT, EACCES, ENOMEM, EAGAIN, ...). Always pair with strerror() or perror()." },
                { h: '<stdint.h>', name: 'Fixed-width ints (C99)', what: "int8_t, int16_t, int32_t, int64_t, uint8_t-uint64_t, intptr_t, uintptr_t, INT32_MAX, etc." },
                { h: '<stddef.h>', name: 'Common types', what: "size_t, ptrdiff_t, NULL, offsetof. Tiny header, huge value." },
                { h: '<stdbool.h>', name: 'bool (C99)', what: "bool, true, false. Just typedef'd from _Bool. In C23, true/false became keywords (header still works for compat)." },
                { h: '<assert.h>', name: 'Asserts', what: "assert(expr) — aborts if expr is false. Compiled out when NDEBUG is defined. For programmer-invariant checks, not user-input validation." },
                { h: '<limits.h>', name: 'Integer limits', what: "INT_MAX, INT_MIN, CHAR_BIT, UINT_MAX, LONG_MAX, etc. Use these to write portable code." },
              ].map(h => (
                <div key={h.h} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <code className="text-blue-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.h}</code>
                    <span className="text-amber-300 text-[10px] uppercase tracking-wider" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.name}</span>
                  </div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{h.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ FILES">File I/O — the workhorse</H2>
            <Code id="file-io">{`#include <stdio.h>

/* Open / read / close */
FILE *f = fopen("data.txt", "r");
if (!f) { perror("fopen"); return -1; }

char buf[256];
while (fgets(buf, sizeof buf, f)) {
    /* buf has up to 255 chars + '\\0', possibly including '\\n' */
    process(buf);
}
if (ferror(f)) perror("read");
fclose(f);

/* Modes: "r" read, "w" write (truncates), "a" append, "r+" read+write,
   add "b" for binary on Windows ("rb", "wb"). */

/* Formatted I/O */
fprintf(stderr, "Error: %s (errno=%d)\\n", strerror(errno), errno);
int n;
char name[64];
if (fscanf(f, "%63s %d", name, &n) != 2) { /* parse failed */ }
/* %63s limits to buffer-1 (room for \\0). Always bound %s reads. */`}</Code>
            <H2 num="◇ STRTOL">strtol: the right way to parse</H2>
            <Code id="strtol">{`#include <errno.h>
#include <limits.h>
#include <stdlib.h>

const char *s = "42abc";
char *end;
errno = 0;
long v = strtol(s, &end, 10);

if (errno == ERANGE) { /* overflowed long */ }
if (end == s)        { /* no digits at all */ }
if (*end != '\\0')   { /* trailing garbage — here: "abc" */ }
if (v < INT_MIN || v > INT_MAX) { /* didn't fit in int */ }

/* atoi(s) returns 42 silently — no error path. Don't use it for user input. */`}</Code>
            <H2 num="◇ QSORT">qsort — generic sort</H2>
            <Code id="qsort">{`int compare_int(const void *a, const void *b) {
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);   /* better than (ia - ib) — avoids overflow */
}

int arr[] = {5, 2, 8, 1, 9};
qsort(arr, 5, sizeof(int), compare_int);

/* For descending, swap operands or negate result.
   For struct fields: cast operands and compare the field. */`}</Code>
            {QUIZZES.stdlib.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ C99">C99 — the upgrade everyone uses</H2>
            <P>1999. The biggest leap since the original standard. If you're writing C in 2026, these are baseline.</P>
            <Code id="c99">{`/* // line comments */
/* mid-block declarations — declare where you use, not just at top */
for (int i = 0; i < 10; i++) { ... }

/* Designated initializers — robust to field reorder */
struct Point p = { .x = 1, .y = 2 };
int sparse[100] = { [50] = 7, [99] = 9 };  /* zeros elsewhere */

/* Compound literals — anonymous struct/array values */
foo(&(struct Point){ .x = 10, .y = 20 });
sort_ints((int[]){ 5, 3, 1, 4, 2 }, 5);

/* Variable-length arrays (VLA) — size at runtime, on stack */
void process(size_t n) {
    int buf[n];        /* sized at function entry — careful with large n (stack overflow) */
}

/* stdint.h fixed-width types */
int32_t  count;
uint64_t hash;

/* stdbool.h */
#include <stdbool.h>
bool found = true;

/* restrict — optimizer hint */
void copy(int *restrict dst, const int *restrict src, size_t n);

/* inline — hint for the compiler */
static inline int max(int a, int b) { return a > b ? a : b; }`}</Code>
            <H2 num="◇ C11">C11 — atomics and threads</H2>
            <Code id="c11">{`/* _Generic — type-based macro dispatch */
#define abs(x) _Generic((x), \\
    int:    abs,    \\
    long:   labs,   \\
    double: fabs,   \\
    float:  fabsf   \\
)(x)

/* Atomics for lock-free concurrency */
#include <stdatomic.h>
atomic_int counter = 0;
atomic_fetch_add(&counter, 1);

/* Threads (rarely implemented well — use pthreads or platform APIs) */
#include <threads.h>

/* Alignment control */
#include <stdalign.h>
alignas(64) char cache_line_aligned[64];   /* CPU cache-line aligned */

/* Anonymous structs/unions inside structs */
struct Tagged {
    int kind;
    union { int as_int; char *as_str; };   /* no name needed */
};`}</Code>
            <H2 num="◇ C23">C23 — the modernization (current)</H2>
            <P>Published October 2024. GCC 15+ defaults to C23. The biggest C upgrade in over a decade.</P>
            <Code id="c23">{`/* nullptr — typed null pointer constant (no more (void *)0 macros) */
int *p = nullptr;
if (p == nullptr) { ... }

/* constexpr — compile-time constants (not full constexpr like C++) */
constexpr int CACHE_LINE = 64;
constexpr double PI = 3.14159265358979;

/* true / false / bool — now KEYWORDS, not macros from stdbool.h */
bool ready = true;
if (!ready) return;

/* _BitInt(N) — arbitrary-width integers */
_BitInt(7)  small;             /* 7-bit signed */
_BitInt(128) huge;             /* 128-bit signed */

/* #embed — include binary as initializer */
const unsigned char logo[] = {
    #embed "logo.png"
};
size_t logo_size = sizeof logo;

/* [[attribute]] syntax — standardized */
[[nodiscard]] int parse(const char *s);
[[deprecated("use new_api")]] void old_api(void);
[[maybe_unused]] static int debug_count;

/* typeof — extract the type of an expression */
int x = 5;
typeof(x) y = 10;             /* int y */

/* auto — type deduction (limited form) */
auto i = 42;                  /* int */

/* Empty () now means (void) — breaks K&R declarations */
int f();                      /* C23: f takes no args (like f(void))
                                 pre-C23: f takes UNSPECIFIED args */

/* enum with explicit underlying type */
enum Color : uint8_t { RED, GREEN, BLUE };

/* Standardized digit separators */
long x = 1'000'000;`}</Code>
            <Callout kind="cite" title="STANDARD STATUS">
              C23 = ISO/IEC 9899:2024, published Oct 31, 2024. Free spec draft: N3220 at open-std.org/jtc1/sc22/wg14. GCC 15+ uses C23 by default. Clang has partial C23 support (improving rapidly). MSVC is lagging.
            </Callout>
            <H2 num="◇ C2Y">What's next: C29 / C2Y</H2>
            <P>
              Working draft N3854, March 2026. Expected late 2029. GCC 15 + Clang 19 already implement experimental bits behind <Kbd>-std=c2y</Kbd>. Removing <Kbd>_Imaginary</Kbd>, adding more attributes, refining sequence points, more bit-precise types. Watch open-std.org/jtc1/sc22/wg14 for proposals.
            </P>
            {QUIZZES.modernc.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">A working library of patterns</H2>
            <P>
              The atlas would be incomplete without a snippets layer. Below is a curated collection of production-grade C idioms — the patterns you'll reach for over and over. Eight categories. Every snippet has a description, the code (copy button), and a note explaining tradeoffs or pitfalls.
            </P>
            <P>
              All snippets are MIT-licensed. Copy, modify, ship.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-blue-400 text-blue-300 px-4 py-2 text-[13px] hover:bg-blue-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
            </div>
            {stackData?.library && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.library}</Callout>}
            <Callout kind="cite" title="INSPIRATION">
              Patterns drawn from the Linux kernel (intrusive lists, container_of), SQLite (defensive style, single-file architecture), Redis (sds string, dict implementation), nginx (event loop, pool allocator), and the public works of Per Vognsen (Bitwise), Eskil Steenberg, Casey Muratori, and Jon Blow on data-oriented C.
            </Callout>
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ LIVE">Real C execution in your browser</H2>
            <P>
              The sandbox below uses <strong>JSCPP</strong> — a JavaScript-based C/C++ interpreter (~1 MB, MIT licensed, loaded from jsdelivr). It supports a useful subset: <Kbd>printf</Kbd>, <Kbd>scanf</Kbd>, arrays, structs, pointers, qsort, recursion, malloc/free. Not a full compiler — C23 features like <Kbd>nullptr</Kbd>, <Kbd>constexpr</Kbd>, <Kbd>_BitInt</Kbd>, or the preprocessor's full power aren't available. Use it for understanding logic, not testing modern syntax.
            </P>
            <P>
              Six challenges progress from <em>Hello, World</em> through pointer manipulation, string algorithms, and qsort with comparator. Output is matched against expected exactly. Free play mode lets you write any C and feed stdin.
            </P>
            <Sandbox />
            <Callout kind="cite" title="HOW IT WORKS">
              JSCPP 2.0.9 by Felix Hao. github.com/felixhao28/JSCPP. Originally written for educational MOOCs. Strict interpreter — refuses to ignore undefined behavior the way some compilers do. Loaded lazily, cached globally. (jsdelivr.com/package/npm/JSCPP)
            </Callout>
            <Callout kind="tip" title="LOCAL DEV">
              For real C development install gcc or clang locally and use the dev incantation: <Kbd>{'gcc -std=c23 -Wall -Wextra -Werror -g -fsanitize=address,undefined main.c -o app'}</Kbd>. The Toolchain chapter has the full setup. The sandbox is for in-page tinkering; a real toolchain is for everything serious.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">Reading the error</H2>
            <P>
              Compiler and runtime errors in C have a pattern. Read the <strong>first</strong> compiler error — later ones are usually cascading consequences. Read traceback frames <strong>bottom-up</strong> for the deepest call. For segfaults, recompile with sanitizers first; the diagnostic will point at the exact bytes.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLS">The C debugger's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'AddressSanitizer (ASAN)', what: "Compile with -fsanitize=address. Detects buffer overflows, use-after-free, double-free, leaks at runtime. Best single tool in modern C." },
                { name: 'UndefinedBehaviorSanitizer (UBSAN)', what: "Compile with -fsanitize=undefined. Catches signed overflow, NULL deref, OOB shifts, misaligned access. Pair with ASAN — different bug classes." },
                { name: 'gdb / lldb', what: "Interactive debugger. b break, r run, n next, s step, p print, bt backtrace, info locals. Set the breakpoint at the first suspicious line, step until things go wrong." },
                { name: 'valgrind --leak-check=full', what: "Slower than ASAN, doesn't need recompilation. Useful when ASAN-built binary doesn't reproduce a bug. Catches uninit-read (memcheck), races (helgrind), cache misses (cachegrind)." },
                { name: 'perf record / perf report', what: "Linux. Sampling profiler. perf record -g ./app; perf report. Find hotspots. Pair with FlameGraph for visual." },
                { name: 'godbolt.org', what: "Compiler Explorer. Paste C, see assembly across compiler versions. Diagnose 'why is this so slow' by reading the actual machine code." },
                { name: 'strace / dtruss', what: "Trace syscalls. strace -e openat ./app to see which files the program opens. Diagnoses 'why can't it find that config'." },
                { name: 'static analysis', what: "clang-tidy, scan-build, cppcheck, PVS-Studio. Find bugs without running. Run in CI." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-blue-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
          </>
        );

      case 11:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-blue-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
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
                      <div className="text-zinc-100 mb-1 whitespace-pre-wrap">{q.q}</div>
                      <div className="text-blue-300 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A C reading roadmap</H2>
            <P>
              For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1', plan: "K&R chapters 1-3 (intro, types, control flow). Type every example. Build with -Wall -Wextra. Read the man pages for printf, scanf, fopen, fread." },
                { wk: 'Week 2', plan: "K&R chapter 5 (pointers and arrays) + Steve Summit's C FAQ section 6 entirely. Use godbolt.org to inspect generated assembly. This is the make-or-break week." },
                { wk: 'Week 3', plan: "Modern C (Gustedt) levels 1 and 2. Learn ASAN — recompile your week-1 programs with sanitizers, fix everything they find. Read about UB at en.cppreference.com/w/c/language/behavior." },
                { wk: 'Week 4-6', plan: "Build three small projects from scratch: argv parser (~200 lines), word counter (~300 lines), basic shell with fork/exec/pipe (~500 lines). All with proper error handling + sanitizers + Makefiles." },
                { wk: 'Week 7-9', plan: "Implement, by hand: dynamic array, hash table, linked list, arena allocator. Use the Library chapter as reference, but TYPE them yourself, with full tests. This is where intuition for memory ownership solidifies." },
                { wk: 'Week 10+', plan: "Read real C code. SQLite (best-documented C codebase on Earth), Redis, nginx, the Linux kernel's /lib directory. Contribute a small bug fix to an open-source C project. Subscribe to LWN.net for the kernel coverage." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-blue-400 pl-3 py-1">
                  <div className="text-blue-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-blue-300 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-amber-300 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-blue-400 text-blue-300 px-4 py-2 text-[13px] hover:bg-blue-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-rose-400 text-rose-300 px-4 py-2 text-[13px] hover:bg-rose-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-amber-300 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-red-400 hover:text-red-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="THE END (AND THE BEGINNING)">
              C is a small language with a huge surface. The standards manuals are short; the engineering practice is decades-deep. You've walked the toolchain, the type system, pointers, memory, structures, libc, modern C, a working library of patterns, real execution, and the triage tree. Pick a small open-source C project and read it now. Every line will tell you something.
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
            <div className="text-blue-400 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>&amp;</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>C</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-rose-400/40 text-rose-300 px-2 py-1 text-[11px] hover:bg-rose-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-blue-400 hover:text-blue-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-blue-400 bg-blue-400/10 text-blue-300' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-blue-400" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-blue-400 text-blue-300 bg-blue-400/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-blue-400 hover:text-blue-300'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-blue-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        {/* ARCH DIAGRAM — on Toolchain chapter */}
        {activeSection === 1 && (
          <div className="mt-8 pt-6 border-t border-zinc-900">
            <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 mb-3" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ◇ The build pipeline
            </div>
            <ArchDiagram />
          </div>
        )}

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            &amp; · c atlas · grounded in K&amp;R + modern C + cppreference + ISO C23
          </div>
        </div>
      </main>
    </div>
  );
}
