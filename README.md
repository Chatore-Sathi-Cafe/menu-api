# Chatore Sathi Cafe — Menu API

This is a tiny backend that reads your menu from MongoDB and serves it as JSON
at `/api/menu`. Your GitHub Pages site (`index.html`) fetches from this API
instead of using a hardcoded menu — so you can edit prices/items in MongoDB
and the website updates automatically.

Why a backend at all? Browsers can't speak MongoDB's protocol directly, and a
raw `mongodb+srv://` connection string must never be put in client-side code
(anyone could steal it and wipe your database). This tiny server keeps the
connection string safely on the server side.

## 1. Get your MongoDB connection string

From MongoDB Atlas: Database → Connect → Drivers → copy the string that looks like:
```
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
```
Also, in Atlas → Network Access, add `0.0.0.0/0` (allow from anywhere) so your
hosted server can connect.

## 2. Seed your menu into MongoDB (run once, from your own computer)

```bash
cd menu-api
npm install
cp .env.example .env
# edit .env and paste your real connection string into MONGODB_URI
npm run seed
```
This creates a `categories` collection in your database with all your existing
pizzas/burgers/momos/etc.

## 3. Deploy the API for free (Render.com)

1. Push this `menu-api` folder to its own GitHub repo (separate from your GitHub Pages repo).
2. Go to https://render.com → New → Web Service → connect that repo.
3. Build command: `npm install`  |  Start command: `npm start`
4. Under Environment, add:
   - `MONGODB_URI` = your real connection string
   - `DB_NAME` = `chatore_sathi`
5. Deploy. Render gives you a URL like `https://chatore-sathi-menu-api.onrender.com`.
6. Test it by opening `https://your-app.onrender.com/api/menu` — you should see your menu as JSON.

(Free Render services sleep after inactivity and take ~30s to wake up on the
first request — fine for a small cafe site, but worth knowing.)

## 4. Point your website at it

In `www/index.html`, update this line near the top of the `<script>` section:
```js
const MENU_API_URL = "https://your-app.onrender.com/api/menu";
```
Commit and push to your GitHub Pages repo as usual. Nothing else about your
Pages deployment changes.

## 5. Editing your menu later

Go to MongoDB Atlas → your cluster → Browse Collections → `chatore_sathi` →
`categories`. Each document is one category (e.g. "🍕 Pizzas") with an `items`
array. Edit prices/names directly there, or add/remove items — your website
will show the change next time someone loads the page. No redeploy needed.
