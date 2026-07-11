// ============================================================
// services/api.js - Centralized API call service
// ============================================================

import axios from "axios";

// Base URL - uses proxy in dev (package.json "proxy": "http://localhost:5000")
const API = axios.create({
  baseURL: "/api",
});

// ─── Attach JWT token to every request ───────────────────────
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Handle 401 responses globally ───────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return Promise.reject(error);
  }
);

// ─── Auth API calls ───────────────────────────────────────────
export const authAPI = {
  signup: (data) => API.post("/auth/signup", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
};

// ─── Product API calls ────────────────────────────────────────
export const productAPI = {
  getAll: (params) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post("/products", data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`),
  seed: () => API.post("/products/seed/init"),
};

// ─── Cart API calls ───────────────────────────────────────────
export const cartAPI = {
  get: () => API.get("/cart"),
  add: (productId, quantity) => API.post("/cart/add", { productId, quantity }),
  update: (productId, quantity) => API.put("/cart/update", { productId, quantity }),
  remove: (productId) => API.delete(`/cart/remove/${productId}`),
  clear: () => API.delete("/cart/clear"),
};

export default API;
