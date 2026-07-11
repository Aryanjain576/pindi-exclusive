// ============================================================
// components/Header.js - Main Navigation Header
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import "./Header.css";

const Header = () => {
  const { user, logout, isLoggedIn } = useAuth();
  const { cartItemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Shrink header on scroll
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setUserDropOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    navigate("/");
  };

  return (
    <header className={`header ${isScrolled ? "header-scrolled" : ""}`}>
      {/* ── Top Bar ── */}
      <div className="header-topbar">
        <div className="container topbar-inner">
          <span>�🇳 Free delivery on orders above INR 5,000</span>
          <span>📞 Call Us: 9837546746</span>
        </div>
      </div>

      {/* ── Main Header ── */}
      <div className="header-main">
        <div className="container header-inner">

          {/* Logo */}
          <Link to="/" className="logo">
            <div className="logo-icon">PE</div>
            <div className="logo-text">
              <span className="logo-name">Pindi Exclusive</span>
              <span className="logo-tag">Ladies Fashion</span>
            </div>
          </Link>

          {/* Search Bar */}
          <form className="search-form hide-mobile" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search suits, fabrics, dupattas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">
              🔍
            </button>
          </form>

          {/* Right Actions */}
          <div className="header-actions">
            {isLoggedIn ? (
              <div className="user-menu" ref={dropRef}>
                <button
                  className="user-btn"
                  onClick={() => setUserDropOpen(!userDropOpen)}
                >
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hide-mobile user-name">
                    {user.name.split(" ")[0]}
                  </span>
                  <span className="chevron">▾</span>
                </button>
                {userDropOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </div>
                    <hr />
                    <button onClick={handleLogout} className="dropdown-item logout-item">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm hide-mobile">
                  Login
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="cart-btn">
              <span className="cart-icon">🛒</span>
              {cartItemCount > 0 && (
                <span className="cart-badge">{cartItemCount}</span>
              )}
            </Link>

            {/* Hamburger */}
            <button
              className="hamburger show-mobile"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* ── Category Nav ── */}
      <nav className="header-nav hide-mobile">
        <div className="container nav-inner">
          {[
            { label: "All Products", param: "" },
            { label: "👗 Suits", param: "suits" },
            { label: "🧵 Fabrics", param: "fabrics" },
            { label: "🌸 Dupattas", param: "dupattas" },
            { label: "⭐ Featured", param: "featured" },
          ].map(({ label, param }) => (
            <Link
              key={param}
              to={param === "featured" ? "/?featured=true" : param ? `/?category=${param}` : "/"}
              className={`nav-link ${location.search.includes(param) || (!param && location.pathname === "/" && !location.search) ? "active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {menuOpen && (
        <div className="mobile-menu">
          <form className="search-form mobile-search" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>
          <nav className="mobile-nav">
            {[
              { label: "All Products", to: "/" },
              { label: "👗 Suits", to: "/?category=suits" },
              { label: "🧵 Fabrics", to: "/?category=fabrics" },
              { label: "🌸 Dupattas", to: "/?category=dupattas" },
              { label: "⭐ Featured", to: "/?featured=true" },
            ].map(({ label, to }) => (
              <Link key={to} to={to} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            {!isLoggedIn && (
              <>
                <Link to="/login" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/signup" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>Sign Up</Link>
              </>
            )}
            {isLoggedIn && (
              <button className="mobile-nav-link logout-mobile" onClick={handleLogout}>
                🚪 Logout
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
