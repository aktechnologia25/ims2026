import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './database';

export interface Product {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export class ProductModel {
  static async getAll(): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.all('SELECT * FROM products ORDER BY name', (err, rows: Product[]) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static async getById(id: string): Promise<Product | null> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row: Product) => {
        if (err) reject(err);
        else resolve(row || null);
      });
    });
  }

  static async create(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run(
        'INSERT INTO products (id, name, category, description, unit_price, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [id, data.name, data.category, data.description || '', data.unit_price, now, now],
        (err) => {
          if (err) reject(err);
          else resolve({ ...data, id, created_at: now, updated_at: now });
        }
      );
    });
  }

  static async update(id: string, data: Partial<Product>): Promise<void> {
    const now = new Date().toISOString();
    
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'created_at').map(k => `${k} = ?`).join(', ');
      const values = Object.values(data).filter((_, i) => !['id', 'created_at'].includes(Object.keys(data)[i]));
      
      db.run(
        `UPDATE products SET ${fields}, updated_at = ? WHERE id = ?`,
        [...values, now, id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  static async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const db = getDatabase();
      db.run('DELETE FROM products WHERE id = ?', [id], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
