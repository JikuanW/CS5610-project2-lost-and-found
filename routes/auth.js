// routes/auth.js
import crypto from "crypto";
import express from "express";
import { getDb } from "../db/mongo.js";
import { setSession, deleteSession, getSession } from "../sessions.js";

const router = express.Router();

function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const db = getDb();
  const users = db.collection("users");

  const existing = await users.findOne({ username });
  if (existing)
    return res.status(409).json({ error: "username already exists" });

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  // username "admin" gets admin role automatically
  const role = username === "admin" ? "admin" : "user";

  const result = await users.insertOne({ username, passwordHash, salt, role });
  return res.json({ ok: true, userId: result.insertedId });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const db = getDb();
  const users = db.collection("users");

  const user = await users.findOne({ username });
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const passwordHash = hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash)
    return res.status(401).json({ error: "invalid credentials" });

  const sessionId = crypto.randomBytes(24).toString("hex");
  setSession(sessionId, user._id, user.username, user.role);
  res.cookie("sid", sessionId, { httpOnly: true });

  return res.json({ ok: true, role: user.role });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  const sid = req.cookies.sid;
  if (sid) deleteSession(sid);
  res.clearCookie("sid");
  return res.json({ ok: true });
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const sid = req.cookies.sid;
  const session = sid ? getSession(sid) : null;
  if (!session)
    return res.json({ loggedIn: false, userId: "", username: "", role: "" });
  return res.json({
    loggedIn: true,
    userId: session.userId,
    username: session.username,
    role: session.role,
  });
});

export default router;
