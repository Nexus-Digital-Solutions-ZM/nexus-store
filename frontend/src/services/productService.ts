import type { Product } from '../types/product'
import { apiRequest } from './api'

type ProductsResponse = {
  products: Product[]
}

export async function getProducts(): Promise<Product[]> {
  const response = await apiRequest<ProductsResponse>('/products')

  return response.products
}

export async function getProduct(id: string): Promise<Product> {
  return apiRequest<Product>(`/products/${id}`)
}