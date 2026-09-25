export interface Product {
  id: string
  name: string
  description: string
  price: number
  image?: string
  stock: number
}

export interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  stock: number
  image?: string
}

export interface Cart {
  items: CartItem[]
  total: number
}