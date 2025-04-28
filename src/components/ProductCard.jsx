'use client'

import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import Link from 'next/link';

export default function ProductCard({ product, addToCart }) {
    const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  return (
    <Card className="h-100 product-card">
      <Link href={`/product/${product.id}`} className="text-decoration-none">
        <Card.Img 
          variant="top" 
          src={product.imageUrl} 
          alt={product.title}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      </Link>
      <Card.Body className="d-flex flex-column">
        <Link href={`/product/${product.id}`} className="text-decoration-none text-dark">
          <Card.Title>{product.title}</Card.Title>
        </Link>
        <div className="mb-2 text-warning">
          {[...Array(5)].map((_, i) => (
            <FaStar key={i} color={i < product.rating ? '#ffc107' : '#e4e5e9'} />
          ))}
          <small className="text-muted ms-2">({product.reviewsCount})</small>
        </div>
        <Card.Text className="text-danger fw-bold mb-3">
          ${product.price.toFixed(2)}
          {product.discount > 0 && (
            <span className="text-decoration-line-through text-muted ms-2">
              ${(product.price / (1 - product.discount/100)).toFixed(2)}
            </span>
          )}
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex mb-2">
            <Form.Control
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-25 me-2"
            />
            <Button variant="primary" onClick={handleAddToCart} className="flex-grow-1">
              Add to Cart
            </Button>
          </div>
          <Link href={`/product/${product.id}`} className="btn btn-outline-secondary w-100">
            View Details
          </Link>
        </div>
      </Card.Body>
    </Card>
  );
}