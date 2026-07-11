/**
 * Payment Routes for Razorpay integration
 */
const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  getOrders,
  getOrderById,
} = require("../controllers/paymentController");

const { protect } = require("../middleware/authMiddleware");

// ─── Protected Routes ────────────────────────────────────────────
router.post("/create-order", protect, createOrder); // Create Razorpay order
router.post("/verify-payment", protect, verifyPayment); // Verify payment after transaction
router.get("/orders", protect, getOrders); // Get user's orders
router.get("/orders/:orderId", protect, getOrderById); // Get specific order details

module.exports = router;
