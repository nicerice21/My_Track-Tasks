# AGENTS.md — MyToDo

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

## Architecture

- **Nuxt 3** with `app/` directory structure.
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

## Authentication

Cloudflare Access sits in front of Workers. The app validates the `cf-access-jwt-assertion` header in `server/middleware/auth.ts`.

Required runtime config / `wrangler.toml` vars:

- `ALLOWED_EMAIL` — single authorized email
- `ACCESS_AUDIENCE` — Access application audience tag
- `ACCESS_TEAM_DOMAIN` — e.g. `your-team.cloudflareaccess.com` (no `https://`)

## Environment variables

- `.env` is loaded for local dev by Nuxt.
- Server runtime config is built from `process.env` at build time (`nuxt.config.ts` `runtimeConfig`).
- Production vars come from `[vars]` in `wrangler.toml` (or Wrangler secrets).

## Target clients

Windows PC (Chrome/Edge) and Android (Chrome). Apple/Safari PWA specifics are intentionally out of scope.

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
