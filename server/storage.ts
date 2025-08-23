import { type ChecklistItem, type InsertChecklistItem, type UpdateChecklistItem } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllChecklistItems(): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, updates: UpdateChecklistItem): Promise<ChecklistItem | undefined>;
}

export class MemStorage implements IStorage {
  private items: Map<string, ChecklistItem>;

  constructor() {
    this.items = new Map();
    this.seedInitialData();
  }

  private seedInitialData() {
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

    initialItems.forEach(item => {
      const id = randomUUID();
      const checklistItem: ChecklistItem = {
        id,
        text: item.text,
        isCompleted: false,
        completedBy: null,
        completedAt: null,
        claimedBy: null,
        claimedAt: null,
      };
      this.items.set(id, checklistItem);
    });
  }

  async getAllChecklistItems(): Promise<ChecklistItem[]> {
    return Array.from(this.items.values());
  }

  async createChecklistItem(insertItem: InsertChecklistItem): Promise<ChecklistItem> {
    const id = randomUUID();
    const item: ChecklistItem = {
      id,
      ...insertItem,
      isCompleted: false,
      completedBy: null,
      completedAt: null,
      claimedBy: null,
      claimedAt: null,
    };
    this.items.set(id, item);
    return item;
  }

  async updateChecklistItem(id: string, updates: UpdateChecklistItem): Promise<ChecklistItem | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updatedItem: ChecklistItem = {
      ...item,
      ...updates,
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }
}

export const storage = new MemStorage();
