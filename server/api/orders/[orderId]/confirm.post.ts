import * as v from 'valibot'
import { getTransactionByHash } from 'nimiq-rpc-client-ts'
import { db, schema } from 'hub:db'
import { and, eq, ne } from 'drizzle-orm'
import { validateOrderPayment } from '../../../utils/payment'
import { OrderConfirmBodySchema } from '../../../../shared/contracts/orders'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) {
    throw createError({ statusCode: 400, message: 'orderId is required' })
  }

  const body = await readValidatedBody(event, v.parser(OrderConfirmBodySchema))

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1).then(r => r[0])
  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }
  if (order.buyerUserId !== user.id) {
    throw createError({ statusCode: 403, message: 'No access' })
  }
  if (order.status === 'paid') {
    return { ok: true, order }
  }
  if (order.status !== 'pending') {
    throw createError({ statusCode: 400, message: `Order not confirmable (status=${order.status})` })
  }

  const reused = await db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.txHash, body.txHash), ne(schema.orders.id, orderId)))
    .limit(1)
    .then(r => r[0])
  if (reused) {
    throw createError({ statusCode: 400, message: 'Transaction hash already used for another order' })
  }

  const cfg = useRuntimeConfig()
  const rpcUrl = String(cfg.nimiqRpcUrl || 'https://rpc.nimiqwatch.com')
  const minConfirmations = Number(cfg.minConfirmations || 1)

  const txRes = await getTransactionByHash(
    { hash: body.txHash },
    { url: new URL(rpcUrl) },
  )

  if (!txRes.success) {
    throw createError({ statusCode: 502, message: `RPC error: ${txRes.error}` })
  }

  // Library types say ExecutedTransaction (nested .transaction) but runtime returns flat Transaction
  const rawTx = txRes.data
  const tx = 'transaction' in rawTx ? rawTx.transaction : rawTx as unknown as typeof rawTx['transaction']
  const validated = validateOrderPayment({
    orderId,
    payoutAddress: order.payoutAddress,
    priceLuna: order.priceLuna,
    minConfirmations,
    tx,
  })
  if (!validated.ok) {
    throw createError({ statusCode: 400, message: validated.message })
  }

  const now = Date.now()

  const updated = await db.update(schema.orders).set({
    status: 'paid',
    txHash: body.txHash,
    paidAt: now,
  }).where(eq(schema.orders.id, orderId)).returning().then(r => r[0]!)

  await db
    .insert(schema.purchases)
    .values({
      id: crypto.randomUUID(),
      buyerUserId: user.id,
      productId: order.productId,
      orderId: order.id,
      createdAt: now,
    })
    .onConflictDoNothing()

  return { ok: true, order: updated }
})
