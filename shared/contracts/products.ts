import * as v from 'valibot'

export const ProductContentTypeSchema = v.picklist(['link', 'pdf'])
export type ProductContentType = v.InferOutput<typeof ProductContentTypeSchema>

export const ProductSchema = v.object({
  id: v.string(),
  creatorUserId: v.string(),
  title: v.string(),
  description: v.nullish(v.string()),
  priceLuna: v.number(),
  payoutAddress: v.string(),
  contentType: ProductContentTypeSchema,
  contentLinkUrl: v.nullish(v.string()),
  contentBlobPathname: v.nullish(v.string()),
  contentBlobContentType: v.nullish(v.string()),
  createdAt: v.number(),
  publishedAt: v.nullish(v.number()),
})
export type Product = v.InferOutput<typeof ProductSchema>

export const ProductCreateBodySchema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(120)),
  description: v.optional(v.pipe(v.string(), v.maxLength(2000))),
  priceLuna: v.pipe(v.number(), v.minValue(1)),
  payoutAddress: v.optional(v.string()),
  contentType: ProductContentTypeSchema,
  linkUrl: v.optional(v.string()),
})
export type ProductCreateBody = v.InferOutput<typeof ProductCreateBodySchema>

export const ProductCreateResponseSchema = v.union([
  v.object({
    product: ProductSchema,
  }),
  v.object({
    productId: v.string(),
    uploadEndpoint: v.string(),
  }),
])
export type ProductCreateResponse = v.InferOutput<typeof ProductCreateResponseSchema>

export const ProductListResponseSchema = v.object({
  products: v.array(ProductSchema),
})
export type ProductListResponse = v.InferOutput<typeof ProductListResponseSchema>

