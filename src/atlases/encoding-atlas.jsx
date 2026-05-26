import { useState, useEffect } from 'react';
import {
  Compass, Hash, Layers, FileText, Zap, Wrench, BookOpen, Check,
  ChevronRight, ChevronLeft, Copy, X, Search, RotateCcw, Play, ArrowLeft,
  Quote, MousePointerClick, Library, AlertTriangle, XCircle,
  Code as CodeIcon, ArrowRightLeft, Type, Binary
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   ENCODING / BYTES / WIRE FORMATS · ATLAS DATA
   Tier: NASA-light (educational frontend, production-deployed)
   Invariants: bounded conversions, validated inputs at boundaries,
   no silent catches, short functions.
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Why encoding exists. Teletype to Unicode. The mess between ASCII and now." },
  { id: 'bits', label: 'Bits & bytes', icon: Binary, num: '02', sub: "Binary, hex, octal. Endianness. The byte. Why we count in 8s." },
  { id: 'ascii', label: 'ASCII', icon: Type, num: '03', sub: "7-bit, 128 chars. Control codes. The foundation everything else builds on." },
  { id: 'unicode', label: 'Unicode', icon: Layers, num: '04', sub: "Codepoints, planes, the BMP, surrogate pairs. The abstract character model." },
  { id: 'utf8', label: 'UTF-8', icon: Hash, num: '05', sub: "The encoding that won. Variable-length, self-synchronizing, ASCII-compatible." },
  { id: 'utf16', label: 'UTF-16/32', icon: FileText, num: '06', sub: "The alternatives. Code units, surrogate pairs, BOM marks, where they're still used." },
  { id: 'base64', label: 'Base64', icon: ArrowRightLeft, num: '07', sub: "3 bytes → 4 chars. Padding. URL-safe variant. Not encryption — encoding." },
  { id: 'hex', label: 'Hex', icon: Hash, num: '08', sub: "Nibble pairs. Colors, hashes, binary dumps. The human-readable byte." },
  { id: 'url', label: 'URL encoding', icon: CodeIcon, num: '09', sub: "Percent-encoding. Reserved vs unreserved. Where most encoding bugs live." },
  { id: 'sandbox', label: 'Sandbox', icon: Zap, num: '10', sub: "Three live tools: multi-converter, hex inspector with bit visualization, mojibake demo." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Mojibake. BOM problems. Form-submit bugs. The encoding pathology guide." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "RFCs, libraries, manifestos. The references that aren't lies." },
];

const STACKS = [
  { id: 'web', label: 'Web dev', desc: 'URL encoding, base64 in tokens, UTF-8 in HTML/JSON, fetch + headers', icon: '◐' },
  { id: 'backend', label: 'Backend dev', desc: 'Database charsets, binary protocols, file encoding, internal serialization', icon: '◑' },
  { id: 'debug', label: 'Security / debugging', desc: 'Hex dumps, base64 in payloads, encoding analysis, mojibake forensics', icon: '◓' },
  { id: 'embedded', label: 'Embedded / systems', desc: 'Bytes, endianness, hex, fixed-width protocols, no Unicode (mostly)', icon: '◔' },
  { id: 'curious', label: 'Curious', desc: 'No specific role — learning the model that underlies all text on computers', icon: '✦' },
];

const GLOSSARY = {
  Encoding: "A scheme for mapping abstract characters (or arbitrary bytes) to a representation that can be stored or transmitted. UTF-8 maps codepoints to byte sequences. Base64 maps arbitrary bytes to a safe printable subset. Different jobs, same word.",
  "Character set": "The collection of abstract characters a system can represent. Often confused with encoding. ASCII is BOTH a character set (128 chars) AND an encoding (1 byte each). Unicode is a character set; UTF-8 is one encoding of it.",
  Charset: "Same as character set. Common in HTTP headers (Content-Type: text/html; charset=utf-8). Slightly misnomered — usually specifies the ENCODING, not the character set.",
  Codepoint: "An integer assigned to a character by Unicode. Written U+xxxx (4-6 hex digits). 'A' = U+0041. '中' = U+4E2D. '🚀' = U+1F680. The character's abstract identity, separate from how it's stored as bytes.",
  "Code unit": "The unit of an encoding. UTF-8 code unit = 1 byte. UTF-16 code unit = 2 bytes. UTF-32 code unit = 4 bytes. A single codepoint may take MULTIPLE code units (UTF-8 'é' = 2 code units, UTF-16 '🚀' = 2 code units via surrogate pair).",
  ASCII: "American Standard Code for Information Interchange. 7-bit. 128 characters total. Codepoints 0-31 are control (NUL, BEL, TAB, LF, CR, ESC). 32-126 are printable. 127 is DEL. The foundation; every modern encoding extends or builds on it.",
  "Extended ASCII": "Informal term for 8-bit encodings that include the 128 ASCII characters plus 128 more. Many incompatible variants: Latin-1, Windows-1252, KOI8-R, etc. The reason Unicode was needed.",
  "Latin-1": "ISO-8859-1. 8-bit. ASCII (0-127) + Western European characters (128-255). One of many '8-bit ASCII extensions'. Largely superseded by UTF-8, but still appears in old systems and HTTP defaults.",
  "Windows-1252": "Microsoft's superset of Latin-1. Differs in the 128-159 range (where Latin-1 has control chars, CP1252 has smart quotes, em-dashes, etc). Often what 'ANSI' means in Windows. Common source of mojibake.",
  "Code page": "IBM/Microsoft term for a character encoding mapping. CP437 (original IBM PC), CP1252 (Windows Western), CP932 (Shift-JIS). Mostly Windows-flavored terminology.",
  Unicode: "Universal character set. Currently assigns codepoints to 149,000+ characters from virtually every writing system on Earth, plus emoji, math symbols, etc. Updated yearly. The character set; UTF-8/16/32 are its encodings.",
  BMP: "Basic Multilingual Plane. Unicode codepoints U+0000 to U+FFFF. Contains the most commonly used characters — Latin, Greek, Cyrillic, CJK basics, Arabic, Hebrew, etc. Fits in 2 bytes. UTF-16 was designed assuming the BMP would be enough — it wasn't.",
  "Supplementary planes": "Unicode codepoints above U+FFFF (planes 1-16). Contains emoji, rare CJK, historical scripts, mathematical alphanumerics. Requires UTF-16 surrogate pairs to encode. UTF-8 handles them natively with 4-byte sequences.",
  "Surrogate pair": "UTF-16's mechanism for encoding codepoints above U+FFFF. A high surrogate (0xD800-0xDBFF) followed by a low surrogate (0xDC00-0xDFFF) together encode one supplementary-plane codepoint. The reason JavaScript's '🚀'.length === 2.",
  "High surrogate": "First half of a UTF-16 surrogate pair. Range U+D800-U+DBFF. Not a valid codepoint on its own — must be followed by a low surrogate.",
  "Low surrogate": "Second half of a UTF-16 surrogate pair. Range U+DC00-U+DFFF. Not valid on its own.",
  "UTF-8": "Variable-length encoding of Unicode. 1-4 bytes per codepoint. ASCII characters use 1 byte (so ASCII files are valid UTF-8). Higher codepoints use 2-4 bytes with a self-synchronizing bit pattern. The dominant text encoding on the web and Unix (>98% of web pages).",
  "UTF-16": "Variable-length encoding using 16-bit code units. BMP codepoints use 1 code unit (2 bytes); supplementary planes use surrogate pairs (4 bytes). Used internally by Java strings, JavaScript strings, Windows APIs, .NET. Has endianness (UTF-16LE vs UTF-16BE).",
  "UTF-32": "Fixed-length encoding. Always 4 bytes per codepoint. Simple but space-inefficient. Used in some internal text-processing systems where O(1) codepoint access matters. Rarely seen on disk or wire.",
  BOM: "Byte Order Mark. The codepoint U+FEFF, written at the start of a file to signal encoding and (for UTF-16/32) byte order. UTF-8 BOM is 'EF BB BF'. UTF-16LE BOM is 'FF FE'. UTF-16BE is 'FE FF'. Optional in UTF-8 (and often unwelcome — breaks some tools).",
  "Big-endian": "Byte order: most significant byte first. Network protocols traditionally use big-endian ('network byte order'). UTF-16BE writes the high byte of each code unit first.",
  "Little-endian": "Byte order: least significant byte first. x86 / x64 / ARM CPUs are little-endian internally. UTF-16LE writes the low byte first. Windows defaults UTF-16 to LE.",
  "Continuation byte": "In UTF-8, a non-leading byte of a multi-byte sequence. Always starts with bits '10xxxxxx' (0x80-0xBF range). Self-synchronizing property: a decoder can resync after a corrupt byte by skipping continuation bytes.",
  "Lead byte": "First byte of a UTF-8 sequence. Bits encode length: '0xxxxxxx' (1 byte, ASCII), '110xxxxx' (2 bytes), '1110xxxx' (3 bytes), '11110xxx' (4 bytes).",
  "Self-synchronizing": "Property of UTF-8: a decoder reading from any byte can quickly determine if it's at the start of a sequence (lead byte) or in the middle (continuation byte). Enables resync after corruption and substring searches without false matches.",
  "Variable-length": "Encoding where different codepoints use different numbers of bytes. UTF-8 (1-4 bytes), UTF-16 (2 or 4 bytes). Saves space for common characters; adds complexity for length calculations.",
  "Fixed-length": "Encoding where every codepoint uses the same number of bytes. UTF-32 (4 bytes each), ASCII (1 byte each). Simple indexing, predictable storage; wastes space.",
  Base64: "Encoding for arbitrary binary data using only 64 printable ASCII characters: A-Z (26) + a-z (26) + 0-9 (10) + '+' + '/'. Plus '=' for padding. Groups input bytes by 3, emits 4 chars per group. 33% size overhead. Used in email (MIME), basic auth, data URLs, JWT.",
  "Base64 URL-safe": "Variant of base64 replacing '+' and '/' with '-' and '_' (which don't need URL-escaping). Padding '=' is also often omitted. Used in JWT tokens, OAuth, URL parameters carrying binary data.",
  "Padding character": "The '=' character in base64. Used at the end when input bytes don't divide evenly by 3. One '=' if 2 bytes remain, two '==' if 1 byte remains. URL-safe base64 often drops padding.",
  Hex: "Hexadecimal. Base 16. Digits 0-9 and A-F (or a-f). Each hex digit represents 4 bits (a nibble); two digits = one byte. Common for representing bytes compactly (a 32-byte SHA-256 hash → 64 hex chars).",
  Hexadecimal: "Same as Hex. Base 16. Each digit is 0-9 or A-F.",
  Nibble: "4 bits. Half a byte. One hex digit. Two nibbles per byte. Sometimes 'nybble' — same thing.",
  Octal: "Base 8. Digits 0-7. Each octal digit = 3 bits. Largely historical (PDP-11 had 18-bit words divisible by 3). Still appears in Unix file modes (0755) and some C escape sequences (\\012 = LF).",
  Binary: "Base 2. Digits 0-1. The actual bit representation. Mostly used as a notation for showing bit patterns; not used as wire format directly (you'd use hex or the raw bytes).",
  Byte: "8 bits. The fundamental unit of memory and storage on virtually all modern systems. Values 0-255 (unsigned) or -128 to 127 (signed). One byte = two hex digits = one ASCII character = one UTF-8 code unit.",
  Bit: "Single binary digit. 0 or 1. The atomic unit of information.",
  Endianness: "The order in which bytes of a multi-byte number are stored or transmitted. Big-endian: high byte first. Little-endian: low byte first. Critical for binary protocols, file formats, network communication.",
  Signed: "An integer representation that can encode negative values. Most common scheme: two's complement (negate by inverting bits + 1). 8-bit signed: -128 to 127.",
  Unsigned: "Integer representation for non-negative values only. 8-bit unsigned: 0 to 255. Doubles the positive range. Common for byte values, lengths, file sizes.",
  "Two's complement": "Standard binary representation for signed integers. To negate: invert all bits, add 1. Has only one zero. Wraps on overflow. The math 'just works' for addition/subtraction.",
  "URL encoding": "Percent-encoding. Mechanism for representing characters in URLs that can't appear literally (reserved chars, non-ASCII). Format: %XX where XX is the byte value in hex. Space → %20. UTF-8 'é' → %C3%A9. Standard: RFC 3986.",
  "Percent encoding": "Same as URL encoding.",
  "Reserved characters": "In URLs, characters with special meaning: : / ? # [ ] @ ! $ & ' ( ) * + , ; =. Must be percent-encoded when used as data (not as syntax). Different URL components have different reserved sets.",
  "Unreserved characters": "Characters that NEVER need encoding in URLs: A-Z a-z 0-9 - . _ ~. Always safe to leave as-is. The 'allowlist' approach is safer than escaping reserved chars.",
  Punycode: "Encoding to represent Unicode domain names in ASCII (for DNS, which is ASCII-only). 'café.com' → 'xn--caf-dma.com'. Format: 'xn--' prefix + ASCII-friendly transformation. Part of IDNA spec.",
  IDNA: "Internationalized Domain Names in Applications. The standard for using non-ASCII characters in domain names via Punycode. Important for security (homograph attacks) and i18n.",
  Mojibake: "Garbled text resulting from encoding mismatch. Decoding UTF-8 as Latin-1 turns 'é' (C3 A9) into 'Ã©'. Decoding UTF-8 as CP1252 produces other artifacts. The Japanese word literally means 'character corruption'.",
  Escape: "A character (or sequence) that doesn't represent itself but indicates the next characters should be interpreted specially. Backslash in strings, percent in URLs, ampersand in HTML.",
  "Numeric character reference": "HTML/XML escape using codepoint number: &#65; or &#x41; for 'A'. Useful when you can't transmit certain characters in the file encoding but want them rendered.",
  "Entity reference": "HTML/XML escape using a name: &amp; for &, &lt; for <, &gt; for >, &nbsp; for non-breaking space, &quot; for \". A named alternative to numeric references.",
  ANSI: "Informal Windows term for the system's default 'extended ASCII' code page. Usually Windows-1252 in Western locales. NOT the ANSI standards body. Source of much confusion in Windows file handling.",
  "Quoted-printable": "Email-friendly encoding for text with occasional non-ASCII. Most chars pass through; non-ASCII becomes =XX (hex). Lines wrap at 76 chars. Used in MIME email bodies alongside base64.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "Why was Unicode invented if Latin-1 covered Western European languages?",
      opts: [
        "It didn't — Unicode replaced ASCII",
        "Latin-1 covered ONE region. Greek, Cyrillic, Hebrew, Arabic, CJK each needed their own 8-bit code page. A document with multiple scripts was impossible. Files weren't portable across systems with different defaults. Unicode unified all writing systems into one address space.",
        "For emoji"
      ],
      a: 1,
      x: "The 'extended ASCII' mess of the 1990s — dozens of incompatible 8-bit encodings — made internationalization brutal. A French file opened on a Russian computer was mojibake. Even within one language, Windows and Mac used different encodings (CP1252 vs MacRoman). Unicode was the universal solution; UTF-8 made it deployable on systems built around bytes."
    },
    {
      qid: 'o2',
      q: "What's the relationship between Unicode and UTF-8?",
      opts: [
        "They're the same",
        "Unicode is a CHARACTER SET — it assigns each character a codepoint (U+0041 for 'A', U+4E2D for '中'). UTF-8 is an ENCODING — a specific way to represent those codepoints as bytes. UTF-16 and UTF-32 are alternative encodings of the same Unicode character set.",
        "Unicode is newer"
      ],
      a: 1,
      x: "The character set / encoding distinction is the single biggest conceptual hurdle. Unicode says 'A is codepoint 65, 中 is codepoint 20013'. UTF-8 says 'codepoint 65 → 0x41, codepoint 20013 → E4 B8 AD'. Different encodings encode the same character set differently. The HTTP header 'charset=utf-8' technically misnames it — it's specifying an encoding."
    },
  ],
  bits: [
    {
      qid: 'b1',
      q: "How many bytes does 'café' use in UTF-8 vs UTF-16?",
      opts: [
        "Both use 4",
        "UTF-8: 'c','a','f' are 1 byte each (ASCII), 'é' is 2 bytes (C3 A9) → 5 bytes total. UTF-16: each of the 4 chars is 1 code unit (2 bytes) → 8 bytes (plus 2 if there's a BOM).",
        "UTF-8 uses 8"
      ],
      a: 1,
      x: "This is why UTF-8 dominates English/Latin-heavy text. ASCII chars cost the same as ASCII (1 byte) and only Unicode-specific chars pay extra. UTF-16 always pays at least 2 bytes per char, even for ASCII. For East Asian text the math reverses (UTF-8: 3 bytes per CJK char; UTF-16: 2). UTF-8 still wins overall for mixed content because metadata/markup is mostly ASCII."
    },
    {
      qid: 'b2',
      q: "What's endianness?",
      opts: [
        "Whether bytes are big or small",
        "The order of bytes within a multi-byte value. Big-endian: most significant byte first (network order, big number reads 'left to right'). Little-endian: least significant first (x86/ARM internal). The 16-bit number 0x1234 is stored as '12 34' big-endian or '34 12' little-endian.",
        "Whether files end in newlines"
      ],
      a: 1,
      x: "Endianness matters for any multi-byte binary format. Network protocols traditionally use big-endian ('network byte order'). x86/ARM/most consumer CPUs are little-endian. UTF-16 has both variants (UTF-16BE, UTF-16LE) — the BOM signals which. UTF-8 is byte-by-byte, so endianness doesn't apply."
    },
  ],
  ascii: [
    {
      qid: 'a1',
      q: "How many characters does ASCII define?",
      opts: [
        "256",
        "128 — ASCII is 7-bit (2^7 = 128). Codepoints 0-31 are control characters (TAB, LF, CR, ESC, etc). 32-126 are printable (space, digits, letters, punctuation). 127 is DEL. The 'extended ASCII' 128-255 range is NOT ASCII — it's various 8-bit extensions (Latin-1, CP1252, etc).",
        "65536"
      ],
      a: 1,
      x: "ASCII being 7-bit is historically important. It left the top bit free for parity (early telecommunications), or for code pages to extend the character set. Modern systems use the top bit for the 128-255 'extended' range — but that's where the encoding wars happened. UTF-8 cleverly reserved that top bit to signal multi-byte sequences, staying backwards-compatible with ASCII."
    },
    {
      qid: 'a2',
      q: "What are the printable ASCII characters?",
      opts: [
        "All 128",
        "Codepoints 32-126. Space (32) is the first printable. '~' (126) is the last. Codepoints 0-31 are control chars (non-printing); 127 is DEL. Digits '0'-'9' are 48-57. 'A'-'Z' are 65-90. 'a'-'z' are 97-122. The 32-offset between upper and lower case enables the toupper/tolower bit trick (XOR 0x20).",
        "Letters only"
      ],
      a: 1,
      x: "The ASCII layout was designed to make common operations cheap. Bit 5 (0x20) flips case. Subtracting '0' (48) from a digit char gives its numeric value. These tricks work for ASCII but BREAK for Unicode — e.g., uppercasing a German ß isn't a single XOR. Modern code should use locale-aware case functions."
    },
  ],
  unicode: [
    {
      qid: 'u1',
      q: "What's a codepoint?",
      opts: [
        "A byte value",
        "An integer Unicode assigns to a character. Written U+xxxx (4-6 hex digits). 'A' = U+0041 (decimal 65). '中' = U+4E2D. '🚀' = U+1F680. Codepoints range 0 to 0x10FFFF (~1.1 million possible). About 149,000 currently assigned to characters.",
        "A pixel"
      ],
      a: 1,
      x: "Codepoint != byte. A single codepoint may be encoded as 1, 2, 3, or 4 bytes in UTF-8; 2 or 4 bytes in UTF-16; always 4 bytes in UTF-32. Codepoints are the abstract identity; encodings are how those identities become bytes. JavaScript's .charCodeAt() returns UTF-16 code units (not codepoints!) — for codepoints use .codePointAt()."
    },
    {
      qid: 'u2',
      q: "What's the BMP?",
      opts: [
        "Bitmap",
        "Basic Multilingual Plane. Unicode codepoints U+0000 to U+FFFF. Contains the most common characters from most writing systems — Latin, Greek, Cyrillic, Hebrew, Arabic, CJK basics. Fits in 16 bits. UTF-16 encodes BMP chars in one code unit; supplementary-plane chars (above U+FFFF, includes emoji) need surrogate pairs.",
        "Backup Modal Process"
      ],
      a: 1,
      x: "UTF-16 was originally designed when Unicode fit in 16 bits — the assumption was the BMP would be enough. By Unicode 2.0 (1996) it became clear more codepoints were needed (rare CJK, mathematical alphabets, eventually emoji). Surrogate pairs were grafted on to extend UTF-16 above U+FFFF. UTF-8 was designed from the start to handle the full range cleanly."
    },
  ],
  utf8: [
    {
      qid: 'u8_1',
      q: "How does UTF-8 know how many bytes a character uses?",
      opts: [
        "It guesses",
        "The lead byte's high bits encode the length: '0xxxxxxx' = 1 byte (ASCII). '110xxxxx' = 2 bytes. '1110xxxx' = 3 bytes. '11110xxx' = 4 bytes. Continuation bytes are always '10xxxxxx'. So the first bits tell you 'how many bytes' AND distinguish lead from continuation.",
        "There's a length prefix"
      ],
      a: 1,
      x: "This bit pattern is the magic. It makes UTF-8 self-synchronizing — a decoder can resync after corruption by skipping continuation bytes until it finds a lead byte. It also means string operations like 'find substring' work byte-wise without false matches (a multi-byte character's bytes won't accidentally match ASCII bytes, because ASCII bytes never have the high bit set)."
    },
    {
      qid: 'u8_2',
      q: "What does the byte sequence 'EF BB BF' at the start of a file mean?",
      opts: [
        "Random",
        "UTF-8 BOM (Byte Order Mark). The codepoint U+FEFF encoded as UTF-8. Signals 'this file is UTF-8'. Optional in UTF-8 (which has no byte order ambiguity). Many tools handle BOM transparently; others (older PHP, some shell tools, JSON parsers) break on it. Generally avoid the UTF-8 BOM unless you have a specific reason.",
        "End of file"
      ],
      a: 1,
      x: "The UTF-8 BOM is controversial. Microsoft tools (older Notepad, Excel CSV export) write it. Unix tools mostly don't. JSON spec forbids BOM. The U+FEFF character originally had a different purpose — 'ZERO WIDTH NO-BREAK SPACE' — but its role at file start became the BOM convention. Modern best practice: don't write UTF-8 BOM; tolerate it on read."
    },
    {
      qid: 'u8_3',
      q: "What does \\xC3\\xA9 represent in UTF-8?",
      opts: [
        "Two letters",
        "The character 'é' (codepoint U+00E9). UTF-8 encoding: 0xC3 (binary 11000011, lead byte signaling 2-byte sequence) + 0xA9 (binary 10101001, continuation byte). Strip the prefix bits, concatenate: 00011 + 101001 = 11101001 = 0xE9 = U+00E9 = 'é'. The Sandbox visualizes this bit-by-bit.",
        "Question mark"
      ],
      a: 1,
      x: "The 'é' as two bytes is the classic UTF-8 surprise — file looks bigger than character count, str.length lies. The Sandbox 'Hex inspector' tab shows the bit breakdown live. If you see 'Ã©' instead of 'é' in your output, you've decoded UTF-8 as Latin-1 — the bytes C3 A9 became the Latin-1 chars 'Ã' (C3) and '©' (A9)."
    },
  ],
  utf16: [
    {
      qid: 'u16_1',
      q: "Why does '🚀'.length === 2 in JavaScript?",
      opts: [
        "It's a bug",
        "JavaScript strings are sequences of UTF-16 code units. '🚀' is codepoint U+1F680, in the supplementary planes. UTF-16 encodes it as a surrogate pair: D83D DE80 — two code units. Hence .length is 2. To count codepoints use [...str].length or Array.from(str).length, which iterate by codepoint (joining surrogates).",
        "Emoji are special"
      ],
      a: 1,
      x: "This trips up everyone working with emoji in JS. .length is code-unit count, not character count, not byte count. For UI purposes (visible characters) you usually want grapheme clusters — even more complex (a flag emoji might be 4 code units that form 2 codepoints that render as 1 character). For modern JS, Intl.Segmenter handles grapheme cluster counting properly."
    },
    {
      qid: 'u16_2',
      q: "What's the difference between UTF-16LE and UTF-16BE?",
      opts: [
        "Encoding versions",
        "Byte order. UTF-16LE writes each 16-bit code unit low-byte-first; BE writes high-byte-first. The code unit 0x0041 ('A') becomes '41 00' in LE, '00 41' in BE. The BOM at file start (FF FE = LE, FE FF = BE) signals which. Without a BOM, 'UTF-16' alone is ambiguous.",
        "One is older"
      ],
      a: 1,
      x: "Endianness ambiguity is why the BOM exists for UTF-16. Windows defaults to UTF-16LE. Java's DataInputStream uses BE. Files written by one platform and read by another without a BOM produce 'swapped byte' garbage. UTF-8 sidesteps this — bytes are bytes, no order to confuse."
    },
  ],
  base64: [
    {
      qid: 'b64_1',
      q: "Why does base64 produce more characters than the input bytes?",
      opts: [
        "Compression",
        "It encodes 3 input bytes (24 bits) as 4 output characters (24 bits, since each base64 char uses 6 bits). 4/3 ≈ 1.333x size. Plus padding adds 1-2 '=' chars at the end. So a 100-byte file becomes ~133-136 base64 characters. The point is REPRESENTABILITY in text contexts, not compression.",
        "Encryption overhead"
      ],
      a: 1,
      x: "Base64's job: take arbitrary bytes (including unprintable, including bytes that would break text protocols) and encode them as a safe alphabet that survives email, JSON, URLs (with the URL-safe variant), HTTP headers. The 33% overhead is the price. NOT for compression. NOT for encryption — anyone can decode it. Just for safe transport in text channels."
    },
    {
      qid: 'b64_2',
      q: "What's URL-safe base64?",
      opts: [
        "A faster variant",
        "A variant that replaces '+' with '-' and '/' with '_' — because '+' and '/' have special meaning in URLs and would need percent-encoding. Padding '=' is often dropped (it's recoverable from the length). Used in JWT tokens, OAuth, anywhere base64 appears in a URL parameter.",
        "It uses HTTPS"
      ],
      a: 1,
      x: "JWT tokens are URL-safe base64 — the three dot-separated segments are URL-safe base64 of (header, payload, signature). If you see '-' and '_' in a token-looking string with no padding, that's URL-safe base64. Standard base64 in a URL = double-encoded mess waiting to break."
    },
    {
      qid: 'b64_3',
      q: "Why does some base64 end with '=' and some with '=='?",
      opts: [
        "Random",
        "Padding. Base64 emits 4 chars per 3 input bytes. If input length % 3 == 0, no padding (clean groups of 3). If % 3 == 1 (1 leftover byte → 2 base64 chars + 2 padding '=='). If % 3 == 2 (2 leftover bytes → 3 base64 chars + 1 padding '='). So padding length tells you input length mod 3.",
        "Encryption"
      ],
      a: 1,
      x: "Padding makes base64 output always a multiple of 4 chars, which simplifies parsing. URL-safe base64 often drops the padding because it's recoverable — but some strict decoders require it. When implementing: always emit padding; tolerate missing padding on read."
    },
  ],
  hex: [
    {
      qid: 'h1',
      q: "What's a nibble?",
      opts: [
        "A small snack",
        "4 bits. Half a byte. One hex digit represents one nibble (0-F = 0000-1111). Two hex digits = one byte. So a 256-bit SHA-256 hash is 32 bytes = 64 hex digits. Color codes #FF0000 are 3 bytes (R, G, B) as 6 hex digits.",
        "A type of bit"
      ],
      a: 1,
      x: "Hex's appeal: each digit cleanly represents 4 bits. Reading bits from hex is trivial (F = 1111, 0 = 0000). Reading bits from decimal would require conversion. Hex is the human-readable byte format — preferred for crypto, hashes, binary dumps, memory addresses, color codes, anything where bit patterns matter."
    },
    {
      qid: 'h2',
      q: "Why use hex over decimal for byte values?",
      opts: [
        "It's shorter",
        "Bit-pattern visibility. 0xFF = 11111111 — all bits set, max value. 0x80 = 10000000 — high bit set. 0x0F = 00001111 — low nibble. Decimal hides the bit structure (255, 128, 15 — you have to convert in your head). Hex is also a fixed width per byte (always 2 digits) which helps in dumps and tables.",
        "Tradition"
      ],
      a: 1,
      x: "Hex's fixed-width property makes it perfect for byte dumps. 'xxd' or 'hexdump' show files as columns of hex bytes — readable, alignable, comparable. Try displaying a binary blob in decimal — you get jagged unaligned numbers from 0 to 255. Hex turns every byte into exactly 2 chars, every nibble into exactly 1 char, every bit-pattern into something you can read directly."
    },
  ],
  url: [
    {
      qid: 'ur1',
      q: "What does %20 mean in a URL?",
      opts: [
        "20%",
        "Percent-encoded space. The space character (codepoint 32 = 0x20) can't appear literally in a URL — it would terminate the URL parser. So it's encoded as '%' + the hex byte value: %20. Every URL-unsafe character is encoded this way. UTF-8 multibyte chars get one %XX per byte (so 'é' → %C3%A9).",
        "End of URL"
      ],
      a: 1,
      x: "The percent-encoding system handles two problems: (1) characters that mean something to the URL parser (?, #, &, /, etc.) when they appear as data, (2) characters that don't fit in ASCII (everything non-ASCII gets encoded as its UTF-8 byte representation, one %XX per byte). For your n8n webhook payloads with usernames/emails/etc, always run them through encodeURIComponent() before putting in URLs."
    },
    {
      qid: 'ur2',
      q: "What's the difference between encodeURI and encodeURIComponent in JS?",
      opts: [
        "Naming",
        "encodeURI assumes the input is a WHOLE URL and leaves URL syntax characters (: / ? # & = + $ etc.) unencoded — for percent-encoding non-ASCII in a URL you're constructing. encodeURIComponent assumes the input is a single COMPONENT (like a query parameter value) and encodes everything except unreserved chars — the safe choice when inserting user data into a URL.",
        "Speed"
      ],
      a: 1,
      x: "Use encodeURIComponent for query parameter values, path segments, and form-data. Use encodeURI only when you're literally building a URL from scratch (rare). The classic bug: applying encodeURI to a value that contains '&' — '&' is URL syntax, encodeURI leaves it alone, the resulting URL has an unintended parameter separator. encodeURIComponent escapes the '&' and you're safe."
    },
  ],
  triage: [
    {
      qid: 'tr1',
      q: "You see 'café' as 'cafÃ©' in your output. What happened?",
      opts: [
        "Random corruption",
        "Classic mojibake: UTF-8 bytes decoded as Latin-1. 'é' in UTF-8 is C3 A9. Latin-1 sees C3 as 'Ã' and A9 as '©'. The bytes are intact — only the decoding step is wrong. Fix by ensuring the consumer reads UTF-8: HTTP Content-Type charset, database connection charset, file reader encoding parameter. The data isn't corrupted, just misinterpreted.",
        "Hardware failure"
      ],
      a: 1,
      x: "Mojibake patterns are diagnostic. 'Ã©' = UTF-8-as-Latin-1. 'ï¿½' = UTF-8 BOM rendered as garbage. Vertical Japanese boxes (□) = font missing the glyph (data is fine). '?' = encoding-incompatible character replaced during conversion. Each pattern points to a specific layer where the encoding chain broke. Don't 'fix' the data — fix the layer that misread it."
    },
    {
      qid: 'tr2',
      q: "Best way to debug encoding issues end-to-end?",
      opts: [
        "Print and pray",
        "Look at BYTES, not displayed characters. xxd, hexdump, browser dev tools showing raw bytes, or Buffer.from(str, 'binary'). Identify the encoding at every boundary: file → reader → DB → API → response → renderer. Wherever the displayed bytes don't match the expected encoding, that's your bug.",
        "Use ASCII only"
      ],
      a: 1,
      x: "The fundamental rule: the bytes are the truth; everything else (string display, .length, .indexOf) is encoding-dependent interpretation. The Sandbox 'Hex inspector' tab lets you paste any string and see what bytes it would be in each encoding. When debugging, the question is 'what bytes are actually being sent/stored?' — not 'what does my editor show?'."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "The single highest-leverage encoding rule?",
      opts: [
        "Always use ASCII",
        "Use UTF-8 EVERYWHERE. Files, databases (utf8mb4 in MySQL, not utf8 which is broken), HTTP (Content-Type: text/html; charset=utf-8), HTML (<meta charset=\"utf-8\">), source code, command-line. Don't mix encodings. Don't write UTF-8 BOM unless required. When in doubt, UTF-8 is the answer.",
        "Avoid emoji"
      ],
      a: 1,
      x: "The 'UTF-8 Everywhere' manifesto (utf8everywhere.org) makes the case better than anyone. Every layer of the stack should produce, store, transmit, consume UTF-8. Convert at the boundary if you absolutely must interact with a non-UTF-8 system. Inside your domain: UTF-8 only. This eliminates the entire class of encoding-mismatch bugs."
    },
  ],
};

const COMPARISONS = {
  encodings_table: {
    title: "UTF-8 vs UTF-16 vs UTF-32",
    headers: ['Aspect', 'UTF-8', 'UTF-16', 'UTF-32'],
    rows: [
      ['Bytes per ASCII char', "1", "2", "4"],
      ['Bytes per BMP char (e.g., é, 中)', "2-3", "2", "4"],
      ['Bytes per emoji (e.g., 🚀)', "4", "4 (surrogate pair)", "4"],
      ['Variable-length?', "yes (1-4)", "yes (2 or 4)", "no (always 4)"],
      ['Has endianness?', "no", "yes (LE / BE)", "yes (LE / BE)"],
      ['ASCII-compatible?', "yes (ASCII is valid UTF-8)", "no", "no"],
      ['Self-synchronizing?', "yes", "no", "yes (trivially)"],
      ['Where it dominates', "Web (>98%), Unix, source code, JSON", "Java/JS/Win/.NET internal strings, NTFS filenames", "Some C++ internal text processing"],
      ['BOM bytes', "EF BB BF (optional, often unwelcome)", "FF FE (LE) / FE FF (BE)", "FF FE 00 00 (LE) / 00 00 FE FF (BE)"],
    ],
  },
  base_table: {
    title: "Bases — binary, octal, decimal, hex",
    headers: ['Base', 'Digits', 'Bits per digit', 'Where used'],
    rows: [
      ['Binary (base 2)', "0, 1", "1", "Bit patterns, conceptual. Rarely a wire format."],
      ['Octal (base 8)', "0-7", "3", "Unix file modes (0755), C escape sequences (\\012)."],
      ['Decimal (base 10)', "0-9", "~3.32 (irrational)", "Human-readable numbers. Doesn't align with byte boundaries."],
      ['Hex (base 16)', "0-9, A-F", "4", "Byte dumps, color codes, hashes, addresses, char escapes (\\xC3)."],
    ],
  },
  escape_table: {
    title: "Escape mechanisms — same idea, different contexts",
    headers: ['Context', 'Escape syntax', 'Example', 'Note'],
    rows: [
      ['URL', "%XX (hex byte)", "%20 (space), %C3%A9 (é in UTF-8)", "RFC 3986. Use encodeURIComponent for component values."],
      ['HTML/XML named', "&name;", "&amp;, &lt;, &gt;, &nbsp;, &quot;", "Predefined names. Other named entities exist (&copy;, etc)."],
      ['HTML/XML numeric', "&#N; or &#xN;", "&#65; or &#x41; = A", "Decimal or hex codepoint. Useful when text encoding can't carry the char."],
      ['JSON string', "\\uXXXX (4-hex codepoint)", "\\u00e9 = é, \\u4e2d = 中", "UTF-16 code units. Supplementary plane needs surrogate pair \\uD83D\\uDE80."],
      ['JavaScript string', "\\uXXXX or \\u{XXXXXX}", "\\u00e9 or \\u{1F680}", "ES6+ supports the {} form for full Unicode."],
      ['C/C++ string', "\\xHH or \\uXXXX or \\U00xxxxxx", "\\xC3\\xA9 = UTF-8 bytes for é", "Byte-level (\\x) vs char (\\u). Subtle for multi-byte chars."],
      ['Python string', "\\xHH or \\uXXXX or \\N{name}", "\\u00e9 or \\N{LATIN SMALL LETTER E WITH ACUTE}", "Named escape using full Unicode name available."],
      ["Shell ($' ')", "$'\\xHH' or $'\\uXXXX'", "$'\\xc3\\xa9'", "Bash, in $'...' strings. Plain '...' is literal."],
    ],
  },
  mojibake_table: {
    title: "Mojibake fingerprints — diagnosing what went wrong",
    headers: ['Symptom', 'Cause', 'Fix'],
    rows: [
      ["'café' shows as 'cafÃ©'", "UTF-8 bytes decoded as Latin-1 / Windows-1252", "Set decoder to UTF-8. Common in PHP, old Perl, MySQL connection charset."],
      ["'café' shows as 'caf?©' or 'caf?'", "Latin-1 bytes encoded as UTF-8 then decoded twice", "Find the double-conversion. Usually a 'safety' conversion before output."],
      ["Boxes (□) where chars should be", "Font missing the glyph", "Different problem — data is fine; install a font that has those glyphs. Common with Chinese/Japanese on Western systems."],
      ["'?' where chars should be", "Encoding-incompatible character replaced during conversion", "Find the conversion step. Often a Latin-1 system encountering non-Latin-1 chars and substituting '?'."],
      ["Each char appears twice (e.g., 'café' as 'ccaafféé')", "Decoded as a 2-byte-per-char encoding when bytes were 1-byte", "Looks like UTF-16 read as Latin-1. Reverse: re-read as UTF-16."],
      ["Random Chinese / unusual chars", "UTF-16 / UTF-32 read as UTF-8", "Detect file encoding (chardet, file -i). Re-read with correct encoding."],
      ["Smart quotes show as 'â€™' or 'â€œ'", "Windows-1252 smart quotes encoded as UTF-8, then read as UTF-8 by a tool that re-encoded again", "Force the writer to output UTF-8 from the start. Stop double-conversion."],
      ["Leading '' or 'ï»¿' on first line", "UTF-8 BOM (EF BB BF) read as 3 individual Latin-1 chars", "Reader needs BOM awareness, OR strip BOM at write time."],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "Using str.length to measure bytes", reason: "In most languages, .length is code-unit count (JS = UTF-16 code units, Python 3 = codepoints, Java = UTF-16 code units). To get byte count: TextEncoder().encode(s).length in JS, len(s.encode('utf-8')) in Python, s.getBytes(StandardCharsets.UTF_8).length in Java." },
  { name: "Assuming 1 char = 1 byte", reason: "Only true for ASCII in UTF-8, and never true for UTF-16/32. 'café' is 4 chars but 5 bytes in UTF-8. '🚀' is 1 codepoint, 2 UTF-16 code units, 4 UTF-8 bytes. Length operations always need to specify what you're counting." },
  { name: "Not setting charset in HTTP responses", reason: "Content-Type: text/html without charset = browser guesses (often Latin-1 by default in legacy mode, sometimes auto-detected). Always specify: Content-Type: text/html; charset=utf-8. Same for application/json — though most clients assume UTF-8 there." },
  { name: "Writing UTF-8 BOM unnecessarily", reason: "UTF-8 has no byte order ambiguity. The BOM (EF BB BF) at file start breaks: JSON parsing, shell script interpreters (#!), some old PHP, many command-line tools. Only write it if a specific consumer requires it (some Microsoft tools, notably Excel CSV import)." },
  { name: "Using .indexOf() / substring on multi-byte text", reason: "JS string operations work on UTF-16 code units. .indexOf('🚀') works if you compare with another '🚀', but slicing a string at index 1 of '🚀x' gives you only the high surrogate. For codepoint-aware operations, iterate via [...str] or use string methods that accept full codepoints." },
  { name: "Treating Base64 as encryption", reason: "Base64 is ENCODING — anyone can decode it. The JWT payload is base64-encoded; the SIGNATURE is what makes it tamper-evident, NOT the encoding. If you base64 a password to 'hide' it, you've achieved nothing. Use crypto for confidentiality." },
  { name: "URL-encoding an already-encoded URL", reason: "encodeURIComponent on a URL containing '%' chars (already-encoded data) re-encodes those '%' as %25. 'https://x/%20' becomes 'https%3A//x/%2520'. To URL-encode a parameter value, encode ONLY the value, not the URL. Round-trip safety: always know what level you're at." },
  { name: "Using ASCII upper/lowercase on Unicode", reason: "'IsTanbul'.toLowerCase() in Turkish locale gives 'ıstanbul' (dotted/dotless I rules). 'STRAßE'.toLowerCase() in German gives 'straße' (case-folding ß is special). Use locale-aware toLocaleLowerCase/toLocaleUpperCase, or Intl.Collator for comparisons. ASCII case tricks (XOR 0x20) only work for ASCII." },
  { name: "Storing UTF-8 in MySQL 'utf8' instead of 'utf8mb4'", reason: "MySQL's 'utf8' charset is a misnomer — it's max 3 bytes per char, can't store emoji or some CJK. Use 'utf8mb4' (4-byte max, the real UTF-8). Migrate old 'utf8' tables: ALTER TABLE ... CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci. This bites everyone with a user-facing app eventually." },
  { name: "Reading binary files as text", reason: "open(file, 'r') in Python or new String(fileBytes) in Java assumes the bytes are text in the default encoding. Random binary bytes often fail to decode → exception or replacement chars → file corrupted on re-save. Read binary files as bytes. Only decode bytes you KNOW are text in a KNOWN encoding." },
  { name: "Hardcoding 'ANSI' or 'system default' encoding in modern code", reason: "Windows 'ANSI' (often Windows-1252) is locale-dependent — same code reads different bytes on a French vs Japanese system. Always specify UTF-8 explicitly. Open files with encoding='utf-8'. Set Java -Dfile.encoding=UTF-8. Never rely on the system default for portable code." },
  { name: "Assuming 'all letters' fits in [a-zA-Z]", reason: "Regex character class [a-zA-Z] matches ASCII letters only. Real names contain é, ü, ñ, 中, 田中, etc. Use Unicode-aware character classes: \\p{L} for any letter (PCRE/Python/JS with /u flag). 'Validating' a name against [a-zA-Z]+ silently rejects huge fractions of real people." },
];

const COMMANDS = [
  { cmd: 'echo -n "hello" | base64', desc: "Base64-encode 'hello' (no trailing newline). Output: aGVsbG8=" },
  { cmd: 'echo "aGVsbG8=" | base64 -d', desc: "Base64-decode. The -d flag is GNU; macOS uses -D (capital). Output: hello" },
  { cmd: 'echo -n "hello" | xxd', desc: "Hex dump of 'hello'. Shows: 0000000: 6865 6c6c 6f  hello — bytes as hex + ASCII." },
  { cmd: 'echo -n "hello" | xxd -b', desc: "Binary dump (each byte shown in binary). For inspecting bit patterns directly." },
  { cmd: 'printf "%x\\n" 65', desc: "Print decimal 65 as hex. Output: 41 (= 'A' in ASCII). Reverse: printf '%d\\n' 0x41 → 65." },
  { cmd: 'iconv -f UTF-8 -t LATIN1 file.txt', desc: "Convert file from UTF-8 to Latin-1. Chars not in Latin-1 cause an error (or use //IGNORE to skip them, //TRANSLIT to approximate)." },
  { cmd: 'file -i somefile', desc: "Detect file encoding (rough guess). Output: text/plain; charset=utf-8. Linux/Unix; macOS may need 'file -I'." },
  { cmd: 'hexdump -C file', desc: "Canonical hex+ASCII dump. Three columns: offset, bytes (hex), printable preview. The standard for inspecting binary files." },
  { cmd: 'cat -v file', desc: "Show non-printable characters explicitly. Useful for spotting weird bytes (BOM, control chars, trailing whitespace)." },
  { cmd: 'od -c file', desc: "Octal dump with character display. Older but available everywhere; hexdump is usually preferred." },
  { cmd: "python -c \"import urllib.parse; print(urllib.parse.quote('hello world'))\"", desc: "URL-encode in Python. Output: hello%20world. urllib.parse.quote_plus also encodes + as %2B (for form-encoded values)." },
  { cmd: "python -c \"print('hello'.encode('utf-8').hex())\"", desc: "Get hex bytes of a UTF-8 string in Python. Output: 68656c6c6f. Add .encode('utf-8').hex(' ') for space-separated bytes." },
  { cmd: "node -e \"console.log(Buffer.from('hello').toString('base64'))\"", desc: "Base64-encode in Node. Output: aGVsbG8=. To decode: Buffer.from('aGVsbG8=', 'base64').toString('utf-8')." },
  { cmd: "node -e \"console.log(encodeURIComponent('hello & world'))\"", desc: "URL-encode in Node. Output: hello%20%26%20world. Use encodeURIComponent for VALUES; encodeURI only for whole-URL." },
  { cmd: 'echo -n "é" | xxd', desc: "See UTF-8 bytes for 'é'. Output: 0000000: c3a9 — two bytes (C3 A9). Confirms 'é' is multi-byte in UTF-8." },
  { cmd: "printf '\\xef\\xbb\\xbfHello' | hexdump -C", desc: "Construct a UTF-8 BOM + 'Hello' and inspect. The leading EF BB BF is the BOM; the rest is ASCII." },
];

const RESOURCES = [
  { name: "Unicode Standard", url: 'unicode.org/standard/standard.html', note: "The canonical reference. Updated annually. Charts (unicode.org/charts) show every assigned codepoint with details. Heavy reading, but the source of truth.", kind: 'reference' },
  { name: "UTF-8 Everywhere", url: 'utf8everywhere.org', note: "Manifesto and rationale for UTF-8 as the universal encoding. Arguments for why Windows / C++ ecosystems should drop UTF-16. Persuasive even if you don't fully buy the prescription.", kind: 'reference' },
  { name: "Joel Spolsky — The Absolute Minimum", url: 'joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/', note: "The classic 2003 essay. Slightly dated (mentions Unicode 4.x), but the core lessons are timeless. Required reading.", kind: 'reading' },
  { name: "RFC 3629 (UTF-8)", url: 'datatracker.ietf.org/doc/html/rfc3629', note: "The UTF-8 specification. Defines the encoding, the bit patterns, valid byte sequences, the noncharacter range. Short and readable.", kind: 'reference' },
  { name: "RFC 4648 (Base16, Base32, Base64)", url: 'datatracker.ietf.org/doc/html/rfc4648', note: "The base16/base32/base64 specs. Defines both standard and URL-safe variants. The authoritative source on padding rules.", kind: 'reference' },
  { name: "RFC 3986 (URI Generic Syntax)", url: 'datatracker.ietf.org/doc/html/rfc3986', note: "URL/URI structure and percent-encoding rules. Defines reserved vs unreserved characters. Heavy but authoritative — when you're not sure if a char needs encoding, this is the answer.", kind: 'reference' },
  { name: "Mathias Bynens — JavaScript Encoding Notes", url: 'mathiasbynens.be/notes/javascript-encoding', note: "Deep dive into how JavaScript represents strings (UTF-16 code units, .length gotchas, surrogate pairs, the /u regex flag). Essential for any non-trivial JS string work.", kind: 'reading' },
  { name: "Hexed.it / CyberChef", url: 'gchq.github.io/CyberChef/', note: "Web-based encoder/decoder/converter. Chain operations: 'From Hex' → 'AES Decrypt' → 'From Base64' → 'Render Image'. The Swiss army knife for ad-hoc encoding analysis.", kind: 'tool' },
  { name: "ICU (International Components for Unicode)", url: 'icu.unicode.org', note: "C/C++/Java libraries for proper Unicode handling: case folding, collation, normalization, segmentation. The reference implementation underneath most platform Unicode libraries.", kind: 'reference' },
  { name: "Unicode Confusables", url: 'util.unicode.org/UnicodeJsps/confusables.jsp', note: "Search for characters that look similar (homoglyph attack surface). 'apple' (Latin) vs 'аpple' (Cyrillic а) — visually identical, different codepoints. Important for security review.", kind: 'tool' },
  { name: "Compart Character Search", url: 'compart.com/en/unicode', note: "Search any Unicode codepoint by name, script, block. Shows encodings (UTF-8 bytes, UTF-16 code units, HTML entity, etc). Bookmark-worthy for everyday lookup.", kind: 'tool' },
  { name: "What every programmer should know about encodings", url: 'kunststube.net/encoding/', note: "Long-form tutorial covering byte vs character distinction, the history, common pitfalls. PHP-leaning examples but the concepts are universal.", kind: 'reading' },
];

const PERSONALIZED = {
  web: {
    spark: "Web dev: master encodeURIComponent for query params, base64-vs-base64url for tokens, UTF-8 in HTML meta + HTTP charset, and the difference between URL encoding (transport) and HTML escaping (rendering). Most web encoding bugs cluster in 3-4 specific places.",
    bits: "Web context: bytes mostly appear in: base64 strings (tokens, data URLs), hex (color codes, hashes), and UTF-8 byte counts (Content-Length, file size limits).",
    ascii: "Web: ASCII characters are URL-safe without encoding (well — most of them). Knowing the boundary helps you understand when encodeURIComponent will or won't change a character.",
    unicode: "Web: HTML meta charset, JSON spec mandates UTF-8 (with allowance for UTF-16/32 if BOM-prefixed). Inside JS, strings are UTF-16 code units — codepoint counting needs care.",
    utf8: "Web: this is your default. <meta charset='utf-8'>. Content-Type: text/html; charset=utf-8. Database utf8mb4. File reads with explicit utf-8. Match all the way through your stack.",
    utf16: "Web: UTF-16 mostly hides inside JS strings. Issue: .length lies for emoji and supplementary planes. Use [...str].length or Array.from(str).length for codepoint count.",
    base64: "Web: tokens (JWT, OAuth), Basic Auth headers, data URLs ('data:image/png;base64,...'). Use URL-safe base64 when the encoded value goes into a URL parameter — standard base64's '+' and '/' will break.",
    hex: "Web: color codes (#FF0000), SHA hashes in URLs, ETags. crypto.subtle.digest returns ArrayBuffer; convert to hex for display.",
    url: "Web: encodeURIComponent for query parameter values, path segments containing user data, anywhere you're inserting non-trusted text into a URL. NEVER concatenate user input into a URL without encoding.",
    library: "Web: form-data encoding, JSON Content-Type pitfalls, multipart/form-data structure, the URL constructor for safe parsing/building.",
  },
  backend: {
    spark: "Backend: master database charset config (utf8mb4 in MySQL, UTF-8 elsewhere), connection charset declaration, binary blob handling, and where to convert at boundaries. Most backend encoding bugs come from a single bad layer in a chain that's otherwise consistent.",
    bits: "Backend: bytes matter for: protocol design (fixed-width fields, length prefixes), binary serialization (Protobuf, MessagePack), file storage, hashing.",
    ascii: "Backend: ASCII is your protocol header friend. HTTP headers, CSV column names, database identifiers — keep them ASCII where you control them. The data layer can be Unicode.",
    unicode: "Backend: database normalization forms (NFC vs NFD — 'café' as one composed char vs e+combining-acute). Affects string equality, indexing. Normalize at write time.",
    utf8: "Backend: every layer should agree on UTF-8. File reads, DB connections, JSON serialization, HTTP responses. The 'utf8 everywhere' principle pays off.",
    utf16: "Backend: mostly internal to Java/C# runtimes — your wire format is UTF-8, your storage is UTF-8. UTF-16 surfaces if you're working with Windows-native APIs or NTFS filenames programmatically.",
    base64: "Backend: binary in databases (BLOB → base64 in JSON APIs), API keys, signed tokens, file uploads in JSON payloads. Watch encoding size overhead for large blobs.",
    hex: "Backend: hashes, UUIDs (often hex-formatted), binary protocols, logging binary data. SHA-256 as 64 hex chars, MD5 as 32, UUID-v4 as 8-4-4-4-12.",
    url: "Backend: parse incoming URLs, validate decoded values, re-encode for outgoing webhooks. Be defensive — URL libraries vary in strictness.",
    library: "Backend: charset config patterns, binary serialization recipes, normalized DB writes, encoding-aware logging.",
  },
  debug: {
    spark: "Debugging / security: develop instinct for reading hex dumps. When something looks 'wrong', look at the bytes. Mojibake patterns are diagnostic — each fingerprint points to a specific layer. The Sandbox 'mojibake demo' shows the patterns live.",
    bits: "Debugging: hex dumps are your default lens. xxd, hexdump -C, dev-tools Network tab response → raw bytes. The truth is in the bytes.",
    ascii: "Debugging: control chars in ASCII (0-31) are common sources of bugs (CRLF vs LF, NUL bytes terminating C strings prematurely). cat -v shows them. ^M = CR, ^? = DEL.",
    unicode: "Debugging: homoglyph attacks (Cyrillic 'а' for Latin 'a' in domain names). Check codepoints, not displayed glyphs. Tools like Unicode Confusables map this risk surface.",
    utf8: "Debugging: the bit pattern of UTF-8 lead bytes (110/1110/11110) tells you sequence length without decoding. The Hex Inspector tab in the Sandbox visualizes this. Use it to spot malformed UTF-8 (lead byte with no continuation, orphan continuation, etc).",
    utf16: "Debugging: spotting UTF-16: alternating 00 bytes (UTF-16BE for ASCII text) or trailing 00 bytes (UTF-16LE). 'EF BB BF' = UTF-8 BOM; 'FE FF' = UTF-16BE BOM; 'FF FE' = UTF-16LE BOM.",
    base64: "Debugging: base64 strings are easy to spot — alphanumeric + maybe / + = at end. Decode anything looking like base64 to see what's inside. JWT debugger sites split + decode header/payload. NEVER paste production tokens into public decoders.",
    hex: "Debugging: hex dumps are your bread and butter. Learn to read them at a glance — common bytes (0A = LF, 0D = CR, 20 = space, 41 = 'A'). Hexdump output: offset | hex bytes | ASCII preview.",
    url: "Debugging: percent-encoded sequences in URLs reveal what was originally there. Decode them to see if the original value makes sense. Double-encoded sequences (%25XX) are a red flag for layered URL handling bugs.",
    library: "Debugging: hex inspection recipes, mojibake fingerprint catalog, base64 decode workflows, encoding sniffers.",
  },
  embedded: {
    spark: "Embedded / systems: byte-level mastery. Endianness. Fixed-width fields. Probably no Unicode (or minimal — UTF-8 if any). Hex is your native language. Think in terms of memory layout and wire format, not character abstractions.",
    bits: "Embedded: bits and bytes are the entire game. Bit fields in headers. Two's complement signed math. Endianness in multi-byte fields. Pack/unpack patterns.",
    ascii: "Embedded: ASCII often the entirety of your text needs. Strings are byte arrays terminated by NUL (or length-prefixed). uppercase/lowercase ARE the simple bit XOR — because you control the alphabet.",
    unicode: "Embedded: usually not relevant. If you do support text input (UI displays), pick UTF-8 — most space-efficient for the kind of text you'll see, simple parsing.",
    utf8: "Embedded: if you need any text beyond ASCII, UTF-8. Decoder is small (~50 lines of C). State machine fits in cache. ASCII-compatible means existing string handling mostly works.",
    utf16: "Embedded: rarely. The only reason to encounter it: Windows-derived protocols, NTFS-formatted media, some Bluetooth profiles.",
    base64: "Embedded: encoding binary data in ASCII-only channels (config files, certificates, debug logs over text serial). Encoder/decoder is small (~100 lines).",
    hex: "Embedded: ubiquitous. Memory dumps, register values, protocol fields, EEPROM contents. Every byte in your firmware logs is hex.",
    url: "Embedded: occasional — when interfacing with web APIs, or in custom protocols mimicking URL syntax. RFC 3986 percent-encoding is the standard.",
    library: "Embedded: byte manipulation, fixed-width protocol patterns, minimal-footprint UTF-8 codec, hex formatting.",
  },
  curious: {
    spark: "Curious: the encoding story is one of computer science's good stories. From teletype machines transmitting 7-bit codes, through the i18n wars of the 1990s, to UTF-8's elegant winning design — there's deep history in here. Start with ASCII, then Unicode, then UTF-8. Build up the model.",
    bits: "Curious: bytes are the foundation. Bits combine into bytes. Bytes combine into characters (in some encoding). Without bytes there are no encodings. Worth getting solid on binary/hex notation first.",
    ascii: "Curious: ASCII is genius compression of decisions into 128 slots. The layout enables tricks (toupper by XOR, digit-to-int by subtract '0'). Read the ASCII table once; you'll never need to again.",
    unicode: "Curious: Unicode is a UN-level achievement of standardization. Every writing system on Earth, math, music notation, emoji — one unified numbering. The Unicode codepoint chart (unicode.org/charts) is hours of fascinating browsing.",
    utf8: "Curious: UTF-8 was invented by Ken Thompson and Rob Pike on a placemat at a New Jersey diner in 1992. The self-synchronizing bit pattern is elegant. Read 'UTF-8 Everywhere' for the design rationale.",
    utf16: "Curious: UTF-16 is a historical accident — designed when Unicode was supposed to fit in 16 bits. Surrogate pairs are the band-aid when supplementary planes happened. UTF-16 is mostly inertia at this point.",
    base64: "Curious: invented for email (MIME) — text-only transport channels needed a way to carry arbitrary bytes. The 64-char alphabet survived the mid-1990s spam filters. Now powers data URLs, JWT, OAuth.",
    hex: "Curious: hex is the human-byte interface. Each digit = 4 bits, each byte = 2 digits. The 16-character alphabet (0-9, A-F) is the right size for human reading. Decimal would be too dense; binary too verbose.",
    url: "Curious: percent encoding is the URL's escape hatch for arbitrary bytes. Why % specifically? It's a rare character in actual data; using it as an escape marker rarely collides. The spec is in RFC 3986.",
    library: "Curious: each encoding has stories — origins, design choices, where they fit. The Library snippets show working code patterns from real systems.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What encoding problem are you seeing?",
    opts: [
      { label: "🌀 Mojibake — text looks corrupted", next: 'mojibake' },
      { label: "📄 BOM appearing where it shouldn't", next: 'bom' },
      { label: "🔐 Base64 decode failing or producing junk", next: 'base64-issue' },
      { label: "🔗 URL parameters not received correctly", next: 'url-issue' },
      { label: "🗄 Database storing chars wrong (utf8 vs utf8mb4)", next: 'db-issue' },
      { label: "📧 Email subject / body with non-ASCII broken", next: 'email-issue' },
      { label: "📁 File can't be read or shows ?? chars", next: 'file-issue' },
      { label: "🎯 Comparing two strings that 'look' identical and they don't match", next: 'compare-issue' },
    ],
  },
  mojibake: {
    fix: "Mojibake = encoding mismatch between writer and reader. The bytes are intact; only the interpretation is wrong. Find the mismatch.",
    steps: [
      "Identify the fingerprint. 'Ã©' for 'é' = UTF-8 read as Latin-1. 'â€™' for ''' (smart quote) = Windows-1252 written as UTF-8, then re-decoded as UTF-8 (double encoding). Square boxes (□) = font issue, not encoding (data is fine).",
      "Trace the full chain: file/DB → reader → processing → output → render. At each step, what encoding is assumed? Find the layer that disagrees.",
      "Check HTTP headers: Content-Type: text/html; charset=utf-8. Without this, browsers may default to Latin-1 (legacy mode) or auto-detect (less reliable).",
      "Check HTML meta: <meta charset='utf-8'> as the first thing in <head>. Browsers buffer the first ~1024 bytes looking for this; place it early.",
      "Check database connection: MySQL needs both the table charset (utf8mb4) AND the connection charset (SET NAMES utf8mb4). Either alone causes mojibake.",
      "Check file reading: open(file) in Python 3 uses platform default; open(file, encoding='utf-8') is explicit. Java: new String(bytes, StandardCharsets.UTF_8). JS Node: fs.readFile(file, 'utf-8').",
      "Last resort: use the Sandbox 'mojibake demo' — paste the original text, encode in X, decode in Y, find which combination reproduces the corruption. Then you know which layer's encoding to fix.",
      "Never 'fix' the data by re-encoding the mojibake. The original bytes are usually still intact at some layer — fix the reader, not the data."
    ]
  },
  bom: {
    fix: "Byte Order Mark (EF BB BF for UTF-8) appearing where it shouldn't = something is writing it that you don't want.",
    steps: [
      "Identify what's writing the BOM. Common culprits: older Notepad on Windows, some Excel CSV exports, .NET's StreamWriter default constructor, Java's PrintWriter when invoked with FileOutputStream in some configs.",
      "Configure writer to NOT emit BOM: new StreamWriter(stream, new UTF8Encoding(false)) in .NET. PHP file_put_contents naturally omits it. Node fs.writeFile is BOM-free by default.",
      "If you can't fix the writer, strip BOM on read: bytes[0:3] == b'\\xef\\xbb\\xbf' ? skip 3 bytes : start at 0. Most JSON parsers will choke on BOM — must strip before parsing.",
      "For shell scripts: BOM before #! breaks the shebang. Re-save without BOM (most editors have 'Save Without BOM' option).",
      "For CSV: Excel REQUIRES BOM to recognize the file as UTF-8 (otherwise reads as system default). For Excel-targeted CSV exports, KEEP the BOM. For everyone else: strip it.",
      "Test: hexdump -C the file. First three bytes EF BB BF = UTF-8 BOM. FE FF = UTF-16BE BOM. FF FE = UTF-16LE BOM. If you don't want them, don't write them."
    ]
  },
  'base64-issue': {
    fix: "Base64 decode fails or produces wrong bytes. Usually: padding missing, URL-safe vs standard, or whitespace in the input.",
    steps: [
      "Check the alphabet. Standard base64 uses + and /. URL-safe uses - and _. If you see - or _, use the URL-safe decoder (Buffer.from(s, 'base64url') in Node, base64.urlsafe_b64decode in Python).",
      "Check the padding. Length should be a multiple of 4. If shorter, pad with '=' to reach a multiple of 4. (URL-safe base64 often drops padding; you may need to add it back.)",
      "Check for whitespace. Newlines (MIME-style line wrapping) or stray spaces fail strict decoders. Remove them first: s.replace(/\\s/g, '').",
      "Check encoding of the SOURCE. base64 encodes BYTES. If you have a string, you must first decide the encoding to convert string→bytes. 'hello' as UTF-8 → base64. 'hello' as UTF-16 → different base64.",
      "If decoding succeeds but the bytes look wrong: confirm the original encoding. Maybe the producer encoded UTF-16 bytes and you're trying to read as UTF-8 text.",
      "JWT debugging: split on '.', URL-safe-base64 decode each segment. The first two are JSON; the third is the signature (raw bytes). NEVER paste production tokens into public JWT debuggers."
    ]
  },
  'url-issue': {
    fix: "URL parameters arriving wrong = encoding/decoding mismatch on the way in or way out.",
    steps: [
      "Check the BUILDER. Are you using encodeURIComponent on values? Building URL by string concatenation without encoding = broken on chars like &, =, +, #, /, spaces.",
      "Check the PARSER. Use URLSearchParams (JS), urllib.parse.parse_qs (Python), request.GET (Django), req.query (Express). NEVER hand-parse URL query strings — many edge cases.",
      "Check for double-encoding. 'hello%20world' as a value, then encoded again, becomes 'hello%2520world'. Symptoms: literal % in your decoded values. Trace where the value enters your code; encode exactly once.",
      "Check + vs %20. Spaces in query strings can be EITHER + (form-encoded) or %20 (RFC 3986). Most parsers handle both, but some are strict. encodeURIComponent emits %20; URLSearchParams emits +.",
      "Check Content-Type for POST form data. application/x-www-form-urlencoded = same encoding rules as URL query. multipart/form-data = different mechanism (separate parts per field). application/json = no URL encoding (use JSON escapes).",
      "Test by inspecting the raw HTTP request (browser DevTools Network tab → Headers → Form Data → 'view source'). What bytes is the browser actually sending?"
    ]
  },
  'db-issue': {
    fix: "MySQL has a footgun: 'utf8' is NOT real UTF-8. Use 'utf8mb4'.",
    steps: [
      "Diagnose: SELECT HEX(your_text_column) FROM table WHERE id = X. If you see C3 A9 for 'é', the storage is correct UTF-8. If you see 3F (= '?') or odd patterns, the data is already corrupted on write.",
      "Check current table charset: SHOW CREATE TABLE your_table. Look for DEFAULT CHARSET. If 'utf8' (3-byte max), migrate to 'utf8mb4' (4-byte max, real UTF-8).",
      "Migration: ALTER TABLE your_table CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci. Test on a backup first. Indexes may need resizing (utf8mb4 can have longer keys).",
      "Connection charset: in your connection string add charset=utf8mb4 (Node's mysql2, Python's pymysql, etc). Or run SET NAMES utf8mb4 after connecting.",
      "PostgreSQL doesn't have this problem — UTF8 there is real UTF-8. SQL Server: NVARCHAR (UTF-16) or VARCHAR with explicit collation. Each DB has its own quirks; check.",
      "Test: insert '🚀'. utf8 fails or stores '????'. utf8mb4 stores correctly. The rocket emoji is the easy diagnostic — supplementary plane, requires 4-byte UTF-8."
    ]
  },
  'email-issue': {
    fix: "Email is an old protocol with byte-oriented headers. Non-ASCII needs explicit MIME encoding.",
    steps: [
      "Subject line with non-ASCII: needs RFC 2047 encoded-word. Format: =?UTF-8?B?<base64>?= or =?UTF-8?Q?<quoted-printable>?=. Modern email libraries (Python email, Nodemailer) handle this automatically.",
      "Body charset: header Content-Type: text/plain; charset=utf-8 PLUS Content-Transfer-Encoding: quoted-printable (or base64, or 7bit-only). Without the transfer encoding, non-ASCII bytes may be mangled.",
      "From/To addresses with non-ASCII local-part: SMTPUTF8 extension. Many servers still reject it. Stick to ASCII addresses if possible; use display names for the human-readable part.",
      "Attachments: always base64 encoded with appropriate Content-Type. Filename with non-ASCII: RFC 5987 encoding (filename*=UTF-8''my%20fil%C3%A9.pdf).",
      "Test send to multiple providers (Gmail, Outlook, ProtonMail, simple IMAP test client). Different mail servers/clients handle MIME differently — what works in Gmail may fail in Outlook.",
      "If using SES, SendGrid, etc.: their SDKs usually handle encoding correctly. If you're hand-rolling SMTP, use a proper library — don't try to format MIME headers manually."
    ]
  },
  'file-issue': {
    fix: "Can't read a file or it shows ?? chars = encoding misdetection.",
    steps: [
      "Identify the actual encoding: file -i somefile (Linux) or chardet/python-chardet (cross-platform). Result is a guess; for binary or unusual encodings, it may say 'unknown'.",
      "Look at the first bytes: hexdump -C file | head -1. EF BB BF = UTF-8 BOM. FE FF = UTF-16BE. FF FE = UTF-16LE. No BOM + most bytes < 0x80 = likely ASCII/UTF-8. Many 00 bytes interspersed = UTF-16.",
      "Try reading with the detected encoding explicitly. Don't rely on platform default — be explicit: open(f, encoding='utf-8') / open(f, encoding='latin-1') / open(f, encoding='utf-16').",
      "If chars show as '?' or replacement chars (\\uFFFD): the file is being read in an encoding incompatible with its contents. The original bytes for those characters are LOST in the decoded string.",
      "Convert with iconv: iconv -f WINDOWS-1252 -t UTF-8 in.txt > out.txt. Use //IGNORE to skip untranslatable chars, //TRANSLIT to approximate.",
      "For CSV files specifically: Excel-saved CSVs may be UTF-8 BOM, UTF-16LE, or system code page. Check each. Excel re-saves can change encoding silently."
    ]
  },
  'compare-issue': {
    fix: "Two strings look identical but don't compare equal = different code units producing same visual.",
    steps: [
      "Compare codepoint by codepoint: [...str1] vs [...str2] (JS). Find the first divergence — it's almost always a normalization or homoglyph difference.",
      "Normalization forms: 'café' could be 'c' + 'a' + 'f' + 'é' (composed, NFC) or 'c' + 'a' + 'f' + 'e' + COMBINING_ACUTE (decomposed, NFD). Visual identical, byte-different. Normalize before compare: str.normalize('NFC').",
      "Homoglyphs: Cyrillic 'а' (U+0430) and Latin 'a' (U+0061) look identical. Common in security contexts (spoofed domains). Inspect codepoints: 'a'.codePointAt(0) for each.",
      "Whitespace: trailing spaces, non-breaking space (U+00A0) vs regular space (U+0020), zero-width chars (U+200B). Strip suspicious whitespace before compare.",
      "Locale differences: Turkish 'I' lowercase = 'ı', not 'i'. Case-insensitive compare needs locale-aware: str.localeCompare(other, 'tr', {sensitivity: 'accent'}).",
      "For security-critical comparison (usernames, identifiers): normalize, lowercase, strip, then compare. For display equality: probably also normalize-then-compare. For exact-byte equality (signatures, hashes): never normalize — bytes must match exactly."
    ]
  },
};

/* ═══════════════════════════════════════════════════════════════
   SANDBOX LOGIC — pure conversion functions, UTF-8 bit visualizer,
   mojibake simulator. JS built-ins (TextEncoder/Decoder, btoa/atob)
   do the work; this layer is structure + validation.
   ═══════════════════════════════════════════════════════════════ */

const SBX = Object.freeze({
  MAX_INPUT_CHARS: 5000,
  MAX_BYTES: 20000,
  MAX_HEX_CHARS: 40000,
  MAX_OUTPUT_LINES: 200,
});

/* ─── String <-> bytes (UTF-8) ─── */
function stringToUtf8Bytes(s) {
  if (typeof s !== 'string') throw new Error('input must be string');
  if (s.length > SBX.MAX_INPUT_CHARS) throw new Error(`input exceeds ${SBX.MAX_INPUT_CHARS} chars`);
  const enc = new TextEncoder();
  const bytes = enc.encode(s);
  if (bytes.length > SBX.MAX_BYTES) throw new Error(`output exceeds ${SBX.MAX_BYTES} bytes`);
  return bytes;
}

function utf8BytesToString(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('input must be Uint8Array');
  if (bytes.length > SBX.MAX_BYTES) throw new Error(`input exceeds ${SBX.MAX_BYTES} bytes`);
  const dec = new TextDecoder('utf-8', { fatal: false });
  return dec.decode(bytes);
}

function utf8BytesToStringStrict(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('input must be Uint8Array');
  const dec = new TextDecoder('utf-8', { fatal: true });
  return dec.decode(bytes);
}

/* ─── Bytes <-> hex ─── */
function bytesToHex(bytes, separator = '') {
  if (!(bytes instanceof Uint8Array)) throw new Error('input must be Uint8Array');
  if (typeof separator !== 'string') separator = '';
  const parts = new Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    parts[i] = bytes[i].toString(16).padStart(2, '0').toUpperCase();
  }
  return parts.join(separator);
}

function hexToBytes(hex) {
  if (typeof hex !== 'string') throw new Error('input must be string');
  if (hex.length > SBX.MAX_HEX_CHARS) throw new Error(`hex exceeds ${SBX.MAX_HEX_CHARS} chars`);
  const clean = hex.replace(/[\s:,-]/g, '').toUpperCase();
  if (clean.length % 2 !== 0) throw new Error('hex must have even length (got ' + clean.length + ')');
  if (!/^[0-9A-F]*$/.test(clean)) throw new Error('hex contains non-hex characters');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/* ─── Bytes <-> base64 (standard + URL-safe) ─── */
function bytesToBase64(bytes, urlSafe = false) {
  if (!(bytes instanceof Uint8Array)) throw new Error('input must be Uint8Array');
  // btoa needs a Latin-1 string. Build it byte-by-byte.
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  let result = btoa(binary);
  if (urlSafe) {
    result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  return result;
}

function base64ToBytes(s, urlSafe = false) {
  if (typeof s !== 'string') throw new Error('input must be string');
  let clean = s.replace(/\s/g, '');
  if (urlSafe) {
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    // Pad to multiple of 4
    while (clean.length % 4 !== 0) clean += '=';
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(clean)) {
    throw new Error('input contains invalid base64 characters');
  }
  let binary;
  try { binary = atob(clean); }
  catch (e) { throw new Error('base64 decode failed: ' + (e.message || 'invalid input')); }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/* ─── URL encoding ─── */
function urlEncode(s) {
  if (typeof s !== 'string') throw new Error('input must be string');
  if (s.length > SBX.MAX_INPUT_CHARS) throw new Error(`input exceeds ${SBX.MAX_INPUT_CHARS} chars`);
  return encodeURIComponent(s);
}

function urlDecode(s) {
  if (typeof s !== 'string') throw new Error('input must be string');
  if (s.length > SBX.MAX_INPUT_CHARS) throw new Error(`input exceeds ${SBX.MAX_INPUT_CHARS} chars`);
  try { return decodeURIComponent(s); }
  catch (e) { throw new Error('URL decode failed: invalid percent-encoded sequence'); }
}

/* ─── Codepoints (real Unicode codepoints, not UTF-16 code units) ─── */
function stringToCodepoints(s) {
  if (typeof s !== 'string') throw new Error('input must be string');
  return [...s].map(c => c.codePointAt(0));
}

function codepointsToString(cps) {
  if (!Array.isArray(cps)) throw new Error('input must be array');
  return String.fromCodePoint(...cps);
}

function formatCodepoint(cp) {
  if (typeof cp !== 'number') throw new Error('codepoint must be number');
  return 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
}

/* ─── UTF-16 code units (for visualization) ─── */
function stringToUtf16Units(s, bigEndian = false) {
  if (typeof s !== 'string') throw new Error('input must be string');
  if (s.length > SBX.MAX_INPUT_CHARS) throw new Error(`input exceeds ${SBX.MAX_INPUT_CHARS} chars`);
  const bytes = new Uint8Array(s.length * 2);
  for (let i = 0; i < s.length; i++) {
    const unit = s.charCodeAt(i);
    if (bigEndian) {
      bytes[i * 2] = (unit >> 8) & 0xff;
      bytes[i * 2 + 1] = unit & 0xff;
    } else {
      bytes[i * 2] = unit & 0xff;
      bytes[i * 2 + 1] = (unit >> 8) & 0xff;
    }
  }
  return bytes;
}

/* ─── UTF-8 bit pattern analyzer — for the visualizer ─── */
function analyzeUtf8(bytes) {
  if (!(bytes instanceof Uint8Array)) throw new Error('input must be Uint8Array');
  const sequences = [];
  let i = 0;
  let safety = 0;
  while (i < bytes.length) {
    safety++;
    if (safety > SBX.MAX_BYTES) break;
    const b = bytes[i];
    const seq = { startIdx: i, bytes: [b], status: 'ok', codepoint: null, label: '', bitPattern: '' };

    if (b < 0x80) {
      // 1-byte: 0xxxxxxx (ASCII)
      seq.codepoint = b;
      seq.label = '1-byte ASCII';
      seq.bitPattern = b.toString(2).padStart(8, '0');
      i++;
    } else if ((b & 0xe0) === 0xc0) {
      // 2-byte: 110xxxxx 10xxxxxx
      if (i + 1 >= bytes.length || (bytes[i + 1] & 0xc0) !== 0x80) {
        seq.status = 'malformed';
        seq.label = '2-byte lead, missing/bad continuation';
        i++;
      } else {
        const b2 = bytes[i + 1];
        seq.bytes.push(b2);
        seq.codepoint = ((b & 0x1f) << 6) | (b2 & 0x3f);
        seq.label = '2-byte sequence';
        seq.bitPattern = b.toString(2).padStart(8, '0') + ' ' + b2.toString(2).padStart(8, '0');
        // Overlong check
        if (seq.codepoint < 0x80) seq.status = 'overlong';
        i += 2;
      }
    } else if ((b & 0xf0) === 0xe0) {
      // 3-byte: 1110xxxx 10xxxxxx 10xxxxxx
      if (i + 2 >= bytes.length || (bytes[i + 1] & 0xc0) !== 0x80 || (bytes[i + 2] & 0xc0) !== 0x80) {
        seq.status = 'malformed';
        seq.label = '3-byte lead, missing/bad continuation';
        i++;
      } else {
        const b2 = bytes[i + 1], b3 = bytes[i + 2];
        seq.bytes.push(b2, b3);
        seq.codepoint = ((b & 0x0f) << 12) | ((b2 & 0x3f) << 6) | (b3 & 0x3f);
        seq.label = '3-byte sequence (BMP)';
        seq.bitPattern = b.toString(2).padStart(8, '0') + ' ' + b2.toString(2).padStart(8, '0') + ' ' + b3.toString(2).padStart(8, '0');
        if (seq.codepoint < 0x800) seq.status = 'overlong';
        if (seq.codepoint >= 0xd800 && seq.codepoint <= 0xdfff) {
          seq.status = 'malformed';
          seq.label = '3-byte sequence (surrogate — invalid)';
        }
        i += 3;
      }
    } else if ((b & 0xf8) === 0xf0) {
      // 4-byte: 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (i + 3 >= bytes.length ||
          (bytes[i + 1] & 0xc0) !== 0x80 ||
          (bytes[i + 2] & 0xc0) !== 0x80 ||
          (bytes[i + 3] & 0xc0) !== 0x80) {
        seq.status = 'malformed';
        seq.label = '4-byte lead, missing/bad continuation';
        i++;
      } else {
        const b2 = bytes[i + 1], b3 = bytes[i + 2], b4 = bytes[i + 3];
        seq.bytes.push(b2, b3, b4);
        seq.codepoint = ((b & 0x07) << 18) | ((b2 & 0x3f) << 12) | ((b3 & 0x3f) << 6) | (b4 & 0x3f);
        seq.label = '4-byte sequence (supplementary plane)';
        seq.bitPattern = b.toString(2).padStart(8, '0') + ' ' + b2.toString(2).padStart(8, '0') + ' ' + b3.toString(2).padStart(8, '0') + ' ' + b4.toString(2).padStart(8, '0');
        if (seq.codepoint < 0x10000) seq.status = 'overlong';
        if (seq.codepoint > 0x10ffff) seq.status = 'out-of-range';
        i += 4;
      }
    } else {
      // Orphan continuation byte (10xxxxxx) or invalid lead (11111xxx)
      seq.status = 'malformed';
      seq.label = (b & 0xc0) === 0x80 ? 'orphan continuation byte' : 'invalid lead byte';
      i++;
    }
    sequences.push(seq);
  }
  return sequences;
}

/* ─── Mojibake simulator: encode in srcEnc, decode as dstEnc ─── */
const MOJIBAKE_ENCODINGS = ['utf-8', 'iso-8859-1', 'windows-1252', 'utf-16le', 'utf-16be'];

function simulateMojibake(text, srcEnc, dstEnc) {
  if (typeof text !== 'string') throw new Error('text must be string');
  if (!MOJIBAKE_ENCODINGS.includes(srcEnc)) throw new Error('srcEnc must be one of: ' + MOJIBAKE_ENCODINGS.join(', '));
  if (!MOJIBAKE_ENCODINGS.includes(dstEnc)) throw new Error('dstEnc must be one of: ' + MOJIBAKE_ENCODINGS.join(', '));
  if (text.length > SBX.MAX_INPUT_CHARS) throw new Error(`text exceeds ${SBX.MAX_INPUT_CHARS} chars`);

  // Encode
  let bytes;
  try {
    if (srcEnc === 'utf-8') {
      bytes = new TextEncoder().encode(text);
    } else if (srcEnc === 'utf-16le') {
      bytes = stringToUtf16Units(text, false);
    } else if (srcEnc === 'utf-16be') {
      bytes = stringToUtf16Units(text, true);
    } else {
      // Latin-1 / Windows-1252: emulate by encoding each codepoint as its low byte where possible
      bytes = new Uint8Array(text.length);
      for (let i = 0; i < text.length; i++) {
        const cp = text.charCodeAt(i);
        if (cp <= 0xff) bytes[i] = cp;
        else bytes[i] = 0x3f; // '?' replacement for unencodable
      }
    }
  } catch (e) { return { ok: false, error: 'encode failed: ' + e.message, decoded: '', bytes: null }; }

  // Decode
  let decoded;
  try {
    decoded = new TextDecoder(dstEnc, { fatal: false }).decode(bytes);
  } catch (e) { return { ok: false, error: 'decode failed: ' + e.message, decoded: '', bytes }; }

  return { ok: true, error: null, decoded, bytes };
}

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'encatlas:';

async function loadKey(key) {
  if (typeof key !== 'string' || key.length === 0) return null;
  try {
    const result = await window.storage.get(STORAGE_PREFIX + key);
    if (!result || typeof result.value !== 'string') return null;
    return JSON.parse(result.value);
  } catch (e) {
    console.warn(`[encatlas] storage.get failed for "${key}":`, e?.message || e);
    return null;
  }
}

async function saveKey(key, value) {
  if (typeof key !== 'string' || key.length === 0) return false;
  try {
    await window.storage.set(STORAGE_PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[encatlas] storage.set failed for "${key}":`, e?.message || e);
    return false;
  }
}

/* ─── Challenges ─── */
const CHALLENGES = [
  { id: 'multi', title: '01 · Multi-converter', desc: "Any input → live view of UTF-8 bytes, UTF-16 units, Base64, hex, URL-encoded, codepoints." },
  { id: 'hex-inspect', title: '02 · Hex inspector', desc: "Paste hex bytes, see UTF-8 decode + bit pattern breakdown. Spot malformed UTF-8." },
  { id: 'mojibake', title: '03 · Mojibake demo', desc: "Encode in X, decode as Y. See the corruption patterns live. The classic UTF-8-as-Latin-1." },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function EncodingAtlas() {
  const [loaded, setLoaded] = useState(false);
  const [completed, setCompleted] = useState(new Set());
  const [checklist, setChecklist] = useState({});
  const [quizState, setQuizState] = useState({});
  const [stack, setStack] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [copied, setCopied] = useState(null);
  const [termPopup, setTermPopup] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
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
      if (e.key === 'Escape') { setCmdOpen(false); setTermPopup(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const copy = (text, id) => {
    if (typeof text !== 'string') return;
    navigator.clipboard.writeText(text).catch(e => console.warn('[encatlas] copy failed:', e?.message));
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };
  const toggleCheck = (id) => setChecklist(prev => ({ ...prev, [id]: !prev[id] }));
  const markComplete = (i) => setCompleted(prev => new Set([...prev, i]));
  const answerQuiz = (qid, choice, correct) => {
    setQuizState(prev => ({ ...prev, [qid]: { choice, correct: choice === correct } }));
  };

  /* ─── UI primitives ─── */
  const Code = ({ children, id, lang = 'text' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-amber-200 transition-colors">
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
      info: { border: 'border-amber-200/40', bg: 'bg-amber-200/5', text: 'text-amber-200', label: 'NOTE' },
      warn: { border: 'border-amber-300/50', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'GOTCHA' },
      tip: { border: 'border-sky-400/40', bg: 'bg-sky-400/5', text: 'text-sky-300', label: 'TIP' },
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
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-amber-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
        ◰ {data.title}
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
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-amber-200' : 'text-zinc-300'}`}
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-amber-200 border-amber-200' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-sky-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-amber-200 bg-amber-200/10 text-amber-100' :
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
        className="border-b border-dotted border-amber-200/60 text-amber-200 hover:text-amber-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-amber-200 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-amber-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* ─── SANDBOX: 3 live tools — multi-converter, hex inspector, mojibake demo ─── */
  const Sandbox = () => {
    const [tool, setTool] = useState('multi');

    /* ─── Multi-converter ─── */
    const [mcInput, setMcInput] = useState('café 🚀');
    const [mcSource, setMcSource] = useState('text');

    const computeMulti = () => {
      const out = {
        ok: true, error: null,
        text: '', codepoints: [], utf8Hex: '', utf16leHex: '', utf16beHex: '',
        base64: '', base64url: '', urlEncoded: '', length: { chars: 0, codepoints: 0, utf8: 0, utf16: 0 }
      };
      try {
        let text;
        if (mcSource === 'text') {
          text = mcInput;
        } else if (mcSource === 'utf8hex') {
          text = utf8BytesToString(hexToBytes(mcInput));
        } else if (mcSource === 'base64') {
          text = utf8BytesToString(base64ToBytes(mcInput, false));
        } else if (mcSource === 'base64url') {
          text = utf8BytesToString(base64ToBytes(mcInput, true));
        } else if (mcSource === 'urlenc') {
          text = urlDecode(mcInput);
        } else { text = mcInput; }

        if (text.length > SBX.MAX_INPUT_CHARS) throw new Error(`text exceeds ${SBX.MAX_INPUT_CHARS} chars`);
        const utf8 = stringToUtf8Bytes(text);
        const utf16le = stringToUtf16Units(text, false);
        const utf16be = stringToUtf16Units(text, true);
        const cps = stringToCodepoints(text);

        out.text = text;
        out.codepoints = cps;
        out.utf8Hex = bytesToHex(utf8, ' ');
        out.utf16leHex = bytesToHex(utf16le, ' ');
        out.utf16beHex = bytesToHex(utf16be, ' ');
        out.base64 = bytesToBase64(utf8, false);
        out.base64url = bytesToBase64(utf8, true);
        out.urlEncoded = urlEncode(text);
        out.length = { chars: text.length, codepoints: cps.length, utf8: utf8.length, utf16: utf16le.length };
      } catch (e) {
        out.ok = false;
        out.error = e.message || String(e);
      }
      return out;
    };

    const mc = computeMulti();

    /* ─── Hex inspector ─── */
    const [hexInput, setHexInput] = useState('43 61 66 C3 A9 20 F0 9F 9A 80');
    const computeHex = () => {
      try {
        const bytes = hexToBytes(hexInput);
        const sequences = analyzeUtf8(bytes);
        const decoded = utf8BytesToString(bytes);
        return { ok: true, error: null, bytes, sequences, decoded };
      } catch (e) {
        return { ok: false, error: e.message, bytes: null, sequences: [], decoded: '' };
      }
    };
    const hi = computeHex();

    /* ─── Mojibake ─── */
    const [mojText, setMojText] = useState('café résumé naïve');
    const [mojSrc, setMojSrc] = useState('utf-8');
    const [mojDst, setMojDst] = useState('iso-8859-1');

    let mojResult;
    try { mojResult = simulateMojibake(mojText, mojSrc, mojDst); }
    catch (e) { mojResult = { ok: false, error: e.message, decoded: '', bytes: null }; }

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE SANDBOX</span>
            <span className="text-amber-200">●</span>
          </div>
        </div>

        {/* Tool tabs */}
        <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
          {CHALLENGES.map(c => (
            <button key={c.id} onClick={() => setTool(c.id)}
              className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${tool === c.id ? 'border-amber-200 text-amber-200 bg-amber-200/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {c.title.split(' · ')[0]} {c.title.split(' · ')[1]}
            </button>
          ))}
        </div>
        <div className="px-3 py-2 border-b border-zinc-800">
          <div className="text-[13px] text-zinc-300 leading-relaxed">
            {CHALLENGES.find(c => c.id === tool)?.desc}
          </div>
        </div>

        {/* MULTI-CONVERTER */}
        {tool === 'multi' && (
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
              <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>INPUT AS</div>
              <div className="flex gap-1">
                {['text', 'utf8hex', 'base64', 'base64url', 'urlenc'].map(s => (
                  <button key={s} onClick={() => setMcSource(s)}
                    className={`text-[10px] px-2 py-0.5 border ${mcSource === s ? 'border-amber-200 text-amber-200 bg-amber-200/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s}</button>
                ))}
              </div>
            </div>
            <textarea value={mcInput} onChange={e => setMcInput(e.target.value.slice(0, SBX.MAX_INPUT_CHARS))}
              rows={3} spellCheck={false}
              className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[13px] outline-none focus:border-amber-200 leading-relaxed"
              style={{ fontFamily: 'JetBrains Mono, monospace' }} />
            <div className="text-[10px] text-zinc-600 mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {mcInput.length} / {SBX.MAX_INPUT_CHARS} chars
            </div>

            {!mc.ok && (
              <div className="mt-3 border border-rose-500/50 bg-rose-500/10 p-3 text-[12px] text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                error: {mc.error}
              </div>
            )}

            {mc.ok && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px]">
                  <div className="border border-zinc-800 px-2 py-1.5">
                    <div className="text-zinc-500 uppercase tracking-wider text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>.length</div>
                    <div className="text-zinc-100" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mc.length.chars}</div>
                  </div>
                  <div className="border border-zinc-800 px-2 py-1.5">
                    <div className="text-zinc-500 uppercase tracking-wider text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>codepoints</div>
                    <div className="text-amber-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mc.length.codepoints}</div>
                  </div>
                  <div className="border border-zinc-800 px-2 py-1.5">
                    <div className="text-zinc-500 uppercase tracking-wider text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>UTF-8 bytes</div>
                    <div className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mc.length.utf8}</div>
                  </div>
                  <div className="border border-zinc-800 px-2 py-1.5">
                    <div className="text-zinc-500 uppercase tracking-wider text-[9px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>UTF-16 bytes</div>
                    <div className="text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{mc.length.utf16}</div>
                  </div>
                </div>

                <div className="mt-3 space-y-2">
                  {[
                    { label: 'TEXT (decoded)', value: mc.text, color: 'text-zinc-100' },
                    { label: 'CODEPOINTS', value: mc.codepoints.map(formatCodepoint).join(' '), color: 'text-amber-200' },
                    { label: 'UTF-8 HEX', value: mc.utf8Hex, color: 'text-sky-300' },
                    { label: 'UTF-16LE HEX', value: mc.utf16leHex, color: 'text-sky-300' },
                    { label: 'UTF-16BE HEX', value: mc.utf16beHex, color: 'text-sky-300' },
                    { label: 'BASE64', value: mc.base64, color: 'text-zinc-100' },
                    { label: 'BASE64 URL-SAFE', value: mc.base64url, color: 'text-zinc-100' },
                    { label: 'URL-ENCODED', value: mc.urlEncoded, color: 'text-zinc-100' },
                  ].map(row => (
                    <div key={row.label} className="border border-zinc-800">
                      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.2em] text-zinc-500 px-2 py-1 border-b border-zinc-900 bg-zinc-950/60">
                        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{row.label}</span>
                        <button onClick={() => copy(row.value, 'mc-' + row.label)} className="flex items-center gap-1 hover:text-amber-200">
                          {copied === 'mc-' + row.label ? <Check size={10} /> : <Copy size={10} />}
                          {copied === 'mc-' + row.label ? 'copied' : 'copy'}
                        </button>
                      </div>
                      <div className={`px-2 py-1.5 text-[12px] break-all leading-relaxed ${row.color}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {row.value || <span className="text-zinc-600 italic">(empty)</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* HEX INSPECTOR */}
        {tool === 'hex-inspect' && (
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>HEX INPUT</div>
            <textarea value={hexInput} onChange={e => setHexInput(e.target.value.slice(0, SBX.MAX_HEX_CHARS))}
              rows={3} spellCheck={false} placeholder="C3 A9 (separator any of: space, comma, dash, colon)"
              className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[13px] outline-none focus:border-amber-200 leading-relaxed"
              style={{ fontFamily: 'JetBrains Mono, monospace' }} />

            {!hi.ok && (
              <div className="mt-3 border border-rose-500/50 bg-rose-500/10 p-3 text-[12px] text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                error: {hi.error}
              </div>
            )}

            {hi.ok && (
              <>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>UTF-8 DECODE</div>
                  <div className="bg-black border border-zinc-800 px-3 py-2 text-[14px] text-zinc-100 break-all min-h-[40px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {hi.decoded || <span className="text-zinc-600 italic">(empty)</span>}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>BYTE-BY-BYTE BREAKDOWN</div>
                  <div className="bg-black border border-zinc-800">
                    {hi.sequences.length === 0 && <div className="px-3 py-2 text-zinc-600 text-[12px] italic">(no bytes)</div>}
                    {hi.sequences.map((s, i) => (
                      <div key={i} className={`px-3 py-2 border-b border-zinc-900 last:border-0 ${s.status !== 'ok' ? 'bg-rose-500/10' : ''}`}>
                        <div className="flex items-center gap-2 flex-wrap text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          <span className="text-zinc-500 w-12">@{s.startIdx}</span>
                          <span className={`px-1.5 py-0.5 border text-[10px] uppercase tracking-wider ${s.status === 'ok' ? 'border-amber-200/40 text-amber-200' : 'border-rose-400 text-rose-300'}`}>
                            {s.status}
                          </span>
                          <span className="text-zinc-300">{s.label}</span>
                          {s.codepoint !== null && (
                            <span className="text-amber-200 ml-auto">{formatCodepoint(s.codepoint)} {s.status === 'ok' ? `(${String.fromCodePoint(s.codepoint)})` : ''}</span>
                          )}
                        </div>
                        {s.bitPattern && (
                          <div className="mt-1 text-[11px] text-sky-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                            bits: {s.bitPattern}
                          </div>
                        )}
                        <div className="mt-0.5 text-[11px] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                          hex: {s.bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Callout kind="tip" title="READ THE BIT PATTERN">
                  Lead bytes encode length in their high bits: <Kbd>0xxxxxxx</Kbd> = 1 byte (ASCII), <Kbd>110xxxxx</Kbd> = 2 bytes, <Kbd>1110xxxx</Kbd> = 3 bytes, <Kbd>11110xxx</Kbd> = 4 bytes. Continuation bytes are always <Kbd>10xxxxxx</Kbd>. This self-synchronization is what makes UTF-8 elegant — a decoder reading mid-stream can always tell if it's at a lead byte or in the middle of a sequence.
                </Callout>
              </>
            )}
          </div>
        )}

        {/* MOJIBAKE */}
        {tool === 'mojibake' && (
          <div className="px-3 py-3 border-b border-zinc-800">
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>SOURCE TEXT</div>
            <input value={mojText} onChange={e => setMojText(e.target.value.slice(0, 200))}
              className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[13px] outline-none focus:border-amber-200"
              style={{ fontFamily: 'JetBrains Mono, monospace' }} />

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>1. ENCODED AS</div>
                <select value={mojSrc} onChange={e => setMojSrc(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-amber-200"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {MOJIBAKE_ENCODINGS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>2. DECODED AS</div>
                <select value={mojDst} onChange={e => setMojDst(e.target.value)}
                  className="w-full bg-black border border-zinc-800 text-zinc-100 p-2 text-[12px] outline-none focus:border-amber-200"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {MOJIBAKE_ENCODINGS.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>

            {!mojResult.ok ? (
              <div className="mt-3 border border-rose-500/50 bg-rose-500/10 p-3 text-[12px] text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                error: {mojResult.error}
              </div>
            ) : (
              <>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>RESULT</div>
                  <div className={`border px-3 py-2 text-[14px] break-all min-h-[40px] ${mojSrc === mojDst ? 'border-amber-200/40 bg-amber-200/5 text-zinc-100' : 'border-rose-400/40 bg-rose-500/5 text-rose-100'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {mojResult.decoded || <span className="text-zinc-600 italic">(empty)</span>}
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>INTERMEDIATE BYTES (hex)</div>
                  <div className="bg-black border border-zinc-800 px-3 py-2 text-[11px] text-sky-300 break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                    {mojResult.bytes && bytesToHex(mojResult.bytes, ' ')}
                  </div>
                </div>
                <Callout kind={mojSrc === mojDst ? 'info' : 'dont'} title={mojSrc === mojDst ? 'ENCODING MATCHES' : 'MOJIBAKE'}>
                  {mojSrc === mojDst
                    ? `Same encoding both directions — clean round-trip. This is what happens when your writer and reader agree.`
                    : `Encoded as ${mojSrc}, decoded as ${mojDst} — the bytes are intact but interpreted wrong. THE DATA ISN'T CORRUPTED — only the decoding step is wrong. Fix: make the reader use ${mojSrc} (the source encoding), not ${mojDst}.`}
                </Callout>
              </>
            )}

            <Callout kind="tip" title="THE CLASSIC CASE">
              Set source = utf-8, decoded as = iso-8859-1. Watch "café" become "cafÃ©". This is THE most common mojibake pattern in production systems — a UTF-8 file/payload read by code that defaults to Latin-1.
            </Callout>
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
                  <span className={i === path.length - 1 ? 'text-amber-200' : ''}>{p}</span>
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
              <div className="border-l-2 border-amber-200 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-amber-200 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-amber-200 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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
    let md = "# Encoding / Bytes / Wire Formats — Cheatsheet\n\n";
    md += "## UTF-8 vs UTF-16 vs UTF-32\n\n| Aspect | UTF-8 | UTF-16 | UTF-32 |\n|---|---|---|---|\n";
    COMPARISONS.encodings_table.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Bases\n\n| Base | Digits | Bits/digit | Where |\n|---|---|---|---|\n";
    COMPARISONS.base_table.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Escape mechanisms\n\n| Context | Syntax | Example | Note |\n|---|---|---|---|\n";
    COMPARISONS.escape_table.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Mojibake fingerprints\n\n| Symptom | Cause | Fix |\n|---|---|---|\n";
    COMPARISONS.mojibake_table.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += "\n## Commands\n\n```\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    md += "\n## Anti-patterns\n\n";
    ANTIPATTERNS.forEach(a => { md += `- **${a.name}** — ${a.reason}\n\n`; });
    try {
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'encoding-atlas-cheatsheet.md'; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.warn('[encatlas] export failed:', e?.message); }
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
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-amber-200/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-amber-200" />
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Chapters, terms, commands"
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
                  item.kind === 'chapter' ? 'text-amber-200' :
                  item.kind === 'term' ? 'text-sky-400' : 'text-fuchsia-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-amber-200/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-amber-200/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>◰ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your encoding context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-amber-200 hover:bg-amber-300/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-amber-200 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
     Note: prose uses Kbd for any bare `less than` or `greater than`
     comparisons, so JSX doesn't try to parse them as tags.
     ═══════════════════════════════════════════════════════════════ */
  const renderSection = () => {
    switch (activeSection) {
      case 0:
        return (
          <>
            <H2 num="◇ 1963">ASCII — 128 slots for civilization</H2>
            <P>
              <Term>ASCII</Term> was published in 1963 by the American Standards Association. Seven bits. 128 codepoints. Designed for teletype machines transmitting English text. The genius of ASCII wasn't the character set — it was the LAYOUT. Digits sit together, letters sit together, uppercase differs from lowercase by exactly one bit (0x20). The arrangement made common operations cheap.
            </P>
            <P>
              7-bit was a deliberate choice. The 8th bit could be used for parity in telecom, or — much later — to extend the character set. ASCII would remain the foundation; everything else would be backwards-compatible with it.
            </P>
            <H2 num="◇ 1980s">The 8-bit code page mess</H2>
            <P>
              Every language wanted its own characters. Latin-1 (ISO-8859-1) added Western European chars (à, é, ü) in the 128-255 range. Latin-2 covered Eastern European. KOI8-R for Russian. Shift-JIS for Japanese. Each used the same byte slots for different characters. <strong>A document written in one encoding was unreadable in another.</strong> Files weren't portable across systems with different defaults.
            </P>
            <P>
              <Term name="Windows-1252">Windows-1252</Term> made the chaos worse by being almost-Latin-1 — different in the 128-159 range (smart quotes, em-dashes vs control chars). Macintosh used MacRoman. The same byte 0x91 was a control char in Latin-1, a smart quote in Windows-1252, and something else again in MacRoman. <Term>Mojibake</Term> was constant.
            </P>
            <H2 num="◇ 1991">Unicode — one number per character</H2>
            <P>
              The <Term>Unicode</Term> Consortium published Unicode 1.0 in 1991. The premise: ONE universal character set covering every writing system on Earth. Each character gets a <Term>Codepoint</Term> — an integer identifier (U+0041 for 'A', U+4E2D for '中'). Initially Unicode was 16 bits (~65,000 chars, the <Term>BMP</Term>). By 1996 it was clear that wasn't enough — supplementary planes were added, bringing the range to U+0000-U+10FFFF (~1.1 million slots).
            </P>
            <P>
              But Unicode is a CHARACTER SET, not an encoding. It tells you 'A is 65, 中 is 20013'. It doesn't tell you how to put those numbers in bytes. That's where UTF-8, UTF-16, UTF-32 come in.
            </P>
            <H2 num="◇ 1992">UTF-8 — the encoding that won</H2>
            <P>
              <Term>UTF-8</Term> was invented by Ken Thompson and Rob Pike. Variable-length: 1-4 bytes per codepoint. ASCII characters stay as 1 byte (so ASCII files are valid UTF-8 — backwards compatible). Higher codepoints use 2-4 bytes with a self-synchronizing bit pattern. By 2010 it was the dominant web encoding; today >98% of web pages use it.
            </P>
            <Callout kind="cite" title="WHY UTF-8 WON">
              ASCII-compatibility was the killer feature. Existing tools (file systems, network protocols, text editors, programming languages) that handled ASCII bytes mostly just kept working with UTF-8. UTF-16 required rewriting everything. UTF-8 let the world upgrade incrementally. By the time anyone could argue otherwise, the network effect was decisive.
            </Callout>
            <ComparisonTable data={COMPARISONS.encodings_table} />
            <div className="grid gap-2 my-3">
              <CheckItem id="own-ascii">ASCII is 7-bit, 128 chars, the foundation of all modern encodings</CheckItem>
              <CheckItem id="own-cp">The 8-bit code page era (Latin-1, Windows-1252, etc) caused incompatible file formats</CheckItem>
              <CheckItem id="own-unicode">Unicode is a character set (codepoints); UTF-8/16/32 are different encodings of it</CheckItem>
              <CheckItem id="own-utf8">UTF-8 won because it's variable-length AND ASCII-compatible</CheckItem>
            </div>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ BIT">A bit, a byte, the basics</H2>
            <P>
              A <Term>Bit</Term> is a binary digit (0 or 1). A <Term>Byte</Term> is 8 bits — the fundamental unit of memory and storage on virtually every modern system. Values 0-255 unsigned, -128 to 127 signed. One byte = one ASCII char = one UTF-8 code unit = two hex digits.
            </P>
            <ComparisonTable data={COMPARISONS.base_table} />
            <H2 num="◇ HEX">Hex — the human-readable byte</H2>
            <P>
              <Term>Hex</Term> is base 16. Digits 0-9 and A-F. Each hex digit represents exactly 4 bits (a <Term>Nibble</Term>); two hex digits represent one byte. Hex is the right size for human reading — decimal hides the bit pattern, binary is too verbose. Color codes (#FF0000), SHA hashes (64 hex chars), memory addresses (0x7FFE8C00) — anywhere byte patterns matter, hex is the notation.
            </P>
            <Code id="hex-conversions" lang="bash">{`# Decimal 65 -> hex
printf '%x\\n' 65
# Output: 41

# Hex 41 -> decimal
printf '%d\\n' 0x41
# Output: 65

# String 'hello' -> hex bytes
echo -n 'hello' | xxd
# Output: 00000000: 6865 6c6c 6f                             hello

# Hex bytes -> string (using xxd reverse)
echo '6865 6c6c 6f' | xxd -r -p
# Output: hello`}</Code>
            <H2 num="◇ ENDIAN">Endianness — byte order matters for multi-byte values</H2>
            <P>
              <Term>Endianness</Term> is the order of bytes within a multi-byte number. The 16-bit value 0x1234 stored as '12 34' is <Term name="Big-endian">big-endian</Term>; as '34 12' is <Term name="Little-endian">little-endian</Term>. x86/ARM are little-endian internally. Network protocols traditionally use big-endian. UTF-16 has both variants and uses a <Term>BOM</Term> to signal which.
            </P>
            <Callout kind="warn" title="UTF-8 HAS NO ENDIANNESS">
              UTF-8 is byte-by-byte — each byte is a unit, byte order doesn't apply. This is one of UTF-8's quiet advantages. UTF-16 and UTF-32 have to specify LE or BE; UTF-8 just IS bytes.
            </Callout>
            <H2 num="◇ SIGNED">Signed vs unsigned</H2>
            <P>
              An 8-bit byte holds 256 distinct values. Interpreted as <Term>Unsigned</Term>: 0 to 255. Interpreted as <Term>Signed</Term> (<Term>Two's complement</Term>): -128 to 127. The bit pattern is the same; only the interpretation differs. For byte-oriented work (encoding, hashing, protocols) you usually want unsigned.
            </P>
            {stackData?.bits && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.bits}</Callout>}
            {QUIZZES.bits.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ 128">128 codepoints, 7 bits</H2>
            <P>
              <Term>ASCII</Term> defines 128 characters total — codepoints 0 through 127. The encoding is trivial: each char fits in 7 bits (or 1 byte with the high bit clear). No multi-byte sequences, no decoding state. The simplicity is why ASCII has lasted 60+ years as the foundation everything else builds on.
            </P>
            <H2 num="◇ CTRL">Control characters (0-31)</H2>
            <P>
              The first 32 codepoints are non-printing control characters, holdovers from teletype days. Most are obsolete now, but a few are everywhere:
            </P>
            <Code id="ascii-control" lang="text">{`9   = 0x09 = \\t   = TAB
10  = 0x0A = \\n   = LF  (line feed, Unix line terminator)
13  = 0x0D = \\r   = CR  (carriage return, Mac classic line terminator)
27  = 0x1B = ESC  = Escape (used in ANSI escape sequences for terminal colors)
0   = 0x00 = \\0   = NUL (C string terminator)`}</Code>
            <Callout kind="warn" title="CRLF VS LF">
              Windows uses CRLF (0D 0A) as line terminator. Unix uses LF (0A) alone. Mac classic used CR (0D) alone. Cross-platform text files frequently have line-ending issues — git's autocrlf, editors with 'show whitespace', and binary file false positives all stem from this 1960s-era split.
            </Callout>
            <H2 num="◇ PRINT">Printable characters (32-126)</H2>
            <Code id="ascii-print" lang="text">{`32  = 0x20 = ' '   = space (first printable)
33-47           = punctuation (! " # $ % & ' ( ) * + , - . /)
48-57           = '0'-'9'  (digit char - '0' = digit value)
65-90           = 'A'-'Z'
97-122          = 'a'-'z'  ('a' = 'A' + 32 = 'A' | 0x20)
126 = 0x7E = ~  = last printable
127 = 0x7F = DEL (the odd one — between printable range and unused)`}</Code>
            <P>
              The 32-offset between uppercase and lowercase enables the classic toupper/tolower bit trick: <Kbd>c ^ 0x20</Kbd> flips case (for ASCII letters only). The digit-to-int conversion is similarly clean: <Kbd>c - '0'</Kbd>. These tricks work for ASCII but BREAK for Unicode — German ß doesn't uppercase via XOR, Turkish 'I' has special locale rules.
            </P>
            <H2 num="◇ MODERN">ASCII today: protocol headers, identifiers</H2>
            <P>
              In 2026, ASCII still dominates places where bytes are interpreted as protocol/structure rather than human text: HTTP headers, JSON keys, programming language identifiers, file names you control, command-line flags. The data layer can be Unicode; the structural layer is ASCII. Keep ASCII-only what you control; UTF-8 what users provide.
            </P>
            {stackData?.ascii && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.ascii}</Callout>}
            {QUIZZES.ascii.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ CP">Codepoints — the character's true identity</H2>
            <P>
              A <Term>Codepoint</Term> is the integer Unicode assigns to a character. Written U+xxxx (4-6 hex digits). 'A' = U+0041. '中' = U+4E2D. '🚀' = U+1F680. Codepoints range U+0000 to U+10FFFF (~1.1 million possible values; ~149,000 currently assigned to characters).
            </P>
            <P>
              Codepoints are abstract. They don't say how many bytes the character takes — that depends on the encoding. UTF-8 might encode one codepoint as 1, 2, 3, or 4 bytes. UTF-16 might use 2 or 4 bytes. UTF-32 always uses 4. The codepoint is the character's identity; the encoding is the byte representation.
            </P>
            <Code id="codepoints" lang="javascript">{`// In JavaScript:
'A'.codePointAt(0)     // 65 (U+0041)
'中'.codePointAt(0)    // 20013 (U+4E2D)
'🚀'.codePointAt(0)    // 128640 (U+1F680)

// NOT to be confused with charCodeAt(), which returns UTF-16 code units:
'🚀'.charCodeAt(0)     // 55357 (high surrogate D83D — only half!)
'🚀'.charCodeAt(1)     // 56960 (low surrogate DE80)

// To iterate codepoints (not code units):
for (const ch of '🚀café') { console.log(ch.codePointAt(0).toString(16)); }
// 1f680, 63, 61, 66, e9

// Length differs too:
'🚀'.length             // 2 (UTF-16 code units)
[...'🚀'].length        // 1 (codepoints)`}</Code>
            <H2 num="◇ BMP">The Basic Multilingual Plane (BMP)</H2>
            <P>
              <Term>BMP</Term> = codepoints U+0000 to U+FFFF. The most common 65,536 characters: Latin scripts, Greek, Cyrillic, Hebrew, Arabic, CJK basics, common symbols. Fits in 16 bits. UTF-16 was originally designed assuming the BMP was all of Unicode — when it became clear it wasn't, surrogate pairs were added as the extension mechanism.
            </P>
            <H2 num="◇ SUPP">Supplementary planes (U+10000 and above)</H2>
            <P>
              <Term>Supplementary planes</Term> contain emoji, rare CJK characters, historical scripts (cuneiform, hieroglyphs), mathematical alphanumerics, musical notation. Encoded in UTF-8 as 4-byte sequences, in UTF-16 via <Term name="Surrogate pair">surrogate pairs</Term>. This is where '🚀'.length === 2 comes from — JavaScript strings are UTF-16 code units, and emoji are surrogate pairs.
            </P>
            <H2 num="◇ NORM">Normalization — same character, different bytes</H2>
            <P>
              'café' can be encoded two ways: 'c' + 'a' + 'f' + 'é' (one composed codepoint U+00E9) — Normalization Form C (NFC) — or 'c' + 'a' + 'f' + 'e' + combining-acute (U+0065 + U+0301) — Normalization Form D (NFD). Visually identical. <strong>Different bytes.</strong> String equality fails. Always normalize before comparison if your inputs might have accented characters.
            </P>
            <Code id="normalization" lang="javascript">{`const composed = 'caf\\u00e9';        // NFC: c-a-f-é
const decomposed = 'cafe\\u0301';      // NFD: c-a-f-e-combining_acute

composed === decomposed                // false! (different bytes)
composed.length                        // 4
decomposed.length                      // 5

// Normalize before compare:
composed.normalize('NFC') === decomposed.normalize('NFC')  // true`}</Code>
            <Callout kind="tip" title="WHEN TO NORMALIZE">
              Normalize at write time (consistent stored form). For comparisons in user-facing search, normalize both sides. For security-critical equality (signatures, hashes): never normalize — exact byte match required.
            </Callout>
            {stackData?.unicode && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.unicode}</Callout>}
            {QUIZZES.unicode.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ PATTERN">The bit pattern that makes UTF-8 work</H2>
            <P>
              <Term>UTF-8</Term> encodes each codepoint as 1-4 bytes. The lead byte's high bits encode the sequence length:
            </P>
            <Code id="utf8-pattern" lang="text">{`Codepoint range    Bytes  Bit pattern
─────────────────────────────────────────────────────
U+0000  - U+007F    1      0xxxxxxx
U+0080  - U+07FF    2      110xxxxx  10xxxxxx
U+0800  - U+FFFF    3      1110xxxx  10xxxxxx  10xxxxxx
U+10000 - U+10FFFF  4      11110xxx  10xxxxxx  10xxxxxx  10xxxxxx

Continuation bytes ALWAYS start with bits '10'.
ASCII bytes (0-127) ALWAYS have the high bit clear.
No overlap. No ambiguity.`}</Code>
            <P>
              <Term>Self-synchronizing</Term>: a decoder reading from any byte can immediately tell if it's at the start of a sequence (lead byte) or mid-sequence (continuation byte). After corruption, the decoder can resync by skipping continuation bytes until it finds a lead byte.
            </P>
            <H2 num="◇ EXAMPLE">A worked example: 'é' = C3 A9</H2>
            <P>
              The character 'é' has codepoint U+00E9 (decimal 233). 233 in binary is 11101001 — 8 bits, won't fit in 1-byte ASCII. UTF-8 uses the 2-byte pattern:
            </P>
            <Code id="utf8-worked" lang="text">{`U+00E9 = 11101001 (8 bits)

2-byte template:  110xxxxx 10xxxxxx (11 data bits available)

Pad to 11 bits:   00011101001
Split into 5+6:   00011  101001
Insert into template:
                  110 00011  10 101001
                = 11000011  10101001
                = 0xC3      0xA9

So 'é' in UTF-8 is the byte sequence C3 A9.`}</Code>
            <P>
              The <strong>Hex inspector</strong> in the Sandbox shows this breakdown live — paste 'C3 A9' and see the bits, the lead-byte pattern, the codepoint reconstruction.
            </P>
            <H2 num="◇ BOM">The UTF-8 BOM (and why to avoid it)</H2>
            <P>
              The codepoint U+FEFF, written at file start, signals 'I am Unicode' and (for UTF-16) byte order. UTF-8 has no byte order ambiguity, so the <Term>BOM</Term> is optional — and often harmful. UTF-8 BOM is bytes <Kbd>EF BB BF</Kbd>. It breaks: JSON parsing (spec forbids BOM), shell scripts (BOM before #! breaks the shebang), older PHP, many command-line tools.
            </P>
            <Callout kind="dont" title="DON'T WRITE UTF-8 BOM">
              Unless a specific consumer requires it (notably: Excel reading CSV as UTF-8). Most tools that write BOM by default (older Notepad, some .NET configurations) should be reconfigured.
            </Callout>
            <H2 num="◇ ASCII">ASCII-compatibility — UTF-8's killer feature</H2>
            <P>
              Every ASCII byte (0x00-0x7F) is itself a valid 1-byte UTF-8 sequence. A pure ASCII file IS a valid UTF-8 file. Existing tools that handle ASCII bytes generally just work with UTF-8 — string indexing, substring searches, line splits on newlines, file I/O. The migration to Unicode could happen incrementally instead of all-at-once.
            </P>
            {stackData?.utf8 && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.utf8}</Callout>}
            {QUIZZES.utf8.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ UTF16">UTF-16 — when 16 bits seemed like enough</H2>
            <P>
              <Term>UTF-16</Term> uses 16-bit <Term name="Code unit">code units</Term>. BMP codepoints fit in 1 code unit (2 bytes). Supplementary plane codepoints (above U+FFFF) require a <Term>Surrogate pair</Term> — 2 code units (4 bytes). The pair format: a <Term>High surrogate</Term> (U+D800-U+DBFF) followed by a <Term>Low surrogate</Term> (U+DC00-U+DFFF). The surrogate ranges are reserved — they're never valid codepoints on their own.
            </P>
            <Code id="surrogate-pair" lang="text">{`'🚀' = codepoint U+1F680

UTF-16 surrogate pair calculation:
  cp - 0x10000        = 0x0F680
  high 10 bits        = 0x03D (binary 0000111101)
  low 10 bits         = 0x280 (binary 1010000000)
  high surrogate      = 0xD800 + 0x03D = 0xD83D
  low surrogate       = 0xDC00 + 0x280 = 0xDE80

UTF-16 result: D83D DE80 (2 code units, 4 bytes)

This is why '🚀'.length === 2 in JavaScript —
JS strings are sequences of UTF-16 code units.`}</Code>
            <H2 num="◇ ENDIAN">UTF-16 LE vs BE</H2>
            <P>
              Each 16-bit code unit has a byte order. <Kbd>UTF-16LE</Kbd> writes low-byte-first. <Kbd>UTF-16BE</Kbd> writes high-byte-first. The 'A' character (code unit 0x0041): <Kbd>41 00</Kbd> in LE, <Kbd>00 41</Kbd> in BE. The BOM at file start signals which: <Kbd>FF FE</Kbd> = LE, <Kbd>FE FF</Kbd> = BE. Without a BOM, 'UTF-16' alone is ambiguous.
            </P>
            <H2 num="◇ WHERE">Where UTF-16 still lives</H2>
            <div className="grid gap-2 my-3">
              <CheckItem id="own-js">JavaScript strings (UTF-16 code units internally — affects .length, .charCodeAt, .indexOf)</CheckItem>
              <CheckItem id="own-java">Java String, char (UTF-16 code units since Java 5; pre-5 char was UCS-2)</CheckItem>
              <CheckItem id="own-windows">Windows kernel APIs, NTFS filenames (UTF-16LE)</CheckItem>
              <CheckItem id="own-dotnet">.NET string, char (UTF-16)</CheckItem>
              <CheckItem id="own-icu">Some ICU APIs (though UTF-8 variants exist)</CheckItem>
            </div>
            <P>
              On the wire and on disk (where you control it), use UTF-8. Internally, you may be stuck with UTF-16 — handle the surrogate-pair complications carefully when iterating, slicing, or measuring length.
            </P>
            <H2 num="◇ UTF32">UTF-32 — simple but wasteful</H2>
            <P>
              <Term>UTF-32</Term> uses 4 bytes per codepoint. Always. No variable-length. Index n is character n. The simplicity is appealing for text-processing code that needs O(1) character access. But the space cost is enormous (4x UTF-8 for ASCII text), so it almost never appears on disk or wire. A few text-processing libraries use it internally.
            </P>
            <Callout kind="info" title="ENDIANNESS APPLIES HERE TOO">
              UTF-32 has UTF-32LE and UTF-32BE variants. BOM is 4 bytes: <Kbd>FF FE 00 00</Kbd> (LE) or <Kbd>00 00 FE FF</Kbd> (BE).
            </Callout>
            {stackData?.utf16 && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.utf16}</Callout>}
            {QUIZZES.utf16.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ WHY">Why Base64 exists</H2>
            <P>
              Base64 solves a specific problem: <strong>arbitrary bytes in text-only channels</strong>. Email (MIME bodies), URLs (data parameters), JSON (no native binary), HTTP headers, certificate files, JWT tokens — all are text channels that need to carry binary occasionally. <Term>Base64</Term> maps every 3 input bytes (24 bits) to 4 output characters (24 bits, since each base64 char uses 6 bits) from a safe alphabet.
            </P>
            <H2 num="◇ ALPHABET">The 64-character alphabet</H2>
            <Code id="base64-alphabet" lang="text">{`Index   Char    Index   Char    Index   Char    Index   Char
0       A       16      Q       32      g       48      w
1       B       17      R       33      h       49      x
2       C       18      S       34      i       50      y
...     ...     ...     ...     ...     ...     ...     ...
25      Z       41      p       57      5       62      +
26      a       42      q       58      6       63      /
...

URL-safe variant: + becomes -,  / becomes _,  padding = often omitted.`}</Code>
            <H2 num="◇ PAD">Padding rules</H2>
            <P>
              Base64 emits 4 chars per 3 input bytes. If input length % 3 != 0, padding fills out the final group:
            </P>
            <Code id="base64-padding" lang="text">{`Input length % 3   Padding   Example
─────────────────────────────────────────────
0                  none      'abc'  -> 'YWJj'
1                  '=='      'a'    -> 'YQ=='
2                  '='       'ab'   -> 'YWI='`}</Code>
            <P>
              Padding makes the output length always a multiple of 4, simplifying parsing. URL-safe base64 often drops padding (recoverable from length). When implementing: emit padding; tolerate missing padding on read.
            </P>
            <H2 num="◇ URLSAFE">URL-safe base64</H2>
            <P>
              Standard base64 includes <Kbd>+</Kbd> and <Kbd>/</Kbd>, both reserved in URLs. <Term name="Base64 URL-safe">URL-safe base64</Term> (RFC 4648 §5) replaces them with <Kbd>-</Kbd> and <Kbd>_</Kbd> — characters that don't need URL-escaping. Padding <Kbd>=</Kbd> is also often dropped. Used in JWT tokens, OAuth flows, anywhere base64 appears in URL parameters or path segments.
            </P>
            <Code id="base64-jwt" lang="text">{`A JWT looks like:
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.K8mlZF2NfQQAd7q5dGc-yGRpwY9HXgvDgQI3kc...

Three URL-safe-base64 segments separated by dots:
  1. Header  -> {"alg":"HS256"}
  2. Payload -> {"sub":"123"}
  3. Signature -> (raw signature bytes)`}</Code>
            <Callout kind="dont" title="BASE64 IS NOT ENCRYPTION">
              Anyone can decode base64. The JWT signature makes the token tamper-evident; the base64 doesn't 'hide' anything. If you find yourself base64-ing passwords or secrets to 'protect' them, you've achieved nothing. Use real cryptography for confidentiality.
            </Callout>
            <P>
              The <strong>Multi-converter</strong> in the Sandbox shows base64 (both variants) for any input. Try setting source to 'base64' and pasting a JWT segment — see what's inside.
            </P>
            {stackData?.base64 && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.base64}</Callout>}
            {QUIZZES.base64.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ NIBBLE">Each hex digit = 4 bits = one nibble</H2>
            <P>
              <Term>Hex</Term> represents binary data in a human-readable form. Each hex digit (0-9, A-F) represents exactly 4 bits — one <Term>Nibble</Term>. Two hex digits = one byte. The alphabet is small enough to read fluently, large enough to compactify binary (~half the chars of decimal for big numbers).
            </P>
            <Code id="hex-mapping" lang="text">{`Hex   Binary    Decimal
0     0000      0
1     0001      1
2     0010      2
3     0011      3
4     0100      4
5     0101      5
6     0110      6
7     0111      7
8     1000      8
9     1001      9
A     1010      10
B     1011      11
C     1100      12
D     1101      13
E     1110      14
F     1111      15

So 0xFF = 1111 1111 = 255 = all bits set in a byte
   0x80 = 1000 0000 = 128 = high bit only
   0x0F = 0000 1111 = 15  = low nibble only`}</Code>
            <H2 num="◇ WHERE">Where hex shows up</H2>
            <div className="grid gap-2 my-3">
              <CheckItem id="own-color">Color codes: #FF0000 (red), #00FF00 (green), #0000FF (blue) — 3 bytes RGB</CheckItem>
              <CheckItem id="own-hash">Cryptographic hashes: SHA-256 outputs 32 bytes = 64 hex chars</CheckItem>
              <CheckItem id="own-uuid">UUIDs: 16 bytes formatted as 8-4-4-4-12 hex chars</CheckItem>
              <CheckItem id="own-addr">Memory addresses: 0x7FFE8C00 (32-bit), 0x00007FF8E5A3B240 (64-bit)</CheckItem>
              <CheckItem id="own-mac">MAC addresses: 6 bytes formatted with colons (AA:BB:CC:DD:EE:FF)</CheckItem>
              <CheckItem id="own-dump">Hex dumps: xxd, hexdump -C output — bytes formatted in columns with ASCII preview</CheckItem>
              <CheckItem id="own-esc">Character escapes: \xC3 (C/Python), %C3 (URL), &amp;#xE9; (HTML)</CheckItem>
            </div>
            <H2 num="◇ READ">Reading a hex dump</H2>
            <Code id="hex-dump" lang="text">{`$ echo -n 'café 🚀' | hexdump -C
00000000  63 61 66 c3 a9 20 f0 9f  9a 80                    |caf.. ....|
└offset─┘ └────── bytes ──────────┘ └── ASCII preview ──┘

c-a-f      = 3 ASCII bytes
c3 a9      = 2-byte UTF-8 for é
20         = ASCII space
f0 9f 9a 80 = 4-byte UTF-8 for 🚀

Total: 10 bytes for 6 visible characters.
The ASCII preview shows '.' for non-printable bytes.`}</Code>
            {stackData?.hex && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.hex}</Callout>}
            {QUIZZES.hex.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ PERCENT">Percent encoding — the URL's escape hatch</H2>
            <P>
              URLs are ASCII-only by spec. Characters that have special meaning (<Term>Reserved characters</Term>: <Kbd>: / ? # [ ] @ ! $ &amp; ' ( ) * + , ; =</Kbd>) and characters outside ASCII must be encoded. The format: <Kbd>%XX</Kbd> where XX is the byte value in hex. Non-ASCII characters are UTF-8 encoded first, then each byte becomes <Kbd>%XX</Kbd>.
            </P>
            <Code id="url-encoding" lang="text">{`Character    UTF-8 bytes    URL-encoded
space        20             %20
&            26             %26
=            3D             %3D
é            C3 A9          %C3%A9
中           E4 B8 AD       %E4%B8%AD
🚀           F0 9F 9A 80    %F0%9F%9A%80

'hello world & café' becomes 'hello%20world%20%26%20caf%C3%A9'`}</Code>
            <H2 num="◇ RESERVED">Reserved vs unreserved</H2>
            <P>
              <Term>Unreserved characters</Term> NEVER need encoding: <Kbd>A-Z a-z 0-9 - . _ ~</Kbd>. Reserved characters MUST be encoded when used as data (not as syntax). The exact rules vary by URL component (path vs query vs fragment) — RFC 3986 has the full spec.
            </P>
            <H2 num="◇ JS">encodeURIComponent vs encodeURI — pick the right one</H2>
            <Code id="js-encoding" lang="javascript">{`// encodeURIComponent: encodes ALMOST EVERYTHING except unreserved chars
// Use for: query parameter VALUES, path SEGMENTS, anywhere you're inserting
//   user data into a URL.
encodeURIComponent('hello & world')
// 'hello%20%26%20world'  -- the & is encoded

// encodeURI: encodes only chars that can't appear in URLs at all,
//   LEAVES URL SYNTAX CHARS (? & = / etc) unencoded.
// Use for: a whole URL you're constructing. RARE — usually you have
//   the URL syntax already and just need to encode pieces.
encodeURI('https://x.com/path?q=hello world')
// 'https://x.com/path?q=hello%20world'  -- everything else preserved`}</Code>
            <Callout kind="dont" title="WRONG TOOL = BROKEN URLS">
              Using <Kbd>encodeURI</Kbd> on a value that contains <Kbd>&amp;</Kbd> = the <Kbd>&amp;</Kbd> is left alone = it becomes a parameter separator in the resulting URL. Classic bug pattern. Use <Kbd>encodeURIComponent</Kbd> for values. Always.
            </Callout>
            <H2 num="◇ DOUBLE">The double-encoding trap</H2>
            <P>
              encodeURIComponent applied twice produces broken values. <Kbd>'hello world'</Kbd> → <Kbd>'hello%20world'</Kbd> → <Kbd>'hello%2520world'</Kbd> (the <Kbd>%</Kbd> got encoded as <Kbd>%25</Kbd>). Symptoms: literal <Kbd>%</Kbd> in your decoded query parameters. Trace where the value enters your code; encode exactly once.
            </P>
            <H2 num="◇ FORMS">application/x-www-form-urlencoded</H2>
            <P>
              HTML form submissions and POST bodies with this content-type use the same percent-encoding, with one wrinkle: spaces become <Kbd>+</Kbd> instead of <Kbd>%20</Kbd>. Most parsers handle both. <Kbd>URLSearchParams</Kbd> (JS) emits <Kbd>+</Kbd>; <Kbd>encodeURIComponent</Kbd> emits <Kbd>%20</Kbd>. Either is valid.
            </P>
            <ComparisonTable data={COMPARISONS.escape_table} />
            {stackData?.url && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.url}</Callout>}
            {QUIZZES.url.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ THREE">Three live tools</H2>
            <P>
              Pure JS — no parser, no interpreter, just direct conversions using TextEncoder/TextDecoder, btoa/atob, encodeURIComponent. NASA-light bounds: max 5,000 input chars, 20,000 bytes output, 40,000 hex chars. All inputs validated.
            </P>
            <Sandbox />
            <Callout kind="tip" title="THE SANDBOX IS THE LESSON">
              Type 'café 🚀' into the multi-converter. Watch <Kbd>.length</Kbd> show 6 (UTF-16 code units, counts emoji as 2), codepoints show 6 (real Unicode chars), UTF-8 bytes show 11 (including 4 for 🚀, 2 for é), UTF-16 bytes show 12. Five different ways to count one string. ALL OF THEM ARE CORRECT FOR DIFFERENT QUESTIONS. The encoding bug almost always lives in asking the wrong 'how many'.
            </Callout>
            <Callout kind="info" title="THE HEX INSPECTOR IS HOW YOU DEBUG">
              When something looks wrong, you don't look at displayed characters — you look at bytes. Paste a suspect string's hex (or any hex bytes) into the inspector. The bit-pattern breakdown shows the lead bytes, continuation bytes, codepoint reconstruction. Malformed UTF-8 (orphan continuation, invalid lead, surrogates-as-UTF-8) all light up red.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">Eight pathologies</H2>
            <P>
              Most encoding bugs fit one of eight patterns. Pick the symptom; follow the diagnostic steps.
            </P>
            <Troubleshooter />
            <H2 num="◇ MOJIBAKE">The mojibake fingerprint catalog</H2>
            <ComparisonTable data={COMPARISONS.mojibake_table} />
            <H2 num="◇ DEBUG">The encoding debugging mindset</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: "Bytes are the truth", what: "Displayed characters, str.length, str.indexOf — all encoding-dependent interpretation. The bytes (hex dump, raw network bytes, file binary read) are the underlying reality. When something looks wrong, look at the bytes." },
                { name: "Encoding lives at every boundary", what: "File → reader → variable → DB connection → DB storage → query result → variable → response writer → response bytes → client reader → display. Each arrow is an encoding step. The bug is in one specific arrow." },
                { name: "Don't 'fix' the data", what: "If you see mojibake, the data is almost always intact at some layer — it's the reading layer that's broken. Re-encoding the mojibake just adds another layer of corruption. Find which arrow lost the encoding info, fix THAT." },
                { name: "Configure explicitly, never default", what: "open(file) uses platform default. open(file, encoding='utf-8') is portable. -Dfile.encoding=UTF-8 for Java. SET NAMES utf8mb4 for MySQL. Explicit configuration eliminates ambiguity bugs." },
                { name: "UTF-8 everywhere is the goal", what: "Every layer: files, DB, HTTP, HTML meta, source code, command-line. The 'UTF-8 everywhere' rule eliminates entire bug classes. Convert at boundaries with non-UTF-8 systems if you must; never internally." },
                { name: "Test with emoji", what: "🚀 is a quick sanity check. Requires 4-byte UTF-8 (UTF-8 'utf8' broken in MySQL), surrogate pair in UTF-16 (.length lies), supplementary plane (some Unicode-naive code chokes). If 🚀 round-trips your stack cleanly, most other UTF-8 will too." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-amber-200 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-amber-200 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-sky-400 text-sky-400 px-4 py-2 text-[13px] hover:bg-sky-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
              {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
            </button>
            <H2 num="◇ DONT">Anti-patterns to recognize</H2>
            <div className="grid gap-2 my-3">
              {ANTIPATTERNS.map(a => (
                <Callout key={a.name} kind="dont" title={a.name}>{a.reason}</Callout>
              ))}
            </div>
            {stackData && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            {QUIZZES.triage.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 11:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-amber-200 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
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
                      <div className="text-amber-200 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ PATH">A pragmatic learning path</H2>
            <P>For your context (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}</P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Now', plan: "Audit one place where you have an encoding bug or near-miss. Trace the data flow byte-by-byte. Identify the layer that disagrees. Fix it. The exercise teaches more than reading." },
                { wk: 'This week', plan: "Verify your stack is UTF-8 end-to-end. HTTP Content-Type with charset=utf-8. HTML meta charset='utf-8' as first thing in head. DB connection charset=utf8mb4 (MySQL). File reads with encoding='utf-8' explicit. If anything is implicit/default, make it explicit." },
                { wk: 'This week', plan: "Read 'UTF-8 Everywhere' (utf8everywhere.org). 30 minutes. The argument lands once you've seen real encoding pain — and prevents future pain." },
                { wk: 'Next week', plan: "Test your stack with emoji (🚀). If it doesn't round-trip cleanly, find which layer rejects it (often MySQL 'utf8' instead of 'utf8mb4', or a column type that's not NVARCHAR/equivalent)." },
                { wk: 'This month', plan: "Set up linter rules / pre-commit hooks: forbid platform-default file open, require explicit charset in HTTP responses, flag concatenated SQL. The bugs prevention pays back more than the bugs that don't happen." },
                { wk: 'Whenever you encounter mojibake', plan: "Look at bytes, not characters. The Sandbox 'Hex inspector' is the right tool. Identify the encoding mismatch, fix the LAYER (not the data). Bookmark the mojibake table." },
                { wk: 'Always', plan: "encodeURIComponent for URL values. utf8mb4 not utf8 in MySQL. Don't write UTF-8 BOM. Bytes are the truth. UTF-8 everywhere." },
              ].map((w, i) => (
                <div key={i} className="border-l-2 border-amber-200 pl-3 py-1">
                  <div className="text-amber-200 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-amber-200 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-sky-400 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-amber-200 text-amber-200 px-4 py-2 text-[13px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={copyAllCommands} className="flex items-center gap-2 border border-sky-400 text-sky-400 px-4 py-2 text-[13px] hover:bg-sky-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {copied === 'allcmds' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'allcmds' ? 'copied!' : 'Copy all commands'}
              </button>
              <button onClick={() => { if (confirm('Reset all progress?')) { setCompleted(new Set()); setChecklist({}); setQuizState({}); setStack(null); setActiveSection(0); setShowOnboarding(true); } }} className="flex items-center gap-2 border border-zinc-700 text-zinc-400 px-4 py-2 text-[13px] hover:border-rose-400 hover:text-rose-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={14} /> Reset progress
              </button>
            </div>
            {QUIZZES.atlas.map(q => <Quiz key={q.qid} quiz={q} />)}
            <Callout kind="info" title="UTF-8 EVERYWHERE">
              The single highest-leverage rule. Files, databases, HTTP, HTML, source code, command-line — all UTF-8. Don't mix encodings inside your domain. Convert at the boundary if you absolutely must talk to a non-UTF-8 system. Inside your code: bytes are UTF-8 unless explicitly stated otherwise. This eliminates entire categories of encoding bugs.

              The fundamentals arc closes here: bits → bytes → characters → encodings → wire formats. From a single bit to a JSON payload crossing the network. Every encoding bug you'll ever hit lives somewhere on this map. Now you know the territory.
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
            <div className="text-amber-200 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>◰</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>ENCODING / BYTES / WIRE FORMATS</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-sky-400/40 text-sky-400 px-2 py-1 text-[11px] hover:bg-sky-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-amber-200 hover:text-amber-200" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-amber-200 bg-amber-200/10 text-amber-200' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-amber-200" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-amber-200 text-amber-200 bg-amber-200/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-amber-200 hover:text-amber-200'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ◰ · encoding atlas · bytes are the truth · UTF-8 everywhere
          </div>
        </div>
      </main>
    </div>
  );
}
