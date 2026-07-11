// ============================================================
// pages/LoginPage.js
// ============================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
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
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}! 👋`);
      navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">PE</div>
          <h2>Pindi Exclusive</h2>
          <p>Pakistan's finest ladies fashion destination</p>
          <div className="auth-perks">
            <div className="perk">✨ Premium Quality Suits</div>
            <div className="perk">🚚 Free Delivery on INR 5,000+</div>
            <div className="perk">🔄 Easy Returns</div>
            <div className="perk">🌸 New Arrivals Every Week</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Login to your Pindi Exclusive account</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
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
                placeholder="Enter your password"
                value={form.password} onChange={handleChange}
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? <><span className="btn-spinner" />Logging in...</> : "Login to Account"}
            </button>
          </form>

          <div className="auth-divider"><span>OR</span></div>

          {/* Demo credentials helper */}
          <div className="demo-hint">
            <p>📝 <strong>Demo:</strong> Create an account below to get started!</p>
          </div>

          <p className="auth-redirect">
            Don't have an account? <Link to="/signup">Sign up for free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
