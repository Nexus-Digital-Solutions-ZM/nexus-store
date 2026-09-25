import { useProducts } from '../hooks/useProducts'

export default function ProductsPage() {
  const { products, loading, error } = useProducts()

  if (loading) {
    return (
      <section className="page-container">
        <h2>Products</h2>
        <p>Loading products...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-container">
        <h2>Products</h2>
        <p>{error}</p>
      </section>
    )
  }

  return (
    <section className="page-container">
      <h2>Products</h2>

      {products.length === 0 ? (
        <p>No products available.</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p>K{product.price}</p>
             <p>
              {product.stock > 0
                ? `${product.stock} in stock`
                : 'Out of stock'}
            </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}