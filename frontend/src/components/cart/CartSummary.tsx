import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'

export default function CartSummary() {
  const { total, itemCount } = useCart()

  return (
    <aside className="cart-summary">
      <h2>Order Summary</h2>

      <div className="summary-row">
        <span>Items</span>
        <span>{itemCount}</span>
      </div>

      <div className="summary-row total-row">
        <span>Total</span>
        <strong>K{total.toFixed(2)}</strong>
      </div>

      <Link to="/checkout" className="checkout-button">
        Proceed to Checkout
      </Link>
    </aside>
  )
}