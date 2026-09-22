import { describe, it, expect } from "vitest";
import { checkoutService } from "../src/services/checkoutService.js";
import { paymentService } from "../src/services/paymentService.js";
import { orderService } from "../src/services/orderService.js";
import { productService } from "../src/services/productService.js";
import { AppError } from "../src/errors/AppError.js";
import { db } from "../src/database/db.js";

describe("Payment success", () => {
  it("should process payment successfully", async () => {
    const checkoutResult = await checkoutService.checkout(
      [{ productId: "product-1", quantity: 1 }],
      "mobile_money",
    );

    const payment = await paymentService.confirmPayment({
      orderId: checkoutResult.orderId,
      transactionId: "txn-1",
      method: "mobile_money",
      amount: 100,
    });

    expect(payment.status).toBe("success");
    expect(payment.transactionId).toBe("txn-1");
  });
});

describe("Duplicate payment confirmation", () => {
  it("should not process payment twice", async () => {
    const checkoutResult = await checkoutService.checkout(
      [{ productId: "product-1", quantity: 1 }],
      "mobile_money",
    );

    const payment1 = await paymentService.confirmPayment({
      orderId: checkoutResult.orderId,
      transactionId: "txn-dup",
      method: "mobile_money",
      amount: 100,
    });

    const payment2 = await paymentService.confirmPayment({
      orderId: checkoutResult.orderId,
      transactionId: "txn-dup",
      method: "mobile_money",
      amount: 100,
    });

    expect(payment1.status).toBe("success");
    expect(payment2.status).toBe("success");
  });
});

describe("Payment failure", () => {
  it("should fail payment for non-existent order", async () => {
    const error = await paymentService
      .confirmPayment({
        orderId: "nonexistent",
        transactionId: "txn-fail",
        method: "mobile_money",
        amount: 100,
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("ORDER_NOT_FOUND");
  });

  it("should fail payment for order not pending", async () => {
    const checkoutResult = await checkoutService.checkout(
      [{ productId: "product-1", quantity: 1 }],
      "mobile_money",
    );

    await paymentService.confirmPayment({
      orderId: checkoutResult.orderId,
      transactionId: "txn-first",
      method: "mobile_money",
      amount: 100,
    });

    const error = await paymentService
      .confirmPayment({
        orderId: checkoutResult.orderId,
        transactionId: "txn-second",
        method: "card",
        amount: 100,
      })
      .catch((e) => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.error).toBe("ORDER_NOT_PENDING");
  });
});

describe("Order expiry", () => {
  it("should expire pending payment after 10 minutes", async () => {
    const checkoutResult = await checkoutService.checkout(
      [{ productId: "product-1", quantity: 1 }],
      "mobile_money",
    );

    const order = await orderService.getOrder(checkoutResult.orderId);
    expect(order).not.toBeNull();
    expect(order!.status).toBe("pending_payment");

    await db.run(
      "UPDATE orders SET reservation_expires_at = ? WHERE id = ?",
      ["2020-01-01T00:00:00.000Z", checkoutResult.orderId],
    );

    const { orderExpiryService } = await import("../src/services/orderExpiryService.js");
    await orderExpiryService.checkExpiry(checkoutResult.orderId);

    const updatedOrder = await orderService.getOrder(checkoutResult.orderId);
    expect(updatedOrder!.status).toBe("expired");
  });

  it("should release stock when order expires", async () => {
    const stockBefore = (await productService.getProduct("product-1"))!.stock;
    const checkoutResult = await checkoutService.checkout(
      [{ productId: "product-1", quantity: 2 }],
      "mobile_money",
    );

    const stockAfterCheckout = (await productService.getProduct("product-1"))!.stock;
    expect(stockAfterCheckout).toBe(stockBefore - 2);

    await db.run(
      "UPDATE orders SET reservation_expires_at = ? WHERE id = ?",
      ["2020-01-01T00:00:00.000Z", checkoutResult.orderId],
    );

    const { orderExpiryService } = await import("../src/services/orderExpiryService.js");
    await orderExpiryService.checkExpiry(checkoutResult.orderId);

    const stockFinal = (await productService.getProduct("product-1"))!.stock;
    expect(stockFinal).toBe(stockBefore);
  });

  it("should be safe when called repeatedly on expired order", async () => {
    const checkoutResult = await checkoutService.checkout(
      [{ productId: "product-1", quantity: 2 }],
      "mobile_money",
    );

    await db.run(
      "UPDATE orders SET reservation_expires_at = ? WHERE id = ?",
      ["2020-01-01T00:00:00.000Z", checkoutResult.orderId],
    );

    const { orderExpiryService } = await import("../src/services/orderExpiryService.js");
    await orderExpiryService.checkExpiry(checkoutResult.orderId);
    await orderExpiryService.checkExpiry(checkoutResult.orderId);
    await orderExpiryService.checkExpiry(checkoutResult.orderId);

    const stock = (await productService.getProduct("product-1"))!.stock;
    expect(stock).toBe(10);
  });
});