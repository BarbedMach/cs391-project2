"use client";
import React from "react";
import Link from "next/link";
import { Card, Button, Badge } from "react-bootstrap";
import { CartService } from "@/services/cartService";

const ProductCard = ({ product }) => {
  // ProductCard.js (updated handleAddToCart)
  const handleAddToCart = async () => {
    try {
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
          image: product.images[0], // Ensure consistent image field
          price: product.price,
          quantity: 1,
        });
      }
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const originalPrice = (
    (product.price * 100) /
    (100 - product.discountPercentage)
  ).toFixed(2);

  return (
    <Card className="h-100 shadow-sm border-primary border-2 nav-hover-effect">
      <div className="position-relative">
        <Link href={`/products/${product.id}`} className="text-decoration-none">
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
        </Link>
      </div>

      <Card.Body className="d-flex flex-column">
        <Link href={`/products/${product.id}`} className="text-decoration-none">
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
        </Link>
      </Card.Body>
      <Button
        variant="primary"
        className="m-2 nav-hover-effect text-gradient border-1 bg-transparent"
        onClick={handleAddToCart}
        style={{ cursor: "pointer" }}
        onMouseEnter={(e) => {
          e.stopPropagation();
          e.currentTarget.style.cursor = "pointer";
        }}
      >
        <span className="text-gradient">Add to Cart</span>
      </Button>
    </Card>
  );
};

export default ProductCard;
