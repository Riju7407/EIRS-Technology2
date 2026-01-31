import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/BrandCarousel.css';

const BrandCarousel = () => {
  const [startIndex, setStartIndex] = useState(0);

  const brands = [
    { name: 'CP Plus', img: '/cp plus.png' },
    { name: 'Dahua', img: '/dahua.png' },
    { name: 'Hikvision', img: '/hikvision.png' },
    { name: 'Beetel', img: '/beelet.png' },
    { name: 'Matrix', img: '/matrix.png' },
    { name: 'Crystal', img: '/crystal.png' },
    { name: 'Secureye', img: '/secureye.png' },
    { name: 'ESSL', img: '/essl.png' },
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
      <h2>Our Brand Partners</h2>
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
          {visibleBrands.map((brand, index) => (
            <div key={index} className="brand-item">
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
