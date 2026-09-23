import type { PaymentMethod } from '../../types/payment'

type PaymentMethodSelectorProps = {
  value: PaymentMethod | null
  onChange: (method: PaymentMethod) => void
}

export default function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="payment-method-selector">
      <h3>Choose Payment Method</h3>

      <div className="payment-options">
        <button
          type="button"
          className={
            value === 'mobile_money'
              ? 'payment-option active'
              : 'payment-option'
          }
          onClick={() => onChange('mobile_money')}
        >
          <span>📱</span>

          <div>
            <strong>Mobile Money</strong>
            <small>MTN, Airtel or Zamtel</small>
          </div>
        </button>

        <button
          type="button"
          className={
            value === 'card'
              ? 'payment-option active'
              : 'payment-option'
          }
          onClick={() => onChange('card')}
        >
          <span>💳</span>

          <div>
            <strong>Visa / Card</strong>
            <small>Pay securely with your card</small>
          </div>
        </button>
      </div>
    </div>
  )
}