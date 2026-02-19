// MongoDB connector

import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

let client;
let db;

/**
 * Connect to MongoDB
 */
export async function connectMongo() {
  if (db) return db; // already connected
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  return db;
}

/**
 * Get DB instance
 */
export function getDb() {
  return db;
}
