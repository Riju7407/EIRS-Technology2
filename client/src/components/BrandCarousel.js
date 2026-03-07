import React from 'react';
import '../styles/BrandCarousel.css';

const brands = [
  { name: 'CP Plus',    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049516/cp_plus_xgmoke.png' },
  { name: 'Dahua',     img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049612/dahua_ftbmkx.png' },
  { name: 'Hikvision', img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049649/hikvision_i8oipb.png' },
  { name: 'Beetel',    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049710/beelet_lxbfh3.png' },
  { name: 'Matrix',    img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049791/matrix_hg8ewh.png' },
  { name: 'Secureye',  img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049857/secureye_sdesva.png' },
  { name: 'ESSL',      img: 'https://res.cloudinary.com/dfitjwwws/image/upload/v1771049898/essl_yqrq00.png' },
];

// Duplicate list so the scroll looks seamless
const duplicated = [...brands, ...brands];

const BrandCarousel = () => (
  <section className="bc-section">
    <div className="bc-label">Our Trusted Brand Partners</div>
    <div className="bc-track-wrap">
      <div className="bc-fade bc-fade--left" />
      <div className="bc-fade bc-fade--right" />
      <div className="bc-track">
        {duplicated.map((brand, i) => (
          <div className="bc-item" key={i}>
            <img src={brand.img} alt={brand.name} loading="lazy" />
            <span className="bc-name">{brand.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BrandCarousel;

