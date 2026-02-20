// Create 1 user + 1000 lost_items

import crypto from "crypto";
import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

if (!MONGO_URL || !DB_NAME) {
  console.log("Missing env vars: MONGO_URL and/or DB_NAME");
  process.exit(1);
}

// Same hash logic as routes/auth.js
function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex");
}

async function main() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const db = client.db(DB_NAME);

  const users = db.collection("users");
  const lostItems = db.collection("lost_items");

  // Create one fixed user (delete same username first)
  const username = "seed";
  const password = "password";

  await users.deleteOne({ username });

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);

  const userRes = await users.insertOne({
    username,
    passwordHash,
    salt,
  });

  const ownerUserId = String(userRes.insertedId);

  // Insert 1000 lost_items
  const date = "02/19/2026";
  const docs = [];

  for (let i = 1; i <= 1000; i++) {
    docs.push({
      title: `Lost Item ${i}`,
      description: `Seed lost item #${i}`,
      category: "Other",
      location: "Library",
      date: date,
      image: "",
      ownerUserId,
      resolved: false,
      createdAt: new Date(),
    });
  }

  await lostItems.insertMany(docs);

  console.log("Seed done.");
  console.log("Created user:");
  console.log({ username, userId: ownerUserId });
  console.log("Inserted lost_items:", docs.length);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
