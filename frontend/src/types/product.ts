export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  inStock: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}