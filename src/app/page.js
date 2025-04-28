'use client'

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';

import CampaignCarousel from '../components/CampaignCarousel';
import FilterBar from '../components/FilterBar';
import ProductList from '../components/ProductList';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // This should be true when we actually start developing the app.

  const handleFilterChange = () => {}
  const handleSortChange = () => {}

  return (
    <div className="d-flex flex-column min-vh-100">
      <main className="flex-grow-1">
        <Container>
          <CampaignCarousel campaigns={campaigns} />
          <FilterBar 
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
          />
          
          {isLoading ? (
            <div className="text-center my-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading products...</p>
            </div>
          ) : (
            <div className="mb-5">
              <h2 className="mb-4">Our Products</h2>
              {products.length > 0 ? (
                <ProductList products={products} addToCart={addToCart} />
              ) : (
                <div className="text-center p-5 bg-light rounded">
                  <h3>No products found</h3>
                  <p>Try adjusting your filters to see more products.</p>
                </div>
              )}
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
