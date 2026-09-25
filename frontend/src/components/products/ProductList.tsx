import type { Product } from '../../types/product'
import { useCart } from '../../context/CartContext'

type ProductListProps = {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const { addToCart } = useCart()

  return (
    <section className="product-grid">
      {products.map((product) => {
        const outOfStock = product.stock <= 0

        return (
          <article key={product.id} className="product-card">
            <div>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <strong>K{product.price}</strong>

              <p>
                {outOfStock
                  ? 'Out of stock'
                  : `${product.stock} in stock`}
              </p>
            </div>

            <button
              type="button"
              disabled={outOfStock}
              onClick={() => addToCart(product)}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </article>
        )
      })}
    </section>
  )
}