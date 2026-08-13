require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "chatore_sathi";

// Your existing menu, copied straight from index.html.
// Edit this once to seed the DB — after that, edit menu items directly
// in the MongoDB Atlas web UI (Collections tab), not here.
const MENU = {
  "🥟 Momos": [
    { name: "Veg Momos", half: 30, full: 50 },
    { name: "Paneer Momos", half: 40, full: 60 },
    { name: "Butter Steam Veg Momos", half: 35, full: 60 },
    { name: "Butter Steam Paneer Momos", half: 40, full: 70 },
    { name: "Kurkure Momos", half: 40, full: 70 },
    { name: "Gravy Momos", half: 40, full: 70 },
    { name: "White Sauce Momos", half: 50, full: 99 },
    { name: "Tandoori Momos", half: 60, full: 100 },
    { name: "Cheese Kurkure Momos", half: 70, full: 130 },
    { name: "Kulhad Momos", half: null, full: 100 },
  ],
  "🍕 Pizzas": [
    { name: "Margherita", sizes: { S: 99, M: 159, L: 199 } },
    { name: "Farm House", sizes: { S: 119, M: 199, L: 249 } },
    { name: "Tandoori Paneer", sizes: { S: 129, M: 219, L: 269 } },
    { name: "Chilli Mushroom", sizes: { S: 129, M: 239, L: 269 } },
    { name: "My Hand Pizza", sizes: { S: 69, M: 129, L: 209 } },
    { name: "Amul Butter Pizza", sizes: { S: 129, M: 200, L: 270 } },
    { name: "Popcorn Pizza", sizes: { S: 149, M: 239, L: 299 } },
    { name: "Extra Topping", sizes: { S: 10, M: 20, L: 30 } },
    { name: "Extra Cheese", sizes: { S: 15, M: 25, L: 35 } },
  ],
  "🍔 Burgers": [
    { name: "Aalu Tikki Burger", price: 35 },
    { name: "Crispy Veg Burger", price: 49 },
    { name: "Paneer Burger", price: 59 },
    { name: "Kuch Bhi Burger", price: 59 },
    { name: "Cheesy Burger", price: 69 },
  ],
  "🍜 Chinese": [
    { name: "Noodles", half: 30, full: 50 },
    { name: "Hakka Noodles", half: 50, full: 80 },
    { name: "Paneer Noodles", half: 60, full: 100 },
    { name: "Chilli Potato", half: 30, full: 50 },
    { name: "Fries", half: 30, full: 50 },
    { name: "Honey Chilli Potato", half: 50, full: 80 },
  ],
  "🥤 Shakes and Coffee": [
    { name: "Hot Coffee", price: 40 },
    { name: "Cold Coffee", sizes: { S: 59, L: 99 } },
    { name: "Oreo Shake", sizes: { S: 69, L: 109 } },
    { name: "Kit Kat Shake", sizes: { S: 69, L: 109 } },
    { name: "Strawberry Shake", sizes: { S: 69, L: 109 } },
    { name: "Add Ice Cream", price: 20 },
  ],
  "🍛 Kulhad Items": [
    { name: "Kulhad Fries", price: 59 },
    { name: "Kulhad Maggi", price: 69 },
    { name: "Kulhad Pizza", price: 99 },
  ],
  "🍝 Pastas": [
    { name: "White Sauce Pasta", half: 69, full: 119 },
    { name: "Red Sauce Pasta", price: 69 },
  ],
  "🥪 Sandwiches": [
    { name: "Veg Sandwich", price: 59 },
    { name: "Grilled Corn Sandwich", price: 59 },
    { name: "Chilli Paneer Sandwich", price: 69 },
    { name: "Cheese Burst Sandwich", price: 89 },
  ],
  "🍱 Combos": [
    { name: "Burger Combo", price: 69 },
    { name: "Pizza Combo", price: 99 },
    { name: "Pizza and Pasta Combo", price: 139 },
    { name: "Momos Combo", price: 139 },
    { name: "Grand Combo", price: 249 },
    { name: "Grab & Sip Combo", price: 149 },
    { name: "Chill & Cheese Combo", price: 109 },
  ],
  "🍟 Snacks": [
    { name: "Chilli Paneer", price: 80 },
    { name: "Spring Roll", price: 30 },
    { name: "Plain Butter Maggi", price: 40 },
    { name: "Potato Twister", price: 50 },
    { name: "Hara-Bhara Kabab", price: 70 },
  ],
};

async function seed() {
  if (!MONGODB_URI) {
    console.error("Missing MONGODB_URI. Create a .env file first (see .env.example).");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(DB_NAME);
  const collection = db.collection("categories");

  await collection.deleteMany({}); // wipe any previous seed

  const docs = Object.entries(MENU).map(([name, items], index) => ({
    name,
    order: index,
    items,
  }));

  const result = await collection.insertMany(docs);
  console.log(`Seeded ${result.insertedCount} categories into '${DB_NAME}.categories'`);

  await client.close();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
