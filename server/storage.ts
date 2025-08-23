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
      { text: "Charcoal (enough for Smokey Joe)", category: "grilling" },
      { text: "Lighter fluid OR chimney starter", category: "grilling" },
      { text: "Newspaper (fire starter)", category: "grilling" },
      { text: "Matches or lighter", category: "grilling" },
      { text: "Grill tools: tongs, spatula", category: "grilling" },
      { text: "Heat-resistant gloves or oven mitt", category: "grilling" },
      { text: "Foil (wrap corn, line grill, cover leftovers)", category: "grilling" },
      { text: "Grill brush (for cleanup)", category: "grilling" },
      
      // Food & Prep
      { text: "Hot dogs & buns", category: "food" },
      { text: "Sweet corn", category: "food" },
      { text: "Potato salad", category: "food" },
      { text: "Cucumber salad", category: "food" },
      { text: "Watermelon", category: "food" },
      { text: "Condiments: ketchup, mustard, relish, mayo", category: "food" },
      { text: "Seasonings: salt, pepper, butter (for corn)", category: "food" },
      { text: "Extra snacks", category: "food" },
      { text: "Soda", category: "food" },
      { text: "Water", category: "food" },
      { text: "Cooler with ice/ice packs", category: "food" },
      { text: "Plates", category: "food" },
      { text: "Napkins/paper towels", category: "food" },
      { text: "Cutlery (forks, knives, spoons)", category: "food" },
      { text: "Serving spoons/tongs for salads", category: "food" },
      { text: "Cutting board + knife", category: "food" },
      { text: "Picnic blanket or tablecloth", category: "food" },
      { text: "Folding chairs (if needed)", category: "food" },
      { text: "Bug spray", category: "food" },
      { text: "Sunscreen", category: "food" },
      { text: "Trash bags", category: "food" },
      { text: "Wet wipes/hand sanitizer", category: "food" },
      { text: "Ziplocks or containers for leftovers", category: "food" },
      { text: "Frisbee/ball/cards/games", category: "food" },
    ];

    initialItems.forEach(item => {
      const id = randomUUID();
      const checklistItem: ChecklistItem = {
        id,
        text: item.text,
        category: item.category,
        isCompleted: false,
        completedBy: null,
        completedAt: null,
        claimedBy: null,
        claimedAt: null,
        createdAt: new Date(),
      };
      this.items.set(id, checklistItem);
    });
  }

  async getAllChecklistItems(): Promise<ChecklistItem[]> {
    return Array.from(this.items.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
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
      createdAt: new Date(),
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
