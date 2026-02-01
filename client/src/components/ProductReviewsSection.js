import React, { useState, useEffect } from 'react';
import { reviewService } from '../services/api';
import { FaStar, FaTimes } from 'react-icons/fa';
import '../styles/ProductReviewsSection.css';

const ProductReviewsSection = ({ productId, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProductReviews();
  }, [productId]);

  const fetchProductReviews = async () => {
    try {
      setLoading(true);
      console.log('📚 Fetching reviews for product:', productId);
      const reviewsData = await reviewService.getProductReviews(productId);
      console.log('📚 Reviews data:', reviewsData);
      
      setReviews(reviewsData.reviews || []);
      setAverageRating(Number(reviewsData.averageRating) || 0);
      setTotalReviews(reviewsData.totalReviews || 0);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar 
        key={i} 
        className={i < Math.round(rating) ? 'star-filled' : 'star-empty'} 
        style={{ color: i < Math.round(rating) ? '#ffc107' : '#ddd' }}
      />
    ));
  };

  if (loading) {
    return (
      <div className="review-modal-overlay" onClick={onClose}>
        <div className="review-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-modal-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="loading-reviews">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="review-modal-header">
          <h2>Product Reviews</h2>
          <p className="review-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
        </div>

        {error && <div className="review-error-message">{error}</div>}

        {totalReviews > 0 ? (
          <>
            <div className="review-summary">
              <div className="rating-summary">
                <div className="large-rating">{(Number(averageRating) || 0).toFixed(1)}</div>
                <div className="stars-summary">
                  {renderStars(averageRating)}
                </div>
                <div className="rating-text">Average Rating</div>
              </div>
            </div>

            <div className="reviews-list">
              {reviews.map((review, index) => (
                <div key={review._id || index} className="review-item">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <span className="reviewer-name">{review.userId?.name || 'Anonymous User'}</span>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.rating)}
                      <span className="rating-value">({review.rating}/5)</span>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-reviews-message">
            <p>No reviews yet for this product</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductReviewsSection;
