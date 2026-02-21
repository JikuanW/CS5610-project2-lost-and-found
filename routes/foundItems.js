import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/found-items
 * Create found item
 * body: { title, description, category, location, date, image }
 */
router.post("/", requireLogin, async (req, res) => {
  const { title, description, category, location, date, image } = req.body;

  if (!title || !description || !category || !location || !date) {
    return res.status(400).json({ error: "missing required fields" });
  }

  const db = getDb();
  const collection = db.collection("found_items");

  const doc = {
    title,
    description,
    category,
    location,
    date,
    image: image || "",
    ownerUserId: req.user.userId,
    claimed: false,
    createdAt: new Date(),
  };

  const result = await collection.insertOne(doc);
  return res.json({ ok: true, id: result.insertedId });
});

/**
 * GET /api/found-items/mine
 * List my found items
 */
router.get("/mine", requireLogin, async (req, res) => {
  const db = getDb();
  const collection = db.collection("found_items");

  const items = await collection
    .find({ ownerUserId: req.user.userId })
    .sort({ createdAt: -1 })
    .toArray();

  return res.json({ ok: true, items });
});

export default router;

/**
 * GET /api/found-items
 * Public list of all found items (no login required)
 */
router.get("/", async (req, res) => {
  const db = getDb();
  const items = await db.collection("found_items")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return res.json({ ok: true, items });
});
