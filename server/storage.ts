import { type ChecklistItem, type InsertChecklistItem, type UpdateChecklistItem, type InsertClaim, type Claim, checklistItems, claims } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { readFile } from "node:fs/promises";

export interface IStorage {
  getAllChecklistItems(): Promise<(ChecklistItem & { claims: Claim[] })[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, updates: UpdateChecklistItem): Promise<ChecklistItem | undefined>;
  addClaim(claim: InsertClaim): Promise<Claim>;
  removeClaim(itemId: string, claimedBy: string): Promise<void>;
  initializeData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async initializeData(): Promise<void> {
    // Check if we already have data
    const existingItems = await db.select().from(checklistItems).limit(1);
    if (existingItems.length > 0) {
      return; // Data already exists
    }

    // Determine which seed file to load
    const seedName = process.env.CHECKLIST_SEED ?? "picnic";
    const seedUrl = new URL(`./seed/${seedName}.txt`, import.meta.url);

    try {
      const file = await readFile(seedUrl, { encoding: "utf-8" });
      const initialItems = file
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((text) => ({ text }));

      if (initialItems.length > 0) {
        await db.insert(checklistItems).values(initialItems);
      }
    } catch (err) {
      console.error(`Failed to load seed file: ${seedUrl.pathname}`);
      console.error(err);
    }
  }

  async getAllChecklistItems(): Promise<(ChecklistItem & { claims: Claim[] })[]> {
    const itemsWithClaims = await db.query.checklistItems.findMany({
      with: {
        claims: {
          orderBy: desc(claims.claimedAt),
        },
      },
      orderBy: checklistItems.createdAt,
    });

    return itemsWithClaims;
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db
      .insert(checklistItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async updateChecklistItem(id: string, updates: UpdateChecklistItem): Promise<ChecklistItem | undefined> {
    // Convert string dates to Date objects
    const processedUpdates: any = { ...updates };
    if (processedUpdates.completedAt && typeof processedUpdates.completedAt === 'string') {
      processedUpdates.completedAt = new Date(processedUpdates.completedAt);
    }

    const [item] = await db
      .update(checklistItems)
      .set(processedUpdates)
      .where(eq(checklistItems.id, id))
      .returning();
    
    return item || undefined;
  }

  async addClaim(claim: InsertClaim): Promise<Claim> {
    const [newClaim] = await db
      .insert(claims)
      .values(claim)
      .returning();
    return newClaim;
  }

  async removeClaim(itemId: string, claimedBy: string): Promise<void> {
    // Find the most recent claim by this user for this item
    const [claimToRemove] = await db
      .select()
      .from(claims)
      .where(and(eq(claims.itemId, itemId), eq(claims.claimedBy, claimedBy)))
      .orderBy(desc(claims.claimedAt))
      .limit(1);
    
    if (claimToRemove) {
      await db
        .delete(claims)
        .where(eq(claims.id, claimToRemove.id));
    }
  }
}

export const storage = new DatabaseStorage();
