import { inventoryRepository } from "../repositories/inventoryRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import type { InventoryMovement } from "../types/inventory.js";
import { AppError } from "../errors/AppError.js";
import { generateId } from "../utils/generateId.js";
import { formatDateForStorage } from "../utils/date.js";

export const inventoryService = {
  async getMovements(): Promise<InventoryMovement[]> {
    return inventoryRepository.findAll();
  },

  async restock(productId: string, quantity: number): Promise<InventoryMovement> {
    if (quantity <= 0) {
      throw new AppError(400, "INVALID_QUANTITY", "Restock quantity must be positive");
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", `Product ${productId} not found`);
    }

    const now = formatDateForStorage();
    const newStock = product.stock + quantity;

    const movement = await inventoryRepository.create({
      id: generateId("im"),
      productId,
      quantity,
      type: "restock",
      previousStock: product.stock,
      newStock,
      createdAt: now,
    });

    return movement;
  },

  async correction(productId: string, newStock: number): Promise<InventoryMovement> {
    if (newStock < 0) {
      throw new AppError(400, "INVALID_STOCK", "Stock cannot be negative");
    }

    const product = await productRepository.findById(productId);
    if (!product) {
      throw new AppError(404, "PRODUCT_NOT_FOUND", `Product ${productId} not found`);
    }

    const now = formatDateForStorage();
    const quantity = newStock - product.stock;

    const movement = await inventoryRepository.create({
      id: generateId("im"),
      productId,
      quantity: Math.abs(quantity),
      type: "correction",
      previousStock: product.stock,
      newStock,
      createdAt: now,
    });

    return movement;
  },
};