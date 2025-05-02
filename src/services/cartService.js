import api from "@/utils/api";

export const CartService = {
  getCart: () => api.get("/shoppingcart"),
  addToCart: (item) => api.post("/shoppingcart", item),
  updateQuantity: (id, quantity) =>
    api.put(`/shoppingcart/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/shoppingcart/${id}`),
  clearCart: () => api.delete("/shoppingcart"),
};
