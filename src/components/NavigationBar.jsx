'use client'

import React from "react";
import { Navbar, Nav, Container, Form, Button, Badge } from "react-bootstrap";
import { FaShoppingCart, FaSearch } from "react-icons/fa"
import Link from "next/link"

export default function NavigationBar({ cartItemsCount }) {
    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} href="/">FS4</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} href="/">Home</Nav.Link>
            <Nav.Link as={Link} href="/manage-campaigns">Manage Campaigns</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} href="/cart" className="position-relative">
              <FaShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <Badge pill bg="danger" className="position-absolute top-0 start-100 translate-middle">
                  {cartItemsCount}
                </Badge>
              )}
              <span className="ms-2">Cart</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    );
}