# Atlases

Eight interactive learning atlases — databases, programming languages, automation, deployment infrastructure. Real sandboxes, curated libraries, chapter-by-chapter quizzes.

## Run locally

```bash
npm install
npm run dev
```

Open the URL it prints (typically <http://localhost:5173>).

## Build for production

```bash
npm run build
npm run preview      # to test the production build locally
```

The built site lives in `dist/`.

## Deploy

This project is configured for Vercel. Push to GitHub, then in Vercel:
1. **Add New Project** → import your repo
2. Vercel auto-detects Vite — no config needed
3. **Deploy**

`vercel.json` rewrites all paths to `index.html` so React Router works on direct URL visits.

## Project layout

```
src/
  main.jsx              React root; loads storage shim first
  App.jsx               Routes (one per atlas, code-split)
  index.css             Tailwind directives
  pages/
    Landing.jsx         Landing page listing all 8 atlases
  atlases/              All 8 atlas components
  lib/
    storage-shim.js     localStorage-backed window.storage API
```

## Adding a new atlas

1. Drop the new `*.jsx` file in `src/atlases/`
2. Add the lazy import in `src/App.jsx`
3. Add the route in `src/App.jsx`
4. Add a card in `src/pages/Landing.jsx`

That's it.
