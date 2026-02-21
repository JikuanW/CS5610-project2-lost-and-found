import { MongoClient } from "mongodb";

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME;

if (!MONGO_URL || !DB_NAME) {
  throw new Error("Missing MONGO_URL or DB_NAME in .env");
}

let client;
let db;

export async function connectMongo() {
  if (db) return db;
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log(`Connected to MongoDB: ${DB_NAME}`);
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not connected yet");
  return db;
}


// MongoDB connector

// import { MongoClient } from "mongodb";

// const MONGO_URL = process.env.MONGO_URL;
// const DB_NAME = process.env.DB_NAME;

// let client;
// let db;

// /**
//  * Connect to MongoDB
//  */
// export async function connectMongo() {
//   if (db) return db; // already connected
//   client = new MongoClient(MONGO_URL);
//   await client.connect();
//   db = client.db(DB_NAME);
//   return db;
// }

// /**
//  * Get DB instance
//  */
// export function getDb() {
//   return db;
// }
