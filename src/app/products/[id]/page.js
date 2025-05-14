"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // Import useRouter
import {
  Card,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Alert,
  Modal,
} from "react-bootstrap";
import api from "@/utils/api";
import { CartService } from "@/services/cartService";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter(); // Initialize useRouter
  const [product, setProduct] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    title: "",
    comment: "",
    rating: "",
    username: "",
  });
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return; // Ensure id is available
      setLoading(true);
      setError(null);
      try {
        const [productResponse, campaignsResponse, cartResponse] =
          await Promise.all([
            api.get(`/products/${id}`),
            api.get("/campaigns"),
            CartService.getCart(), // Fetch current cart
          ]);

        const fetchedProduct = productResponse.data;
        setProduct(fetchedProduct);
        setCampaigns(campaignsResponse.data);

        const existingItemInCart = cartResponse.data.find(
          (item) => item.productId === fetchedProduct.id
        );

        if (existingItemInCart) {
          setCartItem(existingItemInCart);
          setQuantity(existingItemInCart.quantity); // set quantity from cart if item exists
        } else {
          setCartItem(null);
          setQuantity(1); // reset to 1 if not in cart
        }
      } catch (err) {
        setError(err.message || "Failed to fetch product details.");
        console.error("Fetch data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]); // Rerun when id changes

  const applicableCampaign = product?.category
    ? campaigns.find(
        (c) => c.category.toLowerCase() === product.category.toLowerCase()
      )
    : null;

  const baseDiscount = product?.discountPercentage || 0;
  const campaignDiscount = applicableCampaign?.extraDiscount || 0;
  const totalDiscount = Math.min(
    parseFloat(baseDiscount) + parseFloat(campaignDiscount),
    75
  ); // Ensure numbers

  const originalPrice = product?.price
    ? (product.price * 100) / (100 - baseDiscount)
    : 0;

  const finalPrice = product?.price
    ? (originalPrice * (100 - totalDiscount)) / 100
    : 0;

  const handleAddToCartOrUpdate = async () => {
    if (!product) return;
    if (quantity < 1) {
      setError("Quantity must be at least 1.");
      return;
    }
    setError(null);
    setSuccess("");

    try {
      const priceToUse = finalPrice; // calculated final price

      const currentCart = await CartService.getCart();
      const existingItemData = currentCart.data.find(
        (item) => item.productId === product.id
      );

      if (existingItemData) {
        // item exists, update its quantity and potentially price/note
        await CartService.updateItemInCart(existingItemData.id, {
          ...existingItemData, // Preserve other fields like note
          quantity: parseInt(quantity, 10),
          price: priceToUse, // Update price in case campaign changed
        });
        setSuccess("Cart updated successfully!");
      } else {
        // Item does not exist, add new
        await CartService.addToCart({
          productId: product.id,
          title: product.title,
          image: product.images?.[0] || "/placeholder.jpg", // Fallback image
          price: priceToUse,
          quantity: parseInt(quantity, 10),
          note: "", // Initialize note for new item
        });
        setSuccess("Product added to cart!");
      }
      window.dispatchEvent(new CustomEvent("cartUpdated")); // Notify other components

      // Refresh cartItem state for this page
      const updatedCartResponse = await CartService.getCart();
      const updatedExistingItem = updatedCartResponse.data.find(
        (item) => item.productId === product.id
      );
      setCartItem(updatedExistingItem || null);
      if (updatedExistingItem) {
        setQuantity(updatedExistingItem.quantity);
      }
    } catch (err) {
      console.error("Error updating/adding to cart:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update cart. Please try again."
      );
    }
  };

  const handleShowReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewError("");
    setNewReview({ title: "", comment: "", rating: "", username: "" }); // Reset form
  };

  const handleSubmitReview = async () => {
    if (!product) return;
    try {
      // Validate review title
      if (!newReview.title.trim()) {
        setReviewError("Review title is required.");
        return;
      }
      if (!newReview.comment.trim()) {
        setReviewError("Comment is required.");
        return;
      }
      if (!newReview.rating) {
        setReviewError("Rating is required.");
        return;
      }

      const ratingValue = parseInt(newReview.rating, 10);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        setReviewError("Rating must be between 1 and 5.");
        return;
      }
      setReviewError(""); // Clear previous errors

      const reviewToSubmit = {
        title: newReview.title.trim(), // Add title
        rating: ratingValue,
        comment: newReview.comment.trim(),
        reviewerName: newReview.username.trim() || "Anonymous",
        date: new Date().toISOString(),
      };

      const updatedReviews = [...(product.reviews || []), reviewToSubmit];
      const newAverageRating =
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
        updatedReviews.length;

      const updatedProduct = {
        ...product,
        reviews: updatedReviews,
        rating: parseFloat(newAverageRating.toFixed(2)),
      };

      const response = await api.put(`/products/${product.id}`, updatedProduct);
      setProduct(response.data); // Update local product state with new review and rating
      handleCloseReviewModal();
      setSuccess("Review submitted successfully!");
    } catch (err) {
      setReviewError("Failed to submit review. Please try again.");
      console.error("Review submission error:", err);
    }
  };

  if (loading) return <div className="text-center py-3">Loading...</div>;
  if (error && !product)
    return (
      <Alert variant="danger" className="m-3">
        Error loading product: {error}
      </Alert>
    );
  if (!product)
    return (
      <Alert variant="warning" className="m-3">
        Product not found.
      </Alert>
    );

  return (
    <div className="container py-3">
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-4">
        <Col md={6}>
          <Card className="border-primary border-2 h-100">
            <Card.Img
              variant="top"
              src={product.images?.[0] || "/placeholder.jpg"} // Fallback image
              alt={product.title}
              style={{
                maxHeight: "500px",
                objectFit: "contain",
                padding: "1rem",
              }}
            />
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-primary border-2 h-100 p-3 d-flex flex-column">
            <div className="flex-grow-1">
              <h1 className="text-gradient mb-3">{product.title}</h1>
              <div className="d-flex align-items-center mb-3">
                <span className="fs-1 fw-bold text-gradient">
                  ${finalPrice.toFixed(2)}
                </span>
                {totalDiscount > 0 && (
                  <span className="text-muted text-decoration-line-through ms-2 me-3">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
                {totalDiscount > 0 && (
                  <Badge bg="danger" pill className="fs-5">
                    {totalDiscount.toFixed(2)}% OFF
                    {applicableCampaign &&
                      ` (${baseDiscount}% + ${campaignDiscount}%)`}
                  </Badge>
                )}
              </div>

              <Card.Text className="fs-5 mb-4">
                {product.description}
              </Card.Text>

              <div className="mb-4">
                <h4 className="text-gradient">Product Details</h4>
                <ul className="list-unstyled">
                  <li>
                    <strong>Brand:</strong> {product.brand}
                  </li>
                  <li>
                    <strong>Category:</strong> {product.category}
                  </li>
                  <li>
                    <strong>Stock:</strong> {product.stock}
                  </li>
                  <li>
                    <strong>Rating:</strong> {product.rating?.toFixed(1)} / 5
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-auto">
              <Form.Group className="mb-3">
                <Form.Label>Quantity:</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))
                  }
                  className="mb-3"
                />
              </Form.Group>
              <Button
                variant="primary"
                size="lg"
                className="nav-hover-effect w-100 mb-2"
                onClick={handleAddToCartOrUpdate}
                disabled={product.stock === 0}
              >
                {product.stock === 0
                  ? "Out of Stock"
                  : cartItem
                  ? "Update Quantity in Cart"
                  : "Add to Cart"}
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                className="w-100"
                onClick={() => router.push("/cart")}
              >
                Go to Cart
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col xs={12} className="mb-3">
          <Button
            variant="outline-primary"
            onClick={handleShowReviewModal}
            className="nav-hover-effect w-100"
          >
            Write a Review for {product.title}
          </Button>
        </Col>
      </Row>

      <Modal show={showReviewModal} onHide={handleCloseReviewModal}>
        <Modal.Header closeButton className="border-primary">
          <Modal.Title className="text-gradient">
            Write a Review for {product.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewError && <Alert variant="danger">{reviewError}</Alert>}
          <Form>
            {/* review title input */}
            <Form.Group className="mb-3">
              <Form.Label>Review Title *</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Great product!"
                value={newReview.title}
                onChange={(e) =>
                  setNewReview({ ...newReview, title: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Rating *</Form.Label>
              <div className="d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Button
                    key={num}
                    variant="link"
                    className="p-0 me-1"
                    onClick={() =>
                      setNewReview({ ...newReview, rating: num.toString() })
                    }
                  >
                    <span
                      className={`fs-3 ${
                        num <= parseInt(newReview.rating, 10)
                          ? "text-warning"
                          : "text-muted"
                      }`}
                    >
                      ★
                    </span>
                  </Button>
                ))}
                <span className="ms-3">
                  {newReview.rating
                    ? `${newReview.rating}/5`
                    : "Select rating"}
                </span>
              </div>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your thoughts..."
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Your Name (optional)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Anonymous"
                value={newReview.username}
                onChange={(e) =>
                  setNewReview({ ...newReview, username: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseReviewModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitReview}
            className="nav-hover-effect"
          >
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Display Reviews */}
      <Row className="mt-4">
        <Col xs={12}>
          <h4 className="text-gradient mb-3">Customer Reviews</h4>
          {(product.reviews && product.reviews.length > 0) ? (
            product.reviews.map((review, index) => (
              <Card key={index} className="mb-3 border-primary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      {/* Display Review Title */}
                      <Card.Title className="mb-1">{review.title || "Review"}</Card.Title>
                      <small className="text-muted">By: {review.reviewerName}</small>
                    </div>
                    <div className="d-flex align-items-center">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`fs-5 ${
                            i < review.rating ? "text-warning" : "text-muted"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                      <strong className="ms-2">{review.rating} / 5</strong>
                    </div>
                  </div>
                  <hr className="my-2"/>
                  <Card.Text className="mt-2">{review.comment}</Card.Text>
                  <small className="text-muted d-block text-end">
                    Reviewed on: {new Date(review.date).toLocaleDateString()}
                  </small>
                </Card.Body>
              </Card>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}
        </Col>
      </Row>
    </div>
  );
}
