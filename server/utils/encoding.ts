export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

export function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.startsWith('0x') ? hex.slice(2) : hex
  if (normalized.length % 2 !== 0)
    throw new Error('Invalid hex length')
  if (!/^[0-9a-fA-F]*$/.test(normalized))
    throw new Error('Invalid hex')

  const out = new Uint8Array(normalized.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export function normalizeHexInput(hex: string, opts?: { expectedBytes?: number }): string {
  const normalized = (hex.startsWith('0x') ? hex.slice(2) : hex).toLowerCase()
  if (normalized.length % 2 !== 0)
    throw new Error('Invalid hex length')
  if (!/^[0-9a-f]*$/.test(normalized))
    throw new Error('Invalid hex')
  if (opts?.expectedBytes != null && normalized.length !== opts.expectedBytes * 2)
    throw new Error(`Invalid hex length (expected ${opts.expectedBytes} bytes)`)
  return normalized
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  // Node
  // eslint-disable-next-line node/prefer-global/buffer
  if (globalThis.Buffer) {
    // eslint-disable-next-line node/prefer-global/buffer
    return Buffer.from(bytes).toString('base64url')
  }

  // Browser/Workers
  let bin = ''
  for (const b of bytes)
    bin += String.fromCharCode(b)
  // btoa uses standard base64
  const b64 = globalThis.btoa(bin)
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function safeHexToUtf8(hex: string): { ok: true, text: string } | { ok: false } {
  let bytes: Uint8Array
  try {
    bytes = hexToBytes(hex)
  }
  catch {
    return { ok: false }
  }

  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, text }
  }
  catch {
    return { ok: false }
  }
}
