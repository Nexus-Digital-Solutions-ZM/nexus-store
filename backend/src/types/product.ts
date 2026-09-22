export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  stock: number;
  description?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}