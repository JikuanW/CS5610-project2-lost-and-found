// routes/admin.js
import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

// Middleware: admin role only
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access only" });
  }
  next();
}

/**
 * GET /api/admin/items
 * Returns all lost + found items
 */
router.get("/items", requireLogin, requireAdmin, async (req, res) => {
  const db = getDb();
  const lost = await db
    .collection("lost_items")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  const found = await db
    .collection("found_items")
    .find()
    .sort({ createdAt: -1 })
    .toArray();
  res.json({ ok: true, lost, found });
});

/**
 * DELETE /api/admin/lost-items/:id
 */
router.delete(
  "/lost-items/:id",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    let _id;
    try {
      _id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "invalid id" });
    }

    const db = getDb();
    const result = await db.collection("lost_items").deleteOne({ _id });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "not found" });
    return res.json({ ok: true });
  },
);

/**
 * DELETE /api/admin/found-items/:id
 */
router.delete(
  "/found-items/:id",
  requireLogin,
  requireAdmin,
  async (req, res) => {
    let _id;
    try {
      _id = new ObjectId(req.params.id);
    } catch {
      return res.status(400).json({ error: "invalid id" });
    }

    const db = getDb();
    const result = await db.collection("found_items").deleteOne({ _id });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "not found" });
    return res.json({ ok: true });
  },
);

export default router;
