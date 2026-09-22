import { describe, it, expect } from "vitest";
import { inventoryService } from "../src/services/inventoryService.js";
import { AppError } from "../src/errors/AppError.js";

describe("Restock", () => {
  it("should record restock movement", async () => {
    const movement = await inventoryService.restock("product-1", 5);
    expect(movement.type).toBe("restock");
    expect(movement.quantity).toBe(5);
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(15);
  });
});

describe("Correction", () => {
  it("should record correction movement", async () => {
    const movement = await inventoryService.correction("product-1", 20);
    expect(movement.type).toBe("correction");
    expect(movement.previousStock).toBe(10);
    expect(movement.newStock).toBe(20);
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
});