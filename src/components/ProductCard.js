"use client";
import React from "react";
import Link from "next/link";
import { Card, Button, Badge } from "react-bootstrap";
import { CartService } from "@/services/cartService";

const ProductCard = ({ product, campaigns = [] }) => {
  // Find applicable campaign
  const applicableCampaign = campaigns.find(
    (c) => c.category.toLowerCase() === product.category.toLowerCase()
  );

  // Calculate discounts
  const originalPrice =
    product.discountPercentage > 0
      ? (product.price * 100) / (100 - product.discountPercentage)
      : product.price;

  let totalDiscount = product.discountPercentage;
  if (applicableCampaign) {
    totalDiscount += Number(applicableCampaign.extraDiscount);
    totalDiscount = Math.min(totalDiscount, 75);
  }

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

  return (
    <Card className="h-100 shadow-sm border-primary border-2 nav-hover-effect">
      <div className="position-relative">
        <Link href={`/products/${product.id}`} className="text-decoration-none">
          <Card.Img
            variant="top"
            src={product.images[0]}
            style={{ height: "160px", objectFit: "cover" }}
          />
          {totalDiscount > 0 && (
            <Badge
              bg="danger"
              pill
              className="position-absolute top-0 start-0 m-2 p-2 border border-2 border-white"
            >
              {totalDiscount.toFixed(2)}% OFF
              {applicableCampaign &&
                ` (${product.discountPercentage}% + ${
                  applicableCampaign ? applicableCampaign.extraDiscount : 0
                }%)`}
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
            <span className="fs-4 fw-bold">
              $
              {applicableCampaign
                ? campaignPrice.toFixed(2)
                : product.price.toFixed(2)}
            </span>
            <span className="text-muted text-decoration-line-through ms-2">
              ${originalPrice.toFixed(2)}
            </span>
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
