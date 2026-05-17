import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FaTimes, FaSearch, FaSortAmountDown, FaTag, FaThLarge,
  FaChevronDown, FaFilter, FaBoxOpen
} from 'react-icons/fa';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import CheckoutModal from '../components/CheckoutModal';
import ProductCard from '../components/ProductCard';
import CategorySidebar from '../components/CategorySidebar';
import '../styles/ProductsPage.css';

const ITEMS_PER_PAGE = 15;

const CATEGORIES_DATA = [
  { name: 'CCTV Cameras', subcategories: ['IP Camera Solutions', 'HD Camera (Analog CCTV)', 'CCTV Bundle Packs', 'Wi-Fi / 4G Camera'] },
  { name: 'CCTV Components', subcategories: ['NVR (Network Video Recorder)', 'DVR (Digital Video Recorder)', 'POE Switch', 'SMPS (Power Supply)', 'Hard Disk', 'Cables & Accessories'] },
  { name: 'Biometric Devices', subcategories: ['Fingerprint Biometric', 'Face Recognition Biometric', 'Card + Fingerprint Devices', 'Time Attendance with Payroll Integration'] },
  { name: 'Intercom System', subcategories: ['Landline Phones', 'Intercom Devices', 'EPABX System', 'PBX System'] },
  { name: 'Home & Office Security', subcategories: ['Video Door Phone (VDP/VPP)', 'Smart Door Locks', 'Access Control System', 'Alarm Systems', 'Motion Sensors'] },
  { name: 'IoT Solutions', subcategories: ['Smart Sensors', 'IoT Devices', 'Connected Systems', 'Wireless Modules'] },
  { name: 'Automation Systems', subcategories: ['Smart Lighting', 'Climate Control', 'Access Control', 'Integration Modules'] },
  { name: 'Fire Alarm Systems', subcategories: ['Smoke Detectors', 'Heat Detectors', 'Manual Call Points', 'Control Panels'] },
  { name: 'Networking Device', subcategories: ['Routers', 'Switches', 'Access Points', 'Patch Panels', 'Network Cables & Accessories', 'Modems'] },
];

const SORT_OPTIONS = [
  { value: '', label: 'Relevance' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'top-rated', label: 'Top Rated' },
  { value: 'most-popular', label: 'Most Popular' },
];

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const c = searchParams.get('category');
    return c ? decodeURIComponent(c) : '';
  });
  const [selectedSubcategory, setSelectedSubcategory] = useState(() => {
    const s = searchParams.get('subcategory');
    return s ? decodeURIComponent(s) : '';
  });
  const [selectedSubmenu, setSelectedSubmenu] = useState(() => {
    const sm = searchParams.get('submenu');
    return sm ? decodeURIComponent(sm) : '';
  });
  const [selectedBrand, setSelectedBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [selectedSidebarCategories, setSelectedSidebarCategories] = useState(new Set());
  const [isFromSidebar] = useState(() => searchParams.get('fromSidebar') === 'true');

  const [openDropdown, setOpenDropdown] = useState(null);
  const [showPricePanel, setShowPricePanel] = useState(false);

  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [buyNowQuantity, setBuyNowQuantity] = useState(1);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productService.getAllProducts(1, 50);
      const arr = Array.isArray(data) ? data : (data.data || []);

      // If cache/network race returns an empty list, force one fresh fetch
      // before showing an empty catalog to users.
      if (arr.length === 0) {
        const fresh = await productService.getProductsFresh(1, 50);
        const freshArr = Array.isArray(fresh) ? fresh : (fresh.data || []);
        setProducts(freshArr);
        setFilteredProducts(freshArr);
      } else {
        setProducts(arr);
        setFilteredProducts(arr);
      }
    } catch {
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductsFresh = useCallback(async () => {
    try {
      const data = await productService.getProductsFresh(1, 50);
      const arr = Array.isArray(data) ? data : (data.data || []);
      setProducts(arr);
    } catch {}
  }, []);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProductsFresh, 5 * 60 * 1000);

    // Refresh when the tab becomes visible and an admin update dirtied the cache
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' &&
          localStorage.getItem('products_dirty') === 'true') {
        fetchProductsFresh();
      }
    };
    // Refresh when another tab sets the dirty flag
    const handleStorage = (e) => {
      if (e.key === 'products_dirty' && e.newValue === 'true') {
        fetchProductsFresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('storage', handleStorage);
    };
  }, [fetchProducts, fetchProductsFresh]);

  useEffect(() => {
    const searchQuery = searchParams.get('search');
    setSearchTerm(searchQuery ? decodeURIComponent(searchQuery) : '');

    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(decodeURIComponent(categoryFromUrl));
      const subcategoryFromUrl = searchParams.get('subcategory');
      setSelectedSubcategory(subcategoryFromUrl ? decodeURIComponent(subcategoryFromUrl) : '');

      const submenuFromUrl = searchParams.get('submenu');
      setSelectedSubmenu(submenuFromUrl ? decodeURIComponent(submenuFromUrl) : '');

      setSelectedBrand('');
      setSelectedSidebarCategories(new Set());
    } else {
      setSelectedCategory('');
      setSelectedSubcategory('');
      setSelectedSubmenu('');
    }
  }, [searchParams]);

  const filterProducts = useCallback(() => {
    try {
      let result = [...products];
      if (selectedSidebarCategories.size > 0)
        result = result.filter(p => p.category && selectedSidebarCategories.has(p.category));
      if (selectedCategory)
        result = result.filter(p => p.category && p.category.trim() === selectedCategory.trim());
      if (selectedSubcategory)
        result = result.filter(p => p.subcategory && p.subcategory.trim() === selectedSubcategory.trim());
      if (selectedSubmenu)
        result = result.filter(p => p.submenu && p.submenu.trim() === selectedSubmenu.trim());
      if (!isFromSidebar && selectedBrand)
        result = result.filter(p => p.brand && p.brand.trim() === selectedBrand.trim());
      if (!isFromSidebar && searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        result = result.filter(p =>
          (p.productName && p.productName.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q))
        );
      }
      if (minPrice || maxPrice) {
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        result = result.filter(p => { const price = parseFloat(p.price) || 0; return price >= min && price <= max; });
      }
      if (sortBy) {
        switch (sortBy) {
          case 'price-low-high': result.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0)); break;
          case 'price-high-low': result.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0)); break;
          case 'most-popular': result.sort((a, b) => { const d = (parseFloat(b.rating)||0)-(parseFloat(a.rating)||0); return d!==0?d:(b.reviewCount||0)-(a.reviewCount||0); }); break;
          case 'top-rated': result.sort((a, b) => (parseFloat(b.rating)||0)-(parseFloat(a.rating)||0)); break;
          default: break;
        }
      }
      setFilteredProducts(result);
      setCurrentPage(1);
    } catch { setFilteredProducts(products); }
  }, [products, searchTerm, selectedCategory, selectedSubcategory, selectedSubmenu, selectedBrand, selectedSidebarCategories, minPrice, maxPrice, sortBy, isFromSidebar]);

  useEffect(() => { filterProducts(); }, [filterProducts]);

  const uniqueBrands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))], [products]);
  const subcategories = useMemo(() => { const f = CATEGORIES_DATA.find(c => c.name === selectedCategory); return f ? f.subcategories : []; }, [selectedCategory]);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = useMemo(() => filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE), [filteredProducts, startIndex]);
  const activeFiltersCount = [selectedCategory, selectedSubcategory, selectedBrand, minPrice, maxPrice, sortBy].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm(''); setSelectedCategory(''); setSelectedSubcategory(''); setSelectedBrand('');
    setSelectedSubmenu('');
    setMinPrice(''); setMaxPrice(''); setSortBy(''); setSelectedSidebarCategories(new Set());
    setCurrentPage(1); setOpenDropdown(null); setShowPricePanel(false);
  };

  const handleSidebarCategorySelect = useCallback((categoryName) => {
    setSelectedSidebarCategories(prev => { const next = new Set(prev); next.has(categoryName) ? next.delete(categoryName) : next.add(categoryName); return next; });
    setCurrentPage(1);
  }, []);

  const toggleDropdown = (name) => { setOpenDropdown(prev => prev === name ? null : name); if (name !== 'price') setShowPricePanel(false); };
  const stopPropagation = (e) => e.stopPropagation();

  useEffect(() => {
    const handler = () => { setOpenDropdown(null); setShowPricePanel(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const activeChips = useMemo(() => {
    const chips = [];
    if (selectedCategory) chips.push({ label: selectedCategory, clear: () => { setSelectedCategory(''); setSelectedSubcategory(''); } });
    if (selectedSubcategory) chips.push({ label: selectedSubcategory, clear: () => setSelectedSubcategory('') });
    if (selectedBrand) chips.push({ label: selectedBrand, clear: () => setSelectedBrand('') });
    if (minPrice || maxPrice) chips.push({ label: `Rs.${minPrice||'0'} - Rs.${maxPrice||'max'}`, clear: () => { setMinPrice(''); setMaxPrice(''); } });
    if (sortBy) chips.push({ label: SORT_OPTIONS.find(o => o.value === sortBy)?.label, clear: () => setSortBy('') });
    return chips;
  }, [selectedCategory, selectedSubcategory, selectedBrand, minPrice, maxPrice, sortBy]);

  return (
    <main className="pp-page">
      <div className={`left-sidebar-filters ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Categories & Filters</h3>
          <button className="close-sidebar-btn" onClick={closeSidebar}><FaTimes /></button>
        </div>
        <CategorySidebar onCategorySelect={handleSidebarCategorySelect} />
      </div>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}

      <div className="pp-wrapper">

        {/* Page Header */}
        <div className="pp-page-header">
          <div className="pp-page-header-inner">
            <div className="pp-page-title-group">
              <FaThLarge className="pp-page-title-icon" />
              <div>
                <h1 className="pp-page-title">All Products</h1>
                <p className="pp-page-subtitle">Explore our complete security solutions catalog</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        {!isFromSidebar && (
          <div className="pp-filter-bar" onClick={stopPropagation}>
            <div className="pp-filter-bar-left">

              {/* Search */}
              <div className="pp-search-wrap">
                <FaSearch className="pp-search-icon" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pp-search-input"
                />
                {searchTerm && (
                  <button className="pp-search-clear" onClick={() => setSearchTerm('')}><FaTimes /></button>
                )}
              </div>

              {/* Category */}
              <div className="pp-dropdown-wrap" onClick={stopPropagation}>
                <button className={`pp-filter-btn ${selectedCategory ? 'pp-filter-btn--active' : ''}`} onClick={() => toggleDropdown('category')}>
                  <FaTag /> {selectedCategory || 'Category'} <FaChevronDown className={`pp-chevron ${openDropdown === 'category' ? 'pp-chevron--open' : ''}`} />
                </button>
                {openDropdown === 'category' && (
                  <div className="pp-dropdown-menu">
                    <div className="pp-dropdown-item" onClick={() => { setSelectedCategory(''); setSelectedSubcategory(''); setOpenDropdown(null); }}>All Categories</div>
                    {CATEGORIES_DATA.map(cat => (
                      <div key={cat.name} className={`pp-dropdown-item ${selectedCategory === cat.name ? 'pp-dropdown-item--active' : ''}`}
                        onClick={() => { setSelectedCategory(cat.name); setSelectedSubcategory(''); setOpenDropdown(null); }}>
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subcategory */}
              {selectedCategory && subcategories.length > 0 && (
                <div className="pp-dropdown-wrap" onClick={stopPropagation}>
                  <button className={`pp-filter-btn ${selectedSubcategory ? 'pp-filter-btn--active' : ''}`} onClick={() => toggleDropdown('subcategory')}>
                    {selectedSubcategory || 'Subcategory'} <FaChevronDown className={`pp-chevron ${openDropdown === 'subcategory' ? 'pp-chevron--open' : ''}`} />
                  </button>
                  {openDropdown === 'subcategory' && (
                    <div className="pp-dropdown-menu">
                      <div className="pp-dropdown-item" onClick={() => { setSelectedSubcategory(''); setOpenDropdown(null); }}>All Subcategories</div>
                      {subcategories.map(sub => (
                        <div key={sub} className={`pp-dropdown-item ${selectedSubcategory === sub ? 'pp-dropdown-item--active' : ''}`}
                          onClick={() => { setSelectedSubcategory(sub); setOpenDropdown(null); }}>{sub}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Brand */}
              {uniqueBrands.length > 0 && (
                <div className="pp-dropdown-wrap" onClick={stopPropagation}>
                  <button className={`pp-filter-btn ${selectedBrand ? 'pp-filter-btn--active' : ''}`} onClick={() => toggleDropdown('brand')}>
                    {selectedBrand || 'Brand'} <FaChevronDown className={`pp-chevron ${openDropdown === 'brand' ? 'pp-chevron--open' : ''}`} />
                  </button>
                  {openDropdown === 'brand' && (
                    <div className="pp-dropdown-menu">
                      <div className="pp-dropdown-item" onClick={() => { setSelectedBrand(''); setOpenDropdown(null); }}>All Brands</div>
                      {uniqueBrands.map(b => (
                        <div key={b} className={`pp-dropdown-item ${selectedBrand === b ? 'pp-dropdown-item--active' : ''}`}
                          onClick={() => { setSelectedBrand(b); setOpenDropdown(null); }}>{b}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Price */}
              <div className="pp-dropdown-wrap" onClick={stopPropagation}>
                <button className={`pp-filter-btn ${(minPrice || maxPrice) ? 'pp-filter-btn--active' : ''}`} onClick={() => setShowPricePanel(prev => !prev)}>
                  Price <FaChevronDown className={`pp-chevron ${showPricePanel ? 'pp-chevron--open' : ''}`} />
                </button>
                {showPricePanel && (
                  <div className="pp-price-panel">
                    <p className="pp-price-panel-title">Price Range (Rs.)</p>
                    <div className="pp-price-row">
                      <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="pp-price-input" min="0" />
                      <span className="pp-price-sep">to</span>
                      <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="pp-price-input" min="0" />
                    </div>
                    <button className="pp-price-apply-btn" onClick={() => setShowPricePanel(false)}>Apply</button>
                  </div>
                )}
              </div>
            </div>

            <div className="pp-filter-bar-right">
              {/* Sort */}
              <div className="pp-dropdown-wrap pp-sort-wrap" onClick={stopPropagation}>
                <button className={`pp-filter-btn pp-sort-btn ${sortBy ? 'pp-filter-btn--active' : ''}`} onClick={() => toggleDropdown('sort')}>
                  <FaSortAmountDown />
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort By'}
                  <FaChevronDown className={`pp-chevron ${openDropdown === 'sort' ? 'pp-chevron--open' : ''}`} />
                </button>
                {openDropdown === 'sort' && (
                  <div className="pp-dropdown-menu pp-dropdown-menu--right">
                    {SORT_OPTIONS.map(opt => (
                      <div key={opt.value} className={`pp-dropdown-item ${sortBy === opt.value ? 'pp-dropdown-item--active' : ''}`}
                        onClick={() => { setSortBy(opt.value); setOpenDropdown(null); }}>{opt.label}</div>
                    ))}
                  </div>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <button className="pp-clear-btn" onClick={clearFilters}>
                  <FaFilter /> Clear ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>
        )}

        {/* Active Chips */}
        {activeChips.length > 0 && (
          <div className="pp-chips-bar">
            <span className="pp-chips-label">Active:</span>
            {activeChips.map((chip, i) => (
              <span key={i} className="pp-chip">
                {chip.label}
                <button className="pp-chip-remove" onClick={chip.clear}><FaTimes /></button>
              </span>
            ))}
            <button className="pp-chips-clear-all" onClick={clearFilters}>Clear All</button>
          </div>
        )}

        {/* Products Grid */}
        <section className="pp-grid-section">
          <div className="pp-results-bar">
            <p className="pp-results-text">
              {loading ? 'Loading...' : (
                <>Showing <strong>{Math.min(startIndex + 1, filteredProducts.length)}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> products</>
              )}
            </p>
          </div>

          {loading ? (
            <div className="pp-loading">
              <div className="pp-spinner" />
              <p>Loading products...</p>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="pp-grid">
                {paginatedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="pp-pagination">
                  <button className="pp-page-nav" onClick={() => setCurrentPage(p => Math.max(p-1,1))} disabled={currentPage===1}>Prev</button>
                  <div className="pp-page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i+1).map(page => (
                      <button key={page} className={`pp-page-num ${currentPage===page ? 'pp-page-num--active':''}`} onClick={() => setCurrentPage(page)}>{page}</button>
                    ))}
                  </div>
                  <button className="pp-page-nav" onClick={() => setCurrentPage(p => Math.min(p+1,totalPages))} disabled={currentPage===totalPages}>Next</button>
                </div>
              )}
            </>
          ) : (
            <div className="pp-empty">
              <FaBoxOpen className="pp-empty-icon" />
              <h3>No products found</h3>
              <p>Try adjusting your filters or search term</p>
              <button className="pp-empty-btn" onClick={clearFilters}>Clear Filters</button>
            </div>
          )}
        </section>

        {user && selectedProduct && (
          <CheckoutModal
            isOpen={showCheckout}
            onClose={() => { setShowCheckout(false); setSelectedProduct(null); setBuyNowQuantity(1); }}
            cartItems={[{ ...selectedProduct, quantity: buyNowQuantity }]}
            totalAmount={parseFloat(selectedProduct.price || 0) * buyNowQuantity * 1.18}
            userId={user._id} userName={user.name} userEmail={user.email}
          />
        )}
      </div>
    </main>
  );
};

export default ProductsPage;
