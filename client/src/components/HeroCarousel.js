import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/HeroCarousel.css';

const HeroCarousel = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Enterprise Security Solutions",
      subtitle: "Advanced CCTV Systems & Surveillance Technology for Your Business",
      image: "https://images.unsplash.com/photo-1589241160732-46d440549f80?w=1200&h=600&fit=crop&q=80",
      cta: "Shop CCTV Systems",
      ctaLink: "/products",
      badge: "Up to 50% OFF"
    },
    {
      id: 2,
      title: "Smart Biometric Access Control",
      subtitle: "Modern Identity Verification & Employee Time Tracking Solutions",
      image: "https://images.unsplash.com/photo-1487014679447-9f8336041d48?w=1200&h=600&fit=crop&q=80",
      cta: "Explore Biometrics",
      ctaLink: "/products",
      badge: "NEW ARRIVALS"
    },
    {
      id: 3,
      title: "Complete IoT Automation",
      subtitle: "Smart Home & Office Integration with Cloud-Based Control",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop&q=80",
      cta: "View Solutions",
      ctaLink: "/products",
      badge: "PREMIUM QUALITY"
    }
  ];

  const currentSlide = slides[activeSlide];

  const goToSlide = (index) => {
    setActiveSlide(index);
  };

  const goToNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="hero-carousel">
      {/* Slide Container */}
      <div className="carousel-slides-wrapper">
        <div 
          className="carousel-slides"
          style={{ 
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${currentSlide.image}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Badge */}
          {currentSlide.badge && (
            <div className="slide-badge">
              {currentSlide.badge}
            </div>
          )}

          {/* Content Overlay */}
          <div className="slide-content">
            <div className="slide-text-container">
              <h2 className="slide-title">{currentSlide.title}</h2>
              <p className="slide-subtitle">{currentSlide.subtitle}</p>
              <Link to={currentSlide.ctaLink} className="slide-cta-btn">
                {currentSlide.cta} →
              </Link>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button className="carousel-nav-btn carousel-nav-prev" onClick={goToPrev} title="Previous">
            ❮
          </button>
          <button className="carousel-nav-btn carousel-nav-next" onClick={goToNext} title="Next">
            ❯
          </button>
        </div>
      </div>

      {/* Indicators/Dots */}
      <div className="carousel-indicators">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            className={`indicator-dot ${index === activeSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            title={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
