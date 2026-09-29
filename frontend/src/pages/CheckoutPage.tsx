import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { checkoutOrder } from '../services/orderService'
import CheckoutForm from '../components/checkout/CheckoutForm'
import OrderSummary from '../components/checkout/OrderSummary'

type CheckoutData = {
  name: string
  phone: string
  paymentMethod: 'mobile_money' | 'card'
  cardNumber?: string
  cardholderName?: string
  expiry?: string
  cvv?: string
  mobileMoneyNetwork?: 'mtn' | 'airtel' | 'zamtel'
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleCheckout(data: CheckoutData) {
    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    if (submitting) return

    try {
      setSubmitting(true)
      setLoading(true)
      setError(null)

      const response = await checkoutOrder({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: data.paymentMethod,
        customer: {
          name: data.name,
          phone: data.phone,
        },
        mobileMoneyNetwork: data.mobileMoneyNetwork,
      })

      clearCart()

      navigate('/order-success', {
        state: {
          order: response.order,
          payment: {
            ...response.payment,
            mobileMoneyNetwork: data.mobileMoneyNetwork,
          },
        },
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Checkout failed. Please try again.',
      )
    } finally {
      setLoading(false)
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <main className="page-container">
        <div className="products-header">
          <p className="eyebrow">SECURE CHECKOUT</p>
          <h1>Checkout</h1>
          <p>Your cart is empty. Add some products before checking out.</p>
        </div>
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

      <div className="cart-layout checkout-layout">
        <section className="checkout-form-section">
          <CheckoutForm
            onSubmit={handleCheckout}
            loading={loading}
          />

          {error && (
            <div className="products-message error-message">
              <p>{error}</p>
            </div>
          )}
        </section>

        <aside className="cart-summary">
          <OrderSummary items={items} total={total} />
        </aside>
      </div>
    </main>
  )
}