import type { CartItem as CartItemType } from '../../types/product'
import { useCart } from '../../context/CartContext'

type CartItemProps = {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  return (
    <article className="cart-item">
      <div>
        <h3>{item.name}</h3>
        <p>K{item.price} each</p>
      </div>

      <div>
        <label>
          Quantity:{' '}
          <select
            value={item.quantity}
            onChange={(event) =>
              updateQuantity(item.productId, Number(event.target.value))
            }
          >
            {Array.from({ length: item.stock }, (_, index) => index + 1).map(
              (quantity) => (
                <option key={quantity} value={quantity}>
                  {quantity}
                </option>
              ),
            )}
          </select>
        </label>

        <p>Subtotal: K{item.price * item.quantity}</p>

        <button
          type="button"
          onClick={() => removeFromCart(item.productId)}
        >
          Remove
        </button>
      </div>
    </article>
  )
}