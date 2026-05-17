import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import '../styles/ReviewForm.css';

const ReviewForm = ({ productId, onReviewAdded, existingReview }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!rating) {
      setError('Please select a rating');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > 0 && trimmedComment.length < 10) {
      setError('Comment must be at least 10 characters or left empty');
      return;
    }

    if (trimmedComment.length > 500) {
      setError('Comment cannot exceed 500 characters');
      return;
    }

    setLoading(true);

    try {
      const { reviewService } = await import('../services/api');

      console.log('📤 Submitting review:', {
        productId,
        rating,
        comment: comment.trim(),
        isUpdate: !!existingReview?._id
      });

      if (existingReview?._id) {
        // Update existing review
        await reviewService.updateReview(existingReview._id, {
          rating,
          comment: comment.trim()
        });
        setSuccessMessage('Review updated successfully!');
      } else {
        // Add new review
        await reviewService.addReview({
          productId,
          rating,
          comment: comment.trim()
        });
        setSuccessMessage('Review added successfully!');
      }

      setTimeout(() => {
        setComment('');
        setRating(0);
        setSuccessMessage('');
        onReviewAdded();
      }, 2000);
    } catch (err) {
      console.error('❌ Error submitting review:');
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response status:', err.response?.status);
      console.error('Error response data:', err.response?.data);
      console.error('Error message:', err.message);
      
      // Extract the most useful error message
      let errorMsg = 'Error submitting review. Please try again.';
      
      // Check different possible error sources
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
        console.error('Error from response.data.message:', errorMsg);
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
        console.error('Error from response.data.error:', errorMsg);
      } else if (err.message && err.message !== 'Request failed with status code 500') {
        errorMsg = err.message;
        console.error('Error from message:', errorMsg);
      } else if (err.response?.status) {
        errorMsg = `Server error (Status ${err.response.status}). Please check console.`;
        console.error('Error status:', err.response.status);
      }
      
      console.error('Final error message to display:', errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">Leave a Review</h3>
      
      {error && <div className="review-error">{error}</div>}
      {successMessage && <div className="review-success">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="review-form">
        {/* Rating Section */}
        <div className="rating-section">
          <label className="rating-label">Your Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoveredRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              >
                <FaStar />
              </button>
            ))}
          </div>
          <p className="rating-display">
            {rating > 0 ? `${rating} out of 5 stars` : 'Click to rate'}
          </p>
        </div>

        {/* Comment Section */}
        <div className="comment-section">
          <label htmlFor="comment" className="comment-label">
            Your Review (optional):
            <span className="char-count">
              {comment.length}/500
            </span>
          </label>
          <textarea
            id="comment"
            className="comment-textarea"
            placeholder="Share your experience with this product... (optional, 10-500 chars if entered)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength="500"
            rows="5"
          />
          {comment.length > 0 && comment.length < 10 && (
            <p className="char-warning">Minimum 10 characters required</p>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
