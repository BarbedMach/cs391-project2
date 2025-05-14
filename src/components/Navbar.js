"use client";

import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Badge } from "react-bootstrap";
import { Cart, Shop } from "react-bootstrap-icons";
import api from "@/utils/api";

const NavigationBar = () => {
  const [cartInfo, setCartInfo] = useState({ count: 0, totalValue: 0 });

  // Fetches cart data (item count and total value)
  const fetchCartData = async () => {
    try {
      const response = await api.get("/shoppingcart");
      const items = response.data;
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalValue = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      setCartInfo({ count: totalItems, totalValue: totalValue });
    } catch (err) {
      console.error("Error fetching cart data:", err);
      // Keep previous state on error or reset
      // setCartInfo({ count: 0, totalValue: 0 });
    }
  };

  useEffect(() => {
    fetchCartData();

    // Event listener for cart updates from other parts of the application
    const handleCartUpdate = () => {
      fetchCartData();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    // Cleanup listener on component unmount
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

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
              className="position-relative mx-2 px-3 py-2 rounded-pill nav-hover-effect d-flex align-items-center"
            >
              <Cart size={18} />
              <span className="ms-1 me-2">
                Cart: ${cartInfo.totalValue.toFixed(2)}
              </span>
              {cartInfo.count > 0 && (
                <Badge
                  bg="danger"
                  pill
                  className="position-absolute top-0 start-100 translate-middle p-2 border border-2 border-dark"
                  style={{
                    fontSize: "0.6rem",
                    marginTop: "0.25rem", // Adjust badge position slightly
                  }}
                >
                  {cartInfo.count}
                </Badge>
              )}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;