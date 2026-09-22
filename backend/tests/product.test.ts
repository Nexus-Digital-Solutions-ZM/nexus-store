import { describe, it, expect } from "vitest";
import { productService } from "../src/services/productService.js";

describe("List products", () => {
  it("should list all products", async () => {
    const result = await productService.listProducts();
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("Get product", () => {
  it("should get existing product", async () => {
    const product = await productService.getProduct("product-1");
    expect(product).not.toBeNull();
    expect(product!.id).toBe("product-1");
    expect(product!.name).toBe("Test Product A");
    expect(product!.price).toBe(100);
    expect(product!.stock).toBe(10);
  });

  it("should return null for missing product", async () => {
    const product = await productService.getProduct("nonexistent");
    expect(product).toBeNull();
  });
});