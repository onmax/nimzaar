import { blob } from 'hub:blob'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

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
  if (product.contentType !== 'pdf') {
    throw createError({ statusCode: 400, message: 'Only pdf products accept asset upload' })
  }

  const cfg = useRuntimeConfig()
  const maxBytes = Number(cfg.maxPdfBytes || 0) || 10 * 1024 * 1024

  const form = await readMultipartFormData(event)
  const file = form?.find(p => p.name === 'file')
  if (!file?.data) {
    throw createError({ statusCode: 400, message: 'Missing multipart field "file"' })
  }

  const contentType = file.type || 'application/octet-stream'
  const filenameLooksPdf = !!file.filename?.toLowerCase().endsWith('.pdf')
  const dataBytes = file.data instanceof Uint8Array ? file.data : null
  const magicLooksPdf = !!(dataBytes
    && dataBytes.byteLength >= 5
    && dataBytes[0] === 0x25
    && dataBytes[1] === 0x50
    && dataBytes[2] === 0x44
    && dataBytes[3] === 0x46
    && dataBytes[4] === 0x2d)

  if (contentType !== 'application/pdf' && !filenameLooksPdf && !magicLooksPdf) {
    throw createError({ statusCode: 400, message: `Invalid PDF upload (type=${contentType})` })
  }

  const size = file.data instanceof Uint8Array
    ? file.data.byteLength
    // eslint-disable-next-line ts/no-explicit-any
    : (file.data as any).size ?? 0

  if (size <= 0) {
    throw createError({ statusCode: 400, message: 'Empty file' })
  }
  if (size > maxBytes) {
    throw createError({ statusCode: 413, message: `File too large (max ${maxBytes} bytes)` })
  }

  const key = (file.filename && file.filename.endsWith('.pdf')) ? file.filename : 'file.pdf'
  const stored = await blob.put(key, file.data as any, {
    prefix: `products/${productId}/`,
    access: 'private',
    addRandomSuffix: true,
    contentType: 'application/pdf',
  })

  const updated = await db.update(schema.products).set({
    contentBlobPathname: stored.pathname,
    contentBlobContentType: stored.contentType || 'application/pdf',
  }).where(eq(schema.products.id, productId)).returning().then(r => r[0]!)

  return { product: updated }
})
