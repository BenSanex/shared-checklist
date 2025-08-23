import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedBy: text("completed_by"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const claims = pgTable("claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => checklistItems.id, { onDelete: "cascade" }),
  claimedBy: text("claimed_by").notNull(),
  claimedAt: timestamp("claimed_at").notNull().default(sql`now()`),
});

export const checklistItemsRelations = relations(checklistItems, ({ many }) => ({
  claims: many(claims),
}));

export const claimsRelations = relations(claims, ({ one }) => ({
  item: one(checklistItems, {
    fields: [claims.itemId],
    references: [checklistItems.id],
  }),
}));

export const insertChecklistItemSchema = createInsertSchema(checklistItems).pick({
  text: true,
});

export const insertClaimSchema = createInsertSchema(claims).pick({
  itemId: true,
  claimedBy: true,
});

export const updateChecklistItemSchema = z.object({
  isCompleted: z.boolean().optional(),
  completedBy: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
});

export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type InsertClaim = z.infer<typeof insertClaimSchema>;
export type UpdateChecklistItem = z.infer<typeof updateChecklistItemSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type Claim = typeof claims.$inferSelect;
