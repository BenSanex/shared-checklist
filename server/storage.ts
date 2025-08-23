import { type ChecklistItem, type InsertChecklistItem, type UpdateChecklistItem, type InsertClaim, type Claim, checklistItems, claims } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

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

    // Seed initial data
    const initialItems = [
      // Grilling & Fire Setup
      { text: "🔥 Charcoal (enough for Smokey Joe)" },
      { text: "🔥 Lighter fluid OR chimney starter" },
      { text: "🔥 Newspaper (fire starter)" },
      { text: "🔥 Matches or lighter" },
      { text: "🔥 Grill tools: tongs, spatula" },
      { text: "🔥 Heat-resistant gloves or oven mitt" },
      { text: "🔥 Foil (wrap corn, line grill, cover leftovers)" },
      { text: "🔥 Grill brush (for cleanup)" },
      
      // Food & Prep
      { text: "🍴 Hot dogs & buns" },
      { text: "🍴 Sweet corn" },
      { text: "🍴 Potato salad" },
      { text: "🍴 Cucumber salad" },
      { text: "🍴 Watermelon" },
      { text: "🍴 Condiments: ketchup, mustard, relish, mayo" },
      { text: "🍴 Seasonings: salt, pepper, butter (for corn)" },
      { text: "🍴 Extra snacks" },
      { text: "🍴 Soda" },
      { text: "🍴 Water" },
      { text: "🍴 Cooler with ice/ice packs" },
      { text: "🍴 Plates" },
      { text: "🍴 Napkins/paper towels" },
      { text: "🍴 Cutlery (forks, knives, spoons)" },
      { text: "🍴 Serving spoons/tongs for salads" },
      { text: "🍴 Cutting board + knife" },
      { text: "🍴 Picnic blanket or tablecloth" },
      { text: "🍴 Folding chairs (if needed)" },
      { text: "🍴 Bug spray" },
      { text: "🍴 Sunscreen" },
      { text: "🍴 Trash bags" },
      { text: "🍴 Wet wipes/hand sanitizer" },
      { text: "🍴 Ziplocks or containers for leftovers" },
      { text: "🍴 Frisbee/ball/cards/games" },
    ];

    await db.insert(checklistItems).values(initialItems);
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
