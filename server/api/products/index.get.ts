import { db, schema } from 'hub:db'
import { desc, isNotNull } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const products = await db
    .select()
    .from(schema.products)
    .where(isNotNull(schema.products.publishedAt))
    .orderBy(desc(schema.products.createdAt))

  return { products }
})

