import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CheckoutForm from '../components/checkout/CheckoutForm'
import OrderSummary from '../components/checkout/OrderSummary'
import { useCart } from '../context/useCart'
import type { PaymentMethod } from '../types/payment'

export default function CheckoutPage() {
  const { items, total, clearCart} = useCart()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <main className="page-container">
        <h1>Checkout</h1>

        <div className="empty-state">
          <p>Your cart is empty.</p>
          <Link to="/products">Browse Products</Link>
        </div>
      </main>
    )
  }

  async function handleCheckout(data: {
    name: string
    phone: string
    paymentMethod: PaymentMethod
  }) {
    setLoading(true)

    console.log('Checkout data:', data)

    // Temporary mock checkout.
    // This will be replaced with the backend API call.
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setLoading(false)
clearCart()
navigate('/order-success')
  }

  return (
    <main className="page-container checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-layout">
        <section>
          <CheckoutForm
            onSubmit={handleCheckout}
            loading={loading}
          />
        </section>

        <aside>
          <OrderSummary
            items={items}
            total={total}
          />
        </aside>
      </div>
    </main>
  )
}