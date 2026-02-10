import { defineClientAuth } from '@onmax/nuxt-better-auth/config'

const TOKEN_KEY = 'nimzaar_token'

export default defineClientAuth(() => ({
  fetchOptions: {
    auth: {
      type: 'Bearer',
      token: () => {
        if (typeof window === 'undefined') return undefined
        return localStorage.getItem(TOKEN_KEY) || undefined
      },
    },
    onResponse(ctx) {
      const res = (ctx as any)?.response as Response | undefined
      const token = res?.headers?.get?.('set-auth-token')
      if (!token || typeof window === 'undefined') return
      localStorage.setItem(TOKEN_KEY, token)
    },
  },
}))
