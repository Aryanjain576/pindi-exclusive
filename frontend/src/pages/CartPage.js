// ============================================================
// pages/CartPage.js
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import "./CartPage.css";

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, cartLoading, updateItem, removeItem, clearCart } = useCart();
  const [updatingId, setUpdatingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const handleQtyChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      setUpdatingId(productId);
      await updateItem(productId, newQty);
    } catch {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId, name) => {
    try {
      setRemovingId(productId);
      await removeItem(productId);
      toast.success(`${name} removed from cart`);
    } catch {
      toast.error("Failed to remove item");
    } finally {
      setRemovingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear all items from cart?")) return;
    await clearCart();
    toast.info("Cart cleared");
  };

  const items = cart?.items || [];
  const deliveryFee = totalPrice >= 5000 ? 0 : 250;
  const grandTotal = totalPrice + deliveryFee;

  if (cartLoading) return (
    <div className="cart-page">
      <div className="container">
        <div className="spinner" style={{ margin: "80px auto" }} />
      </div>
    </div>
  );

  if (items.length === 0) return (
    <div className="cart-page">
      <div className="container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your Cart is Empty</h2>
          <p>Browse our collection and add items you love!</p>
          <Link to="/" className="btn btn-primary btn-lg">Start Shopping →</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-count">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          <button className="btn btn-outline btn-sm" onClick={handleClear} style={{ marginLeft: "auto" }}>
            Clear All
          </button>
        </div>

        <div className="cart-layout">
          {/* Cart Items */}
          <div className="cart-items">
            {items.map((item) => {
              if (!item.Product) return null;
              const prod = item.Product;
              const productId = item.productId;
              const isUpdating = updatingId === productId;
              const isRemoving = removingId === productId;

              return (
                <div key={productId} className={`cart-item ${isRemoving ? "removing" : ""}`}>
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    className="cart-item-img"
                    onError={(e) => e.target.src = "https://via.placeholder.com/100?text=IMG"}
                  />
                  <div className="cart-item-details">
                    <h3 className="cart-item-name">
                      <Link to={`/product/${productId}`}>{prod.name}</Link>
                    </h3>
                    <div className="cart-item-price">PKR {prod.price.toLocaleString()}</div>
                    <div className="cart-item-subtotal">
                      Subtotal: <strong>PKR {(prod.price * item.quantity).toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button
                        onClick={() => handleQtyChange(productId, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                      >−</button>
                      <span>{isUpdating ? "..." : item.quantity}</span>
                      <button
                        onClick={() => handleQtyChange(productId, item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= prod.stock}
                      >+</button>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => handleRemove(productId, prod.name)}
                      disabled={isRemoving}
                    >
                      {isRemoving ? "Removing..." : "🗑 Remove"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Items ({items.length})</span>
                  <span>PKR {totalPrice.toLocaleString()}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? "free-delivery" : ""}>
                    {deliveryFee === 0 ? "FREE" : `PKR ${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <div className="delivery-hint">
                    Add PKR {(5000 - totalPrice).toLocaleString()} more for free delivery!
                  </div>
                )}
                <hr />
                <div className="summary-row total-row">
                  <span>Grand Total</span>
                  <span>PKR {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout →
              </button>

              <Link to="/" className="btn btn-outline btn-full" style={{ marginTop: 10, textAlign: "center", display: "block", padding: "10px" }}>
                ← Continue Shopping
              </Link>

              <div className="summary-trust">
                <span>🔒 Secure</span>
                <span>🚚 Fast Delivery</span>
                <span>🔄 Easy Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
