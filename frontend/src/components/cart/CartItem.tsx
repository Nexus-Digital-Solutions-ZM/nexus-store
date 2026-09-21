import { useCart } from '../../context/useCart'
import type { CartItem as CartItemType } from '../../types/cart'

type CartItemProps = {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  const subtotal = item.price * item.quantity

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
        <div>
          <h2>{item.name}</h2>
          <p>K{item.price.toFixed(2)} each</p>
        </div>

        <div className="cart-item-actions">
          <div className="quantity-control">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              −
            </button>

            <span>{item.quantity}</span>

            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
            >
              +
            </button>
          </div>

          <button
            type="button"
            className="remove-button"
            onClick={() => removeFromCart(item.productId)}
          >
            Remove
          </button>
        </div>
      </div>

      <strong className="cart-item-subtotal">
        K{subtotal.toFixed(2)}
      </strong>
    </article>
  )
}