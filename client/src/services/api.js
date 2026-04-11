import axios from 'axios';

// Determine API base URL
// For production (Vercel frontend + Render backend): Use Render backend URL
// For development: use localhost backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.REACT_APP_API_URL || 'https://eirs-technology2-2.onrender.com')
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000');

console.log('🔗 API_BASE_URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout for production
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request:', config.method.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response successful:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const config = error.config;
    
    console.error('API Response error:', error.response?.status, error.message, error.config?.url);
    
    // Retry logic for network errors (max 2 retries)
    if (!config || !config.retry) {
      config.retry = 0;
    }
    
    // Retry on network errors or 5xx errors (but not 401)
    if (
      config.retry < 2 &&
      (error.code === 'ECONNABORTED' || 
       error.code === 'ERR_NETWORK' ||
       (error.response && error.response.status >= 500))
    ) {
      config.retry += 1;
      console.log(`🔄 Retrying request (${config.retry}/2)...`);
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retry));
      
      return api(config);
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  signup: async (formData) => {
    try {
      console.log('Signup request to:', API_BASE_URL + '/auth/signup');
      console.log('Form data:', formData);
      const response = await api.post('/auth/signup', formData);
      console.log('Signup response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signup network error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      const err = new Error(errorMessage);
      err.status = error.response?.status;
      throw err;
    }
  },

  signin: async (credentials) => {
    try {
      console.log('Signin request to:', API_BASE_URL + '/auth/signin');
      const response = await api.post('/auth/signin', credentials);
      console.log('Signin response:', response.data);
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', response.data.token);
        // Store in axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Signin network error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Sign in failed';
      const err = new Error(errorMessage);
      err.status = error.response?.status;
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUser: async () => {
    try {
      const response = await api.get('/auth/user');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  editUserProfile: async (id) => {
    try {
      const response = await api.get(`/auth/users/edit/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateUserProfile: async (id, formData) => {
    try {
      const response = await api.put(`/auth/users/edit/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  requestPasswordChangeOTP: async (email, purpose) => {
    try {
      const response = await api.post('/auth/request-otp', { email, purpose });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  verifyOTP: async (email, otp) => {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  resetPasswordWithOTP: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/reset-password-otp', { 
        email, 
        otp, 
        newPassword, 
        confirmPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  changePasswordWithOTP: async (email, otp, newPassword, confirmPassword) => {
    try {
      const response = await api.post('/auth/change-password-otp', { 
        email, 
        otp, 
        newPassword, 
        confirmPassword 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ── Phone OTP Popup ────────────────────────────────────────────
  sendPhoneOTP: async (phone) => {
    try {
      const response = await api.post('/auth/otp/send', { phone });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
  },

  verifyPhoneOTP: async (phone, otp) => {
    try {
      const response = await api.post('/auth/otp/verify', { phone, otp });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to verify OTP');
    }
  },

  completePhoneRegistration: async (tempToken, name, email, address) => {
    try {
      const response = await api.post('/auth/otp/register', { tempToken, name, email, address });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },

  // ── Twilio Phone OTP Login / Registration (now using Fast2SMS) ──────────────
  sendFast2SMSOTP: async (phone) => {
    try {
      const response = await api.post('/auth/phone-otp/send', { phone });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
  },

  verifyFast2SMSOTP: async (phone, code) => {
    try {
      const response = await api.post('/auth/phone-otp/verify', { phone, code });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'OTP verification failed');
    }
  },

  registerWithFast2SMSOTP: async ({ phoneToken, name, email, address }) => {
    try {
      const response = await api.post('/auth/phone-otp/register', { phoneToken, name, email, address });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  },
};

// Products Services
export const productService = {
  getAllProducts: async (page = 1, limit = 50, skipCache = false) => {
    const cacheKey = `products_cache_${page}_${limit}`;
    const cached = localStorage.getItem(cacheKey);
    const cacheTime = localStorage.getItem(cacheKey + '_time');
    const isDirty = localStorage.getItem('products_dirty') === 'true';
    
    try {
      // Use cache only if fresh, not forced-skip, and not marked dirty by a recent admin update
      if (!skipCache && !isDirty && cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 5 * 60 * 1000) {
        const parsed = JSON.parse(cached);
        const firstProduct = Array.isArray(parsed) ? parsed[0] : (parsed?.data?.[0]);
        if (firstProduct && !('discount' in firstProduct)) {
          console.log('🔄 Cache busted — discount field missing, fetching fresh data');
        } else {
          console.log('✅ Using cached products (client-side)');
          return parsed;
        }
      }
      
      console.log('🔄 Fetching products from server...');
      // Append a cache-buster when forcing fresh data so the browser's HTTP cache
      // does not return a stale response (browser caches by URL).
      const bustParam = (skipCache || isDirty) ? `&_t=${Date.now()}` : '';
      const response = await api.get(`/auth/products?page=${page}&limit=${limit}${bustParam}`, {
        // Products endpoint may take longer on slow servers, especially first load
        timeout: 45000, // 45 seconds (increased from 15 to handle slow servers/first load)
      });
      
      // Cache the response; only clear the dirty flag on normal (non-forced) fetches.
      // Admin's skipCache=true fetches must NOT clear dirty — the user-facing page
      // must still see isDirty=true so it bypasses any stale cache on its next load.
      try {
        localStorage.setItem(cacheKey, JSON.stringify(response.data));
        localStorage.setItem(cacheKey + '_time', Date.now().toString());
        if (!skipCache) {
          localStorage.removeItem('products_dirty'); // only a normal fetch marks data as fresh
        }
      } catch (storageError) {
        // Handle quota exceeded
        console.warn('LocalStorage quota exceeded, clearing old cache');
        localStorage.removeItem(`products_cache_${page}_${limit}`);
        localStorage.removeItem(`products_cache_${page}_${limit}_time`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Return cached data even if expired when network fails
      if (cached) {
        console.log('⚠️ Using stale cache due to network error');
        return JSON.parse(cached);
      }
      
      throw error.response?.data || error.message;
    }
  },

  // New method to clear product cache for fresh data
  clearProductCache: () => {
    try {
      // Clear all product cache keys regardless of page/limit
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('products_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      // Mark dirty so every page bypasses client cache on the very next fetch
      localStorage.setItem('products_dirty', 'true');
      console.log('✅ All product caches cleared and marked dirty');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },

  // Fetch products with fresh data (bypasses cache)
  getProductsFresh: async (page = 1, limit = 50) => {
    return productService.getAllProducts(page, limit, true);
  },

  getProductById: async (id) => {
    try {
      const response = await api.get(`/auth/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createProduct: async (formData) => {
    try {
      const response = await api.post('/auth/products/add', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateProduct: async (id, formData) => {
    try {
      const response = await api.put(`/auth/products/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/auth/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getFeaturedProducts: async () => {
    try {
      const response = await api.get('/auth/products/featured');
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  toggleFeatured: async (id) => {
    try {
      const response = await api.put(`/auth/products/${id}/featured`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getSubcategoriesByCategory: async (category) => {
    try {
      const response = await api.get(`/auth/subcategories/category/${category}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getProductsByCategory: async (category) => {
    try {
      const response = await api.get('/auth/products');
      // Handle both direct array and nested data structure
      let allProducts = Array.isArray(response.data) ? response.data : (response.data.data || response.data || []);
      // Filter products by category on the client side
      return allProducts.filter(product => product.category === category || product.mainCategory === category);
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      throw error.response?.data || error.message;
    }
  },
};

// Services (Company Services like Installation, AMC, etc.)
export const serviceService = {
  getAllServices: async () => {
    try {
      const response = await api.get('/auth/services');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAdminServices: async () => {
    try {
      const response = await api.get('/auth/services/admin');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addService: async (formData) => {
    try {
      const response = await api.post('/auth/services/add', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateService: async (id, formData) => {
    try {
      const response = await api.put(`/auth/services/update/${id}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteService: async (id) => {
    try {
      const response = await api.delete(`/auth/services/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/auth/service-bookings', bookingData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMyBookings: async () => {
    try {
      const response = await api.get('/auth/service-bookings/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllBookings: async () => {
    try {
      const response = await api.get('/auth/service-bookings/admin/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Contact Services
export const contactService = {
  submitContact: async (formData) => {
    try {
      const response = await api.post('/auth/contact', formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Location Service – save detected coordinates + address to MongoDB
export const locationService = {
  /**
   * Save the user's detected location to the backend.
   * @param {{ latitude: number, longitude: number, address: string }} payload
   */
  saveLocation: async (payload) => {
    try {
      const response = await api.post('/api/location', payload);
      return response.data;
    } catch (error) {
      // Non-critical – don't block the form; just propagate so LocationPicker
      // can show a subtle indicator
      throw error.response?.data || error.message;
    }
  },

  /**
   * Find locations within `radius` metres of the given coordinates.
   * @param {{ lat: number, lng: number, radius?: number }} params
   */
  getNearby: async ({ lat, lng, radius = 5000 }) => {
    try {
      const response = await api.get('/api/location/nearby', {
        params: { lat, lng, radius },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Admin Services
export const adminService = {
  getAllUsers: async () => {
    try {
      const response = await api.get('/auth/users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteUserById: async (id) => {
    try {
      const response = await api.delete(`/auth/users/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  promoteToAdmin: async (userId) => {
    try {
      const response = await api.post(`/auth/users/promote/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getContacts: async () => {
    try {
      const response = await api.get('/auth/contacts');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteContact: async (id) => {
    try {
      const response = await api.delete(`/auth/contacts/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

// Order Services
export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/auth/orders/create', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getUserOrders: async () => {
    try {
      const response = await api.get('/auth/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/auth/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await api.put(`/auth/orders/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getAllOrders: async () => {
    try {
      const response = await api.get('/auth/orders/admin/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/auth/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  cancelOrder: async (orderId, data) => {
    try {
      const response = await api.post(`/auth/orders/${orderId}/cancel`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  requestRefund: async (orderId, data) => {
    try {
      const response = await api.post(`/auth/orders/${orderId}/refund`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Admin Refund Management
  approveRefund: async (orderId, data) => {
    try {
      const response = await api.post(`/auth/refunds/${orderId}/approve`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  rejectRefund: async (orderId, data) => {
    try {
      const response = await api.post(`/auth/refunds/${orderId}/reject`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  processRefund: async (orderId) => {
    try {
      const response = await api.post(`/auth/refunds/${orderId}/process`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Review Services
export const reviewService = {
  addReview: async (reviewData) => {
    try {
      console.log('🚀 API Call: POST /auth/reviews/add');
      console.log('Data:', reviewData);
      const response = await api.post('/auth/reviews/add', reviewData);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in addReview:');
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Message:', error.message);
      throw error.response?.data || error;
    }
  },

  getProductReviews: async (productId) => {
    try {
      console.log('🚀 API Call: GET /auth/reviews/product/:' + productId);
      const response = await api.get(`/auth/reviews/product/${productId}`);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in getProductReviews:', error.message);
      throw error.response?.data || error;
    }
  },

  getUserProductReview: async (productId) => {
    try {
      console.log('🚀 API Call: GET /auth/reviews/product/:' + productId + '/user');
      const response = await api.get(`/auth/reviews/product/${productId}/user`);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in getUserProductReview:', error.message);
      throw error.response?.data || error;
    }
  },

  updateReview: async (reviewId, reviewData) => {
    try {
      console.log('🚀 API Call: PUT /auth/reviews/:' + reviewId);
      console.log('Data:', reviewData);
      const response = await api.put(`/auth/reviews/${reviewId}`, reviewData);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in updateReview:', error.message);
      throw error.response?.data || error;
    }
  },

  deleteReview: async (reviewId) => {
    try {
      console.log('🚀 API Call: DELETE /auth/reviews/:' + reviewId);
      const response = await api.delete(`/auth/reviews/${reviewId}`);
      console.log('✅ Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in deleteReview:', error.message);
      throw error.response?.data || error;
    }
  },
};

export default api;
