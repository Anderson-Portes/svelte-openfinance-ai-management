import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const pluggyItems = pgTable('pluggy_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  pluggyItemId: text('pluggy_item_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().$onUpdateFn(() => new Date())
});