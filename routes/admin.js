import express from "express";
import { getDb } from "../db/mongo.js";
import { requireLogin } from "../middleware/auth.js";

const router = express.Router();

router.get("/items", requireLogin, async (req, res) => {
  const db = getDb();

  const lost = await db.collection("lost_items").find().toArray();
  const found = await db.collection("found_items").find().toArray();

  res.json({
    ok: true,
    lost,
    found
  });
});

export default router;