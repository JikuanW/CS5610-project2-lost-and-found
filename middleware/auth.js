// Auth middleware

import { getSession } from "../sessions.js";

/**
 * Require login
 * If logged in: put user info on req.user
 */
export function requireLogin(req, res, next) {
  const sid = req.cookies.sid;
  const session = sid ? getSession(sid) : null;

  if (!session) {
    return res.status(401).json({ error: "not logged in" });
  }

  req.user = session; // { userId, username }
  next();
}
