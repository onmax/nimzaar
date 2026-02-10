import * as v from 'valibot'
import { db, schema } from 'hub:db'
import { ProductCreateBodySchema } from '../../../shared/contracts/products'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const body = await readValidatedBody(event, v.parser(ProductCreateBodySchema))

  const payoutAddress = body.payoutAddress || user.address
  if (!payoutAddress) {
    throw createError({
      statusCode: 400,
      message: 'Missing payoutAddress (and no address set on user)',
    })
  }

  if (body.contentType === 'link') {
    if (!body.linkUrl) {
      throw createError({ statusCode: 400, message: 'linkUrl is required for link products' })
    }
  }

  const now = Date.now()
  const id = crypto.randomUUID()

  if (body.contentType === 'pdf') {
    await db.insert(schema.products).values({
      id,
      creatorUserId: user.id,
      title: body.title,
      description: body.description ?? null,
      priceLuna: Math.trunc(body.priceLuna),
      payoutAddress,
      contentType: 'pdf',
      contentLinkUrl: null,
      contentBlobPathname: null,
      contentBlobContentType: null,
      createdAt: now,
      publishedAt: now,
    })

    return { productId: id, uploadEndpoint: `/api/products/${id}/asset` }
  }

  const product = await db.insert(schema.products).values({
    id,
    creatorUserId: user.id,
    title: body.title,
    description: body.description ?? null,
    priceLuna: Math.trunc(body.priceLuna),
    payoutAddress,
    contentType: 'link',
    contentLinkUrl: body.linkUrl!,
    contentBlobPathname: null,
    contentBlobContentType: null,
    createdAt: now,
    publishedAt: now,
  }).returning().then(r => r[0]!)

  return { product }
})
