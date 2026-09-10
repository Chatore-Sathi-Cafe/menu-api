require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "chatore_sathi";

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
      menu[cat.name] = (cat.items || []).map(({ _id, ...item }) => item);
    }

    res.json(menu);
  } catch (err) {
    console.error("Failed to load menu:", err);
    res.status(500).json({ error: "Failed to load menu" });
  }
});

// GET /api/settings -> returns store open/close hours from the "settings" collection
app.get("/api/settings", async (req, res) => {
  try {
    const database = await getDb();
    const settings = await database
      .collection("settings")
      .findOne({ _id: "storeHours" });

    if (!settings) {
      return res.status(404).json({ error: "Store hours not configured" });
    }

    res.json({ openHour: settings.openHour, closeHour: settings.closeHour });
  } catch (err) {
    console.error("Failed to load settings:", err);
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// GET /api/web -> returns the full website HTML (install-popup version) from the "pages" collection
app.get("/api/web", async (req, res) => {
  try {
    const database = await getDb();
    const doc = await database.collection("pages").findOne({ _id: "web" });

    if (!doc) {
      return res.status(404).send("Web page not seeded yet. Run push-pages.js first.");
    }

    res.set("Content-Type", "text/html");
    res.send(doc.html);
  } catch (err) {
    console.error("Failed to load web page:", err);
    res.status(500).send("Failed to load web page");
  }
});

// GET /api/app -> returns the full APK HTML (splash-screen version) from the "pages" collection
app.get("/api/app", async (req, res) => {
  try {
    const database = await getDb();
    const doc = await database.collection("pages").findOne({ _id: "app" });

    if (!doc) {
      return res.status(404).send("App page not seeded yet. Run push-pages.js first.");
    }

    res.set("Content-Type", "text/html");
    res.send(doc.html);
  } catch (err) {
    console.error("Failed to load app page:", err);
    res.status(500).send("Failed to load app page");
  }
});

app.get("/", (req, res) => {
  res.send("Nothing to see here.");
});

app.listen(PORT, () => {
  console.log(`Menu API listening on port ${PORT}`);
});
