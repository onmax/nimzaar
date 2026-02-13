import { normalizeNimiqAddress } from './nimiq'
import { bytesToHex, hexToBytes, normalizeHexInput } from './encoding'

export type TransactionLike = {
  to: string
  value: number
  confirmations?: number
  recipientData: string
}

function utf8ToHex(s: string): string {
  return bytesToHex(new TextEncoder().encode(s))
}

export function validateOrderPayment(params: {
  orderId: string
  payoutAddress: string
  priceLuna: number
  minConfirmations: number
  tx: TransactionLike
}): { ok: true } | { ok: false, message: string } {
  if (normalizeNimiqAddress(params.tx.to) !== normalizeNimiqAddress(params.payoutAddress)) {
    return { ok: false, message: 'Recipient mismatch' }
  }

  if (Number(params.tx.value) !== Number(params.priceLuna)) {
    return { ok: false, message: 'Value mismatch' }
  }

  const confirmations = params.tx.confirmations ?? 0
  if (confirmations < params.minConfirmations) {
    return { ok: false, message: `Not enough confirmations (${confirmations} < ${params.minConfirmations})` }
  }

  let recipientDataHex: string
  try {
    recipientDataHex = normalizeHexInput(params.tx.recipientData)
    hexToBytes(recipientDataHex)
  }
  catch {
    return { ok: false, message: 'Transaction data mismatch' }
  }

  const expectedHex = utf8ToHex(`order:${params.orderId}`).toLowerCase()
  if (!recipientDataHex.includes(expectedHex)) {
    return { ok: false, message: 'Transaction data mismatch' }
  }

  return { ok: true }
}
