# Contributing to Flightrec

Thanks for helping. This is a pnpm + Turborepo monorepo.

## Setup

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

Prereqs: Node 20+, pnpm 11+ (the repo pins `packageManager` — `corepack enable` picks it up).

## Layout

- `apps/web` — landing page, `/docs`, `/inspector`, `/playground`
- `packages/trace-schema` — the Zod contract (`TraceEvent`, `Session`, …)
- `packages/trace-fixtures` — golden demo sessions
- `packages/recorder` — capture core + `AsyncLocalStorage` context + recording vocabulary

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the HLD/LLD.

## Checks (all must pass; CI runs them)

```bash
pnpm test        # vitest
pnpm typecheck   # tsc --noEmit
pnpm check       # biome lint + format
```

Husky runs lint-staged + commitlint on commit.

## PRs

1. Branch off `main` (`feat/…`, `fix/…`, `docs/…`, `chore/…`).
2. **Conventional Commits** for messages (`feat(scope): …`) — commitlint enforces it.
3. Keep diffs surgical; add a test for non-trivial logic.
4. Open a PR against `main`; CI must be green.

## Gotchas

- A client-imported file gaining a package import can pull Node-only modules (e.g. `node:async_hooks`) into the browser bundle — run `pnpm --filter @flightrec/web build`, not just `typecheck`.
- Filesystem/native side effects must degrade in production (read-only fs on Vercel) — gate on `NODE_ENV` and guard with try/catch.
