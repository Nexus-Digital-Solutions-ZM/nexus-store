export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
  stock: number
  image?: string
}

export type Cart = {
  items: CartItem[]
  total: number
}