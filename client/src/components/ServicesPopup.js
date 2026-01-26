import React, { useState, useEffect } from 'react';
import { FaTimes, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/ServicesPopup.css';

const ServicesPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in current session using sessionStorage
    const hasSeenPopup = sessionStorage.getItem('servicesPopupSeen');
    
    if (!hasSeenPopup) {
      // Show popup after 2 seconds to let page load
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Mark that user has seen this popup in current session
        sessionStorage.setItem('servicesPopupSeen', 'true');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const services = [
    {
      title: 'CCTV Installation',
      description: 'Professional camera installation and setup'
    },
    {
      title: 'Security Consultation',
      description: 'Expert security assessment and planning'
    },
    {
      title: 'Maintenance Support',
      description: 'Ongoing maintenance and technical support'
    },
    {
      title: 'Integration Services',
      description: 'System integration and automation'
    },
  ];

  return (
    <div className="services-popup-overlay" onClick={handleClose}>
      <div className="services-popup-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="popup-close-btn" onClick={handleClose}>
          <FaTimes />
        </button>

        {/* Header */}
        <div className="popup-header">
          <h2>Explore Our Services</h2>
          <p className="popup-subtitle">Register for specialized services tailored to your needs</p>
        </div>

        {/* Services Grid */}
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-icon">
                <FaCheckCircle />
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="popup-actions">
          <Link to="/contact" className="btn-register" onClick={handleClose}>
            Register for Services
          </Link>
          <button className="btn-later" onClick={handleClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPopup;
