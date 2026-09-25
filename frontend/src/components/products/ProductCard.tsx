import { useState } from 'react'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/product'

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isFlying, setIsFlying] = useState(false)

  const isOutOfStock = product.stock <= 0

  const handleAddToCart = () => {
    if (isOutOfStock) {
      return
    }

    addToCart(product)

    setIsFlying(true)

    window.setTimeout(() => {
      setIsFlying(false)
    }, 650)
  }

  return (
    <article className="product-card">
      <div className="product-image">
        {product.image ? (
          <img src={product.image} alt={product.name} />
        ) : (
          <span>🛍️</span>
        )}
      </div>

      <div className="product-info">
        <div className="product-heading">
          <h2>{product.name}</h2>

          <span
            className={`stock-badge ${
              isOutOfStock ? 'out-of-stock' : 'in-stock'
            }`}
          >
            {isOutOfStock ? 'Out of stock' : `${product.stock} available`}
          </span>
        </div>

        <p>{product.description}</p>

        <div className="product-footer">
          <strong>K{product.price.toFixed(2)}</strong>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? 'Unavailable' : 'Add to cart'}
          </button>
        </div>
      </div>

      {isFlying && (
        <div className="flying-product" aria-hidden="true">
          🛍️
        </div>
      )}
    </article>
  )
}