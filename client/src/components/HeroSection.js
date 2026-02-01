import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroCards = [
    {
      image: '/CCTVInstall.png',
      title: 'CCTV Installation',
      onClick: () => navigate('/contact')
    },
    {
      image: '/IntercomSystem.png',
      title: 'Intercom System',
      onClick: () => navigate('/products?category=Intercom System')
    },
    {
      image: '/cctv.png',
      title: 'CCTV Cameras',
      onClick: () => navigate('/products?category=CCTV Cameras')
    },
    {
      image: '/Biometric.png',
      title: 'Biometric Devices',
      onClick: () => navigate('/products?category=Biometric Devices')
    },
    {
      image: '/Smoke.png',
      title: 'Fire Alarm Systems',
      onClick: () => navigate('/products?category=Fire Alarm Systems')
    },
    {
      image: '/Router.png',
      title: 'CCTV Components',
      onClick: () => navigate('/products?category=CCTV Components')
    }
  ];

  // Handle touch events for better mobile experience
  const handleTouchStart = (e) => {
    e.currentTarget.style.opacity = '0.9';
  };

  const handleTouchEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  return (
    <section className="hero-section">
      <div className="hero-cards-container">
        {heroCards.map((card, index) => (
          <div
            key={index}
            className="hero-card"
            onClick={card.onClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                card.onClick();
              }
            }}
          >
            <div className="hero-card-image-wrapper">
              <img 
                src={card.image} 
                alt={card.title}
                className="hero-card-image"
                loading="lazy"
              />
              <div className="hero-card-overlay"></div>
            </div>
            <div className="hero-card-title">
              <h3>{card.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
