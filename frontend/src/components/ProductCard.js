// ============================================================
// components/ProductCard.js - Product Grid Card
// ============================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Don't navigate on card click
    if (!isLoggedIn) {
      toast.info("Please login to add items to cart");
      return;
    }
    try {
      setAdding(true);
      await addToCart(product.id, 1);
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-link">
        {/* Image */}
        <div className="product-img-wrap">
          <img
            src={imgError ? "https://via.placeholder.com/400x500?text=No+Image" : product.imageUrl}
            alt={product.name}
            className="product-img"
            onError={() => setImgError(true)}
          />
          {discount && <span className="discount-badge">-{discount}%</span>}
          {product.isFeatured && <span className="featured-badge">⭐ Featured</span>}
          {product.stock === 0 && <div className="out-of-stock-overlay">Out of Stock</div>}
        </div>

        {/* Info */}
        <div className="product-info">
          <div className="product-category">{product.category}</div>
          <h3 className="product-name">{product.name}</h3>

          {/* Rating */}
          <div className="product-rating">
            <div className="stars">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} style={{ color: s <= Math.round(product.rating) ? "#f59e0b" : "#d1d5db" }}>★</span>
              ))}
            </div>
            <span className="stars-count">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="product-price-row">
            <span className="price-current">PKR {product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="price-original">PKR {product.originalPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart */}
      <button
        className={`add-to-cart-btn ${adding ? "loading" : ""}`}
        onClick={handleAddToCart}
        disabled={adding || product.stock === 0}
      >
        {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "🛒 Add to Cart"}
      </button>
    </div>
  );
};

export default ProductCard;
