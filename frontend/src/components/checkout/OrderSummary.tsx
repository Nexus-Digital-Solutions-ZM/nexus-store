import type { CartItem } from '../../types/cart'

type OrderSummaryProps = {
  items: CartItem[]
  total: number
}

export default function OrderSummary({
  items,
  total,
}: OrderSummaryProps) {
  return (
    <div className="order-summary">
      <h2>Order Summary</h2>

      <div className="order-items">
        {items.map((item) => (
          <div className="order-item" key={item.productId}>
            <div>
              <strong>{item.name}</strong>
              <span>
                {item.quantity} × K{item.price.toFixed(2)}
              </span>
            </div>

            <strong>
              K{(item.price * item.quantity).toFixed(2)}
            </strong>
          </div>
        ))}
      </div>

      <div className="order-total">
        <span>Total</span>
        <strong>K{total.toFixed(2)}</strong>
      </div>
    </div>
  )
}