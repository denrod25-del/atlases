# Deploy bundle — remaining 6 backlog atlases

Staged July 7, 2026 by the Claude Code session that shipped the hub overhaul
(PR #1) and synced `api-atlas` + `security-atlas`. This directory contains
everything a fresh Claude Code session needs to finish Workstream B of the
B. Symbolic atlases handoff.

## Contents

| File | Purpose |
|---|---|
| `04-prod-atlas.tar.gz` … `08-obs-atlas.tar.gz` | Clean source bundles (source of truth) |
| `09-reliability-atlas-complete.tar.gz` | Reliability atlas **with §04 complete** (Reliability Cost Curve + atlas-closing wrap) — use this, not any older stubbed copy |
| `finish-workstream-b.sh` | Alternative: run locally on a machine with `gh` + `vercel` authed — does GitHub AND Vercel halves |
| `KICKOFF-PROMPT.md` | Paste-ready prompt for the new Claude Code session |

## How to use (new-session path)

1. Create a **new Claude Code session** on the web, selecting ALL of these
   repositories at creation time:
   `atlases`, `prod-atlas`, `db-atlas`, `dist-atlas`, `event-atlas`,
   `obs-atlas`, `reliability-atlas` (all under `denrod25-del`).
2. Paste the contents of `KICKOFF-PROMPT.md` as the first message.
3. Vercel: if the six Vercel projects already exist and are connected to the
   GitHub repos, the pushes auto-deploy and nothing more is needed. If not,
   import each repo once at https://vercel.com/new (framework: Vite,
   defaults are fine — `vercel.json` is in each repo).

## Facts the new session should trust (learned the hard way)

- The six repos **already exist** on GitHub from a prior deploy pass — do
  not try to create them; clone/sync/push instead.
- The GitHub copies may be **mojibake-corrupted** (security-atlas had
  em-dashes mangled via a Windows-1252 round-trip, plus a BOM) and may have
  `node_modules` committed with no `.gitignore` (api-atlas did). The
  tarballs in this directory are clean — treat them as source of truth and
  overwrite repo content wholesale.
- Build script must be the Vercel-fix form
  `node ./node_modules/vite/bin/vite.js build` (convention 4.2 of the
  handoff; some tarballs regressed to plain `vite build`).
- db-atlas uses sql.js — its bundle is ~250 KB gzipped, expected.
- Pre-flight secret scan before every push:
  `grep -rEn "sk_live_[a-zA-Z0-9]{20}|AKIA[A-Z0-9]{16}|ghp_[a-zA-Z0-9]{20}|ghs_[a-zA-Z0-9]{20}" src/`
  (must be silent).
