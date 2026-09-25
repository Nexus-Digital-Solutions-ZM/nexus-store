import { useEffect, useState } from 'react'
import type { Product } from '../types/product'
import { getProducts } from '../services/productService'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)

        const data = await getProducts()
        setProducts(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load products.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return {
    products,
    loading,
    error,
  }
}