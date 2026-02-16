import { bytesToHex, hexToBytes, normalizeHexInput } from './encoding'

export type TransactionLike = {
  to: string
  value: number
  confirmations?: number
  recipientData: string
}

type ExecutedTransactionLike = {
  transaction: TransactionLike
}

function utf8ToHex(s: string): string {
  return bytesToHex(new TextEncoder().encode(s))
}

function normalizeAddressLoose(address: string): string {
  return address.replace(/[\s_]/g, '').toUpperCase()
}

export function validateOrderPayment(params: {
  orderId: string
  payoutAddress: string
  priceLuna: number
  minConfirmations: number
  tx: TransactionLike | ExecutedTransactionLike
}): { ok: true } | { ok: false, message: string } {
  const tx = 'transaction' in params.tx ? params.tx.transaction : params.tx

  if (normalizeAddressLoose(tx.to) !== normalizeAddressLoose(params.payoutAddress)) {
    return { ok: false, message: 'Recipient mismatch' }
  }

  if (Number(tx.value) !== Number(params.priceLuna)) {
    return { ok: false, message: 'Value mismatch' }
  }

  const confirmations = tx.confirmations ?? 0
  if (confirmations < params.minConfirmations) {
    return { ok: false, message: `Not enough confirmations (${confirmations} < ${params.minConfirmations})` }
  }

  let recipientDataHex: string
  try {
    recipientDataHex = normalizeHexInput(tx.recipientData)
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
