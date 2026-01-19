import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaLightbulb, FaShieldAlt, FaFingerprint, FaPhone, FaRobot, FaFire } from 'react-icons/fa';
import { productService, serviceService } from '../services/api';
import '../styles/HomePage.css';

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

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

  return (
    <main className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Integrated Security & Automation Solutions</h1>
          <p className="hero-subtitle">Protecting Homes & Businesses with Smart Technology</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Explore Products</Link>
            <Link to="/contact" className="btn btn-secondary">Contact Us</Link>
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
          <p className="section-subtitle">Expert Solutions for All Your Needs</p>
          
          {loading ? (
            <p className="loading">Loading services...</p>
          ) : services.length > 0 ? (
            <div className="services-grid">
              {services.map((service) => (
                <div key={service._id} className="service-card">
                  <div className="service-icon">
                    <FaShieldAlt size={40} />
                  </div>
                  <h3>{service.serviceName}</h3>
                  <p>{service.description}</p>
                  <Link to="/contact" className="learn-more-link">Learn More →</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="default-services">
              <div className="service-card">
                <div className="service-icon">
                  <FaRobot size={40} />
                </div>
                <h3>Installation</h3>
                <p>Professional installation of all security and automation systems with minimal downtime.</p>
                <Link to="/contact" className="learn-more-link">Learn More →</Link>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <FaShieldAlt size={40} />
                </div>
                <h3>AMC & Maintenance</h3>
                <p>Annual Maintenance Contracts to keep your systems running smoothly and securely.</p>
                <Link to="/contact" className="learn-more-link">Learn More →</Link>
              </div>
              <div className="service-card">
                <div className="service-icon">
                  <FaLightbulb size={40} />
                </div>
                <h3>Consultation</h3>
                <p>Expert consultation to design customized solutions for your specific requirements.</p>
                <Link to="/contact" className="learn-more-link">Learn More →</Link>
              </div>
            </div>
          )}
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

          <div className="partners-section">
            <h3>Our Partners</h3>
            <div className="partners-logos">
              <div className="partner-logo">
                <img src="https://via.placeholder.com/150x80?text=Hikvision" alt="Hikvision" />
              </div>
              <div className="partner-logo">
                <img src="https://via.placeholder.com/150x80?text=Dahua" alt="Dahua" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Secure Your Space?</h2>
          <p>Get a free consultation from our experts today</p>
          <Link to="/contact" className="btn btn-large">Get a Quote Today</Link>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
