import { defineServerAuth } from '@onmax/nuxt-better-auth/config'
import { bearer } from 'better-auth/plugins'
import { nimiqPay } from './auth/plugins/nimiq-pay'

export default defineServerAuth(() => ({
  emailAndPassword: { enabled: false },
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  user: {
    additionalFields: {
      publicKey: {
        type: 'string',
        required: true,
        unique: true,
        fieldName: 'public_key',
      },
      address: {
        type: 'string',
        required: false,
        fieldName: 'address',
      },
    },
  },
  plugins: [
    bearer({ requireSignature: true }),
    nimiqPay(),
  ],
}))
