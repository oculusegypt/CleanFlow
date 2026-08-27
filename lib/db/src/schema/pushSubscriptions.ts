import { sqliteTable, integer, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const pushSubscriptionsTable = sqliteTable(
  "push_subscriptions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    adminId: integer("admin_id").notNull(),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
    updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()).notNull(),
  },
  (table) => ({
    endpointUnique: uniqueIndex("push_subscriptions_endpoint_unique").on(table.endpoint),
  }),
);

export type PushSubscription = typeof pushSubscriptionsTable.$inferSelect;