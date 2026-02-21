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
  const foundItems = db.collection("found_items");

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

  const result = await foundItems.insertOne(doc);
  return res.json({ ok: true, id: result.insertedId });
});

/**
 * GET /api/found-items/mine
 * List my found items
 */
router.get("/mine", requireLogin, async (req, res) => {
  const db = getDb();
  const foundItems = db.collection("found_items");

  const items = await foundItems
    .find({ ownerUserId: req.user.userId })
    .sort({ createdAt: -1 })
    .toArray();

  return res.json({ ok: true, items });
});

/**
 * GET /api/found-items/:id
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
  const foundItems = db.collection("found_items");

  const item = await foundItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  return res.json({ ok: true, item });
});

/**
 * PUT /api/found-items/:id
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
  const foundItems = db.collection("found_items");

  const item = await foundItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await foundItems.updateOne(
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
 * DELETE /api/found-items/:id
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
  const foundItems = db.collection("found_items");

  const item = await foundItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await foundItems.deleteOne({ _id });
  return res.json({ ok: true });
});

/**
 * PATCH /api/found-items/:id/claim
 * Mark claimed
 */
router.patch("/:id/claim", requireLogin, async (req, res) => {
  const { id } = req.params;
  let _id;

  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }

  const db = getDb();
  const foundItems = db.collection("found_items");

  const item = await foundItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await foundItems.updateOne({ _id }, { $set: { claimed: true } });
  return res.json({ ok: true });
});

/**
 * PATCH /api/found-items/:id/claim
 * Mark item as claimed
 */
router.patch("/:id/claim", requireLogin, async (req, res) => {
  const { id } = req.params;

  let _id;
  try {
    _id = new ObjectId(id);
  } catch {
    return res.status(400).json({ error: "invalid id" });
  }

  const db = getDb();
  const foundItems = db.collection("found_items");

  const item = await foundItems.findOne({ _id });
  if (!item) return res.status(404).json({ error: "not found" });

  if (item.ownerUserId !== req.user.userId) {
    return res.status(403).json({ error: "forbidden" });
  }

  await foundItems.updateOne(
    { _id },
    { $set: { claimed: true } }
  );

  res.json({ ok: true });
});

export default router;