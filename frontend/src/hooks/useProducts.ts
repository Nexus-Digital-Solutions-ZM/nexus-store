import { useEffect, useState } from 'react'
import { getProducts } from '../services/productService'
import { mockProducts } from '../services/mockProducts'
import type { Product } from '../types/product'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      try {
        setLoading(true)
        setError(null)

        const data = await getProducts()

        if (!cancelled) {
          setProducts(data)
        }
      } catch {
        if (!cancelled) {
          setProducts(mockProducts)
          setError(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [])

  return {
    products,
    loading,
    error,
  }
}