import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reviewsTable = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  serviceId: integer("service_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerCity: text("customer_city").default("الرياض"),
  rating: integer("rating").notNull().default(5),
  comment: text("comment").notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
  approvedAt: text("approved_at"),
});

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({ id: true, createdAt: true, approvedAt: true });
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
