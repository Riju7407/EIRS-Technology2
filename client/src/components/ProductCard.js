import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product._id));
  const [imageLoaded, setImageLoaded] = useState(false);
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
  const discountPercentage = useMemo(
    () => discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0),
    [discount, originalPrice, price]
  );
  const isOutOfStock = useMemo(
    () => stock === 0 || stock === undefined,
    [stock]
  );

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

  const handleAddToCart = useCallback(() => {
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
  }, [isLoggedIn, productId, isOutOfStock, displayName, price, image, stock, brand, navigate, addToCart]);

  const handleViewDetails = useCallback(() => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  }, [productId, navigate]);

  const handleWishlist = () => {
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }

    if (isWishlisted) {
      removeFromWishlist(productId);
      setIsWishlisted(false);
    } else {
      addToWishlist(product);
      setIsWishlisted(true);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-wrapper" onClick={handleViewDetails} style={{ cursor: 'pointer' }}>
        <img 
          src={image} 
          alt={displayName} 
          className={`product-image ${imageLoaded ? 'loaded' : ''}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        {!imageLoaded && <div className="image-placeholder"></div>}
        {discountPercentage > 0 && (
          <div className="discount-badge">{discountPercentage}% OFF</div>
        )}
        {isOutOfStock && <div className="out-of-stock">Out of Stock</div>}
        <button 
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} 
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          onClick={handleWishlist}
        >
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

export default React.memo(ProductCard);
