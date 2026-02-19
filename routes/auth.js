// Auth routes

import crypto from "crypto";
import express from "express";
import { getDb } from "../db/mongo.js";
import { setSession, deleteSession, getSession } from "../sessions.js";

const router = express.Router();

/**
 * Hash password with sha256 + salt
 */
function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

/**
 * POST /api/auth/register
 * body: { username, password }
 */
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // minimal validation
  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  const db = getDb();
  const users = db.collection("users");

  // username must be unique
  const existing = await users.findOne({ username });
  if (existing) {
    return res.status(409).json({ error: "username already exists" });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const result = await users.insertOne({
    username,
    passwordHash,
    salt,
  });

  return res.json({ ok: true, userId: result.insertedId });
});

/**
 * POST /api/auth/login
 * body: { username, password }
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "username and password required" });
  }

  const db = getDb();
  const users = db.collection("users");

  const user = await users.findOne({ username });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const passwordHash = hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  // create session
  const sessionId = crypto.randomBytes(24).toString("hex");
  setSession(sessionId, user._id, user.username);

  // set cookie
  res.cookie("sid", sessionId, {
    httpOnly: true,
  });

  return res.json({ ok: true });
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  const sid = req.cookies.sid;
  if (sid) deleteSession(sid);

  res.clearCookie("sid");
  return res.json({ ok: true });
});

/**
 * GET /api/auth/me - check login
 * return: { loggedIn, userId, username }
 */
router.get("/me", (req, res) => {
  const sid = req.cookies.sid;
  const session = sid ? getSession(sid) : null;

  if (!session) {
    return res.json({ loggedIn: false, userId: "", username: "" });
  }

  return res.json({
    loggedIn: true,
    userId: session.userId,
    username: session.username,
  });
});

export default router;
