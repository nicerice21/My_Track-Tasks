# AGENTS.md — MyToDo

本プロジェクトでは日本語を使用する．応答やドキュメント，UIに正確な日本語を使用すること．
Japanese is used in this project. Please use accurate Japanese for responses, documents, and the UI.

Personal task manager (Asana-style) for engineering students. Browser-only PWA on Cloudflare Workers + D1, protected by Cloudflare Access.

## Quick commands

```bash
npm install
npm run dev                 # http://localhost:3000
npm test                    # Vitest unit tests (tests/**/*.test.ts)
npm run typecheck           # vue-tsc typecheck (needs .nuxt generated first)
npm run build:cloudflare   # build for Workers deployment
npx wrangler deploy        # deploy (requires D1 + Access setup)
```

Run `test` and `typecheck` before committing API/logic changes.

**Node version matters**: `package-lock.json` was generated with npm 11 (Node 24+). `npm ci` with npm 10 (Node 22) fails the lockfile sync check. Use Node 24+ locally (`.nvmrc` pins `26`) and in CI (`node-version: 26`).

## Architecture

- **Nuxt 3** with `app/` directory structure. `srcDir: 'app/'` is set **explicitly** in `nuxt.config.ts` — Nuxt 3 defaults to `.` (root), so without it the `app/` dir is silently ignored and `~`/auto-imports break.
- **Nitro preset**: `cloudflare_module` (`nuxt.config.ts` and `wrangler.toml` must agree).
- **API**: `server/api/v1/*` routes; auth in `server/middleware/auth.ts`.
- **DB**: Cloudflare D1 via Drizzle ORM. Schema: `server/db/schema.ts`. Migrations: `migrations/`.
- **PWA**: manual setup in `public/manifest.json` + `public/sw.js`. No `@vite-pwa/nuxt`.
- **Styling**: Tailwind CSS 3 + DaisyUI 4.
- **State**: Pinia via `@pinia/nuxt`.

## Cloudflare D1 binding

The binding name in `wrangler.toml` is `MY_TODO_DB`. It must match `server/utils/db.ts`:

```ts
const db = event.context.cloudflare.env.MY_TODO_DB;
```

If you recreate the DB or change the binding, update both files.

### Migrations

```bash
# local dev DB
npm run db:migrate:local

# remote production DB
npx wrangler d1 migrations apply my-todo-db --remote
```

## Local development

`npm run dev` emulates the Cloudflare runtime (Miniflare), so the D1 binding is available locally. Before first run:

```bash
npm run db:migrate:local   # apply migrations to the local D1
```

Set `DEV_USER_EMAIL` in `.env` to bypass Cloudflare Access auth locally (the auth middleware skips JWT verification and uses this email). Do **not** set it in production.

## Authentication

Cloudflare Access sits in front of Workers. The app validates the `cf-access-jwt-assertion` header in `server/middleware/auth.ts`.

Required runtime config / `wrangler.toml` vars:

- `ALLOWED_EMAIL` — single authorized email
- `ACCESS_AUDIENCE` — Access application audience tag
- `ACCESS_TEAM_DOMAIN` — e.g. `your-team.cloudflareaccess.com` (no `https://`)
- `DEV_USER_EMAIL` — optional; when set, bypasses auth (local dev only)

## Environment variables

- `.env` is loaded for local dev by Nuxt.
- Server runtime config is built from `process.env` at build time (`nuxt.config.ts` `runtimeConfig`).
- Production vars come from `[vars]` in `wrangler.toml` (or Wrangler secrets).

## Target clients

Windows PC (Chrome/Edge) and Android (Chrome). Apple/Safari PWA specifics are intentionally out of scope.

## Frontend

- Types: `app/types/models.ts`. API fetch wrapper: `app/composables/useApi.ts`. Pinia stores: `app/stores/{tasks,subjects,projects}.ts`. Helpers: `app/utils/format.ts`.
- **Data is fetched client-side** (`onMounted` + store), not via `useFetch`/`useAsyncData`. Cloudflare Access only injects the JWT on browser-originated requests, so SSR-side `$fetch` to `/api/*` would 401.
- Components are auto-imported from `app/components/` (PascalCase, e.g. `TaskCard`, `TaskForm`).

## Timestamp conventions

Two timestamp styles coexist in the schema — do not mix them up:

- **TEXT columns** (`created_at`, `updated_at`, `logged_at`) → ISO 8601 string via `new Date().toISOString()`.
- **INTEGER columns** (`due_date`, `target_completion_date`, `completed_date`) → UNIX **milliseconds** via `Date.now()`. (Design docs show seconds in some examples; the code uses ms.)

## Gotchas

- Use `npm run build:cloudflare`, not `npm run build`, when preparing for Workers.
- `npm run deploy` runs `wrangler deploy`, but Wrangler expects the Cloudflare build output to exist; run `build:cloudflare` first.
- PWA icons are SVG placeholders. Replace with PNGs if Android/Windows install prompts require them.
- `tsconfig.json` extends `./.nuxt/tsconfig.json` and adds `types: ["node", "@cloudflare/workers-types"]`. Vitest's esbuild reads this tsconfig — if tests fail with `TSConfckParseError: .nuxt/tsconfig.app.json`, run `npx nuxt prepare` first.
- Server API handlers use explicit relative imports for utils/schema (not `#imports` or `~`), so pure helpers stay unit-testable.
