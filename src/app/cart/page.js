"use client";
import { useEffect, useState } from "react";
import { Table, Button, Image } from "react-bootstrap";
import { CartService } from "@/services/cartService";

export default function ShoppingCart() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [subtotal, setSubtotal] = useState(0);

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
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newDelivery = newSubtotal < 1000 ? 50 : 0;

    setSubtotal(newSubtotal);
    setDeliveryFee(newDelivery);
    setTotal(newSubtotal + newDelivery);
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      // 1. Find the current item
      const currentItem = cart.find((item) => item.id === id);

      // 2. Update with full item data
      await CartService.updateQuantity(id, {
        ...currentItem, // Preserve all existing fields
        quantity: newQuantity, // Update quantity
      });

      // 3. Update local state with full item data
      const updatedCart = cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );

      setCart(updatedCart);
      calculateTotal(updatedCart);
      window.dispatchEvent(new CustomEvent("cartUpdated"));
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
          Total: ${total.toFixed(2)}{" "}
          {deliveryFee > 0 ? (
            <span className="text-muted fs-6">(Including Delivery)</span>
          ) : (
            <span className="text-success fs-6">(No Delivery Fee)</span>
          )}
        </h4>

        {deliveryFee === 0 && subtotal > 0 && (
          <div className="text-success mb-2">
            🎉 Free delivery for orders over $1000!
          </div>
        )}

        {deliveryFee > 0 && (
          <div className="text-muted mb-2">
            Add ${(1000 - subtotal).toFixed(2)} more to get free delivery!
          </div>
        )}

        <Button variant="primary" className="mt-3">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}
