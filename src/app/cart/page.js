"use client";
import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Image,
  Form,
  Modal,
  Alert,
  InputGroup,
} from "react-bootstrap";
import { CartService } from "@/services/cartService";
import { Trash } from "react-bootstrap-icons"; // for empty cart button

export default function ShoppingCart() {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [totalPayable, setTotalPayable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState(""); // for success/error after payment

  // Fetches cart data and calculates totals
  const fetchCartData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await CartService.getCart();
      setCart(response.data);
      calculateTotals(response.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
    // Listen for cart updates from other components (e.g., Navbar, ProductCard)
    const handleCartUpdateEvent = () => fetchCartData();
    window.addEventListener("cartUpdated", handleCartUpdateEvent);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdateEvent);
    };
  }, []);

  // Calculates subtotal, delivery fee, and total payable amount
  const calculateTotals = (items) => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    // Delivery fee: 50 if subtotal < 1000, else 0
    const newDeliveryFee = newSubtotal < 1000 && newSubtotal > 0 ? 50 : 0;

    setSubtotal(newSubtotal);
    setDeliveryFee(newDeliveryFee);
    setTotalPayable(newSubtotal + newDeliveryFee);
  };

  // Handles quantity change for an item in the cart
  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return; // Quantity cannot be less than 1
    try {
      const itemToUpdate = cart.find((item) => item.id === itemId);
      if (itemToUpdate) {
        await CartService.updateItemInCart(itemId, {
          ...itemToUpdate,
          quantity: newQuantity,
        });
        fetchCartData();
        window.dispatchEvent(new CustomEvent("cartUpdated")); // ensure navbar updates
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update item quantity.");
    }
  };

  // Handles removal of an item from the cart
  const handleRemoveItem = async (itemId) => {
    try {
      await CartService.removeItem(itemId);
      fetchCartData(); // Refresh cart
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item from cart.");
    }
  };

  const handleNoteChange = async (itemId, newNote) => {
    try {
      const itemToUpdate = cart.find((item) => item.id === itemId);
      if (itemToUpdate) {
        await CartService.updateItemInCart(itemId, {
          ...itemToUpdate,
          note: newNote,
        });
        // update local cart state
        const updatedCart = cart.map((item) =>
          item.id === itemId ? { ...item, note: newNote } : item
        );
        setCart(updatedCart);
      }
    } catch (err) {
      console.error("Error updating note:", err);
      setError("Failed to save note.");
    }
  };

  // handles emptying the entire cart
  const handleEmptyCart = async () => {
    if (
      !window.confirm(
        "Are you sure you want to remove all items from your cart?"
      )
    ) {
      return;
    }
    try {
      await CartService.clearCart();
      fetchCartData(); // refresh cart (should be empty)
      window.dispatchEvent(new CustomEvent("cartUpdated"));
      setPaymentMessage(""); // clear any previous payment messages
    } catch (err) {
      console.error("Error emptying cart:", err);
      setError("Failed to empty cart.");
    }
  };

  // Opens the checkout summary modal
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      setError("Your cart is empty. Add items before proceeding to checkout.");
      return;
    }
    setError(null);
    setPaymentMessage("");
    setShowCheckoutModal(true);
  };

  // Handles the final payment confirmation
  const handleConfirmPayment = async () => {
    try {
      await CartService.clearCart();
      setShowCheckoutModal(false);
      setPaymentMessage(
        "Payment successful! Your order is confirmed and cart has been cleared."
      );
      fetchCartData(); // Refresh cart (will be empty)
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    } catch (err) {
      console.error("Error during payment confirmation:", err);
      setPaymentMessage("Payment failed. Please try again.");
    }
  };

  if (loading) return <div className="text-center py-5">Loading cart...</div>;

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="text-gradient">Shopping Cart</h1>
        {cart.length > 0 && (
          <Button variant="outline-danger" onClick={handleEmptyCart}>
            <Trash className="me-2" /> Empty Cart
          </Button>
        )}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      {paymentMessage && (
        <Alert
          variant={
            paymentMessage.includes("successful") ? "success" : "danger"
          }
        >
          {paymentMessage}
        </Alert>
      )}

      {cart.length === 0 && !loading && !paymentMessage && (
        <Alert variant="info">Your shopping cart is currently empty.</Alert>
      )}

      {cart.length > 0 && (
        <>
          <Table striped bordered hover responsive className="align-middle">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Note</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Image
                      src={item.image || "/placeholder.jpg"} // Fallback image
                      alt={item.title}
                      thumbnail
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "contain",
                      }}
                    />
                  </td>
                  <td>{item.title}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    <InputGroup size="sm" style={{ maxWidth: "120px" }}>
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <Form.Control
                        type="text"
                        readOnly
                        value={item.quantity}
                        className="text-center"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                      >
                        +
                      </Button>
                    </InputGroup>
                  </td>
                  <td>
                    <Form.Control
                      as="textarea"
                      rows={1}
                      placeholder="e.g., gift wrap"
                      defaultValue={item.note || ""}
                      onBlur={(e) => handleNoteChange(item.id, e.target.value)}
                      style={{ fontSize: "0.9rem", minWidth: "150px" }}
                    />
                  </td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-end mt-4">
            <h4>Subtotal: ${subtotal.toFixed(2)}</h4>
            {deliveryFee > 0 && (
              <p className="text-muted">
                Delivery Fee: ${deliveryFee.toFixed(2)}
              </p>
            )}
            <h3 className="text-gradient">
              Total Payable: ${totalPayable.toFixed(2)}
            </h3>

            {deliveryFee === 0 && subtotal > 0 && (
              <div className="text-success mb-2">
                🎉 Free delivery applied (orders over $1000)!
              </div>
            )}
            {deliveryFee > 0 && subtotal > 0 && (
              <div className="text-muted mb-2">
                Add ${(1000 - subtotal).toFixed(2)} more to your order for
                FREE delivery!
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="mt-3 nav-hover-effect"
              onClick={handleProceedToCheckout}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </Button>
          </div>
        </>
      )}

      {/* Checkout Summary Modal */}
      <Modal show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)} centered>
        <Modal.Header closeButton className="border-primary">
          <Modal.Title className="text-gradient">Order Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
          <p><strong>Delivery Fee:</strong> ${deliveryFee.toFixed(2)}</p>
          <hr />
          <p className="fw-bold fs-5">
            Total Amount to be Paid: ${totalPayable.toFixed(2)}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmPayment}
            className="nav-hover-effect"
          >
            Confirm Payment
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
