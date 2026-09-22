import { db } from "../database/db.js";
import type { ProductRecord } from "../types/product.js";

function mapProduct(row: {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}): ProductRecord {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    stock: row.stock,
    ...(row.description !== null && { description: row.description }),
    ...(row.image_url !== null && { imageUrl: row.image_url }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const productRepository = {
  async findAll(): Promise<ProductRecord[]> {
    return new Promise((resolve, reject) => {
      db.all(
        `
          SELECT
            id, name, price, stock, description, image_url, created_at, updated_at
          FROM products
          ORDER BY created_at DESC
        `,
        (error, rows) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            (rows as Array<{
              id: string;
              name: string;
              price: number;
              stock: number;
              description: string | null;
              image_url: string | null;
              created_at: string;
              updated_at: string;
            }>).map(mapProduct),
          );
        },
      );
    });
  },

  async findById(id: string): Promise<ProductRecord | null> {
    return new Promise((resolve, reject) => {
      db.get(
        `
          SELECT
            id, name, price, stock, description, image_url, created_at, updated_at
          FROM products
          WHERE id = ?
        `,
        [id],
        (error, row) => {
          if (error) {
            reject(error);
            return;
          }

          resolve(
            row
              ? mapProduct(
                  row as {
                    id: string;
                    name: string;
                    price: number;
                    stock: number;
                    description: string | null;
                    image_url: string | null;
                    created_at: string;
                    updated_at: string;
                  },
                )
              : null,
          );
        },
      );
    });
  },
};