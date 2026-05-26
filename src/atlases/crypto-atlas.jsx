import { useState, useEffect, useRef } from 'react';
import {
  Compass, Lock, Hash, Key, Shuffle, FileSignature, ShieldCheck, Cookie,
  Terminal, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, RotateCcw, Play, ArrowLeft, Quote, MousePointerClick,
  Loader2, Library, AlertTriangle, Zap, KeyRound,
  XCircle, Atom
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   CRYPTO ATLAS · DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Diffie-Hellman '76, RSA, AES, ECC, and the post-quantum reckoning." },
  { id: 'hash', label: 'Hashing', icon: Hash, num: '02', sub: "SHA-256, SHA-3, BLAKE3. Fingerprints, integrity, the avalanche effect." },
  { id: 'pw', label: 'Passwords', icon: KeyRound, num: '03', sub: "Argon2id (OWASP 2026), bcrypt, scrypt, salting. NEVER use SHA-256 here." },
  { id: 'sym', label: 'Symmetric', icon: Lock, num: '04', sub: "AES-GCM, ChaCha20-Poly1305. AEAD, IV / nonce discipline." },
  { id: 'asym', label: 'Asymmetric', icon: Key, num: '05', sub: "RSA, Ed25519, X25519. Signatures vs key exchange vs encryption." },
  { id: 'pqc', label: 'Post-quantum', icon: Atom, num: '06', sub: "ML-KEM, ML-DSA, SLH-DSA. NIST finalized 2024; CNSA 2.0 deadline 2027." },
  { id: 'tls', label: 'TLS & PKI', icon: ShieldCheck, num: '07', sub: "Certs, ACME, mTLS, cert pinning. The crypto-shaped parts of the web." },
  { id: 'jwt', label: 'JWT & Auth', icon: Cookie, num: '08', sub: "Anatomy, the alg=none bug, PASETO. Sessions vs tokens." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Curated recipes — passwords, encryption, signing, JWTs, KMS, TLS, randomness, PQC." },
  { id: 'sandbox', label: 'Sandbox', icon: Terminal, num: '10', sub: "Real crypto in your browser. SubtleCrypto API. 8 challenges." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Auditing for vulns. Common bugs and how to detect them." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "RFCs, NIST docs, books, and the cryptography reading roadmap." },
];

const STACKS = [
  { id: 'backend', label: 'Backend / API auth', desc: 'JWT, sessions, password hashing, secrets management', icon: '◉' },
  { id: 'mobile', label: 'Mobile / native', desc: 'Keychain, encryption at rest, certificate pinning', icon: '⌬' },
  { id: 'frontend', label: 'Web / frontend', desc: 'TLS, CSP, secure cookies, client-side crypto care', icon: '◐' },
  { id: 'devops', label: 'DevOps / infra', desc: 'TLS automation, KMS, Vault, PKI, secrets rotation', icon: '⚙' },
  { id: 'fundamentals', label: 'Just the math', desc: 'Number theory, lattices, hash functions — theory first', icon: '⊕' },
];

const GLOSSARY = {
  Plaintext: "The unencrypted message. What you start with before encryption. What you end with after decryption.",
  Ciphertext: "The encrypted message. Looks like random bytes if the algorithm is any good. Indistinguishable from random to anyone without the key.",
  Key: "The secret that enables encryption + decryption. Whoever holds the key can read the message. Most crypto failures are key-management failures, not algorithm failures.",
  Symmetric: "Same key for encryption and decryption. Fast, used for actual bulk data encryption (TLS payload, disk encryption). AES, ChaCha20.",
  Asymmetric: "Public/private keypair. Public can verify or encrypt; private can sign or decrypt. Slow; used for key exchange and signatures, not bulk data. RSA, ECC.",
  Hash: "One-way function: input → fixed-size fingerprint. Same input always gives same output. Tiny input change = wildly different output (avalanche). NOT reversible.",
  HMAC: "Hash-based Message Authentication Code. Proves a message came from someone who knows a shared secret. HMAC(key, msg) ≠ hash(key || msg) — the construction matters.",
  AEAD: "Authenticated Encryption with Associated Data. Combines confidentiality + integrity in one primitive. AES-GCM and ChaCha20-Poly1305 are AEADs. Use AEADs.",
  Nonce: "Number used Once. Random or counter value to make identical plaintexts produce different ciphertexts. NEVER reuse a nonce with the same key.",
  IV: "Initialization Vector. Basically a nonce, traditional name. Same rules: unique per encryption with same key.",
  Salt: "Random data added to a password before hashing. Different per user. Prevents rainbow-table attacks. Stored alongside the hash (not secret).",
  Pepper: "Like salt but secret + global. Stored separately from the database (env var, HSM). Defense if the DB is dumped but the app secret isn't.",
  AES: "Advanced Encryption Standard. Symmetric block cipher. 128, 192, or 256-bit keys. AES-256-GCM is the standard for new code.",
  GCM: "Galois/Counter Mode. AES mode of operation providing AEAD. Standard pairing: AES-256-GCM. Has a critical nonce-reuse vulnerability — never reuse a nonce/key pair.",
  ChaCha20: "Stream cipher by Daniel J. Bernstein. Paired with Poly1305 MAC = ChaCha20-Poly1305 AEAD. Used in TLS 1.3, WireGuard. Faster than AES on hardware without AES-NI.",
  RSA: "Rivest-Shamir-Adleman (1977). Asymmetric algorithm based on integer factorization. RSA-2048 minimum; RSA-4096 prudent. Vulnerable to quantum (Shor's algorithm).",
  ECC: "Elliptic Curve Cryptography. Asymmetric crypto using point operations on elliptic curves. Much smaller keys than RSA for equivalent security. P-256, P-384, Curve25519.",
  Ed25519: "EdDSA signature scheme on Curve25519. Fast, secure, no parameters to misconfigure. Default choice for new signature use cases.",
  X25519: "Diffie-Hellman key exchange on Curve25519. Used in TLS 1.3 and WireGuard. The asymmetric handshake of the modern web.",
  ECDSA: "Elliptic Curve Digital Signature Algorithm. NIST-standardized signature scheme. P-256 is common. Vulnerable to nonce-reuse (PlayStation 3 hack).",
  ECDH: "Elliptic Curve Diffie-Hellman. Key exchange on an elliptic curve. Lets two parties derive a shared secret over an insecure channel.",
  PBKDF2: "Password-Based Key Derivation Function 2. Iterates HMAC many times to derive a key from a password. FIPS-approved. 600,000+ SHA-256 iterations (OWASP 2026).",
  bcrypt: "Adaptive password hash, 1999. Cost factor controls work. Still safe at cost 12+. 72-byte input limit. No memory hardness — modern GPUs are 5000x faster than CPUs.",
  scrypt: "Memory-hard password hash, 2009. Forces attackers to use RAM, reducing GPU advantage. Tuning parameters complex; less framework support than Argon2id.",
  Argon2: "Password Hashing Competition winner (2015). Three variants: Argon2d (GPU-resistant), Argon2i (side-channel resistant), Argon2id (combines both). RFC 9106.",
  Argon2id: "Recommended Argon2 variant. OWASP 2026 default: m=65536 (64 MiB), t=3, p=1. The right choice for new password storage.",
  SHA256: "Secure Hash Algorithm, 256-bit output. SHA-2 family. ~1 billion hashes/sec on a GPU. Use for integrity (file fingerprints, HMAC). NEVER use for passwords.",
  SHA3: "Keccak-based hash, 2015 NIST standard. Different design from SHA-2 (sponge construction). Not faster, just structurally different. Use SHA-256 unless you have a specific reason.",
  BLAKE3: "Modern hash, 2020. Significantly faster than SHA-256 with parallelism + tree hashing. Excellent for file integrity, not standardized for crypto protocols.",
  CSPRNG: "Cryptographically Secure Pseudorandom Number Generator. Required for keys, nonces, IVs, salts, tokens. crypto.getRandomValues() in browsers, os.urandom() in Python.",
  TLS: "Transport Layer Security. The S in HTTPS. TLS 1.3 is current — 1-RTT handshake, TLS 1.2 deprecated for new deployments. See the Net Atlas for protocol details.",
  Certificate: "X.509 document binding a domain name to a public key. Signed by a CA the client trusts. ~150 root CAs ship in browsers.",
  CA: "Certificate Authority. Issues certs after validating you control a domain. Let's Encrypt (free, automated), DigiCert. Anyone can be a CA technically; few are trusted.",
  ACME: "Automated Certificate Management Environment (RFC 8555). Let's Encrypt's protocol. Clients (certbot, Caddy auto-https) request + renew certs automatically.",
  mTLS: "Mutual TLS. Both client and server present certificates. Service-to-service auth without shared secrets. Foundation of service meshes (Istio, Linkerd).",
  JWT: "JSON Web Token. Compact, signed (and optionally encrypted) JSON. Three base64 parts separated by dots: header.payload.signature. Useful + footgun-prone.",
  PASETO: "Platform-Agnostic Security Tokens. JWT-like but with sane defaults. No alg-confusion attacks. Local (symmetric) or public (asymmetric) modes. Recommended over JWT for new designs.",
  HSM: "Hardware Security Module. Tamper-resistant hardware that holds keys + performs crypto. AWS CloudHSM, YubiKey, TPMs. Keys never leave the device.",
  KMS: "Key Management Service. Cloud-managed key storage + crypto ops. AWS KMS, GCP KMS, Azure Key Vault. Envelope encryption: KMS encrypts your data encryption keys.",
  Vault: "HashiCorp Vault. Self-hosted secrets + crypto-as-a-service. Stores secrets, generates dynamic credentials, manages PKI, does encryption as a service.",
  Envelope: "Envelope encryption: encrypt data with a Data Encryption Key (DEK), encrypt the DEK with a Key Encryption Key (KEK from KMS). DEK stored with data; KEK never leaves KMS.",
  ECH: "Encrypted Client Hello. TLS extension that encrypts the SNI hostname during TLS handshake, hiding which site you connected to from network observers.",
  HSTS: "HTTP Strict Transport Security. Browser flag forcing HTTPS for a domain. Preload list bakes it into Chrome/Firefox/Safari.",
  CSP: "Content Security Policy. HTTP header restricting what scripts/styles/etc. a page may load. Defense in depth against XSS.",
  SOP: "Same-Origin Policy. Browser security model isolating origins (scheme + host + port). CORS controls how to relax it deliberately.",
  PQC: "Post-Quantum Cryptography. Algorithms believed secure against future quantum computers. NIST standards finalized August 2024: FIPS 203 / 204 / 205.",
  "ML-KEM": "Module-Lattice Key Encapsulation Mechanism. FIPS 203. Lattice-based. Replaces RSA + ECDH for key exchange in the post-quantum era. ML-KEM-768 = NIST Level 3.",
  "ML-DSA": "Module-Lattice Digital Signature Algorithm. FIPS 204. Lattice-based. Replaces RSA + ECDSA + Ed25519 for signatures.",
  "SLH-DSA": "Stateless Hash-Based Digital Signature Algorithm. FIPS 205. Based only on hash functions — conservative security assumption. Larger signatures than ML-DSA.",
  "FN-DSA": "Falcon-based Digital Signature Algorithm. FIPS 206 (publication expected 2026). Smaller signatures than ML-DSA, complex implementation.",
  Hybrid: "Combining classical + post-quantum algorithms in one protocol. Defense: if either is broken, the other still secures the session. AWS deploys hybrid TLS already.",
  "Harvest now, decrypt later": "Attack model: adversaries record encrypted traffic today, decrypt it in 10 years with a quantum computer. The reason PQC migration is urgent NOW.",
  Shor: "Shor's algorithm (1994). Polynomial-time quantum algorithm that breaks RSA and ECC. Requires a fault-tolerant quantum computer of sufficient scale. None exists yet.",
  Grover: "Grover's algorithm. Quantum algorithm giving quadratic speedup on brute-force search. Effectively halves the key length of symmetric ciphers. AES-256 becomes ~128-bit secure.",
  Side: "Side-channel attack. Extracts secrets from physical leakage — timing, power consumption, electromagnetic emissions. Constant-time code is the main defense.",
  "Timing attack": "Side-channel exploiting that operations take different amounts of time depending on secret data. Defense: constant-time comparison (e.g., crypto.timingSafeEqual).",
  "Padding oracle": "Vulnerability where a server reveals (via error codes or timing) whether padding was valid. Lets attackers decrypt ciphertext byte-by-byte. AEAD eliminates this class.",
  Replay: "Attack where a captured valid request is resent later. Defenses: nonces, timestamps, idempotency keys, channel binding.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "Who first published a method for two people to agree on a shared secret over a public channel?",
      opts: ["Rivest, Shamir, Adleman (RSA) — 1977", "Diffie and Hellman — 1976", "Whitfield Diffie alone — 1980"],
      a: 1,
      x: "Whitfield Diffie + Martin Hellman published 'New Directions in Cryptography' in 1976 — the first public description of public-key cryptography + the Diffie-Hellman key exchange. RSA followed in 1977, providing the first practical public-key signature + encryption. James Ellis at GCHQ had invented similar ideas earlier (1969-1973) but the work was classified. The 1976 paper is the public birth of asymmetric crypto."
    },
    {
      qid: 'o2',
      q: "What's the major cryptographic event of August 2024?",
      opts: [
        "Nothing notable",
        "NIST finalized three post-quantum cryptography standards: FIPS 203 (ML-KEM), FIPS 204 (ML-DSA), FIPS 205 (SLH-DSA). The PQC era officially began.",
        "RSA was broken"
      ],
      a: 1,
      x: "After an 8-year evaluation process, NIST published the first finalized post-quantum standards on August 13, 2024. ML-KEM replaces RSA/ECDH for key exchange. ML-DSA + SLH-DSA replace RSA/ECDSA for signatures. CNSA 2.0 deadline: January 2027 for US National Security Systems. AWS, Microsoft, Google have all rolled out PQC migration paths in 2025-2026."
    },
    {
      qid: 'o3',
      q: "Why does 'harvest now, decrypt later' make PQC migration urgent in 2026, even though quantum computers don't exist yet?",
      opts: [
        "It's not actually urgent",
        "Adversaries are recording encrypted traffic today, planning to decrypt it once large-scale quantum computers exist. Data sensitive for 10+ years (medical records, classified docs, trade secrets) is at risk NOW.",
        "Quantum computers already exist"
      ],
      a: 1,
      x: "Intelligence agencies have publicly warned: nation-state actors are bulk-collecting encrypted traffic now, betting on Shor's algorithm becoming practical in the 2030s. Data encrypted with RSA-2048 today, recorded today, becomes plaintext later. PQC migration isn't about today's threats — it's about your data's confidentiality five to twenty years from now. That's why January 2027 is the CNSA 2.0 deadline."
    },
  ],
  hash: [
    {
      qid: 'h1',
      q: "What's the avalanche effect?",
      opts: [
        "When your data is too big",
        "A property of good hash functions: changing a single bit of input produces ~50% different bits in the output. Inputs that look almost identical produce wildly different hashes.",
        "When the hash function is broken"
      ],
      a: 1,
      x: "Try it: SHA-256 of 'hello' vs 'Hello'. The hashes look completely unrelated — no shared prefix, no pattern. This is essential because hashes are used for integrity: tampering with one bit must result in obviously different output. SHA-256, SHA-3, BLAKE3 all have strong avalanche properties. MD5 and SHA-1 have weak avalanche (and many other problems) — don't use them."
    },
    {
      qid: 'h2',
      q: "What does it mean for a hash function to be 'collision resistant'?",
      opts: [
        "It doesn't crash",
        "It's computationally infeasible to find TWO DIFFERENT inputs that produce the same hash output. Critical for digital signatures + certificate validation.",
        "It runs fast"
      ],
      a: 1,
      x: "Three properties of a cryptographic hash: (1) preimage resistance — given hash H, can't find input X such that hash(X) = H; (2) second-preimage resistance — given X1, can't find X2 ≠ X1 with hash(X1) = hash(X2); (3) collision resistance — can't find ANY X1 ≠ X2 with hash(X1) = hash(X2). SHA-1 was broken on (3) in 2017 (SHAttered attack). MD5 was broken on (3) in 2004."
    },
    {
      qid: 'h3',
      q: "Why is HMAC(key, msg) different from hash(key || msg)?",
      opts: [
        "They're the same",
        "Naive hash(key || msg) is vulnerable to length-extension attacks on Merkle-Damgård hashes (SHA-256). HMAC uses a specific construction (inner + outer hash with derived keys) that's provably secure.",
        "HMAC is just faster"
      ],
      a: 1,
      x: "SHA-256's internal state IS the output. Knowing hash(key || msg), an attacker can compute hash(key || msg || extension) WITHOUT knowing the key — they continue from the published state. HMAC defeats this with two hashing rounds and key derivation. SHA-3 doesn't have length-extension (sponge construction), but HMAC is still the standard. Always use HMAC, never roll your own MAC."
    },
  ],
  pw: [
    {
      qid: 'p1',
      q: "Why is SHA-256 catastrophically wrong for password hashing?",
      opts: [
        "It's fine",
        "SHA-256 is designed to be FAST — billions of hashes per second on a GPU. A weak password gets cracked in seconds. Password hashes need to be SLOW (Argon2id, bcrypt) to make brute force impractical.",
        "It produces hashes that are too short"
      ],
      a: 1,
      x: "Speed comparison on a modern GPU: SHA-256 ~10 billion hashes/sec. bcrypt cost 12 ~ 20 hashes/sec. Argon2id with OWASP defaults ~ 1 hash/sec. That's a 10-billion-fold security difference. Slow + memory-hard is the whole point. The attacker has your password database; the only thing standing between them and your users' passwords is how slowly they can iterate through guesses."
    },
    {
      qid: 'p2',
      q: "OWASP's 2026 recommendation for password hashing is…",
      opts: [
        "MD5",
        "Argon2id with m=65536 (64 MiB memory), t=3 (iterations), p=1 (parallelism). bcrypt with cost 12+ is acceptable for legacy/memory-constrained.",
        "SHA-256 with a salt"
      ],
      a: 1,
      x: "Argon2id is the winner of the 2015 Password Hashing Competition. Memory-hard (forces attackers to use RAM, reducing GPU advantage from 5000x to ~3x). RFC 9106 (2021). OWASP's 2026 defaults: 64 MiB memory, 3 iterations, 1 parallelism. bcrypt remains acceptable when Argon2id isn't available — modern infrastructure should pick Argon2id."
    },
    {
      qid: 'p3',
      q: "What's the difference between salt and pepper?",
      opts: [
        "Just naming",
        "Salt: random, per-user, stored ALONGSIDE the hash (not secret). Pepper: secret, global, stored SEPARATELY (env var, HSM). Salt defeats rainbow tables; pepper defends against DB-only dumps.",
        "Salt is hashed; pepper isn't"
      ],
      a: 1,
      x: "Salt is per-user randomness mixed into the hash — defeats precomputed rainbow tables (each user's hash is unique even if passwords are identical). Pepper is a global secret added to every hash — if the DB is dumped but not the env vars / HSM, attackers can't brute-force at all. Defense in depth. Salt is mandatory; pepper is best practice in high-stakes systems."
    },
  ],
  sym: [
    {
      qid: 's1',
      q: "What's wrong with AES-ECB (Electronic Codebook) mode?",
      opts: [
        "Nothing",
        "Identical plaintext blocks encrypt to identical ciphertext blocks. Patterns in the data are PRESERVED in the ciphertext. The 'ECB penguin' demo shows the Tux Linux mascot still visible after ECB encryption.",
        "It's too fast"
      ],
      a: 1,
      x: "AES-ECB is deterministic per block — encrypt(k, B) always gives the same C. Any plaintext repetition (a JPEG's solid colors, repeated rows in a spreadsheet) shows through. Use AEAD modes: AES-GCM or ChaCha20-Poly1305. Or at minimum AES-CBC with a unique IV — but CBC doesn't provide integrity, so AEAD is strictly better."
    },
    {
      qid: 's2',
      q: "Why must AES-GCM nonces NEVER be reused with the same key?",
      opts: [
        "They can be",
        "Reusing a nonce with the same key in GCM is a CRITICAL vulnerability. Attackers can recover the authentication key + forge messages + recover XOR of plaintexts. One nonce reuse breaks the entire security model.",
        "Performance reasons"
      ],
      a: 1,
      x: "AES-GCM is a counter-mode cipher. Reusing a nonce reproduces the same keystream — XOR of two ciphertexts = XOR of the two plaintexts (which often reveals both). Worse, GCM's authentication tag becomes forgeable. Generation strategy: random 96-bit nonces (safe up to 2^32 messages per key) OR sequential counter (safer when feasible). Forbidden: 'we'll just use the same nonce because it's simpler.'"
    },
    {
      qid: 's3',
      q: "AES-GCM vs ChaCha20-Poly1305 — when to choose which?",
      opts: [
        "AES-GCM always",
        "AES-GCM where hardware AES (AES-NI) is available (modern x86/ARM CPUs) — it's blazingly fast there. ChaCha20-Poly1305 on hardware without AES-NI (older mobile, IoT) — it's faster than software AES.",
        "ChaCha20-Poly1305 always"
      ],
      a: 1,
      x: "Both are excellent AEAD primitives. Both are standardized in TLS 1.3. AES-GCM benefits massively from hardware support (AES-NI on Intel/AMD since ~2010, ARM v8 crypto extensions). ChaCha20-Poly1305 is software-only by design — predictable speed regardless of hardware. TLS clients advertise which they prefer; servers pick. For your own crypto: AES-GCM unless you're targeting hardware that lacks AES-NI."
    },
  ],
  asym: [
    {
      qid: 'a1',
      q: "What does RSA actually do at a high level?",
      opts: [
        "It encrypts data fast",
        "RSA is based on the difficulty of factoring large numbers (n = p × q where p, q are big primes). The public key uses n; the private key uses p and q. Encryption ≠ practical for bulk data; used for key wrapping and signatures.",
        "It's a hash function"
      ],
      a: 1,
      x: "RSA: pick two large primes p and q, compute n = pq. Public key: (n, e). Private key: (n, d) where d is computed from p, q, e. Encryption: c = m^e mod n. Decryption: m = c^d mod n. Security relies on the difficulty of factoring n back to p × q. RSA-2048 = 2048-bit n. RSA is slow + has size limits, so it's used to encrypt small things (AES keys, hashes-then-signed) — not for encrypting actual messages."
    },
    {
      qid: 'a2',
      q: "When should you use Ed25519 vs ECDSA P-256?",
      opts: [
        "ECDSA always",
        "Ed25519 for new code — faster, smaller signatures, no parameter choices to misconfigure, no nonce-reuse vulnerability. ECDSA P-256 only for compatibility with systems that don't support Ed25519 yet.",
        "They're identical"
      ],
      a: 1,
      x: "Ed25519 (EdDSA on Curve25519) was designed in 2011 to fix ECDSA's footguns: deterministic signing (no nonce-reuse vulnerability that bit Sony's PlayStation 3), no curve parameters to misconfigure, faster, smaller keys + signatures. SSH, age, Signal, Tor all use Ed25519. ECDSA P-256 is the older NIST curve — still safe with proper nonce generation, but Ed25519 is the better default."
    },
    {
      qid: 'a3',
      q: "Why not just encrypt files directly with RSA?",
      opts: [
        "You can",
        "RSA is slow + limited to ~245 bytes per encryption with 2048-bit keys. Real practice: generate a random AES key, encrypt the file with AES-GCM, encrypt the AES key with RSA. This is 'hybrid encryption' or 'envelope encryption.'",
        "RSA only works on numbers"
      ],
      a: 1,
      x: "Real-world asymmetric encryption is always hybrid: asymmetric crypto encrypts a small symmetric key; the symmetric key encrypts the actual data. This is what TLS does (RSA or ECDH exchanges a session key; AES-GCM or ChaCha20 encrypts the traffic). PGP does the same for emails. The 'asymmetric encrypts data directly' model is wrong — it's a key exchange mechanism."
    },
  ],
  pqc: [
    {
      qid: 'q1',
      q: "Which classical crypto does ML-KEM replace, and based on what math?",
      opts: [
        "Replaces AES, based on hash functions",
        "Replaces RSA and ECDH for KEY EXCHANGE. Based on the Module Learning With Errors (MLWE) lattice problem.",
        "Replaces ECDSA, based on factoring"
      ],
      a: 1,
      x: "ML-KEM (Module-Lattice Key Encapsulation Mechanism, FIPS 203) is the post-quantum replacement for RSA and ECDH key exchange. Built on the Module-LWE problem from lattice cryptography. ML-KEM-768 = NIST security level 3. Public key size: 1,184 bytes (vs 256 for RSA-2048) — significant TLS handshake overhead. AWS rolled out ML-KEM hybrid TLS to KMS, ACM, Secrets Manager in early 2026."
    },
    {
      qid: 'q2',
      q: "Why does SLH-DSA exist if ML-DSA already replaces signatures?",
      opts: [
        "Redundancy",
        "Different mathematical foundation. ML-DSA is lattice-based; SLH-DSA is hash-based only. If a mathematical breakthrough breaks lattice problems, SLH-DSA still stands. Defense against catastrophic algorithm failure.",
        "SLH-DSA is faster"
      ],
      a: 1,
      x: "Diversity is defense. Both ML-KEM and ML-DSA are lattice-based; SLH-DSA (FIPS 205, Stateless Hash-Based DSA, based on SPHINCS+) relies ONLY on hash function security — the most conservative assumption possible. Tradeoff: SLH-DSA signatures are huge (~17 KB vs ML-DSA's ~3.3 KB). Use SLH-DSA where signature size doesn't matter (firmware updates, code signing, roots of trust)."
    },
    {
      qid: 'q3',
      q: "What's a 'hybrid' post-quantum scheme?",
      opts: [
        "A hybrid car",
        "Combining classical (RSA/ECC) and post-quantum (ML-KEM) algorithms in one handshake. If either is broken later, the OTHER still secures the session. Used to deploy PQC without trusting it alone.",
        "Half encrypted"
      ],
      a: 1,
      x: "Hybrid TLS combines X25519 (classical, fast, well-understood) with ML-KEM (post-quantum, less battle-tested). The session key derives from BOTH outputs. If ML-KEM has an undiscovered weakness, X25519 still protects you. If a quantum computer breaks X25519, ML-KEM holds. AWS deployed hybrid PQC across KMS/ACM/Secrets Manager in early 2026. Industry consensus: hybrids during the transition, pure PQC later."
    },
  ],
  jwt: [
    {
      qid: 'j1',
      q: "What's the 'alg: none' JWT vulnerability?",
      opts: [
        "Doesn't exist",
        "Old JWT libraries accept tokens with the 'none' algorithm specified — meaning the signature isn't checked. Attackers craft a token, set alg='none', drop the signature, and walk in as anyone. Classic 2015 vulnerability still appearing in audits.",
        "Just a typo"
      ],
      a: 1,
      x: "JWT specifies 'none' as a valid algorithm (for testing purposes). Naive libraries decode the token, see alg=none, and skip signature verification. Attacker writes their own JWT payload (e.g., {sub: 'admin'}), sets alg=none, no signature needed. Mitigation: explicitly check the algorithm matches your expected one. Better: use PASETO (no alg field — type is part of the format)."
    },
    {
      qid: 'j2',
      q: "When should you use JWTs vs session cookies?",
      opts: [
        "JWTs always — they're modern",
        "Session cookies for typical web apps (server has a session store; trivial to invalidate; can store more data; standard CSRF protection). JWTs for stateless APIs across services, but accept the tradeoffs (can't easily revoke, larger than session IDs, vulnerable to many footguns).",
        "Always session cookies"
      ],
      a: 1,
      x: "Session cookies have a server-side store (Redis, DB) keyed by a random ID. Pros: instant invalidation, server controls everything, small cookie. JWTs are self-contained tokens. Pros: no DB lookup per request, works across services without shared state. Cons: harder to revoke (need allowlists/denylists), bigger, footgun-prone (alg confusion, secret leakage). For a typical web app: use sessions. For a distributed API: JWTs CAREFULLY, or look at PASETO."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What's the single most important rule of applied cryptography?",
      opts: [
        "Use AES",
        "Don't roll your own crypto. Use battle-tested high-level libraries (libsodium, age, AWS KMS, browser SubtleCrypto) — they make safe choices by default. Implementing primitives yourself is how subtle bugs become production vulnerabilities.",
        "Always use the largest key"
      ],
      a: 1,
      x: "Cryptography is not the place to learn by doing in production. The space of subtly-wrong-but-correct-looking implementations is vast: timing attacks, side channels, nonce reuse, padding oracles, parameter confusion. Use libraries written + audited by people who specialize in this. libsodium (NaCl) is the gold standard for application crypto. SubtleCrypto in browsers. age + rage for file encryption. The atlas teaches you what these things ARE so you can use them correctly."
    },
  ],
};

const COMPARISONS = {
  hashes: {
    title: 'Hash functions — when to use which',
    headers: ['Algorithm', 'Output size', 'Status', 'Use for'],
    rows: [
      ['MD5', '128 bits', 'BROKEN (collisions trivial since 2004)', 'NEVER for security. Acceptable for non-security checksums.'],
      ['SHA-1', '160 bits', 'BROKEN (SHAttered 2017)', 'NEVER for new code. Old systems migrating.'],
      ['SHA-256 / SHA-2', '256 bits', 'SECURE', 'Default general-purpose hash. HMAC, integrity, file fingerprints.'],
      ['SHA-3 / Keccak', '256/384/512', 'SECURE (NIST 2015)', "Alternative to SHA-2. Sponge construction. Not faster."],
      ['BLAKE3', '256 bits default', 'SECURE', 'Much faster than SHA-2 via parallelism. File integrity, not yet in TLS.'],
      ['xxHash', '32/64/128', 'NOT cryptographic', 'Non-security checksums only. Fast. Use for hash maps, not signatures.'],
    ],
  },
  password_hashes: {
    title: 'Password hashing — slow is the feature',
    headers: ['Algorithm', 'Hashes/sec (GPU)', 'Memory hard?', 'OWASP 2026 advice'],
    rows: [
      ['SHA-256 (raw)', '~10 billion', 'No', 'NEVER use for passwords — too fast.'],
      ['PBKDF2-SHA256', '~10 million (600k iter)', 'No', 'Acceptable for FIPS compliance only. 600k+ iterations.'],
      ['bcrypt (cost 12)', '~20', 'No', 'Acceptable. Maintain existing systems. 72-byte input limit.'],
      ['scrypt', '~5', 'Yes', 'Acceptable. Less framework support than Argon2id.'],
      ['Argon2id (m=64MB)', '~1', 'Yes', "RECOMMENDED. OWASP defaults: m=65536, t=3, p=1."],
    ],
  },
  symmetric: {
    title: 'Symmetric ciphers in 2026',
    headers: ['Cipher', 'Mode', 'Key size', 'Notes'],
    rows: [
      ['AES', 'GCM (AEAD)', '128 or 256', 'STANDARD. Hardware accelerated on modern CPUs. Used in TLS 1.3.'],
      ['AES', 'ECB', 'any', 'NEVER USE. Patterns leak through.'],
      ['AES', 'CBC + HMAC', 'any', 'Legacy. Manual MAC is footgun-prone. Use AEAD instead.'],
      ['ChaCha20', 'Poly1305 (AEAD)', '256', 'Excellent. Better on hardware without AES-NI. TLS 1.3.'],
      ['3DES', 'any', '168 effective', 'Deprecated. Slow, small block size, attacks.'],
      ['RC4', '-', 'any', 'BROKEN. Disabled in TLS since 2015.'],
    ],
  },
  asymmetric: {
    title: 'Asymmetric algorithms — classical (pre-quantum)',
    headers: ['Algorithm', 'Sec/key size', 'Use for', 'Quantum risk'],
    rows: [
      ['RSA-2048', '~112-bit', 'Signatures, key wrap, TLS', 'BROKEN by Shor — migrate via PQC'],
      ['RSA-3072', '~128-bit', 'Equivalent to ECC P-256', 'BROKEN by Shor'],
      ['RSA-4096', '~140-bit', 'Long-term signatures', 'BROKEN by Shor'],
      ['ECDSA P-256', '~128-bit', 'Signatures, TLS', 'BROKEN by Shor'],
      ['Ed25519', '~128-bit', 'Signatures (SSH, Signal)', 'BROKEN by Shor'],
      ['X25519 (ECDH)', '~128-bit', 'Key exchange (TLS, WireGuard)', 'BROKEN by Shor'],
    ],
  },
  pqc: {
    title: 'Post-quantum standards — NIST 2024+',
    headers: ['Standard', 'Replaces', 'Basis', 'Status'],
    rows: [
      ['FIPS 203 · ML-KEM', 'RSA + ECDH (key exchange)', 'Module-Lattice (MLWE)', 'FINAL (Aug 2024). AWS deploying.'],
      ['FIPS 204 · ML-DSA', 'RSA + ECDSA + Ed25519 (signatures)', 'Module-Lattice (MLWE)', 'FINAL (Aug 2024). Microsoft SymCrypt has it.'],
      ['FIPS 205 · SLH-DSA', 'Signatures (conservative backup)', 'Hash-based (SPHINCS+)', 'FINAL (Aug 2024). Large signatures.'],
      ['FIPS 206 · FN-DSA', 'Signatures (compact)', 'Falcon (lattice)', 'Publication expected 2026.'],
      ['HQC (TBD)', 'KEM (algorithm diversity)', 'Code-based', 'Selected March 2025; final 2026-2027.'],
    ],
  },
  jwt_alts: {
    title: 'Token formats — JWT vs alternatives',
    headers: ['Format', 'Strengths', 'Weaknesses'],
    rows: [
      ['JWT (RS256, ES256)', 'Ubiquitous, libraries everywhere, claims standard', 'alg=none footgun, alg confusion, "none" library bugs, parsing complexity'],
      ['PASETO v4 (public)', 'No alg field, sane defaults, no algorithm confusion', 'Less ecosystem support, fewer libraries'],
      ['PASETO v4 (local)', 'Symmetric, simpler, no public key infrastructure needed', 'Both parties need shared key'],
      ['Session cookies', 'Server controls everything, trivial revocation, small', "Requires server-side store, doesn't work across services"],
      ['Macaroons', "Decentralized authorization, caveats", "Rare, fewer libraries"],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "SHA-256 (or any fast hash) for passwords", reason: "GPUs do ~10 billion SHA-256/sec. Even with salt, an 8-character password cracks in hours. Use Argon2id (OWASP 2026 default: m=65536, t=3, p=1) or bcrypt cost 12+." },
  { name: "Rolling your own crypto", reason: "Implementing primitives yourself is how subtle bugs become production vulnerabilities. Use libsodium, age, browser SubtleCrypto, AWS KMS. Battle-tested libraries make safe choices by default." },
  { name: "AES-ECB mode", reason: "Identical plaintext blocks → identical ciphertext blocks. Patterns leak through. The famous 'ECB penguin' (Tux still visible after encryption). Always use AEAD: AES-GCM or ChaCha20-Poly1305." },
  { name: "Reusing nonces with AES-GCM", reason: "Critical vulnerability. Nonce reuse with same key reveals XOR of plaintexts AND lets attackers forge auth tags. Use random 96-bit nonces (safe up to 2^32 messages per key) or strict counter." },
  { name: "Manual encrypt-then-MAC", reason: "Subtle ordering + comparison bugs (constant-time? wrong key?). Use AEAD (combined primitive). AES-GCM and ChaCha20-Poly1305 handle both atomically." },
  { name: "Hardcoded secrets in source code", reason: "git history is forever. AWS/GCP/Azure secrets scanned constantly by attackers. Use environment variables, Vault, KMS, or secret managers. Never commit .env files." },
  { name: "JWT alg=none vulnerability", reason: "Library accepts unsigned tokens because alg='none'. Attacker crafts arbitrary payload, no signature needed. Mitigation: explicitly require expected algorithm. Better: use PASETO (no alg field)." },
  { name: "JWT signing secrets in client-side code", reason: "If the secret is in the browser, anyone can forge tokens. Asymmetric (RS256/ES256): client gets public key for verification only. Symmetric (HS256): server only." },
  { name: "Non-constant-time comparison of auth tokens", reason: "Timing attacks. token === expected leaks information through how quickly the comparison fails. Use crypto.timingSafeEqual (Node), hmac.compare_digest (Python), subtle.ConstantTimeCompare (Go)." },
  { name: "No key rotation policy", reason: "Keys leak (accidentally committed, stolen via malware, exposed in logs). Rotate signing keys, encryption keys, API keys on a schedule + after any incident. Plan for it BEFORE you need it." },
  { name: "Using RSA to encrypt bulk data", reason: "RSA-2048 encrypts ~245 bytes per operation. Slow. Real practice: hybrid encryption — random AES key for the data, RSA for the AES key. This is how TLS, PGP, KMS all work." },
];

const COMMANDS = [
  { cmd: 'openssl rand -hex 32', desc: "Generate 32 bytes of cryptographically secure random (64 hex chars). For session secrets, JWT keys, env vars." },
  { cmd: 'openssl rand -base64 48', desc: "36 bytes random as base64. Default cookie/CSRF secret format." },
  { cmd: 'openssl dgst -sha256 file', desc: "SHA-256 hash of a file. Use -sha512 for SHA-512. -hmac KEY for HMAC mode." },
  { cmd: 'openssl genrsa -out key.pem 4096', desc: "Generate 4096-bit RSA key. -aes256 to encrypt the file with a passphrase." },
  { cmd: 'openssl genpkey -algorithm Ed25519 -out key.pem', desc: "Generate Ed25519 private key. Modern, fast, small. Default for new SSH keys + age." },
  { cmd: 'ssh-keygen -t ed25519 -C "you@host"', desc: "Generate SSH keypair. Ed25519 is the modern default — faster, smaller, no parameters to misconfigure." },
  { cmd: 'openssl s_client -connect example.com:443 -tls1_3', desc: "Manual TLS 1.3 handshake. See cert chain, ciphers, protocols. The TLS debugging command." },
  { cmd: 'openssl x509 -in cert.pem -text -noout', desc: "Decode a certificate. Show subject, issuer, validity, extensions (SAN). -dates for just the validity window." },
  { cmd: 'age-keygen -o key.txt', desc: "Generate age keypair for file encryption. Modern alternative to PGP. Simpler, no key servers, smaller." },
  { cmd: 'age -r age1... -o out.age input', desc: "Encrypt a file for a recipient. age1... is their public key. To decrypt: age -d -i key.txt out.age." },
  { cmd: 'gpg --gen-key', desc: "Generate PGP key. Older, more complex than age but ubiquitous for email/git signing." },
  { cmd: 'curl -X POST https://acme-v02.api.letsencrypt.org/...', desc: "Direct ACME calls (rarely needed — use certbot/caddy/acme.sh). RFC 8555." },
  { cmd: 'argon2 password salt -id -t 3 -m 16 -p 1 -l 32', desc: "Compute Argon2id hash. -t iterations, -m log2(memory KB), -p parallelism. CLI version of the OWASP defaults." },
  { cmd: 'htpasswd -B -C 12 .htpasswd user', desc: "Generate bcrypt password hash (cost 12). For Apache basic auth or general bcrypt CLI."},
  { cmd: 'openssl req -x509 -newkey rsa:4096 -keyout k.pem -out c.pem -days 365 -nodes', desc: "Generate self-signed certificate. Useful for testing TLS locally + setting up internal CAs."},
  { cmd: 'vault kv put secret/app password=hunter2', desc: "Write a secret to HashiCorp Vault. The dominant secrets-management tool. Companion: 'vault kv get secret/app'." },
];

const RESOURCES = [
  { name: "Cryptography Engineering", url: 'amazon — book by Ferguson, Schneier, Kohno', note: "The applied crypto bible. Updated 2010 — older on PQC but the foundational concepts (security models, modes of operation, key management) are timeless. Read this before anything else.", kind: 'book' },
  { name: "Serious Cryptography", url: 'amazon — book by Jean-Philippe Aumasson, 2nd ed 2024', note: "Modern, accessible deep dive. Updated 2024 with PQC content. The 'how does this actually work' explanations are exceptional. Best modern crypto book.", kind: 'book' },
  { name: "Real-World Cryptography", url: 'amazon — book by David Wong, 2021', note: "Practical, code-heavy, focused on what working engineers need. Covers TLS, JWT, blockchain crypto. Best for hands-on devs.", kind: 'book' },
  { name: "Cryptopals Crypto Challenges", url: 'cryptopals.com', note: "Free interactive challenges that teach crypto by BREAKING it. Solve 48 problems from 'XOR a string' to 'break ECB' to 'forge RSA signatures.' The single best way to internalize crypto.", kind: 'tutorial' },
  { name: "Latacora — Cryptographic Right Answers", url: 'latacora.micro.blog/2018/04/03/cryptographic-right-answers.html', note: "One-page cheat sheet of WHAT TO USE. 'You need to encrypt X. Use AES-256-GCM.' No analysis paralysis. Updated periodically; bookmark.", kind: 'reference' },
  { name: "NIST Computer Security Resource Center", url: 'csrc.nist.gov', note: "The official source for NIST cryptographic standards. FIPS 203 (ML-KEM), 204 (ML-DSA), 205 (SLH-DSA). SP 800-series guidance. Authoritative + dense.", kind: 'spec' },
  { name: "IETF Crypto Forum (CFRG)", url: 'datatracker.ietf.org/wg/cfrg/about', note: "Where modern protocol crypto is standardized. RFC 9106 (Argon2), RFC 8439 (ChaCha20-Poly1305), RFC 8032 (Ed25519). Read RFCs for the canonical descriptions.", kind: 'spec' },
  { name: "OWASP Cheat Sheets", url: 'cheatsheetseries.owasp.org', note: "Password storage, JWT security, cryptographic storage, key management. Pragmatic guidance for app developers. The OWASP 2026 Argon2id recommendation comes from here.", kind: 'reference' },
  { name: "libsodium documentation", url: 'doc.libsodium.org', note: "The gold-standard high-level crypto library. Used by Signal, Wire, Zcash. The API is designed so safe usage is the default; misuse is hard. Read it as a reference for HOW crypto APIs should work.", kind: 'reference' },
  { name: "age (encryption tool)", url: 'age-encryption.org', note: "Modern file encryption tool. Filippo Valsorda. Simpler than PGP, smaller outputs, recipient-based. age + rage (Rust port) widely used in CI/CD secrets pipelines.", kind: 'tool' },
  { name: "Cloudflare Research — PQC Posts", url: 'blog.cloudflare.com/tag/post-quantum/', note: "Cloudflare deployed PQC in production early + writes deeply about the engineering tradeoffs. Hybrid handshakes, ML-KEM overhead in TLS, real-world rollout learnings.", kind: 'reference' },
  { name: "Brendan Gregg + Filippo Valsorda blogs", url: 'filippo.io', note: "Filippo built age, runs the Go crypto team. His blog is the highest-signal source for modern applied crypto thinking. Pair with anything Cloudflare's research team publishes.", kind: 'reference' },
];

const PERSONALIZED = {
  backend: {
    spark: "Backend: Argon2id for passwords. JWT or sessions deliberately chosen (not 'whatever the tutorial used'). Constant-time comparison for tokens. Secrets in env vars or Vault, never in code. Rotate keys on schedule.",
    pw: "Backend: every login endpoint hashes with Argon2id (or bcrypt during migration). Pepper from env var. Constant-time comparison. Rate limit failed attempts. Lock accounts on brute-force patterns.",
    sym: "Backend: AES-GCM for encrypting data at rest. Random 96-bit nonces. Store ciphertext + nonce + auth tag together. Use AWS KMS or Vault for the encryption keys — never store them in your DB.",
    asym: "Backend: Ed25519 for service-to-service signing. RSA-4096 for legacy interop. For inter-service auth, mTLS beats shared secrets — automatic key rotation, identity in the cert.",
    pqc: "Backend: not urgent for most apps in 2026 (no quantum computer yet). BUT: if data is sensitive for >10 years, plan hybrid migration now. Watch for ML-KEM support in libraries — already in OpenSSL, BoringSSL, AWS-LC.",
    jwt: "Backend: JWTs for stateless APIs across services; sessions for typical web apps. RS256 or ES256 (asymmetric — clients get only public key). Short expiry + refresh tokens. Audience + issuer claims validated.",
    library: "Backend: password storage (Argon2id patterns), key management (KMS/Vault), JWT (proper validation), symmetric encryption (AES-GCM with envelope encryption), TLS (mTLS for services).",
  },
  mobile: {
    spark: "Mobile: keychain (iOS) / Keystore (Android) for keys. Encrypted SQLite or platform-specific encrypted storage for sensitive data. Certificate pinning for high-stakes APIs.",
    pw: "Mobile: pwning at server side (same Argon2id story). Client side: biometric unlock (FaceID/TouchID) to access keychain-stored credentials. NEVER hash passwords client-side.",
    sym: "Mobile: encryption at rest via platform APIs (Apple's CryptoKit, Android's EncryptedSharedPreferences). Keys in Keychain/Keystore (hardware-backed where possible).",
    asym: "Mobile: client cert auth where high security needed (banking apps). Ed25519 for app-to-server signed requests. Sign-in with Apple uses ECDSA.",
    pqc: "Mobile: Apple + Google adding PQC slowly. iMessage announced PQ3 (hybrid ECDH + ML-KEM) for iMessage in 2024. Don't deploy custom PQC yet on mobile — wait for OS support.",
    jwt: "Mobile: short-lived access tokens + refresh tokens. Store refresh in Keychain/Keystore, NOT plain storage. Token rotation on refresh. Revoke on logout.",
    library: "Mobile: TLS (cert pinning), JWT (refresh token rotation), symmetric encryption (platform APIs), randomness (platform CSPRNGs).",
  },
  frontend: {
    spark: "Frontend: client-side crypto is dangerous. Browsers expose SubtleCrypto for the cases where it IS appropriate. Default to: send to server, server handles crypto. TLS protects in transit.",
    pw: "Frontend: do NOT hash passwords client-side before sending. The hash IS the password if you do that — defeats the purpose. Send over HTTPS; server applies Argon2id.",
    sym: "Frontend: SubtleCrypto for legitimate client-side cases (e2e encryption, client-side file encryption before upload). Otherwise: send to server. Never store keys in localStorage — XSS can extract.",
    asym: "Frontend: SubtleCrypto can do Ed25519/ECDSA signing client-side if you genuinely need it. Used in WebAuthn (passkeys) — the browser holds the private key in hardware.",
    pqc: "Frontend: not your concern in 2026. Browsers will roll out PQC transparently in TLS. Watch for Web Crypto API additions for ML-KEM when standards solidify.",
    jwt: "Frontend: store access token in memory (not localStorage — XSS-readable). Refresh token in httpOnly cookie. CSRF protection via SameSite + double-submit. Logout = clear cookies + state.",
    library: "Frontend: secure cookies (httpOnly, Secure, SameSite), SubtleCrypto usage (where appropriate), CSP (defense in depth), CSRF tokens.",
  },
  devops: {
    spark: "DevOps: secrets management is 90% of operational crypto. Vault or KMS for everything. ACME for cert automation. Rotate keys without human intervention. Audit logs on key access.",
    pw: "DevOps: secrets — never passwords in deploys. SSH keys (Ed25519), API tokens (random 32 bytes), service credentials. Rotate quarterly + on incident. Use short-lived dynamic credentials when possible (Vault generates DB creds on demand).",
    sym: "DevOps: envelope encryption pattern. App generates Data Encryption Key (random AES-256), encrypts data. App sends DEK to KMS for encryption, stores encrypted DEK with data. KMS protects the master key.",
    asym: "DevOps: mTLS for service-to-service. Internal CA (Vault PKI or step-ca). Short-lived certificates (hours, not years) + auto-renewal. Identity baked into cert; no shared secrets.",
    pqc: "DevOps: not yet for most. BUT: inventory your crypto NOW (what algorithms? key sizes? where?). Build crypto-agility: abstractions that let you swap algorithms without code changes. CNSA 2.0 deadline Jan 2027 for government.",
    jwt: "DevOps: monitoring — log token issuances, validations, failures. Detect anomalies (sudden surge of failed validations = attack). Key rotation procedures + JWKS endpoints for public keys.",
    library: "DevOps: TLS automation (Caddy/Let's Encrypt), key management (Vault, KMS, envelope encryption), random/nonces, post-quantum (migration patterns).",
  },
  fundamentals: {
    spark: "Fundamentals: Aumasson's Serious Cryptography (2nd ed). Solve Cryptopals (cryptopals.com — solve 48 problems by breaking crypto). Read NIST FIPS publications. Watch Filippo Valsorda's talks.",
    pw: "Fundamentals: derive a key from a password with Argon2id by hand (in Python or Go). See why the parameters work that way. Implement a salt-and-hash flow + see WHY peppering helps.",
    sym: "Fundamentals: implement AES yourself once (just for learning). Then NEVER USE YOUR IMPLEMENTATION. Use library AES-GCM. The exercise builds intuition; the production code uses libsodium.",
    asym: "Fundamentals: math behind RSA (modular exponentiation, Carmichael's function). Math behind ECDH (group operations on curves). Then use NaCl/libsodium for everything real.",
    pqc: "Fundamentals: read the FIPS 203/204/205 standards. Understand lattices (Module-LWE), hash-based signatures (Merkle trees, SPHINCS+). The math is more involved than RSA/ECC but accessible.",
    jwt: "Fundamentals: write a JWT decoder by hand (base64 + JSON parsing). See exactly what's in a token. Then look at the canonical alg-confusion bugs in jwt.io's history.",
    library: "Fundamentals: all 8 categories. Password storage → symmetric → asymmetric → JWT → KMS → TLS → randomness → PQC. Each builds on previous understanding.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's the symptom?",
    opts: [
      { label: "🚨 Audit finding: weak crypto algorithm", next: 'weak-algo' },
      { label: "🔓 Vulnerability: someone forged a token / signature", next: 'token-forge' },
      { label: "🔑 Password hashing too slow / fast in production", next: 'pw-perf' },
      { label: "📜 TLS handshake fails / cert error", next: 'tls-fail' },
      { label: "💀 Suspect timing attack on auth endpoint", next: 'timing' },
      { label: "🔐 Lost a key / need to rotate", next: 'rotate' },
      { label: "📦 Preparing for post-quantum migration", next: 'pqc-prep' },
      { label: "❓ How do I encrypt user data at rest?", next: 'at-rest' },
    ],
  },
  'weak-algo': {
    fix: "Inventory current crypto usage. Migrate without breaking existing data. Plan crypto-agility for the future.",
    steps: [
      "Inventory: grep -r 'md5\\|sha1\\|des\\|rc4' your codebase. Audit every match — most are non-security uses (file checksums); some are bugs.",
      "Password hashes (MD5/SHA-256): can't migrate users en masse. Strategy: on next login, verify with old algorithm, re-hash with Argon2id, store new hash. Sets a column 'pwd_algo' to track migration state.",
      "Symmetric encryption (DES, 3DES, AES-ECB): decrypt with old key, re-encrypt with AES-GCM under new key. Bulk migrate as a batch job.",
      "Signatures (SHA-1): re-sign with SHA-256 if you control the signing. If you don't (incoming signatures), reject SHA-1.",
      "TLS cipher suites: configure modern profile via Mozilla SSL Config Generator. Disable TLS 1.0/1.1. ssllabs.com/ssltest verifies the result.",
      "Build crypto-agility: abstract crypto operations so the algorithm is a runtime config. Makes the NEXT migration easier.",
    ],
  },
  'token-forge': {
    fix: "Token forging means signature verification failed somewhere. Audit the verification logic + library version.",
    steps: [
      "Check for JWT alg=none vulnerability: try sending a token with header {alg:'none', typ:'JWT'}, payload of admin claims, no signature. If accepted → critical CVE. Update JWT library.",
      "Algorithm confusion attack: try sending a token signed with HS256 (symmetric) using the public RSA key as the HMAC secret. Some libraries fall for this. Mitigation: explicit algorithm allowlist on verification.",
      "Wrong key used? If your verifier uses a different key than your signer, signatures fail to validate or — worse — a key swap can happen. Audit key sources.",
      "Token replay: token captured + reused. Add jti claim (JWT ID) + maintain replay-check DB. Or short expirations.",
      "Tokens with weak secrets: HS256 with a low-entropy secret = brute-forceable. Use random 32+ bytes. Or switch to asymmetric (RS256/ES256/EdDSA).",
      "Move to PASETO if rewriting auth — eliminates entire classes of JWT bugs.",
    ],
  },
  'pw-perf': {
    fix: "Tune Argon2id parameters until you hit ~250 ms per hash on production hardware. Slow = good; too slow = users wait.",
    steps: [
      "Target: 200-500 ms per login attempt is the sweet spot. Below 100 ms = too easy for attackers. Above 1 sec = poor UX + DOS attack surface.",
      "Measure current: benchmark your hashing on production hardware. Tools: argon2-cffi (Python), node-argon2 (Node), Argon2 reference impl.",
      "Tune Argon2id: start with OWASP defaults (m=65536, t=3, p=1). Bump m up if memory available; bump t up if you want more CPU work. Keep p=1 unless server has many cores AND you've benchmarked.",
      "Server memory limit: m=65536 (64 MB) × N concurrent logins. 100 logins = 6.4 GB JUST for hashing. Plan capacity.",
      "Serverless / cold start? Argon2id's memory hardness is awkward on tiny serverless. bcrypt cost 12 may be a pragmatic fallback in those environments.",
      "Hash on login worker, not main request thread. Don't block I/O for 250 ms of CPU work per concurrent request.",
    ],
  },
  'tls-fail': {
    fix: "TLS errors are specific — read the error message. The Net Atlas covers TLS handshake debugging in depth.",
    steps: [
      "openssl s_client -connect host:443 -servername host — see cert chain + handshake. Reads like a debug log.",
      "Cert expired? 90-day Let's Encrypt cert renewal failed. Check certbot/caddy logs. Manual: certbot renew --force.",
      "Cert chain incomplete? Server sent only the end-entity cert; intermediates missing. Modern clients sometimes recover; older tools (Java HTTP clients) don't. Fix the server config.",
      "Modern client rejecting TLS 1.0/1.1? Don't disable security — upgrade server config. Mozilla SSL Config Generator gives copy-paste for nginx/apache/caddy.",
      "Hostname mismatch? Cert is for example.com but you connected to www.example.com. Check SAN extensions in the cert.",
      "Self-signed in production? Switch to Let's Encrypt (free, automated). Caddy auto-handles ACME.",
      "Full deeper triage in the Net Atlas — TLS chapter.",
    ],
  },
  'timing': {
    fix: "Token comparisons leak through how quickly the comparison fails. Use constant-time comparison everywhere.",
    steps: [
      "Replace token === expected with constant-time compare. Node: crypto.timingSafeEqual(buf1, buf2). Python: hmac.compare_digest(a, b). Go: subtle.ConstantTimeCompare. Rust: subtle crate.",
      "Both args must be SAME LENGTH for some implementations. Convert to fixed-length comparison or hash both first.",
      "Login endpoint must reveal the same timing for 'wrong user' vs 'wrong password' vs 'success.' Otherwise attackers enumerate valid users. Hash always, even when user doesn't exist.",
      "Detect attackers: monitor for rapid-fire requests with timing-relevant patterns. Rate limit by IP/user/global.",
      "Some attacks need many samples to succeed. Just rate-limiting auth endpoints to ~5 req/sec mitigates most practical timing attacks.",
    ],
  },
  'rotate': {
    fix: "Key rotation procedures should exist BEFORE you need them. Most orgs don't have them, then panic during an incident.",
    steps: [
      "JWT signing keys: maintain a key set. New keys are signed under, old keys verify until they expire. Publish via JWKS endpoint. Both signer + verifier read from the set.",
      "API tokens: support BOTH old + new tokens during overlap. Users use new endpoint; their old token still works for 30 days. Then revoke old.",
      "TLS certs: ACME auto-renews. Verify your renewal works in staging (certbot --dry-run). Monitor cert expiry as a metric.",
      "Encryption keys (envelope): KMS rotates the master key transparently. Re-encrypt DEKs in the background. Bulk re-encryption of data is the slow part — schedule as background job.",
      "SSH keys: rotate per-team. Per-user keys never share across machines. Use ssh-key-cli + automated CI for distribution. revoke + regenerate on any incident.",
      "Audit: log key creation, use, deletion. Anomaly detection on key usage spikes.",
    ],
  },
  'pqc-prep': {
    fix: "Don't deploy custom PQC in 2026. DO inventory, design crypto-agility, watch for library support.",
    steps: [
      "Inventory current crypto: every place you use RSA, ECDSA, ECDH, Ed25519. Mark which would need PQC migration when libraries support it.",
      "Crypto-agility: refactor crypto calls behind a thin interface so you can swap algorithms. Algorithm choice in config, not hardcoded.",
      "Watch library support: OpenSSL has ML-KEM/ML-DSA. BoringSSL + AWS-LC have them. Node, Go, Python adding via libraries (e.g., liboqs bindings).",
      "Cloud KMS: AWS KMS supports ML-DSA signatures already (2026). Microsoft SymCrypt has ML-KEM + ML-DSA in Windows 11/Server 2025.",
      "TLS: enable hybrid PQ TLS in load balancers when offered. AWS ALB, Cloudflare offer it. Negotiated; falls back to classical for non-PQ clients.",
      "Long-lived data: identify data sensitive for >10 years. Re-encrypt with hybrid (classical + PQC) as PQC libraries mature.",
      "CNSA 2.0 deadline Jan 2027 only applies to US federal contractors. Most apps have years — but the planning starts now.",
    ],
  },
  'at-rest': {
    fix: "Envelope encryption with a KMS is the modern answer. Don't store encryption keys in your DB.",
    steps: [
      "Generate a Data Encryption Key (DEK) per item (or per user, per tenant — depending on access pattern). Random 32 bytes (AES-256).",
      "Encrypt the data: AES-256-GCM with random 96-bit nonce. Output: nonce || ciphertext || tag. Store all three together.",
      "Encrypt the DEK with a Key Encryption Key (KEK) from KMS. AWS KMS / GCP KMS / Azure Key Vault. The KEK never leaves KMS — they sign/encrypt on your behalf.",
      "Store: encrypted_data, encrypted_dek. To read: send encrypted_dek to KMS → get plaintext DEK → decrypt data → drop DEK from memory.",
      "Audit: KMS logs every decrypt call. Anomalous patterns (mass decrypts) trigger alerts.",
      "Rotation: KMS rotates KEK automatically. Re-encrypt DEKs in background. App code doesn't change.",
      "Alternative (smaller scale): use age + recipient pubkey. The 'KMS' is your own key file held securely.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'app', x: 110, y: 18, w: 110, h: 28, label: 'Your app', color: '#6ee7b7', desc: "Your code calling crypto operations. Should call high-level safe primitives — never raw block cipher operations." },
  { id: 'lib', x: 110, y: 58, w: 110, h: 28, label: 'High-level lib', color: '#6ee7b7', desc: "libsodium, age, AWS Encryption SDK, browser SubtleCrypto. Combines primitives safely. AEAD modes, key derivation, nonce management." },
  { id: 'prim', x: 110, y: 98, w: 110, h: 28, label: 'Primitives', color: '#e879f9', desc: "AES, ChaCha20, SHA-256, Curve25519, Argon2. The mathematical building blocks. Use the high-level lib to wire them together — don't combine raw primitives yourself." },
  { id: 'key', x: 60, y: 138, w: 100, h: 28, label: 'Key store', color: '#e879f9', desc: "Where keys live: KMS (cloud), HSM (hardware), Vault (self-hosted), keyring (OS), env vars (lower-trust)." },
  { id: 'rng', x: 170, y: 138, w: 100, h: 28, label: 'CSPRNG', color: '#e879f9', desc: "Cryptographic randomness from the OS. /dev/urandom on Linux, crypto.getRandomValues() in browser, os.urandom() in Python." },
  { id: 'hw', x: 110, y: 178, w: 110, h: 28, label: 'CPU / HW', color: '#6ee7b7', desc: "AES-NI hardware acceleration on modern x86 + ARM. RDRAND / RDSEED for randomness. TPM / Secure Enclave for keys + signing." },
];

const CHALLENGES = [
  { id: 'hash-hello', title: '01 · Hash "hello" with SHA-256', desc: "Compute SHA-256 of the string 'hello'. Should produce 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824.", op: 'hash', input: 'hello', alg: 'SHA-256', expected: '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824' },
  { id: 'hash-Hello', title: '02 · Avalanche effect', desc: "Now hash 'Hello' (capital H). Compare to challenge 1. Different by one bit; output looks completely unrelated.", op: 'hash', input: 'Hello', alg: 'SHA-256', expected: '185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969' },
  { id: 'gen-key', title: '03 · Generate an AES-256 key', desc: "Generate a fresh AES-256-GCM key using SubtleCrypto. Shown as hex.", op: 'genkey', alg: 'AES-GCM' },
  { id: 'encrypt', title: '04 · Encrypt "secret message"', desc: "Encrypt 'secret message' with the AES-256 key from challenge 3. See ciphertext + nonce + auth tag.", op: 'encrypt', plaintext: 'secret message' },
  { id: 'decrypt', title: '05 · Decrypt the ciphertext', desc: "Decrypt the ciphertext from challenge 4. Should recover 'secret message' exactly.", op: 'decrypt' },
  { id: 'tamper', title: '06 · Tamper detection', desc: "Try decrypting tampered ciphertext (flip one byte). AEAD should DETECT the tampering and fail loudly.", op: 'tamper' },
  { id: 'gen-sig', title: '07 · Generate Ed25519 keypair + sign', desc: "Generate an ECDSA P-256 keypair (browser-supported), sign 'authentic message'.", op: 'sign', message: 'authentic message' },
  { id: 'verify', title: '08 · Verify signature + test tampering', desc: "Verify the signature on the original message (should pass). Then verify against 'authentic message!' (one extra char) — should fail.", op: 'verify' },
];

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'cryptoatlas:';
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
  passwords: {
    label: 'Passwords',
    icon: '⧗',
    snippets: [
      {
        id: 'argon2-node',
        title: 'Argon2id password hashing (Node.js)',
        desc: "OWASP 2026 defaults. The right answer for new password storage.",
        code: `// npm install argon2
import argon2 from 'argon2';

// HASH on signup or password change
async function hashPassword(plain) {
  return argon2.hash(plain, {
    type: argon2.argon2id,
    memoryCost: 65536,    // 64 MiB (OWASP 2026 default)
    timeCost: 3,          // 3 iterations
    parallelism: 1,       // 1 thread
  });
}

// VERIFY on login
async function checkPassword(plain, hash) {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;        // bad hash format = fail
  }
}

// REHASH on login if params changed (migration support)
async function loginFlow(email, password) {
  const user = await db.users.findOne({ email });
  if (!user) {
    // Hash anyway — same timing whether user exists or not
    await argon2.hash('dummy');
    return null;
  }
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return null;

  // Migrate if hash params have improved
  if (argon2.needsRehash(user.passwordHash, { memoryCost: 65536, timeCost: 3 })) {
    user.passwordHash = await hashPassword(password);
    await db.users.update(user);
  }
  return user;
}`,
        note: "Always hash on failed login too — same timing whether the user exists or not. Prevents username enumeration. argon2.needsRehash() lets you transparently upgrade hashes as you raise parameters over time."
      },
      {
        id: 'argon2-python',
        title: 'Argon2id password hashing (Python)',
        desc: "Same OWASP defaults via argon2-cffi.",
        code: `# pip install argon2-cffi
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError

ph = PasswordHasher(
    memory_cost=65536,    # 64 MiB
    time_cost=3,
    parallelism=1,
    hash_len=32,
    salt_len=16,
)

# HASH
def hash_password(plain: str) -> str:
    return ph.hash(plain)

# VERIFY
def verify_password(hash_str: str, plain: str) -> bool:
    try:
        ph.verify(hash_str, plain)
        # Auto-rehash if params changed (migration support)
        if ph.check_needs_rehash(hash_str):
            return ph.hash(plain)   # caller stores this back
        return True
    except (VerifyMismatchError, InvalidHashError):
        return False`,
        note: "argon2-cffi is the de-facto Python Argon2 library. The hash string is self-describing (includes algorithm, params, salt, hash) — no separate columns needed. Format: $argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>."
      },
      {
        id: 'bcrypt-fallback',
        title: 'bcrypt (acceptable fallback)',
        desc: "When Argon2 isn't available (older runtimes, memory-constrained environments).",
        code: `// Node — npm install bcrypt
import bcrypt from 'bcrypt';

const COST = 12;  // OWASP 2026 minimum

async function hashPassword(plain) {
  // bcrypt has 72-byte input limit
  if (plain.length > 72) throw new Error('password too long');
  return bcrypt.hash(plain, COST);
}

async function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// Python — pip install bcrypt
import bcrypt

def hash_password(plain: str) -> bytes:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt(rounds=12))

def check_password(plain: str, hash_bytes: bytes) -> bool:
    return bcrypt.checkpw(plain.encode(), hash_bytes)`,
        note: "bcrypt's 72-byte input limit is a real footgun — long passwords silently truncate. Workaround: pre-hash with SHA-256 first if you must accept long inputs (but Argon2id has no such limit). Cost 12 = ~250 ms per hash in 2026 hardware."
      },
      {
        id: 'enumeration-defense',
        title: 'Defeating username enumeration',
        desc: "Same response time + error message whether user exists or not.",
        code: `// THE ENUMERATION BUG (don't do this):
async function badLogin(email, password) {
  const user = await db.users.findOne({ email });
  if (!user) {
    return { error: 'No such user' };       // tells attacker user doesn't exist
  }
  const ok = await argon2.verify(user.hash, password);
  if (!ok) return { error: 'Wrong password' };  // tells them it does
  return { ok: true };
}

// THE RIGHT WAY: same timing, same message
const FAKE_HASH = await argon2.hash('placeholder');  // computed at startup

async function login(email, password) {
  const user = await db.users.findOne({ email });
  // ALWAYS run a hash, even if user doesn't exist — same timing
  const hashToCheck = user ? user.passwordHash : FAKE_HASH;
  const ok = await argon2.verify(hashToCheck, password);

  if (!user || !ok) {
    return { error: 'Invalid email or password' };  // same message both cases
  }
  return { user };
}`,
        note: "Username enumeration lets attackers build target lists ('which of these 10 million emails has accounts on your site?'). Defenses: same response, same timing, rate limiting, eventually CAPTCHA on suspicious patterns."
      },
    ],
  },
  symmetric: {
    label: 'Symmetric',
    icon: '⊟',
    snippets: [
      {
        id: 'aes-gcm-node',
        title: 'AES-256-GCM encryption (Node.js)',
        desc: "The standard symmetric encryption. AEAD = confidentiality + integrity in one primitive.",
        code: `import crypto from 'crypto';

// Generate a key (store this in KMS / Vault / env var)
const key = crypto.randomBytes(32);   // 256-bit key

// ENCRYPT
function encrypt(plaintext) {
  const iv = crypto.randomBytes(12);  // 96-bit random nonce (GCM standard)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();  // 16-byte authentication tag

  // Store/transmit: iv || tag || ciphertext (concatenated)
  return Buffer.concat([iv, tag, ciphertext]);
}

// DECRYPT
function decrypt(combined) {
  const iv = combined.slice(0, 12);
  const tag = combined.slice(12, 28);
  const ciphertext = combined.slice(28);

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);

  // If anything was tampered with, .final() throws
  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch (e) {
    throw new Error('Decryption failed — tampered or wrong key');
  }
}

// USAGE
const encrypted = encrypt('hello world');
const decrypted = decrypt(encrypted);   // 'hello world'`,
        note: "Always generate a fresh random IV (nonce) per encryption. Never reuse with the same key. Storing IV + tag + ciphertext together is conventional. The auth tag MAKES this safe — without it, an attacker could modify the ciphertext silently."
      },
      {
        id: 'aes-gcm-python',
        title: 'AES-256-GCM (Python)',
        desc: "Using the cryptography library — the standard Python crypto.",
        code: `# pip install cryptography
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

# Generate key (store securely!)
key = AESGCM.generate_key(bit_length=256)
aesgcm = AESGCM(key)

# ENCRYPT
def encrypt(plaintext: bytes) -> bytes:
    nonce = os.urandom(12)                     # 96-bit random nonce
    ciphertext = aesgcm.encrypt(nonce, plaintext, None)  # None = no associated data
    return nonce + ciphertext                   # ciphertext includes 16-byte tag at end

# DECRYPT
def decrypt(combined: bytes) -> bytes:
    nonce = combined[:12]
    ciphertext = combined[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)   # raises if tampered

# With Associated Data (AD) — included in tag, not encrypted
# Useful for binding ciphertext to context (e.g., user ID, version)
def encrypt_with_context(plaintext: bytes, user_id: str) -> bytes:
    nonce = os.urandom(12)
    ad = user_id.encode()
    ciphertext = aesgcm.encrypt(nonce, plaintext, ad)
    return nonce + ciphertext

def decrypt_with_context(combined: bytes, user_id: str) -> bytes:
    nonce = combined[:12]
    ciphertext = combined[12:]
    return aesgcm.decrypt(nonce, ciphertext, user_id.encode())`,
        note: "The Python 'cryptography' library is the right choice. NaCl/libsodium via PyNaCl is even higher-level but less standard. Associated Data binds the ciphertext to context — if someone moves the ciphertext to a different user's record, decryption fails."
      },
      {
        id: 'chacha20-tls',
        title: 'ChaCha20-Poly1305 (when not AES)',
        desc: "Better than AES on hardware without AES-NI. Used in TLS 1.3 and WireGuard.",
        code: `// Node — built into the crypto module
import crypto from 'crypto';

const key = crypto.randomBytes(32);  // ChaCha20 uses 256-bit key

function encrypt(plaintext) {
  const nonce = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([nonce, tag, ciphertext]);
}

function decrypt(combined) {
  const nonce = combined.slice(0, 12);
  const tag = combined.slice(12, 28);
  const ct = combined.slice(28);
  const decipher = crypto.createDecipheriv('chacha20-poly1305', key, nonce, { authTagLength: 16 });
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

// Python — same library, different cipher
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305
import os

key = ChaCha20Poly1305.generate_key()
chacha = ChaCha20Poly1305(key)
nonce = os.urandom(12)
ciphertext = chacha.encrypt(nonce, b'hello', None)
plaintext = chacha.decrypt(nonce, ciphertext, None)`,
        note: "ChaCha20-Poly1305 is faster than AES-GCM in pure software (no hardware accel). TLS 1.3 advertises both; clients with hardware AES prefer AES, others prefer ChaCha20. For embedded / older devices, ChaCha20 is the better default."
      },
    ],
  },
  asymmetric: {
    label: 'Asymmetric',
    icon: '⊕',
    snippets: [
      {
        id: 'ed25519-keys',
        title: 'Ed25519 keypair + signing (Node)',
        desc: "Modern signature scheme. Faster than RSA, smaller signatures, fewer footguns.",
        code: `import crypto from 'crypto';

// Generate keypair
const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

// Sign a message
function sign(message, privKey) {
  // Ed25519 signs raw — no hashing required
  return crypto.sign(null, Buffer.from(message), privKey);
}

// Verify
function verify(message, signature, pubKey) {
  return crypto.verify(null, Buffer.from(message), pubKey, signature);
}

// Export keys (for storage)
const privPem = privateKey.export({ format: 'pem', type: 'pkcs8' });
const pubPem = publicKey.export({ format: 'pem', type: 'spki' });

// Import keys (when loading)
const importedPriv = crypto.createPrivateKey(privPem);
const importedPub = crypto.createPublicKey(pubPem);

// USAGE
const sig = sign('release version 2.0.1', privateKey);
const ok = verify('release version 2.0.1', sig, publicKey);  // true
const tampered = verify('release version 2.0.2', sig, publicKey);  // false`,
        note: "Ed25519 signs raw bytes — the curve includes hashing internally (SHA-512). 32-byte public keys, 64-byte signatures. Same key always produces same signature for same message (deterministic), which sidesteps the nonce-reuse vulnerability that bit Sony's PS3 with ECDSA."
      },
      {
        id: 'rsa-sign',
        title: 'RSA signing (when compatibility required)',
        desc: "Slower + larger than Ed25519, but still common for legacy interop + JWT RS256.",
        code: `import crypto from 'crypto';

// Generate RSA-4096 keypair (slower; takes ~1-2 seconds)
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
});

// SIGN — RSA-PSS is the modern padding (not PKCS#1 v1.5)
function sign(message, privKey) {
  return crypto.sign('sha256', Buffer.from(message), {
    key: privKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
  });
}

// VERIFY
function verify(message, signature, pubKey) {
  return crypto.verify('sha256', Buffer.from(message), {
    key: pubKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
  }, signature);
}

// For JWT RS256: same as above but use RSA_PKCS1_PADDING (legacy)
// For new JWT code, prefer ES256 (ECDSA) or EdDSA (Ed25519)`,
        note: "RSA-PSS (Probabilistic Signature Scheme) is the modern padding. PKCS#1 v1.5 is the older standard — still widespread (JWT RS256 uses it). For new code: RSA-PSS or just use Ed25519. RSA-4096 is overkill but adds quantum-resistance buffer."
      },
      {
        id: 'ecdh-keyexchange',
        title: 'X25519 key exchange',
        desc: "Two parties derive a shared secret over an insecure channel. Foundation of TLS 1.3.",
        code: `import crypto from 'crypto';

// Alice generates keypair
const alice = crypto.generateKeyPairSync('x25519');
// Bob generates keypair
const bob = crypto.generateKeyPairSync('x25519');

// Alice + Bob exchange PUBLIC keys (could be over insecure channel)
const alicePub = alice.publicKey;
const bobPub = bob.publicKey;

// Each computes the shared secret using their own private key + the other's public
const aliceShared = crypto.diffieHellman({
  privateKey: alice.privateKey,
  publicKey: bobPub,
});

const bobShared = crypto.diffieHellman({
  privateKey: bob.privateKey,
  publicKey: alicePub,
});

// aliceShared and bobShared are IDENTICAL — the shared secret
// Even if an eavesdropper had both public keys, they couldn't compute this

// Derive an actual encryption key from the shared secret (use HKDF)
import { hkdfSync } from 'crypto';
const derivedKey = hkdfSync('sha256', aliceShared, Buffer.alloc(0), 'app-encryption-v1', 32);
// Now both parties have a 32-byte AES-GCM key without ever sending it`,
        note: "X25519 is the modern key exchange. Used in TLS 1.3, WireGuard, Signal, Noise Protocol Framework. NEVER use the raw shared secret as a key — always pass through HKDF (HMAC-based Key Derivation Function) with a context-specific 'info' string."
      },
    ],
  },
  jwt: {
    label: 'JWT',
    icon: '⌗',
    snippets: [
      {
        id: 'jwt-sign-verify',
        title: 'JWT signing + verification (the SAFE way)',
        desc: "Asymmetric (ES256), explicit algorithm check, audience/issuer validation.",
        code: `import jwt from 'jsonwebtoken';
import fs from 'fs';

// Load keys (generate with: openssl ecparam -genkey -name prime256v1 ...)
const privateKey = fs.readFileSync('private.pem');
const publicKey = fs.readFileSync('public.pem');

// SIGN
function createToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      // Don't put sensitive data here — JWTs are SIGNED, not encrypted
    },
    privateKey,
    {
      algorithm: 'ES256',          // explicit, not 'inferred'
      issuer: 'https://api.example.com',
      audience: 'https://app.example.com',
      expiresIn: '15m',             // SHORT — use refresh tokens for longer sessions
    }
  );
}

// VERIFY
function verifyToken(token) {
  try {
    return jwt.verify(token, publicKey, {
      algorithms: ['ES256'],         // CRITICAL: explicit allowlist
                                      // Prevents alg-confusion attacks
      issuer: 'https://api.example.com',
      audience: 'https://app.example.com',
      // clockTolerance: 5,           // 5 sec for clock skew across services
    });
  } catch (e) {
    // Differentiate error types: expired, invalid signature, malformed
    if (e.name === 'TokenExpiredError') return { error: 'expired' };
    if (e.name === 'JsonWebTokenError') return { error: 'invalid' };
    throw e;
  }
}`,
        note: "The single most important line: algorithms: ['ES256']. WITHOUT this, libraries may accept HS256-signed tokens using the public key as the HMAC secret (alg-confusion attack). With it, the verifier explicitly rejects unexpected algorithms. ALWAYS specify an algorithm allowlist."
      },
      {
        id: 'paseto-alternative',
        title: 'PASETO — the no-footgun JWT alternative',
        desc: "Same use case as JWT, none of the algorithm-confusion vulnerabilities.",
        code: `// npm install paseto

// LOCAL (symmetric) — both parties share a secret
import { V4 } from 'paseto';
import { generateSecret } from 'paseto/v4';

const key = await generateSecret('local');   // symmetric key

// Create token
const token = await V4.encrypt({
  sub: 'user-123',
  role: 'admin',
  exp: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
}, key, { audience: 'app' });

// Verify (also decrypts in local mode)
const claims = await V4.decrypt(token, key, { audience: 'app' });

// PUBLIC (asymmetric) — server signs, client/peer verifies
import { generateKeyPair } from 'paseto/v4';

const { privateKey, publicKey } = await generateKeyPair('public');

const signed = await V4.sign({ sub: 'user-123' }, privateKey, {
  audience: 'app',
  expiresIn: '15m',
});

const verified = await V4.verify(signed, publicKey, { audience: 'app' });

// Why PASETO over JWT:
// - No alg field — version+purpose is in the token format itself
// - No algorithm-confusion attacks possible
// - Modern primitives (XChaCha20-Poly1305 for local, Ed25519 for public)
// - Less library surface area = fewer bugs`,
        note: "PASETO (Platform-Agnostic Security Tokens) was designed specifically to fix JWT's worst footguns. Versions baked into the token (v4 is current); purposes (local = symmetric, public = asymmetric) are explicit. Use for new auth designs. JWTs still dominate when ecosystem support matters."
      },
      {
        id: 'jwt-revoke',
        title: 'JWT revocation patterns',
        desc: "JWTs are stateless by design — but you need revocation in real systems. Three approaches.",
        code: `// APPROACH 1: Short expiry + refresh tokens
//   Access token: 15 min, no revocation needed (just wait it out)
//   Refresh token: 7 days, stored in DB, revocable
//   On revoke: delete refresh token; next access-token refresh fails
function issueTokens(user) {
  const accessToken = jwt.sign({ sub: user.id }, privateKey, {
    algorithm: 'ES256', expiresIn: '15m'
  });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  db.refreshTokens.insert({ token: hashSha256(refreshToken), userId: user.id, expiresAt: ... });
  return { accessToken, refreshToken };
}

// APPROACH 2: Token denylist (revocation list)
//   Maintain set of revoked token JTIs (JWT IDs) until expiry
const denylist = new Set();  // Redis in production

function revokeToken(token) {
  const { jti, exp } = jwt.decode(token);
  denylist.add(jti);
  // Schedule removal at exp time
  setTimeout(() => denylist.delete(jti), (exp * 1000) - Date.now());
}

function verifyToken(token) {
  const claims = jwt.verify(token, publicKey, { algorithms: ['ES256'] });
  if (denylist.has(claims.jti)) throw new Error('revoked');
  return claims;
}

// APPROACH 3: User-version check (force-logout-all-sessions)
//   Each user has a 'token_version' integer. JWT includes it.
//   Increment to invalidate ALL of that user's tokens.
function verifyTokenWithVersion(token) {
  const claims = jwt.verify(token, publicKey, { algorithms: ['ES256'] });
  const user = await db.users.findOne({ id: claims.sub });
  if (user.tokenVersion !== claims.ver) throw new Error('user logged out elsewhere');
  return claims;
}`,
        note: "Approach 1 (short expiry + refresh) is the most common. Approach 2 (denylist) requires hitting a store on every request — defeats some of JWT's stateless appeal but enables per-token revocation. Approach 3 (version) is great for 'log out everywhere' on password change."
      },
    ],
  },
  kms: {
    label: 'Key Management',
    icon: '⊞',
    snippets: [
      {
        id: 'envelope-aws',
        title: 'Envelope encryption with AWS KMS',
        desc: "The pattern every cloud app uses for encrypting data at rest.",
        code: `// npm install @aws-sdk/client-kms
import { KMSClient, GenerateDataKeyCommand, DecryptCommand } from '@aws-sdk/client-kms';
import crypto from 'crypto';

const kms = new KMSClient({ region: 'us-east-1' });
const MASTER_KEY_ID = 'arn:aws:kms:us-east-1:...:key/...';  // your KMS key

// ENCRYPT
async function encrypt(plaintext) {
  // 1. Ask KMS for a fresh data key (returns plaintext + encrypted versions)
  const { Plaintext: dataKey, CiphertextBlob: encryptedDataKey } = await kms.send(
    new GenerateDataKeyCommand({
      KeyId: MASTER_KEY_ID,
      KeySpec: 'AES_256',
    })
  );

  // 2. Use the plaintext data key to encrypt the data
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', dataKey, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  // 3. Zero the plaintext data key from memory ASAP
  dataKey.fill(0);

  // 4. Store: encrypted_data_key + iv + tag + ciphertext (NOT the master key)
  return {
    encryptedDataKey,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
  };
}

// DECRYPT
async function decrypt({ encryptedDataKey, iv, tag, ciphertext }) {
  // 1. KMS decrypts the data key — returns plaintext data key
  const { Plaintext: dataKey } = await kms.send(
    new DecryptCommand({ CiphertextBlob: encryptedDataKey })
  );

  // 2. Use it to decrypt the actual data
  const decipher = crypto.createDecipheriv('aes-256-gcm', dataKey, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final()
  ]);

  // 3. Zero the data key
  dataKey.fill(0);

  return plaintext.toString('utf8');
}`,
        note: "Envelope encryption: KMS encrypts your Data Encryption Keys (DEKs); DEKs encrypt your data. The master key never leaves KMS. Each record can have its own DEK — bulk re-encryption of millions of records doesn't require re-encrypting data; just re-wrap DEKs. AWS KMS bills per API call so most apps cache the DEK briefly."
      },
      {
        id: 'vault-secrets',
        title: 'HashiCorp Vault for secrets',
        desc: "Self-hosted secrets engine. Used by everyone running their own infrastructure.",
        code: `# Store a secret
vault kv put secret/myapp/prod \\
    db_password='hunter2' \\
    api_key='sk_live_...'

# Read it
vault kv get secret/myapp/prod
vault kv get -field=db_password secret/myapp/prod

# Dynamic database credentials (Vault generates user/pass on demand)
vault read database/creds/readonly
#  Key                Value
#  lease_id           database/creds/readonly/abc...
#  lease_duration     1h
#  username           v-token-readonly-x9j2
#  password           A1b2C3d4E5...
# (rotates automatically; auto-revoked after lease)

# Transit engine — encryption as a service
vault write transit/encrypt/myapp plaintext=$(echo "secret data" | base64)
# Returns ciphertext you store. To decrypt:
vault write transit/decrypt/myapp ciphertext=vault:v1:abc...

# Application code (Node, using node-vault):
import vault from 'node-vault';
const client = vault({ endpoint: process.env.VAULT_ADDR, token: process.env.VAULT_TOKEN });

const dbCreds = await client.read('database/creds/readonly');
const conn = await db.connect({ user: dbCreds.data.username, password: dbCreds.data.password });

// Encrypt as a service (no key handling in app)
const enc = await client.write('transit/encrypt/myapp', { plaintext: Buffer.from('secret').toString('base64') });
const dec = await client.write('transit/decrypt/myapp', { ciphertext: enc.data.ciphertext });`,
        note: "Vault's killer features beyond static secrets: (1) dynamic creds — DB user/pass generated on demand, expires after lease; (2) transit engine — encryption as a service, app never sees the keys; (3) PKI engine — internal CA with short-lived certs. Auth: AppRole, Kubernetes service accounts, JWT, cloud IAM."
      },
      {
        id: 'env-vars',
        title: 'Secrets in env vars — when KMS is overkill',
        desc: "Smaller apps: env vars + secret files. Not as secure as KMS but acceptable for low-stakes systems.",
        code: `# .env.production (NEVER commit this; add to .gitignore)
SESSION_SECRET=AbCdEf1234567890+random+32+bytes+base64
JWT_PRIVATE_KEY_PATH=/etc/myapp/jwt.pem
DB_URL=postgres://user:pass@host:5432/db
SENTRY_DSN=...

# .env.example (commit this — same keys, no values)
SESSION_SECRET=
JWT_PRIVATE_KEY_PATH=
DB_URL=
SENTRY_DSN=

# Loading in Node.js
import dotenv from 'dotenv';
dotenv.config({ path: '/etc/myapp/.env' });

// Validate at startup — fail loud, don't run with missing secrets
const required = ['SESSION_SECRET', 'JWT_PRIVATE_KEY_PATH', 'DB_URL'];
for (const k of required) {
  if (!process.env[k]) throw new Error(\`Missing env var: \${k}\`);
}
if (process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET too short — need 32+ chars random');
}

# Permissions on env file
chmod 600 /etc/myapp/.env
chown myapp:myapp /etc/myapp/.env

# systemd unit: EnvironmentFile=/etc/myapp/.env
# Docker: docker run --env-file=/etc/myapp/.env

# Rotation: deploy new env file + restart service.
# git-tracked .env.example documents what's needed without leaking values.`,
        note: "Env vars are fine for solo apps + small teams. The risks: env vars visible in process listings (ps aux) on some systems, written to crash dumps, leaked in error reporting. As you scale: graduate to AWS Parameter Store, Vault, or cloud secret managers. Never commit env files; use Git secret scanning to catch mistakes."
      },
    ],
  },
  tls: {
    label: 'TLS & Certs',
    icon: '⛨',
    snippets: [
      {
        id: 'lets-encrypt-caddy',
        title: "Caddy + Let's Encrypt — automatic HTTPS",
        desc: "The simplest path to production TLS. Zero config; Caddy gets + renews certs.",
        code: `# Caddyfile — minimal HTTPS reverse proxy
example.com {
    reverse_proxy localhost:3000
}

# That's literally it.
# Caddy will:
#   - Get a Let's Encrypt cert on first HTTPS request
#   - Renew automatically before expiry (90-day cert; renew at 60)
#   - Redirect HTTP → HTTPS
#   - Use TLS 1.3 with sane defaults
#   - Enable HTTP/2 and HTTP/3
#   - Set strong security headers if you ask

# With explicit HSTS + security headers
example.com {
    reverse_proxy localhost:3000
    header {
        Strict-Transport-Security "max-age=63072000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }
}

# Run
caddy run --config Caddyfile

# Test cert renewal
caddy reload
journalctl -u caddy -f`,
        note: "Caddy is the right answer for 90% of TLS use cases. nginx + certbot works but requires more config. For production HTTPS in 2026: Caddy if starting fresh, Caddy or nginx if maintaining existing. Don't manage certs manually."
      },
      {
        id: 'mtls',
        title: 'mTLS — mutual TLS for services',
        desc: "Service-to-service auth without shared secrets. Identity in the cert.",
        code: `# Generate internal CA
openssl req -x509 -newkey ed25519 -days 3650 -nodes \\
    -keyout ca-key.pem -out ca-cert.pem \\
    -subj "/CN=Internal CA"

# Server cert (signed by CA)
openssl req -newkey ed25519 -nodes \\
    -keyout server-key.pem -out server.csr \\
    -subj "/CN=api.internal.example.com"
openssl x509 -req -in server.csr -CA ca-cert.pem -CAkey ca-key.pem \\
    -CAcreateserial -out server-cert.pem -days 365

# Client cert (one per service)
openssl req -newkey ed25519 -nodes \\
    -keyout client-key.pem -out client.csr \\
    -subj "/CN=worker-service"
openssl x509 -req -in client.csr -CA ca-cert.pem -CAkey ca-key.pem \\
    -CAcreateserial -out client-cert.pem -days 365

# nginx server config requiring client cert
server {
    listen 443 ssl;
    server_name api.internal.example.com;
    ssl_certificate     server-cert.pem;
    ssl_certificate_key server-key.pem;
    ssl_client_certificate ca-cert.pem;
    ssl_verify_client on;          # REQUIRE client cert
    location / {
        proxy_set_header X-Client-CN $ssl_client_s_dn;
        proxy_pass http://localhost:8080;
    }
}

# curl with client cert
curl --cert client-cert.pem --key client-key.pem https://api.internal.example.com/

# In production: use Vault PKI, step-ca, or smallstep for short-lived certs
# Short-lived (1 hour) certs + auto-renewal = no revocation headaches`,
        note: "mTLS is the gold standard for service-to-service auth: no shared secrets, automatic rotation via cert renewal, identity in the cert. Service meshes (Istio, Linkerd, Consul Connect) automate this. For internal services: your own CA. For mTLS to external partners: usually still a private CA, with manual cert exchange."
      },
      {
        id: 'cert-pinning',
        title: 'Certificate pinning (carefully)',
        desc: "Mobile + critical apps can pin certs. Pin to public key, not the cert itself.",
        code: `// Pin to the PUBLIC KEY hash, not the certificate
// Certs change (renewal); public keys can stay stable across renewals

// Generate pin from a cert
// openssl x509 -in cert.pem -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl base64

// Pinning in iOS (URLSession)
class PinningDelegate: NSObject, URLSessionDelegate {
    let expectedPins: [String] = [
        "AAAA...",  // Primary key pin (base64 sha256 of pubkey)
        "BBBB...",  // BACKUP key pin (so you can rotate without bricking app)
    ]

    func urlSession(_ session: URLSession,
                    didReceive challenge: URLAuthenticationChallenge,
                    completionHandler: @escaping (URLSession.AuthChallengeDisposition, URLCredential?) -> Void) {
        guard let serverTrust = challenge.protectionSpace.serverTrust else { ... }
        // Verify pin matches
        // [extract pubkey hash from serverTrust, check against expectedPins]
    }
}

// Pinning in Android (OkHttp)
val pinner = CertificatePinner.Builder()
    .add("api.example.com", "sha256/AAAA...")
    .add("api.example.com", "sha256/BBBB...")  // backup
    .build()
val client = OkHttpClient.Builder().certificatePinner(pinner).build()`,
        note: "Pinning is powerful + dangerous. Wrong: pin the cert (rotates every 90 days, ships dead app on rotation). Right: pin the public key + have backup pins. Even better: HPKP-style pinning with multiple pins, monitor expiration, plan rotation. Most apps DON'T need pinning. Save for high-stakes scenarios."
      },
    ],
  },
  random: {
    label: 'Random',
    icon: '⊜',
    snippets: [
      {
        id: 'csprng-usage',
        title: 'CSPRNG — when and how',
        desc: "ANY value that must be unpredictable: keys, nonces, salts, tokens, session IDs.",
        code: `// Node.js — built-in
import crypto from 'crypto';

const sessionToken = crypto.randomBytes(32).toString('hex');     // 64 hex chars
const apiKey = 'sk_' + crypto.randomBytes(24).toString('base64url');
const nonce = crypto.randomBytes(12);                            // for AES-GCM
const passwordResetToken = crypto.randomUUID();                  // UUIDv4

// Python
import secrets, os
session_token = secrets.token_hex(32)         # 64 hex chars
api_key = 'sk_' + secrets.token_urlsafe(24)
nonce = os.urandom(12)
reset_token = secrets.token_urlsafe(32)

# WRONG — DO NOT USE FOR ANYTHING SECURITY-SENSITIVE:
import random
bad_token = random.randint(0, 10**16)         # PSEUDO-random, predictable

// Browser (Web Crypto)
const buf = new Uint8Array(32);
crypto.getRandomValues(buf);                  // fills with CSPRNG bytes
const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');

// Go
import "crypto/rand"
b := make([]byte, 32)
rand.Read(b)
hex := fmt.Sprintf("%x", b)

// Rust
use rand::Rng;
use rand::rngs::OsRng;
let token: [u8; 32] = OsRng.gen();`,
        note: "Math.random() (JS), random.random() (Python), Math.Random (most languages) are PSEUDO-random — predictable from seed. Use the CSPRNG primitive: crypto.randomBytes / crypto.getRandomValues / secrets.token_* / os.urandom / crypto/rand. The CSPRNG draws from OS entropy (kernel /dev/urandom)."
      },
      {
        id: 'nonce-strategies',
        title: 'Nonce + IV generation strategies',
        desc: "Random vs counter. The choice depends on threat model + ops complexity.",
        code: `// STRATEGY 1: Random 96-bit nonce per encryption
//   Pros: Stateless, parallel-safe, works for any number of messages up to ~2^32 per key
//   Cons: 1 in 2^96 chance of collision; vanishingly small but non-zero
//   Use for: most app encryption, TLS, file encryption

const nonce = crypto.randomBytes(12);
const ciphertext = encrypt(key, nonce, plaintext);
// Store nonce + ciphertext + tag together

// STRATEGY 2: Counter-based nonce
//   Pros: Provably no collision (within counter range)
//   Cons: Requires persistent counter; loses safety on rollback / replay
//   Use for: protocols where you control counter state reliably

let counter = await db.getNonce();
const nonce = Buffer.alloc(12);
nonce.writeBigUInt64BE(BigInt(counter), 4);  // last 8 bytes = counter
const ciphertext = encrypt(key, nonce, plaintext);
await db.incrementNonce();

// STRATEGY 3: Random + Counter hybrid (XChaCha20)
//   XChaCha20 has a 192-bit nonce — large enough that random is provably safe
//   Use for: protocols where you can't trust counter state (distributed systems)

const nonce = crypto.randomBytes(24);  // 192 bits
// Use XChaCha20-Poly1305 from libsodium

// COMMON BUG: rotating in development with same key
// If you regenerate the encryption key in dev (loses counter state) and reuse
// nonce 1, 2, 3... you've reused nonces with the same key. AEAD broken.
// Fix: regenerate key with counter, or always use random nonces.`,
        note: "Random nonces are safe up to ~2^32 messages PER KEY for 96-bit nonces. Rotate keys before this limit. XChaCha20-Poly1305 (192-bit nonce, libsodium) removes nonce-collision concerns entirely — preferred for systems where you can't control counter state. AES-GCM with random nonces is fine for typical apps."
      },
    ],
  },
  pqc: {
    label: 'Post-Quantum',
    icon: '∞',
    snippets: [
      {
        id: 'pqc-inventory',
        title: 'Crypto inventory — first step toward PQC',
        desc: "Before migrating, find every place you use classical crypto. The migration starts with an audit.",
        code: `# Codebase scan for classical algorithm usage
# Mark each finding: critical (long-term data), high (network), low (already short-lived)

# Look for:
grep -rn 'RSA\\|rsa\\|ecdsa\\|ecdh\\|ed25519' src/

# In package files:
cat package.json | grep -E 'rsa|jws|jose|jsonwebtoken'
cat requirements.txt | grep -E 'cryptography|pyjwt|ecdsa'

# TLS in production
openssl s_client -connect api.example.com:443 -tls1_3
# Look at: key exchange (X25519, P-256), cert algorithm (RSA, ECDSA)

# Database — what's encrypted with what?
SELECT column_name, data_type FROM information_schema.columns
WHERE column_name ILIKE '%encrypted%' OR column_name ILIKE '%cipher%';

# Cert audit — every internal CA, every issued cert
for cert in /etc/ssl/certs/*.pem; do
    echo "=== $cert ==="
    openssl x509 -in "$cert" -text -noout | grep -E 'Algorithm|Public Key'
done

# Vault PKI
vault list pki/issuers
vault read pki/issuer/default

# Cloud KMS — what algorithms are your keys?
aws kms describe-key --key-id ...
aws kms list-aliases  # find all your keys

# Build a spreadsheet:
# | Location | Algorithm | Key size | Data lifetime | PQC plan |
# Tabular result is your migration roadmap.`,
        note: "PQC migration is a 5-10 year project for most orgs. Step 1: inventory. Step 2: crypto-agility (abstract algorithm choice). Step 3: hybrid deployment as libraries mature. Step 4: pure PQC. CNSA 2.0 deadline Jan 2027 only applies to US federal — most apps have time, but the inventory work starts NOW."
      },
      {
        id: 'liboqs-intro',
        title: 'liboqs — Open Quantum Safe',
        desc: "The de-facto library for experimenting with PQC. ML-KEM, ML-DSA, SLH-DSA, hybrid TLS.",
        code: `# Install (Ubuntu/Debian)
sudo apt install liboqs-dev

# Or build from source — github.com/open-quantum-safe/liboqs

# Python binding
pip install pyoqs   # or liboqs-python

# Generate ML-KEM keypair + encapsulate (key agreement)
from oqs import KeyEncapsulation

with KeyEncapsulation('ML-KEM-768') as kem:
    public_key = kem.generate_keypair()

    # Sender side: encapsulate against public key
    ciphertext, shared_secret_sender = kem.encap_secret(public_key)

    # Recipient side: decapsulate using private key (held internally)
    shared_secret_recipient = kem.decap_secret(ciphertext)

    assert shared_secret_sender == shared_secret_recipient

# ML-DSA signature
from oqs import Signature
with Signature('ML-DSA-65') as sig:
    public_key = sig.generate_keypair()
    signature = sig.sign(b'message')
    is_valid = sig.verify(b'message', signature, public_key)

# Hybrid TLS — combine X25519 + ML-KEM (defense in depth)
# Most modern setups: oqs-provider for OpenSSL 3.x
# Enables 'hybrid' cipher suites in TLS:
#   X25519MLKEM768 — key exchange uses BOTH; session secure if either holds`,
        note: "Open Quantum Safe (open-quantum-safe.org) is the umbrella project. liboqs implements all current PQC algorithms; oqs-provider plugs into OpenSSL 3.x. For production: AWS KMS supports ML-DSA already; Microsoft SymCrypt ships ML-KEM + ML-DSA across Azure + Windows Server 2025 (since Nov 2025 update)."
      },
      {
        id: 'crypto-agility',
        title: 'Crypto-agility — designing for migration',
        desc: "Abstract algorithm choices so swapping doesn't require code changes.",
        code: `// BAD — algorithm hardcoded everywhere
function signRelease(release) {
  return crypto.sign('sha256', release, rsaPrivateKey);
}

// GOOD — algorithm via config; swap by changing config + key
const SIGNING = {
  algorithm: process.env.SIGN_ALGO || 'ed25519',  // can flip to 'ml-dsa' later
  key: loadKey(process.env.SIGN_KEY_PATH),
};

function signRelease(release) {
  return signers[SIGNING.algorithm].sign(release, SIGNING.key);
}

const signers = {
  ed25519: { sign: (msg, key) => crypto.sign(null, msg, key) },
  rsa: { sign: (msg, key) => crypto.sign('sha256', msg, key) },
  'ml-dsa': { sign: (msg, key) => mldsa.sign(msg, key) },  // when liboqs available
};

// HYBRID PATTERN — sign with TWO algorithms
// Defense: if either is broken later, the other still validates
function hybridSign(message) {
  return {
    ed25519: crypto.sign(null, message, edKey),
    mldsa: mldsa.sign(message, mldsaKey),
  };
}

function hybridVerify(message, sigs) {
  // Both must verify (require both — stricter)
  // Or at least one must verify (transitional — looser)
  return crypto.verify(null, message, edPubKey, sigs.ed25519)
      && mldsa.verify(message, sigs.mldsa, mldsaPubKey);
}

// FILE FORMATS — version your encryption blobs
// "v1-aes-gcm:nonce|tag|ciphertext"
// "v2-xchacha20-poly1305:nonce|ciphertext"
// "v3-hybrid-aes-mlkem:..."
// Code branches on version prefix; old data stays decryptable forever.`,
        note: "Crypto-agility is the meta-skill: design so today's choices don't become tomorrow's emergency. Version your encrypted blobs. Configure algorithms. Build interfaces that hide the primitive. The next PQC migration will be 10x easier if this groundwork exists."
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function CryptoAtlas() {
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

  const Code = ({ children, id, lang = 'js' }) => (
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
      info: { border: 'border-emerald-300/40', bg: 'bg-emerald-300/5', text: 'text-emerald-200', label: 'NOTE' },
      warn: { border: 'border-red-400/50', bg: 'bg-red-400/5', text: 'text-red-300', label: 'GOTCHA' },
      tip: { border: 'border-fuchsia-400/40', bg: 'bg-fuchsia-400/5', text: 'text-fuchsia-200', label: 'TIP' },
      you: { border: 'border-amber-300/40', bg: 'bg-amber-300/5', text: 'text-amber-200', label: 'FOR YOUR STACK' },
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
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-emerald-300' : 'text-zinc-300'}`}
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-emerald-300 border-emerald-300' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-emerald-300 bg-emerald-300/10 text-emerald-200' :
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
        className="border-b border-dotted border-emerald-300/60 text-emerald-200 hover:text-emerald-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-emerald-300 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* Crypto architecture diagram — app down through primitives */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap a layer · app ↓ high-level lib ↓ primitives + keys ↓ hardware
        </div>
        <svg viewBox="0 0 330 220" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="cyarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          <line x1="165" y1="46" x2="165" y2="58" stroke="#52525b" markerEnd="url(#cyarr)" />
          <line x1="165" y1="86" x2="165" y2="98" stroke="#52525b" markerEnd="url(#cyarr)" />
          <line x1="165" y1="126" x2="110" y2="138" stroke="#52525b" markerEnd="url(#cyarr)" />
          <line x1="165" y1="126" x2="220" y2="138" stroke="#52525b" markerEnd="url(#cyarr)" />
          <line x1="110" y1="166" x2="165" y2="178" stroke="#52525b" markerEnd="url(#cyarr)" />
          <line x1="220" y1="166" x2="165" y2="178" stroke="#52525b" markerEnd="url(#cyarr)" />
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
          <div className="mt-2 border border-emerald-300/30 bg-emerald-300/5 p-3 text-[13px]">
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

  /* ─── SANDBOX: REAL crypto via SubtleCrypto API ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('challenges');
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];

    const [freeOp, setFreeOp] = useState('hash');
    const [freeHashAlg, setFreeHashAlg] = useState('SHA-256');
    const [freeInput, setFreeInput] = useState('hello');
    const [freePbkdfIter, setFreePbkdfIter] = useState(100000);

    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [running, setRunning] = useState(false);

    const [aesKey, setAesKey] = useState(null);
    const [aesKeyHex, setAesKeyHex] = useState('');
    const [ciphertextHex, setCiphertextHex] = useState('');
    const [ivHex, setIvHex] = useState('');
    const [sigKeyPair, setSigKeyPair] = useState(null);
    const [signatureHex, setSignatureHex] = useState('');

    useEffect(() => {
      setOutput(null); setError(null); setTestResult(null);
    }, [challengeIdx, mode]);

    const bytesToHex = (bytes) => Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('');
    const hexToBytes = (hex) => {
      const out = new Uint8Array(hex.length / 2);
      for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
      return out;
    };

    const opHash = async (text, alg = 'SHA-256') => {
      const data = new TextEncoder().encode(text);
      const hashBuf = await crypto.subtle.digest(alg, data);
      return bytesToHex(hashBuf);
    };

    const opGenAesKey = async () => {
      const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
      const raw = await crypto.subtle.exportKey('raw', key);
      const hex = bytesToHex(raw);
      setAesKey(key); setAesKeyHex(hex);
      return hex;
    };

    const opEncrypt = async (plaintext) => {
      if (!aesKey) throw new Error("No AES key yet — run challenge 3 first.");
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, new TextEncoder().encode(plaintext));
      const ctHex = bytesToHex(ct);
      const ivH = bytesToHex(iv);
      setCiphertextHex(ctHex); setIvHex(ivH);
      return { iv: ivH, ciphertext: ctHex, tag: '(included in ciphertext: last 16 bytes)' };
    };

    const opDecrypt = async () => {
      if (!aesKey || !ciphertextHex || !ivHex) throw new Error("Need to encrypt first (challenges 3 + 4).");
      const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: hexToBytes(ivHex) }, aesKey, hexToBytes(ciphertextHex));
      return new TextDecoder().decode(pt);
    };

    const opTamper = async () => {
      if (!aesKey || !ciphertextHex || !ivHex) throw new Error("Need ciphertext (challenges 3 + 4).");
      const ct = hexToBytes(ciphertextHex);
      ct[0] ^= 0x01;
      try {
        await crypto.subtle.decrypt({ name: 'AES-GCM', iv: hexToBytes(ivHex) }, aesKey, ct);
        return { tampered: true, decryptResult: "UNEXPECTED" };
      } catch (e) {
        return { tampered: true, decryptResult: "AEAD detected tampering. Decryption REJECTED (correct)." };
      }
    };

    const opGenSig = async (message) => {
      const keyPair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
      const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, keyPair.privateKey, new TextEncoder().encode(message));
      const sigHex = bytesToHex(sig);
      const pubKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
      setSigKeyPair(keyPair); setSignatureHex(sigHex);
      return {
        signature: sigHex,
        publicKey: { x: pubKey.x.slice(0, 16) + '...', y: pubKey.y.slice(0, 16) + '...', curve: pubKey.crv }
      };
    };

    const opVerify = async () => {
      if (!sigKeyPair || !signatureHex) throw new Error("Run challenge 7 first.");
      const msg = 'authentic message';
      const sigBytes = hexToBytes(signatureHex);
      const okOriginal = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, sigKeyPair.publicKey, sigBytes, new TextEncoder().encode(msg));
      const okTampered = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, sigKeyPair.publicKey, sigBytes, new TextEncoder().encode('authentic message!'));
      return {
        originalMessage: { msg, verified: okOriginal },
        tamperedMessage: { msg: 'authentic message!', verified: okTampered },
      };
    };

    const opHmac = async (text, secret) => {
      const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
      return bytesToHex(mac);
    };

    const opPbkdf2 = async (password, iterations) => {
      const t0 = performance.now();
      const baseKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, baseKey, 256);
      const t1 = performance.now();
      return { hash: bytesToHex(bits), iterations, salt: bytesToHex(salt), timeMs: Math.round(t1 - t0) };
    };

    const runChallenge = async () => {
      setRunning(true); setError(null); setTestResult(null); setOutput(null);
      try {
        let result, pass = false;
        if (challenge.op === 'hash') {
          result = await opHash(challenge.input, challenge.alg);
          pass = result === challenge.expected;
        } else if (challenge.op === 'genkey') {
          result = { keyHex: await opGenAesKey() };
          pass = result.keyHex.length === 64;
        } else if (challenge.op === 'encrypt') {
          result = await opEncrypt(challenge.plaintext);
          pass = !!result.ciphertext;
        } else if (challenge.op === 'decrypt') {
          result = { plaintext: await opDecrypt() };
          pass = result.plaintext === 'secret message';
        } else if (challenge.op === 'tamper') {
          result = await opTamper();
          pass = result.decryptResult.includes('REJECTED');
        } else if (challenge.op === 'sign') {
          result = await opGenSig(challenge.message);
          pass = !!result.signature;
        } else if (challenge.op === 'verify') {
          result = await opVerify();
          pass = result.originalMessage.verified && !result.tamperedMessage.verified;
        }
        setOutput(result);
        setTestResult({ pass });
      } catch (e) {
        setError('Error: ' + (e?.message || String(e)));
        setTestResult({ pass: false });
      }
      setRunning(false);
    };

    const runFreePlay = async () => {
      setRunning(true); setError(null); setOutput(null);
      try {
        if (freeOp === 'hash') {
          setOutput({ kind: 'hash', alg: freeHashAlg, input: freeInput, output: await opHash(freeInput, freeHashAlg) });
        } else if (freeOp === 'hmac') {
          setOutput({ kind: 'hmac', input: freeInput, output: await opHmac(freeInput, 'secret-key-demo') });
        } else if (freeOp === 'pbkdf2') {
          setOutput({ kind: 'pbkdf2', ...await opPbkdf2(freeInput, freePbkdfIter) });
        } else if (freeOp === 'random') {
          const bytes = crypto.getRandomValues(new Uint8Array(32));
          setOutput({ kind: 'random', hex: bytesToHex(bytes), base64: btoa(String.fromCharCode(...bytes)) });
        }
      } catch (e) {
        setError('Error: ' + (e?.message || String(e)));
      }
      setRunning(false);
    };

    const renderOutput = () => {
      if (!output) return null;
      if (mode === 'challenges' && challenge.op === 'hash') {
        return (
          <div className="px-3 py-3 space-y-1 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <div><span className="text-zinc-500">input:</span> <span className="text-zinc-200">{challenge.input}</span></div>
            <div><span className="text-zinc-500">alg:</span> <span className="text-zinc-200">{challenge.alg}</span></div>
            <div className="break-all"><span className="text-zinc-500">hash:</span> <span className="text-emerald-300">{output}</span></div>
          </div>
        );
      }
      return (
        <pre className="px-3 py-3 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {JSON.stringify(output, null, 2)}
        </pre>
      );
    };

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE CRYPTO · {mode === 'challenges' ? challenge.title : 'free play'}</span>
            <span className="text-emerald-300">●</span>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-emerald-300 text-emerald-300 bg-emerald-300/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => setMode('freeplay')} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-emerald-300 text-emerald-300 bg-emerald-300/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-emerald-300 text-emerald-300 bg-emerald-300/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
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

        {mode === 'freeplay' && (
          <div className="px-3 py-3 border-b border-zinc-800 space-y-2">
            <div className="flex gap-1 flex-wrap">
              {[
                { id: 'hash', label: 'Hash' },
                { id: 'hmac', label: 'HMAC' },
                { id: 'pbkdf2', label: 'PBKDF2' },
                { id: 'random', label: 'Random bytes' },
              ].map(o => (
                <button key={o.id} onClick={() => setFreeOp(o.id)}
                  className={`text-[11px] px-2 py-1 border ${freeOp === o.id ? 'border-emerald-300 text-emerald-300 bg-emerald-300/10' : 'border-zinc-700 text-zinc-500'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>{o.label}</button>
              ))}
            </div>
            {freeOp === 'hash' && (
              <div className="flex gap-2">
                <select value={freeHashAlg} onChange={e => setFreeHashAlg(e.target.value)}
                  className="bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'].map(a => <option key={a}>{a}</option>)}
                </select>
                <input value={freeInput} onChange={e => setFreeInput(e.target.value)} placeholder="input"
                  className="flex-1 bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
              </div>
            )}
            {freeOp === 'hmac' && (
              <input value={freeInput} onChange={e => setFreeInput(e.target.value)} placeholder="message"
                className="w-full bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
            )}
            {freeOp === 'pbkdf2' && (
              <div className="space-y-2">
                <input value={freeInput} onChange={e => setFreeInput(e.target.value)} placeholder="password"
                  className="w-full bg-black border border-zinc-800 text-zinc-100 px-2 py-1.5 text-[12px] outline-none focus:border-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }} />
                <div className="flex items-center gap-2 text-[12px] text-zinc-400" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  iterations:
                  <select value={freePbkdfIter} onChange={e => setFreePbkdfIter(parseInt(e.target.value))}
                    className="bg-black border border-zinc-800 text-zinc-100 px-2 py-1 outline-none focus:border-emerald-300">
                    {[1000, 10000, 100000, 600000, 1000000].map(n => <option key={n} value={n}>{n.toLocaleString()}</option>)}
                  </select>
                  <span className="text-zinc-600">(higher = slower = more secure)</span>
                </div>
              </div>
            )}
            {freeOp === 'random' && (
              <div className="text-[12px] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                Generates 32 cryptographically secure random bytes. Click run.
              </div>
            )}
          </div>
        )}

        <div className="px-3 py-2 border-b border-zinc-800">
          <button onClick={mode === 'challenges' ? runChallenge : runFreePlay} disabled={running}
            className="w-full border border-emerald-300 bg-emerald-300/10 text-emerald-200 px-3 py-2 text-[12px] font-bold hover:bg-emerald-300/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> {mode === 'challenges' ? 'Run + check' : 'Run'}</>}
          </button>
        </div>

        {(output || error) && (
          <div className="border-t border-zinc-800 bg-black">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-b border-zinc-800" style={{ fontFamily: 'JetBrains Mono, monospace' }}>RESULT</div>
            {error && (
              <pre className="px-3 py-2 text-[12px] text-red-300 whitespace-pre-wrap break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{error}</pre>
            )}
            {output && renderOutput()}
            {testResult && (
              <div className="border-t border-zinc-800 px-3 py-2">
                <div className={`text-[12px] flex items-center gap-2 ${testResult.pass ? 'text-emerald-300' : 'text-red-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {testResult.pass ? <Check size={14} /> : <X size={14} />}
                  {testResult.pass ? 'CHALLENGE PASSED' : 'NOT QUITE'}
                </div>
                {testResult.pass && challengeIdx < CHALLENGES.length - 1 && (
                  <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="mt-2 text-fuchsia-400 hover:text-fuchsia-300 underline text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                activeCat === c ? 'border-emerald-300 text-emerald-300 bg-emerald-300/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="text-emerald-300">{LIBRARY[c].icon}</span>
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
                  <span className="text-[10px] text-emerald-300 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                      <button onClick={() => copy(s.code, 'lib-' + s.id)} className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
                        {copied === 'lib-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'lib-' + s.id ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <code>{s.code}</code>
                    </pre>
                    {s.note && (
                      <div className="border-t border-zinc-900 px-3 py-2 text-[12px] text-zinc-400 italic leading-relaxed">
                        <span className="text-fuchsia-400 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
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
                  <span className={i === path.length - 1 ? 'text-emerald-300' : ''}>{p}</span>
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
              <div className="border-l-2 border-emerald-300 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-emerald-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-emerald-300 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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

  const exportCheatsheet = () => {
    let md = "# Crypto Atlas — Cheatsheet\n\n";
    md += "## Hash functions\n\n| Algorithm | Output | Status | Use |\n|---|---|---|---|\n";
    COMPARISONS.hashes.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Password hashing\n\n| Algorithm | GPU rate | Memory hard | OWASP 2026 |\n|---|---|---|---|\n";
    COMPARISONS.password_hashes.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Post-quantum (NIST 2024+)\n\n| Standard | Replaces | Basis | Status |\n|---|---|---|---|\n";
    COMPARISONS.pqc.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## Commands\n\n```bash\n";
    COMMANDS.forEach(c => { md += `# ${c.desc}\n${c.cmd}\n\n`; });
    md += "```\n\n## Resources\n\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crypto-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportLibrary = () => {
    let md = "# Crypto Atlas — Library\n\n";
    Object.entries(LIBRARY).forEach(([_, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => { md += `### ${s.title}\n${s.desc}\n\n\`\`\`\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`; });
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'crypto-atlas-library.md'; a.click();
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
      ...Object.entries(LIBRARY).flatMap(([_, c]) =>
        c.snippets.map(s => ({ kind: 'library', label: s.title, hint: `${c.label} - ${s.desc}` }))
      ),
    ];
    const ql = q.toLowerCase();
    const filtered = q ? items.filter(i => i.label.toLowerCase().includes(ql) || i.hint?.toLowerCase().includes(ql)) : items.slice(0, 24);
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 pt-20" onClick={() => setCmdOpen(false)}>
        <div className="max-w-lg w-full bg-zinc-950 border border-emerald-300/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-emerald-300" />
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
                  item.kind === 'chapter' ? 'text-emerald-300' :
                  item.kind === 'term' ? 'text-fuchsia-400' :
                  item.kind === 'library' ? 'text-amber-300' : 'text-cyan-300'
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
        <div className="max-w-md w-full bg-zinc-950 border border-emerald-300/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-emerald-300/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your crypto context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-emerald-300 hover:bg-emerald-300/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-emerald-300 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 1976">Public-key cryptography is invented</H2>
            <P>
              Whitfield Diffie and Martin Hellman published "New Directions in Cryptography" in 1976 — the first public description of public-key crypto. The Diffie-Hellman key exchange let two parties derive a shared secret over an insecure channel without ever having met. Cryptography stopped being about pre-shared secret keys.
            </P>
            <P>
              RSA followed in 1977 (Rivest, Shamir, Adleman at MIT) — the first practical public-key signature + encryption scheme. AES was standardized in 2001 (originally Rijndael by Daemen and Rijmen). ECC went mainstream in the 2000s. TLS 1.3 in 2018 modernized the web. Argon2 won the Password Hashing Competition in 2015.
            </P>
            <H2 num="◇ 2024">The post-quantum era begins</H2>
            <P>
              August 13, 2024: NIST published the first three finalized post-quantum cryptography standards after an 8-year evaluation process:
            </P>
            <div className="grid gap-2 my-3">
              <CheckItem id="pqc-203">FIPS 203 · ML-KEM (Module-Lattice Key Encapsulation Mechanism) — replaces RSA + ECDH for key exchange</CheckItem>
              <CheckItem id="pqc-204">FIPS 204 · ML-DSA (Module-Lattice Digital Signature Algorithm) — replaces RSA + ECDSA + Ed25519</CheckItem>
              <CheckItem id="pqc-205">FIPS 205 · SLH-DSA (Stateless Hash-Based DSA) — conservative hash-based signature fallback</CheckItem>
              <CheckItem id="pqc-206">FIPS 206 · FN-DSA (Falcon) — compact signatures, expected 2026</CheckItem>
              <CheckItem id="pqc-cnsa">CNSA 2.0 deadline: January 2027 — US National Security Systems must begin migration</CheckItem>
              <CheckItem id="pqc-aws">AWS rolled out hybrid PQC TLS to KMS, ACM, Secrets Manager in early 2026</CheckItem>
              <CheckItem id="pqc-ms">Microsoft SymCrypt ships ML-KEM + ML-DSA across Azure, Windows 11, Server 2025 (Nov 2025)</CheckItem>
              <CheckItem id="pqc-harvest">"Harvest now, decrypt later" — adversaries are recording encrypted traffic NOW to decrypt in 2034+</CheckItem>
            </div>
            <Callout kind="cite" title="THE 2026 RECKONING">
              This is the single biggest cryptographic transition in 30 years. Every system using RSA, ECDSA, Ed25519, X25519 — which is most of the internet — needs a migration plan. The deadline isn't 2027 for most apps; it's "before your data's confidentiality lifetime expires." Medical records, classified docs, anything sensitive for 10+ years — clock started in 2024.
            </Callout>
            <H2 num="◇ ARCH">The crypto stack</H2>
            <P>
              Production cryptography is a layer cake. Your app calls a high-level library (libsodium, age, browser SubtleCrypto, AWS KMS). The library combines primitives (AES, SHA-256, Curve25519, Argon2) safely. Primitives run on hardware (AES-NI, Secure Enclave, TPM).
            </P>
            <ArchDiagram />
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ HASH">One-way functions</H2>
            <P>
              A <Term>hash</Term> function takes any input and produces a fixed-size fingerprint. Three required properties: <strong>deterministic</strong> (same input → same output), <strong>fast</strong> (cheap to compute), <strong>one-way</strong> (can't reverse from output to input). Plus three security properties: preimage resistance, second-preimage resistance, collision resistance.
            </P>
            <ComparisonTable data={COMPARISONS.hashes} />
            <H2 num="◇ AVALANCHE">The avalanche effect</H2>
            <P>
              Strong hashes amplify input changes: changing ONE BIT of input produces ~50% different OUTPUT bits. Try it in the sandbox — hash "hello" vs "Hello". The outputs look completely unrelated, with no shared prefix or pattern. This is essential because hashes are used for integrity: tampering with one byte of a file must result in a visibly different hash.
            </P>
            <Code id="avalanche" lang="text">{`SHA-256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
SHA-256("Hello") = 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969
                   ^                                                                ^
                   completely different — no shared prefix or pattern`}</Code>
            <H2 num="◇ HMAC">HMAC — keyed authentication</H2>
            <P>
              A hash proves integrity for anyone with the original input. <Term>HMAC</Term> proves authenticity — that the message came from someone who knows a shared secret. Critical: HMAC(key, msg) is NOT the same as hash(key + msg). The naive concat is vulnerable to length-extension attacks on SHA-256.
            </P>
            <Code id="hmac">{`// Node.js
import crypto from 'crypto';
const key = crypto.randomBytes(32);
const mac = crypto.createHmac('sha256', key).update('message').digest('hex');
// 64-char hex string. Same message + key always produces same MAC.

// Verification
const expected = crypto.createHmac('sha256', key).update('message').digest('hex');
// Compare in CONSTANT TIME (prevent timing attacks):
const ok = crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(expected, 'hex'));`}</Code>
            <Callout kind="dont" title="ROLLING YOUR OWN MAC">
              hash(key + msg) is broken on SHA-256 (length extension). hash(msg + key) has its own subtleties. HMAC is provably secure and standardized. Always use HMAC, never improvise.
            </Callout>
            {QUIZZES.hash.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ SLOW">Slow is the entire point</H2>
            <P>
              Password hashing is the opposite of regular hashing. For file integrity, fast is good. For passwords, fast is catastrophic — attackers run billions of hashes per second on GPUs, brute-forcing weak passwords in minutes. Password hashes must be deliberately, painfully slow.
            </P>
            <ComparisonTable data={COMPARISONS.password_hashes} />
            <H2 num="◇ ARGON2">Argon2id — OWASP 2026 default</H2>
            <P>
              <Term>Argon2id</Term> won the Password Hashing Competition in 2015 + was standardized as RFC 9106 in 2021. Memory-hard: forces attackers to commit RAM, reducing GPU advantage from 5000x to ~3x. OWASP's 2026 recommended parameters: <Kbd>m=65536</Kbd> (64 MiB memory), <Kbd>t=3</Kbd> (3 iterations), <Kbd>p=1</Kbd> (1 thread).
            </P>
            <Code id="argon2-basic">{`// Node.js — npm install argon2
import argon2 from 'argon2';

const hash = await argon2.hash('user-password', {
  type: argon2.argon2id,
  memoryCost: 65536,    // 64 MiB
  timeCost: 3,
  parallelism: 1,
});
// $argon2id$v=19$m=65536,t=3,p=1$<salt>$<hash>
// Self-describing — algorithm, params, salt, hash all in one string

const ok = await argon2.verify(hash, 'user-password');   // true

// Python — pip install argon2-cffi
from argon2 import PasswordHasher
ph = PasswordHasher(memory_cost=65536, time_cost=3, parallelism=1)
hash_str = ph.hash('user-password')
ph.verify(hash_str, 'user-password')   # raises VerifyMismatchError if wrong`}</Code>
            <H2 num="◇ SALT">Salt + pepper</H2>
            <P>
              <Term>Salt</Term>: random, per-user, stored ALONGSIDE the hash (not secret). Defeats rainbow tables — even if 1000 users have password "hunter2", they get 1000 different hashes. Argon2id and bcrypt include the salt in their output format.
            </P>
            <P>
              <Term>Pepper</Term>: global secret, stored SEPARATELY from the database (env var, HSM, KMS). Added to every hash. If your DB is dumped but the app secret isn't, attackers can't brute-force at all.
            </P>
            <Code id="pepper">{`// Pepper added before hashing
import crypto from 'crypto';
const PEPPER = process.env.PASSWORD_PEPPER;  // 32+ random bytes, stored in env

function preprocess(password) {
  return crypto.createHmac('sha256', PEPPER).update(password).digest();
  // HMAC the password with pepper, THEN feed to Argon2id
}

const hash = await argon2.hash(preprocess('user-password'));
const ok = await argon2.verify(hash, preprocess('user-password'));

// If DB dumps + pepper safe → attacker has hashes but can't brute force
// If DB dumps + pepper leaks → attacker brute-forces normally (Argon2id still slows them)
// Pepper rotation is hard (have to re-hash all passwords); often deferred for years`}</Code>
            <Callout kind="dont" title="SHA-256 (OR FASTER) FOR PASSWORDS">
              SHA-256 hashes 10 billion times per second on a modern GPU. Even with salt, an 8-character password cracks in hours. <strong>The only acceptable password hashes are Argon2id, bcrypt, scrypt, or PBKDF2 (for FIPS compliance).</strong>
            </Callout>
            {stackData?.pw && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.pw}</Callout>}
            {QUIZZES.pw.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ SYM">Same key, both ways</H2>
            <P>
              <Term>Symmetric</Term> encryption uses the same key to encrypt and decrypt. Fast — modern AES with hardware acceleration runs at gigabytes per second. This is the workhorse: TLS payloads, disk encryption, file encryption, message encryption all use symmetric ciphers.
            </P>
            <ComparisonTable data={COMPARISONS.symmetric} />
            <H2 num="◇ AEAD">AEAD — confidentiality + integrity together</H2>
            <P>
              <Term>AEAD</Term> (Authenticated Encryption with Associated Data) combines encryption and authentication in one primitive. <strong>Use AEAD modes — AES-GCM or ChaCha20-Poly1305</strong>. They eliminate entire classes of bugs from manual encrypt-then-MAC constructions.
            </P>
            <Code id="aes-gcm">{`import crypto from 'crypto';

// Generate AES-256 key — store this in KMS / Vault, never in code
const key = crypto.randomBytes(32);

// ENCRYPT
const iv = crypto.randomBytes(12);                 // 96-bit nonce (GCM standard)
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
const tag = cipher.getAuthTag();                    // 16-byte authentication tag

// Store ALL THREE together: iv + tag + ciphertext
const stored = Buffer.concat([iv, tag, ciphertext]);

// DECRYPT
const iv2 = stored.slice(0, 12);
const tag2 = stored.slice(12, 28);
const ct2 = stored.slice(28);
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv2);
decipher.setAuthTag(tag2);
// If anything was tampered, .final() throws — AEAD's integrity guarantee
const plaintext = Buffer.concat([decipher.update(ct2), decipher.final()]).toString();`}</Code>
            <H2 num="◇ NONCE">Nonce discipline — never reuse</H2>
            <P>
              A <Term>nonce</Term> ("number used once") makes identical plaintexts produce different ciphertexts. AES-GCM has a CRITICAL vulnerability: reusing a nonce with the same key reveals XOR of plaintexts AND lets attackers forge auth tags. <strong>Random 96-bit nonces are safe up to 2^32 messages per key</strong>; rotate keys before that limit.
            </P>
            <Callout kind="dont" title="AES-ECB MODE">
              Electronic Codebook mode encrypts each block independently. Identical plaintext blocks → identical ciphertext blocks. Patterns LEAK through. The famous "ECB penguin" — the Linux Tux mascot is still visible after ECB encryption. Always use AEAD modes.
            </Callout>
            <Callout kind="dont" title="REUSING NONCES">
              <Kbd>encrypt(key, nonce_1, msg_A)</Kbd> + <Kbd>encrypt(key, nonce_1, msg_B)</Kbd> with the SAME nonce = catastrophic. Use random 96-bit nonces (safe via birthday bound) or a strict counter you can guarantee never repeats.
            </Callout>
            {stackData?.sym && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.sym}</Callout>}
            {QUIZZES.sym.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ KEYPAIR">Public + private</H2>
            <P>
              <Term>Asymmetric</Term> cryptography uses TWO keys per party — a public key (share freely) and a private key (guard with your life). Whatever the public key encrypts, only the private key can decrypt. Whatever the private key signs, the public key can verify. The asymmetry is mathematical, not just procedural.
            </P>
            <ComparisonTable data={COMPARISONS.asymmetric} />
            <H2 num="◇ USE">Three distinct uses</H2>
            <Code id="three-uses" lang="text">{`1. KEY EXCHANGE — establish a shared secret over an insecure channel
   X25519 (Diffie-Hellman on Curve25519) — TLS 1.3 standard
   Both parties: generate keypair, exchange public keys, derive shared secret
   The shared secret is then used for symmetric encryption (AES-GCM)

2. DIGITAL SIGNATURES — prove a message came from a specific key holder
   Ed25519 (modern default) or ECDSA P-256 (legacy)
   Signer: sign(privateKey, message) -> signature
   Verifier: verify(publicKey, message, signature) -> true / false

3. ENCRYPTION (rarely direct) — encrypt for a recipient whose public key you have
   RSA or hybrid (RSA wraps AES key, AES encrypts data)
   Used: PGP, age, JWE
   NOT used: real-time TLS (key exchange + symmetric is faster)`}</Code>
            <H2 num="◇ ED25519">Ed25519 — the modern default</H2>
            <P>
              For new signature use cases: Ed25519. Fast, deterministic (no nonce-reuse vulnerability), fixed parameters (no curve to misconfigure), small signatures (64 bytes), small keys (32 bytes). Used by SSH, age, Signal, Tor, modern systems generally.
            </P>
            <Code id="ed25519">{`import crypto from 'crypto';

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519');

// Sign
const sig = crypto.sign(null, Buffer.from('message'), privateKey);

// Verify
const ok = crypto.verify(null, Buffer.from('message'), publicKey, sig);  // true

// Export for storage / transmission
const privPem = privateKey.export({ format: 'pem', type: 'pkcs8' });
const pubPem = publicKey.export({ format: 'pem', type: 'spki' });

// Tampered message?
const tampered = crypto.verify(null, Buffer.from('mess4ge'), publicKey, sig);  // false`}</Code>
            <H2 num="◇ RSA">RSA — when compatibility forces it</H2>
            <P>
              RSA is still everywhere — TLS certificates, JWT RS256, PGP. It works fine; just slower + larger than ECC. RSA-2048 minimum for new use; RSA-4096 if you want defense margin. <strong>Use RSA-PSS padding for signatures</strong> (modern), not PKCS#1 v1.5 (legacy with known attack surface).
            </P>
            <Callout kind="dont" title="RSA TO ENCRYPT BULK DATA">
              RSA-2048 can encrypt ~245 bytes per operation. Slow. Real practice: <strong>hybrid encryption</strong> — random AES key encrypts the data; RSA encrypts the AES key. This is what TLS, PGP, age, JWE all do. "Asymmetric encrypts data directly" is a misconception.
            </Callout>
            {stackData?.asym && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.asym}</Callout>}
            {QUIZZES.asym.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ Q-DAY">The post-quantum reckoning</H2>
            <P>
              In 1994, Peter Shor showed that a sufficiently large quantum computer could break RSA, ECC, and Diffie-Hellman in polynomial time. <strong>Shor's algorithm is the threat.</strong> Grover's algorithm gives a quadratic speedup on brute-force search — effectively halving the key length of symmetric ciphers (AES-256 becomes ~128-bit secure, still safe with comfortable margin).
            </P>
            <P>
              We don't have a quantum computer of that scale yet. Most estimates say 2030s-2040s. But the threat model that makes this urgent is <strong>"harvest now, decrypt later"</strong>: adversaries are recording encrypted traffic today, betting on quantum decryption arriving within a decade. Any data sensitive for 10+ years is at risk NOW.
            </P>
            <ComparisonTable data={COMPARISONS.pqc} />
            <H2 num="◇ STANDARDS">NIST finalized August 2024</H2>
            <Code id="pqc-standards" lang="text">{`FIPS 203 — ML-KEM (Module-Lattice Key Encapsulation Mechanism)
  Replaces: RSA, ECDH for key exchange
  Based on: Module-LWE (Learning With Errors) lattice problem
  Parameter sets: ML-KEM-512 (Level 1), ML-KEM-768 (Level 3), ML-KEM-1024 (Level 5)
  Public key size: 1,184 bytes (ML-KEM-768) vs 256 bytes (RSA-2048)
  Tradeoff: bigger but quantum-safe

FIPS 204 — ML-DSA (Module-Lattice Digital Signature Algorithm)
  Replaces: RSA, ECDSA, Ed25519 for signatures
  Based on: Module-LWE
  Signature size: ~3.3 KB (ML-DSA-65) vs 64 bytes (Ed25519)

FIPS 205 — SLH-DSA (Stateless Hash-Based Digital Signature Algorithm)
  Conservative backup — based only on hash function security
  No lattice math, so survives any future lattice break
  Signature size: ~17 KB — large, used for code signing / firmware updates

FIPS 206 — FN-DSA (Falcon-based) — expected 2026
  Compact lattice signatures, ~700 bytes
  Complex implementation; for bandwidth-sensitive use cases`}</Code>
            <H2 num="◇ HYBRID">Hybrid is the migration pattern</H2>
            <P>
              "Hybrid" schemes combine classical (X25519, RSA) AND post-quantum (ML-KEM) algorithms in one protocol. If either is broken later, the OTHER still secures the session. AWS deployed hybrid TLS to KMS, ACM, Secrets Manager in early 2026. Microsoft SymCrypt ships ML-KEM + ML-DSA across Azure and Windows.
            </P>
            <Code id="hybrid-pattern">{`// Hybrid pattern — pseudocode for TLS-like handshake
function hybridKeyExchange() {
  // Each party generates BOTH keypairs
  const classical = generateX25519();
  const pq = generateMLKEM();

  // Exchange both public keys
  const peerClassical = receive();
  const peerPq = receive();

  // Derive shared secrets from BOTH
  const classicalSecret = X25519(classical.priv, peerClassical);
  const pqSecret = MLKEM.decap(pq.priv, peerPq);

  // Combine via KDF (HKDF) — IF EITHER survives, secret stays unknown
  return HKDF.derive(classicalSecret + pqSecret, 'tls-session-v1', 32);
}`}</Code>
            <Callout kind="cite" title="2026 LANDSCAPE">
              CNSA 2.0 mandates US National Security Systems begin migration by January 2027. Most commercial apps have years before urgent action — but the inventory + crypto-agility work starts NOW. Microsoft SymCrypt has ML-KEM/ML-DSA in production. AWS KMS supports ML-DSA. OpenSSL 3.x via oqs-provider supports the full suite.
            </Callout>
            {stackData?.pqc && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.pqc}</Callout>}
            {QUIZZES.pqc.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ TLS">Transport Layer Security — crypto in production</H2>
            <P>
              <Term>TLS</Term> is where all this crypto comes together at internet scale. TLS 1.3 (RFC 8446, 2018) is current — 94% of traffic in 2026. The Net Atlas covers the protocol details; this chapter focuses on the crypto-shaped pieces: certificates, ACME automation, mTLS, certificate pinning.
            </P>
            <P>
              A TLS handshake combines: key exchange (X25519 / ECDHE — soon hybrid with ML-KEM), authentication (server's certificate, signed by a CA), and a symmetric key derivation. After handshake, AES-GCM or ChaCha20-Poly1305 encrypts everything.
            </P>
            <H2 num="◇ CERTS">Certificates + ACME</H2>
            <P>
              A <Term>certificate</Term> binds a domain to a public key, signed by a <Term>CA</Term> the client trusts. Browsers ship with ~150 trusted root CAs. <Term>ACME</Term> (RFC 8555) automates certificate issuance + renewal. Let's Encrypt is the dominant ACME-compatible CA — free, 90-day certs, automated by certbot, Caddy, acme.sh.
            </P>
            <Code id="caddy-tls">{`# Caddyfile — automatic HTTPS, zero config
example.com {
    reverse_proxy localhost:3000
}

# Caddy will:
#   - Get Let's Encrypt cert on first HTTPS request
#   - Renew automatically before 90-day expiry
#   - Redirect HTTP -> HTTPS
#   - Use TLS 1.3 with sane defaults
#   - Enable HTTP/2 + HTTP/3`}</Code>
            <H2 num="◇ MTLS">mTLS — mutual authentication</H2>
            <P>
              In standard TLS, the client verifies the server. <Term>mTLS</Term> adds the reverse: server also requires a client certificate. Foundation of service-to-service auth without shared secrets. Service meshes (Istio, Linkerd, Consul Connect) automate this — short-lived certs (hours), auto-renewal, identity in the cert.
            </P>
            <Code id="mtls-pattern" lang="text">{`Internal architecture pattern:

  Internal CA (Vault PKI or step-ca)
      |
      +-- Issues cert to: service-A (CN=service-A)
      +-- Issues cert to: service-B (CN=service-B)

  service-A connects to service-B over TLS
  service-B requires client cert (mTLS)
  service-B verifies: signed by Internal CA + CN matches expected service
  No shared secrets. Identity is the cert.
  Cert lifetime: hours, not years. Auto-renewed.`}</Code>
            <Callout kind="dont" title="MANUALLY RENEWING TLS CERTS">
              Let's Encrypt + ACME automation has existed since 2016. If you're manually running certbot to renew, you're one missed reminder away from a global outage. Use Caddy, cert-manager (Kubernetes), or systemd timers for certbot. Monitor cert expiry as a metric.
            </Callout>
            <Callout kind="info" title="POINTER">
              The Net Atlas covers TLS handshakes, HTTPS, HTTP versions, and TLS 1.3 specifically. This chapter focuses on crypto-side concerns: certificates, key management, mTLS patterns.
            </Callout>
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ JWT">JSON Web Tokens — useful + footgun-prone</H2>
            <P>
              A <Term>JWT</Term> is a self-contained signed token. Three base64-encoded parts separated by dots: header (algorithm), payload (claims), signature. Common for stateless API auth. Common for vulnerabilities — the JWT spec includes "alg: none" which has been the source of countless CVEs.
            </P>
            <Code id="jwt-anatomy" lang="text">{`A JWT looks like this:
eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjE2OTk5OTk5OTl9.MEUCIQ...

Three base64-url-encoded sections (decode each part):

HEADER (alg, typ)
{"alg":"ES256","typ":"JWT"}

PAYLOAD (claims — registered + custom)
{
  "sub": "user-123",         # subject
  "iss": "https://api.x.com", # issuer
  "aud": "https://app.x.com", # audience
  "exp": 1699999999,          # expiration (unix time)
  "iat": 1699995399,          # issued at
  "jti": "abc-123",           # JWT ID (unique per token)
  "role": "admin"             # custom claim
}

SIGNATURE
Computed over base64(header) + "." + base64(payload)
Algorithm specified by header.alg`}</Code>
            <H2 num="◇ BUGS">The classic JWT footguns</H2>
            <ComparisonTable data={COMPARISONS.jwt_alts} />
            <Code id="jwt-safe">{`import jwt from 'jsonwebtoken';

// SAFE verification — explicit algorithm allowlist
function verifyToken(token) {
  return jwt.verify(token, publicKey, {
    algorithms: ['ES256'],         // CRITICAL — explicit list
                                    // Prevents alg=none AND alg-confusion attacks
    issuer: 'https://api.example.com',
    audience: 'https://app.example.com',
  });
}

// UNSAFE — let library "auto-detect" algorithm
function verifyToken_BAD(token) {
  return jwt.verify(token, publicKey);   // accepts whatever alg is in header
  // Attacker sends alg=none, no signature, library accepts
}`}</Code>
            <H2 num="◇ PASETO">PASETO — the no-footgun alternative</H2>
            <P>
              <Term>PASETO</Term> (Platform-Agnostic Security Tokens) was designed specifically to fix JWT's worst footguns. No algorithm field in tokens (version + purpose are baked into the format). No alg-confusion attacks possible. Modern primitives (XChaCha20-Poly1305, Ed25519). For new auth designs, consider PASETO before JWT.
            </P>
            <H2 num="◇ REVOKE">Revocation patterns</H2>
            <P>
              JWTs are stateless by design — but you need revocation in real systems. Three approaches: <strong>short-lived access tokens + revocable refresh tokens</strong> (most common), <strong>denylist of revoked JTIs in Redis</strong> (per-token revocation), <strong>user-version claim</strong> (force log-out-everywhere on password change). The Library has working code for all three.
            </P>
            <Callout kind="dont" title="alg=none ACCEPTANCE">
              jsonwebtoken v9+ and most modern libraries reject alg=none by default. But if you don't specify <Kbd>algorithms: ['ES256']</Kbd> explicitly, you might fall back to accepting whatever's in the header. Always pass an explicit algorithm allowlist.
            </Callout>
            <Callout kind="dont" title="JWT SECRETS IN CLIENT CODE">
              If the JWT signing secret is in JavaScript that runs in browsers, ANYONE can mint tokens. Use asymmetric algorithms (RS256, ES256, EdDSA) — client gets the PUBLIC key for verification only. The private key never leaves the server.
            </Callout>
            {stackData?.jwt && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.jwt}</Callout>}
            {QUIZZES.jwt.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">Production crypto patterns</H2>
            <P>
              Eight categories — password storage with Argon2id, symmetric encryption (AES-GCM, ChaCha20-Poly1305), asymmetric crypto (Ed25519, X25519, RSA), JWTs (safe verification, PASETO alternative, revocation), key management (KMS envelope encryption, Vault, env vars), TLS automation (Caddy, mTLS, cert pinning), random + nonces, and post-quantum migration patterns.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <button onClick={exportLibrary} className="flex items-center gap-2 border border-emerald-300 text-emerald-300 px-4 py-2 text-[13px] hover:bg-emerald-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <Library size={14} /> Download library.md
            </button>
            <H2 num="◇ DONT">Anti-patterns — crypto edition</H2>
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
            <H2 num="◇ LIVE">Real cryptography in your browser</H2>
            <P>
              The sandbox runs actual cryptographic operations via the <Term>SubtleCrypto</Term> API — the same one TLS uses under the hood. Eight challenges progress from hashing through AEAD encryption, tampering detection, ECDSA signatures, and signature verification.
            </P>
            <P>
              No server, no mocks. Everything happens in your browser, with the same primitives Signal, WhatsApp, and your browser's HTTPS use. The "free play" mode lets you experiment beyond the challenges — try PBKDF2 with different iteration counts and watch the time scale.
            </P>
            <Sandbox />
            <Callout kind="tip" title="EXPERIMENT WITH AVALANCHE">
              Switch to free play mode. Hash "hello" with SHA-256. Then hash "Hello" (capital H). Compare the outputs — completely different. Now try "hello1" vs "hello2". Same dramatic difference. This is the avalanche effect: one bit of input change cascades through the entire output.
            </Callout>
            <Callout kind="tip" title="WATCH PBKDF2 GET SLOWER">
              Free play → PBKDF2. Start with 1,000 iterations — fast (~1 ms). Try 100,000 — noticeable (~50 ms). Try 600,000 — slower (~300 ms). Try 1,000,000 — clearly slow (~500 ms). This is THE FEATURE: each iteration cost gets multiplied by every brute-force guess the attacker tries.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When crypto is the problem</H2>
            <P>
              Eight branches covering the most common crypto vulnerabilities + incidents — weak algorithms found in audit, token forgery, password hashing performance, TLS failures, timing attacks, key rotation, post-quantum prep, encrypting data at rest. Each branch has a 5-7 step debugging flow.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLKIT">The auditor's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'OWASP ZAP / Burp Suite', what: "Active scanning for crypto issues — weak TLS, missing headers, JWT bugs. ZAP is open source; Burp is the industry standard for paid pentesting." },
                { name: 'ssllabs.com/ssltest', what: "Free TLS configuration tester. Grades your HTTPS A+ → F. Catches weak ciphers, missing intermediates, HSTS issues, OCSP problems." },
                { name: 'securityheaders.com', what: "Audit HSTS, CSP, X-Frame-Options, etc. A+ in 10 minutes once you set the recommended headers." },
                { name: 'testssl.sh', what: "Command-line TLS testing tool. Deeper than ssllabs — checks specific vulnerabilities (BEAST, CRIME, BREACH, Lucky13, ROBOT, etc.)." },
                { name: 'mkcert', what: "Local development with valid TLS certs. Installs a local CA in your trust store. Save your sanity in dev." },
                { name: 'jwt.io debugger', what: "Decode + inspect JWTs. Verify signatures. See exactly what's in tokens. Note: paste tokens carefully — they contain secrets you can't unsee." },
                { name: 'cryptopals.com', what: "Solve 48 crypto challenges by BREAKING crypto. The single best way to build crypto intuition. Free, deep, takes months to work through." },
                { name: 'OWASP Cheat Sheet Series', what: "Practical reference for password storage, JWT security, cryptographic storage. The source of OWASP 2026 Argon2id recommendations." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-emerald-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ COMMANDS">Essential commands</H2>
            <div className="my-3 space-y-2">
              {COMMANDS.map((c, i) => (
                <div key={i} className="border border-zinc-800 px-3 py-2 text-[12px]">
                  <code className="text-emerald-300 block break-all" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{c.cmd}</code>
                  <div className="text-zinc-400 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <button onClick={copyAllCommands} className="flex items-center gap-2 border border-fuchsia-400 text-fuchsia-300 px-4 py-2 text-[13px] hover:bg-fuchsia-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                <div className="text-emerald-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
                <div className="text-zinc-500 text-[11px] uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono, monospace' }}>correct</div>
              </div>
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-fuchsia-400 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{missed.length}</div>
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
                      <div className="text-emerald-300 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A cryptography reading roadmap</H2>
            <P>
              For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1-2', plan: "Serious Cryptography by Aumasson (2nd ed, 2024) — chapters 1-6: encryption, randomness, cryptographic security, block ciphers, stream ciphers, hash functions." },
                { wk: 'Week 3-4', plan: "Solve Cryptopals Set 1 (cryptopals.com) — 8 challenges that teach by BREAKING crypto. Set 2 covers block ciphers + padding oracles. Brutal + clarifying." },
                { wk: 'Week 5-6', plan: "Real-World Cryptography by Wong — TLS internals, JWT, key management, blockchain crypto. Practical, code-heavy, what working engineers need." },
                { wk: 'Week 7-8', plan: "Set up production HTTPS yourself with Caddy or nginx + Let's Encrypt. Configure security headers. Test with ssllabs.com + securityheaders.com until A+." },
                { wk: 'Week 9-10', plan: "Build something with libsodium (or Web Crypto). Encrypt a file. Sign a manifest. Implement password hashing with Argon2id. Use the actual primitives." },
                { wk: 'Week 11+', plan: "Read NIST FIPS 203/204/205. Install liboqs. Experiment with ML-KEM hybrid key exchange. Build the muscle for the next decade's crypto." },
                { wk: 'Forever', plan: "Subscribe to filippo.io, Cloudflare Research, Latacora. Follow Twitter/X accounts of crypto researchers. The field moves; staying current is part of the discipline." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-emerald-300 pl-3 py-1">
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
                  <code className="text-fuchsia-400 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-emerald-300 text-emerald-300 px-4 py-2 text-[13px] hover:bg-emerald-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-fuchsia-400 text-fuchsia-300 px-4 py-2 text-[13px] hover:bg-fuchsia-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
              Cryptography is the math + engineering that makes everything else possible — authentication, confidentiality, integrity, identity. You've walked from Diffie-Hellman 1976 through the 2024 NIST PQC standards. Hashing, password storage, symmetric encryption, asymmetric keys, post-quantum migration, TLS, JWTs, and a working library + sandbox. The intuition compounds with use. Build something with libsodium. Solve Cryptopals. Set up production HTTPS. Read RFCs. The cryptography stack is the most consequential infrastructure in the world right now — January 2027 is closer than it sounds.
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
            <div className="text-emerald-300 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>⊕</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>CRYPTO</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-amber-300/40 text-amber-200 px-2 py-1 text-[11px] hover:bg-amber-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-emerald-300 hover:text-emerald-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-emerald-300 bg-emerald-300/10 text-emerald-300' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-emerald-300" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-emerald-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-emerald-300 text-emerald-300 bg-emerald-300/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-emerald-300 hover:text-emerald-300'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ⊕ · crypto atlas · grounded in NIST FIPS 203-205 + OWASP 2026 + RFC 9106
          </div>
        </div>
      </main>
    </div>
  );
}
