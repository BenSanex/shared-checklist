import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  text: text("text").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedBy: text("completed_by"),
  completedAt: timestamp("completed_at"),
  claimedBy: text("claimed_by"),
  claimedAt: timestamp("claimed_at"),
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).pick({
  text: true,
});

export const updateChecklistItemSchema = z.object({
  isCompleted: z.boolean().optional(),
  completedBy: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  claimedBy: z.string().nullable().optional(),
  claimedAt: z.string().nullable().optional(),
});

export type InsertChecklistItem = z.infer<typeof insertChecklistItemSchema>;
export type UpdateChecklistItem = z.infer<typeof updateChecklistItemSchema>;
export type ChecklistItem = typeof checklistItems.$inferSelect;
