import * as v from 'valibot'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'
import { OrderCreateBodySchema } from '../../../shared/contracts/orders'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, v.parser(OrderCreateBodySchema))

  const product = await db.select().from(schema.products).where(eq(schema.products.id, body.productId)).limit(1).then(r => r[0])
  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }
  if (!product.publishedAt) {
    throw createError({ statusCode: 404, message: 'Product not published' })
  }

  const orderId = crypto.randomUUID()
  const now = Date.now()

  await db.insert(schema.orders).values({
    id: orderId,
    buyerUserId: user.id,
    productId: product.id,
    priceLuna: product.priceLuna,
    payoutAddress: product.payoutAddress,
    status: 'pending',
    txHash: null,
    createdAt: now,
    paidAt: null,
  })

  return {
    orderId,
    recipient: product.payoutAddress,
    value: product.priceLuna,
    data: `order:${orderId}`,
  }
})
