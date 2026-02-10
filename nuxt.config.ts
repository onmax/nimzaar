export default defineNuxtConfig({
  modules: ['@nuxthub/core', '@onmax/nuxt-better-auth', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  hub: {
    db: 'sqlite',
    kv: true,
    blob: true,
    cache: true,
    dir: '.data',
  },
  ui: {
    fonts: true,
    colorMode: true,
  },
  runtimeConfig: {
    // nuxt-better-auth requires a non-empty secret at build time.
    // We intentionally use a placeholder and require setting the real value
    // via `NUXT_BETTER_AUTH_SECRET` in the runtime environment (Cloudflare secret).
    betterAuthSecret: '__SET_NUXT_BETTER_AUTH_SECRET__000000',
    nimiqRpcUrl: 'https://rpc.nimiqwatch.com',
    minConfirmations: 1,
    maxPdfBytes: 10 * 1024 * 1024,
  },
  auth: {
    // Cookies are cleared by the Nimiq Pay host when the mini-app closes.
    // We rely on Better Auth bearer tokens stored in localStorage instead.
    secondaryStorage: true,
    schema: {
      usePlural: true,
      casing: 'snake_case',
    },
    redirects: {
      login: '/app/login',
      guest: '/app/login',
    },
  },
  nitro: {
    experimental: {
      openAPI: false,
    },
  },
  typescript: {
    strict: true,
  },
})
