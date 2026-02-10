import { db, schema } from 'hub:db'
import { eq, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const rows = await db
    .select({ product: schema.products })
    .from(schema.purchases)
    .innerJoin(schema.products, eq(schema.purchases.productId, schema.products.id))
    .where(eq(schema.purchases.buyerUserId, user.id))
    .orderBy(desc(schema.purchases.createdAt))

  return { products: rows.map(r => r.product) }
})
