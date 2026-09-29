import { useEffect, useRef, useState } from 'react'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types/product'

type ProductCardProps = {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const [isFlying, setIsFlying] = useState(false)
  const [flyPosition, setFlyPosition] = useState({ x: 0, y: 0 })
  const [cartPosition, setCartPosition] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLElement>(null)
  const flyingRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)

  const isOutOfStock = product.stock <= 0

  useEffect(() => {
    const updateCartPosition = () => {
      const cartLink = document.querySelector('.cart-link')
      if (cartLink) {
        const rect = cartLink.getBoundingClientRect()
        setCartPosition({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        })
      }
    }

    updateCartPosition()
    window.addEventListener('resize', updateCartPosition)
    window.addEventListener('scroll', updateCartPosition, true)

    return () => {
      window.removeEventListener('resize', updateCartPosition)
      window.removeEventListener('scroll', updateCartPosition, true)
    }
  }, [])

  const handleAddToCart = () => {
    if (isOutOfStock || !cardRef.current || !flyingRef.current) {
      return
    }

    const cardRect = cardRef.current.getBoundingClientRect()
    const flyingRect = flyingRef.current.getBoundingClientRect()

    const startX = cardRect.left + cardRect.width / 2 - flyingRect.width / 2
    const startY = cardRect.top + cardRect.height / 2 - flyingRect.height / 2
    const endX = cartPosition.x - flyingRect.width / 2
    const endY = cartPosition.y - flyingRect.height / 2

    setFlyPosition({ x: startX, y: startY })
    setIsFlying(true)

    const flyingEl = flyingRef.current

    if (animationRef.current) {
      animationRef.current.cancel()
    }

    animationRef.current = flyingEl.animate(
      [
        {
          transform: `translate(${startX}px, ${startY}px) scale(1)`,
          opacity: 1,
        },
        {
          transform: `translate(${endX}px, ${endY}px) scale(0.3)`,
          opacity: 0,
        },
      ],
      {
        duration: 700,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
      },
    )

    animationRef.current.onfinish = () => {
      setIsFlying(false)
      animationRef.current = null
    }

    addToCart(product)
  }

  const flyingStyle = {
    left: flyPosition.x,
    top: flyPosition.y,
    opacity: isFlying ? 1 : 0,
    pointerEvents: isFlying ? 'none' : 'none',
    transition: 'none',
  } as React.CSSProperties

  return (
    <>
      <article ref={cardRef} className="product-card">
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
              {isOutOfStock
                ? 'Out of stock'
                : `${product.stock} available`}
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
      </article>

      <div
        ref={flyingRef}
        className="flying-product"
        style={flyingStyle}
        aria-hidden="true"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '12px',
            }}
          />
        ) : (
          <span style={{ fontSize: '1.7rem' }}>🛍️</span>
        )}
      </div>
    </>
  )
}