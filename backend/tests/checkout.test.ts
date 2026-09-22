import { describe, it, expect } from "vitest";
import { productService } from "../src/services/productService.js";
import { checkoutService } from "../src/services/checkoutService.js";
import { AppError } from "../src/errors/AppError.js";
import { db } from "../src/database/db.js";

describe("Single-item checkout", () => {
  it("should succeed with sufficient stock", async () => {
    const result = await checkoutService.checkout({
      items: [{ productId: "product-1", quantity: 1 }],
      paymentMethod: "mobile_money",
      customer: { name: "John", phone: "5551234567" },
    });
    expect(result.order.id).toBeDefined();
    expect(result.order.status).toBe("paid");
    expect(result.payment.status).toBe("success");
    expect(result.payment.method).toBe("mobile_money");
    expect(result.payment.transactionId).toBeDefined();
  });
});

describe("Multi-item checkout", () => {
  it("should succeed with multiple items", async () => {
    const result = await checkoutService.checkout({
      items: [
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 3 },
      ],
      paymentMethod: "card",
      customer: { name: "Jane", phone: "5559876543" },
    });
    expect(result.order.id).toBeDefined();
    expect(result.order.total).toBe(350);
    expect(result.payment.status).toBe("success");
  });
});

describe("Insufficient stock", () => {
  it("should fail with OUT_OF_STOCK", async () => {
    const error = await checkoutService
      .checkout({
        items: [{ productId: "product-1", quantity: 999 }],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("OUT_OF_STOCK");
    expect(error.statusCode).toBe(409);
  });
});

describe("Missing product", () => {
  it("should fail with PRODUCT_NOT_FOUND", async () => {
    const error = await checkoutService
      .checkout({
        items: [{ productId: "missing", quantity: 1 }],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("PRODUCT_NOT_FOUND");
  });
});

describe("Invalid quantity", () => {
  it("zero quantity should fail", async () => {
    const error = await checkoutService
      .checkout({
        items: [{ productId: "product-1", quantity: 0 }],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_QUANTITY");
  });

  it("negative quantity should fail", async () => {
    const error = await checkoutService
      .checkout({
        items: [{ productId: "product-1", quantity: -1 }],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("INVALID_QUANTITY");
  });
});

describe("Atomicity", () => {
  it("should rollback entire checkout when one item is out of stock", async () => {
    const error = await checkoutService
      .checkout({
        items: [
          { productId: "product-1", quantity: 1 },
          { productId: "product-3", quantity: 1 },
        ],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("OUT_OF_STOCK");

    const p1 = await productService.getProduct("product-1");
    const p3 = await productService.getProduct("product-3");
    expect(p1!.stock).toBe(10);
    expect(p3!.stock).toBe(0);
  });
});

describe("Concurrency", () => {
  it("only one checkout succeeds when stock is 1", async () => {
    await db.run("UPDATE products SET stock = 1 WHERE id = 'product-2'");

    const result = await checkoutService.checkout(
      {
        items: [{ productId: "product-2", quantity: 1 }],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      },
    );
    expect(result.order.id).toBeDefined();

    const error = await checkoutService
      .checkout({
        items: [{ productId: "product-2", quantity: 1 }],
        paymentMethod: "mobile_money",
        customer: { name: "Test", phone: "5555555555" },
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("OUT_OF_STOCK");

    const product = await productService.getProduct("product-2");
    expect(product!.stock).toBe(0);
  });
});

describe("Historical pricing", () => {
  it("order preserves original product price", async () => {
    const product = await productService.getProduct("product-1");
    expect(product!.price).toBe(100);
  });
});