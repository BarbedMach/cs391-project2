"use client";
import { useEffect, useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import api from "@/utils/api";
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
  }, []);

  const calculateTotal = (items) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const delivery = subtotal < 1000 ? 50 : 0;
    setTotal(subtotal + delivery);
  };

  const handleQuantityChange = async (id, quantity) => {
    try {
      await CartService.updateQuantity(id, quantity);
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      setCart(updatedCart);
      calculateTotal(updatedCart);
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
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="text-gradient mb-4">Shopping Cart</h1>

      <Table striped bordered hover>
        <thead>
          <tr>
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
              <td>{item.title}</td>
              <td>${item.price}</td>
              <td>
                <Form.Control
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value))
                  }
                  style={{ width: "80px" }}
                />
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
        <h4 className="text-gradient">Total: ${total.toFixed(2)}</h4>
        <Button
          variant="primary"
          className="mt-3"
          onClick={() => {
            /* Handle checkout */
          }}
        >
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
