import type { CartItem as CartItemType } from '../../types/product'
import { useCart } from '../../context/CartContext'

type CartItemProps = {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  function handleIncrease() {
    updateQuantity(item.productId, item.quantity + 1)
  }

  function handleDecrease() {
    updateQuantity(item.productId, item.quantity - 1)
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value
    // Only allow digits
    if (!/^\d*$/.test(value)) return

    const num = value === '' ? 0 : parseInt(value, 10)
    if (num >= 1 && num <= item.stock) {
      updateQuantity(item.productId, num)
    } else if (num > item.stock) {
      updateQuantity(item.productId, item.stock)
    }
  }

  function handleBlur(event: React.FocusEvent<HTMLInputElement>) {
    const value = event.target.value
    const num = value === '' ? 1 : parseInt(value, 10)
    if (isNaN(num) || num < 1) {
      updateQuantity(item.productId, 1)
    } else if (num > item.stock) {
      updateQuantity(item.productId, item.stock)
    }
  }

  return (
    <article className="cart-item">
      <div className="cart-item-image">
        {item.image ? (
          <img src={item.image} alt={item.name} />
        ) : (
          <span>🛍️</span>
        )}
      </div>

      <div className="cart-item-details">
        <h2>{item.name}</h2>
        <p>K{item.price.toFixed(2)} each</p>

        <div className="cart-item-actions">
          <div className="quantity-control">
            <button
              type="button"
              className="quantity-btn"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="text"
              className="quantity-input"
              value={item.quantity}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min={1}
              max={item.stock}
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Quantity"
            />
            <button
              type="button"
              className="quantity-btn"
              onClick={handleIncrease}
              disabled={item.quantity >= item.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <p className="cart-item-subtotal">
            Subtotal: K{(item.price * item.quantity).toFixed(2)}
          </p>

          <button
            type="button"
            className="remove-button"
            onClick={() => removeFromCart(item.productId)}
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}