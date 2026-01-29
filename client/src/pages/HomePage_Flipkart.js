import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceService } from '../services/api';
import HeroCarousel from '../components/HeroCarousel';
import CategoryGrid from '../components/CategoryGrid';
import BrandCarousel from '../components/BrandCarousel';
import ProductCard from '../components/ProductCard';
import FeaturedSection from '../components/FeaturedSection';
import CategorySidebar from '../components/CategorySidebar';
import ServicesPopup from '../components/ServicesPopup';
import '../styles/HomePage_New.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchServices();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, selectedCategory, sortBy]);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      setServices(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Sample product data
      const sampleProducts = [
        {
          id: 1,
          name: 'Premium CCTV Camera HD 1080P',
          price: 4999,
          originalPrice: 7999,
          image: 'https://images.unsplash.com/photo-1589241160732-46d440549f80?w=400&h=400&fit=crop',
          rating: 5,
          inStock: true,
          discount: 37,
          category: 'Security Systems'
        },
        {
          id: 2,
          name: 'WiFi Router 5GHz Dual Band',
          price: 3499,
          originalPrice: 5999,
          image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b3f7?w=400&h=400&fit=crop',
          rating: 4.5,
          inStock: true,
          discount: 42,
          category: 'Networking'
        },
        {
          id: 3,
          name: 'Network Storage NAS 4TB',
          price: 12999,
          originalPrice: 18999,
          image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop',
          rating: 4.5,
          inStock: true,
          discount: 32,
          category: 'Storage Solutions'
        },
        {
          id: 4,
          name: 'Smart Door Lock Pro',
          price: 8999,
          originalPrice: 12999,
          image: 'https://images.unsplash.com/photo-1557821552-17105176677c?w=400&h=400&fit=crop',
          rating: 5,
          inStock: true,
          discount: 31,
          category: 'Access Control'
        },
        {
          id: 5,
          name: 'IoT Temperature Sensor',
          price: 2499,
          originalPrice: 4999,
          image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
          rating: 4,
          inStock: true,
          discount: 50,
          category: 'Sensors'
        },
        {
          id: 6,
          name: 'Network Switch 24 Port',
          price: 6999,
          originalPrice: 9999,
          image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=400&h=400&fit=crop',
          rating: 4.5,
          inStock: true,
          discount: 30,
          category: 'Networking'
        },
        {
          id: 7,
          name: 'Professional SSD 1TB NVMe',
          price: 7499,
          originalPrice: 11999,
          image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop',
          rating: 4.5,
          inStock: true,
          discount: 38,
          category: 'Storage Solutions'
        },
        {
          id: 8,
          name: 'Alarm System Kit 8 Zones',
          price: 14999,
          originalPrice: 21999,
          image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop',
          rating: 4.5,
          inStock: true,
          discount: 32,
          category: 'Alarm Systems'
        }
      ];
      setProducts(sampleProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by category if selected
    if (selectedCategory) {
      filtered = filtered.filter(
        product => 
          product.category?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          product.name?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Keep default order
        break;
    }

    setFilteredProducts(filtered);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handlePriceRangeChange = (range) => {
    // Price filter logic can be implemented here
    console.log('Price range selected:', range);
  };

  return (
    <div className="home-page">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Category Grid */}
      <div className="section-container">
        <CategoryGrid />
      </div>

      {/* Main Content with Sidebar */}
      <div className="main-content-container">
        <div className="container">
          {/* Sidebar */}
          <aside className="sidebar-container">
            <CategorySidebar 
              onCategorySelect={handleCategorySelect}
              onPriceRangeChange={handlePriceRangeChange}
            />
          </aside>

          {/* Main Products Section */}
          <main className="products-section">
            {/* Products Header with Sorting */}
            <div className="products-header">
              <div className="products-count">
                <h2>Products {selectedCategory && `- ${selectedCategory}`}</h2>
                <span className="count-badge">{filteredProducts.length} items</span>
              </div>
              <div className="sort-controls">
                <label htmlFor="sort">Sort by:</label>
                <select 
                  id="sort" 
                  className="sort-dropdown"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No products found. Try adjusting your filters.</p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Featured Section */}
      <FeaturedSection />

      {/* Brand Carousel */}
      <div className="section-container">
        <h2 className="section-title">Featured Brands</h2>
        <BrandCarousel />
      </div>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Secure Your Business?</h2>
          <p>Get expert consultation from our security solutions team</p>
          <Link to="/contact" className="cta-button-main">
            Schedule a Free Consultation
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
