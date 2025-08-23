import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChecklistItemSchema, updateChecklistItemSchema, insertClaimSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database on startup
  await storage.initializeData();

  // Get all checklist items with claims
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

  // Update checklist item (for completions only)
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

  // Add a claim to an item
  app.post("/api/checklist-items/:id/claims", async (req, res) => {
    try {
      const { id } = req.params;
      const { claimedBy } = req.body;
      
      const validatedData = insertClaimSchema.parse({
        itemId: id,
        claimedBy
      });
      
      const claim = await storage.addClaim(validatedData);
      res.json(claim);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid request data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to add claim" });
      }
    }
  });

  // Remove a claim from an item
  app.delete("/api/checklist-items/:id/claims/:claimedBy", async (req, res) => {
    try {
      const { id, claimedBy } = req.params;
      await storage.removeClaim(id, claimedBy);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove claim" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
