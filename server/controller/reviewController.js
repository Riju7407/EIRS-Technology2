const Review = require('../model/reviewSchema');
const Product = require('../model/productSchema.js');

// Create a new review
exports.addReview = async (req, res) => {
    try {
        console.log('\n====== REVIEW SUBMISSION START ======');
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        console.log('User from JWT:', JSON.stringify(req.user, null, 2));
        
        const { productId, rating, comment } = req.body;
        
        // Validate inputs exist
        if (!productId) {
            console.error('❌ Missing productId');
            return res.status(400).json({ message: 'Product ID is required' });
        }
        if (!rating) {
            console.error('❌ Missing rating');
            return res.status(400).json({ message: 'Rating is required' });
        }
        if (!comment) {
            console.error('❌ Missing comment');
            return res.status(400).json({ message: 'Comment is required' });
        }

        // Validate rating range
        const ratingNum = parseInt(rating, 10);
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
            console.error('❌ Invalid rating:', rating);
            return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }

        // Validate comment length
        const commentStr = String(comment).trim();
        if (commentStr.length < 10) {
            console.error('❌ Comment too short:', commentStr.length);
            return res.status(400).json({ message: 'Comment must be at least 10 characters' });
        }
        if (commentStr.length > 500) {
            console.error('❌ Comment too long:', commentStr.length);
            return res.status(400).json({ message: 'Comment cannot exceed 500 characters' });
        }

        // Get user data from JWT
        const userId = req.user._id;
        const userName = req.user.name;
        const userEmail = req.user.email;

        if (!userId) {
            console.error('❌ User ID not found in JWT');
            return res.status(401).json({ message: 'User ID not found in token' });
        }
        if (!userName) {
            console.error('❌ User name not found in JWT');
            return res.status(401).json({ message: 'User name not found in token' });
        }
        if (!userEmail) {
            console.error('❌ User email not found in JWT');
            return res.status(401).json({ message: 'User email not found in token' });
        }

        console.log('✅ Validation passed');
        console.log('User ID:', userId);
        console.log('User Name:', userName);
        console.log('User Email:', userEmail);

        // Check if product exists
        console.log('🔍 Checking if product exists with ID:', productId);
        let product;
        try {
            product = await Product.findById(productId);
        } catch (err) {
            console.error('❌ Error finding product:', err.message);
            return res.status(400).json({ message: 'Invalid product ID format' });
        }

        if (!product) {
            console.error('❌ Product not found:', productId);
            return res.status(404).json({ message: 'Product not found with ID: ' + productId });
        }

        console.log('✅ Product found:', product.productName);

        // Check if user already reviewed this product
        console.log('🔍 Checking for existing review');
        let existingReview;
        try {
            existingReview = await Review.findOne({ productId: productId, userId: userId });
        } catch (err) {
            console.error('❌ Error checking existing review:', err.message);
        }

        if (existingReview) {
            console.log('📝 Found existing review, updating:', existingReview._id);
            existingReview.rating = ratingNum;
            existingReview.comment = commentStr;
            existingReview.updatedAt = new Date();
            await existingReview.save();
            console.log('✅ Review updated successfully');
            return res.status(200).json({ 
                message: 'Review updated successfully', 
                review: existingReview 
            });
        }

        // Create new review
        console.log('✍️ Creating new review');
        const reviewData = {
            productId: productId,
            userId: userId,
            userName: userName,
            userEmail: userEmail,
            rating: ratingNum,
            comment: commentStr
        };
        console.log('Review data to save:', JSON.stringify(reviewData, null, 2));

        const review = new Review(reviewData);
        await review.save();
        console.log('✅ Review saved successfully:', review._id);
        console.log('====== REVIEW SUBMISSION END ======\n');
        
        res.status(201).json({ 
            message: 'Review added successfully', 
            review: review 
        });
    } catch (error) {
        console.error('====== ERROR IN REVIEW SUBMISSION ======');
        console.error('❌ Error:', error.message);
        console.error('Error name:', error.name);
        console.error('Error details:', error);
        console.error('Stack:', error.stack);
        console.error('======================================\n');
        
        res.status(500).json({ 
            message: 'Error adding review: ' + error.message,
            error: error.message
        });
    }
};

// Get all reviews for a product
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        console.log('📖 Getting reviews for product:', productId);

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            console.error('❌ Product not found:', productId);
            return res.status(404).json({ 
                success: false,
                message: 'Product not found',
                reviews: [],
                averageRating: 0,
                totalReviews: 0
            });
        }

        // Get all reviews for the product sorted by most recent
        const reviews = await Review.find({ productId })
            .sort({ createdAt: -1 })
            .select('-userEmail'); // Don't send email in response

        console.log('✅ Found reviews:', reviews.length);

        // Calculate average rating
        const averageRating = reviews.length > 0
            ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
            : 0;

        res.status(200).json({
            success: true,
            reviews,
            averageRating,
            totalReviews: reviews.length
        });
    } catch (error) {
        console.error('❌ Error fetching reviews:', error.message);
        res.status(500).json({ 
            success: false,
            message: 'Error fetching reviews', 
            error: error.message,
            reviews: [],
            averageRating: 0,
            totalReviews: 0
        });
    }
};

// Get user's review for a product
exports.getUserProductReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const review = await Review.findOne({ productId, userId });

        if (!review) {
            return res.status(200).json({ review: null });
        }

        res.status(200).json({ success: true, review });
    } catch (error) {
        console.error('Error fetching user review:', error);
        res.status(500).json({ message: 'Error fetching user review', error: error.message });
    }
};

// Update review
exports.updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;

        // Find review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review
        if (review.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        // Validate inputs
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        if (comment.length < 10 || comment.length > 500) {
            return res.status(400).json({ message: 'Comment must be between 10 and 500 characters' });
        }

        // Update review
        review.rating = rating;
        review.comment = comment;
        review.updatedAt = new Date();
        await review.save();

        res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
};

// Delete review
exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const userId = req.user._id;

        // Find review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Check if user owns the review or is admin
        if (review.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await Review.findByIdAndDelete(reviewId);
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
};
