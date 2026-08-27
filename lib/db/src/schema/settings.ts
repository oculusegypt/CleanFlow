import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const siteSettingsTable = sqliteTable("site_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export type SiteSetting = typeof siteSettingsTable.$inferSelect;
