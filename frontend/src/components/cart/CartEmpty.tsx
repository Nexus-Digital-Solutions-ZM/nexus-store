import { Link } from 'react-router-dom'

export default function CartEmpty() {
  return (
    <div className="cart-empty">
      <span>🛒</span>
      <h1>Your cart is empty</h1>
      <p>Add some products before checking out.</p>

      <Link to="/products" className="primary-button">
        Browse Products
      </Link>
    </div>
  )
}