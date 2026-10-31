# Jinnah League

Jinnah League website + custom CMS.

```
Jinnah-League-Project/
├── frontend/   React + Vite + Tailwind app (public site and, later, the CMS) → GitHub Pages
├── backend/    Node.js + Express REST API, Prisma ORM                      → separate Node host
└── docs/       Architecture notes (see docs/DATABASE.md)
```

The two apps are independent: each has its own `package.json`, `node_modules` and `.env`.

## Frontend (GitHub Pages)

```bash
cd frontend
npm ci
npm run dev        # http://localhost:5173/Jinnah-League-Project/
npm run build
npm run deploy     # builds, then publishes dist/ to the gh-pages branch
```

Live URL: https://abdullah-rehmani-222.github.io/Jinnah-League-Project/

GitHub Pages notes: the app uses `HashRouter` (URLs look like `/#/about`) so deep links and refreshes work on static
hosting, and `vite.config.js` sets `base: '/Jinnah-League-Project/'`. If you later move to a custom domain at the root,
change `base` to `'/'`. In the repo settings, Pages must serve the **gh-pages** branch, root folder.

## Backend

GitHub Pages only serves static files, so the API must be hosted elsewhere (Render, Railway, Fly.io, ...).

```bash
cd backend
npm ci
cp .env.example .env     # fill in the Neon connection strings
npm run build            # prisma generate
npx prisma migrate deploy
npm run seed             # first admin (ADMIN_EMAIL / ADMIN_PASSWORD) + system pages
npm run dev              # http://localhost:5000/api/health
npm test                 # TEST_DATABASE_URL must be a LOCAL disposable database
```

API reference, auth flow and deployment checklist: [docs/API.md](docs/API.md)  
Database design, ERD and migration commands: [docs/DATABASE.md](docs/DATABASE.md)
