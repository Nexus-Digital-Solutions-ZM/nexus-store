import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

type PaymentMethod = 'mobile_money' | 'card'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('mobile_money')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerName,
          customerPhone,
          paymentMethod,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Checkout failed.',
        )
      }

      clearCart()

      navigate('/order-success', {
        state: {
          order: data.order,
          payment: data.payment,
        },
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Checkout failed.',
      )
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="page-container">
        <h1>Checkout</h1>
        <p>Your cart is empty. Add some products before checking out.</p>
      </main>
    )
  }

  return (
    <main className="page-container">
      <div className="products-header">
        <p className="eyebrow">SECURE CHECKOUT</p>
        <h1>Checkout</h1>
        <p>Complete your details and choose your payment method.</p>
      </div>

      <div className="cart-layout">
        <form onSubmit={handleSubmit} className="cart-summary">
          <h2>Customer Details</h2>

          <label>
            Name
            <input
              type="text"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              required
              placeholder="Your full name"
            />
          </label>

          <label>
            Phone Number
            <input
              type="tel"
              value={customerPhone}
              onChange={(event) => setCustomerPhone(event.target.value)}
              required
              placeholder="0971234567"
            />
          </label>

          <h2>Payment Method</h2>

          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="mobile_money"
              checked={paymentMethod === 'mobile_money'}
              onChange={() => setPaymentMethod('mobile_money')}
            />
            Mobile Money
          </label>

          <label>
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
            />
            Visa / Card
          </label>

          {error && (
            <div className="products-message error-message">
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay K${total}`}
          </button>
        </form>

        <aside className="cart-summary">
          <h2>Order Summary</h2>

          {items.map((item) => (
            <div key={item.productId}>
              <p>
                {item.name} × {item.quantity}
              </p>
              <strong>
                K{item.price * item.quantity}
              </strong>
            </div>
          ))}

          <hr />

          <h3>Total: K{total}</h3>
        </aside>
      </div>
    </main>
  )
}