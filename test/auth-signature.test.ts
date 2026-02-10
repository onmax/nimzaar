import { describe, expect, it } from 'vitest'
import { ed25519 } from '@noble/curves/ed25519.js'
import { bytesToHex } from '../server/utils/encoding'
import { verifyNimiqSignedMessage } from '../server/utils/nimiq'
import { sha256 } from '@noble/hashes/sha2.js'

describe('verifyNimiqSignedMessage', () => {
  it('verifies a valid signature for the prefixed message hash', () => {
    const priv = new Uint8Array(32)
    for (let i = 0; i < priv.length; i++) priv[i] = i + 1

    const pub = ed25519.getPublicKey(priv)
    const message = 'Sign in to Nimzaar\nChallenge: test'

    // Recreate the Nimiq prefixing + sha256 pre-hash.
    const prefix = '\x16Nimiq Signed Message:\n'
    const byteLen = new TextEncoder().encode(message).length
    const data = `${prefix}${byteLen}${message}`
    const hash = sha256(new TextEncoder().encode(data))

    const sig = ed25519.sign(hash, priv)

    const ok = verifyNimiqSignedMessage({
      message,
      publicKeyHex: bytesToHex(pub),
      signatureHex: bytesToHex(sig),
    })

    expect(ok).toBe(true)
  })

  it('uses byte length (not JS string length)', () => {
    const priv = new Uint8Array(32)
    for (let i = 0; i < priv.length; i++) priv[i] = i + 1

    const pub = ed25519.getPublicKey(priv)
    const message = 'Sign in to Nimzaar\nChallenge: tést'

    const prefix = '\x16Nimiq Signed Message:\n'
    const charLenData = `${prefix}${message.length}${message}`
    const byteLen = new TextEncoder().encode(message).length
    const byteLenData = `${prefix}${byteLen}${message}`

    const sig = ed25519.sign(sha256(new TextEncoder().encode(byteLenData)), priv)

    expect(verifyNimiqSignedMessage({
      message,
      publicKeyHex: bytesToHex(pub),
      signatureHex: bytesToHex(sig),
    })).toBe(true)

    // If we incorrectly used `.length`, verification would fail for non-ASCII.
    expect(ed25519.verify(sig, sha256(new TextEncoder().encode(charLenData)), pub)).toBe(false)
  })

  it('rejects an invalid signature', () => {
    const priv = new Uint8Array(32)
    for (let i = 0; i < priv.length; i++) priv[i] = 7
    const pub = ed25519.getPublicKey(priv)

    const ok = verifyNimiqSignedMessage({
      message: 'x',
      publicKeyHex: bytesToHex(pub),
      signatureHex: '00'.repeat(64),
    })

    expect(ok).toBe(false)
  })
})
