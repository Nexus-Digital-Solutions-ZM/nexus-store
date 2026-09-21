export interface OrderRecord {
  id: string;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  total: number;
  createdAt: string;
}
