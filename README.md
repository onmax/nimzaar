# Nimzaar

Nimzaar is a Nuxt 4 and NuxtHub mini app with an API-first backend, Better Auth integration, and Cloudflare deployment targets.

Live app: [nimzaar.maximogarciamtnez.workers.dev](https://nimzaar.maximogarciamtnez.workers.dev/)

## Quickstart

```bash
pnpm install
export NUXT_BETTER_AUTH_SECRET=YOUR_SECRET
pnpm dev
```

Then open `http://localhost:5175`.

Expected result: the Nuxt app starts locally, server routes are available, and you can load the app in a browser before testing it inside Nimiq Pay's mini-app browser.

## Requirements

- Package manager: `pnpm@10.29.2`
- Framework: Nuxt 4
- Deployment target: Cloudflare Workers with D1, KV, and R2

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `NUXT_BETTER_AUTH_SECRET` | Yes | None | Better Auth secret used at runtime. |
| `NUXT_NIMIQ_RPC_URL` | No | `https://rpc.nimiqwatch.com` | Nimiq RPC endpoint. |
| `NUXT_MIN_CONFIRMATIONS` | No | `1` | Minimum confirmation count for transaction-dependent flows. |
| `NUXT_MAX_PDF_BYTES` | No | `10485760` | Maximum PDF upload size in bytes. |

## Database workflows

Generated migrations live in `server/db/migrations/`.

```bash
pnpm exec nuxt db generate
pnpm exec nuxt db migrate
```

Use these commands when the local schema changes and you need to update the SQLite development database.

## Deploy to Cloudflare

Build and deploy the app with:

```bash
pnpm cf:deploy
```

If you are provisioning resources for the first time, create them before deploying:

```bash
wrangler d1 create nimzaar
wrangler kv namespace create KV
wrangler r2 bucket create nimzaar
wrangler secret put NUXT_BETTER_AUTH_SECRET
```

These commands create persistent Cloudflare resources and can incur cost, so only run them against the account you intend to use.

To apply remote D1 migrations:

```bash
pnpm cf:migrate:remote
```

The current Cloudflare bindings are defined in `wrangler.jsonc` as `DB`, `KV`, and `BLOB`.

## Common workflows

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm typecheck
```
