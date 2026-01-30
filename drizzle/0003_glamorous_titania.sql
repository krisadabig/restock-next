ALTER TABLE "entries" ADD COLUMN "quantity" real DEFAULT 1;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "unit" text DEFAULT 'pcs';--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "type" text DEFAULT 'purchase' NOT NULL;