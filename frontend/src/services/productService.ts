import type { Product } from '../types/product'

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

type ProductsResponse = {
  products: Product[]
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_BASE_URL}/products`)

  if (!response.ok) {
    throw new Error('Failed to load products.')
  }

  const data: ProductsResponse = await response.json()

  return data.products
}

export async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`)

  if (!response.ok) {
    throw new Error('Failed to load product.')
  }

  return response.json()
}