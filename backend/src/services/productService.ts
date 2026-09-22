import { productRepository } from "../repositories/productRepository.js";
import type { ProductRecord } from "../types/product.js";

export const productService = {
  async listProducts(): Promise<ProductRecord[]> {
    return productRepository.findAll();
  },

  async getProduct(id: string): Promise<ProductRecord | null> {
    return productRepository.findById(id);
  },
};