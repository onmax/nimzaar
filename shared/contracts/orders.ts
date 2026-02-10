import * as v from 'valibot'

export const OrderStatusSchema = v.picklist(['pending', 'paid', 'failed', 'expired'])
export type OrderStatus = v.InferOutput<typeof OrderStatusSchema>

export const OrderSchema = v.object({
  id: v.string(),
  buyerUserId: v.string(),
  productId: v.string(),
  priceLuna: v.number(),
  payoutAddress: v.string(),
  status: OrderStatusSchema,
  txHash: v.nullish(v.string()),
  createdAt: v.number(),
  paidAt: v.nullish(v.number()),
})
export type Order = v.InferOutput<typeof OrderSchema>

export const OrderCreateBodySchema = v.object({
  productId: v.string(),
})
export type OrderCreateBody = v.InferOutput<typeof OrderCreateBodySchema>

export const OrderCreateResponseSchema = v.object({
  orderId: v.string(),
  recipient: v.string(),
  value: v.number(),
  data: v.string(),
})
export type OrderCreateResponse = v.InferOutput<typeof OrderCreateResponseSchema>

export const OrderConfirmBodySchema = v.object({
  txHash: v.string(),
})
export type OrderConfirmBody = v.InferOutput<typeof OrderConfirmBodySchema>

