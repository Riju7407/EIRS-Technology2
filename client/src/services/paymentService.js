import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

const paymentApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
paymentApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const paymentService = {
  // Create Razorpay order
  createOrder: async (orderData) => {
    try {
      const response = await paymentApi.post('/payment/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Verify payment
  verifyPayment: async (paymentData) => {
    try {
      const response = await paymentApi.post('/payment/verify-payment', paymentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get payment history
  getPaymentHistory: async () => {
    try {
      const response = await paymentApi.get('/payment/payment-history');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get order details
  getOrder: async (orderId) => {
    try {
      const response = await paymentApi.get(`/payment/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Handle direct payment (for buy now)
  buyNow: async (productId, quantity = 1) => {
    try {
      const response = await paymentApi.post('/payment/buy-now', { productId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Load Razorpay script
  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      // Check if Razorpay is already loaded
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }

      // Check if script already exists
      if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
        console.log('Razorpay script tag exists, waiting for load');
        const checkInterval = setInterval(() => {
          if (window.Razorpay) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, 5000);
        return;
      }

      // Load the script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        resolve(false);
      };
      
      document.body.appendChild(script);
    });
  },
};

export default paymentService;
