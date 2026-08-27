import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

/**
 * Standalone landing pages for search-intent keywords.
 * They intentionally live outside posts/services so editors can manage
 * campaign and long-tail pages without changing the existing content models.
 */
export const seoPagesTable = sqliteTable("seo_pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  targetKeyword: text("target_keyword").notNull().default(""),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  coverImage: text("cover_image").default(""),
  category: text("category").notNull().default("خدمات التنظيف"),
  tags: text("tags").notNull().default("[]"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: text("published_at"),
  viewCount: integer("view_count").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  seoKeywords: text("seo_keywords").notNull().default(""),
  seoSlug: text("seo_slug").notNull().default(""),
  ogImage: text("og_image").notNull().default(""),
  canonicalUrl: text("canonical_url").notNull().default(""),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertSeoPageSchema = createInsertSchema(seoPagesTable).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSeoPage = z.infer<typeof insertSeoPageSchema>;
export type SeoPage = typeof seoPagesTable.$inferSelect;