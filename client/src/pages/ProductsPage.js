import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaFilter, FaChevronDown, FaShoppingCart, FaTimes } from 'react-icons/fa';
import { productService } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import CheckoutModal from '../components/CheckoutModal';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import Footer from '../components/Footer';
import '../styles/ProductsPage.css';

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const categoriesData = [
    {
      name: 'CCTV Cameras',
      subcategories: [
        'IP Camera Solutions',
        'HD Camera (Analog CCTV)',
        'CCTV Bundle Packs',
        'Wi-Fi / 4G Camera'
      ]
    },
    {
      name: 'CCTV Components',
      subcategories: [
        'NVR (Network Video Recorder)',
        'DVR (Digital Video Recorder)',
        'POE Switch',
        'SMPS (Power Supply)',
        'Hard Disk',
        'Cables & Accessories'
      ]
    },
    {
      name: 'Biometric Devices',
      subcategories: [
        'Fingerprint Biometric',
        'Face Recognition Biometric',
        'Card + Fingerprint Devices',
        'Time Attendance with Payroll Integration'
      ]
    },
    {
      name: 'Intercom System',
      subcategories: [
        'Landline Phones',
        'Intercom Devices',
        'EPABX System',
        'PBX System'
      ]
    },
    {
      name: 'Home & Office Security',
      subcategories: [
        'Video Door Phone (VDP/VPP)',
        'Smart Door Locks',
        'Access Control System',
        'Alarm Systems',
        'Motion Sensors'
      ]
    },
    {
      name: 'IoT Solutions',
      subcategories: [
        'Smart Sensors',
        'IoT Devices',
        'Connected Systems',
        'Wireless Modules'
      ]
    },
    {
      name: 'Automation Systems',
      subcategories: [
        'Smart Lighting',
        'Climate Control',
        'Access Control',
        'Integration Modules'
      ]
    },
    {
      name: 'Fire Alarm Systems',
      subcategories: [
        'Smoke Detectors',
        'Heat Detectors',
        'Manual Call Points',
        'Control Panels'
      ]
    }
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
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
      {/* Left Sidebar - Categories & Filters */}
      <div className={`left-sidebar-filters ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Categories & Filters</h3>
          <button className="close-sidebar-btn" onClick={closeSidebar}>
            <FaTimes />
          </button>
        </div>
        <CategorySidebar />
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <div className="container products-container">
        {/* Filters Section at Top */}
        <section className="filters-top-section">
          <div className="filters-header">
            <FaFilter /> <span>Filters</span>
          </div>

          <div className="filters-grid">
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
              Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <p>Loading products...</p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="admin-products-grid">
                {paginatedProducts.map(product => (
                  <ProductCard 
                    key={product._id} 
                    product={product}
                  />
                ))}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-controls">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    ← Previous
                  </button>
                  
                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
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
