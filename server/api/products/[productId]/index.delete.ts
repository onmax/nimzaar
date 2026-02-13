import { eq } from 'drizzle-orm'
import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const productId = getRouterParam(event, 'productId')
  if (!productId) {
    throw createError({ statusCode: 400, message: 'productId is required' })
  }

  const product = await db.select().from(schema.products).where(eq(schema.products.id, productId)).limit(1).then(r => r[0])
  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }
  if (product.creatorUserId !== user.id) {
    throw createError({ statusCode: 403, message: 'Not your product' })
  }

  // Reject if any purchases exist
  const purchase = await db.select({ id: schema.purchases.id }).from(schema.purchases).where(eq(schema.purchases.productId, productId)).limit(1).then(r => r[0])
  if (purchase) {
    throw createError({ statusCode: 409, message: 'Product has buyers' })
  }

  // Delete related pending orders first (FK constraint)
  await db.delete(schema.orders).where(eq(schema.orders.productId, productId))

  // Delete blob if PDF
  if (product.contentBlobPathname) {
    await blob.del(product.contentBlobPathname)
  }

  await db.delete(schema.products).where(eq(schema.products.id, productId))

  return { success: true }
})
