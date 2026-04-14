const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ================= ADMIN ================= */

app.post("/admin/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Dummy response (you can later connect DB)
  res.json({ message: "Admin registered successfully" });
});


/* ================= OWNER REGISTER ================= */

app.post("/owner/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if owner already exists
    const existing = await pool.query(
      "SELECT * FROM owners WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Owner already exists" });
    }

    // Insert owner into DB
    const result = await pool.query(
      "INSERT INTO owners (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, password, "owner"]
    );

    res.status(201).json({
      message: "Owner registered successfully",
      user: result.rows[0],
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= OWNER LOGIN ================= */

app.post("/owner/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM owners WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: result.rows[0],
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* ================= CATEGORIES ================= */

// GET categories
app.get("/categories", async (req, res) => {
  const result = await pool.query("SELECT * FROM categories");
  res.json(result.rows);
});

// ADD category
app.post("/categories", async (req, res) => {
  const { name, image } = req.body;

  const result = await pool.query(
    "INSERT INTO categories (name, image) VALUES ($1, $2) RETURNING *",
    [name, image]
  );

  res.json(result.rows[0]);
});

// UPDATE category
app.put("/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;

  const result = await pool.query(
    "UPDATE categories SET name=$1, image=$2 WHERE id=$3 RETURNING *",
    [name, image, id]
  );

  res.json(result.rows[0]);
});

// DELETE category
app.delete("/categories/:id", async (req, res) => {
  const { id } = req.params;

  await pool.query("DELETE FROM categories WHERE id=$1", [id]);

  res.json({ message: "Deleted" });
});


/* ================= PRODUCTS ================= */

// GET products
app.get("/products", async (req, res) => {
  const result = await pool.query("SELECT * FROM products");
  res.json(result.rows);
});

/* ================= WISHLIST ================= */

app.get("/wishlist/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      "SELECT * FROM wishlist WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});


/* ================= CART ================= */

app.get("/cart/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1",
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

/* ================= START SERVER ================= */

app.listen(8000, () => {
  console.log("Server running on port 8000");
});

