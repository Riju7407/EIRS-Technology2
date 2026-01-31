import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CategoryFilterContext = createContext();

export const useCategoryFilter = () => {
  const context = useContext(CategoryFilterContext);
  if (!context) {
    throw new Error('useCategoryFilter must be used within CategoryFilterProvider');
  }
  return context;
};

export const CategoryFilterProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = 'http://localhost:5000/api';

  // Fetch all dynamic data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, subcategoriesRes, filtersRes] = await Promise.all([
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/subcategories`),
        axios.get(`${API_BASE}/filters`)
      ]);

      setCategories(categoriesRes.data.data || []);
      setSubcategories(subcategoriesRes.data.data || []);
      setFilters(filtersRes.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching filter data:', err);
      setError(err.message);
      // Provide fallback empty data
      setCategories([]);
      setSubcategories([]);
      setFilters([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const refetchData = () => {
    fetchAllData();
  };

  return (
    <CategoryFilterContext.Provider
      value={{
        isSidebarOpen,
        setIsSidebarOpen,
        toggleSidebar,
        closeSidebar,
        openSidebar,
        categories,
        subcategories,
        filters,
        loading,
        error,
        refetchData
      }}
    >
      {children}
    </CategoryFilterContext.Provider>
  );
};

