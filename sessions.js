// sessions.js — in-memory session store
const sessions = new Map();

export function setSession(sessionId, userId, username, role) {
  sessions.set(sessionId, {
    userId: String(userId),
    username: String(username),
    role: role || "user",
  });
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}


// In-memory session store

// sessionId -> { userId, username }
// const sessions = new Map();

// export function setSession(sessionId, userId, username) {
//   sessions.set(sessionId, {
//     userId: String(userId),
//     username: String(username),
//   });
// }

// export function getSession(sessionId) {
//   return sessions.get(sessionId) || null;
// }

// export function deleteSession(sessionId) {
//   sessions.delete(sessionId);
// }
