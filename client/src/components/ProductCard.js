import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaHeart, FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { reviewService } from '../services/api';
import '../styles/ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist(product._id));
  const [imageLoaded, setImageLoaded] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const {
    _id,
    name,
    productName,
    price,
    originalPrice,
    image,
    rating = 0,
    stock,
    inStock = true,
    discount = 0,
    brand = 'EIRS Technology',
    description = ''
  } = product;

  const productId = _id;
  const displayName = productName || name;
  // Use the actual stock value from database - don't default it
  const stockQuantity = stock !== undefined && stock !== null ? stock : 1;
  const discountPercentage = useMemo(
    () => discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0),
    [discount, originalPrice, price]
  );
  const isOutOfStock = useMemo(
    () => stock === 0, // Only show out of stock if explicitly set to 0
    [stock]
  );

  // Fetch average rating when product loads or productId changes
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const reviewsData = await reviewService.getProductReviews(productId);
        const rating = reviewsData?.averageRating || 0;
        setAverageRating(Number(rating) || 0);
      } catch (error) {
        console.error('Error fetching product rating:', error);
        // Fall back to product's rating field if available
        setAverageRating(Number(product.rating) || 0);
      }
    };

    if (productId) {
      fetchAverageRating();
    }
  }, [productId, product.rating]);

  // Log stock data for debugging
  if (product && product._id) {
    console.log(`Product: ${displayName}, Stock from DB: ${stock}, Display as: ${stockQuantity}`);
  }

  // Display stock status with dynamic update
  const getStockStatus = () => {
    if (stock === 0) {
      return <span className="out-of-stock-text">❌ Out of Stock</span>;
    } else if (stock && stock > 0) {
      return <span className="in-stock">✓ In Stock ({stock} available)</span>;
    } else if (stock === undefined || stock === null) {
      return <span className="in-stock">✓ Available</span>;
    }
    return <span className="in-stock">✓ Available</span>;
  };

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
        stock: stockQuantity,
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
        stock: stockQuantity,
        brand: brand
      });
      alert('Product added to cart!');
    }
  }, [isLoggedIn, productId, isOutOfStock, displayName, price, image, stockQuantity, brand, navigate, addToCart]);

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

        {/* Product Description */}
        {description && (
          <p className="product-description">{description}</p>
        )}

        {/* Stock Information - Display Original Database Stock (Dynamic) */}
        <div className="product-stock">
          {getStockStatus()}
        </div>

        {/* Rating */}
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.floor(Number(averageRating) || 0) ? 'filled' : 'empty'} />
            ))}
          </div>
          <span className="rating-count">({(Number(averageRating) || 0).toFixed(1)})</span>
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
