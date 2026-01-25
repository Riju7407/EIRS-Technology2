import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTools, FaHeadset, FaClipboardList, FaAmbulance } from 'react-icons/fa';
import { serviceService } from '../services/api';
import ServiceModal from '../components/ServiceModal';
import '../styles/ServicesPage.css';

const ServicesPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [dbServices, setDbServices] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await serviceService.getAllServices();
      setDbServices(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      setDbServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  return (
    <>
      <main className="services-page">
        {/* Header */}
        <section className="services-header">
          <div className="container">
            <h1>Our Services</h1>
            <p>Comprehensive Solutions for Your Security Needs</p>
          </div>
        </section>

        {/* Main Services - What We Offer */}
        <section className="main-services-section">
          <div className="container">
            <h2>What We Offer</h2>
            {loading ? (
              <p className="loading">Loading services...</p>
            ) : dbServices.length > 0 ? (
              <div className="services-grid">
                {dbServices.map((service, index) => (
                  <div
                    key={index}
                    className="service-card"
                    onClick={() => handleServiceClick(service)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="service-icon-wrapper">
                      <FaTools size={50} />
                    </div>
                    <h3>{service.name}</h3>
                    <p>{service.description}</p>
                    <div className="service-card-price">₹{service.price?.toLocaleString() || 'Contact'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="services-grid">
                {mainServices.map((service, index) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={index}
                      className="service-card"
                      onClick={() => handleServiceClick(service)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="service-icon-wrapper">
                        <IconComponent size={50} />
                      </div>
                      <h3>{service.title}</h3>
                      <p>{service.description}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Service Features - Why Our Services Stand Out */}
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

        {/* Call to Action - Need a Custom Service Plan? */}
        <section className="cta-section">
          <div className="container">
            <h2>Need a Custom Service Plan?</h2>
            <p>Contact our team for a personalized consultation</p>
            <Link to="/contact" className="btn btn-primary btn-large">Schedule Consultation</Link>
          </div>
        </section>
      </main>

      {/* Service Modal */}
      <ServiceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedService?.title || 'Service Details'}
        message={selectedService?.description || ''}
      />
    </>
  );
};

export default ServicesPage;
