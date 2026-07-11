// ============================================================
// context/CartContext.js - Global Cart State
// ============================================================

import React, { createContext, useState, useContext, useEffect } from "react";
import { cartAPI } from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);

  // ─── Fetch cart when user logs in ───────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCart({ items: [] });
      setTotalPrice(0);
    }
  }, [isLoggedIn]);

  const fetchCart = async () => {
    try {
      setCartLoading(true);
      const res = await cartAPI.get();
      setCart(res.data.cart);
      setTotalPrice(res.data.totalPrice);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const res = await cartAPI.add(productId, quantity);
    setCart(res.data.cart);
    await fetchCart(); // Refresh to get updated totals
    return res;
  };

  const updateItem = async (productId, quantity) => {
    const res = await cartAPI.update(productId, quantity);
    setCart(res.data.cart);
    await fetchCart();
  };

  const removeItem = async (productId) => {
    const res = await cartAPI.remove(productId);
    setCart(res.data.cart);
    await fetchCart();
  };

  const clearCart = async () => {
    await cartAPI.clear();
    setCart({ items: [] });
    setTotalPrice(0);
  };

  const cartItemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        totalPrice,
        cartLoading,
        cartItemCount,
        fetchCart,
        addToCart,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
