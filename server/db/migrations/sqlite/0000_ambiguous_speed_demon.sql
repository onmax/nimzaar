CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`price_luna` integer NOT NULL,
	`payout_address` text NOT NULL,
	`status` text NOT NULL,
	`tx_hash` text,
	`created_at` integer NOT NULL,
	`paid_at` integer,
	FOREIGN KEY (`buyer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_tx_hash_unique` ON `orders` (`tx_hash`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`creator_user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`price_luna` integer NOT NULL,
	`payout_address` text NOT NULL,
	`content_type` text NOT NULL,
	`content_link_url` text,
	`content_blob_pathname` text,
	`content_blob_content_type` text,
	`created_at` integer NOT NULL,
	`published_at` integer,
	FOREIGN KEY (`creator_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`buyer_user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`order_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`buyer_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_buyer_product_uniq` ON `purchases` (`buyer_user_id`,`product_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`public_key` text NOT NULL,
	`address` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_public_key_unique` ON `users` (`public_key`);