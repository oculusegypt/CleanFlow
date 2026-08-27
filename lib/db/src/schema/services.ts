import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const servicesTable = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  imageUrl: text("image_url"),
  images: text("images").default("[]"),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  seoEnabled: integer("seo_enabled", { mode: "boolean" }).default(false),
  seoTitle: text("seo_title").default(""),
  seoDescription: text("seo_description").default(""),
  seoKeywords: text("seo_keywords").default(""),
  seoSlug: text("seo_slug").default(""),
});

export const insertServiceSchema = createInsertSchema(servicesTable).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof servicesTable.$inferSelect;
