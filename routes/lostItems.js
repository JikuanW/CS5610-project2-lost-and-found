// Lost items routes

import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

// Mock lost items
let lostItems = [
  { id: 1, name: "Red backpack", location: "Classroom", date: "2026-02-20" },
  { id: 2, name: "Blue umbrella", location: "Bus stop", date: "2026-02-19" },
];

/**
 * POST /api/lost-items
 * Create lost item
 * body: { title, description, category, location, date, image }
 */
router.post("/", requireLogin, async (req, res) => {
  const { title, description, category, location, date, image } = req.body;

  // minimal validation
  if (!title || !description || !category || !location || !date) {
    return res.status(400).json({ error: "missing required fields" });
  }

  const db = getDb();
  const lostItems = db.collection("lost_items");

  const doc = {
    title,
    description,
    category,
    location,
    date, // store as string
    image: image || "",
    ownerUserId: req.user.userId,
    resolved: false,
    createdAt: new Date(),
  };

  const result = await lostItems.insertOne(doc);
  return res.json({ ok: true, id: result.insertedId });
});

/**
 * GET /api/lost-items/mine
 * List my lost items
 */
router.get("/mine", requireLogin, async (req, res) => {
  const db = getDb();
  const lostItems = db.collection("lost_items");

  const items = await lostItems
    .find({ ownerUserId: req.user.userId })
    .sort({ createdAt: -1 })
    .toArray();

  return res.json({ ok: true, items });
});

/**
 * GET /api/lost-items/:id
 * Get one item (must be mine)
 */
router.get("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;

  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }

  const db = getDb();
  const lostItems = db.collection("lost_items");

  const item = await lostItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  return res.json({ ok: true, item });
});

/**
 * PUT /api/lost-items/:id
 * Edit my item
 */
router.put("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;
  const { title, description, category, location, date, image } = req.body;

  if (!title || !description || !category || !location || !date) {
    return res.status(400).json({ error: "missing required fields" });
  }

  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }

  const db = getDb();
  const lostItems = db.collection("lost_items");

  const item = await lostItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await lostItems.updateOne(
    { _id },
    {
      $set: {
        title,
        description,
        category,
        location,
        date,
        image: image || "",
      },
    },
  );

  return res.json({ ok: true });
});

/**
 * DELETE /api/lost-items/:id
 * Delete my item
 */
router.delete("/:id", requireLogin, async (req, res) => {
  const { id } = req.params;

  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }

  const db = getDb();
  const lostItems = db.collection("lost_items");

  const item = await lostItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await lostItems.deleteOne({ _id });
  return res.json({ ok: true });
});

/**
 * PATCH /api/lost-items/:id/resolve
 * Mark resolved
 */
router.patch("/:id/resolve", requireLogin, async (req, res) => {
  const { id } = req.params;

  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }

  const db = getDb();
  const lostItems = db.collection("lost_items");

  const item = await lostItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await lostItems.updateOne({ _id }, { $set: { resolved: true } });
  return res.json({ ok: true });
});

export default router;
