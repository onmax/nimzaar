import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

// Reference table for FKs only. The actual `users` table comes from Better Auth.
const usersRef = sqliteTable('users', {
  id: text('id').primaryKey(),
})

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  creatorUserId: text('creator_user_id').notNull().references(() => usersRef.id),
  title: text('title').notNull(),
  description: text('description'),
  priceLuna: integer('price_luna').notNull(),
  payoutAddress: text('payout_address').notNull(),
  contentType: text('content_type', { enum: ['link', 'pdf'] }).notNull(),
  contentLinkUrl: text('content_link_url'),
  contentBlobPathname: text('content_blob_pathname'),
  contentBlobContentType: text('content_blob_content_type'),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  publishedAt: integer('published_at', { mode: 'number' }),
})

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  buyerUserId: text('buyer_user_id').notNull().references(() => usersRef.id),
  productId: text('product_id').notNull().references(() => products.id),
  priceLuna: integer('price_luna').notNull(),
  payoutAddress: text('payout_address').notNull(),
  status: text('status', { enum: ['pending', 'paid', 'failed', 'expired'] }).notNull(),
  txHash: text('tx_hash').unique(),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  paidAt: integer('paid_at', { mode: 'number' }),
})

export const purchases = sqliteTable(
  'purchases',
  {
    id: text('id').primaryKey(),
    buyerUserId: text('buyer_user_id').notNull().references(() => usersRef.id),
    productId: text('product_id').notNull().references(() => products.id),
    orderId: text('order_id').notNull().references(() => orders.id),
    createdAt: integer('created_at', { mode: 'number' }).notNull(),
  },
  (t) => ({
    uniqBuyerProduct: uniqueIndex('purchases_buyer_product_uniq').on(t.buyerUserId, t.productId),
  }),
)
