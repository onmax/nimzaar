import * as v from 'valibot'
import { ProductSchema } from './products'

export const LibraryResponseSchema = v.object({
  products: v.array(ProductSchema),
})
export type LibraryResponse = v.InferOutput<typeof LibraryResponseSchema>

