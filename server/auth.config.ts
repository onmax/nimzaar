import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { nimiqPay } from '@onmax/better-auth-nimiq-pay'
import { bearer } from 'better-auth/plugins'

export default defineServerAuth(() => ({
  emailAndPassword: { enabled: false },
  advanced: {
    database: {
      generateId: 'uuid' as const,
    },
  },
  user: {
    additionalFields: {
      publicKey: {
        type: 'string' as const,
        required: true,
        unique: true,
        fieldName: 'public_key',
      },
      address: {
        type: 'string' as const,
        required: false,
        fieldName: 'address',
      },
    },
  },
  plugins: [
    bearer({ requireSignature: true }),
    nimiqPay({
      appName: 'Nimzaar',
      endpointPrefix: '/nimiq',
      enforceOrigin: true,
      tokenHeaderName: 'set-auth-token',
      syncAddressToUser: true,
      syncPublicKeyToUser: true,
    }),
  ],
}))
