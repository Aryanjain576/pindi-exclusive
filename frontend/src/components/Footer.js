// ============================================================
// components/Footer.js
// ============================================================

import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <div className="footer-logo">
          <div className="footer-logo-icon">PE</div>
          <div>
            <div className="footer-logo-name">Pindi Exclusive</div>
            <div className="footer-logo-tag">Ladies Fashion</div>
          </div>
        </div>
        <p className="footer-desc">
          Your one-stop destination for premium ladies suits and fabrics. 
          Quality fashion from the heart of Rawalpindi.
        </p>
        <div className="footer-socials">
          <a href="#!" className="social-btn" title="Facebook">📘</a>
          <a href="#!" className="social-btn" title="Instagram">📷</a>
          <a href="#!" className="social-btn" title="WhatsApp">💬</a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/?category=suits">Suits</Link></li>
          <li><Link to="/?category=fabrics">Fabrics</Link></li>
          <li><Link to="/?category=dupattas">Dupattas</Link></li>
          <li><Link to="/?featured=true">Featured</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Customer Care</h4>
        <ul>
          <li><a href="#!">Track Order</a></li>
          <li><a href="#!">Returns Policy</a></li>
          <li><a href="#!">Size Guide</a></li>
          <li><a href="#!">FAQs</a></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Contact Us</h4>
        <div className="contact-info">
          <p>📍 108, Sadar Bazaar, Meerut</p>
          <p>📞 9837546746</p>
          <p>✉️ jain6280@gmail.com</p>
          <p>🕐 Tues - Sun: 11 AM - 9 PM</p>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <div className="container footer-bottom-inner">
        <p>© {new Date().getFullYear()} Pindi Exclusive. All rights reserved.</p>
        <p>Made with ❤️ in Pakistan 🇵🇰</p>
      </div>
    </div>
  </footer>
);

export default Footer;
