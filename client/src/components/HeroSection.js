import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-images-container">
          <img src="/heo1.jpg" alt="EIRS - Security Solutions" className="hero-image hero-image-1" />
          <img src="/hero2.jpg" alt="EIRS - Enterprise Solutions" className="hero-image hero-image-2" />
        </div>
        <div className="hero-overlay"></div>
      </div>
      
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">Smart Security, Connected Living</h1>
          <p className="hero-subtitle">Next-Generation Protection for Your Home & Business</p>
          
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
