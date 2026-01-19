import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { productService } from '../services/api';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState('');

  const categories = [
    'CCTV Cameras',
    'IoT Solutions',
    'Home & Office Security',
    'Biometric Devices',
    'Intercom Systems',
    'Automation Systems',
    'Fire Alarm Systems',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedBrand]);

  const fetchProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      const productsArray = Array.isArray(data) ? data : data.data || [];
      setProducts(productsArray);
      setFilteredProducts(productsArray); // Initialize filtered products
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    try {
      let filtered = Array.isArray(products) ? [...products] : [];

      // Apply category filter
      if (selectedCategory && selectedCategory.trim() !== '') {
        filtered = filtered.filter(p => 
          p.category && p.category.trim() === selectedCategory.trim()
        );
      }

      // Apply brand filter
      if (selectedBrand && selectedBrand.trim() !== '') {
        filtered = filtered.filter(p => 
          p.brand && p.brand.trim() === selectedBrand.trim()
        );
      }

      // Apply search term filter
      if (searchTerm && searchTerm.trim() !== '') {
        const lowerSearchTerm = searchTerm.toLowerCase().trim();
        filtered = filtered.filter(p =>
          (p.productName && p.productName.toLowerCase().includes(lowerSearchTerm)) ||
          (p.description && p.description.toLowerCase().includes(lowerSearchTerm)) ||
          (p.brand && p.brand.toLowerCase().includes(lowerSearchTerm)) ||
          (p.category && p.category.toLowerCase().includes(lowerSearchTerm))
        );
      }

      setFilteredProducts(filtered);
    } catch (error) {
      console.error('Error filtering products:', error);
      setFilteredProducts(products);
    }
  };

  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
  };

  return (
    <main className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Browse our comprehensive range of security and automation solutions</p>
      </div>

      <div className="container products-container">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <FaFilter /> <span>Filters</span>
          </div>

          {/* Search */}
          <div className="filter-section">
            <label>Search Products</label>
            <div className="search-box">
              <FaSearch />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <label>Category</label>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="radio"
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <span>All Categories</span>
              </label>
              {categories.map(cat => (
                <label key={cat} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={selectedCategory === cat}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          {uniqueBrands.length > 0 && (
            <div className="filter-section">
              <label>Brand</label>
              <div className="filter-options">
                <label className="filter-option">
                  <input
                    type="radio"
                    name="brand"
                    value=""
                    checked={selectedBrand === ''}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                  />
                  <span>All Brands</span>
                </label>
                {uniqueBrands.map(brand => (
                  <label key={brand} className="filter-option">
                    <input
                      type="radio"
                      name="brand"
                      value={brand}
                      checked={selectedBrand === brand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="clear-filters-btn" onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        {/* Products Grid */}
        <section className="products-grid-section">
          <div className="results-header">
            <p className="results-count">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Loading products...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <Link
                  to={`/products/${product._id}`}
                  key={product._id}
                  className="product-card"
                >
                  <div className="product-image">
                    {product.image ? (
                      <img src={product.image} alt={product.productName} />
                    ) : (
                      <div className="placeholder-image">
                        <span>No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.productName}</h3>
                    <p className="product-category">{product.category}</p>
                    {product.brand && <p className="product-brand">Brand: {product.brand}</p>}
                    <p className="product-description">{product.description?.substring(0, 80)}...</p>
                    <div className="product-footer">
                      <span className="view-details">View Details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear Filters and Try Again
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProductsPage;
