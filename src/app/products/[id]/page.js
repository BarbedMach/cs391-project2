"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Row, Col, Button, Badge, Form, Alert } from "react-bootstrap";
import api from "@/utils/api";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product details
        const productResponse = await api.get(`/products/${id}`);
        setProduct(productResponse.data);

        // Check existing cart items
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

  const handleAddToCart = async () => {
    try {
      if (cartItem) {
        await api.put(`/shoppingcart/${cartItem.id}`, {
          ...cartItem,
          quantity: quantity,
          // Maintain all required fields
          productId: product.id,
          title: product.title,
          image: product.images[0], // Fix inconsistent image source
          price: product.price,
        });
      } else {
        await api.post("/shoppingcart", {
          productId: product.id,
          title: product.title,
          image: product.images[0], // Changed from thumbnail to images[0]
          price: product.price,
          quantity: quantity,
        });
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Cart error:", err);
    }
  };

  if (loading) return <div className="text-center py-3">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

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
                <h2 className="text-primary me-3">${product.price}</h2>
                {product.discountPercentage > 0 && (
                  <Badge bg="danger" pill className="fs-5">
                    {product.discountPercentage}% OFF
                  </Badge>
                )}
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

      {/* Reviews Section */}
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
