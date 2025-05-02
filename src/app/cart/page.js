"use client";
import { useEffect, useState } from "react";
import { Table, Button, Image } from "react-bootstrap";
import { CartService } from "@/services/cartService";

export default function ShoppingCart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await CartService.getCart();
        setCart(response.data);
        calculateTotal(response.data);
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCart();
    // Listen for cart updates from other components
    window.addEventListener("cartUpdated", fetchCart);

    return () => {
      window.removeEventListener("cartUpdated", fetchCart);
    };
  }, []);

  const calculateTotal = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const delivery = subtotal < 1000 ? 50 : 0;
    setTotal(subtotal + delivery);
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return; // Prevent negative quantities
    try {
      await CartService.updateQuantity(id, newQuantity);
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setCart(updatedCart);
      calculateTotal(updatedCart);
      window.dispatchEvent(new CustomEvent("cartUpdated")); // Notify navbar
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleRemoveItem = async (id) => {
    try {
      await CartService.removeItem(id);
      const updatedCart = cart.filter((item) => item.id !== id);
      setCart(updatedCart);
      calculateTotal(updatedCart);
      window.dispatchEvent(new CustomEvent("cartUpdated")); // Notify navbar
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-gradient mb-4">Shopping Cart</h1>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Image</th>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.id}>
              <td>
                <Image
                  src={item.image}
                  alt={item.title}
                  thumbnail
                  style={{ width: "50px", height: "50px", objectFit: "cover" }}
                />
              </td>
              <td>{item.title}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity - 1)
                    }
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      handleQuantityChange(item.id, item.quantity + 1)
                    }
                  >
                    +
                  </Button>
                </div>
              </td>
              <td>${(item.price * item.quantity).toFixed(2)}</td>
              <td>
                <Button
                  variant="danger"
                  onClick={() => handleRemoveItem(item.id)}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <h4 className="text-gradient">
          Total: ${total.toFixed(2)} (Including Delivery)
        </h4>
        <Button variant="primary" className="mt-3">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
