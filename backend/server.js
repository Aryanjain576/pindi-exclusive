// ============================================================
// server.js - Main entry point for Pindi Exclusive Backend
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { sequelize } = require("./models");

// Load environment variables
dotenv.config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors()); // Allow cross-origin requests from React frontend
app.use(express.json()); // Parse incoming JSON request bodies

// ─── Routes ──────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);

// ─── Root Route ───────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Pindi Exclusive API 🛍️" });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!", error: err.message });
});

// ─── PostgreSQL Connection ───────────────────────────────────
const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ PostgreSQL database synced successfully");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database sync failed:", err.message);
    process.exit(1);
  });

