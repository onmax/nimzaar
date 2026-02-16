import { ed25519 } from '@noble/curves/ed25519.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { buildSignInMessage, createDefaultNimiqSignatureVerifier } from '@onmax/better-auth-nimiq-pay'
import { isNimiqProviderError } from '@onmax/better-auth-nimiq-pay/provider'
import { createStubNimiqProvider } from '@onmax/better-auth-nimiq-pay-e2e'
import { describe, expect, it } from 'vitest'

const verifyNimiqSignedMessage = createDefaultNimiqSignatureVerifier()
const textEncoder = new TextEncoder()

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2)
    bytes[i / 2] = Number.parseInt(hex.slice(i, i + 2), 16)
  return bytes
}

describe('verifyNimiqSignedMessage', () => {
  it('verifies signatures produced by the shared stub provider', async () => {
    const provider = createStubNimiqProvider()
    const message = buildSignInMessage({
      appName: 'Nimzaar',
      origin: 'https://nimzaar.test',
      nonce: 'nonce-1',
    })

    const signature = await provider.sign(message)
    if (isNimiqProviderError(signature))
      throw new Error(signature.error.message)

    const ok = verifyNimiqSignedMessage({
      message,
      publicKeyHex: signature.publicKey,
      signatureHex: signature.signature,
    })

    expect(ok).toBe(true)
  })

  it('uses byte length (not JS string length)', async () => {
    const provider = createStubNimiqProvider()
    const message = buildSignInMessage({
      appName: 'Nimzaár',
      origin: 'https://nimzaar.test',
      nonce: 'nonce-1',
    })

    const signature = await provider.sign(message)
    if (isNimiqProviderError(signature))
      throw new Error(signature.error.message)

    expect(verifyNimiqSignedMessage({
      message,
      publicKeyHex: signature.publicKey,
      signatureHex: signature.signature,
    })).toBe(true)

    const prefix = '\x16Nimiq Signed Message:\n'
    const charLenPayload = `${prefix}${message.length}${message}`
    expect(ed25519.verify(
      hexToBytes(signature.signature),
      sha256(textEncoder.encode(charLenPayload)),
      hexToBytes(signature.publicKey),
    )).toBe(false)
  })

  it('rejects an invalid signature', async () => {
    const provider = createStubNimiqProvider()
    const message = buildSignInMessage({
      appName: 'Nimzaar',
      origin: 'https://nimzaar.test',
      nonce: 'nonce-1',
    })

    const signature = await provider.sign(message)
    if (isNimiqProviderError(signature))
      throw new Error(signature.error.message)

    const suffix = signature.signature.endsWith('0') ? '1' : '0'
    const tampered = `${signature.signature.slice(0, -1)}${suffix}`
    const ok = verifyNimiqSignedMessage({
      message,
      publicKeyHex: signature.publicKey,
      signatureHex: tampered,
    })

    expect(ok).toBe(false)
  })
})
