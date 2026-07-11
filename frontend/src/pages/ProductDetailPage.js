// ============================================================
// pages/ProductDetailPage.js
// ============================================================

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { productAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await productAPI.getById(id);
        setProduct(res.data.product);
      } catch {
        toast.error("Product not found");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isLoggedIn) { toast.info("Please login to add items to cart"); return; }
    try {
      setAdding(true);
      await addToCart(product.id, quantity);
      toast.success("Added to cart! 🛒");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const discount = product?.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  if (loading) return (
    <div className="detail-page">
      <div className="container detail-skeleton">
        <div className="skeleton-img-lg shimmer" />
        <div className="skeleton-detail-body">
          {[80, 50, 95, 60, 40].map((w, i) => (
            <div key={i} className="skeleton-line shimmer" style={{ width: `${w}%`, height: i === 0 ? 28 : 16, marginBottom: 12 }} />
          ))}
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  return (
    <div className="detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <button onClick={() => navigate("/")} className="breadcrumb-link">Home</button>
          <span>›</span>
          <button onClick={() => navigate(`/?category=${product.category}`)} className="breadcrumb-link">
            {product.category}
          </button>
          <span>›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="detail-grid">
          {/* Image */}
          <div className="detail-img-wrap">
            <img
              src={imgError ? "https://via.placeholder.com/600x700?text=No+Image" : product.imageUrl}
              alt={product.name}
              className="detail-img"
              onError={() => setImgError(true)}
            />
            {discount && <div className="detail-discount-badge">-{discount}% OFF</div>}
            {product.isFeatured && <div className="detail-featured-badge">⭐ Featured</div>}
          </div>

          {/* Details */}
          <div className="detail-info">
            <div className="detail-category">{product.category}</div>
            <h1 className="detail-name">{product.name}</h1>

            {/* Rating */}
            <div className="detail-rating">
              <div className="stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(product.rating) ? "#f59e0b" : "#d1d5db", fontSize: "1.1rem" }}>★</span>
                ))}
              </div>
              <span className="rating-num">{product.rating.toFixed(1)}</span>
              <span className="rating-count">({product.reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="detail-price-block">
              <span className="detail-price-current">PKR {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="detail-price-original">PKR {product.originalPrice.toLocaleString()}</span>
                  <span className="detail-price-save">You save PKR {(product.originalPrice - product.price).toLocaleString()}</span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={`detail-stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
              {product.stock > 0 ? `✓ In Stock (${product.stock} available)` : "✗ Out of Stock"}
            </div>

            {/* Description */}
            {product.description && (
              <div className="detail-desc">
                <h3>Product Description</h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="detail-quantity">
                <label>Quantity:</label>
                <div className="qty-control">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>+</button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions">
              <button
                className="btn btn-primary btn-lg"
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : adding ? "Adding..." : "🛒 Add to Cart"}
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate("/cart")}
              >
                View Cart
              </button>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-item">🔒 Secure Payment</div>
              <div className="trust-item">🚚 Free Delivery 5k+</div>
              <div className="trust-item">🔄 7-Day Returns</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
