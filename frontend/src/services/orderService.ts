<<<<<<< HEAD
export const orderService = {
  async createOrder(): Promise<unknown> {
    return {};
  },
};
=======
import type { Order } from '../types/order'
import type { Payment } from '../types/payment'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type CheckoutRequest = {
  items: { productId: string; quantity: number }[]
  paymentMethod: 'mobile_money' | 'card'
  customer: {
    name: string
    phone: string
  }
  mobileMoneyNetwork?: 'mtn' | 'airtel' | 'zamtel'
}

type CheckoutResponse = {
  order: Order
  payment: Payment
}

export async function checkoutOrder(
  request: CheckoutRequest,
): Promise<CheckoutResponse> {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || data.error || 'Checkout failed.')
  }

  return data as CheckoutResponse
}
>>>>>>> 0396dbe (feat: complete Nexus Store frontend and backend)
