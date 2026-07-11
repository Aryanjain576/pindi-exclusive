/**
 * CheckoutPage - Payment Method Selection and Razorpay Integration
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "./CheckoutPage.css";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      toast.info("Please login to checkout");
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  // Form state
  const [formData, setFormData] = useState({
    customerName: user?.name || "",
    customerEmail: user?.email || "",
    deliveryPhone: "",
    deliveryAddress: "",
    deliveryCity: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
      }));
    }
  }, [user]);

  const cartItems = cart?.items || [];
  const subtotal = totalPrice || 0;
  const deliveryFee = subtotal >= 5000 ? 0 : 250;
  const total = subtotal + deliveryFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckout = async () => {
    if (
      !formData.customerName ||
      !formData.customerEmail ||
      !formData.deliveryPhone ||
      !formData.deliveryAddress ||
      !formData.deliveryCity
    ) {
      toast.error("Please fill in all required details!");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      setLoading(true);

      const orderBody = {
        amount: total,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        deliveryAddress: formData.deliveryAddress,
        deliveryCity: formData.deliveryCity,
        deliveryPhone: formData.deliveryPhone,
        paymentMethod,
        items: cartItems.map((item) => ({
          productId: item.productId,
          productName: item.Product?.name,
          productPrice: item.Product?.price,
          quantity: item.quantity,
        })),
        deliveryFee,
      };

      const API_BASE = process.env.REACT_APP_API_URL || "";
      const token = localStorage.getItem("token");
      const orderResponse = await fetch(`${API_BASE}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(orderBody),
      }).then((res) => res.json());

      if (!orderResponse.success) {
        toast.error(orderResponse.message || "Failed to create order");
        return;
      }

      if (paymentMethod === "cod") {
        toast.success("Order placed successfully! Cash on Delivery selected.");
        // Give user a moment to see the toast before redirect
        await new Promise((res) => setTimeout(res, 1400));
        await clearCart();
        navigate("/");
        return;
      }

      const razorpayKeyId = orderResponse.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        toast.error("Payment gateway is not configured. Please use Cash on Delivery.");
        return;
      }

      const options = {
        key: razorpayKeyId,
        order_id: orderResponse.orderId,
        amount: total * 100,
        currency: "INR",
        name: "Pindi Exclusive",
        description: `Order for ${cartItems.length} items`,
        prefill: {
          name: formData.customerName,
          email: formData.customerEmail,
          contact: formData.deliveryPhone,
        },
        theme: {
          color: "#c8102e",
        },
        handler: async (response) => {
          try {
            const token = localStorage.getItem("token");
            const verifyResponse = await fetch(`${API_BASE}/payment/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                razorpayOrderId: orderResponse.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                deliveryAddress: formData.deliveryAddress,
                deliveryCity: formData.deliveryCity,
                deliveryPhone: formData.deliveryPhone,
              }),
            }).then((res) => res.json());

            if (verifyResponse.success) {
              toast.success("Payment successful! Your order is confirmed. 🎉");
              // allow toast to be visible before redirecting
              await new Promise((res) => setTimeout(res, 1400));
              await clearCart();
              navigate("/");
            } else {
              toast.error(verifyResponse.message || "Payment verification failed!");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed!");
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(false);
          },
        },
      };

      if (paymentMethod === "gpay") {
        options.method = { upi: true };
      } else if (paymentMethod === "card") {
        options.method = { card: true };
      } else {
        options.method = { card: true, upi: true };
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        setLoading(false);
      };
      script.onerror = () => {
        toast.error("Failed to load payment gateway");
        setLoading(false);
      };
      document.body.appendChild(script);
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Checkout failed. Please try again.");
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="empty-checkout">
            <h2>Your cart is empty</h2>
            <p>Add some items before proceeding to checkout</p>
            <button
              className="btn btn-accent"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          {/* Left: Order Summary */}
          <div className="checkout-left">
            <div className="order-summary">
              <h2>Order Summary</h2>
              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.productId} className="summary-item">
                    <div>
                      <h4>{item.Product?.name}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      PKR {(item.Product?.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>PKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="total-row">
                  <span>Delivery Fee:</span>
                  <span className={deliveryFee === 0 ? "free" : ""}>
                    {deliveryFee === 0 ? "FREE 🎁" : `PKR ${deliveryFee}`}
                  </span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>PKR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Delivery & Payment Form */}
          <div className="checkout-right">
            <form className="checkout-form">
              <h2>Delivery Details</h2>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="deliveryPhone"
                  value={formData.deliveryPhone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label>Delivery Address</label>
                <textarea
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleChange}
                  placeholder="Enter your full delivery address"
                  rows="3"
                  required
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="deliveryCity"
                  value={formData.deliveryCity}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  required
                />
              </div>

              <button
                type="button"
                className="btn btn-accent btn-lg btn-full"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>

              <p className="checkout-note">
                💳 You will be redirected to Razorpay Secure Payment Gateway
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
