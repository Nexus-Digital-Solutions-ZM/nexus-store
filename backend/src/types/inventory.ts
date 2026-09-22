export type StockMovementType =
  | "restock"
  | "correction"
  | "sale";

export interface InventoryMovement {
  id: string;
  productId: string;
  quantity: number;
  type: StockMovementType;
  previousStock: number;
  newStock: number;
  orderId?: string;
  createdAt: string;
}