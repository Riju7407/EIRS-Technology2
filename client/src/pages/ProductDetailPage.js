import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { productService } from '../services/api';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch product from backend API
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(id);
        setProduct(response || response.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="product-detail-page">
        <div className="loading-container">
          <p>Loading product details...</p>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-page">
        <div className="container">
          <div className="error-container">
            <p>{error || 'Product not found'}</p>
            <Link to="/products" className="btn btn-primary">Back to Products</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/products" className="breadcrumb-link">
            <FaArrowLeft /> Products
          </Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.productName}</span>
        </div>

        {/* Product Details */}
        <div className="product-detail-wrapper">
          {/* Image Section */}
          <section className="product-image-section">
            <div className="product-image-container">
              <img src={product.image} alt={product.productName} />
            </div>
            <div className="product-badges">
              <span className="badge">Premium Quality</span>
              <span className="badge">In Stock</span>
            </div>
          </section>

          {/* Info Section */}
          <section className="product-info-section">
            <h1 className="product-name">{product.productName}</h1>
            
            <div className="product-meta">
              <span className="category-badge">{product.category}</span>
              {product.brand && <span className="brand-info">Brand: {product.brand}</span>}
            </div>

            <p className="product-description">{product.description}</p>

            {/* Specifications */}
            <div className="specifications">
              <h3>Specifications</h3>
              <div className="specs-grid">
                {Object.entries(product.specifications || {}).map(([key, value]) => (
                  <div key={key} className="spec-item">
                    <dt>{key.replace(/([A-Z])/g, ' $1').trim()}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <Link to="/contact" className="btn btn-primary btn-large">
                Request a Quote
              </Link>
              <Link to="/contact" className="btn btn-secondary btn-large">
                Enquire Now
              </Link>
            </div>

            {/* Download Datasheet */}
            {product.datasheet && (
              <div className="datasheet-section">
                <a href={product.datasheet} target="_blank" rel="noopener noreferrer" className="datasheet-link">
                  📥 Download Datasheet
                </a>
              </div>
            )}
          </section>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>Related Products</h2>
            <div className="related-grid">
              {product.relatedProducts.map((related, index) => (
                <div key={index} className="related-card">
                  <img src="https://via.placeholder.com/200x200?text=Product" alt={related} />
                  <p>{related}</p>
                  <Link to="/products" className="view-link">View →</Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back Button */}
        <div className="back-button-container">
          <Link to="/products" className="btn btn-outline">
            ← Back to Products
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;
