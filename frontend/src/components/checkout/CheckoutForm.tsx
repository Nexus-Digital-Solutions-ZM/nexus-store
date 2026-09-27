import { useState, type FormEvent } from 'react'
import type { PaymentMethod } from '../../types/payment'
import PaymentMethodSelector from './PaymentMethodSelector'

type CheckoutFormProps = {
  onSubmit: (data: CheckoutData) => void
  loading?: boolean
}

type CheckoutData = {
  name: string
  phone: string
  paymentMethod: PaymentMethod
  cardNumber?: string
  cardholderName?: string
  expiry?: string
  cvv?: string
  mobileMoneyNetwork?: 'mtn' | 'airtel' | 'zamtel'
}

type ValidationErrors = {
  name?: string
  phone?: string
  paymentMethod?: string
  cardNumber?: string
  cardholderName?: string
  expiry?: string
  cvv?: string
  mobileMoneyNetwork?: string
}

const NETWORK_PLACEHOLDERS: Record<string, string> = {
  mtn: '096XXXXXXX',
  airtel: '097XXXXXXX',
  zamtel: '095XXXXXXX',
}

const NETWORK_LABELS: Record<string, string> = {
  mtn: 'MTN',
  airtel: 'Airtel',
  zamtel: 'Zamtel',
}

const NETWORK_LOGOS: Record<string, string> = {
  mtn: '/logos/mtn.svg',
  airtel: '/logos/airtel.svg',
  zamtel: '/logos/zamtel.svg',
}

function validateForm(data: CheckoutData, paymentMethod: PaymentMethod | null): ValidationErrors {
  const errors: ValidationErrors = {}

  if (!data.name.trim()) {
    errors.name = 'Full name is required'
  }

  if (!paymentMethod) {
    errors.paymentMethod = 'Please select a payment method'
  }

  if (paymentMethod === 'mobile_money') {
    if (!data.mobileMoneyNetwork) {
      errors.mobileMoneyNetwork = 'Please select a mobile money network'
    }
    if (!data.phone.trim()) {
      errors.phone = 'Mobile money number is required'
    } else if (!/^0\d{9}$/.test(data.phone.replace(/\s/g, ''))) {
      const example = data.mobileMoneyNetwork ? NETWORK_PLACEHOLDERS[data.mobileMoneyNetwork] : '096XXXXXXX'
      errors.phone = `Enter a valid 10-digit mobile number (e.g., ${example})`
    }
  }

  if (paymentMethod === 'card') {
    if (!data.cardNumber?.trim()) {
      errors.cardNumber = 'Card number is required'
    } else if (!/^\d{16}$/.test(data.cardNumber.replace(/\s/g, ''))) {
      errors.cardNumber = 'Enter a valid 16-digit card number'
    }

    if (!data.cardholderName?.trim()) {
      errors.cardholderName = 'Cardholder name is required'
    }

    if (!data.expiry?.trim()) {
      errors.expiry = 'Expiry date is required'
    } else if (!/^\d{2}\/\d{2}$/.test(data.expiry)) {
      errors.expiry = 'Enter expiry as MM/YY'
    }

    if (!data.cvv?.trim()) {
      errors.cvv = 'CVV is required'
    } else if (!/^\d{3,4}$/.test(data.cvv)) {
      errors.cvv = 'Enter a valid 3-4 digit CVV'
    }
  }

  return errors
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16)
  return digits.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }
  return digits
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  return digits
}

export default function CheckoutForm({
  onSubmit,
  loading = false,
}: CheckoutFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null)
  const [mobileMoneyNetwork, setMobileMoneyNetwork] = useState<'mtn' | 'airtel' | 'zamtel' | ''>('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function handleBlur(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data: CheckoutData = {
      name,
      phone: phone.replace(/\s/g, ''),
      paymentMethod: paymentMethod || 'mobile_money',
      cardNumber: cardNumber.replace(/\s/g, ''),
      cardholderName,
      expiry,
      cvv,
      mobileMoneyNetwork: mobileMoneyNetwork || undefined,
    }

    const validationErrors = validateForm(data, paymentMethod)
    setErrors(validationErrors)

    const allTouched = {
      name: true,
      phone: true,
      paymentMethod: true,
      cardNumber: true,
      cardholderName: true,
      expiry: true,
      cvv: true,
      mobileMoneyNetwork: true,
    }
    setTouched(allTouched)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit(data)
    }
  }

  const currentPlaceholder = mobileMoneyNetwork ? NETWORK_PLACEHOLDERS[mobileMoneyNetwork] : '096XXXXXXX'

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
            onBlur={() => handleBlur('name')}
            placeholder="Enter your full name"
            required
          />
          {touched.name && errors.name && (
            <span className="field-error">{errors.name}</span>
          )}
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
              Mobile Money Network
              <div className="network-options">
                {(['mtn', 'airtel', 'zamtel'] as const).map((network) => (
                  <button
                    key={network}
                    type="button"
                    className={`network-option ${mobileMoneyNetwork === network ? 'active' : ''}`}
                    onClick={() => {
                      setMobileMoneyNetwork(network)
                      handleBlur('mobileMoneyNetwork')
                    }}
                  >
                    <img
                      src={NETWORK_LOGOS[network]}
                      alt={`${NETWORK_LABELS[network]} logo`}
                      className="network-logo"
                    />
                    <span>{NETWORK_LABELS[network]}</span>
                  </button>
                ))}
              </div>
              {touched.mobileMoneyNetwork && errors.mobileMoneyNetwork && (
                <span className="field-error">{errors.mobileMoneyNetwork}</span>
              )}
            </label>

            {mobileMoneyNetwork && (
              <label>
                Mobile Money Number
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(formatPhone(event.target.value))}
                  onBlur={() => handleBlur('phone')}
                  placeholder={currentPlaceholder}
                  required
                  inputMode="numeric"
                />
                {touched.phone && errors.phone && (
                  <span className="field-error">{errors.phone}</span>
                )}
              </label>
            )}

            <p className="payment-hint">
              {mobileMoneyNetwork
                ? `Enter your ${NETWORK_LABELS[mobileMoneyNetwork]} number (e.g., ${NETWORK_PLACEHOLDERS[mobileMoneyNetwork]})`
                : 'Select a network above to enter your mobile money number.'}
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="payment-details">
            <label>
              Card Number
              <input
                type="text"
                value={cardNumber}
                onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
                onBlur={() => handleBlur('cardNumber')}
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                maxLength={19}
                required
              />
              {touched.cardNumber && errors.cardNumber && (
                <span className="field-error">{errors.cardNumber}</span>
              )}
            </label>

            <label>
              Cardholder Name
              <input
                type="text"
                value={cardholderName}
                onChange={(event) => setCardholderName(event.target.value)}
                onBlur={() => handleBlur('cardholderName')}
                placeholder="Name on card"
                required
              />
              {touched.cardholderName && errors.cardholderName && (
                <span className="field-error">{errors.cardholderName}</span>
              )}
            </label>

            <div className="card-row">
              <label>
                Expiry Date
                <input
                  type="text"
                  value={expiry}
                  onChange={(event) => setExpiry(formatExpiry(event.target.value))}
                  onBlur={() => handleBlur('expiry')}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                  inputMode="numeric"
                />
                {touched.expiry && errors.expiry && (
                  <span className="field-error">{errors.expiry}</span>
                )}
              </label>

              <label>
                CVV
                <input
                  type="password"
                  value={cvv}
                  onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  onBlur={() => handleBlur('cvv')}
                  placeholder="123"
                  maxLength={4}
                  required
                  inputMode="numeric"
                />
                {touched.cvv && errors.cvv && (
                  <span className="field-error">{errors.cvv}</span>
                )}
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