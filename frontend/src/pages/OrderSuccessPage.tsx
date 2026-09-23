import { Link } from 'react-router-dom'

export default function OrderSuccessPage() {
  return (
    <main className="page-container">
      <div className="order-result">
        <div className="order-result-icon">✓</div>

        <p className="eyebrow">ORDER COMPLETE</p>

        <h1>Order Successful!</h1>

        <p>
          Your order has been received successfully.
        </p>

        <Link to="/products" className="primary-button">
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}