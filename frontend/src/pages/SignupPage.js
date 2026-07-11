// ============================================================
// pages/SignupPage.js
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    else if (form.name.trim().length < 2) errs.name = "Name must be at least 2 characters";
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    try {
      setLoading(true);
      const res = await authAPI.signup({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      });
      login(res.data.user, res.data.token);
      toast.success(`Account created! Welcome, ${res.data.user.name}! 🎉`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Signup failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: "Weak", color: "#ef4444", width: "30%" };
    if (p.length < 8) return { label: "Fair", color: "#f59e0b", width: "55%" };
    if (p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: "Strong", color: "#16a34a", width: "100%" };
    return { label: "Good", color: "#2563eb", width: "75%" };
  };
  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">PE</div>
          <h2>Join Pindi Exclusive</h2>
          <p>Create your free account today</p>
          <div className="auth-perks">
            <div className="perk">🎁 Members-only discounts</div>
            <div className="perk">📦 Order tracking & history</div>
            <div className="perk">🔔 New arrival alerts</div>
            <div className="perk">🛒 Saved wishlist & cart</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join thousands of happy customers</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                className={`form-control ${errors.name ? "input-error" : ""}`}
                placeholder="Ayesha Khan"
                value={form.name} onChange={handleChange}
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email" name="email" type="email"
                className={`form-control ${errors.email ? "input-error" : ""}`}
                placeholder="you@example.com"
                value={form.email} onChange={handleChange}
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                className={`form-control ${errors.password ? "input-error" : ""}`}
                placeholder="At least 6 characters"
                value={form.password} onChange={handleChange}
              />
              {strength && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color, fontSize: "0.78rem", fontWeight: 600 }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                className={`form-control ${errors.confirmPassword ? "input-error" : ""}`}
                placeholder="Re-enter your password"
                value={form.confirmPassword} onChange={handleChange}
              />
              {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Creating Account...</> : "Create My Account →"}
            </button>
          </form>

          <p className="auth-redirect">
            Already have an account? <Link to="/login">Login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
