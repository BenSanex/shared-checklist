import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChecklistItemSchema, updateChecklistItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all checklist items
  app.get("/api/checklist-items", async (req, res) => {
    try {
      const items = await storage.getAllChecklistItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch checklist items" });
    }
  });

  // Create new checklist item
  app.post("/api/checklist-items", async (req, res) => {
    try {
      const validatedData = insertChecklistItemSchema.parse(req.body);
      const item = await storage.createChecklistItem(validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create checklist item" });
      }
    }
  });

  // Update checklist item (for claims and completions)
  app.patch("/api/checklist-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = updateChecklistItemSchema.parse(req.body);
      const item = await storage.updateChecklistItem(id, validatedData);
      
      if (!item) {
        return res.status(404).json({ error: "Checklist item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update checklist item" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
