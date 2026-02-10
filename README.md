# Nimzaar (NuxtHub)

Single Nuxt 4 + NuxtHub app providing an API-first backend and a minimal Vue UI meant to run inside Nimiq Pay.

## Dev

```bash
pnpm install
pnpm dev
```

Then open the URL in Nimiq Pay's mini-app browser.

### Database

Migrations are generated into `server/db/migrations/`.

```bash
pnpm exec nuxt db generate
pnpm exec nuxt db migrate
```

### Env

- `NUXT_BETTER_AUTH_SECRET` (required)
- `NUXT_NIMIQ_RPC_URL` (default: `https://rpc.nimiqwatch.com`)
- `NUXT_MIN_CONFIRMATIONS` (default: `1`)
- `NUXT_MAX_PDF_BYTES` (default: `10485760`)

## Cloudflare

Build + deploy (Workers + D1 + KV + R2):

```bash
pnpm cf:deploy
```

First-time setup (create resources if you don't have them yet):

```bash
wrangler d1 create nimzaar
wrangler kv namespace create KV
wrangler r2 bucket create nimzaar
wrangler secret put NUXT_BETTER_AUTH_SECRET
```

Apply DB migrations (remote D1):

```bash
pnpm cf:migrate:remote
```

Bindings live in `wrangler.jsonc` (`DB`, `KV`, `BLOB`).
