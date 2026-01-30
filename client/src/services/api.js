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
  (error) => {
    console.error('API Response error:', error.response?.status, error.message, error.config?.url);
    
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
};

// Products Services
export const productService = {
  getAllProducts: async () => {
    try {
      const response = await api.get('/auth/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
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
      return allProducts.filter(product => product.category === category);
    } catch (error) {
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
};

export default api;
