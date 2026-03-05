import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add click handler at container level
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleContainerClick = (e) => {
      const card = e.target.closest('.hero-card');
      if (!card) return;

      const title = card.querySelector('.hero-card-title h3')?.textContent;
      console.log('🎯 Container click detected on card:', title);

      const cardIndex = Array.from(container.querySelectorAll('.hero-card')).indexOf(card);
      if (cardIndex >= 0 && heroCards[cardIndex]) {
        console.log('🔗 Executing navigation for:', heroCards[cardIndex].title);
        heroCards[cardIndex].onClick();
      }
    };

    container.addEventListener('click', handleContainerClick);
    return () => container.removeEventListener('click', handleContainerClick);
  }, []);

  const heroCards = [
    {
      image: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771048058/CCTVInstall_royhdq.png',
      title: 'CCTV Installation',
      onClick: () => {
        console.log('🔗 Navigating to contact');
        navigate('/contact');
      }
    },
    {
      image: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771048770/IntercomSystem_pyyuzj.png',
      title: 'Intercom System',
      onClick: () => {
        console.log('🔗 Navigating to products with category: Intercom System');
        navigate('/products?category=Intercom System');
      }
    },
    {
      image: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771048838/cctv_vivnwq.png',
      title: 'CCTV Cameras',
      onClick: () => {
        console.log('🔗 Navigating to products with category: CCTV Cameras');
        navigate('/products?category=CCTV Cameras');
      }
    },
    {
      image: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771048916/Biometric_oswe6i.png',
      title: 'Biometric Devices',
      onClick: () => {
        console.log('🔗 Navigating to products with category: Biometric Devices');
        navigate('/products?category=Biometric Devices');
      }
    },
    {
      image: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771048981/Smoke_yswt34.png',
      title: 'Fire Alarm Systems',
      onClick: () => {
        console.log('🔗 Navigating to products with category: Fire Alarm Systems');
        navigate('/products?category=Fire Alarm Systems');
      }
    },
    {
      image: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049038/Router_vd7b2c.png',
      title: 'Networking Devices',
      onClick: () => {
        console.log('🔗 Navigating to products with category: Networking Device');
        navigate('/products?category=Networking Device');
      }
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
      <div className="hero-cards-container" ref={containerRef}>
        {heroCards.map((card, index) => (
          <div
            key={index}
            className="hero-card"
            data-card-image={card.image}
            onClick={() => {
              console.log('✅ Click detected on:', card.title);
              card.onClick();
            }}
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
                loading="eager"
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
