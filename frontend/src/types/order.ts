import type { CartItem } from './product'

export type OrderStatus = 'pending' | 'paid' | 'failed'

export type Order = {
  id: string
  status: OrderStatus
  items: CartItem[]
  total: number
  createdAt?: string
}