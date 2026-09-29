import { describe, it, expect } from "vitest";
import { inventoryService } from "../src/services/inventoryService.js";
import { productRepository } from "../src/repositories/productRepository.js";
import { AppError } from "../src/errors/AppError.js";

async function stockOf(productId: string): Promise<number> {
  const product = await productRepository.findById(productId);
  return product!.stock;
}

describe("Restock", () => {
  it("should record restock movement", async () => {
    const movement = await inventoryService.restock("product-1", 5);
    expect(movement.type).toBe("restock");
    expect(movement.quantity).toBe(5);
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(15);
  });

  it("should increase the persisted product stock", async () => {
    await inventoryService.restock("product-1", 5);
    expect(await stockOf("product-1")).toBe(15);
  });

  it("should accumulate across repeated restocks", async () => {
    await inventoryService.restock("product-1", 5);
    await inventoryService.restock("product-1", 7);
    expect(await stockOf("product-1")).toBe(22);
  });

  it("should keep persisted stock and movement history in agreement", async () => {
    await inventoryService.restock("product-2", 4);

    const movements = await inventoryService.getMovements();
    const movement = movements.find((entry) => entry.productId === "product-2");

    expect(movement).toBeDefined();
    expect(movement!.newStock).toBe(await stockOf("product-2"));
  });
});

describe("Restock validation", () => {
  it("should reject zero quantity without changing stock", async () => {
    const error = await inventoryService.restock("product-1", 0).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_QUANTITY");
    expect(await stockOf("product-1")).toBe(10);
  });

  it("should reject negative quantity without changing stock", async () => {
    const error = await inventoryService.restock("product-1", -3).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_QUANTITY");
    expect(await stockOf("product-1")).toBe(10);
  });

  it("should reject non-integer quantity without changing stock", async () => {
    const error = await inventoryService.restock("product-1", 1.5).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_QUANTITY");
    expect(await stockOf("product-1")).toBe(10);
  });

  it("should not record a movement when validation fails", async () => {
    await inventoryService.restock("product-1", -1).catch(() => undefined);
    expect(await inventoryService.getMovements()).toHaveLength(0);
  });
});

describe("Correction", () => {
  it("should record correction movement", async () => {
    const movement = await inventoryService.correction("product-1", 20);
    expect(movement.type).toBe("correction");
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(20);
  });

  it("should set the persisted product stock to the requested value", async () => {
    await inventoryService.correction("product-1", 20);
    expect(await stockOf("product-1")).toBe(20);
  });

  it("should support reducing stock", async () => {
    const movement = await inventoryService.correction("product-1", 4);
    expect(movement.quantity).toBe(6);
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(4);
    expect(await stockOf("product-1")).toBe(4);
  });

  it("should allow correcting an out-of-stock product back to zero", async () => {
    const movement = await inventoryService.correction("product-3", 0);
    expect(movement.previousStock).toBe(0);
    expect(movement.newStock).toBe(0);
    expect(await stockOf("product-3")).toBe(0);
  });
});

describe("Correction validation", () => {
  it("should reject negative stock without changing stock", async () => {
    const error = await inventoryService.correction("product-1", -1).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_STOCK");
    expect(await stockOf("product-1")).toBe(10);
  });

  it("should reject non-integer stock without changing stock", async () => {
    const error = await inventoryService.correction("product-1", 2.5).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_STOCK");
    expect(await stockOf("product-1")).toBe(10);
  });

  it("should not record a movement when validation fails", async () => {
    await inventoryService.correction("product-1", -5).catch(() => undefined);
    expect(await inventoryService.getMovements()).toHaveLength(0);
  });
});

describe("Missing product", () => {
  it("should fail restock for missing product", async () => {
    const error = await inventoryService.restock("nonexistent", 5).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("PRODUCT_NOT_FOUND");
  });

  it("should fail correction for missing product", async () => {
    const error = await inventoryService.correction("nonexistent", 10).catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("PRODUCT_NOT_FOUND");
  });

  it("should not record a movement for a missing product", async () => {
    await inventoryService.restock("nonexistent", 5).catch(() => undefined);
    await inventoryService.correction("nonexistent", 10).catch(() => undefined);
    expect(await inventoryService.getMovements()).toHaveLength(0);
  });
});
