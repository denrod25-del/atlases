# Paste everything below this line into the new session

Finish Workstream B of the B. Symbolic atlases handoff: sync and push the 6
remaining backlog atlases. All 6 repos are in this session's scope and
already exist on GitHub. The clean source bundles are in the `atlases` repo
on branch `handoff-bundle`, directory `deploy-bundle/` — read
`deploy-bundle/README.md` there first; it lists hard-won facts (repos exist;
GitHub copies may be mojibake-corrupted or have node_modules committed; the
tarballs are source of truth).

For each of: prod-atlas (04), db-atlas (05), dist-atlas (06),
event-atlas (07), obs-atlas (08), reliability-atlas (09 — use
`09-reliability-atlas-complete.tar.gz`, which contains the finished §04):

1. Clone `denrod25-del/<name>` if not already cloned in this session.
2. Extract the matching tarball from `deploy-bundle/` and overwrite the
   clone's content with it (exclude node_modules and dist).
3. Ensure `.gitignore` exists (node_modules/, dist/, .env*, .vercel,
   .DS_Store, *.log); `git rm -r --cached node_modules` if it was committed.
4. Set `scripts.build` in package.json to
   `node ./node_modules/vite/bin/vite.js build`.
5. `npm install && npm run build` — must pass before pushing.
6. Secret scan (pattern in the README) — must be silent.
7. Commit ("atlas: sync from handoff bundle — gitignore, lockfile, utf-8,
   vercel-fix build") and push to `main`.

Then report per-atlas results in a table. Do not modify the `atlases` hub
repo itself. If a Vercel deployment exists for each repo it will auto-deploy
on push; deployment verification from inside the session may be blocked by
the network policy, so just report the pushes.
