export default defineNitroPlugin(() => {
  const cfg = useRuntimeConfig()

  // Keep this in sync with `nuxt.config.ts`.
  const placeholder = '__SET_NUXT_BETTER_AUTH_SECRET__000000'

  if (!cfg.betterAuthSecret || cfg.betterAuthSecret === placeholder) {
    throw new Error(
      'Missing auth secret: set `NUXT_BETTER_AUTH_SECRET` (recommended) or `BETTER_AUTH_SECRET` in the runtime environment.',
    )
  }
})

