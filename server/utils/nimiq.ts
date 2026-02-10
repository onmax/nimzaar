import { sha256 } from '@noble/hashes/sha2.js'
import { ed25519 } from '@noble/curves/ed25519.js'
import { hexToBytes } from './encoding'

const SIGN_PREFIX = '\x16Nimiq Signed Message:\n'

export function normalizeNimiqAddress(address: string): string {
  return address.replace(/[\s_]/g, '').toUpperCase()
}

export function buildNimiqSignedMessageBytes(message: string): Uint8Array {
  const byteLen = new TextEncoder().encode(message).length
  const data = `${SIGN_PREFIX}${byteLen}${message}`
  return new TextEncoder().encode(data)
}

export function verifyNimiqSignedMessage(params: {
  message: string
  publicKeyHex: string
  signatureHex: string
}): boolean {
  const msgBytes = buildNimiqSignedMessageBytes(params.message)
  const hash = sha256(msgBytes) // 32 bytes

  const publicKey = hexToBytes(params.publicKeyHex)
  const signature = hexToBytes(params.signatureHex)

  return ed25519.verify(signature, hash, publicKey)
}
