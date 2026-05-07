import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';

export interface Stock {
  id: string;
  product_id: string;
  quantity: number;
  warehouse_location?: string;
  last_updated: string;
}

export class StockModel {
  static async getByProductId(product_id: string): Promise<Stock | null> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get('SELECT * FROM stock WHERE product_id = ?', [product_id], (err, row: Stock) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  static async getAllLowStock(threshold: number = 10): Promise<Stock[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all('SELECT * FROM stock WHERE quantity < ? ORDER BY quantity', [threshold], (err, rows: Stock[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async updateQuantity(product_id: string, quantity_change: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'UPDATE stock SET quantity = quantity + ?, last_updated = CURRENT_TIMESTAMP WHERE product_id = ?',
        [quantity_change, product_id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static async initializeStock(product_id: string): Promise<Stock> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'INSERT INTO stock (id, product_id, quantity, last_updated) VALUES (?, ?, ?, ?)',
        [id, product_id, 0, now],
        (err) => {
          if (err) reject(err);
          else resolve({ id, product_id, quantity: 0, last_updated: now });
        }
      );
    });
  }
}
