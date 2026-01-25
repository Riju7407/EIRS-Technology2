import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import { productService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckoutModal from '../components/CheckoutModal';
import '../styles/ProductDetailPage.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

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

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      alert(`${quantity} item(s) added to cart!`);
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      alert('Please login first to proceed with purchase');
      return;
    }
    if (product && product.stock > 0) {
      addToCart(product, quantity);
      setShowCheckout(true);
    }
  };

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

            {/* Price and Stock Section */}
            <div className="price-stock-section">
              <div className="price-info">
                <span className="price-label">Price:</span>
                <span className="price-value">₹{parseFloat(product.price || 0).toLocaleString()}</span>
              </div>
              <div className="stock-info">
                <span className="stock-label">Stock:</span>
                <span className={`stock-value ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                  {product.stock > 0 ? `${product.stock} Available` : 'Out of Stock'}
                </span>
              </div>
            </div>

            <p className="product-description">{product.description}</p>

            {/* Quantity Selector */}
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <div className="quantity-control">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn"
                >
                  −
                </button>
                <input 
                  type="number" 
                  id="quantity"
                  min="1" 
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(parseInt(e.target.value) || 1, product.stock)))}
                />
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              <span className="stock-info">({product.stock} available)</span>
            </div>

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
              {user ? (
                <>
                  <button 
                    className="btn btn-primary btn-large"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                  >
                    Buy Now
                  </button>
                  <button 
                    className="btn btn-secondary btn-large"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="btn btn-primary btn-large">
                    Login to Buy
                  </Link>
                  <Link to="/contact" className="btn btn-secondary btn-large">
                    Enquire Now
                  </Link>
                </>
              )}
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

      {/* Checkout Modal */}
      {user && (
        <CheckoutModal 
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={[{ ...product, quantity }]}
          totalAmount={parseFloat(product.price || 0) * quantity}
          userId={user._id}
          userName={user.name}
          userEmail={user.email}
        />
      )}
    </main>
  );
};

export default ProductDetailPage;
