import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/BrandCarousel.css';

const BrandCarousel = () => {
  const [startIndex, setStartIndex] = useState(0);

  const brands = [
    { name: 'CP Plus', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049516/cp_plus_xgmoke.png' },
    { name: 'Dahua', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049612/dahua_ftbmkx.png' },
    { name: 'Hikvision', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049649/hikvision_i8oipb.png' },
    { name: 'Beetel', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049710/beelet_lxbfh3.png' },
    { name: 'Matrix', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049791/matrix_hg8ewh.png' },
    // { name: 'Crystal', img: '/crystal.png' },
    { name: 'Secureye', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049857/secureye_sdesva.png' },
    { name: 'ESSL', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049898/essl_yqrq00.png' },
  ];

  const itemsPerView = 4;
  const maxIndex = Math.max(0, brands.length - itemsPerView);

  // Auto-scroll animation
  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prevIndex) => {
        if (prevIndex >= maxIndex) {
          return 0;
        }
        return prevIndex + 1;
      });
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [maxIndex]);

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleNext = () => {
    if (startIndex < maxIndex) {
      setStartIndex(startIndex + 1);
    }
  };

  const visibleBrands = brands.slice(startIndex, startIndex + itemsPerView);

  return (
    <section className="brand-carousel-section">
      <h2>Our Trusted Brand Partners</h2>
      <div className="brand-carousel">
        <button 
          className="carousel-nav prev" 
          onClick={handlePrev}
          disabled={startIndex === 0}
          style={{ opacity: startIndex === 0 ? 0.5 : 1 }}
        >
          <FaChevronLeft />
        </button>

        <div className="brands-wrapper animated-scroll">
          {visibleBrands.map((brand) => (
            <div key={brand.name} className="brand-item">
              <img src={brand.img} alt={brand.name} />
            </div>
          ))}
        </div>

        <button 
          className="carousel-nav next" 
          onClick={handleNext}
          disabled={startIndex >= maxIndex}
          style={{ opacity: startIndex >= maxIndex ? 0.5 : 1 }}
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
};

export default BrandCarousel;
