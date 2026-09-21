import type { CartItem } from './cart'

export type OrderStatus = 'pending' | 'paid' | 'failed'

export type Order = {
  id: string
  status: OrderStatus
  items: CartItem[]
  total: number
  createdAt?: string
}