import { kv } from '@nuxthub/kv'
import { APIError } from 'better-auth'
import type { BetterAuthPlugin } from 'better-auth'
import { createAuthEndpoint } from 'better-auth/plugins'
import { setSessionCookie } from 'better-auth/cookies'
import * as z from 'zod'

import { bytesToBase64Url } from '../../utils/encoding'
import { normalizeHexInput } from '../../utils/encoding'
import { verifyNimiqSignedMessage } from '../../utils/nimiq'

function buildSignInMessage(params: { origin: string, nonce: string }) {
  return `Sign in to Nimzaar\nOrigin: ${params.origin}\nNonce: ${params.nonce}`
}

function issueNonce() {
  const nonceIdBytes = new Uint8Array(16)
  const nonceBytes = new Uint8Array(24)
  crypto.getRandomValues(nonceIdBytes)
  crypto.getRandomValues(nonceBytes)
  return {
    nonceId: bytesToBase64Url(nonceIdBytes),
    nonce: bytesToBase64Url(nonceBytes),
  }
}

export function nimiqPay(): BetterAuthPlugin {
  return {
    id: 'nimiq-pay',
    endpoints: {
      nimiqNonce: createAuthEndpoint(
        '/nimiq/nonce',
        { method: 'POST' },
        async (ctx) => {
          const ttlSeconds = 60 * 5
          const { nonceId, nonce } = issueNonce()

          const origin = new URL(ctx.request?.url || ctx.context.baseURL).origin
          await kv.set(`auth:nimiq:nonce:${nonceId}`, { nonce, origin }, { ttl: ttlSeconds })

          const expiresAt = Date.now() + ttlSeconds * 1000
          return ctx.json({ nonceId, nonce, expiresAt })
        },
      ),

      nimiqVerify: createAuthEndpoint(
        '/nimiq/verify',
        {
          method: 'POST',
          body: z.object({
            nonceId: z.string(),
            publicKeyHex: z.string(),
            signatureHex: z.string(),
            address: z.string().optional(),
          }),
        },
        async (ctx) => {
          const nonceRow = await kv.get<{ nonce: string, origin: string }>(`auth:nimiq:nonce:${ctx.body.nonceId}`)
          if (!nonceRow?.nonce) {
            throw new APIError('BAD_REQUEST', { message: 'Invalid or expired nonce' })
          }

          const originNow = new URL(ctx.request?.url || ctx.context.baseURL).origin
          if (nonceRow.origin && nonceRow.origin !== originNow) {
            throw new APIError('BAD_REQUEST', { message: 'Origin mismatch' })
          }

          // One-time use
          await kv.del(`auth:nimiq:nonce:${ctx.body.nonceId}`)

          let publicKeyHex: string
          let signatureHex: string
          try {
            publicKeyHex = normalizeHexInput(ctx.body.publicKeyHex, { expectedBytes: 32 })
            signatureHex = normalizeHexInput(ctx.body.signatureHex, { expectedBytes: 64 })
          }
          catch (e: any) {
            throw new APIError('BAD_REQUEST', { message: e?.message || 'Invalid signature payload' })
          }

          const message = buildSignInMessage({ origin: nonceRow.origin || originNow, nonce: nonceRow.nonce })

          const ok = verifyNimiqSignedMessage({
            message,
            publicKeyHex,
            signatureHex,
          })
          if (!ok) {
            throw new APIError('UNAUTHORIZED', { message: 'Invalid signature' })
          }

          const existing = await ctx.context.adapter.findOne<any>({
            model: 'user',
            where: [{ field: 'publicKey', value: publicKeyHex }],
          })

          const email = `pk_${publicKeyHex}@nimiq.invalid`

          const user = existing
            ? (ctx.body.address
                ? await ctx.context.internalAdapter.updateUser(existing.id, { address: ctx.body.address })
                : existing)
            : await ctx.context.internalAdapter.createUser({
                email,
                name: '',
                image: null,
                emailVerified: false,
                publicKey: publicKeyHex,
                address: ctx.body.address ?? null,
              } as any)

          const session = await ctx.context.internalAdapter.createSession(user.id, false)
          if (!session) {
            throw new APIError('INTERNAL_SERVER_ERROR', { message: 'Failed to create session' })
          }

          await setSessionCookie(ctx as any, { session, user }, false)
          // Nuxt Better Auth client stores this token for subsequent API calls (Authorization: Bearer ...).
          ;(ctx as any).setHeader?.('set-auth-token', session.token)
          return ctx.json({ ok: true, token: session.token })
        },
      ),
    },
  }
}
