import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const conversationsTable = sqliteTable("conversations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  subject: text("subject"),
  packageId: integer("package_id"),
  packageName: text("package_name"),
  status: text("status").notNull().default("open"),
  lastMessage: text("last_message"),
  unreadCount: integer("unread_count").notNull().default(0),
  clientTypingAt: text("client_typing_at"),
  adminTypingAt: text("admin_typing_at"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const messagesTable = sqliteTable("messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  conversationId: integer("conversation_id").notNull().references(() => conversationsTable.id),
  content: text("content").notNull(),
  messageType: text("message_type").notNull().default("text"),
  metadata: text("metadata"),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"),
  locationLat: text("location_lat"),
  locationLng: text("location_lng"),
  locationLabel: text("location_label"),
  senderType: text("sender_type").notNull().default("client"),
  isRead: text("is_read").notNull().default("false"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversationsTable).omit({ id: true, status: true, lastMessage: true, unreadCount: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, isRead: true, createdAt: true });
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Conversation = typeof conversationsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
