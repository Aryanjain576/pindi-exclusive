// ============================================================
// pages/HomePage.js - Main Landing Page
// ============================================================

import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { productAPI } from "../services/api";
import ProductCard from "../components/ProductCard";
import "./HomePage.css";

// ─── Hero Banner Slides ───────────────────────────────────────
const HERO_SLIDES = [
  {
    title: "New Arrivals",
    subtitle: "Luxury Lawn Collection 2026",
    desc: "Discover our stunning range of embroidered lawn suits for the modern Pakistani woman.",
    cta: "Shop Now",
    bg: "linear-gradient(135deg, #1a1a2e 0%, #c8102e 100%)",
    emoji: "👗",
  },
  {
    title: "Bridal Collection",
    subtitle: "Make Every Moment Unforgettable",
    desc: "Premium bridal and semi-formal suits with hand-crafted embroidery and stone work.",
    cta: "Explore Bridal",
    bg: "linear-gradient(135deg, #2d1b4e 0%, #d4af37 100%)",
    emoji: "💍",
  },
  {
    title: "Fabric Corner",
    subtitle: "Choose Your Style, Your Way",
    desc: "High-quality fabrics by the meter — lawn, khaddar, silk, chiffon and more.",
    cta: "Browse Fabrics",
    bg: "linear-gradient(135deg, #0a2744 0%, #1a6b3a 100%)",
    emoji: "🧵",
  },
];

// ─── Category Cards ───────────────────────────────────────────
const CATEGORIES = [
  { label: "Lawn Suits", image: "/images/lawn-suit.jpg", param: "suits" },
  { label: "Fabrics", image: "/images/fabrics.jpg", param: "fabrics" },
  { label: "Dupattas", image: "/images/dupatta.jpg", param: "dupattas" },
];

// ─── Features Strip ────────────────────────────────────────────
const FEATURES = [
  { icon: "🚚", title: "Free Delivery", desc: "On orders over INR 5,000" },
  { icon: "🔄", title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: "🔒", title: "Secure Payment", desc: "100% secure checkout" },
  { icon: "🌟", title: "Premium Quality", desc: "Authentic Pakistani brands" },
];

// ─── Skeleton Card ────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="skeleton-card">
    <div className="skeleton-img shimmer" />
    <div className="skeleton-body">
      <div className="skeleton-line shimmer" style={{ width: "60%" }} />
      <div className="skeleton-line shimmer" style={{ width: "90%" }} />
      <div className="skeleton-line shimmer" style={{ width: "40%" }} />
    </div>
  </div>
);

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [heroSlide, setHeroSlide] = useState(0);
  const [seeding, setSeeding] = useState(false);

  // Parse URL query params
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("search") || "";
  const categoryFilter = params.get("category") || "";
  const featuredFilter = params.get("featured") || "";

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const queryParams = {};
      if (searchQuery) queryParams.search = searchQuery;
      if (categoryFilter) queryParams.category = categoryFilter;
      if (featuredFilter) queryParams.featured = featuredFilter;
      const res = await productAPI.getAll(queryParams);
      setProducts(res.data.products);
    } catch (err) {
      setError("Could not load products. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, featuredFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide((s) => (s + 1) % HERO_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Seed demo products
  const handleSeed = async () => {
    try {
      setSeeding(true);
      await productAPI.seed();
      await fetchProducts();
    } catch {
      setError("Seeding failed. Please ensure MongoDB is running.");
    } finally {
      setSeeding(false);
    }
  };

  const currentSlide = HERO_SLIDES[heroSlide];
  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : categoryFilter
    ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)}`
    : featuredFilter
    ? "Featured Products"
    : "All Products";

  return (
    <div className="home-page">

      {/* ── Hero Banner ── */}
      {!searchQuery && !categoryFilter && !featuredFilter && (
        <section className="hero" style={{ background: currentSlide.bg }}>
          <div className="container hero-inner">
            <div className="hero-content">
              <span className="hero-tag">✨ {currentSlide.title}</span>
              <h1 className="hero-title">{currentSlide.subtitle}</h1>
              <p className="hero-desc">{currentSlide.desc}</p>
              <div className="hero-actions">
                <Link to="/?category=suits" className="btn btn-accent btn-lg">
                  {currentSlide.cta} →
                </Link>
                <Link to="/?featured=true" className="btn hero-outline-btn btn-lg">
                  View Featured
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-emoji">{currentSlide.emoji}</div>
            </div>
          </div>

          {/* Slide Dots */}
          <div className="hero-dots">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === heroSlide ? "active" : ""}`}
                onClick={() => setHeroSlide(i)}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Features Strip ── */}
      {!searchQuery && !categoryFilter && !featuredFilter && (
        <section className="features-strip">
          <div className="container features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-item">
                <span className="feature-icon">{f.icon}</span>
                <div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Category Cards ── */}
      {!searchQuery && !categoryFilter && !featuredFilter && (
        <section className="categories-section">
          <div className="container">
            <h2 className="section-heading">Shop By Category</h2>
            <p className="section-sub">Browse our curated collections</p>
            <div className="categories-grid">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.param}
                  className="category-card"
                  onClick={() => navigate(`/?category=${cat.param}`)}
                >
                  <img src={cat.image} alt={cat.label} className="category-image" />
                  <div className="category-overlay"></div>
                  <div className="category-label">{cat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Products Section ── */}
      <section className="products-section">
        <div className="container">
          <div className="products-header">
            <div>
              <h2 className="section-heading">{pageTitle}</h2>
              {!loading && (
                <p className="section-sub">{products.length} products found</p>
              )}
            </div>
            {(searchQuery || categoryFilter || featuredFilter) && (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate("/")}
              >
                ✕ Clear Filter
              </button>
            )}
          </div>

          {/* Error State */}
          {error && (
            <div className="error-box">
              <p>{error}</p>
              <div className="error-actions">
                <button className="btn btn-primary btn-sm" onClick={fetchProducts}>
                  Retry
                </button>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleSeed}
                  disabled={seeding}
                >
                  {seeding ? "Loading Demo Data..." : "Load Demo Products"}
                </button>
              </div>
            </div>
          )}

          {/* Loading Skeleton */}
          {loading && (
            <div className="products-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && products.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No Products Found</h3>
              <p>
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different search term.`
                  : "No products available yet."}
              </p>
              <div className="empty-actions">
                <button className="btn btn-primary" onClick={() => navigate("/")}>
                  Browse All Products
                </button>
                <button
                  className="btn btn-outline"
                  onClick={handleSeed}
                  disabled={seeding}
                >
                  {seeding ? "Loading..." : "🌱 Load Demo Data"}
                </button>
              </div>
            </div>
          )}

          {/* Product Grid */}
          {!loading && products.length > 0 && (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
