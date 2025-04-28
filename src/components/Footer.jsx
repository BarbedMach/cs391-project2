'use client'

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

export default function Footer() {
    return (
      <footer className="bg-dark text-light py-3 mt-5">
        <Container>
          <Row>
            <Col md={6} className="mb-6 mb-md-0">
              <p className="mb-2 text-decoration-none text-light text-center">Furkan</p>
            </Col>
            <Col md={6} className="mb-6 mb-md-0">
              <p className="mb-2 text-decoration-none text-light text-center">Selim</p>
            </Col>
          </Row>
          <hr className="my-2" />
          <div className="text-center">
            <p> FS4 : 2024-2025 Spring CS391 Project 2</p>
          </div>
        </Container>
      </footer>
    );
  };
  