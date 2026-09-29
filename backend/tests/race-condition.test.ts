import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../src/database/db.js";
import { orderRepository } from "../src/repositories/orderRepository.js";
import { reservationRepository } from "../src/repositories/reservationRepository.js";
import { reservationItemRepository } from "../src/repositories/reservationItemRepository.js";
import { productRepository } from "../src/repositories/productRepository.js";
import { paymentService } from "../src/services/paymentService.js";
import { orderExpiryService } from "../src/services/orderExpiryService.js";
import { generateId } from "../src/utils/generateId.js";
import { formatDateForStorage } from "../src/utils/date.js";
import { setMockFailure } from "../src/providers/mockMobileMoney.js";

describe("Race condition: Expiry vs Payment", () => {
  let orderId: string;
  let reservationId: string;

  beforeEach(async () => {
    const now = formatDateForStorage();
    const expiresAt = formatDateForStorage(new Date(Date.now() - 1000));

    orderId = generateId("order");
    reservationId = generateId("res");

    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run(
          `INSERT INTO orders (id, status, total, customer_name, customer_phone, reservation_expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderId, "pending_payment", 100, "Test", "5551234567", expiresAt, now, now],
          (error) => {
            if (error) { reject(error); return; }
          },
        );

        db.run(
          `INSERT INTO reservations (id, order_id, status, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
          [reservationId, orderId, "active", expiresAt, now],
          (error) => {
            if (error) { reject(error); return; }
          },
        );

        db.run(
          `INSERT INTO reservation_items (id, reservation_id, product_id, quantity) VALUES (?, ?, ?, ?)`,
          [generateId("ri"), reservationId, "product-1", 2],
          (error) => {
            if (error) { reject(error); return; }
            resolve();
          },
        );
      });
    });
  });

  it("should not create invalid state (paid + released stock) when expiry and payment race", async () => {
    const stockBefore = (await productRepository.findById("product-1"))!.stock;

    // Make payment succeed
    setMockFailure(false);

    const results = await Promise.allSettled([
      orderExpiryService.checkExpiry(orderId),
      paymentService.confirmPayment({
        orderId,
        transactionId: `txn-${generateId("txn")}`,
        method: "mobile_money",
        amount: 100,
      }),
    ]);

    const order = await orderRepository.findById(orderId);
    const reservation = await reservationRepository.findByOrderId(orderId);
    const product = await productRepository.findById("product-1");
    const payments = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM payments WHERE order_id = ?", [orderId], (err, rows) => err ? reject(err) : resolve(rows));
    });
    const stockMovements = await new Promise<any[]>((resolve, reject) => {
      db.all("SELECT * FROM stock_movements WHERE order_id = ?", [orderId], (err, rows) => err ? reject(err) : resolve(rows));
    });

    console.log("Order status:", order?.status);
    console.log("Reservation:", reservation);
    console.log("Product stock:", product?.stock, "(before:", stockBefore, ")");
    console.log("Payments:", payments);
    console.log("Stock movements:", stockMovements);
    console.log("Results:", results.map(r => r.status));

    // The invalid state: order is paid but stock was released (higher than before)
    const invalidState = order?.status === "paid" && product!.stock > stockBefore;
    expect(invalidState).toBe(false);
  });

  it("repeated expiry calls should not release stock twice", async () => {
    const stockBefore = (await productRepository.findById("product-1"))!.stock;
    const reservation = await reservationRepository.findByOrderId(orderId);
    const quantity = reservation ? (await reservationItemRepository.findByReservationId(reservation.id)).reduce((sum, item) => sum + item.quantity, 0) : 0;

    await orderExpiryService.checkExpiry(orderId);
    
    const orderAfterFirst = await orderRepository.findById(orderId);
    const stockAfterFirst = (await productRepository.findById("product-1"))!.stock;
    // First call should release stock
    expect(stockAfterFirst).toBe(stockBefore + quantity);

    await orderExpiryService.checkExpiry(orderId);
    
    const orderAfterSecond = await orderRepository.findById(orderId);
    const stockAfterSecond = (await productRepository.findById("product-1"))!.stock;
    // Second call should NOT release stock again
    expect(stockAfterSecond).toBe(stockBefore + quantity);
    expect(orderAfterSecond?.status).toBe("expired");
  });
});