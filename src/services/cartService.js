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
  updateQuantity: (id, updatedItem) =>
    api.put(`/shoppingcart/${id}`, updatedItem),
  removeItem: (id) => api.delete(`/shoppingcart/${id}`),
  clearCart: () => api.delete("/shoppingcart"),
};
