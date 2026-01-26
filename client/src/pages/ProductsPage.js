import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaChevronDown, FaShoppingCart } from 'react-icons/fa';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CheckoutModal from '../components/CheckoutModal';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSubcategoryDropdownOpen, setIsSubcategoryDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [cartMessage, setCartMessage] = useState('');
  const [cartMessageId, setCartMessageId] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);

  const categoriesData = [
    {
      name: 'CCTV Cameras',
      subcategories: ['Dome Cameras', 'Bullet Cameras', 'PTZ Cameras', 'Thermal Cameras', 'IP Cameras']
    },
    {
      name: 'IoT Solutions',
      subcategories: ['Smart Sensors', 'IoT Devices', 'Connected Systems', 'Wireless Modules']
    },
    {
      name: 'Home & Office Security',
      subcategories: ['Door Locks', 'Motion Detectors', 'Glass Break Sensors', 'Alarm Panels']
    },
    {
      name: 'Biometric Devices',
      subcategories: ['Fingerprint Systems', 'Facial Recognition', 'Iris Scanners', 'Hand Scanners']
    },
    {
      name: 'Intercom Systems',
      subcategories: ['Video Intercoms', 'Audio Intercoms', 'Door Phones', 'Master Stations']
    },
    {
      name: 'Automation Systems',
      subcategories: ['Smart Lighting', 'Climate Control', 'Access Control', 'Integration Modules']
    },
    {
      name: 'Fire Alarm Systems',
      subcategories: ['Smoke Detectors', 'Heat Detectors', 'Manual Call Points', 'Control Panels']
    },
  ];

  useEffect(() => {
    // Initialize search term from URL parameters
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setSearchTerm(decodeURIComponent(searchQuery));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchTerm, selectedCategory, selectedSubcategory, selectedBrand]);

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

      // Apply subcategory filter
      if (selectedSubcategory && selectedSubcategory.trim() !== '') {
        filtered = filtered.filter(p => 
          p.subcategory && p.subcategory.trim() === selectedSubcategory.trim()
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

  const getSubcategories = (category) => {
    const found = categoriesData.find(cat => cat.name === category);
    return found ? found.subcategories : [];
  };

  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      setCartMessage('Please login to add products to cart');
      setCartMessageId(product._id);
      setTimeout(() => {
        navigate('/signin');
      }, 1500);
      return;
    }
    
    addToCart(product, 1);
    setCartMessage(`${product.productName} added to cart!`);
    setCartMessageId(product._id);
    setTimeout(() => setCartMessage(''), 2000);
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please login first to proceed with purchase');
      navigate('/signin');
      return;
    }
    if (product.stock <= 0) {
      alert('Product is out of stock');
      return;
    }
    setSelectedProduct(product);
    setBuyNowQuantity(1);
    setShowCheckout(true);
  };

  const subcategories = getSubcategories(selectedCategory);

  return (
    <main className="products-page">
      <div className="container products-container">
        {/* Filters Section at Top */}
        <section className="filters-top-section">
          <div className="filters-header">
            <FaFilter /> <span>Filters</span>
          </div>

          <div className="filters-grid">
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

            {/* Category Dropdown */}
            <div className="filter-section">
            <label>Category</label>
            <div className="custom-dropdown">
              <button
                className="dropdown-button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                <span>{selectedCategory || 'Select Category'}</span>
                <FaChevronDown className={`chevron ${isCategoryDropdownOpen ? 'open' : ''}`} />
              </button>
              {isCategoryDropdownOpen && (
                <div className="dropdown-menu">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedCategory('');
                      setSelectedSubcategory('');
                      setIsCategoryDropdownOpen(false);
                    }}
                  >
                    All Categories
                  </div>
                  {categoriesData.map(cat => (
                    <div
                      key={cat.name}
                      className={`dropdown-item ${selectedCategory === cat.name ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSelectedSubcategory('');
                        setIsCategoryDropdownOpen(false);
                      }}
                    >
                      {cat.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            </div>

            {/* Subcategory Dropdown */}
            {selectedCategory && subcategories.length > 0 && (
              <div className="filter-section filter-subsection">
                <label>Subcategory</label>
                <div className="custom-dropdown">
                  <button
                    className="dropdown-button"
                    onClick={() => setIsSubcategoryDropdownOpen(!isSubcategoryDropdownOpen)}
                  >
                    <span>{selectedSubcategory || 'Select Subcategory'}</span>
                    <FaChevronDown className={`chevron ${isSubcategoryDropdownOpen ? 'open' : ''}`} />
                  </button>
                  {isSubcategoryDropdownOpen && (
                    <div className="dropdown-menu">
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedSubcategory('');
                          setIsSubcategoryDropdownOpen(false);
                        }}
                      >
                        All Subcategories
                      </div>
                      {subcategories.map(subcat => (
                        <div
                          key={subcat}
                          className={`dropdown-item ${selectedSubcategory === subcat ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedSubcategory(subcat);
                            setIsSubcategoryDropdownOpen(false);
                          }}
                        >
                          {subcat}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Brand Dropdown */}
            {uniqueBrands.length > 0 && (
              <div className="filter-section">
                <label>Brand</label>
                <div className="custom-dropdown">
                  <button
                    className="dropdown-button"
                    onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
                  >
                    <span>{selectedBrand || 'Select Brand'}</span>
                    <FaChevronDown className={`chevron ${isBrandDropdownOpen ? 'open' : ''}`} />
                  </button>
                  {isBrandDropdownOpen && (
                    <div className="dropdown-menu">
                      <div
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedBrand('');
                          setIsBrandDropdownOpen(false);
                        }}
                      >
                        All Brands
                      </div>
                      {uniqueBrands.map(brand => (
                        <div
                          key={brand}
                          className={`dropdown-item ${selectedBrand === brand ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedBrand(brand);
                            setIsBrandDropdownOpen(false);
                          }}
                        >
                          {brand}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

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
                <div key={product._id} className="product-card">
                  <div className="product-card-wrapper">
                    {/* Product Image */}
                    <div className="product-image-wrapper">
                      {product.image ? (
                        <img src={product.image} alt={product.productName} className="product-image" />
                      ) : (
                        <div className="placeholder-image">
                          <span>No Image</span>
                        </div>
                      )}
                      <div className="product-overlay">
                        <Link to={`/products/${product._id}`} className="overlay-btn">
                          View Details
                        </Link>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="product-details">
                      <div className="product-header">
                        <div className="header-left">
                          <h3 className="product-name">{product.productName}</h3>
                          {product.brand && (
                            <span className="product-brand-badge">{product.brand}</span>
                          )}
                        </div>
                        <div className="header-right">
                          <span className="product-price-header">₹{parseFloat(product.price || 0).toLocaleString()}</span>
                        </div>
                      </div>

                      <p className="product-category">{product.category}</p>
                      
                      {product.subcategory && (
                        <p className="product-subcategory">{product.subcategory}</p>
                      )}

                      <p className="product-description">
                        {product.description?.substring(0, 70)}...
                      </p>

                      {/* Stock Status */}
                      <div className="product-stock-info">
                        <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.stock > 0 ? `Stock: ${product.stock}` : 'Out of Stock'}
                        </span>
                      </div>

                      {/* Price */}
                      <div className="product-price-section" style={{ display: 'none' }}>
                        <span className="product-price">₹{parseFloat(product.price || 0).toLocaleString()}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="product-actions">
                        {user ? (
                          <>
                            <button
                              className="btn-buy-now"
                              onClick={(e) => handleBuyNow(e, product)}
                              disabled={product.stock <= 0}
                              title="Buy Now"
                            >
                              Buy Now
                            </button>
                            <button
                              className="btn-add-cart"
                              onClick={(e) => handleAddToCart(e, product)}
                              title="Add to Cart"
                            >
                              <FaShoppingCart /> Add to Cart
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="btn-buy-now"
                              onClick={() => navigate('/signin')}
                              title="Login to Buy"
                            >
                              Login to Buy
                            </button>
                            <Link to={`/products/${product._id}`} className="btn-details">
                              Details
                            </Link>
                          </>
                        )}
                      </div>

                      {/* Cart Feedback */}
                      {cartMessage && cartMessageId === product._id && (
                        <div className="cart-feedback">{cartMessage}</div>
                      )}
                    </div>
                  </div>
                </div>
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

        {/* Checkout Modal for Buy Now */}
        {user && selectedProduct && (
          <CheckoutModal
            isOpen={showCheckout}
            onClose={() => {
              setShowCheckout(false);
              setSelectedProduct(null);
              setBuyNowQuantity(1);
            }}
            cartItems={[{ ...selectedProduct, quantity: buyNowQuantity }]}
            totalAmount={parseFloat(selectedProduct.price || 0) * buyNowQuantity * 1.18}
            userId={user._id}
            userName={user.name}
            userEmail={user.email}
          />
        )}
      </div>
    </main>
  );
};

export default ProductsPage;
