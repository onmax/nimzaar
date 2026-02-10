import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const orderId = getRouterParam(event, 'orderId')
  if (!orderId) {
    throw createError({ statusCode: 400, message: 'orderId is required' })
  }

  const order = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId)).limit(1).then(r => r[0])
  if (!order) {
    throw createError({ statusCode: 404, message: 'Order not found' })
  }
  if (order.buyerUserId !== user.id) {
    throw createError({ statusCode: 403, message: 'No access' })
  }

  return { order }
})
