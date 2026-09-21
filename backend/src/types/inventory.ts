export interface InventoryMovement {
  id: string;
  productId: string;
  quantity: number;
  reason: string;
  previousStock: number;
  newStock: number;
  createdAt: string;
}
