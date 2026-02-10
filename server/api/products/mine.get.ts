import { db, schema } from 'hub:db'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const products = await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.creatorUserId, user.id))
    .orderBy(desc(schema.products.createdAt))

  return { products }
})
