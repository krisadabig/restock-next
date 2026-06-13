CREATE INDEX "idx_entries_item_id" ON "entries" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "idx_entries_household_date" ON "entries" USING btree ("household_id","date");--> statement-breakpoint
CREATE INDEX "idx_entries_household_created" ON "entries" USING btree ("household_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_items_household" ON "items" USING btree ("household_id");--> statement-breakpoint
CREATE INDEX "idx_items_category" ON "items" USING btree ("category_id");