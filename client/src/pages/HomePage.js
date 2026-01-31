import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { serviceService, productService } from '../services/api';
import HeroSection from '../components/HeroSection';
import BrandCarousel from '../components/BrandCarousel';
import ProductCard from '../components/ProductCard';
import FeaturedSection from '../components/FeaturedSection';
import CategorySidebar from '../components/CategorySidebar';
import ServicesPopup from '../components/ServicesPopup';
import WhatsAppButton from '../components/WhatsAppButton';
import InstagramButton from '../components/InstagramButton';
import FacebookButton from '../components/FacebookButton';
import Footer from '../components/Footer';
import { useCategoryFilter } from '../context/CategoryFilterContext';
import '../styles/HomePage_New.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedIPCameraResolutions, setSelectedIPCameraResolutions] = useState(new Set());
  const [selectedNVRChannels, setSelectedNVRChannels] = useState(new Set());
  const [selectedPOESwitches, setSelectedPOESwitches] = useState(new Set());
  const [sortBy, setSortBy] = useState('newest');
  const { isSidebarOpen, closeSidebar } = useCategoryFilter();

  useEffect(() => {
    fetchServices();
    fetchAdminProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, selectedCategories, selectedPrice, selectedIPCameraResolutions, selectedNVRChannels, selectedPOESwitches, sortBy]);

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

  const fetchAdminProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      // Ensure data is an array
      const productArray = Array.isArray(data) ? data : data.data || [];
      setProducts(productArray);
    } catch (error) {
      console.error('Error fetching admin products:', error);
      setProducts([]);
    }
  };

  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Filter by category if selected
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(product => {
        return Array.from(selectedCategories).some(category =>
          product.category?.toLowerCase().includes(category.toLowerCase()) ||
          product.subcategory?.toLowerCase().includes(category.toLowerCase()) ||
          product.name?.toLowerCase().includes(category.toLowerCase())
        );
      });
    }

    // Filter by price range
    if (selectedPrice !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        switch (selectedPrice) {
          case '0-5000':
            return price >= 0 && price <= 5000;
          case '5000-10000':
            return price > 5000 && price <= 10000;
          case '10000-25000':
            return price > 10000 && price <= 25000;
          case '25000-50000':
            return price > 25000 && price <= 50000;
          case '50000-100000':
            return price > 50000 && price <= 100000;
          case '100000+':
            return price > 100000;
          default:
            return true;
        }
      });
    }

    // Filter by IP Camera Resolution
    if (selectedIPCameraResolutions.size > 0) {
      filtered = filtered.filter(product =>
        Array.from(selectedIPCameraResolutions).includes(product.cameraResolution)
      );
    }

    // Filter by NVR Channels
    if (selectedNVRChannels.size > 0) {
      filtered = filtered.filter(product =>
        Array.from(selectedNVRChannels).includes(product.nvrChannels)
      );
    }

    // Filter by POE Switch
    if (selectedPOESwitches.size > 0) {
      filtered = filtered.filter(product =>
        Array.from(selectedPOESwitches).includes(product.poeSwitch)
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
  }, [products, selectedCategories, selectedPrice, selectedIPCameraResolutions, selectedNVRChannels, selectedPOESwitches, sortBy]);

  const handleCategorySelect = (category) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const handlePriceRangeChange = (range) => {
    setSelectedPrice(range);
  };

  const handleIPCameraResolutionChange = (resolutions) => {
    setSelectedIPCameraResolutions(resolutions);
  };

  const handleNVRChannelChange = (channels) => {
    setSelectedNVRChannels(channels);
  };

  const handlePOESwitchChange = (switches) => {
    setSelectedPOESwitches(switches);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroSection />

      {/* Hero Carousel with Left Sidebar */}
      <div className="hero-section-wrapper">
        {/* Left Sidebar - Categories & Filters */}
        <div className={`left-sidebar-filters ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3>Categories & Filters</h3>
            <button 
              className="close-sidebar-btn"
              onClick={closeSidebar}
            >
              ✕
            </button>
          </div>
          <CategorySidebar 
            onCategorySelect={handleCategorySelect}
            onPriceRangeChange={handlePriceRangeChange}
            onIPCameraResolutionChange={handleIPCameraResolutionChange}
            onNVRChannelChange={handleNVRChannelChange}
            onPOESwitchChange={handlePOESwitchChange}
          />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={closeSidebar}
          ></div>
        )}
      </div>

      {/* Admin Created Products Section */}
      <section className="admin-products-section">
        <div className="container">
          <div className="section-title-center">
            <h2>Our Best Selling Products</h2>
          </div>
          <div className="admin-products-grid">
            {filteredProducts.slice(0, 8).length > 0 ? (
              filteredProducts.slice(0, 8).map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))
            ) : (
              <div className="no-products-message">
                <p>No products available at the moment. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="what-we-offer-section">
        <div className="container">
          <div className="section-title-center">
            <h2>What We Offer</h2>
            <p>Comprehensive Security & Automation Solutions</p>
          </div>
          
          <div className="services-text-container">
            {/* Installation & Setup */}
            <div className="service-text-item">
              <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=200&fit=crop" alt="Installation & Setup" className="service-image" />
              <h3>Installation & Setup</h3>
              <p>Professional installation and configuration of security systems, cameras, and automation equipment at your premises with minimal downtime.</p>
            </div>

            {/* AMC & Maintenance */}
            <div className="service-text-item">
              <img src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=300&h=200&fit=crop" alt="AMC & Maintenance" className="service-image" />
              <h3>AMC & Maintenance</h3>
              <p>Annual Maintenance Contracts with regular inspections, preventive maintenance, and emergency support to ensure optimal system performance.</p>
            </div>

            {/* Expert Consultation */}
            <div className="service-text-item">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop" alt="Expert Consultation" className="service-image" />
              <h3>Expert Consultation</h3>
              <p>Free consultation with our security experts to assess your needs, recommend optimal solutions, and create a customized security plan.</p>
            </div>

            {/* Technical Support */}
            <div className="service-text-item">
              <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=300&h=200&fit=crop" alt="Technical Support" className="service-image" />
              <h3>Technical Support</h3>
              <p>24/7 technical support with remote assistance, on-site troubleshooting, and quick resolution for all your security system issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <FeaturedSection />

      {/* Who We Are Section */}
      <section className="who-we-are-section">
        <div className="container">
          <h2>Who We Are</h2>
          <p className="who-we-are-text">
            With years of hands-on industry expertise, we have built a strong reputation as a reliable and technology-driven partner, offering end-to-end solutions tailored to modern security and connectivity needs. EIRS Technology is a leading provider of integrated security and automation solutions for businesses and individuals. With over 15 years of proven expertise, we deliver cutting-edge security systems tailored to meet unique challenges and opportunities in today's digital world.
          </p>
        </div>
      </section>

      {/* Brand Carousel */}
      <div className="section-container">
        <BrandCarousel />
      </div>

      {/* Footer */}
      <Footer />

      {/* Services Popup */}
      <ServicesPopup />

      {/* WhatsApp Button */}
      <WhatsAppButton />

      {/* Instagram Button */}
      <InstagramButton />

      {/* Facebook Button */}
      <FacebookButton />
    </div>
  );
};

export default HomePage;
