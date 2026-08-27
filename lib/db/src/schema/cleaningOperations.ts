import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cleaningOperationsRecordsTable = sqliteTable("cleaning_operations_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(),
  status: text("status").notNull().default("active"),
  reference: text("reference").notNull().default(""),
  payload: text("payload").notNull().default("{}"),
  operationKey: text("operation_key"),
  createdBy: integer("created_by"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const cleaningOperationsAuditTable = sqliteTable("cleaning_operations_audit", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  recordId: integer("record_id"),
  kind: text("kind").notNull(),
  action: text("action").notNull(),
  beforePayload: text("before_payload"),
  afterPayload: text("after_payload"),
  actorId: integer("actor_id"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const insertCleaningOperationsRecordSchema = createInsertSchema(cleaningOperationsRecordsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCleaningOperationsRecord = z.infer<typeof insertCleaningOperationsRecordSchema>;
export type CleaningOperationsRecord = typeof cleaningOperationsRecordsTable.$inferSelect;
export type CleaningOperationsAudit = typeof cleaningOperationsAuditTable.$inferSelect;