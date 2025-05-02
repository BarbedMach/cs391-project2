"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, Row, Col, Button, Badge, Form } from "react-bootstrap";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3001/products/${id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      const response = await fetch("http://localhost:3001/shoppingcart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity,
          price: product.price,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");
      // Handle successful add to cart
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  if (loading) return <div className="text-center py-3">Loading...</div>;
  if (error)
    return <div className="text-center py-5 text-danger">Error: {error}</div>;

  return (
    <div className="container py-3">
      <Row className="g-4">
        <Col md={6}>
          <Card className="border-primary border-2 h-100">
            <Card.Body className="p-0 d-flex align-items-center justify-content-center">
              <Card.Img
                variant="top"
                src={product.images[0]}
                style={{
                  maxHeight: "500px",
                  objectFit: "contain",
                  width: "100%",
                  padding: "1rem",
                }}
              />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="border-primary border-2 h-100 p-3 d-flex flex-column">
            <div className="flex-grow-1">
              <h1 className="text-gradient text-center mb-3">
                {product.title}
              </h1>
              <Row className="text-center mb-3">
                <Col>
                  <h2 className="text-dark me-3">${product.price}</h2>
                </Col>
                <Col>
                  {product.discountPercentage > 0 && (
                    <Badge bg="danger" pill className="fs-5">
                      {product.discountPercentage}% OFF
                    </Badge>
                  )}
                </Col>
              </Row>
              <Card.Text className="fs-5 p-1 text-center">
                {product.description}
              </Card.Text>
              <div className="mb-4 text-center">
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
            <div className="mt-auto">
              <Form.Control
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="mb-3 w-100"
              />
              <Button
                variant="primary"
                size="lg"
                className="nav-hover-effect w-100 mt-auto text-gradient border-1 bg-transparent"
                onClick={handleAddToCart}
              >
                <span className="text-gradient">Add to Cart</span>
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
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
