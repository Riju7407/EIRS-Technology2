import React, { useState, useEffect, useLayoutEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FaShoppingCart,
  FaBolt,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaShieldAlt,
  FaTruck,
  FaUndo,
  FaTag,
  FaChevronRight,
  FaHome,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { productService, reviewService } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import CheckoutModal from "../components/CheckoutModal";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import "../styles/ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showCheckout, setShowCheckout] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Review states
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Multi-image carousel state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageZoom, setImageZoom] = useState(false);

  useLayoutEffect(() => {
    // Force reset to the top product details section on every product id change.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setSelectedImageIndex(0);
    setImageZoom(false);
    setActiveTab("description");
    setQuantity(1);
  }, [id]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(id);
        const productData = response.data ? response.data : response;
        setProduct(productData);
        setError("");
      } catch (err) {
        setError("Failed to load product details. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
  const fetchRelatedProducts = async () => {
    if (!product) return;

    const categoryToSearch =
      product?.category?.name || product?.category || product?.mainCategory;

    if (!categoryToSearch) {
      setRelatedProducts([]);
      return;
    }

    try {
      const response = await productService.getProductsByCategory(categoryToSearch);

      const products = Array.isArray(response)
        ? response
        : response?.data || [];

      const related = products
        .filter(p => p._id !== product._id)
        .slice(0, 5);

      setRelatedProducts(related);
    } catch (err) {
      console.error("Error fetching related products:", err);
      setRelatedProducts([]);
    }
  };

  fetchRelatedProducts();
}, [product]);
  const categoryName =
    typeof product?.category === "object"
      ? product?.category?.name
      : product?.category;

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const reviewsData = await reviewService.getProductReviews(id);
      setReviews(reviewsData.reviews || []);
      setAverageRating(Number(reviewsData.averageRating) || 0);
      setTotalReviews(reviewsData.totalReviews || 0);
      if (user) {
        try {
          const userReviewData = await reviewService.getUserProductReview(id);
          setEditingReview(userReviewData.review);
        } catch (err) {}
      }
    } catch (err) {
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id, user]);

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      const disc = product.discount > 0 ? product.discount : 0;
      const sp =
        disc > 0
          ? Math.round(parseFloat(product.price || 0) * (1 - disc / 100))
          : parseFloat(product.price || 0);
      addToCart({ ...product, price: sp }, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      navigate("/signin");
      return;
    }
    if (product && product.stock > 0) {
      const disc = product.discount > 0 ? product.discount : 0;
      const sp =
        disc > 0
          ? Math.round(parseFloat(product.price || 0) * (1 - disc / 100))
          : parseFloat(product.price || 0);
      addToCart({ ...product, price: sp }, quantity);
      setShowCheckout(true);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    for (let i = 1; i <= 5; i++) {
      if (i <= full) stars.push(<FaStar key={i} className="star filled" />);
      else if (i === full + 1 && half)
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      else stars.push(<FaRegStar key={i} className="star empty" />);
    }
    return stars;
  };

  const getImageList = () => {
    if (product?.images && product.images.length > 0) return product.images;
    if (product?.image) return [product.image];
    return [];
  };

  if (loading) {
    return (
      <div className="pdp-page">
        <div className="pdp-loading">
          <div className="pdp-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pdp-page">
        <div className="pdp-error">
          <FaTimesCircle size={48} color="#ef4444" />
          <h2>Product Not Found</h2>
          <p>{error || "The product you are looking for does not exist."}</p>
          <Link to="/products" className="pdp-btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const images = getImageList();
  const inStock = product.stock > 0;
  const discountPct = product.discount > 0 ? product.discount : 0;
  const sellingPrice =
    discountPct > 0
      ? Math.round(parseFloat(product.price || 0) * (1 - discountPct / 100))
      : parseFloat(product.price || 0);
  const mrpPrice = discountPct > 0 ? parseFloat(product.price || 0) : null;
  const totalPrice = sellingPrice * quantity;

  return (
    <div className="pdp-page">
      {/* Breadcrumb */}
      <div className="pdp-breadcrumb">
        <div className="pdp-container">
          <Link to="/" className="pdp-bc-link">
            <FaHome /> Home
          </Link>
          <FaChevronRight className="pdp-bc-sep" />
          <Link to="/products" className="pdp-bc-link">
            Products
          </Link>
          <FaChevronRight className="pdp-bc-sep" />
          {categoryName && (
            <>
              <Link to="/products" className="pdp-bc-link">
                {categoryName}
              </Link>
              <FaChevronRight className="pdp-bc-sep" />
            </>
          )}
          <span className="pdp-bc-current">
            {product.productName || product.name}
          </span>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="pdp-container">
        <div className="pdp-main">
          {/* LEFT: Image Gallery */}
          <div className="pdp-gallery">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="pdp-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`pdp-thumb ${selectedImageIndex === i ? "active" : ""}`}
                    onClick={() => setSelectedImageIndex(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="pdp-main-image-wrap">
              <div
                className={`pdp-main-image ${imageZoom ? "zoomed" : ""}`}
                onClick={() => setImageZoom(!imageZoom)}
                title="Click to zoom"
              >
                {images.length > 0 ? (
                  <img
                    src={images[selectedImageIndex]}
                    alt={product.productName || product.name}
                  />
                ) : (
                  <div className="pdp-no-image">No Image</div>
                )}
                {inStock && (
                  <span className="pdp-in-stock-badge">In Stock</span>
                )}
                {!inStock && (
                  <span className="pdp-out-stock-badge">Out of Stock</span>
                )}
              </div>

              {images.length > 1 && (
                <div className="pdp-img-nav">
                  <button
                    className="pdp-img-btn"
                    onClick={() =>
                      setSelectedImageIndex((p) =>
                        p === 0 ? images.length - 1 : p - 1,
                      )
                    }
                  >
                    &#8592;
                  </button>
                  <span className="pdp-img-count">
                    {selectedImageIndex + 1} / {images.length}
                  </span>
                  <button
                    className="pdp-img-btn"
                    onClick={() =>
                      setSelectedImageIndex((p) =>
                        p === images.length - 1 ? 0 : p + 1,
                      )
                    }
                  >
                    &#8594;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* CENTER: Product Info */}
          <div className="pdp-info">
            {/* Category & Brand */}
            <div className="pdp-tags">
              {categoryName && (
                <span className="pdp-cat-tag">{categoryName}</span>
              )}
              {product.brand && (
                <span className="pdp-brand-tag">By {product.brand}</span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="pdp-title">{product.productName || product.name}</h1>

            {/* Model No */}
            {product.modelNo && (
              <p className="pdp-model">
                Model: <strong>{product.modelNo}</strong>
              </p>
            )}

            {/* Star Rating Row */}
            <div className="pdp-rating-row">
              <div className="pdp-stars">{renderStars(averageRating)}</div>
              <span className="pdp-rating-val">
                {averageRating > 0 ? averageRating.toFixed(1) : "No ratings"}
              </span>
              {totalReviews > 0 && (
                <span className="pdp-rating-count">
                  ({totalReviews} reviews)
                </span>
              )}
            </div>

            <div className="pdp-divider"></div>

            {/* Price Block */}
            <div className="pdp-price-block">
              {discountPct > 0 && (
                <div className="pdp-discount-badge">{discountPct}% OFF</div>
              )}
              <div className="pdp-price-row">
                <span className="pdp-price-label">Price</span>
                <div className="pdp-price-value">
                  <span className="pdp-currency">₹</span>
                  <span className="pdp-amount">
                    {sellingPrice.toLocaleString("en-IN")}
                  </span>
                  {mrpPrice && (
                    <span className="pdp-mrp">
                      MRP <s>₹{mrpPrice.toLocaleString("en-IN")}</s>
                    </span>
                  )}
                </div>
              </div>
              {discountPct > 0 && (
                <p className="pdp-saving-note">
                  You save ₹{(mrpPrice - sellingPrice).toLocaleString("en-IN")}{" "}
                  ({discountPct}%)
                </p>
              )}
              <p className="pdp-tax-note">Inclusive of all taxes</p>
            </div>

            {/* Stock Status */}
            <div className={`pdp-stock-row ${inStock ? "in" : "out"}`}>
              {inStock ? (
                <>
                  <FaCheckCircle className="pdp-stock-icon" />
                  <span className="pdp-stock-text">
                    Only <strong>{product.stock}</strong> Left In Stock – Order
                    Soon!
                  </span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="pdp-stock-icon" />
                  <span className="pdp-stock-text">Out of Stock</span>
                </>
              )}
            </div>

            <div className="pdp-divider"></div>

            {/* Quantity Selector */}
            {inStock && (
              <div className="pdp-qty-row">
                <span className="pdp-qty-label">Quantity</span>
                <div className="pdp-qty-control">
                  <button
                    className="pdp-qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="pdp-qty-val">{quantity}</span>
                  <button
                    className="pdp-qty-btn"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
                {quantity > 1 && (
                  <span className="pdp-qty-total">
                    Total: ₹{totalPrice.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pdp-actions">
              {user ? (
                <>
                  <button
                    className={`pdp-btn-cart ${addedToCart ? "added" : ""}`}
                    onClick={handleAddToCart}
                    disabled={!inStock}
                  >
                    <FaShoppingCart />
                    {addedToCart ? "Added to Cart!" : "Add to Cart"}
                  </button>
                  <button
                    className="pdp-btn-buy"
                    onClick={handleBuyNow}
                    disabled={!inStock}
                  >
                    <FaBolt />
                    Buy Now
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" className="pdp-btn-cart">
                    <FaShoppingCart /> Login to Buy
                  </Link>
                  <Link to="/contact" className="pdp-btn-buy">
                    Enquire Now
                  </Link>
                </>
              )}
            </div>

            {/* Datasheet */}
            {product.datasheet && (
              <a
                href={product.datasheet}
                target="_blank"
                rel="noopener noreferrer"
                className="pdp-datasheet"
              >
                <FaDownload /> Download Datasheet
              </a>
            )}

            {/* Trust Badges */}
            <div className="pdp-trust">
              <div className="pdp-trust-item">
                <FaTruck className="pdp-trust-icon" />
                <span>Free Delivery</span>
              </div>
              <div className="pdp-trust-item">
                <FaShieldAlt className="pdp-trust-icon" />
                <span>Secure Payment</span>
              </div>
              <div className="pdp-trust-item">
                <FaUndo className="pdp-trust-icon" />
                <span>Easy Returns</span>
              </div>
              <div className="pdp-trust-item">
                <FaTag className="pdp-trust-icon" />
                <span>Best Price</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Specifications */}
        <div className="pdp-tabs-section">
          <div className="pdp-tabs-header">
            <button
              className={`pdp-tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <button
                  className={`pdp-tab ${activeTab === "specs" ? "active" : ""}`}
                  onClick={() => setActiveTab("specs")}
                >
                  Specifications
                </button>
              )}
          </div>

          <div className="pdp-tabs-body">
            {activeTab === "description" && (
              <div className="pdp-description">
                <p>
                  {product.description ||
                    "No description available for this product."}
                </p>
              </div>
            )}
            {activeTab === "specs" && (
              <div className="pdp-specs">
                <table className="pdp-specs-table">
                  <tbody>
                    {Object.entries(product.specifications || {}).map(
                      ([key, value]) => (
                        <tr key={key}>
                          <td className="pdp-spec-key">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </td>
                          <td className="pdp-spec-val">{value}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="pdp-reviews-section">
          <h2 className="pdp-section-title">Customer Reviews</h2>

          {/* Rating Summary */}
          {totalReviews > 0 && (
            <div className="pdp-rating-summary">
              <div className="pdp-rating-big">
                <span className="pdp-rating-number">
                  {averageRating.toFixed(1)}
                </span>
                <div className="pdp-stars pdp-stars-lg">
                  {renderStars(averageRating)}
                </div>
                <span className="pdp-rating-total">{totalReviews} Reviews</span>
              </div>
            </div>
          )}

          {user ? (
            <>
              <ReviewForm
                productId={id}
                onReviewAdded={fetchReviews}
                existingReview={editingReview}
              />
              {!reviewsLoading && (
                <ReviewList
                  reviews={reviews}
                  averageRating={averageRating}
                  totalReviews={totalReviews}
                  userId={user._id}
                  onReviewDeleted={fetchReviews}
                  onEditReview={setEditingReview}
                />
              )}
            </>
          ) : (
            <div className="pdp-login-review">
              <FaStar size={32} color="#fbbf24" />
              <p>Share your experience with this product</p>
              <Link to="/signin" className="pdp-btn-primary">
                Login to Write a Review
              </Link>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="pdp-related-section">
            <h2 className="pdp-section-title">Similar Products</h2>
            <div className="pdp-related-grid">
              {relatedProducts.map((p) => (
                <Link
                  to={`/product/${p._id}`}
                  key={p._id}
                  className="pdp-related-card"
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }}
                >
                  <div className="pdp-related-img">
                    <img
                      src={p.image || (p.images && p.images[0])}
                      alt={p.productName || p.name}
                    />
                  </div>
                  <div className="pdp-related-info">
                    <p className="pdp-related-name">
                      {p.productName || p.name}
                    </p>
                    {p.brand && <p className="pdp-related-brand">{p.brand}</p>}
                    <div className="pdp-related-price-row">
                      <p className="pdp-related-price">
                        ₹
                        {(p.discount > 0
                          ? Math.round(
                              parseFloat(p.price || 0) * (1 - p.discount / 100),
                            )
                          : parseFloat(p.price || 0)
                        ).toLocaleString("en-IN")}
                      </p>
                      {p.discount > 0 && (
                        <>
                          <span className="pdp-related-mrp">
                            <s>
                              ₹
                              {parseFloat(p.price || 0).toLocaleString("en-IN")}
                            </s>
                          </span>
                          <span className="pdp-related-badge">
                            {p.discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <span
                      className={`pdp-related-stock ${p.stock > 0 ? "in" : "out"}`}
                    >
                      {p.stock > 0 ? "✓ In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {user && (
        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          cartItems={[{ ...product, quantity }]}
          totalAmount={sellingPrice * quantity}
          userId={user._id}
          userName={user.name}
          userEmail={user.email}
        />
      )}
    </div>
  );
};

export default ProductDetailPage;
