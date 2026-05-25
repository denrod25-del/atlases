import { useState, useEffect, useRef } from 'react';
import {
  Compass, Database, Layers, ArrowRight, Boxes, GitBranch, Activity,
  Package, Terminal, Wrench, BookOpen, Check, ChevronRight, ChevronLeft,
  Copy, X, Search, RotateCcw, Play, ArrowLeft, Quote, MousePointerClick,
  Loader2, Library, AlertTriangle, HardDrive, Key, Lock, Zap, Network,
  XCircle, Cpu
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   DB ATLAS · DATA
   ═══════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { id: 'origin', label: 'Origin', icon: Compass, num: '01', sub: "Codd 1970, SQL standardization, the NoSQL wave, the 2026 landscape." },
  { id: 'engines', label: 'Engines', icon: Database, num: '02', sub: "PostgreSQL, MySQL, SQLite, MongoDB, Redis, DuckDB, ClickHouse — pick the right one." },
  { id: 'relational', label: 'Relational', icon: Layers, num: '03', sub: "Tables, keys, normalization, ER modeling. The mental model behind every SQL database." },
  { id: 'sql', label: 'SQL', icon: Terminal, num: '04', sub: "SELECT, JOINs, GROUP BY, window functions, CTEs. The lingua franca." },
  { id: 'indexes', label: 'Indexes', icon: Zap, num: '05', sub: "B-tree, hash, GiST, GIN, partial, covering. EXPLAIN as your guide." },
  { id: 'tx', label: 'Transactions', icon: Lock, num: '06', sub: "ACID, isolation levels (the 4 phenomena), MVCC, locks, deadlocks." },
  { id: 'nosql', label: 'NoSQL', icon: Boxes, num: '07', sub: "Document, key-value, graph, time-series, vector, search. When SQL isn't the answer." },
  { id: 'distributed', label: 'Distributed', icon: Network, num: '08', sub: "CAP, PACELC, sharding, replication, leaderless quorums." },
  { id: 'library', label: 'Library', icon: Library, num: '09', sub: "Curated SQL recipes — schema, queries, indexing, migrations, JSON, vector." },
  { id: 'sandbox', label: 'Sandbox', icon: Play, num: '10', sub: "Real SQLite in your browser via sql.js. Pre-loaded sample database + 6 challenges." },
  { id: 'triage', label: 'Triage', icon: Wrench, num: '11', sub: "Slow queries, deadlocks, migration disasters, connection storms — decoded." },
  { id: 'atlas', label: 'Atlas', icon: BookOpen, num: '12', sub: "References, books, the database reading roadmap." },
];

const STACKS = [
  { id: 'backend', label: 'Backend / OLTP apps', desc: 'PostgreSQL, MySQL, Supabase, Neon — transactional workloads', icon: '◉' },
  { id: 'analytics', label: 'Analytics / OLAP', desc: 'DuckDB, ClickHouse, BigQuery — analytical queries, warehouses', icon: '∑' },
  { id: 'cache', label: 'Cache / real-time', desc: 'Redis, Memcached, KeyDB — in-memory, sub-ms latency', icon: '⚡' },
  { id: 'ai', label: 'AI / vector / search', desc: 'pgvector, Qdrant, Pinecone, Elasticsearch — embeddings and search', icon: '∴' },
  { id: 'fundamentals', label: 'Just learn the fundamentals', desc: 'SQL + relational thinking first', icon: '⛁' },
];

const GLOSSARY = {
  Relation: "Mathematical term for what most people call a table — a set of tuples sharing a schema. The R in 'RDBMS.' E.F. Codd's 1970 paper formalized this.",
  Tuple: "A single row in a table. Has values for each column defined by the schema. PostgreSQL still uses this term internally.",
  Schema: "Two meanings: (1) the structure of a table or database — columns, types, constraints; (2) a namespace inside a database (PostgreSQL: 'public' is the default schema).",
  "Primary key": "The column(s) uniquely identifying each row. Enforced UNIQUE + NOT NULL. Used as the default cluster key in InnoDB; just a unique index in PostgreSQL.",
  "Foreign key": "A column referencing another table's primary key. Enforces referential integrity — can't insert orphans, can't delete referenced rows without CASCADE.",
  "Composite key": "A primary or unique key made of multiple columns. (user_id, post_id) for likes. Order matters for indexes.",
  "Surrogate key": "An artificial PK (auto-increment integer, UUID) with no business meaning. Most apps use these. Stable across data changes — natural keys can shift.",
  "Natural key": "A PK using real-world data (email, SSN, ISBN). Self-documenting but risky: emails change, SSNs aren't unique enough, ISBNs get reissued.",
  Normalization: "Process of structuring tables to reduce redundancy. 1NF (atomic columns) → 2NF (no partial dependencies) → 3NF (no transitive dependencies) → BCNF. Most apps stop at 3NF.",
  Denormalization: "Deliberately duplicating data to improve read performance. Trade-off: faster reads, harder writes, possible inconsistency. Use after measuring.",
  ACID: "Atomicity, Consistency, Isolation, Durability — transaction guarantees. Atomicity: all-or-nothing. Consistency: constraints hold. Isolation: concurrent txns don't interfere. Durability: committed data survives crash.",
  "Isolation level": "How much one transaction can see of another's in-progress work. READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE. Each level prevents more phenomena (dirty read, non-repeatable read, phantom).",
  MVCC: "Multi-Version Concurrency Control. Writes don't block reads — each transaction sees a snapshot. PostgreSQL's core mechanism. Trade-off: bloat, requires VACUUM.",
  Vacuum: "PostgreSQL's process for reclaiming space from dead tuples (MVCC artifacts). autovacuum runs continuously; can be tuned. Wrong tuning is a top-3 PG production issue.",
  WAL: "Write-Ahead Log. Append-only file of all changes, written before applying to data files. Foundation of durability, replication, point-in-time recovery.",
  "B-tree": "The default index structure in most databases. Balanced tree, O(log n) lookup. Supports range scans (WHERE x > 5) and equality. Sorted iteration is free.",
  "Hash index": "O(1) equality lookup, no range support. Smaller than B-tree. PostgreSQL has them but B-tree is usually fine; MySQL InnoDB uses them internally as 'adaptive hash index.'",
  "GiST / GIN": "PostgreSQL specialized indexes. GIN for full-text + JSONB containment + arrays. GiST for geometric, range types, fuzzy text search. pg_trgm + GIN = fast LIKE '%foo%'.",
  "Covering index": "An index containing all columns referenced by a query — no table access needed. PostgreSQL: INCLUDE clause. Faster reads at the cost of larger index + slower writes.",
  "Partial index": "An index over only some rows — WHERE clause in CREATE INDEX. CREATE INDEX ON orders(user_id) WHERE status='pending'. Smaller, focused.",
  EXPLAIN: "Show the query planner's chosen execution plan. EXPLAIN ANALYZE runs the query and shows actual timings. The most important debugging tool in SQL databases.",
  "Query planner": "Component that chooses HOW to execute a query — which indexes, which join algorithm, which order. Uses table statistics. ANALYZE refreshes them.",
  "Sequential scan": "Read every row in a table. O(n). The right plan for small tables or when most rows match. Wrong plan for large tables with selective filters — usually means missing index.",
  "Index scan": "Walk an index to find matching rows, then fetch each from the table. Fast for selective queries. 'Index Only Scan' skips the table when the index covers the query.",
  "Nested loop": "Join algorithm: for each row in A, scan B looking for matches. Good when A is small. Bad when both large without an index on B.",
  "Hash join": "Join algorithm: build a hash table from the smaller side, probe with the larger. O(n+m). Default for large unsorted joins.",
  "Merge join": "Join algorithm: walk both sides in sort order, matching. Requires sorted input. Fast for already-sorted data or large equi-joins.",
  Sharding: "Horizontal partitioning across machines. Each shard holds a subset of rows (by user_id, region, hash). Increases capacity but adds complexity — cross-shard joins are hard.",
  Replication: "Copying data from a primary to one or more replicas. Async (eventually consistent) or sync (slower writes). Used for HA + read scaling.",
  CAP: "Consistency, Availability, Partition tolerance — pick two. Under network partition, you must choose: serve stale data (AP) or refuse to serve (CP). PostgreSQL is CP; Cassandra is AP.",
  PACELC: "Refinement of CAP: under Partition, choose A or C; Else, choose Latency or Consistency. More useful framework — most systems aren't partitioned most of the time.",
  OLTP: "Online Transaction Processing — many small reads/writes, low latency. Web apps. Tools: PostgreSQL, MySQL, SQL Server.",
  OLAP: "Online Analytical Processing — fewer queries scanning lots of data, aggregations. Reporting, BI. Tools: ClickHouse, DuckDB, BigQuery, Snowflake, Redshift.",
  ETL: "Extract, Transform, Load. Data movement from sources into a warehouse. Modern variant: ELT (load raw, transform in-warehouse) — enabled by cheap compute.",
  CTE: "Common Table Expression — a named subquery written with WITH. Improves readability. PostgreSQL: recursive CTEs (WITH RECURSIVE) enable graph traversal.",
  "Window function": "Computes a value per row using a 'window' of other rows: ROW_NUMBER(), RANK(), LAG(), LEAD(), running totals (SUM() OVER). The single most powerful SQL feature most devs underuse.",
  "Materialized view": "A view whose results are stored on disk. Fast reads, must be REFRESHed when underlying data changes. PostgreSQL supports them natively; MySQL doesn't.",
  Upsert: "INSERT OR UPDATE on conflict. PostgreSQL: INSERT ... ON CONFLICT (col) DO UPDATE. MySQL: INSERT ... ON DUPLICATE KEY UPDATE. SQLite: INSERT OR REPLACE.",
  "N+1 query": "Anti-pattern: 1 query to fetch a list + N more queries to fetch related data for each item. ORM default. Fix with eager loading or a single JOIN.",
  Embedding: "A dense numerical vector representing meaning. OpenAI's text-embedding-3-small produces 1536-dim vectors. Stored in vector DBs for similarity search.",
  "Cosine similarity": "Common similarity metric for embeddings — measures angle between vectors, ignoring magnitude. pgvector operator: <=>. Lower distance = more similar.",
  HNSW: "Hierarchical Navigable Small World — graph index for approximate nearest-neighbor (ANN) search. The dominant ANN algorithm for vector DBs. pgvector, Qdrant, FAISS all use it.",
  pgvector: "PostgreSQL extension adding vector type + similarity operators. Turns Postgres into a competent vector DB. Used by Supabase, many ChatGPT-style apps.",
  "Document store": "Stores semi-structured documents (JSON-like). MongoDB, Couchbase, Firestore. Flexible schema, nested data, secondary indexes. Trade-off: weaker transactions, joins.",
  "Key-value store": "Simplest model: get(key), set(key, value), delete(key). Redis, Memcached, DynamoDB (in KV mode). O(1) ops. Use as cache or session store.",
  "Graph database": "Optimized for many-to-many relationships and traversal. Neo4j, ArangoDB. Cypher language. Use for social networks, knowledge graphs, fraud detection.",
  "Time-series": "Optimized for append-mostly time-stamped data. InfluxDB, TimescaleDB (PG extension), QuestDB. Efficient compression + time-based partitioning.",
  Connection: "TCP connection to the database. PostgreSQL forks a process per connection — expensive. Use pooler (PgBouncer, Supavisor) to multiplex. Limit: ~100-500 typical.",
  Dialect: "SQL is a standard, but every database has extensions. PostgreSQL JSONB ≠ MySQL JSON. RETURNING (PG) ≠ OUTPUT (SQL Server). Knowing your dialect matters.",
  Migration: "A versioned change to schema or data. Tools: Alembic (Python), Knex/Prisma (Node), Flyway, Liquibase. Forward + rollback. Zero-downtime migrations are an art.",
};

const QUIZZES = {
  origin: [
    {
      qid: 'o1',
      q: "Who created the relational model and when?",
      opts: [ "Larry Ellison, 1977", "E.F. Codd at IBM, 1970", "Jim Gray, 1985" ],
      a: 1,
      x: "Edgar F. Codd published 'A Relational Model of Data for Large Shared Data Banks' in CACM 1970. IBM was slow to commercialize it — Oracle (then Software Development Labs) shipped the first relational product in 1979, beating IBM's own DB2 to market."
    },
    {
      qid: 'o2',
      q: "What's the current PostgreSQL version as of May 2026?",
      opts: [ "PostgreSQL 15", "PostgreSQL 18 (latest 18.4, released May 14, 2026)", "PostgreSQL 12" ],
      a: 1,
      x: "PostgreSQL 18 was released September 25, 2025. As of May 14, 2026, the current point release is 18.4. Major features: asynchronous I/O (3x faster reads), uuidv7(), skip scan for B-tree, virtual generated columns, OAuth, temporal constraints, wire protocol 3.2."
    },
    {
      qid: 'o3',
      q: "What was the 'NoSQL' movement actually about?",
      opts: [
        "Eliminating SQL entirely",
        "Relaxing some traditional database guarantees (joins, schemas, strict consistency) to get horizontal scalability — driven by Web 2.0 scale problems Google/Amazon/Facebook hit around 2007-2010",
        "Marketing for MongoDB"
      ],
      a: 1,
      x: "Originally 'Not Only SQL.' The early 2010s wave (MongoDB, Cassandra, Riak, CouchDB) addressed real scaling pain. Many of those problems are now solved within relational systems (PostgreSQL JSONB, sharding, logical replication). The pendulum has swung back — 'just use Postgres' is the 2026 default."
    },
  ],
  engines: [
    {
      qid: 'e1',
      q: "Default choice for a new backend app database in 2026?",
      opts: [
        "MongoDB — flexible schema",
        "PostgreSQL — battle-tested OLTP, JSONB for flexibility, mature ecosystem, vector search via pgvector, hosted on Supabase / Neon / RDS / many others",
        "MySQL — it's more popular"
      ],
      a: 1,
      x: "'Just use Postgres' is the most common 2026 default. JSONB handles the schema-flexibility case. pgvector handles vector search. The hosted ecosystem (Supabase, Neon, Render, Fly.io, RDS, Cloud SQL) is mature. Move off Postgres only when you have a specific reason (analytics → DuckDB/ClickHouse; key-value cache → Redis)."
    },
    {
      qid: 'e2',
      q: "What's DuckDB best for?",
      opts: [
        "Replacing PostgreSQL for web apps",
        "In-process analytical queries on local data — Parquet, CSV, JSON, S3. Like SQLite for OLAP. Single binary, no server.",
        "Caching"
      ],
      a: 1,
      x: "DuckDB is the analytics equivalent of SQLite — embedded, columnar, fast on aggregations. Read Parquet/CSV/JSON directly with SQL. Great for local data exploration, ETL scripts, notebooks. Not for transactional workloads (no concurrent writers)."
    },
    {
      qid: 'e3',
      q: "When do you actually need Redis?",
      opts: [
        "Every project",
        "When sub-millisecond response is required (sessions, leaderboards, rate-limit counters, pub/sub) or you need explicit cache layer separate from your main DB",
        "Instead of PostgreSQL"
      ],
      a: 1,
      x: "Redis shines for: session storage (TTLs built in), rate limiting (INCR + EXPIRE), real-time counters, pub/sub, ephemeral queue work. Postgres can do most of this — Redis just does it faster and with simpler primitives. License changed 2024 to source-available; KeyDB and Valkey are open-source forks."
    },
  ],
  relational: [
    {
      qid: 'r1',
      q: "What's a foreign key actually for?",
      opts: [
        "Making JOINs faster",
        "Referential integrity — the DB refuses to insert a row referencing a non-existent parent, and refuses to delete a referenced parent (unless CASCADE). Catches bugs at the database boundary.",
        "Indexing"
      ],
      a: 1,
      x: "FKs don't speed up joins (you still need indexes). They guarantee referential integrity — a layer of defense ORM bugs and ad-hoc scripts can't bypass. Some teams skip FKs for performance reasons; usually not worth it for OLTP."
    },
    {
      qid: 'r2',
      q: "Should every table have a surrogate key (auto-increment ID)?",
      opts: [
        "Always",
        "Default to yes for OLTP — stable, simple, indexable. Use composite/natural keys only when the relationship genuinely demands it (junction tables, multi-tenant data). UUIDv7 (PG 18) gives you uniqueness + sortability + non-leaking IDs.",
        "Never"
      ],
      a: 1,
      x: "Surrogate keys keep schema flexible — emails change, ISBNs get reissued. UUIDv7 (PG 18 has native uuidv7()) is timestamp-prefixed, sortable, doesn't leak insertion order externally (unlike auto-increment), distributable. Default to UUIDv7 for new tables in 2026."
    },
    {
      qid: 'r3',
      q: "What level of normalization do most production apps target?",
      opts: [
        "1NF — it's enough",
        "3NF — eliminates most redundancy, keeps schema understandable. Sometimes denormalize specific columns for read performance (after measuring).",
        "BCNF or higher always"
      ],
      a: 1,
      x: "3NF (third normal form) is the practical sweet spot. 4NF/5NF/BCNF address edge cases most schemas don't hit. Denormalize selectively — duplicate user_name on orders for fast displays, with a write trigger to keep it in sync. Always measure first."
    },
  ],
  sql: [
    {
      qid: 's1',
      q: "What's the difference between INNER JOIN and LEFT JOIN?",
      opts: [
        "INNER JOIN is faster",
        "INNER JOIN returns only rows where the join condition matches in BOTH tables. LEFT JOIN returns ALL rows from the left, with NULLs for non-matches on the right.",
        "Different syntax for the same thing"
      ],
      a: 1,
      x: "Use INNER for 'must have related data' (orders WITH user). Use LEFT for 'all left rows, optional right' (all users, even those with zero orders). RIGHT JOIN exists but is rare — swap table order to use LEFT instead. FULL OUTER returns everything from both sides."
    },
    {
      qid: 's2',
      q: "What does ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) give you?",
      opts: [
        "Random ranking",
        "For each user_id group, ranks rows by created_at descending — 1 for newest, 2 for second-newest, etc. The single best tool for 'most recent N per group' queries.",
        "It's not valid SQL"
      ],
      a: 1,
      x: "Window functions are the single most powerful SQL feature most devs underuse. Variants: RANK (ties share number), DENSE_RANK (no gaps), LAG/LEAD (peek at neighbor rows). For 'top 5 orders per user' — wrap in CTE, filter WHERE rn <= 5."
    },
    {
      qid: 's3',
      q: "WHERE col = NULL — what does it return?",
      opts: [
        "Rows where col is null",
        "Nothing. NULL is not equal to anything, including NULL. Use IS NULL instead.",
        "An error"
      ],
      a: 1,
      x: "NULL means 'unknown' in SQL's three-valued logic (TRUE / FALSE / UNKNOWN). NULL = NULL evaluates to UNKNOWN, which WHERE treats as FALSE. Use IS NULL / IS NOT NULL. Same gotcha bites != — `col != 'x'` skips rows where col is NULL."
    },
  ],
  indexes: [
    {
      qid: 'i1',
      q: "When does an index NOT help?",
      opts: [
        "Indexes always help",
        "When the planner thinks a sequential scan is cheaper (table is small, or query returns most rows). Also: LIKE '%foo%' (leading wildcard), functions on indexed columns without expression index, OR conditions across different columns, type mismatches.",
        "On primary keys"
      ],
      a: 1,
      x: "Common index killers: `WHERE LOWER(email) = 'x'` (function on column — need expression index), `WHERE created_at::date = '2024-01-01'` (cast prevents index use — use range instead), `WHERE col LIKE '%search%'` (need trigram index), small tables (full scan is fine)."
    },
    {
      qid: 'i2',
      q: "What's a composite index? How does column order matter?",
      opts: [
        "Same as multiple separate indexes",
        "An index on multiple columns, e.g. (user_id, created_at). The order MATTERS — the index helps queries filtering on a leading prefix (user_id alone, or user_id + created_at), not on created_at alone. Order columns by selectivity + query pattern.",
        "It just doubles the index size"
      ],
      a: 1,
      x: "Index (a, b, c) helps: WHERE a=?, WHERE a=? AND b=?, WHERE a=? AND b=? AND c=?. Does NOT help: WHERE b=? alone, WHERE c=? alone. PostgreSQL 18 added 'skip scan' which sometimes uses indexes for non-leading columns — but design for the common case explicitly."
    },
    {
      qid: 'i3',
      q: "What does EXPLAIN ANALYZE actually do?",
      opts: [
        "Estimates query cost",
        "RUNS the query, returns the chosen plan + actual row counts + actual timings. Compare estimated vs actual rows — large divergence = stale statistics, run ANALYZE.",
        "Only displays the plan without executing"
      ],
      a: 1,
      x: "EXPLAIN alone shows the planner's estimated plan. EXPLAIN ANALYZE actually runs the query. EXPLAIN (ANALYZE, BUFFERS) adds I/O info. Use ANALYZE (the maintenance command) to refresh table statistics that the planner uses. Stale stats are the #1 cause of bad plans."
    },
  ],
  tx: [
    {
      qid: 'tx1',
      q: "What does the I in ACID actually mean in practice?",
      opts: [
        "Transactions are completely independent",
        "There are LEVELS of isolation: READ UNCOMMITTED → READ COMMITTED → REPEATABLE READ → SERIALIZABLE. Each prevents more anomalies (dirty read, non-repeatable read, phantom read, write skew). Higher = safer but slower / more conflict.",
        "Each transaction has its own database"
      ],
      a: 1,
      x: "Default isolation: PostgreSQL = READ COMMITTED. MySQL InnoDB = REPEATABLE READ. They behave DIFFERENTLY — same SQL, different anomalies possible. Critical to know your DB's default. SERIALIZABLE on PostgreSQL uses SSI (Serializable Snapshot Isolation) — fast and correct, but txns can be aborted with serialization_failure (retry pattern needed)."
    },
    {
      qid: 'tx2',
      q: "MVCC — what's the trade-off?",
      opts: [
        "Just faster, no trade-off",
        "Readers don't block writers (and vice versa) — high concurrency. Cost: old row versions accumulate ('dead tuples') and must be cleaned up. PostgreSQL: VACUUM. Long-running transactions block cleanup → table bloat.",
        "Lower durability"
      ],
      a: 1,
      x: "MVCC is why PostgreSQL doesn't deadlock as much as MySQL on read-heavy workloads. Cost: dead row cleanup. autovacuum tuning is critical — under-tuned VACUUM is a top-3 PG production issue. Long open transactions hold back the xmin horizon and prevent cleanup."
    },
    {
      qid: 'tx3',
      q: "Two transactions both do `SELECT balance` then `UPDATE balance = balance - 100`. What can go wrong?",
      opts: [
        "Nothing — they'll just queue",
        "Lost update / write skew: both read 100, both write 0, but the true balance should be -100. SELECT FOR UPDATE locks the rows, or use SERIALIZABLE isolation. Optimistic version: include a version column + WHERE version = ? in UPDATE.",
        "The database will throw an error"
      ],
      a: 1,
      x: "Classic concurrency bug. Pessimistic fix: SELECT ... FOR UPDATE acquires a row lock. Optimistic fix: SELECT version, ...; UPDATE ... WHERE version = old_version; if no rows changed, retry. The Library has both patterns. Don't trust READ COMMITTED to save you from logical errors."
    },
  ],
  nosql: [
    {
      qid: 'n1',
      q: "When does MongoDB actually beat PostgreSQL?",
      opts: [
        "Always",
        "Niche cases: deeply nested document hierarchies that change often, very high write throughput on simple data, when ops team has Mongo expertise. PostgreSQL JSONB handles most 'NoSQL' use cases competently.",
        "Never"
      ],
      a: 1,
      x: "PostgreSQL JSONB closed the gap dramatically post-2014. The 'one true document store' advantage is mostly gone. Pick MongoDB when you have a specific reason (existing team expertise, true document hierarchies, MongoDB-specific features like change streams) — not by default."
    },
    {
      qid: 'n2',
      q: "Vector databases — what do they actually do?",
      opts: [
        "Store images",
        "Store and search high-dimensional vectors (embeddings) by similarity. Used for semantic search, RAG, recommendations. ANN algorithms (HNSW) make this O(log n)-ish instead of O(n) brute-force.",
        "Replace SQL databases"
      ],
      a: 1,
      x: "Vector DBs: pgvector (PostgreSQL extension — most popular in 2026), Qdrant, Pinecone, Weaviate, Milvus. They index vectors via HNSW or IVF, support filtering by metadata. For most apps: start with pgvector if you already have Postgres; specialize only if scale demands."
    },
  ],
  distributed: [
    {
      qid: 'd1',
      q: "What does CAP actually say?",
      opts: [
        "Pick any two of three (always)",
        "Under network PARTITION, you must choose between Consistency and Availability. Without partition, you can have both. PACELC extends this: Else, choose Latency or Consistency.",
        "Distributed DBs are impossible"
      ],
      a: 1,
      x: "CAP is often misstated. The choice only matters under partition. Daniel Abadi's PACELC: 'if Partition, then A or C; Else, Latency or Consistency.' Real systems: PostgreSQL+sync replication = CP/EC. Cassandra = AP/EL. CockroachDB / Spanner = CP/EC with low latency via TrueTime / hybrid clocks."
    },
  ],
  atlas: [
    {
      qid: 'at1',
      q: "What separates competent database users from senior ones?",
      opts: [
        "Memorizing SQL syntax",
        "Reading EXPLAIN plans fluently, understanding the trade-offs of isolation levels and consistency models, knowing which engine for which workload, and respect for transactions + indexes. Plus knowing when to step OUT of the database (cache, queue, search).",
        "Knowing every NoSQL database"
      ],
      a: 1,
      x: "Databases are foundational infrastructure — most app reliability comes from getting them right. The leverage skills: read EXPLAIN, design schemas that scale, write queries that use indexes, choose isolation levels deliberately, plan for replication + sharding before you need them. Build on PostgreSQL by default; reach for specialized tools when measurement justifies it."
    },
  ],
};

const COMPARISONS = {
  engines: {
    title: 'Database engine choice — 2026',
    headers: ['Engine', 'Type', 'Best for', 'Skip when'],
    rows: [
      ['PostgreSQL 18', 'Relational', "OLTP, complex queries, JSON workloads, vector search (pgvector), GIS (PostGIS). The 2026 default.", "Single-machine OLAP at billion-row scale"],
      ['MySQL 8.4', 'Relational', "OLTP, mature replication, many-replicas read scaling, WordPress + LAMP stack legacy", "Want PostGIS / pgvector / advanced types"],
      ['SQLite 3.53', 'Embedded relational', "Embedded apps, mobile, edge, prototypes, single-writer servers (Turso, libSQL). Most-deployed DB on Earth.", "High write concurrency (single writer)"],
      ['MongoDB 8', 'Document', "Deeply nested documents changing schemas, existing Mongo expertise. Change streams.", "Complex joins, strict consistency, default choice"],
      ['Redis / Valkey', 'Key-value (in-memory)', "Sessions, rate-limit counters, leaderboards, pub/sub, queues, sub-ms cache", "Primary persistent store (yes ZSET tricks exist, no)"],
      ['DuckDB', 'Embedded OLAP', "Local analytics on Parquet/CSV/S3, ETL scripts, notebooks. SQLite for analytics.", "Transactional workloads (no concurrent writes)"],
      ['ClickHouse', 'Columnar OLAP', "Real-time analytics on huge data, log analytics, observability backends", "OLTP, frequent UPDATEs"],
      ['Neo4j', 'Graph', "Many-to-many traversal — social, fraud, knowledge graphs. Cypher.", "Tabular/aggregation workloads"],
      ['pgvector', 'Vector (in PG)', "Semantic search, RAG, recommendations — alongside your relational data", "Billion-vector scale (look at Qdrant / Milvus)"],
      ['Elasticsearch', 'Search', "Full-text search, log aggregation, fuzzy matching", "Primary OLTP — use Postgres + ES for search"],
    ],
  },
  isolation: {
    title: 'Isolation levels — what each prevents',
    headers: ['Level', 'Dirty read', 'Non-repeatable read', 'Phantom read', 'Notes'],
    rows: [
      ['READ UNCOMMITTED', "Possible", "Possible", "Possible", "Rare; PG treats as READ COMMITTED."],
      ['READ COMMITTED', "Prevented", "Possible", "Possible", "PostgreSQL DEFAULT."],
      ['REPEATABLE READ', "Prevented", "Prevented", "Possible (SQL std) / Prevented (PG/MySQL)", "MySQL InnoDB DEFAULT."],
      ['SERIALIZABLE', "Prevented", "Prevented", "Prevented", "Strictest. PG uses SSI — txns may abort with serialization_failure → retry."],
    ],
  },
  cap: {
    title: 'Where real databases live (CAP / PACELC)',
    headers: ['System', 'CAP', 'PACELC', 'Notes'],
    rows: [
      ['PostgreSQL (single-node)', 'CA', "n/a", "No partition possible with one node."],
      ['PostgreSQL + sync replication', 'CP', "PC/EC", "Refuses writes if replica unreachable."],
      ['PostgreSQL + async replication', 'AP-ish', "PA/EL", "Replicas may serve stale data."],
      ['Cassandra', 'AP', "PA/EL", "Tunable per-query (CONSISTENCY = QUORUM)."],
      ['CockroachDB', 'CP', "PC/EC", "Spanner-like; uses hybrid logical clocks."],
      ['Spanner (Google)', 'CP', "PC/EC", "TrueTime API — atomic clocks for global consistency."],
      ['DynamoDB (default)', 'AP', "PA/EL", "Strong consistency optional per-read."],
      ['MongoDB (replica set)', 'CP (default)', "PC/EC", "Tunable per write concern."],
    ],
  },
};

const ANTIPATTERNS = [
  { name: "SELECT *", reason: "Returns columns you don't need — wastes bandwidth, prevents covering-index optimizations, breaks when schema changes. List the columns explicitly. Exception: ad-hoc psql exploration." },
  { name: "String-concatenated queries", reason: "SQL injection vector. ALWAYS use parameterized queries: $1, ?, :name placeholders. Every modern client supports them. There is no acceptable reason to concatenate user input into SQL." },
  { name: "LIKE '%foo%' in hot paths", reason: "Leading wildcard prevents B-tree index use → full scan. For substring search: pg_trgm + GIN index, or move to a search engine (Elasticsearch, Meilisearch, Typesense)." },
  { name: "Functions on indexed columns", reason: "`WHERE LOWER(email) = 'x'` doesn't use the index on email. Either store lowercase in a separate column, or create an expression index: `CREATE INDEX ON users (LOWER(email))`." },
  { name: "ORs that prevent index use", reason: "`WHERE a = 1 OR b = 2` often can't use indexes on a and b separately. Rewrite as UNION ALL of two indexed queries when selective." },
  { name: "N+1 queries", reason: "1 query for the list + N queries for each item's relations. ORM default. Fix with eager loading (Prisma include, SQLAlchemy joinedload, ActiveRecord includes) or a single JOIN. Log every query in dev to spot these." },
  { name: "VARCHAR(255) for everything", reason: "PostgreSQL ignores the length (it's just a check); MySQL stores it differently. Use TEXT in PG. In MySQL, size affects index key length on utf8mb4 (4 bytes/char). Don't pick 255 by superstition." },
  { name: "Holding transactions during user input", reason: "BEGIN; SELECT; (wait for user click); UPDATE; COMMIT. The lock is held the whole time, blocking everyone. Use optimistic locking (version column) instead — retry on conflict." },
  { name: "Soft delete by default", reason: "`deleted_at` columns silently change semantics of every query (must add WHERE deleted_at IS NULL). Foreign keys still pin the row. Real deletes + audit log are usually better." },
  { name: "Auto-increment IDs across shards", reason: "Doesn't compose across machines. Use UUIDs — UUIDv7 (PG 18 native uuidv7()) gives timestamp ordering AND uniqueness AND distributability." },
];

const COMMANDS = [
  { cmd: 'psql postgres://user:pass@host:5432/dbname', desc: "Connect via psql. Inside: \\dt list tables, \\d table describe, \\l list databases, \\du users, \\timing on, \\q quit, \\? help." },
  { cmd: 'EXPLAIN (ANALYZE, BUFFERS) SELECT ...', desc: "Run the query AND show actual plan + timings + I/O. THE debugging tool. Compare estimated vs actual rows — big divergence means stale statistics." },
  { cmd: 'ANALYZE table_name;', desc: "Refresh table statistics for the planner. Run after big data changes. autovacuum usually handles it, but explicit ANALYZE before benchmarking is wise." },
  { cmd: 'VACUUM (VERBOSE, ANALYZE) table_name;', desc: "Reclaim space from dead tuples + refresh stats. autovacuum runs continuously; this is for explicit cleanup. VACUUM FULL rewrites the table — needs exclusive lock." },
  { cmd: 'CREATE INDEX CONCURRENTLY idx_name ON tbl (col);', desc: "Build index without locking writes. Slower than CREATE INDEX, safer for production. The 'always use this in prod' variant." },
  { cmd: 'pg_dump -Fc dbname > backup.dump && pg_restore -d new_db backup.dump', desc: "Dump + restore. -Fc = custom format (parallel restore, selective restore). For huge DBs, use logical replication or physical backup (pg_basebackup)." },
  { cmd: 'SELECT pg_size_pretty(pg_database_size(current_database()));', desc: "How big is this database? pg_total_relation_size('tbl') for one table including indexes + toast." },
  { cmd: "SELECT * FROM pg_stat_activity WHERE state = 'active';", desc: "Currently running queries. WHERE state != 'idle' shows what's actually working. Look for old query_start times — those are stuck." },
  { cmd: "SELECT * FROM pg_locks WHERE NOT granted;", desc: "Queries waiting on locks. JOIN pg_stat_activity to see what's holding them. Diagnoses deadlock + blocking issues." },
  { cmd: 'sqlite3 mydb.db', desc: "SQLite CLI. .schema show schema, .tables list tables, .mode column + .headers on for readable output, .quit exit." },
  { cmd: 'redis-cli -h host -p 6379', desc: "Redis CLI. SET k v, GET k, INCR counter, EXPIRE k 60, KEYS pattern (avoid in prod — use SCAN), MONITOR (live ops), INFO." },
  { cmd: 'mongosh "mongodb://host/db"', desc: "MongoDB shell. show dbs, use db, db.collection.find({}), db.collection.createIndex({field: 1})." },
];

const RESOURCES = [
  { name: "Designing Data-Intensive Applications", url: 'A book — Kleppmann', note: "THE modern book. ~600 pages. Storage engines, replication, partitioning, transactions, consistency, batch + stream processing. The 'distributed systems for app engineers' bible. Read it twice.", kind: 'book' },
  { name: "Use The Index, Luke!", url: 'use-the-index-luke.com', note: "Markus Winand. Free online book on SQL indexing. THE indexing reference. Goes deep without getting lost. Read it cover to cover.", kind: 'book' },
  { name: "PostgreSQL Documentation", url: 'postgresql.org/docs/current', note: "The PostgreSQL docs are extraordinarily good — better than most paid books. Searchable, deep, current. Bookmark it. Read 'Performance Tips' chapter for query optimization.", kind: 'reference' },
  { name: "SQLite Documentation", url: 'sqlite.org/docs.html', note: "D. Richard Hipp's writing is unusually clear. 'When To Use SQLite' is a great essay. The internals docs (B-tree format, file format) are fascinating.", kind: 'reference' },
  { name: "SQL for the Curious (cmu-db)", url: 'youtube.com/@CMUDatabaseGroup', note: "Andy Pavlo's database courses (15-445, 15-721) are on YouTube. Best academic database course material publicly available. Free.", kind: 'video' },
  { name: "PostgreSQL Weekly", url: 'postgresweekly.com', note: "Free email newsletter. Curated PG content — release notes, blog posts, conference talks. The single best way to stay current on Postgres.", kind: 'newsletter' },
  { name: "Database Internals", url: 'A book — Petrov', note: "Alex Petrov. Deep dive into storage engines (B-tree, LSM) and distributed systems primitives. Pairs well with Kleppmann.", kind: 'book' },
  { name: "The Art of PostgreSQL", url: 'theartofpostgresql.com', note: "Dimitri Fontaine. Practical, opinionated. SQL features most devs miss (window functions, lateral joins, json operators).", kind: 'book' },
  { name: "Crunchy Data blogs / pganalyze", url: 'crunchydata.com/blog, pganalyze.com/blog', note: "Two of the best practical PostgreSQL blog series. Deep dives into real production issues. pganalyze's '5mins of Postgres' weekly YouTube is excellent.", kind: 'blog' },
  { name: "explain.depesz.com / explain.dalibo.com", url: 'Online tools', note: "Paste an EXPLAIN ANALYZE output, get a visualization showing the slow nodes. Indispensable for query tuning.", kind: 'tool' },
  { name: "pgvector + Supabase docs", url: 'github.com/pgvector/pgvector + supabase.com/docs/guides/ai', note: "For vector search in PostgreSQL. Supabase's AI guides have the best end-to-end examples in 2026 (RAG, semantic search).", kind: 'reference' },
  { name: "DB-Engines ranking", url: 'db-engines.com/en/ranking', note: "Monthly popularity ranking across 400+ databases. Useful for tracking momentum — pgvector, DuckDB, ClickHouse all rising; older systems plateauing.", kind: 'reference' },
];

const PERSONALIZED = {
  backend: {
    spark: "Backend / OLTP: PostgreSQL is the default. Hosted: Supabase (PG + auth + storage + edge functions), Neon (serverless PG), Render, Fly.io, RDS, Cloud SQL. Connection pooler (PgBouncer / Supavisor) required at any real concurrency.",
    relational: "Backend: 3NF as the default. UUIDv7 PKs (PG 18). FKs always — referential integrity beats every ORM. created_at/updated_at on every table. Soft deletes only when you've thought about it.",
    sql: "Backend: window functions for ranking/dedupe ('most recent per user'). LATERAL joins for correlated subquery patterns. RETURNING for fetch-after-insert. INSERT ... ON CONFLICT for upserts.",
    indexes: "Backend: covering index on (user_id, created_at) is the most common useful pattern. Partial indexes for status='pending' / soft-delete filters. Run EXPLAIN ANALYZE on every slow query in staging.",
    library: "Backend: lean on Schema patterns (UUIDv7 PKs, soft delete done right), Queries (window functions, upsert, pagination via keyset), Indexing (composite, partial, covering), Migrations (zero-downtime patterns).",
  },
  analytics: {
    spark: "Analytics / OLAP: DuckDB for local/embedded, ClickHouse for self-hosted real-time, BigQuery/Snowflake/Redshift for cloud warehouses. Columnar storage = orders of magnitude faster for aggregations.",
    relational: "Analytics: schemas optimized for read patterns. Star schema (facts + dimensions) for BI. Materialized views for pre-aggregated rollups. Don't normalize past readability.",
    sql: "Analytics: window functions, GROUP BY GROUPING SETS / CUBE / ROLLUP, GROUP_CONCAT/STRING_AGG, percentile functions (percentile_cont), date_trunc + generate_series for time bucketing.",
    indexes: "Analytics: less critical than OLTP — columnar engines auto-index via compression + min/max per block. But: zonemaps, sort keys (ClickHouse ORDER BY), partition pruning by date.",
    library: "Analytics: Schema patterns (STAR / snowflake), Queries (window functions, time bucketing, top-N per group), Performance (materialized views, partition pruning).",
  },
  cache: {
    spark: "Cache: Redis 7 (or Valkey/KeyDB open-source forks since the 2024 license change). Sub-ms latency. Use as cache OR source-of-truth-with-persistence, not both.",
    relational: "Cache: usually denormalized for read. Store the actual rendered response (page HTML, JSON API output). Key by user_id + version_hash. TTL aggressively.",
    sql: "Cache: less SQL, more KV operations. But you'll often use SQL DB as source of truth and Redis as derived cache. Patterns: read-through, write-through, write-behind.",
    indexes: "Cache: Redis sorted sets (ZSET) for leaderboards + time-ranged queries. HASH for object fields. Set TTL on EVERY key.",
    library: "Cache: Performance patterns (cache-aside, read-through), Transactions (no — eventual consistency is the trade), but the SQL Library still applies to your primary store.",
  },
  ai: {
    spark: "AI / vector: pgvector is the 2026 default for new apps already on Postgres. Specialized stores (Qdrant, Pinecone, Weaviate, Milvus) when scale demands. HNSW index for ANN search.",
    relational: "AI: vectors live alongside metadata in regular tables. Filter by metadata FIRST then ANN search (or vice versa with prefilters). User_id, tags, timestamps — relational columns paired with vector columns.",
    sql: "AI: SELECT * FROM docs ORDER BY embedding <=> $1 LIMIT 10 — cosine distance with pgvector. WHERE clauses combine. CTEs for hybrid (vector + keyword) search.",
    indexes: "AI: HNSW index on the vector column (CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)). IVFFlat for huge datasets at index-build cost. Tune ef_search for recall/latency.",
    library: "AI / vector: pgvector setup + similarity search + hybrid (vector + keyword + filter) patterns. Schema for documents + chunks + embeddings + sources.",
  },
  fundamentals: {
    spark: "Best path: SQL + relational thinking BEFORE specialized engines. Spend 1-2 months on PostgreSQL + the EXPLAIN command. Most database 'expertise' is reading EXPLAIN well.",
    relational: "Read Kleppmann's 'Designing Data-Intensive Applications' chapters 2-3. Set up PostgreSQL locally with the dvdrental sample database. Type every example. Learn the relational algebra mental model.",
    sql: "Use-the-index-luke.com cover to cover. Then PostgreSQL's docs on query optimization. Practice window functions on real data — they're the single skill that levels you up most.",
    indexes: "EXPLAIN ANALYZE every query you write for a month. Learn to read the cost numbers. Build a small app, intentionally write slow queries, fix them with indexes. The intuition only comes from this practice.",
    library: "All eight categories. Schema, queries, indexing, transactions, JSON, vector, migrations, performance. Read each, type the examples into your local PG, predict the EXPLAIN output before running.",
  },
};

const TROUBLESHOOT = {
  start: {
    q: "What's broken?",
    opts: [
      { label: "🐢 Query is slow", next: 'slow-query' },
      { label: "🔒 Deadlock / serialization_failure error", next: 'deadlock' },
      { label: "💥 Connection refused / too many connections", next: 'conn' },
      { label: "🗃 Table size keeps growing — disk filling", next: 'bloat' },
      { label: "📦 Migration failed / corrupt schema state", next: 'migration' },
      { label: "🔍 Index not being used", next: 'no-index' },
      { label: "🌀 Replication lag growing", next: 'repl-lag' },
      { label: "❌ Data corruption / wrong results", next: 'corruption' },
    ],
  },
  'slow-query': {
    fix: "Run EXPLAIN ANALYZE. Read it bottom-up. Find the slow operator. Optimize it.",
    steps: [
      "EXPLAIN (ANALYZE, BUFFERS) your_query — gets the plan with actual rows + timings + I/O.",
      "Estimated rows vs actual rows differ by >10×? Stale statistics. Run ANALYZE table_name.",
      "Sequential Scan on a large table? Likely missing index, or planner thinks index isn't selective enough. Look at WHERE clauses.",
      "Index Scan but still slow? Check if it's the RIGHT index. Composite (a,b) helps WHERE a=? AND b=?, not WHERE b=? alone.",
      "LIKE '%search%' — leading wildcard prevents B-tree. Need pg_trgm + GIN. Or move to dedicated search (Elasticsearch, Meilisearch).",
      "Function on indexed column? `WHERE LOWER(email) = 'x'` doesn't hit the index on email — create expression index: CREATE INDEX ON users (LOWER(email)).",
      "N+1 from ORM? Check the app log for repeated SELECTs. Use eager loading or a single JOIN.",
      "Big sort + no index? ORDER BY a column without an index is slow on large tables. Add an index on the sort key (often combined with the WHERE columns).",
      "Paste the EXPLAIN output into explain.depesz.com — visual analysis highlights the costly nodes.",
    ],
  },
  'deadlock': {
    fix: "Two transactions waiting on locks held by each other. PostgreSQL detects + aborts one with deadlock_detected error.",
    steps: [
      "Read the error message — PostgreSQL prints both transactions' queries + which tables they were waiting on.",
      "Most common cause: txn A locks tables in order (X, Y), txn B locks in order (Y, X). Standardize lock order app-wide.",
      "SELECT FOR UPDATE on overlapping rows? Add an explicit ORDER BY when locking sets of rows.",
      "Foreign key locks? UPDATE on parent row can lock related child rows. Use SELECT FOR NO KEY UPDATE in PG when you only update non-key columns.",
      "serialization_failure (SQLSTATE 40001) under SERIALIZABLE? Retry the whole transaction. The app must implement retry — usually with exponential backoff, max 3-5 attempts.",
      "Reduce lock scope: shorter transactions, smaller WHERE clauses, batch updates instead of one big UPDATE.",
    ],
  },
  'conn': {
    fix: "More clients than the DB allows, or connections leaked.",
    steps: [
      "PostgreSQL forks a process per connection — expensive. Default max_connections = 100. Don't crank it up; use a pooler.",
      "PgBouncer or Supavisor (Supabase) in transaction-pooling mode. Multiplexes 1000s of app conns over ~20 DB conns.",
      "Connection leak in app? Every BEGIN must have COMMIT/ROLLBACK. Every conn must be returned to the pool. Check long-running 'idle in transaction' sessions in pg_stat_activity.",
      "AWS RDS / Cloud SQL: parameters are tunable but max_connections has memory cost. Pool first, scale max_connections only if needed.",
      "Spike of new connections (cold start)? Pre-warm pool, or use serverless DBs designed for this (Neon, Aurora Serverless).",
    ],
  },
  'bloat': {
    fix: "PostgreSQL keeps dead row versions (MVCC). VACUUM cleans them; if VACUUM can't keep up, table size grows even though data doesn't.",
    steps: [
      "Check bloat: SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) FROM pg_class WHERE relkind='r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 10;",
      "Compare to expected logical size. If much bigger → bloat. Use the pgstattuple extension or pg_repack/pg_squeeze for detailed analysis.",
      "Long-running transactions block VACUUM (xmin horizon). Find them: SELECT * FROM pg_stat_activity WHERE state != 'idle' AND xact_start < now() - interval '5 minutes';",
      "Tune autovacuum: autovacuum_vacuum_scale_factor (lower = more aggressive on big tables), autovacuum_naptime, autovacuum_max_workers.",
      "VACUUM FULL rewrites the table (exclusive lock, slow). Use pg_repack instead — same effect, no exclusive lock.",
      "REINDEX CONCURRENTLY to rebuild bloated indexes online.",
    ],
  },
  'migration': {
    fix: "Schema change partially applied. Recovery depends on what state you're in.",
    steps: [
      "PostgreSQL DDL is transactional (mostly). Wrap migrations in BEGIN; ... COMMIT; — failures roll back cleanly. (Exception: CREATE INDEX CONCURRENTLY can't be in a txn.)",
      "Migration tool (Alembic, Knex, Prisma, Flyway) tracks applied versions. Check its version table — what's the last applied migration?",
      "Out-of-order migrations from a branch merge? Don't reorder applied migrations in main. Always add new migrations on top.",
      "Renamed column / type change in production with active app? Two-phase: (1) add new column + dual-write, (2) backfill, (3) switch reads, (4) drop old. Never rename in one step under load.",
      "ADDing a column with default on big table: in older PG versions, rewrote whole table. PG 11+: instant for constant defaults. Check your version.",
      "Test migrations against a copy of production data first. ALWAYS.",
    ],
  },
  'no-index': {
    fix: "Index exists but EXPLAIN shows Seq Scan. Several common reasons.",
    steps: [
      "Selectivity: planner estimates the query returns > ~5% of rows → seq scan is cheaper. This is often correct! Don't force an index that doesn't help.",
      "Statistics stale: ANALYZE the table; re-EXPLAIN.",
      "Function on the column: `WHERE date_trunc('day', created_at) = '2024-01-01'` — create expression index OR rewrite as range: WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'.",
      "Type mismatch: indexed column is INTEGER, query uses BIGINT — implicit cast can prevent index use. Check column types.",
      "LIKE with leading wildcard '%foo%' — B-tree can't help. pg_trgm + GIN index.",
      "OR across different columns — sometimes can't use indexes on each. Rewrite as UNION ALL.",
      "Composite index column order wrong for query. Re-create with the right leading column.",
      "Force test: SET enable_seqscan = OFF; then EXPLAIN. If it picks the index and is faster, the planner was wrong (file a bug / tune stats).",
    ],
  },
  'repl-lag': {
    fix: "Replica is falling behind primary. Either replica is overloaded, or primary is producing too much WAL.",
    steps: [
      "Check current lag: SELECT now() - pg_last_xact_replay_timestamp() ON THE REPLICA.",
      "Primary side: SELECT pid, application_name, state, sent_lsn, write_lsn, flush_lsn, replay_lsn FROM pg_stat_replication; — shows per-replica progress.",
      "Big bulk write on primary (UPDATE millions of rows in one txn)? Replicas must redo it serially. Batch updates instead.",
      "Replica is read-heavy and CPU-bound? It has to apply WAL AND serve reads. Add another replica, or scale the replica up.",
      "Logical replication: subscriber lagging because of conflicts (PK violations, missing tables). Check pg_stat_subscription + logs.",
      "Sync replication: writes wait for replica acks. If lag grows under load, the network or replica is the bottleneck.",
    ],
  },
  'corruption': {
    fix: "Wrong results, missing data, or data integrity violations. Could be real corruption or a bug.",
    steps: [
      "First: is it real corruption (disk-level) or a logical bug? PostgreSQL: SELECT * FROM pg_stat_database WHERE datname = current_database(); check for checksum failures.",
      "Enable data checksums (default in PG 18, otherwise initdb --data-checksums). Catches torn writes + bit rot at the page level.",
      "Logical bug: missing FK constraint allowed orphans? Missing UNIQUE allowed duplicates? Run ad-hoc audit queries; add the constraints.",
      "ORM not using transactions: partial writes after errors. Check that multi-step operations are wrapped in BEGIN/COMMIT.",
      "Isolation level too low: phantom reads or non-repeatable reads caused by READ COMMITTED. Bump to REPEATABLE READ or SERIALIZABLE for affected operations.",
      "Restore from backup: pg_dump backups before the corruption (you do have these). Point-in-time recovery (PITR) with continuous WAL archiving lets you replay to any second.",
      "Talk to ops + Crunchy / EDB / vendor immediately if real disk corruption is suspected. Don't experiment on the live DB.",
    ],
  },
};

const ARCH_NODES = [
  { id: 'app', x: 110, y: 18, w: 100, h: 32, label: 'Application', color: '#818cf8', desc: "Your app code. Uses a database driver (libpq, mysql-client, mongo-driver). Connection pool client-side (HikariCP, pgx pool)." },
  { id: 'pool', x: 110, y: 78, w: 100, h: 32, label: 'Connection pool', color: '#818cf8', desc: "PgBouncer / Supavisor / RDS Proxy in front of DB. Multiplexes 1000s of app conns over ~20 DB conns. Transaction-pooling mode for max efficiency." },
  { id: 'primary', x: 35, y: 138, w: 110, h: 32, label: 'Primary (RW)', color: '#f472b6', desc: "Accepts reads + writes. Writes go through WAL (write-ahead log) BEFORE data files — that's how durability works." },
  { id: 'replica', x: 175, y: 138, w: 110, h: 32, label: 'Replica (RO)', color: '#fbbf24', desc: "Streams WAL from primary, replays it. Serves read queries. Async by default (eventual consistency). Sync available — primary blocks until replica acks." },
  { id: 'wal', x: 35, y: 198, w: 110, h: 32, label: 'WAL log', color: '#f472b6', desc: "Append-only log of every change. Fsync'd on commit = durability. Archived for point-in-time recovery (PITR). Replicas stream from here." },
  { id: 'data', x: 175, y: 198, w: 110, h: 32, label: 'Data files', color: '#fbbf24', desc: "Actual table + index files. 8KB pages (PG default). Buffer cache (shared_buffers) keeps hot pages in RAM." },
];

/* ─── Sample database for sandbox — realistic e-commerce schema ─── */
const SANDBOX_SEED = `-- Sample e-commerce schema for the sandbox
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    country TEXT,
    created_at TEXT
);

CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price REAL,
    stock INTEGER
);

CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status TEXT,
    total REAL,
    created_at TEXT
);

CREATE TABLE order_items (
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    qty INTEGER,
    price REAL,
    PRIMARY KEY (order_id, product_id)
);

CREATE TABLE reviews (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    rating INTEGER,
    body TEXT,
    created_at TEXT
);

INSERT INTO users VALUES
    (1, 'Alice', 'alice@example.com', 'US', '2024-01-15'),
    (2, 'Bob',   'bob@example.com',   'UK', '2024-02-10'),
    (3, 'Cara',  'cara@example.com',  'US', '2024-03-05'),
    (4, 'Diego', 'diego@example.com', 'MX', '2024-04-20'),
    (5, 'Eve',   'eve@example.com',   'US', '2024-05-12');

INSERT INTO products VALUES
    (1, 'Wireless Headphones', 'electronics', 79.99, 50),
    (2, 'Coffee Mug',          'home',         12.99, 200),
    (3, 'Standing Desk',       'furniture',   399.00, 8),
    (4, 'USB-C Hub',           'electronics',  39.99, 75),
    (5, 'Notebook',            'office',        4.99, 500),
    (6, 'Mechanical Keyboard', 'electronics', 149.00, 25);

INSERT INTO orders VALUES
    (101, 1, 'shipped',  92.98,  '2024-06-01'),
    (102, 2, 'shipped',  399.00, '2024-06-03'),
    (103, 1, 'pending',  44.98,  '2024-06-15'),
    (104, 3, 'shipped',  154.99, '2024-06-18'),
    (105, 5, 'cancelled', 79.99, '2024-06-20'),
    (106, 3, 'shipped',  17.98,  '2024-07-01'),
    (107, 4, 'shipped',  149.00, '2024-07-05'),
    (108, 1, 'shipped',  149.00, '2024-07-08'),
    (109, 2, 'pending',  52.98,  '2024-07-12');

INSERT INTO order_items VALUES
    (101, 1, 1, 79.99),
    (101, 2, 1, 12.99),
    (102, 3, 1, 399.00),
    (103, 4, 1, 39.99),
    (103, 5, 1,  4.99),
    (104, 6, 1, 149.00),
    (104, 5, 1,   4.99),
    (104, 2, 0, 12.99),
    (105, 1, 1, 79.99),
    (106, 5, 1, 4.99),
    (106, 2, 1, 12.99),
    (107, 6, 1, 149.00),
    (108, 6, 1, 149.00),
    (109, 4, 1, 39.99),
    (109, 2, 1, 12.99);

INSERT INTO reviews VALUES
    (1, 1, 1, 5, 'Excellent sound',     '2024-06-10'),
    (2, 2, 3, 4, 'Sturdy but expensive', '2024-06-15'),
    (3, 3, 6, 5, 'Best keyboard ever',   '2024-07-02'),
    (4, 1, 2, 3, 'Just a mug',           '2024-06-20'),
    (5, 4, 6, 5, 'Worth every penny',    '2024-07-10'),
    (6, 3, 4, 4, 'Solid hub',            '2024-07-05');
`;

const CHALLENGES = [
  {
    id: 'count',
    title: '01 · Count users',
    desc: "How many users are in the database? One row, one column.",
    starter: "-- your query\nSELECT  ",
    expected: { cols: ['count'], rowCount: 1 },
    answerCheck: (rs) => rs.length > 0 && rs[0].values.length === 1 && Number(rs[0].values[0][0]) === 5,
    hint: "SELECT COUNT(*) FROM users;"
  },
  {
    id: 'where',
    title: '02 · US users only',
    desc: "Get name and email of users in the US, ordered by name.",
    starter: "-- expected: 3 rows (Alice, Cara, Eve)\nSELECT  ",
    expected: { rowCount: 3 },
    answerCheck: (rs) => {
      if (!rs.length) return false;
      const names = rs[0].values.map(v => v[0]);
      return names.length === 3 && names[0] === 'Alice' && names[1] === 'Cara' && names[2] === 'Eve';
    },
    hint: "SELECT name, email FROM users WHERE country = 'US' ORDER BY name;"
  },
  {
    id: 'join',
    title: '03 · Orders with user names',
    desc: "List each shipped order's id, user name, and total. Join orders + users.",
    starter: "-- expected: 6 shipped orders\nSELECT  ",
    expected: { rowCount: 6 },
    answerCheck: (rs) => rs.length > 0 && rs[0].values.length === 6,
    hint: "SELECT o.id, u.name, o.total FROM orders o JOIN users u ON o.user_id = u.id WHERE o.status = 'shipped';"
  },
  {
    id: 'agg',
    title: '04 · Total revenue by user',
    desc: "Sum total spent by each user (any status), highest first. Two columns: name, total.",
    starter: "-- group by user; sum total; order desc\nSELECT  ",
    expected: { rowCount: 5 },
    answerCheck: (rs) => {
      if (!rs.length) return false;
      const rows = rs[0].values;
      if (rows.length < 1) return false;
      return Number(rows[0][1]) >= 399;
    },
    hint: "SELECT u.name, SUM(o.total) AS total FROM users u JOIN orders o ON u.id = o.user_id GROUP BY u.name ORDER BY total DESC;"
  },
  {
    id: 'window',
    title: '05 · Top product per category',
    desc: "Most expensive product in each category. Use a window function (ROW_NUMBER).",
    starter: "-- expected: 4 rows (one per category)\nWITH ranked AS (\n  SELECT \n)\nSELECT  ",
    expected: { rowCount: 4 },
    answerCheck: (rs) => rs.length > 0 && rs[0].values.length === 4,
    hint: "WITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC) rn FROM products) SELECT name, category, price FROM ranked WHERE rn = 1;"
  },
  {
    id: 'recursive',
    title: '06 · Generate 1..10 with recursive CTE',
    desc: "Use WITH RECURSIVE to generate numbers 1 through 10. One column 'n'.",
    starter: "WITH RECURSIVE seq(n) AS (\n  -- base case\n  -- recursive case\n)\nSELECT  ",
    expected: { rowCount: 10 },
    answerCheck: (rs) => {
      if (!rs.length) return false;
      const rows = rs[0].values;
      if (rows.length !== 10) return false;
      return Number(rows[0][0]) === 1 && Number(rows[9][0]) === 10;
    },
    hint: "WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n < 10) SELECT n FROM seq;"
  },
];

/* ─── Storage helpers ─── */
const STORAGE_PREFIX = 'dbatlas:';
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
  schema: {
    label: 'Schema',
    icon: '▤',
    snippets: [
      {
        id: 'uuidv7-pk',
        title: 'UUIDv7 primary keys (PG 18+)',
        desc: "Timestamp-ordered UUIDs — uniqueness + sortability + non-leaking. The 2026 default for new tables.",
        code: `-- PostgreSQL 18+ has native uuidv7()
CREATE TABLE orders (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    user_id     UUID NOT NULL REFERENCES users(id),
    status      TEXT NOT NULL DEFAULT 'pending',
    total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index on user_id + created_at — most common composite for user-scoped queries
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);

-- Pre-PG-18, use the uuid-ossp or pgcrypto extension + a function
-- For older versions: id UUID PRIMARY KEY DEFAULT gen_random_uuid()
-- (gen_random_uuid is v4 — random, NOT sortable)`,
        note: "UUIDv7 prefixes a 48-bit Unix-ms timestamp, then random bytes. Sortable by creation time, distributable across nodes, doesn't leak insertion count. NUMERIC for money (not FLOAT — rounding errors). TIMESTAMPTZ over TIMESTAMP (timezone-aware)."
      },
      {
        id: 'audit-log',
        title: 'created_at / updated_at via trigger',
        desc: "Track row creation + last modification automatically. Standard on every table.",
        code: `-- Universal updated_at trigger
CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to a table
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- For full audit log (who changed what), use a separate audit table:
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT NOT NULL,
    row_id      UUID NOT NULL,
    op          TEXT NOT NULL CHECK (op IN ('INSERT','UPDATE','DELETE')),
    actor_id    UUID,
    before      JSONB,
    after       JSONB,
    at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_table_row ON audit_log (table_name, row_id);
CREATE INDEX idx_audit_at ON audit_log (at DESC);`,
        note: "updated_at via trigger means the app can't forget. For audit logs of who-changed-what, add a session-level setting (SET LOCAL app.user_id = '...') and read it in the trigger via current_setting(). Many ORMs handle updated_at app-side; trigger is the belt-and-suspenders version."
      },
      {
        id: 'soft-delete-done-right',
        title: 'Soft delete — only when you must',
        desc: "Most apps default to soft delete too quickly. Here's the careful version.",
        code: `-- Anti-pattern (don't do by default):
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMPTZ;
-- Now every query must remember: WHERE deleted_at IS NULL

-- Better: a partial unique index that ignores deleted rows
CREATE UNIQUE INDEX users_email_active
    ON users (LOWER(email))
    WHERE deleted_at IS NULL;
-- Now alice@x.com can be re-registered after her account is deleted

-- Better still: separate ARCHIVED table
CREATE TABLE users_archived (LIKE users INCLUDING ALL);

-- On "delete": move row to archive, hard-delete from main
WITH moved AS (
    DELETE FROM users WHERE id = $1 RETURNING *
)
INSERT INTO users_archived SELECT * FROM moved;`,
        note: "Soft delete columns are sneaky: every JOIN, every query, every report must filter. Foreign keys still pin the row. The archive-table pattern keeps the main schema clean. Consider an event log (event-sourced) for true history."
      },
      {
        id: 'polymorphic',
        title: 'Polymorphic associations — the tradeoffs',
        desc: "One table referring to multiple other tables (comments on posts OR videos OR products). Three approaches.",
        code: `-- APPROACH 1: type + id columns (ORM-friendly but no FK)
CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    target_type TEXT NOT NULL,        -- 'post', 'video', 'product'
    target_id   UUID NOT NULL,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Can't enforce FK across table_type. Application checks needed.

-- APPROACH 2: separate FK columns, CHECK exactly one set
CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    post_id     UUID REFERENCES posts(id),
    video_id    UUID REFERENCES videos(id),
    product_id  UUID REFERENCES products(id),
    body        TEXT NOT NULL,
    CHECK ((post_id IS NOT NULL)::int + (video_id IS NOT NULL)::int +
           (product_id IS NOT NULL)::int = 1)
);
-- FKs enforced. Schema explicit. Adding a new commentable type needs a migration.

-- APPROACH 3: shared "commentable" identity table
CREATE TABLE commentables (id UUID PRIMARY KEY);
-- Each post / video / product also inserts into commentables with same id
CREATE TABLE comments (
    id              UUID PRIMARY KEY DEFAULT uuidv7(),
    commentable_id  UUID NOT NULL REFERENCES commentables(id),
    body            TEXT NOT NULL
);`,
        note: "Approach 2 is usually right: a few sparse columns is cheap, FKs are real. Approach 1 sacrifices integrity for schema simplicity — Rails ActiveRecord does this. Approach 3 is academically pure but adds an indirection. Pick deliberately."
      },
      {
        id: 'star-schema',
        title: 'STAR schema for analytics',
        desc: "Facts + dimensions. The standard analytics shape for BI tools (Tableau, Looker, Metabase).",
        code: `-- DIMENSIONS — small lookup tables, descriptive attributes
CREATE TABLE dim_date (
    date_key    DATE PRIMARY KEY,
    year        INT NOT NULL,
    quarter     INT NOT NULL,
    month       INT NOT NULL,
    day_of_week INT NOT NULL,
    is_weekend  BOOLEAN NOT NULL
);

CREATE TABLE dim_product (
    product_key BIGINT PRIMARY KEY,
    sku         TEXT NOT NULL,
    name        TEXT NOT NULL,
    category    TEXT,
    brand       TEXT
);

CREATE TABLE dim_user (
    user_key    BIGINT PRIMARY KEY,
    country     TEXT,
    cohort      TEXT,
    plan        TEXT
);

-- FACT — large, numerical, foreign keys to dims
CREATE TABLE fact_orders (
    order_key   BIGSERIAL PRIMARY KEY,
    date_key    DATE       NOT NULL REFERENCES dim_date(date_key),
    product_key BIGINT     NOT NULL REFERENCES dim_product(product_key),
    user_key    BIGINT     NOT NULL REFERENCES dim_user(user_key),
    qty         INT        NOT NULL,
    unit_price  NUMERIC(10,2) NOT NULL,
    total       NUMERIC(12,2) NOT NULL
);

-- Aggregations join fact → dim by FK; group by dim attributes
SELECT d.year, d.month, p.category, SUM(f.total)
FROM fact_orders f
JOIN dim_date d ON f.date_key = d.date_key
JOIN dim_product p ON f.product_key = p.product_key
GROUP BY d.year, d.month, p.category
ORDER BY d.year, d.month, p.category;`,
        note: "Facts are huge (millions/billions of rows); dimensions stay small. Read-optimized: BI tools generate SQL that joins facts to dims. Snowflake schema normalizes dims further (dim_product → dim_brand); usually not worth it. Materialized rollups (week_sales) speed common queries."
      },
    ],
  },
  queries: {
    label: 'Queries',
    icon: '⟆',
    snippets: [
      {
        id: 'window-funcs',
        title: 'Window functions — top N per group',
        desc: "The single most powerful SQL feature most devs underuse. ROW_NUMBER + PARTITION solves 'most recent per user'-class queries.",
        code: `-- 5 most recent orders per user
WITH ranked AS (
    SELECT
        o.*,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders o
    WHERE o.status = 'shipped'
)
SELECT id, user_id, total, created_at
FROM ranked
WHERE rn <= 5;

-- Running totals
SELECT
    created_at,
    total,
    SUM(total) OVER (ORDER BY created_at) AS running_total,
    SUM(total) OVER (PARTITION BY user_id ORDER BY created_at) AS user_running_total
FROM orders;

-- Compare each row to its previous (LAG) and next (LEAD)
SELECT
    created_at,
    total,
    LAG(total)  OVER (ORDER BY created_at) AS prev_total,
    LEAD(total) OVER (ORDER BY created_at) AS next_total,
    total - LAG(total) OVER (ORDER BY created_at) AS delta
FROM orders
WHERE user_id = $1;

-- Variants:
--   ROW_NUMBER  — unique ranks, ties broken arbitrarily
--   RANK        — same value = same rank; gaps after ties (1,2,2,4)
--   DENSE_RANK  — same value = same rank; no gaps (1,2,2,3)
--   NTILE(4)    — divide into N buckets`,
        note: "Three OVER clauses combine: PARTITION BY (group), ORDER BY (sort within group), frame (RANGE/ROWS BETWEEN). Window functions don't collapse rows like GROUP BY — they add columns to every row. Read Markus Winand's intro at modern-sql.com/feature/window-functions."
      },
      {
        id: 'cte',
        title: 'CTEs — readable multi-step queries',
        desc: "WITH clauses name intermediate results. Replaces nested subqueries; makes complex queries readable.",
        code: `-- Customer cohort analysis
WITH first_order AS (
    SELECT user_id, MIN(created_at)::date AS cohort_date
    FROM orders
    GROUP BY user_id
),
cohort_size AS (
    SELECT cohort_date, COUNT(*) AS users
    FROM first_order
    GROUP BY cohort_date
),
retained AS (
    SELECT
        f.cohort_date,
        (o.created_at::date - f.cohort_date) AS days_since,
        COUNT(DISTINCT o.user_id) AS returning
    FROM first_order f
    JOIN orders o ON o.user_id = f.user_id
    WHERE o.created_at::date > f.cohort_date
    GROUP BY f.cohort_date, days_since
)
SELECT
    cs.cohort_date,
    cs.users AS cohort_size,
    r.days_since,
    r.returning,
    ROUND(100.0 * r.returning / cs.users, 1) AS pct
FROM cohort_size cs
JOIN retained r ON r.cohort_date = cs.cohort_date
ORDER BY cs.cohort_date, r.days_since;`,
        note: "Each CTE is a named result, computed once, available below. PostgreSQL materializes CTEs by default (a fence the planner can't push through) — for non-recursive CTEs use 'WITH ... AS NOT MATERIALIZED' in PG 12+ for inline expansion. Best for readability; the planner can usually do as well or better."
      },
      {
        id: 'upsert',
        title: 'INSERT ... ON CONFLICT (upsert)',
        desc: "Atomically insert OR update on conflict. PostgreSQL's standard idiom; comparable to MySQL's ON DUPLICATE KEY.",
        code: `-- Insert a user, update name if email exists
INSERT INTO users (email, name, country)
VALUES ('alice@example.com', 'Alice Smith', 'US')
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    country = EXCLUDED.country,
    updated_at = now()
RETURNING id, (xmax = 0) AS inserted;
-- xmax = 0 → newly inserted; xmax != 0 → updated existing

-- Insert if missing, do nothing if exists
INSERT INTO users (email, name) VALUES ('bob@example.com', 'Bob')
ON CONFLICT (email) DO NOTHING
RETURNING id;
-- Empty if conflict happened

-- Bulk upsert with multiple rows
INSERT INTO products (sku, name, price)
VALUES
    ('SKU-1', 'Widget A', 9.99),
    ('SKU-2', 'Widget B', 19.99),
    ('SKU-3', 'Widget C', 29.99)
ON CONFLICT (sku) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price;`,
        note: "EXCLUDED refers to the row that would have been inserted. ON CONFLICT requires a unique constraint or unique index on the conflict column. For partial unique indexes, use ON CONFLICT ON CONSTRAINT constraint_name. MySQL: INSERT ... ON DUPLICATE KEY UPDATE col = VALUES(col); SQLite: INSERT ... ON CONFLICT same as PG."
      },
      {
        id: 'keyset-pagination',
        title: 'Keyset pagination (no OFFSET)',
        desc: "OFFSET 10000 makes the DB count past 10000 rows. Keyset pagination uses the last row's key — O(1) per page.",
        code: `-- BAD: OFFSET pagination — slow on deep pages
SELECT * FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 10000;
-- DB scans + discards 10000 rows. Worse with each page.

-- GOOD: keyset pagination
-- First page
SELECT * FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20;
-- Remember the last (created_at, id) of this page → cursor

-- Next page: WHERE clause uses the cursor
SELECT * FROM orders
WHERE (created_at, id) < ($cursor_created_at, $cursor_id)
ORDER BY created_at DESC, id DESC
LIMIT 20;
-- Uses index on (created_at, id) directly. O(log n) per page, regardless of depth.

-- Required: index on the ORDER BY columns
CREATE INDEX idx_orders_created_id ON orders (created_at DESC, id DESC);`,
        note: "Tuple comparison (a, b) < (x, y) compares lexicographically: a < x OR (a = x AND b < y). Critical for stable ordering when many rows share the same created_at. Add id as tiebreaker. Cursor can be base64-encoded for opaque API responses."
      },
      {
        id: 'lateral-join',
        title: 'LATERAL joins — correlated subquery as table',
        desc: "Inner query references outer query columns. Cleaner than scalar subqueries; sometimes the only way.",
        code: `-- Latest 3 orders per user — without window function
SELECT u.id, u.name, o.id AS order_id, o.created_at, o.total
FROM users u
JOIN LATERAL (
    SELECT id, created_at, total
    FROM orders
    WHERE user_id = u.id          -- references outer u
    ORDER BY created_at DESC
    LIMIT 3
) o ON TRUE;

-- LATERAL gives you "for each row in outer, run this inner subquery"
-- ON TRUE because the inner query has no extra join condition

-- Use LEFT JOIN LATERAL when the inner can be empty
SELECT u.id, u.name, o.id AS last_order_id
FROM users u
LEFT JOIN LATERAL (
    SELECT id FROM orders WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1
) o ON TRUE;
-- Users without orders get NULL for last_order_id`,
        note: "LATERAL is to JOINs what scalar subqueries are to SELECT — but better, because the inner can return multiple rows or columns. Sometimes faster than window functions (planner can short-circuit at LIMIT). Always benchmark."
      },
    ],
  },
  indexes: {
    label: 'Indexes',
    icon: '↓',
    snippets: [
      {
        id: 'composite',
        title: 'Composite indexes — column order matters',
        desc: "(a, b) helps queries on a, or a + b. Doesn't help queries on b alone (unless skip-scan in PG 18).",
        code: `-- For a query like: WHERE user_id = $1 AND created_at >= $2
CREATE INDEX idx_orders_user_created
    ON orders (user_id, created_at DESC);
-- Order: equality column FIRST, range column SECOND
-- Index helps:
--   WHERE user_id = ?
--   WHERE user_id = ? AND created_at >= ?
-- Index does NOT help (well):
--   WHERE created_at >= ?              (just second column)

-- PG 18 added "skip scan" — sometimes uses the index for leading-col-equals-any
-- Don't rely on it; design index for the common case.

-- For (status, user_id, created_at):
--   WHERE status = 'pending' AND user_id = ?     ✓ uses prefix
--   WHERE user_id = ?                            ✗ doesn't (unless skip scan)
-- Put highest-selectivity equality column first; range column last.

-- Check which index is used
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders WHERE user_id = 1 AND created_at >= '2024-01-01';`,
        note: "Index design rule: equality columns FIRST (most selective first), then range/sort columns. ORDER BY can use the index if the columns + sort direction match. Composite index ENDING in the column you ORDER BY = sort for free."
      },
      {
        id: 'partial',
        title: 'Partial indexes — index a slice',
        desc: "Index only matching rows. Smaller, focused, sometimes dramatically faster.",
        code: `-- 99% of orders are 'shipped'. Only the pending ones need fast lookup.
CREATE INDEX idx_orders_pending
    ON orders (user_id, created_at)
    WHERE status = 'pending';

-- Now: SELECT * FROM orders WHERE status='pending' AND user_id = ?
-- Uses idx_orders_pending — much smaller than full-table index.

-- Common cases:
--   WHERE deleted_at IS NULL      -- only active rows
--   WHERE status IN ('queued','processing')   -- only "active" work
--   WHERE archived = false         -- only live

-- Unique constraint that ignores soft-deleted rows
CREATE UNIQUE INDEX users_email_active
    ON users (LOWER(email))
    WHERE deleted_at IS NULL;
-- alice@x.com can re-register after deletion`,
        note: "Partial indexes are smaller, faster to maintain, and the planner uses them automatically when the query's WHERE clause matches. The single best technique most teams underuse. PostgreSQL only — MySQL doesn't have these."
      },
      {
        id: 'covering',
        title: 'Covering indexes — INCLUDE clause',
        desc: "Add non-key columns to the index so the query is answered from the index alone, no table access.",
        code: `-- Common query: get email + name by user id
SELECT email, name FROM users WHERE id = $1;

-- Normal index on (id) — finds row, then fetches table for email + name
-- Covering index — INCLUDE email + name in the index leaves
CREATE INDEX idx_users_id_cover
    ON users (id) INCLUDE (email, name);

-- EXPLAIN now shows "Index Only Scan" — no heap fetch
-- 2-3x faster on cold cache (one I/O instead of two+)

-- Trade-off: index is bigger, writes are slower (index also updated)
-- Use for HOT queries where you've measured the win.`,
        note: "INCLUDE was added in PostgreSQL 11. Pre-11, you'd add the columns to the index key (works but bloats the B-tree comparison). For 'index-only scan' to actually skip the heap, the visibility map must show the page is all-visible — VACUUM keeps this updated. SQL Server has INCLUDE too; MySQL doesn't natively but you can list extra columns in the key."
      },
      {
        id: 'expression',
        title: 'Expression indexes — index a computation',
        desc: "Index the result of a function so the planner can use it for queries with the same expression.",
        code: `-- Without expression index, this can't use the email index:
SELECT * FROM users WHERE LOWER(email) = $1;

-- Create the expression index
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

-- Now LOWER(email) = $1 IS indexed.
-- Useful for case-insensitive lookups, normalized comparisons.

-- Date truncation
CREATE INDEX idx_orders_date ON orders (date_trunc('day', created_at));
-- WHERE date_trunc('day', created_at) = '2024-06-01' uses this index

-- Better alternative for date queries: rewrite as range
CREATE INDEX idx_orders_created ON orders (created_at);
-- Then: WHERE created_at >= '2024-06-01' AND created_at < '2024-06-02'
-- Faster, more flexible.

-- JSONB field as expression index
CREATE INDEX idx_users_locale ON users ((preferences->>'locale'));
-- Now WHERE preferences->>'locale' = 'en' uses the index`,
        note: "Expression must match exactly — `LOWER(email)` index doesn't help `lower(email)` (case-sensitive — but those ARE the same in SQL). Best practice: define a helper view or generated column for the expression if you query it often."
      },
      {
        id: 'gin-text',
        title: 'GIN + pg_trgm for LIKE \'%search%\'',
        desc: "Leading-wildcard LIKE doesn't use B-tree. pg_trgm extension + GIN index does.",
        code: `-- Enable trigram extension (once per database)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index using trigrams
CREATE INDEX idx_products_name_trgm
    ON products USING GIN (name gin_trgm_ops);

-- Now these queries use the index:
SELECT * FROM products WHERE name LIKE '%keyboard%';
SELECT * FROM products WHERE name ILIKE '%mech%';

-- Bonus: similarity ranking
SELECT name, similarity(name, 'mechnical kbd') AS sim
FROM products
WHERE name % 'mechnical kbd'        -- % is the trigram operator
ORDER BY sim DESC
LIMIT 5;
-- Catches typos with fuzzy matching

-- For full-text search: tsvector + GIN
ALTER TABLE products ADD COLUMN search_vec tsvector
    GENERATED ALWAYS AS (to_tsvector('english', name)) STORED;
CREATE INDEX idx_products_search ON products USING GIN (search_vec);
-- SELECT * FROM products WHERE search_vec @@ plainto_tsquery('english', 'mechanical');`,
        note: "Trigram = 3-char windows. pg_trgm decomposes 'keyboard' into 'key','eyb','ybo','boa','oar','ard' (with padding). GIN indexes the trigrams. For SUBSTRING search, this is the standard PostgreSQL answer. Full-text search via tsvector is for word-level (with stemming, stop words)."
      },
    ],
  },
  migrations: {
    label: 'Migrations',
    icon: '⇄',
    snippets: [
      {
        id: 'add-column-safe',
        title: 'Add column without rewriting the table',
        desc: "PostgreSQL 11+: adding a column with a CONSTANT default is instant. Older versions rewrite the whole table.",
        code: `-- PG 11+: instant
ALTER TABLE users ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;
-- Catalog change only. No table rewrite. Safe on huge tables.

-- PRE-PG-11 (or volatile defaults like uuidv7()): rewrites the table
-- ALTER TABLE users ADD COLUMN id_v7 UUID NOT NULL DEFAULT uuidv7();
-- This DOES rewrite — uuidv7() is volatile (different per row).

-- For volatile defaults on huge tables: two-step
ALTER TABLE users ADD COLUMN id_v7 UUID;
-- Backfill in batches:
UPDATE users SET id_v7 = uuidv7()
WHERE id IN (SELECT id FROM users WHERE id_v7 IS NULL LIMIT 10000);
-- (repeat in app loop)
ALTER TABLE users ALTER COLUMN id_v7 SET NOT NULL;
ALTER TABLE users ALTER COLUMN id_v7 SET DEFAULT uuidv7();`,
        note: "ALTER TABLE with constant default = catalog change only since PG 11. Volatile defaults (uuidv7(), random(), now()) still rewrite. For huge tables: add nullable, backfill in batches with a sleep/throttle, then SET NOT NULL + SET DEFAULT."
      },
      {
        id: 'rename-column',
        title: 'Rename a column under load',
        desc: "Renaming directly breaks anything still using the old name. Two-phase via app code.",
        code: `-- Bad: instant rename, but breaks every deployed app instance still using old name
-- ALTER TABLE users RENAME COLUMN handle TO username;

-- Good: dual-column, dual-write transition
-- 1. Add the new column
ALTER TABLE users ADD COLUMN username TEXT;

-- 2. App code: write to BOTH columns (handle = username, going forward)

-- 3. Backfill existing rows
UPDATE users SET username = handle WHERE username IS NULL;

-- 4. App code: read from new column; still write to both

-- 5. Drop old column when all app instances are on new code
ALTER TABLE users DROP COLUMN handle;

-- For "rename" of a TABLE: similar via a view
CREATE TABLE customers (LIKE users INCLUDING ALL);
INSERT INTO customers SELECT * FROM users;
-- Switch app to write to customers (via view) ... eventually drop users`,
        note: "The fundamental rule: deployed code and DB schema must be compatible BOTH WAYS for the duration of any rolling deploy. Two-phase migrations are the price. Tools that pretend otherwise (rename-in-place) cause production incidents."
      },
      {
        id: 'create-index-concurrent',
        title: 'CREATE INDEX CONCURRENTLY',
        desc: "Build index without blocking writes. Always use this in production.",
        code: `-- Bad: blocks writes while building
CREATE INDEX idx_orders_user_id ON orders (user_id);

-- Good: builds without blocking
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders (user_id);
-- Slower (two passes), but writes continue during build.

-- CONCURRENTLY can't run inside a transaction.
-- If interrupted, leaves an INVALID index behind:
SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_%';
-- Check: SELECT indrelid::regclass, indisvalid FROM pg_index WHERE NOT indisvalid;
-- Drop + recreate:
DROP INDEX CONCURRENTLY idx_orders_user_id;
CREATE INDEX CONCURRENTLY idx_orders_user_id ON orders (user_id);

-- DROP INDEX in prod: also use CONCURRENTLY
DROP INDEX CONCURRENTLY idx_orders_obsolete;`,
        note: "CONCURRENTLY needs two table scans + extra time but doesn't take an AccessExclusiveLock. Migration tools (Alembic, Flyway) often need 'transactional = false' for this. Failed concurrent builds leave invalid indexes — they're not used but waste space; drop them."
      },
      {
        id: 'big-update',
        title: 'Big UPDATEs in batches',
        desc: "UPDATE 100M rows in one statement = long lock + huge WAL spike + table bloat. Batch it.",
        code: `-- BAD: massive single UPDATE
-- UPDATE orders SET status = 'archived' WHERE created_at < '2023-01-01';
-- Locks rows for the duration. WAL spike. Replicas lag. Possible OOM.

-- GOOD: batched UPDATE in a loop
-- (Run from app, not as one SQL statement)
DO $$
DECLARE
    rows_updated INTEGER := 1;
BEGIN
    WHILE rows_updated > 0 LOOP
        WITH batch AS (
            SELECT id FROM orders
            WHERE created_at < '2023-01-01' AND status != 'archived'
            ORDER BY id
            LIMIT 5000
        )
        UPDATE orders SET status = 'archived'
        WHERE id IN (SELECT id FROM batch);

        GET DIAGNOSTICS rows_updated = ROW_COUNT;
        COMMIT;
        PERFORM pg_sleep(0.1);   -- give other workloads a breath
    END LOOP;
END $$;`,
        note: "Each batch is its own transaction. WAL chunks stay small; replicas keep up; VACUUM can clean bloat between batches. Run from app code for control + observability. Don't hold one big transaction."
      },
    ],
  },
  tx: {
    label: 'Transactions',
    icon: '◯',
    snippets: [
      {
        id: 'optimistic-lock',
        title: 'Optimistic locking with a version column',
        desc: "Don't hold a row lock during user input. Check version on update; retry on conflict.",
        code: `-- Add a version column
ALTER TABLE orders ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- App: read the row + version
SELECT id, status, total, version FROM orders WHERE id = $1;
-- → row { id: 101, status: 'pending', total: 99.00, version: 5 }

-- ... user edits in UI ...

-- Update — atomic check on version
UPDATE orders
SET status = $2, total = $3, version = version + 1
WHERE id = $1 AND version = $4   -- $4 is the version the user saw
RETURNING version;

-- If RETURNING is empty → someone else updated since you read; retry.
-- Pattern:
--   1. Read row + version
--   2. User makes changes
--   3. UPDATE ... WHERE id = ? AND version = ?
--   4. If 0 rows affected → re-read, present conflict to user, retry`,
        note: "Optimistic locking shines when conflicts are rare (most app data). No DB lock held during user think time. The version column also doubles as audit info. For server-to-server retries, automated retry with exponential backoff is standard."
      },
      {
        id: 'pessimistic-lock',
        title: 'SELECT FOR UPDATE — pessimistic locking',
        desc: "When you MUST process a row exclusively (queues, money transfers). Lock + work + commit.",
        code: `-- Take next pending job exclusively
BEGIN;

SELECT id, payload FROM jobs
WHERE status = 'queued'
ORDER BY created_at
FOR UPDATE SKIP LOCKED        -- skip rows other workers have locked
LIMIT 1;

-- Process the job in the app ...

UPDATE jobs SET status = 'done', completed_at = now()
WHERE id = $1;

COMMIT;

-- Why SKIP LOCKED: multiple workers can each grab a different job
-- without waiting. Without it, they queue behind the first one.

-- Money transfer: lock BOTH accounts in CONSISTENT ORDER (smallest id first)
-- to avoid deadlock
BEGIN;
SELECT id, balance FROM accounts
WHERE id IN ($from, $to)
ORDER BY id
FOR UPDATE;

UPDATE accounts SET balance = balance - $amount WHERE id = $from;
UPDATE accounts SET balance = balance + $amount WHERE id = $to;
COMMIT;`,
        note: "FOR UPDATE locks rows. FOR NO KEY UPDATE locks but allows other transactions to take FK references (in PG, recommended when not changing the PK). SKIP LOCKED is critical for queue patterns — first standardized in PG 9.5, copied by other engines later."
      },
      {
        id: 'serializable-retry',
        title: 'SERIALIZABLE + retry pattern',
        desc: "PostgreSQL's SSI is fast and correct, but txns can abort with 40001. The app must retry.",
        code: `-- Pseudocode for SERIALIZABLE retry loop
function withSerializable(work) {
    let attempts = 0;
    const MAX = 5;
    while (true) {
        try {
            const result = db.transaction({ isolation: 'serializable' }, work);
            return result;
        } catch (err) {
            if (err.code === '40001' && attempts++ < MAX) {
                // serialization_failure — retry with backoff
                const delay = 50 * Math.pow(2, attempts) + Math.random() * 50;
                sleep(delay);
                continue;
            }
            throw err;
        }
    }
}

-- In SQL:
BEGIN ISOLATION LEVEL SERIALIZABLE;
-- ... queries that read + write related data
COMMIT;
-- If COMMIT throws 40001, restart the whole txn.

-- DON'T retry inside the same connection without ROLLBACK.
-- DON'T retry forever — cap with backoff + max attempts.`,
        note: "PostgreSQL's Serializable Snapshot Isolation (SSI) is the rare combo of correct + fast. The trade-off: occasional 40001 errors. The app MUST implement retry. Worth it for transactions where lost-update / write-skew bugs are catastrophic (money, inventory)."
      },
    ],
  },
  performance: {
    label: 'Performance',
    icon: '⚡',
    snippets: [
      {
        id: 'explain',
        title: 'Reading EXPLAIN ANALYZE',
        desc: "The single most important debugging tool. Reads bottom-up. Look for big numbers + plan-vs-actual divergence.",
        code: `EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.name, SUM(o.total)
FROM users u
JOIN orders o ON o.user_id = u.id
WHERE u.country = 'US' AND o.status = 'shipped'
GROUP BY u.name
ORDER BY SUM(o.total) DESC;

/*
 Sort  (cost=42.50..43.00 rows=200 width=40) (actual time=2.5..2.6 rows=3 loops=1)
   Sort Key: (sum(o.total)) DESC
   Sort Method: quicksort  Memory: 25kB
   Buffers: shared hit=15
   ->  HashAggregate  (cost=33.50..36.00 rows=200 width=40) (actual time=2.1..2.2 rows=3 loops=1)
         Group Key: u.name
         Buffers: shared hit=15
         ->  Hash Join  (cost=12.50..28.00 rows=1100 width=40) (actual time=1.0..2.0 rows=7 loops=1)
               Hash Cond: (o.user_id = u.id)
               ->  Seq Scan on orders o  (cost=0.00..12.00 rows=550 width=12)
                     Filter: (status = 'shipped')
                     Rows Removed by Filter: 3
               ->  Hash  (cost=10.00..10.00 rows=200 width=36)
                     ->  Seq Scan on users u  (cost=0.00..10.00 rows=3 width=36)
                           Filter: (country = 'US')
                           Rows Removed by Filter: 2
 Planning Time: 0.2 ms
 Execution Time: 2.7 ms
*/`,
        note: "Read bottom-up. Each node has cost (planner estimate), actual time/rows (real), and buffers (I/O). Compare estimated vs actual rows — large divergence = stale statistics. Sort/Hash/Seq Scan/Index Scan are the most common operators. Paste full output into explain.depesz.com for visualization."
      },
      {
        id: 'matview',
        title: 'Materialized views for pre-aggregated rollups',
        desc: "Views are virtual (recomputed on every query). Materialized views are stored — fast reads, manual refresh.",
        code: `-- Pre-aggregate daily revenue
CREATE MATERIALIZED VIEW daily_revenue AS
SELECT
    created_at::date AS day,
    COUNT(*)         AS order_count,
    SUM(total)       AS revenue,
    COUNT(DISTINCT user_id) AS unique_users
FROM orders
WHERE status = 'shipped'
GROUP BY created_at::date;

CREATE UNIQUE INDEX ON daily_revenue (day);

-- Query the matview as if it were a table — already aggregated, fast
SELECT * FROM daily_revenue WHERE day >= '2024-06-01';

-- Refresh after underlying data changes
REFRESH MATERIALIZED VIEW daily_revenue;
-- Concurrently — doesn't block reads (needs UNIQUE index above)
REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue;

-- Schedule refresh via cron / pg_cron extension:
-- SELECT cron.schedule('refresh-daily-rev', '0 * * * *',
--   $$ REFRESH MATERIALIZED VIEW CONCURRENTLY daily_revenue $$);`,
        note: "Tradeoff: stale data between refreshes. Right for analytics dashboards where minute-fresh is fine. REFRESH CONCURRENTLY needs a unique index. For event-driven freshness, use triggers to maintain summary tables instead — more work, real-time accuracy."
      },
      {
        id: 'query-rewrite',
        title: 'Query rewriting patterns',
        desc: "Same result, different shape. Sometimes the planner picks a much better plan.",
        code: `-- BAD: NOT IN can't use NULL semantics well, often slow
SELECT * FROM users
WHERE id NOT IN (SELECT user_id FROM banned_users);

-- BETTER: LEFT JOIN + WHERE NULL
SELECT u.*
FROM users u
LEFT JOIN banned_users b ON b.user_id = u.id
WHERE b.user_id IS NULL;

-- OR: NOT EXISTS (often planner's favorite)
SELECT u.* FROM users u
WHERE NOT EXISTS (SELECT 1 FROM banned_users b WHERE b.user_id = u.id);

-- Avoid OR by rewriting as UNION ALL when each side is indexable
-- BAD: WHERE email = $1 OR phone = $2 (often a single index doesn't help)
-- BETTER:
SELECT * FROM users WHERE email = $1
UNION ALL
SELECT * FROM users WHERE phone = $2 AND email != $1;

-- EXISTS over JOIN when you only need to test existence
-- BAD: SELECT u.* FROM users u JOIN orders o ON o.user_id = u.id;  -- dupes!
-- GOOD: SELECT u.* FROM users u WHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);`,
        note: "Query rewriting is craft. The planner makes good choices most of the time, but for complex queries multiple equivalent forms can have wildly different plans. Test with EXPLAIN ANALYZE on real data."
      },
    ],
  },
  json: {
    label: 'JSON',
    icon: '{}',
    snippets: [
      {
        id: 'jsonb-basics',
        title: 'JSONB — flexible schema in PostgreSQL',
        desc: "Stored as binary, indexable, queryable. The 'NoSQL inside Postgres' feature.",
        code: `CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    email       TEXT UNIQUE NOT NULL,
    preferences JSONB NOT NULL DEFAULT '{}'::jsonb
);

INSERT INTO users (email, preferences) VALUES
    ('alice@x.com', '{"locale": "en", "theme": "dark", "tags": ["beta", "early"]}'),
    ('bob@x.com',   '{"locale": "fr", "theme": "light"}');

-- Access via -> (returns JSONB) and ->> (returns TEXT)
SELECT email, preferences->'theme'         FROM users;   -- "dark"  (JSONB)
SELECT email, preferences->>'theme'        FROM users;   -- dark    (text)
SELECT email, preferences#>>'{nested,key}' FROM users;   -- nested path as text

-- WHERE on JSON fields
SELECT * FROM users WHERE preferences->>'locale' = 'en';
SELECT * FROM users WHERE preferences->'tags' ? 'beta';   -- ? = "contains key"
SELECT * FROM users WHERE preferences @> '{"theme": "dark"}';  -- contains

-- Update a key
UPDATE users
SET preferences = preferences || '{"locale": "es"}'::jsonb
WHERE email = 'alice@x.com';

-- Remove a key
UPDATE users SET preferences = preferences - 'theme';

-- Set deep path
UPDATE users SET preferences = jsonb_set(preferences, '{notifications,email}', 'true');`,
        note: "JSONB is faster for queries but slower to write than JSON (text). For schema you'll query — JSONB. For raw blobs you only read whole — JSON or TEXT. Don't store relational data in JSONB just because it's flexible — joins on JSON fields are slow."
      },
      {
        id: 'jsonb-index',
        title: 'Indexing JSONB',
        desc: "GIN for general containment; B-tree on specific fields for equality.",
        code: `-- GIN index — supports @>, ?, ?&, ?| operators on any path
CREATE INDEX idx_users_prefs_gin ON users USING GIN (preferences);
-- Uses jsonb_ops by default; jsonb_path_ops is smaller + faster but limited to @>:
-- CREATE INDEX ON users USING GIN (preferences jsonb_path_ops);

-- Now indexed:
SELECT * FROM users WHERE preferences @> '{"locale": "en"}';
SELECT * FROM users WHERE preferences ? 'theme';

-- B-tree on a specific extracted field — much smaller, faster for equality
CREATE INDEX idx_users_locale ON users ((preferences->>'locale'));

-- Now indexed:
SELECT * FROM users WHERE preferences->>'locale' = 'en';
-- Faster than GIN for this one specific query.

-- For frequently-queried fields, extract to a real column with generated:
ALTER TABLE users ADD COLUMN locale TEXT
    GENERATED ALWAYS AS (preferences->>'locale') STORED;
CREATE INDEX ON users (locale);`,
        note: "Use GIN when you query many different paths within JSON. Use a B-tree on the extracted field when one path dominates. Generated columns (PG 12+) materialize the value — most readable + indexable. PG 18 made generated columns virtual by default; mark STORED if you index them."
      },
    ],
  },
  vector: {
    label: 'Vector',
    icon: '∴',
    snippets: [
      {
        id: 'pgvector-setup',
        title: 'pgvector — embeddings in PostgreSQL',
        desc: "Add vector search to your relational DB without a separate engine. The 2026 default for new AI apps.",
        code: `-- Once per database
CREATE EXTENSION IF NOT EXISTS vector;

-- Vector column — dimension matches your embedding model
-- text-embedding-3-small = 1536, text-embedding-3-large = 3072
CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    title       TEXT NOT NULL,
    body        TEXT,
    embedding   VECTOR(1536),    -- e.g. OpenAI text-embedding-3-small
    metadata    JSONB,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert with embedding from your model
INSERT INTO documents (title, body, embedding) VALUES
    ('How to plumb', 'Plumbing involves...', '[0.1, 0.2, ...]'::vector);

-- Find similar documents by cosine distance
-- (<=> is cosine; <-> is L2; <#> is inner product)
SELECT id, title, embedding <=> $1::vector AS distance
FROM documents
ORDER BY embedding <=> $1::vector
LIMIT 10;

-- HNSW index for fast approximate nearest neighbor
CREATE INDEX ON documents
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
-- Now ORDER BY embedding <=> $1 uses the index — O(log n) ANN search`,
        note: "HNSW = Hierarchical Navigable Small World. The dominant ANN algorithm. m = max connections per layer (16 typical). ef_construction = build-time effort (higher = better recall, slower build). At query time: SET hnsw.ef_search = 100; — higher = more recall, slower."
      },
      {
        id: 'hybrid-search',
        title: 'Hybrid search — vector + keyword + metadata',
        desc: "Pure vector search misses exact-keyword matches. Combine with full-text + filters for the best results.",
        code: `-- Hybrid: combine semantic similarity with keyword match + metadata filter
WITH semantic AS (
    SELECT id, 1 - (embedding <=> $1::vector) AS sem_score
    FROM documents
    WHERE metadata->>'lang' = 'en'             -- prefilter
    ORDER BY embedding <=> $1::vector
    LIMIT 50
),
keyword AS (
    SELECT id, ts_rank(to_tsvector('english', body), plainto_tsquery('english', $2)) AS kw_score
    FROM documents
    WHERE to_tsvector('english', body) @@ plainto_tsquery('english', $2)
        AND metadata->>'lang' = 'en'
    LIMIT 50
)
SELECT d.id, d.title,
       COALESCE(s.sem_score, 0) * 0.7 + COALESCE(k.kw_score, 0) * 0.3 AS score
FROM documents d
LEFT JOIN semantic s ON s.id = d.id
LEFT JOIN keyword  k ON k.id = d.id
WHERE s.id IS NOT NULL OR k.id IS NOT NULL
ORDER BY score DESC
LIMIT 10;

-- RRF (reciprocal rank fusion) — sometimes better than score blending
-- Re-rank with a cross-encoder on the top 50 for highest quality`,
        note: "Semantic search finds meaning ('how do I fix a leaky pipe' → 'plumbing repair'). Keyword search nails exact terms (model numbers, names). Filter (lang, category, date) cuts the candidate set. Combine for production RAG. Cross-encoder rerank on top-K (50→10) is the quality cherry on top."
      },
      {
        id: 'embedding-chunks',
        title: 'Chunked documents for RAG',
        desc: "Don't embed whole documents — embed chunks. Standard RAG schema.",
        code: `CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    source_url  TEXT,
    title       TEXT,
    full_text   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE chunks (
    id           UUID PRIMARY KEY DEFAULT uuidv7(),
    document_id  UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_idx    INTEGER NOT NULL,        -- 0, 1, 2... within document
    content      TEXT NOT NULL,
    embedding    VECTOR(1536),
    token_count  INTEGER,
    metadata     JSONB
);
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON chunks (document_id, chunk_idx);

-- Retrieval: top-K chunks similar to query, with source document
SELECT
    c.content,
    c.metadata,
    d.title,
    d.source_url,
    c.embedding <=> $1::vector AS distance
FROM chunks c
JOIN documents d ON d.id = c.document_id
WHERE c.metadata->>'lang' = 'en'
ORDER BY c.embedding <=> $1::vector
LIMIT 5;`,
        note: "Chunking strategies: fixed-size with overlap (500 tokens, 50 overlap) for simplicity; semantic chunking (split on sentence/paragraph boundaries) for quality. Store the document → chunks relationship; retrieve chunks, include document context. Standard pattern for any RAG app."
      },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function DBAtlas() {
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
  const Code = ({ children, id, lang = 'sql' }) => (
    <div className="my-3 relative">
      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-zinc-500 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/80">
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{lang}</span>
        <button onClick={() => copy(children, id)} className="flex items-center gap-1.5 hover:text-indigo-300 transition-colors">
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
      info: { border: 'border-indigo-400/40', bg: 'bg-indigo-400/5', text: 'text-indigo-300', label: 'NOTE' },
      warn: { border: 'border-red-400/50', bg: 'bg-red-400/5', text: 'text-red-300', label: 'GOTCHA' },
      tip: { border: 'border-pink-300/40', bg: 'bg-pink-300/5', text: 'text-pink-200', label: 'TIP' },
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
      <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 text-[11px] uppercase tracking-[0.2em] text-indigo-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                <td key={ci} className={`px-3 py-2 align-top leading-relaxed ${ci === 0 ? 'text-indigo-300' : 'text-zinc-300'}`}
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
      <div className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${checklist[id] ? 'bg-indigo-400 border-indigo-400' : 'border-zinc-600'}`}>
        {checklist[id] && <Check size={12} className="text-black" strokeWidth={3} />}
      </div>
      <span className={`text-[14px] leading-snug ${checklist[id] ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{children}</span>
    </button>
  );

  const Quiz = ({ quiz }) => {
    const state = quizState[quiz.qid];
    return (
      <div className="my-5 border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-pink-300 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  reveal && isCorrect ? 'border-indigo-400 bg-indigo-400/10 text-indigo-200' :
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
        className="border-b border-dotted border-indigo-400/60 text-indigo-200 hover:text-indigo-100 transition-colors">
        {children}
      </button>
    );
  };

  const H2 = ({ children, num }) => (
    <h3 className="flex items-baseline gap-3 mt-6 mb-3">
      <span className="text-indigo-400 text-[11px] tracking-[0.3em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{num}</span>
      <span className="text-zinc-100 text-[20px] font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{children}</span>
    </h3>
  );
  const P = ({ children }) => <p className="text-zinc-300 text-[15px] leading-relaxed my-3">{children}</p>;
  const Kbd = ({ children }) => (
    <code className="bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 text-[12px] text-indigo-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{children}</code>
  );

  /* Replication architecture diagram */
  const ArchDiagram = () => {
    const sel = ARCH_NODES.find(n => n.id === archSelected);
    return (
      <div className="my-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-zinc-500 mb-2 flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          <MousePointerClick size={12} /> Tap any node · primary + replica + WAL flow
        </div>
        <svg viewBox="0 0 320 250" className="w-full bg-zinc-950 border border-zinc-800">
          <defs>
            <marker id="dbarr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#52525b" />
            </marker>
          </defs>
          <line x1="160" y1="50" x2="160" y2="78" stroke="#52525b" markerEnd="url(#dbarr)" />
          <line x1="140" y1="110" x2="100" y2="138" stroke="#52525b" markerEnd="url(#dbarr)" />
          <line x1="180" y1="110" x2="220" y2="138" stroke="#52525b" markerEnd="url(#dbarr)" />
          <line x1="90" y1="170" x2="90" y2="198" stroke="#52525b" markerEnd="url(#dbarr)" />
          <line x1="230" y1="170" x2="230" y2="198" stroke="#52525b" markerEnd="url(#dbarr)" />
          <line x1="150" y1="198" x2="180" y2="170" stroke="#52525b" strokeDasharray="3 3" markerEnd="url(#dbarr)" />
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
          <div className="mt-2 border border-indigo-400/30 bg-indigo-400/5 p-3 text-[13px]">
            <div className="flex items-center justify-between mb-1">
              <div className="text-indigo-300 font-semibold">{sel.label}</div>
              <button onClick={() => setArchSelected(null)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
            </div>
            <div className="text-zinc-300 leading-relaxed">{sel.desc}</div>
          </div>
        )}
      </div>
    );
  };

  /* ─── SANDBOX: real SQLite execution via sql.js (WASM) ─── */
  const Sandbox = () => {
    const [mode, setMode] = useState('challenges');
    const [challengeIdx, setChallengeIdx] = useState(0);
    const challenge = CHALLENGES[challengeIdx];
    const [sql, setSql] = useState(challenge.starter);
    const [output, setOutput] = useState(null);
    const [error, setError] = useState(null);
    const [testResult, setTestResult] = useState(null);
    const [showHint, setShowHint] = useState(false);
    const [running, setRunning] = useState(false);
    const [status, setStatus] = useState('idle');
    const dbRef = useRef(null);

    useEffect(() => {
      setSql(challenge.starter);
      setOutput(null);
      setError(null);
      setTestResult(null);
      setShowHint(false);
    }, [challengeIdx]);

    /* Load sql.js once; cache the SQL constructor on window */
    useEffect(() => {
      const CDN = 'https://cdn.jsdelivr.net/npm/sql.js@1.14.0/dist/';

      const buildDB = async (SQL) => {
        const db = new SQL.Database();
        db.exec(SANDBOX_SEED);
        dbRef.current = db;
        setStatus('ready');
      };

      if (window.__sqljs) { buildDB(window.__sqljs); return; }
      if (window.__sqljsLoading) {
        setStatus('loading');
        const iv = setInterval(() => {
          if (window.__sqljs) { clearInterval(iv); buildDB(window.__sqljs); }
        }, 200);
        return () => clearInterval(iv);
      }
      window.__sqljsLoading = true;
      setStatus('loading');
      const script = document.createElement('script');
      script.src = CDN + 'sql-wasm.js';
      script.onload = async () => {
        try {
          const SQL = await window.initSqlJs({ locateFile: (f) => CDN + f });
          window.__sqljs = SQL;
          buildDB(SQL);
        } catch (e) {
          setStatus('error');
          setError('❌ Failed to initialize sql.js: ' + (e?.message || e));
        }
      };
      script.onerror = () => { setStatus('error'); setError('❌ Failed to load sql.js from CDN.'); };
      document.head.appendChild(script);
    }, []);

    const reseed = () => {
      if (!window.__sqljs) return;
      const db = new window.__sqljs.Database();
      db.exec(SANDBOX_SEED);
      dbRef.current = db;
      setOutput(null); setError(null); setTestResult(null);
    };

    const runSql = (checkExpected) => {
      const db = dbRef.current;
      if (!db) return;
      setRunning(true);
      setError(null);
      setTestResult(null);
      try {
        const results = db.exec(sql);
        setOutput(results);
        if (checkExpected && challenge.answerCheck) {
          const pass = challenge.answerCheck(results);
          setTestResult({ pass });
        }
      } catch (e) {
        setError('❌ ' + (e?.message || String(e)));
        setOutput(null);
        if (checkExpected) setTestResult({ pass: false });
      }
      setRunning(false);
    };

    const ready = status === 'ready';

    return (
      <div className="my-4 border border-zinc-800 bg-zinc-900/30">
        <div className="bg-zinc-950 px-3 py-2 border-b border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-[10px] tracking-[0.25em] text-zinc-500 uppercase flex items-center gap-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <span>LIVE SQLite · {mode === 'challenges' ? challenge.title : 'free play'}</span>
            {status === 'ready' && <span className="text-indigo-400">●</span>}
            {status === 'loading' && <span className="text-amber-400 flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> loading sql.js</span>}
            {status === 'error' && <span className="text-red-400">● error</span>}
          </div>
          <div className="flex gap-1">
            <button onClick={() => setMode('challenges')} className={`text-[10px] px-2 py-0.5 border ${mode === 'challenges' ? 'border-indigo-400 text-indigo-300 bg-indigo-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>challenges</button>
            <button onClick={() => { setMode('freeplay'); setSql("-- Free play: any SQL.\n-- Schema: users, products, orders, order_items, reviews.\nSELECT name, country FROM users;"); setOutput(null); setError(null); setTestResult(null); }} className={`text-[10px] px-2 py-0.5 border ${mode === 'freeplay' ? 'border-indigo-400 text-indigo-300 bg-indigo-400/10' : 'border-zinc-700 text-zinc-500'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>free play</button>
          </div>
        </div>

        {mode === 'challenges' && (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 flex items-center gap-1 overflow-x-auto">
              {CHALLENGES.map((c, i) => (
                <button key={c.id} onClick={() => setChallengeIdx(i)}
                  className={`text-[10px] px-2 py-1 border whitespace-nowrap shrink-0 ${i === challengeIdx ? 'border-indigo-400 text-indigo-300 bg-indigo-400/10' : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {c.title.split(' · ')[0]}
                </button>
              ))}
            </div>
            <div className="px-3 py-2 border-b border-zinc-800">
              <div className="text-[13px] text-zinc-300 leading-relaxed">{challenge.desc}</div>
              {!showHint && (
                <button onClick={() => setShowHint(true)} className="mt-1 text-[11px] text-zinc-500 hover:text-pink-300 underline" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  show hint
                </button>
              )}
              {showHint && (
                <pre className="mt-2 bg-black border border-zinc-800 px-2 py-1.5 text-[11px] text-pink-300 overflow-x-auto" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{challenge.hint}</pre>
              )}
            </div>
          </>
        )}

        <textarea
          value={sql}
          onChange={e => setSql(e.target.value)}
          spellCheck={false}
          className="w-full bg-black text-zinc-100 px-3 py-3 text-[13px] outline-none resize-y min-h-[160px] leading-snug"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        />

        <div className="px-3 py-2 border-t border-zinc-800 flex gap-2 flex-wrap">
          {mode === 'freeplay' ? (
            <button onClick={() => runSql(false)} disabled={!ready || running}
              className="flex-1 min-w-[120px] border border-indigo-400 bg-indigo-400/10 text-indigo-200 px-3 py-2 text-[12px] font-bold hover:bg-indigo-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> Run SQL</>}
            </button>
          ) : (
            <>
              <button onClick={() => runSql(true)} disabled={!ready || running}
                className="flex-1 min-w-[120px] border border-indigo-400 bg-indigo-400/10 text-indigo-200 px-3 py-2 text-[12px] font-bold hover:bg-indigo-400/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {running ? <><Loader2 size={12} className="animate-spin" /> Running</> : <><Play size={12} /> Run + check</>}
              </button>
              <button onClick={() => setSql(challenge.starter)}
                className="border border-zinc-700 text-zinc-400 px-3 py-2 text-[12px] hover:border-zinc-500 transition-colors flex items-center gap-1"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <RotateCcw size={11} /> Reset
              </button>
            </>
          )}
          <button onClick={reseed} disabled={!ready}
            className="border border-zinc-700 text-zinc-500 px-3 py-2 text-[12px] hover:border-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1"
            style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <RotateCcw size={11} /> Reseed DB
          </button>
        </div>

        {(output || error) && (
          <div className="border-t border-zinc-800 bg-black">
            <div className="px-3 py-1.5 text-[10px] uppercase tracking-[0.25em] text-zinc-500 border-b border-zinc-800 flex items-center justify-between" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span>RESULT</span>
              {output && output.length > 0 && <span className="text-zinc-600">{output[0].values.length} row{output[0].values.length !== 1 ? 's' : ''}</span>}
            </div>
            {error && (
              <pre className="px-3 py-2 text-[12px] text-red-300 whitespace-pre-wrap break-words" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {error}
              </pre>
            )}
            {output && output.length === 0 && !error && (
              <div className="px-3 py-2 text-[12px] text-zinc-500 italic" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                (statement OK — no rows returned)
              </div>
            )}
            {output && output.length > 0 && output.map((rs, ri) => (
              <div key={ri} className="overflow-x-auto">
                <table className="text-[11px] w-full" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-950">
                      {rs.columns.map((c, ci) => (
                        <th key={ci} className="text-left px-3 py-1.5 text-[10px] uppercase tracking-wider text-indigo-300 font-normal">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rs.values.slice(0, 50).map((row, rri) => (
                      <tr key={rri} className="border-b border-zinc-900 last:border-0">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-1.5 text-zinc-300 align-top">
                            {cell === null ? <span className="text-zinc-600 italic">null</span> : String(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {rs.values.length > 50 && <div className="px-3 py-1 text-[10px] text-zinc-600 italic">…{rs.values.length - 50} more rows hidden</div>}
              </div>
            ))}
            {testResult && (
              <div className="border-t border-zinc-800 px-3 py-2">
                <div className={`text-[12px] flex items-center gap-2 ${testResult.pass ? 'text-indigo-300' : 'text-red-300'}`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {testResult.pass ? <Check size={14} /> : <X size={14} />}
                  {testResult.pass ? 'CHALLENGE PASSED' : 'NOT QUITE — check expected output'}
                </div>
                {testResult.pass && challengeIdx < CHALLENGES.length - 1 && (
                  <button onClick={() => setChallengeIdx(challengeIdx + 1)} className="mt-2 text-teal-300 hover:text-teal-100 underline text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                activeCat === c ? 'border-indigo-400 text-indigo-300 bg-indigo-400/10' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              <span className="text-indigo-300">{LIBRARY[c].icon}</span>
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
                  <span className="text-[10px] text-indigo-400 mt-1 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                      <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>sql</span>
                      <button onClick={() => copy(s.code, 'lib-' + s.id)} className="flex items-center gap-1.5 hover:text-indigo-300 transition-colors">
                        {copied === 'lib-' + s.id ? <Check size={12} /> : <Copy size={12} />}
                        {copied === 'lib-' + s.id ? 'copied' : 'copy'}
                      </button>
                    </div>
                    <pre className="px-3 py-2 text-[12px] text-zinc-200 overflow-x-auto leading-relaxed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <code>{s.code}</code>
                    </pre>
                    {s.note && (
                      <div className="border-t border-zinc-900 px-3 py-2 text-[12px] text-zinc-400 italic leading-relaxed">
                        <span className="text-pink-300 not-italic mr-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NOTE</span>
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
                  <span className={i === path.length - 1 ? 'text-indigo-300' : ''}>{p}</span>
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
              <div className="border-l-2 border-indigo-400 pl-3 mb-3">
                <div className="text-[10px] uppercase tracking-[0.25em] text-indigo-300 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>FIX</div>
                <div className="text-zinc-200 text-[14px] leading-relaxed">{cur.fix}</div>
              </div>
              {cur.steps && (
                <ol className="space-y-2 mb-3">
                  {cur.steps.map((s, i) => (
                    <li key={i} className="flex gap-2 text-[13px] text-zinc-300">
                      <span className="text-indigo-400 shrink-0" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{(i + 1).toString().padStart(2, '0')}</span>
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
    let md = "# DB Atlas — Cheatsheet\n\n";
    md += "## Engine choice (2026)\n\n";
    md += "| Engine | When |\n|---|---|\n";
    COMPARISONS.engines.rows.forEach(r => { md += `| **${r[0]}** | ${r[2]} |\n`; });
    md += "\n## Isolation levels — what each prevents\n\n";
    md += "| Level | Dirty | Non-repeatable | Phantom |\n|---|---|---|---|\n";
    COMPARISONS.isolation.rows.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} | ${r[3]} |\n`; });
    md += "\n## PostgreSQL essentials\n```sql\n-- Inside psql\n\\dt           -- list tables\n\\d table      -- describe\n\\l            -- list databases\n\\timing on    -- show query time\n\n-- THE debugging tool\nEXPLAIN (ANALYZE, BUFFERS) SELECT ...;\n\n-- Online index build (always in prod)\nCREATE INDEX CONCURRENTLY idx_name ON tbl (col);\n\n-- Refresh stats\nANALYZE table_name;\n```\n\n";
    md += "## SQL idioms worth memorizing\n```sql\n-- Upsert\nINSERT INTO users (email) VALUES ($1)\nON CONFLICT (email) DO UPDATE SET updated_at = now()\nRETURNING id;\n\n-- Top N per group\nWITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) rn\n  FROM orders\n)\nSELECT * FROM ranked WHERE rn <= 5;\n\n-- Keyset pagination (no OFFSET)\nSELECT * FROM orders\nWHERE (created_at, id) < ($cursor_at, $cursor_id)\nORDER BY created_at DESC, id DESC LIMIT 20;\n```\n\n";
    md += "## Authoritative resources\n";
    RESOURCES.forEach(r => { md += `- **${r.name}** — ${r.url}\n  ${r.note}\n\n`; });
    md += "\n---\n_Generated by DB Atlas. Grounded in Kleppmann (DDIA), Use The Index Luke, PostgreSQL 18 docs, CMU 15-445, pganalyze, explain.depesz.com._\n";
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'db-atlas-cheatsheet.md'; a.click();
    URL.revokeObjectURL(url);
  };

  const exportLibrary = () => {
    let md = "# DB Atlas — Library\n\nA curated SQL snippet collection. PostgreSQL flavored — most patterns translate.\n\n";
    Object.entries(LIBRARY).forEach(([_, cat]) => {
      md += `## ${cat.label}\n\n`;
      cat.snippets.forEach(s => {
        md += `### ${s.title}\n${s.desc}\n\n\`\`\`sql\n${s.code}\n\`\`\`\n\n_${s.note}_\n\n`;
      });
    });
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'db-atlas-library.md'; a.click();
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

  /* ─── Command palette ─── */
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
        <div className="max-w-lg w-full bg-zinc-950 border border-indigo-400/40 shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
            <Search size={14} className="text-indigo-300" />
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
                  item.kind === 'chapter' ? 'text-indigo-300' :
                  item.kind === 'term' ? 'text-pink-300' :
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
        <div className="max-w-md w-full bg-zinc-950 border border-indigo-400/40 p-5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>GLOSSARY</div>
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
      <div className="max-w-md w-full bg-zinc-950 border border-indigo-400/40 p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-2" style={{ fontFamily: 'JetBrains Mono, monospace' }}>⛁ CALIBRATING</div>
        <h2 className="text-[22px] font-bold mb-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>What's your database context?</h2>
        <p className="text-zinc-400 text-[13px] mb-4">Examples will adapt. Change anytime.</p>
        <div className="space-y-2">
          {STACKS.map(s => (
            <button key={s.id} onClick={() => { setStack(s.id); setShowOnboarding(false); }}
              className="block w-full text-left p-3 border border-zinc-800 hover:border-indigo-400 hover:bg-indigo-400/5 transition-colors">
              <div className="flex items-baseline gap-2">
                <span className="text-indigo-400 text-[14px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.icon}</span>
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
            <H2 num="◇ 1970">Codd's relational paper</H2>
            <P>
              E.F. Codd published 'A Relational Model of Data for Large Shared Data Banks' in CACM, June 1970. The mathematical relational model — tables as sets of tuples, no pointers between records, queries as relational algebra — was the foundation. IBM, where Codd worked, was slow to commercialize. Larry Ellison read the paper, founded Software Development Labs in 1977, and shipped Oracle 2 in 1979 — beating IBM's own DB2 to market.
            </P>
            <P>
              SQL was standardized in 1986 (SQL-86) and refined through SQL-92, SQL:1999 (recursive queries, triggers), SQL:2003 (window functions), SQL:2011 (temporal data), SQL:2023 (property graph queries). PostgreSQL traces to UC Berkeley's POSTGRES project (Michael Stonebraker, 1986). MySQL appeared 1995. SQLite 2000. Each generation added on top.
            </P>
            <H2 num="◇ NOSQL">The NoSQL wave (2007-2015)</H2>
            <P>
              Google's BigTable paper (2006) and Amazon's Dynamo paper (2007) lit the fuse. The early 2010s brought MongoDB, Cassandra, Riak, CouchDB, Redis, Neo4j. Web 2.0 scale problems — millions of users, schemaless content, horizontal scaling — exposed weak spots in classic RDBMS deployments.
            </P>
            <P>
              By 2020-2026, the pendulum swung back. PostgreSQL JSONB (2014) absorbed the document use case. Logical replication + partitioning brought scaling. pgvector (2021) absorbed vector search. 'Just use Postgres' became the most common 2026 default — with specialized engines (Redis, ClickHouse, DuckDB, Qdrant) brought in only when measurements demand them.
            </P>
            <Callout kind="cite" title="POSTGRESQL 18 — CURRENT">
              PostgreSQL 18 was released September 25, 2025; current point release is <strong>18.4</strong> (May 14, 2026). Headline features: asynchronous I/O subsystem (up to 3× faster reads), <Kbd>uuidv7()</Kbd> built-in, skip-scan B-tree, virtual generated columns (now default), OAuth authentication, OLD/NEW in RETURNING, temporal constraints, wire protocol 3.2 (the first protocol update since 2003). Source: postgresql.org/about/news.
            </Callout>
            <H2 num="◇ 2026">The current landscape</H2>
            <div className="grid gap-2 my-3">
              <CheckItem id="land-pg">PostgreSQL 18 — default OLTP. Hosted: Supabase, Neon, RDS, Cloud SQL.</CheckItem>
              <CheckItem id="land-sqlite">SQLite 3.53 — embedded + edge. Turso/libSQL ship it serverless. Most-deployed DB on Earth.</CheckItem>
              <CheckItem id="land-mysql">MySQL 8.4 — stable, massive WordPress / LAMP installed base.</CheckItem>
              <CheckItem id="land-duckdb">DuckDB — analytics SQLite. Local OLAP on Parquet/CSV/S3.</CheckItem>
              <CheckItem id="land-clickhouse">ClickHouse — real-time columnar OLAP at scale.</CheckItem>
              <CheckItem id="land-mongo">MongoDB 8 — document store. Niche after PG JSONB.</CheckItem>
              <CheckItem id="land-redis">Redis / Valkey / KeyDB — KV cache, sessions, rate-limit.</CheckItem>
              <CheckItem id="land-pgvector">pgvector — vector search inside PostgreSQL. The 2026 default for new AI apps.</CheckItem>
              <CheckItem id="land-cockroach">CockroachDB / Spanner — distributed SQL when single-region won't fit.</CheckItem>
            </div>
            {QUIZZES.origin.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 1:
        return (
          <>
            <H2 num="◇ MATRIX">Engine choice — the 2026 matrix</H2>
            <ComparisonTable data={COMPARISONS.engines} />
            <Callout kind="tip" title="DEFAULT TO POSTGRESQL">
              The boring, correct default for new backend apps in 2026 is PostgreSQL. JSONB handles flexible schema. pgvector handles vectors. PostGIS handles spatial. The hosted ecosystem is mature (Supabase, Neon, Render, Fly, RDS, Cloud SQL). Specialize away from Postgres only when measurement justifies it.
            </Callout>
            <H2 num="◇ HOSTED">The 2026 hosted PostgreSQL landscape</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Supabase', what: "PostgreSQL + auth + storage + edge functions + real-time + vector. The 'Firebase alternative on Postgres.' Open-source. Generous free tier." },
                { name: 'Neon', what: "Serverless PostgreSQL. Branching like git (each branch = isolated DB). Scales to zero. Pay per actual usage. Excellent for previews." },
                { name: 'PlanetScale (MySQL)', what: "Vitess-based MySQL. Branching, deploy requests. Re-introduced their hobby tier in 2024." },
                { name: 'Turso (libSQL)', what: "Distributed SQLite. Replicas at the edge. Reads everywhere, writes to primary. Great for read-heavy apps." },
                { name: 'CockroachDB Cloud', what: "Distributed PostgreSQL-compatible. CP under partition. Multi-region writes with serializable isolation." },
                { name: 'AWS RDS / Aurora', what: "Managed PostgreSQL / MySQL. Aurora is AWS's reimplementation of the storage layer — cheaper than vanilla RDS at scale." },
                { name: 'Google Cloud SQL / Spanner', what: "Managed PG/MySQL (Cloud SQL); globally distributed SQL with TrueTime (Spanner)." },
                { name: 'Fly.io Postgres', what: "Postgres clusters on Fly's edge network. Read replicas in multiple regions. Simpler than RDS." },
              ].map(h => (
                <div key={h.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-indigo-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{h.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{h.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ SPECIALIZED">When to add specialized engines</H2>
            <Code id="when-redis" lang="text">{`REDIS / VALKEY / KEYDB
  → Sub-millisecond latency for sessions, rate limits, leaderboards, queues
  → Pub/sub fanout
  → Cache layer between app and primary DB
  Don't use as primary persistent store.

DUCKDB
  → Local/embedded analytics over Parquet, CSV, JSON, S3
  → ETL scripts and notebook workflows
  → "SQLite for OLAP" — single binary, no server
  Not for: transactional workloads (no concurrent writers).

CLICKHOUSE
  → Real-time analytics on huge data (logs, events, metrics)
  → Time-series with low latency aggregations
  → Observability / APM backends
  Not for: OLTP, frequent UPDATEs (designed for append-mostly).

NEO4J / MEMGRAPH
  → Many-to-many traversal — social, fraud detection, knowledge graphs
  → Cypher query language (variable-length paths, shortest path)
  Postgres handles simple graph queries via recursive CTEs — switch only at real graph scale.

ELASTICSEARCH / MEILISEARCH / TYPESENSE
  → Full-text search with relevance ranking, fuzzy match, faceted filtering
  → Log aggregation (Elastic Stack)
  PG full-text + pg_trgm handles most cases; switch for true search UX.

PGVECTOR / QDRANT / PINECONE
  → Vector similarity search for embeddings (RAG, semantic search)
  pgvector if already on PG. Specialized stores at billion-vector scale.`}</Code>
            {stackData?.spark && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            {QUIZZES.engines.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 2:
        return (
          <>
            <H2 num="◇ MODEL">The relational mental model</H2>
            <P>
              A <Term>relation</Term> is a set of <Term>tuples</Term> sharing a <Term>schema</Term>. In SQL: tables, rows, columns. Codd's insight: no implicit ordering, no pointers between records, queries declarative (what, not how). The query planner figures out access strategy.
            </P>
            <Code id="relational-basics">{`-- A table = relation. Each row = tuple. Each column = attribute.
CREATE TABLE users (
    id          UUID         PRIMARY KEY DEFAULT uuidv7(),     -- identity
    email       TEXT         UNIQUE NOT NULL,                  -- uniqueness constraint
    name        TEXT         NOT NULL,
    country     CHAR(2)      NOT NULL CHECK (country ~ '^[A-Z]{2}$'),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Foreign key — referential integrity
CREATE TABLE orders (
    id          UUID  PRIMARY KEY DEFAULT uuidv7(),
    user_id     UUID  NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total       NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    status      TEXT  NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','shipped','cancelled'))
);
-- ON DELETE RESTRICT: can't delete a user with orders. Alternatives:
--   CASCADE  — deletes the orders too
--   SET NULL — user_id becomes NULL
--   NO ACTION — same as RESTRICT but checked at end of statement`}</Code>
            <H2 num="◇ KEYS">Primary keys, foreign keys, surrogate vs natural</H2>
            <P>
              A <Term>primary key</Term> uniquely identifies each row. A <Term>foreign key</Term> references another table's PK, enforcing integrity. The choice between <Term>surrogate key</Term> (auto-generated ID) and <Term>natural key</Term> (real-world data like email) is one of the most consequential schema decisions.
            </P>
            <Callout kind="tip" title="UUIDV7 — THE 2026 DEFAULT">
              PostgreSQL 18's native <Kbd>uuidv7()</Kbd> gives you a sortable, distributable, non-leaking identifier. Timestamp-prefixed (48 bits of Unix milliseconds, then random) — sortable by creation time without exposing insertion count. Distributable across nodes without coordination. The default surrogate key for new tables.
            </Callout>
            <H2 num="◇ NORM">Normalization — 1NF through 3NF</H2>
            <P>
              <strong>1NF</strong>: atomic columns (no arrays of values in one cell). <strong>2NF</strong>: no partial dependencies (every non-key attribute depends on the WHOLE PK). <strong>3NF</strong>: no transitive dependencies (no non-key attribute depends on another non-key attribute). Most production apps target 3NF — readable, eliminates the worst redundancy, doesn't go overboard.
            </P>
            <Code id="normalization">{`-- VIOLATION (not 1NF): a column with comma-separated values
CREATE TABLE bad_users (
    id INTEGER PRIMARY KEY,
    name TEXT,
    tags TEXT          -- "beta,early,premium"  ← not atomic
);

-- 1NF: tags moved to separate table
CREATE TABLE user_tags (
    user_id INTEGER REFERENCES users(id),
    tag TEXT,
    PRIMARY KEY (user_id, tag)
);

-- VIOLATION (3NF — transitive dependency): country_name depends on country_code
CREATE TABLE bad_orders (
    id INTEGER,
    user_id INTEGER,
    country_code CHAR(2),
    country_name TEXT     -- ← depends on country_code, not on order id
);

-- 3NF: countries in their own table
CREATE TABLE countries (
    code CHAR(2) PRIMARY KEY,
    name TEXT NOT NULL
);
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    country_code CHAR(2) REFERENCES countries(code)
);`}</Code>
            <Callout kind="info" title="DENORMALIZE WHEN MEASURED">
              Denormalization (duplicating data) trades write complexity for read speed. Common: store <Kbd>user_name</Kbd> on orders for fast displays, with a trigger to keep it in sync. Or store running totals updated on each transaction. Always measure first — premature denormalization is a top cause of data inconsistency bugs.
            </Callout>
            <H2 num="◇ ER">ER diagrams — schema as graph</H2>
            <Code id="er" lang="text">{`Entity-Relationship modeling:

    ┌───────┐ 1   N ┌──────────┐ N   1 ┌──────────┐
    │ users │───────│ orders   │───────│ statuses │
    └───────┘       └──────────┘       └──────────┘
        │ 1                │ 1
        │                  │
        │ N                │ N
    ┌───────┐         ┌──────────────┐
    │reviews│         │ order_items  │
    └───────┘         └──────────────┘
                            │ N
                            │
                            │ 1
                       ┌──────────┐
                       │ products │
                       └──────────┘

Cardinalities:
  1:1  one user has one profile
  1:N  one user has many orders
  N:M  many orders have many products (via order_items junction)

Tools: dbdiagram.io (DSL), drawSQL, Lucidchart, pgAdmin's ER view.`}</Code>
            <H2 num="◇ TYPES">Pick types deliberately</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { t: 'INTEGER / BIGINT', use: "Whole numbers. INT (4 bytes, ±2B), BIGINT (8 bytes, ±9.2 quintillion). Default to INT; BIGINT for counters that might overflow." },
                { t: 'NUMERIC(p, s)', use: "Exact decimals. ALWAYS for money. NUMERIC(12, 2) = up to $9,999,999,999.99. Never FLOAT/REAL for money — rounding errors compound." },
                { t: 'TEXT vs VARCHAR(n)', use: "PostgreSQL: TEXT and VARCHAR are functionally identical — no performance difference. Use TEXT unless you genuinely want the length constraint. MySQL/SQL Server: different storage." },
                { t: 'TIMESTAMPTZ vs TIMESTAMP', use: "ALWAYS use TIMESTAMPTZ (with timezone). It stores UTC, converts on display. TIMESTAMP (no tz) is a footgun in multi-timezone apps." },
                { t: 'JSONB', use: "Binary JSON, indexable, queryable. The 'flexible schema' escape hatch. Don't use for data you'll query with JOINs — use real columns." },
                { t: 'UUID', use: "128-bit identifier. UUIDv4 (random) or UUIDv7 (timestamp-prefixed, sortable — PG 18 native). Default surrogate key in 2026." },
                { t: 'Arrays (PG specific)', use: "INTEGER[], TEXT[]. Powerful but breaks portability. Use sparingly; usually a separate table is cleaner." },
                { t: 'ENUM / CHECK constraint', use: "Constrained vocabulary. PostgreSQL ENUM is type-safe but hard to modify. CHECK (col IN (...)) is more flexible. Pick CHECK for evolving sets." },
              ].map(t => (
                <div key={t.t} className="border border-zinc-800 px-3 py-2">
                  <code className="text-indigo-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.t}</code>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{t.use}</div>
                </div>
              ))}
            </div>
            {stackData?.relational && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.relational}</Callout>}
            {QUIZZES.relational.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 3:
        return (
          <>
            <H2 num="◇ SELECT">SELECT — the lingua franca</H2>
            <Code id="select">{`-- Anatomy of a SELECT
SELECT col1, col2, expr AS alias
FROM table_or_join
WHERE  filter_conditions
GROUP BY grouping_columns
HAVING  group_filter
ORDER BY sort_columns
LIMIT n OFFSET m;

-- Execution order (NOT the typed order):
--   1. FROM        — gather source tables
--   2. WHERE       — filter rows
--   3. GROUP BY    — partition into groups
--   4. HAVING      — filter groups
--   5. SELECT      — pick columns + compute expressions
--   6. ORDER BY    — sort
--   7. LIMIT       — trim

-- Aliases defined in SELECT aren't usable in WHERE (which runs earlier)
-- BAD:  SELECT total * 1.1 AS with_tax FROM orders WHERE with_tax > 100;
-- GOOD: SELECT total * 1.1 AS with_tax FROM orders WHERE total * 1.1 > 100;
-- OR:   subquery wrapping SELECT`}</Code>
            <H2 num="◇ JOINS">JOINs — the visual model</H2>
            <Code id="joins" lang="text">{`Picture two tables, A and B, with overlap on a key.

  A only        A ∩ B        B only
    ┌───────────────────────────┐
    │ A_alone  │ matching │ B_alone │
    └───────────────────────────┘

INNER JOIN  → matching only          (A ∩ B)
LEFT JOIN   → A_alone + matching     (everything from A, B nullable)
RIGHT JOIN  → matching + B_alone     (everything from B; rare — swap and use LEFT)
FULL OUTER  → A_alone + match + B_alone (everything from both)
CROSS JOIN  → Cartesian product      (every A × every B; rarely intended)`}</Code>
            <Code id="join-types">{`-- INNER: orders that have a matching user (always, with FK)
SELECT o.id, u.name, o.total
FROM orders o
JOIN users u ON u.id = o.user_id;

-- LEFT: all users, including those with no orders
SELECT u.name, COUNT(o.id) AS order_count
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.name;
-- Users with 0 orders: COUNT(o.id) = 0 (COUNT ignores NULL)

-- Self-join: employees and their managers from one table
SELECT e.name, m.name AS manager
FROM employees e
LEFT JOIN employees m ON m.id = e.manager_id;`}</Code>
            <H2 num="◇ AGG">GROUP BY + aggregations</H2>
            <Code id="aggregations">{`-- Revenue per country
SELECT u.country, COUNT(*), SUM(o.total) AS revenue, AVG(o.total) AS avg_order
FROM orders o
JOIN users u ON u.id = o.user_id
WHERE o.status = 'shipped'
GROUP BY u.country
HAVING SUM(o.total) > 1000   -- filter GROUPS (after aggregation)
ORDER BY revenue DESC;

-- HAVING vs WHERE — important distinction:
--   WHERE  filters rows BEFORE grouping
--   HAVING filters groups AFTER aggregation

-- Common aggregations:
COUNT(*)            -- all rows in group, including NULLs
COUNT(column)       -- non-NULL values
COUNT(DISTINCT col) -- distinct non-NULL values
SUM, AVG, MIN, MAX
STRING_AGG(col, ', ' ORDER BY col)   -- concatenate
ARRAY_AGG(col)                       -- collect into array
percentile_cont(0.5) WITHIN GROUP (ORDER BY x)   -- median`}</Code>
            <H2 num="◇ WINDOW">Window functions — the SQL superpower</H2>
            <P>
              Window functions compute a value PER ROW using a 'window' of related rows. Unlike GROUP BY, they don't collapse rows. The single SQL feature most devs underuse — masters write SQL that's 3× simpler with them.
            </P>
            <Code id="window">{`-- ROW_NUMBER — most recent 3 orders per user
WITH ranked AS (
    SELECT o.*,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn
    FROM orders o
)
SELECT * FROM ranked WHERE rn <= 3;

-- Running totals
SELECT
    created_at,
    total,
    SUM(total) OVER (ORDER BY created_at) AS running_total,
    AVG(total) OVER (ORDER BY created_at
                     ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS moving_avg_7
FROM orders;

-- LAG / LEAD — compare to neighbor rows
SELECT
    created_at,
    total,
    LAG(total)  OVER (ORDER BY created_at) AS prev_total,
    LEAD(total) OVER (ORDER BY created_at) AS next_total,
    total - LAG(total) OVER (ORDER BY created_at) AS delta
FROM orders WHERE user_id = $1;

-- RANK vs DENSE_RANK vs ROW_NUMBER (with ties: 100, 100, 90)
-- ROW_NUMBER:  1, 2, 3
-- RANK:        1, 1, 3   (gap)
-- DENSE_RANK:  1, 1, 2   (no gap)`}</Code>
            <H2 num="◇ CTE">CTEs — readable multi-step queries</H2>
            <Code id="cte-section">{`-- WITH clauses name intermediate results. Read top-to-bottom.
WITH active_users AS (
    SELECT id, name FROM users WHERE last_login > now() - interval '30 days'
),
user_revenue AS (
    SELECT au.id, au.name, COALESCE(SUM(o.total), 0) AS revenue
    FROM active_users au
    LEFT JOIN orders o ON o.user_id = au.id AND o.status = 'shipped'
    GROUP BY au.id, au.name
)
SELECT * FROM user_revenue WHERE revenue > 100 ORDER BY revenue DESC;

-- RECURSIVE CTE — graph traversal, hierarchies, number generation
WITH RECURSIVE org_chart AS (
    -- Base: CEO (no manager)
    SELECT id, name, manager_id, 0 AS depth
    FROM employees WHERE manager_id IS NULL

    UNION ALL

    -- Recursive: find everyone reporting to someone in org_chart
    SELECT e.id, e.name, e.manager_id, oc.depth + 1
    FROM employees e
    JOIN org_chart oc ON e.manager_id = oc.id
)
SELECT * FROM org_chart ORDER BY depth, name;`}</Code>
            <Callout kind="warn" title="NULL IN SQL = THREE-VALUED LOGIC">
              <Kbd>NULL = NULL</Kbd> evaluates to <Kbd>UNKNOWN</Kbd>, not TRUE. Use <Kbd>IS NULL</Kbd> / <Kbd>IS NOT NULL</Kbd>. Same bites <Kbd>col != 'x'</Kbd> — skips rows where col is NULL (use <Kbd>col IS DISTINCT FROM 'x'</Kbd> in PG to include NULLs). Aggregates ignore NULL except <Kbd>COUNT(*)</Kbd>.
            </Callout>
            {stackData?.sql && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.sql}</Callout>}
            {QUIZZES.sql.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 4:
        return (
          <>
            <H2 num="◇ WHY">Why indexes exist</H2>
            <P>
              A table is a list of rows. Without indexes, <Kbd>WHERE id = 42</Kbd> on a billion-row table means reading every row. An <Term>index</Term> is a separate data structure mapping key values to row locations — O(log n) lookup instead of O(n). The cost: extra disk, slower writes (index must update too).
            </P>
            <H2 num="◇ BTREE">B-tree — the default everything</H2>
            <Code id="btree" lang="text">{`B-tree (B = balanced, NOT binary).
Each node holds many keys. Tree stays shallow even for huge tables.

                  [50 | 100]
                 /    |     \\
            [10|30]  [70|90] [120|180|200]
            /  |  \\
        [5,7] [15,20] [35,40,45]

Properties:
  - All leaves at same depth → predictable performance
  - Each node holds many keys → few levels even for billions of rows
  - Sorted within nodes → range scans (WHERE x > 5) work
  - Sorted across nodes → in-order traversal = sorted iteration

Cost: O(log n) lookup, O(log n) insert/update.
For a billion rows: ~30 comparisons.`}</Code>
            <H2 num="◇ KINDS">Index types beyond B-tree</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { t: 'B-tree (DEFAULT)', use: "Equality + range + sort. The right answer 90% of the time. Multi-column composites work too." },
                { t: 'Hash', use: "Equality only. Slightly smaller / faster than B-tree for exact lookups. Rarely worth it in PG — B-tree covers this case." },
                { t: 'GIN', use: "Inverted index — one entry per token. Full-text search, JSONB containment, arrays. Slow to update; fast to query." },
                { t: 'GiST', use: "Generalized search tree. Geometric (PostGIS), range types, fuzzy text (pg_trgm). Tuneable via operator classes." },
                { t: 'BRIN', use: "Block range index. Tiny — stores min/max per block. Great for huge tables with naturally-sorted data (logs, timestamps). 1000× smaller than B-tree." },
                { t: 'SP-GiST', use: "Space-partitioned GiST. Non-balanced trees — geometric, text patterns. Niche." },
                { t: 'HNSW (pgvector)', use: "Approximate nearest neighbor for vector similarity. The 2026 default for vector search." },
              ].map(t => (
                <div key={t.t} className="border border-zinc-800 px-3 py-2">
                  <code className="text-indigo-300 text-[12px]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.t}</code>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{t.use}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPLAIN">Reading EXPLAIN ANALYZE</H2>
            <P>
              EXPLAIN shows the planner's chosen plan. EXPLAIN ANALYZE actually RUNS it and shows real timings. The most important debugging tool in any SQL database.
            </P>
            <Code id="explain-section">{`EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id = $1;

/*
 Bitmap Heap Scan on orders  (cost=4.30..16.85 rows=8 width=64) (actual time=0.05..0.06 rows=4 loops=1)
   Recheck Cond: (user_id = 1)
   Heap Blocks: exact=1
   Buffers: shared hit=3
   ->  Bitmap Index Scan on idx_orders_user_id  (cost=0.00..4.30 rows=8 width=0)
         Index Cond: (user_id = 1)
         Buffers: shared hit=2
 Planning Time: 0.15 ms
 Execution Time: 0.10 ms
*/

-- Read bottom-up. Each indented '->' is a child step.
-- COST: planner's estimate (arbitrary units). Compare relative costs.
-- ROWS estimated vs actual: large divergence = stale stats → run ANALYZE table_name
-- BUFFERS: shared hit = from cache, read = from disk
-- The slow part is the operator with the largest 'actual time'.`}</Code>
            <H2 num="◇ DOESNT">When indexes DON'T help</H2>
            <Callout kind="dont" title="LEADING WILDCARD LIKE">
              <Kbd>WHERE email LIKE '%example.com'</Kbd> — leading <Kbd>%</Kbd> prevents B-tree use. Solutions: reverse the column and index (for suffix search), or use <Kbd>pg_trgm + GIN</Kbd> for general substring.
            </Callout>
            <Callout kind="dont" title="FUNCTIONS ON COLUMNS">
              <Kbd>WHERE LOWER(email) = $1</Kbd> doesn't use the index on email. Either store lowercase in a separate column, or create an expression index: <Kbd>CREATE INDEX ON users (LOWER(email))</Kbd>.
            </Callout>
            <Callout kind="dont" title="TYPE MISMATCH">
              Indexed column is BIGINT, query passes TEXT — implicit cast can prevent index use. Match the types or cast the query parameter.
            </Callout>
            <Callout kind="dont" title="OR ACROSS DIFFERENT COLUMNS">
              <Kbd>WHERE a = 1 OR b = 2</Kbd> often can't use either index. Rewrite as <Kbd>UNION ALL</Kbd> of two indexed queries when each side is selective.
            </Callout>
            <H2 num="◇ COSTS">Indexes have costs too</H2>
            <P>
              Each index is updated on every INSERT/UPDATE/DELETE touching its columns. Three indexes on a hot table = 4× write amplification (table + 3 indexes). Index also takes disk. Audit unused indexes:
            </P>
            <Code id="audit-indexes">{`-- Find unused indexes (never scanned)
SELECT s.schemaname, s.relname AS table_name, s.indexrelname AS index_name,
       pg_size_pretty(pg_relation_size(s.indexrelid)) AS size,
       s.idx_scan
FROM pg_stat_user_indexes s
JOIN pg_index i ON i.indexrelid = s.indexrelid
WHERE s.idx_scan = 0
  AND NOT i.indisunique
ORDER BY pg_relation_size(s.indexrelid) DESC;
-- Drop those that have never been used after a representative observation period`}</Code>
            {stackData?.indexes && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.indexes}</Callout>}
            {QUIZZES.indexes.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 5:
        return (
          <>
            <H2 num="◇ ACID">ACID — the transaction guarantees</H2>
            <P>
              <strong>A</strong>tomicity: all-or-nothing — partial state never visible. <strong>C</strong>onsistency: constraints hold (FK, CHECK, NOT NULL). <strong>I</strong>solation: concurrent transactions don't interfere (with caveats — see isolation levels below). <strong>D</strong>urability: committed data survives crash (via WAL + fsync).
            </P>
            <Code id="basic-tx">{`-- Basic transaction
BEGIN;
    UPDATE accounts SET balance = balance - 100 WHERE id = 'A';
    UPDATE accounts SET balance = balance + 100 WHERE id = 'B';
COMMIT;
-- Either BOTH updates apply or NEITHER does. Crash mid-transaction = rollback on recovery.

-- Explicit ROLLBACK
BEGIN;
    UPDATE orders SET status = 'shipped' WHERE id = $1;
    -- ... oh wait, this is wrong
ROLLBACK;
-- Discard all changes since BEGIN.

-- Savepoints — partial rollback within a transaction
BEGIN;
    UPDATE a SET x = 1;
    SAVEPOINT sp1;
        UPDATE b SET y = 2;
    ROLLBACK TO sp1;   -- undo only b's change; a's change still pending
    UPDATE c SET z = 3;
COMMIT;`}</Code>
            <H2 num="◇ ISOLATION">Isolation levels — the four phenomena</H2>
            <P>
              The 'I' in ACID is more nuanced than 'transactions are independent.' SQL defines four <strong>isolation levels</strong>, each preventing more anomalies. Higher levels are safer but slower / more conflict-prone. PostgreSQL defaults to READ COMMITTED; MySQL InnoDB to REPEATABLE READ — they behave DIFFERENTLY for the same SQL.
            </P>
            <ComparisonTable data={COMPARISONS.isolation} />
            <Code id="iso-phenomena" lang="text">{`The four phenomena, by example:

DIRTY READ — txn A reads uncommitted change from txn B
  T1: BEGIN; UPDATE x SET v = 99;     (not yet committed)
  T2: BEGIN; SELECT v FROM x;          → sees 99
  T1: ROLLBACK;                        T2 has bad data.
  Prevented at: READ COMMITTED and higher.

NON-REPEATABLE READ — same query, same txn, different result
  T1: BEGIN; SELECT v FROM x;          → 10
  T2: UPDATE x SET v = 20; COMMIT;
  T1:         SELECT v FROM x;          → 20  (changed!)
  Prevented at: REPEATABLE READ and higher.

PHANTOM READ — same range query, new rows appear
  T1: BEGIN; SELECT * FROM x WHERE k > 5;   → 3 rows
  T2: INSERT INTO x (k) VALUES (10); COMMIT;
  T1:         SELECT * FROM x WHERE k > 5;   → 4 rows (phantom!)
  Prevented at: SERIALIZABLE. (PG REPEATABLE READ also prevents this.)

WRITE SKEW — two valid txns conflict on logical invariant
  Invariant: at least one doctor on call.
  T1: SELECT count(*) FROM oncall WHERE on_duty;  → 2
      UPDATE oncall SET on_duty=false WHERE id=1;
  T2: SELECT count(*) FROM oncall WHERE on_duty;  → 2
      UPDATE oncall SET on_duty=false WHERE id=2;
  Both commit. Result: ZERO on call. Each txn saw a valid state.
  Prevented at: SERIALIZABLE only.`}</Code>
            <H2 num="◇ MVCC">MVCC — how PostgreSQL keeps reads non-blocking</H2>
            <P>
              <Term>MVCC</Term> = Multi-Version Concurrency Control. Writes don't block reads; reads don't block writes. Each transaction sees a snapshot. PostgreSQL achieves this by keeping old row versions ('dead tuples') until cleanup.
            </P>
            <Code id="mvcc" lang="text">{`Conceptual model:

  Row 'v1' (xmin=100, xmax=200)   ← txn 100 inserted, txn 200 deleted/updated
  Row 'v2' (xmin=200, xmax=NULL)  ← current version

A transaction with snapshot at xid=150:
  - sees v1 (xmin=100 < 150, xmax=200 > 150 means deletion not yet visible to me)
  - does NOT see v2 (xmin=200 > 150 — created after my snapshot)

A transaction with snapshot at xid=250:
  - does NOT see v1 (xmax=200 < 250 — already deleted by then)
  - sees v2 (xmin=200 < 250)

Old versions accumulate → VACUUM reclaims space when no live txn needs them.
Long-running transactions hold back the cleanup horizon (xmin).`}</Code>
            <Callout kind="warn" title="VACUUM IS NOT OPTIONAL">
              Without VACUUM, PostgreSQL tables grow forever — dead tuple bloat. autovacuum runs continuously; tune its aggressiveness for big tables (<Kbd>autovacuum_vacuum_scale_factor</Kbd>). Long-running transactions block VACUUM — find them: <Kbd>SELECT * FROM pg_stat_activity WHERE state != 'idle' AND xact_start &lt; now() - interval '5 minutes';</Kbd>
            </Callout>
            <H2 num="◇ LOCKS">Locks + deadlocks</H2>
            <Code id="locks">{`-- Row-level locks
SELECT * FROM orders WHERE id = $1 FOR UPDATE;
-- Locks the row exclusively. Other txns wait until COMMIT/ROLLBACK.

-- FOR UPDATE SKIP LOCKED — queue pattern (don't wait, skip locked rows)
SELECT * FROM jobs WHERE status = 'queued'
ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1;
-- Multiple workers each grab a different job. Standard queue pattern.

-- FOR NO KEY UPDATE — weaker; allows other txns to take FK references
SELECT * FROM users WHERE id = $1 FOR NO KEY UPDATE;
-- Use when you'll UPDATE non-key columns. Less blocking.

-- Advisory locks — app-level coordination
SELECT pg_advisory_lock(12345);    -- txn or session-level (xact_lock variant)
-- ... do exclusive work ...
SELECT pg_advisory_unlock(12345);  -- session-level needs explicit unlock`}</Code>
            <Callout kind="dont" title="TRANSACTIONS DURING USER INPUT">
              <Kbd>BEGIN; SELECT ...; (wait for user click); UPDATE ...; COMMIT;</Kbd> — locks held the entire time, blocking everyone else. Use <strong>optimistic locking</strong> (version column) instead. See Library → Transactions.
            </Callout>
            <Callout kind="info" title="POSTGRES vs MYSQL DEFAULT ISOLATION">
              PostgreSQL = READ COMMITTED. MySQL InnoDB = REPEATABLE READ. Same SQL, different behavior. If you've moved from MySQL to PG (or vice versa), audit your concurrent paths — bugs are subtle and only appear under load.
            </Callout>
            {QUIZZES.tx.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 6:
        return (
          <>
            <H2 num="◇ WHEN">When you actually need non-SQL</H2>
            <P>
              The 'NoSQL' wave (2007-2015) addressed real problems — but most of those problems are now solved within PostgreSQL. The 2026 question isn't 'SQL or NoSQL?' but 'do I have a specific access pattern that justifies a specialized engine?'
            </P>
            <H2 num="◇ DOC">Document stores — MongoDB and friends</H2>
            <P>
              Documents are nested JSON-like records. Each document is self-contained. No joins (officially). Flexible schema.
            </P>
            <Code id="mongo" lang="js">{`// MongoDB shell
db.users.insertOne({
    _id: ObjectId(),
    email: "alice@example.com",
    profile: {
        name: "Alice",
        tags: ["beta", "early"],
        prefs: { theme: "dark", locale: "en" }
    },
    orders: [
        { product: "headphones", price: 79.99, when: ISODate("2024-06-01") }
    ]
});

// Find
db.users.find({ "profile.prefs.theme": "dark" });
db.users.find({ "profile.tags": "beta" });

// Update — operators like $set, $push, $inc
db.users.updateOne(
    { email: "alice@example.com" },
    { $push: { "profile.tags": "premium" } }
);

// Aggregation pipeline — analytics
db.users.aggregate([
    { $unwind: "$orders" },
    { $group: { _id: "$profile.prefs.locale", revenue: { $sum: "$orders.price" } } },
    { $sort: { revenue: -1 } }
]);`}</Code>
            <Callout kind="info" title="DOCUMENT vs JSONB">
              PostgreSQL JSONB closed most of MongoDB's lead. JSONB is queryable, indexable (GIN), transactional. Use MongoDB when: deeply nested documents change schema constantly, change streams are core to the design, or your team has Mongo expertise.
            </Callout>
            <H2 num="◇ KV">Key-value stores — Redis</H2>
            <Code id="redis" lang="bash">{`# Strings
SET session:abc123 '{"user_id": 42, "logged_in": true}'
EXPIRE session:abc123 3600           # TTL in seconds
GET session:abc123

# Counters (atomic)
INCR page:home:views                  # 1, 2, 3, ...
INCRBY user:42:credits 100

# Lists (queues)
LPUSH jobs '{"task": "send_email"}'   # push
BRPOP jobs 0                          # blocking pop (worker)

# Sets — unique members
SADD online:users 42
SISMEMBER online:users 42
SCARD online:users                    # size

# Sorted sets — leaderboards
ZADD leaderboard 1500 "alice"
ZADD leaderboard 2300 "bob"
ZRANGE leaderboard 0 9 REV WITHSCORES  # top 10

# Hashes — object-like
HSET user:42 name "Alice" email "a@x.com"
HGET user:42 email

# Pub/sub
SUBSCRIBE notifications:user:42
PUBLISH notifications:user:42 "new message"

# Rate limiting (sliding window)
INCR rate:ip:1.2.3.4 EX 60            # max 100/min
# In app: if INCR returns > 100, reject`}</Code>
            <Callout kind="info" title="REDIS LICENSING (2024)">
              Redis Labs changed Redis's license from BSD to SSPL/RSALv2 in 2024 (source-available, restricting hyperscaler hosting). Open-source forks: <strong>Valkey</strong> (Linux Foundation-backed, AWS/Google support) and <strong>KeyDB</strong>. For new projects in 2026, prefer Valkey. Wire-compatible with Redis 7.x.
            </Callout>
            <H2 num="◇ GRAPH">Graph databases — Neo4j</H2>
            <Code id="neo4j" lang="cypher">{`// Cypher query language — pattern-based
CREATE (alice:User {name: 'Alice'})
CREATE (bob:User   {name: 'Bob'})
CREATE (alice)-[:FOLLOWS]->(bob)

// Find friends-of-friends (2 hops)
MATCH (me:User {name: 'Alice'})-[:FOLLOWS]->(friend)-[:FOLLOWS]->(fof)
WHERE NOT (me)-[:FOLLOWS]->(fof) AND me <> fof
RETURN fof.name, count(*) AS mutual_friends
ORDER BY mutual_friends DESC LIMIT 10;

// Shortest path
MATCH p = shortestPath((a:User {name:'Alice'})-[:FOLLOWS*]-(b:User {name:'Eve'}))
RETURN length(p), [n IN nodes(p) | n.name] AS path;

// Variable-length traversal — would be a nightmare in SQL`}</Code>
            <P>
              When SQL is enough: simple parent-child, fixed-depth relationships, even self-joins on adjacency lists with recursive CTEs. When Neo4j wins: variable-depth traversal, shortest path, complex pattern matching across many edge types (social networks, fraud detection, knowledge graphs).
            </P>
            <H2 num="◇ TS">Time-series — TimescaleDB, InfluxDB, QuestDB</H2>
            <P>
              Append-mostly, time-stamped data — metrics, sensor readings, logs. Optimizations: time-based partitioning, compression of older partitions, continuous aggregates (auto-rollups).
            </P>
            <Code id="timescale">{`-- TimescaleDB is a PostgreSQL extension — best of both worlds
CREATE EXTENSION timescaledb;

CREATE TABLE metrics (
    time      TIMESTAMPTZ NOT NULL,
    device_id INTEGER NOT NULL,
    metric    TEXT NOT NULL,
    value     DOUBLE PRECISION
);

-- Convert to hypertable — auto time partitioning
SELECT create_hypertable('metrics', 'time', chunk_time_interval => INTERVAL '1 day');

-- Continuous aggregate — auto-rolled-up hourly avg
CREATE MATERIALIZED VIEW metrics_hourly
    WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS hour,
       device_id, metric,
       AVG(value), MIN(value), MAX(value)
FROM metrics
GROUP BY hour, device_id, metric;

-- Refresh policy — auto-update the matview
SELECT add_continuous_aggregate_policy('metrics_hourly',
    start_offset => INTERVAL '3 hours',
    end_offset   => INTERVAL '1 hour',
    schedule_interval => INTERVAL '15 minutes');`}</Code>
            <H2 num="◇ VECTOR">Vector search — pgvector + alternatives</H2>
            <P>
              Embeddings are dense numerical vectors representing meaning. Stored in vector DBs for similarity search. The 2026 default for RAG, semantic search, recommendations.
            </P>
            <Code id="pgvector-section">{`-- pgvector is a PG extension — vectors alongside relational data
CREATE EXTENSION vector;

CREATE TABLE documents (
    id          UUID PRIMARY KEY DEFAULT uuidv7(),
    title       TEXT,
    content     TEXT,
    embedding   VECTOR(1536),       -- OpenAI text-embedding-3-small
    metadata    JSONB,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- HNSW index for fast ANN search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Similarity search (cosine distance)
SELECT id, title, embedding <=> $1::vector AS distance
FROM documents
WHERE metadata->>'lang' = 'en'        -- prefilter
ORDER BY embedding <=> $1::vector
LIMIT 10;

-- Distance operators:
--   <=>  cosine distance
--   <->  L2 distance (Euclidean)
--   <#>  negative inner product`}</Code>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'pgvector', what: "PostgreSQL extension. 2026 default for vectors alongside your relational data. Supabase ships it; AWS RDS supports it." },
                { name: 'Qdrant', what: "Rust, fast, open-source. Strong filtering. Self-host or Cloud. Good when scale outgrows pgvector." },
                { name: 'Pinecone', what: "Managed service, mature, good DX. Closed source. Expensive at scale." },
                { name: 'Weaviate', what: "Open-source, GraphQL-native, hybrid search built-in. Good for content-platform use cases." },
                { name: 'Milvus / Zilliz', what: "Distributed scale-out vector DB. For 100M+ vector use cases." },
                { name: 'FAISS', what: "Facebook's vector library (not a DB). Library you integrate yourself. Fastest if you control the stack." },
              ].map(v => (
                <div key={v.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-indigo-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{v.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{v.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ SEARCH">Search engines — Elasticsearch, Meilisearch, Typesense</H2>
            <P>
              Full-text search with relevance ranking, fuzzy matching, faceted filtering, autocomplete. PostgreSQL FTS handles a lot — switch when you need typo tolerance, faceted filters, real-time updates, instant autocomplete.
            </P>
            <Callout kind="info" title="MEILISEARCH vs ELASTIC vs TYPESENSE">
              Elasticsearch: most feature-rich, biggest learning curve, JVM. Meilisearch: simpler, fast, Rust, great DX. Typesense: search-as-you-type focus, simpler than Elastic. For new projects in 2026, Meilisearch or Typesense usually beats Elastic on DX unless you specifically need log aggregation (the Elastic Stack).
            </Callout>
            {stackData?.spark && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.spark}</Callout>}
            {QUIZZES.nosql.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 7:
        return (
          <>
            <H2 num="◇ ARCH">Replication topology</H2>
            <P>
              Most production databases run as a <strong>primary + replicas</strong> topology. Primary accepts writes; replicas stream the WAL and serve reads. The dashed line below shows WAL streaming from primary to replica.
            </P>
            <ArchDiagram />
            <H2 num="◇ CAP">CAP — what it actually says</H2>
            <P>
              CAP is widely misstated. The theorem (Brewer 2000, formalized Gilbert-Lynch 2002): under network <strong>partition</strong>, a distributed system must choose between <strong>Consistency</strong> (refuse to serve potentially stale data) and <strong>Availability</strong> (serve, possibly stale). Without partition, you can have both.
            </P>
            <P>
              Daniel Abadi's <strong>PACELC</strong> (2010) is more useful: "if Partition, then A or C; Else, Latency or Consistency." Most systems aren't partitioned most of the time — so the latency-vs-consistency tradeoff during normal operation matters more.
            </P>
            <ComparisonTable data={COMPARISONS.cap} />
            <H2 num="◇ REPL">Replication — async vs sync vs semi-sync</H2>
            <Code id="repl" lang="text">{`ASYNC REPLICATION (PostgreSQL default)
  Primary commits, returns to client immediately.
  Replica eventually catches up (milliseconds, usually).
  - Pro: fast writes
  - Con: replica may lag; failover loses recent writes

SYNC REPLICATION (synchronous_standby_names set)
  Primary waits for replica to acknowledge WAL.
  - Pro: zero data loss on failover
  - Con: write latency = primary disk + network + replica disk
  - Risk: if replica unreachable, primary BLOCKS writes
    (or set synchronous_commit = remote_apply for stricter; 'remote_write' for looser)

QUORUM SYNC (multi-replica)
  Wait for K of N replicas to ack. Tunable consistency.
  PG: ANY 2 (sync_1, sync_2, sync_3) — first two to ack

LOGICAL REPLICATION (PG 10+)
  Publishes row-level changes filtered by table.
  - Cross-version upgrades, partial replication, multi-master patterns.
  - Doesn't replicate DDL (you handle schema yourself).`}</Code>
            <H2 num="◇ SHARD">Sharding — partitioning across machines</H2>
            <P>
              Horizontal partitioning: each shard holds a subset of rows. Lets you scale beyond one machine's storage / write throughput. Sharding strategies:
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'Hash sharding', what: "shard = hash(key) % N. Even distribution, but resharding requires moving most data when N changes. Used by Cassandra, DynamoDB." },
                { name: 'Range sharding', what: "shard by key range (A-F, G-M, ...). Sequential access stays on one shard. Hotspots if keys are time-ordered (most recent shard hot). Used by HBase, BigTable." },
                { name: 'Directory-based', what: "explicit shard map per key in a lookup service. Most flexible (move single tenants between shards) but adds an indirection. Common in SaaS multi-tenant." },
                { name: 'Application-level', what: "app picks the shard. PostgreSQL via Citus does this. Painful operationally — backups, schema changes, cross-shard queries all harder." },
                { name: 'Vitess (MySQL)', what: "YouTube's MySQL sharding solution; PlanetScale builds on this. Hides sharding from the app for many query patterns." },
                { name: 'Native distributed SQL', what: "CockroachDB, Spanner, TiDB — distribute transparently. SQL goes through a coordinator. PostgreSQL-compatible (mostly)." },
              ].map(s => (
                <div key={s.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-indigo-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{s.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-0.5">{s.what}</div>
                </div>
              ))}
            </div>
            <Callout kind="tip" title="DEFER SHARDING">
              Postgres on a single big machine handles way more than people think (10+ TB, billions of rows, tens of thousands of QPS routinely). Sharding adds enormous operational complexity. Vertical scale + read replicas + partitioning first; shard only when measurement demands.
            </Callout>
            <H2 num="◇ CONSISTENCY">Consistency models</H2>
            <Code id="consistency" lang="text">{`From STRONGEST to WEAKEST (each implies the next):

STRICT (linearizable)
  Every read sees the latest committed write, globally ordered.
  Achievable with consensus (Raft, Paxos) — Spanner, etcd, CockroachDB.

SEQUENTIAL
  All clients see operations in same order, but not necessarily real-time order.

CAUSAL
  Causally related ops seen in same order; concurrent ops may reorder.
  Most useful for collaborative apps.

READ-YOUR-WRITES
  You see your own writes immediately. Others may not.
  Achieved with session affinity to one replica, or read-from-primary after own writes.

MONOTONIC READS
  Successive reads from one client don't go backwards in time.
  Useful for replicated reads — pin a session to one replica.

EVENTUAL
  Replicas converge eventually. No bound on staleness.
  DynamoDB default, Cassandra default.`}</Code>
            <Callout kind="cite" title="FURTHER READING">
              Martin Kleppmann's <em>Designing Data-Intensive Applications</em> chapters 5 (Replication), 6 (Partitioning), 7 (Transactions), 9 (Consistency &amp; Consensus) are the canonical treatment. Free preview chapters at oreilly.com.
            </Callout>
            {QUIZZES.distributed.map(q => <Quiz key={q.qid} quiz={q} />)}
          </>
        );

      case 8:
        return (
          <>
            <H2 num="◇ LIB">A working library of database patterns</H2>
            <P>
              Eight categories of production-grade SQL idioms — PostgreSQL-flavored, most patterns translate to other engines. Every snippet has a copy button. Paste straight into psql, your migration tool, your ORM-bypass code path.
            </P>
            <P>
              All MIT-licensed. Copy, adapt, ship.
            </P>
            <LibraryViewer />
            <H2 num="◇ DOWNLOAD">Take the library with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-indigo-400 text-indigo-300 px-4 py-2 text-[13px] hover:bg-indigo-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <Library size={14} /> Download library.md
              </button>
            </div>
            <H2 num="◇ DONT">Anti-patterns — things to avoid</H2>
            <div className="grid gap-2 my-3">
              {ANTIPATTERNS.map(a => (
                <Callout key={a.name} kind="dont" title={a.name}>{a.reason}</Callout>
              ))}
            </div>
            <Callout kind="cite" title="INSPIRATION">
              Library patterns drawn from PostgreSQL official docs (postgresql.org/docs/18), Kleppmann (DDIA), Use The Index Luke (Markus Winand), Crunchy Data + pganalyze blogs, Supabase docs, pgvector README, and decades of accumulated wisdom from production incidents.
            </Callout>
            {stackData?.library && <Callout kind="you" title={`FOR YOUR STACK · ${stackLabel}`}>{stackData.library}</Callout>}
          </>
        );

      case 9:
        return (
          <>
            <H2 num="◇ LIVE">Real SQLite execution in your browser</H2>
            <P>
              The sandbox uses <strong>sql.js 1.14.0</strong> — SQLite compiled to WebAssembly, loaded from jsDelivr (~1.5 MB WASM, MIT license). Full SQLite 3.53 feature set: every join type, window functions, CTEs (including recursive), triggers, prepared statements, transactions.
            </P>
            <P>
              The database is pre-seeded with a realistic e-commerce schema: <Kbd>users</Kbd>, <Kbd>products</Kbd>, <Kbd>orders</Kbd>, <Kbd>order_items</Kbd>, <Kbd>reviews</Kbd>. Six progressive challenges from basic SELECT through window functions and recursive CTEs. Pass each, advance.
            </P>
            <Code id="schema-ref" lang="text">{`Pre-seeded schema (sandbox):

  users (id, name, email, country, created_at)             — 5 rows
  products (id, name, category, price, stock)              — 6 rows
  orders (id, user_id, status, total, created_at)          — 9 rows
  order_items (order_id, product_id, qty, price)           — 15 rows
  reviews (id, user_id, product_id, rating, body, ...)     — 6 rows

Try in free play mode:
  - SELECT name, country FROM users;
  - SELECT category, AVG(price) FROM products GROUP BY category;
  - WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i+1 FROM n WHERE i<10) SELECT * FROM n;`}</Code>
            <Sandbox />
            <Callout kind="cite" title="HOW IT WORKS">
              sql.js is the JavaScript wrapper around SQLite's WebAssembly build. The Wasm binary contains the full SQLite engine (D. Richard Hipp's C codebase, public domain). <Kbd>db.exec(sql)</Kbd> returns <Kbd>[{`{columns, values}`}]</Kbd> for SELECTs; empty for DDL/DML. In-memory only — the database resets if you refresh the page.
            </Callout>
            <Callout kind="tip" title="LOCAL POSTGRESQL">
              For real practice: install PostgreSQL 18 locally (<Kbd>brew install postgresql</Kbd> on macOS, postgresql.org/download elsewhere), or run <Kbd>docker run --name pg -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:18</Kbd>. Load the dvdrental sample database. Run EXPLAIN ANALYZE on every query for a week.
            </Callout>
          </>
        );

      case 10:
        return (
          <>
            <H2 num="◇ TRIAGE">When the database is the problem</H2>
            <P>
              Most database issues fall into a small number of categories. Walk the tree, read EXPLAIN ANALYZE, check pg_stat_activity. The fixes are usually well-known once you've identified the category.
            </P>
            <Troubleshooter />
            <H2 num="◇ TOOLS">The debugger's toolkit</H2>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { name: 'EXPLAIN ANALYZE', what: "The first thing to reach for. Shows real plan + timings + I/O. Compare estimated vs actual rows to detect stale statistics." },
                { name: 'explain.depesz.com / explain.dalibo.com', what: "Paste EXPLAIN output, get a visualization highlighting slow nodes. Free, indispensable." },
                { name: 'pg_stat_activity', what: "Currently running queries. <Kbd>WHERE state != 'idle'</Kbd> shows what's actually working. Old query_start = stuck query." },
                { name: 'pg_stat_statements', what: "Aggregated stats per normalized query — total time, mean time, call count. The single best tool for finding queries worth optimizing." },
                { name: 'pg_locks', what: "Currently held locks + waits. Join with pg_stat_activity to see who's blocking whom." },
                { name: 'pganalyze', what: "Commercial monitoring — query plan diffing, index recommendations, alerts. Free tier exists. The gold standard for PG ops." },
                { name: 'pgBadger', what: "Free PostgreSQL log analyzer. Parses log files, generates HTML reports of slow queries, errors, locks." },
                { name: 'Crunchy pgMonitor', what: "Open-source PG monitoring stack — Prometheus + Grafana dashboards." },
                { name: 'auto_explain extension', what: "Logs the plan of slow queries automatically. <Kbd>auto_explain.log_min_duration = 1000</Kbd> (ms)." },
              ].map(t => (
                <div key={t.name} className="border border-zinc-800 px-3 py-2">
                  <div className="text-indigo-300 text-[13px] font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{t.name}</div>
                  <div className="text-zinc-400 text-[12px] mt-1 leading-relaxed">{t.what}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ TOP3">Top three production database issues</H2>
            <ol className="space-y-3 my-3 text-[14px]">
              <li className="flex gap-3">
                <span className="text-indigo-400 shrink-0 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>01</span>
                <div>
                  <div className="text-zinc-100 font-medium">Slow queries from missing or wrong indexes</div>
                  <div className="text-zinc-400 text-[13px] mt-0.5">Add the right composite index. EXPLAIN ANALYZE before and after. Test on production-shaped data.</div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 shrink-0 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>02</span>
                <div>
                  <div className="text-zinc-100 font-medium">Connection pool exhaustion</div>
                  <div className="text-zinc-400 text-[13px] mt-0.5">Add PgBouncer / Supavisor in transaction-pooling mode. Don't crank max_connections — pool first.</div>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 shrink-0 font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>03</span>
                <div>
                  <div className="text-zinc-100 font-medium">Bloat from under-tuned autovacuum + long transactions</div>
                  <div className="text-zinc-400 text-[13px] mt-0.5">Tune autovacuum_vacuum_scale_factor per big table. Kill long-running 'idle in transaction' sessions.</div>
                </div>
              </li>
            </ol>
          </>
        );

      case 11:
        return (
          <>
            <H2 num="◇ PROGRESS">Where you are</H2>
            <div className="grid grid-cols-3 gap-2 my-3">
              <div className="border border-zinc-800 p-3 text-center">
                <div className="text-indigo-300 text-[28px] font-bold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>{totalCorrect}</div>
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
                      <div className="text-indigo-300 text-[12px]"><span className="text-zinc-500">Correct:</span> {q.opts[q.a]}</div>
                      <div className="text-zinc-400 text-[12px] mt-1">{q.x}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <H2 num="◇ ROADMAP">A database reading roadmap</H2>
            <P>
              For your stack (<strong>{stackLabel || "—"}</strong>): {stackData?.spark || "pick a stack to personalize"}
            </P>
            <div className="grid gap-2 my-3 text-[13px]">
              {[
                { wk: 'Week 1', plan: "Install PostgreSQL 18 locally + load the dvdrental sample DB. Run psql. Practice SELECT / WHERE / JOIN. Try every example from postgresql.org/docs/18/tutorial.html." },
                { wk: 'Week 2', plan: "SQL fluency: GROUP BY, HAVING, subqueries, CTEs. Window functions deep dive — modern-sql.com/feature/window-functions. Build something real (a Hacker News-style commenting system)." },
                { wk: 'Week 3-4', plan: "Use The Index Luke (use-the-index-luke.com) cover to cover. Run EXPLAIN ANALYZE on every query. Build intuition for the cost model. Audit your week-2 project's plans." },
                { wk: 'Week 5-6', plan: "Kleppmann's DDIA chapters 1-7 — fundamentals, replication, partitioning, transactions. Best book on databases for app engineers. Pair with PG's WAL / MVCC docs." },
                { wk: 'Week 7-9', plan: "Build with a hosted PG (Supabase or Neon). Add a real workload: scheduled jobs, replication setup, monitoring (pganalyze free tier). Read postgresweekly.com weekly." },
                { wk: 'Week 10+', plan: "Specialize: pgvector for AI workloads; DuckDB for analytics; CockroachDB for distributed. Read PG internals docs (postgresql.org/docs/18/internals.html). Watch CMU 15-445 (Andy Pavlo) on YouTube — best database lectures online." },
              ].map(w => (
                <div key={w.wk} className="border-l-2 border-indigo-400 pl-3 py-1">
                  <div className="text-indigo-300 text-[12px] font-bold" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{w.wk}</div>
                  <div className="text-zinc-300 text-[12px] mt-0.5">{w.plan}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ RES">Authoritative resources</H2>
            <div className="grid gap-1.5 my-3 text-[13px]">
              {RESOURCES.map(r => (
                <div key={r.name} className="border border-zinc-800 px-3 py-2">
                  <div className="flex items-start gap-2 flex-wrap">
                    <span className="text-indigo-300 text-[13px] font-medium">{r.name}</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider px-1.5 border border-zinc-700" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.kind}</span>
                  </div>
                  <code className="text-pink-300 text-[11px] block mt-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{r.url}</code>
                  <div className="text-zinc-400 text-[12px] mt-1">{r.note}</div>
                </div>
              ))}
            </div>
            <H2 num="◇ EXPORT">Take it with you</H2>
            <div className="flex flex-wrap gap-2 my-3">
              <button onClick={exportCheatsheet} className="flex items-center gap-2 border border-indigo-400 text-indigo-300 px-4 py-2 text-[13px] hover:bg-indigo-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <BookOpen size={14} /> Download cheatsheet.md
              </button>
              <button onClick={exportLibrary} className="flex items-center gap-2 border border-pink-400 text-pink-300 px-4 py-2 text-[13px] hover:bg-pink-400/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
              Databases are the foundation. Get them right and every layer above benefits — get them wrong and every layer above suffers. You've walked from Codd's 1970 paper through the current 2026 landscape: the engine matrix, relational thinking, SQL with window functions and CTEs, indexes and EXPLAIN, transactions and isolation levels, the NoSQL specializations, distributed tradeoffs, a working library of patterns, real SQL execution, and the triage tree. Open the PostgreSQL docs, fire up psql, and start querying.
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
            <div className="text-indigo-400 text-[28px] leading-none font-bold shrink-0" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>⛁</div>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.3em] text-zinc-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>ATLAS</div>
              <div className="text-zinc-100 text-[16px] font-bold leading-tight truncate" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>DB</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {stack && (
              <button onClick={() => setShowOnboarding(true)} className="hidden sm:flex items-center gap-1.5 border border-lime-300/40 text-lime-200 px-2 py-1 text-[11px] hover:bg-lime-300/10" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                {STACKS.find(s => s.id === stack)?.icon} {stackLabel}
              </button>
            )}
            <button onClick={() => setCmdOpen(true)} className="flex items-center gap-1.5 border border-zinc-700 text-zinc-400 px-2 py-1 text-[11px] hover:border-indigo-400 hover:text-indigo-300" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
                  isActive ? 'border-indigo-400 bg-indigo-400/10 text-indigo-300' :
                  isDone ? 'border-zinc-700 text-zinc-400' :
                  'border-zinc-800 text-zinc-500 hover:text-zinc-300'
                }`}
                style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                <span className="text-[9px] opacity-60">{s.num}</span>
                <Icon size={12} />
                <span>{s.label}</span>
                {isDone && <Check size={11} className="text-indigo-400" strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-5 pb-4 border-b border-zinc-900">
          <div className="text-[10px] uppercase tracking-[0.3em] text-indigo-400 mb-1" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
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
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <ChevronLeft size={14} /> {activeSection > 0 ? SECTIONS[activeSection - 1].label : 'Start'}
          </button>
          <button onClick={() => markComplete(activeSection)} disabled={completed.has(activeSection)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] border transition-colors ${
              completed.has(activeSection) ? 'border-indigo-400 text-indigo-300 bg-indigo-400/10 cursor-not-allowed' :
              'border-zinc-700 text-zinc-400 hover:border-indigo-400 hover:text-indigo-300'
            }`} style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            <Check size={12} /> {completed.has(activeSection) ? 'COMPLETE' : 'mark complete'}
          </button>
          <button onClick={() => setActiveSection(Math.min(SECTIONS.length - 1, activeSection + 1))} disabled={activeSection === SECTIONS.length - 1}
            className="flex items-center gap-1.5 text-[12px] text-zinc-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {activeSection < SECTIONS.length - 1 ? SECTIONS[activeSection + 1].label : 'End'} <ChevronRight size={14} />
          </button>
        </div>

        <div className="mt-12 pb-6 text-center">
          <div className="text-zinc-700 text-[10px] uppercase tracking-[0.4em]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            ⛁ · db atlas · grounded in postgresql 18 + DDIA + use-the-index-luke + cppreference-class docs
          </div>
        </div>
      </main>
    </div>
  );
}
