import { runTransaction } from "../database/db.js";
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
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError(400, "INVALID_QUANTITY", "Restock quantity must be positive");
    }

    const now = formatDateForStorage();

    return runTransaction(async () => {
      const product = await productRepository.findById(productId);
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", `Product ${productId} not found`);
      }

      const newStock = product.stock + quantity;

      await productRepository.updateStock(productId, newStock, now);

      return inventoryRepository.create({
        id: generateId("im"),
        productId,
        quantity,
        type: "restock",
        previousStock: product.stock,
        newStock,
        createdAt: now,
      });
    });
  },

  async correction(productId: string, newStock: number): Promise<InventoryMovement> {
    if (!Number.isInteger(newStock) || newStock < 0) {
      throw new AppError(400, "INVALID_STOCK", "Stock cannot be negative");
    }

    const now = formatDateForStorage();

    return runTransaction(async () => {
      const product = await productRepository.findById(productId);
      if (!product) {
        throw new AppError(404, "PRODUCT_NOT_FOUND", `Product ${productId} not found`);
      }

      const quantity = newStock - product.stock;

      await productRepository.updateStock(productId, newStock, now);

      return inventoryRepository.create({
        id: generateId("im"),
        productId,
        quantity: Math.abs(quantity),
        type: "correction",
        previousStock: product.stock,
        newStock,
        createdAt: now,
      });
    });
  },
};