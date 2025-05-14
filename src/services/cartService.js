import api from "@/utils/api";

// Service for handling shopping cart operations
export const CartService = {
  // Fetches all items in the shopping cart
  getCart: () => api.get("/shoppingcart"),

  // Adds an item to the shopping cart
  addToCart: (item) =>
    api.post("/shoppingcart", {
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
      note: item.note || "", // include note, default to empty string
    }),

  // updates an existing item in the shopping cart (e.g., quantity, note)
  updateItemInCart: (id, updatedItem) =>
    api.put(`/shoppingcart/${id}`, updatedItem),

  // Removes an item from the shopping cart
  removeItem: (id) => api.delete(`/shoppingcart/${id}`),

  // Clears all items from the shopping cart
  clearCart: async () => {
    try {
      const response = await api.get("/shoppingcart");
      const items = response.data;
      // we delete each item individually.
      for (const item of items) {
        await api.delete(`/shoppingcart/${item.id}`);
      }
      return { success: true, message: "Cart cleared successfully." };
    } catch (error) {
      console.error("Error clearing cart:", error);
      return { success: false, message: "Failed to clear cart." };
    }
  },
};