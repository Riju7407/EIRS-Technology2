import React, { useState } from 'react';
import { FaStar, FaTrash, FaEdit } from 'react-icons/fa';
import '../styles/ReviewList.css';

const ReviewList = ({ reviews, averageRating, totalReviews, userId, onReviewDeleted, onEditReview }) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const handleDeleteReview = async (reviewId) => {
    setDeleting(reviewId);
    try {
      const { reviewService } = await import('../services/api');
      await reviewService.deleteReview(reviewId);
      setDeleteConfirm(null);
      onReviewDeleted();
    } catch (error) {
      alert('Error deleting review: ' + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (totalReviews === 0) {
    return (
      <div className="reviews-container">
        <div className="reviews-header">
          <h3>Product Reviews</h3>
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      {/* Reviews Header with Rating Summary */}
      <div className="reviews-header">
        <h3>Product Reviews</h3>
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="rating-stars">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="total-reviews">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.map((review) => {
          const isUserReview = userId && review.userId === userId;
          
          return (
            <div key={review._id} className="review-item">
              {/* Review Header */}
              <div className="review-header">
                <div className="reviewer-info">
                  <h4 className="reviewer-name">{review.userName}</h4>
                  <p className="review-date">{formatDate(review.createdAt)}</p>
                </div>
                {isUserReview && (
                  <div className="review-actions">
                    <button
                      className="edit-btn"
                      onClick={() => onEditReview(review)}
                      title="Edit Review"
                    >
                      <FaEdit /> Edit
                    </button>
                    {deleteConfirm !== review._id ? (
                      <button
                        className="delete-btn"
                        onClick={() => setDeleteConfirm(review._id)}
                        title="Delete Review"
                      >
                        <FaTrash /> Delete
                      </button>
                    ) : (
                      <div className="delete-confirm">
                        <p>Delete this review?</p>
                        <button
                          className="confirm-btn"
                          onClick={() => handleDeleteReview(review._id)}
                          disabled={deleting === review._id}
                        >
                          {deleting === review._id ? 'Deleting...' : 'Yes'}
                        </button>
                        <button
                          className="cancel-btn"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Review Rating */}
              <div className="review-rating">
                {renderStars(review.rating)}
                <span className="rating-text">{review.rating}/5</span>
              </div>

              {/* Review Comment */}
              <div className="review-comment">
                <p>{review.comment}</p>
              </div>

              {/* Review Updated Notice */}
              {review.updatedAt && new Date(review.updatedAt).getTime() !== new Date(review.createdAt).getTime() && (
                <p className="review-updated">Edited on {formatDate(review.updatedAt)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewList;
