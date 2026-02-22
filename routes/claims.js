// routes/claims.js
import express from "express";
import { ObjectId } from "mongodb";
import { getDb } from "../db/mongo.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

/**
 * POST /api/claims
 * Submit a claim on a found item
 * body: { foundItemId, message }
 */
router.post("/", requireLogin, async (req, res) => {
  const { foundItemId, message } = req.body;
  if (!foundItemId)
    return res.status(400).json({ error: "foundItemId required" });

  let foundItemObjId;
  try {
    foundItemObjId = new ObjectId(foundItemId);
  } catch {
    return res.status(400).json({ error: "invalid foundItemId" });
  }

  const db = getDb();
  const foundItem = await db.collection("found_items").findOne({ _id: foundItemObjId });
  if (!foundItem) return res.status(404).json({ error: "found item not found" });

  if (foundItem.ownerUserId === req.user.userId)
    return res.status(400).json({ error: "cannot claim your own post" });

  const existing = await db.collection("claims").findOne({
    foundItemId,
    claimantUserId: req.user.userId,
  });
  if (existing)
    return res.status(409).json({ error: "already submitted a claim for this item" });

  const doc = {
    foundItemId,
    foundItemTitle: foundItem.title,
    foundItemOwnerId: foundItem.ownerUserId,
    claimantUserId: req.user.userId,
    claimantUsername: req.user.username,
    message: message || "",
    status: "pending",
    createdAt: new Date(),
  };

  const result = await db.collection("claims").insertOne(doc);
  return res.json({ ok: true, id: result.insertedId });
});

/**
 * GET /api/claims/mine
 * Claims I submitted
 */
router.get("/mine", requireLogin, async (req, res) => {
  const db = getDb();
  const claims = await db.collection("claims")
    .find({ claimantUserId: req.user.userId })
    .sort({ createdAt: -1 })
    .toArray();
  return res.json({ ok: true, claims });
});

/**
 * GET /api/claims/received
 * Claims received on my found items
 */
router.get("/received", requireLogin, async (req, res) => {
  const db = getDb();
  const claims = await db.collection("claims")
    .find({ foundItemOwnerId: req.user.userId })
    .sort({ createdAt: -1 })
    .toArray();
  return res.json({ ok: true, claims });
});

/**
 * PATCH /api/claims/:id/approve
 */
router.patch("/:id/approve", requireLogin, async (req, res) => {
  let _id;
  try { _id = new ObjectId(req.params.id); }
  catch { return res.status(400).json({ error: "invalid id" }); }

  const db = getDb();
  const claim = await db.collection("claims").findOne({ _id });
  if (!claim) return res.status(404).json({ error: "claim not found" });
  if (claim.foundItemOwnerId !== req.user.userId)
    return res.status(403).json({ error: "forbidden" });

  await db.collection("claims").updateOne({ _id }, { $set: { status: "approved" } });
  return res.json({ ok: true });
});

/**
 * PATCH /api/claims/:id/reject
 */
router.patch("/:id/reject", requireLogin, async (req, res) => {
  let _id;
  try { _id = new ObjectId(req.params.id); }
  catch { return res.status(400).json({ error: "invalid id" }); }

  const db = getDb();
  const claim = await db.collection("claims").findOne({ _id });
  if (!claim) return res.status(404).json({ error: "claim not found" });
  if (claim.foundItemOwnerId !== req.user.userId)
    return res.status(403).json({ error: "forbidden" });

  await db.collection("claims").updateOne({ _id }, { $set: { status: "rejected" } });
  return res.json({ ok: true });
});

export default router;
