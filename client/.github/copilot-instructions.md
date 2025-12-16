The repository is a small React + Vite frontend for a neighborhood store (Dukan). These instructions are written to help an AI coding agent be immediately productive when making changes, fixes, or features.

High-level architecture
- Single-page React app bootstrapped with Vite. Entry: `src/main.jsx` -> `src/App.jsx`.
- Client-side routing is handled with React Router. Routes live in `src/routes/AppRoutes.jsx` and map paths to the pages under `src/pages/`.
- UI is composed of small presentational components under `src/components/` (e.g. `Header.jsx`, `Footer.jsx`, `ProductCard.jsx`). Pages assemble components and perform data fetching.
- Styling uses Tailwind (see `vite.config.js` and `package.json` deps). Global CSS imported from `src/index.css`.

Developer workflows (explicit commands)
- Start dev server with: `npm run dev` (uses Vite with HMR).
- Build for production: `npm run build`.
- Preview built output: `npm run preview`.
- Lint the codebase: `npm run lint` (ESLint configured; keep changes compatible with existing rules).

Project-specific conventions and patterns
- File locations
  - Routes: `src/routes/AppRoutes.jsx` — add new routes here and ensure corresponding pages exist in `src/pages/`.
  - Pages: `src/pages/*.jsx` — pages may fetch remote data and compose `src/components/*`.
  - Components are small, presentational, and imported without extension in many files (e.g. `import Header from './components/Header'`). Keep default exports for components unless converting the file structure.

- Data fetching
  - The UI expects a backend API on localhost:5000 in some pages. Example: `src/pages/Home.jsx` fetches `http://localhost:5000/api/products` and expects an array of product objects with at least `id` and other display fields.
  - Keep fetch usage simple and resilient: check for non-JSON responses and guard against network errors (the current code already uses try/catch and a `loading` state).

- Routing & Links
  - Use React Router's `Link` for internal navigation. Query parameters are used for category filtering (example: `/products?category=...`). When adding links, prefer `to` with encoded parameters.

- IDs and keys
  - Product lists use `product.id` as the React `key` in `Home.jsx`. Preserve `id` as the canonical key when adding or transforming product arrays.

Integration points & external deps
- Backend API: localhost:5000 (endpoints under `/api/*`). No backend code is present here; tests and changes to API contracts should be coordinated with the backend.
- Tailwind + `@tailwindcss/vite` are used—if you add classes, ensure they match the utility-first approach and avoid global CSS unless necessary.

Code style and small gotchas
- The project uses JSX, modern React (v19+) and ESM imports. Prefer function components and hooks (useState/useEffect) consistent with existing files.
- ESLint is configured; run `npm run lint` after non-trivial edits.
- Images in `Home.jsx` sometimes use external Unsplash URLs. When adding assets, place them under `src/assets/` and import them to allow Vite to bundle them.
- Some files import components without the `.jsx` extension. Maintain that style for consistency.

If you modify or add routes
- Add the new page file under `src/pages/` and then add a matching <Route> in `src/routes/AppRoutes.jsx`.
- Ensure the `Header` or navigation contains links to the new route if it should be surfaced globally.

Quick examples from the codebase
- Add a route: edit `src/routes/AppRoutes.jsx` and add: <Route path="/new" element={<NewPage/>} /> then create `src/pages/NewPage.jsx` that exports a default React component.
- Fetching pattern: follow `src/pages/Home.jsx` — use useEffect -> async fetch -> set state -> set loading false in finally.

What NOT to change without confirmation
- Major changes to the API contract (URLs, field names) since the backend is external to this repo.
- Replacing Tailwind with another CSS system without a migration plan.

Where to look first when debugging
- Dev server logs (terminal where `npm run dev` runs).
- Browser console for runtime React errors and network tab for API call URLs and responses.
- `src/pages/Home.jsx`, `src/routes/AppRoutes.jsx`, `src/components/ProductCard.jsx` for product-listing issues.

If something is ambiguous
- Ask for the intended UX and whether the backend can be changed. If the user doesn't reply, prefer non-breaking, minimal changes (small UI fixes, defensive checks, and tests if applicable).

Please review and tell me if you'd like more examples or expansion on tests or CI integration.
