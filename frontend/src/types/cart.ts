export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inStock: number;
}

export interface CartState {
  items: CartItem[];
  total: number;
}