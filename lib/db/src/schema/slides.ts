import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const heroSlidesTable = sqliteTable("hero_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  imageUrl: text("image_url").notNull(),
  ctaText: text("cta_text"),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const insertHeroSlideSchema = createInsertSchema(heroSlidesTable).omit({ id: true, createdAt: true });
export type InsertHeroSlide = z.infer<typeof insertHeroSlideSchema>;
export type HeroSlide = typeof heroSlidesTable.$inferSelect;
