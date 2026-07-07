#!/usr/bin/env bash
# finish-workstream-b.sh — sync + deploy the remaining 6 backlog atlases.
#
# Context (July 7, 2026 session):
#   * api-atlas and security-atlas are DONE — already synced and pushed to
#     GitHub by the Claude session (check Vercel dashboard; if the repos are
#     connected to Vercel projects they have auto-deployed).
#   * The 6 repos below could not be reached from the remote session.
#   * IMPORTANT — two discoveries from the first two repos, assumed to apply
#     to the rest:
#       1. The repos likely ALREADY EXIST on GitHub (prior deploy attempt).
#          This script handles both exists / not-exists.
#       2. The GitHub copies may be MOJIBAKE-CORRUPTED (security-atlas had
#          em-dashes mangled via a Windows-1252 round-trip). The handoff
#          tarballs are clean — this script treats them as source of truth
#          and overwrites repo content with tarball content.
#
# Run from a directory containing the handoff tarballs:
#   02-api-atlas.tar.gz ... 09-reliability-atlas.tar.gz
#   AND 09-reliability-atlas-complete.tar.gz (the §04-complete version
#   delivered by the Claude session — used INSTEAD of the original 09).
#
# Prereqs: node>=20, git, gh (authed as denrod25-del), vercel (authed).

set -uo pipefail

declare -A ATLASES=(
  ["prod-atlas"]="04-prod-atlas.tar.gz"
  ["db-atlas"]="05-db-atlas.tar.gz"
  ["dist-atlas"]="06-dist-atlas.tar.gz"
  ["event-atlas"]="07-event-atlas.tar.gz"
  ["obs-atlas"]="08-obs-atlas.tar.gz"
  ["reliability-atlas"]="09-reliability-atlas-complete.tar.gz"
)

fail() { echo "!! $1"; FAILURES+=("$1"); }
FAILURES=()

for NAME in prod-atlas db-atlas dist-atlas event-atlas obs-atlas reliability-atlas; do
  TARBALL="${ATLASES[$NAME]}"
  echo "═══════════════════════════════════════════════"
  echo "Atlas: $NAME  (source: $TARBALL)"
  echo "═══════════════════════════════════════════════"

  [ -f "$TARBALL" ] || { fail "$NAME: tarball $TARBALL missing"; continue; }

  # 1. Get the repo (clone if it exists, else init from scratch)
  rm -rf "_work_$NAME"
  if gh repo view "denrod25-del/$NAME" > /dev/null 2>&1; then
    echo "Repo exists — cloning."
    git clone -q "https://github.com/denrod25-del/$NAME" "_work_$NAME" \
      || { fail "$NAME: clone failed"; continue; }
  else
    echo "Repo does not exist — will create."
    mkdir "_work_$NAME"
    git -C "_work_$NAME" init -q -b main
    CREATE_REPO=1
  fi

  # 2. Overwrite with tarball content (source of truth — fixes mojibake,
  #    stale package.json, missing lockfile)
  tar -xzf "$TARBALL"
  EXTRACT_DIR=$(tar -tzf "$TARBALL" | head -1 | cut -d/ -f1)
  tar -C "$EXTRACT_DIR" -cf - --exclude=node_modules --exclude=dist . \
    | tar -C "_work_$NAME" -xf -
  rm -rf "$EXTRACT_DIR"
  cd "_work_$NAME"

  # 3. .gitignore + untrack node_modules if a previous push committed it
  [ -f .gitignore ] || printf "node_modules/\ndist/\n.env\n.env.local\n.env.*.local\n.vercel\n.DS_Store\n*.log\n" > .gitignore
  git rm -r --cached node_modules -q 2>/dev/null
  rm -rf node_modules

  # 4. Vercel-fix build script (convention 4.2 — avoids Vercel's vite bin
  #    permission bug; some tarballs regressed to plain "vite build")
  node -e "
    const fs = require('fs');
    const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    p.scripts.build = 'node ./node_modules/vite/bin/vite.js build';
    fs.writeFileSync('package.json', JSON.stringify(p, null, 2) + '\n');
  "

  # 5. Build + secret scan
  npm install --silent --no-audit --no-fund > /dev/null 2>&1
  npm run build > /dev/null 2>&1 || { fail "$NAME: build failed"; cd ..; continue; }
  if grep -rEq "sk_live_[a-zA-Z0-9]{20}|AKIA[A-Z0-9]{16}|ghp_[a-zA-Z0-9]{20}|ghs_[a-zA-Z0-9]{20}" src/ 2>/dev/null; then
    fail "$NAME: SECRET SCAN HIT — skipping push"; cd ..; continue
  fi

  # 6. Commit + push (create repo first if needed)
  git add -A
  if git diff --cached --quiet; then
    echo "No changes vs remote — repo already in sync."
  else
    git commit -q -m "atlas: sync from handoff bundle (gitignore, lockfile, utf-8, vercel-fix build)"
  fi
  if [ "${CREATE_REPO:-}" = "1" ]; then
    gh repo create "denrod25-del/$NAME" --public --source=. --push \
      --description "B. Symbolic — interactive learning atlas" \
      || { fail "$NAME: gh repo create failed"; cd ..; unset CREATE_REPO; continue; }
    unset CREATE_REPO
  else
    git push origin main || { fail "$NAME: push failed"; cd ..; continue; }
  fi

  # 7. Vercel production deploy
  vercel link --yes --project="$NAME" 2>/dev/null
  vercel --prod --yes || fail "$NAME: vercel deploy failed"

  cd ..
  echo "✓ $NAME done"
done

echo ""
echo "═══════════════════════════════════════════════"
echo "Verification — all 8 external atlas URLs"
echo "═══════════════════════════════════════════════"
for NAME in api-atlas security-atlas prod-atlas db-atlas dist-atlas event-atlas obs-atlas reliability-atlas; do
  printf "  %-20s → " "$NAME"
  curl -sI --max-time 15 "https://$NAME.vercel.app/" | head -1
done

if [ ${#FAILURES[@]} -gt 0 ]; then
  echo ""
  echo "FAILURES:"
  printf '  %s\n' "${FAILURES[@]}"
  exit 1
fi
echo ""
echo "All done. Remember: submit sitemap.xml in Google Search Console for atlases.vercel.app."
