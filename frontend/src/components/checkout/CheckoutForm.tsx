import { useState } from 'react'
import type { PaymentMethod } from '../../types/payment'
import PaymentMethodSelector from './PaymentMethodSelector'

type CheckoutFormProps = {
  onSubmit: (data: {
    name: string
    phone: string
    paymentMethod: PaymentMethod
  }) => void
  loading?: boolean
}

export default function CheckoutForm({
  onSubmit,
  loading = false,
}: CheckoutFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim() || !paymentMethod) {
      return
    }

    onSubmit({
      name: name.trim(),
      phone: phone.trim(),
      paymentMethod,
    })
  }

  return (
    <form className="checkout-form" onSubmit={handleSubmit}>
      <div className="checkout-section">
        <h2>Customer Details</h2>

        <label>
          Full Name
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            required
          />
        </label>
      </div>

      <div className="checkout-section">
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={setPaymentMethod}
        />

        {paymentMethod === 'mobile_money' && (
          <div className="payment-details">
            <label>
              Mobile Money Number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="0970000000"
                required
              />
            </label>

            <p className="payment-hint">
              You will receive a payment prompt on this number.
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="payment-details">
            <label>
              Card Number
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                required
              />
            </label>

            <label>
              Cardholder Name
              <input
                type="text"
                placeholder="Name on card"
                required
              />
            </label>

            <div className="card-row">
              <label>
                Expiry Date
                <input
                  type="text"
                  placeholder="MM/YY"
                  required
                />
              </label>

              <label>
                CVV
                <input
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="checkout-submit"
        disabled={loading || !paymentMethod}
      >
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  )
}