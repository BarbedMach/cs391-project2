"use client";
import React from "react";
import { Card, Button, Badge } from "react-bootstrap";

const ProductCard = ({ product }) => {
  const originalPrice = (
    (product.price * 100) /
    (100 - product.discountPercentage)
  ).toFixed(2);

  return (
    <Card className="h-100 shadow-sm border-primary border-2 nav-hover-effect">
      <div className="position-relative">
        <Card.Img
          variant="top"
          src={product.images[0]}
          style={{ height: "160px", objectFit: "cover" }}
        />
        {product.discountPercentage > 0 && (
          <Badge
            bg="danger"
            pill
            className="position-absolute top-0 start-0 m-2 p-2 border border-2 border-white"
          >
            {product.discountPercentage}% OFF
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-gradient text-center mb-auto">
          {product.title}
        </Card.Title>

        <div className="mb-auto text-center">
          <span className="fs-4 fw-bold">${product.price}</span>
          {product.discountPercentage > 0 && (
            <span className="text-muted text-decoration-line-through ms-2">
              ${originalPrice}
            </span>
          )}
        </div>

        <div className="justify-content-center d-flex align-items-center mb-auto">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`fs-5 ${
                i < Math.floor(product.rating) ? "text-warning" : "text-muted"
              }`}
            >
              ★
            </span>
          ))}
          <span className=" text-muted">({product.rating})</span>
        </div>

        <Button
          variant="primary"
          className="mt-auto nav-hover-effect text-gradient border-1 bg-transparent border-2"
          onClick={() => console.log("Add to cart")}
        >
          <span className="text-gradient">Add to Cart</span>
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ProductCard;
