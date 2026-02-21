// Main server

import express from "express";
import { connectMongo } from "./db/mongo.js";
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

// Routes
app.use("/api/auth", authRouter);
app.use("/api/lost-items", lostItemsRouter);
app.use("/api/found-items", foundItemsRoutes);
app.use("/api/admin", adminRoutes);

// Start server after DB connected
async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
