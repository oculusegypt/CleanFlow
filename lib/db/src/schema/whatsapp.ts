import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const waMessagesTable = sqliteTable("whatsapp_messages", {
  id:          integer("id").primaryKey({ autoIncrement: true }),
  waId:        text("wa_id").unique(),           // WA message ID (dedup)
  from:        text("from_number").notNull(),    // sender phone number
  fromName:    text("from_name"),
  toNumber:    text("to_number"),               // our phone number
  type:        text("type").notNull().default("text"), // text|image|audio|document|location
  body:        text("body"),                    // text content
  mediaUrl:    text("media_url"),
  mediaType:   text("media_type"),
  isRead:      integer("is_read", { mode: "boolean" }).notNull().default(false),
  direction:   text("direction").notNull().default("inbound"), // inbound|outbound
  status:      text("status").default("received"),
  rawPayload:  text("raw_payload"),             // full JSON from Meta
  createdAt:   text("created_at").$defaultFn(() => new Date().toISOString()).notNull(),
});

export type WaMessage = typeof waMessagesTable.$inferSelect;
