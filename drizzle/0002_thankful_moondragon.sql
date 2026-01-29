CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"item" text NOT NULL,
	"status" text DEFAULT 'in-stock' NOT NULL,
	"quantity" real DEFAULT 0 NOT NULL,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"alert_enabled" integer DEFAULT 1 NOT NULL,
	"user_id" text NOT NULL,
	"last_stock_update" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;