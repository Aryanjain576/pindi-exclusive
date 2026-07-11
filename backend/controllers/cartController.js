// ============================================================
// controllers/cartController.js - Cart Business Logic
// ============================================================

const { Cart, CartItem, Product } = require("../models");

// ─── @route  GET /api/cart ────────────────────────────────────
// ─── @access Private ─────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: CartItem,
          include: [{ model: Product, attributes: ["id", "name", "price", "imageUrl", "stock"] }],
        },
      ],
    });

    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
      cart = await Cart.findByPk(cart.id, {
        include: [
          {
            model: CartItem,
            include: [{ model: Product, attributes: ["id", "name", "price", "imageUrl", "stock"] }],
          },
        ],
      });
    }

    // Calculate total price
    let totalPrice = 0;
    const items = cart.CartItems || [];
    items.forEach((item) => {
      if (item.Product) {
        totalPrice += item.Product.price * item.quantity;
      }
    });

    // Transform response to match frontend expectations
    const formattedCart = {
      ...cart.toJSON(),
      items: items,
    };

    res.json({ cart: formattedCart, totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cart", error: error.message });
  }
};

// ─── @route  POST /api/cart/add ──────────────────────────────
// ─── @access Private ─────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has stock
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < 1) return res.status(400).json({ message: "Product is out of stock" });

    let cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await Cart.create({ userId: req.user.id });
    }

    // Check if item already in cart
    const existingItem = await CartItem.findOne({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      await CartItem.create({ cartId: cart.id, productId, quantity });
    }

    // Return populated cart
    cart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [{ model: Product, attributes: ["id", "name", "price", "imageUrl", "stock"] }],
        },
      ],
    });

    // Calculate total price
    let totalPrice = 0;
    const items = cart.CartItems || [];
    items.forEach((item) => {
      if (item.Product) {
        totalPrice += item.Product.price * item.quantity;
      }
    });

    const formattedCart = {
      ...cart.toJSON(),
      items: items,
    };

    res.json({ message: "Added to cart!", cart: formattedCart, totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

// ─── @route  PUT /api/cart/update ────────────────────────────
// ─── @access Private ─────────────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = await CartItem.findOne({ where: { cartId: cart.id, productId } });
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await item.save();

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [{ model: Product, attributes: ["id", "name", "price", "imageUrl", "stock"] }],
        },
      ],
    });

    let totalPrice = 0;
    const items = updatedCart.CartItems || [];
    items.forEach((item) => {
      if (item.Product) {
        totalPrice += item.Product.price * item.quantity;
      }
    });

    const formattedCart = {
      ...updatedCart.toJSON(),
      items: items,
    };

    res.json({ message: "Cart updated", cart: formattedCart, totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error updating cart", error: error.message });
  }
};

// ─── @route  DELETE /api/cart/remove/:productId ──────────────
// ─── @access Private ─────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    await CartItem.destroy({ where: { cartId: cart.id, productId } });

    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [{ model: Product, attributes: ["id", "name", "price", "imageUrl", "stock"] }],
        },
      ],
    });

    let totalPrice = 0;
    const items = updatedCart.CartItems || [];
    items.forEach((item) => {
      if (item.Product) {
        totalPrice += item.Product.price * item.quantity;
      }
    });

    const formattedCart = {
      ...updatedCart.toJSON(),
      items: items,
    };

    res.json({ message: "Item removed from cart", cart: formattedCart, totalPrice });
  } catch (error) {
    res.status(500).json({ message: "Error removing from cart", error: error.message });
  }
};

// ─── @route  DELETE /api/cart/clear ──────────────────────────
// ─── @access Private ─────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { cartId: cart.id } });
    }
    res.json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
