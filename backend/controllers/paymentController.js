/**
 * Payment Controller for Razorpay integration
 */
const Razorpay = require("razorpay");
const crypto = require("crypto");
const path = require("path");
const dotenv = require("dotenv");
const { Order, OrderItem, Product } = require("../models");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env"), override: true });

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId || !razorpayKeySecret) {
  console.warn("⚠️  Razorpay keys are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.");
}

// Initialize Razorpay instance only when keys are configured
let razorpay = null;
if (razorpayKeyId && razorpayKeySecret) {
  razorpay = new Razorpay({
    key_id: razorpayKeyId,
    key_secret: razorpayKeySecret,
  });
}

// ─── Create Razorpay or COD Order ────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const {
      amount,
      customerName,
      customerEmail,
      deliveryAddress,
      deliveryCity,
      deliveryPhone,
      paymentMethod = "cod",
      items = [],
      deliveryFee = 0,
    } = req.body;

    const userId = req.user.id; // From auth middleware
    const customerNameValue = customerName || req.user.name || "Customer";
    const customerEmailValue = customerEmail || req.user.email;
    const normalizedPaymentMethod = String(paymentMethod || "cod").toLowerCase();

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    if (!deliveryAddress || !deliveryCity || !deliveryPhone) {
      return res.status(400).json({
        success: false,
        message: "Delivery address, city, and phone are required",
      });
    }

    if (!customerEmailValue) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
    }

    let razorpayOrderId = `COD_${Date.now()}_${userId}`;
    let orderResponseData = {
      success: true,
      orderId: razorpayOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      dbOrderId: null,
      paymentMethod: normalizedPaymentMethod,
    };

    if (normalizedPaymentMethod !== "cod") {
      if (!razorpay) {
        return res.status(500).json({
          success: false,
          message:
            "Razorpay API keys are not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env.",
        });
      }

      const options = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}_${userId}`,
        notes: {
          userId,
          paymentMethod: normalizedPaymentMethod,
        },
      };

      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;
      orderResponseData = {
        ...orderResponseData,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: razorpayKeyId,
      };
    }

    // Save order to database with pending status
    const newOrder = await Order.create({
      userId,
      razorpayOrderId,
      amount,
      status: normalizedPaymentMethod === "cod" ? "pending" : "pending",
      paymentMethod: normalizedPaymentMethod,
      customerEmail: customerEmailValue,
      customerName: customerNameValue,
      deliveryAddress,
      deliveryCity,
      deliveryPhone,
      deliveryFee,
    });

    if (Array.isArray(items) && items.length > 0) {
      const orderItems = items.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.productName || item.Product?.name || "",
        productPrice: item.productPrice,
        quantity: item.quantity,
      }));
      await OrderItem.bulkCreate(orderItems);
    }

    orderResponseData.dbOrderId = newOrder.id;
    return res.status(200).json({
      ...orderResponseData,
      message:
        normalizedPaymentMethod === "cod"
          ? "Order placed successfully. Cash on Delivery selected."
          : "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    const message = error.error?.description || error.message || "Failed to create order";
    res.status(500).json({
      success: false,
      message,
      error: error.message || error,
    });
  }
};

// ─── Verify Payment ──────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      deliveryAddress,
      deliveryCity,
      deliveryPhone,
    } = req.body;

    if (!razorpayKeySecret) {
      return res.status(500).json({
        success: false,
        message: "Razorpay API keys are not configured. Cannot verify payment.",
      });
    }

    // Verify signature
    const shasum = crypto.createHmac("sha256", razorpayKeySecret);
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const digest = shasum.digest("hex");

    if (digest !== razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed!",
      });
    }

    // Payment verified - update order status in database
    const order = await Order.findOne({ where: { razorpayOrderId } });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update order with payment details
    order.razorpayPaymentId = razorpayPaymentId;
    order.status = "success";
    if (deliveryAddress) order.deliveryAddress = deliveryAddress;
    if (deliveryCity) order.deliveryCity = deliveryCity;
    if (deliveryPhone) order.deliveryPhone = deliveryPhone;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully! 🎉",
      data: {
        orderId: order.id,
        razorpayOrderId,
        razorpayPaymentId,
        amount: order.amount,
        status: "success",
        orderedAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

// ─── Get Orders ──────────────────────────────────────────────────
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId;

    const orders = await Order.findAll({
      where: userId ? { userId } : {},
      order: [["createdAt", "DESC"]],
      limit: 50,
      include: [
        {
          model: OrderItem,
          include: [{ association: "Product" }],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ─── Get Order by ID ─────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [{ association: "Product" }],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

