require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "chatore_sathi";

// Allow requests from your GitHub Pages site (and anywhere, if you leave it open)
app.use(cors());

let client;
let db;

async function getDb() {
  if (db) return db;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log("Connected to MongoDB:", DB_NAME);
  return db;
}

// GET /api/menu -> returns menu in the same shape the frontend's MENU object used to have
// { "🍕 Pizzas": [ {...}, {...} ], "🍔 Burgers": [ {...} ], ... }
app.get("/api/menu", async (req, res) => {
  try {
    const database = await getDb();
    const categories = await database
      .collection("categories")
      .find({})
      .sort({ order: 1 })
      .toArray();

    const menu = {};
    for (const cat of categories) {
      // strip mongo-internal fields before sending to the browser
      menu[cat.name] = (cat.items || []).map(({ _id, ...item }) => item);
    }

    res.json(menu);
  } catch (err) {
    console.error("Failed to load menu:", err);
    res.status(500).json({ error: "Failed to load menu" });
  }
});

app.get("/", (req, res) => {
  res.send("Chatore Sathi menu API is running. Try /api/menu");
});

app.listen(PORT, () => {
  console.log(`Menu API listening on port ${PORT}`);
});
