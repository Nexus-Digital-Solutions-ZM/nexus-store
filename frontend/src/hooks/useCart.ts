export function useCart() {
  return {
    items: [],
    addItem: () => undefined,
    removeItem: () => undefined,
    updateQuantity: () => undefined,
    clearCart: () => undefined,
    total: 0,
  };
}
