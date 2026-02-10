import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const productId = getRouterParam(event, 'productId')
  if (!productId) {
    throw createError({ statusCode: 400, message: 'productId is required' })
  }

  const purchase = await db
    .select()
    .from(schema.purchases)
    .where(and(eq(schema.purchases.productId, productId), eq(schema.purchases.buyerUserId, user.id)))
    .limit(1)
    .then(r => r[0])

  if (!purchase) {
    throw createError({ statusCode: 403, message: 'No access' })
  }

  const product = await db.select().from(schema.products).where(eq(schema.products.id, productId)).limit(1).then(r => r[0])
  if (!product) {
    throw createError({ statusCode: 404, message: 'Product not found' })
  }

  if (product.contentType === 'link') {
    if (!product.contentLinkUrl) {
      throw createError({ statusCode: 500, message: 'Product link missing' })
    }
    return { type: 'link' as const, url: product.contentLinkUrl }
  }

  if (!product.contentBlobPathname) {
    throw createError({ statusCode: 404, message: 'PDF not uploaded' })
  }

  setHeader(event, 'Content-Security-Policy', "default-src 'none';")
  return blob.serve(event, product.contentBlobPathname)
})
