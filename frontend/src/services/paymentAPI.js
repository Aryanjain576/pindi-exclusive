/**
 * Payment API Service for Razorpay integration
 */
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const paymentAPI = {
  /**
   * Create order in Razorpay
   */
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(
        `${API_BASE}/payment/create-order`,
        orderData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Verify payment after successful transaction
   */
  verifyPayment: async (paymentData) => {
    try {
      const response = await axios.post(
        `${API_BASE}/payment/verify-payment`,
        paymentData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all orders for current user
   */
  getOrders: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/payment/orders`, {
        params: { userId },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get specific order details
   */
  getOrderById: async (orderId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/payment/orders/${orderId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default paymentAPI;
