require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "chatore_sathi";

// These are the two local HTML files this script will read and push to Mongo.
// Keep them in the SAME folder as this script (or change the paths below).
const WEB_HTML_PATH = path.join(__dirname, "web.html"); // website version (install popup)
const APP_HTML_PATH = path.join(__dirname, "app.html"); // APK version (splash screen)

async function pushPages() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create a .env file first (see .env.example).");
    process.exit(1);
  }

  if (!fs.existsSync(WEB_HTML_PATH)) {
    console.error(`Missing file: ${WEB_HTML_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(APP_HTML_PATH)) {
    console.error(`Missing file: ${APP_HTML_PATH}`);
    process.exit(1);
  }

  const webHtml = fs.readFileSync(WEB_HTML_PATH, "utf8");
  const appHtml = fs.readFileSync(APP_HTML_PATH, "utf8");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection("pages");

  await collection.updateOne(
    { _id: "web" },
    { $set: { html: webHtml, updatedAt: new Date() } },
    { upsert: true }
  );
  console.log(`Pushed web.html -> '${DB_NAME}.pages' (_id: "web")`);

  await collection.updateOne(
    { _id: "app" },
    { $set: { html: appHtml, updatedAt: new Date() } },
    { upsert: true }
  );
  console.log(`Pushed app.html -> '${DB_NAME}.pages' (_id: "app")`);

  await client.close();
  console.log("Done! Test at /api/web and /api/app on your deployed server.");
}

pushPages().catch((err) => {
  console.error("Push failed:", err);
  process.exit(1);
});
