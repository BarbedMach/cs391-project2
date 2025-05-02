"use client";

import React, { useState } from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Cart, Shop } from "react-bootstrap-icons";

const NavigationBar = () => {
  const [cartItemCount, setCartItemCount] = useState(300);

  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="lg"
      sticky="top"
      className="border-bottom border-primary border-3"
    >
      <Container className="px-4">
        <Navbar.Brand className="me-auto">
          <Nav.Link href="/" className="d-flex align-items-center">
            <Shop size={28} className="text-primary m-2" />
            <span className="text-gradient fs-2 fw-bold text-center">
              FS Shop
            </span>
          </Nav.Link>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link
              href="/"
              className="mx-2 px-3 py-2 rounded-pill nav-hover-effect"
            >
              Home
            </Nav.Link>

            <Nav.Link
              href="/manage-campaigns"
              className="mx-2 px-3 py-2 rounded-pill nav-hover-effect"
            >
              Manage Campaigns
            </Nav.Link>
          </Nav>

          <Nav>
            <Nav.Link
              href="/cart"
              className="position-relative mx-2 px-3 py-2 rounded-pill nav-hover-effect"
            >
              <Cart size={18} />
              <Badge
                bg="danger"
                pill
                className="position-absolute top-25 start-100 translate-middle p-2 border border-2 border-dark"
                style={{
                  fontSize: "0.6rem",
                }}
              >
                {cartItemCount}
              </Badge>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
