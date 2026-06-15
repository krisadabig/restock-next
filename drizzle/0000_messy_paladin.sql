CREATE TABLE "authenticators" (
	"credential_id" text PRIMARY KEY NOT NULL,
	"credential_public_key" text NOT NULL,
	"counter" integer NOT NULL,
	"transports" text,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"name" text NOT NULL,
	"default_unit" text DEFAULT 'pcs' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"item_id" integer,
	"member_id" integer NOT NULL,
	"type" text DEFAULT 'purchase' NOT NULL,
	"price" real,
	"quantity" real DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"store" text,
	"date" date NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "items" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"category_id" integer,
	"name" text NOT NULL,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"current_stock" real DEFAULT 0 NOT NULL,
	"low_stock_threshold" real,
	"alert_enabled" boolean DEFAULT true NOT NULL,
	"last_entry_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "space_invites" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"code" text NOT NULL,
	"created_by" integer NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "space_invites_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "space_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"space_id" text NOT NULL,
	"user_id" text NOT NULL,
	"display_name" text NOT NULL,
	"avatar" text,
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "space_members_space_id_user_id_unique" UNIQUE("space_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "spaces" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"email" text,
	"password_hash" text,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_item_id_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "entries" ADD CONSTRAINT "entries_member_id_space_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."space_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_invites" ADD CONSTRAINT "space_invites_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_invites" ADD CONSTRAINT "space_invites_created_by_space_members_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."space_members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_space_id_spaces_id_fk" FOREIGN KEY ("space_id") REFERENCES "public"."spaces"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_entries_item_id" ON "entries" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_entries_space_date" ON "entries" USING btree ("space_id","date");--> statement-breakpoint
CREATE INDEX "idx_entries_space_created" ON "entries" USING btree ("space_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_items_space" ON "items" USING btree ("space_id");--> statement-breakpoint
CREATE INDEX "idx_items_category" ON "items" USING btree ("category_id");