import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adsTable = sqliteTable("ads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  imageUrl: text("image_url").notNull().default(""),
  linkUrl: text("link_url").notNull().default(""),
  buttonText: text("button_text").notNull().default(""),
  // after_hero | middle | before_footer
  position: text("position").notNull().default("middle"),
  // banner (full-width) | card (compact)
  type: text("type").notNull().default("banner"),
  bgColor: text("bg_color").notNull().default("#eff6ff"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const insertAdSchema = createInsertSchema(adsTable).omit({ id: true, createdAt: true });
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof adsTable.$inferSelect;
