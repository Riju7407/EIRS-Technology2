import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaCreditCard,
  FaWallet,
  FaMobile,
  FaMapMarkerAlt,
  FaBuilding,
  FaMoneyBillWave,
  FaCheckCircle,
  FaLocationArrow,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";
import paymentService from "../services/paymentService";
import { orderService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

import "../styles/CheckoutModal.css";

const CheckoutModal = ({ onClose = () => {} }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?._id;
  const userName = user?.name;
  const userEmail = user?.email;

  const { cartItems, getTotalPrice } = useCart();
  const totalAmount = getTotalPrice() * 1.18;
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [paymentSubMethod, setPaymentSubMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null); // holds confirmed order

  // Address state
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || userName || "",
    email: userEmail || user?.email || "",
    phone: user?.phoneNumber || "",
    houseNo: "",
    address: user?.address || "",
    city: "",
    state: "",
    zipCode: "",
  });

  const [addressErrors, setAddressErrors] = useState({});
  const [addressInputMode, setAddressInputMode] = useState("manual");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationStatus, setLocationStatus] = useState({
    type: "idle",
    message: "",
  });

  // Ensure the payment method stays synced
  useEffect(() => {
    console.log("Payment method state updated:", paymentMethod);
  }, [paymentMethod]);

  // Update shipping address with user info when component loads
  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name || prev.fullName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        address: user.address || prev.address,
      }));
    }
  }, [user]);

  const validateAddress = () => {
    const errors = {};
    if (!shippingAddress.fullName.trim())
      errors.fullName = "Full name is required";
    if (!shippingAddress.email.trim()) errors.email = "Email is required";
    if (!shippingAddress.phone.trim())
      errors.phone = "Phone number is required";
    if (shippingAddress.phone.length < 10)
      errors.phone = "Phone number must be at least 10 digits";

    if (addressInputMode === "manual") {
      if (!shippingAddress.address.trim())
        errors.address = "Address is required";
      if (!shippingAddress.city.trim()) errors.city = "City is required";
      if (!shippingAddress.state.trim()) errors.state = "State is required";
      if (!shippingAddress.zipCode.trim())
        errors.zipCode = "Zip code is required";
      if (shippingAddress.zipCode.length < 5)
        errors.zipCode = "Zip code must be at least 5 digits";
    }

    if (addressInputMode === "auto") {
      const hasDetectedAddress =
        shippingAddress.address.trim() &&
        shippingAddress.city.trim() &&
        shippingAddress.state.trim() &&
        shippingAddress.zipCode.trim();

      if (!hasDetectedAddress || locationStatus.type !== "success") {
        errors.autoDetect =
          "Please click Auto Detect Location and wait for success before payment";
      }
    }

    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressModeChange = (mode) => {
    setAddressInputMode(mode);
    setAddressErrors((prev) => ({
      ...prev,
      address: "",
      city: "",
      state: "",
      zipCode: "",
      autoDetect: "",
    }));

    if (mode === "manual") {
      setLocationStatus({ type: "idle", message: "" });
    }
  };

  const handleAddressChange = (field, value) => {
    setShippingAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (addressErrors[field]) {
      setAddressErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const reverseGeocodeLocation = async (lat, lng) => {
    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2` +
        `&lat=${lat}&lon=${lng}&accept-language=en`;

      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });

      if (!res.ok) {
        throw new Error("Reverse geocode request failed");
      }

      const data = await res.json();
      const parsed = data?.address || {};

      const street = [
        parsed.house_number,
        parsed.road,
        parsed.suburb || parsed.neighbourhood || parsed.hamlet,
      ]
        .filter(Boolean)
        .join(", ");

      return {
        address: street || data.display_name || "",
        city:
          parsed.city || parsed.town || parsed.village || parsed.county || "",
        state: parsed.state || "",
        zipCode: parsed.postcode || "",
      };
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      return null;
    }
  };

  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus({
        type: "error",
        message:
          "Geolocation is not supported by your browser. Please enter your address manually.",
      });
      return;
    }

    setIsDetectingLocation(true);
    setLocationStatus({
      type: "loading",
      message: "Detecting your location...",
    });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const resolved = await reverseGeocodeLocation(lat, lng);

        if (!resolved) {
          setLocationStatus({
            type: "error",
            message:
              "Location detected, but address lookup failed. Please fill details manually.",
          });
          setIsDetectingLocation(false);
          return;
        }

        setShippingAddress((prev) => ({
          ...prev,
          address: resolved.address || prev.address,
          city: resolved.city || prev.city,
          state: resolved.state || prev.state,
          zipCode: resolved.zipCode || prev.zipCode,
        }));

        setAddressErrors((prev) => {
          const next = { ...prev };
          if (resolved.address) delete next.address;
          if (resolved.city) delete next.city;
          if (resolved.state) delete next.state;
          if (resolved.zipCode) delete next.zipCode;
          return next;
        });

        setLocationStatus({
          type: "success",
          message: "Location detected and address fields updated.",
        });
        setIsDetectingLocation(false);
      },
      (err) => {
        let message =
          "Unable to detect location. Please enter your address manually.";
        if (err.code === err.PERMISSION_DENIED) {
          message =
            "Location permission denied. Please allow permission or fill manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          message = "Location information unavailable. Please try again.";
        } else if (err.code === err.TIMEOUT) {
          message = "Location request timed out. Please try again.";
        }

        setLocationStatus({ type: "error", message });
        setIsDetectingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      },
    );
  };

  const handlePayment = async () => {
    // Validate address first
    if (!validateAddress()) {
      setError("Please fill in all required address fields");
      return;
    }

    // Auto-select Card if not already selected
    if (!paymentMethod) {
      setPaymentMethod("Card");
    }

    setLoading(true);
    setError("");

    try {
      // Create order on backend
      console.log("Creating order on backend...");
      let orderResponse;
      try {
        // Validate and prepare items with proper structure
        const items = cartItems.map((item, index) => {
          // Ensure productId exists - use _id or id as fallback
          const productId = item._id || item.id;
          if (!productId) {
            console.warn(`⚠️ Item ${index} missing productId:`, item);
            throw new Error(
              `Item ${index} (${item.name || item.productName}) is missing product ID`,
            );
          }

          return {
            productId: productId,
            productName: item.productName || item.name || "Product", // Use productName as primary
            quantity: item.quantity || 1,
            price: item.price || 0,
            category: item.category || "",
            brand: item.brand || "",
            image: item.image || item.productImage || "",
            hsn: item.hsn || "",
            modelNo: item.modelNo || "",
            discount: item.discount || 0,
          };
        });

        console.log("Cart items validation passed:", items);

        const orderData = {
          amount: Math.round(totalAmount * 100), // Razorpay expects amount in paise
          currency: "INR",
          items: items,
          userId,
          email: userEmail,
          phone: shippingAddress.phone,
          shippingAddress: shippingAddress,
          paymentMethod: paymentMethod || "Card",
          paymentSubMethod: paymentSubMethod,
        };
        console.log("Sending order data to backend:", orderData);
        orderResponse = await paymentService.createOrder(orderData);
      } catch (orderError) {
        console.error("❌ Order creation error:", orderError);
        // Check if it's a 401 auth error - prompt re-login
        const statusCode = orderError?.status || orderError?.response?.status;
        if (statusCode === 401) {
          setError("Your session has expired. Please sign in again and retry.");
        } else {
          setError(
            "Failed to create order: " +
              (orderError.message || JSON.stringify(orderError)),
          );
        }
        setLoading(false);
        return;
      }

      console.log("Order created:", orderResponse);
      const { orderId, mongoOrderId } = orderResponse;

      if (!orderId || !mongoOrderId) {
        throw new Error("No order ID received from server");
      }

      // Handle Cash on Delivery separately (no Razorpay needed)
      if (paymentMethod === "CashOnDelivery") {
        try {
          const verifyResponse = await paymentService.verifyPayment({
            orderId: mongoOrderId,
            razorpay_order_id: orderId,
            razorpay_payment_id: "cod_" + mongoOrderId,
            razorpay_signature: "cod_verified_" + Date.now(),
            paymentMethod: "CashOnDelivery",
          });

          console.log("COD Verification response:", verifyResponse);
          if (verifyResponse.success) {
            localStorage.removeItem("cart");
            setSuccessOrder({ type: "cod", order: verifyResponse.order });

            if (verifyResponse.success) {
              localStorage.removeItem("cart");

              if (typeof onClose === "function") {
                onClose();
              }

              navigate(
                `/order-success?orderId=${verifyResponse.order?._id}&type=cod`,
                { replace: true },
              );
            }
          } else {
            setError(
              verifyResponse.message ||
                "Failed to place order. Please try again.",
            );
          }
        } catch (err) {
          console.error("❌ Order confirmation error:", err);
          setError(
            "Order confirmation failed: " + (err.message || "Unknown error"),
          );
        } finally {
          setLoading(false);
        }
        return;
      }

      // For online payment methods, use Razorpay
      const res = await paymentService.loadRazorpayScript();

      if (!res || typeof window.Razorpay === "undefined") {
        console.error("❌ Razorpay SDK failed to load");
        setError(
          "Payment gateway unavailable. Please try Cash on Delivery or contact support.",
        );
        setLoading(false);
        return;
      }

      console.log("✓ Razorpay SDK loaded successfully");

      // Razorpay options
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: Math.round(totalAmount * 100),
        currency: "INR",
        name: "EIRS Technology",
        description: `Purchase of ${cartItems.length} product(s)`,
        image: "https://eirstechnology.com/logo192.png",
        companyLogo: "EIRS Technology",
        business_info: { gstin: "29AANCR6717K1ZN" },
        order_id: orderId,
        handler: async (response) => {
          try {
            console.log("Payment handler called with response:", response);
            // Verify payment
            const verifyResponse = await paymentService.verifyPayment({
              orderId: mongoOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            console.log("Verification response:", verifyResponse);
            if (verifyResponse.success) {
              localStorage.removeItem("cart");
              setSuccessOrder({
                type: "online",
                order: verifyResponse.order,
                paymentId: response.razorpay_payment_id,
              });

              navigate(
                `/order-success?orderId=${verifyResponse.order?._id}&paymentId=${response.razorpay_payment_id}`,
                { replace: true },
              );
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("❌ Payment verification error:", err);
            setError(
              "Payment verification failed: " +
                (err.message || "Unknown error"),
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: async () => {
            if (mongoOrderId) {
              try {
                await orderService.deleteUserOrder(mongoOrderId);
              } catch (delErr) {
                console.error(
                  "Failed to delete pending order after checkout dismiss:",
                  delErr,
                );
              }
            }
            setError("Payment fail hua hai, dubara try karo ya COD use karo");
            setLoading(false);
          },
        },
        prefill: {
          name: shippingAddress.fullName,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: "#1a73e8",
          backdrop_color: "rgba(0, 0, 0, 0.6)",
          hide_topbar: false,
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      };

      console.log("Opening Razorpay checkout with options:", options);
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on("payment.failed", async (response) => {
        console.log("❌ FULL PAYMENT ERROR:", response);

        if (mongoOrderId) {
          try {
            await orderService.deleteUserOrder(mongoOrderId);
          } catch (delErr) {
            console.error("Order delete error:", delErr);
          }
        }

        setError(
          response?.error?.description ||
            response?.error?.reason ||
            "Payment fail hua hai",
        );

        setLoading(false);
      });
    } catch (err) {
      console.error("❌ Payment initialization error:", err);
      setError(
        err.message || "Payment initialization failed. Please try again.",
      );
      setLoading(false);
    }
  };

  /* ── Success screen ── */

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <div className="checkout-header">
          <h2>Checkout — EIRS Technology</h2>
          <button className="back-btn" onClick={() => navigate("/cart")}>
            Back To Cart
          </button>
        </div>

        <div className="checkout-content">
          {/* Order Summary */}
          <div className="checkout-right"></div>

          {/* Left Side */}
          <div className="checkout-layout">
            <div className="checkout-main">
              {/* Shipping Address Section */}
              <div className="shipping-address-section">
                <h3>
                  <FaMapMarkerAlt /> Shipping Address
                </h3>
                <div className="address-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        placeholder="Enter full name"
                        value={shippingAddress.fullName}
                        onChange={(e) =>
                          handleAddressChange("fullName", e.target.value)
                        }
                        className={addressErrors.fullName ? "error" : ""}
                      />
                      {addressErrors.fullName && (
                        <span className="error-text">
                          {addressErrors.fullName}
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        placeholder="Enter email"
                        value={shippingAddress.email}
                        onChange={(e) =>
                          handleAddressChange("email", e.target.value)
                        }
                        className={addressErrors.email ? "error" : ""}
                      />
                      {addressErrors.email && (
                        <span className="error-text">
                          {addressErrors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={shippingAddress.phone}
                        onChange={(e) =>
                          handleAddressChange("phone", e.target.value)
                        }
                        className={addressErrors.phone ? "error" : ""}
                      />
                      {addressErrors.phone && (
                        <span className="error-text">
                          {addressErrors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-row single">
                    <div className="address-mode-switch">
                      <p className="address-mode-title">
                        Address Input Method *
                      </p>
                      <div className="address-mode-options">
                        <label className="address-mode-option">
                          <input
                            type="radio"
                            name="addressInputMode"
                            value="manual"
                            checked={addressInputMode === "manual"}
                            onChange={() => handleAddressModeChange("manual")}
                          />
                          <span>Manual Entry</span>
                        </label>
                        <label className="address-mode-option">
                          <input
                            type="radio"
                            name="addressInputMode"
                            value="auto"
                            checked={addressInputMode === "auto"}
                            onChange={() => handleAddressModeChange("auto")}
                          />
                          <span>Auto Detect Location</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>House No. / Flat No. / Building</label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 3B, Krishna Apartments"
                        value={shippingAddress.houseNo}
                        onChange={(e) =>
                          handleAddressChange("houseNo", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {addressInputMode === "auto" && (
                    <div className="form-row single">
                      <div className="location-detect-wrapper">
                        <button
                          type="button"
                          className="location-detect-btn"
                          onClick={handleAutoDetectLocation}
                          disabled={isDetectingLocation}
                        >
                          {isDetectingLocation ? (
                            <>
                              <FaSpinner className="spin" /> Detecting...
                            </>
                          ) : (
                            <>
                              <FaLocationArrow /> Auto Detect Location
                            </>
                          )}
                        </button>

                        {locationStatus.message && (
                          <p
                            className={`location-status location-status-${locationStatus.type}`}
                          >
                            {locationStatus.type === "error" ? (
                              <FaExclamationTriangle />
                            ) : (
                              <FaCheckCircle />
                            )}
                            <span>{locationStatus.message}</span>
                          </p>
                        )}

                        {addressErrors.autoDetect && (
                          <span className="error-text">
                            {addressErrors.autoDetect}
                          </span>
                        )}

                        {locationStatus.type === "success" && (
                          <div className="detected-address-preview">
                            <p>
                              <strong>Street:</strong> {shippingAddress.address}
                            </p>
                            <p>
                              <strong>City:</strong> {shippingAddress.city}
                            </p>
                            <p>
                              <strong>State:</strong> {shippingAddress.state}
                            </p>
                            <p>
                              <strong>Zip:</strong> {shippingAddress.zipCode}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {addressInputMode === "manual" && (
                    <>
                      <div className="form-row">
                        <div className="form-group">
                          <label>Street / Area / Locality *</label>
                          <textarea
                            placeholder="Street name, area, locality"
                            value={shippingAddress.address}
                            onChange={(e) =>
                              handleAddressChange("address", e.target.value)
                            }
                            className={addressErrors.address ? "error" : ""}
                            rows="2"
                          />
                          {addressErrors.address && (
                            <span className="error-text">
                              {addressErrors.address}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>City *</label>
                          <input
                            type="text"
                            placeholder="Enter city"
                            value={shippingAddress.city}
                            onChange={(e) =>
                              handleAddressChange("city", e.target.value)
                            }
                            className={addressErrors.city ? "error" : ""}
                          />
                          {addressErrors.city && (
                            <span className="error-text">
                              {addressErrors.city}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>State *</label>
                          <input
                            type="text"
                            placeholder="Enter state"
                            value={shippingAddress.state}
                            onChange={(e) =>
                              handleAddressChange("state", e.target.value)
                            }
                            className={addressErrors.state ? "error" : ""}
                          />
                          {addressErrors.state && (
                            <span className="error-text">
                              {addressErrors.state}
                            </span>
                          )}
                        </div>
                        <div className="form-group">
                          <label>Zip Code *</label>
                          <input
                            type="text"
                            placeholder="Enter zip code"
                            value={shippingAddress.zipCode}
                            onChange={(e) =>
                              handleAddressChange("zipCode", e.target.value)
                            }
                            className={addressErrors.zipCode ? "error" : ""}
                          />
                          {addressErrors.zipCode && (
                            <span className="error-text">
                              {addressErrors.zipCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="payment-method-section">
                <h3>Select Payment Method</h3>
                <div className="payment-methods">
                  {/* UPI Option */}
                  <div
                    className={`payment-option-box ${paymentMethod === "UPI" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      id="upi-option"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentSubMethod("UPI");
                      }}
                    />
                    <label htmlFor="upi-option" className="payment-label">
                      <FaMobile className="icon upi" />
                      <div className="payment-details">
                        <p className="method-name">UPI</p>
                        <p className="method-desc">
                          Google Pay, PhonePe, Paytm
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Card Option */}
                  <div
                    className={`payment-option-box ${paymentMethod === "Card" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      id="card-option"
                      name="payment"
                      value="Card"
                      checked={paymentMethod === "Card"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentSubMethod("Card");
                      }}
                    />
                    <label htmlFor="card-option" className="payment-label">
                      <FaCreditCard className="icon card" />
                      <div className="payment-details">
                        <p className="method-name">Credit/Debit Card</p>
                        <p className="method-desc">Visa, Mastercard, RuPay</p>
                      </div>
                    </label>
                  </div>

                  {/* Net Banking Option */}
                  <div
                    className={`payment-option-box ${paymentMethod === "NetBanking" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      id="netbanking-option"
                      name="payment"
                      value="NetBanking"
                      checked={paymentMethod === "NetBanking"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentSubMethod("NetBanking");
                      }}
                    />
                    <label
                      htmlFor="netbanking-option"
                      className="payment-label"
                    >
                      <FaBuilding className="icon bank" />
                      <div className="payment-details">
                        <p className="method-name">Net Banking</p>
                        <p className="method-desc">All major banks supported</p>
                      </div>
                    </label>
                  </div>

                  {/* Wallet Option */}
                  <div
                    className={`payment-option-box ${paymentMethod === "Wallet" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      id="wallet-option"
                      name="payment"
                      value="Wallet"
                      checked={paymentMethod === "Wallet"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentSubMethod("Wallet");
                      }}
                    />
                    <label htmlFor="wallet-option" className="payment-label">
                      <FaWallet className="icon wallet" />
                      <div className="payment-details">
                        <p className="method-name">Digital Wallet</p>
                        <p className="method-desc">
                          Paytm, PhonePe, Google Pay
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Cash on Delivery Option */}
                  <div
                    className={`payment-option-box ${paymentMethod === "CashOnDelivery" ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      id="cod-option"
                      name="payment"
                      value="CashOnDelivery"
                      checked={paymentMethod === "CashOnDelivery"}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentSubMethod("COD");
                      }}
                    />
                    <label htmlFor="cod-option" className="payment-label">
                      <FaMoneyBillWave className="icon cod" />
                      <div className="payment-details">
                        <p className="method-name">Cash on Delivery</p>
                        <p className="method-desc">
                          Pay when you receive your order
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <div className="checkout-sidebar">
              <div className="order-summary-card">
                <h3>Order Summary</h3>

                <div className="summary-products">
                  {cartItems.map((item) => (
                    <div className="summary-product" key={item._id}>
                      <img
                        src={item.image || item.productImage}
                        alt={item.name}
                        className="summary-product-img"
                      />

                      <div className="summary-product-info">
                        <h4>{item.name || item.productName}</h4>

                        <p>Qty: {item.quantity}</p>

                        <span>
                          ₹
                          {(
                            parseFloat(item.price) * item.quantity
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary-divider"></div>

                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{getTotalPrice().toFixed(2)}</span>
                </div>

                <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>₹{(getTotalPrice() * 0.18).toFixed(2)}</span>
                </div>

                <div className="summary-total">
                  <span>Total</span>
                  <span>₹{totalAmount.toFixed(2)}</span>
                </div>

                <button
                  className="btn btn-pay full-width"
                  onClick={handlePayment}
                  disabled={loading}
                >
                  {loading ? "Processing..." : `Proceed To Payment`}
                </button>

                <button className="btn btn-cancel full-width" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
