import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaVideo, FaLightbulb, FaShieldAlt, FaFingerprint, FaPhone, FaRobot, FaFire, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { serviceService } from '../services/api';
import ServicesPopup from '../components/ServicesPopup';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentPartnerIndex, setCurrentPartnerIndex] = useState(0);

  const heroImages = [
    'https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1597933197618-b0f58a6d9046?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1526374965328-7f5ae4e8be11?w=1200&h=600&fit=crop',
  ];

  // All partners combined for carousel
  const allPartners = [
    { name: 'CP Plus', img: '/cp plus.png', category: 'CCTV & Surveillance' },
    { name: 'Dahua', img: '/dahua.png', category: 'CCTV & Surveillance' },
    { name: 'Hikvision', img: '/hikvision.png', category: 'CCTV & Surveillance' },
    { name: 'Beetel', img: '/beelet.png', category: 'CCTV & Surveillance' },
    { name: 'Matrix', img: '/matrix.png', category: 'Intercom & Access Control' },
    { name: 'Crystal', img: '/crystal.png', category: 'Intercom & Access Control' },
    { name: 'Secureye', img: '/secureye.png', category: 'Intercom & Access Control' },
    { name: 'ESSL', img: '/essl.png', category: 'Intercom & Access Control' },
    { name: 'Tenda', img: '/Tenda.png', category: 'Networking & Connectivity' },
    { name: 'D-Link', img: '/Dlink.png', category: 'Networking & Connectivity' },
    { name: 'TP-Link', img: '/Tplink.png', category: 'Networking & Connectivity' },
  ];

  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Auto-rotate partners every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPartnerIndex((prevIndex) => (prevIndex + 1) % allPartners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [allPartners.length]);

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

  const productCategories = [
    { id: 1, name: 'CCTV Cameras', icon: FaVideo, color: '#FF6B6B' },
    { id: 2, name: 'IoT Solutions', icon: FaLightbulb, color: '#4ECDC4' },
    { id: 3, name: 'Home & Office Security', icon: FaShieldAlt, color: '#45B7D1' },
    { id: 4, name: 'Biometric Devices', icon: FaFingerprint, color: '#FFA07A' },
    { id: 5, name: 'Intercom Systems', icon: FaPhone, color: '#98D8C8' },
    { id: 6, name: 'Automation Systems', icon: FaRobot, color: '#F7DC6F' },
    { id: 7, name: 'Fire Alarm Systems', icon: FaFire, color: '#EC7063' },
  ];

  const handleServiceCardClick = (serviceId) => {
    // Both logged-in and non-logged-in users redirect to contact page
    // Users need to contact for service inquiries
    navigate('/contact');
  };

  const handlePrevPartner = () => {
    setCurrentPartnerIndex((prevIndex) => (prevIndex - 1 + allPartners.length) % allPartners.length);
  };

  const handleNextPartner = () => {
    setCurrentPartnerIndex((prevIndex) => (prevIndex + 1) % allPartners.length);
  };

  return (
    <main className="homepage">
      {/* Hero Section */}
      <section className="hero-section" style={{backgroundImage: `url(${heroImages[currentImageIndex]})`}}>
        <div className="hero-overlay"></div>
        
        {/* Left Arrow */}
        <button 
          className="carousel-arrow left-arrow"
          onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex - 1 + heroImages.length) % heroImages.length)}
          aria-label="Previous slide"
        >
          <FaChevronLeft size={30} />
        </button>

        {/* Right Arrow */}
        <button 
          className="carousel-arrow right-arrow"
          onClick={() => setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length)}
          aria-label="Next slide"
        >
          <FaChevronRight size={30} />
        </button>
        
        <div className="hero-carousel-indicators">
          {heroImages.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Integrated Security & Automation Solutions</h1>
          <p className="hero-subtitle">Protecting Homes & Businesses with Smart Technology</p>
          <div className="hero-buttons">
            <Link to="/products" className="hero-btn hero-btn-secondary">Explore Products</Link>
            <Link to="/contact" className="hero-btn hero-btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>

      {/* Product Categories Section */}
      <section className="product-categories-section">
        <div className="container">
          <h2 className="section-title">Our Product Categories</h2>
          <p className="section-subtitle">Comprehensive Security & Automation Solutions</p>
          
          <div className="categories-grid">
            {productCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link to={`/products?category=${category.name}`} key={category.id} className="category-card">
                  <div className="category-icon" style={{ backgroundColor: category.color }}>
                    <IconComponent size={40} color="white" />
                  </div>
                  <h3>{category.name}</h3>
                  <p>View Products</p>
                  <span className="arrow">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="services-overview-section">
        <div className="container">
          <h2 className="section-title">Our Services</h2>
          <p className="section-subtitle">What We Offer - Comprehensive Solutions for Your Needs</p>
          
          <div className="services-grid">
            {loading ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p>Loading services...</p>
              </div>
            ) : services && services.length > 0 ? (
              services.map((service, index) => {
                // Service icons mapping
                const iconMap = {
                  'Installation & Setup': '📦',
                  'AMC & Maintenance': '🔧',
                  'Expert Consultation': '💡',
                  'Technical Support': '⚡',
                  'Training Programs': '📚'
                };
                
                const serviceIcon = iconMap[service.name] || '🎯';
                
                return (
                  <div 
                    key={service._id || index}
                    className="service-card"
                    onClick={() => navigate('/contact')}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="service-icon">{serviceIcon}</div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <div className="service-pricing">
                      <span className="price-label">Starting from</span>
                      <span className="price">
                        {service.price === 0 ? 'Free' : `₹${service.price.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="learn-more-link">Contact Us →</div>
                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                <p>No services available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-choose-us-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us</h2>
          
          <div className="why-grid">
            <div className="why-card">
              <h3>Industry Leaders</h3>
              <p>Trusted partners with Hikvision and Dahua for premium security solutions.</p>
            </div>
            <div className="why-card">
              <h3>Expert Team</h3>
              <p>Certified professionals with years of experience in security and automation.</p>
            </div>
            <div className="why-card">
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support for all your concerns and emergencies.</p>
            </div>
            <div className="why-card">
              <h3>Quality Assured</h3>
              <p>ISO certified processes ensuring highest quality standards in all our work.</p>
            </div>
          </div>

          <div className="partners-section-wrapper">
            <h2 className="partners-section-heading">🔗 Our Technology Partners</h2>
            
            <div className="partners-section">
            {/* Left Arrow */}
            <button 
              className="carousel-arrow left-arrow"
              onClick={handlePrevPartner}
              aria-label="Previous Partner"
            >
              <FaChevronLeft size={30} />
            </button>

            {/* Center Content */}
            <div className="partner-hero-content">
              <div className="partner-logo-large">
                <img 
                  src={allPartners[currentPartnerIndex].img} 
                  alt={allPartners[currentPartnerIndex].name}
                  key={currentPartnerIndex}
                  className="partner-hero-logo"
                />
              </div>
              
              <div className="partner-hero-info">
                <h2 className="partner-hero-title">{allPartners[currentPartnerIndex].name}</h2>
                <p className="partner-hero-category">{allPartners[currentPartnerIndex].category}</p>
                <div className="partner-counter">{currentPartnerIndex + 1} of {allPartners.length}</div>
              </div>
            </div>

            {/* Right Arrow */}
            <button 
              className="carousel-arrow right-arrow"
              onClick={handleNextPartner}
              aria-label="Next Partner"
            >
              <FaChevronRight size={30} />
            </button>

            {/* Bottom Navigation Dots */}
            <div className="hero-carousel-indicators partner-indicators">
              {allPartners.map((_, index) => (
                <button
                  key={index}
                  className={`carousel-dot ${index === currentPartnerIndex ? 'active' : ''}`}
                  onClick={() => setCurrentPartnerIndex(index)}
                  aria-label={`Partner ${index + 1}`}
                  title={allPartners[index].name}
                />
              ))}
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Popup - Shows only once */}
      <ServicesPopup />

    </main>
  );
};

export default HomePage;
