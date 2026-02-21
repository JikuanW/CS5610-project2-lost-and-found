// server.js - mock version for local testing without MongoDB

import express from "express";
// import { connectMongo } from "./db/mongo.js"; // Commented out for mock
import authRouter from "./routes/auth.js";
import lostItemsRouter from "./routes/lostItems.js";
import foundItemsRoutes from "./routes/foundItems.js";
import adminRoutes from "./routes/admin.js";
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3000;

// Parse JSON
app.use(express.json());

// Minimal cookie parser
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie || "";
  const cookies = {};

  cookieHeader.split(";").forEach((pair) => {
    const [k, ...v] = pair.trim().split("=");
    if (!k) return;
    cookies[k] = decodeURIComponent(v.join("="));
  });

  req.cookies = cookies;
  next();
});

// Serve static files
app.use(express.static("public"));

// --- MOCK DATA FOR TESTING --- //
const mockLostItems = [
  { id: 1, name: "Blue Umbrella", location: "Library", date: "2026-02-20" },
  { id: 2, name: "Red Backpack", location: "Cafeteria", date: "2026-02-19" },
];

const mockFoundItems = [
  { id: 1, name: "Black Wallet", location: "Gym", date: "2026-02-18" },
];

const mockUsers = [
  { id: 1, username: "testuser", role: "user" },
  { id: 2, username: "admin", role: "admin" },
];

// Override route handlers to use mock data
app.use("/api/lost-items", (req, res) => res.json(mockLostItems));
app.use("/api/found-items", (req, res) => res.json(mockFoundItems));
app.use("/api/admin", (req, res) => res.json(mockUsers));
app.use("/api/auth", (req, res) => res.json({ message: "Auth route works!" }));

// Start server immediately (no DB connection required)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});








// // Main server

// import express from "express";
// import { connectMongo } from "./db/mongo.js";
// import authRouter from "./routes/auth.js";
// import lostItemsRouter from "./routes/lostItems.js";
// import foundItemsRoutes from "./routes/foundItems.js";
// import adminRoutes from "./routes/admin.js";
// import 'dotenv/config';

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Parse JSON
// app.use(express.json());

// // Minimal cookie parser
// app.use((req, res, next) => {
//   const cookieHeader = req.headers.cookie || "";
//   const cookies = {};

//   cookieHeader.split(";").forEach((pair) => {
//     const [k, ...v] = pair.trim().split("=");
//     if (!k) return;
//     cookies[k] = decodeURIComponent(v.join("="));
//   });

//   req.cookies = cookies;
//   next();
// });

// // Serve static files
// app.use(express.static("public"));

// // Routes
// app.use("/api/auth", authRouter);
// app.use("/api/lost-items", lostItemsRouter);
// app.use("/api/found-items", foundItemsRoutes);
// app.use("/api/admin", adminRoutes);

// // Start server after DB connected
// async function start() {
//   await connectMongo();
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
// }

// start();
