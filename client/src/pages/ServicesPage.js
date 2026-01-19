import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaHeadset, FaClipboardList, FaAmbulance } from 'react-icons/fa';
import { serviceService } from '../services/api';
import '../styles/ServicesPage.css';

const ServicesPage = () => {
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

  const mainServices = [
    {
      icon: FaTools,
      title: 'Installation & Setup',
      description: 'Professional installation of all security and automation systems with minimal downtime and maximum efficiency.'
    },
    {
      icon: FaHeadset,
      title: '24/7 Technical Support',
      description: 'Round-the-clock customer support team ready to assist you with any questions or issues.'
    },
    {
      icon: FaClipboardList,
      title: 'Maintenance & Monitoring',
      description: 'Regular maintenance checks and system monitoring to ensure optimal performance of your security systems.'
    },
    {
      icon: FaAmbulance,
      title: 'Emergency Response',
      description: 'Rapid emergency response team to handle urgent security issues and system failures.'
    }
  ];

  return (
    <main className="services-page">
      {/* Header */}
      <section className="services-header">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive Solutions for Your Security Needs</p>
        </div>
      </section>

      {/* Main Services */}
      <section className="main-services-section">
        <div className="container">
          <h2>What We Offer</h2>
          <div className="services-grid">
            {mainServices.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <div key={index} className="service-card">
                  <div className="service-icon-wrapper">
                    <IconComponent size={50} />
                  </div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services from Backend */}
      <section className="additional-services-section">
        <div className="container">
          <h2>Additional Services</h2>
          {loading ? (
            <p className="loading">Loading services...</p>
          ) : services.length > 0 ? (
            <div className="additional-services-grid">
              {services.map((service) => (
                <div key={service._id} className="additional-service-card">
                  <h3>{service.serviceName}</h3>
                  <p>{service.description}</p>
                  {service.price && (
                    <p className="service-price">Starting from: ${service.price}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-services">No additional services available at this time.</p>
          )}
        </div>
      </section>

      {/* Service Features */}
      <section className="service-features-section">
        <div className="container">
          <h2>Why Our Services Stand Out</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>✓ Expert Technicians</h3>
              <p>Certified professionals with years of industry experience</p>
            </div>
            <div className="feature-item">
              <h3>✓ Quality Guaranteed</h3>
              <p>High standards of quality in every service we provide</p>
            </div>
            <div className="feature-item">
              <h3>✓ On-Time Service</h3>
              <p>We respect your time and always deliver on schedule</p>
            </div>
            <div className="feature-item">
              <h3>✓ Affordable Pricing</h3>
              <p>Competitive rates without compromising on quality</p>
            </div>
            <div className="feature-item">
              <h3>✓ Warranty Support</h3>
              <p>Comprehensive warranty coverage for all our services</p>
            </div>
            <div className="feature-item">
              <h3>✓ Custom Solutions</h3>
              <p>Tailored services designed for your specific requirements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <h2>Service Packages</h2>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Basic Package</h3>
              <p className="price">$299</p>
              <ul className="package-features">
                <li>Installation Service</li>
                <li>Basic Configuration</li>
                <li>1 Month Support</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">Get Started</Link>
            </div>
            <div className="pricing-card featured">
              <div className="badge">Most Popular</div>
              <h3>Professional Package</h3>
              <p className="price">$599</p>
              <ul className="package-features">
                <li>Full Installation</li>
                <li>Advanced Setup</li>
                <li>6 Months Support</li>
                <li>Monthly Monitoring</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">Get Started</Link>
            </div>
            <div className="pricing-card">
              <h3>Premium Package</h3>
              <p className="price">$999</p>
              <ul className="package-features">
                <li>Complete Setup</li>
                <li>Custom Configuration</li>
                <li>1 Year Support</li>
                <li>24/7 Monitoring</li>
                <li>Priority Service</li>
              </ul>
              <Link to="/contact" className="btn btn-primary">Get Started</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Need a Custom Service Plan?</h2>
          <p>Contact our team for a personalized consultation</p>
          <Link to="/contact" className="btn btn-primary btn-large">Schedule Consultation</Link>
        </div>
      </section>
    </main>
  );
};

export default ServicesPage;
