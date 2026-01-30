import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart } from 'react-icons/fa';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import '../styles/WishlistPage.css';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/signin');
      return;
    }
    addToCart({
      id: product._id,
      name: product.productName || product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      stock: product.stock,
      brand: product.brand || 'EIRS Technology'
    });
    alert('Product added to cart!');
  };

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Wishlist</h1>

        {wishlist.length === 0 ? (
          <div className="empty-wishlist">
            <h2>Your wishlist is empty</h2>
            <p>Add items to your wishlist to save them for later</p>
            <button className="continue-shopping-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="wishlist-summary">
              <p>{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in wishlist</p>
            </div>

            <div className="wishlist-items">
              {wishlist.map((product) => (
                <div key={product._id} className="wishlist-item">
                  <div className="wishlist-item-image">
                    <img
                      src={product.image}
                      alt={product.productName || product.name}
                      onClick={() => handleProductDetails(product._id)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>

                  <div className="wishlist-item-details">
                    <div
                      className="wishlist-item-name"
                      onClick={() => handleProductDetails(product._id)}
                      style={{ cursor: 'pointer' }}
                    >
                      {product.productName || product.name}
                    </div>
                    <div className="wishlist-item-brand">{product.brand || 'EIRS Technology'}</div>

                    <div className="wishlist-item-stock">
                      {product.stock > 0 ? (
                        <span className="in-stock">✓ In Stock ({product.stock} available)</span>
                      ) : (
                        <span className="out-of-stock">Out of Stock</span>
                      )}
                    </div>

                    <div className="wishlist-item-price">
                      <span className="current-price">₹{product.price?.toLocaleString() || 0}</span>
                      {product.originalPrice && (
                        <span className="original-price">₹{product.originalPrice?.toLocaleString()}</span>
                      )}
                    </div>

                    <div className="wishlist-item-actions">
                      {product.stock > 0 && (
                        <button
                          className="add-to-cart-btn"
                          onClick={() => handleAddToCart(product)}
                        >
                          <FaShoppingCart /> Add to Cart
                        </button>
                      )}
                      <button
                        className="remove-btn"
                        onClick={() => handleRemove(product._id)}
                        title="Remove from wishlist"
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="wishlist-footer">
              <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
