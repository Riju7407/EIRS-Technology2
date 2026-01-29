import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const {
    _id,
    name,
    productName,
    price,
    originalPrice,
    image,
    rating = 0,
    stock = 0,
    inStock = true,
    discount = 0,
    brand = 'EIRS Technology',
    description = ''
  } = product;

  const productId = _id;
  const displayName = productName || name;
  const discountPercentage = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);
  const isOutOfStock = stock === 0 || stock === undefined;

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }
    if (productId && !isOutOfStock) {
      // Add product to cart first
      addToCart({
        id: productId,
        name: displayName,
        price: price,
        image: image,
        quantity: 1,
        stock: stock,
        brand: brand
      });
      // Then redirect to cart/checkout page
      navigate('/cart');
    }
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }
    if (productId && !isOutOfStock) {
      addToCart({
        id: productId,
        name: displayName,
        price: price,
        image: image,
        quantity: 1,
        stock: stock,
        brand: brand
      });
      alert('Product added to cart!');
    }
  };

  const handleViewDetails = () => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
        <img src={image} alt={displayName} className="product-image" />
        {discountPercentage > 0 && (
          <div className="discount-badge">{discountPercentage}% OFF</div>
        )}
        {isOutOfStock && <div className="out-of-stock">Out of Stock</div>}
        <button className="wishlist-btn" title="Add to Wishlist">
          <FaHeart />
        </button>
      </div>

      <div className="product-info">
        {/* Brand */}
        <div className="product-brand">{brand}</div>

        {/* Product Name */}
        <h3 className="product-name" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>{displayName}</h3>

        {/* Stock Information */}
        <div className="product-stock">
          {stock > 0 ? (
            <span className="in-stock">✓ In Stock ({stock} available)</span>
          ) : (
            <span className="out-of-stock-text">Out of Stock</span>
          )}
        </div>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.floor(rating) ? 'filled' : 'empty'} />
            ))}
          </div>
          <span className="rating-count">({rating})</span>
        </div>

        {/* Pricing */}
        <div className="product-pricing">
          <div className="current-price">₹{price?.toLocaleString() || 0}</div>
          {originalPrice && (
            <div className="original-price">₹{originalPrice.toLocaleString()}</div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="product-actions">
          {!isOutOfStock ? (
            <>
              <button className="buy-now-btn" onClick={handleBuyNow}>
                Buy Now
              </button>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <FaShoppingCart /> Add To Cart
              </button>
            </>
          ) : (
            <button className="add-to-cart-btn" disabled>
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
