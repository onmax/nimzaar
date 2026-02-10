import { normalizeNimiqAddress } from './nimiq'
import { bytesToHex, hexToBytes, normalizeHexInput } from './encoding'

export type ExecutedTransactionLike = {
  executionResult: boolean
  transaction: {
    to: string
    value: number
    confirmations?: number
    recipientData: string
  }
}

function utf8ToHex(s: string): string {
  return bytesToHex(new TextEncoder().encode(s))
}

export function validateOrderPayment(params: {
  orderId: string
  payoutAddress: string
  priceLuna: number
  minConfirmations: number
  tx: ExecutedTransactionLike
}): { ok: true } | { ok: false, message: string } {
  if (!params.tx.executionResult) {
    return { ok: false, message: 'Transaction not executed' }
  }

  if (normalizeNimiqAddress(params.tx.transaction.to) !== normalizeNimiqAddress(params.payoutAddress)) {
    return { ok: false, message: 'Recipient mismatch' }
  }

  if (Number(params.tx.transaction.value) !== Number(params.priceLuna)) {
    return { ok: false, message: 'Value mismatch' }
  }

  const confirmations = params.tx.transaction.confirmations ?? 0
  if (confirmations < params.minConfirmations) {
    return { ok: false, message: `Not enough confirmations (${confirmations} < ${params.minConfirmations})` }
  }

  // Always bind payment to the order id by matching raw bytes, even if the whole payload is not valid UTF-8.
  // (Invalid UTF-8 previously allowed bypassing the order marker check.)
  let recipientDataHex: string
  try {
    // This also validates hex format.
    recipientDataHex = normalizeHexInput(params.tx.transaction.recipientData)
    // Ensure it parses as bytes at least once; this catches odd edge cases early.
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
