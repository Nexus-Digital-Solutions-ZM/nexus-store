import { Link } from 'react-router-dom'

type CartSummaryProps = {
  total: number
}

export default function CartSummary({ total }: CartSummaryProps) {
  return (
    <aside className="cart-summary">
      <h2>Order Summary</h2>
      <p>Total: K{total}</p>

      <Link to="/checkout" className="primary-button">
        Proceed to Checkout
      </Link>
    </aside>
  )
}