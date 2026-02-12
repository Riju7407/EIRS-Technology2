import React from 'react';
import '../styles/FeaturedSection.css';

const FeaturedSection = ({ title, description, products }) => {
  return (
    <section className="featured-section">
      <div className="container">
        <div className="featured-header">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div className="featured-grid">
          {products && products.map((product) => (
            <div key={product.id || product.name} className="featured-item">
              <div className="featured-image">
                <img src={product.image} alt={product.name} />
              </div>
              <h3>{product.name}</h3>
              <p className="featured-desc">{product.description}</p>
              <a href={product.link} className="featured-link">
                View Details →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
