const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "CHANGE_THIS_PASSWORD";

const dataDir = path.join(__dirname, "data");
const uploadDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(dataDir, { recursive: true });
fs.mkdirSync(uploadDir, { recursive: true });

const db = new Database(path.join(dataDir, "kingdom-keychains.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    price INTEGER NOT NULL,
    color TEXT NOT NULL,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const existingAdmin = db.prepare("SELECT id FROM admins WHERE username=?").get(ADMIN_USER);
if (!existingAdmin) {
  db.prepare("INSERT INTO admins (username,password_hash) VALUES (?,?)")
    .run(ADMIN_USER, bcrypt.hashSync(ADMIN_PASSWORD, 12));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || "CHANGE_THIS_SESSION_SECRET",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }
}));
app.use(express.static(path.join(__dirname, "public")));

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (_, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "-");
      cb(null, Date.now() + "-" + safe);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, PNG, WEBP, and GIF images are allowed."));
  }
});

const requireAdmin = (req, res, next) => {
  if (req.session.adminId) return next();
  res.status(401).json({ error: "Administrator login required." });
};

app.get("/api/products", (req, res) => {
  const products = db.prepare(`
    SELECT * FROM products
    ORDER BY LOWER(name) ASC, id ASC
  `).all();
  res.json(products);
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE username=?").get(username || "");
  if (!admin || !bcrypt.compareSync(password || "", admin.password_hash)) {
    return res.status(401).json({ error: "Invalid username or password." });
  }
  req.session.adminId = admin.id;
  res.json({ ok: true });
});

app.post("/api/logout", requireAdmin, (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  res.json({ authenticated: !!req.session.adminId });
});

app.post("/api/products", requireAdmin, upload.single("image"), (req, res) => {
  const { category, subcategory, color } = req.body;
  if (!category || !subcategory || !color || !req.file) {
    return res.status(400).json({ error: "Picture, color, category, and subcategory are required." });
  }
  const priceByCategory = { Crosses: 10, Ropes: 5, Chainlinks: 5 };
  const price = priceByCategory[category];
  if (!price) {
    return res.status(400).json({ error: "Invalid category." });
  }
  const name = String(subcategory).trim();
  const image = "/uploads/" + req.file.filename;
  const result = db.prepare(`
    INSERT INTO products (name,category,subcategory,price,color,description,image)
    VALUES (?,?,?,?,?,?,?)
  `).run(name, category, subcategory, price, color.trim(), "", image);
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.delete("/api/products/:id", requireAdmin, (req, res) => {
  const product = db.prepare("SELECT image FROM products WHERE id=?").get(req.params.id);
  if (product?.image) {
    const file = path.join(__dirname, "public", product.image.replace(/^\//, ""));
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  db.prepare("DELETE FROM products WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});


app.post("/api/admin/credentials", requireAdmin, (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  const admin = db.prepare("SELECT * FROM admins WHERE id=?").get(req.session.adminId);
  if (!admin || !bcrypt.compareSync(currentPassword || "", admin.password_hash)) {
    return res.status(401).json({ error: "Current password is incorrect." });
  }
  if (!newUsername || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "Enter a username and a new password of at least 8 characters." });
  }
  try {
    db.prepare("UPDATE admins SET username=?, password_hash=? WHERE id=?")
      .run(newUsername.trim(), bcrypt.hashSync(newPassword, 12), admin.id);
    res.json({ ok: true, message: "Administrator login updated successfully." });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "That username is already in use." });
    }
    res.status(500).json({ error: "Could not update administrator login." });
  }
});

app.listen(PORT, () => {
  console.log(`Kingdom Keychains running at http://localhost:${PORT}`);
});