import type { Product } from '../../types/product'
import ProductCard from './ProductCard'

type ProductListProps = {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  if (products.length === 0) {
    return (
      <div className="empty-products">
        <span>🛍️</span>
        <h2>No products available</h2>
        <p>Check back soon for new products.</p>
      </div>
    )
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}