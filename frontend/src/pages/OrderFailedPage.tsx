import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function OrderFailedPage() {
  const navigate = useNavigate()
  const { items } = useCart()

  function handleRetry() {
    if (items.length > 0) {
      navigate('/checkout')
    } else {
      navigate('/products')
    }
  }

  return (
    <main className="page-container">
      <div className="order-result failed">
        <div className="order-result-icon">?</div>

        <p className="eyebrow">ORDER FAILED</p>

        <h1>Order Could Not Be Completed</h1>

        <p>
          Something went wrong while processing your payment. Your cart has been
          preserved.
        </p>

        <div className="order-actions">
          <button onClick={handleRetry} className="primary-button">
            Try Again
          </button>
          <Link to="/cart" className="secondary-button">
            View Cart
          </Link>
        </div>

        <p className="retry-hint">
          {items.length > 0
            ? 'Your items are waiting in the cart.'
            : 'Your cart appears to be empty. Browse products to start shopping.'}
        </p>

        <Link to="/products" className="primary-button">
          Continue Shopping
        </Link>
      </div>
    </main>
  )
}
