"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const [product, setProduct] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({
    comment: "",
    rating: "",
    username: "",
  });
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResponse, campaignsResponse] = await Promise.all([
          api.get(`/products/${id}`),
          api.get("/campaigns"),
        ]);
        setProduct(productResponse.data);
        setCampaigns(campaignsResponse.data);

        const cartResponse = await api.get("/shoppingcart");
        const existingItem = cartResponse.data.find(
          (item) => item.productId === productResponse.data.id
        );

        if (existingItem) {
          setCartItem(existingItem);
          setQuantity(existingItem.quantity);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const applicableCampaign = product?.category
    ? campaigns.find(
        (c) => c.category.toLowerCase() === product.category.toLowerCase()
      )
    : null;
  // Calculate discounts
  const baseDiscount = product?.discountPercentage || 0;
  const campaignDiscount = applicableCampaign?.extraDiscount || 0;
  const totalDiscount = Math.min(baseDiscount + campaignDiscount, 75);

  const originalPrice = product?.price
    ? (product.price * 100) / (100 - baseDiscount)
    : 0;

  const campaignPrice = (originalPrice * (100 - totalDiscount)) / 100;

  const handleAddToCart = async () => {
    try {
      const priceToUse = applicableCampaign ? campaignPrice : product.price;

      const cartResponse = await CartService.getCart();
      const existingItem = cartResponse.data.find(
        (item) => item.productId === product.id
      );

      if (existingItem) {
        await CartService.updateQuantity(
          existingItem.id,
          existingItem.quantity + 1
        );
      } else {
        await CartService.addToCart({
          productId: product.id,
          title: product.title,
          image: product.images[0],
          price: priceToUse,
          quantity: 1,
        });
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (loading) return <div className="text-center py-3">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

  const handleShowReviewModal = () => setShowReviewModal(true);
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewError("");
    setNewReview({ comment: "", rating: "", username: "" });
  };

  const handleSubmitReview = async () => {
    try {
      if (!newReview.comment || !newReview.rating) {
        setReviewError("Comment and rating are required");
        return;
      }

      const reviewToSubmit = {
        rating: parseInt(newReview.rating),
        comment: newReview.comment,
        reviewerName: newReview.username || "Anonymous",
        date: new Date().toISOString(),
      };

      // Update product with new review
      const updatedProduct = {
        ...product,
        reviews: [...product.reviews, reviewToSubmit],
      };

      const response = await api.put(`/products/${product.id}`, updatedProduct);
      setProduct(response.data);
      handleCloseReviewModal();
    } catch (err) {
      setReviewError("Failed to submit review. Please try again.");
      console.error("Review submission error:", err);
    }
  };

  return (
    <div className="container py-3">
      {success && <Alert variant="success">{success}</Alert>}

      <Row className="g-4">
        {/* Product Image */}
        <Col md={6}>
          <Card className="border-primary border-2 h-100">
            <Card.Img
              variant="top"
              src={product.images[0]}
              style={{
                maxHeight: "500px",
                objectFit: "contain",
                padding: "1rem",
              }}
            />
          </Card>
        </Col>

        {/* Product Details */}
        <Col md={6}>
          <Card className="border-primary border-2 h-100 p-3 d-flex flex-column">
            <div className="flex-grow-1">
              <h1 className="text-gradient mb-3">{product.title}</h1>
              <div className="d-flex align-items-center mb-3">
                <span className="fs-4 fw-bold text-gradient">
                  $
                  {applicableCampaign
                    ? campaignPrice.toFixed(2)
                    : product.price.toFixed(2)}
                </span>
                <span className="text-muted text-decoration-line-through ms-2 me-3">
                  ${originalPrice.toFixed(2)}
                </span>

                <Badge bg="danger" pill className="fs-5">
                  {totalDiscount}% OFF
                  {applicableCampaign &&
                    ` (${baseDiscount}% + ${campaignDiscount}%)`}
                </Badge>
              </div>

              <Card.Text className="fs-5 mb-4">{product.description}</Card.Text>

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
                </ul>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="mt-auto">
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, e.target.value))}
                className="mb-3"
              />
              <Button
                variant="primary"
                size="lg"
                className="nav-hover-effect w-100"
                onClick={handleAddToCart}
              >
                {cartItem ? "Update Cart" : "Add to Cart"}
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Add Review Button */}
      <Row className="mt-4">
        <Col xs={12} className="mb-3">
          <Button
            variant="primary"
            onClick={handleShowReviewModal}
            className="nav-hover-effect w-100"
          >
            Write a Review
          </Button>
        </Col>
      </Row>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={handleCloseReviewModal}>
        <Modal.Header closeButton>
          <Modal.Title className="text-gradient">Write a Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewError && <Alert variant="danger">{reviewError}</Alert>}
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Rating *</Form.Label>
              <Form.Select
                value={newReview.rating}
                onChange={(e) =>
                  setNewReview({ ...newReview, rating: e.target.value })
                }
                required
              >
                <option value="">Select Rating</option>
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} Stars
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comment *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview({ ...newReview, comment: e.target.value })
                }
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Username (optional)</Form.Label>
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
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmitReview}>
            Submit Review
          </Button>
        </Modal.Footer>
      </Modal>

      <Row className="mt-4">
        <Col xs={12}>
          <h4 className="text-gradient mb-3">Customer Reviews</h4>
          {product.reviews.map((review, index) => (
            <Card key={index} className="mb-3 border-primary">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
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
                </div>
                <Card.Title>{review.reviewerName}</Card.Title>
                <Card.Text>{review.comment}</Card.Text>
                <small className="text-muted">
                  {new Date(review.date).toLocaleDateString()}
                </small>
              </Card.Body>
            </Card>
          ))}
        </Col>
      </Row>
    </div>
  );
}
