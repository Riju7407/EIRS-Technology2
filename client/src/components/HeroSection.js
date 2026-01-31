import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const handleHeroClick = () => {
    window.location.href = '/products?category=CCTV Cameras';
  };

  const handleWirelessClick = () => {
    window.location.href = '/products?category=CCTV Components';
  };

  const handleIOTClick = () => {
    window.location.href = '/products?category=IOT Based Products';
  };

  const handleAutomationClick = () => {
    window.location.href = '/products?category=Automation Systems';
  };

  const handleBioClick = () => {
    window.location.href = '/products?category=Biometric Devices';
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <img 
          src="/IOT.webp" 
          alt="EIRS - IOT Based Solutions" 
          className="hero-image iot-image"
          onClick={handleIOTClick}
          style={{ cursor: 'pointer' }}
        />
        <img 
          src="/Bio.webp" 
          alt="EIRS - Biometric Devices" 
          className="hero-image bio-image"
          onClick={handleBioClick}
          style={{ cursor: 'pointer' }}
        />
        <img 
          src="/hero2.webp" 
          alt="EIRS - Enterprise Solutions" 
          className="hero-image hero-image-2"
          onClick={handleHeroClick}
          style={{ cursor: 'pointer' }}
        />
        <img 
          src="/Wireless.jpg" 
          alt="EIRS - Wireless Solutions" 
          className="hero-image wireless-image"
          onClick={handleWirelessClick}
          style={{ cursor: 'pointer' }}
        />
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          
          <div className="hero-buttons">
            <Link to="/products" className="hero-btn hero-btn-primary">
              Explore Solutions
            </Link>
            <Link to="/services" className="hero-btn hero-btn-secondary">
              Get Started Today
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
