import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const companyValuesTable = sqliteTable("company_values", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  order: integer("order").notNull().default(0),
});

export const insertCompanyValueSchema = createInsertSchema(companyValuesTable).omit({ id: true });
export type InsertCompanyValue = z.infer<typeof insertCompanyValueSchema>;
export type CompanyValue = typeof companyValuesTable.$inferSelect;
