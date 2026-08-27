import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const postsTable = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt").notNull().default(""),
  coverImage: text("cover_image").default(""),
  author: text("author").notNull().default(""),
  category: text("category").default("عام"),
  tags: text("tags").notNull().default("[]"),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  publishedAt: text("published_at"),
  readTime: integer("read_time").default(3),
  viewCount: integer("view_count").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  // SEO fields
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  seoKeywords: text("seo_keywords").notNull().default(""),
  seoSlug: text("seo_slug").notNull().default(""),
  ogImage: text("og_image").notNull().default(""),
  canonicalUrl: text("canonical_url").notNull().default(""),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const insertPostSchema = createInsertSchema(postsTable).omit({ id: true, viewCount: true, createdAt: true, updatedAt: true });
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof postsTable.$inferSelect;
