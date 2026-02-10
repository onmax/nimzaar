import { describe, expect, it } from 'vitest'
import { validateOrderPayment } from '../server/utils/payment'

function utf8ToHex(s: string): string {
  return Array.from(new TextEncoder().encode(s)).map(b => b.toString(16).padStart(2, '0')).join('')
}

describe('validateOrderPayment', () => {
  it('accepts a matching executed tx', () => {
    const orderId = 'order-123'
    const tx = {
      executionResult: true,
      transaction: {
        to: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
        value: 1000,
        confirmations: 1,
        recipientData: utf8ToHex(`hello order:${orderId} ok`),
      },
    }

    const res = validateOrderPayment({
      orderId,
      payoutAddress: 'NQ07_0000_0000_0000_0000_0000_0000_0000_0000',
      priceLuna: 1000,
      minConfirmations: 1,
      tx,
    })

    expect(res.ok).toBe(true)
  })

  it('rejects wrong recipient', () => {
    const res = validateOrderPayment({
      orderId: 'x',
      payoutAddress: 'NQ11 1111 1111 1111 1111 1111 1111 1111 1111',
      priceLuna: 1,
      minConfirmations: 1,
      tx: {
        executionResult: true,
        transaction: {
          to: 'NQ22 2222 2222 2222 2222 2222 2222 2222 2222',
          value: 1,
          confirmations: 1,
          recipientData: '',
        },
      },
    })
    expect(res.ok).toBe(false)
  })

  it('rejects when recipientData does not contain the order marker (even if invalid UTF-8)', () => {
    const res = validateOrderPayment({
      orderId: 'x',
      payoutAddress: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
      priceLuna: 1,
      minConfirmations: 1,
      tx: {
        executionResult: true,
        transaction: {
          to: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
          value: 1,
          confirmations: 1,
          // invalid utf-8 bytes: ff
          recipientData: 'ff',
        },
      },
    })
    expect(res.ok).toBe(false)
  })

  it('accepts when invalid UTF-8 recipientData still contains the order marker bytes', () => {
    const orderId = 'order-123'
    const res = validateOrderPayment({
      orderId,
      payoutAddress: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
      priceLuna: 1,
      minConfirmations: 1,
      tx: {
        executionResult: true,
        transaction: {
          to: 'NQ07 0000 0000 0000 0000 0000 0000 0000 0000',
          value: 1,
          confirmations: 1,
          // ff ... order:<id> ... ff (overall invalid utf-8, but marker bytes exist)
          recipientData: `ff${utf8ToHex(`order:${orderId}`)}ff`,
        },
      },
    })
    expect(res.ok).toBe(true)
  })
})
