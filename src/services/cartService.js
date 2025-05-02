import api from "@/utils/api";

export const CartService = {
  getCart: () => api.get("/shoppingcart"),
  addToCart: (item) =>
    api.post("/shoppingcart", {
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    }),
  updateQuantity: (id, quantity) =>
    api.put(`/shoppingcart/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/shoppingcart/${id}`),
  clearCart: () => api.delete("/shoppingcart"),
};
