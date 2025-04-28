'use client'

import React from 'react';
import { Row, Col, Form, Button, Dropdown } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

export default function FilterBar({ onFilterChange, onSortChange }) {
    return (
        <div className="bg-light p-3 rounded mb-4">
          <Row className="align-items-center">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Category</Form.Label>
                <Form.Select onChange={(e) => onFilterChange('category', e.target.value)}>
                  <option value="">All Categories</option>  
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
            <Form.Group>
            <Form.Label>Search</Form.Label>
            <Form.Control
              type="search"
              placeholder="Search products..."
              className="me-2"
              aria-label="Search"
            />
          </Form.Group>
          </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Price Range</Form.Label>
                <Row>
                  <Col>
                    <Form.Control 
                      type="number" 
                      placeholder="Min" 
                      onChange={(e) => onFilterChange('minPrice', e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control 
                      type="number" 
                      placeholder="Max" 
                      onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Label>Sort By</Form.Label>
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort" className="w-100">
                  Sort Products
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onSortChange('price-asc')}>Price: Low to High</Dropdown.Item>
                  <Dropdown.Item onClick={() => onSortChange('price-desc')}>Price: High to Low</Dropdown.Item>
                  <Dropdown.Item onClick={() => onSortChange('rating-desc')}>Highest Rated</Dropdown.Item>
                  <Dropdown.Item onClick={() => onSortChange('name-asc')}>Name: A to Z</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </Col>
          </Row>
        </div>
      );
}